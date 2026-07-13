import { applyVisionPlacements, placeImagesByMetadata } from './lesson-generation.placement';

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

// task-12, @s10/@s12 — the vision-model fallback for images metadata couldn't anchor. The actual
// vision-model call (Deno-only, un-Jest-testable per risks.md R2) lives in the Edge Function;
// this pure module only applies its already-decided output, so it's fully testable here.
describe('applyVisionPlacements', () => {
  const image = {
    imageId: 'image-1',
    storagePath: 'u/d/p5-0.png',
    width: 100,
    height: 100,
    pageNumber: 5,
  };

  // @s10 — a vision decision naming a free slide index places the image there.
  it('places an image at the slide index the vision decision names', () => {
    const { placements, unplaced } = applyVisionPlacements(
      [image],
      [{ imageId: 'image-1', slideIndex: 2 }],
      new Map(),
    );

    expect(placements.get(2)).toEqual({
      imageId: 'image-1',
      storagePath: 'u/d/p5-0.png',
      width: 100,
      height: 100,
    });
    expect(unplaced).toEqual([]);
  });

  // @s12 — a vision decision to drop the image (slideIndex: null) degrades it to text-only
  // rather than placing or erroring.
  it('leaves the image unplaced when the vision decision is to drop it', () => {
    const { placements, unplaced } = applyVisionPlacements(
      [image],
      [{ imageId: 'image-1', slideIndex: null }],
      new Map(),
    );

    expect(placements.size).toBe(0);
    expect(unplaced).toEqual([image]);
  });

  // @s12 — an image with no decision at all (the vision call never returned one for it, e.g. a
  // partial/degraded vision response) degrades to text-only rather than failing.
  it('leaves the image unplaced when no decision was returned for it', () => {
    const { placements, unplaced } = applyVisionPlacements([image], [], new Map());

    expect(placements.size).toBe(0);
    expect(unplaced).toEqual([image]);
  });

  // @s12 — a decision naming a slide index already claimed by a prior (metadata) placement
  // degrades to text-only rather than overwriting it.
  it('leaves the image unplaced when the decided slide index is already claimed', () => {
    const existing = new Map([[2, { imageId: 'other', storagePath: 'x', width: 1, height: 1 }]]);

    const { placements, unplaced } = applyVisionPlacements(
      [image],
      [{ imageId: 'image-1', slideIndex: 2 }],
      existing,
    );

    expect(placements.get(2)?.imageId).toBe('other');
    expect(unplaced).toEqual([image]);
  });

  // Existing (metadata) placements pass through untouched alongside any newly-applied ones.
  it('keeps existing placements alongside a newly-applied vision placement', () => {
    const existing = new Map([
      [0, { imageId: 'already-placed', storagePath: 'x', width: 1, height: 1 }],
    ]);

    const { placements } = applyVisionPlacements(
      [image],
      [{ imageId: 'image-1', slideIndex: 1 }],
      existing,
    );

    expect(placements.get(0)?.imageId).toBe('already-placed');
    expect(placements.get(1)?.imageId).toBe('image-1');
  });
});
