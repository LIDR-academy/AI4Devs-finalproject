import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import {
  IAiRecipeGeneratorGateway,
  AtRiskRemanenteContext,
  AvailableInsumoContext,
  RecipeGenerationOptions,
} from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';

export class HeuristicRecipeGeneratorAdapter implements IAiRecipeGeneratorGateway {
  async generateProposals(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    _options: RecipeGenerationOptions
  ): Promise<RescueRecipeProposal[]> {
    if (remanentes.length === 0) {
      return this.generatePreventiveProposals(insumos);
    }

    const proposals: RescueRecipeProposal[] = [];
    proposals.push(this.buildSauteProposal(remanentes, insumos));

    if (remanentes.length > 1) {
      proposals.push(this.buildCreamProposal(remanentes));
    }

    return proposals;
  }

  private buildSauteProposal(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[]
  ): RescueRecipeProposal {
    const ingredients: RescueIngredientItem[] = remanentes.slice(0, 4).map((rem) => ({
      insumoId: rem.insumoId,
      insumoName: rem.insumoName,
      quantity: rem.quantity,
      unit: rem.unitOfMeasure,
      isAtRisk: true,
    }));

    const complementary = insumos
      .filter((ins) => !ingredients.some((pi) => pi.insumoId === ins.id))
      .slice(0, 2);

    for (const comp of complementary) {
      ingredients.push({
        insumoId: comp.id,
        insumoName: comp.name,
        quantity: new DecimalQuantity(0.1),
        unit: comp.unitOfMeasure,
        isAtRisk: false,
      });
    }

    const names = remanentes.slice(0, 2).map((r) => r.insumoName).join(' y ');

    return new RescueRecipeProposal(
      `Salteado Rápido de ${names}`,
      `Receta de rescate culinario FEFO para consumir remanentes próximos a expirar en menos de 48 horas.`,
      'PLATO_PRINCIPAL',
      4,
      ingredients
    );
  }

  private buildCreamProposal(remanentes: AtRiskRemanenteContext[]): RescueRecipeProposal {
    const ingredients: RescueIngredientItem[] = remanentes.map((rem) => ({
      insumoId: rem.insumoId,
      insumoName: rem.insumoName,
      quantity: rem.quantity,
      unit: rem.unitOfMeasure,
      isAtRisk: true,
    }));

    return new RescueRecipeProposal(
      'Crema Concentrada de Cocina FEFO',
      'Reducción y emulsión para base de platos o menú del día evitando merma directa.',
      'ENTRANTE',
      6,
      ingredients
    );
  }

  private generatePreventiveProposals(insumos: AvailableInsumoContext[]): RescueRecipeProposal[] {
    if (insumos.length === 0) {
      return [];
    }

    const selected = insumos.slice(0, 3).map((ins) => ({
      insumoId: ins.id,
      insumoName: ins.name,
      quantity: new DecimalQuantity(1.0),
      unit: ins.unitOfMeasure,
      isAtRisk: false,
    }));

    return [
      new RescueRecipeProposal(
        'Preparación Base de Rotación Preventiva',
        'Elaboración para mantener flujo continuo de cocina sin ingredientes en riesgo crítico.',
        'GUARNICION',
        4,
        selected
      ),
    ];
  }
}
