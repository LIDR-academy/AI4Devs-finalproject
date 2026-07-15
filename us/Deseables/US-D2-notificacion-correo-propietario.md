# US-D2 — Notificación por Correo Electrónico al Propietario

**Fuente:** `readme.md` → D2 · **Prioridad:** V2 (deseable alta)

## [original] Historia de Usuario

**Como** administrador del taller,
**quiero** que al registrar el contacto con el propietario se envíe automáticamente un correo con el resumen de la OT,
**para** dejar constancia y facilitar el retiro del vehículo.

## [enhanced] Historia de Usuario

**Como** administrador del taller,
**quiero** que al marcar propietario contactado (US-D1) el sistema intente enviar un correo al cliente con el resumen de la OT (tareas, total, datos del vehículo), con **CC** al correo del taller y/o al mío, advirtiéndome si el cliente no tiene email o si el envío falla — **sin deshacer el contacto**,
**para** comunicar cobro y retiro sin redactar el mensaje a mano y sin bloquear la trazabilidad del contacto.

**Contexto operativo:** tras la llamada, el propietario necesita por escrito el monto y el detalle; el admin necesita copia en bandeja como evidencia entre turnos.

**Alcance V2:**

- Puerto/adaptador `EmailPort` (arquitectura monolito → `notifications`)
- Plantilla HTML + texto plano del resumen de OT
- Integración en `PATCH .../mark-contacted` (después del commit de contacto)
- Respuesta con estado de email (`sent` | `skipped_no_email` | `failed`)
- CC configurables + CC del actor
- Advertencia UI **antes** (diálogo) y **después** (toast/banner)
- Endpoint de **reenvío** si el contacto ya ocurrió
- Campo ligero `ownerNotifiedAt` (recomendado)

**Fuera de alcance:**

- SMS / WhatsApp / push
- Plantillas multi-idioma o white-label por taller
- Adjunto PDF de factura
- Cola asíncrona tipo Bull/SQS (aceptable V2.1 si el proveedor es lento; V2 puede await síncrono con timeout corto)
- Implementar panel D4 (solo compartir el mismo `EmailPort`)

**Dependencia:** US-D1 (disparo), US-008 (panel), US-003 (`Client.email`), US-006 (tareas/costos). **Comparte stack:** US-D4.

**Estado actual (gap):**

- No hay dependencia de correo en `apps/api/package.json` (ni SendGrid/SES/nodemailer)
- No existe módulo `notifications` ni `EmailPort` implementado (solo previsto en `readme.md`)
- `mark-contacted` aún no implementado (US-D1); esta US se implementa **encima** o en el mismo PR detrás de D1
- Email del propietario disponible vía `ownerClientId` → `Client.email` (nullable)

---

## [original] Criterios de Aceptación

- [ ] Al registrar el contacto (D1), el sistema envía correo al propietario con resumen de la OT.
- [ ] El correo incluye: saludo con nombre, datos del vehículo, tareas con costo, total, invitación a retirar.
- [ ] El correo va con **CC al administrador** del taller.
- [ ] Si el cliente no tiene correo, el sistema advierte antes de intentar el envío.

## [enhanced] Criterios de Aceptación

### Principio: contacto ≠ email

- [ ] El registro de contacto (transición a `OWNER_CONTACTED` + auditoría) **siempre se confirma en BD** si la OT es elegible (reglas US-D1).
- [ ] El envío de correo es **best-effort** posterior al commit; su fallo **no** hace rollback del contacto.
- [ ] HTTP del `mark-contacted` es `200` cuando el contacto se persistió, incluso si `emailStatus !== 'sent'`.

### Disparo

- [ ] Tras éxito de `PATCH /api/delivery/ready/:workOrderId/mark-contacted`, el servicio orquesta:
  1. Commit contacto (US-D1)
  2. Resolver email destino = `Client.email` del `ownerClientId` de la OT (snapshot; **no** el dueño actual del vehículo si cambió después)
  3. Intentar envío vía `EmailPort` si hay email y el mailer está habilitado
- [ ] Respuesta enriquecida (extiende US-D1):

```json
{
  "workOrderId": "uuid",
  "status": "OWNER_CONTACTED",
  "ownerContactedAt": "2026-07-15T20:00:00.000Z",
  "ownerContactedBy": { "id": "uuid", "fullName": "Admin Taller" },
  "emailStatus": "sent",
  "emailWarning": null,
  "ownerNotifiedAt": "2026-07-15T20:00:01.000Z"
}
```

