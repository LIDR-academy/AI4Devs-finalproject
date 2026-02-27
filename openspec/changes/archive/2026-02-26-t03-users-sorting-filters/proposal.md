## Why

La página `/users` del Dashboard Admin muestra la tabla de usuarios con ordenación fija (última interacción DESC) y sin capacidad de búsqueda ni filtrado. El administrador no puede localizar usuarios concretos cuando la base crece, lo que ralentiza las tareas de soporte. T01 y T02 establecieron los patrones de ordenación y filtros server-side para `/orders`; T03 aplica esos mismos patrones a `/users` con las particularidades de su dominio.

## What Changes

- La tabla `/users` pasa a soportar **ordenación dinámica server-side** por 5 columnas: Nombre, Email, Pedidos, Direcciones y Última interacción (por defecto `lastInteraction DESC`, nulls al final).
- Se añade una **barra de filtros** con dos controles: search box (búsqueda por nombre o email, debounce 300ms) y control segmentado de selección única para el estado de registro (`[Todos] / [Registrado] / [No registrado]`).
- El **estado se persiste en URL** (`?sort=&dir=&q=&registered=`) — filtros y sort coexisten y se preservan mutuamente.
- El **subtítulo de la página** cambia de texto fijo a `"N usuario(s) encontrado(s)"` (count filtrado dinámico).
- El **empty state** distingue entre tabla vacía sin filtros vs. sin resultados con filtros activos.
- **Backend**: nuevo DTO `UsersQuery`, métodos privados `buildUsersOrderBy()` y `buildUsersWhere()` con `isDeleted: false` como condición base invariable.

## Capabilities

### New Capabilities
- `users-sorting-filters`: Ordenación dinámica por 5 columnas y filtros server-side (search + registered) en la página `/users` del Dashboard Admin, persistidos en URL. Incluye los componentes frontend `UsersFilterBar`, `UsersSortableColumnHeader`, `UsersRegisteredFilter`, `UsersSearchInput`, `UsersActiveFilterChips`, y la lógica backend `buildUsersOrderBy` / `buildUsersWhere` en `AdminService`.

### Modified Capabilities
- `admin-dashboard`: La vista de usuarios (`/users`) cambia de ordenación fija y sin filtros a ordenación dinámica por columna + barra de filtros `UsersFilterBar` + subtítulo dinámico con `meta.total` + empty state adaptativo.
- `admin-api`: El endpoint `GET /api/admin/users` amplía sus query params de solo paginación a incluir `sortBy`, `sortDir`, `q` y `registered`; `meta.total` pasa a reflejar el count filtrado.

## Impact

- **Frontend** (`apps/web-admin`): `app/users/page.tsx` (Server Component refactorizado), `components/users/users-table.tsx` (convertido a `'use client'`), 5 nuevos componentes en `components/users/`, `types/api.ts` (+6 exports), `lib/api.ts` (`getUsers` con nuevos params).
- **Backend** (`apps/api`): `admin.controller.ts` (nuevo DTO `UsersQuery`), `admin.service.ts` (firma `getUsers` refactorizada, 2 nuevos métodos privados), specs de tests actualizados.
- **Sin breaking changes** en `getOrders` ni en el resto del sistema.
- **Rollback**: revertir `admin.controller.ts` y `admin.service.ts` a la firma anterior (1 método sin params), y `users/page.tsx` + `users-table.tsx` al Server Component original sin props de sort.
