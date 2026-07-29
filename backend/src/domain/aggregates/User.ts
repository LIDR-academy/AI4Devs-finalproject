/**
 * User aggregate. Anonymous session identified by UUID.
 */
export class User {
  private constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly userId: string | null,
    public readonly createdAt: Date,
  ) {}

  static fromPrisma(row: {
    id: string;
    sessionId: string;
    userId: string | null;
    createdAt: Date;
  }): User {
    return new User(row.id, row.sessionId, row.userId, row.createdAt);
  }
}
