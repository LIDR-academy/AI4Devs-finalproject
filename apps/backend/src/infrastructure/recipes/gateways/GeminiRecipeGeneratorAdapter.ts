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

const DEFAULT_MODEL = 'gemini-2.5-flash';

export class GeminiRecipeGeneratorAdapter implements IAiRecipeGeneratorGateway {
  async generateProposals(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions
  ): Promise<RescueRecipeProposal[]> {
    if (!options.apiKey) {
      throw new Error('API Key de Gemini no configurada.');
    }

    const model = options.modelName || DEFAULT_MODEL;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const body = {
      contents: [{ parts: [{ text: this.buildPrompt(remanentes, insumos) }] }],
      generationConfig: {
        temperature: Math.min(options.temperature, MAX_TEMPERATURE),
        topP: DETERMINISTIC_TOP_P,
        response_mime_type: 'application/json',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': options.apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(AI_GENERATION_TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`Error en API de Gemini: HTTP ${res.status}`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Respuesta vacía recibida desde Gemini.');
    }

    return parseRescueProposalsJson(rawText);
  }

  private buildPrompt(remanentes: AtRiskRemanenteContext[], insumos: AvailableInsumoContext[]): string {
    return `Eres un chef ejecutivo experto en cocina sostenible, inventario FEFO y prevención de desperdicios alimentarios.
Propon entre 1 y 3 recetas de aprovechamiento culinario que prioricen consumir los remanentes en riesgo de caducidad (<48h) del bloque de datos.

${buildRescueDataBlock(remanentes, insumos)}

REGLAS ESTRICTAS:
1. Usa EXCLUSIVAMENTE insumos presentes en "insumosDisponibles" / "remanentesEnRiesgo". No inventes ingredientes ni insumoId.
2. Cada ingrediente debe incluir insumoId exacto, insumoName, quantity (número decimal), unit, isAtRisk (true si proviene de remanentesEnRiesgo).
3. preventedWasteEstimate es la suma de cantidades de ingredientes en riesgo aprovechados.
4. Responde ÚNICAMENTE un array JSON con objetos con esta estructura:
[
  {
    "name": "Nombre de la Receta",
    "description": "Descripción culinaria clara",
    "category": "PLATO_PRINCIPAL|ENTRANTE|POSTRE|GUARNICION|BEBIDA",
    "estimatedPortions": 4,
    "ingredients": [
      { "insumoId": "uuid", "insumoName": "Nombre", "quantity": 0.5, "unit": "KG", "isAtRisk": true }
    ],
    "preventedWasteEstimate": 0.5
  }
]`;
  }
}
