export interface RegisterDeviceTokenPayload {
  token: string;
  platform?: "WEB";
}

export interface RegisterDeviceTokenResponse {
  id: string;
  platform: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  notificationType: number;
  content: string;
  isRead: boolean;
  sentAt: string;
  classId: string | null;
  createdAt: string;
}

export interface NotificationMeta {
  hasMore: boolean;
  nextCursor: string | null;
  totalCount: number;
  unreadCount: number;
}

export interface ListNotificationsResponse {
  data: Notification[];
  meta: NotificationMeta;
}

export interface ListNotificationsParams {
  limit?: number;
  cursor?: string;
  unread_only?: boolean;
  today_only?: boolean;
}
