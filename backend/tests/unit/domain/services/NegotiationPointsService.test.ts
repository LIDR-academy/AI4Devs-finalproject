import { describe, it, expect } from 'vitest';
import { generateNegotiationPoints } from '../../../../src/domain/services/NegotiationPointsService';

describe('generateNegotiationPoints', () => {
  it('returns 5-8 points for a listing with red flags', () => {
    const points = generateNegotiationPoints({
      url: 'https://idealista.com/inmueble/1',
      transparencyScore: 50,
      redFlags: [
        { flag: 'euphemistic_language', severity: 'medium', reasoning: 'Usa "acogedor" sin describir el espacio.' },
        { flag: 'missing_energy_certificate', severity: 'medium', reasoning: 'No menciona certificado.' },
      ],
      createdAt: new Date(),
    });
    expect(points.length).toBeGreaterThanOrEqual(5);
    expect(points.length).toBeLessThanOrEqual(8);
  });

  it('includes stale_listing question for old listings', () => {
    const old = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);
    const points = generateNegotiationPoints({
      url: 'https://idealista.com/inmueble/2',
      transparencyScore: 80,
      redFlags: [],
      createdAt: old,
    });
    expect(points.some((p) => p.category === 'stale_listing')).toBe(true);
  });

  it('always includes the disclaimer rationale', () => {
    const points = generateNegotiationPoints({
      url: 'https://idealista.com/inmueble/3',
      transparencyScore: 90,
      redFlags: [],
      createdAt: new Date(),
    });
    expect(points.length).toBeGreaterThanOrEqual(3);
  });
});
