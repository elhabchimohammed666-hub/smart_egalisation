import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Veuillez vous connecter.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id).populate('citizenProfile');
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'L\'utilisateur associé à cette session n\'existe plus.'
      });
    }

    if (!currentUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Ce compte utilisateur a été désactivé par l\'administration.'
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Session expirée ou jeton invalide. Veuillez vous reconnecter.',
      error: error.message
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Droits insuffisants pour effectuer cette action administrative.'
      });
    }
    next();
  };
};
