import Decimal from 'decimal.js';
import { IReportRepository } from '../../../domain/reports/repositories/IReportRepository.js';
import { DateRangeInput, parseDateRange } from '../parseDateRange.js';

export type GetRotationMetricsInput = DateRangeInput;

export interface RotationMetricsDTO {
  averageTrrHours: number | null;
  targetTrrHours: number;
  sampleSize: number;
}

const TARGET_TRR_HOURS = 72;
const MS_PER_HOUR = 60 * 60 * 1000;

export class GetRotationMetricsUseCase {
  constructor(private readonly reportRepository: IReportRepository) {}

  public async execute(input: GetRotationMetricsInput): Promise<RotationMetricsDTO> {
    const { start, end } = parseDateRange(input);
    const records = await this.reportRepository.getTerminalRemanentes(start, end);

    if (records.length === 0) {
      return { averageTrrHours: null, targetTrrHours: TARGET_TRR_HOURS, sampleSize: 0 };
    }

    // US-020: cada remanente (consumido o descartado) cuenta con su tiempo real hasta el
    // estado terminal — el promedio mide el ciclo de vida completo, no solo el consumo
    // exitoso. Aritmetica via decimal.js (Guard 17), nunca division/suma primitiva de floats.
    const totalHours = records.reduce((sum, record) => {
      const elapsedHours = new Decimal(record.terminalAt.getTime() - record.createdAt.getTime()).dividedBy(MS_PER_HOUR);
      return sum.plus(elapsedHours);
    }, new Decimal(0));

    const averageTrrHours = totalHours.dividedBy(records.length).toNumber();

    return { averageTrrHours, targetTrrHours: TARGET_TRR_HOURS, sampleSize: records.length };
  }
}
