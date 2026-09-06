# US-002 — Gestión de Usuarios

## [original] Historia de Usuario

**Como** administrador del taller,
**quiero** crear y desactivar cuentas de usuario,
**para** controlar quién tiene acceso al sistema y con qué rol.

## [enhanced] Historia de Usuario

**Como** administrador del taller,
**quiero** crear cuentas de empleados (administrador o mecánico), consultar el listado de usuarios y desactivar cuentas que ya no deben acceder al sistema,
**para** controlar el acceso a MecaTrack sin perder el historial operativo (órdenes de trabajo y tareas) asociado a usuarios desactivados.

**Alcance MVP:** CRUD limitado — alta de usuario, listado y desactivación (soft delete). Solo rol `ADMIN`. Fuera de alcance: edición de perfil, reactivación de cuenta, eliminación física, cambio obligatorio de contraseña en primer login (V2), restablecimiento de contraseña por email.

**Dependencia:** requiere US-001 completada (`User` en Prisma, guards JWT + `RolesGuard`, login operativo).

---

## [original] Criterios de Aceptación

- [ ] El administrador puede crear un nuevo usuario con los campos: nombre completo, correo electrónico, contraseña temporal y rol (administrador / mecánico).
- [ ] El sistema valida que el correo no esté ya registrado antes de crear la cuenta.
- [ ] El administrador puede desactivar una cuenta existente; el usuario desactivado deja de poder iniciar sesión de forma inmediata.
- [ ] Los datos históricos del usuario desactivado (órdenes de trabajo asignadas, tareas completadas) se conservan intactos.
- [ ] El administrador puede consultar el listado de todos los usuarios (activos e inactivos) con su nombre, rol y estado.
- [ ] Un mecánico no puede acceder a la gestión de usuarios.

## [enhanced] Criterios de Aceptación

### UI — Gestión de usuarios (solo administrador)

- [ ] Ruta protegida: `/admin/users` — accesible solo con rol `ADMIN`; `MECHANIC` recibe redirección a `/403` o dashboard mecánico.
- [ ] Enlace **Usuarios** visible en navegación del layout admin, no en layout mecánico.

### Listado de usuarios

- [ ] Tabla con columnas: **Nombre**, **Correo**, **Rol** (Administrador / Mecánico), **Estado** (Activo / Inactivo), **Acciones**.
- [ ] Incluye usuarios activos e inactivos; orden por defecto: activos primero, luego por `fullName` ascendente.
- [ ] Indicador visual de estado (badge o etiqueta).
- [ ] Botón **Nuevo usuario** abre formulario modal o página `/admin/users/new`.
- [ ] Estado vacío: mensaje *"No hay usuarios registrados"* (solo si seed vacío).

### Crear usuario

- [ ] Formulario con campos:

| Campo UI | Campo API | Validación |
|----------|-----------|------------|
| Nombre completo | `fullName` | Obligatorio, 2–120 caracteres |
| Correo electrónico | `email` | Obligatorio, formato email; normalizar a minúsculas |
| Contraseña temporal | `password` | Obligatorio, mín. 8 caracteres |
| Rol | `role` | Obligatorio: `ADMIN` \| `MECHANIC` |

- [ ] Al guardar con éxito: mensaje de confirmación, cierre de formulario y actualización del listado sin recargar página completa.
- [ ] Email duplicado → error *"This email is already registered"* (HTTP `409`).
- [ ] La contraseña se almacena hasheada (`bcrypt`); nunca se devuelve en la respuesta API.

### Desactivar usuario

- [ ] Acción **Desactivar** disponible solo para usuarios con `active = true`.
- [ ] Diálogo de confirmación antes de desactivar: *"¿Desactivar la cuenta de {fullName}? No podrá iniciar sesión."*
- [ ] Tras desactivar: fila muestra estado **Inactivo**; botón Desactivar deshabilitado u oculto.
- [ ] El usuario desactivado no puede iniciar sesión en el siguiente intento (US-001 → `403` cuenta inactiva).
- [ ] Sesiones activas del usuario desactivado quedan invalidadas de inmediato (`refreshTokenHash = null` en BD).
- [ ] No se elimina el registro en base de datos (`DELETE` prohibido en esta US).

### Integridad de datos históricos

- [ ] Las FK existentes hacia `User` (p. ej. `WorkOrder.assignedMechanicId`, auditoría `completedBy`) permanecen sin cambios al desactivar.
- [ ] Consultas de historial de OT/tareas siguen mostrando el nombre del usuario desactivado.

### Reglas de negocio y casos límite

