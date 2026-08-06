FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/tsconfig.json ./apps/backend/

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code and Prisma schema
COPY prisma ./prisma
COPY apps/backend ./apps/backend

# Generate Prisma Client and build TypeScript backend
RUN npx prisma generate
RUN pnpm --filter @restostock/backend build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json

EXPOSE 3000

CMD ["node", "apps/backend/dist/index.js"]
