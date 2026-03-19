# Admin Addresses Page — Página de Direcciones en el Dashboard Admin

**App**: `apps/web-admin` (Dashboard Admin — Next.js 16) + `apps/api` (NestJS — AdminModule)  
**Estado**: Listo para implementación  
**Fecha**: 2026-03-12  
**Prerrequisitos**: T03 completado ✅ (patrón ordenación + filtros de Usuarios operativo)

---

## Historia de Usuario

**Como** administrador del Dashboard Admin,  
**quiero** ver todas las direcciones guardadas por los usuarios registrados en una página dedicada,  
**para** supervisar el libro de direcciones del sistema, detectar datos incompletos y comprender la distribución geográfica de los compradores.

---

## Descripción funcional

Se crea una nueva página `/addresses` insertada entre `/users` y `/simulate` en la barra lateral de navegación.

La página muestra las filas de la tabla `Address` (excluyendo las eliminadas con soft-delete) junto con los datos del usuario al que pertenece cada dirección. Misma estructura visual que las páginas de Pedidos y Usuarios: tabla con cabeceras ordenables, barra de filtros encima y estado vacío cuando no hay resultados.

### Barra de filtros — layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🔍 [Buscar por usuario, alias, dirección, ciudad...]   [Todas]  [Favorita]  [No favorita]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

Cuando hay filtros activos, se muestra una fila de chips debajo:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Filtros:  ["madrid" ✕]  [Favorita ✕]                          [Limpiar todo] │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Columnas

| Columna visible | `sortBy` (URL) | Campo Prisma | Notas |
|---|---|---|---|
| **Usuario** | `name` | `user.firstName` + `user.lastName`, `nulls: 'last'` | **Orden por defecto: `asc`** |
| **Alias** | `alias` | `label`, `nulls: 'last'` | Etiqueta libre de la dirección |
| **Dirección** | — | *(no ordenable)* | Concatenación con `, ` de: `street`, `number`, `block`, `staircase`, `floor`, `door` (omitiendo nulos y vacíos) |
| **Código Postal** | `postalCode` | `postalCode` | |
| **Ciudad** | `city` | `city` | |
| **Provincia** | `province` | `province`, `nulls: 'last'` | Puede ser nulo |
| **País** | `country` | `country` | |
| **Favorita** | `favorite` | `isDefault` | ⭐ (estrella rellena) = `true`, ☆ (vacía) = `false` |

**No ordenables**: Dirección (campo calculado en el frontend).

---

## URL y estado por defecto

- **Parámetros URL sort**: `?sort=<sortBy>&dir=<asc|desc>`
- **Por defecto** (sin params o inválidos): `sort=name` + `dir=asc` (usuario A→Z, nulls al final)
- **Parámetros URL filtros**: `?q=<texto>&favorite=<true|false>`
- Valores válidos de `sort`: `name | alias | postalCode | city | province | country | favorite`
- Valores válidos de `dir`: `asc | desc`
- Valores válidos de `favorite`: `true | false` (ausente = Todas)
- Parámetros inválidos → fallback silencioso (sin error 400)
- Ejemplos:
  - `/addresses` → usuario A→Z
  - `/addresses?sort=city&dir=asc` → ciudad A→Z
  - `/addresses?sort=favorite&dir=desc` → favoritas primero
  - `/addresses?q=madrid&favorite=true` → búsqueda "madrid" filtrando solo favoritas
  - `/addresses?sort=name&dir=asc&q=garcia&favorite=false` → combinado sort + filtros

---

## Controles de filtro — especificación detallada

### 1. Search box (texto libre)

- **Placeholder**: `"Buscar por usuario, alias, dirección, ciudad..."`
- **Icono**: `Search` (lucide-react) a la izquierda del input
- **Comportamiento**: debounce de **300 ms** antes de actualizar la URL y lanzar la petición
- **Columnas que cubre** (OR lógico): `user.firstName`, `user.lastName`, `label`, `street`, `number`, `block`, `staircase`, `floor`, `door`, `postalCode`, `city`, `province`, `country`
- **Case-insensitive** (modo Prisma `insensitive`)
- **Limpiar**: aparece icono `X` en el extremo derecho del input cuando tiene contenido; al hacer clic, limpia el campo y elimina el param `q` de la URL
- **URL param**: `?q=<término>`

### 2. Filtro Favorita (control segmentado)

- **Opciones**: `[Todas]` / `[Favorita]` / `[No favorita]`
- **Selección única** (radio-style buttons, no multi-select)
- **Por defecto**: "Todas" activo (sin param `favorite` en URL)
- **Comportamiento**: clic inmediato actualiza la URL (sin debounce, sin "Aplicar")
- **Visual activo**: botón con `bg-brand-teal/10 text-brand-teal`
- **URL param**: `?favorite=true` / `?favorite=false` (ausente = Todas)

