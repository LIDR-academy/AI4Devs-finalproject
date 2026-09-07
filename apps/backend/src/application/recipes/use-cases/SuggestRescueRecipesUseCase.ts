import { IRemanenteQueryRepository, ActiveRemanenteDTO } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import { IAiRecipeGenerationOptionsResolver } from '../../../domain/recipes/gateways/IAiRecipeGenerationOptionsResolver.js';
import { IRescueRecipeGenerationGateway } from '../../../domain/recipes/gateways/IRescueRecipeGenerationGateway.js';
import { AtRiskRemanenteContext, AvailableInsumoContext } from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Recipe } from '../../../domain/recipes/entities/Recipe.js';
import { RescueSuggestionsDto, toRescueSuggestionsDto } from '../mappers/rescueSuggestionsMapper.js';

export type { RescueSuggestionsDto } from '../mappers/rescueSuggestionsMapper.js';

const CATALOG_PROPOSAL_LIMIT = 3;
const AT_RISK_HOURS_THRESHOLD = 48;
const FALLBACK_REMANENTE_SAMPLE = 5;
const DEFAULT_CATALOG_PORTIONS = 4;
const CATALOG_DESCRIPTION_FALLBACK =
  'Receta del catálogo propio para aprovechar insumos en riesgo sin generar mermas.';

export class SuggestRescueRecipesUseCase {
  constructor(
    private readonly remanenteQueryRepo: IRemanenteQueryRepository,
    private readonly insumoRepo: IInsumoRepository,
    private readonly recipeRepo: IRecipeRepository,
    private readonly optionsResolver: IAiRecipeGenerationOptionsResolver,
    private readonly generationGateway: IRescueRecipeGenerationGateway
  ) {}

  async execute(mode: 'CATALOG' | 'CREATIVE' = 'CATALOG'): Promise<RescueSuggestionsDto> {
    const activeRemanentes = await this.remanenteQueryRepo.findActiveRemanentes();
    const atRiskRemanentes = this.filterAtRiskRemanentes(activeRemanentes);
    const allInsumos = await this.insumoRepo.findAll();

    // MODO CATALOG: Zero Data Leakage (Guard 9). 100% local, sin invocar IA externa.
    if (mode === 'CATALOG') {
      const insumoMap = new Map<string, Insumo>(allInsumos.map((i) => [i.id, i]));
      const proposals = await this.buildCatalogProposals(atRiskRemanentes, insumoMap);
      return toRescueSuggestionsDto('CATALOG', proposals);
    }

    // MODO CREATIVE: generación con IA externa (o fallback heurístico local), con la
    // selección de proveedor, resolución de credencial y fallback resueltos en infra.
    const availableInsumos: AvailableInsumoContext[] = allInsumos.map((i) => ({
      id: i.id,
      name: i.name,
      unitOfMeasure: i.unitOfMeasure,
    }));
    const options = await this.optionsResolver.resolve();
    const { source, proposals } = await this.generationGateway.generate(
      atRiskRemanentes,
      availableInsumos,
      options
    );
    return toRescueSuggestionsDto(source, proposals);
  }

  private async buildCatalogProposals(
    atRiskRemanentes: AtRiskRemanenteContext[],
    insumoMap: Map<string, Insumo>
  ): Promise<RescueRecipeProposal[]> {
    const atRiskInsumoIds = new Set(atRiskRemanentes.map((r) => r.insumoId));
    // AUDIT-DEV-007 F-7: solo las recetas que tocan un insumo en riesgo, no todo el catálogo.
    const candidateRecipes = await this.recipeRepo.findByInsumoIds([...atRiskInsumoIds]);
    return this.rankCatalogRecipes(candidateRecipes, atRiskInsumoIds).map(({ recipe, preventedWaste }) =>
      this.toCatalogProposal(recipe, preventedWaste, insumoMap, atRiskInsumoIds)
    );
  }

  // `candidateRecipes` ya viene filtrado por `findByInsumoIds` — toda receta aquí
  // tiene al menos un ingrediente en riesgo (F-7).
  private rankCatalogRecipes(candidateRecipes: Recipe[], atRiskInsumoIds: Set<string>) {
    const scored = candidateRecipes.map((recipe) => {
      const matching = recipe.ingredients.filter((ing) => atRiskInsumoIds.has(ing.insumoId));
      let preventedWaste = new DecimalQuantity('0');
      for (const ing of matching) {
        preventedWaste = preventedWaste.add(ing.quantity);
      }
      return { recipe, matchingCount: matching.length, preventedWaste };
    });

    scored.sort((a, b) => {
      if (b.matchingCount !== a.matchingCount) return b.matchingCount - a.matchingCount;
      const bWaste = b.preventedWaste.toDecimal();
      const aWaste = a.preventedWaste.toDecimal();
      if (!bWaste.equals(aWaste)) return bWaste.greaterThan(aWaste) ? -1 : 1;
      return a.recipe.name.localeCompare(b.recipe.name);
    });

    return scored.slice(0, CATALOG_PROPOSAL_LIMIT);
  }

  private toCatalogProposal(
    recipe: Recipe,
    preventedWaste: DecimalQuantity,
    insumoMap: Map<string, Insumo>,
    atRiskInsumoIds: Set<string>
  ): RescueRecipeProposal {
    const ingredients: RescueIngredientItem[] = recipe.ingredients.map((ing) => {
      const insumo = insumoMap.get(ing.insumoId);
      return {
        insumoId: ing.insumoId,
        insumoName: insumo ? insumo.name : 'Insumo',
        quantity: ing.quantity,
        unit: insumo ? insumo.unitOfMeasure : 'UNIDAD',
        isAtRisk: atRiskInsumoIds.has(ing.insumoId),
      };
    });

    return new RescueRecipeProposal(
      recipe.name,
      recipe.description || CATALOG_DESCRIPTION_FALLBACK,
      recipe.category,
      DEFAULT_CATALOG_PORTIONS,
      ingredients,
      preventedWaste
    );
  }

  private filterAtRiskRemanentes(activeRemanentes: ActiveRemanenteDTO[]): AtRiskRemanenteContext[] {
    const atRisk = activeRemanentes.filter(
      (r) => r.isCriticalAlert || (r.hoursRemaining !== undefined && r.hoursRemaining <= AT_RISK_HOURS_THRESHOLD)
    );

    const source = atRisk.length > 0 ? atRisk : activeRemanentes.slice(0, FALLBACK_REMANENTE_SAMPLE);

    return source.map((r) => ({
      id: r.id,
      insumoId: r.insumoId,
      insumoName: r.insumoName,
      quantity: new DecimalQuantity(r.currentQuantity),
      unitOfMeasure: r.unitOfMeasure,
      hoursRemaining: r.hoursRemaining,
    }));
  }
}
