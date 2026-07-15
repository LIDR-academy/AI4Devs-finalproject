# US-D4 — Panel de Recordatorios de Mantenimiento Preventivo

**Fuente:** `readme.md` → D4 · **Prioridad:** V2 (deseable alta)

## [original] Historia de Usuario

**Como** administrador del taller,
**quiero** ver vehículos con más de 6 meses sin visita y enviarles recordatorios por correo,
**para** reactivar clientes inactivos y promover mantenimiento preventivo.

## [enhanced] Historia de Usuario

**Como** administrador del taller,
**quiero** un panel `/admin/reminders` con vehículos elegibles (última OT **entregada** hace más de 180 días, sin visita activa, sin opt-out), poder seleccionar varios, enviar correos de reactivación con CC al taller, ver `lastReminderSentAt`, y marcar/revertir *No volver a recordar*,
**para** hacer campañas de mantenimiento sin Excel ni seguimiento manual.

**Contexto operativo:** clientes que no vuelven tras una reparación; el taller quiere invitarlos a un service preventivo.

**Alcance V2:**

- Consulta en tiempo real de elegibles (sin job/cron obligatorio en V2)
- CRUD de exclusión usando campos **ya en** `Vehicle`
- Envío batch/individual vía `EmailPort` (US-D2)
- UI admin: listado, selección, confirmación, resumen parcial, gestión de exclusiones
- Umbral configurable `REMINDER_INACTIVE_DAYS` (default 180)

**Fuera de alcance:**

- SMS / WhatsApp
- Envío automático programado sin confirmación humana
- Segmentación por tipo de servicio / marca
- Cola masiva tipo Bull (V2.1 si volúmenes grandes)
- Tabla `ReminderSendLog` completa (nice-to-have; V2 basta `lastReminderSentAt`)

**Dependencia:** US-008 (`ENTREGADA` + `deliveredAt`), US-003 (email cliente), US-D2 (`EmailPort`). **Mejora UX:** US-D5. **Ownership actual:** US-004 / US-D3.

**Estado actual (gap):**

- Prisma `Vehicle` **ya tiene**: `excludeFromReminders`, `excludedAt`, `excludedById`, `lastReminderSentAt` (no usar nombres inventados `reminderOptOut`)
- No hay módulo `reminders`, rutas ni UI
- No hay plantilla de recordatorio ni endpoints
- Nav admin sin enlace Recordatorios

---

## [original] Criterios de Aceptación

- [ ] Se listan vehículos con ≥1 OT cerrada y >180 días desde el cierre de la última OT.
- [ ] Se excluyen vehículos marcados como *"No volver a recordar"*.
- [ ] Columnas: placa, modelo, propietario, correo, última visita, días sin visita.
- [ ] Selección individual, múltiple y “seleccionar todos”.
- [ ] Envío de correo personalizado con datos del vehículo e invitación a agendar; CC al admin.
- [ ] Advertencia y exclusión del envío si falta correo.
- [ ] Se registra fecha/hora del último recordatorio enviado (visible en panel).
- [ ] Exclusión permanente reversible desde gestión de exclusiones.

## [enhanced] Criterios de Aceptación

### Elegibilidad (fuente de verdad)

Un vehículo es **elegible** sii cumple **todas**:

1. `excludeFromReminders = false`
2. Tiene al menos una OT con `status = ENTREGADA` y `deliveredAt IS NOT NULL`
3. Sea `lastDeliveredAt = MAX(deliveredAt)` de esas OT
4. `lastDeliveredAt <= now() - REMINDER_INACTIVE_DAYS` (default **180**)
5. **No** tiene OT activa: `status IN (EN_PROCESO, LISTA_PARA_ENTREGA, OWNER_CONTACTED)` — si está en taller, no recordar visita
6. Tiene ownership activa (`validTo IS NULL`) para resolver propietario/correo actuales  
   - Si no hay ownership activa (dato inconsistente): **excluir** del listado (o listar con warning; **preferido: excluir**)

**No elegible** si solo tiene OT `EN_PROCESO` históricas nunca entregadas, etc.

### Modelo (alineado al schema existente)

| Campo Prisma | Uso |
|--------------|-----|
| `Vehicle.excludeFromReminders` | Opt-out (“No volver a recordar”) |
| `Vehicle.excludedAt` | Timestamp opt-out |
| `Vehicle.excludedById` | Admin que excluyó |
| `Vehicle.lastReminderSentAt` | Último envío **exitoso** |

