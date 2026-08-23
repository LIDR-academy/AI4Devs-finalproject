export interface CreateNotificationInput {
  recipientId: string;
  type: number;
  content: string;
  classId?: string;
}

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<{ id: string }>;
}
