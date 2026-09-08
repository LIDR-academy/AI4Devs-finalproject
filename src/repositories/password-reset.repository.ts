/**
 * Puerto de persistencia del restablecimiento de contraseña (`accounts-roles` →
 * "Restablecimiento de contraseña por correo").
 */

/** Lo que hace falta saber de un enlace emitido. El token en claro no está aquí. */
export interface StoredResetToken {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface PasswordResetRepository {
  create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    at: Date;
    requestedIp?: string | null;
  }): Promise<StoredResetToken>;

  /**
   * Gasta los enlaces vivos de una cuenta. Se llama al emitir uno nuevo —solo vale el
   * último (design.md §4)— y también cuando el envío falla, para no dejar suelto un
   * token que nadie ha recibido.
   */
  invalidateForUser(input: { userId: string; at: Date }): Promise<number>;

  findByTokenHash(tokenHash: string): Promise<StoredResetToken | null>;

  /**
   * Marca el enlace como gastado **si no lo estaba ya**, y devuelve si este intento
   * fue el que lo gastó. Es un CAS: comprobarlo antes de escribir dejaría una ventana
   * para que dos peticiones simultáneas lo usaran las dos.
   */
  consume(input: { tokenId: string; at: Date }): Promise<boolean>;

  /** Sustituye el hash de la contraseña de la cuenta. */
  updatePassword(input: { userId: string; passwordHash: string }): Promise<void>;
}
