import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OpenAiCompatibleRecipeGeneratorAdapter } from './OpenAiCompatibleRecipeGeneratorAdapter.js';
import { AtRiskRemanenteContext, AvailableInsumoContext, RecipeGenerationOptions } from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

const remanentes: AtRiskRemanenteContext[] = [
  { id: 'rem-1', insumoId: 'ins-1', insumoName: 'Tomate', quantity: new DecimalQuantity('2.000'), unitOfMeasure: 'KG', hoursRemaining: 10 },
];
const insumos: AvailableInsumoContext[] = [{ id: 'ins-1', name: 'Tomate', unitOfMeasure: 'KG' }];

function options(overrides: Partial<RecipeGenerationOptions> = {}): RecipeGenerationOptions {
  return { modelName: '', temperature: 0.1, apiKey: null, endpointUrl: 'https://ollama.local/v1/', ...overrides };
}

const VALID_PROPOSAL = [
  {
    name: 'Guiso',
    description: 'x',
    category: 'PLATO_PRINCIPAL',
    estimatedPortions: 4,
    ingredients: [{ insumoId: 'ins-1', insumoName: 'Tomate', quantity: 2, unit: 'KG', isAtRisk: true }],
    preventedWasteEstimate: 2,
  },
];

function openAiResponse(proposals: unknown): Response {
  return {
    ok: true,
    json: async () => ({ choices: [{ message: { content: JSON.stringify(proposals) } }] }),
  } as unknown as Response;
}

describe('TK-126: OpenAiCompatibleRecipeGeneratorAdapter', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const adapter = new OpenAiCompatibleRecipeGeneratorAdapter();

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(openAiResponse(VALID_PROPOSAL));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normaliza el endpoint (sin barra final duplicada) y apunta a /chat/completions', async () => {
    await adapter.generateProposals(remanentes, insumos, options());
    expect(fetchMock.mock.calls[0][0]).toBe('https://ollama.local/v1/chat/completions');
  });

  it('F-14: fija top_p=0.2 y capa la temperatura', async () => {
    await adapter.generateProposals(remanentes, insumos, options({ temperature: 0.9 }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.top_p).toBe(0.2);
    expect(body.temperature).toBe(0.2);
  });

  it('F-11: el prompt de usuario embebe el bloque <datos-de-inventario>', async () => {
    await adapter.generateProposals(remanentes, insumos, options());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const userMsg = body.messages.find((m: { role: string }) => m.role === 'user');
    expect(userMsg.content).toContain('<datos-de-inventario>');
    expect(userMsg.content).toContain('"insumoId": "ins-1"');
  });

  it('añade Authorization Bearer solo si hay apiKey', async () => {
    await adapter.generateProposals(remanentes, insumos, options({ apiKey: 'sk-1' }));
    expect((fetchMock.mock.calls[0][1].headers as Record<string, string>)['Authorization']).toBe('Bearer sk-1');

    fetchMock.mockClear();
    await adapter.generateProposals(remanentes, insumos, options({ apiKey: null }));
    expect((fetchMock.mock.calls[0][1].headers as Record<string, string>)['Authorization']).toBeUndefined();
  });

  it('parsea la respuesta a entidades de dominio', async () => {
    const result = await adapter.generateProposals(remanentes, insumos, options());
    expect(result[0].name).toBe('Guiso');
  });

  it('lanza si la respuesta HTTP no es ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 500 } as Response);
    await expect(adapter.generateProposals(remanentes, insumos, options())).rejects.toThrow(/HTTP 500/);
  });

  it('lanza si el modelo devuelve un contenido vacío', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: '' } }] }) } as Response);
    await expect(adapter.generateProposals(remanentes, insumos, options())).rejects.toThrow(/vacía/i);
  });

  it('cae al endpoint y modelo por defecto (Ollama local) cuando no se especifican', async () => {
    await adapter.generateProposals(remanentes, insumos, options({ endpointUrl: null, modelName: '' }));
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:11434/v1/chat/completions');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.model).toBe('llama3:8b');
  });

  it('respeta el modelName explícito de las opciones', async () => {
    await adapter.generateProposals(remanentes, insumos, options({ modelName: 'mixtral:8x7b' }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.model).toBe('mixtral:8x7b');
  });

  it('incluye el rol system con la instrucción de responder solo JSON', async () => {
    await adapter.generateProposals(remanentes, insumos, options());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const systemMsg = body.messages.find((m: { role: string }) => m.role === 'system');
    expect(systemMsg.content).toContain('array JSON válido');
  });

  it('usa POST', async () => {
    await adapter.generateProposals(remanentes, insumos, options());
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });
});
