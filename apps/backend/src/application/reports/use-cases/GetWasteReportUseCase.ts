import { IReportRepository } from '../../../domain/reports/repositories/IReportRepository.js';
import { DateRangeInput, parseDateRange } from '../parseDateRange.js';

export type GetWasteReportInput = DateRangeInput;

export interface WasteSummaryDTO {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  totalDiscardedQuantity: string;
  reason: string;
  totalDiscardedCost: string | null;
}

export class GetWasteReportUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  public async execute(input: GetWasteReportInput): Promise<WasteSummaryDTO[]> {
    const { start, end } = parseDateRange(input);
    const summaries = await this.reportRepository.getWasteReport(start, end);

    return summaries.map((s) => ({
      insumoId: s.insumoId,
      insumoName: s.insumoName,
      unitOfMeasure: s.unitOfMeasure,
      totalDiscardedQuantity: s.totalDiscardedQuantity.toString(),
      reason: s.reason,
      // US-019: null (no "0.00") cuando el insumo no tiene unitCost registrado — el
      // reporte debe distinguir "sin costo" de "costo genuinamente cero".
      totalDiscardedCost: s.unitCost
        ? s.totalDiscardedQuantity.toDecimal().times(s.unitCost.toDecimal()).toFixed(2)
        : null,
    }));
  }
}
