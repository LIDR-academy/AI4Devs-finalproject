# syntax=docker/dockerfile:1
#
# Production-oriented API image for MecaTrack (US-010/US-014).
# Non-root runtime. Uses docker-entrypoint.sh (migrate + optional bootstrap, never seed).

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npx tsc -p tsconfig.seed.json

FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nestjs

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma/dist-seed ./prisma/dist-seed

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN sed -i 's/\r$//' ./docker-entrypoint.sh \
  && chmod +x ./docker-entrypoint.sh \
  && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 4000

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
