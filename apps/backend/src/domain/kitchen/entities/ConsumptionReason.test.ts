import { describe, it, expect } from 'vitest';
import { ConsumptionReason } from './ConsumptionReason.js';

describe('ConsumptionReason (ADR-004 / US-030)', () => {
  it('create() nace activo', () => {
    const reason = ConsumptionReason.create('r1', 'Preparación de plato');
    expect(reason.id).toBe('r1');
    expect(reason.label).toBe('Preparación de plato');
    expect(reason.isActive).toBe(true);
  });

  it('rechaza una etiqueta vacía o solo espacios, tanto al construir como al renombrar', () => {
    expect(() => ConsumptionReason.create('r1', '   ')).toThrow(/etiqueta/i);
    expect(() => new ConsumptionReason({ id: 'r1', label: '', isActive: true })).toThrow(/etiqueta/i);

    const reason = ConsumptionReason.create('r1', 'Otro');
    expect(() => reason.rename('  ')).toThrow(/etiqueta/i);
    expect(reason.label).toBe('Otro'); // sin cambios ante el intento inválido
  });

  it('rename() cambia la etiqueta sin afectar id ni isActive', () => {
    const reason = ConsumptionReason.create('r1', 'Otro');
    reason.rename('Error de manipulación');
    expect(reason.label).toBe('Error de manipulación');
    expect(reason.id).toBe('r1');
    expect(reason.isActive).toBe(true);
  });

  it('deactivate()/activate() alternan isActive (desactivar, nunca borrar)', () => {
    const reason = ConsumptionReason.create('r1', 'Cortesía a cliente');
    reason.deactivate();
    expect(reason.isActive).toBe(false);
    expect(reason.id).toBe('r1'); // sigue existiendo, resoluble por id
    reason.activate();
    expect(reason.isActive).toBe(true);
  });

  it('expone createdAt/updatedAt cuando vienen de persistencia', () => {
    const createdAt = new Date('2026-09-04T00:00:00.000Z');
    const updatedAt = new Date('2026-09-04T01:00:00.000Z');
    const reason = new ConsumptionReason({ id: 'r1', label: 'Otro', isActive: true, createdAt, updatedAt });
    expect(reason.createdAt).toBe(createdAt);
    expect(reason.updatedAt).toBe(updatedAt);
  });
});
