# 🔐 Informe de Auditoría de Seguridad — AUDIT-SEC-002

* **ID Auditoría:** AUDIT-SEC-002
* **Fecha:** 2026-09-04
* **Auditor:** Sesión de continuación de `US-015`/`TK-073` (RBAC dinámico) — el humano pidió "cerrar US-015/TK-073 (permisos finos)"; al verificar el estado real antes de conectar `authorizePermissions` a rutas, se encontró este hallazgo no documentado hasta ahora.
* **Alcance:** `/api/v1/roles` (gestión de roles y permisos, `TK-073`).
* **Método:** Lectura de código (`app.ts`, `roles.controller.ts`) + confirmación mediante el único test existente de esas rutas, que corre con `requireAuth: false` y por lo tanto nunca ejerció el guard de autorización real.

---

## 📋 Resumen ejecutivo

| # | Severidad | Título | Estado |
| :-- | :-- | :-- | :-- |
| **F-1** | 🔴 **Crítica** | `/api/v1/roles` (crear rol, `PUT /:id/permissions`, `DELETE /:id`, y ambas lecturas) no verifica rol ni permiso alguno — solo autenticación | **Confirmada, corregida en `TK-117`** |

---

## 🚨 Hallazgo detallado

### F-1 — 🔴 Crítica: gestión de roles y permisos sin control de acceso

**Path de datos:**

1. `app.ts:264` monta `/api/v1/roles` con `...guard` — donde `guard = isAuthRequired ? [authMiddleware] : []` (`app.ts:256`). `authMiddleware` solo verifica que el JWT sea válido, no el rol.
2. `roles.controller.ts` (`registerRoleQueryRoutes`/`registerRoleMutationRoutes`, antes de `TK-117`) monta las 5 rutas (`GET /`, `GET /permissions`, `POST /`, `PUT /:id/permissions`, `DELETE /:id`) sin ningún middleware adicional — a diferencia de cada otra ruta administrativa del sistema (`GET /users` en `auth.routes.ts` sí exige `requireRole('ADMIN')`).
3. Consecuencia: **cualquier usuario autenticado, de cualquier rol (incluido `KITCHEN_STAFF`)**, puede:
   - Reescribir la matriz de permisos de cualquier rol existente, incluido `ADMIN` (`PUT /api/v1/roles/role-admin/permissions`).
   - Crear un rol nuevo con cualquier combinación de permisos, incluido `roles:manage`/`users:manage`.
   - Eliminar cualquier rol no protegido explícitamente (`role-admin`/`role-kitchen` sí están protegidos por nombre en `roles.controller.ts:82`, pero un rol personalizado no).
4. El único test existente (`tests/security/RolesController.test.ts`, de `TK-073`) usa `createApp({ requireAuth: false })` — nunca adjunta un JWT con un rol distinto de ADMIN, así que nunca ejerció el guard de autorización con autenticación real activada (el modo por defecto en producción, Guard 15).

**Por qué no se detectó en `AUDIT-SEC-001`:** ese audit (F-3) cubrió específicamente las rutas de *mutación de cocina/stock* (`TK-093`); no incluyó `/api/v1/roles`, que en ese momento (antes de `TK-073` estar más avanzado) tenía menos superficie y no era el foco del Pilar 2 de ese informe.

**Corrección (`TK-117`):** las 5 rutas exigen `authorizePermissions(roleRepo, 'roles:manage')`. Sin cambio de acceso real hoy (solo `ADMIN` tiene ese permiso en el seed actual), pero cierra el hueco para cuando exista un rol personalizado con `roles:manage` concedido explícitamente — y, sobre todo, impide que cualquier usuario autenticado low-privilege escale reescribiendo permisos de otros roles.

**Verificación:** `tests/security/RolesRbac.test.ts` (nuevo) — `KITCHEN_STAFF` y un rol desconocido reciben `403` en las 5 rutas; `ADMIN` mantiene acceso total.

---

## 🔗 Relacionado
* [`AUDIT-SEC-001`](./AUDIT-SEC-001-security-posture-report.md) — mismo pilar (RBAC / default-deny), hallazgo distinto (rutas de mutación de cocina/stock, ya cerrado en `TK-093`).
* [`US-015`](../05_agile_planning/11_user_stories/security/US-015.md) / [`TK-073`](../05_agile_planning/12_tickets/security/backend/TK-073.md) — el diseño de permisos finos que este hallazgo termina de conectar.
* [`TK-117`](../05_agile_planning/12_tickets/security/backend/TK-117.md) — ticket de remediación.
