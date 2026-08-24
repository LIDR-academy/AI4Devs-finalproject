import { WasteSummary } from '../entities/WasteSummary.js';

export interface IReportRepository {
  getWasteReport(startDate: Date, endDate: Date): Promise<WasteSummary[]>;
}
