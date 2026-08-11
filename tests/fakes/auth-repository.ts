import type {
  AuthRepository,
  AuthUserWithSecret,
  StoredSession,
} from "@/repositories/auth.repository";

/**
 * Doble en memoria del puerto `AuthRepository`. Permite testear los casos de uso de
 * autenticación sin base de datos, que es justo lo que habilita la regla de
 * dependencias (los casos de uso conocen el puerto, no Prisma).
 */
export class FakeAuthRepository implements AuthRepository {
  readonly sessions = new Map<string, StoredSession & { tokenHash: string }>();
  readonly touched: Array<{ sessionId: string; at: Date }> = [];
  private sequence = 0;

  constructor(private readonly users: AuthUserWithSecret[] = []) {}

  async findUserByEmail(email: string) {
    return this.users.find((user) => user.email === email) ?? null;
  }

  async createSession({
    userId,
    tokenHash,
    expiresAt,
  }: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    const session = { id: `session-${++this.sequence}`, userId, expiresAt, tokenHash };
    this.sessions.set(tokenHash, session);
    return session;
  }

  async findSessionByTokenHash(tokenHash: string) {
    const session = this.sessions.get(tokenHash);
    if (!session) return null;
    const user = this.users.find((candidate) => candidate.id === session.userId);
    if (!user) return null;
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return { session, user: safeUser };
  }

  async deleteSessionByTokenHash(tokenHash: string) {
    this.sessions.delete(tokenHash);
  }

  async deleteSessionsForUser(userId: string) {
    let deleted = 0;
    for (const [hash, session] of this.sessions) {
      if (session.userId !== userId) continue;
      this.sessions.delete(hash);
      deleted++;
    }
    return deleted;
  }

  async touchSession(sessionId: string, at: Date) {
    this.touched.push({ sessionId, at });
  }

  async deleteExpiredSessions(now: Date) {
    let deleted = 0;
    for (const [hash, session] of this.sessions) {
      if (session.expiresAt.getTime() > now.getTime()) continue;
      this.sessions.delete(hash);
      deleted++;
    }
    return deleted;
  }
}
