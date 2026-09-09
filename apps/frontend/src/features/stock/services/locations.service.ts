import { apiRequest } from '../../../shared/http/apiClient.js';

export interface StorageLocationDto {
  id: string;
  name: string;
  type: 'WAREHOUSE' | 'KITCHEN';
  description?: string;
  isActive: boolean;
  /** US-025: el sector tiene existencias asociadas (no se puede borrar ni desactivar). */
  hasStock?: boolean;
}

/** Sub-sectores de bodega activos, para los selectores de alta/reabastecimiento/extracción (US-025). */
export async function fetchActiveWarehouseSectors(): Promise<StorageLocationDto[]> {
  const all = await LocationsService.fetchLocations();
  return all.filter((l) => l.type === 'WAREHOUSE' && l.isActive);
}

/** Áreas de cocina activas, para el desplegable de destino en la extracción (US-026). */
export async function fetchActiveKitchenAreas(): Promise<StorageLocationDto[]> {
  const all = await LocationsService.fetchLocations();
  return all.filter((l) => l.type === 'KITCHEN' && l.isActive);
}

export const LocationsService = {
  async fetchLocations(): Promise<StorageLocationDto[]> {
    return apiRequest<StorageLocationDto[]>('/locations');
  },

  async createLocation(data: { name: string; type: 'WAREHOUSE' | 'KITCHEN'; description?: string }): Promise<StorageLocationDto> {
    return apiRequest<StorageLocationDto>('/locations', {
      method: 'POST',
      body: data,
    });
  },

  async updateLocation(id: string, data: Partial<StorageLocationDto>): Promise<StorageLocationDto> {
    return apiRequest<StorageLocationDto>(`/locations/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async deleteLocation(id: string): Promise<void> {
    await apiRequest<void>(`/locations/${id}`, {
      method: 'DELETE',
    });
  },
};
