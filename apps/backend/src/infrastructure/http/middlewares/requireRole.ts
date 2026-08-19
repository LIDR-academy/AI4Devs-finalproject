import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authenticateJWT.js';

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      res.status(403).json({
        type: 'https://restostock.com/errors/forbidden',
        title: 'ForbiddenException',
        status: 403,
        detail: `Acceso denegado. Este recurso requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`,
        instance: req.originalUrl || req.url,
      });
      return;
    }

    next();
  };
}
