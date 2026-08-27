import { Role } from '../entities/Role.js';
import { Permission } from '../entities/Permission.js';

export interface IRoleRepository {
  findAllRoles(): Promise<Role[]>;
  findRoleById(id: string): Promise<Role | null>;
  findRoleByName(name: string): Promise<Role | null>;
  saveRole(role: Role): Promise<void>;
  updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void>;
  findAllPermissions(): Promise<Permission[]>;
}
