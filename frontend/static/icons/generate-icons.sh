#!/usr/bin/env bash
# Generates the 3 PWA icons + favicon for Realista from the new Logo SVG (casa-prisma arcoíris).
# Uses ImageMagick (magick or convert). Safe to re-run.
set -euo pipefail

OUT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_STATIC="$(dirname "$OUT_DIR")"
SVG="$OUT_DIR/logo.svg"

if [[ ! -f "$SVG" ]]; then
  echo "ERROR: $SVG not found" >&2
  exit 1
fi

# Args: $1 = final icon size (canvas), $2 = source SVG width to fit, $3 = output path
generate_icon() {
  local canvas_size=$1
  local svg_width=$2
  local out=$3
  if command -v magick >/dev/null 2>&1; then
    magick -background white -density 1200 "$SVG" -resize ${svg_width}x -gravity center -extent ${canvas_size}x${canvas_size} "$out"
  elif command -v convert >/dev/null 2>&1; then
    convert -background white -density 1200 "$SVG" -resize ${svg_width}x -gravity center -extent ${canvas_size}x${canvas_size} "$out"
  else
    echo "ERROR: neither magick nor convert found" >&2
    exit 1
  fi
}

# Standard icons: canvas size = source size (logo fills)
generate_icon 192 192 "$OUT_DIR/icon-192.png"
generate_icon 512 512 "$OUT_DIR/icon-512.png"

# Maskable: 512x512 canvas, 205-wide logo centered (40% safe zone ≈ 205x205)
generate_icon 512 205 "$OUT_DIR/maskable-icon-512.png"

# Favicon: 32x32
generate_icon 32 32 "$FRONTEND_STATIC/favicon.ico"

echo "✓ Icons generated in $OUT_DIR"
ls -lh "$OUT_DIR"/*.png "$FRONTEND_STATIC"/favicon.ico
