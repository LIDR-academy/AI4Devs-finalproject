---
document: technical_ticket
id: TK-106-FE
related_story: US-025
points: 2
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-025.md
---

# 🎟️ TK-106-FE: Aviso de Stock por Sub-Sector en la Extracción de Bodega (Frontend)

> **Navegación del Framework SDD:**
> [⬅️ Volver a US-025 (11_user_stories/stock/US-025.md)](../../../11_user_stories/stock/US-025.md) | [📖 Índice de Tickets](../../indice_tickets.md) | [Matriz de Trazabilidad ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
**Remediación técnica** (C-DEV-006-4 — no cambia ninguna regla de negocio, corrige la UI para reflejar el modelo multi-sector de `US-025` ya vigente). Reportado en vivo por el humano: al extraer "leche", el desplegable de insumo mostraba "Stock Bodega: 10 L" pero la extracción fallaba con `422` ("Solicitado: 1.000, Disponible: 0.000"). Verificado contra la base real: los 10 L existían en "Cámara de Congelados"; el sub-sector de origen auto-seleccionado ("Bodega de Secos") tenía 0. No es un bug de datos ni de backend — la deducción atómica por `(insumo, sub-sector)` de `TK-098` es correcta — sino de UI: `WarehouseExtractionModal` mostraba el **total agregado** de bodega (`warehouseStock`) sin relación con el sub-sector de origen elegido, descartando el desglose por sector (`stockByLocation`) que `ListInsumosUseCase` ya devuelve.

*   **US:** `US-025` · **Slice:** `stock` UI · **SP:** 2 · **Prioridad:** 🔴 P0 — bug reportado en vivo
*   **Prerrequisitos:** `TK-096-FE` (selectores de sub-sector)

## 🔀 Alcance (UI)
*   `stock.service.ts`: `StockByLocationEntry` pasa a exportado.
*   `WarehouseExtractionModal.tsx`: el `Insumo` local conserva `stockByLocation`; helper `stockAtSector(insumo, sectorId)`.
*   El selector "Sector de Bodega Origen" muestra un `hint` en vivo ("Disponible en este sector: X / total en bodega: Y"), recalculado al cambiar de insumo o de sector (usa el prop `hint` de `StorageSectorSelect`, ya existente pero sin cablear para este selector).
*   `extractionValidationError`: nueva verificación cliente — si el sub-sector de origen elegido no alcanza para la cantidad solicitada, bloquea el submit con un mensaje claro **antes** de tocar la red, en vez de que el operario lo descubra recién con el `422`.

## ✅ DoD
1. Test que reproduce el caso reportado (insumo con stock total > 0 pero 0 en el sub-sector auto-seleccionado): el aviso se ve antes de confirmar, y el submit se bloquea sin llamar a `/stock/extraction`.
2. Fixtures de los tests existentes de `WarehouseExtractionModal` actualizadas con `stockByLocation` realista (antes vacío — la validación nueva las habría bloqueado a todas).
3. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
4. **Commit:** `fix(stock): warn and block extraction when the origin sector lacks the insumo's stock (TK-106-FE)`.
