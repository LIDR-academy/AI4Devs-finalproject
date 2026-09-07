import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';

interface RawRescueProposalJson {
  name: string;
  description: string;
  category: string;
  estimatedPortions: number;
  ingredients: Array<{
    insumoId: string;
    insumoName: string;
    quantity: string | number;
    unit: string;
    isAtRisk: boolean;
  }>;
  preventedWasteEstimate: string | number;
}

const DEFAULT_CATEGORY = 'PLATO_PRINCIPAL';
const DEFAULT_PORTIONS = 4;

/**
 * Parser compartido de la respuesta JSON de un proveedor de IA (Gemini / OpenAI
 * compatible) a entidades de dominio `RescueRecipeProposal`. Antes duplicado byte a
 * byte entre `GeminiRecipeGeneratorAdapter` y `OpenAiCompatibleRecipeGeneratorAdapter`
 * (TK-125 / AUDIT-DEV-007 F-6).
 */
export function parseRescueProposalsJson(rawText: string): RescueRecipeProposal[] {
  const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned) as RawRescueProposalJson[];

  if (!Array.isArray(parsed)) {
    throw new Error('La respuesta del proveedor de IA no es un array JSON.');
  }

  return parsed.map(toRescueRecipeProposal);
}

function toRescueRecipeProposal(raw: RawRescueProposalJson): RescueRecipeProposal {
  const ingredients: RescueIngredientItem[] = (raw.ingredients || []).map((ing) => ({
    insumoId: ing.insumoId,
    insumoName: ing.insumoName,
    quantity: new DecimalQuantity(ing.quantity),
    unit: ing.unit,
    isAtRisk: Boolean(ing.isAtRisk),
  }));

  // `preventedWasteEstimate` que reporta el modelo se ignora — el valor autoritativo
  // se calcula desde `unitCost` en el mapper (TK-128 F-1).
  return new RescueRecipeProposal(
    raw.name,
    raw.description,
    raw.category || DEFAULT_CATEGORY,
    raw.estimatedPortions || DEFAULT_PORTIONS,
    ingredients
  );
}
