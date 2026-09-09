import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryUserRepository } from '../../src/infrastructure/auth/repositories/InMemoryUserRepository.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { User } from '../../src/domain/auth/entities/User.js';
import { Pin } from '../../src/domain/auth/value-objects/Pin.js';

/**
 * AUDIT-SEC-003 / TK-132: el rate limiter debe agrupar por la IP REAL del cliente
 * (tomada de `X-Forwarded-For` cuando el peer es un proxy de confianza), nunca por la
 * IP del contenedor de nginx compartida por todos. supertest conecta desde loopback
 * (`127.0.0.1`), que está en la lista de `trust proxy`, así que el `X-Forwarded-For`
 * que fijamos aquí es el que ve `req.ip`.
 */
describe('AUDIT-SEC-003 / TK-132: rate limiting por cliente real', () => {
  const jwtSecret = 'test_jwt_secret_key_123456';
  let userRepo: InMemoryUserRepository;
  let stockRepo: InMemoryStockRepository;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    userRepo.seedUser(
      new User({
        id: 'usr-1',
        name: 'Op',
        role: 'KITCHEN_STAFF',
        pin: Pin.createFromRaw('1234'),
        status: 'ACTIVE',
        failedAttempts: 0,
      })
    );
    stockRepo = new InMemoryStockRepository();
  });

  function buildApp(overrides = {}) {
    return createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret, ...overrides });
  }

  it('el limiter de login corta al superar el máximo para una misma IP reenviada', async () => {
    const app = buildApp({ loginRateLimit: { windowMs: 60_000, max: 3 } });

    for (let i = 0; i < 3; i++) {
      const ok = await request(app)
        .post('/api/v1/auth/login-pin')
        .set('X-Forwarded-For', '203.0.113.7')
        .send({ userId: 'usr-1', pin: '9999' }); // PIN incorrecto: 401, pero cuenta contra el limiter
      expect(ok.status).not.toBe(429);
    }

    const blocked = await request(app)
      .post('/api/v1/auth/login-pin')
      .set('X-Forwarded-For', '203.0.113.7')
      .send({ userId: 'usr-1', pin: '9999' });

    expect(blocked.status).toBe(429);
    expect(blocked.body.title).toBe('TooManyRequestsException');
    expect(blocked.body.detail).toMatch(/Reintente en \d+ segundos/);
    expect(blocked.headers['retry-after']).toBeDefined();
  });

  it('dos clientes con IP reenviada distinta NO comparten el contador', async () => {
    const app = buildApp({ loginRateLimit: { windowMs: 60_000, max: 2 } });

    // Cliente A agota su cuota.
    for (let i = 0; i < 3; i++) {
      await request(app).post('/api/v1/auth/login-pin').set('X-Forwarded-For', '198.51.100.1').send({ userId: 'usr-1', pin: '9999' });
    }
    const aBlocked = await request(app).post('/api/v1/auth/login-pin').set('X-Forwarded-For', '198.51.100.1').send({ userId: 'usr-1', pin: '9999' });
    expect(aBlocked.status).toBe(429);

    // Cliente B, IP distinta: su primer intento pasa (no hereda el bloqueo de A).
    const bFirst = await request(app).post('/api/v1/auth/login-pin').set('X-Forwarded-For', '198.51.100.2').send({ userId: 'usr-1', pin: '1234' });
    expect(bFirst.status).toBe(200);
  });

  it('el limiter global corta /api/v1/* al superar el máximo, y /health nunca se limita', async () => {
    const app = buildApp({ rateLimit: { windowMs: 60_000, max: 2 } });
    const token = (
      await request(app).post('/api/v1/auth/login-pin').set('X-Forwarded-For', '198.51.100.9').send({ userId: 'usr-1', pin: '1234' })
    ).body.accessToken;

    // El login de arriba ya consumió 1. Una petición más → 2 (ok), la siguiente → 429.
    const r2 = await request(app).get('/api/v1/stock/insumos').set('X-Forwarded-For', '198.51.100.9').set('Authorization', `Bearer ${token}`);
    expect(r2.status).not.toBe(429);
    const r3 = await request(app).get('/api/v1/stock/insumos').set('X-Forwarded-For', '198.51.100.9').set('Authorization', `Bearer ${token}`);
    expect(r3.status).toBe(429);

    // /health está montado antes del limiter → nunca 429.
    for (let i = 0; i < 5; i++) {
      const h = await request(app).get('/health').set('X-Forwarded-For', '198.51.100.9');
      expect(h.status).toBe(200);
    }
  });
});
