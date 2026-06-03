# Informe de verificación — paso 6 (T-03-03)

**Fecha:** 2026-05-30  
**Change:** `t-03-03-dev-seed`  
**Rama:** `feature/T-03-03-dev-seed`  
**Resultado:** PASS

## Entorno

| Comando | Resultado |
|---------|-----------|
| `npm run db:up` | PASS — contenedor `conrutina-db` en ejecución |
| `.env` / `DATABASE_URL` | PASS — Prisma conecta a `conrutina@localhost:5432` |
| `npm run db:migrate` | PASS — sin migraciones pendientes |
| `npx prisma validate` | PASS — exit code 0 |

## Seed (idempotencia)

**Primera ejecución** (`npm run db:seed`):

```
Running seed command `tsx backend/prisma/seed.ts` ...
Seed completado: usuario demo, hábitos, semana activa y recompensas.
The seed command has been executed.
```

**Segunda ejecución** (`npm run db:seed`): misma salida, exit code 0.

## Conteos en BD (tras segunda ejecución)

| Entidad | Esperado | Obtenido |
|---------|----------|----------|
| User | 1 | 1 |
| Habit | 3 | 3 |
| Week | 1 | 1 |
| WeekHabit | 3 | 3 |
| HabitEntry | 21 | 21 |
| Reward | 2 | 2 |

Usuario demo: `id=1`, `email=demo@ConRutina.app`, `name=Demo User`.

## Lint y tests

| Comando | Resultado |
|---------|-----------|
| `npm run lint` | PASS — exit code 0 |
| `npx vitest run` | N/A — sin ficheros `*.test.*` / `*.spec.*` en el proyecto |
| Tests seed/Prisma | N/A — ticket de seed Prisma (sin tests unitarios del seed) |

## Arranque API

- `npm run dev:api`: el puerto 3001 ya estaba en uso por una instancia previa; la API respondió correctamente en ese puerto.
- Smoke `GET /api/profile`: ver informe paso 7.

## E2E Playwright

**Paso E2E N/A** — T-03-03 solo afecta seed Prisma/BD; sin cambios de UI.

## migrate reset (opcional US-03 S3)

No ejecutado en esta sesión (opcional). El seed está registrado en `package.json` → `prisma.seed` para ejecución automática tras reset.
