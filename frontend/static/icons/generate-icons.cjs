// Minimal PNG generator for the PWA icons.
// Produces solid-color squares with a white "R" letter rendered as a 5x7 bitmap.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const THEME = [0x25, 0x63, 0xeb];
const WHITE = [0xff, 0xff, 0xff];
const OUT = __dirname;

function makeIcon(size) {
  const R = ['11110','10001','10001','11110','10100','10010','10001'];
  const cellSize = Math.floor(size * 0.6 / 7);
  const letterW = 5 * cellSize;
  const letterH = 7 * cellSize;
  const offsetX = Math.floor((size - letterW) / 2);
  const offsetY = Math.floor((size - letterH) / 2);

  const pixels = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = THEME;
      const lx = x - offsetX;
      const ly = y - offsetY;
      if (lx >= 0 && lx < letterW && ly >= 0 && ly < letterH) {
        const cx = Math.floor(lx / cellSize);
        const cy = Math.floor(ly / cellSize);
        if (R[cy][cx] === '1') color = WHITE;
      }
      const i = (y * size + x) * 3;
      pixels[i] = color[0]; pixels[i + 1] = color[1]; pixels[i + 2] = color[2];
    }
  }
  return encodePng(pixels, size, size);
}

function makeMaskable() {
  const size = 512;
  const inner = Math.floor(size * 0.5);
  const innerOffset = (size - inner) / 2;
  const pixels = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = WHITE;
      if (x >= innerOffset && x < innerOffset + inner && y >= innerOffset && y < innerOffset + inner) color = THEME;
      const ix = x - innerOffset, iy = y - innerOffset;
      const cell = Math.floor(inner * 0.5 / 7);
      const lw = 5 * cell, lh = 7 * cell;
      const ox = Math.floor((inner - lw) / 2), oy = Math.floor((inner - lh) / 2);
      if (ix >= ox && ix < ox + lw && iy >= oy && iy < oy + lh) {
        const cx = Math.floor((ix - ox) / cell), cy = Math.floor((iy - oy) / cell);
        const R = ['11110','10001','10001','11110','10100','10010','10001'];
        if (R[cy][cx] === '1') color = WHITE;
      }
      const i = (y * size + x) * 3;
      pixels[i] = color[0]; pixels[i + 1] = color[1]; pixels[i + 2] = color[2];
    }
  }
  return encodePng(pixels, size, size);
}

function encodePng(pixels, width, height) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  const rowBytes = width * 3;
  const raw = Buffer.alloc((rowBytes + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowBytes + 1)] = 0;
    pixels.copy(raw, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
  }
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

fs.writeFileSync(path.join(OUT, 'icon-192.png'), makeIcon(192));
fs.writeFileSync(path.join(OUT, 'icon-512.png'), makeIcon(512));
fs.writeFileSync(path.join(OUT, 'maskable-icon-512.png'), makeMaskable());
console.log('✓ PWA icons generated (Node fallback)');
