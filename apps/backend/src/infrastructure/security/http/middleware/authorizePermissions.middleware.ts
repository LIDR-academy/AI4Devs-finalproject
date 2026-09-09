import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../http/middlewares/authenticateJWT.js';
import { IRoleRepository } from '../../../../domain/security/repositories/IRoleRepository.js';

export function authorizePermissions(roleRepo: IRoleRepository, ...requiredPermissions: string[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const roleName = req.user?.role;

    if (!roleName) {
      res.status(403).json({
        type: 'https://restostock.com/errors/forbidden',
        title: 'ForbiddenException',
        status: 403,
        detail: 'Acceso denegado. No se encontro rol en la sesion del usuario.',
        instance: req.originalUrl || req.url,
      });
      return;
    }

    if (roleName === 'ADMIN') {
      next();
      return;
    }

    const role = await roleRepo.findRoleByName(roleName);
    if (!role) {
      res.status(403).json({
        type: 'https://restostock.com/errors/forbidden',
        title: 'ForbiddenException',
        status: 403,
        detail: `Acceso denegado. El rol '${roleName}' no tiene asignado los permisos requeridos.`,
        instance: req.originalUrl || req.url,
      });
      return;
    }

    const hasAll = requiredPermissions.every((permCode) => role.hasPermission(permCode));
    if (!hasAll) {
      res.status(403).json({
        type: 'https://restostock.com/errors/forbidden',
        title: 'ForbiddenException',
        status: 403,
        detail: `Acceso denegado. Se requieren los permisos: ${requiredPermissions.join(', ')}.`,
        instance: req.originalUrl || req.url,
      });
      return;
    }

    next();
  };
}
