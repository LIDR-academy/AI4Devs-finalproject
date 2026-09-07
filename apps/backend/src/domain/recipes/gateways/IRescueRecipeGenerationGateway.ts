import { RescueRecipeProposal } from '../entities/RescueRecipeProposal.js';
import {
  AtRiskRemanenteContext,
  AvailableInsumoContext,
  RecipeGenerationOptions,
} from './IAiRecipeGeneratorGateway.js';

export type RescueGenerationSource = 'GEMINI' | 'OPENAI_COMPATIBLE' | 'HEURISTIC';

export interface RescueGenerationResult {
  /** Motor que produjo realmente las propuestas (no el preferido, el usado). */
  source: RescueGenerationSource;
  proposals: RescueRecipeProposal[];
}

/**
 * Puerto de alto nivel para la generación de recetas de rescate en modo CREATIVE.
 * A diferencia de `IAiRecipeGeneratorGateway` (puerto de hoja, un único proveedor),
 * este puerto encapsula la selección de proveedor, el fallback a motor heurístico
 * local ante un fallo de la IA remota, y el reporte del origen efectivo — todo
 * dentro de la capa de infraestructura (TK-125 / AUDIT-DEV-007 F-2).
 */
export interface IRescueRecipeGenerationGateway {
  generate(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions
  ): Promise<RescueGenerationResult>;
}
