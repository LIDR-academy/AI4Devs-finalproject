import { IRemanenteQueryRepository, ActiveRemanenteDTO } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import { IAiConfigurationRepository } from '../../../domain/settings/repositories/IAiConfigurationRepository.js';
import {
  IAiRecipeGeneratorGateway,
  AtRiskRemanenteContext,
  AvailableInsumoContext,
  RecipeGenerationOptions,
} from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { HeuristicRecipeGeneratorAdapter } from '../../../infrastructure/recipes/gateways/HeuristicRecipeGeneratorAdapter.js';
import { CredentialEncryptionService } from '../../../infrastructure/security/CredentialEncryptionService.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';



export interface RescueSuggestionsDto {
  source: 'CATALOG' | 'GEMINI' | 'OPENAI_COMPATIBLE' | 'HEURISTIC';
  proposals: Array<{
    name: string;
    description: string;
    category: string;
    estimatedPortions: number;
    ingredients: Array<{
      insumoId: string;
      insumoName: string;
      quantity: string;
      unit: string;
      isAtRisk: boolean;
    }>;
    preventedWasteEstimate: string;
  }>;
}

export class SuggestRescueRecipesUseCase {
  constructor(
    private readonly remanenteQueryRepo: IRemanenteQueryRepository,
    private readonly insumoRepo: IInsumoRepository,
    private readonly aiConfigRepo: IAiConfigurationRepository,
    private readonly aiGateway: IAiRecipeGeneratorGateway,
    private readonly recipeRepo: IRecipeRepository,
    private readonly fallbackGateway: IAiRecipeGeneratorGateway = new HeuristicRecipeGeneratorAdapter(),
    private readonly encryptionService: CredentialEncryptionService = new CredentialEncryptionService()
  ) {}

  async execute(mode: 'CATALOG' | 'CREATIVE' = 'CATALOG'): Promise<RescueSuggestionsDto> {
    const activeRemanentes = await this.remanenteQueryRepo.findActiveRemanentes();
    const atRiskRemanentes = this.filterAtRiskRemanentes(activeRemanentes);
    const allInsumos = await this.insumoRepo.findAll();
    const insumoMap = new Map<string, Insumo>(allInsumos.map((i) => [i.id, i]));

    // MODO CATALOG: Zero Data Leakage (Guard 9). 100% local, sin invocar IA externa.
    if (mode === 'CATALOG') {
      return this.generateFromCatalog(atRiskRemanentes, insumoMap);
    }

    // MODO CREATIVE: Generación libre con IA externa (o fallback heurístico local)
    const availableInsumos: AvailableInsumoContext[] = allInsumos.map((i) => ({
      id: i.id,
      name: i.name,
      unitOfMeasure: i.unitOfMeasure,
    }));

    const aiConfig = await this.aiConfigRepo.getConfig();

    if (aiConfig.provider === 'HEURISTIC' || !aiConfig.rescueRecipesOn) {
      const proposals = await this.fallbackGateway.generateProposals(atRiskRemanentes, availableInsumos, {
        modelName: aiConfig.modelName,
        temperature: aiConfig.temperature,
        apiKey: null,
        endpointUrl: null,
      });
      return this.formatResponse(proposals, 'HEURISTIC');
    }

    const apiKey = this.resolveApiKey(aiConfig.encryptedApiKey ?? null, aiConfig.provider);
    const options: RecipeGenerationOptions = {
      modelName: aiConfig.modelName,
      temperature: aiConfig.temperature,
      apiKey,
      endpointUrl: aiConfig.endpointUrl ?? null,
    };

    return this.generateWithFallback(atRiskRemanentes, availableInsumos, options, aiConfig.provider);
  }

  private async generateFromCatalog(
    atRiskRemanentes: AtRiskRemanenteContext[],
    insumoMap: Map<string, Insumo>
  ): Promise<RescueSuggestionsDto> {
    const allRecipes = await this.recipeRepo.findAll();
    const atRiskInsumoIds = new Set(atRiskRemanentes.map((r) => r.insumoId));
    const topRecipes = this.rankCatalogRecipes(allRecipes, atRiskInsumoIds);

    const proposals = topRecipes.map(({ recipe, preventedWaste }) =>
      this.formatCatalogProposal(recipe, preventedWaste, insumoMap, atRiskInsumoIds)
    );

    return {
      source: 'CATALOG',
      proposals,
    };
  }