- [ ] No renombrar columnas en esta US; mapear UI a estos nombres.
- [ ] Migración **solo** si falta algún campo (en repo actual ya están).

### API

Prefijo `/api/reminders`. Roles: `@Roles('ADMIN')` en todo el módulo.

#### `GET /api/reminders/eligible`

Query opcionales:

| Query | Default | Uso |
|-------|---------|-----|
| `days` | `REMINDER_INACTIVE_DAYS` / 180 | Override umbral (mín. 30, máx. 730) — opcional |
| `q` | — | Filtro placa/nombre (contains) — opcional V2 |

**Response `200`:**

```json
{
  "items": [
    {
      "vehicleId": "uuid",
      "licensePlate": "ABC123",
      "vehicleLabel": "Toyota Corolla 2018",
      "ownerName": "Juan Pérez",
      "ownerEmail": "juan@email.com",
      "ownerClientId": "uuid",
      "lastVisitAt": "2024-10-15T18:00:00.000Z",
      "daysSinceVisit": 217,
      "lastReminderSentAt": null,
      "canEmail": true
    }
  ],
  "total": 1,
  "thresholdDays": 180
}
```

- [ ] `canEmail = Boolean(ownerEmail)`
- [ ] `daysSinceVisit` = floor días desde `lastVisitAt` (= `lastDeliveredAt`)
- [ ] Orden default: `daysSinceVisit` desc (más abandonados primero) o `lastVisitAt` asc — **preferido: `lastVisitAt` asc**
- [ ] Incluir columna implícita para UI: mostrar `lastReminderSentAt`

**Cálculo:** consulta en tiempo real (Prisma raw o groupBy). Para volumen taller (<~10k vehículos) suficiente sin materializar.

#### `POST /api/reminders/send`

**Request:**

```json
{
  "vehicleIds": ["uuid-1", "uuid-2"]
}
```

- [ ] Máximo p. ej. **100** IDs por request (`400` si excede).
- [ ] Revalidar elegibilidad **por cada** id dentro del handler (no confiar solo en UI): si dejó de ser elegible → resultado `skipped_not_eligible`.
- [ ] Si `!canEmail` → `skipped_no_email` (no llama proveedor).
- [ ] Si mailer disabled → `skipped_disabled` o fallar batch con claridad.
- [ ] Envío secuencial o con concurrencia limitada (p. ej. 3); **éxito parcial** permitido.
- [ ] Solo si `emailStatus=sent` para ese vehículo → `lastReminderSentAt = now()`.

**Response `200`:**

```json
{
  "results": [
    {
      "vehicleId": "uuid-1",
      "licensePlate": "ABC123",
      "emailStatus": "sent",
      "warning": null
    },
    {
      "vehicleId": "uuid-2",
      "licensePlate": "XYZ999",
      "emailStatus": "skipped_no_email",
      "warning": "El propietario no tiene correo registrado"
    }
  ],
  "summary": {
    "requested": 2,
    "sent": 1,
    "skipped": 1,
    "failed": 0
  }
}
```

#### `POST /api/reminders/:vehicleId/opt-out`

- [ ] Set `excludeFromReminders=true`, `excludedAt=now()`, `excludedById=actor`.
- [ ] Idempotente si ya excluido → `200`.
- [ ] Vehículo inexistente → `404`.

#### `POST /api/reminders/:vehicleId/opt-in`

- [ ] Set `excludeFromReminders=false`, `excludedAt=null`, `excludedById=null`.
- [ ] Vuelve a aparecer en elegibles **solo si** cumple reglas de días/OT.

#### `GET /api/reminders/opted-out`

Lista vehículos con `excludeFromReminders=true`: placa, modelo, owner actual (si hay), `excludedAt`, `excludedBy`.

### Contenido del correo (plantilla)

**Asunto:** `Te esperamos de nuevo — mantenimiento {placa} | {WORKSHOP_NAME}`

**Cuerpo:**

- [ ] Saludo con `ownerName`
- [ ] Vehículo: placa, marca, modelo (año)
- [ ] Mensaje: ha pasado tiempo desde la última visita; invitación a agendar mantenimiento
- [ ] Datos de contacto del taller (`WORKSHOP_NAME`, `WORKSHOP_PHONE`, opcional)
- [ ] **No** incluir montos de OT pasadas (distinto a US-D2)

