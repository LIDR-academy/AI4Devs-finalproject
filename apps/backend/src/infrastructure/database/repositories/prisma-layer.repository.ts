import { PrismaClient } from '@prisma/client';
import { ILayerRepository } from '@/domain/layers/layer.repository';
import { Layer, LayerStatus, LayerType } from '@trace/core';

export class PrismaLayerRepository implements ILayerRepository {
  constructor(private prisma: PrismaClient) {}

  async save(layer: Layer): Promise<Layer> {
    const data = {
      planId: layer.planId,
      name: layer.name,
      imageUrl: layer.imageUrl,
      type: layer.type as any, // Cast to Prisma Enum
      status: layer.status as unknown as string // Prisma schema uses string for status on Layer currently in the mock provided earlier 
      // Checking Schema provided earlier: status String @default("ACTIVE")
      // Wait, Schema provided earlier says: status String @default("ACTIVE"). 
      // But we want to use 'PROCESSING' / 'READY' enum concept in Domain.
      // We should probably map it. 
    };

    const saved = await this.prisma.layer.create({
      data: {
        ...data,
        status: layer.status // Storing the enum string value directly
      }
    });

    return this.mapToEntity(saved);
  }

  async findById(id: string): Promise<Layer | null> {
    const found = await this.prisma.layer.findUnique({ where: { id } });
    if (!found) return null;
    return this.mapToEntity(found);
  }

  private mapToEntity(model: any): Layer {
      return new Layer(
          model.id,
          model.planId,
          model.name,
          model.imageUrl,
          model.type as LayerType,
          model.status as LayerStatus,
          model.createdAt,
          model.updatedAt
      );
  }
}
