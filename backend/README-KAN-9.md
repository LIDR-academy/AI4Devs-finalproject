# Backend — KAN-9 quick start

## Base de datos (PostgreSQL)

El `.env.example` usa:

`postgresql://postgres:postgres@localhost:5432/reading_analytics`

**Opción A — Docker** (desde la raíz del repo; expone el puerto **5433** para no chocar con un Postgres local en 5432):

```bash
docker compose up -d
```

En `backend/.env`:

`DATABASE_URL=postgresql://postgres:postgres@localhost:5433/reading_analytics`

**Opción B — Postgres que ya tienes en el Mac (puerto 5432)**

Edita `backend/.env` y pon la contraseña **real** de tu usuario `postgres` (o el usuario que uses). El ejemplo `postgres:postgres` solo vale si configuraste esa clave.

```bash
createdb reading_analytics
```

**Errores frecuentes**

| Mensaje | Causa |
| --- | --- |
| `ECONNREFUSED` | Postgres no está arrancado |
| `password authentication failed for user "postgres"` | `DATABASE_URL` con contraseña incorrecta para tu Postgres local |
| `Bind for 0.0.0.0:5432 failed` | Ya hay algo en 5432; usa Docker en 5433 (Opción A) |

## Arrancar la API

```bash
cd backend
cp .env.example .env   # solo la primera vez

export TYPEORM_SYNCHRONIZE=true
npm run start:dev
```

Usa **dos líneas** en `export` y `npm` (no pegues `truenpm` junto).

API base: `http://localhost:3000/v1`

- `POST /v1/auth/dev-login` — `{ "email": "you@example.com" }`
- `GET /v1/books/catalog/search?q=le+guin` — Bearer JWT
- `GET /v1/books/catalog/covers?data_source=open_library&external_provider_id=/works/OL82563W&hint_cover_url=...` — portadas de una edición
- `POST /v1/books` — create book (see README §4)
- `GET /v1/books` — list user library

Tests: `npm test` (unit), `npm run test:integration`

## Búsqueda de catálogo

- **Open Library** suele responder en 4–8 s; el cliente HTTP usa timeout de **12 s** (antes 3 s, provocaba fallos silenciosos).
- **Google Books** es fallback; sin `GOOGLE_BOOKS_API_KEY` propia puede devolver error de cuota (429). Con Open Library funcionando no debería hacer falta.
