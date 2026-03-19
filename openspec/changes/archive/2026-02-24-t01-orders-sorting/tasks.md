## 1. Tipos compartidos (frontend)

- [x] 1.1 Añadir en `apps/web-admin/src/types/api.ts` los tipos `SortByColumn`, `SortDir` y las constantes `VALID_SORT_COLUMNS`, `DEFAULT_SORT`, `DEFAULT_DIR`

## 2. Backend — Lógica de ordenación en AdminService

- [x] 2.1 Extraer la ordenación fija `webhookReceivedAt: 'desc'` actual y crear el método privado `buildOrderBy(sortBy: string | undefined, dir: 'asc' | 'desc')` en `admin.service.ts` con los 5 casos: `ref`, `store`, `user`, `amount`, `date` (default)
- [x] 2.2 Actualizar la firma de `getOrders(page, limit)` a `getOrders(page, limit, sortBy?: string, sortDir?: string)` y usar `buildOrderBy` en la query Prisma
- [x] 2.3 Verificar que el subsort por `externalOrderNumber` en el caso `store` usa `{ sort: dir, nulls: 'last' }`
- [x] 2.4 Verificar que el caso `ref` usa `{ externalOrderNumber: { sort: dir, nulls: 'last' } }`

## 3. Backend — Controlador

- [x] 3.1 Crear la clase `OrdersQuery extends PaginationQuery` en `admin.controller.ts` con los campos `sortBy?: string` y `sortDir?: string` decorados con `@IsOptional()` e `@IsIn([...])`
- [x] 3.2 Actualizar el handler `@Get('orders')` para usar `OrdersQuery` y pasar `query.sortBy` y `query.sortDir` a `adminService.getOrders`

## 4. Backend — Tests

- [x] 4.1 Añadir tests unitarios en `admin.service.spec.ts` para `buildOrderBy`: un test por cada uno de los 5 valores de `sortBy` verificando el objeto `orderBy` resultante
- [x] 4.2 Añadir test unitario en `admin.service.spec.ts` para `sortBy` inválido → fallback a `date DESC`
- [x] 4.3 Actualizar los tests existentes en `admin.controller.spec.ts` que verifican `mockAdminService.getOrders.toHaveBeenCalledWith(1, 50)` para incluir los nuevos args `sortBy` y `sortDir`
- [x] 4.4 Añadir test de integración en `admin.controller.spec.ts`: `GET /admin/orders?sortBy=store&sortDir=asc` → verifica que `getOrders` se llama con `(1, 50, 'store', 'asc')`
- [x] 4.5 Ejecutar `pnpm test` en `apps/api` y verificar que todos los tests pasan

## 5. Frontend — API client

- [x] 5.1 Actualizar `getOrders()` en `apps/web-admin/src/lib/api.ts` para aceptar `sortBy?: SortByColumn` y `sortDir?: SortDir`, construyendo la query string con `URLSearchParams`

## 6. Frontend — Componente SortableColumnHeader

- [x] 6.1 Crear el archivo `apps/web-admin/src/components/orders/sortable-column-header.tsx` como Client Component (`'use client'`)
- [x] 6.2 Implementar las props: `column: SortByColumn`, `label: string`, `currentSort: SortByColumn`, `currentDir: SortDir`
- [x] 6.3 Implementar la lógica de alternancia: `nextDir = isActive && currentDir === 'asc' ? 'desc' : 'asc'`
- [x] 6.4 Usar `useRouter().push()` y `usePathname()` de `next/navigation` para navegar a `${pathname}?sort=${column}&dir=${nextDir}`
- [x] 6.5 Renderizar el icono correcto: `ChevronsUpDown` (inactivo, `muted-foreground/50`) | `ChevronUp` (activo asc) | `ChevronDown` (activo desc)
- [x] 6.6 Añadir `aria-label` al botón: `"Ordenar por ${label} ${nextDir === 'asc' ? 'ascendente' : 'descendente'}"`

## 7. Frontend — OrdersTable

- [x] 7.1 Añadir `'use client'` al inicio de `orders-table.tsx`
- [x] 7.2 Añadir props `sortBy: SortByColumn` y `sortDir: SortDir` a la interfaz `OrdersTableProps`
- [x] 7.3 Renombrar el texto de la primera columna de "N.º pedido" a "Referencia"
- [x] 7.4 Sustituir los `<TableHead>` de Referencia, Tienda, Usuario, Importe y Fecha por `<TableHead aria-sort={...}><SortableColumnHeader .../></TableHead>` con los valores de `aria-sort` correctos (`ascending` | `descending` | `none`)
- [x] 7.5 Asegurarse de que Estado, Modo y la columna de Chat NO usan `SortableColumnHeader` ni tienen `aria-sort`

## 8. Frontend — Page

- [x] 8.1 Actualizar la firma de `OrdersPage` en `apps/web-admin/src/app/orders/page.tsx` para recibir `searchParams: Promise<{ sort?: string; dir?: string }>` y hacer `await searchParams`
- [x] 8.2 Añadir validación allowlist: usar `VALID_SORT_COLUMNS.includes(sort as SortByColumn)` para normalizar `sortBy`; normalizar `sortDir` a `'asc' | 'desc'` con fallback a `DEFAULT_DIR`
- [x] 8.3 Pasar `sortBy` y `sortDir` a `getOrders()` y a `<OrdersTable />`

## 9. Verificación final

- [x] 9.1 Ejecutar `pnpm build` en `apps/web-admin` y verificar que no hay errores TypeScript ni de build
- [x] 9.2 Arrancar el servidor de desarrollo (`pnpm dev` en `apps/web-admin`) y verificar manualmente: orden por defecto Fecha DESC, clic en Tienda ordena y subordenada por Referencia, URL se actualiza, recarga mantiene el orden
- [x] 9.3 Verificar accesibilidad: `aria-sort` correcto en columna activa, `aria-label` en botones de ordenación
