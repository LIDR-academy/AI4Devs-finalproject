# Inventario de cumplimiento — naming conventions

| Metadato | Valor |
|----------|--------|
| **Rama** | `chore/revision-entrega-dos` |
| **Fecha** | 2026-05-30 |
| **Norma** | [naming-conventions.md](../engineering/naming-conventions.md), [ADR-0006](../adr/0006-ejemplar-nomenclature-contracts.md), [ADR-0008](../adr/0008-english-http-spanish-persistence.md) |
| **Alcance** | Código, contrato OpenAPI, tests; backlog histórico aparte |

> **Actualización (ADR-0008):** La norma de contrato es **HTTP en inglés homogéneo** + **BD en español** + mapeo en DTO. [ADR-0007](../adr/0007-spanish-http-contracts.md) queda obsoleta.
>
> **Implementación (2026-05-30):** alineadas respuestas públicas/colaborador, `names` en provincias públicas, `photoId` en media; rutas `/species` y escritura sin cambio. Pendiente opcional: query params `estado`/`visibilidad`, campos español en confirmación media (`nombreFicheroOriginal`, …), maestros taxonómicos internos (proyección → `label`).

## Resumen ejecutivo (criterio ADR-0008)

| Área | Estado | Notas |
|------|--------|--------|
| PostgreSQL (Flyway `catalog`) | **C** | Tablas/columnas en español |
| Kafka (topic y payload) | **C** | Español `snake_case` (contrato interno) |
| Rutas `/species`, `/provinces`, `/photos`, `speciesId`, `latitude` | **C** | Ya inglés; **no renombrar** |
| Rutas `/ejemplares`, `ejemplarId` | **C** | ADR-0006; término de producto |
| JSON mixto (inglés + español en mismo flujo) | **NC** | p. ej. alta `speciesId` vs lectura `nombreComun` |
| OpenAPI esquemas de lectura pública/colaborador | **NC** | Campos español en JSON → inglés (`commonName`, `visibility`, …) |
| DTO salida / proyecciones SQL alias | **NC** | Alinear alias a inglés o mapear en assembler |
| Frontend tipos y vistas | **NC** | Tipos con `nombreComun`, `latitud`, … |
| `fotografiaId` vs `photoId` | **NC menor** | Unificar a `photoId` en JSON |
| MinIO tests `trees/42` | **NC menor** | Mock legacy |
| Código `Tree*`, variables `treeId` internas | **Aceptable** | Capa técnica inglés |

**Prioridad (mínimo impacto):** **1** OpenAPI respuestas + tabla mapeo → **2** DTO/proyecciones salida catalog/media → **3** tipos frontend → **4** tests/E2E. **No** migrar `/species` ni renombrar maestros ya en inglés.

---

## Cumplimientos destacados (no requieren cambio por nomenclatura)

- `services/catalog-service/src/main/resources/db/migration/V1__baseline.sql` — esquema en español.
- Controladores de ejemplar: `/api/catalog/ejemplares`, `{ejemplarId}`.
- Media sobre ejemplar: `/api/media/ejemplares/{ejemplarId}/photos` (segmento `ejemplares` correcto).
- Respuestas media con `fotografiaId`, `arbolId` → ya `ejemplarId` en tipos (`frontend/src/types/media.ts`).
- Kafka: propiedad `ejemplar-evento-topic`, topic `catalog.ejemplar.evento`.
- Lecturas públicas en OpenAPI: `nombreComun`, `visibilidad`, `latitud`/`longitud` en varios esquemas de detalle/listado público.

---

## NC-1 — Contrato OpenAPI: JSON en español en respuestas — **Alta**

**Checklist:** A1, D1 (criterio ADR-0008).

**No es deuda (mantener):** paths `/species`, `/provinces`, `/families`, `/genera`, `/photos`, params `speciesId`, `CreateEjemplarRequest` en inglés.

### Propiedades JSON a homogeneizar → inglés (muestra)

| En OpenAPI hoy (español) | Objetivo (inglés) | Columna SQL |
|--------------------------|-------------------|-------------|
| `nombreComun` | `commonName` | `nombre_comun` |
| `nombreCientifico` (si aparece) | `scientificName` | `nombre_cientifico` |
| `visibilidad` | `visibility` (o nombre acordado en ADR-0008) | según esquema |
| `latitud` / `longitud` | `latitude` / `longitude` | `latitud` / `longitud` |
| `fotografiaId` (donde no sea path) | `photoId` | `fotografia_id` |
| `etiquetaEspecie` / labels derivados | `speciesLabel` / `label` | lectura |

**Coherencia:** eliminar mezcla `speciesId` + `nombreComun` en esquemas del mismo flujo.

---

## NC-2 — Backend catalog-service: salidas y mapeo — **Media**

**Checklist:** C2, C3.