```
┌────────────────────────────────────────────┐
│  [  Todas  ]  [  ⭐ Favorita  ]  [  ☆ No favorita ] │
└────────────────────────────────────────────┘
```

---

## URL y estado — esquema completo

### Parámetros completos (filtros + sort coexistiendo)

```
/addresses?q=garcia&favorite=true&sort=city&dir=asc
```

### Tabla de parámetros

| Param | Tipo | Valores válidos | Default | Notas |
|---|---|---|---|---|
| `q` | string | cualquier texto | — (sin filtro) | Vacío o ausente = sin búsqueda de texto |
| `favorite` | string | `true \| false` | — (Todas) | Ausente = sin filtro de favorita |
| `sort` | string | `name\|alias\|postalCode\|city\|province\|country\|favorite` | `name` | Inválido → fallback silencioso |
| `dir` | string | `asc\|desc` | `asc` | Inválido → fallback silencioso |
| `page` | string | entero positivo | `1` | Reservado para paginación futura |
| `limit` | string | 1–100 | `50` | Reservado para paginación futura |

### Reglas de combinación

- `q` y `favorite` se combinan con **AND** lógico (ambos deben cumplirse)
- Cambiar cualquier filtro **preserva** el sort activo (`sort` + `dir`)
- Cambiar el sort **preserva** los filtros activos (`q` + `favorite`)
- Cualquier cambio de filtro resetea a `page=1` (implícito)

### Ejemplos de URLs

```
/addresses                                     → sin filtros, name ASC
/addresses?q=garcia                            → direcciones de usuarios o alias con "garcia"
/addresses?favorite=true                       → solo favoritas
/addresses?favorite=false                      → solo no favoritas
/addresses?q=madrid&favorite=true              → "madrid" entre las favoritas
/addresses?sort=city&dir=asc&favorite=true     → favoritas ordenadas por ciudad A→Z
/addresses?sort=name&dir=asc&q=carlos&favorite=false → combinación completa
```

---

## Lógica de concatenación de la columna Dirección

La columna **Dirección** es un campo calculado en el frontend (no ordenable). Se genera así:

```typescript
// lib/utils.ts — nueva función
export function formatAddress(address: {
  street: string;
  number?: string | null;
  block?: string | null;
  staircase?: string | null;
  floor?: string | null;
  door?: string | null;
}): string {
  const streetPart = [address.street, address.number]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(' ');
  const rest = [address.block, address.staircase, address.floor, address.door]
    .filter((part): part is string => Boolean(part?.trim()));
  return [streetPart, ...rest].join(', ');
}
```

**Regla clave**: `street` y `number` se unen con un **espacio** (sin coma). El resto de campos se separan del bloque `street number` y entre sí con `, `. Los campos nulos, `undefined` o cadenas vacías se omiten completamente sin dejar separadores adicionales.

**Ejemplos**:
- `street="Calle Mayor", number="5"` → `"Calle Mayor 5"`
- `street="Gran Vía", number="12", floor="3º", door="B"` → `"Gran Vía 12, 3º, B"`
- `street="Paseo de la Castellana"` (resto nulos) → `"Paseo de la Castellana"`
- `street="Calle Ancha", number="3", block=null, staircase=null, floor="2º", door="A"` → `"Calle Ancha 3, 2º, A"` *(block y staircase omitidos sin dejar comas vacías)*

---

## Arquitectura de la solución

### Tipos compartidos (frontend)

Añadir en `apps/web-admin/src/types/api.ts`:

```typescript
// ─── Direcciones ─────────────────────────────────────────────────────────────

export interface AdminAddressUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export interface AdminAddress {
  id: string;
  userId: string;
  label: string | null;
  street: string;
  number: string | null;
  block: string | null;
  staircase: string | null;
  floor: string | null;
  door: string | null;
  postalCode: string;
  city: string;
  province: string | null;
  country: string;
  isDefault: boolean;
  createdAt: string;
  user: AdminAddressUser;
}

export type AddressSortByColumn =
  | 'name'
  | 'alias'
  | 'postalCode'
  | 'city'
  | 'province'
  | 'country'
  | 'favorite';

export const VALID_ADDRESS_SORT_COLUMNS: AddressSortByColumn[] = [
  'name', 'alias', 'postalCode', 'city', 'province', 'country', 'favorite',
];

export const DEFAULT_ADDRESS_SORT: AddressSortByColumn = 'name';
export const DEFAULT_ADDRESS_DIR: SortDir = 'asc';

export interface AddressesFilters {
  q?: string;
  favorite?: 'true' | 'false';
}

export const ADDRESS_FAVORITE_FILTER_LABELS: Record<string, string> = {
  true: 'Favorita',
  false: 'No favorita',
};

export type AddressesResponse = PaginatedResponse<AdminAddress>;
```

---

### Capa frontend (`apps/web-admin`)

#### `lib/api.ts` — añadir `getAddresses()`