  private rankCatalogRecipes(allRecipes: Recipe[], atRiskInsumoIds: Set<string>) {
    const scoredRecipes = allRecipes
      .map((recipe) => {
        const matching = recipe.ingredients.filter((ing) => atRiskInsumoIds.has(ing.insumoId));
        if (matching.length === 0) return null;

        let preventedWaste = new DecimalQuantity('0');
        for (const ing of matching) {
          preventedWaste = preventedWaste.add(ing.quantity);
        }

        return { recipe, matchingCount: matching.length, preventedWaste };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    scoredRecipes.sort((a, b) => {
      if (b.matchingCount !== a.matchingCount) return b.matchingCount - a.matchingCount;
      if (!b.preventedWaste.toDecimal().equals(a.preventedWaste.toDecimal())) {
        return b.preventedWaste.toDecimal().greaterThan(a.preventedWaste.toDecimal()) ? -1 : 1;
      }
      return a.recipe.name.localeCompare(b.recipe.name);
    });

    return scoredRecipes.slice(0, 3);
  }

  private formatCatalogProposal(
    recipe: Recipe,
    preventedWaste: DecimalQuantity,
    insumoMap: Map<string, Insumo>,
    atRiskInsumoIds: Set<string>
  ) {
    const ingredients = recipe.ingredients.map((ing) => {
      const insumo = insumoMap.get(ing.insumoId);
      return {
        insumoId: ing.insumoId,
        insumoName: insumo ? insumo.name : 'Insumo',
        quantity: ing.quantity.toString(),
        unit: insumo ? insumo.unitOfMeasure : 'UNIDAD',
        isAtRisk: atRiskInsumoIds.has(ing.insumoId),
      };
    });

    return {
      name: recipe.name,
      description:
        recipe.description ||
        `Receta del catálogo propio para aprovechar insumos en riesgo sin generar mermas.`,
      category: recipe.category,
      estimatedPortions: 4,
      ingredients,
      preventedWasteEstimate: preventedWaste.toString(),
    };
  }


  private async generateWithFallback(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions,
    preferredSource: 'GEMINI' | 'OPENAI_COMPATIBLE'
  ): Promise<RescueSuggestionsDto> {
    try {
      const proposals = await this.aiGateway.generateProposals(remanentes, insumos, options);
      return this.formatResponse(proposals, preferredSource);
    } catch (err) {
      console.warn('[SuggestRescueRecipesUseCase] Fallo de IA remota, activando fallback heurístico local:', err);
      const fallbackProposals = await this.fallbackGateway.generateProposals(remanentes, insumos, options);
      return this.formatResponse(fallbackProposals, 'HEURISTIC');
    }
  }

  private filterAtRiskRemanentes(activeRemanentes: ActiveRemanenteDTO[]): AtRiskRemanenteContext[] {
    const atRisk = activeRemanentes.filter(
      (r) => r.isCriticalAlert || (r.hoursRemaining !== undefined && r.hoursRemaining <= 48)
    );

    const source = atRisk.length > 0 ? atRisk : activeRemanentes.slice(0, 5);

    return source.map((r) => ({
      id: r.id,
      insumoId: r.insumoId,
      insumoName: r.insumoName,
      quantity: new DecimalQuantity(r.currentQuantity),
      unitOfMeasure: r.unitOfMeasure,
      hoursRemaining: r.hoursRemaining,
    }));
  }

  private resolveApiKey(encryptedKey: string | null, provider: string): string | null {
    if (encryptedKey) {
      try {
        return this.encryptionService.decrypt(encryptedKey);
      } catch (err) {
        console.warn('[SuggestRescueRecipesUseCase] No se pudo descifrar la clave de base de datos:', err);
      }
    }
    return provider === 'GEMINI'
      ? process.env.GEMINI_API_KEY || null
      : process.env.OPENAI_API_KEY || null;
  }

  private formatResponse(
    proposals: RescueRecipeProposal[],
    source: 'GEMINI' | 'OPENAI_COMPATIBLE' | 'HEURISTIC'
  ): RescueSuggestionsDto {
    return {
      source,
      proposals: proposals.map((p) => ({
        name: p.name,
        description: p.description,
        category: p.category,
        estimatedPortions: p.estimatedPortions,
        ingredients: p.ingredients.map((ing) => ({
          insumoId: ing.insumoId,
          insumoName: ing.insumoName,
          quantity: ing.quantity.toString(),
          unit: ing.unit,
          isAtRisk: ing.isAtRisk,
        })),
        preventedWasteEstimate: p.preventedWasteEstimate.toString(),
      })),
    };
  }
}

