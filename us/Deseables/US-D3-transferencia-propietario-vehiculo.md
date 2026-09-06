# US-D3 — Transferencia de Propietario de Vehículo

**Fuente:** `readme.md` → D3 · **Prioridad:** V2 (deseable alta)

## [original] Historia de Usuario

**Como** administrador o mecánico,
**quiero** transferir un vehículo a un nuevo propietario cuando cambie de dueño,
**para** mantener el registro actualizado sin perder el historial técnico anterior.

## [enhanced] Historia de Usuario

**Como** administrador o mecánico,
**quiero** transferir un vehículo a un cliente existente o a uno nuevo creado en el mismo flujo, cerrando la `VehicleOwnership` vigente (`validTo = now`) y abriendo otra (`validFrom = now`, `validTo = null`),
**para** que el dueño actual en ficha/búsqueda se actualice, el historial de visitas conserve el propietario del momento del ingreso (`WorkOrder.ownerClientId`), y el perfil del dueño anterior deje de listar ese vehículo como activo.

**Contexto operativo:** venta entre particulares o cambio de titular; el taller debe seguir viendo el historial técnico de la placa sin reescribir dueños de visitas pasadas.

**Alcance V2:**

- `POST /api/vehicles/:id/transfer-ownership`
- UI **Transferir propietario** en ficha/edición de vehículo
- Reuso de búsqueda de clientes (`ClientPicker` / US-003; email con US-D5)
- Alta inline de cliente (mismos campos/validaciones US-003)
- Transacción atómica close+open (+ create client)
- Garantizar integridad ya anticipada en historial (tests D3 existentes)

**Fuera de alcance:**

- Validación legal / documentos de traspaso
- Undo automático de transferencias
- Multi-propietario simultáneo
- Reescritura de `ownerClientId` en OT abiertas o cerradas
- Timeline UI completa de ownerships (nice-to-have; API opcional)

**Dependencia:** US-003, US-004, US-005 (snapshot), US-009. Modelo `VehicleOwnership` **ya existe** en V1.

**Estado actual (gap):**

- `VehicleOwnership` con `validFrom` / `validTo` + índices; create vehicle ya crea ownership inicial
- Historial: `ownerAtVisit` desde snapshot; `currentOwner` desde ownership activa; test *preserves ownerAtVisit when current owner differs (D3)*
- Perfil cliente excluye vehículos con ownership terminada
- **No** existe endpoint de transfer
- UI: `VehicleEditForm` muestra *“El cambio de propietario estará disponible en una versión futura.”*
- `ClientPicker` ya existe para alta de vehículo (reutilizable)

---

## [original] Criterios de Aceptación

- [ ] Se puede seleccionar un cliente existente o registrar uno nuevo como nuevo propietario.
- [ ] Se registra la fecha del cambio en el historial del vehículo.
- [ ] El historial de visitas anteriores permanece íntegro y asociado al propietario original del momento.
- [ ] El nuevo propietario se refleja en vistas y OT **creadas después** del cambio.

## [enhanced] Criterios de Aceptación

### Reglas de negocio (core)

1. **Un solo ownership activo** por vehículo: exactamente un registro con `validTo IS NULL` (salvo el instante de la transacción).
2. Transferencia:
   - Localizar ownership activa (`vehicleId`, `validTo: null`).
   - Si no hay activa → `400` `Vehicle has no active ownership` (dato inconsistente; no inventar dueño silencioso salvo decisión ops).
   - Si `newClientId === active.clientId` → `409` `Client is already the current owner`.
   - Set `validTo = transferAt` (timestamp único de la transacción).
   - Insert nueva fila: `clientId = destino`, `validFrom = transferAt`, `validTo = null`.
3. **OT existentes** (cualquier status, abiertas o entregadas): **no modificar** `ownerClientId`.
4. **OT nuevas** tras el transfer: `WorkOrdersService.create` sigue leyendo ownership `validTo: null` → nuevo dueño.
5. **Perfil cliente (US-009):** el vehículo deja de aparecer en `vehicles[]` del dueño anterior; aparece en el nuevo.
6. Fecha del cambio = `validTo` del ownership cerrado / `validFrom` del nuevo (mismo instante).

### API — Transferir

| Método | Ruta | Roles |
|--------|------|-------|
| `POST` | `/api/vehicles/:id/transfer-ownership` | `ADMIN`, `MECHANIC` |

**Body — exactamente uno de:**

**A) Cliente existente**

```json
{
  "newClientId": "client-uuid"
}
```

**B) Alta inline**

```json
{
  "createClient": {
    "fullName": "María López",
    "nationalId": "2-3456-7890",
    "phone": "77776666",
    "email": "maria@email.com"
  }
}
```

- [ ] Validación: XOR — o `newClientId` o `createClient`, no ambos ni ninguno → `400`.
- [ ] Campos `createClient` = mismas reglas que `CreateClientDto` (`nationalId`, no `identification`).
- [ ] Duplicado `nationalId` al crear → `409` (mismo mensaje US-003); **no** cerrar ownership.
- [ ] `newClientId` inexistente → `404` `Client not found`.
- [ ] Vehículo inexistente → `404`.

