# 📊 Matriz de Trazabilidad End-to-End (Verified Spec-Driven Development - VSDD)

Este documento establece la trazabilidad completa y bidireccional del sistema **RestoStock**, conectando cada necesidad de negocio desde el descubrimiento inicial hasta la especificación técnica, modelos de persistencia, contratos de API, historias de usuario, tickets de trabajo y directivas de IA asociadas.

---

## 🗺️ Matriz de Trazabilidad del MVP

| ID Req. | Módulo / Slice | Tabla / Modelo Prisma | Endpoint API REST | Historia de Usuario | Ticket Técnico (Backend) | Ticket Técnico (Frontend) | Skill de IA Asociada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-001** | `auth` | `User`, `Role` | `POST /api/auth/pin` | [US-001](../user_stories/auth/US-001.md) | [TK-002](tickets/auth/backend/TK-002.md) | [TK-007-B](tickets/auth/frontend/TK-007-B.md) | [SK-01_product_discovery.md](../../.agents/skills/specs/01_product_definition/SK-01_product_discovery.md) |
| **REQ-002** | `stock` | `StockMovement`, `ActiveRemanent` | `POST /api/stock/extraction` | [US-002](../user_stories/stock/US-002.md) | [TK-003](tickets/stock/backend/TK-003.md) | [TK-007-F](tickets/stock/frontend/TK-007-F.md) | [SK-10_prisma_schema.md](../../.agents/skills/specs/04_persistence_and_api/SK-10_prisma_schema.md) |
| **REQ-003** | `kitchen` | `ActiveRemanent`, `Item` | `GET /api/kitchen/remanentes` | [US-003](../user_stories/kitchen/US-003.md) | [TK-004](tickets/kitchen/backend/TK-004.md) | [TK-007](tickets/kitchen/frontend/TK-007.md) | [SK-11_api_specification.md](../../.agents/skills/specs/04_persistence_and_api/SK-11_api_specification.md) |
| **REQ-004** | `kitchen` | `ActiveRemanent`, `PartialUsage` | `POST /api/kitchen/consume` | [US-004](../user_stories/kitchen/US-004.md) | [TK-005](tickets/kitchen/backend/TK-005.md) | [TK-007](tickets/kitchen/frontend/TK-007.md) | [SK-05_hexagonal_layers.md](../../.agents/skills/specs/02_architecture_design/SK-05_hexagonal_layers.md) |
| **REQ-005** | `kitchen` | `ActiveRemanent`, `WasteLog` | `POST /api/kitchen/discard` | [US-005](../user_stories/kitchen/US-005.md) | [TK-006](tickets/kitchen/backend/TK-006.md) | [TK-007](tickets/kitchen/frontend/TK-007.md) | [SK-08_security_strategy.md](../../.agents/skills/specs/03_governance_and_quality/SK-08_security_strategy.md) |
| **REQ-006** | `kitchen` | `ActiveRemanent`, `Notification` | `GET /api/kitchen/alerts` | [US-006](../user_stories/kitchen/US-006.md) | N/A *(Cross-cutting)* | [TK-007](tickets/kitchen/frontend/TK-007.md) | [SK-04_mermaid_diagram.md](../../.agents/skills/specs/02_architecture_design/SK-04_mermaid_diagram.md) |
| **REQ-007** | `catalog`/`kitchen` | `Recipe`, `RecipeIngredient` | `POST /api/kitchen/recipe-consume` | [US-007](../user_stories/kitchen/US-007.md) | [TK-008](tickets/kitchen/backend/TK-008.md) | [TK-007-C](tickets/kitchen/frontend/TK-007-C.md) | [SK-03_architecture_design.md](../../.agents/skills/specs/02_architecture_design/SK-03_architecture_design.md) |
| **REQ-008** | `kitchen` | `ShiftReconciliation`, `WasteLog` | `POST /api/kitchen/shift-reconciliation` | [US-008](../user_stories/kitchen/US-008.md) | [TK-009](tickets/kitchen/backend/TK-009.md) | [TK-007-D](tickets/kitchen/frontend/TK-007-D.md) | [SK-09_testing_strategy.md](../../.agents/skills/specs/03_governance_and_quality/SK-09_testing_strategy.md) |
| **REQ-009** | `reports` | `WasteLog`, `Item` | `GET /api/reports/waste` | [US-009](../user_stories/reports/US-009.md) | [TK-010](tickets/reports/backend/TK-010.md) | [TK-007-E](tickets/reports/frontend/TK-007-E.md) | [SK-13_backlog_tickets.md](../../.agents/skills/specs/05_agile_planning/SK-13_backlog_tickets.md) |

---

## 🔍 Reglas de Cobertura Documental

1. **Cero Orfandad:** Cada Ticket Técnico debe tener asignada al menos 1 Historia de Usuario válida (`US-XXX`) y 1 Endpoint REST documentado en OpenAPI.
2. **Consistencia de Entidades:** Toda tabla listada en la columna *Prisma* debe corresponder exactamente a una declaración `model` en `schema.prisma`.
3. **Control de Cambios:** Cualquier modificación sobre un requerimiento debe propagarse verticalmente siguiendo el [Protocolo de Integración en Cascada](file:///home/lacruzjd/entrgafinal/AI4Devs-finalproject/.agents/nuevas_ideas_cascada.md).
