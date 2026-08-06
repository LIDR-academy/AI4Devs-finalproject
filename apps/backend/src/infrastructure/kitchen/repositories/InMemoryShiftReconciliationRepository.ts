import { IShiftReconciliationRepository } from '../../../domain/kitchen/repositories/IShiftReconciliationRepository.js';
import { ShiftReconciliation } from '../../../domain/kitchen/entities/ShiftReconciliation.js';

export class InMemoryShiftReconciliationRepository implements IShiftReconciliationRepository {
  private reconciliations: ShiftReconciliation[] = [];

  public async save(reconciliation: ShiftReconciliation): Promise<void> {
    const existingIndex = this.reconciliations.findIndex((r) => r.id === reconciliation.id);
    if (existingIndex >= 0) {
      this.reconciliations[existingIndex] = reconciliation;
    } else {
      this.reconciliations.push(reconciliation);
    }
  }

  public async findAll(): Promise<ShiftReconciliation[]> {
    return [...this.reconciliations];
  }
}
