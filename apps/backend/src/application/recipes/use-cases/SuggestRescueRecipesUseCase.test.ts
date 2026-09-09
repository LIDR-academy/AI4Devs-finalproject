import { describe, it, expect, beforeEach } from 'vitest';
import { SuggestRescueRecipesUseCase } from './SuggestRescueRecipesUseCase.js';
import { InMemoryRemanenteQueryRepository } from '../../../infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryRescueRecipeGenerationFake } from '../../../infrastructure/recipes/gateways/InMemoryRescueRecipeGenerationFake.js';
import { InMemoryRecipeRepository } from '../../../infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { IAiRecipeGenerationOptionsResolver } from '../../../domain/recipes/gateways/IAiRecipeGenerationOptionsResolver.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';

// Resolver mínimo: el caso de uso solo lo consulta en modo CREATIVE. La resolución
// real (descifrado, fallback a env, regla HEURISTIC) se prueba en
// AiRecipeGenerationOptionsResolver.test.ts, y el routing/fallback en
// CompositeAiRecipeGeneratorAdapter.test.ts.
const stubOptionsResolver: IAiRecipeGenerationOptionsResolver = {
  resolve: async () => ({ modelName: 'stub-model', temperature: 0, apiKey: null, endpointUrl: null }),
};

