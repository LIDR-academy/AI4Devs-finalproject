# =============================================================
# Build context: MONOREPO ROOT (not apps/frontend)
# docker-compose apunta context: . dockerfile: apps/frontend/Dockerfile
# =============================================================

# Stage 1: Builder
# node:20-slim (Debian/glibc) es necesario porque oxc-parser (dependencia interna de Nuxt)
# requiere bindings nativos glibc.
# Usamos `npm install` en lugar de `npm ci` porque el package-lock.json fue generado en
# macOS (darwin) y no incluye el optional binding linux-x64-gnu de oxc-parser.
# `npm ci` instala estrictamente lo del lockfile; `npm install` resuelve los optional deps
# para la plataforma actual del contenedor (Linux x64 glibc).
FROM node:20-slim AS builder

WORKDIR /app

# NO copiamos el lockfile: fue generado en macOS y tiene el binding darwin de oxc-parser
# pero no el linux-x64-gnu. Con lockfile presente, npm (bug #4828) no resuelve
# los optional deps para la plataforma actual aunque uses npm install.
# Sin lockfile, npm resuelve desde el registry e instala el binding correcto para Linux.
COPY package.json ./
COPY apps/frontend/package.json ./apps/frontend/

# --ignore-scripts evita que el postinstall "nuxt prepare" se ejecute durante la
# instalación (fallaría porque oxc-parser aún no tiene su binding disponible en PATH).
# nuxt build genera los tipos internamente, así que nuxt prepare no es necesario aquí.
RUN npm install --ignore-scripts

# Copiar código fuente del frontend
COPY apps/frontend ./apps/frontend

# nuxt build incluye la generación de tipos internamente
WORKDIR /app/apps/frontend
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app/apps/frontend

COPY --from=builder /app/apps/frontend/.output ./.output

ENV PORT=3000
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
