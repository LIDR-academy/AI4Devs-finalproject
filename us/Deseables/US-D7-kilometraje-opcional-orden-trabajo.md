# US-D7 — Kilometraje Opcional en la Orden de Trabajo

**Fuente:** `readme.md` → D7 · **Prioridad:** V2 (deseable alta)

## [original] Historia de Usuario

**Como** mecánico o administrador,
**quiero** poder crear una orden de trabajo sin kilometraje cuando el vehículo llega varado o el odómetro no es legible, y completarlo después —incluso en la entrega—,
**para** no retrasar la recepción ni forzar un dato inventado.

## [enhanced] Historia de Usuario

**Como** mecánico o administrador,
**quiero** que `mileage` sea opcional al crear la OT, actualizable desde el detalle mientras la visita esté abierta, y que en el panel de entrega —si sigue vacío— aparezca un recordatorio con captura opcional que no bloquee marcar **Entregada**,
**para** registrar el kilometraje cuando el odómetro sea legible sin retrasar ingreso ni cierre de la visita.

**Contexto operativo:** vehículos varados, sin batería, tablero apagado o con daños que impiden leer el odómetro en recepción.

**Alcance V2:**

- Migración `WorkOrder.mileage` → `Int?`
- Create OT sin km obligatorio (API + Zod + formulario)
- Endpoint dedicado para actualizar km en detalle
- Recordatorio opcional en `PATCH .../deliver`
- Visualización tolerante a `null` (“Sin registrar”) en detalle, entrega e historial

**Fuera de alcance:**

- Historial versionado de cada cambio de km (solo `updatedAt`)
- Hard-block si el km es menor que la OT anterior (la advertencia suave del MVP de US-005 puede mantenerse)
- Obligar km en reportes / facturación

**Dependencia:** US-005, US-008. **Impacta UI de:** US-006 (cabecera detalle), US-009 (historial).

**Estado actual (gap):** `mileage` es `Int` NOT NULL en Prisma; `CreateWorkOrderDto` exige `@IsInt() @Min(0)`; Zod frontend exige número; create form default `0`; historial hace `mileage ?? 0`; delivery `markDelivered` no acepta body de mileage. No existe `PATCH` de cabecera de OT para km.

---

## [original] Criterios de Aceptación

- [ ] Al crear la OT, el kilometraje puede omitirse o enviarse vacío/`null`.
- [ ] El formulario de creación no bloquea el envío si el km está vacío.
- [ ] Se puede registrar o corregir el kilometraje desde el detalle de la OT.
- [ ] Las vistas que muestran km toleran valor ausente (“Sin registrar”).
- [ ] En la entrega, si no hay km: recordatorio + captura opcional; se puede entregar igual dejando vacío.
- [ ] Si se informa un valor, debe ser número ≥ 0 (enteros positivos / no negativos).

## [enhanced] Criterios de Aceptación

### Modelo / migración

- [ ] `WorkOrder.mileage` pasa a `Int?` (nullable) con migración Prisma.
- [ ] Filas existentes conservan su valor numérico (columna nullable sin backfill destructivo).
- [ ] Respuestas API tipan `mileage: number | null`.

### Crear OT — API (`POST /api/work-orders`)

- [ ] `mileage` es opcional: puede omitirse o enviarse `null`.
- [ ] Si se envía un número: entero ≥ 0; inválido → `400`.
- [ ] Create exitoso sin mileage persiste `mileage = null` y responde `mileage: null`.
- [ ] Resto de reglas US-005 sin cambio (tareas iniciales, OT activa, snapshot propietario).

### Crear OT — UI (`/work-orders/new`)

- [ ] Campo **Kilometraje** deja de ser obligatorio.
- [ ] Texto de ayuda: *“Puede completarse más adelante (p. ej. vehículo varado)”*.
- [ ] Campo vacío → request con `mileage: null` (no enviar `0` por default).
- [ ] Default del formulario: vacío/`undefined`, **no** `0`.
- [ ] Validación Zod: `z.union([z.number().int().min(0), z.null()]).optional()` o equivalente con `valueAsNumber` + empty → null.

### Actualizar kilometraje — detalle OT