| `emailStatus` | Cuándo | `emailWarning` (ej.) |
|---------------|--------|----------------------|
| `sent` | Proveedor OK | `null` |
| `skipped_no_email` | `Client.email` null/vacío | `El cliente no tiene correo registrado; el contacto quedó registrado.` |
| `skipped_disabled` | Mailer off (`EMAIL_ENABLED=false`) | `El envío de correo está deshabilitado en este entorno.` |
| `failed` | Excepción proveedor/timeout | `No se pudo enviar el correo; puedes reintentar.` |

### Advertencia **antes** de contactar (UI)

- [ ] En el diálogo de confirmación de US-D1, si `ownerEmail` del ítem/detalle es null/vacío:
  - Mostrar aviso amarillo: *“Este cliente no tiene correo. Se registrará el contacto pero no se enviará email.”*
  - Botón primario sigue habilitado (**Contactar de todos modos**).
- [ ] Si hay email: texto opcional *“Se enviará un resumen al correo {email} (CC al taller).”*

### Contenido del correo

**Asunto (es):**  
`Vehículo listo para retiro — {placa} | {WORKSHOP_NAME}`

**Cuerpo (HTML + text fallback) debe incluir:**

- [ ] Saludo: *Hola {ownerFullName},*
- [ ] Vehículo: placa, marca, modelo, año (si existe)
- [ ] Listado de tareas con `status = COMPLETED` y `cost != null` (alineado a `totalAmount`); si una completed tiene cost null, mostrar *Pendiente* o `₡0` según regla de totales existente — **preferido:** mismas tareas que alimentan `calculateTotalAmount`
- [ ] Total a cancelar formateado **CRC** (`es-CR`, símbolo ₡)
- [ ] Invitación explícita a retirar el vehículo / coordinar retiro
- [ ] Pie con datos de contacto del taller (`WORKSHOP_NAME`, `WORKSHOP_PHONE` opcionales)

**Destinatarios:**

| Campo | Fuente |
|-------|--------|
| `to` | `ownerClient.email` |
| `cc` | Lista deduplicada: `WORKSHOP_ADMIN_EMAIL` (si existe) **+** email del usuario autenticado que marca el contacto |
| `from` | `EMAIL_FROM` (remitente verificado del proveedor) |

- [ ] Si `to` inválido/ausente → no llamar al proveedor (`skipped_no_email`).
- [ ] No poner el mismo email dos veces en `cc` si el actor es también `WORKSHOP_ADMIN_EMAIL`.

### Reenvío

#### `POST /api/delivery/ready/:workOrderId/resend-owner-email`

Roles: `ADMIN`.

- [ ] Solo si `status ∈ { OWNER_CONTACTED, LISTA_PARA_ENTREGA? }` — **preferido:** solo `OWNER_CONTACTED` o `ENTREGADA` reciente; **mínimo V2:** `OWNER_CONTACTED` **o** `ENTREGADA` (útil si falló el mail pero el cliente aún no retiró).
- [ ] Requiere email en cliente; si falta → `422` `{ code: 'CLIENT_EMAIL_MISSING' }` sin cambiar estado OT.
- [ ] No exige re-marcar contacto; no cambia `ownerContactedAt`.
- [ ] Actualiza `ownerNotifiedAt` solo si envío exitoso.
- [ ] Response: `{ emailStatus, emailWarning, ownerNotifiedAt }`.

### Persistencia recomendada

| Campo | Tipo | Uso |
|-------|------|-----|
| `WorkOrder.ownerNotifiedAt` | `DateTime?` | Último envío **exitoso** al propietario |

- [ ] Migración nueva si el campo no existe.
- [ ] Tabla `NotificationLog` = **nice-to-have V2.1** (batch D4 se beneficiará); no bloquear D2.

### Configuración / feature flag

| Variable | Requerida | Uso |
|----------|-----------|-----|
| `EMAIL_ENABLED` | Sí (default `false` en local/test) | Apaga envíos reales |
| `EMAIL_PROVIDER` | Si enabled | `console` \| `smtp` \| `resend` \| `ses` \| `sendgrid` (elegir **uno** en implementación; documentar) |
| `EMAIL_FROM` | Si enabled | Remitente |
| `WORKSHOP_ADMIN_EMAIL` | Recomendada | CC taller |
| `WORKSHOP_NAME` | Recomendada | Asunto/pie |
| Credenciales proveedor | Si enabled ≠ console | API key / SMTP |

- [ ] Con `EMAIL_ENABLED=false` o provider `console`: tests y CI no golpean red; `console` loguea payload sin secretos.
- [ ] Startup: si `EMAIL_ENABLED=true` y faltan secrets → fail-fast claro (o degradar a disabled con log error — **preferido fail-fast en prod**).

### Autorización

