# Production image for apps/web — served by nginx, no Node runtime and no
# build stage. Expects `dist/apps/web` to already exist in the build context:
# build it first with `pnpm nx build web` (locally, or as the pipeline's build
# step once one exists).
FROM nginx:alpine

COPY docker/frontend/nginx.conf /etc/nginx/nginx.conf

# Angular's esbuild builder (@angular/build:application) outputs the static
# site under a `browser/` subdirectory.
COPY dist/apps/web/browser /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
