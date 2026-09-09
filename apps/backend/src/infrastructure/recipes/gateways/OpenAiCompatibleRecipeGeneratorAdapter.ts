import { RescueRecipeProposal } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import {
  IAiRecipeGeneratorGateway,
  AtRiskRemanenteContext,
  AvailableInsumoContext,
  RecipeGenerationOptions,
} from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';
import { parseRescueProposalsJson } from './rescueProposalJsonParser.js';
import { buildRescueDataBlock } from './rescuePromptContext.js';
import { AI_GENERATION_TIMEOUT_MS, DETERMINISTIC_TOP_P, MAX_TEMPERATURE } from './aiGenerationConstants.js';

const DEFAULT_ENDPOINT = 'http://localhost:11434/v1';
const DEFAULT_MODEL = 'llama3:8b';

export class OpenAiCompatibleRecipeGeneratorAdapter implements IAiRecipeGeneratorGateway {
  async generateProposals(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions
  ): Promise<RescueRecipeProposal[]> {
    const baseUrl = (options.endpointUrl || DEFAULT_ENDPOINT).replace(/\/+$/, '');
    const url = `${baseUrl}/chat/completions`;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }

    const body = {
      model: options.modelName || DEFAULT_MODEL,
      temperature: Math.min(options.temperature, MAX_TEMPERATURE),
      top_p: DETERMINISTIC_TOP_P,
      messages: [
        {
          role: 'system',
          content:
            'Eres un chef asistente de cocina especializado en FEFO y reducción de desperdicios. Genera únicamente un array JSON válido con propuestas de recetas.',
        },
        { role: 'user', content: this.buildPrompt(remanentes, insumos) },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(AI_GENERATION_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`Error en endpoint OpenAI Compatible: HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawContent = json.choices?.[0]?.message?.content;
    if (!rawContent) {
      throw new Error('Respuesta vacía desde modelo compatible con OpenAI.');
    }

    return parseRescueProposalsJson(rawContent);
  }

  private buildPrompt(remanentes: AtRiskRemanenteContext[], insumos: AvailableInsumoContext[]): string {
    return `Genera entre 1 y 2 recetas de aprovechamiento que prioricen los remanentes en riesgo del bloque de datos, usando SOLO esos ingredientes.

${buildRescueDataBlock(remanentes, insumos)}

Responde ÚNICAMENTE un array JSON con esta estructura (insumoId EXACTO del bloque, nunca inventado):
[
  {
    "name": "Nombre",
    "description": "Descripción",
    "category": "PLATO_PRINCIPAL",
    "estimatedPortions": 4,
    "ingredients": [
      { "insumoId": "uuid", "insumoName": "Nombre", "quantity": 0.5, "unit": "KG", "isAtRisk": true }
    ],
    "preventedWasteEstimate": 0.5
  }
]`;
  }
}
