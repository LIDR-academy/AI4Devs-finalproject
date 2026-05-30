# Naming conventions (MyTreeLibrary)

Guía estable y auditable de nomenclatura en el monorepo. Complementa [AGENTS.md](../../AGENTS.md) sin sustituir los ADR ni el contrato OpenAPI.

## Justificación

Los criterios **conjugan buenas prácticas de ingeniería** con las premisas del producto (dominio y documentación en castellano; proyecto no internacional en el MVP).

### Persistencia en castellano

Tablas y columnas en español porque:

- El modelo se acuerda con el cliente y el negocio **en español**; la BD es la **fuente de verdad** que deben leer informes, auditorías y el propio equipo sin glosario paralelo.
- Traducir columnas al inglés sin necesidad real de mercado internacional introduce **etiquetas mal traducidas** y aleja el esquema del lenguaje de los casos de uso y de las HUs.

### Contrato HTTP en inglés (opción B, [ADR-0008](../adr/0008-english-http-spanish-persistence.md))

Rutas y propiedades JSON en **inglés homogéneo** porque:

- Encaja con el **código** (Java/TypeScript, OpenAPI) y con lo **ya desplegado** en escritura (`speciesId`, `/species`), con **menor impacto** que españolizar todo el wire format.
- La traducción dominio → cliente HTTP se concentra en **DTO/assembler** (un mapa, una responsabilidad), no dispersa en plantillas ni en SQL.

### ¿Es incongruente BD en español y API en inglés?

Puede **parecer** disparato; en este proyecto es **deliberado** y no es mezcla aleatoria:

- **Un idioma por frontera:** español en SQL (y Kafka interno); inglés en cada JSON de API. Entre fronteras, [tabla de mapeo en ADR-0008](../adr/0008-english-http-spanish-persistence.md).
- **Públicos distintos:** la BD habla al dominio durable; la API habla al consumidor técnico (SPA, tests, herramientas).
- Lo prohibido es la **mezcla dentro del mismo JSON** (`speciesId` + `nombreComun`), no tener URL en inglés y columna `nombre_comun`.

Argumentación ampliada: [ADR-0008 § «Por qué BD en castellano y HTTP en inglés»](../adr/0008-english-http-spanish-persistence.md).

### Otros

- **Documentación:** contenido en español; nombres de fichero en inglés (convención del repo).
- **`ejemplar` / `ejemplarId`:** término de producto ([ADR-0006](../adr/0006-ejemplar-nomenclature-contracts.md)), no traducción forzada al inglés.

## Precedencia

1. ADR aceptado (0006, 0008; 0007 obsoleta).
2. [openapi.yaml](../api/openapi.yaml) y [kafka-events.md](../events/kafka-events.md).
3. Este documento.
4. Reglas Cursor (`.cursor/rules/*.mdc`).

**Código nuevo:** cumple la norma. **Deuda:** JSON mixto inglés/español en el mismo esquema; ver inventario de auditoría.

---

## 1. Principios transversales

| Código | Regla |
|--------|--------|
| P1 | **Persistencia y documentación de dominio:** español. |
| P2 | **Código y contrato HTTP:** inglés en identificadores técnicos (clases, paths de recurso, propiedades JSON), salvo **`ejemplar`** acordado en ADR-0006. |
| P3 | **Un concepto, un nombre por frontera;** entre fronteras, mapeo explícito (DTO/assembler), no mezcla en un mismo JSON. |
| P4 | Valores de enumeración: códigos de dominio (`BORRADOR`, `PUBLICADO`, …), sin traducir. |

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
| N2.2 | Enlace a PostgreSQL: `ejemplar_pg_id`. |

---

## 4. API REST (OpenAPI)

| Código | Regla |
|--------|--------|
| N4.1 | Fuente de verdad: [openapi.yaml](../api/openapi.yaml); [api-design.mdc](../../.cursor/rules/api-design.mdc). |
| N4.2 | Prefijo `/api/<contexto>/`: inglés (`catalog`, `media`, …). |
| N4.3 | Rutas de recurso: **inglés** (`/species`, `/provinces`, `/photos`, …) y **`/ejemplares`** (ADR-0006). |
| N4.4 | Propiedades JSON: **inglés `camelCase`**; tabla de mapeo en [ADR-0008](../adr/0008-english-http-spanish-persistence.md). |
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
| `ejemplar_id` | `ejemplarId` |

Lista completa: ADR-0008.

**Prohibido:** `nombreComun` y `speciesId` en el mismo schema; `treeId`, `/trees`.

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
| N6.1 | Prefijo `ejemplares/{ejemplarId}/...` |
| N6.2 | Sin prefijos legacy `trees/` |

---

## 7. Backend (Java)

| Código | Regla |
|--------|--------|
| N7.1 | Paquetes y clases: inglés (`EjemplarService`). |
| N7.2 | Entidades: columnas español; atributos Java pueden reflejar dominio español o mapearse en DTO. |
| N7.3 | DTO REST: propiedades JSON en **inglés** según OpenAPI. |
| N7.4 | Tests: `*Test` / `*IT`. |

---

## 8. Frontend (Vue 3 / TypeScript)

| Código | Regla |
|--------|--------|
| N8.1 | Componentes/composables: inglés técnico (`useCreateEjemplarForm`). |
| N8.2 | Tipos de API: **inglés**, iguales a OpenAPI. |
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
| N10.2 | Copy de producto en español; identificadores técnicos `ejemplar` en API según ADR-0006. |

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
- [ ] **D1** Paths `/species`, `/ejemplares`, … según ADR-0008.
- [ ] **E1** Tipos frontend = OpenAPI.

### Documentación y Git
- [ ] **F1** Doc: nombre EN, contenido ES.
- [ ] **F2** Rama con prefijo correcto.

---

## Anti-patrones

1. Columna SQL nueva en inglés.
2. Mismo schema con `nombreComun` y `commonName`, o `speciesId` y `especieId`.
3. `treeId`, `/trees`, `catalog.arbol.evento`.
4. Traducir columnas SQL al inglés “porque el código es en inglés”.
5. Secreto en `VITE_*`.

---

## Deuda de implementación

Tras ADR-0008, la deuda principal es **homogeneizar respuestas** (y tipos frontend) que aún serializan español en JSON, no renombrar `/species` ni `speciesId`. Inventario: [2026-05-30-naming-conventions-audit-inventory.md](../software-revisions/2026-05-30-naming-conventions-audit-inventory.md) (actualizar criterio según ADR-0008).

---

## Referencias

- [ADR-0008](../adr/0008-english-http-spanish-persistence.md), [ADR-0006](../adr/0006-ejemplar-nomenclature-contracts.md)
- [canonical-sources.md](canonical-sources.md)
