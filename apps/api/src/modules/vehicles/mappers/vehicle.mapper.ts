import { Client, Vehicle, VehicleOwnership } from '@prisma/client';
import { CurrentOwnerDto } from '../dto/current-owner.dto';
import { VehicleResponseDto } from '../dto/vehicle-response.dto';

export type VehicleWithActiveOwnership = Vehicle & {
  ownerships: Array<VehicleOwnership & { client: Client }>;
};

export function toCurrentOwner(
  ownership: VehicleOwnership & { client: Client },
): CurrentOwnerDto {
  return {
    id: ownership.client.id,
    fullName: ownership.client.fullName,
    nationalId: ownership.client.nationalId,
  };
}

export function resolveCurrentOwner(
  vehicle: VehicleWithActiveOwnership,
): CurrentOwnerDto | null {
  const activeOwnership = vehicle.ownerships[0];
  if (!activeOwnership) {
    return null;
  }

  return toCurrentOwner(activeOwnership);
}

export function toVehicleResponse(
  vehicle: Vehicle,
  currentOwner: CurrentOwnerDto | null,
): VehicleResponseDto {
  return {
    id: vehicle.id,
    licensePlate: vehicle.licensePlate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    currentOwner,
    createdAt: vehicle.createdAt,
  };
}

export function toExistingVehicleSummary(vehicle: Vehicle) {
  return {
    id: vehicle.id,
    licensePlate: vehicle.licensePlate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
  };
}
