import request from 'supertest';
import express from 'express';
import { app } from '../app';


describe('US-016-TASK-03: Swagger UI guard de entorno', () => {
  it('GET /api/docs/ devuelve 200 con NODE_ENV=test (entorno dev/test)', async () => {
    // swagger-ui-express redirige /docs → /docs/ (301); probamos la URL canónica directamente
    const res = await request(app).get('/api/docs/');
    expect(res.status).toBe(200);
  });

  it('GET /api/docs devuelve 404 con NODE_ENV=production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    let prodApp: import('express').Express;
    jest.isolateModules(() => {
      // Re-carga app con NODE_ENV=production para que el guard se evalúe
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      prodApp = (require('../app') as { app: import('express').Express }).app;
    });

    const res = await request(prodApp!).get('/api/docs');
    expect(res.status).toBe(404);

    process.env.NODE_ENV = originalEnv;
  });

  it('GET /api/docs.json devuelve 404 con NODE_ENV=production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    let prodApp: import('express').Express;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      prodApp = (require('../app') as { app: import('express').Express }).app;
    });

    const res = await request(prodApp!).get('/api/docs.json');
    expect(res.status).toBe(404);

    process.env.NODE_ENV = originalEnv;
  });
});

describe('US-016-TASK-02: trust proxy y body limit', () => {
  it('POST /api/cart con body > 10 KB devuelve 413', async () => {
    const largeBody = JSON.stringify({ productId: 'x', quantity: 1, padding: 'A'.repeat(11 * 1024) });
    const res = await request(app)
      .post('/api/cart')
      .set('Content-Type', 'application/json')
      .send(largeBody);
    expect(res.status).toBe(413);
  });

  it('req.ip refleja X-Forwarded-For cuando trust proxy está activo', async () => {
    const testApp = express();
    testApp.set('trust proxy', 1);
    testApp.get('/ip', (req, res) => res.json({ ip: req.ip }));
    const res = await request(testApp)
      .get('/ip')
      .set('X-Forwarded-For', '5.5.5.5');
    expect(res.body.ip).toBe('5.5.5.5');
  });
});

describe('US-016-TASK-01: Security headers (helmet)', () => {
  it('emite X-Frame-Options: DENY', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  it('emite X-Content-Type-Options: nosniff', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('emite Strict-Transport-Security', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  it('emite Referrer-Policy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['referrer-policy']).toBeDefined();
  });
});

describe('US-016-TASK-04: 404 sin eco del path', () => {
  it('GET /api/ruta-inexistente devuelve {"error":"Not found"}', async () => {
    const res = await request(app).get('/api/ruta-inexistente');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('el body 404 no contiene el path del request', async () => {
    const res = await request(app).get('/api/ruta-inexistente');
    expect(res.body.error).not.toContain('/api/ruta-inexistente');
  });

  it('el body 404 no contiene el método HTTP', async () => {
    const res = await request(app).get('/api/ruta-inexistente');
    expect(res.body.error).not.toContain('GET');
  });
});

describe('US-000-TASK-05: Middleware stack', () => {
  describe('error handler', () => {
    it('returns generic error without stack trace for unknown route', async () => {
      const res = await request(app).get('/nonexistent-route');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
      expect(res.body).not.toHaveProperty('stack');
    });

    it('returns JSON error body for unknown route', async () => {
      const res = await request(app).get('/api/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeTruthy();
    });
  });

  describe('CORS middleware', () => {
    it('sets Access-Control-Allow-Origin header', async () => {
      const res = await request(app)
        .get('/nonexistent-route')
        .set('Origin', 'http://localhost:3000');
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('rate limiter', () => {
    it('returns 429 after exceeding mutation limit', async () => {
      const testApp = express();
      const { mutationLimiter } = await import('./rate-limit');
      testApp.use(mutationLimiter);
      testApp.post('/test', (_req, res) => res.json({ ok: true }));

      const requests = Array.from({ length: 21 }, () =>
        request(testApp).post('/test')
      );
      const responses = await Promise.all(requests);
      const tooMany = responses.filter(r => r.status === 429);
      expect(tooMany.length).toBeGreaterThan(0);
    });
  });
});
