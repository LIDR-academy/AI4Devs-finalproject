import { RescueRecipeProposal } from '../../../domain/recipes/entities/RescueRecipeProposal.js';

/**
 * Frontera de confianza para la salida de un LLM (C-DEV-007-2 / `backend_rules.md §7`,
 * AUDIT-DEV-007 F-4). El modelo puede alucinar un `insumoId` que no existe en el
 * catálogo que le pasamos. Política (decidida con el humano, Q2): descartar el
 * ingrediente inválido; si la propuesta queda sin ingredientes válidos, se descarta
 * entera. Ningún `insumoId` alucinado cruza hacia la capa de aplicación.
 *
 */
export function sanitizeRescueProposals(
  proposals: RescueRecipeProposal[],
  validInsumoIds: ReadonlySet<string>
): RescueRecipeProposal[] {
  const sanitized: RescueRecipeProposal[] = [];

  for (const proposal of proposals) {
    const keptIngredients = proposal.ingredients.filter((ing) => validInsumoIds.has(ing.insumoId));

    if (keptIngredients.length === 0) {
      continue;
    }
    if (keptIngredients.length === proposal.ingredients.length) {
      sanitized.push(proposal);
      continue;
    }

    sanitized.push(
      new RescueRecipeProposal(
        proposal.name,
        proposal.description,
        proposal.category,
        proposal.estimatedPortions,
        keptIngredients
      )
    );
  }

  return sanitized;
}
