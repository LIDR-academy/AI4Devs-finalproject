# Naming conventions (MyTreeLibrary)

Guía estable y auditable de nomenclatura en el monorepo. Complementa [AGENTS.md](../../AGENTS.md) sin sustituir los ADR ni el contrato OpenAPI.

## Justificación

Los criterios **conjugan buenas prácticas de ingeniería** con las premisas del producto (dominio y documentación en castellano; proyecto no internacional en el MVP).

### Persistencia en castellano

Tablas y columnas en español porque:

- El modelo se acuerda con el cliente y el negocio **en español**; la BD es la **fuente de verdad** que deben leer informes, auditorías y el propio equipo sin glosario paralelo.
- Traducir columnas al inglés sin necesidad real de mercado internacional introduce **etiquetas mal traducidas** y aleja el esquema del lenguaje de los casos de uso y de las HUs.

### Contrato HTTP en inglés (opción B, [ADR-0007](../adr/0007-english-http-spanish-persistence.md))

Rutas y propiedades JSON en **inglés homogéneo** porque:

- Encaja con el **código** (Java/TypeScript, OpenAPI) y con lo **ya desplegado** en escritura (`speciesId`, `/species`), con **menor impacto** que españolizar todo el wire format.
- La traducción dominio → cliente HTTP se concentra en **DTO/assembler** (un mapa, una responsabilidad), no dispersa en plantillas ni en SQL.

### ¿Es incongruente BD en español y API en inglés?

Puede **parecer** disparato; en este proyecto es **deliberado** y no es mezcla aleatoria:

- **Un idioma por frontera:** español en SQL (y Kafka interno); inglés en cada JSON de API. Entre fronteras, [tabla de mapeo en ADR-0007](../adr/0007-english-http-spanish-persistence.md).
- **Públicos distintos:** la BD habla al dominio durable; la API habla al consumidor técnico (SPA, tests, herramientas).
- Lo prohibido es la **mezcla dentro del mismo JSON** (`speciesId` + `nombreComun`), no tener URL en inglés y columna `nombre_comun`.

Argumentación ampliada: [ADR-0007 § «Por qué BD en castellano y HTTP en inglés»](../adr/0007-english-http-spanish-persistence.md).

### Otros

- **Documentación:** contenido en español; nombres de fichero en inglés (convención del repo).
- **Lenguaje de producto:** en textos para el usuario y HUs se puede decir «árbol» o «ejemplar»; eso **no** define identificadores en código ni en BD.

## Precedencia

1. ADR aceptado (0006, 0007).
2. [openapi.yaml](../api/openapi.yaml) y [kafka-events.md](../events/kafka-events.md).
3. Este documento.
4. Reglas Cursor (`.cursor/rules/*.mdc`).

**Código nuevo:** cumple la norma de **un idioma por capa** (tabla siguiente). Auditoría 2026-05-30: [inventario](../software-revisions/2026-05-30-naming-conventions-audit-inventory.md), [re-`rg`](../software-revisions/2026-05-30-naming-conventions-rg-reaudit.md), [Mongo](../software-revisions/2026-05-30-mongo-naming-audit.md).

---

## Matriz de capas: idioma y término *ejemplar*

Regla transversal: **un solo idioma por frontera** (no mezclar español e inglés en el mismo JSON, la misma fila SQL ni el mismo documento Mongo). Entre capas vecinas, **mapeo explícito** (DTO, mapper, assembler).

