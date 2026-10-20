import CitizenProfile from '../models/CitizenProfile.js';
import User from '../models/User.js';
import RequestModel from '../models/Request.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Get current citizen profile
 */
export const getMyProfile = async (req, res) => {
  try {
    const profile = await CitizenProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profil citoyen introuvable pour ce compte.'
      });
    }

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil citoyen.',
      error: error.message
    });
  }
};

/**
 * Update permitted contact information (Phone & Address)
 * CIN identity data remains protected and cannot be altered directly.
 */
export const updateContactInfo = async (req, res) => {
  try {
    const { phone, address } = req.body;
    const profile = await CitizenProfile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profil introuvable.'
      });
    }

    const previousAddress = profile.address;
    const previousPhone = profile.phone;

    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;

    await profile.save();

    if (phone !== undefined) {
      await User.findByIdAndUpdate(req.user._id, { phone });
    }

    // Preserve audit log of contact information change
    await AuditLog.create({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'CITIZEN_CONTACT_UPDATED',
      entityType: 'CitizenProfile',
      entityId: profile._id.toString(),
      details: {
        previous: { address: previousAddress, phone: previousPhone },
        updated: { address: profile.address, phone: profile.phone }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Coordonnées de contact mises à jour avec succès.',
      data: profile
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des coordonnées.',
      error: error.message
    });
  }
};

/**
 * Staff: Search & view citizen registry
 */
export const getCitizenRegistry = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { cin: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { arabicFullName: searchRegex },
        { address: searchRegex },
        { phone: searchRegex }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await CitizenProfile.countDocuments(query);
    const citizens = await CitizenProfile.find(query)
      .populate('user', 'email isActive createdAt lastLogin')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: citizens
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la consultation du registre des citoyens.',
      error: error.message
    });
  }
};

/**
 * Staff: Get complete citizen profile with their request history
 */
export const getCitizenDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await CitizenProfile.findById(id).populate('user', 'email isActive createdAt lastLogin');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Dossier citoyen introuvable.'
      });
    }

    // Associated requests
    const requests = await RequestModel.find({ citizen: profile.user._id })
      .populate('service', 'name code')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        profile,
        requests
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la consultation de la fiche citoyen.',
      error: error.message
    });
  }
};
