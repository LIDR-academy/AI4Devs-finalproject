export class Notification {
  constructor(
    public readonly id: string,
    public readonly notificationType: number,
    public readonly recipientId: string,
    public readonly content: string,
    public readonly isRead: boolean,
    public readonly sentAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly classId: string | null = null,
  ) {}
}
