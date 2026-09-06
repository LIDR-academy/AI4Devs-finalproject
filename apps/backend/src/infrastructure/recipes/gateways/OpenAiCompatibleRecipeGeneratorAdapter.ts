import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import {
  IAiRecipeGeneratorGateway,
  AtRiskRemanenteContext,
  AvailableInsumoContext,
  RecipeGenerationOptions,
} from '../../../domain/recipes/gateways/IAiRecipeGeneratorGateway.js';

interface RawProposalJson {
  name: string;
  description: string;
  category: string;
  estimatedPortions: number;
  ingredients: Array<{
    insumoId: string;
    insumoName: string;
    quantity: string | number;
    unit: string;
    isAtRisk: boolean;
  }>;
  preventedWasteEstimate: string | number;
}

export class OpenAiCompatibleRecipeGeneratorAdapter implements IAiRecipeGeneratorGateway {
  async generateProposals(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions
  ): Promise<RescueRecipeProposal[]> {
    const baseUrl = (options.endpointUrl || 'http://localhost:11434/v1').replace(/\/+$/, '');
    const url = `${baseUrl}/chat/completions`;
    const model = options.modelName || 'llama3:8b';

    const prompt = this.buildPrompt(remanentes, insumos);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (options.apiKey) {
      headers['Authorization'] = `Bearer ${options.apiKey}`;
    }

    const body = {
      model,
      temperature: Math.min(options.temperature, 0.2),
      messages: [
        {
          role: 'system',
          content:
            'Eres un chef asistente de cocina especializado en FEFO y reducción de desperdicios. Genera únicamente un array JSON válido con propuestas de recetas.',
        },
        { role: 'user', content: prompt },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
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

    return this.parseProposals(rawContent);
  }

  private buildPrompt(remanentes: AtRiskRemanenteContext[], insumos: AvailableInsumoContext[]): string {
    const remStr = remanentes
      .map((r) => `- [${r.insumoId}] ${r.insumoName}: ${r.quantity.toString()} ${r.unitOfMeasure}`)
      .join('\n');

    const insStr = insumos
      .slice(0, 30)
      .map((i) => `- [${i.id}] ${i.name} (${i.unitOfMeasure})`)
      .join('\n');

    return `Remanentes próximos a vencer (<48h):
${remStr}

Insumos disponibles en stock:
${insStr}

Genera entre 1 y 2 recetas de aprovechamiento usando SOLO estos ingredientes en formato JSON:
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

  private parseProposals(rawText: string): RescueRecipeProposal[] {
    const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned) as RawProposalJson[];

    if (!Array.isArray(parsed)) {
      throw new Error('La respuesta recibida no es un array JSON.');
    }

    return parsed.map((p) => {
      const ingredients: RescueIngredientItem[] = (p.ingredients || []).map((ing) => ({
        insumoId: ing.insumoId,
        insumoName: ing.insumoName,
        quantity: new DecimalQuantity(ing.quantity),
        unit: ing.unit,
        isAtRisk: Boolean(ing.isAtRisk),
      }));

      return new RescueRecipeProposal(
        p.name,
        p.description,
        p.category || 'PLATO_PRINCIPAL',
        p.estimatedPortions || 4,
        ingredients,
        new DecimalQuantity(p.preventedWasteEstimate || 0)
      );
    });
  }
}
