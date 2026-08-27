import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { IRoleRepository } from '../../../../domain/security/repositories/IRoleRepository.js';
import { GetRolesUseCase } from '../../../../application/security/use-cases/GetRolesUseCase.js';
import { CreateRoleUseCase } from '../../../../application/security/use-cases/CreateRoleUseCase.js';
import { UpdateRolePermissionsUseCase } from '../../../../application/security/use-cases/UpdateRolePermissionsUseCase.js';

const createRoleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

const updatePermissionsSchema = z.object({
  permissionIds: z.array(z.string()),
});

function mapPermission(p: { id: string; code: string; name: string; module: string; description?: string }) {
  return { id: p.id, code: p.code, name: p.name, module: p.module, description: p.description };
}

function registerRoleQueryRoutes(router: Router, roleRepo: IRoleRepository): void {
  const getRolesUseCase = new GetRolesUseCase(roleRepo);

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await getRolesUseCase.execute();
      res.json(roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions.map(mapPermission),
      })));
    } catch (err) {
      next(err);
    }
  });

  router.get('/permissions', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await roleRepo.findAllPermissions();
      res.json(permissions.map(mapPermission));
    } catch (err) {
      next(err);
    }
  });
}

function registerRoleMutationRoutes(router: Router, roleRepo: IRoleRepository): void {
  const createRoleUseCase = new CreateRoleUseCase(roleRepo);
  const updatePermissionsUseCase = new UpdateRolePermissionsUseCase(roleRepo);

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createRoleSchema.parse(req.body);
      const role = await createRoleUseCase.execute(parsed);
      res.status(201).json({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(mapPermission),
      });
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id/permissions', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updatePermissionsSchema.parse(req.body);
      await updatePermissionsUseCase.execute({ roleId: req.params.id, permissionIds: parsed.permissionIds });
      res.json({ message: 'Permisos actualizados correctamente' });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const role = await roleRepo.findRoleById(id);
      if (role && (role.name === 'ADMIN' || role.name === 'KITCHEN_STAFF' || id === 'role-admin' || id === 'role-kitchen')) {
        res.status(400).json({ error: 'No es posible eliminar los roles base predefinidos del sistema.' });
        return;
      }
      await roleRepo.deleteRole(id);
      res.json({ message: 'Rol eliminado correctamente' });
    } catch (err) {
      next(err);
    }
  });
}

function registerRoleRoutes(router: Router, roleRepo: IRoleRepository): void {
  registerRoleQueryRoutes(router, roleRepo);
  registerRoleMutationRoutes(router, roleRepo);
}

export function createRolesController(roleRepo: IRoleRepository): Router {
  const router = Router();
  registerRoleRoutes(router, roleRepo);
  return router;
}
