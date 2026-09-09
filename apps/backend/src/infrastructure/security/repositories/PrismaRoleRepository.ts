import { PrismaClient } from '../../../generated/prisma/client.js';
import { IRoleRepository } from '../../../domain/security/repositories/IRoleRepository.js';
import { Role } from '../../../domain/security/entities/Role.js';
import { Permission } from '../../../domain/security/entities/Permission.js';

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllRoles(): Promise<Role[]> {
    const raw = await this.prisma.role.findMany({
      include: {
        permissions: {
          include: { permission: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return raw.map(
      (r) =>
        new Role({
          id: r.id,
          name: r.name,
          description: r.description || undefined,
          permissions: r.permissions.map(
            (rp) =>
              new Permission({
                id: rp.permission.id,
                code: rp.permission.code,
                name: rp.permission.name,
                module: rp.permission.module,
                description: rp.permission.description || undefined,
              })
          ),
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })
    );
  }

  async findRoleById(id: string): Promise<Role | null> {
    const r = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!r) return null;

    return new Role({
      id: r.id,
      name: r.name,
      description: r.description || undefined,
      permissions: r.permissions.map(
        (rp) =>
          new Permission({
            id: rp.permission.id,
            code: rp.permission.code,
            name: rp.permission.name,
            module: rp.permission.module,
            description: rp.permission.description || undefined,
          })
      ),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  async findRoleByName(name: string): Promise<Role | null> {
    const r = await this.prisma.role.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!r) return null;

    return new Role({
      id: r.id,
      name: r.name,
      description: r.description || undefined,
      permissions: r.permissions.map(
        (rp) =>
          new Permission({
            id: rp.permission.id,
            code: rp.permission.code,
            name: rp.permission.name,
            module: rp.permission.module,
            description: rp.permission.description || undefined,
          })
      ),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  async saveRole(role: Role): Promise<void> {
    await this.prisma.role.upsert({
      where: { id: role.id },
      create: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
      update: {
        name: role.name,
        description: role.description,
      },
    });
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
      }),
    ]);
  }

  async findAllPermissions(): Promise<Permission[]> {
    let raw = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });

    if (raw.length === 0) {
      const defaultPerms = [
        { id: 'perm-1', code: 'stock:extract', name: 'Extraer Insumos de Bodega', module: 'STOCK' },
        { id: 'perm-2', code: 'stock:restock', name: 'Reabastecer Bodega', module: 'STOCK' },
        { id: 'perm-3', code: 'stock:read', name: 'Consultar Stock e Historial', module: 'STOCK' },
        { id: 'perm-4', code: 'kitchen:recipe_prepare', name: 'Preparar Recetas FEFO', module: 'KITCHEN' },
        { id: 'perm-5', code: 'kitchen:remanente_consume', name: 'Consumir/Descartar Remanentes', module: 'KITCHEN' },
        { id: 'perm-6', code: 'reports:view', name: 'Ver Reportes y Dashboard', module: 'REPORTS' },
        { id: 'perm-7', code: 'users:manage', name: 'Gestionar Personal', module: 'USERS' },
        { id: 'perm-8', code: 'roles:manage', name: 'Gestionar Roles y Permisos', module: 'ROLES' },
      ];

      for (const p of defaultPerms) {
        await this.prisma.permission.upsert({
          where: { id: p.id },
          update: { code: p.code, name: p.name, module: p.module },
          create: p,
        });
      }

      raw = await this.prisma.permission.findMany({
        orderBy: [{ module: 'asc' }, { code: 'asc' }],
      });
    }

    return raw.map(
      (p) =>
        new Permission({
          id: p.id,
          code: p.code,
          name: p.name,
          module: p.module,
          description: p.description || undefined,
        })
    );
  }


  async deleteRole(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }
}
