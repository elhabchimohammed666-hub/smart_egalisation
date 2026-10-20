import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import CitizenProfile from '../models/CitizenProfile.js';
import Service from '../models/Service.js';
import RequestModel from '../models/Request.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Starting database seeding with synthetic Moroccan administrative data...');
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await CitizenProfile.deleteMany({});
    await Service.deleteMany({});
    await RequestModel.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('[Seed] Cleared existing database records.');

    // 1. Create Admin Account
    const adminUser = await User.create({
      email: 'admin@mo9ata3a.ma',
      password: 'adminPassword123!',
      role: 'admin',
      fullName: 'Mohammed Benali (Administrateur)',
      department: 'Direction des Systèmes d\'Information',
      phone: '+212 661-123456',
      isActive: true
    });

    // 2. Create Manager Account
    const managerUser = await User.create({
      email: 'manager@mo9ata3a.ma',
      password: 'managerPassword123!',
      role: 'manager',
      fullName: 'Fatima Zahra Mansouri (Chef de Service)',
      department: 'Division de l\'État Civil et des Affaires Générales',
      phone: '+212 662-789012',
      isActive: true
    });

    // 3. Create Demo Citizen Account (Yassine El Amrani - from scenario in PDF Page 13-14)
    const citizenUser = await User.create({
      email: 'citizen@mo9ata3a.ma',
      password: 'citizenPassword123!',
      role: 'citizen',
      fullName: 'Yassine El Amrani',
      phone: '+212 663-456789',
      isActive: true
    });

    const citizenProfile = await CitizenProfile.create({
      user: citizenUser._id,
      cin: 'BK789456',
      firstName: 'Yassine',
      lastName: 'El Amrani',
      arabicFullName: 'ياسين العمراني',
      dateOfBirth: '14/05/1994',
      placeOfBirth: 'Casablanca Anfa',
      gender: 'M',
      address: '24 Rue Ibn Batouta, Quartier Palmier, Casablanca',
      validUntil: '12/10/2032',
      nationality: 'Marocaine',
      cinFrontImage: '/uploads/cin/sample_cin_front.png',
      cinBackImage: '/uploads/cin/sample_cin_back.png',
      ocrRawData: {
        frontText: 'ROYAUME DU MAROC\nCARTE NATIONALE D\'IDENTITE\nNom EL AMRANI\nPrenom YASSINE\nNe le 14.05.1994\nBK789456',
        backText: 'Adresse 24 RUE IBN BATOUTA CASABLANCA\nValable jusqu au 12.10.2032\nIDMARBK789456<<<<<<<<<<<<<<<<<',
        qualityScore: 92,
        extractedConfidence: 94,
        processedAt: new Date()
      },
      validationStatus: 'validated',
      phone: '+212 663-456789'
    });

    citizenUser.citizenProfile = citizenProfile._id;
    await citizenUser.save();

    // 4. Create Second Synthetic Citizen (Salma Idrissi)
    const citizenUser2 = await User.create({
      email: 'salma.idrissi@test.ma',
      password: 'password123!',
      role: 'citizen',
      fullName: 'Salma Idrissi',
      phone: '+212 664-987654',
      isActive: true
    });

    const citizenProfile2 = await CitizenProfile.create({
      user: citizenUser2._id,
      cin: 'AB654321',
      firstName: 'Salma',
      lastName: 'Idrissi',
      arabicFullName: 'سلمى الإدريسي',
      dateOfBirth: '22/08/1998',
      placeOfBirth: 'Rabat Agdal',
      gender: 'F',
      address: '15 Avenue Mohammed V, Rabat',
      validUntil: '15/04/2033',
      nationality: 'Marocaine',
      cinFrontImage: '/uploads/cin/sample_cin_front_2.png',
      cinBackImage: '/uploads/cin/sample_cin_back_2.png',
      ocrRawData: {
        frontText: 'ROYAUME DU MAROC\nNom IDRISSI\nPrenom SALMA\nAB654321',
        backText: 'Adresse 15 AVENUE MOHAMMED V RABAT\nValable jusqu au 15.04.2033',
        qualityScore: 95,
        extractedConfidence: 96,
        processedAt: new Date()
      },
      validationStatus: 'validated',
      phone: '+212 664-987654'
    });

    citizenUser2.citizenProfile = citizenProfile2._id;
    await citizenUser2.save();

    console.log('[Seed] User accounts created successfully:');
    console.log('   - Admin:   admin@mo9ata3a.ma   / adminPassword123!');
    console.log('   - Manager: manager@mo9ata3a.ma / managerPassword123!');
    console.log('   - Citizen: citizen@mo9ata3a.ma / citizenPassword123! (CIN: BK789456)');

    // 5. Seed Administrative Services Catalogue (Per Moroccan Administration)
    const services = await Service.insertMany([
      {
        name: 'Certificat de Résidence',
        code: 'CERT_RESIDENCE',
        category: 'État Civil & Citoyenneté',
        description: 'Document officiel attestant de la résidence principale du citoyen dans le ressort territorial de l\'arrondissement communal (Mo9ata3a).',
        requiredDocuments: [
          { name: 'Facture Eau/Électricité récente (moins de 3 mois)', description: 'Ou quittance Lydec / Redal / Radeema / Amendis', isRequired: true },
          { name: 'Contrat de bail ou Certificat de propriété', description: 'Justifiant l\'occupation du domicile', isRequired: true },
          { name: 'Copie de la CIN valide', description: 'Recto-verso lisible', isRequired: true }
        ],
        instructions: 'Veuillez vérifier que l\'adresse figurant sur les factures de justificatif correspond exactement à votre adresse actuelle.',
        processingTimeDays: 2,
        isAvailable: true,
        createdBy: adminUser._id
      },
      {
        name: 'Attestation de Célibat',
        code: 'CERT_CELIBAT',
        category: 'État Civil & Famille',
        description: 'Attestation administrative requise pour la constitution du dossier de mariage ou démarches administratives officielles.',
        requiredDocuments: [
          { name: 'Extrait d\'acte de naissance récent (moins de 3 mois)', description: 'Délivré par le bureau d\'état civil du lieu de naissance', isRequired: true },
          { name: 'Copie CIN du demandeur', description: 'En cours de validité', isRequired: true },
          { name: 'Témoignage de deux témoins majeurs', description: 'Déclaration signée avec copies de leurs CIN', isRequired: true }
        ],
        instructions: 'La présence des témoins ou la production de leur déclaration légalisée est nécessaire pour le retrait définitif.',
        processingTimeDays: 3,
        isAvailable: true,
        createdBy: adminUser._id
      },
      {
        name: 'Copie Conforme et Légalisation de Signature',
        code: 'LEGALISATION_SIGN',
        category: 'Actes & Notariat Administratif',
        description: 'Authentification matérielle de signature et certification conforme de documents administratifs.',
        requiredDocuments: [
          { name: 'Document original à légaliser', description: 'Non signé au préalable pour la signature sur place', isRequired: true },
          { name: 'Copie intégrale lisible', description: 'Pour certification conforme', isRequired: true },
          { name: 'CIN originale du signataire', description: 'Pour vérification d\'identité', isRequired: true }
        ],
        instructions: 'Présentez-vous muni de la pièce d\'identité originale lors du retrait au guichet.',
        processingTimeDays: 1,
        isAvailable: true,
        createdBy: adminUser._id
      },
      {
        name: 'Attestation Administrative à Caractère Social',
        code: 'CERT_SOCIAL',
        category: 'Affaires Sociales',
        description: 'Délivrée pour les dossiers d\'aide sociale, bourses universitaires, ou dispense de frais médicaux.',
        requiredDocuments: [
          { name: 'Certificat de non-imposition ou déclaration fiscale', description: 'Délivré par la DGI', isRequired: true },
          { name: 'Certificat de vie collective des enfants', description: 'Le cas échéant', isRequired: false },
          { name: 'Copie CIN du demandeur', description: 'Valide', isRequired: true }
        ],
        instructions: 'Indiquez clairement le motif social dans le formulaire pour faciliter l\'instruction du dossier.',
        processingTimeDays: 4,
        isAvailable: true,
        createdBy: adminUser._id
      },
      {
        name: 'Fiche Individuelle d\'État Civil',
        code: 'FICHE_ETAT_CIVIL',
        category: 'État Civil & Citoyenneté',
        description: 'Fiche récapitulative des données d\'état civil individuel remplaçant la fiche d\'état civil papier.',
        requiredDocuments: [
          { name: 'Copie du livret de famille', description: 'Page concernant le citoyen', isRequired: true },
          { name: 'Copie CIN', description: 'Recto-verso', isRequired: true }
        ],
        instructions: 'Traitement immédiat ou sous 24h ouvrées.',
        processingTimeDays: 1,
        isAvailable: true,
        createdBy: adminUser._id
      }
    ]);

    console.log(`[Seed] Seeded ${services.length} administrative services.`);

    // 6. Seed Realistic Requests reflecting the End-to-End Scenarios from the PDF specification
    const req1 = await RequestModel.create({
      reference: 'REQ-2026-0001-4921',
      citizen: citizenUser._id,
      service: services[0]._id, // Certificat de résidence
      status: 'Action Required',
      formData: {
        currentAddress: '24 Rue Ibn Batouta, Casablanca',
        landlordName: 'M. Tazi Karim',
        stayDurationMonths: '36'
      },
      documents: [
        {
          documentName: 'Quittance_Lydec_Mars2026.pdf',
          originalName: 'Quittance_Lydec_Mars2026.pdf',
          filePath: '/uploads/documents/sample_quittance.pdf',
          fileType: 'application/pdf',
          fileSize: 412000,
          uploadedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          status: 'submitted'
        }
      ],
      actionRequiredReason: 'La quittance d\'électricité fournie date de plus de 3 mois. Veuillez fournir une quittance récente du mois en cours ou le contrat de bail légalisé.',
      statusHistory: [
        {
          previousStatus: 'None',
          newStatus: 'Submitted',
          changedBy: citizenUser._id,
          changedByName: citizenUser.fullName,
          changedByRole: 'citizen',
          changedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          notes: 'Demande soumise en ligne avec justificatif.'
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Under Review',
          changedBy: managerUser._id,
          changedByName: managerUser.fullName,
          changedByRole: 'manager',
          changedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
          notes: 'Examen des pièces justificatives par le bureau d\'état civil.',
          internalStaffNote: 'Quittance Lydec périmée. Demander réémission récente.'
        },
        {
          previousStatus: 'Under Review',
          newStatus: 'Action Required',
          changedBy: managerUser._id,
          changedByName: managerUser.fullName,
          changedByRole: 'manager',
          changedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
          notes: 'Complément requis : Quittance récente exigée.',
          internalStaffNote: 'En attente de justificatif à jour du citoyen.'
        }
      ],
      submissionDate: new Date(Date.now() - 3 * 24 * 3600 * 1000)
    });

    const req2 = await RequestModel.create({
      reference: 'REQ-2026-0002-8814',
      citizen: citizenUser._id,
      service: services[1]._id, // Attestation de célibat
      status: 'Ready for Collection',
      formData: {
        witness1Name: 'Rachid Bennani (CIN: BE234567)',
        witness2Name: 'Hamid Alami (CIN: BK567890)',
        weddingTargetOffice: 'Adoul de Casablanca'
      },
      documents: [
        {
          documentName: 'Acte_Naissance_140594.pdf',
          originalName: 'Acte_Naissance_140594.pdf',
          filePath: '/uploads/documents/sample_birth_cert.pdf',
          fileType: 'application/pdf',
          fileSize: 520000,
          uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
          status: 'submitted'
        }
      ],
      collectionToken: 'COL-748920',
      statusHistory: [
        {
          previousStatus: 'None',
          newStatus: 'Submitted',
          changedBy: citizenUser._id,
          changedByName: citizenUser.fullName,
          changedByRole: 'citizen',
          changedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
          notes: 'Dépôt de la demande d\'attestation de célibat.'
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Under Review',
          changedBy: managerUser._id,
          changedByName: managerUser.fullName,
          changedByRole: 'manager',
          changedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
          notes: 'Vérification du registre des naissances.'
        },
        {
          previousStatus: 'Under Review',
          newStatus: 'Approved',
          changedBy: managerUser._id,
          changedByName: managerUser.fullName,
          changedByRole: 'manager',
          changedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
          notes: 'Dossier complet et approuvé. Édition du document officiel transmise au secrétariat.'
        },
        {
          previousStatus: 'Approved',
          newStatus: 'Ready for Collection',
          changedBy: managerUser._id,
          changedByName: managerUser.fullName,
          changedByRole: 'manager',
          changedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
          notes: 'Attestation imprimée, signée et tamponnée par le président d\'arrondissement. Prête au Guichet 3.',
          internalStaffNote: 'Numéro de registre communal: REG-2026-EC-401'
        }
      ],
      submissionDate: new Date(Date.now() - 5 * 24 * 3600 * 1000)
    });

    const req3 = await RequestModel.create({
      reference: 'REQ-2026-0003-1209',
      citizen: citizenUser2._id,
      service: services[4]._id, // Fiche individuelle
      status: 'Issued',
      formData: {
        registrationNumber: 'LIVRET-789-98'
      },
      documents: [
        {
          documentName: 'Livret_Famille_Salma.pdf',
          originalName: 'Livret_Famille_Salma.pdf',
          filePath: '/uploads/documents/sample_livret.pdf',
          fileType: 'application/pdf',
          fileSize: 310000,
          uploadedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
          status: 'submitted'
        }
      ],
      collectionToken: 'COL-551299',
      submissionDate: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      completionDate: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      statusHistory: [
        {
          previousStatus: 'None',
          newStatus: 'Submitted',
          changedBy: citizenUser2._id,
          changedByName: citizenUser2.fullName,
          changedByRole: 'citizen',
          changedAt: new Date(Date.now() - 6 * 24 * 3600 * 1000),
          notes: 'Demande soumise.'
        },
        {
          previousStatus: 'Submitted',
          newStatus: 'Under Review',
          changedBy: managerUser._id,
          changedByName: managerUser.fullName,
          changedByRole: 'manager',
          changedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000),
          notes: 'Contrôle des pièces.'
        },
        {
          previousStatus: 'Under Review',
          newStatus: 'Approved',
          changedBy: managerUser._id,
          changedByName: managerUser.fullName,
          changedByRole: 'manager',
          changedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
          notes: 'Approuvé.'
        },
        {
          previousStatus: 'Approved',
          newStatus: 'Ready for Collection',
          changedBy: managerUser._id,
          changedByName: managerUser.fullName,
          changedByRole: 'manager',
          changedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          notes: 'Prêt pour retrait.'
        },
        {
          previousStatus: 'Ready for Collection',
          newStatus: 'Issued',
          changedBy: managerUser._id,
          changedByName: managerUser.fullName,
          changedByRole: 'manager',
          changedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
          notes: 'Document remis à la citoyenne au guichet contre émargement.',
          internalStaffNote: 'Identité vérifiée avec CIN physique originale.'
        }
      ]
    });

    const req4 = await RequestModel.create({
      reference: 'REQ-2026-0004-7731',
      citizen: citizenUser._id,
      service: services[2]._id, // Légalisation
      status: 'Submitted',
      formData: {
        documentType: 'Procuration sous seing privé'
      },
      documents: [
        {
          documentName: 'Procuration_Modele.pdf',
          originalName: 'Procuration_Modele.pdf',
          filePath: '/uploads/documents/sample_procuration.pdf',
          fileType: 'application/pdf',
          fileSize: 210000,
          uploadedAt: new Date(),
          status: 'submitted'
        }
      ],
      submissionDate: new Date(),
      statusHistory: [
        {
          previousStatus: 'None',
          newStatus: 'Submitted',
          changedBy: citizenUser._id,
          changedByName: citizenUser.fullName,
          changedByRole: 'citizen',
          changedAt: new Date(),
          notes: 'Demande transmise pour examen préalable de légalisation.'
        }
      ]
    });

    // 7. Seed Notifications
    await Notification.insertMany([
      {
        recipient: citizenUser._id,
        title: 'Action requise : Complément de dossier',
        message: 'La quittance d\'électricité fournie pour la demande REQ-2026-0001-4921 est expirée. Merci de téléverser un justificatif récent.',
        type: 'action_required',
        relatedRequest: req1._id,
        relatedRequestReference: req1.reference,
        isRead: false
      },
      {
        recipient: citizenUser._id,
        title: 'Document prêt pour retrait !',
        message: 'Votre attestation de célibat (REQ-2026-0002-8814) est prête au guichet. Code de retrait : COL-748920.',
        type: 'ready_for_collection',
        relatedRequest: req2._id,
        relatedRequestReference: req2.reference,
        isRead: false
      },
      {
        recipient: managerUser._id,
        title: 'Nouvelle demande reçue',
        message: 'Yassine El Amrani a déposé une demande de légalisation (REQ-2026-0004-7731).',
        type: 'request_submitted',
        relatedRequest: req4._id,
        relatedRequestReference: req4.reference,
        isRead: false
      }
    ]);

    // 8. Seed Audit Logs
    await AuditLog.insertMany([
      {
        user: adminUser._id,
        userName: adminUser.fullName,
        userRole: 'admin',
        action: 'SERVICE_CATALOGUE_INITIALIZED',
        entityType: 'Service',
        details: { servicesCount: 5, catalogVersion: '2026.1' }
      },
      {
        user: citizenUser._id,
        userName: citizenUser.fullName,
        userRole: 'citizen',
        action: 'CIN_VALIDATION_ACCEPTED',
        entityType: 'CitizenProfile',
        entityId: citizenProfile._id.toString(),
        details: { cin: 'BK789456', ocrConfidence: 94 }
      },
      {
        user: managerUser._id,
        userName: managerUser.fullName,
        userRole: 'manager',
        action: 'COLLECTION_CONFIRMED',
        entityType: 'Request',
        entityId: req3._id.toString(),
        details: { reference: req3.reference, tokenUsed: 'COL-551299' }
      }
    ]);

    console.log('[Seed] Database successfully populated with synthetic demonstration data!');
    return true;
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    throw error;
  }
};

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Seeding completed. Exiting...');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Failed:', err);
      process.exit(1);
    });
}
