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

    it('TK-127 F-10: rechaza con 400 (no 500) si quantity no es un decimal válido', async () => {
      const app = buildApp();

      const response = await request(app)
        .post('/api/v1/recipes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Cantidad Mala', category: 'Pizzas', ingredients: [{ insumoId: 'ins-harina-1', quantity: 'abc' }] });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('title', 'ValidationError');
    });

    it('TK-127 F-10: rechaza con 400 si el mismo insumoId aparece dos veces', async () => {
      const app = buildApp();

      const response = await request(app)
        .post('/api/v1/recipes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Insumo Duplicado',
          category: 'Pizzas',
          ingredients: [
            { insumoId: 'ins-harina-1', quantity: '0.100' },
            { insumoId: 'ins-harina-1', quantity: '0.200' },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.detail).toMatch(/más de una vez/);
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

  describe('PUT / DELETE /api/v1/recipes/:id (US-037/TK-131)', () => {
    async function createRecipe(app: ReturnType<typeof buildApp>, name = 'Salsa Base') {
      const res = await request(app)
        .post('/api/v1/recipes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name,
          category: 'SALSAS',
          ingredients: [
            { insumoId: 'ins-harina-1', quantity: '0.100' },
            { insumoId: 'ins-salsa-1', quantity: '0.200' },
          ],
        });
      return res.body.recipeId as string;
    }

    it('Escenario 1: ADMIN edita nombre e ingredientes de una receta sin preparaciones (200)', async () => {
      const app = buildApp();
      const id = await createRecipe(app);

      const res = await request(app)
        .put(`/api/v1/recipes/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Salsa Pomodoro', ingredients: [{ insumoId: 'ins-salsa-1', quantity: '0.500' }] });

      expect(res.status).toBe(200);
      const list = await request(app).get('/api/v1/recipes').set('Authorization', `Bearer ${adminToken}`);
      const listed = list.body.find((r: { id: string }) => r.id === id);
      expect(listed.name).toBe('Salsa Pomodoro');
      expect(listed.ingredients).toHaveLength(1);
    });

    it('rechaza con 400 una clave no editable (ej. isActive) y con 404 un id inexistente', async () => {
      const app = buildApp();
      const id = await createRecipe(app);

      const bad = await request(app)
        .put(`/api/v1/recipes/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false });
      expect(bad.status).toBe(400);

      const missing = await request(app)
        .put('/api/v1/recipes/rec-fantasma')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'X' });
      expect(missing.status).toBe(404);
    });

    it('Escenario 4: DELETE hace soft-delete (204) y la receta sale del listado', async () => {
      const app = buildApp();
      const id = await createRecipe(app);

      const del = await request(app).delete(`/api/v1/recipes/${id}`).set('Authorization', `Bearer ${adminToken}`);
      expect(del.status).toBe(204);

      const list = await request(app).get('/api/v1/recipes').set('Authorization', `Bearer ${adminToken}`);
      expect(list.body.find((r: { id: string }) => r.id === id)).toBeUndefined();

      // Escenario 5: editar / borrar de nuevo una receta ya dada de baja → 404
      const reDelete = await request(app).delete(`/api/v1/recipes/${id}`).set('Authorization', `Bearer ${adminToken}`);
      expect(reDelete.status).toBe(404);
    });

    it('Escenario 5: KITCHEN_STAFF no puede editar ni dar de baja (403)', async () => {
      const app = buildApp();
      const id = await createRecipe(app);

      const put = await request(app).put(`/api/v1/recipes/${id}`).set('Authorization', `Bearer ${staffToken}`).send({ name: 'Y' });
      expect(put.status).toBe(403);
      const del = await request(app).delete(`/api/v1/recipes/${id}`).set('Authorization', `Bearer ${staffToken}`);
      expect(del.status).toBe(403);
    });
  });
});
