import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';

export class RecipeIngredient {
  constructor(
    public readonly id: string,
    public readonly recipeId: string,
    public readonly insumoId: string,
    public readonly quantity: DecimalQuantity
  ) {}
}
