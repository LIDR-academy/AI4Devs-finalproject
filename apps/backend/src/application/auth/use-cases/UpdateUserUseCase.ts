import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';

export interface UpdateUserDTO {
  userId: string;
  name?: string;
  role?: string;
  pin?: string;
}

export interface UpdateUserResponseDTO {
  id: string;
  name: string;
  role: string;
  status: string;
}

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: UpdateUserDTO): Promise<UpdateUserResponseDTO> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuario', dto.userId);
    }

    const newPin = dto.pin ? Pin.createFromRaw(dto.pin) : undefined;
    user.updateDetails(dto.name, dto.role, newPin);

    await this.userRepository.update(user);

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }
}
