# Inventario de cumplimiento — naming conventions

| Metadato | Valor |
|----------|--------|
| **Rama** | `chore/revision-entrega-dos` |
| **Fecha** | 2026-05-30 (cierre inventario + limpieza menor) |
| **Norma** | [naming-conventions.md](../engineering/naming-conventions.md), [ADR-0006](../adr/0006-ejemplar-aggregate-http-kafka-naming.md), [ADR-0007](../adr/0007-english-http-spanish-persistence.md) |
| **Alcance** | Código productivo, contrato OpenAPI, tests; backlog HU alineado en contratos HTTP |

> **Definición cerrada (2026-05-30):** [ADR-0007](../adr/0007-english-http-spanish-persistence.md) + [naming-conventions.md](../engineering/naming-conventions.md). HTTP (JSON, query, `sort`) en inglés; persistencia y tokens internos de consulta en español/dominio; mapeo en DTO/servicio (`PublicEjemplarQueryMapper`, DTO de salida media/catálogo).
>
> **Auditoría nomenclatura cerrada (2026-05-30):** Mongo, re-`rg`, ADR-0006, OpenAPI `/trees` + `treeId`. **Matriz:** [naming-conventions.md](../engineering/naming-conventions.md).

## Resumen ejecutivo

| Área | Estado | Notas |
|------|--------|--------|
| PostgreSQL (Flyway `catalog`) | **C** | Tablas/columnas en español |
| Kafka (topic y payload) | **C** | Español `snake_case`; props `ejemplar-evento-topic` |
| Rutas `/species`, `/provinces`, `/photos`, `speciesId` | **C** | ADR-0007 |
| Rutas `/ejemplares`, `treeId` | **C** | ADR-0006 |
| OpenAPI + DTO lectura catálogo (público/colaborador) | **C** | `commonName`, `publicationState`, `latitude`, … |
| OpenAPI + DTO media (presign, confirm, galería) | **C** | `originalFileName`, `isPrimary`, `uploadedAt`, … |
| Query/sort listado público (wire HTTP) | **C** | `species`, `publicationState`, `species,asc` |
| Mapeo query → persistencia (listado público) | **C** | `PublicEjemplarListQuery` → `PublicEjemplarQueryMapper` → repo (`especie`, `estado`, …) |
| Frontend tipos API | **C** | `types/catalog.ts`, `types/media.ts` |
| Proyecciones SQL maestros (`nombreComun` alias) | **Aceptable** | Interno; API con `label` / `scientificName` |
| Entidades JPA (`nombreComun`, `nombreFicheroOriginal`, …) | **Aceptable** | Dominio/persistencia en español |
| Código `Tree*` (componentes/composables) | **Aceptable** | Capa técnica inglés |
| MinIO mock `trees/` en tests | **C** | Corregido a `ejemplares/` |
| Tests `arbol*` en identificadores | **C** | Renombrados a `ejemplar*` |
| `services/README.md` Kafka | **C** | Clave `ejemplar-evento-topic` |
| Backlog HU (contratos HTTP citados) | **C** | HU-002/003 actualizadas; resto coherente o solo lenguaje producto |
| MongoDB | **C** | Diseño `mongo.md` conforme; sin `@Document` aún; skill alineada; ver [mongo audit](2026-05-30-mongo-naming-audit.md) |

---

## Capas del listado público (referencia)

| Capa | Ejemplo |
|------|---------|
| HTTP | `?species=Quercus&sort=species,asc` |
| DTO entrada | `PublicEjemplarListQuery` |
| Mapper | `species` → criterio; `sort` → `especie` + `asc` |
| Repositorio / SQL | `:especie`, `CASE WHEN :sortField = 'especie'` |
| JSON salida | `commonName`, `sort` eco `species,asc` |

---

## NC cerrados (histórico de la revisión)

- NC-1 a NC-5: catálogo, media, query HTTP, mapper interno.
- NC-6 / NC-7: README Kafka, mock MinIO, nombres de test, backlog HU-002/003.

---

## Matriz checklist global

| ID | Resultado | Comentario |
|----|-----------|------------|
| A1 | C | Sin mezcla inglés/español en JSON de API |
| A2 | C | Sin `tree`/`arbol` en contrato productivo |
| B1 | C | SQL en español |
| C2 | C | DTO REST JSON inglés |
| C3 | C | Mapeo concentrado (mapper + proyecciones) |
| D1 | C | Paths conformes ADR-0006/0007 |
| D2 | C | Kafka español (interno) |
| E1 | C | Tipos frontend = OpenAPI |
| F1 | C | Docs normativas + inventario + backlog clave |
| G1 | C | Re-auditoría `rg` — ver [2026-05-30-naming-conventions-rg-reaudit.md](2026-05-30-naming-conventions-rg-reaudit.md) |

---

## Re-auditoría `rg` (archivo)

Comandos, resultados y veredicto: [2026-05-30-naming-conventions-rg-reaudit.md](2026-05-30-naming-conventions-rg-reaudit.md).

**Criterio de cierre código (ADR-0007):** cumplido en el corte auditado (2026-05-30).
