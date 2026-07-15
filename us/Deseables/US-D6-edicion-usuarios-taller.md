# US-D6 — Edición de Usuarios del Taller

**Fuente:** `readme.md` → D6 · **Prioridad:** V2 (deseable alta)  
**Referencia MVP:** US-002 (alta, listado, desactivación)

## [original] Historia de Usuario

**Como** administrador del taller,
**quiero** editar cuentas de usuarios existentes,
**para** corregir datos o roles sin recrear usuarios ni perder historial operativo.

## [enhanced] Historia de Usuario

**Como** administrador,
**quiero** desde `/admin/users` editar con un PATCH parcial el nombre, correo, rol y (opcionalmente) resetear la contraseña de un usuario activo —y gestionar el flag `canActAsMechanic` cuando aplique US-D8— sin perder FKs históricas de OT/tareas, aplicando las mismas reglas de integridad del MVP (email único, último admin activo, sin auto-desactivación),
**para** mantener el directorio del taller al día sin recrear cuentas.

**Alcance V2 (core):**

- `PATCH /api/users/:id` (parcial)
- UI **Editar** (modal) en tabla de usuarios
- Invalidación de sesión al cambiar **password** o **role** (US-012 / `sessionVersion`)
- Integración con `canActAsMechanic` (US-D8) si el campo ya existe o en el mismo epic

**Nice-to-have misma entrega / V2.1 (no bloquean DoD core):**

- `PATCH /api/users/:id/reactivate`
- `mustChangePassword` + `passwordChangedAt` (forzar cambio tras reset admin)

**Fuera de alcance:**

- Perfil self-service para mecánicos
- Reset por email / forgot-password
- Eliminación física de `User`
- SSO
- Auditoría en tabla `AuditLog` (basta log estructurado como create/deactivate)

**Dependencia:** US-002, US-001, US-012. **Complementa:** US-D8.

**Estado actual (gap):**

- Endpoints: `GET /`, `POST /`, `PATCH /:id/deactivate` — **sin** `PATCH /:id`
- Comentario en `deactivate`: *“Call the same invalidation whenever a future role-update endpoint changes privileges.”*
- UI: `UserTable` solo acción Desactivar; no Editar
- `CreateUserDto` / form: sin update schema
- `UserResponseDto` sin `canActAsMechanic` (hasta D8)

---

## [original] Criterios de Aceptación

- [ ] Se pueden editar: nombre, correo, rol; reset opcional de contraseña.
- [ ] Correo único; conflicto → `409`.
- [ ] No dejar el sistema sin al menos un administrador activo.
- [ ] UI con acción **Editar** por fila.

## [enhanced] Criterios de Aceptación

### Campos editables (`UpdateUserDto` — todos opcionales; al menos uno requerido)

| Campo | Reglas | Notas |
|-------|--------|-------|
| `fullName` | 2–120 chars, trim | Igual create |
| `email` | email válido; lowercase+trim; **único** global (activos e inactivos) | `409` `This email is already registered` si otro user |
| `role` | `ADMIN` \| `MECHANIC` | Ver reglas último admin |
| `password` | Si presente: min 8 (misma política create); bcrypt cost 12 | No devolver hash |
| `canActAsMechanic` | boolean opcional | Solo efecto si rol resultante es `ADMIN`; normalizar `false` si rol es/pasa a `MECHANIC` (US-D8) |

- [ ] Body vacío / sin campos reconocidos → `400`.
- [ ] PATCH parcial: solo actualizar claves enviadas (`undefined` = no tocar).
- [ ] `password: ""` o null → tratar como “no enviado” o `400` (preferido: omitir / `@ValidateIf`).

### Reglas de integridad (reuso mental model deactivate)

1. **Email único:** igual que `create` (incluye usuarios inactivos).
2. **Último admin activo:** si el update dejaría **cero** `ADMIN` activos, → `400` `At least one active administrator is required`.  
   Casos:
   - Degradar `ADMIN` → `MECHANIC` del único admin activo.
   - (Si se permitiera `active` aquí: no; active solo por deactivate/reactivate.)
3. **Auto-edición:**
   - Puede editar **su** `fullName` / `email` / `password`.
   - **No** puede degradar su propio `role` de `ADMIN` → `MECHANIC` si es el último admin activo (misma regla).
   - Preferido adicional: **no** permitir auto-degradación de rol aunque haya otros admins (evita lockout accidental de la sesión admin actual) — **decidir en implementación; documentar**. Recomendación: permitir auto-cambio de rol solo si queda ≥1 otro admin activo.
