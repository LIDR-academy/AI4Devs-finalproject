import { describe, it, expect } from 'vitest';
import { RedFlags } from '../../../../src/domain/value-objects/RedFlags';

describe('RedFlags', () => {
  it('creates an empty collection', () => {
    const flags = RedFlags.empty();
    expect(flags.count).toBe(0);
  });

  it('rejects unknown flag types', () => {
    expect(() =>
      RedFlags.create([
        { flag: 'unknown_type' as never, severity: 'low', reasoning: 'long enough reasoning text' },
      ]),
    ).toThrow();
  });

  it('rejects too-short reasoning', () => {
    expect(() =>
      RedFlags.create([{ flag: 'euphemistic_language', severity: 'low', reasoning: 'short' }]),
    ).toThrow();
  });

  it('filters by flag type', () => {
    const flags = RedFlags.create([
      {
        flag: 'euphemistic_language',
        severity: 'medium',
        reasoning: 'Usa "acogedor" sin describir el espacio.',
      },
      {
        flag: 'missing_energy_certificate',
        severity: 'medium',
        reasoning: 'No menciona certificado energético.',
      },
    ]);

    const euph = flags.byFlag('euphemistic_language');
    expect(euph).toHaveLength(1);
    expect(euph[0].reasoning).toContain('acogedor');
  });
});
