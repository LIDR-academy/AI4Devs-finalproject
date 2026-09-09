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
import { sanitizeRescueProposals } from './rescueProposalSanitizer.js';

interface PrimaryGateway {
  source: RescueGenerationSource;
  gateway: IAiRecipeGeneratorGateway;
}

/**
 * Selecciona el proveedor de IA según las opciones resueltas (`endpointUrl` →
 * OpenAI compatible, `apiKey` → Gemini, si no → motor heurístico local), ejecuta la
 * generación, **re-valida los `insumoId` devueltos contra el catálogo** (frontera de
 * confianza LLM, C-DEV-007-2 / AUDIT-DEV-007 F-4) y — ante un fallo del proveedor
 * remoto o una respuesta que queda vacía tras sanitizar — cae de forma transparente
 * al motor heurístico local, reportando el origen realmente usado.
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
    const validInsumoIds = new Set(insumos.map((i) => i.id));
    const primary = this.selectPrimary(options);

    if (primary.source !== 'HEURISTIC') {
      const remote = await this.tryRemote(primary, remanentes, insumos, options, validInsumoIds);
      if (remote) {
        return remote;
      }
    }

    const heuristicRaw = await this.heuristic.generateProposals(remanentes, insumos, options);
    return { source: 'HEURISTIC', proposals: sanitizeRescueProposals(heuristicRaw, validInsumoIds) };
  }

  private async tryRemote(
    primary: PrimaryGateway,
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions,
    validInsumoIds: ReadonlySet<string>
  ): Promise<RescueGenerationResult | null> {
    try {
      const raw = await primary.gateway.generateProposals(remanentes, insumos, options);
      const proposals = sanitizeRescueProposals(raw, validInsumoIds);
      if (proposals.length > 0) {
        return { source: primary.source, proposals };
      }
      this.warn('remote_generation_empty_after_sanitize', primary.source);
    } catch (err) {
      this.warn('remote_generation_failed', primary.source, err instanceof Error ? err.message : String(err));
    }
    return null;
  }

  private warn(event: string, provider: RescueGenerationSource, reason?: string): void {
    console.warn('[recipes:rescue]', JSON.stringify(reason ? { event, provider, reason } : { event, provider }));
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
