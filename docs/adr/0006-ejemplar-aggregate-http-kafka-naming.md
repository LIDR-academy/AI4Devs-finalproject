# ADR-0006: Ejemplar aggregate naming (persistence, HTTP, Kafka)

## Estado

Aceptada (revisada 2026-05-30; rutas HTTP homogéneas en inglés)

## Contexto

El agregado de ficha singular se denomina **ejemplar** en dominio y en persistencia (castellano). En **PostgreSQL** y **MongoDB** el modelo vigente usa únicamente **`ejemplar`**:

| Capa | Convención actual |
|------|-------------------|
| PostgreSQL | Tabla `catalog.ejemplar`; columnas y FK en castellano (`ejemplar_id`, `nombre_comun`, `estado_publicacion`, …). |
| MongoDB | Colección `ejemplar_detalle`; enlace `ejemplar_pg_id` ([mongo.md](../data-model/mongo.md)). |

**No** hay tablas, columnas ni colecciones `arbol` en el esquema actual. Identificadores retirados del MVP (`arbol`, rutas HTTP `/api/.../ejemplares`, `ejemplarId` en JSON, topic `catalog.arbol.evento`, prefijo MinIO `ejemplares/`) solo sirven como referencia histórica; no deben reaparecer en código productivo.

El contrato HTTP y los eventos Kafka deben reflejar ese modelo y [ADR-0007](0007-english-http-spanish-persistence.md): rutas y propiedades JSON en **inglés**; persistencia y payload Kafka interno en **español**.

En el MVP se aceptó **pérdida de datos locales** y **sin compatibilidad hacia atrás** (reset de volúmenes Compose y migraciones Flyway).

## Decisión

### Persistencia (PostgreSQL y MongoDB)

- Nombre del agregado: **`ejemplar`** (singular, español).
- **Prohibido** en esquema y documentos de negocio: `arbol`, `arbol_id`, `arbol_pg_id`, colecciones `arbol_*`, `enriquecimientos_arbol`.
- Enlace cross-store en Mongo: **`ejemplar_pg_id`**.

### HTTP (OpenAPI)

- Rutas: `/api/catalog/trees`, `/api/catalog/public/trees`, `/api/media/trees/...` (contrato canónico: [openapi.yaml](../api/openapi.yaml)).
- Path parameter y propiedades de respuesta: **`treeId`** (mapeo desde columna `ejemplar_id`); demás propiedades en inglés según ADR-0007.
- Esquemas de request/response en inglés (`CreateTreeRequest`, `PublicTreeDetailResponse`, …).

### Kafka

- Topic: **`catalog.ejemplar.evento`**
- `tipo_evento`: **`EJEMPLAR_CREADO`**
- Campo en payload: **`ejemplar_id`** (español, alineado a BD)
- Documentación: [kafka-events.md](../events/kafka-events.md)

### Infra local

- `kafka-init` en Compose crea el topic anterior.

### Almacenamiento de objetos (MinIO)

- Prefijo: **`trees/{treeId}/...`**
- Objetos bajo el prefijo legacy `ejemplares/` no se migran.

### Código aplicación

- Backend Java: entidades y servicios de dominio sobre tabla `ejemplar`; DTO REST con propiedad **`treeId`** y rutas `/trees`.
- Frontend: símbolos **`Tree`/`Trees`** en TypeScript/Vue; consumo del wire con **`treeId`** y rutas `/api/.../trees`. Las **rutas SPA** (`/ejemplares`, `/mis-ejemplares`) permanecen en español por UX ([naming-conventions.md](../engineering/naming-conventions.md)).

## Consecuencias

- Clientes, scripts E2E y documentación que usen rutas API `/api/.../ejemplares`, `ejemplarId` en JSON o `catalog.arbol.evento` no son válidos (las rutas SPA `/ejemplares` y el wire `treeId` sí están alineadas con este ADR).
- Los títulos de historias de usuario pueden decir «árbol» en lenguaje de producto; identificadores técnicos en **BD y Kafka** usan **`ejemplar`**; el **contrato HTTP** usa **`tree`/`treeId`** en inglés.

## Relación con otros ADR

- [ADR-0007](0007-english-http-spanish-persistence.md): inglés homogéneo en JSON, query y paths; mapeo explícito `ejemplar_id` → `treeId`.

## Referencias

- [openapi.yaml](../api/openapi.yaml)
- [kafka-events.md](../events/kafka-events.md)
- [mongo.md](../data-model/mongo.md)
- [naming-conventions.md](../engineering/naming-conventions.md)
- [ADR-0007](0007-english-http-spanish-persistence.md)
