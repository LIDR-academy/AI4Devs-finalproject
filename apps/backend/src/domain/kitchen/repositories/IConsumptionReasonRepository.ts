import { ConsumptionReason } from '../entities/ConsumptionReason.js';

export interface IConsumptionReasonRepository {
  /** `includeInactive = false` (por defecto) devuelve solo los motivos activos. */
  findAll(includeInactive?: boolean): Promise<ConsumptionReason[]>;
  findById(id: string): Promise<ConsumptionReason | null>;
  save(reason: ConsumptionReason): Promise<void>;
}
