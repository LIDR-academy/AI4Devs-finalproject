# ADR-0006: Nomenclatura `ejemplar` en contratos HTTP y Kafka

## Estado

Aceptada

## Contexto

En el dominio del producto se habla de *ejemplar*; PostgreSQL y MongoDB usaban términos mixtos (`arbol`, `ejemplar_pg_id`). Las rutas REST (`/api/catalog/trees`), los identificadores JSON (`treeId`, `arbolId`) y el evento Kafka (`catalog.arbol.evento`, `ARBOL_CREADO`, `arbol_id`) generaban fricción con el modelo documentado en [mongo.md](../data-model/mongo.md) y el lenguaje de negocio.

Se acepta **pérdida de datos locales** y **sin compatibilidad hacia atrás** en el MVP (reset de volúmenes Compose y esquemas Flyway).

## Decisión

- **HTTP (OpenAPI):** rutas bajo `/api/catalog/ejemplares` y `/api/media/ejemplares/...`; parámetro de path y propiedades de respuesta **`ejemplarId`**; esquemas renombrados (`CreateEjemplarRequest`, `PublicEjemplarDetailResponse`, etc.). Contrato canónico: [openapi.yaml](../api/openapi.yaml).
- **Kafka:** topic **`catalog.ejemplar.evento`**; `tipo_evento` **`EJEMPLAR_CREADO`**; campo **`ejemplar_id`**. Documentación: [kafka-events.md](../events/kafka-events.md).
- **Infra local:** `kafka-init` en Compose crea el topic nuevo.
- **Implementación:** el código Java, frontend, propiedades `mtl.*.kafka.*` y DDL SQL se alinean en tickets posteriores (bloque C); este ADR fija el **contrato objetivo** antes del refactor.

## Consecuencias

- Clientes, scripts E2E y documentación que usen `/trees`, `treeId` o `catalog.arbol.evento` dejan de ser válidos tras el despliegue del bloque C.
- MinIO: prefijo de objetos **`ejemplares/{ejemplarId}/...`** (objetos bajo `trees/` no se migran).
- Títulos de historias de usuario pueden seguir diciendo «árbol» en lenguaje de producto; identificadores técnicos usan *ejemplar*.

## Referencias

- [openapi.yaml](../api/openapi.yaml)
- [kafka-events.md](../events/kafka-events.md)
- [mongo.md](../data-model/mongo.md)
