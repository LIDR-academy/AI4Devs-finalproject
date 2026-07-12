# syntax=docker/dockerfile:1

# ---- Stage: build ------------------------------------------------------------
FROM node:20-slim AS build

WORKDIR /app

# Solo los manifests de cada workspace: necesarios para que `npm ci` resuelva
# el árbol de workspaces declarado en el package.json raíz, sin invalidar la
# cache de capas por cambios en el código fuente.
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY e2e/package.json e2e/package.json

RUN npm ci --workspace=frontend --include-workspace-root

COPY frontend frontend

# Variables NEXT_PUBLIC_*: Next.js las hornea en el bundle de cliente durante
# `next build`, por lo que deben pasarse como build arg, no como variable de
# entorno de runtime (a diferencia de las variables solo-servidor del backend).
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_ASSETS_BASE_URL=/images
ARG NEXT_PUBLIC_SITE_URL=http://localhost
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_PUBLIC_ASSETS_BASE_URL=${NEXT_PUBLIC_ASSETS_BASE_URL} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NODE_ENV=production

RUN npm run build --workspace=frontend

# ---- Stage: runtime ------------------------------------------------------------
FROM node:20-slim AS runtime

RUN useradd --system --create-home --uid 1001 runmarket

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Salida `standalone`: server mínimo + node_modules ya podados por Next.js.
# .next/static y public/ se copian aparte porque `standalone` no los incluye.
COPY --from=build /app/frontend/.next/standalone ./
COPY --from=build /app/frontend/.next/static ./frontend/.next/static
COPY --from=build /app/frontend/public ./frontend/public

RUN chown -R runmarket:runmarket /app
USER runmarket

WORKDIR /app/frontend
EXPOSE 3000
CMD ["node", "server.js"]
