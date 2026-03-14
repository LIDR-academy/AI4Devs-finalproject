import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Token de autenticación requerido',
        code: 'AUTH_TOKEN_REQUIRED',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    if (!token) {
      res.status(401).json({
        error: 'Token de autenticación requerido',
        code: 'AUTH_TOKEN_REQUIRED',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verificar token
    const secret = process.env.JWT_ACCESS_SECRET || 'dev-access-secret';
    
    try {
      const decoded = jwt.verify(token, secret) as {
        sub: string;
        email: string;
        role: string;
      };

      // Agregar información del usuario al request
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (jwtError) {
      logger.warn('Token inválido:', jwtError);
      res.status(401).json({
        error: 'Token inválido o expirado',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString(),
      });
      return;
    }
  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    });
    return;
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'No autenticado',
        code: 'NOT_AUTHENTICATED',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'No tienes permisos para acceder a este recurso',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
};
