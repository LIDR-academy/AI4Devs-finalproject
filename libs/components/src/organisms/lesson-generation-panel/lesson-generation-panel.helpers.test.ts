import { COMPOSITION_OPTION_VALUES, stepToIndex } from './lesson-generation-panel.helpers';

describe('COMPOSITION_OPTION_VALUES', () => {
  // @s1 — the picker offers all three, "both" is the default (asserted by the wiring layer).
  it('lists all three LessonComposition values, in the order the picker shows them', () => {
    expect(COMPOSITION_OPTION_VALUES).toEqual(['instructional-only', 'activity-only', 'both']);
  });
});

describe('stepToIndex', () => {
  // @s14 — maps a GenerationProgressStep to GenerationProgress's currentIndex prop.
  it('maps reading/generating/attaching to 0/1/2', () => {
    expect(stepToIndex('reading')).toBe(0);
    expect(stepToIndex('generating')).toBe(1);
    expect(stepToIndex('attaching')).toBe(2);
  });

  it('defaults to 0 when no step is given', () => {
    expect(stepToIndex(undefined)).toBe(0);
  });
});
