import { IRoleRepository } from '../../../domain/security/repositories/IRoleRepository.js';
import { Role } from '../../../domain/security/entities/Role.js';
import { Permission } from '../../../domain/security/entities/Permission.js';

export class InMemoryRoleRepository implements IRoleRepository {
  private roles: Map<string, Role> = new Map();
  private rolePermissionsMap: Map<string, string[]> = new Map();
  private permissions: Permission[] = [
    new Permission({ id: 'perm-1', code: 'stock:extract', name: 'Extraer Insumos de Bodega', module: 'STOCK' }),
    new Permission({ id: 'perm-2', code: 'stock:restock', name: 'Reabastecer Bodega', module: 'STOCK' }),
    new Permission({ id: 'perm-3', code: 'stock:read', name: 'Consultar Stock e Historial', module: 'STOCK' }),
    new Permission({ id: 'perm-4', code: 'kitchen:recipe_prepare', name: 'Preparar Recetas FEFO', module: 'KITCHEN' }),
    new Permission({ id: 'perm-5', code: 'kitchen:remanente_consume', name: 'Consumir/Descartar Remanentes', module: 'KITCHEN' }),
    new Permission({ id: 'perm-6', code: 'reports:view', name: 'Ver Reportes y Dashboard', module: 'REPORTS' }),
    new Permission({ id: 'perm-7', code: 'users:manage', name: 'Gestionar Personal', module: 'USERS' }),
    new Permission({ id: 'perm-8', code: 'roles:manage', name: 'Gestionar Roles y Permisos', module: 'ROLES' }),
  ];

  constructor() {
    // Seed default roles
    const adminRole = new Role({
      id: 'role-admin',
      name: 'ADMIN',
      description: 'Administrador General con acceso total',
      permissions: [...this.permissions],
    });
    this.roles.set(adminRole.id, adminRole);
    this.rolePermissionsMap.set(adminRole.id, this.permissions.map((p) => p.id));
  }

  async findAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async findRoleById(id: string): Promise<Role | null> {
    return this.roles.get(id) || null;
  }

  async findRoleByName(name: string): Promise<Role | null> {
    return Array.from(this.roles.values()).find((r) => r.name.toLowerCase() === name.toLowerCase()) || null;
  }

  async saveRole(role: Role): Promise<void> {
    this.roles.set(role.id, role);
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    this.rolePermissionsMap.set(roleId, permissionIds);
    const role = this.roles.get(roleId);
    if (role) {
      const perms = this.permissions.filter((p) => permissionIds.includes(p.id));
      const updated = new Role({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: perms,
      });
      this.roles.set(roleId, updated);
    }
  }

  async findAllPermissions(): Promise<Permission[]> {
    return [...this.permissions];
  }
}
