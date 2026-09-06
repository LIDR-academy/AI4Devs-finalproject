import type { Role } from "@/domain/auth/roles";

/**
 * Puerto de persistencia de la capability `accounts-roles`. Los casos de uso
 * dependen de esta interfaz, no de Prisma; el adaptador vive en
 * `auth.repository.prisma.ts` y los tests inyectan un doble en memoria.
 */

/** Vista de usuario que necesita la autenticación. Nunca sale de aquí el hash. */
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: "ACTIVE" | "SUSPENDED";
}

/** Igual que `AuthUser` pero con el hash, solo para verificar la contraseña. */
export interface AuthUserWithSecret extends AuthUser {
  passwordHash: string;
}

export interface StoredSession {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface AuthRepository {
  findUserByEmail(email: string): Promise<AuthUserWithSecret | null>;

  createSession(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    userAgent?: string | null;
    ipAddress?: string | null;
  }): Promise<StoredSession>;

  /** Devuelve la sesión y su usuario en una sola consulta; `null` si no existe. */
  findSessionByTokenHash(
    tokenHash: string
  ): Promise<{ session: StoredSession; user: AuthUser } | null>;

  deleteSessionByTokenHash(tokenHash: string): Promise<void>;

  /** Cierra todas las sesiones de un usuario (revocación, cambio de contraseña). */
  deleteSessionsForUser(userId: string): Promise<number>;

  /** Marca actividad reciente. Es best-effort: no afecta a la caducidad absoluta. */
  touchSession(sessionId: string, at: Date): Promise<void>;

  /** Barrido de sesiones caducadas (lo invocará el scheduler). */
  deleteExpiredSessions(now: Date): Promise<number>;
}
