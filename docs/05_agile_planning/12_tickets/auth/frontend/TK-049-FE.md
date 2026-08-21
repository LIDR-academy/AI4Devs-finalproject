---
document: technical_ticket
id: TK-049-FE
related_story: US-010
points: 3
type: frontend
status: approved
inputs:
  - docs/05_agile_planning/11_user_stories/auth/US-010.md
  - docs/02_architecture_design/04_technical_design.md
---

# 🎟️ TK-049-FE: Panel de Gestión de Personal (Frontend)

> **Navegación del Framework SDD:**  
> [⬅️ Volver a US-010 (11_user_stories/auth/US-010.md)](../../../11_user_stories/auth/US-010.md) | [📖 Índice de Tickets (12_indice_tickets.md)](../../indice_tickets.md) | [Siguiente: Matriz de Trazabilidad (13_matriz_trazabilidad.md) ➡️](../../../13_matriz_trazabilidad.md)

---

## 📝 Descripción
Panel de administración táctil/web para que un Administrador dé de alta operarios y bloquee/reactive cuentas existentes, consumiendo `POST /api/v1/auth/users` y `PATCH /api/v1/auth/users/{id}/status` (`TK-049`, ya implementados y verificados en backend). Sin este ticket, esas dos capacidades solo son accesibles vía `curl`/Postman.

*   **ID US Relacionada:** `US-010`
*   **Módulo / Vertical Slice:** `auth` (Frontend UI)
*   **Estimación (Story Points):** 3
*   **Prioridad MoSCoW:** Should Have
*   **Prerrequisitos:** `TK-001-FE` (Core Frontend), `TK-049` (API backend ya operativa)
*   **Estado de Implementación:** ✅ Implementado y verificado (build + 67/67 tests frontend, gate de duplicación/complejidad en verde). Ver [`15_history.md`](../../../15_history.md) (2026-08-21).
*   **Hallazgo durante la implementación:** el backend no expone ningún `GET /api/v1/auth/users` para listar operarios — solo `POST` (crear) y `PATCH .../status` (bloquear/reactivar). El panel de "Bloquear/Reactivar" pide el ID del operario manualmente en vez de mostrar una lista, con una advertencia explícita en la UI. Listar operarios queda registrado como deuda separada (nuevo endpoint de backend), no resuelta en este ticket.

---

## 🔀 Alcance de Modificación (Frontend Architecture) — como quedó implementado
*   **Componentes UI (`src/features/auth/components/`):** `UserManagementPanel.tsx` (shell modal + guard de rol + tabs), `CreateUserForm.tsx` (alta), `UserStatusForm.tsx` (bloqueo/reactivación por ID).
*   **API Service:** `src/features/auth/services/users.service.ts` (archivo nuevo, deliberadamente separado de `auth.service.ts` — `apiClient.ts` importa `AuthService` para leer el token, así que añadir estos métodos a `auth.service.ts` habría creado un ciclo de módulos), consumiendo el cliente HTTP compartido `src/shared/http/apiClient.ts`.
*   **Componente Compartido Extraído:** `src/shared/components/AccessDeniedState.tsx` — el guard de rol `ADMIN` ya se repetía en `ReportsDashboard.tsx`; se extrajo a la capa compartida en vez de duplicarlo una tercera vez (regla de reuso de `SK-17`), y `ReportsDashboard.tsx` se migró a usarlo también.

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **Fuga de PIN en Cliente:** el formulario de alta nunca loguea ni persiste el PIN introducido más allá del payload de la petición; campo `type="password"`, `autoComplete="new-password"`.
2.  **Doble Envío:** el botón de envío se deshabilita mientras la petición está en curso.
3.  **Sin Listado de Operarios (hallazgo durante implementación):** el backend no expone `GET /api/v1/auth/users`. En vez de fabricar una lista falsa, `UserStatusForm.tsx` pide el ID exacto del operario con una advertencia visible — no hay confirmación por diálogo modal porque no hay riesgo de "clickear la fila equivocada" sin lista; el riesgo residual (typo en el ID) queda documentado, no resuelto con un dialog que no lo mitigaría de todas formas.

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Alta exitosa de operario (Happy Path)
*   **Given** un Administrador autenticado en el panel de gestión de personal
*   **When** completa el formulario con nombre, rol `KITCHEN_STAFF` y PIN válido, y confirma
*   **Then** la UI muestra un mensaje de confirmación con el nombre y estado real devueltos por el backend, sin recargar la página completa.

### Criterio de Aceptación 2: Bloqueo por ID
*   **Given** un Administrador que conoce el ID de un operario activo
*   **When** ingresa el ID en la pestaña "Bloquear / Reactivar" y pulsa "Bloquear"
*   **Then** la UI confirma el nuevo estado `BLOCKED` devuelto por el backend, y permite revertir con "Reactivar".

### DoD Estricto:
1.  **Tests RTL:** 5 pruebas de integración de componentes (acceso restringido, alta exitosa con mensaje real del backend, error de validación con `ErrorBanner`, bloqueo por ID) — ver `apps/frontend/src/tests/UserManagementPanel.test.tsx`.
2.  **Estados Defensivos:** feedback inline de éxito/error tras cada acción (sin estado "Empty" — no hay listado que pueda estar vacío).
3.  **A11y:** botones táctiles `btn-touch` (≥48px), `ErrorBanner` con `role="alert"`, formularios navegables por teclado — cero errores en `eslint-plugin-jsx-a11y` (verificado con `pnpm run lint`).

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas creadas/modificadas:**
   - `apps/frontend/src/features/auth/components/UserManagementPanel.tsx`
   - `apps/frontend/src/features/auth/components/CreateUserForm.tsx`
   - `apps/frontend/src/features/auth/components/UserStatusForm.tsx`
   - `apps/frontend/src/features/auth/services/users.service.ts` (nuevo, no `auth.service.ts` — ver nota de ciclo de módulos arriba)
   - `apps/frontend/src/shared/components/AccessDeniedState.tsx` (nuevo, extraído)
   - `apps/frontend/src/App.tsx` (wiring del botón "Personal" y el modal)
   - `apps/frontend/src/tests/UserManagementPanel.test.tsx`, `apps/frontend/src/features/auth/services/users.service.test.ts`
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm --filter @restostock/frontend run test` — 67/67 en verde.
3. **Comando de Verificación Total:** `pnpm --filter @restostock/frontend run build && pnpm --filter @restostock/frontend run lint && bash docs/04_governance_and_quality/scripts/check_ticket_code_quality.sh && pnpm run duplication` — todos en verde.
