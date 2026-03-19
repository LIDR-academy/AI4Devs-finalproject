## 1. Backend — endpoint GET /api/admin/addresses

- [x] 1.1 [backend] Añadir interfaz `GetAddressesParams` en `apps/api/src/admin/admin.service.ts`
- [x] 1.2 [backend] Implementar método privado `buildAddressesWhere(params)` en `AdminService` con condición base `isDeleted: false` y OR de 13 campos para el filtro `q`
- [x] 1.3 [backend] Implementar método privado `buildAddressesOrderBy(sortBy, dir)` en `AdminService` con soporte para las 7 columnas ordenables y fallback a `name ASC`
- [x] 1.4 [backend] Implementar método público `getAddresses(page, limit, params)` en `AdminService` usando `prisma.$transaction([findMany, count])` con `include: { user: { select: { id, firstName, lastName } } }`
- [x] 1.5 [backend] Añadir DTO `AddressesQuery` en `apps/api/src/admin/admin.controller.ts` extendiendo `PaginationQuery` con todos los decoradores `class-validator` necesarios (`@IsOptional`, `@IsIn`, `@IsString`)
- [x] 1.6 [backend] Añadir endpoint `@Get('addresses')` en `AdminController` con parsing de `page` y `limit`, delegando en `adminService.getAddresses()`

## 2. Backend — tests unitarios

- [x] 2.1 [qa] Añadir tests de `buildAddressesOrderBy` en `apps/api/src/admin/admin.service.spec.ts`: 7 columnas × 2 direcciones + fallback a `name ASC`
- [x] 2.2 [qa] Añadir tests de `buildAddressesWhere` en `admin.service.spec.ts`: condición base `isDeleted: false`, filtro `q` OR en 13 campos, `favorite=true`, `favorite=false`, combinación AND de `q` y `favorite`, valor inválido de `favorite` ignorado
- [x] 2.3 [qa] Añadir tests del endpoint en `apps/api/src/admin/admin.controller.spec.ts`: verificar que `adminService.getAddresses` se llama con los params correctos para los casos principales (`sortBy=city`, `q=garcia`, `favorite=true`, sin params)
- [x] 2.4 [qa] Verificar que todos los tests existentes del AdminModule siguen pasando tras los cambios (`pnpm --filter @adresles/api test`)

## 3. Frontend — tipos y capa de API

- [x] 3.1 [frontend] Añadir interfaces `AdminAddressUser` y `AdminAddress` en `apps/web-admin/src/types/api.ts`
- [x] 3.2 [frontend] Añadir `AddressSortByColumn`, `VALID_ADDRESS_SORT_COLUMNS`, `DEFAULT_ADDRESS_SORT`, `DEFAULT_ADDRESS_DIR`, `AddressesFilters`, `ADDRESS_FAVORITE_FILTER_LABELS` y `AddressesResponse` en `types/api.ts`
- [x] 3.3 [frontend] Añadir función `getAddresses(page, limit, sortBy?, sortDir?, filters?)` en `apps/web-admin/src/lib/api.ts`
- [x] 3.4 [frontend] Añadir función `formatAddress(address)` en `apps/web-admin/src/lib/utils.ts` usando `.filter(Boolean).join(', ')` para omitir campos nulos sin comas dobles

## 4. Frontend — página y rutas

- [x] 4.1 [frontend] Crear `apps/web-admin/src/app/addresses/page.tsx` como Server Component con `force-dynamic`, `await searchParams`, validación con allowlist, subtítulo dinámico con `meta.total` y `<Suspense>` alrededor de la tabla
- [x] 4.2 [frontend] Crear `apps/web-admin/src/app/addresses/loading.tsx` con `AddressesTableSkeleton` y skeletons para el título y subtítulo
- [x] 4.3 [frontend] Crear `apps/web-admin/src/app/addresses/error.tsx` como Client Component con icono `MapPin` y mensaje de error

## 5. Frontend — componentes de tabla

- [x] 5.1 [frontend] Crear `apps/web-admin/src/components/addresses/addresses-table-skeleton.tsx` con skeleton de 8 columnas × 8 filas
- [x] 5.2 [frontend] Crear `apps/web-admin/src/components/addresses/addresses-sortable-column-header.tsx` como Client Component con `useRouter`, `usePathname`, `useSearchParams`; preserva `q` y `favorite` al cambiar sort
- [x] 5.3 [frontend] Crear `apps/web-admin/src/components/addresses/addresses-table.tsx` como Client Component con tabla Shadcn de 8 columnas; columna "Dirección" sin `SortableColumnHeader`; columna "Favorita" con icono `Star` rellena/vacía según `isDefault`
- [x] 5.4 [frontend] Crear `apps/web-admin/src/components/addresses/addresses-empty-state.tsx` con prop `hasFilters` para mensaje alternativo

## 6. Frontend — componentes de filtros

- [x] 6.1 [frontend] Crear `apps/web-admin/src/components/addresses/addresses-search-input.tsx` con icono `Search`, debounce 300ms (gestionado en el padre), botón `X` para limpiar, `aria-label="Buscar direcciones"`
- [x] 6.2 [frontend] Crear `apps/web-admin/src/components/addresses/addresses-favorite-filter.tsx` con control segmentado `[Todas] / [Favorita] / [No favorita]`, `role="group"`, `aria-pressed` en cada botón
- [x] 6.3 [frontend] Crear `apps/web-admin/src/components/addresses/addresses-active-filter-chips.tsx` con chips `brand-teal` para `q` y `favorite`, botón ✕ individual y botón "Limpiar todo"
- [x] 6.4 [frontend] Crear `apps/web-admin/src/components/addresses/addresses-filter-bar.tsx` como Client Component orquestador: estado local de `q` con debounce 300ms, toggle inmediato de `favorite`, función `buildUrl()` como único punto de mutación de URL

## 7. Frontend — navegación

- [x] 7.1 [frontend] Actualizar `apps/web-admin/src/components/layout/sidebar.tsx`: importar `MapPin` de `lucide-react` y añadir el ítem `{ href: '/addresses', label: 'Direcciones', icon: MapPin }` entre Usuarios y Simulación en el array `navItems`

## 8. Verificación final

- [x] 8.1 [qa] Verificar que `tsc --noEmit` no produce errores en `apps/web-admin`
- [x] 8.2 [qa] Verificar que el build de Next.js no emite la advertencia `"useSearchParams() should be wrapped in a suspense boundary"`
- [x] 8.3 [qa] Verificar manualmente en el navegador: navegación a `/addresses`, ordenación por todas las columnas ordenables, búsqueda multicampo, filtros de favorita, chips de filtros activos y estados vacíos
