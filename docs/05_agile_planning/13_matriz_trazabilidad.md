---
document: matriz_trazabilidad
version: 1.2.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/02_architecture_design/04_technical_design.md
  - docs/03_persistence_and_api/06_database_schema.md
  - docs/03_persistence_and_api/07_api_specification.md
---

# 📊 Matriz de Trazabilidad End-to-End (Verified Spec-Driven Development - VSDD)

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Índice de Tickets (12_tickets/12_indice_tickets.md)](./12_tickets/12_indice_tickets.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Mapa Jerárquico del Backlog (14_backlog_map.md) ➡️](./14_backlog_map.md)

---

## 🗺️ Matriz de Trazabilidad del MVP

| ID Req. | Módulo / Slice | Tabla / Modelo Prisma | Endpoint API REST | Historia de Usuario | Ticket Técnico (Backend) | Ticket Técnico (Frontend) | Estado | Skill de IA Asociada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **REQ-001** | `auth` | `User`, `Role` | `POST /api/auth/pin` | [US-001](11_user_stories/auth/US-001.md) | [TK-002](12_tickets/auth/backend/TK-002.md) | [TK-007-B](12_tickets/auth/frontend/TK-007-B.md) | ✅ Done | [SK-01_discover_product_vision.md](../../.agents/skills/specs/01_product_definition/SK-01_discover_product_vision.md) |
| **REQ-002** | `stock` | `StockMovement`, `ActiveRemanent` | `POST /api/stock/extraction` | [US-002](11_user_stories/stock/US-002.md) | [TK-003](12_tickets/stock/backend/TK-003.md) | [TK-007-F](12_tickets/stock/frontend/TK-007-F.md) | ✅ Done | [SK-06_design_database_schema.md](../../.agents/skills/specs/03_persistence_and_api/SK-06_design_database_schema.md) |
| **REQ-003** | `kitchen` | `ActiveRemanent`, `Item` | `GET /api/kitchen/remanentes` | [US-003](11_user_stories/kitchen/US-003.md) | [TK-004](12_tickets/kitchen/backend/TK-004.md) | [TK-007](12_tickets/kitchen/frontend/TK-007.md) | ✅ Done | [SK-07_design_api_specification.md](../../.agents/skills/specs/03_persistence_and_api/SK-07_design_api_specification.md) |
| **REQ-004** | `kitchen` | `ActiveRemanent`, `PartialUsage` | `POST /api/kitchen/consume` | [US-004](11_user_stories/kitchen/US-004.md) | [TK-005](12_tickets/kitchen/backend/TK-005.md) | [TK-007](12_tickets/kitchen/frontend/TK-007.md) | ✅ Done | [SK-04_design_technical_architecture.md](../../.agents/skills/specs/02_architecture_design/SK-04_design_technical_architecture.md) |
| **REQ-005** | `kitchen` | `ActiveRemanent`, `WasteLog` | `POST /api/kitchen/discard` | [US-005](11_user_stories/kitchen/US-005.md) | [TK-006](12_tickets/kitchen/backend/TK-006.md) | [TK-007](12_tickets/kitchen/frontend/TK-007.md) | ✅ Done | [SK-08_define_security_strategy.md](../../.agents/skills/specs/04_governance_and_quality/SK-08_define_security_strategy.md) |
| **REQ-006** | `kitchen` | `ActiveRemanent`, `Notification` | `GET /api/kitchen/alerts` | [US-006](11_user_stories/kitchen/US-006.md) | N/A *(Cross-cutting)* | [TK-007](12_tickets/kitchen/frontend/TK-007.md) | ✅ Done | [SK-04_design_technical_architecture.md](../../.agents/skills/specs/02_architecture_design/SK-04_design_technical_architecture.md) |
| **REQ-007** | `catalog`/`kitchen` | `Recipe`, `RecipeIngredient` | `POST /api/kitchen/recipe-consume` | [US-007](11_user_stories/kitchen/US-007.md) | [TK-008](12_tickets/kitchen/backend/TK-008.md) | [TK-007-C](12_tickets/kitchen/frontend/TK-007-C.md) | ✅ Done | [SK-03_design_domain_model.md](../../.agents/skills/specs/02_architecture_design/SK-03_design_domain_model.md) |
| **REQ-008** | `kitchen` | `ShiftReconciliation`, `WasteLog` | `POST /api/kitchen/shift-reconciliation` | [US-008](11_user_stories/kitchen/US-008.md) | [TK-009](12_tickets/kitchen/backend/TK-009.md) | [TK-007-D](12_tickets/kitchen/frontend/TK-007-D.md) | ✅ Done | [SK-09_define_testing_strategy.md](../../.agents/skills/specs/04_governance_and_quality/SK-09_define_testing_strategy.md) |
| **REQ-009** | `reports` | `WasteLog`, `Item` | `GET /api/reports/waste` | [US-009](11_user_stories/reports/US-009.md) | [TK-010](12_tickets/reports/backend/TK-010.md) | [TK-007-E](12_tickets/reports/frontend/TK-007-E.md) | ✅ Done | [SK-12_generate_backlog_tickets.md](../../.agents/skills/specs/05_agile_planning/SK-12_generate_backlog_tickets.md) |
| **REQ-010** | `shared` | `Recipe`, `RecipeIngredient`, `ShiftReconciliation`, `ShiftReconciliationItem` | N/A *(persistencia de repos existentes)* | N/A *(Técnico)* | [TK-048](12_tickets/shared/backend/TK-048.md) | N/A | ✅ Done | [SK-16_develop_backend_ticket.md](../../.agents/skills/development/02_backend_development/SK-16_develop_backend_ticket.md) |
| **REQ-011** | `auth` | `User` | `POST /api/v1/auth/users`, `PATCH /api/v1/auth/users/{id}/status`, `GET /api/v1/auth/users` | [US-010](11_user_stories/auth/US-010.md) | [TK-049](12_tickets/auth/backend/TK-049.md), [TK-056](12_tickets/auth/backend/TK-056.md) | [TK-049-FE](12_tickets/auth/frontend/TK-049-FE.md) | ✅ Done | [SK-17_develop_frontend_ticket.md](../../.agents/skills/development/03_frontend_development/SK-17_develop_frontend_ticket.md) |
| **REQ-012** | `stock` | `StockMovement` | `GET /api/v1/stock/movements` | [US-011](11_user_stories/stock/US-011.md) | [TK-050](12_tickets/stock/backend/TK-050.md) | [TK-050-FE](12_tickets/stock/frontend/TK-050-FE.md) | ✅ Done | [SK-17_develop_frontend_ticket.md](../../.agents/skills/development/03_frontend_development/SK-17_develop_frontend_ticket.md) |
| **REQ-013** | `auth` | `User` | `POST /api/v1/auth/login-pin` (bootstrap idempotente) | N/A *(Técnico)* | [TK-051](12_tickets/shared/backend/TK-051.md) | N/A | ✅ Done | [SK-16_develop_backend_ticket.md](../../.agents/skills/development/02_backend_development/SK-16_develop_backend_ticket.md) |

---

## 🔍 Reglas de Cobertura Documental

1. **Cero Orfandad:** Cada Ticket Técnico debe tener asignada al menos 1 Historia de Usuario válida (`US-XXX`) y 1 Endpoint REST documentado en OpenAPI.
2. **Consistencia de Entidades:** Toda tabla listada en la columna *Prisma* debe corresponder exactamente a una declaración `model` en `schema.prisma`.
3. **Control de Cambios:** Cualquier modificación sobre un requerimiento debe propagarse verticalmente siguiendo el [Protocolo de Integración en Cascada](../../.agents/workflows/01_cascading_spec_workflow.md).
4. **Cero Orfandad de Frontend (Guard 26 / SK-12):** toda User Story de cara al usuario DEBE tener un Ticket Técnico de Frontend asociado (`TK-XXX-FE.md`) aunque su implementación esté diferida — nunca dejar la celda vacía, en `N/A` ni como nota de texto suelta. Si el ticket de Frontend existe solo como spec sin código todavía, la columna *Estado* debe decirlo explícitamente (`⚠️ Backend Done / Frontend Especificado, Sin Implementar`), nunca ocultarlo detrás de un `✅ Done` genérico. Ver `REQ-011`/`REQ-012` como precedente.
