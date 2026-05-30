# Reset de migraciones Flyway en desarrollo (MyTreeLibrary)

## Cuándo hace falta

- Has **cambiado el contenido** de un script ya aplicado (`V1__…`, `V2__…`, `V3__…`) y Flyway avisa de **checksum mismatch** (incluye añadir o quitar comentarios o espacios: el checksum es del fichero entero).
- Has **unido o partido** migraciones y tu Postgres sigue registrando la historia antigua.
- Ves tablas viejas o **no** coinciden con los `*.sql` actuales del repo.

En **producción** no se reescriben migraciones ya desplegadas; aquí solo se describe el flujo **local**.

## Opción A — Todo el volumen de Postgres (la más simple)

Borra datos de **todos** los servicios que usan volúmenes de Compose (Postgres, Mongo, Kafka, etc.):

```bash
cd infra/compose
docker compose down -v
docker compose up -d
```

Vuelve a levantar los microservicios: Flyway aplicará las migraciones **desde cero** según los ficheros actuales del repo.

## Opción B — Solo esquema `catalog` (conservas el resto de la BD)

Conecta a la BD **`mtl`** (usuario `mtl`, puerto según tu `.env`, p. ej. `5433` en el host).

El historial de Flyway para `catalog-service` está en el esquema **`catalog`** (tabla `flyway_schema_history`). Al tirar el esquema, Flyway volverá a ejecutar las migraciones en orden (`V1__baseline.sql`, `V2__seed_maestros_inicial.sql`, …) en el siguiente arranque.

```sql
DROP SCHEMA IF EXISTS catalog CASCADE;
CREATE SCHEMA catalog;
```

Como en desarrollo el usuario `mtl` suele ser el propietario de la BD, no suele hacer falta más. Si algo falla por permisos:

```sql
ALTER SCHEMA catalog OWNER TO mtl;
```

Luego arranca de nuevo **`catalog-service`** con perfil `dev`.

## Opción B — Solo esquema `media`

Mismo criterio que `catalog`: historial Flyway en **`media.flyway_schema_history`**.

```sql
DROP SCHEMA IF EXISTS media CASCADE;
CREATE SCHEMA media;
```

Luego arranca **`media-service`** con perfil `dev`. Tras consolidar el DDL en **`V1__baseline.sql`**, solo debe quedar la versión **`1`** en el historial.

## Opción B — Solo esquema `notification`

Mismo criterio: historial Flyway en **`notification.flyway_schema_history`**.

```sql
DROP SCHEMA IF EXISTS notification CASCADE;
CREATE SCHEMA notification;
```

Luego arranca **`notification-service`** con perfil `dev`. Solo debe quedar la versión **`1`** en el historial.

## Comprobar que cuadra

```sql
SET search_path TO catalog;
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

Deberías ver filas para las versiones que existan hoy en `src/main/resources/db/migration/` (p. ej. `1`, `2`, `3`…) con `success = true`.

## Checksum mismatch en una migración ya aplicada (p. ej. `V3`)

Si Flyway dice **`Migration checksum mismatch for migration version 3`** y el SQL en disco es el que quieres mantener, actualiza el registro en la BD con **repair** (desde `services/`, Postgres en marcha y credenciales alineadas con `application-dev.properties`):

```bash
mvn -pl catalog-service flyway:repair
```

El `flyway-maven-plugin` en `catalog-service/pom.xml` usa por defecto `jdbc:postgresql://localhost:5433/mtl` y esquema `catalog`; si tu puerto o usuario difieren, pasa `-Dflyway.url=…`, `-Dflyway.user=…`, `-Dflyway.password=…`.

Luego arranca de nuevo **catalog-service** con perfil `dev`.

## Evitar el problema

- No edites migraciones **ya aplicadas** en entornos compartidos: añade siempre una versión nueva (**`V4__…`**, **`V5__…`**, …) con el cambio.
- En local, si reescribes `V1`/`V2`/`V3`, usa esta guía, **`flyway:repair`** (arriba) o la opción A.

En **catalog-service**, el orden de los scripts bajo `src/main/resources/db/migration/` lo fija Flyway por nombre: **`V1__baseline.sql`** (DDL único: tablas, extensión `unaccent`, CHECK de `ejemplar`, índice parcial de listados públicos, secuencia Kafka) y **`V2__seed_maestros_inicial.sql`** (semillas). Cambios de esquema posteriores al MVP inicial: nueva migración **`V3__…`**, **`V4__…`**, …

En **media-service**, el DDL completo está en un único **`V1__baseline.sql`** (tabla `fotografia` con categoría PUBLIC/PRIVATE; borrado físico, sin columnas de soft delete).

En **notification-service**, el DDL completo está en un único **`V1__baseline.sql`** (suscriptor, evento_catalogo, notificacion, envio_notificacion).

Configuración común: `spring.flyway.locations=classpath:db/migration` y `spring-boot-starter-flyway` (Spring Boot 4).
