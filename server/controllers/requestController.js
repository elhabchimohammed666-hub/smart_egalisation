import RequestModel from '../models/Request.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { createNotification, notifyStaff } from '../services/notificationService.js';

// Allowed State Machine Transitions
const ALLOWED_TRANSITIONS = {
  Draft: ['Submitted', 'Cancelled'],
  Submitted: ['Under Review', 'Cancelled'],
  'Under Review': ['Action Required', 'Approved', 'Rejected'],
  'Action Required': ['Under Review', 'Cancelled', 'Rejected'],
  Approved: ['Ready for Collection'],
  'Ready for Collection': ['Issued'],
  Issued: [], // Terminal state
  Rejected: [], // Terminal state
  Cancelled: [] // Terminal state
};

// Generate unique reference REQ-YYYY-XXXX
const generateReference = async () => {
  const year = new Date().getFullYear();
  const count = await RequestModel.countDocuments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${year}-${String(count + 1).padStart(4, '0')}-${randomSuffix}`;
};

/**
 * Citizen: Create or save draft request
 */
export const createRequest = async (req, res) => {
  try {
    const { serviceId, formData, isDraft } = req.body;

    const service = await Service.findById(serviceId);
    if (!service || !service.isAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Le service sélectionné n\'est pas disponible pour de nouvelles demandes.'
      });
    }

    const reference = await generateReference();
    const status = isDraft === 'true' || isDraft === true ? 'Draft' : 'Submitted';

    // Parse uploaded files
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        documents.push({
          documentName: file.originalname,
          originalName: file.originalname,
          filePath: `/uploads/documents/${file.filename}`,
          fileType: file.mimetype,
          fileSize: file.size,
          uploadedAt: new Date(),
          status: 'submitted'
        });
      });
    }

    // Calculate estimated completion date
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + (service.processingTimeDays || 2));

    const initialHistory = [{
      previousStatus: 'None',
      newStatus: status,
      changedBy: req.user._id,
      changedByName: req.user.fullName,
      changedByRole: req.user.role,
      changedAt: new Date(),
      notes: status === 'Draft' ? 'Demande sauvegardée en brouillon.' : 'Demande transmise avec succès au bureau administratif.'
    }];

    const parsedFormData = typeof formData === 'string' ? JSON.parse(formData || '{}') : (formData || {});

    const newRequest = await RequestModel.create({
      reference,
      citizen: req.user._id,
      service: service._id,
      status,
      formData: parsedFormData,
      documents,
      statusHistory: initialHistory,
      submissionDate: status === 'Submitted' ? new Date() : null,
      estimatedCompletionDate: estimatedDate
    });

    // Notifications and Auditing if submitted
    if (status === 'Submitted') {
      await createNotification({
        recipientId: req.user._id,
        title: 'Demande soumise avec succès',
        message: `Votre demande pour "${service.name}" a été enregistrée avec la référence ${reference}.`,
        type: 'request_submitted',
        requestId: newRequest._id,
        requestReference: reference
      });

      await notifyStaff({
        title: 'Nouvelle demande reçue',
        message: `Une nouvelle demande (${reference} - ${service.name}) a été déposée par ${req.user.fullName}.`,
        type: 'request_submitted',
        requestId: newRequest._id,
        requestReference: reference
      });

      await AuditLog.create({
        user: req.user._id,
        userName: req.user.fullName,
        userRole: req.user.role,
        action: 'REQUEST_SUBMITTED',
        entityType: 'Request',
        entityId: newRequest._id.toString(),
        details: { reference, service: service.name }
      });
    }

    return res.status(201).json({
      success: true,
      message: status === 'Draft' ? 'Brouillon sauvegardé avec succès.' : 'Demande transmise avec succès.',
      data: newRequest
    });
  } catch (error) {
    console.error('[RequestController] Error creating request:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la demande.',
      error: error.message
    });
  }
};

/**
 * Citizen: Get own requests
 */
export const getMyRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { citizen: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.reference = new RegExp(search.trim(), 'i');
    }

    const requests = await RequestModel.find(query)
      .populate('service', 'name code processingTimeDays requiredDocuments category')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de vos demandes.',
      error: error.message
    });
  }
};

/**
 * Staff: Get all requests with advanced filters
 */
export const getAllRequests = async (req, res) => {
  try {
    const { status, serviceId, dateFrom, dateTo, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (serviceId && serviceId !== 'all') {
      query.service = serviceId;
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { reference: searchRegex }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await RequestModel.countDocuments(query);
    const requests = await RequestModel.find(query)
      .populate('service', 'name code processingTimeDays')
      .populate('citizen', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: requests
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des demandes administratives.',
      error: error.message
    });
  }
};

/**
 * Get single request details
 * Citizens only see public timeline notes; staff sees internal notes too
 */
export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RequestModel.findById(id)
      .populate('service')
      .populate({
        path: 'citizen',
        select: 'fullName email phone citizenProfile',
        populate: { path: 'citizenProfile' }
      });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande introuvable.'
      });
    }

    // Access control: citizens can only view their own requests
    const isOwner = req.user.role === 'citizen' && request.citizen._id.toString() === req.user._id.toString();
    const isStaff = ['admin', 'manager'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas autorisé à consulter cette demande.'
      });
    }

    const requestObj = request.toObject();

    // If citizen viewing, strip confidential internal staff notes
    if (!isStaff) {
      requestObj.statusHistory = requestObj.statusHistory.map(entry => {
        const { internalStaffNote, ...publicEntry } = entry;
        return publicEntry;
      });
    }

    return res.status(200).json({
      success: true,
      data: requestObj
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la consultation de la demande.',
      error: error.message
    });
  }
};

/**
 * Staff / Manager: Update Request Status along strict workflow transitions
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStatus, notes, internalStaffNote, actionRequiredReason, rejectionReason } = req.body;

    const request = await RequestModel.findById(id).populate('service citizen');
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande introuvable.'
      });
    }

    const currentStatus = request.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

    // Enforce workflow state machine transitions
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Transition d'état invalide : Passage de "${currentStatus}" vers "${newStatus}" interdit. Les statuts autorisés sont : [${allowed.join(', ') || 'Aucun'}].`
      });
    }

    // Role-based restrictions
    if (newStatus === 'Cancelled') {
      const isOwner = req.user.role === 'citizen' && request.citizen._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Seul le citoyen titulaire ou un administrateur peut annuler cette demande.'
        });
      }
    }

    // Require reason for Action Required or Rejected
    if (newStatus === 'Action Required' && !actionRequiredReason && !notes) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez spécifier la pièce manquante ou le motif de l\'action requise pour informer le citoyen.'
      });
    }

    if (newStatus === 'Rejected' && !rejectionReason && !notes) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez indiquer le motif du rejet administratif.'
      });
    }

    // Generate Collection Token when ready for collection
    let collectionToken = request.collectionToken;
    if (newStatus === 'Ready for Collection' && !collectionToken) {
      collectionToken = `COL-${Math.floor(100000 + Math.random() * 900000)}`;
      request.collectionToken = collectionToken;
    }

    // If marked as Issued, record completion date
    if (newStatus === 'Issued') {
      request.completionDate = new Date();
    }

    // Save reasons
    if (actionRequiredReason) request.actionRequiredReason = actionRequiredReason;
    if (rejectionReason) request.rejectionReason = rejectionReason;

    // Append to status history
    request.statusHistory.push({
      previousStatus: currentStatus,
      newStatus,
      changedBy: req.user._id,
      changedByName: req.user.fullName,
      changedByRole: req.user.role,
      changedAt: new Date(),
      notes: notes || actionRequiredReason || rejectionReason || `Statut mis à jour vers ${newStatus}.`,
      internalStaffNote: internalStaffNote || ''
    });

    request.status = newStatus;
    await request.save();

    // Preserve audit log
    await AuditLog.create({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'REQUEST_STATUS_UPDATED',
      entityType: 'Request',
      entityId: request._id.toString(),
      details: {
        reference: request.reference,
        fromStatus: currentStatus,
        toStatus: newStatus,
        notes: notes || actionRequiredReason || rejectionReason
      }
    });

    // Notify citizen of the status update
    let notifTitle = 'Mise à jour de votre demande';
    let notifMessage = `Votre demande ${request.reference} est maintenant : ${newStatus}.`;
    let notifType = 'system';

    if (newStatus === 'Under Review') {
      notifTitle = 'Examen de votre dossier en cours';
      notifMessage = `Les agents administratifs examinent actuellement votre demande ${request.reference}.`;
      notifType = 'request_review';
    } else if (newStatus === 'Action Required') {
      notifTitle = 'Action requise : Complément de dossier';
      notifMessage = `Action nécessaire pour la demande ${request.reference} : ${actionRequiredReason || notes}`;
      notifType = 'action_required';
    } else if (newStatus === 'Approved') {
      notifTitle = 'Demande Approuvée';
      notifMessage = `Félicitations, votre demande ${request.reference} a été approuvée par l'administration.`;
      notifType = 'request_approved';
    } else if (newStatus === 'Ready for Collection') {
      notifTitle = 'Document prêt pour retrait';
      notifMessage = `Votre document pour la demande ${request.reference} est prêt au guichet de la Mo9ata3a. Code de retrait : ${collectionToken}.`;
      notifType = 'ready_for_collection';
    } else if (newStatus === 'Issued') {
      notifTitle = 'Document délivré';
      notifMessage = `Le document relatif à votre demande ${request.reference} vous a été officiellement remis.`;
      notifType = 'request_issued';
    } else if (newStatus === 'Rejected') {
      notifTitle = 'Demande rejetée';
      notifMessage = `Votre demande ${request.reference} a été refusée. Motif : ${rejectionReason || notes}`;
      notifType = 'request_rejected';
    }

    await createNotification({
      recipientId: request.citizen._id,
      title: notifTitle,
      message: notifMessage,
      type: notifType,
      requestId: request._id,
      requestReference: request.reference
    });

    return res.status(200).json({
      success: true,
      message: `Statut de la demande mis à jour vers "${newStatus}".`,
      data: request
    });
  } catch (error) {
    console.error('[RequestController] Error updating request status:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut.',
      error: error.message
    });
  }
};

