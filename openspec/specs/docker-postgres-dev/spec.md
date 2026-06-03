# Spec — docker-postgres-dev

**Ticket:** T-02-01 · **User Story:** US-02

## Requirements

### Requirement: Servicio PostgreSQL 16 de desarrollo vía Docker Compose

El repositorio SHALL incluir un `docker-compose.yml` de desarrollo con un servicio llamado `db` que use la imagen `postgres:16-alpine`, lea `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` desde variables de entorno (fichero `.env` en la raíz), exponga el puerto `${POSTGRES_PORT:-5432}` en el host y monte un volumen nombrado `ConRutina_postgres_data` en `/var/lib/postgresql/data` para persistencia entre reinicios del contenedor.

#### Scenario: US-02 Scenario 1 — Happy path arranque y persistencia

- **WHEN** el desarrollador tiene Docker instalado y un fichero `.env` con las variables `POSTGRES_*` (copiado desde `.env.example`)
- **AND** ejecuta `docker compose up -d db` o `npm run db:up`
- **THEN** PostgreSQL 16 arranca en el puerto configurado (por defecto `5432`)
- **AND** el comando `pg_isready -h localhost -p <POSTGRES_PORT>` devuelve "accepting connections" tras el health check del servicio
- **AND** los datos persisten entre reinicios del contenedor gracias al volumen `ConRutina_postgres_data`

#### Scenario: DoD T-02-01 — Definición del servicio `db`

- **WHEN** se inspecciona `docker-compose.yml`
- **THEN** existe el servicio `db` con imagen `postgres:16-alpine`
- **AND** las variables de entorno del contenedor usan `${POSTGRES_USER}`, `${POSTGRES_PASSWORD}` y `${POSTGRES_DB}` sin credenciales hardcodeadas
- **AND** el mapeo de puertos es `"${POSTGRES_PORT:-5432}:5432"`
- **AND** el volumen declarado se llama `ConRutina_postgres_data`

### Requirement: Health check del servicio de base de datos

El servicio `db` SHALL incluir un health check que ejecute `pg_isready -U ${POSTGRES_USER}` para que Docker Compose pueda reportar el estado `healthy` antes de que dependencias futuras arranquen.

#### Scenario: Health check operativo

- **WHEN** el contenedor `db` está en ejecución
- **AND** se consulta `docker compose ps` o `docker inspect` del servicio
- **THEN** el health check está configurado con `pg_isready -U ${POSTGRES_USER}`
- **AND** el estado del servicio pasa a `healthy` cuando PostgreSQL acepta conexiones

### Requirement: Scripts npm para levantar y detener la base de datos

El `package.json` raíz SHALL exponer los scripts `db:up` y `db:down`. `db:up` SHALL ser equivalente a `docker compose up -d db`. `db:down` SHALL detener el servicio `db` (p. ej. `docker compose stop db` o `docker compose down` acotado al servicio).

#### Scenario: Happy path del ticket — `npm run db:up`

- **WHEN** el desarrollador ejecuta `npm run db:up` desde la raíz del monorepo
- **THEN** Docker Compose levanta únicamente el servicio `db` en segundo plano
- **AND** tras ~15 segundos `pg_isready -h localhost` responde "accepting connections" (happy path T-02-01)

#### Scenario: Detener la base de datos con `npm run db:down`

- **WHEN** el servicio `db` está en ejecución
- **AND** el desarrollador ejecuta `npm run db:down`
- **THEN** el contenedor del servicio `db` deja de estar en ejecución
- **AND** el volumen `ConRutina_postgres_data` conserva los datos para el próximo `db:up`

### Requirement: Credenciales y puerto configurables desde `.env`

El `docker-compose.yml` SHALL leer credenciales y puerto desde el fichero `.env` del desarrollador. No SHALL incluir valores secretos ni de producción hardcodeados en el compose.

#### Scenario: US-02 Scenario 2 — Variables de entorno

- **WHEN** existe `.env` con `POSTGRES_USER`, `POSTGRES_PASSWORD` y `POSTGRES_DB` definidos
- **AND** se arranca el contenedor `db`
- **THEN** la base de datos usa exactamente esas credenciales
- **AND** `docker-compose.yml` referencia esas variables con sintaxis `${...}`, no literales fijos

#### Scenario: US-02 Scenario 3 — Puerto alternativo

- **WHEN** el puerto `5432` está ocupado en la máquina del desarrollador
- **AND** el desarrollador define `POSTGRES_PORT=5433` (u otro libre) en `.env`
- **THEN** el servicio `db` expone PostgreSQL en ese puerto alternativo
- **AND** `pg_isready -h localhost -p 5433` puede alcanzar la instancia cuando el arranque es exitoso

#### Scenario: Edge case — puerto ocupado sin cambiar `.env`

- **WHEN** `POSTGRES_PORT` apunta a un puerto ya en uso
- **AND** el desarrollador ejecuta `npm run db:up`
- **THEN** Docker muestra un mensaje de error visible en la salida del comando (p. ej. "port is already allocated")
- **AND** el desarrollador puede corregir `POSTGRES_PORT` en `.env` y reintentar
