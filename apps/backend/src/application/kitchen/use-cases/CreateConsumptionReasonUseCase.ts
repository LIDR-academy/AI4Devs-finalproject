import { IConsumptionReasonRepository } from '../../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { ConsumptionReason } from '../../../domain/kitchen/entities/ConsumptionReason.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';

export interface CreateConsumptionReasonCommand {
  label: string;
}

export class CreateConsumptionReasonUseCase {
  constructor(
    private readonly repository: IConsumptionReasonRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: CreateConsumptionReasonCommand): Promise<ConsumptionReason> {
    const reason = ConsumptionReason.create(this.idGenerator.next('reason'), command.label);
    await this.repository.save(reason);
    return reason;
  }
}
