# US-D8 — Administradores con Capacidad de Mecánico

**Fuente:** `readme.md` → D8 · **Prioridad:** V2 (deseable alta)

## [original] Historia de Usuario

**Como** administrador del taller que también trabaja en piso,
**quiero** poder marcarme (o marcar a otro admin) con un flag de mecánico y aparecer en el listado de asignación al crear la orden de trabajo,
**para** que se me puedan asignar las visitas/tareas sin cambiar mi rol de administrador.

## [enhanced] Historia de Usuario

**Como** administrador del taller,
**quiero** un flag `canActAsMechanic` en usuarios `ADMIN` que, cuando está activo, los incluya junto a los `MECHANIC` activos en el selector de **mecánico asignado** al crear la OT, y que la API acepte esa asignación,
**para** cubrir talleres donde el dueño/admin también repara, sin duplicar la cuenta ni perder permisos de administración (`/admin/*`, usuarios, delivery, etc.).

**Contexto operativo:** en talleres pequeños el administrador a menudo trabaja en piso; hoy el selector y la validación solo aceptan `role = MECHANIC`, así que no puede autoasignarse ni ser asignado.

**Alcance V2:**

- Campo `User.canActAsMechanic` (boolean, default `false`)
- Alta de usuarios con checkbox (US-002) y edición del flag (US-D6 o PATCH mínimo)
- Ampliar `GET /api/work-orders/mechanics` y validación de `assignedMechanicId` en create
- Mostrar nombre del asignado en detalle aunque sea `ADMIN` (hoy el header resuelve el nombre solo desde el listado de “mecánicos”)
- Label opcional en UI del selector (`Admin` / `Mecánico`)

**Fuera de alcance:**

- Segundo valor en el enum `UserRole` (no `ADMIN_MECHANIC`)
- Asignación por tarea (`task.assigneeId`) — el MVP asigna a nivel OT
- Que el flag otorgue permisos de admin a un `MECHANIC`
- Reasignación de mecánico post-creación (no existe endpoint hoy); si se agrega después, debe reutilizar el mismo predicado

**Dependencia:** US-002, US-005. **Recomendado:** US-D6 (editar flag en cuentas existentes). **No depende de:** US-D7.

**Estado actual (gap):**

- Prisma `User` sin `canActAsMechanic`
- `WorkOrdersService.findActiveMechanics`: filtro estricto `role: MECHANIC`
- `WorkOrdersService.create`: valida `role: MECHANIC` para `assignedMechanicId`
- `CreateUserDto` / `UserForm` / `createUserSchema` sin flag
- `UserResponseDto` no expone el flag
- `WorkOrderDetailHeader` obtiene el nombre vía `useMechanics()` (lista incompleta para admins con flag); el mapper carga `assignedMechanic` en include pero **no lo serializa** en la response de detalle

---

## [original] Criterios de Aceptación

- [ ] Un administrador puede tener un flag de mecánico.
- [ ] Los admins con el flag activo aparecen en el listado de asignables al crear la OT.
- [ ] Se les puede asignar la OT / el trabajo mecánico igual que a un mecánico.
- [ ] Conservan las funciones de administrador.
- [ ] Los mecánicos siguen asignables sin necesitar el flag.

## [enhanced] Criterios de Aceptación

### Modelo / migración

- [ ] Añadir `canActAsMechanic Boolean @default(false)` en `User`.
- [ ] Migración SQL: `ADD COLUMN "canActAsMechanic" BOOLEAN NOT NULL DEFAULT false`.
- [ ] Usuarios existentes (incl. seed admin) quedan en `false` hasta activación explícita.
- [ ] Regla de dominio: el flag **solo tiene efecto** si `role = ADMIN`. Si `role = MECHANIC`, el flag se ignora en elegibilidad (y en create/update se fuerza `false` o se omite).

### Predicado de elegibilidad (única fuente de verdad)

```typescript
function isAssignableAsMechanic(user: {
  active: boolean;
  role: UserRole;
  canActAsMechanic: boolean;
}): boolean {
  if (!user.active) return false;
  if (user.role === UserRole.MECHANIC) return true;
  return user.role === UserRole.ADMIN && user.canActAsMechanic === true;
}
```

- [ ] Extraer a helper compartido (p. ej. `apps/api/src/modules/work-orders/utils/assignable-mechanic.ts`) usado por `findActiveMechanics` y por la validación de create.
- [ ] Query Prisma equivalente con `OR`:

