import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';

/**
 * TK-117 (AUDIT-SEC-002, US-015 Escenario 3): hasta este ticket, `/api/v1/roles`
 * (crear rol, reasignar permisos, eliminar, e incluso las lecturas) no verificaba
 * rol ni permiso alguno — solo autenticación. Cualquier usuario logueado, incluido
 * KITCHEN_STAFF, podía reescribir los permisos de cualquier rol (incluido ADMIN).
 */
describe('TK-117: RBAC en /api/v1/roles — antes sin ningún guard de rol/permiso', () => {
  const secret = 'test-secret-roles-rbac-12345';
  const app = () => createApp({ jwtSecret: secret });

  const tokenFor = (role: string): string =>
    jwt.sign({ sub: `usr-${role}`, name: role, role }, secret, { expiresIn: '1h' });

  it('KITCHEN_STAFF recibe 403 al intentar reescribir los permisos de un rol (antes pasaba)', async () => {
    const res = await request(app())
      .put('/api/v1/roles/role-admin/permissions')
      .set('Authorization', `Bearer ${tokenFor('KITCHEN_STAFF')}`)
      .send({ permissionIds: ['perm-1'] });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('title', 'ForbiddenException');
  });

  it('KITCHEN_STAFF recibe 403 al intentar crear un rol nuevo (antes pasaba)', async () => {
    const res = await request(app())
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${tokenFor('KITCHEN_STAFF')}`)
      .send({ name: 'ROL_COLADO', permissionIds: ['perm-8'] });

    expect(res.status).toBe(403);
  });

  it('KITCHEN_STAFF recibe 403 incluso para leer la lista de roles (antes pasaba)', async () => {
    const res = await request(app())
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${tokenFor('KITCHEN_STAFF')}`);

    expect(res.status).toBe(403);
  });

  it('un rol desconocido (sin roles:manage) recibe 403 en las 5 rutas de /roles', async () => {
    const t = `Bearer ${tokenFor('UNASSIGNED')}`;
    const attempts: Array<[string, 'get' | 'post' | 'put' | 'delete', object?]> = [
      ['/api/v1/roles', 'get'],
      ['/api/v1/roles/permissions', 'get'],
      ['/api/v1/roles', 'post', { name: 'X' }],
      ['/api/v1/roles/role-admin/permissions', 'put', { permissionIds: [] }],
      ['/api/v1/roles/role-admin', 'delete'],
    ];
    for (const [path, method, body] of attempts) {
      const res = await request(app())[method](path).set('Authorization', t).send(body);
      expect(res.status, `${method.toUpperCase()} ${path} debe ser 403`).toBe(403);
    }
  });

  it('ADMIN sigue con acceso total (sin regresión)', async () => {
    const res = await request(app())
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${tokenFor('ADMIN')}`);

    expect(res.status).toBe(200);
  });
});
