import { hashPassword, verifyPassword } from "@/domain/auth/password";
import {
  generateSessionToken,
  hashSessionToken,
  sessionExpiresAt,
} from "@/domain/auth/session";
import { ForbiddenError, UnauthenticatedError } from "@/domain/errors";
import type { AuthRepository, AuthUser } from "@/repositories/auth.repository";

export interface AuthDeps {
  repository: AuthRepository;
  /** Reloj inyectable: los tests fijan el instante sin tocar el reloj del sistema. */
  now?: () => Date;
}

export interface LoginInput {
  email: string;
  password: string;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export interface LoginResult {
  /** Token en claro. Es lo único que se entrega al cliente; no se persiste. */
  token: string;
  expiresAt: Date;
  user: AuthUser;
}

/** El email es identificador, no texto libre: se compara normalizado. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Inicia sesión y crea una sesión server-side (ADR-0002 §1).
 *
 * Email desconocido y contraseña incorrecta devuelven **el mismo** error y consumen
 * el mismo trabajo de CPU, para que el login no sirva de oráculo para enumerar
 * cuentas — ni por el mensaje ni por el tiempo de respuesta.
 */
export async function login(
  { repository, now = () => new Date() }: AuthDeps,
  input: LoginInput
): Promise<LoginResult> {
  const email = normalizeEmail(input.email);
  const user = await repository.findUserByEmail(email);

  if (!user) {
    // Hashear a la basura cuesta lo mismo que verificar: iguala el tiempo de
    // respuesta con el del camino "usuario existe, contraseña mal".
    await hashPassword(input.password);
    throw new UnauthenticatedError();
  }

  if (!(await verifyPassword(user.passwordHash, input.password))) {
    throw new UnauthenticatedError();
  }

  // Solo después de acreditar la identidad se explica el estado de la cuenta: a
  // estas alturas quien pregunta ya ha demostrado ser el titular.
  if (user.status === "SUSPENDED") {
    throw new ForbiddenError("Tu cuenta está suspendida. Contacta con soporte.");
  }

  const issuedAt = now();
  const token = generateSessionToken();
  const expiresAt = sessionExpiresAt(issuedAt);

  await repository.createSession({
    userId: user.id,
    tokenHash: hashSessionToken(token),
    expiresAt,
    userAgent: input.userAgent ?? null,
    ipAddress: input.ipAddress ?? null,
  });

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { token, expiresAt, user: safeUser };
}
