# US-003 — Registro de Clientes

## [original] Historia de Usuario

**Como** mecánico o administrador,
**quiero** registrar un nuevo cliente en el sistema,
**para** asociarlo a sus vehículos y órdenes de trabajo.

## [enhanced] Historia de Usuario

**Como** mecánico o administrador,
**quiero** buscar clientes existentes, crear nuevos y actualizar sus datos de contacto cuando sea necesario,
**para** evitar duplicados, mantener información actualizada y asociar vehículos de inmediato (US-004).

**Alcance MVP:** búsqueda de clientes, alta (create) y **edición** de datos de contacto. Acceso para `ADMIN` y `MECHANIC`. Fuera de alcance: eliminación, fusión de duplicados, cambio de identificación (`nationalId` inmutable), validación fiscal avanzada de identificación.

**Dependencia:** US-001 (autenticación). **Habilita:** US-004 (vehículos requieren `clientId`), US-005+ (OT vinculan vehículo → propietario).

---

## [original] Criterios de Aceptación

- [ ] El formulario de registro de cliente incluye: nombre completo, identificación, teléfono y correo electrónico.
- [ ] Los campos nombre completo e identificación son obligatorios; teléfono y correo son opcionales.
- [ ] El sistema verifica que la identificación no esté ya registrada antes de guardar; si existe, muestra el cliente encontrado en lugar de duplicar.
- [ ] Al guardar, el cliente queda disponible de inmediato para asociarlo a un vehículo.
- [ ] El sistema permite buscar clientes existentes por nombre, identificación o teléfono antes de crear uno nuevo.

## [enhanced] Criterios de Aceptación

### UI — Flujo búsqueda primero, alta después

- [ ] Rutas protegidas (ambos roles): `/clients` (búsqueda), `/clients/new` (alta) y `/clients/[id]/edit` (edición).
- [ ] Enlace **Clientes** en navegación de layouts admin y mecánico.
- [ ] Pantalla principal `/clients` muestra **barra de búsqueda** como primer elemento (no el formulario de alta).
- [ ] La búsqueda se dispara al escribir ≥ 2 caracteres, con debounce 300 ms y estado de carga.
- [ ] Resultados en lista/tarjetas: nombre, identificación, teléfono, correo (si existe).
- [ ] Botón **Nuevo cliente** visible siempre; al pulsarlo navega a `/clients/new` (o abre panel lateral).
- [ ] Desde un resultado, acciones **Editar cliente** y **Registrar vehículo**.

### Edición de cliente

- [ ] Ruta `/clients/[id]/edit` accesible para `ADMIN` y `MECHANIC`.
- [ ] Formulario precargado con datos actuales; campo **Identificación** en solo lectura (no editable).
- [ ] Campos editables: nombre completo, teléfono y correo (mismas validaciones que en alta).
- [ ] Tras guardar con éxito: mensaje *"Cliente actualizado"* y opciones **Volver a búsqueda** o **Registrar vehículo**.
- [ ] Cambios visibles de inmediato en búsqueda (invalidar caché React Query `['clients']`).

### Formulario de registro

- [ ] Campos:

| Campo UI | Campo API | Obligatorio | Validación |
|----------|-----------|-------------|------------|
| Nombre completo | `fullName` | Sí | 2–150 caracteres, trim |
| Identificación | `nationalId` | Sí | 5–20 caracteres alfanuméricos; trim; unique en BD |
| Teléfono | `phone` | No | Si se envía: 8–15 dígitos (normalizar espacios/guiones) |
| Correo electrónico | `email` | No | Si se envía: formato email válido |

- [ ] Botón **Guardar** deshabilitado si faltan obligatorios o hay errores de formato.
- [ ] Tras crear con éxito: mensaje *"Cliente registrado"* y opciones: **Registrar vehículo** (enlace a US-004 con `clientId`) o **Volver a búsqueda**.

### Prevención de duplicados

- [ ] Antes de `POST`, el frontend puede consultar `GET /api/clients/search?nationalId=...` al salir del campo identificación (blur).
- [ ] Si `nationalId` ya existe al guardar → API `409` con cuerpo del cliente existente; UI **no crea duplicado** y muestra tarjeta del cliente encontrado con enlace a su detalle/selección.
- [ ] Mensaje UI: *"Ya existe un cliente con esta identificación"* + datos del registro existente.

### Búsqueda

- [ ] Parámetro unificado `q` busca en: `fullName` (contiene, case-insensitive), `nationalId` (contiene o igualdad), `phone` (normalizado, contiene).
- [ ] Búsqueda por identificación exacta: `GET /api/clients/search?nationalId=1-2345-6789` (prioridad en flujo anti-duplicado).
- [ ] Sin resultados → mensaje *"No se encontraron clientes"* y CTA **Crear nuevo cliente**.
- [ ] Máximo 20 resultados por consulta; paginación **fuera de MVP**.

