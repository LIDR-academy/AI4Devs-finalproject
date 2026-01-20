import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 'default-key-change-in-production-32-chars';
    
    if (encryptionKey.length < 32) {
      this.logger.warn('ENCRYPTION_KEY debe tener al menos 32 caracteres. Usando clave por defecto (NO SEGURO PARA PRODUCCIÓN)');
    }
    
    // Generar clave de 32 bytes desde el string
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  /**
   * Encripta datos sensibles usando AES-256-GCM
   */
  encrypt(text: string): Buffer {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      const authTag = cipher.getAuthTag();
      
      // Combinar IV + authTag + encrypted
      return Buffer.concat([iv, authTag, encrypted]);
    } catch (error) {
      this.logger.error(`Error encriptando datos: ${error.message}`);
      throw new Error('Error al encriptar datos');
    }
  }

  /**
   * Desencripta datos
   */
  decrypt(encryptedData: Buffer): string {
    try {
      // Extraer IV (16 bytes), authTag (16 bytes) y datos encriptados
      const iv = encryptedData.slice(0, 16);
      const authTag = encryptedData.slice(16, 32);
      const encrypted = encryptedData.slice(32);
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      return decrypted.toString('utf8');
    } catch (error) {
      this.logger.error(`Error desencriptando datos: ${error.message}`);
      throw new Error('Error al desencriptar datos');
    }
  }

  /**
   * Hash para búsqueda (no reversible)
   */
  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}
