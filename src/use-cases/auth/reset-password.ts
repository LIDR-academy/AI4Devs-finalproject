import { hashResetToken, isResetTokenUsable } from "@/domain/auth/password-reset";
import { hashPassword } from "@/domain/auth/password";
import { ResetTokenInvalidError } from "@/domain/errors";
import type { AuthRepository } from "@/repositories/auth.repository";
import type { PasswordResetRepository } from "@/repositories/password-reset.repository";
import type { Emitter } from "@/use-cases/notifications/notify";

export interface ResetPasswordDeps {
  auth: AuthRepository;
  resets: PasswordResetRepository;
  emit?: Emitter;
  now?: () => Date;
}

export interface ResetPasswordInput {
  /** Token en claro, tal como llega en la URL del correo. */
  token: string;
  password: string;
}

export interface ResetPasswordResult {
  /** Sesiones cerradas al cambiar la contraseña. Se devuelve para poder registrarlo. */
  revokedSessions: number;
}

/**
 * Consume un enlace de restablecimiento y fija la contraseña nueva.
 *
 * Caducado, ya gastado o inexistente lanzan **el mismo** error: quien lo sufre no gana
 * nada sabiendo cuál de los tres es, y distinguirlos convertiría el endpoint en un
 * oráculo para sondear tokens.
 */
export async function resetPassword(
  { auth, resets, emit, now = () => new Date() }: ResetPasswordDeps,
  input: ResetPasswordInput
): Promise<ResetPasswordResult> {
  const at = now();
  const stored = await resets.findByTokenHash(hashResetToken(input.token));

  if (!stored || !isResetTokenUsable(stored, at)) {
    throw new ResetTokenInvalidError();
  }

  // El token se gasta **antes** de tocar la contraseña, y con un CAS: si dos peticiones
  // llegan con el mismo enlace, solo una gana el `UPDATE … WHERE usedAt IS NULL` y la
  // otra ve aquí el mismo error que un enlace caducado.
  if (!(await resets.consume({ tokenId: stored.id, at }))) {
    throw new ResetTokenInvalidError();
  }

  await resets.updatePassword({
    userId: stored.userId,
    passwordHash: await hashPassword(input.password),
  });

  // Quien restablece o ha olvidado la contraseña, o sospecha que alguien más entró.
  // En los dos casos, dejar vivas las sesiones abiertas sería dejar dentro justo a
  // quien se quiere echar (design.md §5).
  const revokedSessions = await auth.deleteSessionsForUser(stored.userId);

  await emit?.({ type: "password.changed", userId: stored.userId, tokenId: stored.id });

  return { revokedSessions };
}
