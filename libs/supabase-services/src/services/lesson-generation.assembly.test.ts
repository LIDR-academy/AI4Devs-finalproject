import type { ActivitySlide, InstructionalSlide, MultipleChoiceSlide } from '@helsoft/types';

import { assembleGeneratedLesson, GenerationSchemaError } from './lesson-generation.assembly';

const rawDeck = {
  title: 'Photosynthesis',
  slides: [
    { kind: 'instructional', title: 'Intro', content: 'Welcome', sourcePage: 1 },
    {
      kind: 'activity',
      activityType: 'multiple-choice',
      title: 'Quiz',
      content: 'What converts light to energy?',
      options: [
        { id: 'opt-a', label: 'Chlorophyll' },
        { id: 'opt-b', label: 'Xylem' },
      ],
      correctOptionId: 'opt-a',
      sourcePage: 2,
    },
  ],
};

describe('assembleGeneratedLesson', () => {
  // @s3 — validates the model output, mints a lessonId, and returns an ordered, typed deck.
  it('returns an ordered, typed deck with a minted lessonId and the requested composition', () => {
    const lesson = assembleGeneratedLesson({ composition: 'both', rawDeck, images: [] });

    expect(lesson.lessonId).toBeTruthy();
    expect(lesson.title).toBe('Photosynthesis');
    expect(lesson.composition).toBe('both');
    expect(lesson.slides).toHaveLength(2);
    expect(lesson.slides[0].position).toBe(0);
    expect(lesson.slides[1].position).toBe(1);
  });

  it('stamps every slide with the same lessonId as the deck', () => {
    const lesson = assembleGeneratedLesson({ composition: 'both', rawDeck, images: [] });

    expect(lesson.slides.every((slide) => slide.lessonId === lesson.lessonId)).toBe(true);
  });

  // @s3 — each slide is typed as either instructional or activity.
  it('maps kind: instructional slides to InstructionalSlide', () => {
    const lesson = assembleGeneratedLesson({ composition: 'both', rawDeck, images: [] });

    const instructional = lesson.slides[0] as InstructionalSlide;
    expect(instructional.kind).toBe('instructional');
    expect(instructional.title).toBe('Intro');
  });

  // @s13 — an activity slide carries its correct answer(s), unchanged from the model output.
  it('maps a multiple-choice raw slide to a MultipleChoiceSlide carrying its options/correctOptionId', () => {
    const lesson = assembleGeneratedLesson({ composition: 'both', rawDeck, images: [] });

    const mcq = lesson.slides[1] as MultipleChoiceSlide;
    expect(mcq.kind).toBe('activity');
    expect(mcq.activityType).toBe('multiple-choice');
    expect(mcq.correctOptionId).toBe('opt-a');
    expect(mcq.options).toHaveLength(2);
  });

  // @s13 (remaining Scenario Outline examples) — matching/fill-in-the-blank/open-ended/flashcard
  // each carry the correct answer(s) their type requires, and an explanation when the model
  // provided one.
  it('maps matching/fill-in-the-blank/open-ended/flashcard raw slides with their answers and explanation intact', () => {
    const deck = {
      title: 'Geography basics',
      slides: [
        {
          kind: 'activity',
          activityType: 'matching',
          title: 'Match',
          content: 'Match each country to its capital',
          leftItems: [{ id: 'l1', label: 'France' }],
          rightItems: [{ id: 'r1', label: 'Paris' }],
          correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
          explanation: 'France -> Paris',
        },
        {
          kind: 'activity',
          activityType: 'fill-in-the-blank',
          title: 'Blank',
          content: 'The capital of France is ____',
          acceptedAnswers: ['Paris'],
          explanation: 'Paris is the capital',
        },
        {
          kind: 'activity',
          activityType: 'open-ended',
          title: 'Reflect',
          content: 'Why is Paris the capital of France?',
          modelAnswer: 'It has been the seat of government since...',
          explanation: 'History context',
        },
        {
          kind: 'activity',
          activityType: 'flashcard',
          title: 'Recall',
          content: 'Capital of France',
          back: 'Paris',
          explanation: 'Common trivia',
        },
      ],
    };

    const lesson = assembleGeneratedLesson({ composition: 'both', rawDeck: deck, images: [] });
    const [matching, fillInTheBlank, openEnded, flashcard] = lesson.slides as ActivitySlide[];

    expect(matching).toMatchObject({
      activityType: 'matching',
      correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
      explanation: 'France -> Paris',
    });
    expect(fillInTheBlank).toMatchObject({
      activityType: 'fill-in-the-blank',
      acceptedAnswers: ['Paris'],
      explanation: 'Paris is the capital',
    });
    expect(openEnded).toMatchObject({
      activityType: 'open-ended',
      modelAnswer: 'It has been the seat of government since...',
      explanation: 'History context',
    });
    expect(flashcard).toMatchObject({
      activityType: 'flashcard',
      back: 'Paris',
      explanation: 'Common trivia',
    });
  });

  // @s13 — explanation is optional: a slide the model gave none for omits the field entirely
  // rather than carrying an empty/null placeholder.
  it('omits explanation on an activity slide when the model provided none', () => {
    const lesson = assembleGeneratedLesson({ composition: 'both', rawDeck, images: [] });

    const mcq = lesson.slides[1] as MultipleChoiceSlide;
    expect(mcq.explanation).toBeUndefined();
  });

  // @s9/@s11 — an image whose page metadata matches a slide's sourcePage is attached to that
  // slide by reference; a slide with no relevant image is text-only (image omitted, not null).
  it('attaches a SlideImageRef to the slide anchored by matching page metadata, leaving the other text-only', () => {
    const lesson = assembleGeneratedLesson({
      composition: 'both',
      rawDeck,
      images: [
        {
          imageId: 'image-1',
          storagePath: 'u/d/p2-0.png',
          width: 400,
          height: 300,
          pageNumber: 2,
        },
      ],
    });

    const mcq = lesson.slides[1] as ActivitySlide;
    expect(mcq.image).toEqual({
      imageId: 'image-1',
      storagePath: 'u/d/p2-0.png',
      width: 400,
      height: 300,
    });
    expect(lesson.slides[0].image).toBeUndefined();
  });

  // risks.md R3 — a response that fails deck-schema validation throws a typed
  // GenerationSchemaError, never a partial deck; task-12 maps it to generation_failed.
  it('throws a GenerationSchemaError for a model response that fails schema validation', () => {
    const invalidDeck = { title: 'Bad', slides: [{ kind: 'instructional', title: 'Intro' }] };

    expect(() =>
      assembleGeneratedLesson({ composition: 'both', rawDeck: invalidDeck, images: [] }),
    ).toThrow(GenerationSchemaError);
  });

  // Two lessons generated back-to-back never collide on lessonId.
  it('mints a distinct lessonId per call', () => {
    const first = assembleGeneratedLesson({ composition: 'both', rawDeck, images: [] });
    const second = assembleGeneratedLesson({ composition: 'both', rawDeck, images: [] });

    expect(first.lessonId).not.toBe(second.lessonId);
  });
});
