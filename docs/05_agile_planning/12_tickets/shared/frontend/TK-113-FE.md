---
document: technical_ticket
id: TK-113-FE
related_story: US-031
points: 2
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-031.md
  - docs/02_architecture_design/05_ui_ux_design_system.md
---

# 🎟️ TK-113-FE: Chips de Operario Reciente en el Login (Frontend)

> [⬅️ US-031](../../../11_user_stories/shared/US-031.md) | [📖 Índice](../../indice_tickets.md)

## 📝 Descripción
Fusión selectiva del mockup `01_login_pinpad.html` (Stitch) — `US-031` Escenario 1. `PinLoginModal` pide hoy el ID de operario como texto libre (deliberadamente, desde que se retiró la lista fija de 2 operarios de fixtures — no hay endpoint que liste operarios reales). Se añaden hasta 3 chips táctiles con los últimos IDs que iniciaron sesión **en ese dispositivo**, para no volver a tipear el ID en cada turno, sin reintroducir ninguna lista simulada de usuarios.

*   **US:** `US-031` · **Slice:** `auth` UI · **SP:** 2 · **Prioridad:** 🟢 P2
*   **Prerrequisitos:** ninguno

## 🔀 Alcance (UI)
*   Nuevo `apps/frontend/src/features/auth/recentOperators.ts`: `getRecentOperatorIds()` / `rememberOperatorId(id)` sobre `localStorage` (clave dedicada, máx. 3 ids, más reciente primero, sin duplicados).
*   `AuthService.loginWithPin` (o el `onSuccess` de `PinLoginModal`) llama `rememberOperatorId(selectedUserId)` tras un login exitoso — nunca el PIN.
*   `PinLoginModal.tsx`: nuevo `RecentOperatorChips` bajo `UserSelector`, oculto si `getRecentOperatorIds()` está vacío; un tap en un chip llama `setSelectedUserId`, no dispara submit.
*   Estilo (`PinLoginModal.module.css`): chip con `border: 1px solid var(--rule)`, `font-family-mono`, altura ≥ 32px (no es un target primario de 48px — es un atajo secundario).

## ✅ DoD
1. **TDD:** dispositivo sin historial → sin chips. Login exitoso de `op-1` luego `op-2` → chips `[op-2, op-1]` (más reciente primero), sin duplicados si `op-1` vuelve a loguear. Tap en un chip rellena el campo sin loguear.
2. Sin regresiones frontend; `pnpm lint`/`pnpm test`/`pnpm build` verdes.
3. **Commit:** `feat(auth): recent-operator chips on PIN login, device-local (TK-113-FE)`.

## 📌 Notas de implementación
*   `recentOperators.ts` nuevo (`features/auth/`): `getRecentOperatorIds()`/`rememberOperatorId(id)`, misma convención de `useFefoTheme.ts` (clave kebab-case dedicada `fefo-recent-operators`, try/catch alrededor de `localStorage`, `console.error` con prefijo `[PinLoginModal]`). Máx. 3 ids, más reciente primero, sin duplicados (relogear mueve al frente en vez de repetir).
*   `PinLoginModal.tsx`: `rememberOperatorId(selectedUserId)` se llama solo tras un login exitoso (nunca el PIN se toca); `RecentOperatorChips` se oculta por completo (`return null`) si no hay historial — no hay estado vacío visible.
*   7 tests unitarios de `recentOperators.ts` + 3 tests de integración en `PinLogin.test.tsx` (sin chips en dispositivo nuevo, chip aparece tras login exitoso, tap en chip rellena sin loguear).
*   Sin regresiones: 184 tests frontend (174→184), build/lint verdes (0 warnings nuevos).
