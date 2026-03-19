# Construir desde la raíz del monorepo:
#   docker build -f apps/worker/Dockerfile -t adresles-worker .

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ── Stage: compilar todo el monorepo ──────────────────────────────────────────
FROM base AS builder
WORKDIR /monorepo

RUN apk add --no-cache libc6-compat

COPY . .

RUN pnpm install --no-frozen-lockfile

RUN pnpm --filter @adresles/shared-types run build
RUN pnpm --filter @adresles/prisma-db run generate

RUN pnpm --filter worker run build

RUN pnpm --filter worker deploy --prod /standalone

# ── Stage: imagen de producción ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# openssl es necesario para que el engine de Prisma (linux-musl-openssl-3.0.x) funcione
RUN apk add --no-cache openssl

COPY --from=builder /standalone/node_modules ./node_modules
COPY --from=builder /monorepo/apps/worker/dist ./dist

CMD ["node", "dist/main.js"]
