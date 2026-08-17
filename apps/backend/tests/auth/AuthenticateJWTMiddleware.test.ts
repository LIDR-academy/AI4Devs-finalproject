import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';

describe('Guard 14, 15 & 16: Security Middleware & Fail-Fast Validation TDD Suite', () => {
  const secret = 'test-secret-key-12345';

  it('debe rechazar acceso a rutas protegidas con 401 Unauthorized si no se incluye el token Bearer (Guard 15)', async () => {
    const app = createApp({ jwtSecret: secret, requireAuth: true });

    const response = await request(app).get('/api/v1/kitchen/remanentes-activos');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('type', 'https://restostock.com/errors/unauthorized');
    expect(response.body).toHaveProperty('title', 'UnauthorizedException');
    expect(response.body).toHaveProperty('status', 401);
  });

  it('debe permitir acceso a rutas protegidas con 200 OK cuando se provee un token JWT valido (Guard 15)', async () => {
    const app = createApp({ jwtSecret: secret, requireAuth: true });
    const token = jwt.sign({ sub: 'usr-1', name: 'Admin', role: 'ADMIN' }, secret, { expiresIn: '1h' });

    const response = await request(app)
      .get('/api/v1/kitchen/remanentes-activos')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('debe lanzar excepcion de configuracion Fail-Fast en produccion si falta JWT_SECRET (Guard 14)', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalJwt = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_SECRET;

      expect(() => createApp()).toThrow(/CONFIG FATAL: Variable de entorno JWT_SECRET es obligatoria/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.JWT_SECRET = originalJwt;
    }
  });

  it('debe bloquear peticiones excesivas en login con 429 Too Many Requests cuando se excede el limite (Guard 16)', async () => {
    const app = createApp({ jwtSecret: secret });

    // Enviar 11 peticiones a login-pin (el limite esta configurado en 10)
    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/v1/auth/login-pin').send({ userId: 'u-1', pin: '9999' });
    }

    const blockedResponse = await request(app).post('/api/v1/auth/login-pin').send({ userId: 'u-1', pin: '9999' });

    expect(blockedResponse.status).toBe(429);
    expect(blockedResponse.body).toHaveProperty('type', 'https://restostock.com/errors/too-many-requests');
    expect(blockedResponse.body).toHaveProperty('title', 'TooManyRequestsException');
  });
});
