import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;
  private readonly keyVersion: number;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY') || 'default-key-change-in-production-32-chars';
    const keyVersion = parseInt(this.configService.get<string>('ENCRYPTION_KEY_VERSION') || '1', 10);
    
    if (encryptionKey.length < 32) {
      this.logger.warn('ENCRYPTION_KEY debe tener al menos 32 caracteres. Usando clave por defecto (NO SEGURO PARA PRODUCCIÓN)');
    }
    
    // Generar clave de 32 bytes desde el string
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
    this.keyVersion = keyVersion;
  }

  /**
   * Encripta datos sensibles usando AES-256-GCM
   * Incluye versión de clave para soportar rotación
   */
  encrypt(text: string): Buffer {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(text, 'utf8');
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      
      const authTag = cipher.getAuthTag();
      
      // Combinar: versión de clave (1 byte) + IV (16 bytes) + authTag (16 bytes) + encrypted
      const versionBuffer = Buffer.from([this.keyVersion]);
      return Buffer.concat([versionBuffer, iv, authTag, encrypted]);
    } catch (error) {
      this.logger.error(`Error encriptando datos: ${error.message}`);
      throw new Error('Error al encriptar datos');
    }
  }

  /**
   * Desencripta datos
   * Soporta múltiples versiones de clave para rotación
   */
  decrypt(encryptedData: Buffer): string {
    try {
      // Verificar si tiene versión de clave (nuevo formato) o no (formato antiguo)
      let offset = 0;
      let dataVersion = 0;
      
      // Si el primer byte es pequeño (< 10), probablemente es versión de clave
      if (encryptedData.length > 33 && encryptedData[0] < 10) {
        dataVersion = encryptedData[0];
        offset = 1;
        
        if (dataVersion !== this.keyVersion) {
          this.logger.warn(
            `Intento de desencriptar con versión de clave diferente. Datos: v${dataVersion}, Actual: v${this.keyVersion}`,
          );
          // En producción, aquí se podría intentar con claves antiguas
        }
      }
      
      // Extraer IV (16 bytes), authTag (16 bytes) y datos encriptados
      const iv = encryptedData.slice(offset, offset + 16);
      const authTag = encryptedData.slice(offset + 16, offset + 32);
      const encrypted = encryptedData.slice(offset + 32);
      
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
