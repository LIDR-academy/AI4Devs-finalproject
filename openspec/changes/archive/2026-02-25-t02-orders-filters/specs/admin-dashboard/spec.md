## MODIFIED Requirements

### Requirement: Vista de órdenes con tabla y estados
La página `/orders` SHALL obtener los pedidos vía `GET /api/admin/orders` (Server Component) y renderizarlos en una tabla Shadcn.

**Columnas de la tabla (en orden):**

| Columna | Origen | Notas |
|---------|--------|-------|
| Referencia | `externalOrderNumber` | Fallback: `externalOrderId` si null; ordenable |
| Tienda | `store.name` | Ordenable; subsort por Referencia |
| Usuario | `user.firstName + user.lastName` + `user.phone.e164` | Nombre en línea 1 (`font-medium`), teléfono en línea 2 (`text-xs text-gray-500`); ordenable por nombre completo |
| Importe | `totalAmount` + `currency` | `formatCurrency(totalAmount, currency)`; ordenable |
| Estado | `status` | `<OrderStatusBadge>`; **no ordenable** |
| Modo | `orderMode` | `<OrderModeBadge>`; **no ordenable** |
| Fecha | `webhookReceivedAt` | `formatDate(webhookReceivedAt)`; ordenable |
| Chat | `conversations[0].id` | Icono `MessageSquare` (lucide) visible solo si `conversations.length > 0`; `aria-label="Ver conversación del pedido #[N]"`; **no ordenable** |

**Ordenación**: dinámica vía query params `?sort=<columna>&dir=<asc|desc>`. Por defecto: `date DESC`. Ver spec `orders-column-sorting` para los requisitos completos.

**Filtros**: la tabla SHALL ir precedida de la barra de filtros `OrdersFilterBar`. Ver spec `orders-filters` para los requisitos completos de filtrado y búsqueda.

**Subtítulo de la página**: SHALL mostrar `"N pedido(s) encontrado(s)"` donde N es `meta.total` (total filtrado devuelto por la API), no un texto fijo.

La tabla SHALL mostrar un skeleton de 8 filas durante la carga (`loading.tsx`) y un estado vacío adaptativo:
- Sin pedidos y sin filtros: icono `ShoppingCart` + "Sin pedidos todavía. Cuando se procese un pedido aparecerá aquí."
- Sin resultados con filtros activos: icono `ShoppingCart` + "Sin resultados" + "Prueba a ajustar o limpiar los filtros activos."

**Paleta de badges completa:**
- `PENDING_PAYMENT` → `bg-gray-100 text-gray-600 border-gray-200`
- `PENDING_ADDRESS` → `bg-brand-lime text-brand-black border-brand-lime`
- `READY_TO_PROCESS` → `bg-brand-teal text-white border-brand-teal`
- `COMPLETED` → `bg-emerald-100 text-emerald-700 border-emerald-200`
- `CANCELED` → `bg-red-100 text-red-600 border-red-200`
- `ADRESLES` → `bg-brand-black text-brand-lime border-brand-black`
- `TRADITIONAL` → `bg-gray-100 text-gray-700 border-gray-200`

#### Scenario: Tabla renderiza pedidos correctamente
- **WHEN** el usuario accede a `/orders` y hay pedidos disponibles
- **THEN** la tabla muestra una fila por pedido con las 8 columnas especificadas

#### Scenario: Barra de filtros precede a la tabla
- **WHEN** el usuario accede a `/orders`
- **THEN** se muestra la barra de filtros (`OrdersFilterBar`) encima de la tabla

#### Scenario: Subtítulo muestra el conteo filtrado
- **WHEN** hay 3 pedidos con `status=COMPLETED` de un total de 10 y el filtro de estado está activo
- **THEN** el subtítulo muestra "3 pedidos encontrados"

#### Scenario: Estado vacío sin filtros
- **WHEN** la API devuelve `data: []` y no hay filtros activos
- **THEN** se muestra el componente `OrdersEmptyState` con mensaje "Sin pedidos todavía. Cuando se procese un pedido aparecerá aquí."

#### Scenario: Estado vacío con filtros activos
- **WHEN** la API devuelve `data: []` y hay al menos un filtro activo
- **THEN** se muestra el componente `OrdersEmptyState` con mensaje "Sin resultados" y "Prueba a ajustar o limpiar los filtros activos."

#### Scenario: Icono de chat solo aparece en pedidos con conversación
- **WHEN** un pedido tiene `conversations.length > 0`
- **THEN** se muestra el icono `MessageSquare` con `aria-label` y enlace a `/conversations/[id]`

#### Scenario: Skeleton durante carga
- **WHEN** la página está cargando datos de la API
- **THEN** se muestra el skeleton de 8 filas (`loading.tsx`) con `<Skeleton>` en cada celda