- [ ] Nuevo endpoint `PATCH /api/work-orders/:id/mileage` (roles `ADMIN` | `MECHANIC`).
- [ ] Body: `{ "mileage": number | null }` — número ≥ 0, o `null` para limpiar.
- [ ] Permitido si `status ∈ { EN_PROCESO, LISTA_PARA_ENTREGA, OWNER_CONTACTED }` (estados pre-entrega).
- [ ] Si `status = ENTREGADA`: solo `ADMIN` puede corregir; `MECHANIC` → `403`.
- [ ] OT inexistente → `404`; valor inválido → `400`.
- [ ] UI en detalle (`WorkOrderDetailHeader` o control adyacente): mostrar valor o *Sin registrar*; acción **Registrar / editar kilometraje** (inline o modal).
- [ ] Tras guardar, refetch del detalle; `updatedAt` cambia.

### Entrega — UI + API (US-008)

- [ ] Al confirmar **Marcar como entregada**, si `mileage == null`:
  - Mostrar recordatorio visible: *“Kilometraje no registrado”*.
  - Campo opcional para capturarlo en el mismo diálogo.
  - Botones equivalentes: confirmar con km (si se llenó) o **Entregar sin kilometraje**.
- [ ] `PATCH /api/delivery/ready/:workOrderId/deliver` acepta body opcional:

```json
{ "mileage": 125000 }
```

  - Si `mileage` es número válido → se persiste **antes o en la misma transacción** que el cambio a `ENTREGADA`.
  - Si se omite el body / no se envía `mileage` y era `null` → permanece `null`.
  - Si se envía `mileage` inválido → `400` y **no** se entrega.
- [ ] La entrega **nunca** exige kilometraje para completar el cierre.
- [ ] Roles: delivery sigue solo `ADMIN` (US-008).

### Visualización (null-safe)

| Superficie | Comportamiento si `mileage == null` |
|------------|-------------------------------------|
| Detalle OT | Texto *Sin registrar* (no `0 km`) |
| Panel entrega (detalle) | *Sin registrar* |
| Historial vehículo/cliente (`VisitCard`) | *Sin registrar* — **eliminar** coerción `mileage ?? 0` |
| Create/edit inputs | vacío, no `0` |

- [ ] Solo mostrar `0 km` si el valor persistido es exactamente `0`.

### Advertencia vs OT anterior (no bloqueante)

- [ ] Si al informar un km el valor es menor que el de la última OT del mismo vehículo con km no null (o menor al valor actual de la OT al editar): **bloquear el guardado hasta confirmar** en UI (*“¿Seguro que quieres un kilometraje menor?”*). API no hard-bloquea.

### Autorización (resumen)

| Acción | ADMIN | MECHANIC |
|--------|-------|----------|
| Crear OT sin km | Sí | Sí |
| PATCH mileage (OT no entregada) | Sí | Sí |
| PATCH mileage (OT entregada) | Sí | No (`403`) |
| Entregar con/sin km | Sí | No (sin acceso panel) |

### Casos límite

- [ ] Enviar `mileage: -1` o decimal → `400`.
- [ ] Enviar string `"abc"` → `400`.
- [ ] Doble entrega: sin cambio respecto US-008 (`409` / idempotencia).
- [ ] Entregar con mileage en body sobre OT que ya tenía km: actualizar al nuevo valor en la misma operación (permite corrección de último momento).

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Crear sin km; editar km (incluso post-entrega); recordatorio y entrega con/sin km |
| Mecánico | `MECHANIC` | Crear sin km; editar km solo si OT no está `ENTREGADA` |

---

## [original] Notas técnicas

- Cambiar obligatoriedad de `mileage` en API, Zod frontend y schema Prisma.
- Entrega no debe exigir kilometraje.

## [enhanced] Especificación técnica

### Modelo de datos

```prisma
model WorkOrder {
  // ...
  mileage Int?   // was Int (required) — US-D7
  // ...
}
```

**Migración SQL (orientativa):**

```sql
ALTER TABLE "WorkOrder" ALTER COLUMN "mileage" DROP NOT NULL;
```

### Contratos API

Prefijo existente `/api`. Autenticación JWT + roles como hoy.

