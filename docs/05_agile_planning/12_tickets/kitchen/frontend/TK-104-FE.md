---
document: technical_ticket
id: TK-104-FE
related_story: US-028
points: 8
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/kitchen/US-028.md
  - docs/02_architecture_design/adr/ADR-003-recipe-preparation-tracking.md
---

# 🎟️ TK-104-FE: Pantalla "Cerrar Preparación de Receta" (Frontend)

> [⬅️ US-028](../../../11_user_stories/kitchen/US-028.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Modal/pantalla de cierre: porciones reales + por ingrediente extraído `[sobrante] [¿dónde? ▾] [merma] [motivo]`, con consumo calculado y cuadre visible. Marca "envase sin abrir" que habilita "devolver a bodega". Botón "Abandonar preparación".

*   **US:** `US-028` · **Slice:** `kitchen` UI · **SP:** 8 · **MoSCoW:** Should Have · **Prioridad:** 🟢 P2
*   **Prerrequisitos:** `TK-104`, `TK-103-FE`, `TK-102-FE`

## 🔀 Alcance (UI)
*   Nuevo `features/kitchen/components/ClosePreparationModal.tsx`:
    *   Cabecera: receta, porciones planificadas, `[porciones reales]`.
    *   Por ingrediente: `extraído` (solo lectura) · `[sobrante]` + `[destino ▾]` (áreas de cocina + "descartar" + "devolver a bodega" *solo si* `isPristine`) + `[✓ envase sin abrir]` (habilita bodega) · `[merma]` + `[motivo ▾/texto]` (obligatorio si merma > 0) · `consumido` calculado.
    *   Fila de cuadre: `extraído = consumido + sobrante + merma` con marca ✓/✗; submit bloqueado si algún ítem no cuadra.
    *   Aritmética con `DecimalQuantity` compartido (Guard 17), no `parseFloat`/float.
*   `OpenPreparationsPanel` (de TK-103-FE): botón "Cerrar" abre este modal; "Abandonar" con confirmación inline (no `window.confirm`, Guard 38).
*   `recipePreparations.service.ts`: `close(id, payload)`, `abandon(id)` — errores propagados al `ErrorBanner` (sin fallback demo, C-DEV-006-3).

## ✅ DoD
1. Test de componente: el cuadre bloquea el submit; "devolver a bodega" solo aparece si `isPristine`; merma > 0 exige motivo; `parseFloat` ausente (Decimal); `422` del backend se muestra traducido.
2. Accesibilidad: objetivos táctiles ≥ 48px; `ErrorBanner` `role="alert"`.
3. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
4. **Commit:** `feat(kitchen): close-recipe-preparation screen with leftover and waste declaration (TK-104-FE)`.

## 📌 Notas de implementación
*   El desplegable `[destino ▾]` ofrece solo ubicaciones reales (áreas de cocina siempre; sub-sectores de bodega solo si `isPristine`) — el descarte se declara aparte en el campo `Merma`, no como una opción de destino (el contrato del backend ya lo modela así).
*   `OpenPreparationsPanel` (TK-103-FE) pasa a auto-gestionar el cierre/abandono: el prop `onClosePreparation` se retira (dead prop) y el panel monta `ClosePreparationModal` + `ConfirmModal` (Guard 38) internamente. Nuevo prop opcional `onReconciled` para que `InventarioRoute` refresque el tablero FEFO tras un cierre/abandono.
*   Backend: `GetRecipePreparationsUseCase.detail()` gana `isPristine` y `storageLocationId` por remanente vinculado (`IRemanenteQueryRepository.ActiveRemanenteDTO` + ambos repos).
*   `.reconciliation-item-row` extraída a `index.css` (compartida con `ShiftReconciliationWizard`) para evitar un clon de CSS entre ambos módulos.
*   `DecimalQuantity` (frontend) gana `isGreaterThan` para el cuadre `sobrante + merma vs. extraído` sin flotantes (Guard 17).
