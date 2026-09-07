import {
  IAiRecipeGeneratorGateway,
  AtRiskRemanenteContext,
  AvailableInsumoContext,
  RecipeGenerationOptions,
} from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import {
  IRescueRecipeGenerationGateway,
  RescueGenerationResult,
  RescueGenerationSource,
} from '../../../domain/recipes/gateways/IRescueRecipeGenerationGateway.js';
import { GeminiRecipeGeneratorAdapter } from './GeminiRecipeGeneratorAdapter.js';
import { OpenAiCompatibleRecipeGeneratorAdapter } from './OpenAiCompatibleRecipeGeneratorAdapter.js';
import { HeuristicRecipeGeneratorAdapter } from './HeuristicRecipeGeneratorAdapter.js';

interface PrimaryGateway {
  source: RescueGenerationSource;
  gateway: IAiRecipeGeneratorGateway;
}

/**
 * Selecciona el proveedor de IA según las opciones resueltas (`endpointUrl` →
 * OpenAI compatible, `apiKey` → Gemini, si no → motor heurístico local), ejecuta la
 * generación y — ante un fallo del proveedor remoto — cae de forma transparente al
 * motor heurístico local, reportando el origen realmente usado. Toda esta
 * orquestación vivía antes en `SuggestRescueRecipesUseCase` (TK-125 / AUDIT-DEV-007 F-2).
 */
export class CompositeAiRecipeGeneratorAdapter implements IRescueRecipeGenerationGateway {
  constructor(
    private readonly gemini: IAiRecipeGeneratorGateway = new GeminiRecipeGeneratorAdapter(),
    private readonly openAi: IAiRecipeGeneratorGateway = new OpenAiCompatibleRecipeGeneratorAdapter(),
    private readonly heuristic: IAiRecipeGeneratorGateway = new HeuristicRecipeGeneratorAdapter()
  ) {}

  async generate(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions
  ): Promise<RescueGenerationResult> {
    const primary = this.selectPrimary(options);

    if (primary.source === 'HEURISTIC') {
      return {
        source: 'HEURISTIC',
        proposals: await this.heuristic.generateProposals(remanentes, insumos, options),
      };
    }

    try {
      const proposals = await primary.gateway.generateProposals(remanentes, insumos, options);
      return { source: primary.source, proposals };
    } catch (err) {
      console.warn(
        '[recipes:rescue]',
        JSON.stringify({
          event: 'remote_generation_failed',
          provider: primary.source,
          reason: err instanceof Error ? err.message : String(err),
        })
      );
      const proposals = await this.heuristic.generateProposals(remanentes, insumos, options);
      return { source: 'HEURISTIC', proposals };
    }
  }

  private selectPrimary(options: RecipeGenerationOptions): PrimaryGateway {
    if (options.endpointUrl && options.endpointUrl.trim().length > 0) {
      return { source: 'OPENAI_COMPATIBLE', gateway: this.openAi };
    }
    if (options.apiKey && options.apiKey.trim().length > 0) {
      return { source: 'GEMINI', gateway: this.gemini };
    }
    return { source: 'HEURISTIC', gateway: this.heuristic };
  }
}