describe('TK-122 / TK-124 / TK-125: SuggestRescueRecipesUseCase Application Suite', () => {
  let remanenteQueryRepo: InMemoryRemanenteQueryRepository;
  let stockRepo: InMemoryStockRepository;
  let generationFake: InMemoryRescueRecipeGenerationFake;
  let recipeRepo: InMemoryRecipeRepository;
  let useCase: SuggestRescueRecipesUseCase;

  beforeEach(() => {
    remanenteQueryRepo = new InMemoryRemanenteQueryRepository();
    stockRepo = new InMemoryStockRepository();
    generationFake = new InMemoryRescueRecipeGenerationFake();
    recipeRepo = new InMemoryRecipeRepository();

    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-tomate',
        name: 'Tomate Perita',
        unitOfMeasure: 'KG',
        warehouseStock: new DecimalQuantity('10.000'),
        unitCost: new DecimalQuantity('2.00'),
      })
    );
    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-crema',
        name: 'Crema de Leche',
        unitOfMeasure: 'L',
        warehouseStock: new DecimalQuantity('5.000'),
        // sin unitCost — ejercita el camino preventedWasteCost = null
      })
    );

    remanenteQueryRepo.seedRemanente({
      id: 'rem-1',
      insumoId: 'ins-tomate',
      insumoName: 'Tomate Perita',
      unitOfMeasure: 'KG',
      currentQuantity: '2.500',
      initialQuantity: '5.000',
      location: 'Cocina Fría',
      expirationDate: new Date(Date.now() + 24 * 3600 * 1000),
      status: 'ACTIVE',
      createdAt: new Date(),
      hoursRemaining: 24,
      isCriticalAlert: true,
    });

    useCase = new SuggestRescueRecipesUseCase(
      remanenteQueryRepo,
      stockRepo,
      recipeRepo,
      stubOptionsResolver,
      generationFake
    );
  });

  describe('TK-124: Modo Catálogo Propio (Zero Data Leakage - Guard 9)', () => {
    it('genera sugerencias exclusivamente a partir de las recetas del restaurante sin invocar al gateway de generación', async () => {
      await recipeRepo.save(
        new Recipe(
          'rec-salsa-pomodoro',
          'Salsa Pomodoro Clásica',
          'SALSAS',
          [new RecipeIngredient('ri-1', 'rec-salsa-pomodoro', 'ins-tomate', new DecimalQuantity('1.500'))],
          'Salsa casera con tomates maduros'
        )
      );

      const result = await useCase.execute('CATALOG');

      expect(result.source).toBe('CATALOG');
      expect(result.proposals).toHaveLength(1);
      expect(result.proposals[0].name).toBe('Salsa Pomodoro Clásica');
      expect(result.proposals[0].ingredients[0].insumoName).toBe('Tomate Perita');
      expect(result.proposals[0].ingredients[0].isAtRisk).toBe(true);
      // 1.500 KG de tomate en riesgo × unitCost 2.00 = 3.00
      expect(result.proposals[0].preventedWasteCost).toBe('3.00');
      // ZERO DATA LEAKAGE: el gateway de generación JAMÁS es invocado
      expect(generationFake.callCount).toBe(0);
    });

    it('devuelve lista vacía con origen CATALOG si ninguna receta del catálogo coincide con los insumos en riesgo', async () => {
      await recipeRepo.save(
        new Recipe(
          'rec-postre-crema',
          'Flan con Crema',
          'POSTRES',
          [new RecipeIngredient('ri-2', 'rec-postre-crema', 'ins-crema', new DecimalQuantity('0.500'))]
        )
      );

      const result = await useCase.execute('CATALOG');

      expect(result.source).toBe('CATALOG');
      expect(result.proposals).toHaveLength(0);
      expect(generationFake.callCount).toBe(0);
    });

    it('usa el catálogo por defecto cuando no se pasa modo explícito', async () => {
      const result = await useCase.execute();
      expect(result.source).toBe('CATALOG');
      expect(generationFake.callCount).toBe(0);
    });
  });

  describe('TK-125: Modo Creativo delega en el gateway de generación', () => {
    it('mapea las propuestas del gateway y reporta el origen efectivo (GEMINI)', async () => {
      generationFake.source = 'GEMINI';

      const result = await useCase.execute('CREATIVE');

      expect(result.source).toBe('GEMINI');
      expect(result.proposals).toHaveLength(1);
      expect(result.proposals[0].name).toBe('Guiso de Rescate Fake');
      expect(result.proposals[0].ingredients[0].insumoName).toBe('Tomate Perita');
      expect(generationFake.callCount).toBe(1);
    });

    it('reporta HEURISTIC cuando el gateway resolvió con el motor local', async () => {
      generationFake.source = 'HEURISTIC';

      const result = await useCase.execute('CREATIVE');

      expect(result.source).toBe('HEURISTIC');
      expect(result.proposals.length).toBeGreaterThanOrEqual(1);
      expect(generationFake.callCount).toBe(1);
    });

    it('no consulta el catálogo local para construir la respuesta creativa', async () => {
      await recipeRepo.save(
        new Recipe('rec-x', 'Receta Catálogo', 'SALSAS', [
          new RecipeIngredient('ri-x', 'rec-x', 'ins-tomate', new DecimalQuantity('1.000')),
        ])
      );

      const result = await useCase.execute('CREATIVE');

      expect(result.proposals[0].name).toBe('Guiso de Rescate Fake');
    });
  });

  describe('TK-124/TK-125: ranking del catálogo local', () => {
    beforeEach(() => {
      stockRepo.seedInsumo(
        new Insumo({ id: 'ins-cebolla', name: 'Cebolla', unitOfMeasure: 'KG', warehouseStock: new DecimalQuantity('8.000') })
      );
      // Segundo remanente en riesgo → dos insumos en riesgo: ins-tomate, ins-cebolla.
      remanenteQueryRepo.seedRemanente({
        id: 'rem-2',
        insumoId: 'ins-cebolla',
        insumoName: 'Cebolla',
        unitOfMeasure: 'KG',
        currentQuantity: '1.000',
        initialQuantity: '4.000',
        location: 'Cocina Fría',
        expirationDate: new Date(Date.now() + 12 * 3600 * 1000),
        status: 'ACTIVE',
        createdAt: new Date(),
        hoursRemaining: 12,
        isCriticalAlert: true,
      });
    });

    it('ordena primero por número de insumos en riesgo cubiertos', async () => {
      await recipeRepo.save(
        new Recipe('rec-uno', 'Cubre Uno', 'SALSAS', [
          new RecipeIngredient('r1', 'rec-uno', 'ins-tomate', new DecimalQuantity('5.000')),
        ])
      );
      await recipeRepo.save(
        new Recipe('rec-dos', 'Cubre Dos', 'SALSAS', [
          new RecipeIngredient('r2', 'rec-dos', 'ins-tomate', new DecimalQuantity('0.100')),
          new RecipeIngredient('r3', 'rec-dos', 'ins-cebolla', new DecimalQuantity('0.100')),
        ])
      );

      const result = await useCase.execute('CATALOG');

      expect(result.proposals.map((p) => p.name)).toEqual(['Cubre Dos', 'Cubre Uno']);
    });

    it('a igual merma evitada, desempata por nombre (orden alfabético estable)', async () => {
      await recipeRepo.save(
        new Recipe('rec-c', 'Gamma', 'SALSAS', [
          new RecipeIngredient('rc', 'rec-c', 'ins-tomate', new DecimalQuantity('1.000')),
        ])
      );
      await recipeRepo.save(
        new Recipe('rec-b', 'Beta', 'SALSAS', [
          new RecipeIngredient('rb', 'rec-b', 'ins-tomate', new DecimalQuantity('1.000')),
        ])
      );

      const result = await useCase.execute('CATALOG');

      expect(result.proposals.map((p) => p.name)).toEqual(['Beta', 'Gamma']);
    });

    it('limita a 3 propuestas aunque haya más recetas coincidentes', async () => {
      for (const n of ['R1', 'R2', 'R3', 'R4', 'R5']) {
        await recipeRepo.save(
          new Recipe(`rec-${n}`, n, 'SALSAS', [
            new RecipeIngredient(`ri-${n}`, `rec-${n}`, 'ins-tomate', new DecimalQuantity('1.000')),
          ])
        );
      }

      const result = await useCase.execute('CATALOG');

      expect(result.proposals).toHaveLength(3);
    });

    it('usa la descripción de la receta y, si falta, un texto por defecto; marca isAtRisk por ingrediente', async () => {
      await recipeRepo.save(
        new Recipe('rec-desc', 'ConDesc', 'SALSAS', [
          new RecipeIngredient('rd', 'rec-desc', 'ins-tomate', new DecimalQuantity('1.000')),
        ], 'Mi salsa artesanal')
      );
      await recipeRepo.save(
        new Recipe('rec-mix', 'Mixta', 'GUARNICION', [
          new RecipeIngredient('m1', 'rec-mix', 'ins-tomate', new DecimalQuantity('1.000')), // en riesgo
          new RecipeIngredient('m2', 'rec-mix', 'ins-crema', new DecimalQuantity('0.200')), // NO en riesgo
        ])
      );

      const result = await useCase.execute('CATALOG');

      expect(result.proposals.find((p) => p.name === 'ConDesc')?.description).toBe('Mi salsa artesanal');
      const mixta = result.proposals.find((p) => p.name === 'Mixta');
      expect(mixta?.description).toContain('catálogo propio');
      expect(mixta?.category).toBe('GUARNICION');
      const byId = Object.fromEntries(mixta!.ingredients.map((i) => [i.insumoId, i.isAtRisk]));
      expect(byId['ins-tomate']).toBe(true);
      expect(byId['ins-crema']).toBe(false);
    });

    it('TK-128 F-16: a igual cobertura, la receta que rescata MÁS valor va primero', async () => {
      await recipeRepo.save(
        new Recipe('rec-alta', 'AltaMerma', 'SALSAS', [
          new RecipeIngredient('ra', 'rec-alta', 'ins-tomate', new DecimalQuantity('9.000')),
        ])
      );
      await recipeRepo.save(
        new Recipe('rec-baja', 'BajaMerma', 'SALSAS', [
          new RecipeIngredient('rb', 'rec-baja', 'ins-tomate', new DecimalQuantity('0.500')),
        ])
      );

      const result = await useCase.execute('CATALOG');

      expect(result.proposals.map((p) => p.name)).toEqual(['AltaMerma', 'BajaMerma']);
      expect(result.proposals[0].preventedWasteCost).toBe('18.00'); // 9.000 × 2.00
      expect(result.proposals[1].preventedWasteCost).toBe('1.00'); // 0.500 × 2.00
    });

    it('TK-128: a igual cobertura, una propuesta sin valorizar (null) va detrás de una valorizada', async () => {
      // rec-cebolla cubre solo ins-cebolla (sin unitCost) → preventedWasteCost null.
      await recipeRepo.save(
        new Recipe('rec-cebolla', 'SoloCebolla', 'SALSAS', [
          new RecipeIngredient('rce', 'rec-cebolla', 'ins-cebolla', new DecimalQuantity('1.000')),
        ])
      );
      await recipeRepo.save(
        new Recipe('rec-tom', 'SoloTomate', 'SALSAS', [
          new RecipeIngredient('rto', 'rec-tom', 'ins-tomate', new DecimalQuantity('0.100')),
        ])
      );

      const result = await useCase.execute('CATALOG');

      expect(result.proposals.map((p) => p.name)).toEqual(['SoloTomate', 'SoloCebolla']);
      expect(result.proposals[1].preventedWasteCost).toBeNull();
    });

    it('resuelve nombre y unidad "Insumo"/"UNIDAD" cuando el insumo del ingrediente no está en el catálogo de stock', async () => {
      await recipeRepo.save(
        new Recipe('rec-huerf', 'Huérfana', 'SALSAS', [
          new RecipeIngredient('rh1', 'rec-huerf', 'ins-tomate', new DecimalQuantity('1.000')),
          new RecipeIngredient('rh2', 'rec-huerf', 'ins-borrado', new DecimalQuantity('2.000')),
        ])
      );

      const result = await useCase.execute('CATALOG');
      const huerfana = result.proposals.find((p) => p.name === 'Huérfana');
      const orphan = huerfana?.ingredients.find((i) => i.insumoId === 'ins-borrado');
      expect(orphan).toMatchObject({ insumoName: 'Insumo', unit: 'UNIDAD', isAtRisk: false });
    });
  });

  describe('TK-125: umbral de riesgo de filterAtRiskRemanentes', () => {
    it('incluye un remanente con hoursRemaining exactamente 48 aunque no tenga alerta crítica', async () => {
      const repo = new InMemoryRemanenteQueryRepository();
      repo.seedRemanente({
        id: 'rem-48',
        insumoId: 'ins-tomate',
        insumoName: 'Tomate Perita',
        unitOfMeasure: 'KG',
        currentQuantity: '3.000',
        initialQuantity: '3.000',
        location: 'Cocina',
        expirationDate: new Date(Date.now() + 48 * 3600 * 1000),
        status: 'ACTIVE',
        createdAt: new Date(),
        hoursRemaining: 48,
        isCriticalAlert: false,
      });
      await recipeRepo.save(
        new Recipe('rec-48', 'R48', 'SALSAS', [new RecipeIngredient('r48', 'rec-48', 'ins-tomate', new DecimalQuantity('1.000'))])
      );
      const uc = new SuggestRescueRecipesUseCase(repo, stockRepo, recipeRepo, stubOptionsResolver, generationFake);

      const result = await uc.execute('CATALOG');
      expect(result.proposals.map((p) => p.name)).toEqual(['R48']);
    });
  });

  describe('TK-125: selección de remanentes cuando ninguno está en riesgo', () => {
    it('cae a una muestra de los remanentes activos para el modo creativo', async () => {
      // Repo sin remanentes en riesgo: uno activo, sin alerta crítica ni horas bajas.
      const freshRemanenteRepo = new InMemoryRemanenteQueryRepository();
      freshRemanenteRepo.seedRemanente({
        id: 'rem-ok',
        insumoId: 'ins-tomate',
        insumoName: 'Tomate Perita',
        unitOfMeasure: 'KG',
        currentQuantity: '4.000',
        initialQuantity: '4.000',
        location: 'Bodega',
        expirationDate: new Date(Date.now() + 240 * 3600 * 1000),
        status: 'ACTIVE',
        createdAt: new Date(),
        hoursRemaining: 240,
        isCriticalAlert: false,
      });
      const localUseCase = new SuggestRescueRecipesUseCase(
        freshRemanenteRepo,
        stockRepo,
        recipeRepo,
        stubOptionsResolver,
        generationFake
      );

      const result = await localUseCase.execute('CREATIVE');

      expect(generationFake.callCount).toBe(1);
      expect(result.proposals[0].ingredients[0].insumoName).toBe('Tomate Perita');
    });
  });
});
