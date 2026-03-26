FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY nest-cli.json tsconfig.json tsconfig.build.json data-source.ts ./
RUN npm ci

COPY scripts ./scripts
RUN sed -i 's/\r$//' scripts/docker-entrypoint.sh && chmod +x scripts/docker-entrypoint.sh

COPY src ./src

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "./scripts/docker-entrypoint.sh"]
