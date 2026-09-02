import { IReportRepository, RemanenteRotationRecord } from '../../../domain/reports/repositories/IReportRepository.js';
import { WasteSummary } from '../../../domain/reports/entities/WasteSummary.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

export class InMemoryReportRepository implements IReportRepository {
  private wasteEntries: WasteSummary[] = [];
  private rotationEntries: RemanenteRotationRecord[] = [];

  public seedWasteSummary(item: WasteSummary): void {
    this.wasteEntries.push(item);
  }

  public seedTerminalRemanente(record: RemanenteRotationRecord): void {
    this.rotationEntries.push(record);
  }

  public async getWasteReport(_startDate: Date, _endDate: Date): Promise<WasteSummary[]> {
    if (this.wasteEntries.length === 0) {
      return [
        new WasteSummary({
          insumoId: 'ins-queso-1',
          insumoName: 'Queso Mozzarella',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: new DecimalQuantity('3.500'),
          reason: 'EXPIRATION',
        }),
        new WasteSummary({
          insumoId: 'ins-tomate-1',
          insumoName: 'Salsa de Tomate',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: new DecimalQuantity('1.200'),
          reason: 'PHYSICAL_DAMAGE',
        }),
      ];
    }
    return [...this.wasteEntries];
  }

  public async getTerminalRemanentes(_startDate: Date, _endDate: Date): Promise<RemanenteRotationRecord[]> {
    return [...this.rotationEntries];
  }
}
