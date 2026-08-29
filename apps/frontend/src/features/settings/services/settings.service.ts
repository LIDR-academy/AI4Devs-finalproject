import { apiRequest } from '../../../shared/http/apiClient.js';

export interface SystemSettingsDto {
  id: string;
  restaurantName: string;
  taxId?: string;
  currencySymbol: string;
  criticalAlertHours: number;
  defaultRemanenteHours: number;
  varianceTolerancePercent: number;
  idleTimeoutMinutes?: number;
}


export const SettingsService = {
  async fetchSettings(): Promise<SystemSettingsDto> {
    return apiRequest<SystemSettingsDto>('/settings');
  },

  async updateSettings(data: Partial<SystemSettingsDto>): Promise<SystemSettingsDto> {
    return apiRequest<SystemSettingsDto>('/settings', {
      method: 'PUT',
      body: data,
    });
  },
};
