---
document: technical_ticket
id: TK-102-FE
related_story: US-026
points: 5
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/stock/US-026.md
  - docs/02_architecture_design/adr/ADR-003-recipe-preparation-tracking.md
---

# 🎟️ TK-102-FE: Destino de Cocina Dinámico y Gestión de Áreas de Cocina (Frontend)

> [⬅️ US-026](../../../11_user_stories/stock/US-026.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Reemplazar el desplegable de 3 literales fijos (`KITCHEN_FRIDGE/PREP/LINE`) del modal de extracción por uno alimentado del catálogo `StorageLocation` (`type = KITCHEN`, activas). Extender el panel de gestión de ubicaciones para administrar áreas de cocina. Cierra la deuda de `TK-074-FE`.

*   **US:** `US-026` · **Slice:** `stock` UI · **SP:** 5 · **MoSCoW:** Should Have · **Prioridad:** 🟢 P2
*   **Prerrequisitos:** `TK-102`, `TK-074-FE`, `TK-096-FE`

## 🔀 Alcance (UI)
*   `WarehouseExtractionModal.tsx` — `KitchenDestinationField`: `<select>` de literales → `<StorageSectorSelect>` filtrado por `type = KITCHEN` (nuevo prop/variante); envía `toStorageLocationId`. `buildLocalRemanenteFromExtraction` usa el id + nombre resueltos.
*   `locations.service.ts` — filtro `type` en el listado.
*   Panel de gestión de ubicaciones (`/ajustes` → estaciones): alta/edición/baja de `type = KITCHEN`; mensaje `409` traducido ("el área tiene ingredientes abiertos").
*   Tablero FEFO / `GetActiveRemanentes` UI: mostrar el nombre del área (de `storageLocationName`), no el literal.
*   Guard 29 (tokens CSS), Guard 38 (errores vía `ErrorBanner`).

## ✅ DoD
1. Test de componente: el selector de destino solo lista áreas `KITCHEN` activas; el POST manda `toStorageLocationId`; el `409` al borrar un área con remanente se muestra traducido.
2. Sin regresiones (`pnpm test` frontend / `build` / `lint`); sin código muerto / estilos inline nuevos.
3. **Commit:** `feat(stock): dynamic kitchen destination and kitchen-area management (TK-102-FE)`.
