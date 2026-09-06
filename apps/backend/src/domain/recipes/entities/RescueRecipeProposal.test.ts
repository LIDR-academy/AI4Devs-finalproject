import { describe, it, expect } from 'vitest';
import { RescueRecipeProposal } from './RescueRecipeProposal.js';
import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';

describe('TK-122: RescueRecipeProposal Domain Entity Suite', () => {
  const validIngredients = [
    {
      insumoId: 'ins-1',
      insumoName: 'Tomates Maduros',
      quantity: new DecimalQuantity('1.500'),
      unit: 'KG',
      isAtRisk: true,
    },
  ];

  it('instancia correctamente una propuesta con datos válidos', () => {
    const proposal = new RescueRecipeProposal(
      'Salsa Pomodoro de Rescate',
      'Aprovechamiento de tomates próximos a caducar',
      'SALSAS',
      4,
      validIngredients,
      new DecimalQuantity('1.500')
    );

    expect(proposal.name).toBe('Salsa Pomodoro de Rescate');
    expect(proposal.estimatedPortions).toBe(4);
    expect(proposal.ingredients).toHaveLength(1);
    expect(proposal.preventedWasteEstimate.toString()).toBe('1.500');
  });

  it('lanza error si el nombre de la propuesta está vacío', () => {
    expect(
      () =>
        new RescueRecipeProposal(
          '',
          'Descripción',
          'SALSAS',
          4,
          validIngredients,
          new DecimalQuantity('1.500')
        )
    ).toThrow('El nombre de la propuesta de receta no puede estar vacío.');
  });

  it('lanza error si las porciones son menores o iguales a cero', () => {
    expect(
      () =>
        new RescueRecipeProposal(
          'Nombre',
          'Descripción',
          'SALSAS',
          0,
          validIngredients,
          new DecimalQuantity('1.500')
        )
    ).toThrow('Las porciones estimadas deben ser mayores a cero.');
  });

  it('lanza error si no tiene ingredientes', () => {
    expect(
      () =>
        new RescueRecipeProposal(
          'Nombre',
          'Descripción',
          'SALSAS',
          4,
          [],
          new DecimalQuantity('0')
        )
    ).toThrow('La propuesta de receta debe incluir al menos un ingrediente.');
  });
});
