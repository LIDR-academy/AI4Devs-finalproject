import { PrismaClient } from '../../../generated/prisma/client.js';
import { TemperatureLog, TemperatureUnitType } from '../../../domain/kitchen/entities/TemperatureLog.js';
import { Temperature } from '../../../domain/kitchen/value-objects/Temperature.js';
import { ITemperatureLogRepository, TemperatureLogFilter } from '../../../domain/kitchen/repositories/ITemperatureLogRepository.js';

type RawTemperatureLog = {
  id: string;
  storageLocationId: string;
  unitType: string;
  temperatureCelsius: { toString(): string };
  recordedByUserId: string;
  recordedAt: Date;
};

function toTemperatureLog(raw: RawTemperatureLog): TemperatureLog {
  return new TemperatureLog({
    id: raw.id,
    storageLocationId: raw.storageLocationId,
    unitType: raw.unitType as TemperatureUnitType,
    temperatureCelsius: new Temperature(raw.temperatureCelsius.toString()),
    recordedByUserId: raw.recordedByUserId,
    recordedAt: raw.recordedAt,
  });
}

export class PrismaTemperatureLogRepository implements ITemperatureLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(log: TemperatureLog): Promise<void> {
    await this.prisma.temperatureLog.create({
      data: {
        id: log.id,
        storageLocationId: log.storageLocationId,
        unitType: log.unitType,
        temperatureCelsius: log.temperatureCelsius.toDecimal(),
        recordedByUserId: log.recordedByUserId,
        recordedAt: log.recordedAt,
      },
    });
  }

  public async findAll(filter?: TemperatureLogFilter): Promise<TemperatureLog[]> {
    const list = await this.prisma.temperatureLog.findMany({
      where: {
        storageLocationId: filter?.storageLocationId,
        recordedAt: {
          gte: filter?.startDate,
          lte: filter?.endDate,
        },
      },
      orderBy: { recordedAt: 'desc' },
    });
    return list.map(toTemperatureLog);
  }
}
