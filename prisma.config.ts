import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Configuración de Prisma 7. La URL del datasource y la ruta del schema se declaran
 * aquí (ya no en schema.prisma). Ver AGENTS.md (decisión de versión) y ADR-0001 §5.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
