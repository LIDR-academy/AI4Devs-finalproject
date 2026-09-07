import { describe, it, expect } from 'vitest';
import { parseRescueProposalsJson } from './rescueProposalJsonParser.js';

describe('TK-125: parseRescueProposalsJson (parser JSON compartido Gemini/OpenAI)', () => {
  const validJson = JSON.stringify([
    {
      name: 'Salteado de Rescate',
      description: 'Aprovecha vegetales próximos a vencer.',
      category: 'PLATO_PRINCIPAL',
      estimatedPortions: 4,
      ingredients: [
        { insumoId: 'ins-1', insumoName: 'Zucchini', quantity: 0.8, unit: 'KG', isAtRisk: true },
      ],
      preventedWasteEstimate: 0.8,
    },
  ]);

  it('parsea un array JSON limpio a entidades RescueRecipeProposal', () => {
    const [proposal] = parseRescueProposalsJson(validJson);
    expect(proposal.name).toBe('Salteado de Rescate');
    expect(proposal.estimatedPortions).toBe(4);
    expect(proposal.ingredients[0].quantity.toString()).toBe('0.800');
    expect(proposal.preventedWasteEstimate.toString()).toBe('0.800');
  });

  it('tolera el envoltorio ```json ... ``` de los modelos', () => {
    const wrapped = '```json\n' + validJson + '\n```';
    const [proposal] = parseRescueProposalsJson(wrapped);
    expect(proposal.name).toBe('Salteado de Rescate');
  });

  it('aplica valores por defecto de categoría y porciones cuando faltan', () => {
    const partial = JSON.stringify([
      {
        name: 'Sin categoría',
        description: 'x',
        ingredients: [{ insumoId: 'ins-1', insumoName: 'X', quantity: 1, unit: 'KG', isAtRisk: false }],
      },
    ]);
    const [proposal] = parseRescueProposalsJson(partial);
    expect(proposal.category).toBe('PLATO_PRINCIPAL');
    expect(proposal.estimatedPortions).toBe(4);
  });

  it('lanza un error si la respuesta no es un array JSON', () => {
    expect(() => parseRescueProposalsJson('{"name":"no-array"}')).toThrow(/no es un array JSON/);
  });

  it('propaga el error de JSON.parse si el texto no es JSON válido', () => {
    expect(() => parseRescueProposalsJson('esto no es json')).toThrow();
  });
});
