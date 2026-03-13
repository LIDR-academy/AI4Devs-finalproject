## 1. Backend — Tipos y DTO

- [x] 1.1 Añadir interfaz interna `GetOrdersParams` en `admin.service.ts` con los campos: `sortBy?`, `sortDir?`, `q?`, `status?` (string CSV), `mode?` (string CSV), `from?`, `to?`
- [x] 1.2 Ampliar `OrdersQuery` en `admin.controller.ts` con los nuevos campos: `q?: string` (`@IsOptional @IsString`), `status?: string` (`@IsOptional @IsString`), `mode?: string` (`@IsOptional @IsString`), `from?: string` (`@IsOptional @Matches(/^\d{4}-\d{2}-\d{2}$/)`), `to?: string` (mismo `@Matches`)
- [x] 1.3 Actualizar el método `getOrders` del controller para pasar un objeto `GetOrdersParams` al servicio en lugar de parámetros sueltos

## 2. Backend — Lógica de filtrado

- [x] 2.1 Refactorizar la firma de `AdminService.getOrders()` de `(page, limit, sortBy?, sortDir?)` a `(page, limit, params: GetOrdersParams)`; actualizar la lógica de sort existente para usar `params.sortBy` y `params.sortDir`
- [x] 2.2 Implementar el método privado `buildWhere(params: GetOrdersParams): Prisma.OrderWhereInput` con los cuatro bloques: `q` (OR multi-columna, mode insensitive), `status` (split CSV + allowlist + `{ in: [...] }`), `mode` (split CSV + allowlist + `{ in: [...] }`), rango de fechas (`gte` / `lte` sobre `webhookReceivedAt`)
- [x] 2.3 Aplicar `where = this.buildWhere(params)` en el `prisma.order.findMany()` y también en `prisma.order.count({ where })` para que `meta.total` sea siempre el count filtrado

## 3. Backend — Tests

- [x] 3.1 Actualizar `admin.service.spec.ts`: adaptar los tests existentes de `getOrders` a la nueva firma con objeto params (los mocks de `buildOrderBy` siguen funcionando igual)
- [x] 3.2 Añadir tests unitarios de `buildWhere()` en `admin.service.spec.ts`:
  - Búsqueda con `q` → OR sobre las 4 columnas
  - `status` CSV válido → `{ in: [...] }`
  - `status` con un valor inválido en el CSV → solo los válidos en el `in`
  - `status` completamente inválido → no se añade `where.status` (sin filtro)
  - `mode` CSV válido → `{ in: [...] }`
  - Solo `from` → `{ gte: Date }`
  - Solo `to` → `{ lte: Date }`
  - `from` + `to` → `{ gte, lte }` con horas correctas (00:00 y 23:59:59.999)
  - Combinación `q` + `status` + `from` → AND entre filtros
- [x] 3.3 Actualizar `admin.controller.spec.ts`: adaptar los tests existentes a la nueva firma; añadir 2 tests nuevos que verifiquen que `q`, `status` y `from`/`to` se pasan correctamente al servicio

## 4. Frontend — Tipos y API client

- [x] 4.1 Añadir en `apps/web-admin/src/types/api.ts`: interfaz `OrdersFilters`, constantes `VALID_ORDER_STATUSES`, `VALID_ORDER_MODES`, y los mapas de etiquetas `ORDER_STATUS_LABELS` y `ORDER_MODE_LABELS`
- [x] 4.2 Actualizar `getOrders()` en `apps/web-admin/src/lib/api.ts` para aceptar el parámetro opcional `filters?: OrdersFilters` y añadir los params `q`, `status` (join ','), `mode` (join ','), `from`, `to` al `URLSearchParams`

## 5. Frontend — OrdersPage

- [x] 5.1 Ampliar la firma de `searchParams` en `apps/web-admin/src/app/orders/page.tsx` para incluir `q?`, `status?`, `mode?`, `from?`, `to?`
- [x] 5.2 Parsear y validar los nuevos params: `q` (trim), `status` (split ',', filtrar contra `VALID_ORDER_STATUSES`), `mode` (split ',', filtrar contra `VALID_ORDER_MODES`), `from`/`to` (pasado tal cual — el backend valida el formato)
- [x] 5.3 Pasar `filters` a `getOrders()` y los valores iniciales a `OrdersFilterBar` como props
- [x] 5.4 Cambiar el subtítulo de la página de texto fijo a `"{meta.total} pedido{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}"`
- [x] 5.5 Pasar prop `hasFilters` a `OrdersEmptyState` (true cuando hay cualquier filtro activo)

