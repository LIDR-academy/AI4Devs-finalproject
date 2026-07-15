import crypto from "node:crypto";
import type { EncryptionService } from "../../domain/ports/EncryptionService.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

export class Aes256GcmEncryptionService implements EncryptionService {
  private readonly key: Buffer;

  constructor(key: string) {
    const buf = Buffer.from(key, "utf8");
    if (buf.length !== 32) {
      throw new Error("Encryption key must be exactly 32 characters");
    }
    this.key = buf;
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted data format");
    }
    const iv = Buffer.from(parts[0], "hex");
    const tag = Buffer.from(parts[1], "hex");
    const encrypted = Buffer.from(parts[2], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  }
}
