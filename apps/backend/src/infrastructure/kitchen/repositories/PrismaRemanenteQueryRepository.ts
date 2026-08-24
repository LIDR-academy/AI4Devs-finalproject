import { PrismaClient } from '../../../generated/prisma/client.js';
import {
  IRemanenteQueryRepository,
  ActiveRemanenteDTO,
} from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';

export class PrismaRemanenteQueryRepository implements IRemanenteQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findActiveRemanentes(location?: string): Promise<ActiveRemanenteDTO[]> {
    const rawList = await this.prisma.remanente.findMany({
      where: {
        status: 'ACTIVE',
        ...(location ? { location } : {}),
      },
      include: {
        insumo: true, // Prevencion Anti-N+1 Query
      },
      orderBy: {
        expirationDate: 'asc', // Ordenamiento estricto FEFO
      },
    });

    return rawList.map((r) => ({
      id: r.id,
      insumoId: r.insumoId,
      insumoName: r.insumo.name,
      unitOfMeasure: r.insumo.unitOfMeasure,
      currentQuantity: r.currentQuantity.toString(),
      initialQuantity: r.initialQuantity.toString(),
      location: r.location,
      expirationDate: r.expirationDate,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }
}
