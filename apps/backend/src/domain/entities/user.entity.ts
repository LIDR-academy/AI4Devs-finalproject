export type UserRole = 'ADMIN' | 'CLIENT';
export type SubscriptionTier = 'FREE' | 'PRO';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly subscriptionTier: SubscriptionTier,
    public readonly fullName?: string | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
