import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import { IRemanenteRepository } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { ExcessConsumptionException } from '../../../domain/kitchen/errors/ExcessConsumptionException.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';

export interface ConsumeRecipeCommand {
  recipeId: string;
  portions?: number;
}

export interface IngredientConsumptionSummary {
  insumoId: string;
  totalConsumed: string;
  remanentesAffectedCount: number;
}

export interface RecipeConsumptionResult {
  recipeId: string;
  recipeName: string;
  portions: number;
  ingredientsConsumed: IngredientConsumptionSummary[];
}

export class ConsumeRecipeUseCase {
  constructor(
    private recipeRepository: IRecipeRepository,
    private remanenteRepository: IRemanenteRepository
  ) {}

  async execute(command: ConsumeRecipeCommand): Promise<RecipeConsumptionResult> {
    const portions = command.portions || 1;
    const recipe = await this.recipeRepository.findById(command.recipeId);

    if (!recipe) {
      throw new EntityNotFoundException('Recipe', command.recipeId);
    }

    const ingredientsConsumedSummary: IngredientConsumptionSummary[] = [];
    for (const ingredient of recipe.ingredients) {
      ingredientsConsumedSummary.push(await this.consumeIngredient(ingredient, portions));
    }

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      portions,
      ingredientsConsumed: ingredientsConsumedSummary,
    };
  }

  // Valida el stock disponible y ejecuta la cascada FEFO de un único ingrediente
  private async consumeIngredient(
    ingredient: RecipeIngredient,
    portions: number
  ): Promise<IngredientConsumptionSummary> {
    const requiredQtyDecimal = ingredient.quantity.toDecimal().mul(portions);
    const requiredQty = new DecimalQuantity(requiredQtyDecimal);

    const activeRemanentes = await this.remanenteRepository.findActiveRemanentesByInsumoId(ingredient.insumoId);

    let totalAvailable = new DecimalQuantity(0);
    for (const r of activeRemanentes) {
      totalAvailable = totalAvailable.add(r.currentQuantity);
    }

    if (!totalAvailable.isGreaterThanOrEqualTo(requiredQty)) {
      throw new ExcessConsumptionException(requiredQty.toString(), totalAvailable.toString());
    }

    // Aplicar cascada FEFO sobre remanentes ordenados por vencimiento asc
    let remainingToDeductDecimal = requiredQtyDecimal;
    let affectedCount = 0;

    for (const remanente of activeRemanentes) {
      if (remainingToDeductDecimal.isZero()) break;

      const currentRemDecimal = remanente.currentQuantity.toDecimal();
      const amountToDeductDecimal = currentRemDecimal.lessThanOrEqualTo(remainingToDeductDecimal)
        ? currentRemDecimal
        : remainingToDeductDecimal;

      remanente.consumeQuantity(new DecimalQuantity(amountToDeductDecimal));
      await this.remanenteRepository.saveRemanente(remanente);

      remainingToDeductDecimal = remainingToDeductDecimal.sub(amountToDeductDecimal);
      affectedCount++;
    }

    return {
      insumoId: ingredient.insumoId,
      totalConsumed: requiredQty.toString(),
      remanentesAffectedCount: affectedCount,
    };
  }
}
