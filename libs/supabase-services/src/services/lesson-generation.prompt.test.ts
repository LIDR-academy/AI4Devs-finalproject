import { buildDeckPrompt } from './lesson-generation.prompt';

const pages = [
  { page: 1, text: 'Photosynthesis converts light into chemical energy.' },
  { page: 2, text: 'Chlorophyll absorbs mostly red and blue light.' },
];

describe('buildDeckPrompt', () => {
  // @s3 — the full extracted text is available to the model, in page order.
  it('includes every page of extracted text in order', () => {
    const prompt = buildDeckPrompt({ composition: 'both', pages, images: [] });

    expect(prompt.indexOf('Photosynthesis converts light into chemical energy.')).toBeLessThan(
      prompt.indexOf('Chlorophyll absorbs mostly red and blue light.'),
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
  // still lists the image by id/page/position.
  it('omits the description line for an image manifest entry with no description', () => {
    const prompt = buildDeckPrompt({
      composition: 'both',
      pages,
      images: [{ imageId: 'image-2', pageNumber: 2, positionIndex: 1 }],
    });

    expect(prompt).toContain('image-2');
  });

  it('has no image-manifest section at all when there are no images', () => {
    const prompt = buildDeckPrompt({ composition: 'both', pages, images: [] });

    expect(prompt).not.toContain('imageId');
  });
});
