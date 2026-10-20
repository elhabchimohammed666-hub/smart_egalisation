import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

export const getStaffList = async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ['manager', 'admin'] }
    }).select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: staff.length,
      data: staff
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des agents administratifs.',
      error: error.message
    });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { email, password, fullName, role, department, phone } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être renseignés.'
      });
    }

    if (!['manager', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Le rôle doit être "manager" ou "admin".'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cette adresse email existe déjà.'
      });
    }

    const newStaff = await User.create({
      email: email.toLowerCase().trim(),
      password,
      fullName,
      role,
      department: department || 'Affaires Générales',
      phone: phone || ''
    });

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'STAFF_CREATED',
      entityType: 'User',
      entityId: newStaff._id.toString(),
      details: { email: newStaff.email, role: newStaff.role, fullName: newStaff.fullName }
    });

    return res.status(201).json({
      success: true,
      message: 'Compte administratif créé avec succès.',
      data: {
        id: newStaff._id,
        email: newStaff.email,
        fullName: newStaff.fullName,
        role: newStaff.role,
        department: newStaff.department,
        isActive: newStaff.isActive
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte administratif.',
      error: error.message
    });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role, department, phone, isActive, password } = req.body;

    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Agent administratif introuvable.'
      });
    }

    if (fullName) staff.fullName = fullName;
    if (role && ['manager', 'admin'].includes(role)) staff.role = role;
    if (department) staff.department = department;
    if (phone !== undefined) staff.phone = phone;
    if (typeof isActive === 'boolean') staff.isActive = isActive;
    if (password) staff.password = password;

    await staff.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'STAFF_UPDATED',
      entityType: 'User',
      entityId: staff._id.toString(),
      details: { updatedFields: { fullName, role, department, isActive } }
    });

    return res.status(200).json({
      success: true,
      message: 'Compte administratif mis à jour.',
      data: staff
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du compte.',
      error: error.message
    });
  }
};

export const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await User.findById(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Agent introuvable.'
      });
    }

    if (staff._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas désactiver votre propre compte administrateur.'
      });
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: staff.isActive ? 'STAFF_ACTIVATED' : 'STAFF_DEACTIVATED',
      entityType: 'User',
      entityId: staff._id.toString(),
      details: { email: staff.email, isActive: staff.isActive }
    });

    return res.status(200).json({
      success: true,
      message: `Compte ${staff.isActive ? 'activé' : 'désactivé'} avec succès.`,
      isActive: staff.isActive
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut.',
      error: error.message
    });
  }
};
