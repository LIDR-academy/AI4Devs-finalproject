import { PrismaClient } from '../../../generated/prisma/client.js';
import {
  IRemanenteQueryRepository,
  ActiveRemanenteDTO,
} from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';

export class PrismaRemanenteQueryRepository implements IRemanenteQueryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async findActiveRemanentes(
    storageLocationId?: string,
    insumoId?: string
  ): Promise<ActiveRemanenteDTO[]> {
    // TK-080: insumoId busca en cualquier area de cocina, no se combina con la ubicacion (US-021).
    // US-026: el filtro por ubicacion acepta la FK o un literal legado en `location`.
    const locationFilter = storageLocationId
      ? { OR: [{ storageLocationId }, { location: storageLocationId }] }
      : {};
    const rawList = await this.prisma.remanente.findMany({
      where: {
        status: 'ACTIVE',
        ...(insumoId ? { insumoId } : locationFilter),
      },
      include: {
        insumo: true, // Prevencion Anti-N+1 Query
        storageLocation: true, // US-026: nombre del area
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
      storageLocationId: r.storageLocationId ?? undefined,
      storageLocationName: r.storageLocation?.name ?? r.location,
      recipePreparationId: r.recipePreparationId ?? undefined,
      expirationDate: r.expirationDate,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }
}
