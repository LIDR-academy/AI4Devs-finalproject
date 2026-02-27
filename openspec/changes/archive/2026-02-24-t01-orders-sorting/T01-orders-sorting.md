# T01 — Ordenación de columnas en la página de Pedidos

**App**: `apps/web-admin` (Dashboard Admin — Next.js 16) + `apps/api` (NestJS — AdminModule)  
**Estado**: Enriquecido ✅ — listo para `/opsx-ff t01-orders-sorting`  
**Fecha**: 2026-02-24

---

## Historia de Usuario

**Como** administrador del Dashboard Admin,  
**quiero** poder ordenar la tabla de pedidos haciendo clic en el encabezado de cada columna ordenable,  
**para** localizar rápidamente pedidos según diferentes criterios sin abandonar la página.

---

## Descripción funcional

La tabla de `/orders` permite ordenar por columna. Cada encabezado ordenable muestra un icono a su derecha:

- **Estado neutro** (sin ordenación activa en esa columna): icono `ChevronsUpDown` (↕) atenuado
- **Orden ascendente activo**: icono `ChevronUp` (▲) resaltado
- **Orden descendente activo**: icono `ChevronDown` (▽) resaltado

Al hacer clic en un encabezado:
- Si la columna **no estaba activa**: activa esa columna en orden **ascendente**
- Si la columna **ya estaba activa**: alterna entre `asc` → `desc` → `asc`

La ordenación es **server-side**: el estado se persiste en la URL como query params y el servidor devuelve los datos ya ordenados.

---

## Columnas ordenables

| Columna visible | `sortBy` (URL) | Campo backend (Prisma) | Notas |
|-----------------|---------------|------------------------|-------|
| **Referencia** | `ref` | `externalOrderNumber` `nulls: 'last'` | Renombrada desde "N.º pedido" |
| **Tienda** | `store` | `store.name` + subsort `externalOrderNumber` misma dir, `nulls: 'last'` | Ver subsort |
| **Usuario** | `user` | `user.firstName` → `user.lastName` | Aproximación a nombre completo |
| **Importe** | `amount` | `totalAmount` (Decimal en Prisma) | Serializado como string en API → ordenar en Prisma, no en JS |
| **Fecha** | `date` | `webhookReceivedAt` | **Ordenación por defecto: `desc`** |

**No ordenables** (serán filtrables en otro ticket): Estado, Modo, Chat.

---

## URL y estado por defecto

- **Parámetros URL**: `?sort=<sortBy>&dir=<asc|desc>`
- **Por defecto** (sin params o inválidos): `sort=date` + `dir=desc` (pedidos más recientes primero)
- Valores válidos de `sort`: `ref | store | user | amount | date`
- Valores válidos de `dir`: `asc | desc`
- Parámetros inválidos → fallback silencioso (sin error 400)
- Ejemplos:
  - `/orders` → fecha DESC
  - `/orders?sort=store&dir=asc` → tienda A→Z, subsort referencia A→Z
  - `/orders?sort=amount&dir=desc` → importe mayor primero

---

## Arquitectura de la solución

### Tipos compartidos (frontend)

Añadir en `apps/web-admin/src/types/api.ts`:

```typescript
export type SortByColumn = 'ref' | 'store' | 'user' | 'amount' | 'date';
export type SortDir = 'asc' | 'desc';

export const VALID_SORT_COLUMNS: SortByColumn[] = ['ref', 'store', 'user', 'amount', 'date'];
export const DEFAULT_SORT: SortByColumn = 'date';
export const DEFAULT_DIR: SortDir = 'desc';
```

---

### Capa frontend (`apps/web-admin`)

#### `app/orders/page.tsx` — Server Component

**Cambio crítico: Next.js 15+ exige `await searchParams`** (es una `Promise`, no un objeto directo).

```typescript
// Firma correcta para Next.js 15/16
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const { sort, dir } = await searchParams;

  // Validar y normalizar con allowlist
  const sortBy: SortByColumn = VALID_SORT_COLUMNS.includes(sort as SortByColumn)
    ? (sort as SortByColumn)
    : DEFAULT_SORT;
  const sortDir: SortDir = dir === 'asc' || dir === 'desc' ? dir : DEFAULT_DIR;

  const { data: orders } = await getOrders(1, 50, sortBy, sortDir);

  return (
    // ...
    <OrdersTable orders={orders} sortBy={sortBy} sortDir={sortDir} />
  );
}
```

> ⚠️ `searchParams` como `Promise` es obligatorio en Next.js 15+. No usar `searchParams.sort` directamente sin `await`.

#### `components/orders/orders-table.tsx` — Convertir a Client Component

