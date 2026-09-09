import { describe, it, expect } from 'vitest';
import { RecipePreparation } from './RecipePreparation.js';
import { PreparationNotOpenException } from '../errors/PreparationNotOpenException.js';

const NOW = new Date('2026-02-01T12:00:00.000Z');

describe('RecipePreparation', () => {
  it('openNew crea una preparación OPEN con los datos de apertura', () => {
    const p = RecipePreparation.openNew('prep-1', 'rec-9', 8, 'op-7', NOW);
    expect(p.id).toBe('prep-1');
    expect(p.recipeId).toBe('rec-9');
    expect(p.plannedPortions).toBe(8);
    expect(p.status).toBe('OPEN');
    expect(p.isOpen).toBe(true);
    expect(p.openedByOperatorId).toBe('op-7');
    expect(p.openedAt).toBe(NOW);
    // sin cerrar todavía
    expect(p.actualPortions).toBeUndefined();
    expect(p.closedByOperatorId).toBeUndefined();
    expect(p.closedAt).toBeUndefined();
    expect(p.notes).toBeUndefined();
  });

  it('rechaza porciones planificadas <= 0', () => {
    expect(() => RecipePreparation.openNew('p', 'r', 0, 'op', NOW)).toThrow(/mayores que cero/i);
    expect(() => RecipePreparation.openNew('p', 'r', -3, 'op', NOW)).toThrow(/mayores que cero/i);
    // 1 es válido (límite estricto)
    expect(RecipePreparation.openNew('p', 'r', 1, 'op', NOW).plannedPortions).toBe(1);
  });

  it('expone los campos de cierre cuando la fila los trae y no está OPEN', () => {
    const closedAt = new Date('2026-02-01T15:00:00.000Z');
    const p = new RecipePreparation({
      id: 'p2',
      recipeId: 'r2',
      plannedPortions: 4,
      status: 'CLOSED',
      openedByOperatorId: 'op-a',
      openedAt: NOW,
      actualPortions: 5,
      closedByOperatorId: 'op-b',
      closedAt,
      notes: 'todo ok',
    });
    expect(p.isOpen).toBe(false);
    expect(p.actualPortions).toBe(5);
    expect(p.closedByOperatorId).toBe('op-b');
    expect(p.closedAt).toBe(closedAt);
    expect(p.notes).toBe('todo ok');
  });

  it('isOpen es false para ABANDONED', () => {
    const p = new RecipePreparation({
      id: 'p3',
      recipeId: 'r3',
      plannedPortions: 2,
      status: 'ABANDONED',
      openedAt: NOW,
    });
    expect(p.isOpen).toBe(false);
  });

  it('close transiciona OPEN → CLOSED y fija actualPortions / closedBy / closedAt (US-028)', () => {
    const closedAt = new Date('2026-02-01T15:00:00.000Z');
    const p = RecipePreparation.openNew('p', 'r', 8, 'op-a', NOW);
    p.close(8, 'op-b', closedAt);
    expect(p.status).toBe('CLOSED');
    expect(p.isOpen).toBe(false);
    expect(p.actualPortions).toBe(8);
    expect(p.closedByOperatorId).toBe('op-b');
    expect(p.closedAt).toBe(closedAt);
  });

  it('close rechaza porciones reales negativas', () => {
    const p = RecipePreparation.openNew('p', 'r', 8, 'op-a', NOW);
    expect(() => p.close(-1, 'op-b', NOW)).toThrow(/negativas/i);
    expect(p.status).toBe('OPEN');
  });

  it('un segundo close (o cerrar una abandonada) lanza 409 con el estado actual', () => {
    const p = RecipePreparation.openNew('p', 'r', 8, 'op-a', NOW);
    p.close(8, 'op-b', NOW);
    try {
      p.close(8, 'op-b', NOW);
      expect.unreachable('debió lanzar');
    } catch (e) {
      expect(e).toBeInstanceOf(PreparationNotOpenException);
      expect((e as PreparationNotOpenException).statusCode).toBe(409);
      expect((e as Error).message).toContain('CLOSED');
      expect((e as Error).message).toContain('p');
      expect((e as Error).message).toMatch(/no está abierta/i);
    }
  });

  it('abandon transiciona OPEN → ABANDONED', () => {
    const p = RecipePreparation.openNew('prep-x', 'r', 8, 'op-a', NOW);
    p.abandon('op-b', NOW);
    expect(p.status).toBe('ABANDONED');
    expect(p.closedByOperatorId).toBe('op-b');
    expect(p.closedAt).toBe(NOW);
    try {
      p.abandon('op-b', NOW);
      expect.unreachable('debió lanzar');
    } catch (e) {
      expect(e).toBeInstanceOf(PreparationNotOpenException);
      expect((e as Error).message).toContain('ABANDONED');
      expect((e as Error).message).toContain('prep-x');
    }
  });
});
