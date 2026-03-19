# Patrón: Página de Tabla Paginada en el Admin Dashboard

> **Última actualización**: 2026-03-12  
> **Aplicado en**: `/orders` (T01/T02), `/users` (T03), `/addresses` (admin-addresses-page)

## Descripción

Patrón recurrente y consolidado para añadir páginas de datos tabulares al Dashboard Admin. Combina un Server Component para el fetch inicial con Client Components para la interactividad (sort, filtros, chips). El estado de sort y filtros vive en la URL (query params), no en estado React global.

---

## Estructura de Archivos

```
apps/web-admin/src/
├── app/<entidad>/
│   ├── page.tsx          # Server Component — fetch + validación de params
│   ├── loading.tsx       # Skeleton automático (Suspense boundary de Next.js)
│   └── error.tsx         # Error boundary ('use client', icono + botón reintentar)
│
├── types/api.ts          # Interfaces + constantes de tipos (no en componentes)
├── lib/api.ts            # Función get<Entidad>() con apiFetch + URLSearchParams
├── lib/utils.ts          # Funciones puras de formateo (formatFullName, formatAddress…)
│
└── components/<entidad>/
    ├── <entidad>-table-skeleton.tsx          # N columnas × 8 filas de <Skeleton>
    ├── <entidad>-sortable-column-header.tsx  # 'use client' — useRouter+usePathname+useSearchParams
    ├── <entidad>-table.tsx                   # 'use client' — tabla Shadcn, props sortBy/sortDir
    ├── <entidad>-empty-state.tsx             # prop hasFilters: boolean — dos mensajes
    ├── <entidad>-search-input.tsx            # input + icono Search + botón X
    ├── <entidad>-<filtro>-filter.tsx         # Control segmentado (boolean/enum)
    ├── <entidad>-active-filter-chips.tsx     # Chips brand-teal + Limpiar todo
    └── <entidad>-filter-bar.tsx             # 'use client' coordinador: buildUrl + debounce
```

---

## Backend (NestJS AdminModule)

### Interfaz de parámetros

```typescript
// admin.service.ts — exportar siempre para usarla en controller
export interface Get<Entidad>Params {
  sortBy?: string;
  sortDir?: string;
  q?: string;
  // ...filtros específicos de la entidad
}
```

### Método de servicio

```typescript
async get<Entidad>(page: number, limit: number, params: Get<Entidad>Params = {}) {
  const skip = (page - 1) * limit;
  const isValidSort = params.sortBy !== undefined && this.valid<Entidad>SortColumns.includes(params.sortBy);
  const resolvedSort = isValidSort ? params.sortBy! : DEFAULT_SORT;
  const dir: 'asc' | 'desc' = isValidSort ? (params.sortDir === 'asc' ? 'asc' : 'desc') : DEFAULT_DIR;
  const orderBy = this.build<Entidad>OrderBy(resolvedSort, dir);
  const where = this.build<Entidad>Where(params);

  const [data, total] = await this.prisma.$transaction([
    this.prisma.<entidad>.findMany({ where, orderBy, skip, take: limit, include: { ... } }),
    this.prisma.<entidad>.count({ where }),        // ← MISMO where que findMany
  ]);

  return { data, meta: { page, limit, total } };  // meta.total = count filtrado
}
```

**Regla clave**: el mismo `where` va a `findMany` y a `count`. Así `meta.total` refleja siempre el número de registros que cumplen los filtros activos.

### buildWhere — condición base invariable

```typescript
private build<Entidad>Where(params): Prisma.<Entidad>WhereInput {
  const conditions: Prisma.<Entidad>WhereInput[] = [{ isDeleted: false }]; // SIEMPRE primero

  if (params.q?.trim()) {
    conditions.push({
      OR: [
        { campo1: { contains: params.q.trim(), mode: 'insensitive' } },
        // ... resto de campos
      ],
    });
  }

  // filtros booleanos/enum: 'true'/'false' como strings
  if (params.favoriteField === 'true') conditions.push({ boolField: true });
  else if (params.favoriteField === 'false') conditions.push({ boolField: false });
  // valores inválidos → se ignoran silenciosamente

  return { AND: conditions };
}
```

### buildOrderBy — nulls last en campos nullable

```typescript
private build<Entidad>OrderBy(sortBy: string, dir: 'asc' | 'desc') {
  const nullsLast = { sort: dir, nulls: 'last' as const };
  switch (sortBy) {
    case 'name': return [{ user: { firstName: nullsLast } }, { user: { lastName: nullsLast } }];
    case 'nullableField': return [{ nullableField: nullsLast }];  // campos nullable → nulls last
    case 'nonNullableField': return [{ nonNullableField: dir }];  // no nullable → sin nulls: last
    case 'booleanField': return [{ boolField: dir }];            // boolean → directo
    default: return [/* fallback a default sort */];
  }
}
```

### DTO con class-validator

```typescript
// CRÍTICO: ValidationPipe global tiene forbidNonWhitelisted: true
// Toda propiedad que pueda llegar en la petición DEBE tener al menos @IsOptional()
class <Entidad>Query extends PaginationQuery {
  @IsOptional()
  @IsIn(['col1', 'col2', ...])  // valores válidos de sortBy
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['true', 'false'])      // filtros boolean como strings
  favoriteField?: string;
}
```

---

## Frontend (Next.js App Router)

### page.tsx — Server Component

