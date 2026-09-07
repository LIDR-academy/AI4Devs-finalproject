import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GeminiRecipeGeneratorAdapter } from './GeminiRecipeGeneratorAdapter.js';
import { AtRiskRemanenteContext, AvailableInsumoContext, RecipeGenerationOptions } from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

const remanentes: AtRiskRemanenteContext[] = [
  { id: 'rem-1', insumoId: 'ins-1', insumoName: 'Tomate', quantity: new DecimalQuantity('2.000'), unitOfMeasure: 'KG', hoursRemaining: 10 },
];
const insumos: AvailableInsumoContext[] = [{ id: 'ins-1', name: 'Tomate', unitOfMeasure: 'KG' }];

function options(overrides: Partial<RecipeGenerationOptions> = {}): RecipeGenerationOptions {
  return { modelName: '', temperature: 0.1, apiKey: 'sk-secret', endpointUrl: null, ...overrides };
}

function geminiResponse(proposals: unknown): Response {
  return {
    ok: true,
    json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(proposals) }] } }] }),
  } as unknown as Response;
}

const VALID_PROPOSAL = [
  {
    name: 'Salsa',
    description: 'x',
    category: 'PLATO_PRINCIPAL',
    estimatedPortions: 4,
    ingredients: [{ insumoId: 'ins-1', insumoName: 'Tomate', quantity: 2, unit: 'KG', isAtRisk: true }],
    preventedWasteEstimate: 2,
  },
];

describe('TK-126: GeminiRecipeGeneratorAdapter', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  const adapter = new GeminiRecipeGeneratorAdapter();

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue(geminiResponse(VALID_PROPOSAL));
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lanza si no hay API key configurada', async () => {
    await expect(adapter.generateProposals(remanentes, insumos, options({ apiKey: null }))).rejects.toThrow(/API Key/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('F-3: pasa la API key en el header x-goog-api-key, nunca en la URL', async () => {
    await adapter.generateProposals(remanentes, insumos, options());

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).not.toContain('key=');
    expect(url).not.toContain('sk-secret');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('sk-secret');
  });

  it('F-14: fija topP=0.2 y capa la temperatura', async () => {
    await adapter.generateProposals(remanentes, insumos, options({ temperature: 0.9 }));

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.generationConfig.topP).toBe(0.2);
    expect(body.generationConfig.temperature).toBe(0.2);
  });

  it('F-11: el prompt embebe el contexto dentro del bloque <datos-de-inventario>', async () => {
    await adapter.generateProposals(remanentes, insumos, options());

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const prompt: string = body.contents[0].parts[0].text;
    expect(prompt).toContain('<datos-de-inventario>');
    expect(prompt).toContain('"insumoId": "ins-1"');
  });

  it('parsea la respuesta a entidades de dominio', async () => {
    const result = await adapter.generateProposals(remanentes, insumos, options());
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Salsa');
  });

  it('lanza si la respuesta HTTP no es ok', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 429 } as Response);
    await expect(adapter.generateProposals(remanentes, insumos, options())).rejects.toThrow(/HTTP 429/);
  });

  it('usa el modelo por defecto gemini-2.5-flash cuando no se especifica', async () => {
    await adapter.generateProposals(remanentes, insumos, options({ modelName: '' }));
    expect(fetchMock.mock.calls[0][0]).toContain('models/gemini-2.5-flash:generateContent');
  });

  it('respeta el modelName explícito', async () => {
    await adapter.generateProposals(remanentes, insumos, options({ modelName: 'gemini-3.0-pro' }));
    expect(fetchMock.mock.calls[0][0]).toContain('models/gemini-3.0-pro:generateContent');
  });

  it('lanza si Gemini devuelve una respuesta sin texto', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ candidates: [] }) } as Response);
    await expect(adapter.generateProposals(remanentes, insumos, options())).rejects.toThrow(/vacía/i);
  });

  it('pide respuesta en formato JSON (response_mime_type) y usa POST', async () => {
    await adapter.generateProposals(remanentes, insumos, options());
    const init = fetchMock.mock.calls[0][1];
    const body = JSON.parse(init.body as string);
    expect(init.method).toBe('POST');
    expect(body.generationConfig.response_mime_type).toBe('application/json');
  });
});
