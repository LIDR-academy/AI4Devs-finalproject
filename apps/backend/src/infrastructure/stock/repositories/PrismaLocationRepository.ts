import { PrismaClient } from '../../../generated/prisma/client.js';
import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { StorageLocation, LocationType } from '../../../domain/stock/entities/StorageLocation.js';

export class PrismaLocationRepository implements IStorageLocationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAllLocations(): Promise<StorageLocation[]> {
    const raw = await this.prisma.storageLocation.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return raw.map(
      (l) =>
        new StorageLocation({
          id: l.id,
          name: l.name,
          type: l.type as LocationType,
          description: l.description || undefined,
          isActive: l.isActive,
          createdAt: l.createdAt,
        })
    );
  }

  async findLocationById(id: string): Promise<StorageLocation | null> {
    const l = await this.prisma.storageLocation.findUnique({ where: { id } });
    if (!l) return null;

    return new StorageLocation({
      id: l.id,
      name: l.name,
      type: l.type as LocationType,
      description: l.description || undefined,
      isActive: l.isActive,
      createdAt: l.createdAt,
    });
  }

  async saveLocation(location: StorageLocation): Promise<void> {
    await this.prisma.storageLocation.upsert({
      where: { id: location.id },
      create: {
        id: location.id,
        name: location.name,
        type: location.type,
        description: location.description,
        isActive: location.isActive,
      },
      update: {
        name: location.name,
        type: location.type,
        description: location.description,
        isActive: location.isActive,
      },
    });
  }
}
