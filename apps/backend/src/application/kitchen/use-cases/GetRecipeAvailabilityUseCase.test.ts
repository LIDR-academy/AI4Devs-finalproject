import { describe, it, expect, beforeEach } from 'vitest';
import { GetRecipeAvailabilityUseCase } from './GetRecipeAvailabilityUseCase.js';
import { InMemoryRecipeRepository } from '../../../infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { ActiveRemanenteDTO, IRemanenteQueryRepository } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';

// Fake mínimo — save()/existsStockAtLocation() explotan si se llaman: este caso de uso
// es de solo lectura (DoD #2), un llamado a cualquiera de los dos es un fallo del test.
class FakeInsumoRepository implements IInsumoRepository {
  constructor(private readonly insumos: Map<string, Insumo>) {}
  async findById(id: string): Promise<Insumo | null> {
    return this.insumos.get(id) ?? null;
  }
  async findByName(): Promise<Insumo | null> {
    throw new Error('no debería llamarse');
  }
  async findByBarcode(): Promise<Insumo | null> {
    throw new Error('no debería llamarse');
  }
  async findAll(): Promise<Insumo[]> {
    throw new Error('no debería llamarse');
  }
  async save(): Promise<void> {
    throw new Error('GetRecipeAvailabilityUseCase no debe mutar el repositorio de insumos');
  }
  async existsStockAtLocation(): Promise<boolean> {
    throw new Error('no debería llamarse');
  }
}

class FakeRemanenteQueryRepository implements IRemanenteQueryRepository {
  constructor(private readonly byInsumo: Map<string, ActiveRemanenteDTO[]>) {}
  async findActiveRemanentes(_storageLocationId?: string, insumoId?: string): Promise<ActiveRemanenteDTO[]> {
    return insumoId ? (this.byInsumo.get(insumoId) ?? []) : [];
  }
}

function makeRemanente(insumoId: string, currentQuantity: string): ActiveRemanenteDTO {
  return {
    id: `rem-${insumoId}-${currentQuantity}`,
    insumoId,
    insumoName: 'x',
    unitOfMeasure: 'KG',
    currentQuantity,
    initialQuantity: currentQuantity,
    location: 'KITCHEN_FRIDGE',
    expirationDate: new Date(Date.now() + 86400000),
    status: 'ACTIVE',
    createdAt: new Date(),
  };
}

