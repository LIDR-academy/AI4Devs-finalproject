# ADR-0008: Contratos HTTP en inglés con persistencia en español

## Estado

Aceptada (sustituye el alcance de contrato HTTP de [ADR-0007](0007-spanish-http-contracts.md))

## Contexto

- **Regla de negocio:** columnas y modelo relacional en **castellano**, porque el dominio se trabaja con el cliente en español; traducir conceptos al inglés en la capa de datos genera etiquetas incorrectas y dificulta leer el modelo real.
- **Documentación:** contenido en **español** (nombres de fichero en inglés por convención del repo).
- **Código fuente:** convención habitual del ecosistema en **inglés** (paquetes, clases, composables) no es un problema si las otras capas encajan.
- [ADR-0007](0007-spanish-http-contracts.md) exigía HTTP en español, pero el OpenAPI y gran parte del backend **ya** exponían inglés (`speciesId`, `/species`, `latitude`). Forzar español en API implicaba **renombrar lo ya desplegado** y aumentaba riesgo de traducciones literales (`visibilidadMapaPublico` frente a vocabulario ya estable en código).
- [ADR-0006](0006-ejemplar-nomenclature-contracts.md) fijó el término de producto **`ejemplar`** (no `tree` / `arbol`); no es una traducción al inglés sino el nombre acordado del agregado.

## Por qué BD en castellano y HTTP en inglés (justificar la disparidad)

A primera vista parece **incongruente** usar dos idiomas en capas vecinas. No es incoherencia si se entiende que **no son la misma frontera** ni el mismo público:

| Dimensión | Persistencia (castellano) | Contrato HTTP (inglés) |
|-----------|---------------------------|-------------------------|
| **Quién lo lee** | Personas de producto, soporte, auditoría de datos, SQL en revisiones; alineado al lenguaje del cliente | Código de SPA y servicios, OpenAPI, herramientas y convenciones del ecosistema Java/TypeScript |
| **Qué representa** | **Modelo de dominio durable** (verdad a largo plazo, informes, migraciones, legalidad de datos) | **Vista publicada** hacia el cliente HTTP (puede evolucionar por versión sin renombrar columnas) |
| **Riesgo del naming** | Un mal nombre en columna (**traducción literal incorrecta**) se fossiliza en Flyway, ERD y conversaciones con negocio | Un nombre en JSON se corrige en DTO/OpenAPI con impacto acotado al contrato |
| **Estándar del sector** | Esquemas locales en idioma del negocio en productos no internacionales | APIs REST y props en inglés son la convención habitual de integración, aunque el negocio sea local |

En terminología DDD, la BD materializa el **lenguaje ubicuo** acordado con el dominio (español). El contrato REST actúa como **capa anticorrupción / traducción** hacia el consumidor técnico: el dominio **no se redefine** en inglés en SQL; solo se **proyecta** en inglés en el wire format mediante DTO y tabla de mapeo (§ tabla BD → JSON).

**No es “mezclar idiomas por descuido”:** es **un idioma homogéneo por capa** (español en SQL y Kafka interno; inglés homogéneo en cada JSON de API) y **un mapa explícito** entre capas. Lo que sí sería incongruente — y se prohíbe — es `speciesId` y `nombreComun` en el **mismo** JSON.

**Por qué no poner también la BD en inglés:** traducir `visibilidad_mapa_publico`, `estado_publicacion` o `nombre_comun` a columnas inglesas obligaría a que todo el equipo (y futuros mantenedores) mantengan **dos glosarios** mentales (reunión con cliente en español, esquema en inglés), con errores del tipo `publication_status` vs `publication_state`. La regla de negocio del proyecto es evitar esa traducción en la **fuente de verdad**.

**Por qué no poner también el HTTP en español (ADR-0007):** el coste en este repositorio es mayor (renombrar contrato ya desplegado en inglés) y reintroduce traducciones dudosas en propiedades. La opción B minimiza cambios y fija la traducción en **un solo sitio** (mapper/DTO), auditable.

