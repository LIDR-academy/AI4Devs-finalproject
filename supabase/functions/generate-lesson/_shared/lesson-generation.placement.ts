// Mirrors libs/supabase-services/src/services/lesson-generation.placement.ts -- kept manually
// in sync by hand (task-4 note, same rule as R1's pdf-extraction/_shared mirrors).
import type {
  AnchoredSlide,
  PageAnchoredImage,
  PlacementResult,
  VisionPlacementDecision,
} from './lesson-generation.types.ts';
import type { SlideImageRef } from './types.ts';

const toSlideImageRef = (image: PageAnchoredImage): SlideImageRef => ({
  imageId: image.imageId,
  storagePath: image.storagePath,
  width: image.width,
  height: image.height,
  ...(image.alt ? { alt: image.alt } : {}),
});

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

// task-12, @s10/@s12 -- applies vision-model placement decisions for images metadata couldn't
// anchor; a missing/dropping/conflicting decision degrades to unplaced/text-only, never an error.
export const applyVisionPlacements = (
  unplaced: PageAnchoredImage[],
  decisions: VisionPlacementDecision[],
  existingPlacements: Map<number, SlideImageRef>,
): PlacementResult => {
  const placements = new Map(existingPlacements);
  const stillUnplaced: PageAnchoredImage[] = [];

  for (const image of unplaced) {
    const slideIndex = decisions.find((decision) => decision.imageId === image.imageId)
      ?.slideIndex;
    if (slideIndex == null || placements.has(slideIndex)) {
      stillUnplaced.push(image);
      continue;
    }
    placements.set(slideIndex, toSlideImageRef(image));
  }

  return { placements, unplaced: stillUnplaced };
};