```typescript
import type { AddressesResponse, AddressSortByColumn, AddressesFilters } from '@/types/api';

export const getAddresses = (
  page = 1,
  limit = 50,
  sortBy?: AddressSortByColumn,
  sortDir?: SortDir,
  filters?: AddressesFilters,
): Promise<AddressesResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortBy)           params.set('sortBy', sortBy);
  if (sortDir)          params.set('sortDir', sortDir);
  if (filters?.q)       params.set('q', filters.q);
  if (filters?.favorite) params.set('favorite', filters.favorite);
  return apiFetch(`/api/admin/addresses?${params.toString()}`);
};
```

---

#### `app/addresses/page.tsx` — Server Component

```typescript
import { Suspense } from 'react';
import { getAddresses } from '@/lib/api';
import {
  VALID_ADDRESS_SORT_COLUMNS,
  DEFAULT_ADDRESS_SORT,
  DEFAULT_ADDRESS_DIR,
  type AddressSortByColumn,
  type SortDir,
  type AddressesFilters,
} from '@/types/api';
import { AddressesTable } from '@/components/addresses/addresses-table';
import { AddressesEmptyState } from '@/components/addresses/addresses-empty-state';
import { AddressesFilterBar } from '@/components/addresses/addresses-filter-bar';
import { AddressesTableSkeleton } from '@/components/addresses/addresses-table-skeleton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Direcciones | Adresles Admin' };

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string;
    dir?: string;
    q?: string;
    favorite?: string;
  }>;
}) {
  const { sort, dir, q, favorite } = await searchParams;

  const isValidSort = VALID_ADDRESS_SORT_COLUMNS.includes(sort as AddressSortByColumn);
  const sortBy: AddressSortByColumn = isValidSort
    ? (sort as AddressSortByColumn)
    : DEFAULT_ADDRESS_SORT;
  const sortDir: SortDir = isValidSort
    ? (dir === 'asc' || dir === 'desc' ? dir : DEFAULT_ADDRESS_DIR)
    : DEFAULT_ADDRESS_DIR;

  const parsedQ = q?.trim() ?? '';
  const parsedFavorite: 'true' | 'false' | undefined =
    favorite === 'true' || favorite === 'false' ? favorite : undefined;

  const filters: AddressesFilters = {
    q: parsedQ || undefined,
    favorite: parsedFavorite,
  };

  const hasFilters = Boolean(parsedQ || parsedFavorite);

  const { data: addresses, meta } = await getAddresses(1, 50, sortBy, sortDir, filters);

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Direcciones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.total} dirección{meta.total !== 1 ? 'es' : ''} encontrada{meta.total !== 1 ? 's' : ''}
        </p>
      </div>

      <AddressesFilterBar
        initialQ={parsedQ}
        initialFavorite={parsedFavorite}
        sortBy={sortBy}
        sortDir={sortDir}
      />

      {addresses.length === 0 ? (
        <AddressesEmptyState hasFilters={hasFilters} />
      ) : (
        <Suspense fallback={<AddressesTableSkeleton />}>
          <div className="rounded-lg border bg-card">
            <AddressesTable addresses={addresses} sortBy={sortBy} sortDir={sortDir} />
          </div>
        </Suspense>
      )}
    </div>
  );
}
```

---

#### `app/addresses/loading.tsx`

```typescript
import { AddressesTableSkeleton } from '@/components/addresses/addresses-table-skeleton';

export default function Loading() {
  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <div className="h-8 w-40 rounded bg-muted animate-pulse" />
        <div className="h-4 w-32 rounded bg-muted animate-pulse mt-1" />
      </div>
      <AddressesTableSkeleton />
    </div>
  );
}
```

---

#### `app/addresses/error.tsx`

```typescript
'use client';

import { MapPin } from 'lucide-react';

export default function Error() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-8">
      <MapPin className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-foreground mb-1">Error al cargar direcciones</h3>
      <p className="text-sm text-muted-foreground">
        No se pudieron obtener las direcciones. Comprueba que la API esté disponible.
      </p>
    </div>
  );
}
```

---

#### `components/addresses/addresses-table.tsx` — Client Component