- [ ] El administrador autenticado **no puede desactivar su propia cuenta** → HTTP `400` *"You cannot deactivate your own account"*.
- [ ] No se puede desactivar al **último usuario `ADMIN` activo** del sistema → HTTP `400` *"At least one active administrator is required"*.
- [ ] No se permite crear usuario con email ya existente (activo o inactivo) → `409`.
- [ ] Reactivar usuarios inactivos: **fuera de MVP** (botón no visible; endpoint no expuesto).

### Autorización API y UI

- [ ] Todos los endpoints de `/api/users` exigen `JwtAuthGuard` + `RolesGuard` con rol `ADMIN`.
- [ ] `MECHANIC` que llame a la API → HTTP `403 Forbidden`.
- [ ] Intentos de acceder a `/admin/users` como mecánico → bloqueo en `ProtectedRoute` + `role === ADMIN`.

---

## [original] Roles involucrados

- Administrador (único que puede ejecutar esta funcionalidad)

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Listar, crear y desactivar usuarios |
| Mecánico | `MECHANIC` | Sin acceso (UI ni API) |

---

## [original] Notas técnicas

- El campo `activo` en la entidad usuario determina si puede autenticarse.
- Al desactivar, no se elimina el registro; se actualiza el campo `activo = false`.
- La contraseña temporal debe requerir cambio en el primer inicio de sesión (deseable, puede ser V2).

## [enhanced] Especificación técnica

### Modelo de datos

Reutiliza entidad `User` definida en US-001. Campos relevantes para esta US:

| Campo | Uso en US-002 |
|-------|----------------|
| `fullName` | Alta y listado |
| `email` | Alta (unique), listado |
| `passwordHash` | Escrito solo en create (desde `password` en DTO) |
| `role` | Alta y listado |
| `active` | `true` al crear; `false` al desactivar |
| `refreshTokenHash` | Se anula al desactivar para cerrar sesiones |

**Relaciones (integridad histórica):**

```prisma
// Ejemplo — definir en US-005+; FK sin onDelete Cascade hacia User
model WorkOrder {
  assignedMechanicId String?
  assignedMechanic   User?   @relation(fields: [assignedMechanicId], references: [id])
}
```

Al desactivar: **no** modificar `assignedMechanicId` ni registros de tareas; solo `User.active = false` y limpiar tokens.

**V2 (no implementar en MVP):** campos `mustChangePassword`, `passwordChangedAt` para forzar cambio en primer login.

### API REST

Todos los endpoints: prefijo `/api/users`, guard `@Roles('ADMIN')`.

#### `GET /api/users`

Lista todos los usuarios.

**Response `200`:**

```json
[
  {
    "id": "uuid",
    "fullName": "María López",
    "email": "maria@taller.com",
    "role": "MECHANIC",
    "active": true,
    "createdAt": "2026-05-01T10:00:00.000Z"
  }
]
```

**Errores:** `401` | `403`

#### `POST /api/users`

Crea usuario activo.

**Request body:**

```json
{
  "fullName": "Carlos Méndez",
  "email": "carlos@taller.com",
  "password": "TempPass123",
  "role": "MECHANIC"
}
```

**Response `201`:**

```json
{
  "id": "uuid",
  "fullName": "Carlos Méndez",
  "email": "carlos@taller.com",
  "role": "MECHANIC",
  "active": true,
  "createdAt": "2026-05-21T12:00:00.000Z"
}
```

**Errores:** `400` validación | `401` | `403` | `409` email duplicado

#### `PATCH /api/users/:id/deactivate`

Desactiva cuenta (soft delete lógico).

**Response `200`:**

```json
{
  "id": "uuid",
  "fullName": "Carlos Méndez",
  "email": "carlos@taller.com",
  "role": "MECHANIC",
  "active": false,
  "updatedAt": "2026-05-21T14:00:00.000Z"
}
```

**Errores:**

| Código | Condición |
|--------|-----------|
| `400` | Desactivar propia cuenta o último admin activo |
| `401` | Sin autenticación |
| `403` | Rol no admin |
| `404` | `id` inexistente |
| `409` | Usuario ya inactivo |

**Efectos secundarios en servidor:**

1. `active = false`
2. `refreshTokenHash = null`, `refreshTokenExpiresAt = null`
3. (Opcional) log de auditoría: `deactivatedBy`, `deactivatedAt` — tabla `AuditLog` V2; en MVP basta log estructurado

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/users/
├── users.module.ts
├── users.controller.ts       # GET /, POST /, PATCH /:id/deactivate
├── users.service.ts          # create, findAll, deactivate
├── dto/
│   ├── create-user.dto.ts
│   └── user-response.dto.ts
└── users.service.spec.ts

