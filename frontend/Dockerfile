# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# package-lock.json has all resolved URLs pointing to a private Artifactory mirror
# that is unreachable without credentials inside the container.
# Override: write a project-level .npmrc pointing to public npm, delete the
# lockfile so npm resolves freshly from registry.npmjs.org, then install.
RUN echo "registry=https://registry.npmjs.org/" > .npmrc && \
    rm package-lock.json && \
    npm install --no-audit --no-fund
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_E2E=false
ARG NEXT_PUBLIC_STRIPE_KEY=pk_test_dummy
ARG NEXT_PUBLIC_MAPBOX_TOKEN=test-token
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_E2E=$NEXT_PUBLIC_E2E \
    NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY \
    NEXT_PUBLIC_MAPBOX_TOKEN=$NEXT_PUBLIC_MAPBOX_TOKEN
RUN npx next build --no-lint

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
EXPOSE 3000
CMD ["npm", "run", "start"]
