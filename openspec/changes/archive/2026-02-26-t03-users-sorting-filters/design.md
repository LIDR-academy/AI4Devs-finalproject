## Context

La página `/users` del Dashboard Admin actualmente obtiene los usuarios con ordenación fija (`lastInteractionAt DESC`) y sin posibilidad de búsqueda ni filtrado. T01 y T02 establecieron los patrones completos de ordenación y filtros server-side para `/orders`. T03 traslada esos patrones a `/users` adaptándolos a las particularidades del dominio de usuarios: columnas de tipo `_count` de relaciones, campos nullable (`firstName`, `lastName`, `email`), y un filtro booleano binario (`isRegistered`) que no justifica un dropdown multi-select.

El cambio afecta a dos aplicaciones: `apps/web-admin` (Next.js 16, App Router, Tailwind v4, Shadcn/ui) y `apps/api` (NestJS, Prisma, PostgreSQL/Supabase).

## Goals / Non-Goals

**Goals:**
- Ordenación dinámica server-side por 5 columnas con nulls al final donde aplique
- Filtro de búsqueda por nombre/email (debounce 300ms, OR entre campos)
- Filtro de registro con control segmentado (3 estados: todos / registrado / no registrado)
- Estado persistido en URL; sort y filtros coexisten sin interferirse
- Subtítulo dinámico con `meta.total` filtrado
- Sin regresión en `getOrders` ni en ningún otro módulo

**Non-Goals:**
- Paginación con controles UI
- Filtro por rango de fechas de registro
- Filtro por rango numérico de pedidos/direcciones
- Exportación a CSV

## Decisions

### 1. Control segmentado en vez de dropdown multi-select para Registrado
`isRegistered` es un booleano: solo hay 3 estados posibles (todos / sí / no). Un dropdown multi-select (patrón de T02 para Status/Mode) sería sobredimensionado y más lento de operar. Un control segmentado tipo radio-button es más directo, ocupa menos espacio y el estado activo es inmediatamente visible. Alternativa descartada: checkbox único "Solo registrados" — no permite filtrar "Solo no registrados".

### 2. `useSearchParams()` en `UsersSortableColumnHeader` desde el inicio
T02 detectó la regresión W1 post-implementación: `SortableColumnHeader` perdía los filtros activos al cambiar la ordenación porque no leía los params actuales de la URL. En T03 se incorpora `useSearchParams()` directamente en el diseño de `UsersSortableColumnHeader`, evitando el mismo problema. Alternativa considerada: pasar los filtros como props al header — descartada porque crearía un coupling innecesario entre tabla y filtros.

### 3. Métodos privados `buildUsersOrderBy` y `buildUsersWhere` en `AdminService`
Análogos a `buildOrderBy` y `buildWhere` de orders. Los métodos privados permiten tests unitarios aislados, hacen explícito el contrato de cada transformación y facilitan la lectura del método `getUsers`. Alternativa: inline dentro de `getUsers` — descartada por dificultar el testing y la legibilidad.

### 4. `Suspense` boundary explícito en `UsersPage`
`UsersSortableColumnHeader` usa `useSearchParams()`. En Next.js App Router, cualquier Client Component que use `useSearchParams()` necesita estar envuelto en un `<Suspense>` para que Next.js pueda SSR correctamente la parte del servidor y diferir la parte que depende de los search params del cliente. Sin `<Suspense>`, el build emite la advertencia `"useSearchParams() should be wrapped in a suspense boundary"`. El fallback será `<UsersTableSkeleton />` para coherencia con el `loading.tsx` de la ruta.

### 5. Ordenación por `_count` de relaciones (Pedidos, Direcciones)
Prisma soporta `orderBy: { orders: { _count: 'asc' } }` nativamente para ordenar por conteo de relaciones. No requiere subquery manual ni agregación en memoria. Esta es la solución estándar y type-safe. Alternativa descartada: cargar todos los usuarios y ordenar en JS — no escalable.

### 6. `isDeleted: false` como condición base del array `AND` en `buildUsersWhere`
El `getUsers` original siempre incluye `where: { isDeleted: false }`. Al refactorizar para aceptar filtros dinámicos, se usa un array `AND` inicializado con `[{ isDeleted: false }]`. Esto garantiza que la condición base sea invariable independientemente de qué filtros estén activos, replicando exactamente el comportamiento original cuando no hay filtros.

## Risks / Trade-offs

- **[Riesgo] Prisma `_count` ordering no soportado en versión actual** → Mitigación: verificar en `apps/api/package.json` que la versión de Prisma sea ≥ 3.12 (donde se introdujo `orderBy relation count`). Si fuera anterior, añadir campo computado o migración.
- **[Riesgo] `firstName`/`lastName`/`email` son nullable → nulls al final en ambas direcciones** → Mitigación: usar `{ sort: dir, nulls: 'last' }` en `buildUsersOrderBy` para los tres campos, igual que en T01 para `externalOrderNumber`.
- **[Trade-off] `UsersFilterBar` recibe `sortBy`/`sortDir` como props en lugar de leerlos con `useSearchParams()`** → Simplicidad: la fuente de verdad del sort viene del Server Component (ya validada); el FilterBar no necesita revalidar. El contrapunto es que si el sort cambia por otra vía no se reflejaría, pero en esta arquitectura solo cambia desde `UsersSortableColumnHeader`.
- **[Trade-off] `registered` se transmite como string `'true'`/`'false'` en lugar de boolean** → Coherencia con los query params de URL que siempre son strings; la validación a boolean se hace en `buildUsersWhere` del backend. Alternativa booleana requeriría transformación adicional en el DTO.
