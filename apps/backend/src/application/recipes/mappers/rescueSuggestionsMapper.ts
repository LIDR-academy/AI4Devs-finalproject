import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { RescueGenerationSource } from '../../../domain/recipes/gateways/IRescueRecipeGenerationGateway.js';
import { computePreventedWasteCost } from '../../../domain/recipes/services/preventedWasteCost.js';

/** `CATALOG` = cruce 100% local (Zero Data Leakage); el resto = motor de generación. */
export type RescueSuggestionsSource = RescueGenerationSource | 'CATALOG';

interface RescueSuggestionIngredientDTO {
  insumoId: string;
  insumoName: string;
  quantity: string;
  unit: string;
  isAtRisk: boolean;
}

interface RescueSuggestionProposalDTO {
  name: string;
  description: string;
  category: string;
  estimatedPortions: number;
  ingredients: RescueSuggestionIngredientDTO[];
  /** Valor monetario del stock en riesgo que la receta aprovecha; `null` si falta algún `unitCost`. */
  preventedWasteCost: string | null;
}

export interface RescueSuggestionsDto {
  source: RescueSuggestionsSource;
  proposals: RescueSuggestionProposalDTO[];
}

const MONEY_DECIMALS = 2;

/**
 * Único punto de conversión `RescueRecipeProposal` (dominio) → DTO de respuesta HTTP
 * (TK-125 F-6). El `preventedWasteCost` se valoriza aquí a partir de `unitCostByInsumoId`
 * (TK-128 F-1 / US-035 Esc. 5-6).
 */
export function toRescueSuggestionsDto(
  source: RescueSuggestionsSource,
  proposals: RescueRecipeProposal[],
  unitCostByInsumoId: ReadonlyMap<string, DecimalQuantity>
): RescueSuggestionsDto {
  return {
    source,
    proposals: proposals.map((proposal) => {
      const cost = computePreventedWasteCost(proposal.ingredients, unitCostByInsumoId);
      return {
        name: proposal.name,
        description: proposal.description,
        category: proposal.category,
        estimatedPortions: proposal.estimatedPortions,
        ingredients: proposal.ingredients.map((ingredient) => ({
          insumoId: ingredient.insumoId,
          insumoName: ingredient.insumoName,
          quantity: ingredient.quantity.toString(),
          unit: ingredient.unit,
          isAtRisk: ingredient.isAtRisk,
        })),
        preventedWasteCost: cost ? cost.toDecimal().toFixed(MONEY_DECIMALS) : null,
      };
    }),
  };
}
