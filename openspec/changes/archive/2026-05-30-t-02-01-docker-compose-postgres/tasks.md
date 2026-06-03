# Tasks — T-02-01 · Docker Compose para PostgreSQL 16 con volumen persistente



**Ticket:** T-02-01 · **User Story:** US-02 · **Change:** `t-02-01-docker-compose-postgres` · **Rama:** `feature/T-02-01-docker-compose-postgres`



## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)



- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`

- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-02-01-docker-compose-postgres"`

- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-02-01-docker-compose-postgres"`

- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-02-01-docker-compose-postgres`

- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-02-01-docker-compose-postgres`

- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)



## 1. Ajustar `docker-compose.yml` — servicio `db` (DoD: imagen, env, volumen, health check, puerto)



- [x] 1.1 Renombrar servicio `postgres` → `db` (o crear servicio `db` si se reescribe el fichero)

- [x] 1.2 Confirmar imagen `postgres:16-alpine`

- [x] 1.3 Configurar `environment` con `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}`, `${POSTGRES_DB}` (sin valores hardcodeados)

- [x] 1.4 Configurar puertos: `"${POSTGRES_PORT:-5432}:5432"`

- [x] 1.5 Declarar y montar volumen nombrado `ConRutina_postgres_data` → `/var/lib/postgresql/data`

- [x] 1.6 Configurar health check: `pg_isready -U ${POSTGRES_USER}` (validar sintaxis Compose en runtime)

- [x] 1.7 (Opcional) Ajustar `container_name` a `conrutina-db` para coherencia con el servicio `db`



## 2. Scripts npm `db:up` y `db:down` (DoD)



- [x] 2.1 Añadir `"db:up": "docker compose up -d db"` en `package.json` raíz

- [x] 2.2 Añadir `"db:down": "docker compose stop db"` en `package.json` raíz

- [x] 2.3 Revisar scripts `docker:up` / `docker:down` / `docker:logs`: redirigir a servicio `db` o documentar como alias (sin romper flujo existente)

- [x] 2.4 Verificar que `npm run db:up` y `npm run db:down` funcionan desde la raíz del monorepo



## 3. Preparar entorno local para verificación



- [x] 3.1 Confirmar que existe `.env` (copiar desde `.env.example` si falta: `cp .env.example .env`)

- [x] 3.2 Verificar coherencia entre `POSTGRES_*` en `.env` y `DATABASE_URL`

- [x] 3.3 Detener contenedor/volumen antiguo si existe conflicto de nombre de servicio: `docker compose down`



## 4. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)



- [x] 4.1 Buscar tests que referencien `docker-compose`, servicio `postgres` o scripts `docker:*`

- [x] 4.2 Si no hay tests aplicables, documentar "N/A — ticket de infraestructura" en el informe del paso 5



## 5. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



**Enfoque T-02-01 (Infra): verificar Docker Compose, health check, persistencia y arranque opcional del API.**



- [x] 5.1 Ejecutar `npm run lint` y confirmar exit code 0

- [x] 5.2 Ejecutar `npm run db:up` y confirmar que el contenedor `db` arranca (`docker compose ps`)

- [x] 5.3 Esperar ~15 s y verificar health: `docker compose exec db pg_isready -U conrutina` (o usuario de `.env`) → "accepting connections"

- [x] 5.4 Verificar puerto expuesto: `pg_isready -h localhost -p <POSTGRES_PORT>` o equivalente vía `docker compose exec`

- [x] 5.5 Probar persistencia: crear dato de prueba (`docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT 1"`), ejecutar `npm run db:down`, luego `npm run db:up`, confirmar que el volumen `ConRutina_postgres_data` persiste

- [x] 5.6 (Opcional) Documentar edge case puerto ocupado: intentar `POSTGRES_PORT` en conflicto y capturar mensaje de error Docker visible

- [x] 5.7 Si PostgreSQL operativo: ejecutar `npm run dev:api` y confirmar conexión a BD sin error (coherencia con `DATABASE_URL`)

- [x] 5.8 Ejecutar `npm run dev:web` y confirmar que Vite arranca (smoke test sin regresión)

- [x] 5.9 Crear informe `openspec/changes/t-02-01-docker-compose-postgres/reports/YYYY-MM-DD-step-05-verification.md`

- [x] 5.10 Marcar paso completado solo tras PASS y existir el informe



## 6. Pruebas manuales de endpoints con curl (N/A — sin cambios de API)



Este ticket es **Infra**; no modifica endpoints.



- [x] 6.1 Documentar en el informe del paso 5: "Paso curl N/A — T-02-01 no altera la API"



## 7. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)



Este ticket no modifica componentes ni flujos de usuario.



- [x] 7.1 Documentar en el informe del paso 5: "Paso E2E N/A — T-02-01 solo afecta Docker Compose y scripts npm"



## 8. Actualizar documentación técnica (OBLIGATORIO)



- [x] 8.1 Actualizar `README.md`: sección base de datos con `npm run db:up` / `db:down` y volumen `ConRutina_postgres_data`

- [x] 8.2 Actualizar `docs/development_guide.md` §4 Base de datos: comandos canónicos `db:up`/`db:down`, servicio `db`, nombre del volumen

- [x] 8.3 Revisar referencias obsoletas a servicio `postgres` o volumen `conrutina_postgres_data` en docs

- [x] 8.4 Documentar migración de volumen antiguo si aplica (nota breve en development_guide)

- [x] 8.5 Verificar consistencia entre README, development_guide, `.env.example` y `docker-compose.yml`



## 9. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)



**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas del paso 5 estén en PASS.



**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.



- [x] 9.1 Confirmar que no quedan tareas de implementación pendientes en este archivo

- [x] 9.2 Confirmar informe del paso 5 en estado PASS

- [x] 9.3 Confirmar con el usuario que acepta los cambios antes de commitear

- [x] 9.4 Hacer **commit único** en `feature/T-02-01-docker-compose-postgres` con mensaje en viñetas (p. ej. `- Alinear docker-compose con servicio db y volumen ConRutina_postgres_data`, `- Añadir scripts npm db:up y db:down`, `- Actualizar documentación de setup BD`)

- [x] 9.5 Subir la rama al remoto: `git push -u origin feature/T-02-01-docker-compose-postgres` (OBLIGATORIO si existe remoto)

- [x] 9.6 Cambiar a `develop`: `git checkout develop` y `git pull origin develop`

- [x] 9.7 Integrar: `git merge feature/T-02-01-docker-compose-postgres`

- [x] 9.8 Verificar mínimo: `npm run db:up`, `docker compose ps` (servicio `db` healthy), `npm run lint`

- [x] 9.9 (Opcional) Push de `develop`: `git push origin develop`

- [x] 9.10 Archivar change OpenSpec: `/opsx:archive t-02-01-docker-compose-postgres`

- [x] 9.11 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-02-01-docker-compose-postgres`

