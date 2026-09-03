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
});
