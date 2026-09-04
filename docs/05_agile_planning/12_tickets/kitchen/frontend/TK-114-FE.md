---
document: technical_ticket
id: TK-114-FE
related_story: US-031
points: 2
type: frontend
status: draft
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-031.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
---

# 🎟️ TK-114-FE: Botón de Acción Rápida Circular en el Tablero de Cocina (Frontend)

> [⬅️ US-031](../../../11_user_stories/shared/US-031.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Fusión selectiva del mockup `02_kitchen_dashboard.html` (Stitch) — `US-031` Escenario 2. Junto a `FEFOInventoryHealthBar` en Inventario, un botón circular de **72×72px** (mismo tamaño y misma excepción de `border-radius: 9999px` que el botón de acción circular de `US-023`, no un token nuevo) para disparar "Extraer de Bodega" con un solo toque, como atajo adicional a los botones por fila ya existentes.

*   **US:** `US-031` · **Slice:** `kitchen` UI · **SP:** 2 · **Prioridad:** 🟢 P2
*   **Prerrequisitos:** ninguno (`WarehouseExtractionModal` ya existe)

## 🔀 Alcance (UI)
*   `InventarioRoute.tsx`: nuevo `QuickActionButton` (o reuso del componente circular de `US-023` si ya es genérico — verificar antes de duplicar) montado junto a `FEFOInventoryHealthBar`, `aria-label="Extraer de Bodega"`, abre el mismo `WarehouseExtractionModal` que ya usan los botones por fila.
*   No se renderiza si el usuario no tiene permiso de extracción (mismo gating por rol ya aplicado a los botones existentes).

## ✅ DoD
1. **TDD:** el botón está presente en Inventario para un usuario con permiso de extracción, ausente para uno sin él; un click abre `WarehouseExtractionModal` (mismo componente, no una copia).
2. Objetivo táctil ≥72×72px verificado; sin regresiones en los botones por fila existentes.
3. `pnpm lint`/`pnpm test`/`pnpm build` verdes.
4. **Commit:** `feat(kitchen): circular quick-action button for warehouse extraction on dashboard (TK-114-FE)`.

## 📌 Notas de implementación
*   Pendiente de implementación.
