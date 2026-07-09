#!/usr/bin/env bash
# Generates the 3 PWA icons for Realista.
# Tries ImageMagick first; falls back to a Node-based PNG encoder.
set -euo pipefail

OUT_DIR="$(cd "$(dirname "$0")" && pwd)"
THEME_COLOR="#2563eb"

# Try ImageMagick
if command -v magick >/dev/null 2>&1; then
  for size in 192 512; do
    magick -size ${size}x${size} xc:"$THEME_COLOR" \
      -fill white -gravity center -font "DejaVu-Sans-Bold" -pointsize $((size/3)) \
      -annotate +0+0 "R" \
      "$OUT_DIR/icon-${size}.png"
  done
  # Maskable: same but with 25% safe-zone padding (icon centered in larger frame)
  magick -size 512x512 xc:white \
    -fill "$THEME_COLOR" -draw "rectangle 128,128 384,384" \
    -fill white -gravity center -font "DejaVu-Sans-Bold" -pointsize 90 \
    -annotate +0+0 "R" \
    "$OUT_DIR/maskable-icon-512.png"
elif command -v convert >/dev/null 2>&1; then
  for size in 192 512; do
    convert -size ${size}x${size} xc:"$THEME_COLOR" \
      -fill white -gravity center -font "DejaVu-Sans-Bold" -pointsize $((size/3)) \
      -annotate +0+0 "R" \
      "$OUT_DIR/icon-${size}.png"
  done
  convert -size 512x512 xc:white \
    -fill "$THEME_COLOR" -draw "rectangle 128,128 384,384" \
    -fill white -gravity center -font "DejaVu-Sans-Bold" -pointsize 90 \
    -annotate +0+0 "R" \
    "$OUT_DIR/maskable-icon-512.png"
else
  # Fallback: Node script with a minimal PNG encoder (see Step 2)
  node "$OUT_DIR/generate-icons.cjs"
fi

echo "✓ PWA icons generated in $OUT_DIR"
ls -lh "$OUT_DIR"/*.png