| Capa | Idioma | Cómo nombrar el agregado *ejemplar* | Ejemplos válidos | Prohibido / legacy |
|------|--------|-------------------------------------|------------------|-------------------|
| **Producto y UI visible** | Español | Lenguaje de negocio: «ejemplar», «árbol», «ficha» | `vue-i18n`, títulos de HU | Identificadores técnicos en pantalla |
| **PostgreSQL** (tablas, columnas, Flyway) | Español | Tabla y columnas **`ejemplar`** | `catalog.ejemplar`, `ejemplar_id`, `nombre_comun`, `estado_publicacion` | `arbol`, columnas en inglés |
| **MongoDB** (diseño y documentos) | Español | Colección **`ejemplar_detalle`**; enlace **`ejemplar_pg_id`** | [mongo.md](../data-model/mongo.md) | `arbol_*`, `enriquecimientos_arbol` |
| **Kafka** (topic y payload interno) | Español | **`catalog.ejemplar.evento`**, campo **`ejemplar_id`** | [kafka-events.md](../events/kafka-events.md) | `catalog.arbol.evento`, `arbol_id` |
| **Contrato HTTP — propiedades JSON** | Inglés | Propiedad **`treeId`** (mapeo desde `ejemplar_id`); resto inglés homogéneo | `commonName`, `speciesId`, `publicationState` | `nombreComun` + `speciesId` en el mismo schema; **`treeId`** en JSON (legacy) |
| **Contrato HTTP — rutas y paths** | Inglés | Segmento de ficha **`/trees`** en catálogo y media ([ADR-0006](../adr/0006-ejemplar-aggregate-http-kafka-naming.md)) | `/api/catalog/trees`, `/api/media/trees/{treeId}/photos` | **`/ejemplares`**, `/arboles` (legacy API) |
| **Backend Java** (paquetes, servicios, DTO REST) | Inglés | Servicios de dominio sobre entidad `Ejemplar`; DTO REST con **`treeId`** y rutas `/trees`. Columnas JPA en español vía `@Column` | `PublicEjemplarQueryMapper` → SQL `especie` | Mezclar props JSON españolas en DTO expuesto |
| **Frontend** (Vue, TS, composables, ficheros) | Inglés | Símbolos **`Tree`/`Trees`**; API con **`treeId`** y `/api/.../trees`. Rutas SPA en español (`/ejemplares`, `/mis-ejemplares`) por UX | `CreateTreeView`, `PublicTreeListItem` | `EjemplarView`; llamar API con `/ejemplares` |
| **MinIO / S3** (prefijos de objeto) | Inglés | **`trees/{treeId}/...`** | Clave bajo `trees/` | Prefijo **`ejemplares/`** |
| **Documentación de ingeniería** | Español (contenido); nombre de fichero en inglés | Describir BD y dominio en español; citar contrato con nombres del OpenAPI | Este documento, ADR, `mongo.md` | — |

**Resumen del agregado en código inglés:** en la **SPA**, la ficha es **`Tree`** y las rutas visibles pueden ser `/ejemplares`; en **OpenAPI** el recurso es **`/trees`** con propiedad **`treeId`**; en **BD/Kafka** el término es **`ejemplar`**. No es mezcla en una misma capa: son fronteras distintas con mapeo explícito ([ADR-0006](../adr/0006-ejemplar-aggregate-http-kafka-naming.md)).

**Persistencia:** en PostgreSQL y Mongo el término canónico es **`ejemplar`**; **`arbol`** no forma parte del modelo actual.

---

## 1. Principios transversales

| Código | Regla |
|--------|--------|
| P1 | **Dominio y persistencia:** español (`ejemplar`, `especie`, …); sin `arbol` en SQL ni Mongo. |
| P2 | **Contrato HTTP (JSON y query):** inglés homogéneo; mapeo desde BD en DTO/mapper ([ADR-0007](../adr/0007-english-http-spanish-persistence.md)). |
| P3 | **Un concepto, un nombre por frontera;** sin mezcla inglés/español en el mismo schema JSON ni en la misma fila SQL. |
| P4 | Valores de enumeración: códigos de dominio (`BORRADOR`, `PUBLICADO`, …), sin traducir. |
| P5 | **Frontend (código TS/Vue):** agregado **`Tree`/`Trees`**; API con **`treeId`** y `/api/.../trees`. Rutas SPA `/ejemplares` por UX. **Backend:** dominio `Ejemplar`, DTO con **`treeId`**. |
| P6 | **Legacy prohibido en producto:** `arbol`, rutas API `/api/.../ejemplares`, `ejemplarId` en contrato HTTP, `catalog.arbol.evento`, prefijo MinIO `ejemplares/`. |