4. **Usuario inactivo (`active=false`):**
   - Preferido V2: **bloquear** `PATCH` de perfil con `409` `User is inactive` (obligar a reactivar primero si se implementa reactivate), **o**
   - Alternativa: permitir solo `fullName`/`email`; **prohibir** `role` y `password` hasta reactivar.
   - Elegir **una** y cubrir con tests. **Recomendado DoD:** `409` en cualquier update sobre inactivo hasta existir `reactivate`.

### Invalidación de sesión (US-012)

Al persistir cambios, si **cambió** `password` **o** `role` (valor distinto al anterior):

- [ ] `passwordHash` actualizado (si password).
- [ ] `refreshTokenHash = null`, `refreshTokenExpiresAt = null`.
- [ ] `sessionVersion: { increment: 1 }` — access tokens previos fallan en JwtStrategy.
- [ ] Cambio solo de `fullName` / `email` / `canActAsMechanic` → **no** requiere bump (opcional bump email; **preferido: no**).

### API

#### `PATCH /api/users/:id`

Roles: `ADMIN` only (controller class-level).

**Importante routing Nest:** mantener `PATCH :id/deactivate` registrado; el path más específico no debe ser capturado por `:id`. Orden de declaración: `deactivate` antes o rutas estáticas primero — verificar que no rompa.

**Request ejemplos:**

```json
{ "fullName": "Carlos Méndez" }
```

```json
{
  "email": "carlos@taller.com",
  "role": "MECHANIC"
}
```

```json
{
  "password": "TempPass123!",
  "canActAsMechanic": true
}
```

**Response `200`:** `UserResponseDto` (sin secretos); incluir `canActAsMechanic` cuando D8 esté en schema.

**Errores:**

| Código | Condición |
|--------|-----------|
| `400` | Validación; último admin; body vacío |
| `401` | Sin auth |
| `403` | No ADMIN |
| `404` | id inexistente |
| `409` | Email duplicado; usuario inactivo (si se adopta esa regla) |

**Logging:** `event: 'user.updated'`, `actorId`, `userId`, `changedFields: string[]` (sin loguear password).

#### Nice-to-have — `PATCH /api/users/:id/reactivate`

- Solo `ADMIN`; target `active=false` → `active=true`.
- No auto-reactivar (actor ≠) restriction beyond admin.
- Ya activo → `409`.
- No restaura password.

#### Nice-to-have — mustChangePassword

- Tras reset por admin: `mustChangePassword=true`.
- Login/me flujo obliga cambio (US aparte o V2.1).

### UI — `/admin/users`

- [ ] Botón **Editar** por fila (activos; inactivos según regla API — ocultar o mostrar disabled con tooltip).
- [ ] Modal `EditUserDialog` (preferido vs página nueva): form precargado `fullName`, `email`, `role`; checkbox password opcional “Restablecer contraseña” → input nueva pass.
- [ ] Si D8: checkbox *También puede realizar trabajo de mecánico* visible solo si rol = ADMIN.
- [ ] Confirmación extra si cambia `role` o se resetea password.
- [ ] Errores mapeados en español (`mapUsersError`).
- [ ] Invalidar React Query `['users']` tras éxito; toast *Usuario actualizado*.
- [ ] Si el admin se resetea su propia password / cambia rol → esperar logout forzado o redirect login (token inválido); manejar 401 global existente.

### Regresión MVP

- [ ] Create / list / deactivate sin cambio de comportamiento.
- [ ] Historial OT con `createdById` / `assignedMechanicId` intacto tras rename/email.

### Casos límite

| Caso | Esperado |
|------|----------|
| Email de otro user | `409` |
| Mismo email del propio user (sin cambio real) | `200` no-op o update igual |
| Único admin → MECHANIC | `400` |
| Mechanic → ADMIN | `200` |
| Password corto | `400` |
| MECHANIC llama PATCH | `403` |
| Patch solo `canActAsMechanic` en MECHANIC | Normaliza false / ignora |

---

## [original] Roles involucrados

- Administrador

## [enhanced] Roles involucrados

| Rol | Código | Permisos |
|-----|--------|----------|
| Administrador | `ADMIN` | Editar usuarios (con reglas) |
| Mecánico | `MECHANIC` | Sin acceso `/admin/users` ni API users |

---

