import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import { IRemanenteQueryRepository } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

export interface IngredientAvailabilityDTO {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  requiredQuantity: string;
  availableQuantity: string;
  isSufficient: boolean;
}

export interface RecipeAvailabilityDTO {
  recipeId: string;
  recipeName: string;
  portions: number;
  ingredients: IngredientAvailabilityDTO[];
  isFullyAvailable: boolean;
}

/**
 * US-007 v1.1.0 / TK-111: proyección de solo lectura — reutiliza exactamente el mismo
 * cálculo que `ConsumeRecipeUseCase.consumeIngredient` (requerido = `quantity × portions`,
 * disponible = suma de remanentes activos del insumo) pero sin mutar nada, para que el
 * cocinero vea el quiebre de stock ANTES de confirmar, no como un `422` recién al intentar.
 */
export class GetRecipeAvailabilityUseCase {
  constructor(
    private readonly recipeRepository: IRecipeRepository,
    private readonly insumoRepository: IInsumoRepository,
    private readonly remanenteQueryRepository: IRemanenteQueryRepository
  ) {}

  public async execute(recipeId: string, portions = 1): Promise<RecipeAvailabilityDTO> {
    const recipe = await this.recipeRepository.findById(recipeId);
    if (!recipe) {
      throw new EntityNotFoundException('Recipe', recipeId);
    }

    const ingredients = await Promise.all(
      recipe.ingredients.map((ingredient) => this.resolveIngredientAvailability(ingredient, portions))
    );

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      portions,
      ingredients,
      isFullyAvailable: ingredients.every((i) => i.isSufficient),
    };
  }

  private async resolveIngredientAvailability(
    ingredient: RecipeIngredient,
    portions: number
  ): Promise<IngredientAvailabilityDTO> {
    const requiredQty = new DecimalQuantity(ingredient.quantity.toDecimal().mul(portions));

    const [insumo, activeRemanentes] = await Promise.all([
      this.insumoRepository.findById(ingredient.insumoId),
      this.remanenteQueryRepository.findActiveRemanentes(undefined, ingredient.insumoId),
    ]);

    let availableQty = new DecimalQuantity(0);
    for (const remanente of activeRemanentes) {
      availableQty = availableQty.add(new DecimalQuantity(remanente.currentQuantity));
    }

    return {
      insumoId: ingredient.insumoId,
      insumoName: insumo?.name ?? ingredient.insumoId,
      unitOfMeasure: insumo?.unitOfMeasure ?? '',
      requiredQuantity: requiredQty.toString(),
      availableQuantity: availableQty.toString(),
      isSufficient: availableQty.isGreaterThanOrEqualTo(requiredQty),
    };
  }
}
