import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateRecipeUseCase } from './UpdateRecipeUseCase.js';
import { DeactivateRecipeUseCase } from './DeactivateRecipeUseCase.js';
import { InMemoryRecipeRepository } from '../../../infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRecipePreparationRepository } from '../../../infrastructure/kitchen/repositories/InMemoryRecipePreparationRepository.js';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RecipePreparation } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { RecipeCompositionLockedException } from '../../../domain/recipes/errors/RecipeCompositionLockedException.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';

class SequentialIdGenerator implements IdGenerator {
  private n = 0;
  next(prefix: string): string {
    return `${prefix}-${++this.n}`;
  }
}

describe('TK-131: UpdateRecipeUseCase / DeactivateRecipeUseCase (US-037)', () => {
  let recipeRepo: InMemoryRecipeRepository;
  let stockRepo: InMemoryStockRepository;
  let prepRepo: InMemoryRecipePreparationRepository;
  let update: UpdateRecipeUseCase;
  let deactivate: DeactivateRecipeUseCase;

  beforeEach(async () => {
    recipeRepo = new InMemoryRecipeRepository();
    stockRepo = new InMemoryStockRepository();
    prepRepo = new InMemoryRecipePreparationRepository();
    update = new UpdateRecipeUseCase(recipeRepo, stockRepo, new SequentialIdGenerator(), prepRepo);
    deactivate = new DeactivateRecipeUseCase(recipeRepo);

    stockRepo.seedInsumo(new Insumo({ id: 'ins-1', name: 'Tomate', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity(5) }));
    stockRepo.seedInsumo(new Insumo({ id: 'ins-2', name: 'Cebolla', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity(5) }));

    await recipeRepo.save(
      new Recipe('rec-1', 'Salsa Base', 'SALSAS', [
        new RecipeIngredient('ri-0', 'rec-1', 'ins-1', new DecimalQuantity('1.000')),
      ], 'Original')
    );
  });

  async function closePreparationFor(recipeId: string) {
    const prep = RecipePreparation.openNew('prep-1', recipeId, 4, 'op-1', new Date());
    prep.close(4, 'op-1', new Date());
    await prepRepo.save(prep);
  }

  it('Escenario 1: edita nombre, categoría, descripción e ingredientes de una receta sin preparaciones', async () => {
    const res = await update.execute({
      id: 'rec-1',
      name: 'Salsa Pomodoro',
      category: 'BASES',
      description: 'Nueva',
      ingredients: [{ insumoId: 'ins-2', quantity: '3.000' }],
    });

    expect(res.recipeId).toBe('rec-1');
    const stored = await recipeRepo.findById('rec-1');
    expect(stored?.name).toBe('Salsa Pomodoro');
    expect(stored?.ingredients.map((i) => i.insumoId)).toEqual(['ins-2']);
    expect(stored?.ingredients[0].id).toMatch(/^ri-/);
  });

  it('recorta los espacios de nombre y categoría antes de persistir', async () => {
    await update.execute({ id: 'rec-1', name: '  Salsa Roja  ', category: '  BASES  ' });
    const stored = await recipeRepo.findById('rec-1');
    expect(stored?.name).toBe('Salsa Roja');
    expect(stored?.category).toBe('BASES');
  });

  it('una preparación CLOSED de OTRA receta no bloquea la edición de ingredientes', async () => {
    await recipeRepo.save(
      new Recipe('rec-2', 'Otra', 'SALSAS', [
        new RecipeIngredient('ri-x', 'rec-2', 'ins-1', new DecimalQuantity('1.000')),
      ])
    );
    await closePreparationFor('rec-2');

    const res = await update.execute({ id: 'rec-1', ingredients: [{ insumoId: 'ins-2', quantity: '2.000' }] });
    expect(res.recipeId).toBe('rec-1');
    expect((await recipeRepo.findById('rec-1'))?.ingredients.map((i) => i.insumoId)).toEqual(['ins-2']);
  });

  it('description: null limpia la descripción; omitirla la conserva', async () => {
    await update.execute({ id: 'rec-1', description: null });
    expect((await recipeRepo.findById('rec-1'))?.description).toBeUndefined();
    await update.execute({ id: 'rec-1', name: 'Sin tocar desc' });
    const stored = await recipeRepo.findById('rec-1');
    expect(stored?.name).toBe('Sin tocar desc');
    expect(stored?.description).toBeUndefined();
  });

  it('Escenario 2: con preparación CLOSED, editar solo metadatos → OK', async () => {
    await closePreparationFor('rec-1');
    const res = await update.execute({ id: 'rec-1', name: 'Salsa (renombrada)', description: 'x' });
    expect(res.recipeId).toBe('rec-1');
    expect((await recipeRepo.findById('rec-1'))?.name).toBe('Salsa (renombrada)');
  });

  it('Escenario 3: con preparación CLOSED, intentar editar ingredientes → RecipeCompositionLockedException', async () => {
    await closePreparationFor('rec-1');
    await expect(
      update.execute({ id: 'rec-1', ingredients: [{ insumoId: 'ins-2', quantity: '1.000' }] })
    ).rejects.toBeInstanceOf(RecipeCompositionLockedException);
    expect((await recipeRepo.findById('rec-1'))?.ingredients.map((i) => i.insumoId)).toEqual(['ins-1']);
  });

  it('una preparación OPEN o ABANDONED NO bloquea la edición de ingredientes', async () => {
    await prepRepo.save(RecipePreparation.openNew('prep-open', 'rec-1', 2, 'op', new Date()));
    const res = await update.execute({ id: 'rec-1', ingredients: [{ insumoId: 'ins-2', quantity: '1.000' }] });
    expect(res.recipeId).toBe('rec-1');
  });

  it('rechaza si un insumoId de la nueva lista no existe', async () => {
    await expect(
      update.execute({ id: 'rec-1', ingredients: [{ insumoId: 'ins-fantasma', quantity: '1.000' }] })
    ).rejects.toBeInstanceOf(EntityNotFoundException);
  });

  it('404 si la receta no existe o ya fue dada de baja', async () => {
    await expect(update.execute({ id: 'rec-x', name: 'Y' })).rejects.toBeInstanceOf(EntityNotFoundException);
    await deactivate.execute('rec-1');
    await expect(update.execute({ id: 'rec-1', name: 'Y' })).rejects.toBeInstanceOf(EntityNotFoundException);
  });

  it('Escenario 4: deactivate marca isActive false y la receta sale de findAll / findById', async () => {
    await deactivate.execute('rec-1');
    expect(await recipeRepo.findById('rec-1')).toBeNull();
    expect(await recipeRepo.findAll()).toHaveLength(0);
  });

  it('Escenario 5: deactivate de un id inexistente → 404', async () => {
    await expect(deactivate.execute('rec-x')).rejects.toBeInstanceOf(EntityNotFoundException);
  });
});
