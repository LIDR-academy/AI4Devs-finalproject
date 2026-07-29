import { describe, it, expect } from 'vitest';
import { TransparencyScore } from '../../../../src/domain/value-objects/TransparencyScore';

describe('TransparencyScore', () => {
  it('rejects scores below 0', () => {
    expect(() => TransparencyScore.create(-1)).toThrow();
  });

  it('rejects scores above 100', () => {
    expect(() => TransparencyScore.create(101)).toThrow();
  });

  it('rejects non-integer scores', () => {
    expect(() => TransparencyScore.create(50.5)).toThrow();
  });

  it('accepts boundary values 0 and 100', () => {
    expect(TransparencyScore.create(0).value).toBe(0);
    expect(TransparencyScore.create(100).value).toBe(100);
  });

  it('derives label from score', () => {
    expect(TransparencyScore.create(95).label).toBe('excelente');
    expect(TransparencyScore.create(75).label).toBe('alta');
    expect(TransparencyScore.create(55).label).toBe('media');
    expect(TransparencyScore.create(30).label).toBe('baja');
  });

  it('round-trips through toJSON', () => {
    const score = TransparencyScore.create(80, [
      { category: 'transparency', score: 80, weight: 1 },
    ]);
    const json = score.toJSON();
    expect(json.value).toBe(80);
    expect(json.label).toBe('alta');
    expect(json.breakdown).toHaveLength(1);
  });
});
