# Spec — env-example

**Ticket:** T-01-04 · **User Stories:** US-01, US-23

## ADDED Requirements

### Requirement: Plantilla `.env.example` versionada en la raíz

El repositorio SHALL incluir un fichero `.env.example` en la raíz del monorepo con las variables `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` y `NODE_ENV`. Cada variable SHALL tener un comentario de una línea que explique su propósito. Los valores de ejemplo SHALL ser seguros para versionar (sin credenciales de producción ni secretos reales).

#### Scenario: Variables obligatorias del DoD T-01-04 presentes

- **WHEN** un desarrollador abre `.env.example` en la raíz del repositorio
- **THEN** el fichero define `DATABASE_URL`, `API_PORT`, `CORS_ORIGIN`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` y `NODE_ENV`
- **AND** cada una de esas claves tiene un comentario `#` en la línea anterior o en la misma línea explicando su uso

#### Scenario: Valores de ejemplo coherentes con Docker Compose

- **WHEN** un desarrollador copia `.env.example` a `.env` y levanta PostgreSQL con `docker compose up -d` usando las credenciales de ejemplo
- **THEN** los valores `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` y `POSTGRES_PORT` son compatibles con `docker-compose.yml`
- **AND** `DATABASE_URL` usa el mismo usuario, contraseña, puerto y nombre de base que las variables `POSTGRES_*`

#### Scenario: Valores por defecto alineados con el código actual

- **WHEN** se inspecciona `.env.example`
- **THEN** `API_PORT` tiene valor de ejemplo `3001` (puerto por defecto del API en `backend/src/main.ts`)
- **AND** `CORS_ORIGIN` tiene valor de ejemplo `http://localhost:5173` (origen Vite en desarrollo)
- **AND** `NODE_ENV` tiene valor de ejemplo `development`

### Requirement: Exclusión de secretos reales del control de versiones

El fichero `.env` con valores reales SHALL permanecer fuera del repositorio Git. El fichero `.env.example` SHALL estar permitido en el repositorio.

#### Scenario: US-01 Scenario 2 — `.gitignore` excluye `.env`

- **WHEN** se inspecciona `.gitignore` en la raíz
- **THEN** el patrón excluye `.env` (y variantes de secretos)
- **AND** `.env.example` no está ignorado (p. ej. regla `!.env.example` si aplica)

#### Scenario: Plantilla versionada sin secretos de producción

- **WHEN** `.env.example` está en el índice de Git
- **THEN** no contiene contraseñas de producción, tokens de API ni URLs de servicios reales de despliegue
- **AND** los valores son claramente de desarrollo local o placeholders documentados

### Requirement: Documentación de instalación referencia la plantilla

La documentación de onboarding SHALL indicar que el desarrollador debe copiar `.env.example` a `.env` antes de arrancar servicios que dependen de variables de entorno.

#### Scenario: README — sección Instalación

- **WHEN** un desarrollador lee la sección **Instalación** de `README.md`
- **THEN** encuentra una instrucción explícita de copiar `.env.example` a `.env` (p. ej. `cp .env.example .env` o equivalente en Windows)
- **AND** ya no aparece la advertencia de que falta `.env.example` versionado

#### Scenario: Guía de desarrollo alineada

- **WHEN** un desarrollador consulta `docs/development_guide.md` en la sección de configuración del entorno
- **THEN** se referencia `.env.example` como fuente canónica de variables
- **AND** el bloque de ejemplo no contradice las claves ni los comentarios de `.env.example`
