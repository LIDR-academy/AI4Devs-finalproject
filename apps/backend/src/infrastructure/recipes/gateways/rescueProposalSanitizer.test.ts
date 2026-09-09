import { describe, it, expect } from 'vitest';
import { sanitizeRescueProposals } from './rescueProposalSanitizer.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

function ing(insumoId: string): RescueIngredientItem {
  return { insumoId, insumoName: insumoId, quantity: new DecimalQuantity(1), unit: 'KG', isAtRisk: true };
}

function proposal(name: string, insumoIds: string[]): RescueRecipeProposal {
  return new RescueRecipeProposal(name, 'x', 'PLATO_PRINCIPAL', 4, insumoIds.map(ing));
}

describe('TK-126: sanitizeRescueProposals (frontera de confianza LLM, F-4)', () => {
  const validIds = new Set(['ins-1', 'ins-2', 'ins-3']);

  it('deja intactas las propuestas cuyos ingredientes son todos válidos', () => {
    const input = [proposal('OK', ['ins-1', 'ins-2'])];
    const out = sanitizeRescueProposals(input, validIds);
    expect(out).toHaveLength(1);
    expect(out[0]).toBe(input[0]);
  });

  it('elimina el ingrediente alucinado y reconstruye la propuesta', () => {
    const out = sanitizeRescueProposals([proposal('Mixta', ['ins-1', 'ins-hallucinated', 'ins-3'])], validIds);
    expect(out).toHaveLength(1);
    expect(out[0].ingredients.map((i) => i.insumoId)).toEqual(['ins-1', 'ins-3']);
    expect(out[0].name).toBe('Mixta');
  });

  it('descarta la propuesta entera si ningún ingrediente es válido', () => {
    const out = sanitizeRescueProposals([proposal('Toda inventada', ['x', 'y'])], validIds);
    expect(out).toHaveLength(0);
  });

  it('procesa varias propuestas de forma independiente', () => {
    const out = sanitizeRescueProposals(
      [proposal('A', ['ins-1']), proposal('B', ['nope']), proposal('C', ['ins-2', 'bad'])],
      validIds
    );
    expect(out.map((p) => p.name)).toEqual(['A', 'C']);
    expect(out[1].ingredients.map((i) => i.insumoId)).toEqual(['ins-2']);
  });

  it('devuelve lista vacía para entrada vacía', () => {
    expect(sanitizeRescueProposals([], validIds)).toEqual([]);
  });
});