```typescript
'use client';

interface OrdersTableProps {
  orders: AdminOrder[];
  sortBy: SortByColumn;
  sortDir: SortDir;
}

export function OrdersTable({ orders, sortBy, sortDir }: OrdersTableProps) {
  // Cabeceras ordenables usan SortableColumnHeader
  // Cabeceras no ordenables (Estado, Modo, Chat) quedan como <TableHead> simples
}
```

- Renombrar `<TableHead>N.º pedido</TableHead>` → `"Referencia"`
- Usar `SortableColumnHeader` para: Referencia, Tienda, Usuario, Importe, Fecha

#### `components/orders/sortable-column-header.tsx` — NUEVO Client Component

```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { SortByColumn, SortDir } from '@/types/api';

interface SortableColumnHeaderProps {
  column: SortByColumn;
  label: string;
  currentSort: SortByColumn;
  currentDir: SortDir;
}

export function SortableColumnHeader({
  column, label, currentSort, currentDir,
}: SortableColumnHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = column === currentSort;
  const nextDir: SortDir = isActive && currentDir === 'asc' ? 'desc' : 'asc';

  const handleClick = () => {
    router.push(`${pathname}?sort=${column}&dir=${nextDir}`);
  };

  const Icon = isActive
    ? currentDir === 'asc' ? ChevronUp : ChevronDown
    : ChevronsUpDown;

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      aria-label={`Ordenar por ${label} ${nextDir === 'asc' ? 'ascendente' : 'descendente'}`}
    >
      {label}
      <Icon
        className={`h-3.5 w-3.5 ${isActive ? 'text-foreground' : 'text-muted-foreground/50'}`}
        aria-hidden="true"
      />
    </button>
  );
}
```

> El `<th>` padre en `OrdersTable` debe incluir `aria-sort={isActive ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'}`.

#### `lib/api.ts`

```typescript
export const getOrders = (
  page = 1,
  limit = 50,
  sortBy?: SortByColumn,
  sortDir?: SortDir,
): Promise<OrdersResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortBy) params.set('sortBy', sortBy);
  if (sortDir) params.set('sortDir', sortDir);
  return apiFetch(`/api/admin/orders?${params.toString()}`);
};
```

---

### Capa backend (`apps/api`)

#### `admin.controller.ts` — Ampliar `PaginationQuery` DTO

Seguir el patrón DTO existente del controlador (no inline `@Query()`):

```typescript
import { IsIn } from 'class-validator'; // añadir IsIn al import

class OrdersQuery extends PaginationQuery {
  @IsOptional()
  @IsIn(['ref', 'store', 'user', 'amount', 'date'])
  sortBy?: 'ref' | 'store' | 'user' | 'amount' | 'date';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: 'asc' | 'desc';
}

@Get('orders')
getOrders(@Query() query: OrdersQuery) {
  const page  = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '50', 10) || 50));
  return this.adminService.getOrders(page, limit, query.sortBy, query.sortDir);
}
```

> `PaginationQuery` puede quedarse para `getUsers` o renombrarse si se reutiliza.

#### `admin.service.ts` — Lógica `orderBy` dinámica

```typescript
async getOrders(
  page: number,
  limit: number,
  sortBy?: string,
  sortDir?: string,
) {
  const skip = (page - 1) * limit;
  const dir: 'asc' | 'desc' = sortDir === 'asc' ? 'asc' : 'desc';

  const orderBy = this.buildOrderBy(sortBy, dir);

  const [data, total] = await this.prisma.$transaction([
    this.prisma.order.findMany({
      include: {
        store: true,
        user: { include: { phone: true } },
        conversations: { select: { id: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    this.prisma.order.count(),
  ]);

  return { data, meta: { page, limit, total } };
}

private buildOrderBy(sortBy: string | undefined, dir: 'asc' | 'desc') {
  const refSort = { externalOrderNumber: { sort: dir, nulls: 'last' } } as const;

  switch (sortBy) {
    case 'ref':
      return [refSort];
    case 'store':
      return [{ store: { name: dir } }, refSort];
    case 'user':
      return [{ user: { firstName: dir } }, { user: { lastName: dir } }];
    case 'amount':
      return [{ totalAmount: dir }];
    case 'date':
    default:
      return [{ webhookReceivedAt: dir }];
  }
}
```

> `buildOrderBy` es un método privado que facilita los tests unitarios.

---

## Criterios de aceptación

