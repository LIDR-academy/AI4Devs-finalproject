import crypto from 'crypto';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';
import { InvalidPinException } from '../../../domain/auth/errors/InvalidPinException.js';

export interface ResetAdminPinDTO {
  token: string;
  newPin: string;
}

export interface ResetAdminPinResponseDTO {
  message: string;
}

export class ResetAdminPinUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: ResetAdminPinDTO): Promise<ResetAdminPinResponseDTO> {
    if (!dto.token || dto.token.length < 16) {
      throw new InvalidPinException('El token de recuperación es inválido o ha expirado.');
    }

    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const user = await this.userRepository.findByResetTokenHash(tokenHash);

    if (!user) {
      throw new InvalidPinException('El token de recuperación es inválido o ha expirado.');
    }

    if (!user.resetTokenExpires || user.resetTokenExpires.getTime() < Date.now()) {
      user.clearResetToken();
      await this.userRepository.save(user);
      throw new InvalidPinException('El token de recuperación es inválido o ha expirado.');
    }

    const newPinVO = Pin.createFromRaw(dto.newPin);
    user.resetPin(newPinVO);
    await this.userRepository.save(user);

    return {
      message: 'PIN de administrador actualizado exitosamente.',
    };
  }
}
