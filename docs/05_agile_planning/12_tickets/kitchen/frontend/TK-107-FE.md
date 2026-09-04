---
document: technical_ticket
id: TK-107-FE
related_story: US-030
points: 3
type: frontend
status: draft
inputs:
  - docs/05_agile_planning/11_user_stories/kitchen/US-030.md
  - docs/02_architecture_design/adr/ADR-004-consumption-reason-catalog.md
---

# 🎟️ TK-107-FE: Panel de Administración de Motivos de Consumo (Frontend)

> [⬅️ US-030](../../../11_user_stories/kitchen/US-030.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Pantalla de gestión del catálogo en `/ajustes`, mismo patrón que `RolesManagementPanel` (US-015): lista + alta + edición de etiqueta + toggle activar/desactivar. Sin botón de borrar (ADR-004 §3.1).

*   **US:** `US-030` · **Slice:** `kitchen` UI · **SP:** 3 · **MoSCoW:** Should Have · **Prioridad:** 🟡 P1
*   **Prerrequisitos:** `TK-107`

## 🔀 Alcance (UI)
*   `consumptionReasons.service.ts`: `list(includeInactive?)`, `create(label)`, `update(id, {label?, isActive?})`.
*   `ConsumptionReasonsManagementPanel.tsx` (nuevo, en `/ajustes`) — tabla/lista con motivo + estado + toggle; formulario de alta inline.
*   Guard 29 / Guard 38.

## ✅ DoD
1. Test de componente: alta agrega a la lista; toggle desactivar oculta el motivo de la vista "activos" (si aplica el filtro) o lo marca visualmente inactivo.
2. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
3. **Commit:** `feat(kitchen): consumption reason catalog admin panel (TK-107-FE)`.
