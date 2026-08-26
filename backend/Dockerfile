FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev
EXPOSE 3001
USER node
HEALTHCHECK CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1
CMD ["node", "dist/index.js"]
