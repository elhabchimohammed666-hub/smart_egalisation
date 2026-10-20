import jwt from 'jsonwebtoken';
import fs from 'fs';
import User from '../models/User.js';
import CitizenProfile from '../models/CitizenProfile.js';
import AuditLog from '../models/AuditLog.js';
import { config } from '../config/config.js';
import { assessImageQuality, extractTextFromImage, parseCINFrontText, parseCINBackText } from '../services/ocrService.js';
import { validateCINSubmission } from '../services/validationService.js';
import { createNotification } from '../services/notificationService.js';

// Helper to generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * Citizen Registration with AI CIN OCR & Automated Accept/Reject
 */
export const registerCitizen = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'L\'email et le mot de passe sont obligatoires.'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un compte avec cette adresse email existe déjà.'
      });
    }

    // Check uploaded files
    const cinFrontFile = req.files?.cinFront ? req.files.cinFront[0] : null;
    const cinBackFile = req.files?.cinBack ? req.files.cinBack[0] : null;

    // Handle demo mock bypass if the user uses a synthetic demo profile for testing
    const isSyntheticDemo = req.body.isSyntheticDemo === 'true' || req.body.isSyntheticDemo === true;
    let syntheticData = null;
    if (isSyntheticDemo && req.body.syntheticProfile) {
      try {
        syntheticData = typeof req.body.syntheticProfile === 'string' 
          ? JSON.parse(req.body.syntheticProfile) 
          : req.body.syntheticProfile;
      } catch (e) {
        // ignore
      }
    }

    // 1. Missing Image Check
    if (!syntheticData && (!cinFrontFile || !cinBackFile)) {
      return res.status(422).json({
        success: false,
        outcome: 'Rejected: Missing Image',
        message: 'Veuillez fournir les deux faces (recto et verso) de votre carte d\'identité nationale.',
        retryInstructions: 'Téléversez une photo du recto et une photo du verso de votre CIN marocaine.'
      });
    }

    let frontQuality = { isQualitySufficient: true, metrics: { width: 800, height: 500, brightness: 140, contrastStdDev: 45, sharpnessScore: 8.5 } };
    let backQuality = { isQualitySufficient: true, metrics: { width: 800, height: 500, brightness: 135, contrastStdDev: 42, sharpnessScore: 8.0 } };
    let frontFields = {};
    let backFields = {};
    let frontConfidence = 92;
    let backConfidence = 90;
    let frontText = '';
    let backText = '';

    if (cinFrontFile && cinBackFile) {
      // Step 2: Image Quality Assessment
      frontQuality = await assessImageQuality(cinFrontFile.path);
      backQuality = await assessImageQuality(cinBackFile.path);

      if (!frontQuality.isQualitySufficient || !backQuality.isQualitySufficient) {
        // Clean up invalid files
        try {
          if (fs.existsSync(cinFrontFile.path)) fs.unlinkSync(cinFrontFile.path);
          if (fs.existsSync(cinBackFile.path)) fs.unlinkSync(cinBackFile.path);
        } catch (e) {}

        const failReason = !frontQuality.isQualitySufficient 
          ? `Recto : ${frontQuality.reason}` 
          : `Verso : ${backQuality.reason}`;

        // Audit rejection
        await AuditLog.create({
          action: 'CIN_VALIDATION_REJECTED',
          entityType: 'CitizenRegistration',
          details: { email, reason: 'Rejected: Poor Quality', failReason }
        });

        return res.status(422).json({
          success: false,
          outcome: 'Rejected: Poor Quality',
          message: failReason,
          retryInstructions: 'Assurez-vous de capturer des images nettes, bien éclairées, sans reflet et avec le texte clairement lisible.'
        });
      }

      // Step 3: OCR Extraction
      const frontOCR = await extractTextFromImage(cinFrontFile.path);
      const backOCR = await extractTextFromImage(cinBackFile.path);
      frontText = frontOCR.text;
      backText = backOCR.text;
      frontConfidence = frontOCR.confidence;
      backConfidence = backOCR.confidence;

      // Step 4: Parse Identity Fields
      frontFields = parseCINFrontText(frontText);
      backFields = parseCINBackText(backText);
    }

    // Merge with synthetic test data if demo card was used
    if (syntheticData) {
      frontFields = { ...frontFields, ...syntheticData.front };
      backFields = { ...backFields, ...syntheticData.back };
      frontConfidence = syntheticData.confidence || 95;
      backConfidence = syntheticData.confidence || 95;
    }

    // Step 5: Structured Validation against defined acceptance requirements
    const validationResult = await validateCINSubmission({
      frontProvided: Boolean(cinFrontFile || (syntheticData && syntheticData.front)),
      backProvided: Boolean(cinBackFile || (syntheticData && syntheticData.back)),
      frontQuality,
      backQuality,
      frontFields,
      backFields,
      frontConfidence,
      backConfidence
    });

    if (!validationResult.success) {
      // Audit rejection
      await AuditLog.create({
        action: 'CIN_VALIDATION_REJECTED',
        entityType: 'CitizenRegistration',
        details: {
          email,
          outcome: validationResult.outcome,
          code: validationResult.code,
          message: validationResult.message
        }
      });

      return res.status(422).json({
        success: false,
        outcome: validationResult.outcome,
        code: validationResult.code,
        message: validationResult.message,
        retryInstructions: validationResult.retryInstructions,
        extractedPreview: validationResult.extractedPreview,
        missingFields: validationResult.missingFields
      });
    }

    // Step 6: Validation Succeeded -> Create User and CitizenProfile
    const validatedData = validationResult.consolidatedData;

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      role: 'citizen',
      fullName: `${validatedData.firstName} ${validatedData.lastName}`,
      phone: phone || ''
    });

    const citizenProfile = await CitizenProfile.create({
      user: user._id,
      cin: validatedData.cin,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      arabicFullName: validatedData.arabicFullName,
      dateOfBirth: validatedData.dateOfBirth,
      placeOfBirth: validatedData.placeOfBirth,
      gender: validatedData.gender,
      address: validatedData.address,
      validUntil: validatedData.validUntil,
      nationality: validatedData.nationality,
      cinFrontImage: cinFrontFile ? `/uploads/cin/${cinFrontFile.filename}` : '/sample-cin-front.png',
      cinBackImage: cinBackFile ? `/uploads/cin/${cinBackFile.filename}` : '/sample-cin-back.png',
      ocrRawData: {
        frontText,
        backText,
        qualityScore: Math.round((frontQuality.metrics.sharpnessScore || 8) * 10),
        extractedConfidence: validatedData.overallConfidence,
        extractedFields: validatedData,
        processedAt: new Date()
      },
      validationStatus: 'validated',
      validatedAt: new Date(),
      phone: phone || ''
    });

    user.citizenProfile = citizenProfile._id;
    await user.save();

    // Audit log
    await AuditLog.create({
      user: user._id,
      userName: user.fullName,
      userRole: 'citizen',
      action: 'CIN_VALIDATION_ACCEPTED',
      entityType: 'CitizenProfile',
      entityId: citizenProfile._id.toString(),
      details: {
        cin: validatedData.cin,
        fullName: user.fullName,
        confidence: validatedData.overallConfidence
      }
    });

    // Welcome Notification
    await createNotification({
      recipientId: user._id,
      title: 'Bienvenue sur Mo9ata3a Smart !',
      message: `Votre CIN (${validatedData.cin}) a été validée avec succès. Vous pouvez désormais soumettre vos demandes administratives en ligne.`,
      type: 'system'
    });

    const token = signToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Compte citoyen créé et CIN validée avec succès.',
      outcome: 'Accepted',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        citizenProfile
      }
    });
  } catch (error) {
    console.error('[AuthController] Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur interne est survenue lors de l\'enregistrement.',
      error: error.message
    });
  }
};

/**
 * User Login (Citizen, Manager, Admin)
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('citizenProfile');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Ce compte utilisateur a été désactivé par l\'administration.'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        citizenProfile: user.citizenProfile
      }
    });
  } catch (error) {
    console.error('[AuthController] Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion.',
      error: error.message
    });
  }
};

/**
 * Get current authenticated user
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('citizenProfile');
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur de récupération du profil.',
      error: error.message
    });
  }
};
