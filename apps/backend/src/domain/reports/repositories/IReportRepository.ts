import { WasteSummary } from '../entities/WasteSummary.js';

// US-020: par crudo (creacion + instante terminal) de un remanente que alcanzo EXHAUSTED
// o DISCARDED dentro del rango consultado. El calculo del promedio (TRR real) vive en
// GetRotationMetricsUseCase (Application) — este repositorio solo transporta los datos.
export interface RemanenteRotationRecord {
  createdAt: Date;
  terminalAt: Date;
}

export interface IReportRepository {
  getWasteReport(startDate: Date, endDate: Date): Promise<WasteSummary[]>;
  getTerminalRemanentes(startDate: Date, endDate: Date): Promise<RemanenteRotationRecord[]>;
}
