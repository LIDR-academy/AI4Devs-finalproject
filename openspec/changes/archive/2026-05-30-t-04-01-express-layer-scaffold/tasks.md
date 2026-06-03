# Tasks — T-04-01 · Inicializar servidor Express con estructura de capas

**Ticket:** T-04-01 · **User Story:** US-04 · **Change:** `t-04-01-express-layer-scaffold` · **Rama:** `feature/T-04-01-express-layer-scaffold`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-04-01-express-layer-scaffold"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-04-01-express-layer-scaffold"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-04-01-express-layer-scaffold`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-04-01-express-layer-scaffold`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Preparar entorno (prerequisitos US-03)

- [x] 1.1 Levantar PostgreSQL: `npm run db:up` y confirmar contenedor `db` healthy
- [x] 1.2 Verificar `.env` con `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN`
- [x] 1.3 Aplicar migraciones y seed: `npm run db:migrate` y `npm run db:seed`
- [x] 1.4 Revisar estado actual de `backend/src/main.ts` y `createApp.ts` (baseline pre-refactor)

## 2. Estructura de capas y directorio middleware (DoD: directorios)

- [x] 2.1 Confirmar existencia de `backend/src/domain/`, `application/`, `application/ports/`, `infrastructure/`
- [x] 2.2 Crear `backend/src/presentation/http/middleware/` con `.gitkeep` (placeholder hasta T-04-02)
- [x] 2.3 Verificar que la estructura coincide con `docs/backend-standards.md`

## 3. Refactorizar createApp.ts (DoD: CORS, JSON, /health, createApp(prisma))

- [x] 3.1 Cambiar firma exportada a `createApp(prisma: PrismaClient): Express`
- [x] 3.2 Instanciar `createPrismaUserRepository(prisma)` internamente
- [x] 3.3 Registrar middleware CORS con origen `process.env.CORS_ORIGIN ?? 'http://localhost:5173'`
- [x] 3.4 Registrar `express.json()` para body parser JSON
- [x] 3.5 Implementar `GET /health` → `200 { status: "ok", timestamp: new Date().toISOString() }`
- [x] 3.6 Preservar `GET /api/profile` con la misma respuesta demo (regresión seed T-03-03)

## 4. Actualizar main.ts (DoD: PrismaClient + API_PORT + arranque)

- [x] 4.1 Importar `PrismaClient` y crear instancia única
- [x] 4.2 Invocar `createApp(prisma)` (eliminar composición directa de `userRepository` en main)
- [x] 4.3 Escuchar en `Number(process.env.API_PORT) || 3001`
- [x] 4.4 Log de arranque: `Server running on port ${port}` (US-04 Scenario 1)
- [x] 4.5 Conservar manejo de error `EADDRINUSE` y carga de `loadEnv.js`

## 5. Script npm run api (DoD: tsx watch)

- [x] 5.1 Añadir en `package.json`: `"api": "tsx watch backend/src/main.ts"`
- [x] 5.2 Verificar que `npm run api` y `npm run dev:api` arrancan el mismo entrypoint
- [x] 5.3 Ejecutar `npm run typecheck` y `npm run lint` → exit code 0

## 6. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 6.1 Buscar tests que importen `createApp` o referencien la firma `CreateAppDeps`
- [x] 6.2 Actualizar mocks si existen tests de presentación HTTP
- [x] 6.3 Si no hay tests aplicables, documentar "N/A — scaffold sin tests unitarios" en informe paso 7

## 7. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque T-04-01: arranque API, health check, regresión /api/profile.**

- [x] 7.1 Ejecutar `npm run test` (Vitest) y documentar resultado (pass/skip/N/A)
- [x] 7.2 `npm run db:up` + `npm run db:seed` + `npm run api` — verificar arranque sin errores y log `Server running on port 3001`
- [x] 7.3 Verificar conexión Prisma (sin errores de BD en consola al arrancar)
- [x] 7.4 Crear informe `openspec/changes/t-04-01-express-layer-scaffold/reports/YYYY-MM-DD-step-07-verification.md` con: lint/typecheck/test, arranque API, observaciones
- [x] 7.5 Marcar paso completado solo tras PASS y existir el informe

## 8. Pruebas manuales de endpoints con curl (OBLIGATORIO para cambios de backend — EL AGENTE DEBE EJECUTAR)

**Alcance T-04-01: `GET /health` (nuevo) y regresión `GET /api/profile`.**

- [x] 8.1 Asegurar backend en ejecución: `npm run api` (o `npm run dev:api`)
- [x] 8.2 Asegurar PostgreSQL activo y seed aplicado: `npm run db:seed`
- [x] 8.3 Probar `curl -s http://localhost:3001/health` — verificar 200, `status: "ok"`, `timestamp` ISO-8601
- [x] 8.4 Probar `curl -s http://localhost:3001/api/profile` — verificar 200 con usuario demo id=1
- [x] 8.5 (Opcional) Probar header CORS con `curl -H "Origin: http://localhost:5173" -v http://localhost:3001/health`
- [x] 8.6 Crear informe `openspec/changes/t-04-01-express-layer-scaffold/reports/YYYY-MM-DD-step-08-endpoint-testing.md`
- [x] 8.7 Marcar paso completado solo tras PASS y existir el informe

## 9. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)

- [x] 9.1 Documentar en informe paso 7: "Paso E2E N/A — T-04-01 solo afecta scaffold backend HTTP"

## 10. Actualizar documentación técnica (OBLIGATORIO)

- [x] 10.1 Actualizar `docs/api-spec.yml` con endpoint `GET /health` (200, body `{ status, timestamp }`)
- [x] 10.2 Actualizar `docs/development_guide.md`: script `npm run api`, smoke test `/health`, coexistencia con `dev:api`
- [x] 10.3 Actualizar `docs/backend-standards.md` si la firma de `createApp` o estructura difiere de lo documentado
- [x] 10.4 No modificar `docs/data-model.md` (sin cambios de schema)
- [x] 10.5 Verificar consistencia entre spec, design y documentación

## 11. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas de los pasos 7–8 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [ ] 11.1 Confirmar que no quedan tareas de implementación pendientes en `tasks.md`
- [ ] 11.2 Confirmar informes de verificación/pruebas en PASS
- [ ] 11.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 11.4 **Commit único** en la rama feature (mensaje en viñetas): scaffold Express, `/health`, script `api`, docs
- [ ] 11.5 Push de la rama: `git push -u origin feature/T-04-01-express-layer-scaffold`
- [ ] 11.6 Integrar en `develop`: `git checkout develop`, `git pull origin develop`, `git merge feature/T-04-01-express-layer-scaffold`
- [ ] 11.7 Verificar `develop`: `npm run typecheck`, `npm run api`, curl `/health`
- [ ] 11.8 Archivar change OpenSpec (`mv` a `openspec/changes/archive/YYYY-MM-DD-t-04-01-express-layer-scaffold/`)
- [ ] 11.9 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-04-01-express-layer-scaffold`
