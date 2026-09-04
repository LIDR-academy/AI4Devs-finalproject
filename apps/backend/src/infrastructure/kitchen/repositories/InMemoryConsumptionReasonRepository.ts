import { IConsumptionReasonRepository } from '../../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { ConsumptionReason } from '../../../domain/kitchen/entities/ConsumptionReason.js';

const SEED_LABELS = ['Preparación de plato', 'Degustación / prueba', 'Cortesía a cliente', 'Error de manipulación', 'Otro'];

export class InMemoryConsumptionReasonRepository implements IConsumptionReasonRepository {
  public reasons: Map<string, ConsumptionReason> = new Map();

  constructor(seed = true) {
    if (seed) {
      SEED_LABELS.forEach((label, i) => {
        const reason = ConsumptionReason.create(`reason-seed-${i + 1}`, label);
        this.reasons.set(reason.id, reason);
      });
    }
  }

  async findAll(includeInactive = false): Promise<ConsumptionReason[]> {
    const all = Array.from(this.reasons.values());
    return includeInactive ? all : all.filter((r) => r.isActive);
  }

  async findById(id: string): Promise<ConsumptionReason | null> {
    return this.reasons.get(id) ?? null;
  }

  async save(reason: ConsumptionReason): Promise<void> {
    this.reasons.set(reason.id, reason);
  }
}
