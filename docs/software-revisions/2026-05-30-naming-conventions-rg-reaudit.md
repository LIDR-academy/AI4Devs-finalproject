# Re-auditoría `rg` — nomenclatura (punto 6)

| Metadato | Valor |
|----------|--------|
| **Fecha** | 2026-05-30 |
| **Norma** | [ADR-0007](../adr/0007-english-http-spanish-persistence.md), [ADR-0006](../adr/0006-ejemplar-aggregate-http-kafka-naming.md), [naming-conventions.md](../engineering/naming-conventions.md) |
| **Inventario** | [2026-05-30-naming-conventions-audit-inventory.md](2026-05-30-naming-conventions-audit-inventory.md) |
| **Entorno** | Windows; `rg` no en PATH del shell → búsqueda equivalente (ripgrep del IDE / herramienta de proyecto) |

## Criterio de cierre (ADR-0007)

- Sin legacy `tree` / `arbol` en **contrato activo** (OpenAPI, rutas, Kafka productivo, JSON/DTO REST).
- Sin propiedades **españolas** en wire API (OpenAPI + tipos TS de cliente + DTO REST expuestos).
- Query/sort HTTP en **inglé**; persistencia y dominio JPA en **español** (aceptable).

**Veredicto global:** **CUMPLE** para código productivo y contrato OpenAPI.

---

## Comandos de referencia (inventario)

```bash
rg -n "nombreFicheroOriginal|tipoMime|tamanoBytes|esPrincipal|subidaEn" \
  --glob "*.{java,ts,vue,yaml}" --glob "!docs/**"

rg -n "nombreComun|fotografiaId" --glob "*.{ts,vue,yaml}" --glob "!docs/**"

rg -n "treeId|/trees/|catalog\.arbol|arbolId" --glob "*.{java,ts,vue,yaml,properties}"
```

---

## 1. Propiedades españolas en wire API

### 1.1 `nombreFicheroOriginal|tipoMime|tamanoBytes|esPrincipal|subidaEn`

| Ubicación | Archivos | Veredicto |
|-----------|----------|-----------|
| `services/media-service/.../Fotografia.java` | Entidad JPA / dominio | ✅ Esperado (persistencia) |
| OpenAPI `docs/api/openapi.yaml` | — | ✅ Sin coincidencias en nombres de propiedad |
| DTO `services/**/dto/**` | `originalFileName`, `mimeType`, `sizeBytes`, `isPrimary`, `uploadedAt` | ✅ Inglés |
| `frontend/src/types/media.ts` | Igual que DTO | ✅ Inglés |

**Resultado:** sin fuga de nombres españoles al contrato HTTP de media.

### 1.2 `nombreComun|fotografiaId` en `*.{ts,vue,yaml}` (excl. docs)

| Ámbito | Coincidencias |
|--------|----------------|
| `frontend/src/types`, vistas, composables API | **0** |
| OpenAPI (propiedades de esquema) | `commonName`, `photoId`, `speciesId` |

**Resultado:** tipos de cliente alineados con ADR-0007.

---

## 2. Legacy prohibido (`treeId`, `/trees/`, `catalog.arbol`, `arbolId`)

| Patrón | Código productivo | Notas |
|--------|-------------------|--------|
| `catalog.arbol` / `arbolId` | **0** en `services/**`, `frontend/src/**`, `*.properties` | Kafka: `catalog.ejemplar.evento`, `ejemplar-evento-topic` |
| `/trees/` en rutas API o router | **0** | Rutas `/ejemplares`, `/api/catalog/trees`, media `/ejemplares/{treeId}` |
| `treeId` en contrato | **0** en tipos/OpenAPI/DTO | |

### Hallazgos no bloqueantes (capa técnica / UI)

| ID | Severidad | Ubicación | Descripción |
|----|-----------|-----------|-------------|
| RG-1 | Aceptable | `frontend/src/views/TreesListView.vue`, `MyTreesListView.vue` | Función interna `getTreeCardImageSrc(treeId)`; el valor pasado es `tree.ejemplarId` |
| RG-2 | Aceptable | Componentes `TreePhoto*`, `TreeLocation*`, composables `createTreeFormValidation`, `treePhotoFileValidation` | Nombres de capa UI en inglés; sin impacto en contrato |
| RG-3 | Cerrado | `TreeDeleteServiceTest` (métodos en inglés; sin `arbol`) | Renombrado |
| RG-4 | Doc | `readme.md`, `HU-008` | Cita obsoleta `NoOpTreeEnrichmentDeletionPort` → corregido a `NoOpEjemplarEnrichmentDeletionPort` |

### Documentación histórica

`docs/events/kafka-events.md` tabla de migración `catalog.arbol.evento` → `catalog.ejemplar.evento`: **aceptable** (trazabilidad, no contrato activo).

---

## 3. Comprobaciones ampliadas (misma sesión)

| Comprobación | Resultado |
|--------------|-----------|
| `@JsonProperty` español en DTO REST | **0** |
| Propiedades raíz españolas en `openapi.yaml` | **0** (descripciones mencionan `especie_id` como mapeo BD, no como nombre JSON) |
| `PublicEjemplarListQuery` / controladores | Query en inglés (`species`, `publicationState`, …) |
| `PublicEjemplarReadRepository` | Tokens internos `especie`, `estado` (no `species` en SQL) |
| Payload Kafka en `catalog-service` main | Sin `arbol` / `ARBOL_` en Java productivo |

---

## 4. Matriz de cierre

| ID inventario | Post re-auditoría |
|---------------|-------------------|
| A1, A2 | C |
| B1, C2, C3, D1, D2, E1, F1 | C (sin cambio) |
| Mongo (N2) | C (auditoría previa [mongo audit](2026-05-30-mongo-naming-audit.md)) |
| Punto 6 `rg` | **C** |

---

## 5. Re-ejecución local

En máquinas con [ripgrep](https://github.com/BurntSushi/ripgrep) instalado, desde la raíz del repo:

```bash
rg -n "nombreFicheroOriginal|tipoMime|tamanoBytes|esPrincipal|subidaEn" \
  --glob "*.{java,ts,vue,yaml}" --glob "!docs/**"

rg -n "nombreComun|fotografiaId" --glob "*.{ts,vue,yaml}" --glob "!docs/**"

rg -n "treeId|/trees/|catalog\.arbol|arbolId" --glob "*.{java,ts,vue,yaml,properties}"
```

Interpretación: dominio JPA y entidades `Fotografia` pueden coincidir en el primer comando; no deben aparecer en `dto/**` ni en `frontend/src/types` como contrato. El tercer comando no debe devolver rutas `/trees/` ni `catalog.arbol` en `services/` ni `frontend/src/`.
