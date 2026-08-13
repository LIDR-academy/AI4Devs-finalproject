import { apiClient } from '@/shared/lib/apiClient';
import type {
  Client,
  ClientSearchResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from '../types/client.types';

function buildSearchQuery(params: {
  q?: string;
  nationalId?: string;
}): string {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set('q', params.q);
  }

  if (params.nationalId) {
    searchParams.set('nationalId', params.nationalId);
  }

  return searchParams.toString();
}

export const clientsApi = {
  search(params: { q?: string; nationalId?: string }): Promise<ClientSearchResponse> {
    const query = buildSearchQuery(params);
    return apiClient<ClientSearchResponse>(`/clients/search?${query}`);
  },

  getById(id: string): Promise<Client> {
    return apiClient<Client>(`/clients/${id}`);
  },

  create(data: CreateClientRequest): Promise<Client> {
    return apiClient<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string, data: UpdateClientRequest): Promise<Client> {
    return apiClient<Client>(`/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
