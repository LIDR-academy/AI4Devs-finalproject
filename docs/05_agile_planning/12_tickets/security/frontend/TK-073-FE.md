---
ticket: TK-073-FE
title: Frontend — Roles & Permission Management UI & Role-Based Autoredirection
epic: Seguridad y Control de Acceso
user_story: US-015
status: BACKLOG
---

# 🎟️ Ticket Técnico: TK-073-FE — Frontend Dynamic RBAC UI

## 🎯 Objetivo
Desarrollar el panel de administración de roles y permisos (`RolesService`, `RolesManagementModal.tsx`), la matriz táctil de checkboxes por módulo y la lógica de autoredirección al iniciar sesión según los permisos del usuario activo.

---

## 🛠️ Tareas Técnicas
1. Crear `RolesService` en `src/features/security/services/roles.service.ts`.
2. Implementar `RolesManagementModal.tsx` con soporte táctil (mínimo 48px) para seleccionar/deseleccionar permisos por módulo.
3. Adaptar el flujo de autenticación en `App.tsx` para autoredirigir a la pestaña de **Cocina** si tiene el permiso `kitchen:recipe_prepare`, o a **Bodega** si su rol no lo posee.
4. Ocultar o deshabilitar dinámicamente botones del dashboard principal si el usuario activo carece del permiso correspondiente.

---

## 🧪 Plan de Pruebas
- Pruebas unitarias de renderizado para `RolesManagementModal.test.tsx`.
- Verificación de autoredirección post-login según el objeto de permisos recibido del backend.
