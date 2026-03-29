# =============================================================
# Build context: MONOREPO ROOT (not apps/worker)
# docker-compose apunta context: . dockerfile: apps/worker/Dockerfile
# =============================================================

# Stage 1: Builder
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copiar manifests del workspace para aprovechar cache de capas
COPY package.json package-lock.json* ./
COPY packages/core/package.json ./packages/core/
COPY apps/worker/package.json ./apps/worker/
# Schema + package.json del backend (Prisma sube desde el schema buscando un package.json;
# sin él llegaría a /app/apps sin encontrar nada y haría un auto-install que falla)
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma

# Instalar todas las dependencias del workspace desde la raíz
RUN npm ci

# sharp no se hoista a /app/node_modules: vive en /app/apps/worker/node_modules/sharp.
# npm rebuild desde la raíz no lo encuentra. Lo reinstalamos directamente para
# linux-x64 desde el directorio del workspace, sobreescribiendo el binary darwin
# del lockfile. npm install --os/--cpu fuerza la descarga del prebuilt correcto.
WORKDIR /app/apps/worker
RUN npm install --os=linux --cpu=x64 --ignore-scripts=false sharp
WORKDIR /app

# Copiar código fuente
COPY packages/core ./packages/core
COPY apps/worker ./apps/worker

# Compilar @trace/core primero
RUN npm run build --workspace=packages/core

# Prisma generate: usamos npm run --workspace para que npm configure el PATH
# correctamente incluyendo node_modules/.bin del workspace donde prisma está instalado
RUN npm run prisma:generate --workspace=apps/worker

# Compilar worker
RUN npm run build --workspace=apps/worker

# Stage 2: Runner
FROM node:20-slim AS runner

# Dependencias de sistema para procesamiento de imágenes y PDFs
RUN apt-get update && apt-get install -y \
    ghostscript \
    graphicsmagick \
    openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# En npm workspaces no todos los paquetes se hoistan a /app/node_modules:
# algunos quedan en /app/apps/worker/node_modules. Copiamos ambos.
# Tambien copiamos packages/core/dist porque @trace/core en node_modules
# es un symlink que apuntaria a una ruta inexistente en el runner.
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/core/dist ./packages/core/dist

# Artefactos del worker + node_modules propios del workspace
COPY --from=builder /app/apps/worker/package.json ./apps/worker/
COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

# CRÍTICO: prisma generate escribe el cliente en apps/backend/node_modules/.prisma
# (busca el package.json más cercano al schema, que está en apps/backend/).
# El worker importa @prisma/client que busca .prisma/client relativo a su propio
# node_modules → copiamos el cliente generado al lugar donde el worker lo espera.
COPY --from=builder /app/apps/backend/node_modules/.prisma ./apps/worker/node_modules/.prisma

WORKDIR /app/apps/worker

# tsc-alias ya resolvió los alias @/ -> rutas relativas en el build.
# El runner no necesita tsconfig-paths ni ningún módulo extra.
CMD ["node", "dist/index.js"]
