import { IRoleRepository } from '../../../domain/security/repositories/IRoleRepository.js';

export interface UpdateRolePermissionsCommand {
  roleId: string;
  permissionIds: string[];
}

export class UpdateRolePermissionsUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(command: UpdateRolePermissionsCommand): Promise<void> {
    const role = await this.roleRepository.findRoleById(command.roleId);
    if (!role) {
      throw new Error(`El rol con ID '${command.roleId}' no existe.`);
    }

    await this.roleRepository.updateRolePermissions(command.roleId, command.permissionIds);
  }
}
