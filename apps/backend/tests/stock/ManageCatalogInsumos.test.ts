import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryUserRepository } from '../../src/infrastructure/auth/repositories/InMemoryUserRepository.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { User } from '../../src/domain/auth/entities/User.js';
import { Pin } from '../../src/domain/auth/value-objects/Pin.js';

describe('TK-057: Gestion de Catalogo Maestro (alta y listado de insumos)', () => {
  const secret = 'test-secret-key-manage-catalog-insumos';
  let userRepo: InMemoryUserRepository;
  let stockRepo: InMemoryStockRepository;
  let adminToken: string;
  let staffToken: string;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    userRepo.seedUser(
      new User({ id: 'usr-admin-1', name: 'Admin Seed', role: 'ADMIN', pin: Pin.createFromRaw('1234'), status: 'ACTIVE', failedAttempts: 0 })
    );
    stockRepo = new InMemoryStockRepository();
    adminToken = jwt.sign({ sub: 'usr-admin-1', name: 'Admin Seed', role: 'ADMIN' }, secret, { expiresIn: '1h' });
    staffToken = jwt.sign({ sub: 'usr-staff-1', name: 'Staff Seed', role: 'KITCHEN_STAFF' }, secret, { expiresIn: '1h' });
  });

  describe('POST /api/v1/stock/insumos', () => {
    it('ADMIN da de alta un insumo nuevo (201) con stock inicial en 0, y aparece en el listado', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/stock/insumos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Harina 000', unitOfMeasure: 'KG', storageLocationId: 'loc-1' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ name: 'Harina 000', unitOfMeasure: 'KG', warehouseStock: '0.000' });
      expect(response.body.id).toBeTruthy();

      const listResponse = await request(app).get('/api/v1/stock/insumos').set('Authorization', `Bearer ${adminToken}`);
      expect(listResponse.status).toBe(200);
      const listed = listResponse.body.find((i: { id: string }) => i.id === response.body.id);
      expect(listed).toMatchObject({ name: 'Harina 000', unitOfMeasure: 'KG' });
    });

    it('rechaza con 403 Forbidden si quien crea NO es ADMIN', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/stock/insumos')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ name: 'Intento No Autorizado', unitOfMeasure: 'KG' });

      expect(response.status).toBe(403);
    });

    it('rechaza con 401 Unauthorized sin token', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const response = await request(app).post('/api/v1/stock/insumos').send({ name: 'Sin Token', unitOfMeasure: 'KG' });

      expect(response.status).toBe(401);
    });

    it('rechaza con 400 si falta el nombre', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/stock/insumos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ unitOfMeasure: 'KG' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('title', 'ValidationError');
    });

    it('rechaza con 400 si la unidad de medida no es KG/L/UNITS', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const response = await request(app)
        .post('/api/v1/stock/insumos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Insumo Invalido', unitOfMeasure: 'KILOS' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('title', 'ValidationError');
    });
  });

  describe('GET /api/v1/stock/insumos', () => {
    it('retorna lista vacia si no hay insumos (repositorio limpio)', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const response = await request(app).get('/api/v1/stock/insumos').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('rechaza con 401 Unauthorized sin token', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const response = await request(app).get('/api/v1/stock/insumos');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/stock/insumos/:id/restock (US-013/TK-060)', () => {
    it('ADMIN reabastece un insumo existente (200) sumando la cantidad al stock actual', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const created = await request(app)
        .post('/api/v1/stock/insumos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Aceite de Oliva', unitOfMeasure: 'L', storageLocationId: 'loc-1' });

      const response = await request(app)
        .patch(`/api/v1/stock/insumos/${created.body.id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 20, storageLocationId: 'loc-1' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        insumoId: created.body.id,
        insumoName: 'Aceite de Oliva',
        quantityAdded: '20.000',
        newWarehouseStock: '20.000',
      });

      const listResponse = await request(app).get('/api/v1/stock/insumos').set('Authorization', `Bearer ${adminToken}`);
      const listed = listResponse.body.find((i: { id: string }) => i.id === created.body.id);
      expect(listed.warehouseStock).toBe('20.000');
    });

    it('rechaza con 404 si el insumo no existe', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const response = await request(app)
        .patch('/api/v1/stock/insumos/ins-inexistente/restock')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 5, storageLocationId: 'loc-1' });

      expect(response.status).toBe(404);
    });

    it('rechaza con 400 si la cantidad es cero o negativa', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const created = await request(app)
        .post('/api/v1/stock/insumos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Sal Fina', unitOfMeasure: 'KG', storageLocationId: 'loc-1' });

      const response = await request(app)
        .patch(`/api/v1/stock/insumos/${created.body.id}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 0, storageLocationId: 'loc-1' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('title', 'ValidationError');
    });

    it('rechaza con 403 Forbidden si quien reabastece NO es ADMIN', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const created = await request(app)
        .post('/api/v1/stock/insumos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Azucar Blanca', unitOfMeasure: 'KG', storageLocationId: 'loc-1' });

      const response = await request(app)
        .patch(`/api/v1/stock/insumos/${created.body.id}/restock`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ quantity: 5 });

      expect(response.status).toBe(403);
    });

    it('rechaza con 401 Unauthorized sin token', async () => {
      const app = createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

      const response = await request(app).patch('/api/v1/stock/insumos/ins-cualquiera/restock').send({ quantity: 5 });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/stock/insumos/:id (US-036/TK-130)', () => {
    const app = () => createApp({ userRepository: userRepo, stockRepository: stockRepo, jwtSecret: secret });

    async function createInsumo(body: Record<string, unknown>) {
      const res = await request(app())
        .post('/api/v1/stock/insumos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ unitOfMeasure: 'KG', storageLocationId: 'loc-1', ...body });
      return res.body.id as string;
    }

    it('Escenario 1: ADMIN edita name y fija unitCost (200), conservando unidad y stock', async () => {
      const id = await createInsumo({ name: 'Harina 00', initialWarehouseStock: '5.000' });

      const res = await request(app())
        .put(`/api/v1/stock/insumos/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Harina 000', unitCost: '820.00' });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id, name: 'Harina 000', unitCost: '820.00', unitOfMeasure: 'KG', warehouseStock: '5.000' });
    });

    it('Escenario 2: unitOfMeasure es inmutable → 400', async () => {
      const id = await createInsumo({ name: 'Sal' });
      const res = await request(app())
        .put(`/api/v1/stock/insumos/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ unitOfMeasure: 'L' });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('title', 'ValidationError');
    });

    it('Escenario 3: renombrar a un nombre ya usado → 409', async () => {
      await createInsumo({ name: 'Sal Fina' });
      const id2 = await createInsumo({ name: 'Sal Gruesa' });
      const res = await request(app())
        .put(`/api/v1/stock/insumos/${id2}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Sal Fina' });
      expect(res.status).toBe(409);
    });

    it('Escenario 3b: barcode ya usado por otro insumo → 409', async () => {
      await createInsumo({ name: 'Leche', barcode: '7791234567890' });
      const id2 = await createInsumo({ name: 'Crema' });
      const res = await request(app())
        .put(`/api/v1/stock/insumos/${id2}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ barcode: '7791234567890' });
      expect(res.status).toBe(409);
    });

    it('Escenario 4: KITCHEN_STAFF → 403; id inexistente → 404', async () => {
      const id = await createInsumo({ name: 'Azúcar' });
      const forbidden = await request(app())
        .put(`/api/v1/stock/insumos/${id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ name: 'Azúcar Rubia' });
      expect(forbidden.status).toBe(403);

      const notFound = await request(app())
        .put('/api/v1/stock/insumos/ins-fantasma')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'X' });
      expect(notFound.status).toBe(404);
    });

    it('Escenario 5: barcode:null limpia el código y conserva unitCost', async () => {
      const id = await createInsumo({ name: 'Café', barcode: '7790000000001', unitCost: '3500.00' });

      const res = await request(app())
        .put(`/api/v1/stock/insumos/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ barcode: null });

      expect(res.status).toBe(200);
      expect(res.body.barcode).toBeNull();
      expect(res.body.unitCost).toBe('3500.00');
    });

    it('rechaza con 401 sin token', async () => {
      const res = await request(app()).put('/api/v1/stock/insumos/ins-x').send({ name: 'Y' });
      expect(res.status).toBe(401);
    });
  });
});
