import { crc32 } from 'node:zlib';
import { deflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const chunk = (tag: string, data: Buffer): Buffer => {
  const body = Buffer.concat([Buffer.from(tag, 'ascii'), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length - 4, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body) >>> 0, 0);
  return Buffer.concat([length, body, crc]);
};

export type SolidPngOptions = {
  width: number;
  height: number;
  /** [r, g, b] or [r, g, b, a] — 4 components produce an alpha-carrying PNG (colorType 6). */
  color: [number, number, number] | [number, number, number, number];
};

/**
 * Builds a minimal, valid, single-color PNG at an arbitrary pixel size — a deterministic fixture
 * for testing image extraction/downscale without shipping binary test assets.
 */
export const buildSolidPng = ({ width, height, color }: SolidPngOptions): Uint8Array => {
  const hasAlpha = color.length === 4;
  const componentsPerPixel = hasAlpha ? 4 : 3;
  const colorType = hasAlpha ? 6 : 2;

  const raw = Buffer.alloc(height * (1 + width * componentsPerPixel));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset] = 0; // filter type: none
    offset += 1;
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < componentsPerPixel; c++) {
        raw[offset] = color[c];
        offset += 1;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(colorType, 9);
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const idat = deflateSync(raw);

  return new Uint8Array(
    Buffer.concat([PNG_SIGNATURE, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]),
  );
};
