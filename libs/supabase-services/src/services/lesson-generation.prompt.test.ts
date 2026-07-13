import { buildDeckPrompt } from './lesson-generation.prompt';

const pages = [
  { page: 1, text: 'Photosynthesis converts light into chemical energy.' },
  { page: 2, text: 'Chlorophyll absorbs mostly red and blue light.' },
];

const COMPOSITION_INSTRUCTIONS_BOTH =
  'Generate a deck that mixes instructional slides (kind: "instructional") and activity slides (kind: "activity") covering the five supported activity types where relevant.';

describe('buildDeckPrompt', () => {
  // @s3 — the full extracted text is available to the model, in page order.
  it('includes every page of extracted text in order', () => {
    const prompt = buildDeckPrompt({ composition: 'both', pages, images: [] });

    expect(prompt.indexOf('Photosynthesis converts light into chemical energy.')).toBeLessThan(
      prompt.indexOf('Chlorophyll absorbs mostly red and blue light.'),
    );
  });

  // Pins the exact page-join separator ('\n\n' between pages) and the no-images tail (exactly
  // '', never a manifest section) — a full-string match so a join('\n\n') -> join('') mutant, or
  // a skipped/mistyped empty-images early return, both fail this assertion.
  it('joins multiple pages with a blank line and appends nothing when there are no images', () => {
    const prompt = buildDeckPrompt({ composition: 'both', pages, images: [] });

    expect(prompt).toBe(
      `${COMPOSITION_INSTRUCTIONS_BOTH}\n\nSource content:\n--- Page 1 ---\nPhotosynthesis converts light into chemical energy.\n\n--- Page 2 ---\nChlorophyll absorbs mostly red and blue light.`,
    );
  });

  // @s3/@s6 — composition 'both' is enforced in the prompt: the model must be told to include
  // both slide kinds.
  it('enforces the "both" composition by instructing a mix of instructional and activity slides', () => {
    const prompt = buildDeckPrompt({ composition: 'both', pages, images: [] });

    expect(prompt).toMatch(/instructional/i);
    expect(prompt).toMatch(/activity/i);
  });

  // @s9 — the image manifest (ids/page/position, never bytes) is embedded for metadata-driven
  // placement.
  it('includes the image manifest by id/page/position without any byte payload', () => {
    const prompt = buildDeckPrompt({
      composition: 'both',
      pages,
      images: [
        { imageId: 'image-1', pageNumber: 1, positionIndex: 0, description: 'A leaf diagram' },
      ],
    });

    expect(prompt).toContain('image-1');
    expect(prompt).toContain('A leaf diagram');
    expect(prompt).not.toMatch(/data:image|base64/i);
  });

  // An image manifest entry may omit `description` (R1 currently leaves it null) — the prompt
  // still lists the image by id/page/position, with no dangling separator/placeholder text where
  // the description would have gone.
  it('omits the description line for an image manifest entry with no description', () => {
    const prompt = buildDeckPrompt({
      composition: 'both',
      pages: [{ page: 1, text: 'X' }],
      images: [{ imageId: 'image-2', pageNumber: 2, positionIndex: 1 }],
    });

    expect(prompt).toBe(
      `${COMPOSITION_INSTRUCTIONS_BOTH}\n\nSource content:\n--- Page 1 ---\nX\n\nAvailable images (reference by id only; anchor each to the slide whose content is drawn from its page; do not invent images):\n- id: image-2, page: 2, position: 1`,
    );
  });

  // Pins the exact join separator ('\n' between manifest lines) between two image-manifest
  // entries (one with a description, one without) — a full-string match so a
  // lines.join('\n') -> lines.join('') mutant fails this assertion.
  it('joins multiple image-manifest entries with a newline', () => {
    const prompt = buildDeckPrompt({
      composition: 'both',
      pages: [{ page: 1, text: 'X' }],
      images: [
        { imageId: 'image-1', pageNumber: 1, positionIndex: 0, description: 'A leaf diagram' },
        { imageId: 'image-2', pageNumber: 2, positionIndex: 1 },
      ],
    });

    expect(prompt).toBe(
      `${COMPOSITION_INSTRUCTIONS_BOTH}\n\nSource content:\n--- Page 1 ---\nX\n\nAvailable images (reference by id only; anchor each to the slide whose content is drawn from its page; do not invent images):\n- id: image-1, page: 1, position: 0 — A leaf diagram\n- id: image-2, page: 2, position: 1`,
    );
  });

  it('has no image-manifest section at all when there are no images', () => {
    const prompt = buildDeckPrompt({ composition: 'both', pages, images: [] });

    expect(prompt).not.toContain('Available images');
  });

  // task-11, @s4/@s5/@s6 — the other two compositions are enforced in the prompt too, not just
  // "both" (belt-and-suspenders with assembly.ts's post-parse rejection).
  describe('composition variants (task-11)', () => {
    // @s4 — "instructional only" forbids activity slides in the prompt instruction.
    it('instructs only instructional slides and forbids activity slides for instructional-only', () => {
      const prompt = buildDeckPrompt({ composition: 'instructional-only', pages, images: [] });

      expect(prompt).toMatch(/only instructional slides/i);
      expect(prompt).toMatch(/do not include any activity slides/i);
    });

    // @s5 — "activity only" forbids instructional slides in the prompt instruction.
    it('instructs only activity slides and forbids instructional slides for activity-only', () => {
      const prompt = buildDeckPrompt({ composition: 'activity-only', pages, images: [] });

      expect(prompt).toMatch(/only activity slides/i);
      expect(prompt).toMatch(/do not include any instructional slides/i);
    });

    // @s6 — the chosen composition (whichever of the three) drives a distinct instruction; no
    // composition falls back to sharing another's wording.
    it('embeds a distinct instruction per composition', () => {
      const both = buildDeckPrompt({ composition: 'both', pages, images: [] });
      const instructionalOnly = buildDeckPrompt({
        composition: 'instructional-only',
        pages,
        images: [],
      });
      const activityOnly = buildDeckPrompt({ composition: 'activity-only', pages, images: [] });

      expect(new Set([both, instructionalOnly, activityOnly]).size).toBe(3);
    });
  });
});
