---
document: technical_ticket
id: TK-089-FE
related_story: US-024
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-024.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
---

# 🎟️ TK-089-FE: Reportes Inline (sin `<Modal>` flotante)

> **Navegación del Framework SDD:**
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-088-FE](./TK-088-FE.md) | [Siguiente: TK-090-FE](./TK-090-FE.md)

---

## 📝 Descripción
`ReportesRoute` monta `<ReportsDashboard isOpen userRole={role} onClose={navigate('/')} />` — y `ReportsDashboard` está construido como `<Modal size="xl">`, así que `/reportes` abre un overlay flotante mientras el resto de rutas se ven inline (`US-024`). Este ticket da a `ReportsDashboard` un modo inline y limpia el andamiaje de modal muerto.

---

## 🔀 Alcance de Modificación (Frontend Architecture)

* **`apps/frontend/src/features/reports/components/ReportsDashboard.tsx`:**
  * Nuevo prop `embedded?: boolean` (default `false` para compat). Con `embedded`: renderiza el cuerpo del dashboard **sin** el `<Modal>` (sin `.modal-overlay`/`.modal-card`) y **sin** el botón "X" de `ReportsFilterBar` (`onClose`).
  * `isOpen`/`onClose` dejan de ser obligatorios cuando `embedded`; si el único consumidor pasa a ser `ReportesRoute`, eliminar `isOpen` por completo y hacer `onClose` opcional (o quitarlo). El `if (!isOpen) return null` desaparece del camino de ruta.
  * `if (userRole !== 'ADMIN') return <AccessDeniedState ...>` → código muerto para el montaje en ruta (`<ProtectedRoute requiredRole="ADMIN">` ya lo cubre en `router.tsx`). Como `ReportsDashboard` no se monta en ningún otro sitio tras `US-023` (verificar con `grep`), eliminar ese check y el import de `AccessDeniedState` (Guard 5).
* **`apps/frontend/src/app/routes/ReportesRoute.tsx`:** pasa a `<ReportsDashboard embedded userRole={currentUser.role} />` — sin `useNavigate`/`onClose` (ya no hay "cerrar", se navega por la nav).
* **`ReportsDashboard.module.css`:** ajustar cualquier clase que asumiera el ancho de la card del modal para funcionar a ancho completo del `<main>`.
* **Verificar huérfanos (Guard 5):** `<ModalHeader>` / `<Modal>` — siguen usados por los modales transitorios y por `TK-090-FE`; confirmar que no quedan sin referencias. Si `X`/`ReportsFilterBar.onClose` queda sin uso, limpiarlo.
* **Tests:** los tests de `ReportsDashboard` que dependían de `isOpen`/overlay se ajustan a la forma inline (permitido por `US-024` Escenario 4). Añadir aserción de que en `embedded` **no** hay `.modal-overlay` ni botón de cerrar.

**Fuera de alcance:** `/ajustes` y sus sub-rutas (`TK-090-FE`); routing (`TK-085-FE`).

---

## ✅ Criterios de Aceptación & DoD

1. **Inline (US-024 Escenario 1):** en `/reportes`, `ReportsDashboard` renderiza dentro del `<main>` del shell — sin `.modal-overlay`, sin card flotante, sin botón "X". Un test lo asevera.
2. **Acceso por rol intacto:** `/reportes` sigue tras `<ProtectedRoute requiredRole="ADMIN">`; un no-ADMIN que abre la URL termina en `/`.
3. **Sin código muerto (Guard 5):** `check_dead_code.sh` verde; `isOpen`/`AccessDeniedState`/`onClose` eliminados si quedaron sin uso.
4. **Cero regresión:** `pnpm --filter frontend test -- --run` verde sin cambiar aserciones de comportamiento (solo forma).
5. **Verificación:** `lint`, `build`, `check_ticket_code_quality.sh`, `check_ticket_duplication.sh`, `check_dead_code.sh` — 0 errores en el diff.
6. **Verificación visual:** captura de `/reportes` inline en Día y Noche (`SK-20`).

---

## 🧩 Implementación

* `ReportsDashboard` pierde `isOpen`/`onClose` por completo (único consumidor = `ReportesRoute`); sin `<Modal>` — envuelve en `<>…</>` con un `<header>` inline; `<h2>` → `<h1>` (consistente con las demás rutas). `ReportsFilterBar` pierde el botón "X". Eliminados: import de `Modal`, `AccessDeniedState`, `X` (lucide) — `AccessDeniedState` sigue vivo en `CatalogManagementPanel`/`MovementHistoryPanel`/`UserManagementPanel` (los limpia `TK-090-FE`); `Modal` sigue vivo en los modales transitorios.
* `ReportesRoute` → `<ReportsDashboard userRole={currentUser.role} />` (sin `useNavigate`).
* `tests/ReportsDashboard.test.tsx`: los 8 render pierden `isOpen`/`onClose`; el test del rol OPERATOR → `AccessDeniedState` se reemplaza por uno que asevera render inline (sin `.modal-overlay`, sin `#btn-close-reports`) — el gating ADMIN lo cubre `AppShellRouting.test.tsx` (no-admin en `/reportes` → `/`).
* **Verificado en el stack Docker real:** `/reportes` inline, sin overlay/X, 0 errores de consola, día y noche.
* **FASE 5.C:** sin hallazgos sistémicos.
* **Nota:** `check_dead_code.sh` lista `check_fefo_contrast.mjs` como archivo sin usar — deuda de `TK-088-FE` (script `node` de auditoría, no importado), fuera del diff de este ticket.
