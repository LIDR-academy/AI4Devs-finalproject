import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';

/**
 * TK-117 (US-015 Escenario 1, la mitad que faltaba): crear un rol personalizado con
 * una matriz de permisos ya funcionaba (`TK-073`), pero ese rol quedaba inutilizable
 * en la práctica — ninguna ruta de negocio verificaba permiso alguno, solo el nombre
 * literal `ADMIN`/`KITCHEN_STAFF` (`requireRole`). Este test prueba el objetivo real
 * de `US-015`: un rol creado dinámicamente, con solo el permiso que le corresponde,
 * puede ejercerlo — y solo ese.
 */
describe('TK-117: un rol personalizado con permisos otorgados ahora funciona en rutas reales', () => {
  const secret = 'test-secret-custom-role-12345';
  const app = createApp({ jwtSecret: secret });

  const adminToken = jwt.sign({ sub: 'usr-admin', name: 'Admin', role: 'ADMIN' }, secret, { expiresIn: '1h' });

  it('un rol nuevo con solo reports:view accede a /reports/waste y nada más', async () => {
    const createRes = await request(app)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'AUDITOR_SOLO_REPORTES', permissionIds: ['perm-6'] });
    expect(createRes.status).toBe(201);

    const auditorToken = jwt.sign({ sub: 'usr-auditor', name: 'Auditor', role: 'AUDITOR_SOLO_REPORTES' }, secret, {
      expiresIn: '1h',
    });

    const reportsRes = await request(app).get('/api/v1/reports/waste').set('Authorization', `Bearer ${auditorToken}`);
    expect(reportsRes.status).not.toBe(403);

    // Sin `roles:manage` ni `stock:extract` — sigue sin acceso a lo que no le corresponde.
    const rolesRes = await request(app).get('/api/v1/roles').set('Authorization', `Bearer ${auditorToken}`);
    expect(rolesRes.status).toBe(403);

    const extractionRes = await request(app)
      .post('/api/v1/stock/extraction')
      .set('Authorization', `Bearer ${auditorToken}`)
      .send({ insumoId: 'ins-1', quantity: '1.000', toStorageLocationId: 'loc-1' });
    expect(extractionRes.status).toBe(403);
  });
});