```typescript
'use client';

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Star } from 'lucide-react';
import { formatFullName, formatAddress } from '@/lib/utils';
import { AddressesSortableColumnHeader } from './addresses-sortable-column-header';
import type { AdminAddress, AddressSortByColumn, SortDir } from '@/types/api';

interface AddressesTableProps {
  addresses: AdminAddress[];
  sortBy: AddressSortByColumn;
  sortDir: SortDir;
}

export function AddressesTable({ addresses, sortBy, sortDir }: AddressesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col" aria-sort={sortBy === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <AddressesSortableColumnHeader column="name" label="Usuario" currentSort={sortBy} currentDir={sortDir} />
          </TableHead>
          <TableHead scope="col" aria-sort={sortBy === 'alias' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <AddressesSortableColumnHeader column="alias" label="Alias" currentSort={sortBy} currentDir={sortDir} />
          </TableHead>
          <TableHead scope="col">Dirección</TableHead>
          <TableHead scope="col" aria-sort={sortBy === 'postalCode' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <AddressesSortableColumnHeader column="postalCode" label="Código Postal" currentSort={sortBy} currentDir={sortDir} />
          </TableHead>
          <TableHead scope="col" aria-sort={sortBy === 'city' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <AddressesSortableColumnHeader column="city" label="Ciudad" currentSort={sortBy} currentDir={sortDir} />
          </TableHead>
          <TableHead scope="col" aria-sort={sortBy === 'province' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <AddressesSortableColumnHeader column="province" label="Provincia" currentSort={sortBy} currentDir={sortDir} />
          </TableHead>
          <TableHead scope="col" aria-sort={sortBy === 'country' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <AddressesSortableColumnHeader column="country" label="País" currentSort={sortBy} currentDir={sortDir} />
          </TableHead>
          <TableHead scope="col" aria-sort={sortBy === 'favorite' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} className="text-center">
            <AddressesSortableColumnHeader column="favorite" label="Favorita" currentSort={sortBy} currentDir={sortDir} />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {addresses.map((address) => (
          <TableRow key={address.id}>
            <TableCell className="font-medium">
              {formatFullName(address.user.firstName, address.user.lastName)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {address.label ?? '—'}
            </TableCell>
            <TableCell className="text-sm">
              {formatAddress(address)}
            </TableCell>
            <TableCell className="text-sm">{address.postalCode}</TableCell>
            <TableCell className="text-sm">{address.city}</TableCell>
            <TableCell className="text-sm">{address.province ?? '—'}</TableCell>
            <TableCell className="text-sm">{address.country}</TableCell>
            <TableCell className="text-center">
              {address.isDefault ? (
                <Star className="h-4 w-4 fill-brand-teal text-brand-teal mx-auto" aria-label="Favorita" />
              ) : (
                <Star className="h-4 w-4 text-muted-foreground/30 mx-auto" aria-label="No favorita" />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

#### `components/addresses/addresses-sortable-column-header.tsx` — Client Component

```typescript
'use client';

import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AddressSortByColumn, SortDir } from '@/types/api';

interface AddressesSortableColumnHeaderProps {
  column: AddressSortByColumn;
  label: string;
  currentSort: AddressSortByColumn;
  currentDir: SortDir;
}