**Término `ejemplar` en rutas:** demuestra que la API no fuerza inglés ciego: donde el **nombre de producto** no es una traducción sino identificador acordado, se conserva ([ADR-0006](0006-ejemplar-nomenclature-contracts.md)).

## Decisión

Modelo de **tres capas** con mapeo explícito y **mínima ruptura**:

| Capa | Idioma | Responsabilidad |
|------|--------|-----------------|
| **Persistencia** (SQL, columnas, Mongo de negocio) | Español `snake_case` | Verdad de dominio |
| **Aplicación** (entidades JPA, servicios, comandos) | Español en atributos de dominio **o** inglés con `@Column` español; clases en inglés | Lógica y alineación con BD |
| **Contrato HTTP** (OpenAPI, JSON, paths de recurso) | **Inglés `camelCase`** homogéneo | Interfaz hacia SPA y clientes |
| **Kafka** (payload entre servicios) | Español `snake_case` según [kafka-events.md](../events/kafka-events.md) | Sin cambio; cercano a BD, consumo interno |

### Reglas del contrato HTTP

1. Rutas de recurso en **inglés** plural: `/species`, `/provinces`, `/families`, `/genera`, `/photos`, `/ejemplares` (este último según ADR-0006, término de producto, no traducción).
2. Propiedades JSON en **inglés** (`speciesId`, `commonName`, `latitude`, `publicMapVisibility`, `photoId`, …).
3. **Mapeo obligatorio** en DTO/assembler/controller: no exponer entidades JPA; traducir español (BD) ↔ inglés (JSON) en un solo sitio por operación.
4. Prefijo `/api/<contexto>/` y enums de valor (`BORRADOR`, `PUBLICADO`, …): sin cambio (técnico / códigos de dominio).
5. **Prohibido** mezclar en el mismo esquema JSON inglés y español (`speciesId` + `nombreComun`).

### Término `ejemplar` (excepción mínima)

- Paths: `/ejemplares`, `{ejemplarId}` — se mantienen ([ADR-0006](0006-ejemplar-nomenclature-contracts.md)).
- No reintroducir `tree`, `arbol`, `/trees` ni `catalog.arbol.evento`.

### Tabla de mapeo BD → JSON (referencia)

| Columna SQL (español) | JSON API (inglés) |
|-----------------------|-------------------|
| `ejemplar_id` | `ejemplarId` |
| `especie_id` | `speciesId` |
| `provincia_id` | `provinceId` |
| `nombre_comun` | `commonName` |
| `nombre_cientifico` | `scientificName` |
| `latitud` / `longitud` | `latitude` / `longitude` |
| `municipio` | `municipality` |
| `descripcion` | `description` |
| `altitud` | `altitude` |
| `visibilidad_mapa_publico` | `publicMapVisibility` |
| `estado_publicacion` | `publicationState` |
| `fotografia_id` | `photoId` |

## Consecuencias

- **Menor impacto** que ADR-0007: se **conservan** paths y DTO de escritura ya en inglés; el trabajo de alineación se concentra en **respuestas y tipos frontend** que aún usan español en JSON (`nombreComun`, `visibilidad`, `latitud`, `fotografiaId` donde deba ser `photoId`).
- OpenAPI, DTO de salida, proyecciones con alias y tipos TypeScript deben converger al inglés homogéneo.
- [api-design.mdc](../../.cursor/rules/api-design.mdc) y [naming-conventions.md](../engineering/naming-conventions.md) reflejan este ADR.
- ADR-0007 queda **obsoleta** para decisiones nuevas de contrato HTTP.

## Referencias

- [ADR-0006](0006-ejemplar-nomenclature-contracts.md), [ADR-0007](0007-spanish-http-contracts.md) (obsoleta)
- [openapi.yaml](../api/openapi.yaml)
- [naming-conventions.md](../engineering/naming-conventions.md)