```typescript
where: {
  active: true,
  OR: [
    { role: UserRole.MECHANIC },
    { role: UserRole.ADMIN, canActAsMechanic: true },
  ],
}
```

### Alta de usuarios (US-002)

- [ ] `POST /api/users` acepta `canActAsMechanic?: boolean` (default `false`).
- [ ] Si `role = MECHANIC` y llega `canActAsMechanic: true` → persistir `false` (o `400` con mensaje claro; **preferido: normalizar a `false`** sin error).
- [ ] Si `role = ADMIN` → persistir el valor enviado.
- [ ] UI `/admin/users` → formulario nuevo: checkbox visible **solo** cuando rol seleccionado = `ADMIN`:  
  *“También puede realizar trabajo de mecánico”* / `canActAsMechanic`.
- [ ] Al cambiar el select de rol de `ADMIN` → `MECHANIC` en el formulario, ocultar checkbox y resetear a `false` en el submit.

### Edición de usuarios (US-D6 — o puente mínimo)

- [ ] Ideal: incluir `canActAsMechanic` en `PATCH /api/users/:id` (US-D6) y en el modal **Editar**.
- [ ] Si US-D6 aún no está implementada, puente aceptable en esta US:
  - `PATCH /api/users/:id` **solo** con body `{ "canActAsMechanic": boolean }` (o el PATCH completo anticipando D6), roles `ADMIN`.
- [ ] Listado de usuarios: badge *Admin · Mecánico* cuando `role=ADMIN && canActAsMechanic`.
- [ ] `UserResponseDto` / listado incluyen `canActAsMechanic: boolean`.

### Listado de asignables — API

#### `GET /api/work-orders/mechanics`

- [ ] Retorna candidatos elegibles según el predicado (no solo `MECHANIC`).
- [ ] Orden: `fullName` asc.
- [ ] Extender `MechanicSummaryDto`:

```json
[
  { "id": "uuid", "fullName": "Ana Admin", "role": "ADMIN" },
  { "id": "uuid", "fullName": "Carlos Méndez", "role": "MECHANIC" }
]
```

- [ ] Roles que pueden llamar el endpoint: sin cambio (`ADMIN` | `MECHANIC`).

### Asignación al crear OT

- [ ] `POST /api/work-orders` con `assignedMechanicId` de admin **con** flag + `active` → `201`.
- [ ] Admin **sin** flag, inactivo, o UUID inexistente → `400` `"Invalid assigned mechanic"` (mensaje actual o equivalente).
- [ ] Mecánico activo → `201` (regresión).
- [ ] Sin `assignedMechanicId` → sigue válido (`null`).

### UI creación OT

- [ ] `MechanicSelect` sigue consumiendo `GET .../mechanics`; al ampliar el API aparecen los admins elegibles sin cambio de contrato rompiente (campo `role` opcional tolerado).
- [ ] Mostrar en opción: `{fullName}` o `{fullName} (Admin)` cuando `role === 'ADMIN'`.
- [ ] Label del control puede permanecer *“Mecánico asignado (opcional)”* o pasar a *“Asignado (opcional)”* — preferido mantener el label actual + sufijo `(Admin)` en la opción.

### Visualización en detalle OT

- [ ] Serializar en detalle: `assignedMechanic: { id, fullName, role } | null` (además de `assignedMechanicId`).
- [ ] `WorkOrderDetailHeader` usa `workOrder.assignedMechanic?.fullName` (fallback al listado solo si hace falta).
- [ ] Si el asignado era admin con flag y luego se le quitó el flag: el detalle **sigue mostrando** el nombre vía relación FK; solo deja de salir en nuevos listados.

### Autorización / RBAC

- [ ] `canActAsMechanic` **no** modifica `RolesGuard` ni menús: el usuario sigue siendo `ADMIN` para usuarios, delivery, etc.
- [ ] Un `MECHANIC` **no** obtiene rutas admin por tener el flag (el flag no aplica / se ignora).
- [ ] Solo `ADMIN` puede crear/editar el flag en otros usuarios (y en sí mismo vía US-002/D6).

### Casos límite

| Caso | Comportamiento esperado |
|------|-------------------------|
| Quitar flag a admin ya asignado en OT abierta | OT conserva `assignedMechanicId`; sale del `GET /mechanics` |
| Desactivar usuario (`active=false`) | Sale del listado; historial/OT intactos |
| `ADMIN` → `MECHANIC` | Asignable por rol; set `canActAsMechanic=false` al guardar |
| `MECHANIC` → `ADMIN` | Deja de ser asignable hasta activar flag |
| Seed `admin@taller.com` | Por defecto sin flag; documentar cómo activarlo (UI o seed-dev opcional) |

