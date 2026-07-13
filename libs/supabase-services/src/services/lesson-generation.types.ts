import type { GenerationErrorCode, LessonComposition, SlideImageRef } from '@helsoft/types';
import type { z } from 'zod';

import type { deckSchema, rawSlideSchema } from './lesson-generation.schema';

/**
 * Cross-file types shared by `lesson-generation.placement.ts` / `.schema.ts` / `.assembly.ts` /
 * `.prompt.ts` / `.errors.ts` — moved out of those implementation files (review.md round-1
 * finding #2, `types.mdc`'s "don't export types from the service implementation file" rule).
 * Hand-mirrored into `supabase/functions/generate-lesson/_shared/` (risks.md R2).
 */

// --- lesson-generation.placement.ts -----------------------------------------------------------

/** One R1 image, by its position metadata only — never bytes (@s9/@s11). */
export type PageAnchoredImage = {
  imageId: string;
  storagePath: string;
  width: number;
  height: number;
  pageNumber: number;
  alt?: string;
};

/** An assembled slide's index into the deck plus the page number the model says its content is
 * primarily drawn from (an internal-only field the schema calls `sourcePage`, never exposed on
 * the public `Slide` type). */
export type AnchoredSlide = {
  index: number;
  sourcePage?: number;
};

export type PlacementResult = {
  /** Slide index -> the `SlideImageRef` anchored to it. */
  placements: Map<number, SlideImageRef>;
  /** Images with no matching slide — task-12's vision fallback decides their placement. */
  unplaced: PageAnchoredImage[];
};

/** One vision-model decision for an image metadata couldn't anchor (@s10) — the slide index to
 * place it at, or `null` to drop it. The actual vision-model call is Deno-only (un-Jest-testable
 * per risks.md R2, invoked only for these un-anchorable images to bound cost); this type is the
 * pure, testable seam between that call and placement. */
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
  /** The model's raw, not-yet-validated response (already parsed JSON). */
  rawDeck: unknown;
  /** The metadata-only image placement (`placeImagesByMetadata`'s result), computed once by the
   * caller (the Edge Function) before this assembly step runs — never recomputed here (review.md
   * round-1 finding #6: the caller already needs this same result to decide whether the vision
   * fallback runs at all, so this module takes it as an input instead of a redundant second
   * `placeImagesByMetadata` pass over the same slides/images). */
  metadataPlacement: PlacementResult;
  /** Vision-model placement decisions (task-12, @s10) for images metadata alone couldn't anchor
   * — computed by the caller (the Edge Function) before this synchronous assembly step runs.
   * Defaults to none (metadata-only placement); an unplaced image with no decision degrades to
   * text-only rather than failing the deck (@s12). */
  visionDecisions?: VisionPlacementDecision[];
};

// --- lesson-generation.errors.ts --------------------------------------------------------------

export type GenerationErrorMapping = {
  errorCode: GenerationErrorCode;
  status: number;
};

// --- lesson-generation.prompt.ts --------------------------------------------------------------

/** One entry of the image manifest handed to the model — ids/page/position only, never bytes
 * (@s9/@s11, spec.md architecture note). `description` is R1's reserved (currently null)
 * per-image field; when present it helps the model anchor the image without a vision call. */
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
