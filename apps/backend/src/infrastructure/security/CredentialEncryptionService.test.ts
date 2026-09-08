import { describe, it, expect, afterEach } from 'vitest';
import { CredentialEncryptionService, resolveEncryptionMasterSecret } from './CredentialEncryptionService.js';

describe('CredentialEncryptionService', () => {
  const masterKey = 'test-master-secret-key-at-least-32-chars-long!';
  const service = new CredentialEncryptionService(masterKey);

  it('encrypts and decrypts a plain text secret accurately', () => {
    const secret = 'ai-secret-key-12345-abcdef';
    const encrypted = service.encrypt(secret);

    expect(encrypted).not.toBe(secret);
    expect(encrypted.split(':')).toHaveLength(3); // iv:authTag:cipher

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(secret);
  });

  it('produces different ciphertexts for the same plaintext due to random IV', () => {
    const secret = 'same-secret-different-iv';
    const enc1 = service.encrypt(secret);
    const enc2 = service.encrypt(secret);

    expect(enc1).not.toBe(enc2);
    expect(service.decrypt(enc1)).toBe(secret);
    expect(service.decrypt(enc2)).toBe(secret);
  });

  it('fails decryption if ciphertext is tampered with', () => {
    const encrypted = service.encrypt('sensitive-data');
    const parts = encrypted.split(':');
    const tampered = `${parts[0]}:${parts[1]}:deadbeef`;

    expect(() => service.decrypt(tampered)).toThrow();
  });
});

describe('AUDIT-SEC-004: resolveEncryptionMasterSecret', () => {
  const origKey = process.env.ENCRYPTION_KEY;
  const origEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (origKey === undefined) delete process.env.ENCRYPTION_KEY;
    else process.env.ENCRYPTION_KEY = origKey;
    process.env.NODE_ENV = origEnv;
  });

  it('usa ENCRYPTION_KEY cuando está definida (nunca JWT_SECRET)', () => {
    process.env.ENCRYPTION_KEY = 'dedicated-encryption-key-value';
    process.env.JWT_SECRET = 'a-completely-different-jwt-secret';
    expect(resolveEncryptionMasterSecret()).toBe('dedicated-encryption-key-value');
  });

  it('LANZA en producción si ENCRYPTION_KEY no está definida (sin fallback silencioso)', () => {
    delete process.env.ENCRYPTION_KEY;
    process.env.NODE_ENV = 'production';
    expect(() => resolveEncryptionMasterSecret()).toThrow(/ENCRYPTION_KEY/);
  });

  it('fuera de producción cae a una constante explícitamente marcada como dev-only', () => {
    delete process.env.ENCRYPTION_KEY;
    process.env.NODE_ENV = 'development';
    expect(resolveEncryptionMasterSecret()).toMatch(/DEV-ONLY/);
  });
});
