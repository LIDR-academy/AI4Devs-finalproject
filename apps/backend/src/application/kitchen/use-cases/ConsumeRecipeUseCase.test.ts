import { describe, it, expect, beforeEach } from 'vitest';
import { ConsumeRecipeUseCase } from './ConsumeRecipeUseCase.js';
import { InMemoryRecipeRepository } from '../../../infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { Clock } from '../../../domain/shared/Clock.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { ExcessConsumptionException } from '../../../domain/kitchen/errors/ExcessConsumptionException.js';

const NOW = new Date('2026-09-05T12:00:00.000Z');
const fixedClock: Clock = { now: () => NOW };

class SeqIds implements IdGenerator {
  private n = 0;
  next(prefix: string): string {
    this.n += 1;
    return `${prefix}-${this.n}`;
  }
}

describe('TK-008 / TK-105 (US-029): ConsumeRecipeUseCase — consumo ad-hoc con auditoría', () => {
  let recipeRepo: InMemoryRecipeRepository;
  let stockRepo: InMemoryStockRepository;
  let useCase: ConsumeRecipeUseCase;

  beforeEach(() => {
    recipeRepo = new InMemoryRecipeRepository();
    stockRepo = new InMemoryStockRepository();
    useCase = new ConsumeRecipeUseCase(recipeRepo, stockRepo, fixedClock, new SeqIds());
  });

  it('debe consumir exitosamente una receta aplicando la cascada FEFO sobre los remanentes mas antiguos', async () => {
    const recipe = new Recipe('rec-pizza-1', 'Pizza Margarita', 'PIZZA', [
      new RecipeIngredient('ri-1', 'rec-pizza-1', 'ins-queso-1', new DecimalQuantity(0.15)),
    ]);
    await recipeRepo.save(recipe);

    const today = new Date();
    const tomorrow = new Date(Date.now() + 86400000);

    const remanenteA = new Remanente({
      id: 'rem-a',
      insumoId: 'ins-queso-1',
      currentQuantity: new DecimalQuantity(0.1),
      initialQuantity: new DecimalQuantity(0.1),
      location: 'KITCHEN_FRIDGE',
      expirationDate: today,
      status: 'ACTIVE',
    });

    const remanenteB = new Remanente({
      id: 'rem-b',
      insumoId: 'ins-queso-1',
      currentQuantity: new DecimalQuantity(0.2),
      initialQuantity: new DecimalQuantity(0.2),
      location: 'KITCHEN_LINE',
      expirationDate: tomorrow,
      status: 'ACTIVE',
    });

    await stockRepo.saveRemanente(remanenteA);
    await stockRepo.saveRemanente(remanenteB);

    const result = await useCase.execute({ recipeId: 'rec-pizza-1', portions: 1 });

    expect(result.recipeName).toBe('Pizza Margarita');
    expect(result.ingredientsConsumed[0].totalConsumed).toBe('0.150');
    expect(result.ingredientsConsumed[0].remanentesAffectedCount).toBe(2);

    const updatedRemA = await stockRepo.findRemanenteById('rem-a');
    expect(updatedRemA?.status).toBe('EXHAUSTED');
    expect(updatedRemA?.currentQuantity.toString()).toBe('0.000');

    const updatedRemB = await stockRepo.findRemanenteById('rem-b');
    expect(updatedRemB?.status).toBe('ACTIVE');
    expect(updatedRemB?.currentQuantity.toString()).toBe('0.150');

    // US-029 Escenario 4: cada remanente afectado deja un StockMovement CONSUMPTION_RECIPE.
    expect(stockRepo.movements).toHaveLength(2);
    expect(stockRepo.movements[0]).toMatchObject({
      insumoId: 'ins-queso-1',
      type: 'CONSUMPTION_RECIPE',
      quantity: '0.100',
      fromLoc: 'KITCHEN_FRIDGE',
      toLoc: 'RECIPE:rec-pizza-1',
      recipeId: 'rec-pizza-1',
    });
    expect(stockRepo.movements[0].createdAt).toEqual(NOW);
    expect(stockRepo.movements[1]).toMatchObject({
      insumoId: 'ins-queso-1',
      type: 'CONSUMPTION_RECIPE',
      quantity: '0.050',
      fromLoc: 'KITCHEN_LINE',
      toLoc: 'RECIPE:rec-pizza-1',
    });
  });

  it('debe lanzar un error de stock insuficiente si la suma de remanentes es menor a la requerida, sin registrar movimientos', async () => {
    const recipe = new Recipe('rec-pizza-1', 'Pizza Margarita', 'PIZZA', [
      new RecipeIngredient('ri-1', 'rec-pizza-1', 'ins-queso-1', new DecimalQuantity(0.5)),
    ]);
    await recipeRepo.save(recipe);

    const remanenteA = new Remanente({
      id: 'rem-a',
      insumoId: 'ins-queso-1',
      currentQuantity: new DecimalQuantity(0.1),
      initialQuantity: new DecimalQuantity(0.1),
      location: 'KITCHEN_FRIDGE',
      expirationDate: new Date(),
      status: 'ACTIVE',
    });
    await stockRepo.saveRemanente(remanenteA);

    await expect(useCase.execute({ recipeId: 'rec-pizza-1', portions: 1 })).rejects.toThrow(
      /No es posible consumir/i
    );
    expect(stockRepo.movements).toHaveLength(0);
    expect((await stockRepo.findRemanenteById('rem-a'))?.currentQuantity.toString()).toBe('0.100');
  });

  it('US-029 Escenario 5: si el 2º ingrediente no alcanza, revierte TODO lo del 1º (atomicidad, C-DEV-006-1)', async () => {
    const recipe = new Recipe('rec-pizza-1', 'Pizza Margarita', 'PIZZA', [
      new RecipeIngredient('ri-1', 'rec-pizza-1', 'ins-queso-1', new DecimalQuantity(0.1)),
      new RecipeIngredient('ri-2', 'rec-pizza-1', 'ins-tomate-1', new DecimalQuantity(0.5)),
    ]);
    await recipeRepo.save(recipe);

    await stockRepo.saveRemanente(
      new Remanente({
        id: 'rem-queso',
        insumoId: 'ins-queso-1',
        currentQuantity: new DecimalQuantity(0.2),
        initialQuantity: new DecimalQuantity(0.2),
        location: 'KITCHEN_FRIDGE',
        expirationDate: new Date(),
        status: 'ACTIVE',
      })
    );
    // Insuficiente para el 2º ingrediente (se requieren 0.500, solo hay 0.100).
    await stockRepo.saveRemanente(
      new Remanente({
        id: 'rem-tomate',
        insumoId: 'ins-tomate-1',
        currentQuantity: new DecimalQuantity(0.1),
        initialQuantity: new DecimalQuantity(0.1),
        location: 'KITCHEN_LINE',
        expirationDate: new Date(),
        status: 'ACTIVE',
      })
    );

    await expect(useCase.execute({ recipeId: 'rec-pizza-1', portions: 1 })).rejects.toBeInstanceOf(
      ExcessConsumptionException
    );

    // ORACULO ESTADO: el queso (1er ingrediente, ya "consumido" antes de fallar el 2º)
    // debe quedar exactamente como estaba — sin descuento parcial.
    expect((await stockRepo.findRemanenteById('rem-queso'))?.currentQuantity.toString()).toBe('0.200');
    expect((await stockRepo.findRemanenteById('rem-tomate'))?.currentQuantity.toString()).toBe('0.100');
    expect(stockRepo.movements).toHaveLength(0);
  });

  it('receta inexistente → 404, sin abrir la frontera transaccional', async () => {
    await expect(useCase.execute({ recipeId: 'nope' })).rejects.toBeInstanceOf(EntityNotFoundException);
    expect(stockRepo.movements).toHaveLength(0);
  });
});
