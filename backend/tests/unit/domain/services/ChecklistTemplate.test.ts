import { describe, it, expect } from 'vitest';
import { CHECKLIST_TEMPLATE } from '../../../../src/domain/services/ChecklistTemplate';

describe('CHECKLIST_TEMPLATE', () => {
  it('contains exactly 21 items', () => {
    expect(CHECKLIST_TEMPLATE).toHaveLength(21);
  });

  it('covers all 6 bureaucratic stages', () => {
    const stages = new Set(CHECKLIST_TEMPLATE.map((i) => i.stage));
    expect(stages).toEqual(
      new Set(['PRE_ARRAS', 'ARRAS', 'DUE_DILIGENCE', 'PRE_ESCRITURA', 'ESCRITURA', 'POST_ESCRITURA']),
    );
  });

  it('has a non-empty title and description for every item', () => {
    for (const item of CHECKLIST_TEMPLATE) {
      expect(item.title.length).toBeGreaterThan(5);
      expect(item.description.length).toBeGreaterThan(10);
    }
  });

  it('has unique sortOrder within each stage', () => {
    for (const stage of ['PRE_ARRAS', 'ARRAS', 'DUE_DILIGENCE', 'PRE_ESCRITURA', 'ESCRITURA', 'POST_ESCRITURA'] as const) {
      const itemsInStage = CHECKLIST_TEMPLATE.filter((i) => i.stage === stage);
      const sortOrders = itemsInStage.map((i) => i.sortOrder);
      expect(new Set(sortOrders).size).toBe(sortOrders.length);
    }
  });

  it('has non-negative estimatedDays', () => {
    for (const item of CHECKLIST_TEMPLATE) {
      expect(item.estimatedDays).toBeGreaterThanOrEqual(0);
    }
  });

  it('per-stage item count is correct (PRE_ARRAS=5, ARRAS=3, DUE_DILIGENCE=4, PRE_ESCRITURA=3, ESCRITURA=2, POST_ESCRITURA=4)', () => {
    const counts: Record<string, number> = {};
    for (const item of CHECKLIST_TEMPLATE) {
      counts[item.stage] = (counts[item.stage] ?? 0) + 1;
    }
    expect(counts).toEqual({
      PRE_ARRAS: 5,
      ARRAS: 3,
      DUE_DILIGENCE: 4,
      PRE_ESCRITURA: 3,
      ESCRITURA: 2,
      POST_ESCRITURA: 4,
    });
  });
});
