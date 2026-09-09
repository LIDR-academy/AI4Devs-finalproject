import { PrismaClient } from '../../../generated/prisma/client.js';
import { IConsumptionReasonRepository } from '../../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { ConsumptionReason } from '../../../domain/kitchen/entities/ConsumptionReason.js';

type RawReason = { id: string; label: string; isActive: boolean; createdAt: Date; updatedAt: Date };

function toConsumptionReason(raw: RawReason): ConsumptionReason {
  return new ConsumptionReason({
    id: raw.id,
    label: raw.label,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}

export class PrismaConsumptionReasonRepository implements IConsumptionReasonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(includeInactive = false): Promise<ConsumptionReason[]> {
    const list = await this.prisma.consumptionReason.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { label: 'asc' },
    });
    return list.map(toConsumptionReason);
  }

  async findById(id: string): Promise<ConsumptionReason | null> {
    const raw = await this.prisma.consumptionReason.findUnique({ where: { id } });
    return raw ? toConsumptionReason(raw) : null;
  }

  async save(reason: ConsumptionReason): Promise<void> {
    await this.prisma.consumptionReason.upsert({
      where: { id: reason.id },
      update: { label: reason.label, isActive: reason.isActive },
      create: { id: reason.id, label: reason.label, isActive: reason.isActive },
    });
  }
}
