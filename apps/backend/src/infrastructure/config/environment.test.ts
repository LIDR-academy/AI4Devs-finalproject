import { describe, it, expect } from 'vitest';
import { getEnvironment } from './environment.js';

const PROD_BASE = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://u:p@db:5432/restostock?schema=public',
  JWT_SECRET: 'a-real-production-jwt-secret-of-32-plus-chars',
  CORS_ALLOWED_ORIGINS: 'https://app.restostock.com',
  CLIENT_ORIGIN: 'https://app.restostock.com',
  ENCRYPTION_KEY: 'a-dedicated-encryption-key-distinct-from-jwt',
};

describe('AUDIT-SEC-004: fail-fast de ENCRYPTION_KEY y CLIENT_ORIGIN en producción', () => {
  it('acepta una config de producción completa y coherente', () => {
    expect(() => getEnvironment(PROD_BASE)).not.toThrow();
  });

  it('ABORTA si falta ENCRYPTION_KEY en producción', () => {
    const env = { ...PROD_BASE, ENCRYPTION_KEY: undefined };
    expect(() => getEnvironment(env)).toThrow(/ENCRYPTION_KEY/);
  });

  it('ABORTA si ENCRYPTION_KEY es igual a JWT_SECRET (reutilización de clave)', () => {
    expect(() => getEnvironment({ ...PROD_BASE, ENCRYPTION_KEY: PROD_BASE.JWT_SECRET })).toThrow(/independientes|JWT_SECRET/);
  });

  it('no exige CLIENT_ORIGIN si CORS_ALLOWED_ORIGINS es un allowlist concreto', () => {
    expect(() => getEnvironment({ ...PROD_BASE, CLIENT_ORIGIN: undefined })).not.toThrow();
  });

  it('trata CLIENT_ORIGIN vacío (docker-compose ${VAR:-}) como ausente, no como URL inválida', () => {
    expect(() => getEnvironment({ ...PROD_BASE, CLIENT_ORIGIN: '' })).not.toThrow();
  });

  it('trata ENCRYPTION_KEY vacío como ausente → aborta por obligatorio, no por longitud', () => {
    expect(() => getEnvironment({ ...PROD_BASE, ENCRYPTION_KEY: '' })).toThrow(/ENCRYPTION_KEY es obligatorio/);
  });

  it('en desarrollo no exige ENCRYPTION_KEY', () => {
    expect(() =>
      getEnvironment({
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://u:p@localhost:5432/dev?schema=public',
        JWT_SECRET: 'dev-secret-16-chars-min',
      })
    ).not.toThrow();
  });
});
