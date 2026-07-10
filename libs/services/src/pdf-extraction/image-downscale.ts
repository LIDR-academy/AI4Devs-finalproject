import type * as Mupdf from 'mupdf';

import { IMAGE_DOWNSCALE_TARGET } from '../services/pdf-extraction.constants';

export type DownscaleImageInput = {
  bytes: Uint8Array;
  width: number;
  height: number;
  mimeType: string;
};

export type DownscaleImageOutput = {
  bytes: Uint8Array;
  width: number;
  height: number;
  mimeType: string;
};

const JPEG_MIME_TYPE = 'image/jpeg';
const PNG_MIME_TYPE = 'image/png';

const isDecorative = (width: number, height: number): boolean =>
  width < IMAGE_DOWNSCALE_TARGET.minDimensionPx || height < IMAGE_DOWNSCALE_TARGET.minDimensionPx;

/** Never upscales — a scale factor above 1 is clamped to 1 (spec decision #4). */
const computeScale = (width: number, height: number): number =>
  Math.min(1, IMAGE_DOWNSCALE_TARGET.maxLongestEdgePx / Math.max(width, height));

const resizePixmap = (pixmap: Mupdf.Pixmap, targetWidth: number, targetHeight: number): Mupdf.Pixmap => {
  const width = pixmap.getWidth();
  const height = pixmap.getHeight();
  const corners: Mupdf.Point[] = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
  return pixmap.warp(corners, targetWidth, targetHeight);
};

/**
 * Downscales/recompresses one extracted image to the spec's fixed targets (decision #4): a
 * 1024px longest edge (never upscaled), JPEG q80 for opaque images, PNG for images carrying an
 * alpha channel — and drops (returns null) decorative images under the 100x100px floor. Pure,
 * Jest-testable TypeScript (task-3 sandbox adaptation) — mirrored into
 * `supabase/functions/extract-pdf/_shared/` as the real Deno deployment source.
 */
export const downscaleImage = async (input: DownscaleImageInput): Promise<DownscaleImageOutput | null> => {
  if (isDecorative(input.width, input.height)) {
    return null;
  }

  const mupdf: typeof Mupdf = await import('mupdf');
  const sourcePixmap = new mupdf.Image(input.bytes).toPixmap();
  const hasAlpha = sourcePixmap.getAlpha() === 1;

  const scale = computeScale(input.width, input.height);
  const targetWidth = Math.round(input.width * scale);
  const targetHeight = Math.round(input.height * scale);
  const pixmap = scale === 1 ? sourcePixmap : resizePixmap(sourcePixmap, targetWidth, targetHeight);

  return hasAlpha
    ? { bytes: pixmap.asPNG(), width: targetWidth, height: targetHeight, mimeType: PNG_MIME_TYPE }
    : {
        bytes: pixmap.asJPEG(IMAGE_DOWNSCALE_TARGET.jpegQuality),
        width: targetWidth,
        height: targetHeight,
        mimeType: JPEG_MIME_TYPE,
      };
};
