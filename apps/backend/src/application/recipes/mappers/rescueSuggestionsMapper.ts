import { RescueRecipeProposal } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { RescueGenerationSource } from '../../../domain/recipes/gateways/IRescueRecipeGenerationGateway.js';

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
  preventedWasteEstimate: string;
}

export interface RescueSuggestionsDto {
  source: RescueSuggestionsSource;
  proposals: RescueSuggestionProposalDTO[];
}

/**
 * Único punto de conversión `RescueRecipeProposal` (dominio) → DTO de respuesta HTTP,
 * compartido por las rutas CATALOG y CREATIVE de `SuggestRescueRecipesUseCase`
 * (TK-125 / AUDIT-DEV-007 F-6 — antes duplicado en `formatCatalogProposal`,
 * `formatResponse` y el parser de cada adapter). Mismo patrón que
 * `application/kitchen/mappers/temperatureLogOutputMapper.ts`.
 */
export function toRescueSuggestionsDto(
  source: RescueSuggestionsSource,
  proposals: RescueRecipeProposal[]
): RescueSuggestionsDto {
  return {
    source,
    proposals: proposals.map((proposal) => ({
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
      preventedWasteEstimate: proposal.preventedWasteEstimate.toString(),
    })),
  };
}