## [original] Notas técnicas

- El historial de OT/tareas no se altera al cambiar nombre o correo del empleado.
- Posibles campos `mustChangePassword`, `passwordChangedAt`.

## [enhanced] Especificación técnica

### Pseudocódigo `update`

```typescript
async update(id: string, dto: UpdateUserDto, actorId: string) {
  return this.prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Not Found');
    if (!user.active) throw new ConflictException('User is inactive');

    // merge proposed role/email/...
    // email uniqueness if changing
    // last-admin check if role demotion
    // normalize canActAsMechanic

    const roleChanged = dto.role !== undefined && dto.role !== user.role;
    const passwordChanged = dto.password !== undefined;

    const data: Prisma.UserUpdateInput = { /* fields */ };
    if (passwordChanged) {
      data.passwordHash = await bcrypt.hash(dto.password!, BCRYPT_COST);
    }
    if (roleChanged || passwordChanged) {
      data.refreshTokenHash = null;
      data.refreshTokenExpiresAt = null;
      data.sessionVersion = { increment: 1 };
    }

    return tx.user.update({ where: { id }, data });
  });
}
```

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/users/
├── dto/update-user.dto.ts           # NUEVO
├── users.controller.ts              # PATCH :id (cuidado orden vs deactivate)
├── users.service.ts                 # update()
├── users.service.spec.ts
├── dto/user-response.dto.ts         # + canActAsMechanic si D8
test/users.e2e-spec.ts
apps/api/README.md
```

**Frontend (`apps/web`)**

```
src/features/users/
├── utils/updateUserSchema.ts        # NUEVO
├── components/EditUserDialog.tsx    # NUEVO
├── components/UserTable.tsx         # acción Editar
├── components/UserList.tsx
├── hooks/useUpdateUser.ts           # NUEVO
├── services/usersApi.ts             # update()
├── utils/mapUsersError.ts           # nuevos mensajes
└── types/user.types.ts

e2e/users.spec.ts                    # edit name/email/role; last admin; duplicate email
```

### Flujo de implementación (orden sugerido)

1. `UpdateUserDto` + tests unitarios update (TDD).
2. `UsersService.update` + session invalidation.
3. Controller `PATCH :id` + e2e API.
4. Modal UI + schema Zod + errores ES.
5. Cablear `canActAsMechanic` si D8 ya merged (o stub ignorado).
6. (Opcional) reactivate + mustChangePassword.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit** | update fullName; email conflict 409; demote last admin 400; password bumps sessionVersion + clears refresh; role change bumps session; name-only no bump; inactive 409; normalize canActAsMechanic |
| **E2E API** | ADMIN 200; MECHANIC 403; deactivate still works; PATCH order |
| **E2E web** | Editar nombre visible en tabla; error último admin; duplicate email message |

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Seguridad** | Nunca devolver `passwordHash` / tokens; bcrypt 12; invalidar sesión en password/role |
| **Integridad** | Último admin; email único |
| **UX** | Español; confirmación en cambios sensibles |
| **Observabilidad** | Log `user.updated` con campos cambiados |
| **Compatibilidad** | No romper deactivate/create |

### Definition of Done

- [ ] Editar fullName, email, role y password reset desde UI + API.
- [ ] Reglas último admin y email único cubiertas por tests.
- [ ] Reset password / cambio rol invalidan sesión (US-012).
- [ ] Usuarios inactivos no editables (o regla documentada + tests).
- [ ] Create/list/deactivate regresionan en verde.
- [ ] `canActAsMechanic` editable si D8 en scope del release.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-002, US-012 |
| **Alinea con** | US-D8 (`canActAsMechanic` en update/create) |
| **No incluye** | Forgot-password email |

---

## [original] Prioridad

Alta prioridad V2 (deseable).

## [enhanced] Prioridad

**Alta (V2 P1)** — gap operativo frecuente; superficie acotada al módulo users.

**Estimación orientativa:** 1–2 días (1 dev) core; +0.5–1 día reactivate / mustChangePassword.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D6 |
| **Deseable** | D6 |
| **Módulo** | `users` |
| **Endpoint** | `PATCH /api/users/:id` |
| **UI** | `/admin/users` → Editar |
| **Estado refinamiento** | Enhanced (local) — sin Jira MCP en este entorno; pendiente sync a tablero si aplica |
| **Archivo** | `us/Deseables/US-D6-edicion-usuarios-taller.md` |
