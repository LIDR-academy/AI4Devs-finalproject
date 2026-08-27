import { IRoleRepository } from '../../../domain/security/repositories/IRoleRepository.js';
import { Role } from '../../../domain/security/entities/Role.js';

export interface CreateRoleCommand {
  id?: string;
  name: string;
  description?: string;
  permissionIds?: string[];
}

export class CreateRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(command: CreateRoleCommand): Promise<Role> {
    const existing = await this.roleRepository.findRoleByName(command.name);
    if (existing) {
      throw new Error(`El rol '${command.name}' ya existe.`);
    }

    const role = new Role({
      id: command.id || `role-${Date.now()}`,
      name: command.name,
      description: command.description,
    });

    await this.roleRepository.saveRole(role);

    if (command.permissionIds && command.permissionIds.length > 0) {
      await this.roleRepository.updateRolePermissions(role.id, command.permissionIds);
    }

    const created = await this.roleRepository.findRoleById(role.id);
    return created || role;
  }
}
