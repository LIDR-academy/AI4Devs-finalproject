---
document: technical_ticket
id: TK-105-FE
related_story: US-029
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/reports/US-029.md
  - docs/02_architecture_design/adr/ADR-003-recipe-preparation-tracking.md
---

# 🎟️ TK-105-FE: Panel de Reporte de Mermas de Preparación (Frontend)

> [⬅️ US-029](../../../11_user_stories/reports/US-029.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Nueva sección en el dashboard de reportes: merma de preparación agrupada (receta → ingrediente → motivo, con `$` y % de merma, líneas sobre umbral destacadas) y consumo real vs. teórico por receta. Ajuste del umbral en `/ajustes`.

*   **US:** `US-029` · **Slice:** `reports` UI · **SP:** 3 · **MoSCoW:** Should Have · **Prioridad:** 🟢 P2 · **Diferible**
*   **Prerrequisitos:** `TK-105`, `TK-078-FE` (patrón de dashboard)

## 🔀 Alcance (UI)
*   `ReportsDashboard` — nueva pestaña/sección "Mermas de Preparación": tabla agrupada colapsable, badge `$`, columna `% merma` con marca visual sobre el umbral, orden prioritario. Detalle de receta: consumo teórico vs. real.
*   Panel de ajustes: campo `preparationWasteAlertPercent` (reusa el patrón de `criticalAlertHours`).
*   `reports.service.ts`: `getPreparationWaste(filters)`.
*   Guard 29 / Guard 38; dataviz según skill si se agregan gráficos.

## ✅ DoD
1. Test de componente: agrupación renderizada; línea sobre umbral con la marca; **sin** toast/notificación.
2. Sin regresiones frontend; sin código muerto / estilos inline nuevos.
3. **Commit:** `feat(reports): preparation-waste report panel (TK-105-FE)`.

## 📌 Notas de implementación
*   El "detalle de receta" se resolvió como una segunda sección agrupada (no un drill-down modal): cada receta con preparaciones cerradas en el rango tiene su propio `<details>` con el consumo real vs. teórico por ingrediente.
*   La agrupación colapsable usa `<details>`/`<summary>` nativos (accesible, sin JS de estado adicional).
*   `preparationWasteAlertPercent` reutiliza el patrón exacto de `criticalAlertHours` en `RestaurantSettingsPanel`.
*   De paso se corrigió que `filterRange` (Hoy/7 Días/Mes) no afectaba el rango de fechas consultado (deuda de TK-078: el cálculo quedaba fijo en 7 días) — necesario para que el nuevo panel filtre igual que el resto del dashboard.
*   `reports.service.ts.fetchPreparationWasteReport` no tiene fallback mock (C-DEV-006-3) — a diferencia de `fetchWasteReport`/`fetchRotationMetrics`, deuda preexistente de TK-078-FE fuera de alcance.
