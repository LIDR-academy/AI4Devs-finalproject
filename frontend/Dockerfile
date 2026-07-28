# Frontend - Nuxt 3 / Vue 3
# Espera un proyecto Nuxt 3 estándar (package.json, nuxt.config.ts, ...) en este directorio.

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app
ENV NITRO_PORT=3000 NITRO_HOST=0.0.0.0
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
