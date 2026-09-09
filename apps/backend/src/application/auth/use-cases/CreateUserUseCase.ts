import crypto from 'crypto';
import { User, UserRole } from '../../../domain/auth/entities/User.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';

export interface CreateUserDTO {
  name: string;
  role: UserRole;
  pin: string;
}

export interface CreateUserResponseDTO {
  id: string;
  name: string;
  role: UserRole;
  status: string;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: CreateUserDTO): Promise<CreateUserResponseDTO> {
    const user = new User({
      id: crypto.randomUUID(),
      name: dto.name,
      role: dto.role,
      pin: Pin.createFromRaw(dto.pin),
      status: 'ACTIVE',
      failedAttempts: 0,
    });

    await this.userRepository.save(user);

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
    };
  }
}