### Disponibilidad post-alta

- [ ] Cliente creado aparece en búsqueda inmediatamente (sin caché obsoleta en React Query: invalidar `['clients']`).
- [ ] `GET /api/clients/:id` devuelve el registro para flujos embebidos (selector en US-004/US-005).

### Autorización

- [ ] Endpoints accesibles con `ADMIN` y `MECHANIC` (`JwtAuthGuard` + roles).
- [ ] Usuario no autenticado → `401`.

### Casos límite

- [ ] `q` con menos de 2 caracteres → `400` o respuesta vacía (documentar: API devuelve `[]` si `q` length < 2).
- [ ] Solo espacios en campos → tratados como vacío / error de validación.
- [ ] `email` duplicado entre clientes: **permitido en MVP** (no unique); V2 podrá advertir si se usa para notificaciones.
- [ ] Caracteres especiales en nombre: permitir acentos y apóstrofos.

---

## [original] Roles involucrados

- Administrador
- Mecánico

## [enhanced] Roles involucrados

| Rol | Código | Permisos en esta US |
|-----|--------|---------------------|
| Administrador | `ADMIN` | Buscar, crear y editar clientes |
| Mecánico | `MECHANIC` | Buscar, crear y editar clientes |

---

## [original] Notas técnicas

- La búsqueda previa es clave para evitar duplicados; debe ejecutarse antes de mostrar el formulario de creación.
- El correo electrónico será utilizado en V2 para notificaciones; debe almacenarse aunque sea opcional en V1.

## [enhanced] Especificación técnica

### Modelo de datos (Prisma)

```prisma
model Client {
  id         String   @id @default(uuid())
  fullName   String
  nationalId String   @unique
  phone      String?
  email      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  vehicles   Vehicle[]  // relación US-004

  @@index([fullName])
  @@index([phone])
}
```

| Campo | Tipo | Restricciones |
|-------|------|---------------|
| `id` | `UUID` | PK |
| `fullName` | `String` | `not null` |
| `nationalId` | `String` | `unique`, `not null` — cédula u otra ID del propietario |
| `phone` | `String?` | opcional |
| `email` | `String?` | opcional; almacenar para D2/V2 aunque no se use en MVP |
| `createdAt` / `updatedAt` | `DateTime` | auditoría básica |

**Normalización en servicio:** `nationalId` y `phone` sin espacios extremos; `email` a minúsculas si presente.

### API REST

Prefijo `/api/clients`. Roles: `@Roles('ADMIN', 'MECHANIC')`.

#### `GET /api/clients/search`

| Query param | Descripción |
|-------------|-------------|
| `q` | Texto libre (nombre, id parcial, teléfono) — min 2 chars |
| `nationalId` | Búsqueda exacta o normalizada (anti-duplicado) |

**Response `200`:**

```json
{
  "items": [
    {
      "id": "uuid",
      "fullName": "Juan Pérez",
      "nationalId": "1-2345-6789",
      "phone": "88887777",
      "email": "juan@email.com"
    }
  ],
  "total": 1
}
```

**Errores:** `401` | `400` si ambos params vacíos

#### `GET /api/clients/:id`

**Response `200`:** objeto cliente (mismos campos).

**Errores:** `401` | `404`

#### `PATCH /api/clients/:id`

Actualiza `fullName`, `phone` y `email`. **`nationalId` no es editable** (clave de negocio).

**Request body:**

```json
{
  "fullName": "Juan Pérez Actualizado",
  "phone": "88881234",
  "email": "juan.updated@email.com"
}
```

**Response `200`:** cliente actualizado (mismos campos que GET).

**Errores:**

| Código | Condición |
|--------|-----------|
| `400` | Validación de campos |
| `401` | Sin autenticación |
| `404` | Cliente no encontrado |

#### `POST /api/clients`

**Request body:**

```json
{
  "fullName": "Juan Pérez",
  "nationalId": "1-2345-6789",
  "phone": "88887777",
  "email": "juan@email.com"
}
```

**Response `201`:** cliente creado (sin campos sensibles adicionales).

**Errores:**

| Código | Condición |
|--------|-----------|
| `400` | Validación de campos |
| `401` | Sin autenticación |
| `409` | `nationalId` duplicado — **body incluye cliente existente** |

**Ejemplo `409`:**

```json
{
  "statusCode": 409,
  "message": "Client with this national ID already exists",
  "error": "Conflict",
  "existingClient": {
    "id": "uuid",
    "fullName": "Juan Pérez",
    "nationalId": "1-2345-6789",
    "phone": "88887777",
    "email": "juan@email.com"
  }
}
```

### Archivos a crear o modificar

**Backend (`apps/api`)**

