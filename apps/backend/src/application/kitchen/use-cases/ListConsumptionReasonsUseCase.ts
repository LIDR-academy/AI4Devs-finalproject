import { IConsumptionReasonRepository } from '../../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { ConsumptionReason } from '../../../domain/kitchen/entities/ConsumptionReason.js';

export class ListConsumptionReasonsUseCase {
  constructor(private readonly repository: IConsumptionReasonRepository) {}

  async execute(includeInactive = false): Promise<ConsumptionReason[]> {
    return this.repository.findAll(includeInactive);
  }
}
