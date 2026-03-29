import { IPinRepository } from '@/domain/repositories/pin.repository';
import { PinNotFoundError, PinDeletionForbiddenError } from '@/domain/errors/pin.errors';

export interface DeletePinContext {
  userId: string | null;
  guestName: string | null;
}

export class DeletePinUseCase {
  constructor(private pinRepository: IPinRepository) {}

  async execute(pinId: string, context: DeletePinContext): Promise<void> {
    // 1. Find Pin
    const pin = await this.pinRepository.findById(pinId);
    if (!pin || pin.isDeleted()) {
      throw new PinNotFoundError(pinId);
    }

    // 2. Check Ownership
    if (!pin.isOwnedBy(context.userId, context.guestName)) {
      throw new PinDeletionForbiddenError();
    }

    // 3. Soft Delete
    await this.pinRepository.softDelete(pinId);
  }
}
