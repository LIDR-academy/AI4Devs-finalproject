import { describe, it, expect, beforeEach } from 'vitest';
import { ConsumeRecipeUseCase } from '../../src/application/kitchen/use-cases/ConsumeRecipeUseCase.js';
import { InMemoryRecipeRepository } from '../../src/infrastructure/catalog/repositories/InMemoryRecipeRepository.js';
import { InMemoryStockRepository } from '../../src/infrastructure/stock/repositories/InMemoryStockRepository.js';
import { Recipe } from '../../src/domain/catalog/entities/Recipe.js';
import { RecipeIngredient } from '../../src/domain/catalog/entities/RecipeIngredient.js';
import { Remanente } from '../../src/domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../src/domain/stock/value-objects/DecimalQuantity.js';

describe('TK-008: ConsumeRecipeUseCase TDD Suite', () => {
  let recipeRepo: InMemoryRecipeRepository;
  let stockRepo: InMemoryStockRepository;
  let useCase: ConsumeRecipeUseCase;

  beforeEach(() => {
    recipeRepo = new InMemoryRecipeRepository();
    stockRepo = new InMemoryStockRepository();
    useCase = new ConsumeRecipeUseCase(recipeRepo, stockRepo);
  });

  it('debe consumir exitosamente una receta aplicando la cascada FEFO sobre los remanentes mas antiguos', async () => {
    // 1. Crear Receta "Pizza Margarita": requiere 0.1500 KG de Queso Mozzarella (ins-queso-1)
    const recipe = new Recipe('rec-pizza-1', 'Pizza Margarita', 'PIZZA', [
      new RecipeIngredient('ri-1', 'rec-pizza-1', 'ins-queso-1', new DecimalQuantity(0.15)),
    ]);
    await recipeRepo.save(recipe);

    // 2. Crear Remanente A (0.1000 KG, vence hoy) y Remanente B (0.2000 KG, vence manana)
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
      location: 'KITCHEN_FRIDGE',
      expirationDate: tomorrow,
      status: 'ACTIVE',
    });

    await stockRepo.saveRemanente(remanenteA);
    await stockRepo.saveRemanente(remanenteB);

    // 3. ACT (Cuando): Ejecutar caso de uso
    const result = await useCase.execute({ recipeId: 'rec-pizza-1', portions: 1 });

    // 4. ASSERT (Entonces): Verificación con los 3 Oráculos (Guard 20)
    // ORACULO RED / RESPUESTA: Payload de salida retornado correctamente
    expect(result.recipeName).toBe('Pizza Margarita');
    expect(result.ingredientsConsumed[0].totalConsumed).toBe('0.150');

    // ORACULO ESTADO: Remanente A debe haber sido totalmente consumido (0.0000) y quedar EXHAUSTED (FEFO estricto)
    const updatedRemA = await stockRepo.findRemanenteById('rem-a');
    expect(updatedRemA?.status).toBe('EXHAUSTED');
    expect(updatedRemA?.currentQuantity.value.toString()).toBe('0');

    // ORACULO ESTADO: Remanente B debe quedar en ACTIVE con 0.1500 KG restante (0.2000 - 0.0500)
    const updatedRemB = await stockRepo.findRemanenteById('rem-b');
    expect(updatedRemB?.status).toBe('ACTIVE');
    expect(updatedRemB?.currentQuantity.value.toString()).toBe('0.15');
  });

  it('debe lanzar un error de stock insuficiente si la suma de remanentes es menor a la requerida', async () => {
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
  });
});
