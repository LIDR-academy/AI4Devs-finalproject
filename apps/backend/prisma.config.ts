import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// process.env.DATABASE_URL directo (no el helper env(), que lanza si falta) — `prisma
// generate` en el build de Docker corre antes de que exista DATABASE_URL real (recien
// se inyecta en runtime via docker-compose); solo `migrate deploy`/`db seed` necesitan
// el valor real, y para entonces el contenedor ya lo tiene (TK-062).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
