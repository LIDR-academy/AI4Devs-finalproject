# US-D10 — Órdenes Activas en el Dashboard (Resumen + Lista en Curso)

**Fuente:** feedback UX dashboard vacío · **Prioridad:** V2 (deseable alta)  
**Rama de implementación:** `finalproject-RFM` (salvo petición explícita de otra rama)  
**Estado refinamiento:** Enhanced (local) — sin Jira MCP en este entorno; listo para plan BE/FE  
**Refinado:** `/enrich-us` 2026-08-13

---

## [original] Historia de Usuario

**Como** administrador o mecánico que entra al Dashboard de MecaTrack,  
**quiero** ver un cuadro con máximo 5 órdenes de trabajo activas y una opción “Ver todas” que lleve a una pantalla de órdenes en curso,  
**para** no encontrarme un panel vacío y poder retomar el trabajo del taller de inmediato.

## [original] Criterios de Aceptación

- [ ] En el Dashboard aparece un cuadro con máximo 5 OT activas.
- [ ] Existe la opción de ver todas, que lleva a una pantalla de OT en curso.
- [ ] El Dashboard deja de sentirse “vacío” al entrar (hay contenido operativo o un vacío explícito).

---

## [enhanced] Historia de Usuario

**Como** administrador o mecánico autenticado en MecaTrack (`apps/web`),  
**quiero** que `/admin/dashboard` y `/mechanic/dashboard` muestren un bloque **“Órdenes en curso”** con hasta **5** OT activas (orden `updatedAt` desc), cada fila enlazando a `/work-orders/[id]`, y un enlace **“Ver todas”** a **`/work-orders/in-progress`**, respaldado por **`GET /api/work-orders/in-progress`**,  
**para** retomar el trabajo del taller al iniciar sesión sin un home vacío.

**Problema:** ambos dashboards hoy solo renderizan título + bienvenida (`admin/dashboard/page.tsx`, `mechanic/dashboard/page.tsx`).

**Gap API:** existe `GET /api/work-orders/active?vehicleId=` (una OT activa **por vehículo**). **No** hay listado global de OT activas. El panel de entrega (US-008/D1) no sustituye este resumen.

### Definiciones fijadas

**Estados “en curso” / activas** = `ACTIVE_WORK_ORDER_STATUSES`:

```typescript
[EN_PROCESO, LISTA_PARA_ENTREGA, OWNER_CONTACTED]
```

**No incluir:** `ENTREGADA` ni otros estados cerrados.

**Visibilidad**

| Rol | Filtro |
|-----|--------|
| `ADMIN` | Todas las OT con status ∈ activos |
| `MECHANIC` | Activas **y** `assignedMechanicId === currentUser.userId` |

**Orden canónico:** `updatedAt DESC`, desempate `id DESC`.

**Límite widget:** exactamente `limit=5` en el dashboard. Si `total > 5`, mostrar 5 + “Ver todas” (sin paginar el widget).

### Alcance / fuera de alcance

| Incluye | No incluye |
|---------|------------|
| Endpoint listado + DTOs + unit/e2e API | Cambiar máquina de estados de OT |
| Widget en ambos dashboards | KPIs, gráficos, kanban |
| Página `/work-orders/in-progress` + paginación | Sustituir `/admin/delivery` |
| Nav **“En curso”** en `nav-items.ts` | App móvil / PWA |
| Labels ES de estado en UI | Filtros avanzados (placa, mecánico) en V1 de D10 |
| Docs OpenAPI work-orders + README web | Nueva dependencia npm |

**Dependencias:** US-001, US-005, US-006. Compatible con US-D9 (owner null / broughtBy). **No** bloqueado por D2–D5.

---

## [enhanced] Criterios de Aceptación

### 1. API — `GET /api/work-orders/in-progress`

| Aspecto | Contrato |
|---------|----------|
| Método / ruta | `GET /api/work-orders/in-progress` |
| Auth | `JwtAuthGuard` + `RolesGuard` |
| Roles | `ADMIN`, `MECHANIC` |
| Registro Nest | Declarar **antes** de `@Get(':id')` (igual que `mechanics` / `active`) para no capturar `"in-progress"` como UUID |

**Query (`InProgressWorkOrdersQueryDto`):**

| Param | Tipo | Default | Reglas |
|-------|------|---------|--------|
| `limit` | int | `20` | Min 1, max **50**. Dashboard usa `5`. |
| `offset` | int | `0` | Min 0 |

