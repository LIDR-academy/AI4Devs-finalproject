import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';

export interface RescueIngredientItem {
  insumoId: string;
  insumoName: string;
  quantity: DecimalQuantity;
  unit: string;
  isAtRisk: boolean;
}

export class RescueRecipeProposal {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly category: string,
    public readonly estimatedPortions: number,
    public readonly ingredients: RescueIngredientItem[],
    public readonly preventedWasteEstimate: DecimalQuantity
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre de la propuesta de receta no puede estar vacío.');
    }
    if (estimatedPortions <= 0) {
      throw new Error('Las porciones estimadas deben ser mayores a cero.');
    }
    if (ingredients.length === 0) {
      throw new Error('La propuesta de receta debe incluir al menos un ingrediente.');
    }
  }
}
