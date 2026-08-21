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
*   **Estado de Implementación:** ⚠️ Spec aprobada, **sin implementar**. Ver decisión de alcance en [`15_history.md`](../../../15_history.md) (2026-08-21).

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **Componentes UI (`src/features/auth/components/`):** `UserManagementPanel.tsx` (listado + acciones de bloqueo/reactivación), `CreateUserForm.tsx` (formulario de alta con nombre/rol/PIN).
*   **State & API Service (`src/features/auth/services/`):** extender `auth.service.ts` con `createUser()` y `setUserStatus()`, reutilizando el cliente HTTP compartido de `src/shared/http/`.
*   **Control de Acceso:** el panel solo debe renderizarse/navegarse para sesiones con rol `ADMIN` (mismo patrón de guard de rol ya usado por `ReportsDashboard.tsx`).

---

## ⚠️ Mitigación de Riesgos Técnicos
1.  **Fuga de PIN en Cliente:** el formulario de alta nunca debe loguear ni persistir el PIN introducido más allá del payload de la petición; campo de tipo `password` o máscara equivalente.
2.  **Doble Envío:** deshabilitar el botón de envío mientras la petición está en curso, para evitar altas duplicadas por doble clic.
3.  **Confirmación Antes de Bloquear:** la acción de bloqueo debe pedir confirmación explícita (es una acción destructiva de acceso, no reversible sin una segunda acción del ADMIN).

---

## ✅ Criterios de Aceptación & DoD (Definition of Done)

### Criterio de Aceptación 1: Alta exitosa de operario (Happy Path)
*   **Given** un Administrador autenticado en el panel de gestión de personal
*   **When** completa el formulario con nombre, rol `KITCHEN_STAFF` y PIN válido, y confirma
*   **Then** la UI muestra la cuenta recién creada en el listado con estado `ACTIVE`, sin recargar la página completa.

### Criterio de Aceptación 2: Bloqueo con confirmación
*   **Given** un operario activo en el listado
*   **When** el Administrador pulsa "Bloquear" y confirma en el diálogo
*   **Then** la UI actualiza el estado a `BLOCKED` de forma optimista o tras respuesta `200 OK`, y permite revertir con "Reactivar".

### DoD Estricto:
1.  **Tests RTL:** pruebas de integración de componentes cubriendo alta exitosa, error de validación (400), bloqueo y reactivación.
2.  **Estados Defensivos:** Loading, Empty (sin operarios listados), Error (con reintento) y Offline, según `frontend_rules.md`.
3.  **A11y:** botones de acción ≥48px, contraste WCAG 2.2 AA, confirmación de bloqueo accesible por teclado.

---

## 🤖 Instrucciones de Ejecución Autónoma para Agente IA
1. **Fichas a crear/modificar:**
   - `apps/frontend/src/features/auth/components/UserManagementPanel.tsx`
   - `apps/frontend/src/features/auth/components/CreateUserForm.tsx`
   - `apps/frontend/src/features/auth/services/auth.service.ts` (extender)
2. **Ejecutar Suite de Pruebas Frontend:** `pnpm test apps/frontend/src/features/auth`
3. **Comando de Verificación Total:** `pnpm run build && pnpm run lint`
