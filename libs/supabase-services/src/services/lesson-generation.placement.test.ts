import { placeImagesByMetadata } from './lesson-generation.placement';

describe('placeImagesByMetadata', () => {
  // @s9 — an image whose page metadata matches a slide's sourcePage is anchored to that slide.
  it('anchors an image to the slide whose sourcePage matches the image pageNumber', () => {
    const slides = [
      { index: 0, sourcePage: 1 },
      { index: 1, sourcePage: 2 },
    ];
    const images = [
      { imageId: 'image-1', storagePath: 'u/d/p2-0.png', width: 400, height: 300, pageNumber: 2 },
    ];

    const { placements, unplaced } = placeImagesByMetadata(slides, images);

    expect(placements.get(1)).toEqual({
      imageId: 'image-1',
      storagePath: 'u/d/p2-0.png',
      width: 400,
      height: 300,
    });
    expect(placements.has(0)).toBe(false);
    expect(unplaced).toEqual([]);
  });

  // @s11 — the placement carries the reference fields only (id/storagePath/dimensions [+alt]),
  // never image bytes.
  it('carries alt when the image manifest entry provides one', () => {
    const slides = [{ index: 0, sourcePage: 1 }];
    const images = [
      {
        imageId: 'image-1',
        storagePath: 'u/d/p1-0.png',
        width: 100,
        height: 100,
        pageNumber: 1,
        alt: 'A leaf diagram',
      },
    ];

    const { placements } = placeImagesByMetadata(slides, images);

    expect(placements.get(0)?.alt).toBe('A leaf diagram');
  });

  // spec.md Open decision #7 — an image with no slide anchored to its page is left unplaced;
  // task-12's vision fallback decides its placement, not this metadata-only pass.
  it('leaves an image unplaced when no slide has a matching sourcePage', () => {
    const slides = [{ index: 0, sourcePage: 1 }];
    const images = [
      { imageId: 'image-1', storagePath: 'u/d/p5-0.png', width: 100, height: 100, pageNumber: 5 },
    ];

    const { placements, unplaced } = placeImagesByMetadata(slides, images);

    expect(placements.size).toBe(0);
    expect(unplaced).toEqual(images);
  });

  // A slide with no sourcePage at all (the model didn't tag it) can never be an image's anchor.
  it('never anchors an image to a slide with no sourcePage', () => {
    const slides = [{ index: 0, sourcePage: undefined }];
    const images = [
      { imageId: 'image-1', storagePath: 'u/d/p1-0.png', width: 100, height: 100, pageNumber: 1 },
    ];

    const { placements, unplaced } = placeImagesByMetadata(slides, images);

    expect(placements.size).toBe(0);
    expect(unplaced).toEqual(images);
  });

  // Two images anchored to the same page never double up on one slide — the first claims it,
  // the second is left unplaced (one image per slide, this slice's scope).
  it('places at most one image per slide, leaving a second same-page image unplaced', () => {
    const slides = [{ index: 0, sourcePage: 1 }];
    const images = [
      { imageId: 'image-1', storagePath: 'u/d/p1-0.png', width: 100, height: 100, pageNumber: 1 },
      { imageId: 'image-2', storagePath: 'u/d/p1-1.png', width: 100, height: 100, pageNumber: 1 },
    ];

    const { placements, unplaced } = placeImagesByMetadata(slides, images);

    expect(placements.get(0)?.imageId).toBe('image-1');
    expect(unplaced).toEqual([images[1]]);
  });
});
