import type { AuthUserWithSecret } from "@/repositories/auth.repository";
import type {
  PasswordResetRepository,
  StoredResetToken,
} from "@/repositories/password-reset.repository";

/**
 * Doble en memoria del puerto `PasswordResetRepository`.
 *
 * Recibe **la misma lista de usuarios** que `FakeAuthRepository` para que cambiar la
 * contraseña aquí se note al intentar entrar allí: sin eso, el test del camino feliz
 * no podría comprobar lo único que de verdad importa —que después se puede iniciar
 * sesión con la contraseña nueva y no con la vieja.
 */
export class FakePasswordResetRepository implements PasswordResetRepository {
  readonly tokens: StoredResetToken[] = [];
  private readonly hashes = new Map<string, string>();
  private sequence = 0;

  constructor(private readonly users: AuthUserWithSecret[] = []) {}

  async create({
    userId,
    tokenHash,
    expiresAt,
  }: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    at: Date;
    requestedIp?: string | null;
  }) {
    const token: StoredResetToken = {
      id: `reset-${++this.sequence}`,
      userId,
      expiresAt,
      usedAt: null,
    };
    this.tokens.push(token);
    this.hashes.set(tokenHash, token.id);
    return token;
  }

  async invalidateForUser({ userId, at }: { userId: string; at: Date }) {
    let invalidated = 0;
    for (const token of this.tokens) {
      if (token.userId !== userId || token.usedAt !== null) continue;
      token.usedAt = at;
      invalidated++;
    }
    return invalidated;
  }

  async findByTokenHash(tokenHash: string) {
    const id = this.hashes.get(tokenHash);
    return this.tokens.find((token) => token.id === id) ?? null;
  }

  async consume({ tokenId, at }: { tokenId: string; at: Date }) {
    const token = this.tokens.find((candidate) => candidate.id === tokenId);
    if (!token || token.usedAt !== null) return false;
    token.usedAt = at;
    return true;
  }

  async updatePassword({ userId, passwordHash }: { userId: string; passwordHash: string }) {
    const user = this.users.find((candidate) => candidate.id === userId);
    if (user) user.passwordHash = passwordHash;
  }

  /** Enlaces que todavía sirven. Lo usan los tests para comprobar la invalidación. */
  get live(): readonly StoredResetToken[] {
    return this.tokens.filter((token) => token.usedAt === null);
  }
}