src/modules/auth/auth.service.ts   # asegurar rechazo si active=false (US-001)
prisma/schema.prisma               # User ya definido en US-001
prisma/seed.ts                     # al menos 2 usuarios admin+mechanic para pruebas
```

**Frontend (`apps/web`)**

```
src/features/users/
├── components/
│   ├── UserList.tsx
│   ├── UserForm.tsx              # create
│   └── DeactivateUserDialog.tsx
├── hooks/
│   ├── useUsers.ts
│   └── useCreateUser.ts
├── services/
│   └── usersApi.ts
└── types/
    └── user.types.ts

src/app/admin/users/
├── page.tsx                      # listado
└── new/page.tsx                  # opcional: formulario en página dedicada

src/app/admin/layout.tsx          # nav link "Usuarios"
src/shared/components/ProtectedRoute.tsx   # role ADMIN para /admin/users/*
```

### Flujo de implementación (orden sugerido)

1. Tests fallidos de `UsersService` (create, duplicate email, deactivate, last admin, self-deactivate).
2. `UsersService` + DTOs con `class-validator` (`IsEmail`, `MinLength(8)`, `IsEnum`).
3. `UsersController` con guards; registrar módulo en `AppModule`.
4. Tests e2e API con token `ADMIN` y verificación `403` con token `MECHANIC`.
5. UI listado + formulario crear + diálogo desactivar.
6. Verificar integración con US-001: usuario desactivado → login `403`; refresh invalidado.
7. Documentar endpoints en `readme.md` §4 (máx. 3 endpoints — priorizar `POST /users` si hay límite).

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit** `users.service.spec.ts` | create OK con hash; email duplicado; deactivate OK; deactivate self → error; deactivate last admin → error; deactivate ya inactivo → error |
| **Integration** `users.e2e-spec.ts` | GET/POST/PATCH con ADMIN `200/201`; MECHANIC `403`; sin token `401`; POST email dup `409` |
| **Integración US-001** | Tras deactivate, `POST /auth/login` del usuario → `403` |
| **E2E (opcional)** | Admin crea mecánico → logout → login mecánico OK; admin desactiva mecánico → login mecánico falla |

Cobertura objetivo módulo `users`: ≥ 90 % en service y controller.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Seguridad** | Solo `ADMIN`; password nunca en responses/logs; bcrypt en create; validar `id` UUID en params |
| **Rendimiento** | `GET /users` < 300 ms con ≤ 100 usuarios (taller típico) |
| **Auditoría** | Log `user.created` / `user.deactivated` con `actorId` (admin que ejecuta) |
| **UX** | Confirmación antes de desactivar; mensajes en español en UI |
| **Accesibilidad** | Tabla con headers `<th>`; foco en modal de confirmación |

### Definition of Done

- [ ] Endpoints `GET`, `POST`, `PATCH .../deactivate` implementados y protegidos por rol.
- [ ] UI `/admin/users` funcional para admin; invisible/bloqueada para mecánico.
- [ ] Reglas último admin y auto-desactivación cubiertas por tests.
- [ ] Usuario desactivado no puede login ni refrescar token.
- [ ] FK históricas intactas (verificado con test o seed que incluya OT asignada — puede ser test de integración cuando exista US-005).
- [ ] Documentación API actualizada; sin contraseñas en repositorio.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-001 (`User`, auth, guards) |
| **Bloquea** | Operación real del taller con múltiples empleados; US-005+ usará `assignedMechanicId` |
| **Paralelo** | US-003, US-004 pueden avanzar si auth admin/mecánico ya existe |

---

## [original] Prioridad

Alta.

## [enhanced] Prioridad

**Alta (P0)** — inmediatamente después de US-001. Sin gestión de usuarios el administrador no puede dar de alta mecánicos en producción.

**Estimación orientativa:** 2–4 días (1 dev full-stack) incluyendo UI de listado/formulario y tests.

### Extensiones V2 (no implementar en MVP)

| ID | Funcionalidad | Descripción |
|----|---------------|-------------|
| **D6** | Edición de usuarios | `PATCH /api/users/:id` (solo `ADMIN`) para actualizar `fullName`, `email` y `role`, con las mismas reglas de integridad del MVP (último admin activo, email único). UI: acción **Editar** en `/admin/users`. |
| — | Reseteo de contraseña | El administrador puede asignar una nueva contraseña temporal a un empleado activo. |
| — | Cambio obligatorio en primer login | Campos `mustChangePassword` y `passwordChangedAt`; el usuario debe cambiar la contraseña temporal antes de operar (complementa el deseable de US-001/US-002). |
| — | Reactivación de cuenta | `PATCH /api/users/:id/reactivate` para restaurar `active = true` en cuentas desactivadas. |

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-002 |
| **Módulo** | `users` |
| **Estado refinamiento** | Enhanced (local) — pendiente sincronización Jira si aplica |
