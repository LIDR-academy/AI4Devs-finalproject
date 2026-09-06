import { ITemperatureLogRepository, TemperatureLogFilter } from '../../../domain/kitchen/repositories/ITemperatureLogRepository.js';
import { TemperatureLogOutputDTO, mapTemperatureLogToOutputDTO } from '../mappers/temperatureLogOutputMapper.js';

export interface ListTemperatureLogsInputDTO {
  storageLocationId?: string;
  startDate?: Date;
  endDate?: Date;
}

/** US-033/TK-120: histórico de lecturas, más reciente primero — solo ADMIN (gateado en la ruta). */
export class ListTemperatureLogsUseCase {
  constructor(private readonly repository: ITemperatureLogRepository) {}

  public async execute(input: ListTemperatureLogsInputDTO = {}): Promise<TemperatureLogOutputDTO[]> {
    const filter: TemperatureLogFilter = {
      storageLocationId: input.storageLocationId,
      startDate: input.startDate,
      endDate: input.endDate,
    };
    const logs = await this.repository.findAll(filter);
    return logs.map(mapTemperatureLogToOutputDTO);
  }
}