**Destinatarios:** `to` = owner email; `cc` = `WORKSHOP_ADMIN_EMAIL` + email del actor (dedupe), igual convención US-D2.

Plantilla: `notifications/templates/maintenance-reminder.ts` reutilizando `EmailPort`.

### UI — `/admin/reminders`

- [ ] Solo `ADMIN`; enlace en `RoleNav`: **Recordatorios**.
- [ ] Tabla columnas (readme):

| Placa | Modelo | Propietario | Correo | Última visita | Días sin visita | Último recordatorio |
|-------|--------|-------------|--------|---------------|-----------------|---------------------|

- [ ] Checkboxes por fila + **Seleccionar todos (página visible)** — documentar: **no** select-all del universo no cargado si no hay paginación; si total ≤ 500 cargar completo, si más → paginar y select-all = página.
- [ ] Filas sin email: checkbox permitido pero marcadas visualmente (*Sin correo*); al enviar entran en `skipped_no_email`.
- [ ] Botón **Enviar recordatorio** disabled si 0 seleccionados.
- [ ] Diálogo confirmación: *“Se intentará enviar a N; M sin correo se omitirán.”*
- [ ] Post-send: modal/summary con conteos `sent/skipped/failed`.
- [ ] Acción por fila: **No volver a recordar** (confirmación).
- [ ] Tab/sección **Exclusiones**: listado opted-out + **Reactivar**.
- [ ] Empty state elegibles: *“No hay vehículos pendientes de recordatorio.”*
- [ ] Botón Actualizar (refetch).

### Autorización

- [ ] Solo `ADMIN` (API + `ProtectedRoute`).
- [ ] `MECHANIC` → `403` / redirect.

### Casos límite

| Caso | Esperado |
|------|----------|
| Vehículo con OT activa + última entrega >180d | No elegible |
| Opt-out | Sale de elegibles; entra a opted-out |
| Opt-in sin cumplir días | No aparece en elegibles hasta cumplir |
| Transferencia D3 | Email/nombre = **dueño actual** |
| `vehicleIds` con id no elegible | `skipped_not_eligible` en results |
| Batch vacío | `400` |
| Proveedor falla en 1 de N | Ese ítem `failed`; otros pueden `sent`; HTTP 200 con summary |
| EMAIL_ENABLED=false | `skipped_disabled` o 503 documentado — preferido: cada ítem `skipped_disabled` |

---

## [original] Roles involucrados

- Administrador

## [enhanced] Roles involucrados

| Rol | Código | Permisos |
|-----|--------|----------|
| Administrador | `ADMIN` | Listar, enviar, opt-out/in |
| Mecánico | `MECHANIC` | Sin acceso |
| Cliente | — | Destinatario del correo |

---

## [original] Notas técnicas

- Cálculo por job/cron o consulta en tiempo real según volumen.
- Comparte dependencia de correo con D2.
- Modelo: exclusión por vehículo + historial/último recordatorio.

## [enhanced] Especificación técnica

### Decisión de cálculo V2

**Tiempo real al cargar** `GET /eligible` (recomendado para taller pequeño/mediano).  
Job/cron = V2.1 si p95 de la query supera umbral o N crece.

### Query elegibilidad (orientativa)

```sql
-- Pseudológica: última entrega por vehículo, filtro días, sin OT activa, sin opt-out
```

Prisma: subquery/`groupBy` workOrders `ENTREGADA` por `vehicleId`, join Vehicle + ownership activa + Client.

Constante:

```typescript
export const DEFAULT_REMINDER_INACTIVE_DAYS = 180;
```

Env override: `REMINDER_INACTIVE_DAYS`.

### Arquitectura

```text
RemindersController
  └─ RemindersService (eligibility, opt-out/in)
       └─ MaintenanceReminderEmailService
            └─ EmailPort (US-D2)
```

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/reminders/
├── reminders.module.ts
├── reminders.controller.ts
├── reminders.service.ts
├── reminders.service.spec.ts
├── dto/eligible-*.dto.ts
├── dto/send-reminders.dto.ts
├── dto/send-reminders-response.dto.ts
└── constants/reminder-inactive-days.ts

