import { describe, it, expect } from 'vitest';
import { Recipe } from './Recipe.js';
import { RecipeIngredient } from './RecipeIngredient.js';
import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';

function base(): Recipe {
  return new Recipe(
    'rec-1',
    'Salsa Base',
    'SALSAS',
    [new RecipeIngredient('ri-1', 'rec-1', 'ins-1', new DecimalQuantity('1.000'))],
    'Descripción original'
  );
}

describe('TK-131: Recipe entity (US-037)', () => {
  it('isActive es true por defecto', () => {
    expect(base().isActive).toBe(true);
  });

  it('withDetails edita solo lo del patch y preserva id / composición / isActive', () => {
    const next = base().withDetails({ name: 'Salsa Corregida', category: 'BASES' });
    expect(next.id).toBe('rec-1');
    expect(next.name).toBe('Salsa Corregida');
    expect(next.category).toBe('BASES');
    expect(next.description).toBe('Descripción original');
    expect(next.ingredients).toHaveLength(1);
    expect(next.isActive).toBe(true);
  });

  it('withDetails con description:null la limpia; con ingredients reemplaza la composición', () => {
    const next = base().withDetails({
      description: null,
      ingredients: [
        new RecipeIngredient('ri-a', 'rec-1', 'ins-2', new DecimalQuantity('2.000')),
        new RecipeIngredient('ri-b', 'rec-1', 'ins-3', new DecimalQuantity('0.500')),
      ],
    });
    expect(next.description).toBeUndefined();
    expect(next.ingredients.map((i) => i.insumoId)).toEqual(['ins-2', 'ins-3']);
  });

  it('deactivated marca isActive false conservando el resto', () => {
    const dead = base().deactivated();
    expect(dead.isActive).toBe(false);
    expect(dead.id).toBe('rec-1');
    expect(dead.name).toBe('Salsa Base');
    expect(dead.ingredients).toHaveLength(1);
  });
});
