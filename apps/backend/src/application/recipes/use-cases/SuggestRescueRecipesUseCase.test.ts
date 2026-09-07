import { describe, it, expect, beforeEach } from 'vitest';
import { SuggestRescueRecipesUseCase } from './SuggestRescueRecipesUseCase.js';
import { InMemoryRemanenteQueryRepository } from '../../../infrastructure/kitchen/repositories/InMemoryRemanenteQueryRepository.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryAiConfigurationRepository } from '../../../infrastructure/settings/repositories/InMemoryAiConfigurationRepository.js';
import { InMemoryAiRecipeGeneratorFake } from '../../../infrastructure/recipes/gateways/InMemoryAiRecipeGeneratorFake.js';
import { InMemoryRecipeRepository } from '../../../infrastructure/recipes/repositories/InMemoryRecipeRepository.js';
import { HeuristicRecipeGeneratorAdapter } from '../../../infrastructure/recipes/gateways/HeuristicRecipeGeneratorAdapter.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { AiConfiguration } from '../../../domain/settings/entities/AiConfiguration.js';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';

describe('TK-122 & TK-124: SuggestRescueRecipesUseCase Application Suite', () => {
  let remanenteQueryRepo: InMemoryRemanenteQueryRepository;
  let stockRepo: InMemoryStockRepository;
  let aiConfigRepo: InMemoryAiConfigurationRepository;
  let fakeAiGateway: InMemoryAiRecipeGeneratorFake;
  let recipeRepo: InMemoryRecipeRepository;
  let heuristicAdapter: HeuristicRecipeGeneratorAdapter;
  let useCase: SuggestRescueRecipesUseCase;

  beforeEach(async () => {
    remanenteQueryRepo = new InMemoryRemanenteQueryRepository();
    stockRepo = new InMemoryStockRepository();
    aiConfigRepo = new InMemoryAiConfigurationRepository();
    fakeAiGateway = new InMemoryAiRecipeGeneratorFake();
    recipeRepo = new InMemoryRecipeRepository();
    heuristicAdapter = new HeuristicRecipeGeneratorAdapter();

    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-tomate',
        name: 'Tomate Perita',
        unitOfMeasure: 'KG',
        warehouseStock: new DecimalQuantity('10.000'),
      })
    );

    stockRepo.seedInsumo(
      new Insumo({
        id: 'ins-crema',
        name: 'Crema de Leche',
        unitOfMeasure: 'L',
        warehouseStock: new DecimalQuantity('5.000'),
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
      expirationDate: new Date(Date.now() + 24 * 3600 * 1000), // expira en 24h
      status: 'ACTIVE',
      createdAt: new Date(),
      hoursRemaining: 24,
      isCriticalAlert: true,
    });

    useCase = new SuggestRescueRecipesUseCase(
      remanenteQueryRepo,
      stockRepo,
      aiConfigRepo,
      fakeAiGateway,
      recipeRepo,
      heuristicAdapter
    );
  });

  describe('TK-124: Modo Catálogo Propio (Zero Data Leakage - Guard 9)', () => {
    it('genera sugerencias exclusivamente a partir de las recetas del restaurante sin invocar a la IA externa', async () => {
      await recipeRepo.save(
        new Recipe(
          'rec-salsa-pomodoro',
          'Salsa Pomodoro Clásica',
          'SALSAS',
          [
            new RecipeIngredient('ri-1', 'rec-salsa-pomodoro', 'ins-tomate', new DecimalQuantity('1.500')),
          ],
          'Salsa casera con tomates maduros'
        )
      );

      const result = await useCase.execute('CATALOG');

      expect(result.source).toBe('CATALOG');
      expect(result.proposals).toHaveLength(1);
      expect(result.proposals[0].name).toBe('Salsa Pomodoro Clásica');
      expect(result.proposals[0].ingredients[0].insumoName).toBe('Tomate Perita');
      expect(result.proposals[0].ingredients[0].isAtRisk).toBe(true);
      expect(result.proposals[0].preventedWasteEstimate).toBe('1.500');
      // ZERO DATA LEAKAGE: La IA externa JAMÁS es invocada
      expect(fakeAiGateway.callCount).toBe(0);
    });

    it('devuelve lista vacía con origen CATALOG si ninguna receta del catálogo coincide con los insumos en riesgo', async () => {
      await recipeRepo.save(
        new Recipe(
          'rec-postre-crema',
          'Flan con Crema',
          'POSTRES',
          [
            new RecipeIngredient('ri-2', 'rec-postre-crema', 'ins-crema', new DecimalQuantity('0.500')),
          ]
        )
      );

      // Solo ins-tomate está en riesgo
      const result = await useCase.execute('CATALOG');

      expect(result.source).toBe('CATALOG');
      expect(result.proposals).toHaveLength(0);
      expect(fakeAiGateway.callCount).toBe(0);
    });
  });

  describe('Modo Creativo Libre con IA (TK-122)', () => {
    it('genera sugerencias exitosamente desde el gateway de IA configurado en modo CREATIVE', async () => {
      await aiConfigRepo.saveConfig(
        new AiConfiguration({
          id: 'ai-config-1',
          provider: 'GEMINI',
          modelName: 'gemini-1.5-flash',
          endpointUrl: null,
          encryptedApiKey: null,
          temperature: 0.1,
          replenishmentOn: false,
          rescueRecipesOn: true,
          anomalyAuditOn: false,
        })
      );

      const result = await useCase.execute('CREATIVE');

      expect(result.source).toBe('GEMINI');
      expect(result.proposals).toHaveLength(1);
      expect(result.proposals[0].name).toBe('Guiso de Rescate Fake');
      expect(fakeAiGateway.callCount).toBe(1);
    });

    it('conmuta automáticamente a HEURISTIC sin lanzar error si el proveedor de IA falla (Guard 28 Fallback Transparente)', async () => {
      await aiConfigRepo.saveConfig(
        new AiConfiguration({
          id: 'ai-config-1',
          provider: 'GEMINI',
          modelName: 'gemini-1.5-flash',
          endpointUrl: null,
          encryptedApiKey: null,
          temperature: 0.1,
          replenishmentOn: false,
          rescueRecipesOn: true,
          anomalyAuditOn: false,
        })
      );

      fakeAiGateway.shouldFail = true;
      fakeAiGateway.failureMessage = 'Gateway timeout 5000ms';

      const result = await useCase.execute('CREATIVE');

      expect(result.source).toBe('HEURISTIC');
      expect(result.proposals.length).toBeGreaterThanOrEqual(1);
      expect(result.proposals[0].name).toContain('Tomate Perita');
    });

    it('utiliza directamente el motor heurístico local si provider está configurado en HEURISTIC', async () => {
      await aiConfigRepo.saveConfig(
        new AiConfiguration({
          id: 'ai-config-1',
          provider: 'HEURISTIC',
          modelName: 'heuristic-rules-engine',
          endpointUrl: null,
          encryptedApiKey: null,
          temperature: 0.0,
          replenishmentOn: false,
          rescueRecipesOn: true,
          anomalyAuditOn: false,
        })
      );

      const result = await useCase.execute('CREATIVE');

      expect(result.source).toBe('HEURISTIC');
      expect(result.proposals.length).toBeGreaterThanOrEqual(1);
      expect(fakeAiGateway.callCount).toBe(0);
    });
  });
});

