import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Configuración de Prisma 7. La URL del datasource y la ruta del schema se declaran
 * aquí (ya no en schema.prisma). Ver AGENTS.md (decisión de versión) y ADR-0001 §5.
 *
 * **`DIRECT_URL` antes que `DATABASE_URL`, si existe.** Con un Postgres gestionado
 * detrás de un pooler de transacciones —Supabase, Neon— la aplicación se conecta al
 * pooler y **las migraciones no pueden**: necesitan una sesión estable para tomar el
 * *advisory lock* y ejecutar DDL. Son dos URLs contra la misma base, y quien las
 * distingue es esto. Donde hay una sola conexión (la VM de ADR-0001 §5, el Postgres
 * local del docker-compose) no se define `DIRECT_URL` y todo sigue igual.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // `process.env` y no `env()` para la primera: `env()` lanza si falta, y aquí
    // faltar es lo normal. La segunda sí usa `env()`, porque sin `DATABASE_URL` no
    // hay nada que hacer y es mejor saberlo al arrancar.
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});
