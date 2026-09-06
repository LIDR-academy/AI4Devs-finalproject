import { RescueRecipeProposal } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import {
  IAiRecipeGeneratorGateway,
  AtRiskRemanenteContext,
  AvailableInsumoContext,
  RecipeGenerationOptions,
} from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { GeminiRecipeGeneratorAdapter } from './GeminiRecipeGeneratorAdapter.js';
import { OpenAiCompatibleRecipeGeneratorAdapter } from './OpenAiCompatibleRecipeGeneratorAdapter.js';
import { HeuristicRecipeGeneratorAdapter } from './HeuristicRecipeGeneratorAdapter.js';

export class CompositeAiRecipeGeneratorAdapter implements IAiRecipeGeneratorGateway {
  constructor(
    private readonly gemini = new GeminiRecipeGeneratorAdapter(),
    private readonly openAi = new OpenAiCompatibleRecipeGeneratorAdapter(),
    private readonly heuristic = new HeuristicRecipeGeneratorAdapter()
  ) {}

  async generateProposals(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions
  ): Promise<RescueRecipeProposal[]> {
    if (options.endpointUrl && options.endpointUrl.trim().length > 0) {
      return this.openAi.generateProposals(remanentes, insumos, options);
    }
    if (options.apiKey && options.apiKey.trim().length > 0) {
      return this.gemini.generateProposals(remanentes, insumos, options);
    }
    return this.heuristic.generateProposals(remanentes, insumos, options);
  }
}
