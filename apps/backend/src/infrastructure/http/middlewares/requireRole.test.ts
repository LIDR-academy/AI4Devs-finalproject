import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app.js';

describe('requireRole — Autorización por rol (Guard 15, dimensión de rol)', () => {
  // TK-066: literal sintético solo para firmar JWTs contra una instancia de createApp()
  // creada in-process en el propio test — nunca un secreto real ni usado en producción.
  // Mismo hallazgo ya documentado como falso positivo para gitleaks en TK-044.
  const secret = 'test-secret-key-role-12345';

  it('rechaza con 403 Forbidden a un usuario autenticado con rol KITCHEN_STAFF en /api/v1/reports/waste (solo ADMIN)', async () => {
    const app = createApp({ jwtSecret: secret });
    // nosemgrep: javascript.jsonwebtoken.security.jwt-hardcode.hardcoded-jwt-secret
    const token = jwt.sign({ sub: 'usr-2', name: 'Cocinero', role: 'KITCHEN_STAFF' }, secret, { expiresIn: '1h' });

    const response = await request(app)
      .get('/api/v1/reports/waste')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('title', 'ForbiddenException');
  });

  it('permite acceso con 200 a un usuario autenticado con rol ADMIN en /api/v1/reports/waste', async () => {
    const app = createApp({ jwtSecret: secret });
    // nosemgrep: javascript.jsonwebtoken.security.jwt-hardcode.hardcoded-jwt-secret
    const token = jwt.sign({ sub: 'usr-1', name: 'Admin', role: 'ADMIN' }, secret, { expiresIn: '1h' });

    const response = await request(app)
      .get('/api/v1/reports/waste?startDate=2026-01-01&endDate=2026-01-31')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});
