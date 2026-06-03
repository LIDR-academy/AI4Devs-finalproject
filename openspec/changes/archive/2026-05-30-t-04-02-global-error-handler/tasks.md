# Tasks — T-04-02 · Implementar middleware de manejo global de errores



**Ticket:** T-04-02 · **User Story:** US-04 · **Change:** `t-04-02-global-error-handler` · **Rama:** `feature/T-04-02-global-error-handler`



## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)



- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`

- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-04-02-global-error-handler"`

- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-04-02-global-error-handler"`

- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-04-02-global-error-handler`

- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-04-02-global-error-handler`

- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)



## 1. Preparar entorno (prerequisitos T-04-01)



- [x] 1.1 Levantar PostgreSQL: `npm run db:up` y confirmar contenedor healthy

- [x] 1.2 Verificar `.env` con `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN`, `NODE_ENV`

- [x] 1.3 Revisar baseline: `backend/src/presentation/http/createApp.ts` y directorio `middleware/`



## 2. Clases de error en dominio (DoD: tipos discriminables)



- [x] 2.1 Crear `backend/src/domain/errors/appErrors.ts` con `AppError`, `ValidationError`, `NotFoundError`, `ConflictError`, `UnprocessableError`

- [x] 2.2 Asegurar propiedades `code`, `message` y `details?` opcional según diseño

- [x] 2.3 Exportar desde barrel si aplica (`backend/src/domain/errors/index.ts`)



## 3. Middleware errorHandler y asyncHandler (DoD: middleware registrado)



- [x] 3.1 Implementar `backend/src/presentation/http/middleware/asyncHandler.ts` (wrapper para rutas async en Express 4)

- [x] 3.2 Implementar `backend/src/presentation/http/middleware/errorHandler.ts` con mapeo 400/404/409/422/500

- [x] 3.3 Respuesta JSON `{ code, message, details?, stack? }` — `stack` solo si `NODE_ENV !== 'production'`

- [x] 3.4 Errores genéricos → `INTERNAL_ERROR` sin filtrar detalles de BD/Prisma al cliente en producción

- [x] 3.5 Registrar `app.use(errorHandler)` como último middleware en `createApp.ts`

- [x] 3.6 Envolver `GET /api/profile` con `asyncHandler` y usar `next(err)` en el `catch` (regresión happy path intacta)



## 4. Tests unitarios errorHandler.test.ts (DoD ticket + US-04 S4)



- [x] 4.1 Crear `backend/src/presentation/http/middleware/errorHandler.test.ts`

- [x] 4.2 Casos happy: `ValidationError`→400, `NotFoundError`→404, `ConflictError`→409, `UnprocessableError`→422

- [x] 4.3 Casos edge: `Error` genérico→500; producción sin `stack`; development con `stack`

- [x] 4.4 Verificar formato `{ code, message, details? }` en respuestas serializadas

- [x] 4.5 Ejecutar `npm test` y `npm run typecheck` → exit code 0



## 5. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)



- [x] 5.1 Buscar tests que importen `createApp` o dependan del formato `{ error: "..." }`

- [x] 5.2 Actualizar mocks/expectativas si algún test existente se ve afectado

- [x] 5.3 Si no hay tests adicionales afectados, documentar "N/A" en informe paso 6



## 6. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



**Enfoque T-04-02: suite Vitest del errorHandler + arranque API + regresión health/profile.**



- [x] 6.1 Ejecutar `npm test` — todos los tests del errorHandler en PASS

- [x] 6.2 `npm run lint` y `npm run typecheck` → sin errores

- [x] 6.3 `npm run db:up` + `npm run api` — verificar arranque sin errores

- [x] 6.4 Crear informe `openspec/changes/t-04-02-global-error-handler/reports/YYYY-MM-DD-step-06-verification.md`

- [x] 6.5 Marcar paso completado solo tras PASS y existir el informe



## 7. Pruebas manuales de endpoints con curl (OBLIGATORIO para cambios de backend — EL AGENTE DEBE EJECUTAR)



**Alcance T-04-02: regresión `GET /health` y `GET /api/profile`; verificación de 500 vía test unitario (no requiere ruta de provocación en producción).**



- [x] 7.1 Asegurar backend en ejecución: `npm run api`

- [x] 7.2 `curl -s http://localhost:3001/health` — 200, `status: "ok"`

- [x] 7.3 `curl -s http://localhost:3001/api/profile` — 200 con usuario demo id=1

- [x] 7.4 Documentar en informe que el mapeo 500/400 se valida en Vitest (US-04 S4, US-06 S4)

- [x] 7.5 Crear informe `openspec/changes/t-04-02-global-error-handler/reports/YYYY-MM-DD-step-07-endpoint-testing.md`

- [x] 7.6 Marcar paso completado solo tras PASS y existir el informe



## 8. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)



- [x] 8.1 Documentar en informe paso 6: "Paso E2E N/A — T-04-02 solo afecta middleware backend HTTP"



## 9. Actualizar documentación técnica (OBLIGATORIO)



- [x] 9.1 Actualizar `docs/backend-standards.md`: sección manejo de errores con clases, `errorHandler`, `asyncHandler`, formato `{ code, message, details? }`

- [x] 9.2 Actualizar `docs/api-spec.yml`: schema `ApiErrorResponse` y respuestas de error en endpoints existentes

- [x] 9.3 Verificar consistencia con `docs/prd.md` (errores estructurados) sin ampliar scope



## 10. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)



**Cuándo:** Tras aceptación del usuario y pruebas PASS. **NO ejecutar `git commit` durante `/opsx:apply`.**



- [x] 10.1 Confirmar `tasks.md` sin tareas de implementación pendientes

- [x] 10.2 Confirmar informes en `reports/` en estado PASS

- [x] 10.3 Confirmar con el usuario aceptación antes de commitear

- [x] 10.4 Commit único en la rama feature (mensaje en viñetas breves)

- [x] 10.5 Push: `git push -u origin feature/T-04-02-global-error-handler`

- [x] 10.6 Merge en `develop`: `git checkout develop`, `git pull`, `git merge feature/T-04-02-global-error-handler`

- [x] 10.7 Archivar change: `mv` a `openspec/changes/archive/YYYY-MM-DD-t-04-02-global-error-handler/`

- [x] 10.8 Intentar marcar ticket: `npm run openspec:mark-ticket -- --change t-04-02-global-error-handler`

