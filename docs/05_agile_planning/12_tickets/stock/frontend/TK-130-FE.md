---
document: technical_ticket
id: TK-130-FE
related_story: US-036
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/catalog/US-036_edicion_insumo.md
  - docs/05_agile_planning/12_tickets/stock/backend/TK-130.md
---

# 🎟️ TK-130-FE: Modal de Edición de Insumo en el Catálogo de Bodega — US-036

> **Navegación:** [⬅️ US-036](../../../11_user_stories/catalog/US-036_edicion_insumo.md) | [Backend: TK-130](../backend/TK-130.md)

---

## 📝 Descripción

Botón **"Editar"** en cada insumo del catálogo (`canManage` / ADMIN) que abre un modal para corregir `name` / `unitCost` / `barcode`. `unitOfMeasure` se muestra pero no es editable. Envía un `PUT /stock/insumos/:id` **parcial** — solo los campos que cambiaron; un opcional vaciado se manda como `null` (limpiar).

*   **Módulo:** `stock` (frontend) · **3 SP** · **Must Have** · **Prerrequisitos:** TK-130.

---

## 🔀 Alcance de Modificación

*   **`services/stock.service.ts`:** `UpdateInsumoDTO` + `StockService.updateInsumo(id, patch)`.
*   **`components/EditInsumoModal.tsx`** (nuevo): formulario `name`/`unitCost`/`barcode`, precarga desde el insumo, `buildPatch` (solo lo que cambió; `''` → `null`), `ErrorBanner` para el `409`/`400` del backend. Estructura espejo de `RestockInsumoModal`.
*   **`components/InsumoManageActions.tsx`** (nuevo): botones "Editar"/"Reabastecer" compartidos por la fila de tabla y la tarjeta de grilla (elimina el clon que jscpd habría marcado).
*   **`components/InsumoCatalogPanel.tsx` / `InsumoCatalogGrid.tsx`:** propagan `onEdit`; el panel gana `editTarget` + `<EditInsumoModal>`. `useInsumoCatalog` extraído (fetch/estado) para respetar el límite de longitud de función al tocar el archivo.

---

## ✅ DoD

1. RTL de `EditInsumoModal` (`EditInsumoModal.test.tsx`): precarga, PUT parcial, `null` para limpiar, "sin cambios cierra sin llamar", banner de error `409`.
2. `pnpm test` / `pnpm run build` / `pnpm run lint` — 0 errores; gates ticket-scoped verdes (duplicación 19 → 18).
3. Sin `style` inline (Guard 29).
4. **Commit atómico:** `feat(stock): edit-insumo modal in the warehouse catalog (TK-130-FE)`.
