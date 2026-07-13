import type { SlideImageRef } from '@helsoft/types';

import type {
  AnchoredSlide,
  PageAnchoredImage,
  PlacementResult,
  VisionPlacementDecision,
} from './lesson-generation.types';

const toSlideImageRef = (image: PageAnchoredImage): SlideImageRef => ({
  imageId: image.imageId,
  storagePath: image.storagePath,
  width: image.width,
  height: image.height,
  ...(image.alt ? { alt: image.alt } : {}),
});

/**
 * Metadata/position-driven placement (@s9, spec.md Open decision #7): anchors each image to the
 * first not-yet-claimed slide whose `sourcePage` matches the image's `pageNumber`. An image with
 * no matching slide is returned unplaced rather than failing generation (@s12 — degrades to
 * text-only, never an error).
 */
export const placeImagesByMetadata = (
  slides: AnchoredSlide[],
  images: PageAnchoredImage[],
): PlacementResult => {
  const placements = new Map<number, SlideImageRef>();
  const unplaced: PageAnchoredImage[] = [];

  for (const image of images) {
    const slide = slides.find(
      (candidate) => candidate.sourcePage === image.pageNumber && !placements.has(candidate.index),
    );
    if (!slide) {
      unplaced.push(image);
      continue;
    }
    placements.set(slide.index, toSlideImageRef(image));
  }

  return { placements, unplaced };
};

/**
 * Applies vision-model placement decisions for images `placeImagesByMetadata` couldn't anchor
 * (@s10). An image whose decision is missing, drops it (`slideIndex: null`), or names a slide
 * index another image already claims degrades to unplaced/text-only rather than erroring or
 * overwriting (@s12) — never a hard failure. Pure: the actual vision-model call lives in the Edge
 * Function; this module only applies its already-decided output.
 */
export const applyVisionPlacements = (
  unplaced: PageAnchoredImage[],
  decisions: VisionPlacementDecision[],
  existingPlacements: Map<number, SlideImageRef>,
): PlacementResult => {
  const placements = new Map(existingPlacements);
  const stillUnplaced: PageAnchoredImage[] = [];

  for (const image of unplaced) {
    const slideIndex = decisions.find((decision) => decision.imageId === image.imageId)?.slideIndex;
    if (slideIndex == null || placements.has(slideIndex)) {
      stillUnplaced.push(image);
      continue;
    }
    placements.set(slideIndex, toSlideImageRef(image));
  }

  return { placements, unplaced: stillUnplaced };
};
