# =============================================================
# Build context: MONOREPO ROOT (not apps/backend)
# docker-compose apunta context: . dockerfile: apps/backend/Dockerfile
# =============================================================

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Copiar manifests del workspace para aprovechar cache de capas
COPY package.json package-lock.json* ./
COPY packages/core/package.json ./packages/core/
COPY apps/backend/package.json ./apps/backend/

# Instalar todas las dependencias del workspace desde la raíz
RUN npm ci

# Copiar código fuente
COPY packages/core ./packages/core
COPY apps/backend ./apps/backend

# Compilar @trace/core primero (el backend depende de él)
RUN npm run build --workspace=packages/core

# Prisma generate + compilar backend: npm run --workspace configura el PATH
# correctamente incluyendo node_modules/.bin del workspace
RUN npm run prisma:generate --workspace=apps/backend
RUN npm run build --workspace=apps/backend

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

# En npm workspaces no todos los paquetes se hoistan a /app/node_modules:
# algunos quedan en /app/apps/backend/node_modules. Copiamos ambos.
# Tambien copiamos packages/core/dist porque @trace/core en node_modules
# es un symlink que apuntaria a una ruta inexistente en el runner.
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/core/dist ./packages/core/dist

# Artefactos del backend + node_modules propios del workspace
COPY --from=builder /app/apps/backend/package.json ./apps/backend/
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

WORKDIR /app/apps/backend

EXPOSE 4000

# tsc-alias ya resolvió los alias @/ -> rutas relativas en el build.
# El runner no necesita tsconfig-paths ni ningún módulo extra.
CMD ["node", "dist/server.js"]