| Fichero | Incumplimiento (ADR-0008) |
|---------|---------------------------|
| `dto/CollaboratorEjemplarListItemDto.java`, `CollaboratorEjemplarDetailDto.java` | Verificar serialización JSON; alinear con OpenAPI inglés |
| `infrastructure/.../CollaboratorEjemplarReadRepository.java` | Alias nativos: unificar criterio (alias inglés en SQL o mapeo en servicio) |
| DTO de lectura pública en OpenAPI / controllers de detalle | Campos español en JSON si persisten |

**Conformes (no tocar en limpieza de rutas):** `CatalogSpeciesController`, `CatalogMastersController`, `CreateEjemplarRequest`, `CatalogSecurityConfig` matchers en inglés.

**Tests afectados:** lecturas colaborador/público, `CollaboratorEjemplarQueryServiceTest`, WebMvc de detalle/listado según campos renombrados en JSON.

---

## NC-3 — Backend media-service — **Baja**

**Checklist:** A1.

| Fichero | Incumplimiento |
|---------|----------------|
| Respuestas con `fotografiaId` en JSON donde el estándar sea `photoId` | Unificar con path `/photos/{photoId}` |

**Conformes:** rutas `/photos`, `ejemplares/{ejemplarId}`.

---

## NC-4 — Frontend: tipos con campos español en API — **Alta**

**Checklist:** E1, A1.

| Ámbito | Ficheros principales |
|--------|----------------------|
| Tipos | `src/types/catalog.ts` — `nombreComun`, `latitud`, … |
| Vistas / composables de lectura | `EjemplaresDetailView.vue`, `useEditEjemplarForm.ts`, listados que lean `nombreComun` |
| Servicios | Ajustar solo donde consuman props renombradas en OpenAPI |

**Conformes:** `adminTaxonomy.ts`, `useCreateEjemplarForm.ts` (escritura ya en inglés), servicios que llaman `/species`.

**Aceptable:** `TreePhoto*`, `createTreeFormValidation`, `treeId` como variable local.

---

## NC-5 — E2E y gateway — **C** (paths inglés)

Sin cambio de rutas previsto bajo ADR-0008. Actualizar aserciones JSON solo si cambian nombres de propiedades en respuestas.

---

## NC-6 — Documentación operativa — **Baja**

| Fichero | Nota |
|---------|------|
| `services/README.md` | Mención clave legacy `arbol-evento-topic` (valor correcto documentado) |
| Inventario / ADR-0007 | Histórico; criterio vigente ADR-0008 |

---

## NC-7 — Anti-patrones puntuales — **Baja**

| Ubicación | Detalle |
|-----------|---------|
| `frontend/.../TreePhotoFullscreenViewer.test.ts` | URL mock `.../trees/42/...` (MinIO legacy ADR-0006) |
| `services/catalog-service/.../EjemplarMediaSubmissionPermissionServiceTest.java` | método `arbolInexistente_*` (solo nombre de test) |
| `services/catalog-service/.../EjemplarCreationServiceTest.java` | variable `arbolCaptor` (interno) |

---

## Matriz checklist global (auditoría estática)

| ID | Resultado | Comentario |
|----|-----------|------------|
| A1 | NC | Mezcla `speciesId` + `nombreComun` (y similares) en API |
| A2 | C | Sin `tree`/`arbol` en contrato productivo |
| B1 | C | SQL en español |
| C2 | NC | Respuestas JSON no homogéneas en inglés |
| D1 | C | Paths maestros y `/ejemplares` conformes ADR-0008 |
| D2 | C | Kafka español (interno) |
| E1 | NC | Tipos frontend con props español en API |
| F1 | C | Docs normativas actualizadas |

---

## Orden sugerido de PRs (paso 3, mínimo impacto)

1. **PR-A — OpenAPI:** renombrar props de **respuesta** a inglés; mantener paths.
2. **PR-B — catalog-service:** DTO salida, proyecciones, assemblers; `CreateEjemplarRequest` sin cambios de nombre.
3. **PR-C — media:** `fotografiaId` → `photoId` en JSON si aplica.
4. **PR-D — frontend:** `types/catalog.ts`, vistas de detalle/listado público.
5. **PR-E — tests** + mock MinIO sin `trees/`.

**Ruptura acotada:** clientes que lean `nombreComun` / `latitud` en JSON; rutas y alta (`speciesId`) estables.

---

## Comandos útiles para re-auditar

```bash
# Mezcla: propiedades españolas en JSON de API (deuda ADR-0008)
rg -n "nombreComun|nombreCientifico|\"visibilidad\"|\"latitud\"|\"longitud\"|fotografiaId" \
  --glob "*.{java,ts,vue,yaml}" --glob "!docs/**"

# Legacy prohibido
rg -n "treeId|/trees|catalog\.arbol|arbolId" --glob "*.{java,ts,vue,yaml,properties}"
```

Criterio de cierre (ADR-0008): sin legacy; sin propiedades españolas en esquemas OpenAPI/DTO REST de salida (salvo `ejemplarId` / rutas `ejemplares`).
