import { describe, it, expect } from 'vitest';
import { RecipePreparationItem } from './RecipePreparationItem.js';
import { Remanente } from '../../stock/entities/Remanente.js';
import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';
import { PreparationBalanceMismatchException } from '../errors/PreparationBalanceMismatchException.js';
import { WasteReasonRequiredException } from '../errors/WasteReasonRequiredException.js';
import { NonPristineReturnException } from '../errors/NonPristineReturnException.js';

function remanente(qty: string, opts: { isPristine?: boolean } = {}): Remanente {
  return new Remanente({
    id: 'rem-1',
    insumoId: 'ins-1',
    currentQuantity: new DecimalQuantity(qty),
    initialQuantity: new DecimalQuantity(qty),
    location: 'Mesa de Preparación',
    status: 'ACTIVE',
    expirationDate: new Date('2026-09-05T00:00:00.000Z'),
    isPristine: opts.isPristine ?? true,
  });
}

const base = {
  id: 'rpi-1',
  preparationId: 'prep-1',
  markedUnopened: false,
  leftoverLocationId: undefined as string | undefined,
  leftoverGoesToWarehouse: false,
};

describe('RecipePreparationItem — conciliación (US-028 / ADR-003 #9)', () => {
  it('reconcile deriva consumido = extraído − sobrante − merma', () => {
    const item = RecipePreparationItem.reconcile({
      ...base,
      remanente: remanente('2.000'),
      leftoverQty: new DecimalQuantity('0.300'),
      wastedQty: new DecimalQuantity('0.100'),
      wasteReason: 'recorte no aprovechable',
    });

    expect(item.consumedQty.toString()).toBe('1.600');
    expect(item.extractedQty.toString()).toBe('2.000');
    expect(item.leftoverQty.toString()).toBe('0.300');
    expect(item.wastedQty.toString()).toBe('0.100');
  });

  it('reconcile rechaza cuando sobrante + merma supera lo extraído (400)', () => {
    try {
      RecipePreparationItem.reconcile({
        ...base,
        remanente: remanente('2.000'),
        leftoverQty: new DecimalQuantity('1.800'),
        wastedQty: new DecimalQuantity('0.500'),
        wasteReason: 'x',
      });
      expect.unreachable('debió lanzar');
    } catch (e) {
      expect(e).toBeInstanceOf(PreparationBalanceMismatchException);
      expect((e as PreparationBalanceMismatchException).statusCode).toBe(400);
      expect((e as Error).message).toContain('ins-1');
      expect((e as Error).message).toMatch(/supera lo extra/i);
    }
  });

  it('reconcile exige motivo cuando la merma es > 0 (400)', () => {
    try {
      RecipePreparationItem.reconcile({
        ...base,
        remanente: remanente('2.000'),
        leftoverQty: new DecimalQuantity('0'),
        wastedQty: new DecimalQuantity('0.100'),
      });
      expect.unreachable('debió lanzar');
    } catch (e) {
      expect(e).toBeInstanceOf(WasteReasonRequiredException);
      expect((e as WasteReasonRequiredException).statusCode).toBe(400);
      expect((e as Error).message).toMatch(/motivo de la merma del insumo ins-1/i);
    }
  });

  it('reconcile acepta merma con motivo (límite: exactamente en cero no exige motivo)', () => {
    const withWaste = RecipePreparationItem.reconcile({
      ...base,
      remanente: remanente('2.000'),
      leftoverQty: new DecimalQuantity('0'),
      wastedQty: new DecimalQuantity('0.100'),
      wasteReason: '  quemado  ',
    });
    expect(withWaste.wasteReason).toBe('quemado');

    const noWaste = RecipePreparationItem.reconcile({
      ...base,
      remanente: remanente('2.000'),
      leftoverQty: new DecimalQuantity('0'),
      wastedQty: new DecimalQuantity('0'),
    });
    expect(noWaste.wasteReason).toBeUndefined();
  });

  it('reconcile permite devolver a bodega un remanente intacto y con envase sin abrir', () => {
    const item = RecipePreparationItem.reconcile({
      ...base,
      remanente: remanente('2.000', { isPristine: true }),
      leftoverQty: new DecimalQuantity('2.000'),
      leftoverLocationId: 'loc-seed-dry',
      markedUnopened: true,
      leftoverGoesToWarehouse: true,
      wastedQty: new DecimalQuantity('0'),
    });

    expect(item.consumedQty.toString()).toBe('0.000');
    expect(item.leftoverLocationId).toBe('loc-seed-dry');
  });

  it('reconcile bloquea la devolución a bodega si hubo consumo (422)', () => {
    try {
      RecipePreparationItem.reconcile({
        ...base,
        remanente: remanente('2.000', { isPristine: true }),
        leftoverQty: new DecimalQuantity('1.500'),
        leftoverLocationId: 'loc-seed-dry',
        markedUnopened: true,
        leftoverGoesToWarehouse: true,
        wastedQty: new DecimalQuantity('0'),
      });
      expect.unreachable('debió lanzar');
    } catch (e) {
      expect(e).toBeInstanceOf(NonPristineReturnException);
      expect((e as NonPristineReturnException).statusCode).toBe(422);
      expect((e as Error).message).toMatch(/remanente intacto/i);
      expect((e as Error).message).toMatch(/envase sin abrir/i);
      expect((e as Error).message).toContain('ins-1');
      expect((e as Error).message).toMatch(/área de cocina/i);
    }
  });

  it('reconcile bloquea la devolución a bodega si hubo merma (aunque no haya consumo)', () => {
    expect(() =>
      RecipePreparationItem.reconcile({
        ...base,
        remanente: remanente('2.000', { isPristine: true }),
        leftoverQty: new DecimalQuantity('1.900'),
        leftoverLocationId: 'loc-seed-dry',
        markedUnopened: true,
        leftoverGoesToWarehouse: true,
        wastedQty: new DecimalQuantity('0.100'),
        wasteReason: 'x',
      })
    ).toThrow(NonPristineReturnException);
  });

  it('reconcile bloquea la devolución a bodega si el remanente no está intacto (422)', () => {
    expect(() =>
      RecipePreparationItem.reconcile({
        ...base,
        remanente: remanente('2.000', { isPristine: false }),
        leftoverQty: new DecimalQuantity('2.000'),
        leftoverLocationId: 'loc-seed-dry',
        markedUnopened: true,
        leftoverGoesToWarehouse: true,
        wastedQty: new DecimalQuantity('0'),
      })
    ).toThrow(NonPristineReturnException);
  });

  it('el constructor rechaza un cuadre que no suma exacto', () => {
    expect(
      () =>
        new RecipePreparationItem({
          id: 'rpi-1',
          preparationId: 'prep-1',
          insumoId: 'ins-1',
          remanenteId: 'rem-1',
          extractedQty: new DecimalQuantity('2.000'),
          consumedQty: new DecimalQuantity('1.000'),
          leftoverQty: new DecimalQuantity('0.500'),
          wastedQty: new DecimalQuantity('0.100'),
        })
    ).toThrow(PreparationBalanceMismatchException);
  });
});
