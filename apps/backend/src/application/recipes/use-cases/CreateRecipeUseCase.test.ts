import { describe, it, expect, beforeEach } from 'vitest';
import { CreateRecipeUseCase } from './CreateRecipeUseCase.js';
import { InMemoryRecipeRepository } from '../../../infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';

class SequentialIdGenerator implements IdGenerator {
  private readonly counters = new Map<string, number>();
  next(prefix: string): string {
    const n = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, n);
    return `${prefix}-${n}`;
  }
}

describe('TK-127: CreateRecipeUseCase', () => {
  let recipeRepo: InMemoryRecipeRepository;
  let stockRepo: InMemoryStockRepository;
  let ids: SequentialIdGenerator;
  let useCase: CreateRecipeUseCase;

  beforeEach(() => {
    recipeRepo = new InMemoryRecipeRepository();
    stockRepo = new InMemoryStockRepository();
    ids = new SequentialIdGenerator();
    useCase = new CreateRecipeUseCase(recipeRepo, stockRepo, ids);

    stockRepo.seedInsumo(new Insumo({ id: 'ins-1', name: 'Harina', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity(10) }));
    stockRepo.seedInsumo(new Insumo({ id: 'ins-2', name: 'Sal', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity(5) }));
  });

  it('F-8: los ids de receta e ingrediente vienen del IdGenerator inyectado', async () => {
    const result = await useCase.execute({
      name: 'Pan',
      category: 'Panadería',
      ingredients: [
        { insumoId: 'ins-1', quantity: '0.5000' },
        { insumoId: 'ins-2', quantity: '0.0100' },
      ],
    });

    expect(result.recipeId).toBe('rec-1');
    const saved = await recipeRepo.findById('rec-1');
    expect(saved?.ingredients.map((i) => i.id)).toEqual(['ri-1', 'ri-2']);
    expect(saved?.ingredients.every((i) => i.recipeId === 'rec-1')).toBe(true);
    expect(saved?.ingredients[0].quantity.toString()).toBe('0.500');
  });

  it('lanza EntityNotFoundException si un insumo no existe (sin persistir la receta)', async () => {
    await expect(
      useCase.execute({ name: 'X', category: 'Y', ingredients: [{ insumoId: 'ins-fantasma', quantity: '1' }] })
    ).rejects.toBeInstanceOf(EntityNotFoundException);
    expect(await recipeRepo.findAll()).toHaveLength(0);
  });

  it('F-8: valida cada insumo una sola vez aunque se repita (dedupe de lookups)', async () => {
    let calls = 0;
    const spied = new InMemoryStockRepository();
    spied.seedInsumo(new Insumo({ id: 'ins-1', name: 'Harina', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity(10) }));
    const originalFindById = spied.findById.bind(spied);
    spied.findById = async (id: string) => {
      calls++;
      return originalFindById(id);
    };

    await new CreateRecipeUseCase(recipeRepo, spied, ids).execute({
      name: 'Doble',
      category: 'Y',
      ingredients: [
        { insumoId: 'ins-1', quantity: '1' },
        { insumoId: 'ins-1', quantity: '2' },
      ],
    });

    expect(calls).toBe(1);
  });
});
