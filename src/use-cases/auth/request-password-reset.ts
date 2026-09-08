import {
  generateResetToken,
  hashResetToken,
  resetExpiresAt,
  resetLink,
} from "@/domain/auth/password-reset";
import type { Mailer } from "@/mail/mailer";
import { passwordResetEmail } from "@/mail/messages";
import type { AuthRepository } from "@/repositories/auth.repository";
import type { PasswordResetRepository } from "@/repositories/password-reset.repository";
import { normalizeEmail } from "@/use-cases/auth/login";
import type { Emitter } from "@/use-cases/notifications/notify";

export interface RequestPasswordResetDeps {
  auth: AuthRepository;
  resets: PasswordResetRepository;
  mailer: Mailer;
  emit?: Emitter;
  /** Reloj inyectable: los tests fijan el instante sin tocar el del sistema. */
  now?: () => Date;
}

export interface RequestPasswordResetInput {
  email: string;
  /** Origen público desde el que se construye el enlace; lo resuelve la capa HTTP. */
  baseUrl: string;
  ipAddress?: string | null;
}

/**
 * Emite un enlace de restablecimiento y lo envía por correo.
 *
 * **Devuelve siempre lo mismo**: no hay valor de retorno que distinga "se envió" de
 * "esa dirección no tiene cuenta". El login lleva desde el primer día evitando ser un
 * oráculo para enumerar cuentas (ADR-0002 §1) y esta pantalla no puede deshacerlo
 * desde la puerta de al lado.
 *
 * Lo que **no** se iguala es el tiempo de respuesta: el camino con cuenta escribe una
 * fila y compone un mensaje. Es una diferencia conocida y aceptada (design.md §3).
 */
export async function requestPasswordReset(
  { auth, resets, mailer, emit, now = () => new Date() }: RequestPasswordResetDeps,
  input: RequestPasswordResetInput
): Promise<void> {
  const email = normalizeEmail(input.email);
  const user = await auth.findUserByEmail(email);

  // Sin cuenta no hay nada que enviar. Y a una cuenta suspendida tampoco: restablecer
  // no levanta la suspensión —el login la sigue rechazando después de verificar la
  // contraseña—, así que el enlace solo le haría perder el tiempo.
  if (!user || user.status !== "ACTIVE") return;

  const at = now();
  // Solo vale el último enlace: pedir uno nuevo gasta los anteriores (design.md §4).
  await resets.invalidateForUser({ userId: user.id, at });

  const token = generateResetToken();
  const expiresAt = resetExpiresAt(at);
  const stored = await resets.create({
    userId: user.id,
    tokenHash: hashResetToken(token),
    expiresAt,
    at,
    requestedIp: input.ipAddress ?? null,
  });

  try {
    await mailer.send(
      passwordResetEmail({
        to: user.email,
        fullName: user.fullName,
        link: resetLink(input.baseUrl, token),
        expiresAt,
      })
    );
  } catch (error) {
    // El enlace que nadie ha recibido no debe quedarse vivo una hora: se gasta.
    // Y el fallo **no** se propaga, porque un 500 solo para las direcciones que
    // existen delataría cuáles son (design.md §3).
    console.error("[auth] No se pudo enviar el enlace de restablecimiento:", error);
    await resets.invalidateForUser({ userId: user.id, at });
    return;
  }

  // Después del envío: el aviso es la constancia de que el enlace salió.
  await emit?.({
    type: "password-reset.requested",
    userId: user.id,
    tokenId: stored.id,
    expiresAt,
  });
}
