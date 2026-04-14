# Infraestructura local (Docker Compose)

Entorno de **desarrollo** alineado con [readme.md](../../readme.md) (PostgreSQL + PostGIS, MongoDB, Redis, MinIO, Kafka en KRaft, Keycloak).

## Requisitos

- Docker Engine y Docker Compose v2.

## Arranque

```bash
cd infra/compose
copy .env.example .env
docker compose up -d
```

En Unix: `cp .env.example .env`.

La primera vez, Postgres ejecuta los scripts en `init/postgres/` (esquemas, PostGIS, BD `keycloak` y rol `keycloak`). El servicio **`kafka-init`** crea el topic `catalog.arbol.evento` si no existe.

## Puertos por defecto

| Servicio   | Puerto host | Uso |
|------------|-------------|-----|
| PostgreSQL | 5432        | JDBC `jdbc:postgresql://localhost:5432/mtl` (usuario `POSTGRES_USER`) |
| MongoDB    | 27017       | URI con `authSource=admin` |
| Redis      | 6379        | — |
| MinIO API  | 9000        | S3 API |
| MinIO consola | 9001   | Interfaz web |
| Kafka (desde el host) | 9094 | `bootstrap.servers=localhost:9094` |
| Keycloak   | 8180        | Consola `http://localhost:8180` |

Dentro de la red Docker, Kafka PLAINTEXT: `kafka:9092`.

## Credenciales de desarrollo

Valores por defecto pensados **solo para local**; están en `.env.example` y en el SQL de init de Keycloak. Si cambias `KEYCLOAK_DB_PASSWORD` en `.env`, actualiza la misma cadena en `init/postgres/01-init.sql` y **elimina el volumen** `mtl_pgdata` antes de volver a levantar.

## Detener y borrar datos

```bash
docker compose down
docker compose down -v
```

`-v` elimina volúmenes (Postgres, Mongo, Kafka, etc.).

## Notas

- **Microservicios** no están en este compose: solo dependencias. El gateway y los `services/*` se ejecutan aparte (IDE, Gradle o un compose futuro que los incluya).
- **Keycloak** arranca en modo `start-dev` con administrador de arranque (`KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD`).
