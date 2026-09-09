import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';
import { RescueIngredientItem } from '../entities/RescueRecipeProposal.js';

/**
 * Valor monetario del stock en riesgo que una receta de rescate aprovecharía
 * (AUDIT-DEV-007 F-1 / `domain_rules.md §2` / US-035 Escenario 5-6): suma de
 * `unitCost × quantity` sobre los ingredientes marcados `isAtRisk`.
 *
 * Devuelve `null` — nunca `0` — si algún ingrediente en riesgo no tiene `unitCost`
 * registrado, para no dar una cifra falsamente precisa (misma regla que `US-019`).
 * Sumar cantidades físicas de distinta unidad estaba prohibido (`C-DEV-007-1`); el
 * dinero es la magnitud homogénea correcta.
 */
export function computePreventedWasteCost(
  ingredients: RescueIngredientItem[],
  unitCostByInsumoId: ReadonlyMap<string, DecimalQuantity>
): DecimalQuantity | null {
  const atRisk = ingredients.filter((ingredient) => ingredient.isAtRisk);
  if (atRisk.length === 0) {
    return null;
  }

  let total = new DecimalQuantity('0');
  for (const ingredient of atRisk) {
    const unitCost = unitCostByInsumoId.get(ingredient.insumoId);
    if (!unitCost) {
      return null;
    }
    total = total.add(new DecimalQuantity(ingredient.quantity.toDecimal().mul(unitCost.toDecimal())));
  }
  return total;
}
