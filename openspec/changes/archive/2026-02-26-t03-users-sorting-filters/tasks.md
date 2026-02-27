## 1. Backend — DTO y tipos

- [x] 1.1 Exportar interfaz `GetUsersParams` en `apps/api/src/admin/admin.service.ts` con campos `sortBy?`, `sortDir?`, `q?`, `registered?`
- [x] 1.2 Crear DTO `UsersQuery extends PaginationQuery` en `apps/api/src/admin/admin.controller.ts` con `@IsIn` para `sortBy` (5 valores), `@IsIn` para `sortDir`, `@IsString` para `q`, `@IsIn(['true','false'])` para `registered`

## 2. Backend — lógica de servicio

- [x] 2.1 Añadir `validUserSortColumns` como propiedad privada de `AdminService` con los 5 valores válidos
- [x] 2.2 Implementar método privado `buildUsersOrderBy(sortBy: string, dir: 'asc' | 'desc')` con los 5 casos: `name` (firstName + lastName, nulls last), `email` (nulls last), `orders` (`{ _count: dir }`), `addresses` (`{ _count: dir }`), `lastInteraction`/default (nulls last)
- [x] 2.3 Implementar método privado `buildUsersWhere(params: GetUsersParams): Prisma.UserWhereInput` con condición base `[{ isDeleted: false }]`, filtro `q` (OR en firstName + lastName + email, mode: 'insensitive'), filtro `registered` (`true`→`isRegistered: true`, `false`→`isRegistered: false`)
- [x] 2.4 Refactorizar firma de `getUsers` de `(page, limit)` a `(page, limit, params: GetUsersParams = {})` usando `buildUsersOrderBy` y `buildUsersWhere`; `prisma.user.count({ where })` usa el mismo `where` que `findMany`
- [x] 2.5 Actualizar endpoint `@Get('users')` en el controlador para construir el objeto params y pasarlo a `adminService.getUsers`

## 3. Backend — tests

- [x] 3.1 Actualizar tests existentes de `admin.service.spec.ts` para la nueva firma de `getUsers` (objeto params en lugar de params individuales)
- [x] 3.2 Añadir tests de `buildUsersOrderBy` en `admin.service.spec.ts`: 5 columnas × 2 direcciones (10 casos) + fallback a `lastInteraction` para valor inválido
- [x] 3.3 Añadir tests de `buildUsersWhere` en `admin.service.spec.ts`: sin params (solo isDeleted), q OR en 3 campos, registered=true, registered=false, combinación q+registered, valor registered inválido ignorado
- [x] 3.4 Actualizar tests de `admin.controller.spec.ts` para nueva firma de `getUsers`; añadir tests con `?sortBy=name&sortDir=asc`, `?q=garcia`, `?registered=true`
- [x] 3.5 Ejecutar `pnpm --filter api test` y verificar que todos los tests pasan (sin regresión en tests de `getOrders`)

## 4. Frontend — tipos y API client

- [x] 4.1 Añadir en `apps/web-admin/src/types/api.ts`: tipo `UserSortByColumn`, constante `VALID_USER_SORT_COLUMNS`, `DEFAULT_USER_SORT = 'lastInteraction'`, `DEFAULT_USER_DIR = 'desc'`
- [x] 4.2 Añadir en `apps/web-admin/src/types/api.ts`: interfaz `UsersFilters` (`q?`, `registered?: 'true'|'false'`) y constante `USER_REGISTERED_FILTER_LABELS`
- [x] 4.3 Actualizar `getUsers()` en `apps/web-admin/src/lib/api.ts` para aceptar `sortBy?: UserSortByColumn`, `sortDir?: SortDir`, `filters?: UsersFilters`; construir query string con `URLSearchParams`

## 5. Frontend — componentes nuevos

