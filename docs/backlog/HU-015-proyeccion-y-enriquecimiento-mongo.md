# HU-015 — Proyección y enriquecimiento Mongo

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | *Proyección y enriquecimiento Mongo* — alineado con [mongo.md](../data-model/mongo.md) y readme §3.2 (Mongo como enriquecimiento; PostgreSQL como autoridad). |
| **Formato “Como… quiero… para…”** | Definido en [backlog.md](backlog.md) §3. |
| **Estimación (S/M/L)** | **L** — primera entrega con colecciones, sincronización/proyección desde SQL y criterios de invalidación. |
| **Prioridad** | **Media** — pospuesta explícitamente en backlog §4–§5 respecto al MVP de consulta/alta; desbloquea búsquedas enriquecidas sin sustituir el maestro relacional. |
| **Inconsistencias detectadas** | No existe caso de uso independiente en [use-case-summary.md](../use-cases/use-case-summary.md); la historia agrupa trabajo técnico de **catalog-service** documentado en readme y `mongo.md`. |
| **Tamaño / división** | Historia grande; conviene desglosar en tickets tras refinamiento detallado (proyección mínima de especie vs. notas de ejemplar, eventos de sincronización). |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-015 |
| **Épica** | Catálogo colaborador |
| **Título** | Proyección y enriquecimiento Mongo |
| **Estimación de complejidad** | L |
| **Prioridad** | Media |

**Historia de usuario**

Como responsable del catálogo, quiero mantener en MongoDB proyecciones y enriquecimientos alineados con el maestro PostgreSQL de especies y árboles, para consultas y notas semiestructuradas sin duplicar la autoridad relacional.

- **Entregable de la historia:** Colecciones y acceso Mongo en **catalog-service** según [mongo.md](../data-model/mongo.md) (`especie_detalle`, `ejemplar_detalle` / enriquecimientos), con **proyección mínima** desde SQL (p. ej. nombres de especie desnormalizados) y estrategia documentada de **actualización o invalidación** cuando cambien datos maestros u operativos en Postgres. PostgreSQL sigue siendo *system of record*; Mongo es *system of enrichment*.

### Alcance

#### Incluye

- Modelo de documentos, índices y validación acordados en `mongo.md`.
- Sincronización o proyección en **alta/edición** de árbol y en cambios de maestros que afecten a campos desnormalizados (criterio a cerrar en desglose).
- Enlaces por PK numérica SQL (`especie_pg_id`, `ejemplar_pg_id`).
- Pruebas de integración con Testcontainers Mongo donde aporte valor.

#### Queda fuera de esta historia

- Sustituir consultas públicas **HU-002** / **HU-003** por lectura solo Mongo (pueden seguir en SQL en MVP).
- CRUD colaborador de ficha (**HU-005**, **HU-008**) salvo los **hooks** de proyección que esta HU defina.
- Gestión de maestros taxonómicos (**HU-011**) más allá del efecto en invalidación de proyección.

### Dependencias

- **HU-005** / **HU-008:** eventos de negocio en catálogo que disparan proyección.
- Infra **MongoDB** en Compose operativa.
- [mongo-hybrid.mdc](../../.cursor/rules/mongo-hybrid.mdc) y [ADR-0002](../adr/0002-claves-primarias-numericas-frente-a-uuid.md).

### Decisiones de refinamiento (registro)

- **Borrado de árbol (HU-008):** **eliminación física** de documentos de enriquecimiento del ejemplar en Mongo (no tombstone). Implementación en **[TASK-HU-015-01](HU-015-ticket-breakdown.md)** — **Pendiente** hasta existir capa Mongo; **HU-008** debe invocar el hook acordado (stub/no-op documentado si aplica).

### Aclaraciones pendientes (refinamiento)

- Alcance del **primer corte** de proyección: solo `especie_detalle`, solo notas de ejemplar, o ambos.
- Mecanismo de sync en alta/edición: síncrono en transacción, asíncrono post-commit o batch.

### Referencia

Desglose inicial: [HU-015-ticket-breakdown.md](HU-015-ticket-breakdown.md). Refinamiento completo (skill `hu-refinement-mtl`) cuando el equipo priorice la historia.
