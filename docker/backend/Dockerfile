# Production image for apps/api — no build stage: it expects `dist/apps/api`
# to already exist in the build context. Build it first with
# `pnpm nx build api --configuration=production` (locally, or as the
# pipeline's build step once one exists).
FROM node:22-alpine

# Pinned to match package.json's `packageManager` field (the SSOT for the
# exact pnpm version). Node comes from `node:22-alpine`, verified explicitly
# rather than assumed — a third-party base image tag does not pin its own
# Node version by itself.
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

WORKDIR /app

# apps/api/webpack.config.js sets `generatePackageJson: true`, so the build
# writes a minimal, exact-pinned package.json next to the bundle — only the
# packages `main.js` actually imports, none of this workspace's
# devDependencies or the `web` app's dependencies. That generated file is what
# the install below resolves against.
#
# (`api:prune-lockfile` / `api:copy-workspace-modules` — the @nx/js executors
# apps/api/project.json declares for exactly this purpose — currently fail in
# this workspace: "apps/api/package.json does not exist". They expect a
# per-project package.json, and this workspace declares every dependency in
# the single root package.json instead. Worth fixing so those executors work
# as intended — reported, not fixed here; see the CI/CD report. The
# generated-package.json install below is the working alternative until then.)
COPY dist/apps/api ./

# NOT YET DONE — flagged here so the next COPY line is added in the right
# place rather than rediscovered. ADR-013 puts `typeorm migration:run` on
# Render's pre-deploy command, which executes inside this exact image, at
# this WORKDIR. `main.js` above is a single webpack bundle; it is not an
# entry point `typeorm migration:run -d …` can target, and this COPY does
# not bring in `apps/api/src/data-source.ts` or the migration files (T-C10-16
# / T-C10-17 — neither exists yet). Once they do, this image additionally
# needs a compiled, plain-CommonJS data source plus its migrations (built
# independently of the webpack bundle, e.g. a second `tsc`/esbuild target) so
# a `COPY dist/apps/api/data-source.js ./` (and its migrations directory) can
# land here — see the CI/CD report for the full packaging analysis.
RUN pnpm install --prod

ENV NODE_ENV=production
EXPOSE 3000

# TCP-only check — see docker/backend/Dockerfile.dev for why an HTTP probe
# against a health path is not honest today.
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('net').createConnection({port:process.env.PORT||3000},()=>process.exit(0)).on('error',()=>process.exit(1))"

COPY docker/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "main.js"]
