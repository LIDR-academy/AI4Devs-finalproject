FROM node:24-alpine AS base

WORKDIR /app

# node:24-alpine (Alpine 3.24) trae libssl.so.3 como libreria pero NO el binario CLI
# `openssl` — la deteccion de plataforma de Prisma 5.x lo ejecuta (`openssl version -v`)
# para elegir el motor OpenSSL-3 correcto; sin el, tanto el query-engine como el
# schema-engine (usado por `migrate deploy`) se descargan/resuelven mal (bug detectado
# al automatizar `prisma migrate deploy` en el arranque del contenedor, TK-043).
RUN apk add --no-cache openssl

# HUSKY=0: el script "prepare" del package.json raiz instala git hooks locales — irrelevante
# dentro de una imagen Docker (no hay .git) y falla con --prod porque husky es devDependency.
ENV HUSKY=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
RUN corepack enable && corepack prepare pnpm@9 --activate

# ---- builder: compila TypeScript (necesita las devDependencies: typescript, prisma CLI) ----
FROM base AS builder

COPY apps/backend/tsconfig.json ./apps/backend/
RUN pnpm install --frozen-lockfile

COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend ./apps/backend

# pnpm exec (no npx): resuelve el binario Prisma 5.x pineado en package.json en vez de
# descargar la ultima version del registro, que rompe el schema (Prisma 7 elimina
# datasource.url) — bug detectado al construir esta imagen por primera vez (TK-042).
RUN pnpm --filter @restostock/backend exec prisma generate --schema=prisma/schema.prisma
RUN pnpm --filter @restostock/backend build

# ---- deps-prod: SOLO dependencies de produccion (TK-044) ----
# `pnpm install --frozen-lockfile` a secas instala tambien devDependencies (vitest, eslint,
# typescript...), que terminaban copiadas verbatim a la imagen final. `trivy image` sobre esa
# imagen reporto 34 CVEs High/Critical, 25 de ellas en el binario Go de
# @esbuild/linux-x64 (arrastrado por vite/vitest) — un binario que el proceso Express en
# produccion JAMAS ejecuta. `prisma` se movio de devDependencies a dependencies en
# package.json porque docker-entrypoint.sh SI lo necesita en produccion (migrate deploy).
FROM base AS deps-prod

RUN pnpm install --frozen-lockfile --prod
COPY apps/backend/prisma ./apps/backend/prisma
RUN pnpm --filter @restostock/backend exec prisma generate --schema=prisma/schema.prisma

# ---- runner ----
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl
RUN addgroup -S restostock && adduser -S restostock -G restostock

# node:24-alpine trae el CLI de npm bundleado (con sus propias devDependencies internas:
# brace-expansion, ip-address, tar, undici). Este proyecto usa pnpm y el entrypoint invoca
# binarios directos (`node`, `prisma`) — npm nunca se ejecuta en produccion. Eliminarlo quita
# 7 CVEs High/Critical (`trivy image`) de superficie de ataque que nunca se usa, en vez de
# solo silenciar el hallazgo (TK-044).
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

# pnpm workspaces: los paquetes de cada dependencia viven en el store central
# (node_modules/.pnpm/), pero cada paquete del monorepo tiene su PROPIA carpeta
# node_modules/ con symlinks hacia ese store — hay que copiar ambas o los require()
# fallan en runtime (bug detectado al arrancar esta imagen por primera vez, TK-042).
COPY --from=deps-prod --chown=restostock:restostock /app/node_modules ./node_modules
COPY --from=deps-prod --chown=restostock:restostock /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder --chown=restostock:restostock /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=restostock:restostock /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=deps-prod --chown=restostock:restostock /app/apps/backend/prisma ./apps/backend/prisma
COPY --chown=restostock:restostock --chmod=755 apps/backend/docker-entrypoint.sh ./docker-entrypoint.sh

USER restostock

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

# docker-entrypoint.sh aplica `prisma migrate deploy` antes de arrancar el servidor —
# Guard 25/TK-043: producción nunca debe depender de un `prisma db push` manual.
CMD ["./docker-entrypoint.sh"]
