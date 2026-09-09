import { ITemperatureLogRepository } from '../../../domain/kitchen/repositories/ITemperatureLogRepository.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { TemperatureLog, TemperatureUnitType } from '../../../domain/kitchen/entities/TemperatureLog.js';
import { Temperature } from '../../../domain/kitchen/value-objects/Temperature.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';
import { Clock } from '../../../domain/shared/Clock.js';
import { TemperatureLogOutputDTO, mapTemperatureLogToOutputDTO } from '../mappers/temperatureLogOutputMapper.js';

export interface RecordTemperatureLogInputDTO {
  storageLocationId: string;
  unitType: TemperatureUnitType;
  temperatureCelsius: string;
  recordedByUserId: string;
}

/**
 * US-033/TK-120: registro manual de temperatura al iniciar turno. Nunca bloquea por el
 * valor en sí (decisión de negocio confirmada) — solo valida que el sub-sector exista.
 */
export class RecordTemperatureLogUseCase {
  constructor(
    private readonly repository: ITemperatureLogRepository,
    private readonly locationRepository: IStorageLocationRepository,
    private readonly idGenerator: IdGenerator,
    private readonly clock: Clock
  ) {}

  public async execute(input: RecordTemperatureLogInputDTO): Promise<TemperatureLogOutputDTO> {
    const location = await this.locationRepository.findLocationById(input.storageLocationId);
    if (!location) {
      throw new EntityNotFoundException('StorageLocation', input.storageLocationId);
    }

    const log = new TemperatureLog({
      id: this.idGenerator.next('templog'),
      storageLocationId: input.storageLocationId,
      unitType: input.unitType,
      temperatureCelsius: new Temperature(input.temperatureCelsius),
      recordedByUserId: input.recordedByUserId,
      recordedAt: this.clock.now(),
    });

    await this.repository.save(log);

    return mapTemperatureLogToOutputDTO(log);
  }
}