---

## 2. PostgreSQL

| Código | Regla |
|--------|--------|
| N1.1 | Tablas: `snake_case`, **singular**, español. |
| N1.2 | Columnas: `snake_case`, **español**. |
| N1.3 | FK: `{tabla_referenciada}_id`. |
| N1.4 | Índices `idx_{tabla}_{columnas}`; unique `uq_{tabla}_{columnas}`. |
| N1.5 | JPA: `@Column(name = "...")` en español; atributos Java alineados con dominio o mapeados en DTO. |
| N1.6 | Migraciones Flyway: `V{n}__descripcion_kebab.sql`. |

---

## 3. MongoDB

| Código | Regla |
|--------|--------|
| N2.1 | Campos de negocio en **español**, según [mongo.md](../data-model/mongo.md). |
| N2.2 | Enlace a PostgreSQL: `especie_pg_id`, `ejemplar_pg_id`. |
| N2.3 | Colecciones: `especie_detalle`, `ejemplar_detalle`; `_id` numérico = PK PG (sin `ObjectId` por defecto en MVP). |

---

## 4. API REST (OpenAPI)

| Código | Regla |
|--------|--------|
| N4.1 | Fuente de verdad: [openapi.yaml](../api/openapi.yaml); [api-design.mdc](../../.cursor/rules/api-design.mdc). |
| N4.2 | Prefijo `/api/<contexto>/`: inglés (`catalog`, `media`, …). |
| N4.3 | Rutas de recurso en **inglés** (`/species`, `/provinces`, `/photos`, **`/trees`**, …). |
| N4.4 | Propiedades JSON: **inglés `camelCase`**; tabla de mapeo en [ADR-0007](../adr/0007-english-http-spanish-persistence.md). |
| N4.5 | Errores RFC 9457; `detail` en español para el usuario cuando aplique. |
| N4.6 | DTO de API separados de entidades JPA; mapeo BD español → JSON inglés en un solo lugar por operación. |

### Mapeo BD → JSON (resumen)

| SQL | JSON |
|-----|------|
| `nombre_comun` | `commonName` |
| `especie_id` | `speciesId` |
| `latitud` | `latitude` |
| `visibilidad_mapa_publico` | `publicMapVisibility` |
| `fotografia_id` | `photoId` |
| `ejemplar_id` | `treeId` |
| `nombre_fichero_original` | `originalFileName` |
| `es_principal` | `isPrimary` |

Lista completa (catálogo + media): ADR-0007.

**Prohibido en contrato:** `nombreComun` y `speciesId` en el mismo schema; **`ejemplarId`** en JSON; rutas API **`/api/.../ejemplares`**.

**Permitido en frontend:** variable local `treeId`, tipos `PublicTreeListItem` con campo **`treeId`** del wire; rutas SPA `/ejemplares` (no son contrato HTTP).

---

## 5. Kafka

| Código | Regla |
|--------|--------|
| N5.1 | Topics: `catalog.ejemplar.evento`, … |
| N5.2 | Payload: `snake_case` **español** (contrato interno, alineado a BD). |

---

## 6. Almacenamiento de objetos (MinIO / S3)

| Código | Regla |
|--------|--------|
| N6.1 | Prefijo `trees/{treeId}/...` |
| N6.2 | Sin prefijos legacy `trees/` |

---

## 7. Backend (Java)

| Código | Regla |
|--------|--------|
| N7.1 | Paquetes y clases en inglés; agregado de catálogo **`Ejemplar*`** alineado a OpenAPI (`EjemplarService`, `EjemplarRepository`). |
| N7.2 | Entidades: columnas español; atributos Java pueden reflejar dominio español o mapearse en DTO. |
| N7.3 | DTO REST: propiedades JSON y query de entrada en **inglés** según OpenAPI; mapper a criterios de persistencia en español/dominio. |
| N7.4 | Tests: `*Test` / `*IT`. |

---

## 8. Frontend (Vue 3 / TypeScript)

