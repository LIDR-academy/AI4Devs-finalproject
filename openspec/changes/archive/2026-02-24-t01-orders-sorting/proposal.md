## Why

La tabla de Pedidos del Dashboard Admin muestra los datos sin ningún orden controlable por el usuario, lo que dificulta la búsqueda y el análisis de pedidos cuando el volumen crece. Añadir ordenación por columna —server-side, persistida en URL— permite al administrador localizar pedidos rápidamente y compartir vistas ordenadas mediante enlace.

## What Changes

- La columna "N.º pedido" pasa a llamarse **"Referencia"** en toda la tabla.
- Los encabezados de las columnas Referencia, Tienda, Usuario, Importe y Fecha se convierten en controles de ordenación interactivos (botón con icono ↕/▲/▽).
- El estado de ordenación se persiste en la URL (`?sort=<col>&dir=<asc|desc>`), permitiendo recargar la página con el mismo orden y compartir enlaces.
- El orden por defecto al acceder a `/orders` sin params es **Fecha DESC** (pedidos más recientes primero).
- Al ordenar por **Tienda**, se aplica subsort automático por **Referencia** en la misma dirección.
- El endpoint `GET /api/admin/orders` acepta nuevos query params `sortBy` y `sortDir`; la ordenación ocurre en Prisma (server-side), no en el cliente.
- Las columnas Estado y Modo **no son ordenables** en este ticket (se abordarán con filtros en un ticket separado).

## Capabilities

### New Capabilities

- `orders-column-sorting`: Ordenación interactiva server-side de la tabla de pedidos por Referencia, Tienda, Usuario, Importe y Fecha, con estado en URL y subsort por Referencia cuando se ordena por Tienda.

### Modified Capabilities

- `admin-dashboard`: El endpoint `GET /admin/orders` extiende su contrato aceptando `sortBy` y `sortDir` como query params opcionales (comportamiento aditivo, no breaking).

## Impact

- **Backend**: `apps/api/src/admin/admin.controller.ts` y `admin.service.ts` — nuevo DTO `OrdersQuery` y método privado `buildOrderBy()`.
- **Frontend**: `apps/web-admin/src/app/orders/page.tsx` (firma async `searchParams`), `components/orders/orders-table.tsx` (→ Client Component), nuevo `components/orders/sortable-column-header.tsx`, `lib/api.ts`, `types/api.ts`.
- **Tests**: `admin.service.spec.ts` y `admin.controller.spec.ts` deben actualizarse para reflejar la nueva firma de `getOrders`.
- **Sin breaking changes**: Los clientes que llamen al endpoint sin `sortBy`/`sortDir` siguen recibiendo el comportamiento actual (fecha DESC).
- **Rollback**: Revertir los cambios en el controlador y servicio restablece el endpoint a su comportamiento anterior; la UI vuelve al Server Component sin sort.
