import { deckSchema, MIN_LESSON_SLIDES, rawSlideSchema } from './lesson-generation.schema';

const validInstructional = {
  kind: 'instructional',
  title: 'Intro',
  content: 'Welcome',
  sourcePage: null,
};
const validMultipleChoice = {
  kind: 'activity',
  activityType: 'multiple-choice',
  title: 'Capitals',
  content: 'What is the capital of France?',
  options: [
    { id: 'opt-a', label: 'Paris' },
    { id: 'opt-b', label: 'Lyon' },
  ],
  correctOptionId: 'opt-a',
  explanation: null,
  sourcePage: null,
};
const validMatching = {
  kind: 'activity',
  activityType: 'matching',
  title: 'Match',
  content: 'Match each country to its capital',
  leftItems: [{ id: 'l1', label: 'France' }],
  rightItems: [{ id: 'r1', label: 'Paris' }],
  correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
  explanation: null,
  sourcePage: null,
};
const validFillInTheBlank = {
  kind: 'activity',
  activityType: 'fill-in-the-blank',
  title: 'Blank',
  content: 'The capital of France is ____',
  acceptedAnswers: ['Paris'],
  explanation: null,
  sourcePage: null,
};
const validOpenEnded = {
  kind: 'activity',
  activityType: 'open-ended',
  title: 'Reflect',
  content: 'Why is Paris the capital of France?',
  modelAnswer: 'It has been the seat of government since...',
  explanation: null,
  sourcePage: null,
};
const validFlashcard = {
  kind: 'activity',
  activityType: 'flashcard',
  title: 'Recall',
  content: 'Capital of France',
  back: 'Paris',
  explanation: null,
  sourcePage: null,
};

/** Pad so deck-level `.min(MIN_LESSON_SLIDES)` does not mask slide invariant tests. */
const withMinSlides = <T extends typeof validInstructional>(slides: T[]) => {
  const padded = [...slides];
  let n = 0;
  while (padded.length < MIN_LESSON_SLIDES) {
    padded.push({ ...validInstructional, title: `Pad ${++n}` } as T);
  }
  return padded;
};

