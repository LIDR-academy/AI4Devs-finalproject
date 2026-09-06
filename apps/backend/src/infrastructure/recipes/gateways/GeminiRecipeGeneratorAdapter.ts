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

export class GeminiRecipeGeneratorAdapter implements IAiRecipeGeneratorGateway {
  async generateProposals(
    remanentes: AtRiskRemanenteContext[],
    insumos: AvailableInsumoContext[],
    options: RecipeGenerationOptions
  ): Promise<RescueRecipeProposal[]> {
    if (!options.apiKey) {
      throw new Error('API Key de Gemini no configurada.');
    }

    const model = options.modelName || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${options.apiKey}`;

    const prompt = this.buildPrompt(remanentes, insumos);

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: Math.min(options.temperature, 0.2),
        response_mime_type: 'application/json',
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
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

    return this.parseProposals(rawText);
  }

  private buildPrompt(remanentes: AtRiskRemanenteContext[], insumos: AvailableInsumoContext[]): string {
    const remanentesStr = remanentes
      .map((r) => `- [ID: ${r.insumoId}] ${r.insumoName}: ${r.quantity.toString()} ${r.unitOfMeasure} (expira en ${r.hoursRemaining ?? 24}h)`)
      .join('\n');

    const insumosStr = insumos
      .slice(0, 30)
      .map((i) => `- [ID: ${i.id}] ${i.name} (${i.unitOfMeasure})`)
      .join('\n');

    return `Eres un chef ejecutivo experto en cocina sostenible, inventario FEFO y prevención de desperdicios alimentarios.
Propon entre 1 y 3 recetas de aprovechamiento culinario que prioricen consumir los siguientes remanentes en riesgo de caducidad (<48h):
${remanentesStr}

Otros insumos disponibles en bodega/cocina que puedes usar como complemento:
${insumosStr}

REGLAS ESTRICTAS:
1. Usa EXCLUSIVAMENTE insumos presentes en la lista anterior. No inventes ingredientes.
2. Cada ingrediente debe incluir insumoId exacto, insumoName, quantity (número decimal), unit, isAtRisk (true si proviene de remanentes en riesgo).
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

  private parseProposals(rawText: string): RescueRecipeProposal[] {
    const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned) as RawProposalJson[];

    if (!Array.isArray(parsed)) {
      throw new Error('La respuesta de Gemini no es un array JSON.');
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