**Response `200`:**

```json
{
  "id": "vehicle-uuid",
  "licensePlate": "ABC123",
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2018,
  "color": null,
  "currentOwner": {
    "id": "new-client-uuid",
    "fullName": "María López",
    "nationalId": "2-3456-7890",
    "phone": "77776666",
    "email": "maria@email.com"
  },
  "ownershipTransferredAt": "2026-07-15T22:00:00.000Z",
  "previousOwner": {
    "id": "old-client-uuid",
    "fullName": "Juan Pérez",
    "nationalId": "1-2345-6789"
  }
}
```

(Shape base = `VehicleResponseDto` + metadatos de transferencia.)

**Errores:**

| Código | Condición |
|--------|-----------|
| `400` | Body XOR inválido; sin ownership activa; validación createClient |
| `401` | Sin auth |
| `403` | Rol no permitido (N/A si ambos roles) |
| `404` | Vehículo o cliente destino |
| `409` | Mismo propietario; `nationalId` duplicado |

### Transaccionalidad / concurrencia

- [ ] Todo en `prisma.$transaction` (create client si aplica → close → open).
- [ ] Preferido: re-leer ownership activa **dentro** de la transacción; si `validTo` ya no es null → `409` `Ownership changed concurrently`.
- [ ] No dejar dos filas con `validTo: null` para el mismo `vehicleId`.

### UI

- [ ] En `/vehicles/[id]` (detalle y/o edición): botón **Transferir propietario** (reemplaza el texto “versión futura” de `VehicleEditForm`).
- [ ] Flujo modal/wizard:
  1. Mostrar propietario actual (placa + nombre).
  2. Buscar cliente (`ClientPicker` / search US-003; placeholder con email si D5).
  3. O **Registrar nuevo propietario** → formulario create client embebido.
  4. Confirmación: *“¿Transferir {placa} de {actual} a {nuevo}?”*
- [ ] Éxito: toast + invalidate vehicle detail / history / client queries.
- [ ] Si hay OT activa en el vehículo: **no bloquear** la transferencia; mostrar aviso informativo: *“Hay una visita abierta; el propietario de esa OT no cambiará.”*

### Historial / integridad (regresión obligatoria)

- [ ] `GET /api/vehicles/:id/history`: `currentOwner` = nuevo; `visits[].ownerAtVisit` = snapshot antiguo en visitas previas.
- [ ] Mantener/extender test unitario ya existente D3 en `history.service.spec.ts`.
- [ ] `GET /api/clients/:oldId`: vehículo **no** en lista activa.
- [ ] `GET /api/clients/:newId`: vehículo **sí** en lista activa.

### API opcional (nice-to-have)

#### `GET /api/vehicles/:id/ownership-history`

Lista ownerships ordenadas por `validFrom` desc: `{ client, validFrom, validTo }`.  
No bloquea DoD de D3.

### Autorización

- [ ] `ADMIN` y `MECHANIC` (igual US-004).
- [ ] Sin endpoint público.

### Casos límite

| Caso | Esperado |
|------|----------|
| Transferir al mismo cliente | `409` |
| Crear cliente con cédula existente | `409`; ownership intacta |
| Dos requests paralelos | Uno OK; otro `409` concurrente |
| Vehículo sin ownership (dato roto) | `400` |
| OT `OWNER_CONTACTED` abierta | Transfer OK; delivery sigue usando snapshot |
| Cliente nuevo solo con nombre+cédula | OK (phone/email opcionales US-003) |

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos |
|-----|--------|----------|
| Administrador | `ADMIN` | Transferir + crear cliente en flujo |
| Mecánico | `MECHANIC` | Transferir + crear cliente en flujo |

---

## [original] Notas técnicas

- La relación vehículo–propietario debe soportar historicidad (inicio/fin), no un FK simple mutable sin historial.

## [enhanced] Especificación técnica

### Modelo (ya en Prisma)

```prisma
model VehicleOwnership {
  id        String    @id @default(uuid())
  vehicleId String
  clientId  String
  validFrom DateTime  @default(now())
  validTo   DateTime? // null = vigente

  vehicle Vehicle @relation(...)
  client  Client  @relation(...)

  @@index([vehicleId, validTo])
  @@index([clientId])
}
```

No migración estructural obligatoria. Opción V2.1: índice único parcial SQL  
`UNIQUE (vehicleId) WHERE validTo IS NULL` — documentar como mejora; en V2 la app+transacción bastan.

### Pseudocódigo servicio

