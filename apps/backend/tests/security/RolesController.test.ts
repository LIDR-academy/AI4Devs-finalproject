import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';

describe('Roles & Permissions API — Dynamic RBAC (TK-073)', () => {
  const app = createApp({ requireAuth: false });

  it('GET /api/v1/roles — Deberia obtener la lista de roles con sus permisos', async () => {
    const res = await request(app).get('/api/v1/roles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('permissions');
  });

  it('GET /api/v1/roles/permissions — Deberia obtener el catalogo maestro de permisos', async () => {
    const res = await request(app).get('/api/v1/roles/permissions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((p: { code: string }) => p.code === 'stock:extract')).toBe(true);
  });

  it('POST /api/v1/roles — Deberia crear un nuevo rol dinámico', async () => {
    const res = await request(app)
      .post('/api/v1/roles')
      .send({
        name: 'OPERATIVO_NOCTURNO',
        description: 'Personal de turno nocturno',
        permissionIds: ['perm-1', 'perm-4'],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('OPERATIVO_NOCTURNO');
  });
});
