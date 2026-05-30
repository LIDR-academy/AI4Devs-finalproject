# Auditoría MongoDB — nomenclatura y alineación con ADR-0007

| Metadato | Valor |
|----------|--------|
| **Fecha** | 2026-05-30 |
| **Norma** | [mongo.md](../data-model/mongo.md), [ADR-0006](../adr/0006-ejemplar-aggregate-http-kafka-naming.md), [ADR-0007](../adr/0007-english-http-spanish-persistence.md), [naming-conventions.md](../engineering/naming-conventions.md) §3 |
| **Alcance** | Diseño documentado, skill Cursor, stubs en `catalog-service`; sin `@Document` en código aún (HU-015 pendiente) |

## Resumen ejecutivo

| Dimensión | Resultado | Notas |
|-----------|-----------|--------|
| Autoridad SQL vs Mongo | ✅ | PostgreSQL = *system of record*; Mongo = enriquecimiento |
| Nombres de colección | ✅ | Canónico: `especie_detalle`, `ejemplar_detalle` ([mongo.md](../data-model/mongo.md)) |
| Campos de negocio | ✅ | Español `snake_case`; enlaces `especie_pg_id`, `ejemplar_pg_id` |
| `_id` | ✅ | Entero = PK PostgreSQL (no `ObjectId` ni prefijos `esp_`/`eje_`) |
| Código Java Mongo | ⚠️ | Solo placeholders + `NoOpEjemplarEnrichmentDeletionPort` (HU-015) |
| Contrato HTTP sobre Mongo | — | Sin endpoints en OpenAPI; futuro: JSON inglés ↔ documento español (ADR-0007) |
| Skill `db-mongo-mtl` | ❌→✅ | Desalineada con `mongo.md`; **corregida** en esta revisión |
| Infra Compose | ⚠️ | Mongo 7 sin init de colecciones/índices (aceptable hasta HU-015) |

**Conclusión:** el **diseño** en `mongo.md` cumple N2.1/N2.2 y ADR-0007 (persistencia en español). No hay documentos ni repositorios productivos que contradigan la norma. La deuda es **implementación** (HU-015/HU-016), no renombrado de colecciones.

---

## 1. Colecciones y campos (vs `mongo.md`)

### `especie_detalle`

| Campo | Idioma / forma | ADR-0007 | Observación |
|-------|----------------|----------|-------------|
| `_id`, `especie_pg_id` | Técnico + enlace PG | Persistencia | `_id` = `especie_pg_id` (int) |
| `nombre_cientifico`, `nombre_comun` | Español | Persistencia | Desnormalización explícita para búsqueda texto |
| `sinonimos`, `distribucion`, `datos_ecologicos`, `referencias` | Español | Persistencia | Subcampos en ejemplos JSON en español (`habitat`, `continentes`, …) |
| Subobjetos LLM (§6) | Español en prompt | Persistencia | Validación de claves raíz en español |

### `ejemplar_detalle`

| Campo | Idioma / forma | ADR-0007 | Observación |
|-------|----------------|----------|-------------|
| `_id`, `ejemplar_pg_id`, `especie_pg_id` | Enlace PG | Persistencia | Un documento por ejemplar; observaciones **embebidas** |
| `medidas`, `estado_sanitario`, `etiquetas`, `observaciones` | Español | Persistencia | `observacion`: `fecha`, `texto`, `autor`, `condiciones` |
| Sin `arbol_*` / `tree_*` | — | ADR-0006 | Modelo ya usa `ejemplar_pg_id` |

No se detectan campos de negocio en inglés en los ejemplos normativos de `mongo.md`.

---

## 2. Código en repositorio

| Ubicación | Estado |
|-----------|--------|
| `infrastructure/persistence/mongo/{document,repository,config}/.gitkeep` | Estructura preparada; sin clases |
| `EjemplarEnrichmentDeletionPort` + `NoOpEjemplarEnrichmentDeletionPort` | Stub HU-015-01; log coherente (`treeId`) |
| `pom.xml` / dependencia Mongo en BOM | Presente en árbol efectivo; **sin** `spring-boot-starter-data-mongodb` activo en módulo según corte actual |
| OpenAPI | Sin rutas que lean/escriban Mongo directamente |

**Criterio HU-015 al implementar:**

- `@Document(collection = "especie_detalle")` / `"ejemplar_detalle"`.
- `@Field` o nombres de propiedad Java alineados a claves BSON en español (`nombreComun` solo si `@Field("nombre_comun")`).
- `_id` tipo `Integer` o `Long`, no `ObjectId`.
- API futura (HU-016): DTO en inglés; mapper documento ↔ JSON (misma regla que catálogo SQL).

---

## 3. Coherencia documental (hallazgos cerrados)

| ID | Severidad | Hallazgo | Acción |
|----|-----------|----------|--------|
| M-1 | ❌ | Skill `db-mongo-mtl` citaba `enriquecimientos_especie` / `enriquecimientos_ejemplar` y `_id` string `esp_`/`eje_`+ULID | Actualizar skill → `especie_detalle` / `ejemplar_detalle` y `_id` numérico |
| M-2 | ⚠️ | Skill §5 decía “no duplicar nombres de especie” sin matizar | Ajustar: permitir `nombre_cientifico` / `nombre_comun` desnormalizados según `mongo.md` |
| M-3 | ⚠️ | Sin scripts de índices en `infra/` | Dejar para HU-015 (índices en `mongo.md` §4) |

---

## 4. Matriz checklist (naming §3)

| ID | Resultado | Comentario |
|----|-----------|------------|
| N2.1 | C | Campos de negocio en español en diseño |
| N2.2 | C | `ejemplar_pg_id` / `especie_pg_id` |
| A2 (ADR-0007) | C | Sin mezcla inglés/español en un mismo documento de persistencia |
| ADR-0006 | C | Sin `arbol` en modelo Mongo |

---

## 5. Pendiente de implementación (no de nomenclatura)

1. **HU-015** — Documentos Spring Data, proyección SQL→Mongo, borrado real en `EjemplarEnrichmentDeletionPort`.
2. **HU-016** — Escritura/lectura `especie_detalle` vía ai-assistant; contrato HTTP en inglés con mapeo.
3. **Infra** — Opcional: job init con índices de `mongo.md` §4 al desplegar entorno dev.

---

## Referencias cruzadas

- Inventario global: [2026-05-30-naming-conventions-audit-inventory.md](2026-05-30-naming-conventions-audit-inventory.md) (Mongo marcado **C** tras esta auditoría).
- Skill validador: [.cursor/skills/db-mongo-mtl/SKILL.md](../../.cursor/skills/db-mongo-mtl/SKILL.md).