**Response `200`:**

```json
{
  "items": [
    {
      "id": "uuid",
      "status": "EN_PROCESO",
      "entryReason": "Frenos",
      "checkedInAt": "2026-08-13T12:00:00.000Z",
      "updatedAt": "2026-08-13T15:00:00.000Z",
      "vehicle": {
        "id": "uuid",
        "licensePlate": "ABC123",
        "brand": "Toyota",
        "model": "Corolla"
      },
      "owner": {
        "fullName": "Juan Pérez",
        "nationalId": "1-2345-6789"
      },
      "broughtByName": null,
      "intakeMode": "OWNER",
      "assignedMechanic": {
        "id": "uuid",
        "fullName": "Ana Mecánica",
        "role": "MECHANIC"
      }
    }
  ],
  "total": 12,
  "limit": 5,
  "offset": 0
}
```

**Null-safety (US-D9):**

- `owner` puede ser `null` → UI: *“Sin propietario”*; si `broughtByName` → mostrar *“Traído por {nombre}”* en listado/detalle corto.
- `assignedMechanic` puede ser `null` → UI: *“Sin asignar”*.
- `intakeMode`: `'OWNER' | 'THIRD_PARTY'` (misma convención que detalle OT).

**Errores**

| Caso | HTTP |
|------|------|
| No autenticado | `401` |
| Rol no permitido | `403` |
| `limit` / `offset` inválidos | `400` (class-validator) |
| Lista vacía | `200` + `items: []`, `total: 0` |

**Implementación servicio (orientativa):**

```typescript
findInProgress(user: AuthenticatedUser, query: { limit: number; offset: number }) {
  const where = {
    status: { in: ACTIVE_WORK_ORDER_STATUSES },
    ...(user.role === 'MECHANIC'
      ? { assignedMechanicId: user.userId }
      : {}),
  };
  // prisma.workOrder.findMany + count en paralelo
  // include: vehicle, ownerClient, assignedMechanic
  // orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }]
  // skip: offset, take: limit
}
```

**No romper:** `GET /api/work-orders/active?vehicleId=` sigue igual.

### 2. Labels de estado (UI ES)

| `status` API | Texto UI |
|--------------|----------|
| `EN_PROCESO` | En proceso |
| `LISTA_PARA_ENTREGA` | Lista para entrega |
| `OWNER_CONTACTED` | Propietario contactado |

Centralizar en util FE existente o `mapWorkOrderStatusLabel` en `features/work-orders/utils`.

### 3. UI — Dashboard widget

**Ubicación:** debajo del saludo en:

- `apps/web/src/app/admin/dashboard/page.tsx`
- `apps/web/src/app/mechanic/dashboard/page.tsx`

Preferir componente compartido: `features/work-orders/components/InProgressWorkOrdersWidget.tsx` (prop `limit={5}`).

| Elemento | Copy / comportamiento |
|----------|------------------------|
| Título | **Órdenes en curso** |
| Filas | Máx. 5; cada una: **placa** (destacada) · marca/modelo · estado ES · mecánico (admin) · link “Ver” → `/work-orders/{id}` |
| Ver todas | Texto **“Ver todas”** → `/work-orders/in-progress`. Visible si `total > 0`. Si `total > 5`, debe ser claramente visible (p. ej. bajo la lista). |
| Vacío | *“No hay órdenes en curso.”* + link **“Nueva OT”** → `/work-orders/new` |
| Loading | Skeleton o *“Cargando órdenes…”* |
| Error | *“No se pudieron cargar las órdenes.”* + reintentar opcional |

Fetch: React Query `useInProgressWorkOrders({ limit: 5, offset: 0 })` → `GET .../in-progress?limit=5&offset=0`.

### 4. UI — Pantalla listado

| Aspecto | Valor |
|---------|-------|
| Ruta | `/work-orders/in-progress` |
| Layout | `work-orders/layout.tsx` (ADMIN + MECHANIC) |
| Título H1 | **Órdenes de trabajo en curso** |
| Contenido | Tabla o lista: placa, vehículo, estado, propietario/traído por, mecánico, actualizada; paginación `limit=20` |
| Vacío | Mismo mensaje + CTA Nueva OT |
| Fila | Navega a `/work-orders/[id]` |

**Nav** (`nav-items.ts`):

