import type { SlideImageRef } from '@helsoft/types';

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
