import { describe, it, expect } from 'vitest';
import { CredentialEncryptionService } from './CredentialEncryptionService.js';

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
