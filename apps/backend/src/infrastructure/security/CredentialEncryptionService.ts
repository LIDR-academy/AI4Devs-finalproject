import crypto from 'node:crypto';
import { ICredentialCipher } from '../../domain/settings/gateways/ICredentialCipher.js';

// Constante SÓLO para desarrollo/test — es inalcanzable en producción: `getEnvironment()`
// (Guard 14) aborta el arranque si `ENCRYPTION_KEY` no está definida cuando NODE_ENV=production.
const DEV_ONLY_ENCRYPTION_KEY = 'DEV-ONLY-INSECURE-KEY — define ENCRYPTION_KEY en produccion';

/**
 * Resuelve el secreto maestro del cifrado de credenciales (AUDIT-SEC-004). Ya no cae a
 * `JWT_SECRET` (reutilización de clave) ni a una constante silenciosa: exige `ENCRYPTION_KEY`,
 * y en su ausencia sólo fuera de producción usa una constante explícitamente marcada.
 */
export function resolveEncryptionMasterSecret(): string {
  const configured = process.env.ENCRYPTION_KEY?.trim();
  if (configured) {
    return configured;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY es obligatorio en producción (AUDIT-SEC-004).');
  }
  return DEV_ONLY_ENCRYPTION_KEY;
}

export class CredentialEncryptionService implements ICredentialCipher {
  private readonly key: Buffer;

  constructor(masterSecret?: string) {
    const rawSecret = masterSecret ?? resolveEncryptionMasterSecret();
    // Deriva una clave de exactamente 32 bytes usando SHA-256
    this.key = crypto.createHash('sha256').update(rawSecret).digest();
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(12); // 96 bits recomendado para GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  decrypt(cipherText: string): string {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      throw new Error('Formato de texto cifrado inválido. Se esperaba iv:authTag:ciphertext');
    }

    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
