import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import {
  IAiRecipeGeneratorGateway,
  AtRiskRemanenteContext,
  AvailableInsumoContext,
  RecipeGenerationOptions,
} from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';

export class InMemoryAiRecipeGeneratorFake implements IAiRecipeGeneratorGateway {
  public shouldFail = false;
  public failureMessage = 'Simulated AI generation failure';
  public callCount = 0;

  async generateProposals(
    remanentes: AtRiskRemanenteContext[],
    _insumos: AvailableInsumoContext[],
    _options: RecipeGenerationOptions
  ): Promise<RescueRecipeProposal[]> {
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

    return [
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
    ];
  }
}
