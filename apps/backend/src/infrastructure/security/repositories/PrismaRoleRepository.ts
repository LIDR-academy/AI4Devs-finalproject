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
    const raw = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });

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
}
