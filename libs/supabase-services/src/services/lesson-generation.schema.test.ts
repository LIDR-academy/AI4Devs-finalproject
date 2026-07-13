import { deckSchema } from './lesson-generation.schema';

const validInstructional = { kind: 'instructional', title: 'Intro', content: 'Welcome' };
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
};
const validMatching = {
  kind: 'activity',
  activityType: 'matching',
  title: 'Match',
  content: 'Match each country to its capital',
  leftItems: [{ id: 'l1', label: 'France' }],
  rightItems: [{ id: 'r1', label: 'Paris' }],
  correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
};
const validFillInTheBlank = {
  kind: 'activity',
  activityType: 'fill-in-the-blank',
  title: 'Blank',
  content: 'The capital of France is ____',
  acceptedAnswers: ['Paris'],
};
const validOpenEnded = {
  kind: 'activity',
  activityType: 'open-ended',
  title: 'Reflect',
  content: 'Why is Paris the capital of France?',
  modelAnswer: 'It has been the seat of government since...',
};
const validFlashcard = {
  kind: 'activity',
  activityType: 'flashcard',
  title: 'Recall',
  content: 'Capital of France',
  back: 'Paris',
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
      slides: [{ ...validMultipleChoice, correctOptionId: 'opt-nonexistent' }],
    };

    expect(deckSchema.safeParse(deck).success).toBe(false);
  });

  // @s13 invariant — matching must be a perfect pairing: equal-length columns, every pair
  // referencing a distinct item in each column.
  it('rejects a matching slide whose correctPairs is not a perfect pairing', () => {
    const deck = {
      title: 'Geography basics',
      slides: [
        {
          ...validMatching,
          leftItems: [
            { id: 'l1', label: 'France' },
            { id: 'l2', label: 'Spain' },
          ],
          // Only one pair for two left items — not a perfect pairing.
          correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
        },
      ],
    };

    expect(deckSchema.safeParse(deck).success).toBe(false);
  });

  it('rejects a matching pair that references an id absent from its column', () => {
    const deck = {
      title: 'Geography basics',
      slides: [{ ...validMatching, correctPairs: [{ leftId: 'l1', rightId: 'r-missing' }] }],
    };

    expect(deckSchema.safeParse(deck).success).toBe(false);
  });

  // Malformed/non-conforming AI output (risks.md R3) — a slide missing a required field fails
  // validation rather than silently coercing, so the caller can map it to generation_failed.
  it('rejects a deck whose slide is missing a required field', () => {
    const deck = { title: 'Geography basics', slides: [{ kind: 'instructional', title: 'Intro' }] };

    expect(deckSchema.safeParse(deck).success).toBe(false);
  });

  it('rejects an empty deck (no slides)', () => {
    expect(deckSchema.safeParse({ title: 'Empty', slides: [] }).success).toBe(false);
  });
});
