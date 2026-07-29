## Context

El repositorio define arquitectura y contratos (README, UC-01, KAN-9) pero aún no expone código NestJS/React en el árbol. KAN-9 exige el flujo completo de alta con búsqueda automática: modal en Book Tracker, varias ediciones, guardado con portada/autora/páginas/género. UC-01 añade fallback de catálogo y estado inicial `pendiente`. El backend debe aislar integraciones frágiles; la SPA solo consume DTOs normalizados.

## Goals / Non-Goals

**Goals:**

- Implementar búsqueda de catálogo con política **Open Library → Google Books** en un solo servicio de dominio.
- Exponer `GET /v1/books/catalog/search?q=` (nombre final acordado en implementación) y `POST /v1/books` según README §4.
- Cumplir escenarios BDD de KAN-9 en frontend (modal, selección de edición, libro visible en tracker).
- Mapear resultados externos a un modelo `CatalogEdition` estable (título, autores, portada, género, páginas, ISBN, `data_source`, `external_provider_id`).
- Tests del fallback y del alta autenticado.

**Non-Goals:**

- Entrada manual cuando ambas APIs fallan (UC-01 §3b).
- Edición inline de metadatos tras selección aproximada.
- Goodreads como fuente, caché Redis, o rate limiting avanzado (solo timeout + límite simple en MVP).
- Estados de lectura distintos de `pendiente` en el alta (UC-02+).

## Decisions

### 1. Estructura del repositorio

- `backend/` — NestJS + TypeORM + PostgreSQL.
- `frontend/` — React + TypeScript + Vite (o equivalente).

Sin monorepo `apps/*`: dos proyectos en la raíz del repo, cada uno con su `package.json`.

### 1b. Prefijo global de API

- NestJS configurado con prefijo global **`v1`** (rutas expuestas como `/v1/books`, `/v1/books/catalog/search`, alineado con README §4).

### 2. Módulo `books` en NestJS

- `BooksController`: `searchCatalog`, `createBook`.
- `CatalogService`: orquesta fallback; no expone detalles de OL/GB al controller.
- `OpenLibraryClient` / `GoogleBooksClient`: implementan interfaz `CatalogProvider` (`search(query): Promise<CatalogEdition[]>`).
- `BooksService`: persistencia, deduplicación (`isbn_13` o `data_source` + `external_provider_id`), creación de `reading_records`.

**Rationale:** Aísla UC-01 en catálogo; el resto de BookService (UC-02+) crece sin tocar clientes HTTP.

### 3. Política de fallback

1. Llamar Open Library (`https://openlibrary.org/search.json` + enriquecimiento de portada/ISBN si hace falta).
2. Si respuesta vacía **o** error de red/5xx/timeout (p. ej. 3s), llamar Google Books **una vez**.
3. Devolver lista unificada con campo `data_source` por ítem.
4. Si ambas fallan o vacías: `200` con `items: []` y mensaje de negocio opcional (`code: CATALOG_NO_RESULTS`) — la UI muestra vacío; entrada manual queda fuera de KAN-9.

**Alternativa:** fallback en paralelo. Rechazada: duplica cuota y contradice UC-01 (secuencial).

### 4. Contrato de búsqueda (API interna)

```text
GET /v1/books/catalog/search?q={string}&limit=20
Authorization: Bearer <jwt>

200 { items: CatalogEdition[], source: "open_library" | "google_books" | "none" }
```

`CatalogEdition` (campos mínimos para UI y POST):

| Campo | Tipo | Notas |
| --- | --- | --- |
| `title` | string | Requerido |
| `authors` | string | Texto plano unificado |
| `cover_image_url` | string \| null | |
| `page_count` | number \| null | |
| `genre` | string \| null | Primera categoría mapeada |
| `isbn_13` / `isbn_10` | string \| null | Normalizados sin guiones |
| `data_source` | enum | `open_library` \| `google_books` |
| `external_provider_id` | string | OL work/edition key o GB volumeId |

Query `q` mínimo 2 caracteres; validación con `class-validator`.

### 5. Alta `POST /v1/books`

Reutilizar `CreateBookRequest` del README §4. Tras `201`, incluir `reading.status = "pendiente"`. Conflicto `409` si duplicado en biblioteca de la usuaria.

### 6. Frontend Book Tracker

- Ruta `/book-tracker` (o nombre del sidebar).
- Botón «Añadir libro» → `AddBookModal`.
- Input con **debounce 300–400 ms** → `useQuery` / `useMutation` contra search y create.
- Lista de tarjetas: portada, título, autora, género, páginas, ISBN si existe; clic selecciona edición; botón «Guardar» envía POST con payload del ítem.
- Tras éxito: cerrar modal, invalidar query de libros, fila nueva en tabla con columnas requeridas por KAN-9.

**Alternativa:** búsqueda solo en cliente llamando APIs públicas. Rechazada: expone cuotas, CORS y lógica de fallback duplicada.

### 7. Autenticación

JWT en todos los endpoints de este cambio. `user_id` del token para filas en `books`.

### 8. Tests

| Nivel | Qué |
| --- | --- |
| Unit | `CatalogService`: OL con datos → GB no llamado; OL vacío → GB llamado una vez |
| Integration | `POST /books` con JWT de prueba, 201 + `pendiente` |
| E2E (opcional MVP) | Playwright contra API real (staging/local con red): abrir modal, buscar título conocido, guardar, ver fila |

## Risks / Trade-offs

| Riesgo | Mitigación |
| --- | --- |
| Cuotas / latencia de APIs externas | Timeout corto, una llamada de fallback, límite `limit` en búsqueda |
| Metadatos incompletos (sin género o páginas) | Campos opcionales en DTO; UI muestra «—» donde falte dato |
| Varias ediciones con títulos similares | Lista completa; usuaria elige fila explícita (KAN-9 escenario 2) |
| Sin código base aún | Scaffolding Nest + React como primera tarea en `tasks.md` |
| Google Books requiere API key en algunos entornos | Variable `GOOGLE_BOOKS_API_KEY` opcional; documentar en `.env.example` |

### 9. Catálogo en desarrollo y tests

- **Sin mock de catálogo:** en local, tests y E2E llaman a Open Library y Google Books reales (o se omiten tests que requieran red si el entorno no tiene acceso).
- Tests unitarios del fallback **mockean** solo los clientes HTTP (`OpenLibraryClient` / `GoogleBooksClient`) en Jest; no hay proveedor fake ni fixture JSON de catálogo en el árbol del proyecto.

## Migration Plan

1. Scaffold `backend/` y `frontend/` si no existen.
2. Migración TypeORM: tablas `books`, `reading_records` según README §3.
3. Desplegar backend con variables de entorno de catálogo.
4. Desplegar frontend apuntando a `VITE_API_URL`.
5. Rollback: desactivar botón «Añadir libro» vía feature flag o revertir despliegue; sin migración destructiva en datos ya guardados.

## Resolved decisions (product owner)

| Tema | Decisión |
| --- | --- |
| Estructura | `backend/` + `frontend/` en la raíz (no `apps/*`) |
| Prefijo API | Sí — global `v1` en NestJS, rutas bajo `/v1/...` |
| Mock de catálogo | No — integraciones reales en dev; en tests unitarios solo mocks de clientes HTTP |
