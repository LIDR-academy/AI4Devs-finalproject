#!/usr/bin/env bash
# Run StrykerJS scoped to a feature's CHANGED source files, per lib.
#
# Usage:
#   run-mutation.sh [base-ref]      # base-ref defaults to "main"
#
# Computes files changed on the current branch since its merge-base with
# base-ref, filters to each lib's mutate-able source (excludes tests, stories,
# e2e, and index barrels), and runs `stryker run --mutate` for each affected lib.
# Never runs a whole-repo mutation.
set -euo pipefail

BASE="${1:-main}"
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

LIBS=("libs/services:@helsoft/services" "libs/supabase-services:@helsoft/supabase-services" "libs/hooks:@helsoft/hooks" "libs/components:@helsoft/components" "libs/logging-in-out:@helsoft/logging-in-out" "libs/activities:@helsoft/activities" "libs/study-buddy:@helsoft/study-buddy")

any=0
for entry in "${LIBS[@]}"; do
  lib="${entry%%:*}"
  pkg="${entry##*:}"

  # `test-utils/` and `testing/` hold pure test-fixture builders — not shipped production logic —
  # so they're excluded here the same as *.test.ts (confirmed via test-only imports).
  files="$(git diff --name-only "${BASE}...HEAD" -- "${lib}/src" \
    | grep -E '\.(ts|tsx)$' \
    | grep -vE '\.(test|stories)\.(ts|tsx)$|\.e2e\.js$|/index\.ts$|/(test-utils|testing)/' || true)"

  if [ -z "${files}" ]; then
    echo "· ${pkg}: no changed source, skipping"
    continue
  fi

  any=1
  # Paths relative to the lib dir, comma-separated, for --mutate.
  rel="$(printf '%s\n' "${files}" | sed "s#^${lib}/##" | paste -sd, -)"
  echo "▶ ${pkg}: mutating ${rel}"
  pnpm --filter "${pkg}" exec stryker run --mutate "${rel}"
done

if [ "${any}" = 0 ]; then
  echo "No changed source files to mutate against ${BASE}."
fi
