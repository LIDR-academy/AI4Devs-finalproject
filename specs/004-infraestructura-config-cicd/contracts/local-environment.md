# Contract — Entorno Local (Docker Compose)

**Feature**: `004-infraestructura-config-cicd`

## Servicios del compose

| Servicio | Imagen | Puerto | Health |
|---|---|---|---|
| solicitudes | build `Dockerfile.solicitudes` | 8081 | `GET /health` → 200 |
| descargas | build `Dockerfile.descargas` | 8082 | `GET /health` → 200 |
| verificacion | build `Dockerfile.verificacion` | 8083 | `GET /health` → 200 |
| sql-server | `mcr.microsoft.com/mssql/server:2022-latest` | 1433 | healthcheck TCP/sqlcmd |
| redis | `redis:7-alpine` | 6379 | healthcheck `redis-cli ping` |

## Comandos

```bash
# desde deploy/docker (o con -f)
docker compose up -d
curl http://localhost:8081/health   # 200
curl http://localhost:8082/health   # 200
curl http://localhost:8083/health   # 200
```

## Criterios

- `docker compose up` deja los 3 servicios con health 200 en **< 3 minutos**.
- Los servicios dependen de SQL Server/Redis por `depends_on: condition: service_healthy`, pero **arrancan sin requerir BD activa** (datasource diferido).
- Variables tomadas de un archivo `.env` local (no versionado); `.env.example` documenta todas.
- Ningún secreto en los archivos del compose ni en los Dockerfile.