### Tests (checklist)

- [ ] `findActiveMechanics` incluye admin+flag; excluye admin sin flag; incluye mechanic; excluye inactivos.
- [ ] Create OT admin+flag → 201; admin sin flag → 400; mechanic → 201.
- [ ] Create user ADMIN con flag → response refleja `true`.
- [ ] Create user MECHANIC con flag true → persistido `false` (si se eligió normalización).
- [ ] E2E web: crear admin con checkbox → aparece en selector de OT → crear OT asignada a ese admin.

---

## [original] Roles involucrados

- Administrador (gestiona el flag y puede ser asignado)
- Mecánico (sigue siendo asignable)

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Activar/desactivar flag; ser asignado si flag activo; seguir con RBAC admin |
| Mecánico | `MECHANIC` | Asignable sin flag; ver listado ampliado al crear OT; sin gestión de usuarios |

---

## [original] Notas técnicas

- El MVP solo acepta `role = MECHANIC` en asignación; V2 amplía el predicado de elegibilidad.
- No hace falta cambiar la FK `assignedMechanicId` → `User`.

## [enhanced] Especificación técnica

### Schema

```prisma
model User {
  id                 String   @id @default(uuid())
  email              String   @unique
  passwordHash       String
  fullName           String
  role               UserRole
  canActAsMechanic   Boolean  @default(false) // US-D8
  active             Boolean  @default(true)
  // ... session fields US-012
}
```

**Migración orientativa:**

```sql
ALTER TABLE "User" ADD COLUMN "canActAsMechanic" BOOLEAN NOT NULL DEFAULT false;
```

### Contratos API

#### `POST /api/users` (extensión)

Roles: `ADMIN`.

**Request:**

```json
{
  "fullName": "Ana Rojas",
  "email": "ana@taller.com",
  "password": "TempPass123!",
  "role": "ADMIN",
  "canActAsMechanic": true
}
```

**Response `201`:** incluye `"canActAsMechanic": true`.

#### `PATCH /api/users/:id` (US-D6 o puente)

```json
{ "canActAsMechanic": true }
```

Mismas reglas de normalización por `role`.

#### `GET /api/users` (listado)

Cada ítem incluye `canActAsMechanic` para renderizar badge.

#### `GET /api/work-orders/mechanics` (cambio)

**Response `200`:**

```json
[
  { "id": "admin-uuid", "fullName": "Ana Rojas", "role": "ADMIN" },
  { "id": "mech-uuid", "fullName": "Carlos Méndez", "role": "MECHANIC" }
]
```

#### `POST /api/work-orders` (validación)

Sin cambio de shape; solo cambia la regla interna de `assignedMechanicId`.

#### `GET /api/work-orders/:id` (detalle — mejora requerida)

```json
{
  "assignedMechanicId": "admin-uuid",
  "assignedMechanic": {
    "id": "admin-uuid",
    "fullName": "Ana Rojas",
    "role": "ADMIN"
  }
}
```

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
prisma/schema.prisma
prisma/migrations/<timestamp>_user_can_act_as_mechanic/migration.sql
prisma/seed-dev.ts                              # opcional: flag en admin de demo

src/modules/work-orders/
├── utils/assignable-mechanic.ts                 # NUEVO — predicado + where clause
├── dto/mechanic-summary.dto.ts                  # + role
├── dto/work-order-detail-response.dto.ts        # + assignedMechanic summary
├── mappers/work-order.mapper.ts                 # serializar assignedMechanic
├── work-orders.service.ts                       # findActiveMechanics + create validation
└── work-orders.service.spec.ts

src/modules/users/
├── dto/create-user.dto.ts                       # + canActAsMechanic optional
├── dto/update-user.dto.ts                       # NUEVO (D6/puente)
├── dto/user-response.dto.ts                     # + canActAsMechanic
├── users.service.ts                             # persist + normalizar
├── users.controller.ts                          # PATCH si puente
└── users.service.spec.ts

test/users.e2e-spec.ts
test/work-orders.e2e-spec.ts
```

**Frontend (`apps/web`)**

```
src/features/users/
├── utils/createUserSchema.ts                    # canActAsMechanic
├── components/UserForm.tsx                      # checkbox condicional por rol
├── components/UserList.tsx / UserTable          # badge
├── components/EditUserDialog.tsx                # si D6/puente
├── types/user.types.ts
└── services/usersApi.ts

