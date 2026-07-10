// Mirrors libs/services/src/pdf-extraction/image-downscale.ts — kept manually in sync (task-3
// note). Not executed in this sandbox — verify manually after `supabase functions deploy`.
import * as mupdf from 'npm:mupdf@1.28.0';

import { IMAGE_DOWNSCALE_TARGET } from './pdf-extraction.constants.ts';

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

const computeScale = (width: number, height: number): number =>
  Math.min(1, IMAGE_DOWNSCALE_TARGET.maxLongestEdgePx / Math.max(width, height));

const resizePixmap = (pixmap: mupdf.Pixmap, targetWidth: number, targetHeight: number): mupdf.Pixmap => {
  const width = pixmap.getWidth();
  const height = pixmap.getHeight();
  const corners: mupdf.Point[] = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
  return pixmap.warp(corners, targetWidth, targetHeight);
};

export const downscaleImage = async (input: DownscaleImageInput): Promise<DownscaleImageOutput | null> => {
  if (isDecorative(input.width, input.height)) {
    return null;
  }

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
