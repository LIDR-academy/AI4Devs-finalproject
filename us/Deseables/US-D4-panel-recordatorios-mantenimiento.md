# US-D4 — Panel de Recordatorios de Mantenimiento Preventivo

**Fuente:** `readme.md` → D4 · **Prioridad:** V2 (deseable alta)  
**Rama de implementación:** `finalproject-RFM` (salvo petición explícita)  
**Estado refinamiento:** Enhanced (local) — `/enrich-us` 2026-08-13 (+ widget Dashboard)  
**Sin Jira MCP** en este entorno

---

## [original] Historia de Usuario

**Como** administrador del taller,
**quiero** ver vehículos con más de 6 meses sin visita y enviarles recordatorios por correo,
**para** reactivar clientes inactivos y promover mantenimiento preventivo.

## [original] Criterios de Aceptación

- [ ] Se listan vehículos con ≥1 OT cerrada y >180 días desde el cierre de la última OT.
- [ ] Se excluyen vehículos marcados como *"No volver a recordar"*.
- [ ] Columnas: placa, modelo, propietario, correo, última visita, días sin visita.
- [ ] Selección individual, múltiple y “seleccionar todos”.
- [ ] Envío de correo personalizado con datos del vehículo e invitación a agendar; CC al admin.
- [ ] Advertencia y exclusión del envío si falta correo.
- [ ] Se registra fecha/hora del último recordatorio enviado (visible en panel).
- [ ] Exclusión permanente reversible desde gestión de exclusiones.

## [original] Roles involucrados

- Administrador

## [original] Notas técnicas

- Cálculo por job/cron o consulta en tiempo real según volumen.
- Comparte dependencia de correo con D2.
- Modelo: exclusión por vehículo + historial/último recordatorio.

## [original] Prioridad

Alta prioridad V2 (deseable).

---

## [enhanced] Historia de Usuario

**Como** administrador autenticado,
**quiero**:
1. En el **Dashboard** (`/admin/dashboard`) un bloque **“Recordatorios”** con hasta **5** vehículos elegibles y un enlace **“Ver más”** a la pantalla completa, y  
2. En **`/admin/reminders`** el panel completo (listado, selección, envío batch, opt-out/in),  

**para** ver al entrar al taller quién lleva mucho sin visita y, con un clic, gestionar la campaña completa — sin un home vacío ni depender solo de un menú oculto.

**Feedback de producto (2026-08-13):** mismo patrón que US-D10 (Órdenes en curso): resumen en dashboard + “ver todos/más” a la página dedicada.

**Contexto operativo:** clientes que no vuelven tras una reparación; el taller quiere invitarlos a un service preventivo.

### Alcance V2 (cerrado)

| # | Capacidad |
|---|-----------|
| 1 | Elegibles en tiempo real (>180 días desde última `ENTREGADA`, sin OT activa, sin opt-out) |
| 2 | `GET /api/reminders/eligible` con **`limit` / `offset`** (dashboard usa `limit=5`) |
| 3 | Widget admin dashboard + **Ver más** → `/admin/reminders` |
| 4 | Página completa: tabla, selección, envío, resumen, exclusiones |
| 5 | Opt-out / opt-in sobre campos Prisma ya existentes en `Vehicle` |
| 6 | Envío batch vía `EmailPort` (US-D2) |
| 7 | Nav admin **Recordatorios** |
| 8 | Umbral `REMINDER_INACTIVE_DAYS` (default 180) |

### Fuera de alcance

- SMS / WhatsApp; envío automático sin confirmación humana
- Widget en dashboard del **mecánico** (solo `ADMIN`)
- KPIs / gráficos en dashboard
- Segmentación por marca / tipo de servicio
- Cola Bull; tabla `ReminderSendLog` completa (V2.1)
- Sustituir el widget de OT en curso (US-D10); **conviven** ambos bloques

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-008 (`ENTREGADA` / `deliveredAt`), US-003 (email), **US-D2** (`EmailPort`) |
| **UX alineada** | US-D10 (widget + Ver más) |
| **Mejorado por** | US-D5 (búsqueda por email fuera del panel) |
| **Ownership** | Dueño actual vía ownership activa (US-004 / US-D3) |

**Nota de entrega:** el **widget y listado elegibles** pueden desarrollarse con mailer en modo console/disabled; el **envío real** requiere US-D2. Preferir D2 antes o en paralelo (interface + console mínimo).

### Gap actual (código)

- Prisma `Vehicle` ya tiene: `excludeFromReminders`, `excludedAt`, `excludedById`, `lastReminderSentAt`
- No hay módulo `reminders`, rutas ni UI
- Dashboard admin ya tiene widget OT (D10); **aún no** hay bloque Recordatorios
- Nav: tras D10 existe **En curso**; falta **Recordatorios**

