import { productFilterSchema } from './product-filter.schema';

describe('productFilterSchema', () => {
  it('returns empty arrays for all dimensions when called with empty object', () => {
    const result = productFilterSchema.parse({});
    expect(result.distance).toEqual([]);
    expect(result.surface).toEqual([]);
    expect(result.level).toEqual([]);
    expect(result.objective).toEqual([]);
  });

  it('coerces a single string distance to an array of one element', () => {
    const result = productFilterSchema.parse({ distance: '5K' });
    expect(result.distance).toEqual(['5K']);
  });

  it('parses an array of valid distance values', () => {
    const result = productFilterSchema.parse({ distance: ['5K', 'marathon'] });
    expect(result.distance).toEqual(['5K', 'marathon']);
  });

  it('filters out invalid enum values silently (no error)', () => {
    const result = productFilterSchema.parse({ distance: 'INVALIDO' });
    expect(result.distance).toEqual([]);
  });

  it('filters out invalid values within a mixed valid/invalid array', () => {
    const result = productFilterSchema.parse({ distance: ['5K', 'INVALIDO', 'marathon'] });
    expect(result.distance).toEqual(['5K', 'marathon']);
  });

  it('accepts all valid distance enum values', () => {
    const result = productFilterSchema.parse({
      distance: ['5K', '10K', 'half-marathon', 'marathon', 'ultra'],
    });
    expect(result.distance).toHaveLength(5);
  });

  it('accepts all valid surface enum values', () => {
    const result = productFilterSchema.parse({ surface: ['road', 'trail', 'track', 'mixed'] });
    expect(result.surface).toHaveLength(4);
  });

  it('accepts all valid level enum values', () => {
    const result = productFilterSchema.parse({ level: ['beginner', 'intermediate', 'advanced'] });
    expect(result.level).toHaveLength(3);
  });

  it('accepts all valid objective enum values', () => {
    const result = productFilterSchema.parse({
      objective: ['training', 'competition', 'recovery', 'daily'],
    });
    expect(result.objective).toHaveLength(4);
  });

  it('parses all four dimensions together', () => {
    const result = productFilterSchema.parse({
      distance: 'marathon',
      surface: 'road',
      level: 'advanced',
      objective: 'competition',
    });
    expect(result).toEqual({
      distance: ['marathon'],
      surface: ['road'],
      level: ['advanced'],
      objective: ['competition'],
    });
  });

  it('strips unknown keys instead of throwing', () => {
    expect(() => productFilterSchema.parse({ distance: '5K', unknownKey: 'foo' })).not.toThrow();
  });
});