| Rol | Nuevo ítem |
|-----|------------|
| ADMIN | `{ href: '/work-orders/in-progress', label: 'En curso' }` — sugerido **después de Panel**, antes de Usuarios (o tras Nueva OT; plan FE fija orden) |
| MECHANIC | Idem tras Panel |

Active state: misma regla `pathname === href || startsWith(href + '/')`.

### 5. Archivos a crear / modificar

```
apps/api/src/modules/work-orders/
  work-orders.controller.ts          # MOD: GET in-progress (antes de :id)
  work-orders.service.ts             # MOD: findInProgress
  work-orders.service.spec.ts        # MOD/NEW cases
  dto/in-progress-work-orders-query.dto.ts      # NEW
  dto/in-progress-work-order-item.dto.ts        # NEW
  dto/in-progress-work-orders-response.dto.ts   # NEW
apps/api/test/work-orders.e2e-spec.ts           # MOD: list smoke
docs/api-spec.work-orders.yml                   # MOD

apps/web/src/features/work-orders/
  services/workOrdersApi.ts                     # MOD
  types/work-order.types.ts                     # MOD
  hooks/useInProgressWorkOrders.ts              # NEW
  components/InProgressWorkOrdersWidget.tsx     # NEW
  components/InProgressWorkOrdersPage.tsx       # NEW
  utils/mapWorkOrderStatusLabel.ts              # NEW or reuse
apps/web/src/app/admin/dashboard/page.tsx       # MOD
apps/web/src/app/mechanic/dashboard/page.tsx    # MOD
apps/web/src/app/work-orders/in-progress/page.tsx  # NEW
apps/web/src/shared/components/nav-items.ts     # MOD
apps/web/e2e/work-orders-in-progress.spec.ts   # NEW recommended
apps/web/README.md                              # MOD short note
```

### 6. Pruebas

| Capa | Casos |
|------|--------|
| Unit BE | Admin ve todas; mechanic solo asignadas; vacío; paginación `total` correcto; orden `updatedAt`; no incluye `ENTREGADA` |
| E2E API | `GET /in-progress` 200 + shape; mechanic no ve OT de otro; 401 sin token |
| Playwright | Login admin → dashboard muestra bloque; con ≥1 OT, “Ver todas” → URL `/work-orders/in-progress`; vacío sin crash |
| Regresión | `GET /active?vehicleId=` y detalle OT intactos |

### 7. NFR

- [ ] Sin libs UI nuevas; Tailwind + patrones existentes.
- [ ] Listado `limit` ≤ 50 (abuso); típico dashboard 5 / página 20.
- [ ] Respuesta p95 razonable con índices existentes (`status`, FKs); no exigir índice nuevo salvo medición.
- [ ] Código/docs inglés; copy UI español.
- [ ] No loguear PII completa en logs de error.
- [ ] Autorización en **servidor** (no solo ocultar en UI).

### 8. Documentación

- [ ] `docs/api-spec.work-orders.yml` — path `in-progress`
- [ ] `apps/web/README.md` — rutas dashboard widget + `/work-orders/in-progress`
- [ ] `us/Deseables/README.md` — status Implemented cuando cierre DoD
- [ ] Opcional: una línea en `readme.md` D10 si el comportamiento final difiere del borrador

### 9. Pasos de implementación (orden)

1. BE: DTOs + `findInProgress` + tests unitarios (TDD).
2. BE: controller route + e2e API.
3. OpenAPI work-orders.
4. FE: API client + hook + status labels.
5. FE: widget + wire dashboards.
6. FE: page `in-progress` + nav.
7. Playwright smoke.
8. Docs README / deseables status.

### 10. Definition of Done

- [ ] Todos los AC enhanced anteriores
- [ ] Código en **`finalproject-RFM`**
- [ ] Tests verdes relevantes
- [ ] Docs actualizadas
- [ ] Smoke manual: admin y mecánico, 0 OT, 1–5 OT, >5 OT

---

## Roles Involved

| Role | Responsibility |
|------|----------------|
| Backend developer | `GET in-progress`, filtros por rol, tests |
| Frontend developer | Widget, página, nav, Playwright |
| QA / product owner | Validar vacío vs poblado; admin vs mecánico |

## Notas de producto

- El panel **Listos para entrega** sigue siendo la vista post-taller; D10 es el “qué hay abierto” al entrar.
- KPI cards / totales del día = otra US futura.
- Dolor original: home solo con saludo (2026-08-13).