- [ ] Solo `ADMIN` (mismos endpoints delivery).
- [ ] No exponer API keys al frontend; el browser solo ve `emailStatus` / warnings.

### UI post-acción

- [ ] Tras `mark-contacted`:
  - `sent` → toast éxito *“Contacto registrado y correo enviado.”*
  - `skipped_no_email` → toast warning (contacto OK)
  - `failed` / `skipped_disabled` → toast warning + CTA **Reenviar correo** si hay email
- [ ] En detalle de OT contactada: mostrar `ownerNotifiedAt` o *“Correo no enviado”* + botón reenviar.

### Casos límite

| Caso | Comportamiento |
|------|----------------|
| Cliente sin email | Contacto OK; `skipped_no_email`; no llama proveedor |
| Proveedor timeout/5xx | Contacto OK; `failed`; log error estructurado **sin** body completo del mail si contiene PII excesiva (log messageId/error code) |
| Email mal formado en BD | Tratar como skip o failed validación local (`400`/`skipped`) — preferido validar con regex/`IsEmail` antes de send |
| Actor sin email en JWT/User | CC solo `WORKSHOP_ADMIN_EMAIL` |
| Doble mark-contacted | US-D1 `409` — no reenvía mail automáticamente |
| Reenvío con mailer disabled | `skipped_disabled` o `503` claro |

### Seguridad / privacidad (NFR)

- [ ] No loguear HTML completo del correo en prod (o truncar); no loguear API keys.
- [ ] Helmet/HTTPS ya US-014; credenciales solo en env.
- [ ] Contenido del mail: solo datos de la OT del destinatario (no filtrar otras OT).

---

## [original] Roles involucrados

- Administrador

## [enhanced] Roles involucrados

| Rol | Código | Permisos |
|-----|--------|----------|
| Administrador | `ADMIN` | Dispara envío vía contactar / reenviar; recibe CC |
| Cliente (externo) | — | Destinatario (`to`) |
| Mecánico | `MECHANIC` | Sin acceso |

---

## [original] Notas técnicas

- Requiere servicio de correo transaccional (SendGrid, Mailgun, AWS SES, etc.).
- La arquitectura debe usar un puerto/adaptador de notificaciones.

## [enhanced] Especificación técnica

### Arquitectura

```text
DeliveryService.markContacted()
    │
    ├─► Prisma: OWNER_CONTACTED + auditoría          (US-D1)
    │
    └─► OwnerReadyEmailService.sendForWorkOrder()    (US-D2)
            │
            └─► EmailPort.send(...)                  (adapter)
                    ├─ ConsoleEmailAdapter (dev/test)
                    └─ ProviderEmailAdapter (prod)
```

Alineado a `readme.md`: módulo `notifications` + `EmailPort`.

### Puerto

```typescript
export interface EmailMessage {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  text: string;
}

export interface EmailSendResult {
  messageId: string;
}

export interface EmailPort {
  send(message: EmailMessage): Promise<EmailSendResult>;
}
```

Injection Nest: token `EMAIL_PORT`; binding según `EMAIL_PROVIDER`.

### Plantilla

- Función pura `buildOwnerReadyEmail(payload): { subject, html, text }` en `notifications/templates/owner-ready-for-pickup.ts`
- Input: ownerName, vehicle, tasks[{description, cost}], totalAmount, workshop meta
- Formato moneda: reutilizar util CRC del frontend o twin en API (`formatCrc`)

### Contratos API

#### Extensión de `PATCH .../mark-contacted`

Response = US-D1 + campos email arriba.

#### `POST /api/delivery/ready/:workOrderId/resend-owner-email`

**Request:** body vacío.

**Response `200`:**

```json
{
  "workOrderId": "uuid",
  "emailStatus": "sent",
  "emailWarning": null,
  "ownerNotifiedAt": "2026-07-15T21:00:00.000Z"
}
```

**Errores:** `401` | `403` | `404` | `409` (estado no elegible) | `422` `CLIENT_EMAIL_MISSING`

### Modelo

```prisma
model WorkOrder {
  // ...
  ownerNotifiedAt DateTime?  // US-D2
}
```

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/notifications/
├── notifications.module.ts
├── ports/email.port.ts
├── adapters/console-email.adapter.ts
├── adapters/<provider>-email.adapter.ts
├── templates/owner-ready-for-pickup.ts
├── owner-ready-email.service.ts
└── owner-ready-email.service.spec.ts

src/modules/delivery/
├── delivery.service.ts          # orquestar mail tras markContacted
├── delivery.controller.ts       # POST resend-owner-email
├── dto/mark-contacted-response.dto.ts  # + emailStatus
└── dto/resend-owner-email-response.dto.ts

