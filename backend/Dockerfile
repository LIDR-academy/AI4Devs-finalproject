# syntax=docker/dockerfile:1

# ---- Stage: build ----------------------------------------------------------
# node:20-alpine no es compatible con el motor nativo de Prisma (falla con
# "Error loading shared library libssl.so.1.1" — musl no soporta el binario).
# Se usa node:20-slim (Debian) con openssl instalado explícitamente, ya que
# Debian slim tampoco lo trae por defecto.
FROM node:20-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Solo los manifests de cada workspace: necesarios para que `npm ci` resuelva
# el árbol de workspaces declarado en el package.json raíz, sin invalidar la
# cache de capas por cambios en el código fuente.
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY e2e/package.json e2e/package.json

RUN npm ci --workspace=backend --include-workspace-root

COPY backend backend

RUN npx prisma generate --schema=backend/prisma/schema.prisma \
  && npm run build --workspace=backend

# ---- Stage: runtime ---------------------------------------------------------
FROM node:20-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && useradd --system --create-home --uid 1001 runmarket

WORKDIR /app
ENV NODE_ENV=production

# node_modules completo (incluye devDependencies) porque el seed de datos
# (`npm run db:seed`, ejecutado a mano en el primer despliegue) usa ts-node,
# que es una devDependency de backend/package.json.
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/backend/dist backend/dist
COPY --from=build /app/backend/prisma backend/prisma
COPY --from=build /app/backend/package.json backend/package.json

RUN chown -R runmarket:runmarket /app
USER runmarket

WORKDIR /app/backend
EXPOSE 4000
CMD ["node", "dist/server.js"]
