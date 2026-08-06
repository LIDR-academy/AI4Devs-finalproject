import { IReportRepository } from '../../../domain/reports/repositories/IReportRepository.js';
import { WasteSummary } from '../../../domain/reports/entities/WasteSummary.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

export class InMemoryReportRepository implements IReportRepository {
  private wasteEntries: WasteSummary[] = [];

  public seedWasteSummary(item: WasteSummary): void {
    this.wasteEntries.push(item);
  }

  public async getWasteReport(_startDate: Date, _endDate: Date): Promise<WasteSummary[]> {
    if (this.wasteEntries.length === 0) {
      return [
        new WasteSummary({
          insumoId: 'ins-queso-1',
          insumoName: 'Queso Mozzarella',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: new DecimalQuantity('3.5000'),
          reason: 'EXPIRATION',
        }),
        new WasteSummary({
          insumoId: 'ins-tomate-1',
          insumoName: 'Salsa de Tomate',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: new DecimalQuantity('1.2000'),
          reason: 'PHYSICAL_DAMAGE',
        }),
      ];
    }
    return [...this.wasteEntries];
  }
}
