import { describe, it, expect, vi } from 'vitest';
import { Remanente } from './Remanente.js';
import { DecimalQuantity } from '../value-objects/DecimalQuantity.js';
import { ExcessConsumptionException } from '../../kitchen/errors/ExcessConsumptionException.js';

describe('Remanente Domain Entity — Consumo FEFO y Descarte', () => {
  it('createNew debe calcular la fecha de expiracion sumando las horas indicadas a la hora actual', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('5.000'), 'KITCHEN_FRIDGE', 24);

    expect(remanente.expirationDate.toISOString()).toBe('2026-01-02T00:00:00.000Z');
    expect(remanente.status).toBe('ACTIVE');

    vi.useRealTimers();
  });

  it('consumeQuantity debe reducir la cantidad disponible y mantener el remanente ACTIVE si sobra saldo', () => {
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('5.000'));

    remanente.consumeQuantity(new DecimalQuantity('2.000'));

    expect(remanente.currentQuantity.toString()).toBe('3.000');
    expect(remanente.status).toBe('ACTIVE');
  });

  it('consumeQuantity debe marcar el remanente como EXHAUSTED cuando el saldo llega exactamente a cero', () => {
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('3.000'));

    remanente.consumeQuantity(new DecimalQuantity('3.000'));

    expect(remanente.currentQuantity.toNumber()).toBe(0);
    expect(remanente.status).toBe('EXHAUSTED');
  });

  it('consumeQuantity debe lanzar ExcessConsumptionException si se solicita mas de lo disponible', () => {
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('1.000'));

    expect(() => remanente.consumeQuantity(new DecimalQuantity('2.000'))).toThrow(ExcessConsumptionException);
    // ORACULO ESTADO: el intento fallido no debe alterar el saldo
    expect(remanente.currentQuantity.toString()).toBe('1.000');
  });

  it('consumeQuantity debe lanzar ExcessConsumptionException si el remanente ya no esta ACTIVE', () => {
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('1.000'));
    remanente.discard();

    expect(() => remanente.consumeQuantity(new DecimalQuantity('0.100'))).toThrow(ExcessConsumptionException);
  });

  it('discard debe vaciar el saldo, marcar el remanente como DISCARDED y devolver la cantidad descartada', () => {
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('2.500'));

    const discarded = remanente.discard();

    expect(discarded.toString()).toBe('2.500');
    expect(remanente.currentQuantity.toNumber()).toBe(0);
    expect(remanente.status).toBe('DISCARDED');
  });

  it('discard debe lanzar ExcessConsumptionException si se intenta descartar un remanente ya inactivo', () => {
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('2.500'));
    remanente.discard();

    expect(() => remanente.discard()).toThrow(ExcessConsumptionException);
  });

  it('terminalAt debe ser undefined mientras el remanente esta ACTIVE (US-020)', () => {
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('2.500'));
    expect(remanente.terminalAt).toBeUndefined();
  });

  it('consumeQuantity debe fijar terminalAt al momento exacto en que el saldo llega a cero (US-020)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('3.000'));

    vi.setSystemTime(new Date('2026-01-03T00:00:00.000Z'));
    remanente.consumeQuantity(new DecimalQuantity('3.000'));

    expect(remanente.terminalAt?.toISOString()).toBe('2026-01-03T00:00:00.000Z');
    vi.useRealTimers();
  });

  it('consumeQuantity NO debe fijar terminalAt si el remanente sigue ACTIVE tras el consumo parcial (US-020)', () => {
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('5.000'));
    remanente.consumeQuantity(new DecimalQuantity('2.000'));

    expect(remanente.terminalAt).toBeUndefined();
  });

  it('discard debe fijar terminalAt al momento exacto del descarte (US-020)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('2.500'));

    vi.setSystemTime(new Date('2026-01-04T12:00:00.000Z'));
    remanente.discard();

    expect(remanente.terminalAt?.toISOString()).toBe('2026-01-04T12:00:00.000Z');
    vi.useRealTimers();
  });

  it('createdAt debe exponer la fecha de creacion fijada por createNew (US-020)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const remanente = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('2.500'));

    expect(remanente.createdAt?.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    vi.useRealTimers();
  });

  describe('US-028: marca "intacto" y reubicación / devolución del sobrante', () => {
    it('un remanente nuevo es intacto y deja de serlo con el primer consumo', () => {
      const r = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('5.000'));
      expect(r.isPristine).toBe(true);
      // consumir 0 no rompe la marca (guarda `> 0`)
      r.consumeQuantity(new DecimalQuantity('0'));
      expect(r.isPristine).toBe(true);
      r.consumeQuantity(new DecimalQuantity('1.000'));
      expect(r.isPristine).toBe(false);
    });

    it('isPristine refleja la fila cuando el remanente viene de persistencia', () => {
      const notPristine = new Remanente({
        id: 'rem-2',
        insumoId: 'ins-1',
        currentQuantity: new DecimalQuantity('1.000'),
        initialQuantity: new DecimalQuantity('2.000'),
        location: 'X',
        status: 'ACTIVE',
        expirationDate: new Date(),
        isPristine: false,
      });
      expect(notPristine.isPristine).toBe(false);
    });

    it('relocateLeftover cambia el área y desvincula la preparación, conservando el vencimiento (#10)', () => {
      const r = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('5.000'), 'Mesa de Preparación', 24);
      r.linkToRecipePreparation('prep-1');
      const exp = r.expirationDate.toISOString();

      r.relocateLeftover('loc-fridge', 'Heladera Principal');

      expect(r.storageLocationId).toBe('loc-fridge');
      expect(r.location).toBe('Heladera Principal');
      expect(r.recipePreparationId).toBeUndefined();
      expect(r.expirationDate.toISOString()).toBe(exp);
      expect(r.status).toBe('ACTIVE');
    });

    it('returnToWarehouse cierra el remanente y devuelve la cantidad reingresada', () => {
      const r = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('2.000'), 'Mesa', 24);
      r.linkToRecipePreparation('prep-1');
      const returned = r.returnToWarehouse();
      expect(returned.toString()).toBe('2.000');
      expect(r.currentQuantity.toNumber()).toBe(0);
      expect(r.status).toBe('EXHAUSTED');
      expect(r.recipePreparationId).toBeUndefined();
      expect(r.terminalAt).toBeInstanceOf(Date);
    });

    it('unlinkFromPreparation solo borra el vínculo, sin tocar cantidad ni estado', () => {
      const r = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('2.000'));
      r.linkToRecipePreparation('prep-1');
      expect(r.recipePreparationId).toBe('prep-1');
      r.unlinkFromPreparation();
      expect(r.recipePreparationId).toBeUndefined();
      expect(r.currentQuantity.toString()).toBe('2.000');
      expect(r.status).toBe('ACTIVE');
    });

    it('relocateLeftover / returnToWarehouse fallan si el remanente ya no está ACTIVE', () => {
      const r = Remanente.createNew('rem-1', 'ins-1', new DecimalQuantity('2.000'));
      r.discard();
      expect(() => r.relocateLeftover('l', 'L')).toThrow(ExcessConsumptionException);
      expect(() => r.returnToWarehouse()).toThrow(ExcessConsumptionException);
    });
  });
});
