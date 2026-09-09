import { IRoleRepository } from '../../../domain/security/repositories/IRoleRepository.js';
import { Role } from '../../../domain/security/entities/Role.js';

export class GetRolesUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(): Promise<Role[]> {
    return this.roleRepository.findAllRoles();
  }
}
