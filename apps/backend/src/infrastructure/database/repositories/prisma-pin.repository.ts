import { PrismaClient } from '@prisma/client';
import { IPinRepository } from '@/domain/repositories/pin.repository';
import { Pin } from '@/domain/entities/pin.entity';
import { Comment } from '@/domain/entities/comment.entity';

export class PrismaPinRepository implements IPinRepository {
  constructor(private prisma: PrismaClient) {}

  async save(pin: Pin): Promise<void> {
    await this.prisma.pin.create({
      data: {
        id: pin.id,
        layerId: pin.layerId,
        xCoord: pin.xCoord,
        yCoord: pin.yCoord,
        status: pin.status,
        ...(pin.createdBy ? { createdBy: pin.createdBy } : {}),
        guestName: pin.guestName,
        createdAt: pin.createdAt,
        updatedAt: pin.updatedAt,
      },
    });
  }

  async findById(id: string): Promise<Pin | null> {
    const dbPin = await this.prisma.pin.findUnique({
      where: { id },
    });

    if (!dbPin) return null;

    return new Pin(
      dbPin.id,
      dbPin.layerId,
      Number(dbPin.xCoord),
      Number(dbPin.yCoord),
      dbPin.status as 'OPEN' | 'RESOLVED',
      dbPin.createdBy,
      dbPin.guestName,
      dbPin.createdAt,
      dbPin.updatedAt,
      dbPin.deletedAt
    );
  }

  async findByLayerId(layerId: string, includeDeleted: boolean = false): Promise<Pin[]> {
    const dbPins = await this.prisma.pin.findMany({
      where: {
        layerId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return dbPins.map(
      (p) =>
        new Pin(
          p.id,
          p.layerId,
          Number(p.xCoord),
          Number(p.yCoord),
          p.status as 'OPEN' | 'RESOLVED',
          p.createdBy,
          p.guestName,
          p.createdAt,
          p.updatedAt,
          p.deletedAt
        )
    );
  }

  async findByLayerIdWithStatus(layerId: string, status: 'OPEN' | 'RESOLVED'): Promise<Pin[]> {
    const dbPins = await this.prisma.pin.findMany({
      where: {
        layerId,
        status,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    return dbPins.map(
      (p) =>
        new Pin(
          p.id,
          p.layerId,
          Number(p.xCoord),
          Number(p.yCoord),
          p.status as 'OPEN' | 'RESOLVED',
          p.createdBy,
          p.guestName,
          p.createdAt,
          p.updatedAt,
          p.deletedAt
        )
    );
  }

  async update(pin: Pin): Promise<void> {
    await this.prisma.pin.update({
      where: { id: pin.id },
      data: {
        status: pin.status,
        updatedAt: pin.updatedAt,
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.pin.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getCommentsForPin(pinId: string): Promise<Comment[]> {
    const dbComments = await this.prisma.comment.findMany({
      where: {
        pinId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    return dbComments.map(
      (c) =>
        new Comment(
          c.id,
          c.pinId,
          c.content,
          c.authorId,
          c.guestName,
          c.createdAt,
          c.updatedAt,
          c.deletedAt
        )
    );
  }
}
