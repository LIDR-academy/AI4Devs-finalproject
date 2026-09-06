import { TemperatureLog, TemperatureUnitType } from '../../../domain/kitchen/entities/TemperatureLog.js';

export interface TemperatureLogOutputDTO {
  id: string;
  storageLocationId: string;
  unitType: TemperatureUnitType;
  temperatureCelsius: string;
  isWithinSafeRange: boolean;
  recordedByUserId: string;
  recordedAt: string;
}

/**
 * Mapeo compartido `TemperatureLog` (dominio) -> `TemperatureLogOutputDTO` (respuesta
 * HTTP), usado por RecordTemperatureLogUseCase y ListTemperatureLogsUseCase (TK-120) —
 * mismo patrón que `insumoOutputMapper.ts` (TK-119) para evitar el duplicado que el
 * gate de duplicación (jscpd) bloquearía si cada caso de uso lo repitiera.
 */
export function mapTemperatureLogToOutputDTO(log: TemperatureLog): TemperatureLogOutputDTO {
  return {
    id: log.id,
    storageLocationId: log.storageLocationId,
    unitType: log.unitType,
    temperatureCelsius: log.temperatureCelsius.toString(),
    isWithinSafeRange: log.isWithinSafeRange,
    recordedByUserId: log.recordedByUserId,
    recordedAt: log.recordedAt.toISOString(),
  };
}
