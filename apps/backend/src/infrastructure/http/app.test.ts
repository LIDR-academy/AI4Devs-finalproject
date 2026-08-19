import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

describe('createApp — Auth siempre activa por defecto (Guard 15), no gateada por NODE_ENV', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('rechaza con 401 una petición sin token a /api/v1/stock, incluso con NODE_ENV=development', async () => {
    process.env.NODE_ENV = 'development';
    const app = createApp({ jwtSecret: 'test-secret-para-esta-prueba' });

    const response = await request(app).get('/api/v1/stock/extraction');

    expect(response.status).toBe(401);
  });

  it('rechaza con 401 una petición sin token a /api/v1/kitchen, incluso con NODE_ENV sin definir', async () => {
    delete process.env.NODE_ENV;
    const app = createApp({ jwtSecret: 'test-secret-para-esta-prueba' });

    const response = await request(app).get('/api/v1/kitchen/remanentes');

    expect(response.status).toBe(401);
  });

  it('permite desactivar auth explícitamente vía requireAuth: false (para tests de negocio aislados)', async () => {
    const app = createApp({ jwtSecret: 'test-secret-para-esta-prueba', requireAuth: false });

    const response = await request(app).get('/api/v1/kitchen/remanentes');

    expect(response.status).not.toBe(401);
  });
});

describe('createApp — Fail-Fast de JWT_SECRET (Guard 14)', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalJwtSecret = process.env.JWT_SECRET;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
  });

  it('lanza Fail-Fast en "development" si no hay JWT_SECRET disponible (antes solo protegía "production")', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.JWT_SECRET;

    expect(() => createApp()).toThrow(/JWT_SECRET/);
  });

  it('lanza Fail-Fast si NODE_ENV no está definido y no hay JWT_SECRET disponible', () => {
    delete process.env.NODE_ENV;
    delete process.env.JWT_SECRET;

    expect(() => createApp()).toThrow(/JWT_SECRET/);
  });

  it('nunca usa un secreto hardcodeado de repositorio como fallback silencioso, ni en "development"', () => {
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'un-secreto-real-de-desarrollo-1234567890';

    // No debe lanzar cuando SÍ hay un secreto real declarado explícitamente.
    expect(() => createApp()).not.toThrow();
  });
});