export function AddressesSortableColumnHeader({
  column, label, currentSort, currentDir,
}: AddressesSortableColumnHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = column === currentSort;
  const nextDir: SortDir = isActive && currentDir === 'asc' ? 'desc' : 'asc';

  const handleClick = () => {
    const params = new URLSearchParams();
    params.set('sort', column);
    params.set('dir', nextDir);
    // Preservar filtros activos al cambiar sort
    ['q', 'favorite'].forEach((key) => {
      const val = searchParams.get(key);
      if (val) params.set(key, val);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const Icon = isActive
    ? currentDir === 'asc' ? ChevronUp : ChevronDown
    : ChevronsUpDown;

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
      aria-label={`Ordenar por ${label} ${nextDir === 'asc' ? 'ascendente' : 'descendente'}`}
    >
      {label}
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground/50'}`}
        aria-hidden="true"
      />
    </button>
  );
}
```

---

#### `components/addresses/addresses-filter-bar.tsx` — Client Component

```typescript
'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AddressSortByColumn, SortDir } from '@/types/api';
import { AddressesSearchInput } from './addresses-search-input';
import { AddressesFavoriteFilter } from './addresses-favorite-filter';
import { AddressesActiveFilterChips } from './addresses-active-filter-chips';

type FavoriteValue = 'true' | 'false' | undefined;

interface AddressesFilterBarProps {
  initialQ: string;
  initialFavorite: FavoriteValue;
  sortBy: AddressSortByColumn;
  sortDir: SortDir;
}

interface FilterOverrides {
  q?: string;
  favorite?: FavoriteValue;
}

export function AddressesFilterBar({
  initialQ, initialFavorite, sortBy, sortDir,
}: AddressesFilterBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [favorite, setFavorite] = useState<FavoriteValue>(initialFavorite);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function buildUrl(overrides: FilterOverrides): string {
    const params = new URLSearchParams();
    params.set('sort', sortBy);
    params.set('dir', sortDir);
    const resolvedQ = 'q' in overrides ? overrides.q : q;
    const resolvedFavorite = 'favorite' in overrides ? overrides.favorite : favorite;
    if (resolvedQ)        params.set('q', resolvedQ);
    if (resolvedFavorite) params.set('favorite', resolvedFavorite);
    return `/addresses?${params.toString()}`;
  }

  function handleSearchChange(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ q: value }));
    }, 300);
  }

  function handleFavoriteChange(value: FavoriteValue) {
    setFavorite(value);
    router.push(buildUrl({ favorite: value }));
  }

  function handleClearAll() {
    setQ('');
    setFavorite(undefined);
    router.push(`/addresses?sort=${sortBy}&dir=${sortDir}`);
  }

  const hasActiveFilters = Boolean(q) || Boolean(favorite);

  return (
    <div className="space-y-2 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <AddressesSearchInput value={q} onChange={handleSearchChange} />
        <AddressesFavoriteFilter value={favorite} onChange={handleFavoriteChange} />
      </div>
      {hasActiveFilters && (
        <AddressesActiveFilterChips
          q={q}
          favorite={favorite}
          onRemoveQ={() => handleSearchChange('')}
          onRemoveFavorite={() => handleFavoriteChange(undefined)}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
```

---

#### `components/addresses/addresses-search-input.tsx` — sub-componente

```typescript
'use client';

import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function AddressesSearchInput({ value, onChange }: Props) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por usuario, alias, dirección, ciudad..."
        className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
        aria-label="Buscar direcciones"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
```

---

#### `components/addresses/addresses-favorite-filter.tsx` — sub-componente

```typescript
'use client';

type FavoriteValue = 'true' | 'false' | undefined;

interface AddressesFavoriteFilterProps {
  value: FavoriteValue;
  onChange: (value: FavoriteValue) => void;
}

const OPTIONS: { label: string; value: FavoriteValue }[] = [
  { label: 'Todas',       value: undefined },
  { label: 'Favorita',    value: 'true' },
  { label: 'No favorita', value: 'false' },
];

export function AddressesFavoriteFilter({ value, onChange }: AddressesFavoriteFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por dirección favorita"
      className="flex items-center rounded-md border border-input overflow-hidden"
    >
      {OPTIONS.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={`h-9 px-3 text-sm transition-colors border-r last:border-r-0 border-input ${
              isActive
                ? 'bg-brand-teal/10 text-brand-teal font-medium'
                : 'bg-background text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

---

#### `components/addresses/addresses-active-filter-chips.tsx` — sub-componente

```typescript
'use client';

import { X } from 'lucide-react';
import { ADDRESS_FAVORITE_FILTER_LABELS } from '@/types/api';

interface AddressesActiveFilterChipsProps {
  q: string;
  favorite: 'true' | 'false' | undefined;
  onRemoveQ: () => void;
  onRemoveFavorite: () => void;
  onClearAll: () => void;
}

export function AddressesActiveFilterChips({
  q, favorite, onRemoveQ, onRemoveFavorite, onClearAll,
}: AddressesActiveFilterChipsProps) {
  interface Chip { key: string; label: string; onRemove: () => void; }
  const chips: Chip[] = [];
  if (q)        chips.push({ key: 'q',        label: `"${q}"`,                             onRemove: onRemoveQ });
  if (favorite) chips.push({ key: 'favorite',  label: ADDRESS_FAVORITE_FILTER_LABELS[favorite], onRemove: onRemoveFavorite });
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Filtros activos">
      {chips.map((chip) => (
        <span
          key={chip.key}
          role="listitem"
          className="inline-flex items-center gap-1 rounded-full border border-brand-teal bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal"
        >
          {chip.label}
          <button
            type="button"
            aria-label={`Eliminar filtro ${chip.label}`}
            onClick={chip.onRemove}
            className="ml-0.5 rounded-full hover:bg-brand-teal/20 p-0.5 transition-colors"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
      >
        Limpiar todo
      </button>
    </div>
  );
}
```

---

#### `components/addresses/addresses-empty-state.tsx`

```typescript
import { MapPin } from 'lucide-react';

interface Props {
  hasFilters?: boolean;
}

export function AddressesEmptyState({ hasFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <MapPin className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-foreground mb-1">
        {hasFilters ? 'Sin resultados' : 'Sin direcciones todavía'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {hasFilters
          ? 'Prueba a ajustar o limpiar los filtros activos.'
          : 'Las direcciones guardadas por los usuarios aparecerán aquí.'}
      </p>
    </div>
  );
}
```

---

#### `components/addresses/addresses-table-skeleton.tsx`

```typescript
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export function AddressesTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {['Usuario', 'Alias', 'Dirección', 'Código Postal', 'Ciudad', 'Provincia', 'País', 'Favorita'].map((col) => (
            <TableHead key={col}>{col}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: 8 }).map((_, j) => (
              <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

#### `components/layout/sidebar.tsx` — actualizar navegación

Insertar la nueva entrada entre Usuarios y Simulación:

```typescript
import { ShoppingCart, Users, MapPin, MessageSquare } from 'lucide-react';

const navItems = [
  { href: '/orders',    label: 'Pedidos',     icon: ShoppingCart },
  { href: '/users',     label: 'Usuarios',    icon: Users },
  { href: '/addresses', label: 'Direcciones', icon: MapPin },      // ← NUEVO
  { href: '/simulate',  label: 'Simulación',  icon: MessageSquare },
];
```

---

#### `lib/utils.ts` — añadir `formatAddress()`

```typescript
export function formatAddress(address: {
  street: string;
  number?: string | null;
  block?: string | null;
  staircase?: string | null;
  floor?: string | null;
  door?: string | null;
}): string {
  return [address.street, address.number, address.block, address.staircase, address.floor, address.door]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ');
}
```

---

### Capa backend (`apps/api`)

#### `admin.controller.ts` — añadir `AddressesQuery` DTO y endpoint

```typescript
class AddressesQuery extends PaginationQuery {
  @IsOptional()
  @IsIn(['name', 'alias', 'postalCode', 'city', 'province', 'country', 'favorite'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  favorite?: string;
}

@Get('addresses')
getAddresses(@Query() query: AddressesQuery) {
  const page  = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '50', 10) || 50));
  return this.adminService.getAddresses(page, limit, {
    sortBy:   query.sortBy,
    sortDir:  query.sortDir,
    q:        query.q,
    favorite: query.favorite,
  });
}
```

---

#### `admin.service.ts` — añadir `GetAddressesParams` y `getAddresses()`

```typescript
export interface GetAddressesParams {
  sortBy?:   string;
  sortDir?:  string;
  q?:        string;
  favorite?: string;  // 'true' | 'false' | undefined
}

// Añadir en la clase AdminService:

private readonly validAddressSortColumns = [
  'name', 'alias', 'postalCode', 'city', 'province', 'country', 'favorite',
];

async getAddresses(page: number, limit: number, params: GetAddressesParams = {}) {
  const skip = (page - 1) * limit;

  const isValidSort =
    params.sortBy !== undefined &&
    this.validAddressSortColumns.includes(params.sortBy);
  const resolvedSort = isValidSort ? params.sortBy! : 'name';
  const dir: 'asc' | 'desc' =
    isValidSort ? (params.sortDir === 'asc' ? 'asc' : 'desc') : 'asc';

  const orderBy = this.buildAddressesOrderBy(resolvedSort, dir);
  const where   = this.buildAddressesWhere(params);

  const [data, total] = await this.prisma.$transaction([
    this.prisma.address.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    this.prisma.address.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
}

private buildAddressesOrderBy(sortBy: string, dir: 'asc' | 'desc') {
  const nullsLast = { sort: dir, nulls: 'last' as const };

  switch (sortBy) {
    case 'name':
      return [
        { user: { firstName: nullsLast } },
        { user: { lastName: nullsLast } },
      ];
    case 'alias':
      return [{ label: nullsLast }];
    case 'postalCode':
      return [{ postalCode: dir }];
    case 'city':
      return [{ city: dir }];
    case 'province':
      return [{ province: nullsLast }];
    case 'country':
      return [{ country: dir }];
    case 'favorite':
      return [{ isDefault: dir }];
    default:
      return [
        { user: { firstName: nullsLast } },
        { user: { lastName: nullsLast } },
      ];
  }
}

private buildAddressesWhere(params: GetAddressesParams): Prisma.AddressWhereInput {
  // isDeleted: false siempre como condición base
  const conditions: Prisma.AddressWhereInput[] = [
    { isDeleted: false },
  ];

  if (params.q && params.q.trim()) {
    const q = params.q.trim();
    conditions.push({
      OR: [
        { user: { firstName: { contains: q, mode: 'insensitive' } } },
        { user: { lastName:  { contains: q, mode: 'insensitive' } } },
        { label:      { contains: q, mode: 'insensitive' } },
        { street:     { contains: q, mode: 'insensitive' } },
        { number:     { contains: q, mode: 'insensitive' } },
        { block:      { contains: q, mode: 'insensitive' } },
        { staircase:  { contains: q, mode: 'insensitive' } },
        { floor:      { contains: q, mode: 'insensitive' } },
        { door:       { contains: q, mode: 'insensitive' } },
        { postalCode: { contains: q, mode: 'insensitive' } },
        { city:       { contains: q, mode: 'insensitive' } },
        { province:   { contains: q, mode: 'insensitive' } },
        { country:    { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  if (params.favorite === 'true') {
    conditions.push({ isDefault: true });
  } else if (params.favorite === 'false') {
    conditions.push({ isDefault: false });
  }

  return { AND: conditions };
}
```

---

## Criterios de aceptación

### Tabla — columnas y render

- [ ] La tabla muestra 8 columnas: Usuario, Alias, Dirección, Código Postal, Ciudad, Provincia, País, Favorita
- [ ] Usuario muestra `firstName + lastName`; si ambos son nulos, muestra `—`
- [ ] Alias muestra `label`; si es nulo, muestra `—`
- [ ] Dirección concatena los campos no nulos/vacíos de `street, number, block, staircase, floor, door` con `, `
- [ ] Provincia muestra `province`; si es nulo, muestra `—`
- [ ] Favorita muestra ⭐ (Star rellena, `fill-brand-teal`) si `isDefault = true`, y ☆ (Star vacía, `text-muted-foreground/30`) si `false`
- [ ] Las filas con `isDeleted = true` NO aparecen en la tabla

### Ordenación

- [ ] Al entrar en `/addresses` sin params, las direcciones están ordenadas por nombre de usuario ASC
- [ ] Hacer clic en "Usuario" ordena por `user.firstName` + `user.lastName`, nulls al final
- [ ] Hacer clic en "Alias" ordena por `label`, nulls al final
- [ ] La columna "Dirección" **no** tiene icono de sort ni área clicable
- [ ] Hacer clic en "Código Postal", "Ciudad", "Provincia", "País" ordena por el campo correspondiente
- [ ] Hacer clic en "Favorita" ordena por `isDefault`
- [ ] Hacer clic en una columna activa alterna `asc` ↔ `desc`
- [ ] Los params de sort persisten en la URL y sobreviven a recargar la página
- [ ] `?sort=invalido` → fallback silencioso a `name asc`

### Filtros — search box

- [ ] El input busca en los 13 campos: `user.firstName`, `user.lastName`, `label`, `street`, `number`, `block`, `staircase`, `floor`, `door`, `postalCode`, `city`, `province`, `country` (OR lógico, case-insensitive)
- [ ] La URL se actualiza con `?q=<término>` después de un debounce de 300 ms
- [ ] El icono ✕ aparece cuando hay texto; al pulsarlo limpia el campo y elimina `q` de la URL

### Filtros — botones Favorita

- [ ] Los tres botones `[Todas]` / `[Favorita]` / `[No favorita]` se muestran correctamente
- [ ] "Todas" activo por defecto cuando no hay param `favorite` en URL
- [ ] Clic en "Favorita" → `?favorite=true` → filtra solo `isDefault = true`
- [ ] Clic en "No favorita" → `?favorite=false` → filtra solo `isDefault = false`
- [ ] Clic en "Todas" elimina `favorite` de la URL
- [ ] `?favorite=invalido` → se ignora silenciosamente

### Integración filtros + sort

- [ ] Cambiar el sort preserva `q` y `favorite` activos en la URL
- [ ] Cambiar cualquier filtro preserva `sort` y `dir` activos en la URL
- [ ] `meta.total` en el subtítulo refleja el número de direcciones filtradas

### Chips de filtros activos

- [ ] Los chips solo aparecen cuando hay ≥1 filtro activo
- [ ] Chip de texto muestra el término entre comillas: `"garcia"`
- [ ] Chip de favorita muestra la etiqueta legible: `Favorita` o `No favorita`
- [ ] El ✕ de un chip elimina ese filtro preservando los demás
- [ ] "Limpiar todo" elimina todos los filtros pero preserva el sort activo

### Estado vacío

- [ ] Sin resultados por filtros: "Sin resultados / Prueba a ajustar o limpiar los filtros activos."
- [ ] Sin direcciones en absoluto: "Sin direcciones todavía / Las direcciones guardadas por los usuarios aparecerán aquí."

### Navegación (sidebar)

- [ ] El elemento "Direcciones" con icono `MapPin` aparece en la sidebar entre Usuarios y Simulación
- [ ] La ruta `/addresses` activa el elemento de navegación con el estilo resaltado correcto

### Build / compilación

- [ ] `tsc --noEmit` sin errores en `apps/web-admin`
- [ ] Sin advertencia `"useSearchParams() should be wrapped in a suspense boundary"` en el build
- [ ] Los tests existentes de `admin.service.spec.ts` y `admin.controller.spec.ts` siguen pasando

### Accesibilidad

- [ ] El input de búsqueda tiene `aria-label="Buscar direcciones"`
- [ ] El control segmentado tiene `role="group"` + `aria-label="Filtrar por dirección favorita"`
- [ ] Cada botón del control segmentado tiene `aria-pressed={isActive}`
- [ ] Los chips activos tienen `aria-label="Filtros activos"` en su contenedor
- [ ] Los iconos de estrella tienen `aria-label="Favorita"` / `aria-label="No favorita"`
- [ ] Todos los botones de sort tienen `aria-label` descriptivo

### Backend

- [ ] `GET /api/admin/addresses` (sin params) devuelve direcciones ordenadas por `user.firstName ASC`, nulls al final
- [ ] `GET /api/admin/addresses?sortBy=city&sortDir=asc` ordena por ciudad A→Z
- [ ] `GET /api/admin/addresses?sortBy=favorite&sortDir=desc` devuelve favoritas primero
- [ ] `GET /api/admin/addresses?q=garcia` filtra en los 13 campos (OR, insensitive)
- [ ] `GET /api/admin/addresses?favorite=true` devuelve solo `isDefault = true`
- [ ] `GET /api/admin/addresses?favorite=false` devuelve solo `isDefault = false`
- [ ] `GET /api/admin/addresses?q=madrid&favorite=true` aplica ambos filtros con AND
- [ ] `isDeleted: false` siempre presente en el `where`
- [ ] `meta.total` refleja el count filtrado
- [ ] `?favorite=invalido` → se ignora silenciosamente (no error 400)
- [ ] Tests unitarios para `buildAddressesOrderBy`: 7 columnas × 2 direcciones + fallback
- [ ] Tests unitarios para `buildAddressesWhere`: q OR en 13 campos, favorite=true, favorite=false, combinación AND, condición base `isDeleted: false`, valor inválido ignorado

---

## Archivos a crear o modificar

| Archivo | Operación | Detalle |
|---|---|---|
| `apps/web-admin/src/types/api.ts` | Modificar | Añadir `AdminAddressUser`, `AdminAddress`, `AddressSortByColumn`, constantes, `AddressesFilters`, `ADDRESS_FAVORITE_FILTER_LABELS`, `AddressesResponse` |
| `apps/web-admin/src/lib/api.ts` | Modificar | Añadir `getAddresses()` con todos los parámetros |
| `apps/web-admin/src/lib/utils.ts` | Modificar | Añadir `formatAddress()` |
| `apps/web-admin/src/components/layout/sidebar.tsx` | Modificar | Insertar entrada "Direcciones" (icono `MapPin`) entre Usuarios y Simulación |
| `apps/web-admin/src/app/addresses/page.tsx` | **Crear** | Server Component con `force-dynamic`, `await searchParams`, validación allowlist, subtítulo dinámico |
| `apps/web-admin/src/app/addresses/loading.tsx` | **Crear** | Skeleton de carga con `AddressesTableSkeleton` |
| `apps/web-admin/src/app/addresses/error.tsx` | **Crear** | Error boundary con icono `MapPin` |
| `apps/web-admin/src/components/addresses/addresses-table.tsx` | **Crear** | Client Component: tabla Shadcn con 8 columnas, estrella para Favorita, sin sort en Dirección |
| `apps/web-admin/src/components/addresses/addresses-sortable-column-header.tsx` | **Crear** | Client Component: `useRouter` + `usePathname` + `useSearchParams`, preserva `q` y `favorite` al cambiar sort |
| `apps/web-admin/src/components/addresses/addresses-filter-bar.tsx` | **Crear** | Client Component: orquesta filtros, debounce 300ms en search, toggle inmediato en favorita |
| `apps/web-admin/src/components/addresses/addresses-search-input.tsx` | **Crear** | Input con icono Search, botón X, `aria-label="Buscar direcciones"` |
| `apps/web-admin/src/components/addresses/addresses-favorite-filter.tsx` | **Crear** | Control segmentado [Todas] / [Favorita] / [No favorita] |
| `apps/web-admin/src/components/addresses/addresses-active-filter-chips.tsx` | **Crear** | Chips `brand-teal` con ✕ individual y botón "Limpiar todo" |
| `apps/web-admin/src/components/addresses/addresses-empty-state.tsx` | **Crear** | Estado vacío con prop `hasFilters` para mensaje alternativo |
| `apps/web-admin/src/components/addresses/addresses-table-skeleton.tsx` | **Crear** | Skeleton de 8 columnas × 8 filas |
| `apps/api/src/admin/admin.controller.ts` | Modificar | Añadir `AddressesQuery` DTO y endpoint `GET /addresses` |
| `apps/api/src/admin/admin.service.ts` | Modificar | Añadir `GetAddressesParams`, `getAddresses()`, `buildAddressesOrderBy()`, `buildAddressesWhere()` |
| `apps/api/src/admin/admin.service.spec.ts` | Modificar | Tests de `buildAddressesOrderBy` y `buildAddressesWhere` |

---

## Requisitos no funcionales

- **TypeScript strict**: `AddressSortByColumn`, `AdminAddress` y `AddressesFilters` tipados en `types/api.ts`; usar `Prisma.AddressWhereInput` para el objeto `where`; no usar `any`
- **Next.js 15+ compat**: `searchParams` como `Promise` en la firma del page
- **`Suspense` boundary**: `AddressesSortableColumnHeader` usa `useSearchParams()`; la sección de tabla debe estar en `<Suspense fallback={<AddressesTableSkeleton />}>`
- **`isDeleted: false` invariable**: `buildAddressesWhere` siempre incluye esta condición base
- **Sin regresión**: `getOrders`, `getUsers` y sus componentes no se ven afectados
- **Paginación**: 50 registros por defecto, máximo 100; sin controles UI de paginación (ticket futuro)
- **Accesibilidad WCAG 2.1 AA**: `aria-sort` en `<th>`, `aria-label` en todos los botones interactivos, `role="group"` + `aria-pressed` en el control segmentado, navegación por teclado

---

## Out of scope

- Creación, edición o eliminación de direcciones desde el dashboard
- Ver el historial de uso de una dirección en pedidos
- Mapa visual con geolocalización de las direcciones
- Paginación con controles UI (ticket posterior)
- Exportación a CSV
- Filtro por país o ciudad específica mediante desplegable (solo búsqueda de texto en esta versión)
