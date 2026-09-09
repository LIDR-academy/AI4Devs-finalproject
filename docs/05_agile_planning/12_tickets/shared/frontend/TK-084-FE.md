---
document: technical_ticket
id: TK-084-FE
related_story: US-022
points: 5
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-022.md
  - docs/05_agile_planning/12_tickets/shared/frontend/TK-081-FE.md
---

# 🎟️ TK-084-FE: Sistema FEFO — Backoffice y Administración

> **Navegación del Framework SDD:**
> [⬅️ Anterior: TK-083-FE](./TK-083-FE.md) | [📖 Índice de Tickets](../../indice_tickets.md)

---

## 📝 Descripción
Cierra `US-022`: extiende `TK-081-FE` (prerrequisito) a las pantallas administrativas/de backoffice — el equivalente, para este ciclo, de lo que `TK-068` hizo para la migración v2.0.0. Es el ticket más grande de los cuatro por la cantidad de paneles involucrados; puede sub-dividirse en Stage 2 si su implementación real supera el punto de quiebre de un ticket atómico (precedente: `TK-057`/`TK-069` para `catalog`/`recipes`).

*   **Módulo / Vertical Slice:** `shared` (afecta `reports`, `auth` [gestión de personal], `catalog`, `recipes`, `stock` [ubicaciones], `security`, `settings`)
*   **Prerrequisito estricto:** `TK-081-FE` mergeado y verificado. No depende de `TK-082-FE`/`TK-083-FE`.

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **`apps/frontend/src/features/reports/components/ReportsDashboard.tsx` (+ módulo CSS):** incluye las tarjetas de KPI de `TK-078-FE`/`TK-079-FE` (costeo de mermas, TRR real) — confirmar que sus chips de estado sigan siendo legibles en ambos turnos.
*   **`apps/frontend/src/features/auth/components/UserManagementPanel.tsx`, `UserStatusForm.tsx`.**
*   **`apps/frontend/src/features/stock/components/MovementHistoryPanel.tsx`, `LocationsManagementModal.tsx`, `WarehouseExtractionModal.tsx` (si quedó algo fuera de `TK-082-FE`).**
*   **`apps/frontend/src/features/catalog/components/CatalogManagementPanel.tsx`, `apps/frontend/src/features/recipes/components/*` (`RecipeCatalogPanel.tsx`, `CreateRecipeForm.tsx`, `InsumoCatalogPanel.tsx`, `CreateInsumoModal.tsx`).**
*   **`apps/frontend/src/features/settings/components/RestaurantSettingsModal.tsx`.**
*   **`apps/frontend/src/features/security/components/RolesManagementModal.tsx`, `AdminDropdownMenu.tsx`, `SectionTabs.tsx` (compartido).**
*   **Confirmar alcance exacto de ficheros en Stage 2** — esta lista es de planificación (basada en los módulos conocidos del backlog), no una auditoría de código ya ejecutada como sí lo fue `TK-067`.

---

## ✅ Criterios de Aceptación & DoD
1. Todo panel de backoffice listado se ve consistente con el resto de la app ya migrada (`TK-081-FE`/`082`/`083`), en ambos turnos.
2. Cero cambio de comportamiento — tests RTL existentes en verde sin tocar aserciones de comportamiento.
3. Ningún literal hex hardcodeado nuevo ni residual de la paleta v3.0.0.
4. Tras este ticket, `docs/02_architecture_design/05_ui_ux_design_system.md` y `DESIGN.md` quedan como única fuente de verdad vigente — sin mención residual de "Señal Industrial" como tema activo (puede conservarse como nota histórica de versión anterior).
5. `pnpm --filter frontend test -- --run`, `build`, `lint` — 0 errores.
