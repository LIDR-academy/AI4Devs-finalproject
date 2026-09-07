import { describe, it, expect, afterEach, vi } from 'vitest';
import { CompositeAiRecipeGeneratorAdapter } from './CompositeAiRecipeGeneratorAdapter.js';
import {
  IAiRecipeGeneratorGateway,
  AvailableInsumoContext,
  RecipeGenerationOptions,
} from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

function ing(insumoId: string): RescueIngredientItem {
  return { insumoId, insumoName: insumoId, quantity: new DecimalQuantity(1), unit: 'KG', isAtRisk: true };
}

class StubLeafGateway implements IAiRecipeGeneratorGateway {
  public calls = 0;
  public proposals: RescueRecipeProposal[];

  constructor(
    private readonly label: string,
    private readonly shouldFail = false,
    insumoIds: string[] = ['ins-1']
  ) {
    this.proposals = [
      new RescueRecipeProposal(`Propuesta ${label}`, 'x', 'PLATO_PRINCIPAL', 4, insumoIds.map(ing), new DecimalQuantity(1)),
    ];
  }

  async generateProposals(): Promise<RescueRecipeProposal[]> {
    this.calls++;
    if (this.shouldFail) {
      throw new Error(`${this.label} down`);
    }
    return this.proposals;
  }
}

const NO_REMANENTES = [] as never[];
const INSUMOS: AvailableInsumoContext[] = [
  { id: 'ins-1', name: 'Tomate', unitOfMeasure: 'KG' },
  { id: 'ins-2', name: 'Cebolla', unitOfMeasure: 'KG' },
];

function options(overrides: Partial<RecipeGenerationOptions> = {}): RecipeGenerationOptions {
  return { modelName: 'm', temperature: 0, apiKey: null, endpointUrl: null, ...overrides };
}

describe('TK-125 / TK-126: CompositeAiRecipeGeneratorAdapter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('enruta a OpenAI compatible cuando hay endpointUrl y reporta el origen', async () => {
    const gemini = new StubLeafGateway('gemini');
    const openai = new StubLeafGateway('openai');
    const heuristic = new StubLeafGateway('heuristic');
    const composite = new CompositeAiRecipeGeneratorAdapter(gemini, openai, heuristic);

    const result = await composite.generate(NO_REMANENTES, INSUMOS, options({ endpointUrl: 'http://x/v1' }));

    expect(result.source).toBe('OPENAI_COMPATIBLE');
    expect(openai.calls).toBe(1);
    expect(gemini.calls).toBe(0);
    expect(heuristic.calls).toBe(0);
  });

  it('enruta a Gemini cuando hay apiKey y no endpointUrl', async () => {
    const gemini = new StubLeafGateway('gemini');
    const composite = new CompositeAiRecipeGeneratorAdapter(gemini, new StubLeafGateway('openai'), new StubLeafGateway('heuristic'));

    const result = await composite.generate(NO_REMANENTES, INSUMOS, options({ apiKey: 'sk-1' }));

    expect(result.source).toBe('GEMINI');
    expect(gemini.calls).toBe(1);
  });

  it('usa el motor heurístico local cuando no hay credencial ni endpoint', async () => {
    const gemini = new StubLeafGateway('gemini');
    const openai = new StubLeafGateway('openai');
    const heuristic = new StubLeafGateway('heuristic');
    const composite = new CompositeAiRecipeGeneratorAdapter(gemini, openai, heuristic);

    const result = await composite.generate(NO_REMANENTES, INSUMOS, options());

    expect(result.source).toBe('HEURISTIC');
    expect(heuristic.calls).toBe(1);
    expect(gemini.calls).toBe(0);
    expect(openai.calls).toBe(0);
  });

  it('cae de forma transparente al motor heurístico si el proveedor remoto falla', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const gemini = new StubLeafGateway('gemini', true);
    const heuristic = new StubLeafGateway('heuristic');
    const composite = new CompositeAiRecipeGeneratorAdapter(gemini, new StubLeafGateway('openai'), heuristic);

    const result = await composite.generate(NO_REMANENTES, INSUMOS, options({ apiKey: 'sk-1' }));

    expect(result.source).toBe('HEURISTIC');
    expect(result.proposals[0].name).toBe('Propuesta heuristic');
    expect(gemini.calls).toBe(1);
    expect(heuristic.calls).toBe(1);
    expect(warn).toHaveBeenCalledWith('[recipes:rescue]', expect.stringContaining('remote_generation_failed'));
  });

  it('no propaga el error del proveedor remoto', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const composite = new CompositeAiRecipeGeneratorAdapter(
      new StubLeafGateway('gemini'),
      new StubLeafGateway('openai', true),
      new StubLeafGateway('heuristic')
    );

    await expect(
      composite.generate(NO_REMANENTES, INSUMOS, options({ endpointUrl: 'http://x/v1' }))
    ).resolves.toMatchObject({ source: 'HEURISTIC' });
  });

  describe('TK-126: frontera de confianza — sanitización de insumoId (F-4)', () => {
    it('elimina del resultado remoto los ingredientes con insumoId alucinado', async () => {
      const gemini = new StubLeafGateway('gemini', false, ['ins-1', 'ins-alucinado']);
      const composite = new CompositeAiRecipeGeneratorAdapter(gemini, new StubLeafGateway('openai'), new StubLeafGateway('heuristic'));

      const result = await composite.generate(NO_REMANENTES, INSUMOS, options({ apiKey: 'sk-1' }));

      expect(result.source).toBe('GEMINI');
      expect(result.proposals[0].ingredients.map((i) => i.insumoId)).toEqual(['ins-1']);
    });

    it('cae al heurístico si la propuesta remota queda vacía tras sanitizar', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const gemini = new StubLeafGateway('gemini', false, ['solo-inventados', 'otro-fake']);
      const heuristic = new StubLeafGateway('heuristic', false, ['ins-2']);
      const composite = new CompositeAiRecipeGeneratorAdapter(gemini, new StubLeafGateway('openai'), heuristic);

      const result = await composite.generate(NO_REMANENTES, INSUMOS, options({ apiKey: 'sk-1' }));

      expect(result.source).toBe('HEURISTIC');
      expect(result.proposals[0].name).toBe('Propuesta heuristic');
      expect(warn).toHaveBeenCalledWith('[recipes:rescue]', expect.stringContaining('remote_generation_empty_after_sanitize'));
    });

    it('también sanitiza la salida del motor heurístico (defensa en profundidad)', async () => {
      const heuristic = new StubLeafGateway('heuristic', false, ['ins-1', 'fantasma']);
      const composite = new CompositeAiRecipeGeneratorAdapter(new StubLeafGateway('gemini'), new StubLeafGateway('openai'), heuristic);

      const result = await composite.generate(NO_REMANENTES, INSUMOS, options());

      expect(result.proposals[0].ingredients.map((i) => i.insumoId)).toEqual(['ins-1']);
    });
  });
});