describe('deckSchema', () => {
  // @s3/@s13 — a "both" deck with an instructional slide and one of each R3 activity shape
  // parses cleanly.
  it('parses a valid deck mixing instructional and every activity type', () => {
    const deck = {
      title: 'Geography basics',
      slides: [
        validInstructional,
        validMultipleChoice,
        validMatching,
        validFillInTheBlank,
        validOpenEnded,
        validFlashcard,
      ],
    };

    const result = deckSchema.safeParse(deck);

    expect(result.success).toBe(true);
  });

  // @s13 invariant — correctOptionId must reference one of options[].id.
  it('rejects a multiple-choice slide whose correctOptionId is not one of its options', () => {
    const deck = {
      title: 'Geography basics',
      slides: withMinSlides([{ ...validMultipleChoice, correctOptionId: 'opt-nonexistent' }]),
    };

    const result = deckSchema.safeParse(deck);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe(
      'correctOptionId must reference one of options[].id',
    );
    expect(result.error.issues[0].path).toEqual(['slides', 0, 'correctOptionId']);
  });

  // @s13 invariant — matching must be a perfect pairing: equal-length columns, every pair
  // referencing a distinct item in each column.
  it('rejects a matching slide whose correctPairs is not a perfect pairing', () => {
    const deck = {
      title: 'Geography basics',
      slides: withMinSlides([
        {
          ...validMatching,
          leftItems: [
            { id: 'l1', label: 'France' },
            { id: 'l2', label: 'Spain' },
          ],
          // Only one pair for two left items — not a perfect pairing.
          correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
        },
      ]),
    };

    const result = deckSchema.safeParse(deck);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.issues[0].message).toBe(
      'correctPairs must be a perfect pairing of leftItems and rightItems',
    );
    expect(result.error.issues[0].path).toEqual(['slides', 0, 'correctPairs']);
  });

  it('rejects a matching pair that references an id absent from its column', () => {
    const deck = {
      title: 'Geography basics',
      slides: withMinSlides([
        { ...validMatching, correctPairs: [{ leftId: 'l1', rightId: 'r-missing' }] },
      ]),
    };

    expect(deckSchema.safeParse(deck).success).toBe(false);
  });

  // schema.ts `.min()` bounds (options/leftItems/rightItems/correctPairs/acceptedAnswers) — each
  // tested at the raw-slide level (no deck-level superRefine cross-check involved) so a
  // .min()->.max() mutant on that one field is the only thing that could flip the outcome.
  describe('array minimum-length constraints', () => {
    it('rejects a multiple-choice slide with fewer than 2 options', () => {
      const slide = { ...validMultipleChoice, options: [{ id: 'opt-a', label: 'Paris' }] };

      expect(rawSlideSchema.safeParse(slide).success).toBe(false);
    });

    it('rejects a matching slide with no leftItems', () => {
      const slide = { ...validMatching, leftItems: [] };

      expect(rawSlideSchema.safeParse(slide).success).toBe(false);
    });

    it('rejects a matching slide with no rightItems', () => {
      const slide = { ...validMatching, rightItems: [] };

      expect(rawSlideSchema.safeParse(slide).success).toBe(false);
    });

    it('rejects a matching slide with no correctPairs', () => {
      const slide = { ...validMatching, correctPairs: [] };

      expect(rawSlideSchema.safeParse(slide).success).toBe(false);
    });

    it('rejects a fill-in-the-blank slide with no acceptedAnswers', () => {
      const slide = { ...validFillInTheBlank, acceptedAnswers: [] };

      expect(rawSlideSchema.safeParse(slide).success).toBe(false);
    });
  });

  // schema.ts's matching-pairing length check
  // (`leftItems.length !== rightItems.length || leftItems.length !== correctPairs.length`) — each
  // test below holds one side of the `||` false so only the other side can be responsible for the
  // rejection, killing the `||`->`&&` mutant and both "replace one side with `false`" mutants.
  describe('matching-pairing length mismatch (isolating each side of the || check)', () => {
    it('rejects when leftItems/rightItems match in length but correctPairs does not', () => {
      const deck = {
        title: 'Geography basics',
        slides: withMinSlides([
          {
            ...validMatching,
            leftItems: [
              { id: 'l1', label: 'France' },
              { id: 'l2', label: 'Spain' },
            ],
            rightItems: [
              { id: 'r1', label: 'Paris' },
              { id: 'r2', label: 'Madrid' },
            ],
            correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
          },
        ]),
      };

      expect(deckSchema.safeParse(deck).success).toBe(false);
    });

    it('rejects when leftItems/correctPairs match in length but rightItems does not', () => {
      const deck = {
        title: 'Geography basics',
        slides: withMinSlides([
          {
            ...validMatching,
            leftItems: [{ id: 'l1', label: 'France' }],
            rightItems: [
              { id: 'r1', label: 'Paris' },
              { id: 'r2', label: 'Madrid' },
            ],
            correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
          },
        ]),
      };

      expect(deckSchema.safeParse(deck).success).toBe(false);
    });
  });

  // `.every(pair => ...)` correctness — a mix of one valid and one invalid pair must still reject
  // the whole deck; kills the `.every()`->`.some()` mutant (which would accept on the first valid
  // pair alone).
  it('rejects a matching slide with a mix of one valid and one invalid pair', () => {
    const deck = {
      title: 'Geography basics',
      slides: withMinSlides([
        {
          ...validMatching,
          leftItems: [
            { id: 'l1', label: 'France' },
            { id: 'l2', label: 'Spain' },
          ],
          rightItems: [
            { id: 'r1', label: 'Paris' },
            { id: 'r2', label: 'Madrid' },
          ],
          correctPairs: [
            { leftId: 'l1', rightId: 'r1' },
            { leftId: 'l2', rightId: 'r-missing' },
          ],
        },
      ]),
    };

    expect(deckSchema.safeParse(deck).success).toBe(false);
  });

  // Duplicate left/right id detection in matching pairs
  // (`usedLeftIds.has(...) || usedRightIds.has(...)`) — one test reuses only a leftId, the other
  // only a rightId, so both are needed to isolate the `||`->`&&` mutant and the
  // `return true`/`if (false)` mutants on that check.
  describe('matching-pair duplicate id detection', () => {
    it('rejects a matching slide that reuses the same leftId across two pairs', () => {
      const deck = {
        title: 'Geography basics',
        slides: withMinSlides([
          {
            ...validMatching,
            leftItems: [
              { id: 'l1', label: 'France' },
              { id: 'l2', label: 'Spain' },
            ],
            rightItems: [
              { id: 'r1', label: 'Paris' },
              { id: 'r2', label: 'Madrid' },
            ],
            correctPairs: [
              { leftId: 'l1', rightId: 'r1' },
              { leftId: 'l1', rightId: 'r2' },
            ],
          },
        ]),
      };

      expect(deckSchema.safeParse(deck).success).toBe(false);
    });

    it('rejects a matching slide that reuses the same rightId across two pairs', () => {
      const deck = {
        title: 'Geography basics',
        slides: withMinSlides([
          {
            ...validMatching,
            leftItems: [
              { id: 'l1', label: 'France' },
              { id: 'l2', label: 'Spain' },
            ],
            rightItems: [
              { id: 'r1', label: 'Paris' },
              { id: 'r2', label: 'Madrid' },
            ],
            correctPairs: [
              { leftId: 'l1', rightId: 'r1' },
              { leftId: 'l2', rightId: 'r1' },
            ],
          },
        ]),
      };

      expect(deckSchema.safeParse(deck).success).toBe(false);
    });
  });

  // Malformed/non-conforming AI output (risks.md R3) — a slide missing a required field fails
  // validation rather than silently coercing, so the caller can map it to generation_failed.
  it('rejects a deck whose slide is missing a required field', () => {
    const deck = {
      title: 'Geography basics',
      slides: withMinSlides([{ kind: 'instructional', title: 'Intro' } as never]),
    };

    expect(deckSchema.safeParse(deck).success).toBe(false);
  });

  it('rejects an empty deck (no slides)', () => {
    expect(deckSchema.safeParse({ title: 'Empty', slides: [] }).success).toBe(false);
  });

  it(`rejects a deck with fewer than ${MIN_LESSON_SLIDES} slides`, () => {
    const slides = Array.from({ length: MIN_LESSON_SLIDES - 1 }, (_, i) => ({
      ...validInstructional,
      title: `Slide ${i + 1}`,
    }));
    expect(deckSchema.safeParse({ title: 'Short', slides }).success).toBe(false);
  });
});
