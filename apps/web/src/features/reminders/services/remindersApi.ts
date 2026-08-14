import { apiClient } from '@/shared/lib/apiClient';
import type {
  EligibleRemindersResponse,
  OptedOutRemindersResponse,
  ReminderOptResponse,
  SendRemindersResponse,
} from '../types/reminders.types';

export const remindersApi = {
  listEligible(params?: {
    limit?: number;
    offset?: number;
    days?: number;
    q?: string;
  }): Promise<EligibleRemindersResponse> {
    const search = new URLSearchParams();
    if (params?.limit !== undefined) {
      search.set('limit', String(params.limit));
    }
    if (params?.offset !== undefined) {
      search.set('offset', String(params.offset));
    }
    if (params?.days !== undefined) {
      search.set('days', String(params.days));
    }
    if (params?.q) {
      search.set('q', params.q);
    }
    const query = search.toString();
    return apiClient<EligibleRemindersResponse>(
      `/reminders/eligible${query ? `?${query}` : ''}`,
    );
  },

  listOptedOut(): Promise<OptedOutRemindersResponse> {
    return apiClient<OptedOutRemindersResponse>('/reminders/opted-out');
  },

  sendReminders(vehicleIds: string[]): Promise<SendRemindersResponse> {
    return apiClient<SendRemindersResponse>('/reminders/send', {
      method: 'POST',
      body: JSON.stringify({ vehicleIds }),
    });
  },

  optOut(vehicleId: string): Promise<ReminderOptResponse> {
    return apiClient<ReminderOptResponse>(
      `/reminders/${vehicleId}/opt-out`,
      { method: 'POST' },
    );
  },

  optIn(vehicleId: string): Promise<ReminderOptResponse> {
    return apiClient<ReminderOptResponse>(
      `/reminders/${vehicleId}/opt-in`,
      { method: 'POST' },
    );
  },
};
