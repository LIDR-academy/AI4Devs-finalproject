# ADR-0007: Contratos HTTP en español (OpenAPI)

## Estado

Obsoleta — sustituida por [ADR-0008](0008-english-http-spanish-persistence.md) (HTTP en inglés homogéneo + persistencia en español). Se conserva como registro histórico.

## Contexto

El proyecto fija **columnas SQL y dominio JPA en español** ([AGENTS.md](../../AGENTS.md), [data-model-design.mdc](../../.cursor/rules/data-model-design.mdc)). [ADR-0006](0006-ejemplar-nomenclature-contracts.md) unificó rutas y el identificador **`ejemplar`** frente a `tree` / `arbol`, pero el contrato OpenAPI y los DTO de entrada siguieron mezclando términos en inglés (`speciesId`, `latitude`, `publicMapVisibility`, path `/api/catalog/species/{speciesId}`) mientras las lecturas públicas ya usaban español (`nombreComun`, `visibilidad`). Eso obligaba a mapeos mentales y a adapters en frontend sin valor de negocio.

[api-design.mdc](../../.cursor/rules/api-design.mdc) indicaba «nombres en inglés» en API, en tensión con la capa de persistencia y con el backend interno (`especieId`, `visibilidadMapaPublico` en comandos de aplicación).

## Decisión

1. **Contrato HTTP público (OpenAPI):** rutas de recurso de dominio, parámetros de path/query y **propiedades JSON** en **español**, en **`camelCase`** (p. ej. `especieId`, `latitud`, `estadoPublicacion`, `visibilidadMapaPublico`).
2. **Alineación con persistencia:** cada propiedad JSON debe corresponder de forma predecible con la columna SQL (`snake_case`), salvo identificadores compuestos ya acordados (`ejemplarId` ↔ `ejemplar_id`).
3. **Prefijo de microservicio** en URL (`/api/catalog/`, `/api/media/`, …): se mantiene en **inglés** por estabilidad operativa (carpetas `services/`, gateway, variables `mtl.*`); no es vocabulario de negocio.
4. **Rutas de maestros y agregados:** segmentos de dominio en español plural cuando aplique, p. ej. `/api/catalog/especies/{especieId}` (sustituye `/species/{speciesId}`).
5. **Valores de enumeración** en cuerpo y filtros: códigos de dominio ya usados (`BORRADOR`, `PUBLICADO`, `PRIVADO`, `PUBLICO`, `ACTIVA`, …), no traducir a inglés.
6. **Nombres de componentes** en OpenAPI (`CreateEjemplarRequest`, `Problem`): pueden permanecer en **PascalCase** con término técnico mixto por compatibilidad con generadores; lo normativo para clientes es el **wire format** (propiedades y paths), no el alias del schema.
7. **Kafka:** sin cambio de criterio; payload en `snake_case` español según [kafka-events.md](../events/kafka-events.md) (coherente con esta decisión).
8. **Código Java/TypeScript:** clases y paquetes pueden seguir en inglés; los **campos serializados** en REST deben coincidir con OpenAPI (registros/DTO y tipos del cliente).

[ADR-0006](0006-ejemplar-nomenclature-contracts.md) sigue vigente para *ejemplar* y topics Kafka; este ADR completa la capa HTTP hacia español sistemático.

## Tabla de migración orientativa (contrato)

| Antes (legacy / inglés) | Después (español `camelCase`) | Columna / nota |
|-------------------------|-------------------------------|----------------|
| `speciesId` | `especieId` | `especie_id` |
| `provinceId` | `provinciaId` | `provincia_id` |
| `latitude` | `latitud` | `latitud` |
| `longitude` | `longitud` | `longitud` |
| `municipality` | `municipio` | `municipio` |
| `description` | `descripcion` | `descripcion` |
| `altitude` | `altitud` | `altitud` |
| `publicMapVisibility` | `visibilidadMapaPublico` | `visibilidad_mapa_publico` |
| `publicationState` | `estadoPublicacion` | `estado_publicacion` |
| `speciesLabel` | `etiquetaEspecie` | etiqueta derivada en lectura |
| Path `/api/catalog/species` | `/api/catalog/especies` | recurso maestro |
| Param `{speciesId}` | `{especieId}` | path/query |

La lista no es exhaustiva; el inventario autoritativo es [openapi.yaml](../api/openapi.yaml) tras el refactor del paso de alineación.

## Consecuencias

- **Ruptura de contrato** para clientes que usen nombres en inglés: aceptable en MVP (misma política que ADR-0006: sin compatibilidad hacia atrás en entornos de desarrollo).
- OpenAPI, DTO Java con `@JsonProperty` o renombre de campos, proyecciones SQL con alias, frontend y pruebas deben actualizarse en el mismo bloque de trabajo.
- [api-design.mdc](../../.cursor/rules/api-design.mdc) queda alineado con esta decisión.
- La guía de nomenclatura ([naming-conventions.md](../engineering/naming-conventions.md)) toma este ADR como canónico para la sección API.

## Referencias

- [openapi.yaml](../api/openapi.yaml)
- [ADR-0006](0006-ejemplar-nomenclature-contracts.md)
- [api-design.mdc](../../.cursor/rules/api-design.mdc)
- [kafka-events.md](../events/kafka-events.md)
