import type { ActivitySlide, InstructionalSlide, MultipleChoiceSlide } from '@helsoft/types';

import { assembleGeneratedLesson, GenerationSchemaError } from './lesson-generation.assembly';
import { placeImagesByMetadata } from './lesson-generation.placement';
import type { PageAnchoredImage, PlacementResult } from './lesson-generation.types';

/** review.md round-1 finding #6 — `assembleGeneratedLesson` no longer computes
 * `placeImagesByMetadata` itself; the caller (the Edge Function in production, this helper in
 * tests) computes it once and passes the `PlacementResult` in. Mirrors exactly what
 * `generate-lesson/index.ts` already does to derive `unplaced` for the vision-fallback decision,
 * so the deck's own `sourcePage` fields drive the anchoring the same way in both places. */
const emptyPlacement: PlacementResult = { placements: new Map(), unplaced: [] };
const placementFor = (
  deck: { slides: { sourcePage?: number }[] },
  images: PageAnchoredImage[],
): PlacementResult =>
  placeImagesByMetadata(
    deck.slides.map((slide, index) => ({ index, sourcePage: slide.sourcePage })),
    images,
  );

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
      explanation: null,
      sourcePage: 2,
    },
  ],
};

describe('assembleGeneratedLesson', () => {
  // @s3 — validates the model output, mints a lessonId, and returns an ordered, typed deck.
  it('returns an ordered, typed deck with a minted lessonId and the requested composition', () => {
    const lesson = assembleGeneratedLesson({
      composition: 'both',
      rawDeck,
      metadataPlacement: emptyPlacement,
    });

    expect(lesson.lessonId).toBeTruthy();
    expect(lesson.title).toBe('Photosynthesis');
    expect(lesson.composition).toBe('both');
    expect(lesson.slides).toHaveLength(2);
    expect(lesson.slides[0].position).toBe(0);
    expect(lesson.slides[1].position).toBe(1);
  });

  it('stamps every slide with the same lessonId as the deck', () => {
    const lesson = assembleGeneratedLesson({
      composition: 'both',
      rawDeck,
      metadataPlacement: emptyPlacement,
    });

    expect(lesson.slides.every((slide) => slide.lessonId === lesson.lessonId)).toBe(true);
  });

  // @s3 — each slide is typed as either instructional or activity.
  it('maps kind: instructional slides to InstructionalSlide', () => {
    const lesson = assembleGeneratedLesson({
      composition: 'both',
      rawDeck,
      metadataPlacement: emptyPlacement,
    });

    const instructional = lesson.slides[0] as InstructionalSlide;
    expect(instructional.kind).toBe('instructional');
    expect(instructional.title).toBe('Intro');
  });

  // @s13 — an activity slide carries its correct answer(s), unchanged from the model output.
  it('maps a multiple-choice raw slide to a MultipleChoiceSlide carrying its options/correctOptionId', () => {
    const lesson = assembleGeneratedLesson({
      composition: 'both',
      rawDeck,
      metadataPlacement: emptyPlacement,
    });

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
          sourcePage: null,
        },
        {
          kind: 'activity',
          activityType: 'fill-in-the-blank',
          title: 'Blank',
          content: 'The capital of France is ____',
          acceptedAnswers: ['Paris'],
          explanation: 'Paris is the capital',
          sourcePage: null,
        },
        {
          kind: 'activity',
          activityType: 'open-ended',
          title: 'Reflect',
          content: 'Why is Paris the capital of France?',
          modelAnswer: 'It has been the seat of government since...',
          explanation: 'History context',
          sourcePage: null,
        },
        {
          kind: 'activity',
          activityType: 'flashcard',
          title: 'Recall',
          content: 'Capital of France',
          back: 'Paris',
          explanation: 'Common trivia',
          sourcePage: null,
        },
      ],
    };

    const lesson = assembleGeneratedLesson({
      composition: 'both',
      rawDeck: deck,
      metadataPlacement: emptyPlacement,
    });
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

  // @s13 — explanation may be null from the model; assembly omits it on the public slide
  // rather than carrying an empty/null placeholder.
  it('omits explanation on an activity slide when the model provided none', () => {
    const lesson = assembleGeneratedLesson({
      composition: 'both',
      rawDeck,
      metadataPlacement: emptyPlacement,
    });

    const mcq = lesson.slides[1] as MultipleChoiceSlide;
    expect(mcq.explanation).toBeUndefined();
  });

  // @s13 — the other branch of the same ternary: a multiple-choice slide the model DID give an
  // explanation for carries it through unchanged.
  it('carries explanation through on a multiple-choice slide when the model provided one', () => {
    const deckWithExplanation = {
      ...rawDeck,
      slides: [
        rawDeck.slides[0],
        { ...rawDeck.slides[1], explanation: 'Chlorophyll captures light energy' },
      ],
    };

    const lesson = assembleGeneratedLesson({
      composition: 'both',
      rawDeck: deckWithExplanation,
      metadataPlacement: emptyPlacement,
    });

    const mcq = lesson.slides[1] as MultipleChoiceSlide;
    expect(mcq.explanation).toBe('Chlorophyll captures light energy');
  });

  // @s9/@s11 — an image whose page metadata matches a slide's sourcePage is attached to that
  // slide by reference; a slide with no relevant image is text-only (image omitted, not null).
  it('attaches a SlideImageRef to the slide anchored by matching page metadata, leaving the other text-only', () => {
    const lesson = assembleGeneratedLesson({
      composition: 'both',
      rawDeck,
      metadataPlacement: placementFor(rawDeck, [
        {
          imageId: 'image-1',
          storagePath: 'u/d/p2-0.png',
          width: 400,
          height: 300,
          pageNumber: 2,
        },
      ]),
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

    let thrown: Error | undefined;
    try {
      assembleGeneratedLesson({
        composition: 'both',
        rawDeck: invalidDeck,
        metadataPlacement: emptyPlacement,
      });
    } catch (error) {
      thrown = error as Error;
    }

    expect(thrown).toBeInstanceOf(GenerationSchemaError);
    expect(thrown?.name).toBe('GenerationSchemaError');
    expect(thrown?.message.length).toBeGreaterThan(0);
  });

  // Two lessons generated back-to-back never collide on lessonId.
  it('mints a distinct lessonId per call', () => {
    const first = assembleGeneratedLesson({
      composition: 'both',
      rawDeck,
      metadataPlacement: emptyPlacement,
    });
    const second = assembleGeneratedLesson({
      composition: 'both',
      rawDeck,
      metadataPlacement: emptyPlacement,
    });

    expect(first.lessonId).not.toBe(second.lessonId);
  });

  // task-11, @s4/@s5/@s6 — composition is enforced belt-and-suspenders: the prompt instructs it
  // (lesson-generation.prompt.ts) and assembly rejects a parsed deck that violates it, rather
  // than silently returning a wrong-composition deck (risks.md R3, feeds task-12's
  // generation_failed).
  describe('composition enforcement (task-11)', () => {
    const instructionalSlide = rawDeck.slides[0];
    const activitySlide = rawDeck.slides[1];

    // @s4 — a model response that ignores the "instructional only" instruction and still
    // includes an activity slide is rejected, not silently returned.
    it('rejects an instructional-only deck that contains an activity slide', () => {
      const deck = { title: 'Photosynthesis', slides: [instructionalSlide, activitySlide] };

      expect(() =>
        assembleGeneratedLesson({
          composition: 'instructional-only',
          rawDeck: deck,
          metadataPlacement: emptyPlacement,
        }),
      ).toThrow('instructional-only composition must not contain activity slides');
    });

    // @s4 — an all-instructional deck is accepted for the instructional-only composition.
    it('accepts an instructional-only deck containing only instructional slides', () => {
      const deck = { title: 'Photosynthesis', slides: [instructionalSlide] };

      const lesson = assembleGeneratedLesson({
        composition: 'instructional-only',
        rawDeck: deck,
        metadataPlacement: emptyPlacement,
      });

      expect(lesson.slides.every((slide) => slide.kind === 'instructional')).toBe(true);
    });

    // @s5 — a model response that ignores the "activity only" instruction and still includes an
    // instructional slide is rejected, not silently returned.
    it('rejects an activity-only deck that contains an instructional slide', () => {
      const deck = { title: 'Photosynthesis', slides: [instructionalSlide, activitySlide] };

      expect(() =>
        assembleGeneratedLesson({
          composition: 'activity-only',
          rawDeck: deck,
          metadataPlacement: emptyPlacement,
        }),
      ).toThrow('activity-only composition must not contain instructional slides');
    });

    // @s5 — an all-activity deck is accepted for the activity-only composition.
    it('accepts an activity-only deck containing only activity slides', () => {
      const deck = { title: 'Photosynthesis', slides: [activitySlide] };

      const lesson = assembleGeneratedLesson({
        composition: 'activity-only',
        rawDeck: deck,
        metadataPlacement: emptyPlacement,
      });

      expect(lesson.slides.every((slide) => slide.kind === 'activity')).toBe(true);
    });

    // @s6 — the "both" composition is never constrained by the instructional-only/activity-only
    // checks: a mixed deck still assembles for it (already covered by the top-level tests above),
    // pinned here so a mutant collapsing the composition guard to always-throw is caught.
    it('never rejects a mixed deck for the "both" composition', () => {
      const deck = { title: 'Photosynthesis', slides: [instructionalSlide, activitySlide] };

      expect(() =>
        assembleGeneratedLesson({
          composition: 'both',
          rawDeck: deck,
          metadataPlacement: emptyPlacement,
        }),
      ).not.toThrow();
    });
  });

  // task-12, @s10/@s12 — an image metadata couldn't anchor (no matching sourcePage) is still
  // placed when the caller (the Edge Function) supplies a vision-model decision for it; an
  // unplaced image with no such decision degrades to text-only rather than failing the deck.
  describe('vision-fallback placement (task-12)', () => {
    const unanchorableImage = {
      imageId: 'image-2',
      storagePath: 'u/d/p9-0.png',
      width: 200,
      height: 150,
      pageNumber: 9,
    };

    // @s10 — a vision decision places an image metadata alone couldn't anchor.
    it('attaches an image via a vision-model decision when metadata leaves it unplaced', () => {
      const lesson = assembleGeneratedLesson({
        composition: 'both',
        rawDeck,
        metadataPlacement: placementFor(rawDeck, [unanchorableImage]),
        visionDecisions: [{ imageId: 'image-2', slideIndex: 0 }],
      });

      expect(lesson.slides[0].image).toEqual({
        imageId: 'image-2',
        storagePath: 'u/d/p9-0.png',
        width: 200,
        height: 150,
      });
    });

    // @s12 — no vision decision for an unanchorable image degrades it to text-only; the deck
    // still assembles successfully rather than failing the request over it.
    it('assembles successfully, text-only, when an unanchorable image has no vision decision', () => {
      const lesson = assembleGeneratedLesson({
        composition: 'both',
        rawDeck,
        metadataPlacement: placementFor(rawDeck, [unanchorableImage]),
      });

      expect(lesson.slides.every((slide) => slide.image === undefined)).toBe(true);
    });
  });
});
