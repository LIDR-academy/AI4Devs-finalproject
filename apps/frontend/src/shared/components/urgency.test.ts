import { describe, it, expect } from 'vitest';
import { urgencyFromHours, bucketRemanentes, bucketPercentages } from './urgency.js';

describe('TK-087-FE: urgency helpers', () => {
  it('urgencyFromHours cubre la escala completa, incluido "Vencido" (D-3)', () => {
    expect(urgencyFromHours(-5)).toEqual({ level: 'critical', label: 'Vencido' });
    expect(urgencyFromHours(3)).toEqual({ level: 'critical', label: 'Hoy' });
    expect(urgencyFromHours(30)).toEqual({ level: 'warning', label: 'Mañana' });
    expect(urgencyFromHours(48)).toEqual({ level: 'safe', label: '2 Días' });
    expect(urgencyFromHours(90)).toEqual({ level: 'safe', label: '4 Días' });
  });

  it('bucketRemanentes segmenta con el mismo umbral que urgencyFromHours', () => {
    const items = [{ hoursRemaining: -1 }, { hoursRemaining: 5 }, { hoursRemaining: 30 }, { hoursRemaining: 60 }, { hoursRemaining: 120 }];
    expect(bucketRemanentes(items)).toEqual({ critical: 2, warning: 1, safe: 2, total: 5 });
    expect(bucketRemanentes([])).toEqual({ critical: 0, warning: 0, safe: 0, total: 0 });
  });

  it('bucketPercentages SIEMPRE suma 100 (residuo en el segmento mayor)', () => {
    const cases = [
      { critical: 1, warning: 1, safe: 1, total: 3 }, // 33+33+33 = 99 -> residuo 1
      { critical: 2, warning: 3, safe: 7, total: 12 },
      { critical: 0, warning: 0, safe: 1, total: 1 },
      { critical: 5, warning: 0, safe: 0, total: 5 },
    ];
    for (const b of cases) {
      const p = bucketPercentages(b);
      expect(p.safePct + p.warningPct + p.criticalPct).toBe(100);
    }
  });

  it('bucketPercentages con total 0 devuelve ceros', () => {
    expect(bucketPercentages({ critical: 0, warning: 0, safe: 0, total: 0 })).toEqual({ safePct: 0, warningPct: 0, criticalPct: 0 });
  });
});