src/modules/notifications/
├── templates/maintenance-reminder.ts     # NUEVO
└── maintenance-reminder-email.service.ts # NUEVO

prisma/schema.prisma   # ya OK — verificar campos
.env.example           # REMINDER_INACTIVE_DAYS

test/reminders.e2e-spec.ts
```

**Frontend (`apps/web`)**

```
src/app/admin/reminders/page.tsx
src/features/reminders/
├── components/RemindersPage.tsx
├── components/EligibleRemindersTable.tsx
├── components/SendRemindersDialog.tsx
├── components/OptedOutRemindersTable.tsx
├── hooks/useEligibleReminders.ts
├── hooks/useSendReminders.ts
├── hooks/useReminderOptOut.ts
├── services/remindersApi.ts
└── types/reminders.types.ts

src/shared/components/RoleNav.tsx   # enlace Recordatorios
e2e/reminders.spec.ts
```

**Docs**

- `apps/api/README.md`, `apps/web/README.md`
- Depende de documentar `EmailPort` (US-D2) antes o en el mismo epic

### Flujo de implementación (orden sugerido)

1. Confirmar campos Vehicle; tests de elegibilidad unitarios (fixtures con fechas).
2. `GET /eligible` + e2e API.
3. opt-out / opt-in / opted-out list.
4. Plantilla + send batch (mock EmailPort).
5. UI panel + nav + diálogos.
6. Integración provider real (shared D2).
7. DoD manual con datos seed (OT vieja entregada).

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit eligibility** | >180d entregada incluido; 179d excluido; opt-out excluido; con OT activa excluido; sin ENTREGADA excluido; sin email `canEmail=false` pero listado |
| **Unit send** | sent actualiza `lastReminderSentAt`; skip no email; skip not eligible; failed no actualiza timestamp; partial batch |
| **Unit opt** | opt-out/in flags |
| **E2E API** | GET eligible; POST send console; POST opt-out desaparece |
| **E2E web** | Selección, confirmación, summary; exclusiones |

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Resiliencia** | Batch partial; un fallo no aborta todo el array |
| **Performance** | GET eligible p95 < 1s para ≤5k vehículos (índice `deliveredAt` / status recomendable) |
| **Seguridad** | Solo ADMIN; secrets mail en env |
| **Privacidad** | No loguear cuerpos completos de email |
| **UX** | Español; fechas locales; select-all scope claro |
| **Config** | Umbral por env sin redeploy de lógica |

### Definition of Done

- [ ] Panel admin lista elegibles reales según reglas.
- [ ] Envío batch con resumen sent/skipped/failed.
- [ ] `lastReminderSentAt` visible y actualizado solo en éxitos.
- [ ] Opt-out / opt-in end-to-end.
- [ ] Sin envío automático no solicitado.
- [ ] Reusa `EmailPort`; CI con console/disabled.
- [ ] Tests unit + e2e en verde.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-008, US-D2 (`EmailPort`) |
| **Usa** | Ownership activa (US-004/D3) para dueño/email |
| **Mejorado por** | US-D5 (localizar dueños por email fuera del panel) |
| **Orden** | D2 antes o en paralelo (interface + console mínimo) |

### Nice-to-have V2.1

- `ReminderSendLog` (batchId, vehicleId, status, messageId, sentById)
- Cron diario que materializa elegibles
- Select-all “todo el universo filtrado” con confirmación de N grandes

---

## [original] Prioridad

Alta prioridad V2 (deseable).

## [enhanced] Prioridad

**Media-Alta (V2 P2)** — alto valor de negocio; depende de email (D2); campos Vehicle ya reservados.

**Estimación orientativa:** 2.5–4 días (1 dev) incluyendo elegibilidad SQL/Prisma no trivial + UI batch + tests.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D4 |
| **Deseable** | D4 |
| **Módulos** | `reminders`, `notifications` |
| **Ruta UI** | `/admin/reminders` |
| **Campos Vehicle** | `excludeFromReminders`, `excludedAt`, `excludedById`, `lastReminderSentAt` |
| **Estado refinamiento** | Enhanced (local) — sin Jira MCP en este entorno; pendiente sync a tablero si aplica |
| **Archivo** | `us/Deseables/US-D4-panel-recordatorios-mantenimiento.md` |