describe('TK-111: GetRecipeAvailabilityUseCase (US-007 v1.1.0)', () => {
  let recipeRepo: InMemoryRecipeRepository;

  beforeEach(() => {
    recipeRepo = new InMemoryRecipeRepository();
  });

  it('ingrediente con stock suficiente -> isSufficient=true con las cantidades correctas', async () => {
    await recipeRepo.save(
      new Recipe('rec-1', 'Pizza Margarita', 'Pizzas', [
        new RecipeIngredient('ing-1', 'rec-1', 'ins-queso', new DecimalQuantity('0.150')),
      ])
    );
    const insumoRepo = new FakeInsumoRepository(new Map([['ins-queso', new Insumo({ id: 'ins-queso', name: 'Queso Mozzarella', unitOfMeasure: 'KG' })]]));
    const remanenteRepo = new FakeRemanenteQueryRepository(new Map([['ins-queso', [makeRemanente('ins-queso', '0.500')]]]));

    const useCase = new GetRecipeAvailabilityUseCase(recipeRepo, insumoRepo, remanenteRepo);
    const result = await useCase.execute('rec-1', 3);

    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]).toMatchObject({
      insumoId: 'ins-queso',
      insumoName: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      requiredQuantity: '0.450', // 0.150 x 3
      availableQuantity: '0.500',
      isSufficient: true,
    });
    expect(result.isFullyAvailable).toBe(true);
  });

  it('ingrediente sin ningún remanente activo -> isSufficient=false, availableQuantity="0.000", nombre resuelto igual', async () => {
    await recipeRepo.save(
      new Recipe('rec-2', 'Hamburguesa Doble', 'Carnes', [
        new RecipeIngredient('ing-1', 'rec-2', 'ins-carne', new DecimalQuantity('0.200')),
      ])
    );
    const insumoRepo = new FakeInsumoRepository(new Map([['ins-carne', new Insumo({ id: 'ins-carne', name: 'Carne Molida', unitOfMeasure: 'KG' })]]));
    const remanenteRepo = new FakeRemanenteQueryRepository(new Map());

    const useCase = new GetRecipeAvailabilityUseCase(recipeRepo, insumoRepo, remanenteRepo);
    const result = await useCase.execute('rec-2');

    expect(result.ingredients[0]).toMatchObject({
      insumoName: 'Carne Molida',
      availableQuantity: '0.000',
      isSufficient: false,
    });
    expect(result.isFullyAvailable).toBe(false);
  });

  it('varios ingredientes, algunos suficientes y otros no -> isFullyAvailable es el AND de todos', async () => {
    await recipeRepo.save(
      new Recipe('rec-3', 'Salsa Bolognesa', 'Salsas', [
        new RecipeIngredient('ing-1', 'rec-3', 'ins-carne', new DecimalQuantity('0.100')),
        new RecipeIngredient('ing-2', 'rec-3', 'ins-tomate', new DecimalQuantity('0.200')),
      ])
    );
    const insumoRepo = new FakeInsumoRepository(
      new Map([
        ['ins-carne', new Insumo({ id: 'ins-carne', name: 'Carne Molida', unitOfMeasure: 'KG' })],
        ['ins-tomate', new Insumo({ id: 'ins-tomate', name: 'Salsa Pomodoro', unitOfMeasure: 'L' })],
      ])
    );
    const remanenteRepo = new FakeRemanenteQueryRepository(
      new Map([
        ['ins-carne', [makeRemanente('ins-carne', '0.050')]], // insuficiente
        ['ins-tomate', [makeRemanente('ins-tomate', '1.000')]], // suficiente
      ])
    );

    const useCase = new GetRecipeAvailabilityUseCase(recipeRepo, insumoRepo, remanenteRepo);
    const result = await useCase.execute('rec-3');

    expect(result.ingredients.find((i) => i.insumoId === 'ins-carne')?.isSufficient).toBe(false);
    expect(result.ingredients.find((i) => i.insumoId === 'ins-tomate')?.isSufficient).toBe(true);
    expect(result.isFullyAvailable).toBe(false);
  });

  it('receta inexistente -> EntityNotFoundException', async () => {
    const insumoRepo = new FakeInsumoRepository(new Map());
    const remanenteRepo = new FakeRemanenteQueryRepository(new Map());
    const useCase = new GetRecipeAvailabilityUseCase(recipeRepo, insumoRepo, remanenteRepo);

    await expect(useCase.execute('rec-inexistente')).rejects.toThrow(/no fue encontrad/i);
  });

  it('portions afecta la cantidad requerida proporcionalmente', async () => {
    await recipeRepo.save(
      new Recipe('rec-4', 'Café con Leche', 'Bebidas', [
        new RecipeIngredient('ing-1', 'rec-4', 'ins-leche', new DecimalQuantity('0.100')),
      ])
    );
    const insumoRepo = new FakeInsumoRepository(new Map([['ins-leche', new Insumo({ id: 'ins-leche', name: 'Leche', unitOfMeasure: 'L' })]]));
    const remanenteRepo = new FakeRemanenteQueryRepository(new Map([['ins-leche', [makeRemanente('ins-leche', '0.500')]]]));

    const useCase = new GetRecipeAvailabilityUseCase(recipeRepo, insumoRepo, remanenteRepo);
    const result5 = await useCase.execute('rec-4', 5);

    expect(result5.ingredients[0].requiredQuantity).toBe('0.500'); // 0.100 x 5
    expect(result5.ingredients[0].isSufficient).toBe(true); // 0.500 disponible == 0.500 requerido

    const result6 = await useCase.execute('rec-4', 6);
    expect(result6.ingredients[0].requiredQuantity).toBe('0.600');
    expect(result6.ingredients[0].isSufficient).toBe(false); // ya no alcanza
  });
});
