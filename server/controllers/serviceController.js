import Service from '../models/Service.js';
import AuditLog from '../models/AuditLog.js';

export const getServices = async (req, res) => {
  try {
    // If citizen or unauthenticated, return only available services
    const isStaff = req.user && ['admin', 'manager'].includes(req.user.role);
    const filter = isStaff ? {} : { isAvailable: true };

    const services = await Service.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du catalogue des services.',
      error: error.message
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service administratif introuvable.'
      });
    }

    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du service.',
      error: error.message
    });
  }
};

export const createService = async (req, res) => {
  try {
    const { name, code, category, description, requiredDocuments, instructions, processingTimeDays, isAvailable } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et la description du service sont obligatoires.'
      });
    }

    const generatedCode = code || name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 16);

    const existing = await Service.findOne({ code: generatedCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Un service avec ce code ou intitulé existe déjà.'
      });
    }

    const service = await Service.create({
      name,
      code: generatedCode,
      category: category || 'État Civil & Citoyenneté',
      description,
      requiredDocuments: Array.isArray(requiredDocuments) ? requiredDocuments : [],
      instructions,
      processingTimeDays: Number(processingTimeDays) || 2,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      createdBy: req.user._id
    });

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'SERVICE_CREATED',
      entityType: 'Service',
      entityId: service._id.toString(),
      details: { name: service.name, code: service.code }
    });

    return res.status(201).json({
      success: true,
      message: 'Service administratif ajouté au catalogue avec succès.',
      data: service
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du service.',
      error: error.message
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, requiredDocuments, instructions, processingTimeDays, isAvailable } = req.body;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service introuvable.'
      });
    }

    if (name) service.name = name;
    if (description) service.description = description;
    if (category) service.category = category;
    if (requiredDocuments) service.requiredDocuments = requiredDocuments;
    if (instructions) service.instructions = instructions;
    if (processingTimeDays) service.processingTimeDays = Number(processingTimeDays);
    if (typeof isAvailable === 'boolean') service.isAvailable = isAvailable;

    await service.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'SERVICE_UPDATED',
      entityType: 'Service',
      entityId: service._id.toString(),
      details: { name: service.name, isAvailable: service.isAvailable }
    });

    return res.status(200).json({
      success: true,
      message: 'Service administratif mis à jour avec succès.',
      data: service
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du service.',
      error: error.message
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service introuvable.'
      });
    }

    // Instead of hard deleting, toggle availability or remove
    service.isAvailable = false;
    await service.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'SERVICE_DISABLED',
      entityType: 'Service',
      entityId: service._id.toString(),
      details: { name: service.name }
    });

    return res.status(200).json({
      success: true,
      message: 'Le service a été désactivé du catalogue.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation du service.',
      error: error.message
    });
  }
};