```typescript
export const dynamic = 'force-dynamic';

export default async function <Entidad>Page({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; q?: string; filtroX?: string }>;
}) {
  const { sort, dir, q, filtroX } = await searchParams;

  // Validación con allowlist — si sortBy inválido, resetear también sortDir
  const isValidSort = VALID_SORT_COLUMNS.includes(sort as SortByColumn);
  const sortBy: SortByColumn = isValidSort ? (sort as SortByColumn) : DEFAULT_SORT;
  const sortDir: SortDir = isValidSort
    ? (dir === 'asc' || dir === 'desc' ? dir : DEFAULT_DIR)
    : DEFAULT_DIR;

  const parsedQ = q?.trim() ?? '';
  const parsedFiltroX = filtroX === 'true' || filtroX === 'false' ? filtroX : undefined;

  const hasFilters = Boolean(parsedQ || parsedFiltroX);
  const { data, meta } = await get<Entidad>(1, 50, sortBy, sortDir, { q: parsedQ || undefined, filtroX: parsedFiltroX });

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight"><Entidad></h1>
        <p className="text-sm text-muted-foreground mt-1">{meta.total} ...</p>
      </div>
      <FilterBar initialQ={parsedQ} initialFiltroX={parsedFiltroX} sortBy={sortBy} sortDir={sortDir} />
      {data.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <Suspense fallback={<TableSkeleton />}>        {/* ← Suspense para useSearchParams */}
          <div className="rounded-lg border bg-card">
            <Table items={data} sortBy={sortBy} sortDir={sortDir} />
          </div>
        </Suspense>
      )}
    </div>
  );
}
```

### SortableColumnHeader — Client Component

```typescript
'use client';
export function SortableColumnHeader({ column, label, currentSort, currentDir }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();   // ← requiere <Suspense> en el Server Component padre

  const isActive = column === currentSort;
  const nextDir = isActive && currentDir === 'asc' ? 'desc' : 'asc';

  const handleClick = () => {
    const params = new URLSearchParams();
    params.set('sort', column);
    params.set('dir', nextDir);
    // Preservar TODOS los filtros activos al cambiar sort
    ['q', 'filtroX', 'filtroY'].forEach((key) => {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    });
    router.push(`${pathname}?${params.toString()}`);
  };
  // ...
}
```

### FilterBar — Client Component coordinador

```typescript
'use client';
export function FilterBar({ initialQ, initialFiltroX, sortBy, sortDir }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [filtroX, setFiltroX] = useState(initialFiltroX);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Único punto de mutación de URL — siempre preserva sort
  function buildUrl(overrides: { q?: string; filtroX?: FiltroXValue }): string {
    const params = new URLSearchParams();
    params.set('sort', sortBy);
    params.set('dir', sortDir);
    const resolvedQ = 'q' in overrides ? overrides.q : q;
    const resolvedFiltroX = 'filtroX' in overrides ? overrides.filtroX : filtroX;
    if (resolvedQ) params.set('q', resolvedQ);
    if (resolvedFiltroX) params.set('filtroX', resolvedFiltroX);
    return `/<entidad>?${params.toString()}`;
  }

  // Búsqueda: debounce 300ms
  function handleSearchChange(value: string) {
    setQ(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => router.push(buildUrl({ q: value })), 300);
  }

  // Filtros toggle: inmediato (sin debounce)
  function handleFiltroXChange(value: FiltroXValue) {
    setFiltroX(value);
    router.push(buildUrl({ filtroX: value }));
  }

  function handleClearAll() {
    setQ(''); setFiltroX(undefined);
    router.push(`/<entidad>?sort=${sortBy}&dir=${sortDir}`);
  }
  // ...
}
```

---

## Reglas y Decisiones del Patrón

| Regla | Motivación |
|-------|-----------|
| **`force-dynamic` en todas las páginas de datos** | Evita pre-renderizado en build time cuando el API no está disponible |
| **`await searchParams` antes de leer params** | Next.js 15+ devuelve `searchParams` como `Promise` |
| **Validación con allowlist en el Server Component** | Si `sortBy` es inválido, se resetean también `sortDir` a su default |
| **`buildUrl` como único punto de mutación de URL** | Garantiza que sort y filtros siempre coexistan y se preserven mutuamente |
| **Debounce 300ms solo en search, toggle inmediato en filtros booleanos** | El search puede cambiar muchas veces por segundo (tecla a tecla); los filtros segmentados tienen 3 opciones y son tap deliberado |
| **`<Suspense>` envolviendo la tabla** | `SortableColumnHeader` usa `useSearchParams()` — Next.js requiere `Suspense` para SSR correcto |
| **Filtros booleanos como strings `'true'`/`'false'`** | Los query params son siempre strings; se valida con `@IsIn(['true','false'])` en el DTO |
| **`isDeleted: false` como primer elemento del AND invariable** | Garantiza que la condición base no puede omitirse con ninguna combinación de filtros |
| **`nulls: 'last'` para campos nullable en orderBy** | Consistente en toda la codebase; registros sin valor al final independientemente de la dirección |
| **Mismo `where` en `findMany` y `count`** | `meta.total` refleja siempre el número filtrado, no el total global |
| **Chips `brand-teal` para filtros activos** | Consistencia visual; `q` entre comillas, filtros booleanos con etiqueta legible de `FILTER_LABELS` |
| **Duplicación de componentes por entidad** | Evita abstracciones prematuras (`DataPage<T>`). Las entidades difieren en columnas, filtros y semántica |

---

## Aplicaciones del Patrón

| Página | Change | Filtros específicos | Columnas especiales |
|--------|--------|---------------------|---------------------|
| `/orders` | T01, T02 | status CSV, mode CSV, from/to fechas | amount (currency), ref (nulls last) |
| `/users` | T03 | registered (bool) | _count de relaciones (orders, addresses) |
| `/addresses` | admin-addresses-page | favorite (bool: isDefault) | Dirección (calculada en frontend, no ordenable), Favorita (icono Star) |
