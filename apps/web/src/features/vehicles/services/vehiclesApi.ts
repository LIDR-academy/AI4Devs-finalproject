import { apiClient } from '@/shared/lib/apiClient';
import { historyApi } from '@/features/history/services/historyApi';
import type { VehicleHistoryResponse } from '@/features/history/types/history.types';
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  Vehicle,
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
    return historyApi.getVehicleHistory(id);
  },

  create(data: CreateVehicleRequest): Promise<Vehicle> {
    const body: CreateVehicleRequest = {
      licensePlate: data.licensePlate,
      brand: data.brand,
      model: data.model,
      year: data.year,
      ...(data.color ? { color: data.color } : {}),
      ...(data.clientId ? { clientId: data.clientId } : {}),
    };

    return apiClient<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(body),
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