#### `POST /api/work-orders` (cambio)

**Request — mileage opcional:**

```json
{
  "vehicleId": "vehicle-uuid",
  "entryReason": "Vehículo no enciende — ingresa varado",
  "mileage": null,
  "assignedMechanicId": "user-uuid",
  "initialTasks": [{ "description": "Diagnóstico eléctrico" }]
}
```

También válido **omitir** la propiedad `mileage`.

**DTO (`CreateWorkOrderDto`):**

```typescript
@IsOptional()
@ValidateIf((_, v) => v !== null && v !== undefined)
@IsInt()
@Min(0)
@Type(() => Number)
mileage?: number | null;
```

**Response `201`:** incluye `"mileage": null` cuando no se informó.

#### `PATCH /api/work-orders/:id/mileage` (**nuevo**)

Roles: `@Roles('ADMIN', 'MECHANIC')`.

**Request:**

```json
{ "mileage": 85400 }
```

o

```json
{ "mileage": null }
```

**Response `200`:**

```json
{
  "id": "work-order-uuid",
  "mileage": 85400,
  "updatedAt": "2026-07-15T18:00:00.000Z"
}
```

**Errores:**

| Código | Condición |
|--------|-----------|
| `400` | Validación (`mileage` no entero ≥ 0 ni null) |
| `401` | Sin autenticación |
| `403` | `MECHANIC` sobre OT `ENTREGADA` |
| `404` | OT inexistente |

#### `PATCH /api/delivery/ready/:workOrderId/deliver` (extensión)

Roles: `@Roles('ADMIN')`.

**Request (opcional):**

```json
{ "mileage": 125000 }
```

Body vacío `{}` o sin body → entrega sin tocar mileage (salvo reglas actuales de estado).

**Efectos (transacción recomendada):**

1. Si body trae `mileage` (number): validar ≥ 0 y setear `mileage`.
2. `status → ENTREGADA`, `deliveredAt = now()`.

**Response `200`:**

```json
{
  "workOrderId": "uuid",
  "status": "ENTREGADA",
  "deliveredAt": "2026-07-15T19:00:00.000Z",
  "mileage": 125000
}
```

(`mileage` refleja el valor final persistido, posiblemente `null`.)

**Errores:** además de US-008, `400` si `mileage` inválido.

#### DTOs / responses a tipar `number | null`

- `WorkOrderDetailResponseDto.mileage`
- `DeliveryReadyDetailDto.mileage`
- Mappers history / visit (`VisitHistory` / web types)
- Web: `work-order.types.ts`, `delivery.types.ts`, `history.types.ts`

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
prisma/schema.prisma
prisma/migrations/<timestamp>_work_order_mileage_nullable/migration.sql

src/modules/work-orders/
├── dto/create-work-order.dto.ts          # mileage optional/null
├── dto/update-work-order-mileage.dto.ts  # NUEVO
├── dto/work-order-detail-response.dto.ts # mileage: number | null
├── mappers/work-order.mapper.ts
├── work-orders.controller.ts             # PATCH :id/mileage
├── work-orders.service.ts                # create + updateMileage
└── work-orders.service.spec.ts

src/modules/delivery/
├── dto/deliver-work-order.dto.ts         # NUEVO (optional mileage)
├── dto/deliver-work-order-response.dto.ts
├── dto/delivery-ready-detail.dto.ts      # mileage: number | null
├── delivery.controller.ts                # @Body() opcional en deliver
├── delivery.service.ts                   # markDelivered(id, dto?)
└── delivery.service.spec.ts

src/modules/history/mappers/visit-history.mapper.ts
test/work-orders.e2e-spec.ts
test/delivery.e2e-spec.ts
```

**Frontend (`apps/web`)**

```
src/features/work-orders/
├── utils/createWorkOrderSchema.ts        # mileage opcional
├── components/WorkOrderCreateForm.tsx    # default vacío + ayuda
├── components/WorkOrderDetailHeader.tsx  # Sin registrar + editar
├── components/UpdateMileageDialog.tsx    # NUEVO (opcional)
├── hooks/useUpdateMileage.ts             # NUEVO
├── services/workOrdersApi.ts
└── types/work-order.types.ts

