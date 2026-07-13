import type { GeneratedLesson, LessonComposition, Slide, SlideImageRef } from '@helsoft/types';

import type { PageAnchoredImage, VisionPlacementDecision } from './lesson-generation.placement';
import { applyVisionPlacements, placeImagesByMetadata } from './lesson-generation.placement';
import { deckSchema, type RawSlide } from './lesson-generation.schema';

/** Thrown when the model's raw response fails `deckSchema` validation (risks.md R3) — the
 * caller (task-12, the Edge Function's own error mapping) catches this and maps it to the
 * typed `generation_failed` code. Never a partial deck: parsing is all-or-nothing. */
export class GenerationSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenerationSchemaError';
  }
}

export type AssembleGeneratedLessonInput = {
  composition: LessonComposition;
  /** The model's raw, not-yet-validated response (already parsed JSON). */
  rawDeck: unknown;
  /** The document's image manifest (position metadata only, never bytes) for placement. */
  images: PageAnchoredImage[];
  /** Vision-model placement decisions (task-12, @s10) for images metadata alone couldn't anchor
   * — computed by the caller (the Edge Function) before this synchronous assembly step runs.
   * Defaults to none (metadata-only placement); an unplaced image with no decision degrades to
   * text-only rather than failing the deck (@s12). */
  visionDecisions?: VisionPlacementDecision[];
};

/** Belt-and-suspenders composition enforcement (task-11, @s4/@s5/@s6): the prompt already
 * instructs the model, but an LLM that ignores it must still be rejected here rather than
 * silently returning a wrong-composition deck — `both` is never constrained. */
const assertComposition = (composition: LessonComposition, slides: RawSlide[]): void => {
  if (composition === 'instructional-only' && slides.some((slide) => slide.kind === 'activity')) {
    throw new GenerationSchemaError(
      'instructional-only composition must not contain activity slides',
    );
  }
  if (composition === 'activity-only' && slides.some((slide) => slide.kind === 'instructional')) {
    throw new GenerationSchemaError(
      'activity-only composition must not contain instructional slides',
    );
  }
};

const buildSlide = (
  raw: RawSlide,
  common: { id: string; lessonId: string; position: number; image?: SlideImageRef },
): Slide => {
  if (raw.kind === 'instructional') {
    return { ...common, kind: 'instructional', title: raw.title, content: raw.content };
  }

  const activityBase = {
    ...common,
    kind: 'activity' as const,
    title: raw.title,
    content: raw.content,
  };

  switch (raw.activityType) {
    case 'multiple-choice':
      return {
        ...activityBase,
        activityType: 'multiple-choice',
        options: raw.options,
        correctOptionId: raw.correctOptionId,
        ...(raw.explanation ? { explanation: raw.explanation } : {}),
      };
    case 'matching':
      return {
        ...activityBase,
        activityType: 'matching',
        leftItems: raw.leftItems,
        rightItems: raw.rightItems,
        correctPairs: raw.correctPairs,
        ...(raw.explanation ? { explanation: raw.explanation } : {}),
      };
    case 'fill-in-the-blank':
      return {
        ...activityBase,
        activityType: 'fill-in-the-blank',
        acceptedAnswers: raw.acceptedAnswers,
        ...(raw.explanation ? { explanation: raw.explanation } : {}),
      };
    case 'open-ended':
      return {
        ...activityBase,
        activityType: 'open-ended',
        modelAnswer: raw.modelAnswer,
        ...(raw.explanation ? { explanation: raw.explanation } : {}),
      };
    case 'flashcard':
      return {
        ...activityBase,
        activityType: 'flashcard',
        back: raw.back,
        ...(raw.explanation ? { explanation: raw.explanation } : {}),
      };
  }
};

/**
 * Validates the model's raw response against `deckSchema` (throwing `GenerationSchemaError` on
 * any failure, risks.md R3), then mints a `lessonId`, orders + stamps every slide, and attaches
 * `SlideImageRef`s via metadata placement (@s3/@s9/@s11). No `lessons` row is written (Open
 * decision #5) — the returned deck is in-memory only.
 */
export const assembleGeneratedLesson = ({
  composition,
  rawDeck,
  images,
  visionDecisions,
}: AssembleGeneratedLessonInput): GeneratedLesson => {
  const parsed = deckSchema.safeParse(rawDeck);
  if (!parsed.success) {
    throw new GenerationSchemaError(parsed.error.message);
  }
  assertComposition(composition, parsed.data.slides);

  const lessonId = crypto.randomUUID();
  const metadataPlacement = placeImagesByMetadata(
    parsed.data.slides.map((slide, index) => ({ index, sourcePage: slide.sourcePage })),
    images,
  );
  const { placements } = visionDecisions?.length
    ? applyVisionPlacements(
        metadataPlacement.unplaced,
        visionDecisions,
        metadataPlacement.placements,
      )
    : metadataPlacement;

  const slides = parsed.data.slides.map((raw, index) =>
    buildSlide(raw, {
      id: crypto.randomUUID(),
      lessonId,
      position: index,
      ...(placements.has(index) ? { image: placements.get(index) } : {}),
    }),
  );

  return { lessonId, title: parsed.data.title, composition, slides };
};
