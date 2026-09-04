import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/infrastructure/http/app.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRecipeRepository } from '../../src/infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { Remanente } from '../../src/domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';
import { Recipe } from '../../src/domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../src/domain/recipes/entities/RecipeIngredient.js';

describe('US-029 (TK-105): consumo ad-hoc de receta deja rastro de auditoría (HTTP)', () => {
  let stockRepo: InMemoryStockRepository;
  let recipeRepo: InMemoryRecipeRepository;

  beforeEach(() => {
    stockRepo = new InMemoryStockRepository();
    recipeRepo = new InMemoryRecipeRepository();
  });

  it('Escenario 4: descuenta por FEFO y registra CONSUMPTION_RECIPE por cada remanente afectado', async () => {
    await recipeRepo.save(
      new Recipe('rec-pizza-1', 'Pizza Margarita', 'PIZZA', [
        new RecipeIngredient('ri-1', 'rec-pizza-1', 'ins-queso-1', new DecimalQuantity(0.2)),
      ])
    );
    await stockRepo.saveRemanente(
      new Remanente({
        id: 'rem-1',
        insumoId: 'ins-queso-1',
        currentQuantity: new DecimalQuantity('0.500'),
        initialQuantity: new DecimalQuantity('0.500'),
        location: 'KITCHEN_FRIDGE',
        expirationDate: new Date(),
        status: 'ACTIVE',
      })
    );

    const app = createApp({ stockRepository: stockRepo, recipeRepository: recipeRepo, requireAuth: false });
    const res = await request(app).post('/api/v1/kitchen/recipes/rec-pizza-1/consume').send({ portions: 2 });

    expect(res.status).toBe(200);
    expect(res.body.ingredientsConsumed[0].totalConsumed).toBe('0.400');

    expect(stockRepo.movements).toHaveLength(1);
    expect(stockRepo.movements[0]).toMatchObject({
      insumoId: 'ins-queso-1',
      type: 'CONSUMPTION_RECIPE',
      quantity: '0.400',
      fromLoc: 'KITCHEN_FRIDGE',
      toLoc: 'RECIPE:rec-pizza-1',
      recipeId: 'rec-pizza-1',
    });

    const remanente = await stockRepo.findRemanenteById('rem-1');
    expect(remanente?.currentQuantity.toString()).toBe('0.100');
  });

  it('Escenario 5: 2º ingrediente sin stock suficiente → 422, ningún remanente modificado ni movimiento registrado', async () => {
    await recipeRepo.save(
      new Recipe('rec-pizza-1', 'Pizza Margarita', 'PIZZA', [
        new RecipeIngredient('ri-1', 'rec-pizza-1', 'ins-queso-1', new DecimalQuantity(0.1)),
        new RecipeIngredient('ri-2', 'rec-pizza-1', 'ins-tomate-1', new DecimalQuantity(0.5)),
      ])
    );
    await stockRepo.saveRemanente(
      new Remanente({
        id: 'rem-queso',
        insumoId: 'ins-queso-1',
        currentQuantity: new DecimalQuantity('0.200'),
        initialQuantity: new DecimalQuantity('0.200'),
        location: 'KITCHEN_FRIDGE',
        expirationDate: new Date(),
        status: 'ACTIVE',
      })
    );
    await stockRepo.saveRemanente(
      new Remanente({
        id: 'rem-tomate',
        insumoId: 'ins-tomate-1',
        currentQuantity: new DecimalQuantity('0.100'),
        initialQuantity: new DecimalQuantity('0.100'),
        location: 'KITCHEN_LINE',
        expirationDate: new Date(),
        status: 'ACTIVE',
      })
    );

    const app = createApp({ stockRepository: stockRepo, recipeRepository: recipeRepo, requireAuth: false });
    const res = await request(app).post('/api/v1/kitchen/recipes/rec-pizza-1/consume').send({ portions: 1 });

    expect(res.status).toBe(422);
    expect(stockRepo.movements).toHaveLength(0);
    expect((await stockRepo.findRemanenteById('rem-queso'))?.currentQuantity.toString()).toBe('0.200');
    expect((await stockRepo.findRemanenteById('rem-tomate'))?.currentQuantity.toString()).toBe('0.100');
  });

  it('receta inexistente → 404', async () => {
    const app = createApp({ stockRepository: stockRepo, recipeRepository: recipeRepo, requireAuth: false });
    const res = await request(app).post('/api/v1/kitchen/recipes/nope/consume').send({});
    expect(res.status).toBe(404);
  });
});
