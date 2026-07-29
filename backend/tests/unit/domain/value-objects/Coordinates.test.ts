import { describe, it, expect } from 'vitest';
import { Coordinates } from '../../../../src/domain/value-objects/Coordinates';

describe('Coordinates', () => {
  it('creates valid coordinates', () => {
    const c = Coordinates.create(40.4168, -3.7038, 'geocoded', 0.9);
    expect(c.lat).toBe(40.4168);
    expect(c.lng).toBe(-3.7038);
    expect(c.source).toBe('geocoded');
    expect(c.confidence).toBe(0.9);
  });

  it('rejects invalid latitude', () => {
    expect(() => Coordinates.create(91, 0, 'geocoded')).toThrow();
    expect(() => Coordinates.create(-91, 0, 'geocoded')).toThrow();
  });

  it('rejects invalid longitude', () => {
    expect(() => Coordinates.create(0, 181, 'geocoded')).toThrow();
  });

  it('rejects invalid confidence', () => {
    expect(() => Coordinates.create(0, 0, 'geocoded', -0.1)).toThrow();
    expect(() => Coordinates.create(0, 0, 'geocoded', 1.1)).toThrow();
  });
});
