#!/usr/bin/env bash
# Compact a feature's docs before the PR:
#   1) delete stray per-round review copies (review-<type>-r<N>.md) — pure duplication
#   2) print a size report, flagging any .md over its soft budget so it can be trimmed
# Read-only except for deleting the stray per-round copies.
#
# Usage: compact-docs.sh <name>    (feature folder = docs/features/<name>)
set -euo pipefail

NAME="${1:?usage: compact-docs.sh <name>}"
ROOT="$(git rev-parse --show-toplevel)"
DIR="$ROOT/docs/features/$NAME"
[ -d "$DIR" ] || { echo "compact-docs: no such feature folder: $DIR" >&2; exit 1; }
cd "$DIR"

echo "== compact-docs: $NAME =="

# 1) Remove stray per-round review copies; keep the base review-<type>.md + consolidated review.md
stray="$(ls -1 2>/dev/null | grep -E '^review-.+-r[0-9]+\.md$' || true)"
if [ -n "$stray" ]; then
  echo "removing per-round review copies (duplication):"
  printf '%s\n' "$stray" | sed 's/^/  - /'
  printf '%s\n' "$stray" | xargs -r rm -f
else
  echo "no stray per-round review files"
fi

# 2) Size report + soft-budget flags (bytes)
budget() {
  case "$1" in
    tdd.md) echo 8000 ;;
    dod.md|mutation.md|spec.md) echo 4000 ;;
    review.md) echo 3000 ;;
    *) echo 3000 ;;
  esac
}

echo "size report (⚠ = over budget → trim to summary form):"
over=0
total=0
for f in *.md; do
  [ -e "$f" ] || continue
  b=$(wc -c < "$f")
  total=$((total + b))
  lim=$(budget "$f")
  if [ "$b" -gt "$lim" ]; then
    printf "  %7d  %-26s ⚠ OVER (budget %d)\n" "$b" "$f" "$lim"
    over=$((over + 1))
  else
    printf "  %7d  %s\n" "$b" "$f"
  fi
done
echo "total: ${total} bytes across the feature folder; ${over} file(s) over budget"
if [ "$over" -gt 0 ]; then
  echo "→ trim each flagged file to its summary form (see .agents/skills/compact-docs/SKILL.md), then commit."
fi
exit 0
