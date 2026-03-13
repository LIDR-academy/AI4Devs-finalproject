// apps/api/prisma.config.ts
import "dotenv/config";

export default {
  schema: "../../packages/prisma-db/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
};