# Tasks — T-03-03 · Implementar seed de datos de desarrollo

**Ticket:** T-03-03 · **User Story:** US-03 · **Change:** `t-03-03-dev-seed` · **Rama:** `feature/T-03-03-dev-seed`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-03-03-dev-seed"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-03-03-dev-seed"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-03-03-dev-seed`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-03-03-dev-seed`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Preparar entorno (prerequisitos T-03-02)

- [x] 1.1 Levantar PostgreSQL: `npm run db:up` y confirmar contenedor `db` healthy
- [x] 1.2 Verificar `.env` con `DATABASE_URL` válida
- [x] 1.3 Confirmar migración `init` aplicada: `npm run db:migrate` sin errores
- [x] 1.4 Ejecutar `npx prisma validate` → exit code 0

## 2. Configurar Prisma seed en package.json (DoD: db:seed + prisma db seed)

- [x] 2.1 Añadir en bloque `prisma` de `package.json`: `"seed": "tsx backend/prisma/seed.ts"`
- [x] 2.2 Añadir script `"db:seed": "npx prisma db seed"` en `scripts`
- [x] 2.3 Verificar que `tsx` está en `devDependencies` (ya presente en el monorepo)

## 3. Implementar backend/prisma/seed.ts (DoD: datos demo deterministas)

- [x] 3.1 Crear `backend/prisma/seed.ts` con `PrismaClient`, `main()` y manejo de errores/`$disconnect`
- [x] 3.2 Upsert `User` id=1: `email: "demo@ConRutina.app"`, `name: "Demo User"` (DoD ticket)
- [x] 3.3 Upsert 3 hábitos ids 1–3: "Correr" (🏃, 10/5), "Meditar" (🧘, 5/2), "Leer" (📚, 8/3) — valores según `design.md`
- [x] 3.4 Calcular lunes–domingo de la semana en curso (lógica alineada con `frontend/src/domain/week.ts`)
- [x] 3.5 Crear o reutilizar `Week` para `userId=1` con `startDate`/`endDate` de la semana actual
- [x] 3.6 Crear 3 `WeekHabit` con snapshots (`order` 0–2) si no existen para esa semana
- [x] 3.7 Crear 21 `HabitEntry` (7 por `WeekHabit`, `dayIndex` 0–6, `status: pending`) sin duplicar
- [x] 3.8 Upsert 2 recompensas: "Tarde libre" (50 pts) y "Cena especial" (80 pts) con emoji y description
- [x] 3.9 Ajustar secuencias PostgreSQL (`setval`) tras IDs explícitos en User/Habit/Reward (ver `design.md`)
- [x] 3.10 Envolver operaciones relacionadas en `$transaction` cuando aplique para consistencia

## 4. Verificar seed e idempotencia (DoD: idempotente + npx prisma db seed)

- [x] 4.1 Ejecutar `npm run db:seed` → exit code 0
- [x] 4.2 Verificar en Prisma Studio o SQL: 1 User, 3 Habit, 1 Week activa, 3 WeekHabit, 21 HabitEntry, 2 Reward
- [x] 4.3 Ejecutar `npm run db:seed` una segunda vez → exit code 0, mismos conteos (idempotencia)
- [ ] 4.4 (Opcional US-03 S3) Ejecutar `npx prisma migrate reset` y confirmar que el seed se ejecuta al final

## 5. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 5.1 Buscar tests que referencien seed, datos demo o conteos de entidades Prisma
- [x] 5.2 Si no hay tests aplicables, documentar "N/A — ticket de seed Prisma" en el informe del paso 6

## 6. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque T-03-03: verificar seed, conteos en BD, arranque API con usuario demo.**

- [x] 6.1 Ejecutar `npm run lint` y confirmar exit code 0
- [x] 6.2 Ejecutar `npm run test` (Vitest) y documentar resultado (pass/skip/N/A)
- [x] 6.3 `npm run db:up` + `npm run db:seed` + `npm run dev:api` — verificar arranque sin errores
- [ ] 6.4 (Opcional) `npm run dev:web` — smoke test compilación Vite sin regresión
- [x] 6.5 Crear informe `openspec/changes/t-03-03-dev-seed/reports/YYYY-MM-DD-step-06-verification.md` con: salida seed (×2), conteos entidades, lint/test, arranque API
- [x] 6.6 Marcar paso completado solo tras PASS y existir el informe

## 7. Pruebas manuales de endpoints con curl (OBLIGATORIO para cambios de backend — EL AGENTE DEBE EJECUTAR)

**Alcance T-03-03: regresión de `GET /api/profile` con usuario demo del seed.**

- [x] 7.1 Asegurar backend en ejecución: `npm run dev:api`
- [x] 7.2 Asegurar PostgreSQL activo y seed aplicado: `npm run db:seed`
- [x] 7.3 Probar `curl -X GET http://localhost:3001/api/profile` — verificar 200 con `id: 1`, `email: "demo@ConRutina.app"`, `name: "Demo User"`
- [x] 7.4 Crear informe `openspec/changes/t-03-03-dev-seed/reports/YYYY-MM-DD-step-07-endpoint-testing.md`
- [x] 7.5 Marcar paso completado solo tras PASS y existir el informe

## 8. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)

- [x] 8.1 Documentar en informe paso 6: "Paso E2E N/A — T-03-03 solo afecta seed Prisma/BD"

## 9. Actualizar documentación técnica (OBLIGATORIO)

- [x] 9.1 Actualizar `docs/development_guide.md` §5–§6: reemplazar inserción manual de User por `npm run db:seed` y flujo `migrate reset`
- [x] 9.2 Actualizar `docs/data-model.md` roadmap: marcar seed T-03-03 como implementado
- [x] 9.3 Verificar consistencia entre datos del seed, `design.md` y documentación
- [x] 9.4 No modificar `docs/api-spec.yml` (no hay cambios de contrato API)

## 10. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas de los pasos 6–7 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [ ] 10.1 Confirmar que no quedan tareas de implementación pendientes en `tasks.md`
- [ ] 10.2 Confirmar informes de verificación/pruebas en PASS
- [ ] 10.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 10.4 **Commit único** en la rama feature (mensaje en viñetas): `seed.ts`, scripts `db:seed`, docs
- [ ] 10.5 Push de la rama: `git push -u origin feature/T-03-03-dev-seed`
- [ ] 10.6 Integrar en `develop`: `git checkout develop`, `git pull origin develop`, `git merge feature/T-03-03-dev-seed`
- [ ] 10.7 Verificar `develop`: `npm run db:up`, `npm run db:migrate`, `npm run db:seed`, `npm run typecheck`
- [ ] 10.8 Archivar change OpenSpec (`mv` a `openspec/changes/archive/YYYY-MM-DD-t-03-03-dev-seed/`)
- [ ] 10.9 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-03-03-dev-seed`
