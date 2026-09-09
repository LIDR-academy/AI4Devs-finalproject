import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

export type UserStatusAction = 'BLOCK' | 'ACTIVATE';

export interface SetUserStatusDTO {
  userId: string;
  action: UserStatusAction;
}

export interface SetUserStatusResponseDTO {
  id: string;
  status: string;
}

export class SetUserStatusUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: SetUserStatusDTO): Promise<SetUserStatusResponseDTO> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuario', dto.userId);
    }

    if (dto.action === 'BLOCK') {
      user.block();
    } else {
      user.activate();
    }

    await this.userRepository.save(user);

    return { id: user.id, status: user.status };
  }
}
