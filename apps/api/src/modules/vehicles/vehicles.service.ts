import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Vehicle } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { SearchVehiclesQueryDto } from './dto/search-vehicles-query.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleResponseDto } from './dto/vehicle-response.dto';
import { VehicleSearchResponseDto } from './dto/vehicle-search-response.dto';
import {
  resolveCurrentOwner,
  toExistingVehicleSummary,
  toVehicleResponse,
  VehicleWithActiveOwnership,
} from './mappers/vehicle.mapper';
import { normalizeLicensePlate } from './utils/license-plate-normalizer';

const SEARCH_LIMIT = 20;

const ACTIVE_OWNERSHIP_INCLUDE = {
  ownerships: {
    where: { validTo: null },
    include: { client: true },
    take: 1,
  },
} satisfies Prisma.VehicleInclude;

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    query: SearchVehiclesQueryDto,
  ): Promise<VehicleSearchResponseDto> {
    if (query.licensePlate) {
      const vehicle = await this.findByLicensePlate(query.licensePlate);
      if (!vehicle) {
        return { items: [], total: 0 };
      }

      const withOwnership = await this.prisma.vehicle.findUnique({
        where: { id: vehicle.id },
        include: ACTIVE_OWNERSHIP_INCLUDE,
      });

      if (!withOwnership) {
        return { items: [], total: 0 };
      }

      const item = this.toVehicleResponseFromEntity(withOwnership);
      return { items: [item], total: 1 };
    }

    if (!query.q || query.q.length < 2) {
      return { items: [], total: 0 };
    }

    const normalizedQ = normalizeLicensePlate(query.q);
    const vehicles = await this.prisma.vehicle.findMany({
      where: {
        licensePlate: {
          contains: normalizedQ,
          mode: 'insensitive',
        },
      },
      include: ACTIVE_OWNERSHIP_INCLUDE,
      orderBy: { licensePlate: 'asc' },
      take: SEARCH_LIMIT,
    });

    const items = vehicles.map((vehicle) =>
      this.toVehicleResponseFromEntity(vehicle),
    );

    return { items, total: items.length };
  }

  async findById(id: string): Promise<VehicleResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: ACTIVE_OWNERSHIP_INCLUDE,
    });

    if (!vehicle) {
      throw new NotFoundException('Not Found');
    }

    return this.toVehicleResponseFromEntity(vehicle);
  }

  async create(dto: CreateVehicleDto): Promise<VehicleResponseDto> {
    const licensePlate = normalizeLicensePlate(dto.licensePlate);
    const brand = dto.brand.trim();
    const model = dto.model.trim();
    const color = dto.color?.trim() || null;

    const existing = await this.findByLicensePlate(licensePlate);
    if (existing) {
      this.throwLicensePlateConflict(existing);
    }

    try {
      const vehicle = await this.prisma.$transaction(async (tx) => {
        if (dto.clientId) {
          const client = await tx.client.findUnique({
            where: { id: dto.clientId },
          });

          if (!client) {
            throw new NotFoundException('Client not found');
          }
        }

        const createdVehicle = await tx.vehicle.create({
          data: {
            licensePlate,
            brand,
            model,
            year: dto.year,
            color,
          },
        });

        if (dto.clientId) {
          await tx.vehicleOwnership.create({
            data: {
              vehicleId: createdVehicle.id,
              clientId: dto.clientId,
              validFrom: new Date(),
              validTo: null,
            },
          });
        }

        return createdVehicle;
      });

      return this.findById(vehicle.id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const raceExisting = await this.findByLicensePlate(licensePlate);
        if (raceExisting) {
          this.throwLicensePlateConflict(raceExisting);
        }
      }

      throw error;
    }
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const normalized = normalizeLicensePlate(licensePlate);
    return this.prisma.vehicle.findUnique({
      where: { licensePlate: normalized },
    });
  }

  async update(id: string, dto: UpdateVehicleDto): Promise<VehicleResponseDto> {
    const existing = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Not Found');
    }

    const licensePlate = normalizeLicensePlate(dto.licensePlate);
    const brand = dto.brand.trim();
    const model = dto.model.trim();
    const color = dto.color?.trim() || null;

    const plateConflict = await this.findByLicensePlate(licensePlate);
    if (plateConflict && plateConflict.id !== id) {
      this.throwLicensePlateConflict(plateConflict);
    }

    try {
      await this.prisma.vehicle.update({
        where: { id },
        data: {
          licensePlate,
          brand,
          model,
          year: dto.year,
          color,
        },
      });

      return this.findById(id);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const raceExisting = await this.findByLicensePlate(licensePlate);
        if (raceExisting && raceExisting.id !== id) {
          this.throwLicensePlateConflict(raceExisting);
        }
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    const existing = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Not Found');
    }

    await this.assertVehicleHasNoWorkOrders(id);

    await this.prisma.$transaction([
      this.prisma.vehicleOwnership.deleteMany({ where: { vehicleId: id } }),
      this.prisma.vehicle.delete({ where: { id } }),
    ]);
  }

  private async assertVehicleHasNoWorkOrders(vehicleId: string): Promise<void> {
    const workOrderCount = await this.prisma.workOrder.count({
      where: { vehicleId },
    });

    if (workOrderCount > 0) {
      throw new ConflictException(
        'Vehicle has work orders and cannot be deleted',
      );
    }
  }

  private toVehicleResponseFromEntity(
    vehicle: VehicleWithActiveOwnership,
  ): VehicleResponseDto {
    const currentOwner = resolveCurrentOwner(vehicle);
    return toVehicleResponse(vehicle, currentOwner);
  }

  private throwLicensePlateConflict(existing: Vehicle): never {
    throw new ConflictException({
      message: 'Vehicle with this license plate already exists',
      error: 'Conflict',
      existingVehicle: toExistingVehicleSummary(existing),
    });
  }
}
