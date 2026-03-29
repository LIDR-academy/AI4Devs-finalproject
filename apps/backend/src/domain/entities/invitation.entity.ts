export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

export class Invitation {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly email: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public readonly status: InvitationStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  canBeUsed(): boolean {
    return this.status === 'PENDING' || this.status === 'ACCEPTED';
  }

  markAsAccepted(): Invitation {
    return new Invitation(
      this.id,
      this.projectId,
      this.email,
      this.token,
      this.expiresAt,
      'ACCEPTED',
      this.createdAt,
      new Date()
    );
  }

  markAsExpired(): Invitation {
    return new Invitation(
      this.id,
      this.projectId,
      this.email,
      this.token,
      this.expiresAt,
      'EXPIRED',
      this.createdAt,
      new Date()
    );
  }
}
