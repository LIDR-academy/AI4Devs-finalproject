import { TemperatureLog } from '../entities/TemperatureLog.js';

export interface TemperatureLogFilter {
  storageLocationId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ITemperatureLogRepository {
  save(log: TemperatureLog): Promise<void>;
  /** Más reciente primero (US-033 §2.17). */
  findAll(filter?: TemperatureLogFilter): Promise<TemperatureLog[]>;
}
