import { describe, it, expect } from 'vitest';
import { toRescueSuggestionsDto } from './rescueSuggestionsMapper.js';
import { RescueRecipeProposal } from '../../../domain/recipes/entities/RescueRecipeProposal.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

function buildProposal(): RescueRecipeProposal {
  return new RescueRecipeProposal(
    'Crema de Rescate',
    'Aprovecha remanentes en riesgo.',
    'SOPAS',
    6,
    [
      {
        insumoId: 'ins-esp',
        insumoName: 'Espinaca',
        quantity: new DecimalQuantity('1.250'),
        unit: 'KG',
        isAtRisk: true,
      },
    ],
    new DecimalQuantity('1.250')
  );
}

describe('TK-125: toRescueSuggestionsDto (mapper único dominio → DTO)', () => {
  it('serializa cantidades DecimalQuantity a string con la precisión del VO', () => {
    const dto = toRescueSuggestionsDto('GEMINI', [buildProposal()]);

    expect(dto.source).toBe('GEMINI');
    expect(dto.proposals).toHaveLength(1);
    expect(dto.proposals[0]).toEqual({
      name: 'Crema de Rescate',
      description: 'Aprovecha remanentes en riesgo.',
      category: 'SOPAS',
      estimatedPortions: 6,
      ingredients: [
        { insumoId: 'ins-esp', insumoName: 'Espinaca', quantity: '1.250', unit: 'KG', isAtRisk: true },
      ],
      preventedWasteEstimate: '1.250',
    });
  });

  it('acepta el origen CATALOG y una lista vacía de propuestas', () => {
    const dto = toRescueSuggestionsDto('CATALOG', []);
    expect(dto).toEqual({ source: 'CATALOG', proposals: [] });
  });

  it('preserva el orden de las propuestas recibidas', () => {
    const a = buildProposal();
    const b = new RescueRecipeProposal('Segunda', 'x', 'SALSAS', 2, a.ingredients, new DecimalQuantity('0.100'));
    const dto = toRescueSuggestionsDto('HEURISTIC', [a, b]);
    expect(dto.proposals.map((p) => p.name)).toEqual(['Crema de Rescate', 'Segunda']);
  });
});
