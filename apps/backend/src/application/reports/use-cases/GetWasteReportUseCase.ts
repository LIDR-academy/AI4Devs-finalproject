import { IReportRepository } from '../../../domain/reports/repositories/IReportRepository.js';

export interface GetWasteReportInput {
  startDate: string;
  endDate: string;
}

export interface WasteSummaryDTO {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  totalDiscardedQuantity: string;
  reason: string;
}

export class GetWasteReportUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  public async execute(input: GetWasteReportInput): Promise<WasteSummaryDTO[]> {
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Las fechas deben ser cadenas ISO 8601 validas.');
    }

    if (start > end) {
      throw new Error('La fecha de inicio (startDate) no puede ser posterior a la fecha de fin (endDate).');
    }

    const summaries = await this.reportRepository.getWasteReport(start, end);

    return summaries.map((s) => ({
      insumoId: s.insumoId,
      insumoName: s.insumoName,
      unitOfMeasure: s.unitOfMeasure,
      totalDiscardedQuantity: s.totalDiscardedQuantity.toString(),
      reason: s.reason,
    }));
  }
}
