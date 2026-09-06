import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  resolveCurrentOwner,
  VehicleWithActiveOwnership,
} from '../vehicles/mappers/vehicle.mapper';
import { ClientProfileResponseDto } from './dto/client-profile-response.dto';
import { VehicleHistoryResponseDto } from './dto/vehicle-history-response.dto';
import { mapWorkOrderToVisit } from './mappers/visit-history.mapper';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getVehicleHistory(
    vehicleId: string,
  ): Promise<VehicleHistoryResponseDto> {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        ownerships: {
          where: { validTo: null },
          include: { client: true },
          take: 1,
        },
        workOrders: {
          orderBy: { checkedInAt: 'desc' },
          include: {
            ownerClient: true,
            tasks: {
              orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            },
          },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    const currentOwner = resolveCurrentOwner(
      vehicle as VehicleWithActiveOwnership,
    );

    const visits = vehicle.workOrders.map(mapWorkOrderToVisit);

    return {
      vehicleId: vehicle.id,
      licensePlate: vehicle.licensePlate,
      vehicleLabel: `${vehicle.brand} ${vehicle.model} ${vehicle.year}`,
      currentOwner,
      visits,
      total: visits.length,
    };
  }

  async getClientProfile(clientId: string): Promise<ClientProfileResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const activeOwnerships = await this.prisma.vehicleOwnership.findMany({
      where: { clientId, validTo: null },
      include: {
        vehicle: {
          include: {
            workOrders: {
              orderBy: { checkedInAt: 'desc' },
              take: 1,
              select: { checkedInAt: true, status: true },
            },
          },
        },
      },
      orderBy: { vehicle: { licensePlate: 'asc' } },
    });

    const vehicles = activeOwnerships.map((ownership) => ({
      id: ownership.vehicle.id,
      licensePlate: ownership.vehicle.licensePlate,
      brand: ownership.vehicle.brand,
      model: ownership.vehicle.model,
      year: ownership.vehicle.year,
      lastVisitAt: ownership.vehicle.workOrders[0]?.checkedInAt ?? null,
      lastVisitStatus: ownership.vehicle.workOrders[0]?.status ?? null,
    }));

    return {
      id: client.id,
      fullName: client.fullName,
      nationalId: client.nationalId,
      phone: client.phone,
      email: client.email,
      createdAt: client.createdAt,
      vehicles,
    };
  }
}
