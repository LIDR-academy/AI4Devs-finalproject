import { apiRequest } from '../../../shared/http/apiClient.js';

/** ADR-004 / US-030: catálogo administrable de motivos de consumo. */
export interface ConsumptionReasonDto {
  id: string;
  label: string;
  isActive: boolean;
}

export const ConsumptionReasonsService = {
  /** Sin `includeInactive`: solo activos, cualquier autenticado. `includeInactive=true` exige rol ADMIN. */
  async list(includeInactive = false): Promise<ConsumptionReasonDto[]> {
    const query = includeInactive ? '?includeInactive=true' : '';
    return apiRequest<ConsumptionReasonDto[]>(`/consumption-reasons${query}`);
  },

  async create(label: string): Promise<ConsumptionReasonDto> {
    return apiRequest<ConsumptionReasonDto>('/consumption-reasons', {
      method: 'POST',
      body: { label },
    });
  },

  async update(id: string, data: { label?: string; isActive?: boolean }): Promise<ConsumptionReasonDto> {
    return apiRequest<ConsumptionReasonDto>(`/consumption-reasons/${id}`, {
      method: 'PUT',
      body: data,
    });
  },
};
