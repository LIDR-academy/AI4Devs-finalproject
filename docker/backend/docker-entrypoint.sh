#!/bin/sh
set -e

echo "=========================================="
echo "Starting Sport ITSM API"
echo "=========================================="

# Migration execution as a controlled, separate deploy step — never bundled
# into the process boot, never unconditional in staging or production
# (CLAUDE.md §3, ADR-013). On Render this step is the service's pre-deploy
# command (`typeorm migration:run -d …`), which runs before the new version
# starts serving — not this entrypoint. This script stays migration-free by
# design, in every environment, and only hands off to the container's CMD.
#
# T-C10-16 (the TypeORM data source) and T-C10-17 (the first migration) still
# need to land before there is anything to run as that pre-deploy command —
# see the packaging analysis in the CI/CD report for what the image will need
# to make `migration:run` reachable inside the running container.

exec "$@"
