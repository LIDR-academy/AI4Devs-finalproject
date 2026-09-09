import { ShiftReconciliation } from '../entities/ShiftReconciliation.js';

export interface IShiftReconciliationRepository {
  save(reconciliation: ShiftReconciliation): Promise<void>;
  findAll(): Promise<ShiftReconciliation[]>;
}
