import { apiRequest } from '../../../shared/http/apiClient.js';

export interface StorageLocationDto {
  id: string;
  name: string;
  type: 'WAREHOUSE' | 'KITCHEN';
  description?: string;
  isActive: boolean;
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
};
