import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { Pin } from '../../../domain/auth/value-objects/Pin.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InvalidPinException } from '../../../domain/auth/errors/InvalidPinException.js';
import { UserBlockedException } from '../../../domain/auth/errors/UserBlockedException.js';

export interface ChangePinDTO {
  userId: string;
  currentPin: string;
  newPin: string;
}

export class ChangePinUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(dto: ChangePinDTO): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new EntityNotFoundException('Usuario', dto.userId);
    }

    if (user.isBlocked()) {
      throw new UserBlockedException(user.name);
    }

    const isCurrentValid = user.validatePin(dto.currentPin);
    if (!isCurrentValid) {
      await this.userRepository.save(user);
      throw new InvalidPinException('El PIN actual ingresado es incorrecto.');
    }

    const newPinObject = Pin.createFromRaw(dto.newPin);
    user.changePin(newPinObject);

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'PIN actualizado exitosamente. El modo estricto de primer inicio ha sido superado.',
    };
  }
}