## 6. Frontend — Sub-componentes de filtros

- [x] 6.1 Crear `apps/web-admin/src/components/orders/orders-search-input.tsx`: input con icono `Search` a la izquierda, botón `X` cuando hay contenido, `aria-label="Buscar pedidos"`, `type="search"`
- [x] 6.2 Crear `apps/web-admin/src/components/orders/orders-status-filter.tsx`: `Popover` de Shadcn con lista de checkboxes para los 5 `OrderStatus`; trigger con badge de conteo y color `brand-teal` cuando activo; punto de color por estado alineado con `OrderStatusBadge`
- [x] 6.3 Crear `apps/web-admin/src/components/orders/orders-mode-filter.tsx`: mismo patrón que status-filter con los 2 `OrderMode`
- [x] 6.4 Crear `apps/web-admin/src/components/orders/orders-date-filter.tsx`: `Popover` con dos `<input type="date">` ("Desde"/"Hasta") con `min`/`max` cruzados, estado local previo a confirmación, botones "Limpiar" y "Aplicar"; trigger con icono `CalendarIcon` y rango formateado cuando activo
- [x] 6.5 Crear `apps/web-admin/src/components/orders/orders-active-filter-chips.tsx`: chips `brand-teal` para cada filtro activo (q entre comillas, estados y modos con etiqueta española, fecha con rango formateado), botón X individual por chip, enlace "Limpiar todo"

## 7. Frontend — OrdersFilterBar (coordinador)

- [x] 7.1 Crear `apps/web-admin/src/components/orders/orders-filter-bar.tsx` como `'use client'`: recibe `initialQ`, `initialStatus`, `initialMode`, `initialFrom`, `initialTo`, `sortBy`, `sortDir` como props
- [x] 7.2 Implementar `buildUrl(overrides)` dentro de `OrdersFilterBar`: construye `URLSearchParams` preservando siempre `sort`/`dir` y mezclando los valores actuales con los overrides
- [x] 7.3 Implementar `handleSearchChange(value)` con debounce de 300 ms usando `useRef<ReturnType<typeof setTimeout>>`; llama a `router.push(buildUrl({ q: value }))`
- [x] 7.4 Implementar `handleStatusToggle(status)` y `handleModeToggle(mode)`: toggle del valor en el array actual y `router.push(buildUrl(...))`
- [x] 7.5 Implementar `handleDateApply(from?, to?)`: `router.push(buildUrl({ from, to }))` y `handleClearAll()`: `router.push(pathname?sort=sortBy&dir=sortDir)`
- [x] 7.6 Componer los sub-componentes en el render: fila de controles + fila de chips (condicional si `hasActiveFilters`)

## 8. Frontend — OrdersEmptyState

- [x] 8.1 Modificar `apps/web-admin/src/components/orders/orders-empty-state.tsx`: añadir prop `hasFilters?: boolean` y mostrar mensaje alternativo "Sin resultados / Prueba a ajustar o limpiar los filtros activos." cuando `hasFilters = true`

## 9. Integración y verificación

- [x] 9.1 Integrar `OrdersFilterBar` en `orders/page.tsx` encima de la tabla (dentro del `<div className="px-8 py-6">`)
- [x] 9.2 Verificar manualmente en el navegador que filtros + sort coexisten: activar `sort=amount&dir=desc`, añadir `status=COMPLETED` → URL debe contener ambos
- [x] 9.3 Verificar que "Limpiar todo" elimina filtros pero preserva sort
- [x] 9.4 Verificar el estado vacío con filtros activos y sin pedidos coincidentes
- [x] 9.5 Ejecutar `pnpm test` en `apps/api` y verificar que todos los tests pasan (incluyendo los nuevos de `buildWhere`)
- [x] 9.6 Ejecutar `tsc --noEmit` en `apps/web-admin` y verificar que no hay errores de TypeScript
