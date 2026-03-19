# Sesión 2026-02-26: T03 — Ordenación y Filtros en Tabla de Usuarios — Completado

> **Change**: `t03-users-sorting-filters`  
> **Estado**: ✅ Completado (27/27 tareas) — verificado y docs actualizadas

## Resumen

Implementación de ordenación dinámica y filtros server-side en la tabla de usuarios del Dashboard Admin. Se aplicaron los mismos patrones establecidos en T01 (sort) y T02 (filtros) adaptados al dominio de usuarios: columnas de tipo `_count` de relaciones, campos nullable (`firstName`, `lastName`, `email`), y un filtro de registro booleano con control segmentado (no dropdown multi-select). Estado persitido en URL; sort y filtros coexisten y se preservan mutuamente.

---

## Completado

### Backend — AdminModule (NestJS)

- **`admin.service.ts`**:
  - Interfaz exportada `GetUsersParams` con campos `sortBy?`, `sortDir?`, `q?`, `registered?`
  - Propiedad privada `validUserSortColumns` con los 5 valores válidos: `['name', 'email', 'orders', 'addresses', 'lastInteraction']`
  - Método privado `buildUsersOrderBy(sortBy, dir)`: 5 casos — `name` (firstName + lastName, nulls last), `email` (nulls last), `orders` (`{ _count: dir }`), `addresses` (`{ _count: dir }`), `lastInteraction`/default (nulls last). Prisma `orderBy _count` para relaciones funciona nativamente (≥ v3.12).
  - Método privado `buildUsersWhere(params): Prisma.UserWhereInput`: condición base invariable `[{ isDeleted: false }]` en array AND, filtro `q` (OR en firstName + lastName + email, mode insensitive), filtro `registered` (`'true'` → `isRegistered: true`, `'false'` → `isRegistered: false`, cualquier otro valor ignorado silenciosamente)
  - Firma de `getUsers()` refactorizada de `(page, limit)` a `(page, limit, params: GetUsersParams = {})`. Mismo `where` en `findMany` y `count` → `meta.total` siempre filtrado.
- **`admin.controller.ts`**: Nueva clase `UsersQuery extends PaginationQuery` con `@IsIn` para `sortBy` (5 valores), `@IsIn(['asc','desc'])` para `sortDir`, `@IsString` para `q`, `@IsIn(['true','false'])` para `registered`. Método `getUsers` actualizado para pasar el objeto params al servicio.
- **`admin.service.spec.ts`**: Tests de `getUsers` adaptados a nueva firma; 12 nuevos tests de `buildUsersOrderBy` (5 columnas × 2 direcciones + fallback sortBy inválido); 6 nuevos tests de `buildUsersWhere` (sin params, q OR, registered=true/false, combinación q+registered, valor registered inválido ignorado)
- **`admin.controller.spec.ts`**: Tests de `getUsers` adaptados a nueva firma con objeto params; 3 nuevos tests con `?sortBy=name&sortDir=asc`, `?q=garcia`, `?registered=true`
- **Tests**: 99/99 tests pasan (sin regresión en `getOrders`)

### Frontend — Dashboard Admin (Next.js)

