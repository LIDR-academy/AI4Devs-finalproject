import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InvalidPinException } from '../../../domain/auth/errors/InvalidPinException.js';
import { UserBlockedException } from '../../../domain/auth/errors/UserBlockedException.js';

export interface AuthenticateByPinDTO {
  userId: string;
  pin: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  user: {
    id: string;
    name: string;
    role: string;
    mustChangePin: boolean;
  };
}

export class AuthenticateByPinUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtSecret: string
  ) {}

  public async execute(dto: AuthenticateByPinDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuario', dto.userId);
    }

    if (user.isBlocked()) {
      throw new UserBlockedException(user.name);
    }

    const isValid = user.validatePin(dto.pin);
    await this.userRepository.save(user);

    if (!isValid) {
      throw new InvalidPinException('PIN de acceso invalido o incorrecto.');
    }

    const payload = {
      sub: user.id,
      name: user.name,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '12h',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        mustChangePin: user.mustChangePin,
      },
    };
  }
}

