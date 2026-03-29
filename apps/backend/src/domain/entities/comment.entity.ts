export class Comment {
  constructor(
    public readonly id: string,
    public readonly pinId: string,
    public readonly content: string,
    public readonly authorId: string | null,
    public readonly guestName: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null = null
  ) {}

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isOwnedBy(userId: string | null, guestName: string | null): boolean {
    if (userId) return this.authorId === userId;
    if (guestName) return this.guestName === guestName;
    return false;
  }
}
