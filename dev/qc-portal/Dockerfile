# Multi-stage: build the static bundle with Bun, then serve it from a minimal image.
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./server.ts
ENV PORT=3000
EXPOSE 3000
# server.ts serves ./dist and falls back to index.html for client-side routes.
CMD ["bun", "server.ts"]
