---
document: technical_ticket
id: TK-085-FE
related_story: US-023
points: 8
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-023.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
  - docs/02_architecture_design/04_technical_design.md
  - docs/00_stack_manifest.md
  - DESIGN.md
---

# 🎟️ TK-085-FE: Adopción de react-router + Shell de Rutas FEFO (`AppShell` + `ProtectedRoute`)

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-084-FE](./TK-084-FE.md) | [Siguiente: TK-086-FE](./TK-086-FE.md)

---

## 📝 Descripción
Ticket fundacional de `US-023`. Introduce `react-router-dom@7.18.3` (data router) en el frontend — hoy una sola página sin routing — y reestructura `App.tsx` alrededor de un componente `<AppShell>` (barra lateral tipo comanda + topbar de navegación) que envuelve las 5 rutas de nivel superior. Mueve el gating de acceso administrativo desde `AdminDropdownMenu` a una guarda de ruta `<ProtectedRoute>`. Los tickets `TK-086-FE`/`TK-087-FE` heredan este shell; `TK-088-FE` audita el resultado.

**Prerrequisito ya resuelto:** enmienda al stack manifest (`docs/00_stack_manifest.md` §4 v1.13.0, Guard 24) aprobada por el humano el 2026-09-02.

---

## 🔀 Alcance de Modificación (Frontend Architecture)

* **`apps/frontend/package.json`:** agrega `react-router-dom` pineado **exacto** a `7.18.3` (sin `^`). Verificar tras `pnpm install` que `pnpm why react-router-dom` resuelve `7.18.3` y que `react-router` transitivo queda en la línea `7.x` (nunca `8.x`, que exige React 19).
* **`docs/04_governance_and_quality/rules/react-router_rules.md` (NUEVO):** generado por `SK-27` sintetizando **exclusivamente** desde `reactrouter.com` (Guard 34, fuente confirmada por el humano en `US-023`). Cubre como mínimo: uso de `createBrowserRouter`/`RouterProvider` (no `<BrowserRouter>`), `<Outlet />` para layouts anidados, `<Navigate replace>` para redirecciones de guarda, `useNavigate`/`<Link>`/`<NavLink>` (nunca `window.location`), y la prohibición de `loader`/`action` que llamen servicios sin sanitización Zod (Guard 8). Enlazar desde `docs/04_governance_and_quality/rules/frontend_rules.md`.
* **`apps/frontend/src/app/router.tsx` (NUEVO):** define el `createBrowserRouter` con la ruta raíz `<AppShell>` y sus hijas:

  | Path | Elemento | Guarda |
  | :--- | :--- | :--- |
  | `/` (index) | tablero FEFO de cocina (contenido actual de `App.tsx`) | sesión |
  | `/estaciones` | extracción de bodega + ubicaciones + reabastecimiento | sesión |
  | `/recetas` | `features/recipes` (Recetario) | sesión |
  | `/reportes` | `ReportsDashboard` | `requiredRole="ADMIN"` |
  | `/ajustes` | configuración + usuarios + roles + historial de movimientos | `requiredRole="ADMIN"` |
  | `*` | `<Navigate to="/" replace />` | — |

* **`apps/frontend/src/app/AppShell.tsx` + `AppShell.module.css` (NUEVOS):** grid `88px 1fr`; barra lateral (`background: var(--rule)`, wordmark vertical desde `SystemSettings` con fallback `"RestoStock"`, 2 perforaciones `aria-hidden`); topbar con `<nav>` de `<NavLink>` (clase activa → `border-bottom: 3px solid var(--color-primary)`), indicador `● Conectado`, `UserBadge`, `Cerrar Sesión` y el `ThemeToggle` de `US-022`. Breakpoint `sm`: sidebar → franja superior de 44px. Sin `style={{}}` inline (Guard 29): todo en `AppShell.module.css` desde la escala de tokens.
* **`apps/frontend/src/app/ProtectedRoute.tsx` (NUEVO):** sin sesión → render de `PinLoginModal` (preserva el flujo actual, incluida la ruta pedida para aterrizar tras login); con sesión y sin `requiredRole` satisfecho → `<Navigate to="/" replace />`. Compara `currentUser.role` (realineación futura con `US-015` Dynamic RBAC documentada, no bloqueante).
* **`apps/frontend/src/App.tsx`:** se reduce a montar `<RouterProvider router={router} />` + los providers globales que hoy viven en el árbol (`useIdleTimeout`, listener `restostock:unauthorized`, manejo de `resetToken` de la URL — este último se reexpresa como ruta/searchParam con `react-router`). El JSX del tablero se extrae a `src/app/routes/InventarioRoute.tsx`.
* **`apps/frontend/src/main.tsx`:** sin cambios más allá de seguir renderizando `<App />`.
* **`apps/frontend/src/features/security/components/AdminDropdownMenu.tsx`:** deja de ser el punto de gating; se conserva solo como acceso rápido dentro de `/ajustes` o se elimina si queda sin referencias (Guard 5 — `knip`).
* **Tests:** los tests que renderizan `<App />` o pantallas sueltas se envuelven en `createMemoryRouter`/`<MemoryRouter>` con la ruta inicial adecuada. No se modifica ninguna aserción de comportamiento (`US-023` Escenario 3).

**Fuera de alcance:** los 3 componentes visuales nuevos (`TK-086-FE`), el panel Estado de 3 cubetas y la leyenda numérica (`TK-087-FE`), la auditoría de contraste (`TK-088-FE`). Convertir en rutas los flujos que hoy son modales (decisión explícita `US-023` Pregunta 5: no se hace).

---

## ✅ Criterios de Aceptación & DoD

1. **Deep-link + atrás (US-023 Escenario 1):** `/recetas` recargado renderiza el Recetario; el botón "atrás" vuelve a `/` mediante navegación cliente (sin full reload).
2. **Ruta protegida (US-023 Escenario 2):** un usuario no-`ADMIN` que abre `/reportes` termina en `/` sin que el contenido de Reportes llegue al DOM.
3. **Sesión ausente (US-023 Escenario 4):** abrir cualquier ruta sin sesión muestra `PinLoginModal`; tras autenticarse el usuario aterriza en la ruta solicitada.
4. **Cero regresión funcional (US-023 Escenario 3):** `pnpm --filter frontend test -- --run` en verde sin cambiar aserciones de comportamiento.
5. **Pin exacto verificado (Guard 30):** `react-router-dom@7.18.3` exacto; `react-router` transitivo en `7.x`; `pnpm --filter frontend run build` sin warnings de peer-deps de React.
6. **Regla de codificación (Guard 34):** `docs/04_governance_and_quality/rules/react-router_rules.md` existe, sintetizado solo desde `reactrouter.com`, enlazado desde `frontend_rules.md`.
7. **Guard 29:** 0 `style={{}}` inline nuevos; clases desde la escala de tokens `--space-*`/`--fs-*`.
8. **Verificación:** `pnpm --filter frontend run lint`, `pnpm --filter frontend run build`, `bash docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh` — 0 errores en el diff del ticket.
9. **Objetivo táctil:** todo enlace de nav y botón del shell ≥48px.
