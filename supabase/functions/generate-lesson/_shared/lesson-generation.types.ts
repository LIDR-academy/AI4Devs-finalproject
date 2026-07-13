// Mirrors libs/supabase-services/src/services/lesson-generation.types.ts -- kept manually in
// sync by hand (task-4 note, same rule as R1's pdf-extraction/_shared mirrors; review.md round-1
// finding #2's file split, hand-mirrored here too).
import type { z } from 'npm:zod@4';

import { deckSchema, rawSlideSchema } from './lesson-generation.schema.ts';
import type { GenerationErrorCode, LessonComposition, SlideImageRef } from './types.ts';

// --- lesson-generation.placement.ts -----------------------------------------------------------

export type PageAnchoredImage = {
  imageId: string;
  storagePath: string;
  width: number;
  height: number;
  pageNumber: number;
  alt?: string;
};

export type AnchoredSlide = {
  index: number;
  sourcePage?: number;
};

export type PlacementResult = {
  placements: Map<number, SlideImageRef>;
  unplaced: PageAnchoredImage[];
};

// task-12, @s10/@s12 -- one vision-model decision for an image metadata couldn't anchor: the
// slide index to place it at, or `null` to drop it.
export type VisionPlacementDecision = {
  imageId: string;
  slideIndex: number | null;
};

// --- lesson-generation.schema.ts --------------------------------------------------------------

export type RawSlide = z.infer<typeof rawSlideSchema>;

export type Deck = z.infer<typeof deckSchema>;

// --- lesson-generation.assembly.ts ------------------------------------------------------------

export type AssembleGeneratedLessonInput = {
  composition: LessonComposition;
  rawDeck: unknown;
  // The metadata-only image placement, computed once by the caller (index.ts) before this
  // assembly step runs -- never recomputed here (review.md round-1 finding #6).
  metadataPlacement: PlacementResult;
  // task-12, @s10/@s12 -- vision-model placement decisions for images metadata alone couldn't
  // anchor; defaults to none (metadata-only placement).
  visionDecisions?: VisionPlacementDecision[];
};

// --- lesson-generation.errors.ts --------------------------------------------------------------

export type GenerationErrorMapping = {
  errorCode: GenerationErrorCode;
  status: number;
};

// --- lesson-generation.prompt.ts --------------------------------------------------------------

export type PromptImageManifestEntry = {
  imageId: string;
  pageNumber: number;
  positionIndex: number;
  description?: string;
};

export type BuildDeckPromptInput = {
  composition: LessonComposition;
  pages: { page: number; text: string }[];
  images: PromptImageManifestEntry[];
};
