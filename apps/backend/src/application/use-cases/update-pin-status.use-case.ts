import { IPinRepository } from '@/domain/repositories/pin.repository';
import { UpdatePinStatusDto, validateUpdatePinStatusDto } from '@/domain/dtos/update-pin-status.dto';
import { Pin } from '@/domain/entities/pin.entity';
import { PinNotFoundError, PinStatusUpdateForbiddenError } from '@/domain/errors/pin.errors';

export interface UpdatePinStatusContext {
  userId: string | null;
  guestName: string | null;
}

export class UpdatePinStatusUseCase {
  constructor(private pinRepository: IPinRepository) {}

  async execute(pinId: string, context: UpdatePinStatusContext, dto: UpdatePinStatusDto): Promise<Pin> {
    // 1. Guests cannot resolve/reopen pins
    if (context.guestName) {
      throw new PinStatusUpdateForbiddenError();
    }

    // 2. Validate DTO
    const validation = validateUpdatePinStatusDto(dto);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // 3. Find Pin
    const pin = await this.pinRepository.findById(pinId);
    if (!pin || pin.isDeleted()) {
      throw new PinNotFoundError(pinId);
    }

    // 4. Update Status
    const updatedPin = new Pin(
      pin.id,
      pin.layerId,
      pin.xCoord,
      pin.yCoord,
      dto.status,
      pin.createdBy,
      pin.guestName,
      pin.createdAt,
      new Date(), // updatedAt
      pin.deletedAt
    );

    await this.pinRepository.update(updatedPin);

    return updatedPin;
  }
}
