---
document: technical_ticket
id: TK-090-FE
related_story: US-024
points: 8
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-024.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
  - docs/04_governance_and_quality/rules/react-router_rules.md
---

# 🎟️ TK-090-FE: Ajustes con Sub-Rutas Inline Deep-Linkables

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-089-FE](./TK-089-FE.md)

---

## 📝 Descripción
`/ajustes` es hoy una pantalla única con 5 tarjetas que abren 5 `<Modal>` (`RestaurantSettingsModal`, `UserManagementPanel`, `RolesManagementModal`, `MovementHistoryPanel`, `CatalogManagementPanel`), sin URL propia por sección. `US-024` lo convierte en un **layout route** con `<nav>` de sub-pestañas + `<Outlet>` y 5 sub-rutas inline deep-linkables.

---

## 🔀 Alcance de Modificación (Frontend Architecture)

* **`apps/frontend/src/app/router.tsx`:** la entrada `ajustes` pasa de `element` único a un árbol:
  ```
  { path: 'ajustes', element: <ProtectedRoute requiredRole="ADMIN"><AjustesLayout/></ProtectedRoute>, children: [
      { index: true, element: <Navigate to="configuracion" replace /> },
      { path: 'configuracion', element: <ConfiguracionRoute/> },
      { path: 'personal',      element: <PersonalRoute/> },
      { path: 'roles',         element: <RolesRoute/> },
      { path: 'movimientos',   element: <MovimientosRoute/> },
      { path: 'catalogo',      element: <CatalogoRoute/> },
  ]}
  ```
  El `<ProtectedRoute>` envuelve el layout, así que cubre las 5 sub-rutas de una vez.
* **`apps/frontend/src/app/routes/ajustes/AjustesLayout.tsx` + `.module.css` (NUEVO):** `<h1>Ajustes y Administración</h1>` + barra de sub-pestañas (`<NavLink>` a cada sub-ruta, clase activa; conforme a `react-router_rules.md` §4) + `<Outlet/>`. Sustituye el `AjustesRoute` de tarjetas actual.
* **`apps/frontend/src/app/routes/ajustes/*.tsx` (NUEVOS, 5):** cada uno monta su panel en modo `embedded` (ver abajo). Triviales (`export const PersonalRoute = () => <UserManagementPanel embedded userRole={...}/>`).
* **Los 5 paneles administrativos** (`RestaurantSettingsModal`, `UserManagementPanel`, `RolesManagementModal`, `MovementHistoryPanel`, `CatalogManagementPanel`):
  * Nuevo prop `embedded?: boolean` (default `false`). Con `embedded`: sin `<Modal>` ni `<ModalHeader>` ni botón "X"; renderiza su cuerpo inline en el `<main>`.
  * `isOpen`/`onClose` → opcionales/eliminados si el único consumidor pasa a ser la sub-ruta (verificar con `grep` que ninguno se monta en otro sitio tras `US-023`).
  * `if (userRole !== 'ADMIN') return <AccessDeniedState>` → código muerto (lo cubre `<ProtectedRoute>` sobre el layout); eliminar + import (Guard 5).
  * Renombrar los ficheros `*Modal.tsx` que dejen de ser modales (`RolesManagementModal` → `RolesManagementPanel`, `RestaurantSettingsModal` → `RestaurantSettingsPanel`) — con sus tests e imports.
  * `RestaurantSettingsModal` usa `<ModalFooterActions>` con `onCancel` → en inline, el guardar/cancelar pasa a un patrón de página (botón guardar visible, sin "cancelar" que cierre un modal). `CatalogManagementPanel` ya usa `<SectionTabs>` internamente con `InsumoCatalogPanel`/`RecipeCatalogPanel` (inline) → simplemente quitar el `<Modal>` externo.
* **Formularios transitorios internos** (`CreateInsumoModal`, `CreateRecipeModal`, `RestockInsumoModal`, `EditingUserForm`/alta, confirmaciones de borrado de rol/ubicación) → **siguen como `<Modal>`**, lanzados desde el panel inline.
* **`apps/frontend/src/features/security/components/AdminDropdownMenu`** ya se eliminó en `TK-085-FE` — nada que hacer ahí.
* **Huérfanos (Guard 5):** tras mover 5 paneles a inline, revisar si `ModalHeader`/`ModalFooterActions`/`AccessDeniedState` quedan sin uso (probablemente `ModalHeader` sigue vivo en `WarehouseExtractionModal` etc.; `AccessDeniedState` podría quedar huérfano → eliminar).
* **Tests:** `UserManagementPanel`/`RolesManagement*`/`MovementHistoryPanel`/`RestaurantSettings*`/`CatalogManagementPanel` — ajustar los que dependían de `isOpen`/overlay a la forma inline. Nuevo test de shell (`AppShellRouting.test.tsx` o similar): deep-link a `/ajustes/personal` renderiza el panel de personal; `/ajustes` redirige a `/ajustes/configuracion`; un no-ADMIN en `/ajustes/roles` → `/`.

---

## ✅ Criterios de Aceptación & DoD

1. **Sub-rutas deep-linkables (US-024 Escenario 2):** `/ajustes/personal` recargado renderiza Personal; pulsar otra pestaña cambia la URL; el botón "atrás" vuelve por transición cliente.
2. **`/ajustes` redirige** a `/ajustes/configuracion` (index route con `<Navigate replace>`).
3. **Inline:** ninguna de las 5 secciones renderiza `.modal-overlay` ni botón "X" de cerrar (test).
4. **Acceso por rol (US-024 Escenario 3):** el `<ProtectedRoute requiredRole="ADMIN">` sobre el layout protege las 5 sub-rutas; un no-ADMIN que abre cualquiera termina en `/`.
5. **Sin código muerto (Guard 5):** `check_dead_code.sh` verde; `isOpen`/`onClose`/`AccessDeniedState` eliminados donde quedaron sin uso; ficheros `*Modal.tsx` renombrados.
6. **Cero regresión (US-024 Escenario 4):** `pnpm --filter frontend test -- --run` verde sin cambiar aserciones de comportamiento; los flujos de alta/edición (que siguen como modal) funcionan igual.
7. **Verificación:** `lint`, `build`, `check_ticket_code_quality.sh`, `check_ticket_duplication.sh`, `check_dead_code.sh` — 0 errores en el diff; `react-router_rules.md` respetado (smoke test del árbol de `router.tsx` extendido con las sub-rutas de ajustes).
8. **Verificación visual (`SK-20`):** capturas de las 5 sub-rutas en Día y Noche.
