---
document: technical_ticket
id: TK-116-FE
related_story: US-031
points: 3
type: frontend
status: draft
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-031.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
---

# 🎟️ TK-116-FE: Barra de Herramientas Acoplada en el Catálogo de Bodega (Frontend)

> [⬅️ US-031](../../../11_user_stories/shared/US-031.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Fusión selectiva del mockup `05_bodega_catalog.html` (Stitch) — `US-031` Escenario 4. `BodegaRoute` gana una franja de búsqueda + filtro + alternador de vista (grid/lista) anclada directamente sobre la tabla del catálogo, en vez de que cada control viva por separado. El alternador persiste la preferencia por dispositivo, igual patrón que el interruptor de turno día/noche (`useFefoTheme`).

*   **US:** `US-031` · **Slice:** `stock` UI · **SP:** 3 · **Prioridad:** 🟢 P2
*   **Prerrequisitos:** verificar antes de codificar si `BodegaRoute` ya tiene búsqueda/filtro en otro lugar del layout — evitar duplicar controles ya existentes, solo reubicar/acoplar.

## 🔀 Alcance (UI)
*   Nuevo `CatalogToolbar` (`features/stock/components/`): input de búsqueda + filtro + toggle grid/lista, franja `bg-card` con borde inferior, montada inmediatamente sobre la tabla/grilla.
*   Persistencia del alternador grid/lista: `localStorage`, misma convención de clave/lectura que `useFefoTheme.ts`.
*   Sin cambios al modelo de datos ni a los use cases de backend — puramente de layout/estado de UI.

## ✅ DoD
1. **Test de componente:** el toggle cambia entre vista grid y lista y la preferencia persiste tras remount (mock de `localStorage`); la búsqueda/filtro siguen filtrando el mismo set de insumos que antes (sin regresión de comportamiento, solo de ubicación/estilo).
2. Sin duplicación de controles existentes; sin regresiones.
3. `pnpm lint`/`pnpm test`/`pnpm build` verdes.
4. **Commit:** `feat(stock): docked search/filter/view toolbar on warehouse catalog (TK-116-FE)`.

## 📌 Notas de implementación
*   Pendiente de implementación.