- **`apps/web-admin/src/types/api.ts`**: Añadidos `UserSortByColumn`, `VALID_USER_SORT_COLUMNS`, `DEFAULT_USER_SORT = 'lastInteraction'`, `DEFAULT_USER_DIR = 'desc'`, `UsersFilters`, `USER_REGISTERED_FILTER_LABELS`
- **`apps/web-admin/src/lib/api.ts`**: `getUsers()` ampliado con `sortBy?: UserSortByColumn`, `sortDir?: SortDir`, `filters?: UsersFilters`; construye query string con `URLSearchParams`
- **`apps/web-admin/src/app/users/page.tsx`**: Refactorizado como Server Component con `searchParams: Promise<{sort?, dir?, q?, registered?}>`, validación con allowlists (fallback a defaults si inválido), subtítulo dinámico `"{meta.total} usuario(s) encontrado(s)"`, `UsersFilterBar` integrado, `<Suspense fallback={<UsersTableSkeleton />}>` envolviendo `UsersTable`, `hasFilters` pasado a `UsersEmptyState`
- **`users-sortable-column-header.tsx`**: Client Component con `useRouter` + `usePathname` + `useSearchParams`; preserva `q` y `registered` al cambiar sort; iconos `ChevronUp`/`ChevronDown`/`ChevronsUpDown`; `aria-label` descriptivo; `aria-sort` en los `<th>` de la tabla
- **`users-search-input.tsx`**: Input `type="search"` con icono `Search`, botón `X` cuando hay contenido, placeholder "Buscar por nombre o email...", `aria-label="Buscar usuarios"`
- **`users-registered-filter.tsx`**: Control segmentado `[Todos]/[Registrado]/[No registrado]` con `role="group"`, `aria-label="Filtrar por estado de registro"`, `aria-pressed` en cada botón; estilo activo `bg-brand-teal/10 text-brand-teal`
- **`users-active-filter-chips.tsx`**: Chips `brand-teal` con ✕ individual (chip de q entre comillas, chip de registered con etiqueta legible de `USER_REGISTERED_FILTER_LABELS`) y botón "Limpiar todo"
- **`users-filter-bar.tsx`**: Client Component coordinador; recibe `initialQ`, `initialRegistered`, `sortBy`, `sortDir` como props; `buildUrl(overrides)` como único punto de mutación de URL (siempre preserva sort); debounce 300ms en search con `useRef`; toggle inmediato en registered; renderiza `UsersSearchInput`, `UsersRegisteredFilter`, `UsersActiveFilterChips`
- **`users-table.tsx`**: Convertido a `'use client'`; recibe props `sortBy: UserSortByColumn` y `sortDir: SortDir`; columnas Nombre, Email, Pedidos, Direcciones, Última interacción usan `UsersSortableColumnHeader`; Teléfono y Registrado permanecen como `<TableHead>` simples
- **`users-table-skeleton.tsx`**: Nuevo componente skeleton de 7 columnas × 8 filas usado como fallback del `<Suspense>` en `UsersPage`
- **`users-empty-state.tsx`**: Añadida prop `hasFilters?: boolean`; cuando `true` muestra "Sin resultados / Prueba a ajustar o limpiar los filtros activos."
- **TypeScript**: `tsc --noEmit` sin errores

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **Control segmentado en vez de dropdown multi-select para `registered`** | Solo 3 estados posibles (todos/sí/no); más directo y visible que un dropdown. Lección de T02: no sobredimensionar controles simples |
| **`useSearchParams()` en `UsersSortableColumnHeader` desde el diseño** | T02 tuvo la regresión W1 (sort perdía filtros). En T03 se incorporó desde el inicio directamente en el diseño del componente |
| **`buildUsersOrderBy` y `buildUsersWhere` privados en `AdminService`** | Análogos a `buildOrderBy` / `buildWhere` de orders. Facilitan tests unitarios aislados y mismo `where` en `findMany` y `count` |
| **`<Suspense>` boundary explícito en `UsersPage`** | `UsersSortableColumnHeader` usa `useSearchParams()` → Next.js requiere Suspense para SSR correcto. Evita warning `"useSearchParams() should be wrapped in a suspense boundary"` |
| **Ordenación por `_count` de relaciones con Prisma** | `orderBy: { orders: { _count: 'asc' } }` nativo en Prisma ≥ 3.12. No requiere subquery manual. Type-safe |
| **`isDeleted: false` como condición base del array AND** | Garantiza que la condición sea invariable independientemente de los filtros activos. `buildUsersWhere` siempre devuelve `{ AND: [{ isDeleted: false }, ...] }` |
| **`sortDir` se ignora cuando `sortBy` es inválido** | Un sort inválido implica defaults completos (no sort-default con dirección arbitraria). Comportamiento documentado en spec como decisión de diseño |