| Código | Regla |
|--------|--------|
| N8.1 | Componentes, composables y vistas: inglés; ficha = **`Tree` / `Trees`** (`useCreateTreeForm`, `CreateTreeView`, `TreesListView`). |
| N8.2 | Tipos TS: nombres de interfaz en inglés (`CreateTreeRequest`, `PublicTreeListItem`); **propiedades** iguales al OpenAPI (`treeId`, `commonName`, …). El nombre del schema OpenAPI puede ser `CreateEjemplarRequest` mientras el tipo TS sea `CreateTreeRequest`. |
| N8.3 | Texto visible: español vía **vue-i18n**. |
| N8.4 | `VITE_*`: inglés, sin secretos. |

---

## 9. Documentación

| Código | Regla |
|--------|--------|
| N9.1 | Nombre de fichero: inglés, `kebab-case`. |
| N9.2 | Contenido: **español**. |
| N9.3 | HU / ADR: convenciones existentes del repo. |

---

## 10. Git y producto

| Código | Regla |
|--------|--------|
| N10.1 | Ramas: `feature|fix|chore/...` — [github-branching.md](../onboarding/github-branching.md). |
| N10.2 | Copy de producto en español; identificadores de contrato según OpenAPI/ADR-0006 (`treeId`, rutas `/ejemplares` hasta revisión). |

---

## Checklist de auditoría

### Transversal
- [ ] **A1** Sin mezcla inglés/español en el mismo JSON de API.
- [ ] **A2** Sin `tree`/`arbol` legacy en contrato activo.
- [ ] **A3** OpenAPI actualizado si cambia contrato.

### Persistencia
- [ ] **B1** Columnas SQL en español.
- [ ] **B2** `@Column` = Flyway.

### API y código
- [ ] **C2** DTO JSON inglés homogéneo.
- [ ] **C3** Mapeo DTO ↔ entidad documentado o evidente en assembler.
- [ ] **D1** Paths API `/species`, `/trees`, … según ADR-0007 y [openapi.yaml](../api/openapi.yaml).
- [ ] **E1** Tipos frontend: props = OpenAPI; nombres de interfaz TS pueden usar prefijo `Tree` (§8.2).

### Documentación y Git
- [ ] **F1** Doc: nombre EN, contenido ES.
- [ ] **F2** Rama con prefijo correcto.

---

## Anti-patrones

1. Columna SQL nueva en inglés.
2. Mismo schema con `nombreComun` y `commonName`, o `speciesId` y `especieId`.
3. `ejemplarId` o rutas `/api/.../ejemplares` en **contrato**; `arbol` en BD o Kafka; `catalog.arbol.evento`.
4. Mezclar `Tree*` y `Ejemplar*` en el **mismo** módulo frontend (elegir convención §8).
5. Traducir columnas SQL al inglés “porque el código es en inglés”.
6. Secreto en `VITE_*`.

---

## Estado y trabajo previsto

**Norma de capas (este documento):** cerrada 2026-05-30.

**Cumplimiento en código (auditoría):** contrato JSON y persistencia según ADR-0007; sin `arbol` en productivo; frontend unificado en `Tree*`. Ver inventario y re-`rg` en [software-revisions/](../software-revisions/).

**Trabajo previsto (documentación y contrato, no bloquea la matriz anterior):**

| Prioridad | Tema | Acción |
|-----------|------|--------|
| 2 | [ADR-0006](../adr/0006-ejemplar-aggregate-http-kafka-naming.md) | **Hecho (2026-05-30):** título y fichero en inglés; BD/Mongo solo `ejemplar`; legacy `arbol` documentado como retirado. |
| 3 | [openapi.yaml](../api/openapi.yaml) | **Hecho (2026-05-30):** rutas `/trees`, propiedad `treeId`, prefijo MinIO `trees/`. |

---

## Referencias

- [ADR-0007](../adr/0007-english-http-spanish-persistence.md), [ADR-0006](../adr/0006-ejemplar-aggregate-http-kafka-naming.md)
- [canonical-sources.md](canonical-sources.md)