- [x] 5.1 Crear `apps/web-admin/src/components/users/users-sortable-column-header.tsx`: Client Component con `useRouter` + `usePathname` + `useSearchParams`; al hacer clic construye URL preservando `q` y `registered`; iconos `ChevronUp`/`ChevronDown`/`ChevronsUpDown`; `aria-label` descriptivo
- [x] 5.2 Crear `apps/web-admin/src/components/users/users-search-input.tsx`: input `type="search"` con icono `Search`, botón `X` cuando tiene contenido, placeholder "Buscar por nombre o email...", `aria-label="Buscar usuarios"`
- [x] 5.3 Crear `apps/web-admin/src/components/users/users-registered-filter.tsx`: control segmentado `[Todos]/[Registrado]/[No registrado]` con `role="group"`, `aria-label="Filtrar por estado de registro"`, `aria-pressed` en cada botón; estilo activo `bg-brand-teal/10 text-brand-teal`
- [x] 5.4 Crear `apps/web-admin/src/components/users/users-active-filter-chips.tsx`: chips `brand-teal` con ✕ individual (chip de q entre comillas, chip de registered con etiqueta legible) y botón "Limpiar todo"
- [x] 5.5 Crear `apps/web-admin/src/components/users/users-filter-bar.tsx`: Client Component coordinador con `buildUrl(overrides)` como único punto de mutación de URL (preserva sort siempre); debounce 300ms en search con `useRef`; toggle inmediato en registered; renderiza `UsersSearchInput`, `UsersRegisteredFilter` y `UsersActiveFilterChips`

## 6. Frontend — componentes existentes modificados

- [x] 6.1 Modificar `apps/web-admin/src/components/users/users-table.tsx`: añadir `'use client'`, props `sortBy: UserSortByColumn` y `sortDir: SortDir`; usar `UsersSortableColumnHeader` en columnas Nombre, Email, Pedidos, Direcciones, Última interacción; añadir `aria-sort` en cada `<th>` ordenable; Teléfono y Registrado permanecen como `<TableHead>` simples
- [x] 6.2 Modificar `apps/web-admin/src/components/users/users-empty-state.tsx`: añadir prop `hasFilters?: boolean`; cuando `hasFilters=true` mostrar "Sin resultados / Prueba a ajustar o limpiar los filtros activos."

## 7. Frontend — page

- [x] 7.1 Modificar `apps/web-admin/src/app/users/page.tsx`: cambiar firma a `searchParams: Promise<{sort?, dir?, q?, registered?}>`, añadir `await searchParams`, validar `sortBy` con allowlist `VALID_USER_SORT_COLUMNS` (fallback a `DEFAULT_USER_SORT`), validar `sortDir`, parsear `filters: UsersFilters` (validar `registered` a `'true'|'false'|undefined`), subtítulo dinámico con `meta.total`, integrar `UsersFilterBar` con los valores iniciales, envolver `UsersTable` en `<Suspense fallback={<UsersTableSkeleton />}>`, pasar `hasFilters` a `UsersEmptyState`

## 8. Verificación y build

- [x] 8.1 Ejecutar `pnpm --filter web-admin build` (o `tsc --noEmit`) y verificar cero errores TypeScript y ausencia de la advertencia `"useSearchParams() should be wrapped in a suspense boundary"`
- [x] 8.2 Verificar en navegador: sort por las 5 columnas ordenables, clic en columna activa alterna dirección, sort preserva filtros activos en URL, filtros preservan sort activo en URL
- [x] 8.3 Verificar en navegador: search box con debounce, botón X limpia campo y param, botones Registrado actualizan URL inmediatamente, chips aparecen/desaparecen correctamente, ✕ individual de chip elimina solo ese filtro, "Limpiar todo" preserva sort
- [x] 8.4 Verificar URLs directas: `/users?sort=invalido` carga con defaults, `/users?registered=invalido` muestra todos, `/users?q=garcia&registered=true&sort=orders&dir=desc` combina todo correctamente
