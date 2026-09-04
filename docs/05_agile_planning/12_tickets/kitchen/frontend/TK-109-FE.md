---
document: technical_ticket
id: TK-109-FE
related_story: US-008
points: 3
type: frontend
status: draft
inputs:
  - docs/05_agile_planning/11_user_stories/kitchen/US-008.md
  - docs/02_architecture_design/adr/ADR-004-consumption-reason-catalog.md
---

# 🎟️ TK-109-FE: Selector de Motivo por Línea en el Cierre de Turno (Frontend)

> [⬅️ US-008](../../../11_user_stories/kitchen/US-008.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
`ShiftReconciliationWizard`: cuando una línea del conteo físico da una varianza negativa (`diff < 0`), muestra un selector de motivo (catálogo `TK-107-FE`) inline en esa fila; obligatorio para poder enviar el cierre.

*   **US:** `US-008` v1.1.0 · **Slice:** `kitchen` UI · **SP:** 3 · **MoSCoW:** Should Have · **Prioridad:** 🟡 P1
*   **Prerrequisitos:** `TK-109`, `TK-107-FE`

## 🔀 Alcance (UI)
*   `reconciliation.service.ts`: `items[].reasonId` opcional en el payload (obligatorio solo si hay varianza negativa, validado en cliente antes de enviar).
*   `ShiftReconciliationWizard.tsx`: `ReconciliationItemRow` — si `diff < 0`, selector de motivo inline; `canSubmit` pasa a exigir motivo en todas las líneas con varianza negativa (además de la autorización de varianza crítica ya existente).
*   Guard 29 / Guard 38.

## ✅ DoD
1. Test de componente: línea con varianza negativa sin motivo bloquea el envío; con motivo, lo incluye en el payload; varianza positiva no pide nada.
2. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
3. **Commit:** `feat(kitchen): reason selector on negative reconciliation variance rows (TK-109-FE)`.
