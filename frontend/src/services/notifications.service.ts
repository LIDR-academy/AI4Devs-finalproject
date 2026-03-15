import api from '@/utils/api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  relatedId: string | null;
  relatedType: string | null;
  readAt: string | null;
  createdAt: string;
}

export const notificationsService = {
  async getList(unreadOnly = false): Promise<Notification[]> {
    try {
      const res = await api.get<Notification[] | { data?: Notification[] }>('/notifications', {
        params: unreadOnly ? { unreadOnly: 'true' } : undefined,
      });
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : (raw as any)?.data;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  async markAsRead(id: string): Promise<Notification> {
    const res = await api.patch<Notification | { data?: Notification }>(`/notifications/${id}/read`);
    const raw = res?.data;
    return (raw as any)?.data ?? raw;
  },

  async markAllAsRead(): Promise<{ count: number }> {
    const res = await api.patch<{ count: number } | { data?: { count: number } }>('/notifications/read-all');
    const raw = res?.data;
    const unwrapped = (raw as any)?.data ?? raw;
    return typeof unwrapped?.count === 'number' ? unwrapped : { count: 0 };
  },
};
