import type { MatchingSlide } from '@helsoft/types';

import { gradeMatching, isMatchingSlideValid } from './grade-matching';

const slide: MatchingSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'Match each country to its capital.',
  position: 0,
  kind: 'activity',
  activityType: 'matching',
  leftItems: [
    { id: 'l1', label: 'France' },
    { id: 'l2', label: 'Germany' },
    { id: 'l3', label: 'Italy' },
  ],
  rightItems: [
    { id: 'r1', label: 'Paris' },
    { id: 'r2', label: 'Berlin' },
    { id: 'r3', label: 'Rome' },
  ],
  correctPairs: [
    { leftId: 'l1', rightId: 'r1' },
    { leftId: 'l2', rightId: 'r2' },
    { leftId: 'l3', rightId: 'r3' },
  ],
};

describe('gradeMatching', () => {
  // @s9, @s12 — all pairs correct → isCorrect true + full answered-state shape with partial counts.
  it('returns isCorrect true and full answered-state when every pair matches', () => {
    expect(
      gradeMatching(slide, [
        { leftId: 'l1', rightId: 'r1' },
        { leftId: 'l2', rightId: 'r2' },
        { leftId: 'l3', rightId: 'r3' },
      ]),
    ).toEqual({
      slideId: 'slide-1',
      activityType: 'matching',
      pairs: [
        { leftId: 'l1', rightId: 'r1', isCorrect: true },
        { leftId: 'l2', rightId: 'r2', isCorrect: true },
        { leftId: 'l3', rightId: 'r3', isCorrect: true },
      ],
      correctPairCount: 3,
      totalPairCount: 3,
      isCorrect: true,
    });
  });

  // @s10, @s12 — mixed pairs → partial credit + isCorrect false.
  it('returns partial counts and isCorrect false when some pairs are wrong', () => {
    expect(
      gradeMatching(slide, [
        { leftId: 'l1', rightId: 'r1' },
        { leftId: 'l2', rightId: 'r3' },
        { leftId: 'l3', rightId: 'r2' },
      ]),
    ).toEqual({
      slideId: 'slide-1',
      activityType: 'matching',
      pairs: [
        { leftId: 'l1', rightId: 'r1', isCorrect: true },
        { leftId: 'l2', rightId: 'r3', isCorrect: false },
        { leftId: 'l3', rightId: 'r2', isCorrect: false },
      ],
      correctPairCount: 1,
      totalPairCount: 3,
      isCorrect: false,
    });
  });

  // @s12 — zero correct pairs.
  it('returns correctPairCount 0 and isCorrect false when no pairs match', () => {
    expect(
      gradeMatching(slide, [
        { leftId: 'l1', rightId: 'r2' },
        { leftId: 'l2', rightId: 'r3' },
        { leftId: 'l3', rightId: 'r1' },
      ]),
    ).toEqual(
      expect.objectContaining({
        correctPairCount: 0,
        totalPairCount: 3,
        isCorrect: false,
      }),
    );
  });

  // Order-independent: pair list order does not affect grading.
  it('grades identically regardless of pair list order', () => {
    const a = gradeMatching(slide, [
      { leftId: 'l3', rightId: 'r3' },
      { leftId: 'l1', rightId: 'r1' },
      { leftId: 'l2', rightId: 'r2' },
    ]);
    const b = gradeMatching(slide, [
      { leftId: 'l1', rightId: 'r1' },
      { leftId: 'l2', rightId: 'r2' },
      { leftId: 'l3', rightId: 'r3' },
    ]);
    expect(a.correctPairCount).toBe(b.correctPairCount);
    expect(a.isCorrect).toBe(true);
    expect(b.isCorrect).toBe(true);
  });

  // Defensive: unknown id throws.
  it('throws when a pair references an unknown item id', () => {
    expect(() =>
      gradeMatching(slide, [
        { leftId: 'l1', rightId: 'r1' },
        { leftId: 'l2', rightId: 'r2' },
        { leftId: 'unknown', rightId: 'r3' },
      ]),
    ).toThrow(/unknown item/);
  });

  // @s15 — invalid slide → grader throws.
  it('throws when the slide is invalid', () => {
    const invalid: MatchingSlide = { ...slide, correctPairs: [{ leftId: 'nope', rightId: 'r1' }] };
    expect(() => gradeMatching(invalid, [{ leftId: 'l1', rightId: 'r1' }])).toThrow(/not a valid matching slide/);
  });
});

describe('isMatchingSlideValid', () => {
  // @s15 — well-formed slide is valid.
  it('returns true for a well-formed perfect matching', () => {
    expect(isMatchingSlideValid(slide)).toBe(true);
  });

  // @s15 — empty column.
  it('returns false when a column is empty', () => {
    expect(isMatchingSlideValid({ ...slide, leftItems: [], correctPairs: [] })).toBe(false);
  });

  // @s15 — unequal lengths.
  it('returns false when column lengths differ', () => {
    expect(
      isMatchingSlideValid({
        ...slide,
        rightItems: slide.rightItems.slice(0, 2),
        correctPairs: slide.correctPairs.slice(0, 2),
      }),
    ).toBe(false);
  });

  // @s15 — unknown id in correctPairs.
  it('returns false when correctPairs reference an unknown id', () => {
    expect(
      isMatchingSlideValid({
        ...slide,
        correctPairs: [
          { leftId: 'l1', rightId: 'r1' },
          { leftId: 'l2', rightId: 'r2' },
          { leftId: 'l3', rightId: 'unknown' },
        ],
      }),
    ).toBe(false);
  });

  // @s15 — not a perfect one-per-left matching (duplicate left).
  it('returns false when correctPairs reuse a left id', () => {
    expect(
      isMatchingSlideValid({
        ...slide,
        correctPairs: [
          { leftId: 'l1', rightId: 'r1' },
          { leftId: 'l1', rightId: 'r2' },
          { leftId: 'l3', rightId: 'r3' },
        ],
      }),
    ).toBe(false);
  });
});
