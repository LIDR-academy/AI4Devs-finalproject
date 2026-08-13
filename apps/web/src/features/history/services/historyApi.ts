import { apiClient } from '@/shared/lib/apiClient';
import type {
  ClientProfileResponse,
  VehicleHistoryResponse,
} from '../types/history.types';
import { normalizeHistoryVisit } from '../utils/normalizeHistoryVisit';

export const historyApi = {
  getVehicleHistory(vehicleId: string): Promise<VehicleHistoryResponse> {
    return apiClient<VehicleHistoryResponse>(`/vehicles/${vehicleId}/history`).then(
      (response) => ({
        ...response,
        visits: response.visits.map((visit) => normalizeHistoryVisit(visit)),
      }),
    );
  },

  getClientProfile(clientId: string): Promise<ClientProfileResponse> {
    return apiClient<ClientProfileResponse>(`/clients/${clientId}`);
  },
};
