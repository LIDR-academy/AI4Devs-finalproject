import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryUserRepository } from '../../src/infrastructure/auth/repositories/InMemoryUserRepository.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRecipeRepository } from '../../src/infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { User } from '../../src/domain/auth/entities/User.js';
import { Pin } from '../../src/domain/auth/value-objects/Pin.js';
import { Insumo } from '../../src/domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';

describe('TK-069: Modulo Recipe independiente (alta y listado de recetas)', () => {
  const secret = 'test-secret-key-manage-recipes';
  let userRepo: InMemoryUserRepository;
  let stockRepo: InMemoryStockRepository;
  let recipeRepo: InMemoryRecipeRepository;
  let adminToken: string;
  let staffToken: string;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    userRepo.seedUser(
      new User({ id: 'usr-admin-1', name: 'Admin Seed', role: 'ADMIN', pin: Pin.createFromRaw('1234'), status: 'ACTIVE', failedAttempts: 0 })
    );
    stockRepo = new InMemoryStockRepository();
    stockRepo.seedInsumo(
      new Insumo({ id: 'ins-harina-1', name: 'Harina 000', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity(10) })
    );
    stockRepo.seedInsumo(
      new Insumo({ id: 'ins-salsa-1', name: 'Salsa Pomodoro', unitOfMeasure: 'L', warehouseStock: new DecimalQuantity(5) })
    );
    recipeRepo = new InMemoryRecipeRepository();
    adminToken = jwt.sign({ sub: 'usr-admin-1', name: 'Admin Seed', role: 'ADMIN' }, secret, { expiresIn: '1h' });
    staffToken = jwt.sign({ sub: 'usr-staff-1', name: 'Staff Seed', role: 'KITCHEN_STAFF' }, secret, { expiresIn: '1h' });
  });

  function buildApp() {
    return createApp({
      userRepository: userRepo,
      stockRepository: stockRepo,
      recipeRepository: recipeRepo,
      jwtSecret: secret,
    });
  }

  describe('POST /api/v1/recipes', () => {
    it('ADMIN da de alta una receta con ingredientes validos (201), y aparece en el listado', async () => {
      const app = buildApp();

      const response = await request(app)
        .post('/api/v1/recipes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Pizza Margarita',
          category: 'Pizzas',
          ingredients: [
            { insumoId: 'ins-harina-1', quantity: '0.150' },
            { insumoId: 'ins-salsa-1', quantity: '0.100' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.recipeId).toBeTruthy();

      const listResponse = await request(app).get('/api/v1/recipes').set('Authorization', `Bearer ${adminToken}`);
      expect(listResponse.status).toBe(200);
      const listed = listResponse.body.find((r: { id: string }) => r.id === response.body.recipeId);
      expect(listed).toMatchObject({ name: 'Pizza Margarita', category: 'Pizzas' });
      expect(listed.ingredients).toHaveLength(2);
    });

    it('rechaza con 404 Not Found si un ingrediente referencia un insumo inexistente', async () => {
      const app = buildApp();

      const response = await request(app)
        .post('/api/v1/recipes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Receta Invalida',
          category: 'Pizzas',
          ingredients: [{ insumoId: 'ins-inexistente', quantity: '0.100' }],
        });

      expect(response.status).toBe(404);

      const listResponse = await request(app).get('/api/v1/recipes').set('Authorization', `Bearer ${adminToken}`);
      expect(listResponse.body).toEqual([]);
    });

    it('rechaza con 403 Forbidden si quien crea NO es ADMIN', async () => {
      const app = buildApp();

      const response = await request(app)
        .post('/api/v1/recipes')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ name: 'Intento No Autorizado', category: 'Pizzas', ingredients: [{ insumoId: 'ins-harina-1', quantity: '0.100' }] });

      expect(response.status).toBe(403);
    });

    it('rechaza con 401 Unauthorized sin token', async () => {
      const app = buildApp();

      const response = await request(app)
        .post('/api/v1/recipes')
        .send({ name: 'Sin Token', category: 'Pizzas', ingredients: [{ insumoId: 'ins-harina-1', quantity: '0.100' }] });

      expect(response.status).toBe(401);
    });

    it('rechaza con 400 si la receta no tiene ingredientes', async () => {
      const app = buildApp();

      const response = await request(app)
        .post('/api/v1/recipes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Receta Vacia', category: 'Pizzas', ingredients: [] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('title', 'ValidationError');
    });
  });

  describe('GET /api/v1/recipes', () => {
    it('retorna lista vacia si no hay recetas (repositorio limpio)', async () => {
      const app = buildApp();

      const response = await request(app).get('/api/v1/recipes').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('rechaza con 401 Unauthorized sin token', async () => {
      const app = buildApp();

      const response = await request(app).get('/api/v1/recipes');

      expect(response.status).toBe(401);
    });
  });
});
