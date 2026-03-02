## ADDED Requirements

### Requirement: El modelo Order tiene un campo statusSource para rastrear el origen del cambio de estado

El sistema SHALL incluir en el modelo `Order` un campo nullable `statusSource` de tipo enum `StatusSource { ADRESLES STORE }`. Este campo SHALL registrar qué actor originó el último cambio de estado del pedido: el sistema Adresles (tras una conversación con el usuario) o la tienda online (en el flujo tradicional o futura integración real).

#### Scenario: Campo statusSource presente en la DB tras la migración

- **WHEN** se ejecuta la migración `add-order-status-source`
- **THEN** la tabla `orders` tiene una columna `status_source` de tipo enum con valores posibles `ADRESLES` y `STORE`
- **THEN** la columna es nullable (registros existentes tienen `NULL`)

#### Scenario: Pedido ADRESLES tras confirmar dirección

- **WHEN** el Worker ejecuta `finalizeAddress()` con éxito para un pedido ADRESLES
- **THEN** el pedido tiene `statusSource = 'ADRESLES'`
- **THEN** el pedido tiene `syncedAt` con la fecha y hora de la confirmación
- **THEN** el pedido tiene `status = 'READY_TO_PROCESS'`

#### Scenario: Pedido TRADITIONAL creado vía mock

- **WHEN** se crea un pedido con `mode: "tradicional"` vía `POST /api/mock/orders`
- **THEN** el pedido se crea con `statusSource = 'STORE'`
- **THEN** el pedido se crea con `syncedAt` igual a la fecha de creación
- **THEN** el pedido se crea con `status = 'READY_TO_PROCESS'`

### Requirement: OrdersService.updateStatus acepta statusSource como parámetro opcional

`OrdersService.updateStatus()` SHALL aceptar `statusSource?: StatusSource` como parte de su objeto de opciones, y SHALL incluirlo en el `prisma.order.update()` cuando esté presente.

#### Scenario: Actualización de estado con statusSource

- **WHEN** se llama a `updateStatus(orderId, status, { syncedAt, statusSource: 'ADRESLES' })`
- **THEN** Prisma actualiza el registro con `{ status, syncedAt, statusSource: 'ADRESLES' }`

#### Scenario: Actualización de estado sin statusSource

- **WHEN** se llama a `updateStatus(orderId, status)` sin el parámetro statusSource
- **THEN** Prisma actualiza el registro solo con `{ status }` sin modificar `statusSource`

### Requirement: El Worker genera su cliente Prisma desde el schema del API como fuente única de verdad

`apps/worker/package.json` SHALL declarar `"prisma": { "schema": "../api/prisma/schema.prisma" }` para que `prisma generate` en el Worker lea el schema del API directamente. El archivo `apps/worker/prisma/schema.prisma` SHALL ser eliminado. El Worker no ejecuta migraciones; solo genera su cliente Prisma.

> **Nota de arquitectura**: Esta es la Opción C (solución temporal). La Opción B (`packages/prisma-db`), que introduce un workspace package neutro como fuente de verdad explícita, está documentada y pendiente en el ticket `infra-prisma-shared-schema`.

#### Scenario: Configuración de prisma.schema en el Worker

- **WHEN** se inspecciona `apps/worker/package.json`
- **THEN** contiene la clave `"prisma": { "schema": "../api/prisma/schema.prisma" }`
- **THEN** no existe el archivo `apps/worker/prisma/schema.prisma`

#### Scenario: Compilación TypeScript del Worker sin errores de tipos

- **WHEN** se ejecuta `npx prisma generate` seguido de `npx tsc --noEmit` en `apps/worker/`
- **THEN** no hay errores de tipo relacionados con `OrderStatus`, `StatusSource` ni ningún enum del dominio Order
- **THEN** el cliente generado contiene los tipos `StatusSource` con valores `ADRESLES` y `STORE`
