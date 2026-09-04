import { IConsumptionReasonRepository } from '../../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { ConsumptionReason } from '../../../domain/kitchen/entities/ConsumptionReason.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

export interface UpdateConsumptionReasonCommand {
  id: string;
  label?: string;
  isActive?: boolean;
}

export class UpdateConsumptionReasonUseCase {
  constructor(private readonly repository: IConsumptionReasonRepository) {}

  async execute(command: UpdateConsumptionReasonCommand): Promise<ConsumptionReason> {
    const reason = await this.repository.findById(command.id);
    if (!reason) {
      throw new EntityNotFoundException('ConsumptionReason', command.id);
    }

    if (command.label !== undefined) {
      reason.rename(command.label);
    }
    if (command.isActive !== undefined) {
      if (command.isActive) reason.activate();
      else reason.deactivate();
    }

    await this.repository.save(reason);
    return reason;
  }
}
