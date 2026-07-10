import { downscaleImage } from './image-downscale';
import { buildSolidPng } from './test-utils/build-solid-png';

describe('downscaleImage', () => {
  // @s2 (spec decision #4) — an oversized image is downscaled to a 1024px longest edge,
  // aspect ratio preserved, and re-encoded as JPEG (no alpha channel present).
  it('downscales an oversized opaque image to a 1024px longest edge, preserving aspect ratio', async () => {
    const png = buildSolidPng({ width: 2000, height: 1000, color: [10, 20, 30] });

    const result = await downscaleImage({ bytes: png, width: 2000, height: 1000, mimeType: 'image/png' });

    expect(result).toEqual({
      bytes: expect.any(Uint8Array),
      width: 1024,
      height: 512,
      mimeType: 'image/jpeg',
    });
  });

  // @s2 — an image already within the 1024px cap is never upscaled; its dimensions pass through
  // unchanged.
  it('does not upscale an image already within the 1024px cap', async () => {
    const png = buildSolidPng({ width: 300, height: 200, color: [40, 50, 60] });

    const result = await downscaleImage({ bytes: png, width: 300, height: 200, mimeType: 'image/png' });

    expect(result).toMatchObject({ width: 300, height: 200 });
  });

  // Spec decision #4 — an image with an alpha channel is re-encoded as PNG (not JPEG, which has
  // no alpha support), even after being downscaled.
  it('re-encodes a downscaled image with an alpha channel as PNG, not JPEG', async () => {
    const png = buildSolidPng({ width: 2000, height: 2000, color: [10, 20, 30, 128] });

    const result = await downscaleImage({ bytes: png, width: 2000, height: 2000, mimeType: 'image/png' });

    expect(result).toMatchObject({ width: 1024, height: 1024, mimeType: 'image/png' });
  });

  // Spec decision #4 — a decorative image smaller than 100×100px (bullets, rules, icons) is
  // dropped entirely (signaled by a null result) rather than persisted.
  it('drops an image smaller than the 100x100px decorative-image floor', async () => {
    const png = buildSolidPng({ width: 40, height: 40, color: [1, 2, 3] });

    const result = await downscaleImage({ bytes: png, width: 40, height: 40, mimeType: 'image/png' });

    expect(result).toBeNull();
  });

  // Spec decision #4 boundary — a thin decorative rule (very wide, but far short of 100px tall)
  // is also dropped: the 100x100 floor applies per-dimension, not just to the longest edge.
  it('drops a wide-but-thin decorative rule image', async () => {
    const png = buildSolidPng({ width: 800, height: 4, color: [1, 2, 3] });

    const result = await downscaleImage({ bytes: png, width: 800, height: 4, mimeType: 'image/png' });

    expect(result).toBeNull();
  });
});
