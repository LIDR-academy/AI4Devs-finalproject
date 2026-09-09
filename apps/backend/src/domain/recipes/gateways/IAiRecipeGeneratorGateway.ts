import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal } from '../entities/RescueRecipeProposal.js';

export interface AtRiskRemanenteContext {
  id: string;
  insumoId: string;
  insumoName: string;
  quantity: DecimalQuantity;
  unitOfMeasure: string;
  hoursRemaining?: number;
}

export interface AvailableInsumoContext {
  id: string;
  name: string;
  unitOfMeasure: string;
}

export interface RecipeGenerationOptions {
  modelName: string;
  temperature: number;
  apiKey: string | null;
  endpointUrl: string | null;
}

export interface IAiRecipeGeneratorGateway {
  generateProposals(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions
  ): Promise<RescueRecipeProposal[]>;
}
