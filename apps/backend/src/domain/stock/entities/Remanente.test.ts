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
});