### Funcionalidad principal
- [ ] La columna "N.º pedido" se muestra como "Referencia" en la tabla
- [ ] Al entrar en `/orders` sin params, los pedidos están ordenados por Fecha DESC
- [ ] Al hacer clic en "Referencia", ordena por `externalOrderNumber` (nulls al final)
- [ ] Al hacer clic en "Tienda", ordena por `store.name` y subsordena por `externalOrderNumber` en la misma dirección
- [ ] Al hacer clic en "Usuario", ordena por `firstName` luego `lastName`
- [ ] Al hacer clic en "Importe", ordena por `totalAmount` numérico (Decimal Prisma)
- [ ] Al hacer clic en "Fecha", ordena por `webhookReceivedAt`
- [ ] Hacer clic en una columna activa alterna `asc` ↔ `desc`
- [ ] Los params de sort persisten en la URL y sobreviven a recargar la página
- [ ] `?sort=invalido&dir=invalido` → silenciosamente usa `date desc`

### Visual / UX
- [ ] Columnas no ordenables (Estado, Modo, Chat) no muestran icono ni área clicable
- [ ] Columna activa muestra `ChevronUp` (asc) o `ChevronDown` (desc) en color `foreground`
- [ ] Columnas inactivas muestran `ChevronsUpDown` en color `muted-foreground/50`
- [ ] El `<th>` de la columna activa incluye `aria-sort="ascending"` o `aria-sort="descending"`
- [ ] El `<th>` de columnas inactivas ordenables incluye `aria-sort="none"`
- [ ] El botón tiene `aria-label` descriptivo: `"Ordenar por Tienda ascendente"`

### Backend
- [ ] `GET /api/admin/orders?sortBy=store&sortDir=asc` devuelve pedidos ordenados correctamente
- [ ] `GET /api/admin/orders?sortBy=ref&sortDir=desc` ordena por referencia, nulls al final
- [ ] `GET /api/admin/orders` (sin params) equivale a `sortBy=date&sortDir=desc`
- [ ] `sortBy` inválido → fallback a `date desc` (no error 400)
- [ ] Tests unitarios en `admin.service.spec.ts` cubren `buildOrderBy` para los 5 casos de `sortBy` (+ `asc` y `desc`)
- [ ] Tests de integración en `admin.controller.spec.ts` verifican que `adminService.getOrders` se llama con los params correctos

---

## Archivos a crear o modificar

| Archivo | Operación | Detalle |
|---------|-----------|---------|
| `apps/web-admin/src/types/api.ts` | Modificar | Añadir `SortByColumn`, `SortDir`, `VALID_SORT_COLUMNS`, `DEFAULT_SORT`, `DEFAULT_DIR` |
| `apps/web-admin/src/app/orders/page.tsx` | Modificar | Firma con `searchParams: Promise<{...}>`, `await searchParams`, validación allowlist, pasar sort a `getOrders` y `OrdersTable` |
| `apps/web-admin/src/components/orders/orders-table.tsx` | Modificar | `'use client'`, props `sortBy`/`sortDir`, `SortableColumnHeader`, `aria-sort` en `<th>`, renombrar columna |
| `apps/web-admin/src/components/orders/sortable-column-header.tsx` | **Crear** | Client Component con `useRouter` + `usePathname`, iconos, `aria-label` |
| `apps/web-admin/src/lib/api.ts` | Modificar | `getOrders()` acepta `sortBy?` y `sortDir?`, construye query string con `URLSearchParams` |
| `apps/api/src/admin/admin.controller.ts` | Modificar | Nuevo DTO `OrdersQuery` extendiendo `PaginationQuery` con `sortBy`/`sortDir` + `@IsIn()`; pasar a `adminService.getOrders` |
| `apps/api/src/admin/admin.service.ts` | Modificar | Signature `getOrders(page, limit, sortBy?, sortDir?)`, método privado `buildOrderBy()` |
| `apps/api/src/admin/admin.service.spec.ts` | Modificar | Tests de `buildOrderBy`: 5 columnas × 2 direcciones; test fallback para `sortBy` inválido |
| `apps/api/src/admin/admin.controller.spec.ts` | Modificar | Actualizar tests existentes (ahora `getOrders` recibe 4 args); añadir test con `?sortBy=store&sortDir=asc` |

---

## Requisitos no funcionales

- **Accesibilidad WCAG 2.1 AA**: `aria-sort` en `<th>`, `aria-label` en botones, navegación por teclado (`focus-visible`)
- **TypeScript strict**: `SortByColumn` y `SortDir` definidos en `types/api.ts`; no usar `string` suelto
- **Next.js 15+ compat**: `searchParams` como `Promise` en la firma del page — obligatorio en Next.js 15/16
- **Sin regresión**: Estado, Modo, Chat no afectados visualmente; `getUsers` no cambia
- **Patrón DTO existente**: El controller usa DTOs con class-validator — `OrdersQuery` sigue ese patrón

---

## Out of scope

- Filtrado por Estado y Modo (ticket separado)
- Ordenación en la tabla de Usuarios
- Paginación de pedidos (actualmente limitado a 50)
- Reset automático a página 1 al cambiar sort (no hay UI de paginación activa)
