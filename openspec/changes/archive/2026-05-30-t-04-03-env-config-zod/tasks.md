# Tasks — T-04-03 · Configurar validación de variables de entorno con Zod al arranque



**Ticket:** T-04-03 · **User Story:** US-04 · **Change:** `t-04-03-env-config-zod` · **Rama:** `feature/T-04-03-env-config-zod`



## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)



- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`

- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-04-03-env-config-zod"`

- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-04-03-env-config-zod"`

- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-04-03-env-config-zod`

- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-04-03-env-config-zod`

- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)



## 1. Preparar entorno (prerequisitos T-01-04, T-04-01)



- [x] 1.1 Verificar `.env.example` en raíz con `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN`, `NODE_ENV`

- [x] 1.2 Copiar `.env.example` a `.env` si no existe: `cp .env.example .env` (o equivalente Windows)

- [x] 1.3 Levantar PostgreSQL: `npm run db:up` y confirmar contenedor healthy

- [x] 1.4 Revisar baseline: `backend/src/loadEnv.ts`, `backend/src/main.ts`, `backend/src/presentation/http/createApp.ts`



## 2. Dependencia Zod (DoD: schema Zod)



- [x] 2.1 Instalar `zod` en el monorepo: `npm install zod`

- [x] 2.2 Verificar que `package.json` raíz incluye `zod` en `dependencies`

- [x] 2.3 `npm run typecheck` sigue pasando tras instalar



## 3. Implementar `backend/src/config.ts` (DoD: schema + exit + export tipado)



- [x] 3.1 Crear `backend/src/config.ts` con schema Zod para `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN`, `NODE_ENV`

- [x] 3.2 Aplicar defaults: `API_PORT` → `"3001"`, `CORS_ORIGIN` → `"http://localhost:5173"`, `NODE_ENV` → `"development"`

- [x] 3.3 Si `DATABASE_URL` ausente o vacía → `console.error('Variable obligatoria DATABASE_URL no definida. Ver .env.example')` y `process.exit(1)`

- [x] 3.4 Exportar tipo `AppConfig` y singleton `config` con `databaseUrl`, `apiPort` (number), `corsOrigin`, `nodeEnv`

- [x] 3.5 Rechazar `NODE_ENV` fuera de `development|production|test` con fallo controlado al arranque



## 4. Integrar config en bootstrap (DoD: import en main.ts antes del resto)



- [x] 4.1 En `main.ts`: mantener `import './loadEnv.js'` como primer import de bootstrap

- [x] 4.2 En `main.ts`: añadir `import { config } from './config.js'` inmediatamente después de `loadEnv` y antes de Prisma/createApp

- [x] 4.3 Sustituir lectura de `process.env.API_PORT` por `config.apiPort` en `main.ts`

- [x] 4.4 En `createApp.ts`: usar `config.corsOrigin` en lugar de `process.env.CORS_ORIGIN ?? ...`

- [x] 4.5 Opcional coherente: log de BD en `main.ts` usando `config.databaseUrl` si aplica



## 5. Tests unitarios `config.test.ts` (DoD ticket + US-01 S4, US-04 S5)



- [x] 5.1 Crear `backend/src/config.test.ts` con Vitest

- [x] 5.2 Happy path: `DATABASE_URL` presente; defaults `apiPort=3001`, `corsOrigin=http://localhost:5173`, `nodeEnv=development`

- [x] 5.3 Obligatoria: sin `DATABASE_URL` → mock `process.exit(1)`; stderr/mensaje cita `.env.example`

- [x] 5.4 Edge: `DATABASE_URL=""` → mismo comportamiento que ausente

- [x] 5.5 Enum: `NODE_ENV=production` aceptado; `NODE_ENV=staging` rechazado

- [x] 5.6 Restaurar `process.env` en `afterEach` para no contaminar otras suites

- [x] 5.7 Ejecutar `npm test -- backend/src/config.test.ts` → PASS



## 6. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)



- [x] 6.1 Ejecutar `npm test` completo — verificar que `errorHandler.test.ts` y demás suites no regresionan

- [x] 6.2 Si algún test importa `main.ts` o depende de env sin mock, actualizar expectativas

- [x] 6.3 Si no hay tests adicionales afectados, documentar "N/A" en informe paso 7



## 7. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



**Enfoque T-04-03: suite Vitest config + arranque API con `.env` válido + fallo sin `DATABASE_URL`.**



- [x] 7.1 Ejecutar `npm test` — todas las suites en PASS

- [x] 7.2 `npm run lint` y `npm run typecheck` → sin errores

- [x] 7.3 Con `.env` válido: `npm run db:up` + `npm run api` — verificar arranque y log `Server running on port 3001`

- [x] 7.4 Sin `DATABASE_URL` (env temporal o `.env` renombrado brevemente): verificar exit 1 y mensaje con `.env.example`; restaurar `.env` después

- [x] 7.5 Crear informe `openspec/changes/t-04-03-env-config-zod/reports/YYYY-MM-DD-step-07-verification.md`

- [x] 7.6 Marcar paso completado solo tras PASS y existir el informe



## 8. Pruebas manuales de endpoints con curl (OBLIGATORIO para cambios de backend — EL AGENTE DEBE EJECUTAR)



**Alcance T-04-03: regresión con config válido — el ticket no añade endpoints; validar que el scaffold sigue operativo.**



- [x] 8.1 Asegurar backend en ejecución con `.env` válido: `npm run api`

- [x] 8.2 `curl -s http://localhost:3001/health` — 200, `status: "ok"`

- [x] 8.3 `curl -s http://localhost:3001/api/profile` — 200 con usuario demo id=1

- [x] 8.4 Documentar en informe que la validación de env se cubre en Vitest + prueba manual de arranque fallido (paso 7.4)

- [x] 8.5 Crear informe `openspec/changes/t-04-03-env-config-zod/reports/YYYY-MM-DD-step-08-endpoint-testing.md`

- [x] 8.6 Marcar paso completado solo tras PASS y existir el informe



## 9. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)



- [x] 9.1 Documentar en informe paso 7: "Paso E2E N/A — T-04-03 solo afecta validación de env en backend"



## 10. Actualizar documentación técnica (OBLIGATORIO)



- [x] 10.1 Actualizar `docs/backend-standards.md`: sección variables de entorno con patrón `loadEnv.ts` + `config.ts` + Zod, mensaje de fallo y objeto `config` exportado

- [x] 10.2 Verificar que `docs/development_guide.md` sigue referenciando `.env.example` (sin contradicción)

- [x] 10.3 No modificar `docs/api-spec.yml` salvo que sea necesario (N/A esperado — sin cambio de contrato HTTP)



## 11. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)



**Cuándo:** Tras aceptación del usuario y pruebas PASS. **NO ejecutar `git commit` durante `/opsx:apply`.**



- [x] 11.1 Confirmar `tasks.md` sin tareas de implementación pendientes

- [x] 11.2 Confirmar informes en `reports/` en estado PASS

- [ ] 11.3 Confirmar con el usuario aceptación antes de commitear

- [ ] 11.4 Commit único en la rama feature (mensaje en viñetas breves)

- [ ] 11.5 Push: `git push -u origin feature/T-04-03-env-config-zod`

- [ ] 11.6 Merge en `develop`: `git checkout develop`, `git pull`, `git merge feature/T-04-03-env-config-zod`

- [ ] 11.7 Archivar change: `mv` a `openspec/changes/archive/YYYY-MM-DD-t-04-03-env-config-zod/`

- [ ] 11.8 Intentar marcar ticket: `npm run openspec:mark-ticket -- --change t-04-03-env-config-zod`

