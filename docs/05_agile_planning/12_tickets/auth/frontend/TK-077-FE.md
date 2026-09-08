---
document: technical_ticket
id: TK-077-FE
related_story: US-018
points: 3
type: frontend
status: done
inputs:
  - docs/05_agile_planning/11_user_stories/auth/US-018.md
  - docs/05_agile_planning/12_tickets/auth/backend/TK-077.md
---

# 🎟️ TK-077-FE: Frontend Admin PIN Recovery UI (Modal & Reset Screen)

> **Navegación del Framework SDD:**  
> [📖 Índice de Tickets](../../indice_tickets.md) | [Anterior: TK-077](../backend/TK-077.md)

---

## 📝 Descripción
Implementa los componentes visuales e interactivos en React para el flujo de recuperación de PIN del Administrador:
1. Enlace táctil *"¿Olvidó su PIN de Administrador?"* en el teclado de acceso (`PinLoginModal.tsx`).
2. Modal de Solicitud por Email (`ForgotPinModal.tsx`) con validación de formato y mensaje de confirmación amigable.
3. Modal / Vista de Restablecimiento de PIN (`ResetPinModal.tsx`) cuando el usuario accede mediante el enlace con token (ej. `?token=...`), permitiendo configurar el nuevo PIN de 4 dígitos.

---

## 🔀 Alcance de Modificación (Frontend)
- `auth.service.ts`: Métodos `requestForgotPin(email: string)` y `resetAdminPin(token: string, newPin: string)`.
- `ForgotPinModal.tsx`: Componente táctil accesible (WCAG AAA) para ingresar el correo del Administrador.
- `ResetPinModal.tsx`: Teclado numérico táctil (targets min 48px) para ingresar el nuevo PIN de 4 dígitos.
- `errorMessageMapper.ts`: Manejo de errores de token expirado o inválido según RFC 7807.

---

## ✅ Criterios de Aceptación & DoD
1. **Touch UI Ergonomics**: Botones de mínimo 48x48px respetando el Design System v2.0.0.
2. **Sin Alertas Nativas (Guard 38)**: Toda retroalimentación de éxito o error se muestra en banners/modales integrados en la UI.
3. **Flujo Intuitivo**: Al confirmar el nuevo PIN, el sistema redirige automáticamente al login para ingresar con la nueva clave.
