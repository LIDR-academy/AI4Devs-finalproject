import { IRecipeRepository } from '../../../domain/recipes/repositories/IRecipeRepository.js';
import {
  AdhocConsumptionUnitOfWork,
  IStockUnitOfWork,
} from '../../../domain/stock/repositories/IStockUnitOfWork.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { ExcessConsumptionException } from '../../../domain/kitchen/errors/ExcessConsumptionException.js';
import { RecipeIngredient } from '../../../domain/recipes/entities/RecipeIngredient.js';
import { Clock } from '../../../domain/shared/Clock.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';

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

/**
 * US-029 / ADR-003 (deuda del `ConsumeRecipeUseCase` legacy, opción B del humano):
 * consumo *ad-hoc* de una receta contra remanentes ya abiertos en cocina, sin
 * extracción ni preparación previa. Corre dentro de `runAdhocConsumption` — un
 * ingrediente sin stock suficiente revierte **todo** lo ya descontado de ingredientes
 * anteriores en la misma llamada (C-DEV-006-1) — y registra `CONSUMPTION_RECIPE`
 * por cada remanente afectado (antes esta vía no dejaba ningún `StockMovement`).
 */
export class ConsumeRecipeUseCase {
  constructor(
    private readonly recipeRepository: IRecipeRepository,
    private readonly unitOfWork: IStockUnitOfWork,
    private readonly clock: Clock,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: ConsumeRecipeCommand): Promise<RecipeConsumptionResult> {
    const portions = command.portions || 1;
    const recipe = await this.recipeRepository.findById(command.recipeId);

    if (!recipe) {
      throw new EntityNotFoundException('Recipe', command.recipeId);
    }

    const now = this.clock.now();
    return this.unitOfWork.runAdhocConsumption(async (uow) => {
      const ingredientsConsumedSummary: IngredientConsumptionSummary[] = [];
      for (const ingredient of recipe.ingredients) {
        ingredientsConsumedSummary.push(await this.consumeIngredient(uow, ingredient, portions, recipe.id, now));
      }

      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
        portions,
        ingredientsConsumed: ingredientsConsumedSummary,
      };
    });
  }

  // Valida el stock disponible y ejecuta la cascada FEFO de un único ingrediente
  private async consumeIngredient(
    uow: AdhocConsumptionUnitOfWork,
    ingredient: RecipeIngredient,
    portions: number,
    recipeId: string,
    now: Date
  ): Promise<IngredientConsumptionSummary> {
    const requiredQtyDecimal = ingredient.quantity.toDecimal().mul(portions);
    const requiredQty = new DecimalQuantity(requiredQtyDecimal);

    const activeRemanentes = await uow.findActiveRemanentesByInsumoId(ingredient.insumoId);

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
      const amountToDeduct = new DecimalQuantity(amountToDeductDecimal);
      const fromLoc = remanente.location;

      remanente.consumeQuantity(amountToDeduct);
      await uow.saveRemanente(remanente);
      await uow.recordMovement({
        id: this.idGenerator.next('mov'),
        insumoId: ingredient.insumoId,
        type: 'CONSUMPTION_RECIPE',
        quantity: amountToDeduct.toString(),
        fromLoc,
        toLoc: `RECIPE:${recipeId}`,
        recipeId,
        createdAt: now,
      });

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