src/features/delivery-panel/
├── components/DeliverConfirmDialog.tsx   # ampliar o crear: reminder + input
├── components/DeliveryReadyDetail.tsx
├── types/delivery.types.ts
└── services/deliveryApi.ts

src/features/history/
├── components/VisitCard.tsx
└── utils/normalizeHistoryVisit.ts        # quitar ?? 0

e2e/ (work-orders + delivery-panel specs)
```

**Documentación**

- Actualizar snippet de create en `readme.md` / `docs/data-model.md` si documentan `mileage` como NOT NULL.
- Mantener alineado D7 en `readme.md` (ya describe el comportamiento).

### Flujo de implementación (orden sugerido)

1. Migración nullable + tipos DTO/response + mapper.
2. Tests unitarios create sin mileage / con null / inválido (red → green).
3. Ajustar `CreateWorkOrderDto` + service create.
4. Implementar `updateMileage` + controller + tests (incl. 403 post-entrega mecánico).
5. Extender `markDelivered` con body opcional + tests.
6. Frontend create form (schema + default vacío).
7. UI detalle: mostrar null + diálogo PATCH mileage.
8. UI delivery: reminder + body opcional.
9. Historial/delivery detail null-safe.
10. E2E críticos + DoD manual.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit (work-orders)** | create omitiendo mileage → null; create `mileage: null`; create con 85400; create `-1` → 400; `updateMileage` en `EN_PROCESO`; clear a null; mechanic en `ENTREGADA` → 403; admin en `ENTREGADA` OK |
| **Unit (delivery)** | deliver sin body y mileage null → ENTREGADA + null; deliver con `{ mileage: N }` persiste N; mileage inválido → 400 y status no cambia |
| **E2E API** | POST sin mileage 201; PATCH mileage 200; PATCH deliver con y sin mileage |
| **E2E web** | Crear OT dejando km vacío; editar km en detalle; entregar con reminder omitiendo km; historial muestra *Sin registrar* |

Cobertura objetivo de los nuevos/paths modificados: ≥ 90 % en servicios afectados.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Integridad** | Entrega + set de mileage en la misma transacción cuando ambos aplican |
| **UX** | Textos en español; nunca inventar `0` por null |
| **Seguridad** | Solo roles autorizados; JWT + `RolesGuard`; sin exposición de campos internos |
| **Compatibilidad** | Clientes API antiguos que envían `mileage` numérico siguen funcionando |
| **Rendimiento** | PATCH mileage p95 < 300 ms; deliver sin regresión vs US-008 |
| **Migración** | Zero-downtime: solo `DROP NOT NULL`; sin rewrite de datos |

### Definition of Done

- [ ] Migración aplicada en entornos de desarrollo.
- [ ] Create OT sin kilometraje funciona end-to-end.
- [ ] Actualización de km desde detalle funciona (ADMIN y MECHANIC en OT abierta).
- [ ] Recordatorio en entrega + entrega sin km + entrega con km en el mismo paso.
- [ ] Ninguna UI muestra `0 km` cuando el valor es `null`.
- [ ] Tests unitarios y e2e API/web de la matriz anterior en verde.
- [ ] `readme.md` D7 / data-model alineados si aún dicen `mileage` NOT NULL.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-005 (crear OT), US-008 (panel entrega) |
| **Afecta** | US-006 (cabecera detalle), US-009 (historial visitas) |
| **No bloquea** | US-D1/D2 (contacto/email) |

---

## [original] Prioridad

Alta prioridad V2 (deseable).

## [enhanced] Prioridad

**Alta (V2 P1)** — impacto diario en recepción de vehículos varados; cambio acotado de modelo + 3 superficies UI.

**Estimación orientativa:** 1.5–2.5 días (1 dev full-stack) incluyendo migración, tests y ajustes de historial/entrega.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D7 |
| **Deseable** | D7 |
| **Módulos** | `work-orders`, `delivery`, `history` (read) |
| **Estado refinamiento** | Enhanced (local) — sin Jira MCP en este entorno; pendiente sync a tablero si aplica |
| **Archivo** | `us/Deseables/US-D7-kilometraje-opcional-orden-trabajo.md` |
