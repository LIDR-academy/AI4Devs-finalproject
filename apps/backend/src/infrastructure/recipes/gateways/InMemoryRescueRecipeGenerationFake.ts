import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { AtRiskRemanenteContext, AvailableInsumoContext, RecipeGenerationOptions } from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import {
  IRescueRecipeGenerationGateway,
  RescueGenerationResult,
  RescueGenerationSource,
} from '../../../domain/recipes/gateways/IRescueRecipeGenerationGateway.js';

/**
 * Fake tipado del puerto de generación de recetas de rescate para tests de aplicación.
 * Reemplaza a `InMemoryAiRecipeGeneratorFake` tras TK-125 — el caso de uso ahora
 * depende de `IRescueRecipeGenerationGateway`, no del puerto de hoja.
 */
export class InMemoryRescueRecipeGenerationFake implements IRescueRecipeGenerationGateway {
  public shouldFail = false;
  public failureMessage = 'Simulated AI generation failure';
  public callCount = 0;
  public source: RescueGenerationSource = 'GEMINI';

  async generate(
    remanentes: AtRiskRemanenteContext[],
    _insumos: AvailableInsumoContext[],
    _options: RecipeGenerationOptions
  ): Promise<RescueGenerationResult> {
    this.callCount++;

    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    const ingredients: RescueIngredientItem[] = remanentes.map((r) => ({
      insumoId: r.insumoId,
      insumoName: r.insumoName,
      quantity: r.quantity,
      unit: r.unitOfMeasure,
      isAtRisk: true,
    }));

    return {
      source: this.source,
      proposals: [
        new RescueRecipeProposal(
          'Guiso de Rescate Fake',
          'Propuesta generada para prueba en memoria.',
          'PLATO_PRINCIPAL',
          4,
          ingredients.length > 0
            ? ingredients
            : [
                {
                  insumoId: 'ins-default',
                  insumoName: 'Insumo Base',
                  quantity: new DecimalQuantity(1),
                  unit: 'KG',
                  isAtRisk: false,
                },
              ],
          new DecimalQuantity(0.8)
        ),
      ],
    };
  }
}