/**
 * Citizen: Resubmit missing or replacement documents (Action Required response)
 */
export const submitMissingDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentName, notes } = req.body;

    const request = await RequestModel.findById(id).populate('service');
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande introuvable.'
      });
    }

    if (request.citizen.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit.'
      });
    }

    if (request.status !== 'Action Required') {
      return res.status(400).json({
        success: false,
        message: 'Cette demande n\'est pas en attente de complément documentaire.'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez sélectionner le document à téléverser.'
      });
    }

    // Add replacement files
    req.files.forEach(file => {
      request.documents.push({
        documentName: documentName || file.originalname,
        originalName: file.originalname,
        filePath: `/uploads/documents/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadedAt: new Date(),
        status: 'replaced',
        notes: notes || 'Document complémentaire fourni par le citoyen.'
      });
    });

    // Auto-transition back to 'Under Review'
    const prevStatus = request.status;
    request.status = 'Under Review';
    request.statusHistory.push({
      previousStatus: prevStatus,
      newStatus: 'Under Review',
      changedBy: req.user._id,
      changedByName: req.user.fullName,
      changedByRole: req.user.role,
      changedAt: new Date(),
      notes: notes || 'Complément documentaire transmis par le citoyen. Dossier replacé en cours d\'examen.'
    });

    await request.save();

    // Notify staff that citizen has responded
    await notifyStaff({
      title: 'Pièce complémentaire reçue',
      message: `${req.user.fullName} a fourni les documents requis pour la demande ${request.reference}.`,
      type: 'request_review',
      requestId: request._id,
      requestReference: request.reference
    });

    return res.status(200).json({
      success: true,
      message: 'Documents complémentaires soumis avec succès. Votre demande est à nouveau en cours d\'examen.',
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la transmission des pièces complémentaires.',
      error: error.message
    });
  }
};

/**
 * Manager / Staff: Confirm physical handover with collection token
 */
export const confirmCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { collectionToken, staffNotes } = req.body;

    const request = await RequestModel.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Demande introuvable.'
      });
    }

    if (request.status !== 'Ready for Collection') {
      return res.status(400).json({
        success: false,
        message: 'Le document n\'est pas encore marqué prêt pour retrait.'
      });
    }

    if (request.collectionToken && collectionToken && request.collectionToken.toUpperCase() !== collectionToken.trim().toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: 'Code de retrait invalide. Veuillez vérifier le code présenté par le citoyen.'
      });
    }

    const prevStatus = request.status;
    request.status = 'Issued';
    request.completionDate = new Date();

    request.statusHistory.push({
      previousStatus: prevStatus,
      newStatus: 'Issued',
      changedBy: req.user._id,
      changedByName: req.user.fullName,
      changedByRole: req.user.role,
      changedAt: new Date(),
      notes: 'Remise physique du document officiel effectuée au guichet.',
      internalStaffNote: staffNotes || `Retrait validé par ${req.user.fullName}.`
    });

    await request.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'COLLECTION_CONFIRMED',
      entityType: 'Request',
      entityId: request._id.toString(),
      details: { reference: request.reference, tokenUsed: collectionToken }
    });

    await createNotification({
      recipientId: request.citizen,
      title: 'Document retiré avec succès',
      message: `Votre document relatif à la demande ${request.reference} vous a été délivré. Merci d'avoir utilisé Mo9ata3a Smart.`,
      type: 'request_issued',
      requestId: request._id,
      requestReference: request.reference
    });

    return res.status(200).json({
      success: true,
      message: 'Remise du document confirmée avec succès. Statut passé à "Délivré" (Issued).',
      data: request
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation de retrait.',
      error: error.message
    });
  }
};
