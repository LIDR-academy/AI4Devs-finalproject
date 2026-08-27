import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';

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
});
