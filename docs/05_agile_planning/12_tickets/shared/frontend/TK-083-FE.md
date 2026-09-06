---
document: technical_ticket
id: TK-083-FE
related_story: US-022
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/shared/US-022.md
  - docs/05_agile_planning/12_tickets/shared/frontend/TK-081-FE.md
---

# 🎟️ TK-083-FE: Sistema FEFO — Autenticación Táctil (PIN)

> **Navegación del Framework SDD:**
> [⬅️ Anterior: TK-082-FE](./TK-082-FE.md) | [📖 Índice de Tickets](../../indice_tickets.md) | [Siguiente: TK-084-FE](./TK-084-FE.md)

---

## 📝 Descripción
Extiende `TK-081-FE` (prerrequisito) a las pantallas de autenticación por PIN — la primera pantalla que ve cualquier operario, y la que tiene el requisito de objetivo táctil más estricto (64×64px). Es su propio ticket, separado de `TK-082-FE`, porque el teclado de PIN tiene reglas de ergonomía dedicadas (`DESIGN.md` `pin-key`) que no aplican al resto de los modales.

*   **Módulo / Vertical Slice:** `shared` (afecta `auth`)
*   **Prerrequisito estricto:** `TK-081-FE` mergeado y verificado.

---

## 🔀 Alcance de Modificación (Frontend Architecture)
*   **`apps/frontend/src/features/auth/components/PinLoginModal.tsx`, `PinPad.tsx` (+ módulos CSS):** teclas de PIN mantienen el mínimo 64×64px; radio de esquina y borde migran al lenguaje visual del Sistema FEFO (bordes gruesos en vez de radios suaves).
*   **`apps/frontend/src/features/auth/components/ForceChangePinModal.tsx`, `ResetPinModal.tsx`, `ForgotPinModal.tsx` (+ módulos CSS).**
*   **`apps/frontend/src/shared/components/AccessDeniedState.tsx`:** pantalla de acceso restringido, compartida entre módulos.
*   **`DESIGN.md`:** el bloque `components.pin-key` del frontmatter se actualiza a los valores del nuevo turno (radio, color) manteniendo `height`/`width: 64px` sin cambios.

---

## ✅ Criterios de Aceptación & DoD
1. Ningún botón del teclado de PIN baja de 64×64px como efecto de este ticket.
2. Login por PIN, cambio forzado y recuperación de PIN funcionan sin regresión en ambos turnos Día/Noche.
3. Cero cambio de comportamiento — tests RTL existentes (`PinLogin.test.tsx`, etc.) en verde sin tocar aserciones de comportamiento.
4. `pnpm --filter frontend test -- --run`, `build`, `lint` — 0 errores.
