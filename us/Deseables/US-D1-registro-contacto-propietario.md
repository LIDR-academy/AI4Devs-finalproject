# US-D1 — Registro de Contacto al Propietario

**Fuente:** `readme.md` → D1 · **Prioridad:** V2 (deseable alta)

## [original] Historia de Usuario

**Como** administrador del taller,
**quiero** marcar explícitamente que ya contacté al propietario desde el panel de entrega,
**para** dejar trazabilidad del contacto y evitar llamadas duplicadas entre turnos.

## [enhanced] Historia de Usuario

**Como** administrador del taller,
**quiero** registrar el contacto al propietario sobre una OT en **Lista para entrega**, con fecha/hora y usuario responsables, pasar la OT a **Propietario contactado**, mantenerla visible en el panel hasta el retiro, y poder entregarla desde ese estado,
**para** distinguir pendientes de contactar vs. ya contactados entre turnos sin perder el hilo de entrega.

**Contexto operativo:** varios admins/turnos llaman a clientes; sin marca explícita hay contactos duplicados o confusión sobre qué vehículos ya fueron avisados.

**Alcance V2:**

- Acción **Marcar propietario contactado** en `/admin/delivery`
- Transición `LISTA_PARA_ENTREGA` → `OWNER_CONTACTED`
- Auditoría `ownerContactedAt` + `ownerContactedById`
- Listado/detalle del panel incluyen ambos estados
- `markDelivered` acepta también `OWNER_CONTACTED`
- Incluir `OWNER_CONTACTED` en “OT activa” (bloqueo de nueva OT por vehículo)

**Fuera de alcance de esta US:**

- Envío de correo (US-D2)
- Edición manual de fecha/hora de contacto
- SMS / WhatsApp / push
- Reversión `OWNER_CONTACTED` → `LISTA_PARA_ENTREGA` (no requerida V2)

**Dependencia:** US-008. **Habilita:** US-D2 (disparo de email al contactar).

**Estado actual (gap):**

- Enum `OWNER_CONTACTED` y campos `ownerContactedAt` / `ownerContactedById` **ya existen** en Prisma (reservados V1)
- Labels UI (`Propietario contactado`) y badge color ya existen en work-orders
- `DeliveryService` solo lista/detalle/entrega OT en `LISTA_PARA_ENTREGA`
- Comentario stub: `// V2 D1: PATCH /api/delivery/ready/:workOrderId/mark-contacted`
- Placeholder en `DeliveryReadyDetail.tsx` sin botón
- **`ACTIVE_WORK_ORDER_STATUSES` no incluye `OWNER_CONTACTED`** → riesgo de crear otra OT tras contactar (debe corregirse en esta US)

---

## [original] Criterios de Aceptación

- [ ] Desde el panel de vehículos listos para entrega, el administrador puede marcar que ya contactó al propietario.
- [ ] El sistema registra la fecha y hora exacta del contacto.
- [ ] El sistema registra el usuario que realizó el contacto.
- [ ] El estado de la OT pasa a **"Propietario contactado"**, diferenciado de *"Lista para entrega"*.
- [ ] La OT permanece visible en el panel hasta que el vehículo sea retirado (entregado).
- [ ] El administrador puede distinguir pendientes de contactar vs. ya contactados.

## [enhanced] Criterios de Aceptación

### Modelo (ya existente — verificar)

- [ ] Confirmar en schema:

| Campo | Tipo | Uso |
|-------|------|-----|
| `status` | incluye `OWNER_CONTACTED` | Estado post-contacto |
| `ownerContactedAt` | `DateTime?` | Timestamp servidor al marcar |
| `ownerContactedById` | `String?` → `User` | Actor admin |

- [ ] No requiere migración nueva si V1 ya desplegó estos campos (solo usarlos).

### OT activa (regresión crítica)

- [ ] Ampliar constante:

```typescript
export const ACTIVE_WORK_ORDER_STATUSES: WorkOrderStatus[] = [
  WorkOrderStatus.EN_PROCESO,
  WorkOrderStatus.LISTA_PARA_ENTREGA,
  WorkOrderStatus.OWNER_CONTACTED, // US-D1
];
```

- [ ] Tras contactar, `POST /api/work-orders` para el mismo vehículo → `409` (igual que con lista para entrega).
- [ ] Tests unitarios de create OT / active-by-vehicle actualizados.

### API — Marcar contactado

| Método | Ruta | Rol |
|--------|------|-----|
| `PATCH` | `/api/delivery/ready/:workOrderId/mark-contacted` | `ADMIN` |

> Alinear con el stub ya documentado en `delivery.service.ts`. Body vacío o `{}`.

**Efectos (atómicos):**

1. Validar OT existe; si no → `404` (`Work order not found`)
2. Si `status === OWNER_CONTACTED` → `409` (`Owner already contacted`) — **sin** sobrescribir auditoría
3. Si `status !== LISTA_PARA_ENTREGA` → `409` (`Work order is not ready for contact`)
4. Update:
   - `status = OWNER_CONTACTED`
   - `ownerContactedAt = now()`
   - `ownerContactedById = currentUser.id`

