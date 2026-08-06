import { IRecipeRepository } from '../../../domain/catalog/repositories/IRecipeRepository.js';
import { IStockRepository } from '../../../domain/stock/repositories/IStockRepository.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { ExcessConsumptionException } from '../../../domain/kitchen/errors/ExcessConsumptionException.js';

export interface ConsumeRecipeCommand {
  recipeId: string;
  portions?: number;
}

export interface RecipeConsumptionResult {
  recipeId: string;
  recipeName: string;
  portions: number;
  ingredientsConsumed: Array<{
    insumoId: string;
    totalConsumed: string;
    remanentesAffectedCount: number;
  }>;
}

export class ConsumeRecipeUseCase {
  constructor(
    private recipeRepository: IRecipeRepository,
    private stockRepository: IStockRepository
  ) {}

  async execute(command: ConsumeRecipeCommand): Promise<RecipeConsumptionResult> {
    const portions = command.portions || 1;
    const recipe = await this.recipeRepository.findById(command.recipeId);

    if (!recipe) {
      throw new EntityNotFoundException('Recipe', command.recipeId);
    }

    const ingredientsConsumedSummary: Array<{
      insumoId: string;
      totalConsumed: string;
      remanentesAffectedCount: number;
    }> = [];

    // Validar y ejecutar la cascada FEFO por cada ingrediente
    for (const ingredient of recipe.ingredients) {
      const singleQty = ingredient.quantity.toDecimal();
      const requiredQtyDecimal = singleQty.mul(portions);
      const requiredQty = new DecimalQuantity(requiredQtyDecimal);

      const activeRemanentes = await this.stockRepository.findActiveRemanentesByInsumoId(
        ingredient.insumoId
      );

      // Calcular stock total disponible en remanentes activos
      let totalAvailable = new DecimalQuantity(0);
      for (const r of activeRemanentes) {
        totalAvailable = totalAvailable.add(r.currentQuantity);
      }

      if (!totalAvailable.isGreaterThanOrEqualTo(requiredQty)) {
        throw new ExcessConsumptionException(
          requiredQty.toString(),
          totalAvailable.toString()
        );
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
        await this.stockRepository.saveRemanente(remanente);

        remainingToDeductDecimal = remainingToDeductDecimal.sub(amountToDeductDecimal);
        affectedCount++;
      }

      ingredientsConsumedSummary.push({
        insumoId: ingredient.insumoId,
        totalConsumed: requiredQty.toString(),
        remanentesAffectedCount: affectedCount,
      });
    }

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      portions,
      ingredientsConsumed: ingredientsConsumedSummary,
    };
  }
}