---

## [enhanced] Criterios de Aceptación

### 1. Elegibilidad (fuente de verdad)

Un vehículo es **elegible** sii cumple **todas**:

1. `excludeFromReminders = false`
2. ≥1 OT con `status = ENTREGADA` y `deliveredAt IS NOT NULL`
3. `lastDeliveredAt = MAX(deliveredAt)` de esas OT
4. `lastDeliveredAt <= now() - REMINDER_INACTIVE_DAYS` (default **180**)
5. **Sin** OT activa: `status IN (EN_PROCESO, LISTA_PARA_ENTREGA, OWNER_CONTACTED)`
6. Ownership activa (`validTo IS NULL`) para propietario/correo  
   - Sin ownership activa → **excluir** del listado

### 2. Modelo (schema existente)

| Campo Prisma | Uso |
|--------------|-----|
| `Vehicle.excludeFromReminders` | Opt-out |
| `Vehicle.excludedAt` / `excludedById` | Auditoría opt-out |
| `Vehicle.lastReminderSentAt` | Último envío **exitoso** |

- [ ] Sin renombrar columnas; migración solo si faltara algún campo (hoy presentes).

### 3. API — prefijo `/api/reminders` · solo `ADMIN`

#### `GET /api/reminders/eligible`

| Query | Default | Reglas |
|-------|---------|--------|
| `limit` | `50` (página completa) | Min 1, max **100**. Dashboard: **`5`** |
| `offset` | `0` | Min 0 |
| `days` | env / 180 | Opcional; min 30, max 730 |
| `q` | — | Opcional: contains placa/nombre |

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
  "total": 42,
  "limit": 5,
  "offset": 0,
  "thresholdDays": 180
}
```

- [ ] `canEmail = Boolean(ownerEmail)`
- [ ] Orden: **`lastVisitAt` ASC** (más tiempo sin visita primero)
- [ ] `total` = conteo completo elegible (no solo página)
- [ ] Lista vacía → `200` + `items: []`, `total: 0`

#### `POST /api/reminders/send`

Request: `{ "vehicleIds": ["uuid", ...] }` — máx. **100**.

- [ ] Revalidar elegibilidad por id; `skipped_not_eligible` / `skipped_no_email` / `skipped_disabled` / `sent` / `failed`
- [ ] Solo `sent` actualiza `lastReminderSentAt`
- [ ] Éxito parcial → HTTP **200** + `summary`

#### `POST /api/reminders/:vehicleId/opt-out` · `opt-in`

- [ ] Flags Prisma; idempotente; `404` si no existe

#### `GET /api/reminders/opted-out`

- [ ] Listado de exclusiones + datos para reactivar

### 4. UI — Widget Dashboard (ADMIN) — **nuevo en este enrich**

**Ubicación:** `/admin/dashboard`, **debajo** del widget US-D10 “Órdenes en curso” (o debajo del saludo si D10 no montara; en código actual: tras OT).

| Elemento | Copy / comportamiento |
|----------|------------------------|
| Título | **Recordatorios** |
| Datos | `GET .../eligible?limit=5&offset=0` |
| Filas | Hasta **5**: placa · vehículo · días sin visita · (opcional) *Sin correo* |
| Ver más | Enlace **“Ver más”** → `/admin/reminders` si `total > 0` (y siempre evidente si `total > 5`) |
| Vacío | *“No hay vehículos pendientes de recordatorio.”* (sin Ver más obligatorio) |
| Loading / error | *Cargando recordatorios…* / *No se pudieron cargar los recordatorios.* |
| Acciones en widget | **Solo lectura + Ver más** — no checkboxes ni envío en el dashboard |

- [ ] Solo visible para `ADMIN` (el dashboard mecánico **no** incluye este bloque).
- [ ] Click fila opcional → detalle vehículo `/vehicles/[id]` (nice-to-have); mínimo: Ver más a la página completa.

### 5. UI — Página completa `/admin/reminders`

- [ ] H1: **Recordatorios de mantenimiento**
- [ ] Tabla (readme + último recordatorio):

| Placa | Modelo | Propietario | Correo | Última visita | Días sin visita | Último recordatorio |
|-------|--------|-------------|--------|---------------|-----------------|---------------------|

- [ ] Checkboxes + seleccionar todos **de la página visible**
- [ ] Sin email: marcar visualmente; al enviar → `skipped_no_email`
- [ ] **Enviar recordatorio** + diálogo de confirmación + summary post-send
- [ ] **No volver a recordar** por fila
- [ ] Sección/tab **Exclusiones** + **Reactivar**
- [ ] Empty: *“No hay vehículos pendientes de recordatorio.”*
- [ ] Paginación si `total` > page size (p. ej. 50)

### 6. Navegación

- [ ] `ADMIN_NAV`: ítem **Recordatorios** → `/admin/reminders`  
  Orden sugerido: Panel → En curso → **Recordatorios** → Usuarios → … (plan FE fija)
- [ ] Aparece en barra desktop y drawer móvil (US-F1 / `nav-items.ts`)

### 7. Correo (plantilla)

**Asunto:** `Te esperamos de nuevo — mantenimiento {placa} | {WORKSHOP_NAME}`

- [ ] Saludo, placa/marca/modelo, invitación a agendar, contacto taller
- [ ] **No** montos de OT (distinto a D2)
- [ ] `to` = owner; `cc` = taller + actor (dedupe)

### 8. Autorización

- [ ] API + páginas: solo `ADMIN`
- [ ] `MECHANIC` → `403` / sin nav / sin widget

### 9. Casos límite

| Caso | Esperado |
|------|----------|
| OT activa + última entrega >180d | No elegible |
| Opt-out | Sale de elegibles / widget |
| Dashboard con `total=0` | Empty copy; sin Ver más forzado |
| Dashboard `total>5` | 5 filas + Ver más claro |
| Transferencia D3 | Email = dueño **actual** |
| EMAIL_ENABLED=false | `skipped_disabled` por ítem |
| Batch parcial | 200 + summary |

### 10. Archivos previstos

**Backend**

```
apps/api/src/modules/reminders/          # NEW module
apps/api/src/modules/notifications/      # template + mailer D4
apps/api/.env.example                    # REMINDER_INACTIVE_DAYS
apps/api/test/reminders.e2e-spec.ts
docs/api-spec.reminders.yml              # NEW o sección en api docs
```

**Frontend**

```
apps/web/src/app/admin/dashboard/page.tsx     # + RemindersDashboardWidget
apps/web/src/app/admin/reminders/page.tsx     # NEW
apps/web/src/features/reminders/              # NEW feature folder
apps/web/src/shared/components/nav-items.ts   # Recordatorios
apps/web/e2e/reminders.spec.ts
```

### 11. Tests

| Capa | Mínimo |
|------|--------|
| Unit eligibility | 180d in/out; opt-out; OT activa; canEmail |
| Unit send | sent / skips / partial |
| E2E API | eligible limit=5; send; opt-out |
| Playwright | Admin dashboard muestra **Recordatorios**; Ver más → `/admin/reminders`; empty sin crash |

### 12. NFR

- [ ] GET eligible p95 razonable (taller <~5–10k vehículos)
- [ ] Batch parcial resiliente
- [ ] Secrets mail en env; no loguear cuerpos de email
- [ ] UI ES / código EN
- [ ] Sin npm UI nuevas
- [ ] Rama **`finalproject-RFM`**

### 13. Definition of Done

- [ ] Widget dashboard (5) + Ver más
- [ ] Panel completo + envío + opt-out/in
- [ ] `lastReminderSentAt` solo en `sent`
- [ ] Reusa EmailPort (D2)
- [ ] Tests unit + e2e/Playwright relevantes en verde
- [ ] Docs README api/web

---

## [enhanced] Roles involucrados

| Rol | Código | Permisos |
|-----|--------|----------|
| Administrador | `ADMIN` | Widget, panel, envío, opt-out/in |
| Mecánico | `MECHANIC` | Sin acceso |
| Cliente | — | Destinatario del correo |

---

## [enhanced] Prioridad

**Media-Alta (V2 P2)** — alto valor de negocio; depende de email (D2); campos Vehicle ya reservados; widget dashboard sube prioridad de UX (home útil).

**Estimación orientativa:** 3–4.5 días (1 dev) incluyendo elegibilidad Prisma + widget D10-like + UI batch + tests.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-D4 |
| **Deseable** | D4 |
| **Módulos** | `reminders`, `notifications` |
| **Rutas UI** | `/admin/dashboard` (widget), `/admin/reminders` (full) |
| **API clave** | `GET /api/reminders/eligible?limit=&offset=` |
| **Campos Vehicle** | `excludeFromReminders`, `excludedAt`, `excludedById`, `lastReminderSentAt` |
| **Patrón UX** | Igual espíritu US-D10 (resumen + ver más/todas) |
| **Archivo** | `us/Deseables/US-D4-panel-recordatorios-mantenimiento.md` |
