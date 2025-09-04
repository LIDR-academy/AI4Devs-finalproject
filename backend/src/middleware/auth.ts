import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt';
import { IRequestWithUser, IUserResponse, IJWTPayload } from '../types';
import User from '../models/User';

export const authenticateToken = async (
  req: IRequestWithUser,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
        error: 'MISSING_TOKEN'
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as IJWTPayload;
    
    // Verificar que el usuario existe y está activo
    const user = await User.findByPk(decoded.user_id);
    
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        message: 'Usuario no válido o inactivo',
        error: 'INVALID_USER'
      });
      return;
    }

    // Agregar información del usuario a la request
    req.user = {
      id_user: user.id_user,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      profile_picture: user.profile_picture,
      bio: user.bio,
      verification_status: user.verification_status,
      last_login: user.last_login,
      created_at: user.created_at
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'INVALID_TOKEN'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expirado',
        error: 'TOKEN_EXPIRED'
      });
    } else {
      console.error('Error en autenticación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: IRequestWithUser, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Autenticación requerida',
        error: 'AUTHENTICATION_REQUIRED'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Permisos insuficientes',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
      return;
    }

    next();
  };
};

export const requireAgentOrAdmin = requireRole(['agent', 'admin']);
export const requireAdmin = requireRole(['admin']);
