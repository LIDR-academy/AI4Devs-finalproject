# Sesión: env-dynamo-docker-compose

**Fecha**: 2026-03-16  
**Tipo**: Documentación e infraestructura (sin change OpenSpec)  
**Estado**: ✅ Completado

---

## Cambios realizados

### 1. `setup-dynamodb.ts` — nombre de tabla desde .env

- **Antes**: La tabla estaba hardcodeada como `'adresles-messages'`.
- **Después**: El nombre se lee de `process.env.DYNAMODB_TABLE_NAME` con fallback `'adresles-messages'`.
- El script se ejecuta con `pnpm dynamo:setup`, que carga `.env` (`dotenv_config_path=.env` en `package.json`).
- Alineado con el resto del proyecto: API, Worker y `validate-dynamodb-aws.ts` ya usaban `DYNAMODB_TABLE_NAME`.

**Archivo**: `infrastructure/scripts/setup-dynamodb.ts`

### 2. `docker-compose.yml` — eliminación de Postgres

- **Antes**: El Compose de desarrollo incluía el servicio `postgres` (imagen `postgres:15-alpine`) y el volumen `postgres-data`.
- **Después**: Solo quedan `redis` y `dynamodb-local`. PostgreSQL se usa siempre vía Supabase (configurado en `.env` con `DATABASE_URL`), nunca el contenedor local.

**Archivo**: `infrastructure/docker/docker-compose.yml`

### 3. Documentación actualizada

- **readme.md**: Descripción de Docker Compose sin Postgres; paso 5 de instalación indica que la tabla de DynamoDB viene de `DYNAMODB_TABLE_NAME`; árbol de carpetas y comentario de `setup-dynamodb.ts` actualizados.
- **memory-bank/project-context/tech-stack.md**: `docker-compose.yml` descrito como "Redis 7, DynamoDB-local (PostgreSQL vía Supabase)".
- **memory-bank/architecture/010-dynamodb-aws-multienv.md**: Referencia al script de setup local actualizada indicando que lee `DYNAMODB_TABLE_NAME` del `.env`.
