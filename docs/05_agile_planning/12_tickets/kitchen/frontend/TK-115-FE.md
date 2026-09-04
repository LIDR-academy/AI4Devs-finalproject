---
document: technical_ticket
id: TK-115-FE
related_story: US-031
points: 1
type: frontend
status: draft
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-031.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
---

# 🎟️ TK-115-FE: Resaltado Full-Bleed de Fila con Varianza en Conciliación (Frontend)

> [⬅️ US-031](../../../11_user_stories/shared/US-031.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Fusión selectiva del mockup `04_shift_reconciliation.html` (Stitch) — `US-031` Escenario 3. `ShiftReconciliationWizard` ya distingue una fila con varianza negativa sin motivo, pero con un tratamiento sutil (borde). Se cambia a un fondo tintado de sangre completa (`margin-inline` negativo hasta el borde del contenedor + `color-mix` sobre `--color-danger`), más visible bajo luz de cocina, sin tocar color de texto ni targets táctiles.

*   **US:** `US-031` · **Slice:** `kitchen` UI · **SP:** 1 · **Prioridad:** 🟢 P3 — puramente visual
*   **Prerrequisitos:** ninguno

## 🔀 Alcance (UI)
*   `ShiftReconciliationWizard.module.css`: nueva clase (p. ej. `.variance-row--pending-reason`) con fondo `color-mix(in srgb, var(--color-danger) 5%, transparent)`, borde `color-mix(in srgb, var(--color-danger) 20%, transparent)`, `margin-inline` negativo igual al padding del contenedor.
*   `ShiftReconciliationWizard.tsx`: aplicar la clase a `ReconciliationItemRow` cuando `diff < 0 && !reasonId` (misma condición que ya usa `computeVarianceFlags`/`hasMissingReason` — no se introduce lógica nueva de detección).

## ✅ DoD
1. **Test de componente:** una fila con varianza negativa sin motivo tiene la clase de resaltado; al elegir un motivo válido, dejar de tener varianza negativa, o no tener varianza, no la tiene.
2. Sin cambios de color de texto ni de contraste ya auditado; sin regresiones.
3. `pnpm lint`/`pnpm test`/`pnpm build` verdes.
4. **Commit:** `feat(kitchen): full-bleed highlight for reconciliation rows pending a reason (TK-115-FE)`.

## 📌 Notas de implementación
*   Pendiente de implementación.
