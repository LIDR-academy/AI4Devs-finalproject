import { TemperatureLog } from '../../../domain/kitchen/entities/TemperatureLog.js';
import { ITemperatureLogRepository, TemperatureLogFilter } from '../../../domain/kitchen/repositories/ITemperatureLogRepository.js';

export class InMemoryTemperatureLogRepository implements ITemperatureLogRepository {
  public logs: Map<string, TemperatureLog> = new Map();

  async save(log: TemperatureLog): Promise<void> {
    this.logs.set(log.id, log);
  }

  async findAll(filter?: TemperatureLogFilter): Promise<TemperatureLog[]> {
    let list = Array.from(this.logs.values());
    if (filter?.storageLocationId) {
      list = list.filter((l) => l.storageLocationId === filter.storageLocationId);
    }
    if (filter?.startDate) {
      list = list.filter((l) => l.recordedAt >= filter.startDate!);
    }
    if (filter?.endDate) {
      list = list.filter((l) => l.recordedAt <= filter.endDate!);
    }
    return list.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
  }
}
