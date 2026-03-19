// apps/api/prisma.config.ts
// Carga el .env de la raíz del monorepo para migrate/studio/generate
require('dotenv').config({
  path: require('path').resolve(process.cwd(), '../../.env'),
});

export default {
  schema: "../../packages/prisma-db/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
};