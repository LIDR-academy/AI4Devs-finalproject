import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRemanenteQueryRepository } from '../../src/infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { InMemoryRecipeRepository } from '../../src/infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { Recipe } from '../../src/domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../src/domain/recipes/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';
import { Insumo } from '../../src/domain/stock/entities/Insumo.js';
import { Remanente } from '../../src/domain/stock/entities/Remanente.js';

const JWT_SECRET = 'test-secret-recipe-availability-12345';

describe('US-007 v1.1.0 (TK-111): vista previa de disponibilidad de receta (HTTP)', () => {
  let stockRepo: InMemoryStockRepository;
  let queryRepo: InMemoryRemanenteQueryRepository;
  let recipeRepo: InMemoryRecipeRepository;

  beforeEach(async () => {
    stockRepo = new InMemoryStockRepository();
    queryRepo = new InMemoryRemanenteQueryRepository(stockRepo);
    recipeRepo = new InMemoryRecipeRepository();

    stockRepo.seedInsumo(new Insumo({ id: 'ins-leche', name: 'Leche', unitOfMeasure: 'L' }));
    stockRepo.seedRemanente(
      new Remanente({
        id: 'rem-leche-1',
        insumoId: 'ins-leche',
        currentQuantity: new DecimalQuantity('0.500'),
        initialQuantity: new DecimalQuantity('0.500'),
        location: 'KITCHEN_FRIDGE',
        status: 'ACTIVE',
        expirationDate: new Date(Date.now() + 86400000),
      })
    );

    await recipeRepo.save(
      new Recipe('rec-cafe', 'Café con Leche', 'Bebidas', [
        new RecipeIngredient('ing-1', 'rec-cafe', 'ins-leche', new DecimalQuantity('0.100')),
      ])
    );
  });

  const app = () =>
    createApp({ stockRepository: stockRepo, remanenteQueryRepository: queryRepo, recipeRepository: recipeRepo, requireAuth: false });

  it('Escenario 1-bis: devuelve requerido/disponible por ingrediente y isFullyAvailable=true si alcanza', async () => {
    const res = await request(app()).get('/api/v1/kitchen/recipes/rec-cafe/availability?portions=3');

    expect(res.status).toBe(200);
    expect(res.body.recipeName).toBe('Café con Leche');
    expect(res.body.portions).toBe(3);
    expect(res.body.ingredients[0]).toMatchObject({
      insumoId: 'ins-leche',
      insumoName: 'Leche',
      unitOfMeasure: 'L',
      requiredQuantity: '0.300',
      availableQuantity: '0.500',
      isSufficient: true,
    });
    expect(res.body.isFullyAvailable).toBe(true);
  });

  it('portions grande deja isSufficient=false SIN fallar la petición (200, no 422 — es una previsualización)', async () => {
    const res = await request(app()).get('/api/v1/kitchen/recipes/rec-cafe/availability?portions=10');

    expect(res.status).toBe(200);
    expect(res.body.ingredients[0].isSufficient).toBe(false);
    expect(res.body.isFullyAvailable).toBe(false);

    // La previsualización no debe haber mutado el remanente.
    const updated = await stockRepo.findRemanenteById('rem-leche-1');
    expect(updated?.currentQuantity.toString()).toBe('0.500');
  });

  it('receta inexistente -> 404', async () => {
    const res = await request(app()).get('/api/v1/kitchen/recipes/rec-inexistente/availability');
    expect(res.status).toBe(404);
  });

  it('portions se omite -> default 1', async () => {
    const res = await request(app()).get('/api/v1/kitchen/recipes/rec-cafe/availability');

    expect(res.status).toBe(200);
    expect(res.body.portions).toBe(1);
    expect(res.body.ingredients[0].requiredQuantity).toBe('0.100');
  });

  it('abierto a cualquier rol autenticado (KITCHEN_STAFF) — no exige ADMIN, es lectura operativa', async () => {
    const authedApp = createApp({
      stockRepository: stockRepo,
      remanenteQueryRepository: queryRepo,
      recipeRepository: recipeRepo,
      jwtSecret: JWT_SECRET,
    });
    const token = jwt.sign({ sub: 'usr-staff', name: 'Operario', role: 'KITCHEN_STAFF' }, JWT_SECRET, { expiresIn: '1h' });

    const res = await request(authedApp)
      .get('/api/v1/kitchen/recipes/rec-cafe/availability')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
