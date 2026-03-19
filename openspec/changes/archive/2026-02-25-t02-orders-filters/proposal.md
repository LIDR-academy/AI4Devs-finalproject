## Why

El Dashboard Admin (`/orders`) muestra hasta 50 pedidos sin posibilidad de filtrar ni buscar. Con el volumen creciente de pedidos en producción, el administrador necesita localizar rápidamente registros concretos por estado, modo de pedido, texto libre (tienda, referencia, usuario) o rango de fechas, sin perder el contexto de ordenación ya implementado en T01.

## What Changes

- **Nuevo**: barra de filtros encima de la tabla de pedidos con cuatro controles:
  - Search box global con debounce 300 ms (busca en `store.name`, `externalOrderNumber`, `firstName`, `lastName`)
  - Dropdown multi-select para `OrderStatus` (5 valores)
  - Dropdown multi-select para `OrderMode` (2 valores)
  - Date range picker (popover con `<input type="date">` nativo — "Desde" / "Hasta")
- **Nuevo**: chips de filtros activos debajo de la barra con cierre individual y "Limpiar todo"
- **Nuevo**: subtítulo dinámico en la página que muestra el conteo de resultados filtrados (`meta.total`)
- **Modificado**: estado vacío en `/orders` distingue entre "sin pedidos" y "sin resultados con estos filtros"
- **Modificado**: endpoint `GET /api/admin/orders` acepta los nuevos query params `q`, `status`, `mode`, `from`, `to`
- **Modificado**: `AdminService.getOrders()` aplica un nuevo método privado `buildWhere()` con `Prisma.OrderWhereInput`; el `count()` usa el mismo `where` para que `meta.total` sea siempre preciso
- **Integración T01**: todos los filtros preservan los params `sort` y `dir`; el sort preserva los filtros

## Capabilities

### New Capabilities

- `orders-filters`: Filtrado y búsqueda server-side en la tabla de pedidos del Dashboard Admin — controles de búsqueda de texto, multi-select de estado/modo y date range picker integrados con el sistema de ordenación existente (T01)

### Modified Capabilities

- `admin-dashboard`: El requisito "Vista de órdenes con tabla y estados" se amplía: la tabla ahora incluye una barra de filtros persistente en URL y el `meta.total` refleja los resultados filtrados, no el total global

## Impact

- **Frontend** (`apps/web-admin`): nuevos componentes `OrdersFilterBar`, `OrdersSearchInput`, `StatusFilterDropdown`, `ModeFilterDropdown`, `DateRangeFilter`, `ActiveFilterChips`; modificados `orders/page.tsx`, `lib/api.ts`, `types/api.ts`, `OrdersEmptyState`
- **Backend** (`apps/api`): modificados `admin.controller.ts` (DTO ampliado), `admin.service.ts` (nuevo `buildWhere()`), specs de tests
- **Sin migraciones**: solo lectura con filtros en consultas Prisma existentes; schema sin cambios
- **Sin nuevas dependencias**: `Shadcn Popover` ya instalado; `<input type="date">` nativo; `date-fns` ya presente
- **Plan de rollback**: los cambios al controller/service son aditivos (parámetros opcionales); eliminar los nuevos query params restaura el comportamiento original de T01 sin afectar otros módulos
