import crypto from 'node:crypto';

export class CredentialEncryptionService {
  private readonly key: Buffer;

  constructor(masterSecret?: string) {
    const rawSecret = masterSecret ?? process.env.ENCRYPTION_KEY ?? process.env.JWT_SECRET ?? 'fallback-insecure-seed-key-32-chars!!';
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