---

## Deuda Técnica Documentada

- **W1 (aceptado + documentado)**: El DTO `UsersQuery` usa `@IsIn` con `ValidationPipe({ forbidNonWhitelisted: true })`. Clientes externos con `sortBy`/`registered` inválidos reciben HTTP 400, no el HTTP 200 con fallback que especifica el contrato. El frontend siempre envía valores válidos. Pendiente: eliminar `@IsIn` de `UsersQuery.sortBy`, `UsersQuery.registered` y (para consistencia) `OrdersQuery.sortBy`, delegando toda la validación al servicio. Documentado en `openspec/changes/t03-users-sorting-filters/specs/admin-api/spec.md`.

---

## Archivos Modificados/Creados

```
apps/api/src/admin/
├── admin.service.ts              # Modificado (GetUsersParams, validUserSortColumns, buildUsersOrderBy, buildUsersWhere, getUsers refactorizado)
├── admin.controller.ts           # Modificado (UsersQuery DTO, getUsers pasa objeto params)
├── admin.service.spec.ts         # Modificado (getUsers nueva firma, +12 tests buildUsersOrderBy, +6 tests buildUsersWhere)
└── admin.controller.spec.ts      # Modificado (getUsers nueva firma, +3 tests filtros)

apps/web-admin/src/
├── types/api.ts                  # Modificado (+UserSortByColumn, +VALID_USER_SORT_COLUMNS, +DEFAULT_USER_SORT/DIR, +UsersFilters, +USER_REGISTERED_FILTER_LABELS)
├── lib/api.ts                    # Modificado (getUsers con sortBy?, sortDir?, filters?)
├── app/users/page.tsx            # Modificado (searchParams awaited, validación, subtítulo dinámico, Suspense, UsersFilterBar)
└── components/users/
    ├── users-sortable-column-header.tsx  # Nuevo ('use client', useSearchParams, preserva q+registered)
    ├── users-search-input.tsx            # Nuevo (input + icono + botón X)
    ├── users-registered-filter.tsx       # Nuevo (control segmentado 3 opciones)
    ├── users-active-filter-chips.tsx     # Nuevo (chips + Limpiar todo)
    ├── users-filter-bar.tsx              # Nuevo (coordinador: buildUrl, debounce, toggles)
    ├── users-table-skeleton.tsx          # Nuevo (fallback Suspense, 7 col × 8 filas)
    ├── users-table.tsx                   # Modificado ('use client', props sortBy/sortDir, UsersSortableColumnHeader, aria-sort)
    └── users-empty-state.tsx             # Modificado (+hasFilters prop)
```

---

## Documentación Actualizada

- `openspec/specs/admin-api/spec.md` — Requisito "Listar usuarios" ampliado con tabla de params, `buildUsersWhere`, `meta.total` filtrado, nuevos tipos TypeScript (`UserSortByColumn`, `UsersFilters`, etc.), `getUsers` actualizado
- `openspec/specs/admin-dashboard/spec.md` — Requisito "Vista de usuarios" reescrito con columnas ordenables, `UsersFilterBar`, subtítulo dinámico, empty state adaptativo, estructura de archivos actualizada, `getUsers` con nueva firma
- `openspec/changes/t03-users-sorting-filters/specs/admin-api/spec.md` — Nota de implementación W1 (deuda técnica DTO vs. fallback silencioso) + scenario W2 (sortDir comportamiento cuando sortBy inválido)

---

## Tests

- Backend: **99/99 tests pasan** (sin regresión en `getOrders`, +21 tests nuevos de users)
- Frontend: `tsc --noEmit` sin errores

---

**Duración estimada**: 1 sesión  
**Conversación de referencia**: [T03 Users Sorting Filters](8fc0bd3d-df03-40e5-b9a2-b2c31c74c5e6)
