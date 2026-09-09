---
document: technical_ticket
id: TK-082-FE
related_story: US-022
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-022.md
  - docs/05_agile_planning/12_tickets/shared/frontend/TK-081-FE.md
---

# 🎟️ TK-082-FE: Sistema FEFO — Modales de Operación de Cocina

> **Navegación del Framework SDD:**
> [⬅️ Anterior: TK-081-FE](./TK-081-FE.md) | [📖 Índice de Tickets](../../indice_tickets.md) | [Siguiente: TK-083-FE](./TK-083-FE.md)

---

## 📝 Descripción
Extiende `TK-081-FE` (prerrequisito) a los modales de operación que el operario abre desde el tablero principal. Los tokens de color/tipografía ya llegan por cascada CSS una vez `TK-081-FE` esté mergeado (el tema pasa a vivir en `:root[data-theme]`, global) — este ticket ajusta la **forma estructural** de estos componentes (bordes gruesos en vez de sombras, radios a 0, tipografía de datos en monoespaciada) para que dejen de verse como una mezcla de dos sistemas de diseño.

*   **Módulo / Vertical Slice:** `shared` (afecta `stock`, `kitchen`)
*   **Prerrequisito estricto:** `TK-081-FE` mergeado y verificado.

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **`apps/frontend/src/shared/components/Modal.tsx` / `Modal.module.css`:** overlay opaco y tarjeta modal (`.modal-overlay`/`.modal-card`) migran a borde grueso `var(--rule)` y esquinas rectas, en línea con `.card-dashboard` de `TK-081-FE`.
*   **`apps/frontend/src/shared/components/ModalHeader.tsx`, `ModalFooterActions.tsx`, `ErrorBanner.tsx`:** tipografía de encabezado a `--font-family-display`; verificar que ningún literal hex quede huérfano del cambio de paleta.
*   **`apps/frontend/src/features/stock/components/WarehouseExtractionModal.tsx` (+ `.module.css`):** incluye el banner de advertencia de apertura duplicada (`TK-080-FE`) — confirmar que su clase `banner-alert-warning`/badges de urgencia sigan siendo legibles en ambos turnos.
*   **`apps/frontend/src/features/kitchen/components/RecipeSelectorModal.tsx`, `DiscardModal.tsx`, `ShiftReconciliationWizard.tsx` (+ módulos CSS respectivos).**
*   **Confirmar alcance exacto de ficheros en Stage 2** vía `grep -rl "modal-overlay\|modal-card" apps/frontend/src/features` — esta lista es de planificación, no exhaustiva.

---

## ✅ Criterios de Aceptación & DoD
1. Cada modal listado se ve consistente con el tablero principal ya migrado en `TK-081-FE`, en ambos turnos Día/Noche.
2. Cero cambio de comportamiento — mismos tests RTL existentes en verde sin tocar aserciones de comportamiento.
3. Ningún literal hex hardcodeado nuevo ni residual de la paleta v3.0.0 (`grep` de verificación, mismo criterio que `TK-067`/`TK-068`).
4. `pnpm --filter frontend test -- --run`, `build`, `lint` — 0 errores.
