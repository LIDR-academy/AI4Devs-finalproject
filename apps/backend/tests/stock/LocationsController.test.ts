import { describe, it, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryLocationRepository } from '../../src/infrastructure/stock/repositories/InMemoryLocationRepository.js';

describe('Storage Locations API — Sectores Físicos (TK-074)', () => {
  const app = createApp({ requireAuth: false });

  it('GET /api/v1/locations — Deberia listar los sectores de almacenamiento', async () => {
    const res = await request(app).get('/api/v1/locations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('type');
  });

  it('POST /api/v1/locations — Deberia registrar un nuevo sector de bodega o cocina', async () => {
    const res = await request(app)
      .post('/api/v1/locations')
      .send({
        name: 'CAMARA_CONGELADOS',
        type: 'WAREHOUSE',
        description: 'Cámara de frío de congelados -18C',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('CAMARA_CONGELADOS');
    expect(res.body.type).toBe('WAREHOUSE');
  });

  it('POST /api/v1/locations — payload inválido responde RFC 7807 (400 ValidationError)', async () => {
    const res = await request(app).post('/api/v1/locations').send({ name: 'x', type: 'GARAGE' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('title', 'ValidationError');
    expect(res.body).toHaveProperty('status', 400);
    expect(res.body).toHaveProperty('detail');
  });

  it('DELETE /api/v1/locations/:id — responde 204 No Content', async () => {
    const created = await request(app)
      .post('/api/v1/locations')
      .send({ name: 'SECTOR_TEMPORAL', type: 'KITCHEN' });
    const res = await request(app).delete(`/api/v1/locations/${created.body.id}`);
    expect(res.status).toBe(204);
  });

  it('PUT /api/v1/locations/:id — sector inexistente responde 404 (RFC 7807)', async () => {
    const res = await request(app)
      .put('/api/v1/locations/loc-inexistente')
      .send({ isActive: false });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('title', 'EntityNotFoundException');
  });
});

describe('Storage Locations API — RBAC por ruta (TK-074, patrón TK-093)', () => {
  const secret = 'test-secret-locations-rbac-12345';
  const tokenFor = (role: string): string =>
    jwt.sign({ sub: `usr-${role}`, name: role, role }, secret, { expiresIn: '1h' });

  const makeApp = () =>
    createApp({ jwtSecret: secret, locationRepository: new InMemoryLocationRepository() });

  it('GET es accesible a cualquier rol autenticado (KITCHEN_STAFF)', async () => {
    const res = await request(makeApp())
      .get('/api/v1/locations')
      .set('Authorization', `Bearer ${tokenFor('KITCHEN_STAFF')}`);
    expect(res.status).toBe(200);
  });

  it('KITCHEN_STAFF recibe 403 en POST / PUT / DELETE', async () => {
    const app = makeApp();
    const t = `Bearer ${tokenFor('KITCHEN_STAFF')}`;

    const post = await request(app).post('/api/v1/locations').set('Authorization', t).send({ name: 'NUEVO', type: 'WAREHOUSE' });
    expect(post.status).toBe(403);
    expect(post.body).toHaveProperty('title', 'ForbiddenException');

    const put = await request(app).put('/api/v1/locations/loc-1').set('Authorization', t).send({ isActive: false });
    expect(put.status).toBe(403);

    const del = await request(app).delete('/api/v1/locations/loc-1').set('Authorization', t);
    expect(del.status).toBe(403);
  });

  it('ADMIN puede crear, editar y eliminar sectores', async () => {
    const app = makeApp();
    const t = `Bearer ${tokenFor('ADMIN')}`;

    const post = await request(app).post('/api/v1/locations').set('Authorization', t).send({ name: 'CAMARA_ADMIN', type: 'WAREHOUSE' });
    expect(post.status).toBe(201);
    const id = post.body.id;

    const put = await request(app).put(`/api/v1/locations/${id}`).set('Authorization', t).send({ isActive: false });
    expect(put.status).toBe(200);
    expect(put.body.isActive).toBe(false);

    const del = await request(app).delete(`/api/v1/locations/${id}`).set('Authorization', t);
    expect(del.status).toBe(204);
  });
});