prisma/schema.prisma             # ownerNotifiedAt
prisma/migrations/...

.env.example / apps/api/.env.example   # EMAIL_* WORKSHOP_*

test/delivery.e2e-spec.ts        # mock EmailPort
```

**Frontend (`apps/web`)**

```
src/features/delivery-panel/
├── components/MarkContactedDialog.tsx   # warning sin email
├── hooks/useMarkContacted.ts            # manejar emailStatus
├── hooks/useResendOwnerEmail.ts         # NUEVO
├── components/DeliveryReadyDetail.tsx   # CTA reenviar + ownerNotifiedAt
├── types/delivery.types.ts
└── utils/mapDeliveryError.ts

e2e/delivery-panel (mock o ENV mail console)
```

**Docs**

- `apps/api/README.md`: sección Email / variables
- `readme.md` D2: marcar implementable vía EmailPort
- Compartido con US-D4: no duplicar adaptadores

### Flujo de implementación (orden sugerido)

1. Migración `ownerNotifiedAt`.
2. `EmailPort` + `ConsoleEmailAdapter` + module Nest.
3. Plantilla + unit tests de contenido (snapshot strings clave).
4. `OwnerReadyEmailService` (skip sin email, set notifiedAt).
5. Enganchar en `markContacted` post-commit; ampliar DTO response.
6. Endpoint `resend-owner-email`.
7. UI warnings + toasts + botón reenviar.
8. Provider real detrás de flag (un proveedor) + docs `.env.example`.
9. E2E con `EMAIL_PROVIDER=console`.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit template** | Incluye placa, total, saludo; tareas completed |
| **Unit OwnerReadyEmail** | skip sin email; sent actualiza `ownerNotifiedAt`; failed no actualiza notifiedAt; failed no lanza al caller de markContacted |
| **Unit delivery** | markContacted response `emailStatus`; provider throw → contacto persistido + `failed` |
| **E2E API** | mark-contacted con cliente con email → `sent` (console); sin email → `skipped_no_email`; resend OK |
| **E2E web** | Diálogo advierte sin email; toast según status |

Mock: sustituir `EMAIL_PORT` en testing module.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Resiliencia** | Email nunca revierte contacto |
| **Timeout** | Await proveedor con timeout (p. ej. 5–8 s); al exceder → `failed` |
| **Observabilidad** | Log estructurado: workOrderId, emailStatus, messageId, error code |
| **Seguridad** | Secrets en env; no en repo; no en respuestas API |
| **i18n** | Correo en español (es-CR) en V2 |
| **Performance** | mark-contacted p95 aceptable con await; si > umbral, documentar cola V2.1 |
| **Reuso** | D4 consume el mismo `EmailPort` |

### Definition of Done

- [ ] Contactar con email → correo (o console) + `emailStatus=sent` + `ownerNotifiedAt`.
- [ ] Contactar sin email → contacto OK + warning UI/API.
- [ ] Fallo proveedor simulado → contacto OK + `failed` + opción reenvío.
- [ ] CC incluye taller y/o actor.
- [ ] Plantilla cumple checklist de contenido del readme D2.
- [ ] `.env.example` documentado; CI con mailer console/disabled.
- [ ] Tests unit + e2e en verde.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-D1 (endpoint mark-contacted), US-008, US-003 |
| **Comparte** | `EmailPort` con US-D4 |
| **Orden sugerido** | Implementar D1 primero (o mismo epic: D1 commit → D2 mail en seguida) |

### Decisión de proveedor (implementación)

Elegir **uno** para V2 prod y documentarlo en README API. Candidatos aceptables: Resend, SendGrid, AWS SES, SMTP genérico. Dev/test: `console` obligatorio.

---

## [original] Prioridad

Alta prioridad V2 (deseable).

## [enhanced] Prioridad

**Alta (V2 P1)** — extensión natural de D1; valor alto de comunicación; esfuerzo medio por integración externa.

**Estimación orientativa:** 2–3 días (1 dev) con adapter console + un provider; menos si solo console + interface (provider en follow-up).

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D2 |
| **Deseable** | D2 |
| **Módulos** | `notifications`, `delivery` |
| **Disparo** | `PATCH /api/delivery/ready/:workOrderId/mark-contacted` |
| **Reenvío** | `POST /api/delivery/ready/:workOrderId/resend-owner-email` |
| **Estado refinamiento** | Enhanced (local) — sin Jira MCP en este entorno; pendiente sync a tablero si aplica |
| **Archivo** | `us/Deseables/US-D2-notificacion-correo-propietario.md` |
