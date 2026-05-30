# Backlog — convención de documentos

Esta carpeta contiene el [backlog resumido](backlog.md) y, para cada historia de usuario que se desglose en trabajo ejecutable, un **fichero de tickets** siguiendo un nombre fijo.

**Implementación backend:** convención de tests Java en [engineering/testing-java.md](../engineering/testing-java.md).

**Nomenclatura técnica:** *ejemplar* en rutas y `treeId` ([ADR-0006](../adr/0006-ejemplar-aggregate-http-kafka-naming.md)); contrato HTTP (JSON, query, `sort`) en inglés con persistencia en español ([ADR-0007](../adr/0007-english-http-spanish-persistence.md), [openapi.yaml](../api/openapi.yaml)). Los títulos de HU pueden decir «árbol» en lenguaje de producto; en tickets y verificación usar `/ejemplares`, `/mis-ejemplares` y props/query en inglés según OpenAPI.

## Patrón de nombre de fichero

**`HU-<id>-ticket-breakdown.md`**

| Parte | Significado |
|-------|-------------|
| `HU-<id>` | Identificador de la historia en [backlog.md](backlog.md) (p. ej. `HU-001`, `HU-004`). |
| `ticket-breakdown` | Sufijo fijo: desglose en tickets/tareas técnicas vinculadas a esa HU. |

Ejemplos futuros: `HU-004-ticket-breakdown.md`, `HU-010-ticket-breakdown.md`.

## Contenido esperado de cada `HU-*-ticket-breakdown.md`

- Metadatos de la HU (título, épica, enlace a la fila del backlog).
- Lista de tickets con **ID estable** recomendado: **`TASK-HU-<id>-<nn>`** (dos dígitos, p. ej. `TASK-HU-001-01`), para trazabilidad en commits, PRs y tableros.
- Criterios de aceptación o notas por ticket cuando aporte valor.
- Orden o dependencias entre bloques de tickets, si aplica.

## Índice de desgloses

| HU | Documento |
|----|-----------|
| HU-001 | [HU-001-ticket-breakdown.md](HU-001-ticket-breakdown.md) |
| HU-002 | [HU-002-ticket-breakdown.md](HU-002-ticket-breakdown.md) |
| HU-003 | [HU-003-ticket-breakdown.md](HU-003-ticket-breakdown.md) |
| HU-005 | [HU-005-ticket-breakdown.md](HU-005-ticket-breakdown.md) |
| HU-006 | [HU-006-ticket-breakdown.md](HU-006-ticket-breakdown.md) · Refinamiento: [HU-006-fotografias-asociadas-al-arbol.md](HU-006-fotografias-asociadas-al-arbol.md) |
| HU-014 | [HU-014-ticket-breakdown.md](HU-014-ticket-breakdown.md) · Refinamiento: [HU-014-consulta-de-fotografias-del-arbol.md](HU-014-consulta-de-fotografias-del-arbol.md) |
| HU-007 | [HU-007-ticket-breakdown.md](HU-007-ticket-breakdown.md) |
| HU-013 | [HU-013-ticket-breakdown.md](HU-013-ticket-breakdown.md) |
| HU-004 | [HU-004-ticket-breakdown.md](HU-004-ticket-breakdown.md) · Refinamiento: [HU-004-suscripcion-por-correo-sin-cuenta-colaborador.md](HU-004-suscripcion-por-correo-sin-cuenta-colaborador.md) |
| HU-012 | [HU-012-ticket-breakdown.md](HU-012-ticket-breakdown.md) · Refinamiento: [HU-012-gestion-de-suscripciones-a-notificaciones.md](HU-012-gestion-de-suscripciones-a-notificaciones.md) |
| HU-008 | [HU-008-edicion-de-mis-arboles.md](HU-008-edicion-de-mis-arboles.md) · [Tickets](HU-008-ticket-breakdown.md) (**Cerrada**; TASK-008-11 rechazado) |
| HU-015 | [HU-015-proyeccion-y-enriquecimiento-mongo.md](HU-015-proyeccion-y-enriquecimiento-mongo.md) · [Tickets](HU-015-ticket-breakdown.md) (TASK-01 borrado cascada, pendiente) |
| HU-011 | [HU-011-maestros-de-catalogo.md](HU-011-maestros-de-catalogo.md) · [Tickets](HU-011-ticket-breakdown.md) |
| HU-016 | [HU-016-consulta-admin-caracteristicas-especie-ia.md](HU-016-consulta-admin-caracteristicas-especie-ia.md) (refinamiento; tickets pendientes) |
| HU-009–HU-010 | **Próxima versión** — identificación por imagen y chat; ficheros de refinamiento/tickets pendientes de crear. |

*(Añadir aquí una fila al crear cada nuevo `HU-*-ticket-breakdown.md`.)*
