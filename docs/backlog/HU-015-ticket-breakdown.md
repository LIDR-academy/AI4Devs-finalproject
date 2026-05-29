# HU-015 — Desglose en tickets (proyección y enriquecimiento Mongo)

| Campo | Valor |
|-------|--------|
| **Historia** | [HU-015 en backlog.md](backlog.md) (tabla §3) |
| **Refinamiento** | [HU-015-proyeccion-y-enriquecimiento-mongo.md](HU-015-proyeccion-y-enriquecimiento-mongo.md) |

**Convención de ID de ticket:** `TASK-HU-015-<nn>`.

**Nota:** la historia completa (**proyección**, sync en alta/edición, índices) se desglosará cuando el equipo priorice **HU-015**. Este fichero arranca con el ticket **imprescindible para HU-008** (borrado en cascada) aunque Mongo aún no esté implementado.

---

## Tickets

| ID | Título | Descripción breve | Estado |
|----|--------|-------------------|--------|
| **TASK-HU-015-01** | Borrado en cascada de enriquecimientos Mongo al eliminar árbol | Al confirmarse el **borrado físico** de un `ejemplar_id` en **catalog-service** (**HU-008**), eliminar en MongoDB los documentos de enriquecimiento del ejemplar (p. ej. colección `ejemplar_detalle` / notas vinculadas por `ejemplar_pg_id` según [mongo.md](../data-model/mongo.md)). Mientras no exista la capa Mongo en **catalog-service**, el hook puede ser **no-op** documentado o stub con test de contrato; el ticket permanece **Pendiente** hasta la implementación real. No sustituye el borrado SQL ni el de fotos (responsabilidad de **HU-008** + **media-service**). | Pendiente |

*(Añadir TASK-HU-015-02… cuando se refine el alcance completo de proyección y sincronización.)*

## Dependencias

- **HU-008:** dispara el borrado en cascada tras `DELETE` exitoso del árbol en PostgreSQL.
- Infra **MongoDB** en Compose y configuración Spring Data Mongo en **catalog-service** (aún no presente en el corte actual).
