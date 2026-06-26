import { apiClient } from '@/shared/lib/apiClient';
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  Vehicle,
  VehicleHistoryResponse,
  VehicleSearchResponse,
} from '../types/vehicle.types';

function buildSearchQuery(params: {
  q?: string;
  licensePlate?: string;
}): string {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set('q', params.q);
  }

  if (params.licensePlate) {
    searchParams.set('licensePlate', params.licensePlate);
  }

  return searchParams.toString();
}

export const vehiclesApi = {
  search(params: {
    q?: string;
    licensePlate?: string;
  }): Promise<VehicleSearchResponse> {
    const query = buildSearchQuery(params);
    return apiClient<VehicleSearchResponse>(`/vehicles/search?${query}`);
  },

  getById(id: string): Promise<Vehicle> {
    return apiClient<Vehicle>(`/vehicles/${id}`);
  },

  getHistory(id: string): Promise<VehicleHistoryResponse> {
    return apiClient<VehicleHistoryResponse>(`/vehicles/${id}/history`);
  },

  create(data: CreateVehicleRequest): Promise<Vehicle> {
    return apiClient<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
    return apiClient<Vehicle>(`/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete(id: string): Promise<void> {
    return apiClient<void>(`/vehicles/${id}`, {
      method: 'DELETE',
    });
  },
};
