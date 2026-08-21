FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/frontend/tsconfig.json ./apps/frontend/

RUN corepack enable && corepack prepare pnpm@9 --activate && pnpm install --frozen-lockfile

COPY apps/frontend ./apps/frontend

RUN pnpm --filter @restostock/frontend build

# nginx:stable-alpine (no nginx:1.27-alpine, fijo en Alpine 3.21 desactualizado con 35 CVEs
# High/Critical vía `trivy image`) — nginx:stable-alpine rastrea la rama estable de nginx
# reconstruida contra el Alpine mas reciente (3.24, 0 CVEs High/Critical al validar, TK-044).
FROM nginx:stable-alpine AS runner

RUN addgroup -S restostock && adduser -S restostock -G restostock && \
    sed -i 's/listen\s*80;/listen 8080;/' /etc/nginx/conf.d/default.conf && \
    sed -i '/user  nginx;/d' /etc/nginx/nginx.conf && \
    touch /var/run/nginx.pid && \
    chown -R restostock:restostock /var/cache/nginx /var/run/nginx.pid /etc/nginx/conf.d

COPY --from=builder --chown=restostock:restostock /app/apps/frontend/dist /usr/share/nginx/html

USER restostock

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080 || exit 1

CMD ["nginx", "-g", "daemon off;"]
