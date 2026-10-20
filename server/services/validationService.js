import CitizenProfile from '../models/CitizenProfile.js';
import { config } from '../config/config.js';

/**
 * Validates Moroccan CIN extraction according to the 6 official specification outcomes
 * @param {object} params
 * @param {boolean} params.frontProvided
 * @param {boolean} params.backProvided
 * @param {object} params.frontQuality
 * @param {object} params.backQuality
 * @param {object} params.frontFields
 * @param {object} params.backFields
 * @param {number} params.frontConfidence
 * @param {number} params.backConfidence
 * @returns {Promise<object>} Outcome object with status, message, retryGuide, and consolidatedData
 */
export async function validateCINSubmission({
  frontProvided,
  backProvided,
  frontQuality,
  backQuality,
  frontFields = {},
  backFields = {},
  frontConfidence = 0,
  backConfidence = 0
}) {
  // 1. Outcome: Rejected: Missing Image
  if (!frontProvided || !backProvided) {
    return {
      success: false,
      outcome: 'Rejected: Missing Image',
      code: 'MISSING_IMAGE',
      message: 'Les deux faces de la Carte d\'Identité Nationale (recto et verso) doivent obligatoirement être fournies.',
      retryInstructions: 'Veuillez téléverser à la fois la face avant (recto) et la face arrière (verso) de votre CIN marocaine.',
      fields: null
    };
  }

  // 2. Outcome: Rejected: Poor Quality
  if (!frontQuality.isQualitySufficient) {
    return {
      success: false,
      outcome: 'Rejected: Poor Quality',
      code: 'POOR_QUALITY_FRONT',
      message: `Image recto non conforme : ${frontQuality.reason}`,
      retryInstructions: 'Reprenez une photo nette, sans reflet et sous un bon éclairage du recto de votre CIN.',
      metrics: { front: frontQuality.metrics },
      fields: null
    };
  }

  if (!backQuality.isQualitySufficient) {
    return {
      success: false,
      outcome: 'Rejected: Poor Quality',
      code: 'POOR_QUALITY_BACK',
      message: `Image verso non conforme : ${backQuality.reason}`,
      retryInstructions: 'Reprenez une photo nette et lisible du verso de votre CIN en vous assurant que l\'adresse et la date de validité sont visibles.',
      metrics: { back: backQuality.metrics },
      fields: null
    };
  }

  // 3. Outcome: Rejected: Incomplete Extraction
  // Minimum required fields: CIN identifier, lastName, firstName, and validUntil or dateOfBirth
  const missingFields = [];
  if (!frontFields.cin) missingFields.push('Numéro de CIN');
  if (!frontFields.lastName) missingFields.push('Nom de famille');
  if (!frontFields.firstName) missingFields.push('Prénom');
  if (!frontFields.dateOfBirth) missingFields.push('Date de naissance');
  if (!backFields.address) missingFields.push('Adresse de résidence');
  if (!backFields.validUntil) missingFields.push('Date d\'expiration');

  if (missingFields.length > 0) {
    return {
      success: false,
      outcome: 'Rejected: Incomplete Extraction',
      code: 'INCOMPLETE_EXTRACTION',
      message: `Impossible d'extraire de manière fiable les informations suivantes : ${missingFields.join(', ')}.`,
      retryInstructions: 'Veuillez soumettre des photos plus nettes et cadrées de votre CIN. Assurez-vous que l\'ensemble du document est visible sans ombre ni zone tronquée.',
      extractedPreview: { ...frontFields, ...backFields },
      missingFields,
      fields: null
    };
  }

  // 4. Outcome: Rejected: Invalid Information
  // Check format of CIN (Moroccan CIN: 1 or 2 uppercase letters followed by 5 to 7 digits)
  const cinValue = frontFields.cin.trim().toUpperCase();
  if (!config.cinRegex.test(cinValue)) {
    return {
      success: false,
      outcome: 'Rejected: Invalid Information',
      code: 'INVALID_CIN_FORMAT',
      message: `Le numéro de CIN extrait "${cinValue}" ne respecte pas le format national marocain officiel (1 ou 2 lettres suivies de 5 à 7 chiffres, ex: AB123456).`,
      retryInstructions: 'Veuillez vérifier que le numéro de CIN est parfaitement lisible sur la photo soumise.',
      fields: null
    };
  }

  // Check consistency between front CIN and back MRZ CIN if back MRZ detected
  if (backFields.matchingCIN && backFields.matchingCIN.toUpperCase() !== cinValue) {
    return {
      success: false,
      outcome: 'Rejected: Invalid Information',
      code: 'INCONSISTENT_SIDES',
      message: `Incohérence détectée : Le numéro CIN du recto (${cinValue}) ne correspond pas à la zone optique du verso (${backFields.matchingCIN}).`,
      retryInstructions: 'Assurez-vous de soumettre le recto et le verso de la MÊME carte d\'identité nationale.',
      fields: null
    };
  }

  // Check validity dates format
  const dateRegex = /^\d{2}[\.\/\-]\d{2}[\.\/\-]\d{4}$/;
  if (!dateRegex.test(frontFields.dateOfBirth)) {
    return {
      success: false,
      outcome: 'Rejected: Invalid Information',
      code: 'INVALID_DOB_FORMAT',
      message: 'Format de la date de naissance extrait invalide.',
      retryInstructions: 'Veuillez soumettre une image plus nette de la date de naissance.',
      fields: null
    };
  }

  // 5. Outcome: Rejected: Duplicate CIN
  // Enforce unique CIN constraint
  const existingProfile = await CitizenProfile.findOne({ cin: cinValue });
  if (existingProfile) {
    return {
      success: false,
      outcome: 'Rejected: Duplicate CIN',
      code: 'DUPLICATE_CIN',
      message: `Le numéro de CIN "${cinValue}" est déjà enregistré dans le système Mo9ata3a Smart.`,
      retryInstructions: 'Un compte citoyen existe déjà pour ce numéro de CIN. Si vous êtes le titulaire légitime, veuillez vous connecter avec vos identifiants ou contacter l\'administration.',
      fields: null
    };
  }

  // 6. Outcome: Accepted
  // Combine extracted information from both sides
  const consolidatedData = {
    cin: cinValue,
    firstName: frontFields.firstName,
    lastName: frontFields.lastName,
    arabicFullName: frontFields.arabicFullName || '',
    dateOfBirth: frontFields.dateOfBirth,
    placeOfBirth: frontFields.placeOfBirth || 'Maroc',
    gender: frontFields.gender || 'M',
    nationality: frontFields.nationality || 'Marocaine',
    address: backFields.address,
    validUntil: backFields.validUntil,
    overallConfidence: Math.round((frontConfidence + backConfidence) / 2)
  };

  return {
    success: true,
    outcome: 'Accepted',
    code: 'ACCEPTED',
    message: 'Données de la CIN extraites et validées avec succès. Enregistrement autorisé.',
    consolidatedData
  };
}