```typescript
async transferOwnership(vehicleId: string, dto: TransferOwnershipDto) {
  return this.prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException('Not Found');

    let targetClientId = dto.newClientId;
    if (dto.createClient) {
      // normalize + create (reuse ClientsService logic or shared helper)
      targetClientId = (await createClient(tx, dto.createClient)).id;
    } else {
      const client = await tx.client.findUnique({ where: { id: targetClientId } });
      if (!client) throw new NotFoundException('Client not found');
    }

    const active = await tx.vehicleOwnership.findFirst({
      where: { vehicleId, validTo: null },
      include: { client: true },
    });
    if (!active) throw new BadRequestException('Vehicle has no active ownership');
    if (active.clientId === targetClientId) {
      throw new ConflictException('Client is already the current owner');
    }

    const transferAt = new Date();
    await tx.vehicleOwnership.update({
      where: { id: active.id },
      data: { validTo: transferAt },
    });
    await tx.vehicleOwnership.create({
      data: {
        vehicleId,
        clientId: targetClientId,
        validFrom: transferAt,
        validTo: null,
      },
    });

    return this.findById(vehicleId); // + previousOwner metadata
  });
}
```

Reutilizar normalización de cliente (nationalId, email lowercase) del módulo `clients`.

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/vehicles/
├── dto/transfer-ownership.dto.ts          # NUEVO (+ nested createClient)
├── dto/transfer-ownership-response.dto.ts # NUEVO opcional
├── vehicles.controller.ts                 # POST :id/transfer-ownership
├── vehicles.service.ts                    # transferOwnership
└── vehicles.service.spec.ts

src/modules/clients/
└── (helper compartido create-in-transaction si hace falta)

src/modules/history/history.service.spec.ts  # regresión D3 (ya existe; ampliar)
test/vehicles.e2e-spec.ts                    # transfer cases
```

**Frontend (`apps/web`)**

```
src/features/vehicles/
├── components/TransferOwnershipDialog.tsx   # NUEVO
├── components/VehicleEditForm.tsx           # quitar placeholder; CTA
├── components/VehicleDetailHeader.tsx       # CTA
├── components/ClientPicker.tsx              # reutilizar
├── hooks/useTransferOwnership.ts            # NUEVO
├── services/vehiclesApi.ts
└── types/vehicle.types.ts

e2e/vehicles (transfer + history ownerAtVisit)
```

**Docs**

- `apps/api/README.md` / `apps/web/README.md`: documentar endpoint y UI
- `readme.md` D3 ya describe historicidad

### Flujo de implementación (orden sugerido)

1. DTO + validación XOR + unit tests servicio (mismo owner, create client, happy path).
2. `transferOwnership` transaccional + controller.
3. E2E API: transfer → history current vs visit owner; client profile lists.
4. UI dialog + remove “versión futura”.
5. Aviso OT activa (lectura `GET .../active?vehicleId=`).
6. Docs README.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit vehicles** | transfer existing client; createClient inline; same owner 409; missing ownership 400; concurrent close 409; nationalId duplicate no-op ownership |
| **Unit history** | ownerAtVisit ≠ currentOwner tras transfer (regresión) |
| **Unit/e2e clients profile** | vehículo sale del dueño viejo / entra al nuevo |
| **E2E API** | POST transfer 200; create OT después usa nuevo ownerClientId; OT previa intacta |
| **E2E web** | Transferir desde ficha; ver nuevo dueño en header |

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Integridad** | Transacción única; snapshot OT inmutable |
| **Concurrencia** | Detectar carrera en ownership activa |
| **UX** | Mensajes en español; confirmación explícita |
| **Seguridad** | JWT + roles; no filtrar datos de otros talleres (single-tenant OK) |
| **Rendimiento** | Transfer p95 < 500 ms (create client incluido) |
| **Auditoría** | Suficiente con filas ownership; sin tabla AuditLog requerida en V2 |

### Definition of Done

- [ ] Transfer end-to-end (cliente existente y nuevo).
- [ ] Historial: visitas viejas con dueño de entonces; ficha con dueño actual.
- [ ] Perfiles cliente coherentes (activo / excluido).
- [ ] OT abierta no reescribe snapshot; aviso UI presente.
- [ ] Placeholder “versión futura” eliminado.
- [ ] Tests unit + e2e en verde.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-003, US-004, US-005, US-009 |
| **Complementa** | US-D5 (buscar nuevo dueño por email) |
| **No bloquea** | US-D1/D2 (delivery usa snapshot) |

---

## [original] Prioridad

Alta prioridad V2 (deseable).

## [enhanced] Prioridad

**Alta (V2 P1)** — modelo ya listo; falta endpoint + UI; riesgo bajo si se respeta el snapshot.

**Estimación orientativa:** 1.5–2.5 días (1 dev full-stack) incluyendo tests de integridad historial/clientes.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D3 |
| **Deseable** | D3 |
| **Módulos** | `vehicles`, `clients` (create), `history` (regresión) |
| **Endpoint principal** | `POST /api/vehicles/:id/transfer-ownership` |
| **Estado refinamiento** | Enhanced (local) — sin Jira MCP en este entorno; pendiente sync a tablero si aplica |
| **Archivo** | `us/Deseables/US-D3-transferencia-propietario-vehiculo.md` |
