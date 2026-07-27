# Infraestructura local (Docker Compose)

Levanta PostgreSQL, el backend y el frontend en local.

## Uso

```bash
cd iac/local
cp .env.example .env   # ajusta las variables si hace falta (p. ej. OPENAI_API_KEY)
docker compose up --build
```

## Servicios

| Servicio | Puerto | Descripción |
|---|---|---|
| `db` | 5432 | PostgreSQL 16 |
| `backend` | 8080 | API Spring Boot ([../../backend](../../backend)) |
| `frontend` | 3000 | Nuxt 3 ([../../frontend](../../frontend)) |

Requiere que `backend/` y `frontend/` contengan ya el código de la aplicación (ver sus respectivos `Dockerfile`); de momento solo existe el esqueleto de infraestructura.
