---
document: technical_ticket
id: TK-096-FE
related_story: US-025
points: 5
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-025.md
  - docs/03_persistence_and_api/07_api_specification.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
  - DESIGN.md
---

# 🎟️ TK-096-FE: Selector de Sub-Sector de Bodega y Desglose de Stock (Frontend)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-025 (11_user_stories/stock/US-025.md)](../../../11_user_stories/stock/US-025.md) | [📖 Índice de Tickets](../../indice_tickets.md) | [Matriz de Trazabilidad ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Añadir el selector de sub-sector de bodega (obligatorio) al alta y reabastecimiento de insumos, el selector de sub-sector de origen a la extracción de bodega, y el desglose de stock por sector en el catálogo de inventario.

*   **ID US Relacionada:** `US-025`
*   **Módulo / Vertical Slice:** `stock` (frontend)
*   **Estimación (Story Points):** 5
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-096` (backend), `TK-074-FE` (`LocationsService`)

---

## 🛠️ Tareas Técnicas
1. **`CreateInsumoModal.tsx`:** nuevo `<select>` "Sub-sector de Bodega *" poblado con `LocationsService.fetchLocations()` filtrado a `type === 'WAREHOUSE' && isActive`; obligatorio (bloquea submit, error inline si vacío). Enviar `storageLocationId` en `CreateInsumoDTO`. Renombrar el campo actual a "Stock Inicial en ese Sub-sector".
2. **`RestockInsumoModal.tsx`:** mismo `<select>` de sub-sector de bodega, obligatorio; enviar `storageLocationId` en el `PATCH`. Mostrar el desglose actual del insumo (líneas existentes) como contexto.
3. **`WarehouseExtractionModal.tsx`:** nuevo `<select>` "Sector de Bodega Origen *" (`type === 'WAREHOUSE'`, activos); mostrar el saldo de ese sector junto al insumo (`stockByLocation`); enviar `fromStorageLocationId`. El aviso de saldo insuficiente se resuelve con el `422` traducido por `errorMessageMapper`.
4. **`InsumoCatalogPanel.tsx`:** la columna "Stock en Bodega Principal" pasa a "Stock en Bodega (total)" y la fila se hace expandible mostrando `stockByLocation` (`sector — cantidad unidad`). Sin existencias → "Sin stock en bodega".
5. **`stock.service.ts`:** tipos `InsumoItem.stockByLocation`, `CreateInsumoDTO.storageLocationId`, `RestockDTO.storageLocationId`, `recordExtraction` con `fromStorageLocationId`.
6. **DESIGN.md / `05_ui_ux_design_system.md`:** documentar el patrón "selector de sector obligatorio" y el estado "fila expandible de desglose de stock" (Guard 29) antes de codificar.

---

## ✅ Criterios de Aceptación & DoD
1. **TDD (RTL):**
   *   `CreateInsumoModal`: submit bloqueado sin sector; `storageLocationId` en el payload; carga de opciones.
   *   `WarehouseExtractionModal.test.tsx`: selector de origen presente, `fromStorageLocationId` enviado, saldo por sector visible.
   *   `InsumoCatalogPanel`: desglose expandible renderiza las líneas de `stockByLocation`.
2. **Guard 29 (No-Inline-Style):** cero `style={{}}`; clases desde tokens `--space-*`/`--fs-*`; `Componente.module.css` colocalizado. Lectura previa de `DESIGN.md`.
3. **Guard 38:** errores vía `ErrorBanner` + `errorMessageMapper`, sin popups nativos ni strings técnicos crudos.
4. **Accesibilidad WCAG 2.1 AAA:** `<label>` asociado a cada `<select>`, targets ≥ 48px, contraste validado (`check_fefo_contrast.mjs` si aplica a las vistas tocadas).
5. **Sin regresiones:** `pnpm test`, `pnpm run build`, `pnpm run lint` en verde.
6. **Commit atómico** `feat(stock): warehouse sub-sector selectors and stock breakdown (TK-096-FE)`.

## 🧪 Plan de Pruebas
- Unitario RTL de los 4 componentes tocados.
- Verificación manual del flujo alta → reabastecimiento a 2º sector → extracción por sector → desglose en catálogo.
