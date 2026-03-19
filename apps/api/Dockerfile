# Construir desde la raíz del monorepo:
#   docker build -f apps/api/Dockerfile -t adresles-api .
#
# NOTA: pnpm-lock.yaml debe estar presente en el contexto Docker.
#   Si está en .gitignore pero no commitado, quitar pnpm-lock.yaml de .gitignore y commitarlo.

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# ── Stage: compilar todo el monorepo ──────────────────────────────────────────
FROM base AS builder
WORKDIR /monorepo

# Instalar dependencias del sistema necesarias para compilación nativa
RUN apk add --no-cache libc6-compat

# Copiar el monorepo completo para resolución correcta de workspace packages
COPY . .

# Instalar dependencias (sin --frozen-lockfile para tolerar lock file ausente en CI)
# Para reproducibilidad máxima, commitear pnpm-lock.yaml y usar --frozen-lockfile
RUN pnpm install --no-frozen-lockfile

# Compilar workspace dependencies en orden
RUN pnpm --filter @adresles/shared-types run build
RUN pnpm --filter @adresles/prisma-db run generate

# Compilar la API
RUN pnpm --filter api run build

# Crear bundle standalone: resuelve workspace packages sin symlinks
# @adresles/prisma-db → copia files[] = [schema.prisma, generated, ...]
# @adresles/shared-types → copia files[] = [dist] (requiere "files" en su package.json)
RUN pnpm --filter api deploy --prod /standalone

# ── Stage: imagen de producción ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# openssl es necesario para que el engine de Prisma (linux-musl-openssl-3.0.x) funcione
# Sin openssl instalado, Prisma no puede detectar la versión y falla al cargar el engine
RUN apk add --no-cache openssl

# El bundle standalone tiene node_modules resueltos (no hay symlinks de workspace)
COPY --from=builder /standalone/node_modules ./node_modules

# El dist compilado de la API (no lo incluye pnpm deploy porque dist/ está en .gitignore)
COPY --from=builder /monorepo/apps/api/dist ./dist

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/api || exit 1
CMD ["node", "dist/src/main.js"]
