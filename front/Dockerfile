# syntax=docker/dockerfile:1

FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
# Vite bakes VITE_* vars into the client bundle at build time, so they must be supplied here,
# not at `docker run` time.
ARG VITE_API_BASE_URL
ARG VITE_VAPID_PUBLIC_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
RUN bun run build
# Nitro's chosen output directory name (".output" vs "dist") varies with build context even with
# the same preset (observed: "dist" in this Docker build vs ".output" running the same command on
# a dev machine); nitro.json always exists at its root, so normalize to a fixed name.
RUN OUT_DIR=$(test -d .output && echo .output || echo dist) && mv "$OUT_DIR" /app/build-output

# @tanstack/start-server-core requires Node >=22.12
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/build-output ./build-output

EXPOSE 4173
ENV PORT=4173
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||4173)+'/', res => process.exit(res.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "build-output/server/index.mjs"]
