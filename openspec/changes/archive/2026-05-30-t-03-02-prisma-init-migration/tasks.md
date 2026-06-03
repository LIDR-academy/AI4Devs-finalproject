# Tasks — T-03-02 · Generar y aplicar primera migración Prisma

**Ticket:** T-03-02 · **User Story:** US-03 · **Change:** `t-03-02-prisma-init-migration` · **Rama:** `feature/T-03-02-prisma-init-migration`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-03-02-prisma-init-migration"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-03-02-prisma-init-migration"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-03-02-prisma-init-migration`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-03-02-prisma-init-migration`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Preparar entorno y validar schema (DoD: prerequisitos T-03-01)

- [x] 1.1 Levantar PostgreSQL: `npm run db:up` y confirmar health check (`docker ps`, contenedor `db` healthy)
- [x] 1.2 Verificar `.env` con `DATABASE_URL` apuntando al contenedor local
- [x] 1.3 Ejecutar `npx prisma validate` → exit code 0 (schema completo T-03-01)
- [x] 1.4 Inspeccionar estado previo de BD: tablas existentes y `_prisma_migrations` (documentar en informe paso 5)

## 2. Generar y aplicar migración init (DoD: migrate dev --name init)

- [x] 2.1 Si hay drift/legacy (p. ej. solo `User` sin historial Prisma), aplicar estrategia de `design.md`: reset dev (`npx prisma migrate reset --force --skip-seed`) o volumen Docker limpio — documentar decisión
- [x] 2.2 Ejecutar `npx prisma migrate dev --name init` desde la raíz → crea `backend/prisma/migrations/<timestamp>_init/migration.sql`
- [x] 2.3 Confirmar que la migración se aplicó sin errores y `_prisma_migrations` contiene registro `init`
- [x] 2.4 Ejecutar `npm run prisma:generate` tras la migración

## 3. Verificar tablas y restricciones en PostgreSQL (DoD: BD con todas las tablas)

- [x] 3.1 Consultar tablas públicas (psql o Docker exec): deben existir `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption`
- [x] 3.2 Verificar enum `CompletionStatus` y restricción única `WeekHabit` (`weekId`, `habitId`) en catálogo PostgreSQL
- [x] 3.3 Ejecutar `npx prisma studio` y confirmar que muestra los 7 modelos del dominio (DoD ticket)
- [x] 3.4 (Opcional smoke) Insertar fila mínima en `User` si no existe — necesaria para `GET /api/profile` en pruebas posteriores

## 4. Script db:migrate (DoD: npm run db:migrate)

- [x] 4.1 Confirmar script `db:migrate` en `package.json` raíz → `npx prisma migrate deploy`
- [x] 4.2 Ejecutar `npm run db:migrate` con migración `init` ya aplicada → debe terminar sin errores (idempotente / "already applied")
- [x] 4.3 Si el script no existiera o fuera incorrecto, corregirlo y documentar en `docs/development_guide.md`

## 5. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 5.1 Buscar tests que referencien migraciones, `schema.prisma` o conexión Prisma a tablas nuevas
- [x] 5.2 Si no hay tests aplicables, documentar "N/A — ticket de migración Prisma" en el informe del paso 6

## 6. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque T-03-02: verificar migración, tablas en BD, arranque API con tablas reales.**

- [x] 6.1 Ejecutar `npm run lint` y confirmar exit code 0
- [x] 6.2 Ejecutar `npm run test` (Vitest) y documentar resultado (pass/skip/N/A)
- [x] 6.3 `npm run db:up` + `npm run dev:api` — verificar arranque sin errores de Prisma/conexión BD
- [ ] 6.4 (Opcional) `npm run dev:web` — smoke test compilación Vite sin regresión
- [x] 6.5 Crear informe `openspec/changes/t-03-02-prisma-init-migration/reports/YYYY-MM-DD-step-06-verification.md` con: estado BD previo/posterior, salida `migrate dev`, listado tablas, Studio OK, lint/test
- [x] 6.6 Marcar paso completado solo tras PASS y existir el informe

## 7. Pruebas manuales de endpoints con curl (OBLIGATORIO para cambios de backend — EL AGENTE DEBE EJECUTAR)

**Alcance T-03-02: sin cambios de API; verificar regresión de `GET /api/profile` con tablas migradas.**

- [x] 7.1 Asegurar backend en ejecución: `npm run dev:api`
- [x] 7.2 Asegurar PostgreSQL activo: `docker ps`
- [x] 7.3 Si no hay User id=1, insertar registro mínimo vía Studio o SQL (documentar)
- [x] 7.4 Probar `curl -X GET http://localhost:3001/api/profile` — verificar 200 y cuerpo JSON esperado
- [x] 7.5 Crear informe `openspec/changes/t-03-02-prisma-init-migration/reports/YYYY-MM-DD-step-07-endpoint-testing.md`
- [x] 7.6 Marcar paso completado solo tras PASS y existir el informe

## 8. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)

- [x] 8.1 Documentar en informe paso 6: "Paso E2E N/A — T-03-02 solo afecta migración Prisma/BD"

## 9. Actualizar documentación técnica (OBLIGATORIO)

- [x] 9.1 Actualizar `docs/data-model.md`: tabla "Estado de persistencia" — entidades **migradas** a PostgreSQL (quitar nota "pendiente T-03-02")
- [x] 9.2 Actualizar `docs/development_guide.md` § Migraciones: flujo `migrate dev --name init`, `npm run db:migrate`, ruta `backend/prisma/migrations/`
- [x] 9.3 Verificar consistencia entre schema, migración SQL y `docs/data-model.md`
- [x] 9.4 No modificar `docs/api-spec.yml` (no hay cambios de contrato API)

## 10. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas de los pasos 6–7 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [x] 10.1 Confirmar que no quedan tareas de implementación pendientes en `tasks.md`
- [ ] 10.2 Confirmar informes de verificación/pruebas en PASS
- [ ] 10.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 10.4 **Commit único** en la rama feature (mensaje en viñetas): migración `init`, carpeta `migrations/`, docs
- [ ] 10.5 Push de la rama: `git push -u origin feature/T-03-02-prisma-init-migration`
- [ ] 10.6 Integrar en `develop`: `git checkout develop`, `git pull origin develop`, `git merge feature/T-03-02-prisma-init-migration`
- [ ] 10.7 Verificar `develop`: `npm run db:up`, `npm run db:migrate`, `npm run typecheck`
- [ ] 10.8 Archivar change OpenSpec (`mv` a `openspec/changes/archive/YYYY-MM-DD-t-03-02-prisma-init-migration/`)
- [ ] 10.9 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-03-02-prisma-init-migration`
