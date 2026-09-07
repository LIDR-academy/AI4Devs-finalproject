import { describe, it, expect, afterEach, vi } from 'vitest';
import { CompositeAiRecipeGeneratorAdapter } from './CompositeAiRecipeGeneratorAdapter.js';
import {
  IAiRecipeGeneratorGateway,
  RecipeGenerationOptions,
} from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { RescueRecipeProposal } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

class StubLeafGateway implements IAiRecipeGeneratorGateway {
  public calls = 0;
  constructor(
    private readonly label: string,
    private readonly shouldFail = false
  ) {}

  async generateProposals(): Promise<RescueRecipeProposal[]> {
    this.calls++;
    if (this.shouldFail) {
      throw new Error(`${this.label} down`);
    }
    return [
      new RescueRecipeProposal(
        `Propuesta ${this.label}`,
        'x',
        'PLATO_PRINCIPAL',
        4,
        [{ insumoId: 'ins-1', insumoName: 'X', quantity: new DecimalQuantity(1), unit: 'KG', isAtRisk: true }],
        new DecimalQuantity(1)
      ),
    ];
  }
}

const NO_REMANENTES = [] as never[];
const NO_INSUMOS = [] as never[];

function options(overrides: Partial<RecipeGenerationOptions> = {}): RecipeGenerationOptions {
  return { modelName: 'm', temperature: 0, apiKey: null, endpointUrl: null, ...overrides };
}

describe('TK-125: CompositeAiRecipeGeneratorAdapter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('enruta a OpenAI compatible cuando hay endpointUrl y reporta el origen', async () => {
    const gemini = new StubLeafGateway('gemini');
    const openai = new StubLeafGateway('openai');
    const heuristic = new StubLeafGateway('heuristic');
    const composite = new CompositeAiRecipeGeneratorAdapter(gemini, openai, heuristic);

    const result = await composite.generate(NO_REMANENTES, NO_INSUMOS, options({ endpointUrl: 'http://x/v1' }));

    expect(result.source).toBe('OPENAI_COMPATIBLE');
    expect(openai.calls).toBe(1);
    expect(gemini.calls).toBe(0);
    expect(heuristic.calls).toBe(0);
  });

  it('enruta a Gemini cuando hay apiKey y no endpointUrl', async () => {
    const gemini = new StubLeafGateway('gemini');
    const openai = new StubLeafGateway('openai');
    const heuristic = new StubLeafGateway('heuristic');
    const composite = new CompositeAiRecipeGeneratorAdapter(gemini, openai, heuristic);

    const result = await composite.generate(NO_REMANENTES, NO_INSUMOS, options({ apiKey: 'sk-1' }));

    expect(result.source).toBe('GEMINI');
    expect(gemini.calls).toBe(1);
  });

  it('usa el motor heurístico local cuando no hay credencial ni endpoint', async () => {
    const gemini = new StubLeafGateway('gemini');
    const openai = new StubLeafGateway('openai');
    const heuristic = new StubLeafGateway('heuristic');
    const composite = new CompositeAiRecipeGeneratorAdapter(gemini, openai, heuristic);

    const result = await composite.generate(NO_REMANENTES, NO_INSUMOS, options());

    expect(result.source).toBe('HEURISTIC');
    expect(heuristic.calls).toBe(1);
    expect(gemini.calls).toBe(0);
    expect(openai.calls).toBe(0);
  });

  it('cae de forma transparente al motor heurístico si el proveedor remoto falla', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const gemini = new StubLeafGateway('gemini', true);
    const openai = new StubLeafGateway('openai');
    const heuristic = new StubLeafGateway('heuristic');
    const composite = new CompositeAiRecipeGeneratorAdapter(gemini, openai, heuristic);

    const result = await composite.generate(NO_REMANENTES, NO_INSUMOS, options({ apiKey: 'sk-1' }));

    expect(result.source).toBe('HEURISTIC');
    expect(result.proposals[0].name).toBe('Propuesta heuristic');
    expect(gemini.calls).toBe(1);
    expect(heuristic.calls).toBe(1);
    expect(warn).toHaveBeenCalledWith('[recipes:rescue]', expect.stringContaining('remote_generation_failed'));
  });

  it('no propaga el error del proveedor remoto', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const openai = new StubLeafGateway('openai', true);
    const composite = new CompositeAiRecipeGeneratorAdapter(
      new StubLeafGateway('gemini'),
      openai,
      new StubLeafGateway('heuristic')
    );

    await expect(
      composite.generate(NO_REMANENTES, NO_INSUMOS, options({ endpointUrl: 'http://x/v1' }))
    ).resolves.toMatchObject({ source: 'HEURISTIC' });
  });
});
