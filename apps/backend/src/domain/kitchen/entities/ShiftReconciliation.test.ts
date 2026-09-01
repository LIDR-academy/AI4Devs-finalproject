import { describe, it, expect, vi } from 'vitest';
import Decimal from 'decimal.js';
import { ShiftReconciliation } from './ShiftReconciliation.js';
import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';

describe('ShiftReconciliation Domain Entity — Cierre de Turno', () => {
  it('debe asignar createdAt automaticamente a la hora actual cuando no se provee explicitamente', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T08:00:00.000Z'));

    const reconciliation = new ShiftReconciliation({
      id: 'rec-1',
      shiftDate: new Date('2026-01-01T00:00:00.000Z'),
      operatorId: 'usr-1',
      items: [],
    });

    expect(reconciliation.createdAt.toISOString()).toBe('2026-01-01T08:00:00.000Z');

    vi.useRealTimers();
  });

  it('items debe devolver una copia defensiva: mutar el arreglo retornado no debe alterar el estado interno', () => {
    const reconciliation = new ShiftReconciliation({
      id: 'rec-1',
      shiftDate: new Date('2026-01-01T00:00:00.000Z'),
      operatorId: 'usr-1',
      items: [],
    });

    const externalItems = reconciliation.items;
    externalItems.push({
      remanenteId: 'rem-1',
      insumoId: 'ins-1',
      physicalQuantity: new DecimalQuantity('1.000'),
      theoreticalQuantity: new DecimalQuantity('1.000'),
      variance: new Decimal('0'),
    });

    // ORACULO ESTADO: la mutacion externa no debe filtrarse al estado interno de la entidad
    expect(reconciliation.items).toHaveLength(0);
  });
});
