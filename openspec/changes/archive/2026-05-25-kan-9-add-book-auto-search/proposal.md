## Why

KAN-9 (US-01) es el flujo crítico del MVP: sin búsqueda automática de metadatos, cada alta de libro obliga a rellenar datos a mano y contradice el valor del producto frente a Excel. Implementar UC-01 con Open Library como fuente principal y fallback a Google Books reduce fricción en Book Tracker y desbloquea el resto de capacidades (estados, TBR, stats).

## What Changes

- Endpoint de búsqueda de catálogo en el backend NestJS: consulta Open Library primero; si no hay resultados o la fuente falla, consulta Google Books una vez y normaliza la respuesta.
- Endpoint `POST /v1/books` (o equivalente versionado) para persistir la edición elegida en PostgreSQL (`books` + `reading_records` con estado `pendiente`), alineado con el contrato del README §4.
- Módulo de integración externa encapsulado (`CatalogService` / providers) sin acoplar controladores al contrato de cada API.
- UI en Book Tracker: botón «Añadir libro», modal con buscador (debounce), lista de ediciones con metadatos visibles, confirmación y refresco de la biblioteca.
- Tests: unitarios del fallback de catálogo; integración/e2e del flujo búsqueda → guardado según criterios Jira.

**Fuera de alcance en este cambio (UC-01 alternativos):** formulario de entrada manual cuando ambas APIs fallan; edición de metadatos post-selección (se puede abordar en iteración posterior).

## Capabilities

### New Capabilities

- `catalog-search`: Búsqueda autenticada por título o autora con fallback Open Library → Google Books y DTO de resultado unificado para la UI.
- `book-create`: Alta en biblioteca tras selección de edición (`POST /books`), deduplicación básica y registro de lectura inicial `pendiente`.
- `add-book-ui`: Modal y flujo en Book Tracker que cumple los tres escenarios BDD de KAN-9.

### Modified Capabilities

- _(ninguna — no existen specs previas en `openspec/specs/`)_

## Impact

- **Backend (`backend/`):** módulo `books`, clientes HTTP a Open Library y Google Books, DTOs con `class-validator`, entidades TypeORM `books` / `reading_records`, guards JWT, prefijo global `/v1`.
- **Frontend (`frontend/`):** página Book Tracker, componentes de modal/búsqueda, cliente API y caché (TanStack Query u equivalente).
- **Documentación de referencia:** `docs/product/use-cases.md` UC-01, `docs/product/user-stories.md` US-01, `readme.md` §3–4, Jira **KAN-9** (épica KAN-4).
- **Dependencias externas:** APIs públicas Open Library y Google Books (cuotas y timeouts gestionados en servidor).
- **Jira:** KAN-9 — criterios de aceptación y notas técnicas vinculados a este cambio.
