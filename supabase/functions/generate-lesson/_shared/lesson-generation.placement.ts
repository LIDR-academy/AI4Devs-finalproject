// Mirrors libs/supabase-services/src/services/lesson-generation.placement.ts -- kept manually
// in sync by hand (task-4 note, same rule as R1's pdf-extraction/_shared mirrors).
import type { SlideImageRef } from './types.ts';

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