src/features/work-orders/
├── types/work-order.types.ts                    # MechanicSummary.role; assignedMechanic
├── components/MechanicSelect.tsx                # label (Admin)
├── components/WorkOrderDetailHeader.tsx         # nombre desde assignedMechanic
└── services/workOrdersApi.ts

e2e/users.spec.ts
e2e/ (work-orders create con admin asignable)
```

**Documentación**

- `readme.md` D8 ya describe el flag; verificar tabla `User` (`canActAsMechanic`).
- `docs/data-model.md` si documenta `User` sin el campo.
- `us/Deseables/US-D6-...` — añadir `canActAsMechanic` a campos editables (cross-ref).

### Flujo de implementación (orden sugerido)

1. Migración + campo Prisma.
2. Helper `isAssignableAsMechanic` + unit tests del predicado.
3. Ampliar `findActiveMechanics` + tests.
4. Validación create OT + tests (admin±flag, mechanic).
5. Extender create user DTO/service/UI checkbox.
6. PATCH usuarios (puente o junto a US-D6) + badge en listado.
7. Serializar `assignedMechanic` en detalle + fijar header UI.
8. Ampliar `MechanicSelect` con sufijo `(Admin)`.
9. E2E create admin+flag → assign en OT.
10. DoD + docs.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit (helper)** | mechanic active; admin+flag; admin−flag; inactive mechanic; inactive admin+flag |
| **Unit (work-orders)** | findMechanics OR query; create con cada caso de asignación |
| **Unit (users)** | create ADMIN flag true/false; MECHANIC normaliza flag |
| **E2E API** | GET mechanics contiene admin; POST work-order asignado a admin |
| **E2E web** | Checkbox en form admin; selector OT; detalle muestra nombre |

Cobertura objetivo paths tocados: ≥ 90 % en `work-orders.service` (mechanics/create assign) y create user flag.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Seguridad / RBAC** | Flag no bypasea `RolesGuard`; no eleva a admin a un mecánico |
| **Compatibilidad API** | Clientes que ignoran `role` en mechanics summary siguen funcionando; campo nuevo aditivo |
| **UX** | Textos en español; checkbox claro; no obligar a crear segundo usuario |
| **Datos** | FK histórica estable; quitar flag no reescribe OT |
| **Rendimiento** | Listado mechanics p95 sin cambio material (misma tabla `User`, filtro OR indexable por `active`/`role`) |

### Definition of Done

- [ ] Migración aplicada; campo en schema.
- [ ] Admin con flag aparece en selector y puede asignarse al crear OT.
- [ ] Admin sin flag no aparece / no es asignable (`400`).
- [ ] Mecánicos activos sin regresión.
- [ ] Permisos admin del usuario con flag intactos (smoke: login admin → `/admin/users` y `/admin/delivery`).
- [ ] Detalle OT muestra nombre del asignado admin.
- [ ] Tests unit + e2e de la matriz en verde.
- [ ] Cross-ref D6 / readme alineados.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-002, US-005 |
| **Recomendado junto con** | US-D6 (edición de usuarios) |
| **Habilita** | Operación realista de talleres mono-usuario admin+piso |
| **No bloquea** | US-D7, D1–D5 |

### Estrategia si US-D6 no está lista

1. Entregar migración + mechanics/create + checkbox en **alta**.
2. Activar flag en admin existente vía seed-dev / script one-off **o** PATCH mínimo `{ canActAsMechanic }`.
3. Completar UX de edición cuando se implemente US-D6.

---

## [original] Prioridad

Alta prioridad V2 (deseable).

## [enhanced] Prioridad

**Alta (V2 P1)** — desbloquea operación en talleres pequeños; cambio acotado (1 columna + predicado + UI checkbox).

**Estimación orientativa:** 1–2 días (1 dev full-stack) sin UI de edición completa; +0.5–1 día si se implementa el PATCH/edición junto con US-D6.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D8 |
| **Deseable** | D8 |
| **Módulos** | `users`, `work-orders` |
| **Estado refinamiento** | Enhanced (local) — sin Jira MCP en este entorno; pendiente sync a tablero si aplica |
| **Archivo** | `us/Deseables/US-D8-administradores-capacidad-mecanico.md` |
