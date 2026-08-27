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

export function createRolesController(roleRepo: IRoleRepository): Router {
  const router = Router();
  const getRolesUseCase = new GetRolesUseCase(roleRepo);
  const createRoleUseCase = new CreateRoleUseCase(roleRepo);
  const updatePermissionsUseCase = new UpdateRolePermissionsUseCase(roleRepo);

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const roles = await getRolesUseCase.execute();
      res.json(
        roles.map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description,
          permissions: r.permissions.map((p) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            module: p.module,
            description: p.description,
          })),
        }))
      );
    } catch (err) {
      next(err);
    }
  });

  router.get('/permissions', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await roleRepo.findAllPermissions();
      res.json(
        permissions.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          module: p.module,
          description: p.description,
        }))
      );
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createRoleSchema.parse(req.body);
      const role = await createRoleUseCase.execute(parsed);
      res.status(201).json({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions.map((p) => ({
          id: p.id,
          code: p.code,
          name: p.name,
          module: p.module,
        })),
      });
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id/permissions', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updatePermissionsSchema.parse(req.body);
      await updatePermissionsUseCase.execute({
        roleId: req.params.id,
        permissionIds: parsed.permissionIds,
      });
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

  return router;
}
