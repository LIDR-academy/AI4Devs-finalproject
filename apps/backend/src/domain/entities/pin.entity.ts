export type PinStatus = 'OPEN' | 'RESOLVED';

export class Pin {
  constructor(
    public readonly id: string,
    public readonly layerId: string,
    public readonly xCoord: number,
    public readonly yCoord: number,
    public readonly status: PinStatus,
    public readonly createdBy: string | null,
    public readonly guestName: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null = null
  ) {}

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isOwnedBy(userId: string | null, guestName: string | null): boolean {
    if (userId) return this.createdBy === userId;
    if (guestName) return this.guestName === guestName;
    return false;
  }
}