**Response `200`:**

```json
{
  "workOrderId": "uuid",
  "status": "OWNER_CONTACTED",
  "ownerContactedAt": "2026-07-15T20:00:00.000Z",
  "ownerContactedBy": {
    "id": "admin-uuid",
    "fullName": "Admin Taller"
  }
}
```

**Errores:**

| Código | Condición |
|--------|-----------|
| `401` | Sin autenticación |
| `403` | No `ADMIN` |
| `404` | OT inexistente |
| `409` | Ya contactada u otro estado no elegible |

### API — Listado panel (`GET /api/delivery/ready`)

- [ ] `where.status IN (LISTA_PARA_ENTREGA, OWNER_CONTACTED)`.
- [ ] Cada ítem incluye:

| Campo | Tipo | Notas |
|-------|------|-------|
| `status` | enum string | Para badge/filtro en UI |
| `ownerContactedAt` | `string \| null` | ISO; null si aún no contactado |
| `ownerContactedBy` | `{ id, fullName } \| null` | Join `User` |

- [ ] Orden default: `checkedInAt` asc (sin cambio).
- [ ] Query opcional V2: `contactFilter=pending|contacted|all` (default `all`) — **nice-to-have**; si no se implementa filtro server-side, filtrar en cliente.

### API — Detalle (`GET /api/delivery/ready/:workOrderId`)

- [ ] Acepta OT en `LISTA_PARA_ENTREGA` **o** `OWNER_CONTACTED`.
- [ ] Si está `ENTREGADA` / `EN_PROCESO` → `404` (mismo espíritu “not ready”).
- [ ] Response incluye mismos campos de contacto + resto US-008.

### API — Entregar (`PATCH .../deliver`) — cambio obligatorio

- [ ] Permitir entregar desde:
  - `LISTA_PARA_ENTREGA` (MVP), **o**
  - `OWNER_CONTACTED` (US-D1)
- [ ] Si `ENTREGADA` → `409` (sin cambio).
- [ ] Cualquier otro estado → `409`.
- [ ] No limpia `ownerContactedAt` / `ownerContactedById` al entregar (trazabilidad histórica).

### UI — Panel `/admin/delivery`

- [ ] Columna o badge de estado: *Lista para entrega* vs *Propietario contactado* (reutilizar `workOrderStatusLabel` / `WorkOrderStatusBadge` si aplica).
- [ ] En detalle, si `status === LISTA_PARA_ENTREGA`: botón **Marcar propietario contactado**.
- [ ] Confirmación breve opcional: *“¿Confirmas que ya contactaste al propietario de {placa}?”*
- [ ] Tras éxito: invalidate list+detail queries; badge contactado; mostrar fecha/hora local + nombre del admin.
- [ ] Si ya `OWNER_CONTACTED`: ocultar botón contactar; mostrar datos de auditoría; mantener **Marcar como entregada**.
- [ ] Filtro UI (cliente): *Todos* | *Pendiente de contacto* | *Contactados* (mínimo aceptable sin query API).
- [ ] Teléfono/`tel:` y resto US-008 sin regresión.

### Autorización

- [ ] Todo el módulo `delivery` sigue `@Roles('ADMIN')`.
- [ ] Sin enlace ni acciones para `MECHANIC`; URL → `/403` (US-008).

### Casos límite

| Caso | Esperado |
|------|----------|
| Doble clic contactar | Primera OK; segunda `409` |
| Contactar OT `EN_PROCESO` | `409` |
| Contactar OT inexistente | `404` |
| Entregar tras contactar | `200` ENTREGADA; sale del panel |
| Refetch / polling | Ítem contactado sigue listado hasta entregar |
| Cliente sin teléfono | Contactar igual permitido (el admin pudo usar otro canal) |

### US-D2 (preparación, no implementar)

- [ ] Hook de dominio listo: tras `mark-contacted` exitoso, US-D2 enganchará envío de email.
- [ ] No invocar mailer en US-D1.

---

## [original] Roles involucrados

- Administrador

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Listar, contactar, ver auditoría, entregar desde ambos estados |
| Mecánico | `MECHANIC` | Sin acceso al panel ni endpoints delivery |

---

## [original] Notas técnicas

- El estado `OWNER_CONTACTED` y campos `ownerContactedAt` / `ownerContactedById` deben usarse (reservados desde V1/US-008).

## [enhanced] Especificación técnica

### Diagrama de estados (fragmento entrega)

```text
EN_PROCESO
    │ (todas las tareas completadas — US-006)
    ▼
LISTA_PARA_ENTREGA ──mark-contacted──► OWNER_CONTACTED
    │                                      │
    └──────────── deliver ◄────────────────┘
                       │
                       ▼
                   ENTREGADA
```

Entrega directa desde `LISTA_PARA_ENTREGA` **sigue permitida** (contacto no es obligatorio).