```
src/modules/clients/
├── clients.module.ts
├── clients.controller.ts     # GET search, GET :id, POST, PATCH :id
├── clients.service.ts        # search, create, update, findByNationalId
├── dto/
│   ├── create-client.dto.ts
│   ├── update-client.dto.ts
│   ├── search-clients.dto.ts
│   └── client-response.dto.ts
└── clients.service.spec.ts

prisma/schema.prisma          # model Client
prisma/seed.ts                # 2-3 clientes de ejemplo
```

**Frontend (`apps/web`)**

```
src/features/clients/
├── components/
│   ├── ClientSearchBar.tsx
│   ├── ClientSearchResults.tsx
│   ├── ClientForm.tsx
│   ├── ClientEditForm.tsx
│   └── ExistingClientAlert.tsx   # UI para 409 / duplicado
├── hooks/
│   ├── useClientSearch.ts
│   ├── useCreateClient.ts
│   └── useUpdateClient.ts
├── services/
│   └── clientsApi.ts
└── types/
    └── client.types.ts

src/app/clients/
├── page.tsx                    # búsqueda principal
├── new/page.tsx                # formulario alta
└── [id]/edit/page.tsx          # formulario edición

src/app/admin/layout.tsx        # nav link Clientes
src/app/mechanic/layout.tsx     # nav link Clientes
```

### Flujo de implementación (orden sugerido)

1. Migración Prisma `Client` + seed.
2. Tests unitarios `ClientsService` (search por q, create OK, duplicate `nationalId`).
3. Controller + DTOs + registro en `AppModule`.
4. Tests e2e: search, create, 409 con `existingClient`.
5. UI `/clients` con búsqueda debounced y listado.
6. UI `/clients/new` + manejo `409` con `ExistingClientAlert`.
7. Invalidación de caché y enlace opcional a `/vehicles/new?clientId=` (stub US-004).
8. Actualizar `readme.md` §4 si se documenta `POST /clients` como endpoint de ejemplo.

### Tests requeridos

| Capa | Escenarios mínimos |
|------|-------------------|
| **Unit** | search by name fragment; search by nationalId; create; update; duplicate nationalId throws/conflict payload |
| **Integration** | GET search 200; POST 201; PATCH 200; PATCH 404; POST 409 body shape; GET :id 404; MECHANIC y ADMIN autorizados; 401 sin token |
| **E2E (opcional)** | Buscar → sin resultados → crear → aparece en nueva búsqueda |

Cobertura objetivo módulo `clients`: ≥ 90 % en service.

### Requisitos no funcionales

| Área | Requisito |
|------|-----------|
| **Seguridad** | Endpoints autenticados; sanitizar entrada; no exponer datos de otros talleres (single-tenant) |
| **Rendimiento** | Búsqueda p95 < 400 ms con índices en `nationalId`, `fullName` |
| **UX** | Búsqueda antes que alta; mensajes en español |
| **V2** | `email` obligatorio condicional al enviar notificaciones (D2); búsqueda por correo en barra unificada (D5); considerar `@@index([email])` |
| **Accesibilidad** | Labels en formulario; anunciar resultados de búsqueda con `aria-live` |

### Definition of Done

- [ ] Modelo `Client` migrado y con seed.
- [ ] Búsqueda operativa en `/clients` para admin y mecánico.
- [ ] Alta y edición con validación; bloqueo de `nationalId` duplicado en create (409 + UI).
- [ ] Cliente nuevo/actualizado seleccionable/instantáneo para flujo de vehículos.
- [ ] Tests unitarios e integración en verde.
- [ ] Sin endpoints de delete expuestos en MVP.

### Dependencias

| Relación | Detalle |
|----------|---------|
| **Depende de** | US-001 (auth) |
| **Habilita** | US-004 (`clientId` en vehículos), US-009 (historial por cliente) |
| **Paralelo** | US-002 (usuarios internos, dominio distinto) |

### Extensiones V2 (no implementar en MVP)

| ID | Funcionalidad | Descripción |
|----|---------------|-------------|
| **D5** | Búsqueda por correo | Extender `GET /clients/search?q=` y la UI de `/clients` para localizar clientes por `email` (insensible a mayúsculas). |
| **D2** | Email obligatorio condicional | Al enviar notificaciones al propietario, exigir correo registrado o advertir al administrador. |

---

## [original] Prioridad

Alta.

## [enhanced] Prioridad

**Alta (P0)** — prerequisito de US-004 y del flujo de ingreso de vehículos.

**Estimación orientativa:** 2–3 días (1 dev full-stack) incluyendo búsqueda, formulario y tests.

---

## Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | US-003 |
| **Módulo** | `clients` |
| **Estado refinamiento** | Enhanced (local) — pendiente sincronización Jira si aplica |
