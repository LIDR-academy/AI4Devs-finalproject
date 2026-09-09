import { IRemanenteQueryRepository, ActiveRemanenteDTO } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import { IAiRecipeGenerationOptionsResolver } from '../../../domain/recipes/gateways/IAiRecipeGenerationOptionsResolver.js';
import { IRescueRecipeGenerationGateway } from '../../../domain/recipes/gateways/IRescueRecipeGenerationGateway.js';
import { AtRiskRemanenteContext, AvailableInsumoContext } from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { computePreventedWasteCost } from '../../../domain/recipes/services/preventedWasteCost.js';
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

type UnitCostMap = ReadonlyMap<string, DecimalQuantity>;

interface ScoredProposal {
  proposal: RescueRecipeProposal;
  matchingCount: number;
  cost: DecimalQuantity | null;
}

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
    const unitCostByInsumoId = this.buildUnitCostMap(allInsumos);

    // MODO CATALOG: Zero Data Leakage (Guard 9). 100% local, sin invocar IA externa.
    if (mode === 'CATALOG') {
      const insumoMap = new Map<string, Insumo>(allInsumos.map((i) => [i.id, i]));
      const proposals = await this.buildCatalogProposals(atRiskRemanentes, insumoMap, unitCostByInsumoId);
      return toRescueSuggestionsDto('CATALOG', proposals, unitCostByInsumoId);
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
    return toRescueSuggestionsDto(source, proposals, unitCostByInsumoId);
  }

  private buildUnitCostMap(allInsumos: Insumo[]): UnitCostMap {
    const map = new Map<string, DecimalQuantity>();
    for (const insumo of allInsumos) {
      if (insumo.unitCost) {
        map.set(insumo.id, insumo.unitCost);
      }
    }
    return map;
  }

  private async buildCatalogProposals(
    atRiskRemanentes: AtRiskRemanenteContext[],
    insumoMap: Map<string, Insumo>,
    unitCostByInsumoId: UnitCostMap
  ): Promise<RescueRecipeProposal[]> {
    const atRiskInsumoIds = new Set(atRiskRemanentes.map((r) => r.insumoId));
    // AUDIT-DEV-007 F-7: solo las recetas que tocan un insumo en riesgo, no todo el catálogo.
    const candidateRecipes = await this.recipeRepo.findByInsumoIds([...atRiskInsumoIds]);
    const proposals = candidateRecipes.map((recipe) =>
      this.toCatalogProposal(recipe, insumoMap, atRiskInsumoIds)
    );
    return this.rankCatalogProposals(proposals, unitCostByInsumoId).slice(0, CATALOG_PROPOSAL_LIMIT);
  }

  private rankCatalogProposals(
    proposals: RescueRecipeProposal[],
    unitCostByInsumoId: UnitCostMap
  ): RescueRecipeProposal[] {
    const scored: ScoredProposal[] = proposals.map((proposal) => ({
      proposal,
      matchingCount: proposal.ingredients.filter((ing) => ing.isAtRisk).length,
      cost: computePreventedWasteCost(proposal.ingredients, unitCostByInsumoId),
    }));

    scored.sort((a, b) => {
      if (b.matchingCount !== a.matchingCount) return b.matchingCount - a.matchingCount;
      // AUDIT-DEV-007 F-16: la receta que rescata MÁS valor va primero (`null` al final).
      const byCost = this.compareCostDescending(a.cost, b.cost);
      if (byCost !== 0) return byCost;
      return a.proposal.name.localeCompare(b.proposal.name);
    });

    return scored.map((entry) => entry.proposal);
  }

  private compareCostDescending(a: DecimalQuantity | null, b: DecimalQuantity | null): number {
    if (a === null && b === null) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    const [aValue, bValue] = [a.toDecimal(), b.toDecimal()];
    if (aValue.equals(bValue)) return 0;
    return bValue.greaterThan(aValue) ? 1 : -1;
  }

  private toCatalogProposal(
    recipe: Recipe,
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
      ingredients
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