### Controller

```typescript
@Patch('ready/:workOrderId/mark-contacted')
markContacted(
  @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
  @CurrentUser() user: AuthUser,
): Promise<MarkContactedResponseDto> {
  return this.deliveryService.markContacted(workOrderId, user.id);
}
```

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/work-orders/constants/work-order-status.ts   # + OWNER_CONTACTED
src/modules/work-orders/work-orders.service.spec.ts      # active statuses

src/modules/delivery/
├── delivery.controller.ts          # PATCH mark-contacted; CurrentUser
├── delivery.service.ts             # markContacted; list/detail/deliver widen statuses
├── delivery.service.spec.ts
├── dto/delivery-ready-item.dto.ts  # + status, ownerContacted*
├── dto/delivery-ready-detail.dto.ts
├── dto/mark-contacted-response.dto.ts  # NUEVO
└── dto/delivery-ready-query.dto.ts     # opcional contactFilter

test/delivery.e2e-spec.ts
```

**Frontend (`apps/web`)**

```
src/features/delivery-panel/
├── types/delivery.types.ts
├── services/deliveryApi.ts              # markContacted()
├── hooks/useMarkContacted.ts            # NUEVO
├── components/DeliveryReadyTable.tsx    # badge / filtro
├── components/DeliveryReadyDetail.tsx   # botón + auditoría (quitar placeholder)
├── components/MarkContactedDialog.tsx   # NUEVO opcional
└── utils/mapDeliveryError.ts            # 409 already contacted

e2e/ (delivery-panel: contact → still listed → deliver)
```

**Docs**

- `apps/api/README.md` / `apps/web/README.md`: quitar “reserved — not implemented” al cerrar la US.
- `readme.md` D1 alineado.

### Flujo de implementación (orden sugerido)

1. Ampliar `ACTIVE_WORK_ORDER_STATUSES` + tests create/active.
2. Tests unitarios `markContacted` (red): happy path, 409 doble, 409 estado inválido.
3. Implementar `markContacted` + endpoint.
4. Ampliar `listReady` / `getReadyDetail` / DTOs.
5. Ampliar `markDelivered` para aceptar `OWNER_CONTACTED`.
6. UI: badge, botón, auditoría, filtro cliente.
7. E2E delivery: contactar → listado → entregar.
8. Actualizar READMEs “V2 D1 implemented”.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit delivery** | markContacted OK; ya contactada 409; EN_PROCESO 409; list incluye ambos estados; getReadyDetail contactada OK; deliver desde OWNER_CONTACTED OK; deliver desde EN_PROCESO 409 |
| **Unit work-orders** | vehículo con OT OWNER_CONTACTED → create 409 / active presente |
| **E2E API** | PATCH mark-contacted 200; GET ready contiene ítem; PATCH deliver 200 |
| **E2E web** | Admin contacta → badge → entrega; mechanic sin acceso |

Cobertura objetivo `delivery.service` paths nuevos/cambiados: ≥ 90 %.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Auditoría** | Timestamp y actor solo servidor; no editables por cliente |
| **Idempotencia** | Segunda marca → `409` (preferido vs. silent refresh) |
| **Seguridad** | Solo `ADMIN`; JWT + RolesGuard |
| **UX** | Textos es-CR; fecha/hora en timezone local del navegador |
| **Compatibilidad** | Entrega sin contactar previa sigue válida |
| **Rendimiento** | Listado con join User contactante; p95 sin regresión material vs US-008 |

### Definition of Done

- [ ] Marcar contactado end-to-end en panel admin.
- [ ] OT contactada visible hasta entrega; entregable desde `OWNER_CONTACTED`.
- [ ] No se puede crear nueva OT para el mismo vehículo mientras esté `OWNER_CONTACTED`.
- [ ] Auditoría visible (quién / cuándo).
- [ ] Sin envío de email (US-D2 separado).
- [ ] Tests unit + e2e en verde; docs de “reserved” actualizados.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-008 (panel entrega) |
| **Habilita** | US-D2 (email al contactar) |
| **Toca** | Regla OT activa (US-005) |
| **Compatible con** | US-D7 (mileage en deliver) — componer bodies sin conflicto |

---

## [original] Prioridad

Alta prioridad V2 (deseable).

## [enhanced] Prioridad

**Alta (V2 P1)** — impacto operativo diario en turno de entrega; modelo ya reservado (bajo riesgo de migración).

**Estimación orientativa:** 1–1.5 días (1 dev full-stack) incluyendo corrección de OT activa + tests.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D1 |
| **Deseable** | D1 |
| **Módulo** | `delivery` (+ constante `work-orders`) |
| **Endpoint principal** | `PATCH /api/delivery/ready/:workOrderId/mark-contacted` |
| **Estado refinamiento** | Enhanced (local) — sin Jira MCP en este entorno; pendiente sync a tablero si aplica |
| **Archivo** | `us/Deseables/US-D1-registro-contacto-propietario.md` |
