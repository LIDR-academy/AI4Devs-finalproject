import { describe, it, expect } from 'vitest';
import { toRescueSuggestionsDto } from './rescueSuggestionsMapper.js';
import { RescueRecipeProposal, RescueIngredientItem } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

function ing(insumoId: string, qty: string, isAtRisk: boolean): RescueIngredientItem {
  return { insumoId, insumoName: insumoId, quantity: new DecimalQuantity(qty), unit: 'KG', isAtRisk };
}

const NO_COSTS = new Map<string, DecimalQuantity>();

describe('TK-125 / TK-128: toRescueSuggestionsDto (mapper único dominio → DTO)', () => {
  it('serializa cantidades y valoriza preventedWasteCost desde unitCost', () => {
    const proposal = new RescueRecipeProposal('Crema de Rescate', 'x', 'SOPAS', 6, [
      ing('ins-esp', '2.000', true),
      ing('ins-sal', '1.000', false),
    ]);
    const costs = new Map([
      ['ins-esp', new DecimalQuantity('3.00')],
      ['ins-sal', new DecimalQuantity('1.50')],
    ]);

    const dto = toRescueSuggestionsDto('GEMINI', [proposal], costs);

    expect(dto.source).toBe('GEMINI');
    expect(dto.proposals[0]).toEqual({
      name: 'Crema de Rescate',
      description: 'x',
      category: 'SOPAS',
      estimatedPortions: 6,
      ingredients: [
        { insumoId: 'ins-esp', insumoName: 'ins-esp', quantity: '2.000', unit: 'KG', isAtRisk: true },
        { insumoId: 'ins-sal', insumoName: 'ins-sal', quantity: '1.000', unit: 'KG', isAtRisk: false },
      ],
      // Solo el ingrediente en riesgo: 2.000 × 3.00 = 6.00
      preventedWasteCost: '6.00',
    });
  });

  it('preventedWasteCost es null si un ingrediente en riesgo no tiene unitCost', () => {
    const proposal = new RescueRecipeProposal('Sin Costo', 'x', 'SALSAS', 4, [ing('ins-x', '1.000', true)]);
    const dto = toRescueSuggestionsDto('HEURISTIC', [proposal], NO_COSTS);
    expect(dto.proposals[0].preventedWasteCost).toBeNull();
  });

  it('acepta el origen CATALOG y una lista vacía de propuestas', () => {
    expect(toRescueSuggestionsDto('CATALOG', [], NO_COSTS)).toEqual({ source: 'CATALOG', proposals: [] });
  });

  it('preserva el orden de las propuestas recibidas', () => {
    const a = new RescueRecipeProposal('Primera', 'x', 'SALSAS', 4, [ing('ins-1', '1', true)]);
    const b = new RescueRecipeProposal('Segunda', 'x', 'SALSAS', 2, [ing('ins-1', '1', true)]);
    const dto = toRescueSuggestionsDto('HEURISTIC', [a, b], NO_COSTS);
    expect(dto.proposals.map((p) => p.name)).toEqual(['Primera', 'Segunda']);
  });
});
