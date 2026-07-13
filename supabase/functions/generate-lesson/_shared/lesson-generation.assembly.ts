// Mirrors libs/supabase-services/src/services/lesson-generation.assembly.ts -- kept manually in
// sync by hand (task-4 note, same rule as R1's pdf-extraction/_shared mirrors).
import type { PageAnchoredImage, VisionPlacementDecision } from './lesson-generation.placement.ts';
import { applyVisionPlacements, placeImagesByMetadata } from './lesson-generation.placement.ts';
import { deckSchema, type RawSlide } from './lesson-generation.schema.ts';
import type { GeneratedLesson, LessonComposition, Slide, SlideImageRef } from './types.ts';

export class GenerationSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenerationSchemaError';
  }
}

export type AssembleGeneratedLessonInput = {
  composition: LessonComposition;
  rawDeck: unknown;
  images: PageAnchoredImage[];
  // task-12, @s10/@s12 -- vision-model placement decisions for images metadata alone couldn't
  // anchor; defaults to none (metadata-only placement).
  visionDecisions?: VisionPlacementDecision[];
};

// task-11, @s4/@s5/@s6 -- belt-and-suspenders composition enforcement: the prompt already
// instructs the model, but an LLM that ignores it must still be rejected here rather than
// silently returning a wrong-composition deck -- "both" is never constrained.
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
    ? applyVisionPlacements(metadataPlacement.unplaced, visionDecisions, metadataPlacement.placements)
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
