import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRecipeRepository } from './InMemoryRecipeRepository.js';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

function recipe(id: string, insumoIds: string[]): Recipe {
  return new Recipe(
    id,
    `Receta ${id}`,
    'SALSAS',
    insumoIds.map((insumoId, idx) => new RecipeIngredient(`${id}-ri-${idx}`, id, insumoId, new DecimalQuantity('1.000')))
  );
}

describe('TK-127: InMemoryRecipeRepository.findByInsumoIds (F-7)', () => {
  let repo: InMemoryRecipeRepository;

  beforeEach(async () => {
    repo = new InMemoryRecipeRepository();
    await repo.save(recipe('rec-a', ['ins-1', 'ins-2']));
    await repo.save(recipe('rec-b', ['ins-3']));
    await repo.save(recipe('rec-c', ['ins-2', 'ins-4']));
  });

  it('devuelve solo las recetas que usan alguno de los insumos indicados', async () => {
    const found = await repo.findByInsumoIds(['ins-2']);
    expect(found.map((r) => r.id).sort()).toEqual(['rec-a', 'rec-c']);
  });

  it('acepta varios insumos (unión)', async () => {
    const found = await repo.findByInsumoIds(['ins-3', 'ins-4']);
    expect(found.map((r) => r.id).sort()).toEqual(['rec-b', 'rec-c']);
  });

  it('devuelve [] sin consultar cuando la lista de insumos está vacía', async () => {
    expect(await repo.findByInsumoIds([])).toEqual([]);
  });

  it('devuelve [] si ninguna receta usa el insumo', async () => {
    expect(await repo.findByInsumoIds(['ins-999'])).toEqual([]);
  });

  it('re-guardar una receta reemplaza su composición completa (F-5)', async () => {
    await repo.save(recipe('rec-a', ['ins-9']));
    const updated = await repo.findById('rec-a');
    expect(updated?.ingredients.map((i) => i.insumoId)).toEqual(['ins-9']);
    expect(await repo.findByInsumoIds(['ins-1'])).toEqual([]);
  });

  it('TK-131: una receta inactiva desaparece de findById, findAll y findByInsumoIds', async () => {
    const dead = (await repo.findById('rec-b'))!.deactivated();
    await repo.save(dead);

    expect(await repo.findById('rec-b')).toBeNull();
    expect((await repo.findAll()).map((r) => r.id).sort()).toEqual(['rec-a', 'rec-c']);
    expect((await repo.findByInsumoIds(['ins-3'])).map((r) => r.id)).toEqual([]);
  });
});
