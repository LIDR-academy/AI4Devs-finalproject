# T03 — Ordenación y filtros en la página de Usuarios

**App**: `apps/web-admin` (Dashboard Admin — Next.js 16) + `apps/api` (NestJS — AdminModule)  
**Estado**: Enriquecido ✅ — listo para implementación  
**Fecha**: 2026-02-26  
**Prerrequisitos**: T01 completado ✅ (patrón ordenación server-side), T02 completado ✅ (patrón filtros + `buildUrl`)

---

## Historia de Usuario

**Como** administrador del Dashboard Admin,  
**quiero** poder ordenar la tabla de usuarios por columna y filtrar por nombre/email y estado de registro,  
**para** localizar rápidamente usuarios según diferentes criterios sin abandonar la página.

---

## Descripción funcional

### Ordenación

La tabla `/users` permite ordenar por columna. Mismo patrón visual que la tabla de Pedidos (T01):

- **Estado neutro** (sin ordenación activa en esa columna): icono `ChevronsUpDown` (↕) atenuado
- **Orden ascendente activo**: icono `ChevronUp` (▲) resaltado
- **Orden descendente activo**: icono `ChevronDown` (▽) resaltado

Al hacer clic en un encabezado:
- Si la columna **no estaba activa**: activa esa columna en orden **ascendente**
- Si la columna **ya estaba activa**: alterna entre `asc` → `desc` → `asc`

La ordenación es **server-side**: el estado se persiste en la URL como query params y el servidor devuelve los datos ya ordenados.

### Filtros

La página añade una barra de filtros encima de la tabla con dos controles:

1. **Search box**: búsqueda de texto libre por nombre o email (con debounce de 300 ms)
2. **Botones Registrado**: control segmentado de selección única — `[Todos]` / `[Registrado]` / `[No registrado]`

Los filtros y el sort **coexisten** sin interferirse: cambiar un filtro preserva el sort activo, y cambiar el sort preserva los filtros activos.

---

## Columnas ordenables

| Columna visible | `sortBy` (URL) | Campo backend (Prisma) | Notas |
|-----------------|----------------|------------------------|-------|
| **Nombre** | `name` | `firstName` → `lastName`, ambos `nulls: 'last'` | Aproximación a nombre completo; nulls al final |
| **Email** | `email` | `email`, `nulls: 'last'` | Puede ser null → nulls al final |
| **Pedidos** | `orders` | `orders: { _count: dir }` | Ordenación por conteo de relación |
| **Direcciones** | `addresses` | `addresses: { _count: dir }` | Ordenación por conteo de relación |
| **Última interacción** | `lastInteraction` | `lastInteractionAt`, `nulls: 'last'` | **Ordenación por defecto: `desc`** |

**No ordenables**: Teléfono, Registrado.

---

## URL y estado por defecto

- **Parámetros URL sort**: `?sort=<sortBy>&dir=<asc|desc>`
- **Por defecto** (sin params o inválidos): `sort=lastInteraction` + `dir=desc` (usuarios con interacción más reciente primero)
- **Parámetros URL filtros**: `?q=<texto>&registered=<true|false>`
- Valores válidos de `sort`: `name | email | orders | addresses | lastInteraction`
- Valores válidos de `dir`: `asc | desc`
- Valores válidos de `registered`: `true | false` (ausente = Todos)
- Parámetros inválidos → fallback silencioso (sin error 400)
- Ejemplos:
  - `/users` → última interacción DESC
  - `/users?sort=name&dir=asc` → nombre A→Z, nulls al final
  - `/users?sort=orders&dir=desc` → más pedidos primero
  - `/users?q=garcia&registered=true` → búsqueda "garcia" filtrando solo registrados
  - `/users?sort=name&dir=asc&q=carlos&registered=false` → combinado sort + filtros

---

## Barra de filtros — layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🔍 [Buscar por nombre o email...]      [Todos]  [Registrado]  [No registrado] │
└──────────────────────────────────────────────────────────────────────────────┘
```

Cuando hay filtros activos, se muestra una fila de chips debajo con los valores seleccionados y un botón "Limpiar todo":

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Filtros:  ["garcia" ✕]  [Registrado ✕]                      [Limpiar todo] │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Controles de filtro — especificación detallada

### 1. Search box (texto libre)

- **Placeholder**: `"Buscar por nombre o email..."`
- **Icono**: `Search` (lucide-react) a la izquierda del input
- **Comportamiento**: debounce de **300 ms** antes de actualizar la URL y lanzar la petición
- **Columnas que cubre** (OR lógico): `firstName`, `lastName`, `email`
- **Case-insensitive** (modo Prisma `insensitive`)
- **Limpiar**: aparece icono `X` en el extremo derecho del input cuando tiene contenido; al hacer clic, limpia el campo y elimina el param `q` de la URL
- **URL param**: `?q=<término>`

### 2. Filtro Registrado (control segmentado)

- **Opciones**: `[Todos]` / `[Registrado]` / `[No registrado]`
- **Selección única** (radio-style buttons, no multi-select)
- **Por defecto**: "Todos" activo (sin param `registered` en URL)
- **Comportamiento**: clic inmediato en un botón actualiza la URL (sin debounce, sin "Aplicar")
- **Visual activo**: botón con `bg-brand-teal/10 text-brand-teal` (coherente con `UserRegisteredBadge`)
- **Visual inactivo**: estilo estándar `border-input bg-background hover:bg-accent`
- **URL param**: `?registered=true` / `?registered=false` (ausente = Todos)

```
┌────────────────────────────────────────────────────────┐
│  [  Todos  ]  [  ✓ Registrado  ]  [  ✗ No registrado ] │
└────────────────────────────────────────────────────────┘
```

---

## URL y estado — esquema completo

### Parámetros completos (filtros + sort coexistiendo)

```
/users?q=garcia&registered=true&sort=orders&dir=desc
```

### Tabla de parámetros

| Param | Tipo | Valores válidos | Default | Notas |
|-------|------|-----------------|---------|-------|
| `q` | string | cualquier texto | — (sin filtro) | Vacío o ausente = sin búsqueda de texto |
| `registered` | string | `true \| false` | — (Todos) | Ausente = sin filtro de registro |
| `sort` | string | `name\|email\|orders\|addresses\|lastInteraction` | `lastInteraction` | Inválido → fallback silencioso |
| `dir` | string | `asc\|desc` | `desc` | Inválido → fallback silencioso |
| `page` | string | entero positivo | `1` | Reservado para paginación futura |
| `limit` | string | 1–100 | `50` | Reservado para paginación futura |

### Reglas de combinación

- `q` y `registered` se combinan con **AND** lógico (ambos deben cumplirse)
- Cambiar cualquier filtro **preserva** el sort activo (`sort` + `dir`)
- Cambiar el sort **preserva** los filtros activos (`q` + `registered`)
- Cualquier cambio de filtro resetea a `page=1` (implícito, sin UI de paginación activa)

### Ejemplos de URLs

```
/users                                          → sin filtros, lastInteraction DESC
/users?q=garcia                                 → usuarios con nombre o email "garcia"
/users?registered=true                          → solo usuarios registrados
/users?registered=false                         → solo usuarios no registrados
/users?q=carlos&registered=true                 → "carlos" entre los registrados
/users?sort=orders&dir=desc&registered=true     → registrados con más pedidos primero
/users?sort=name&dir=asc&q=carlos&registered=false → combinación completa
```

---

## Arquitectura de la solución

### Tipos compartidos (frontend)

Añadir en `apps/web-admin/src/types/api.ts`:

```typescript
// ─── Ordenación de usuarios ──────────────────────────────────────────────────

export type UserSortByColumn = 'name' | 'email' | 'orders' | 'addresses' | 'lastInteraction';

export const VALID_USER_SORT_COLUMNS: UserSortByColumn[] = [
  'name', 'email', 'orders', 'addresses', 'lastInteraction',
];

export const DEFAULT_USER_SORT: UserSortByColumn = 'lastInteraction';
export const DEFAULT_USER_DIR: SortDir = 'desc';

// ─── Filtros de usuarios ─────────────────────────────────────────────────────

export interface UsersFilters {
  q?: string;
  registered?: 'true' | 'false';
}

export const USER_REGISTERED_FILTER_LABELS = {
  true:  'Registrado',
  false: 'No registrado',
} as const;
```

---

### Capa frontend (`apps/web-admin`)

#### `app/users/page.tsx` — Server Component

**Cambio crítico: Next.js 15+ exige `await searchParams`** (es una `Promise`, no un objeto directo).

```typescript
export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string; dir?: string;
    q?: string; registered?: string;
  }>;
}) {
  const { sort, dir, q, registered } = await searchParams;

  // Validar y normalizar sort (patrón heredado de T01/T02)
  const sortBy: UserSortByColumn = VALID_USER_SORT_COLUMNS.includes(sort as UserSortByColumn)
    ? (sort as UserSortByColumn)
    : DEFAULT_USER_SORT;
  const sortDir: SortDir = dir === 'asc' || dir === 'desc' ? dir : DEFAULT_USER_DIR;

  // Parsear y validar filtros
  const filters: UsersFilters = {
    q: q?.trim() || undefined,
    registered: (registered === 'true' || registered === 'false') ? registered : undefined,
  };

  const { data: users, meta } = await getUsers(1, 50, sortBy, sortDir, filters);

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.total} usuario{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
        </p>
      </div>

      <UsersFilterBar
        initialQ={filters.q}
        initialRegistered={filters.registered}
        sortBy={sortBy}
        sortDir={sortDir}
      />

      {users.length === 0 ? (
        <UsersEmptyState hasFilters={Object.values(filters).some(Boolean)} />
      ) : (
        // ⚠️ Suspense requerido: UsersTable contiene UsersSortableColumnHeader
        // que usa useSearchParams(). Sin Suspense Next.js emite advertencia de build.
        <Suspense fallback={<div className="mt-4 rounded-lg border bg-card"><UsersTableSkeleton /></div>}>
          <div className="mt-4 rounded-lg border bg-card">
            <UsersTable users={users} sortBy={sortBy} sortDir={sortDir} />
          </div>
        </Suspense>
      )}
    </div>
  );
}
```

> ⚠️ `searchParams` como `Promise` es obligatorio en Next.js 15+. No usar `searchParams.sort` directamente sin `await`.

> ⚠️ **`Suspense` obligatorio**: `UsersTable` → `UsersSortableColumnHeader` usa `useSearchParams()`. En Next.js App Router, los componentes que usan `useSearchParams()` deben estar dentro de un `<Suspense>` para que Next.js pueda separar la parte SSR de la parte que necesita los search params del cliente. El fallback puede ser `<UsersTableSkeleton />` (componente de skeleton existente en `users-table-skeleton.tsx`) o un `null` simple. Sin el `<Suspense>`, el build producirá la advertencia: *"useSearchParams() should be wrapped in a suspense boundary"*.

> **Nota**: el subtítulo cambia de "Usuarios que han interactuado con Adresles" a mostrar el `meta.total` dinámico para dar feedback inmediato del número de resultados filtrados.

---

#### `components/users/users-table.tsx` — Convertir a Client Component

```typescript
'use client';

interface UsersTableProps {
  users: AdminUser[];
  sortBy: UserSortByColumn;
  sortDir: SortDir;
}

export function UsersTable({ users, sortBy, sortDir }: UsersTableProps) {
  // Encabezados ordenables usan UsersSortableColumnHeader
  // Encabezados no ordenables (Teléfono, Registrado) quedan como <TableHead> simples
}
```

- Usar `UsersSortableColumnHeader` para: Nombre, Email, Pedidos, Direcciones, Última interacción
- Teléfono y Registrado permanecen como `<TableHead>` simples sin icono ni área clicable
- El `<th>` padre de cada columna ordenable incluye `aria-sort={isActive ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'}`

---

#### `components/users/users-sortable-column-header.tsx` — NUEVO Client Component

```typescript
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import type { UserSortByColumn, SortDir } from '@/types/api';

interface UsersSortableColumnHeaderProps {
  column: UserSortByColumn;
  label: string;
  currentSort: UserSortByColumn;
  currentDir: SortDir;
}

export function UsersSortableColumnHeader({
  column, label, currentSort, currentDir,
}: UsersSortableColumnHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = column === currentSort;
  const nextDir: SortDir = isActive && currentDir === 'asc' ? 'desc' : 'asc';

  const handleClick = () => {
    // Construir nueva URL preservando filtros activos (q, registered)
    const params = new URLSearchParams();
    params.set('sort', column);
    params.set('dir', nextDir);
    const q = searchParams.get('q');
    const registered = searchParams.get('registered');
    if (q) params.set('q', q);
    if (registered) params.set('registered', registered);
    router.push(`${pathname}?${params.toString()}`);
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

> La incorporación de `useSearchParams()` desde el inicio evita la regresión W1 detectada en T02 (donde `SortableColumnHeader` perdía los filtros activos al cambiar la ordenación). Esta corrección se aplica preventivamente.

---

#### `components/users/users-filter-bar.tsx` — NUEVO Client Component

Este es el componente central de filtros. Gestiona la URL de forma coordinada entre todos los controles.

```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useState, useRef } from 'react';
import type { UserSortByColumn, SortDir } from '@/types/api';

interface UsersFilterBarProps {
  initialQ?: string;
  initialRegistered?: 'true' | 'false';
  sortBy: UserSortByColumn;
  sortDir: SortDir;
}

export function UsersFilterBar({
  initialQ, initialRegistered, sortBy, sortDir,
}: UsersFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Estado local del search (único control con debounce)
  const [searchValue, setSearchValue] = useState(initialQ ?? '');

  // Función utilitaria: construye la URL preservando TODOS los params activos
  const buildUrl = useCallback((overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();

    // Preservar sort siempre
    params.set('sort', sortBy);
    params.set('dir', sortDir);

    // Mezclar valores actuales con overrides
    const merged = {
      q:          initialQ,
      registered: initialRegistered,
      ...overrides,
    };

    if (merged.q)          params.set('q', merged.q);
    if (merged.registered) params.set('registered', merged.registered);

    return `${pathname}?${params.toString()}`;
  }, [pathname, sortBy, sortDir, initialQ, initialRegistered]);

  // Search con debounce 300ms
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ q: value.trim() || undefined }));
    }, 300);
  };

  // Toggle del filtro registered (inmediato, sin debounce)
  const handleRegisteredChange = (value: 'true' | 'false' | undefined) => {
    router.push(buildUrl({ registered: value }));
  };

  // Limpiar todo
  const handleClearAll = () => {
    router.push(`${pathname}?sort=${sortBy}&dir=${sortDir}`);
  };

  const hasActiveFilters = !!(initialQ || initialRegistered);

  return (
    <div className="mb-4 space-y-3">
      {/* Fila de controles */}
      <div className="flex items-center gap-3">
        <UsersSearchInput value={searchValue} onChange={handleSearchChange} />
        <UsersRegisteredFilter
          selected={initialRegistered}
          onChange={handleRegisteredChange}
        />
      </div>

      {/* Chips de filtros activos */}
      {hasActiveFilters && (
        <UsersActiveFilterChips
          q={initialQ}
          registered={initialRegistered}
          onRemoveQ={() => router.push(buildUrl({ q: undefined }))}
          onRemoveRegistered={() => router.push(buildUrl({ registered: undefined }))}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
```

---

#### `components/users/users-search-input.tsx` — sub-componente

Mismo patrón que `orders-search-input.tsx`, adaptado para usuarios:

```typescript
'use client';

import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function UsersSearchInput({ value, onChange }: Props) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar por nombre o email..."
        className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
        aria-label="Buscar usuarios"
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

#### `components/users/users-registered-filter.tsx` — sub-componente

Control segmentado de selección única para el filtro de registro. Diferente a los dropdowns multi-select de T02 porque el estado de registro es un booleano binario (solo 3 estados posibles: todos / sí / no).

```typescript
'use client';

import { cn } from '@/lib/utils';

interface Props {
  selected?: 'true' | 'false';
  onChange: (value: 'true' | 'false' | undefined) => void;
}

const OPTIONS = [
  { value: undefined,         label: 'Todos' },
  { value: 'true'  as const,  label: 'Registrado' },
  { value: 'false' as const,  label: 'No registrado' },
] as const;

export function UsersRegisteredFilter({ selected, onChange }: Props) {
  return (
    <div
      className="flex items-center rounded-md border border-input overflow-hidden"
      role="group"
      aria-label="Filtrar por estado de registro"
    >
      {OPTIONS.map((opt) => {
        const isActive = selected === opt.value;
        return (
          <button
            key={String(opt.value ?? 'all')}
            onClick={() => onChange(opt.value)}
            className={cn(
              'h-9 px-3 text-sm font-medium transition-colors border-r border-input last:border-r-0',
              isActive
                ? 'bg-brand-teal/10 text-brand-teal'
                : 'bg-background text-foreground hover:bg-accent',
            )}
            aria-pressed={isActive}
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

#### `components/users/users-active-filter-chips.tsx` — sub-componente

```typescript
'use client';

import { X } from 'lucide-react';
import { USER_REGISTERED_FILTER_LABELS } from '@/types/api';

interface Props {
  q?: string;
  registered?: 'true' | 'false';
  onRemoveQ: () => void;
  onRemoveRegistered: () => void;
  onClearAll: () => void;
}

export function UsersActiveFilterChips({
  q, registered, onRemoveQ, onRemoveRegistered, onClearAll,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Filtros activos">
      {q && (
        <FilterChip label={`"${q}"`} onRemove={onRemoveQ} />
      )}
      {registered && (
        <FilterChip
          label={USER_REGISTERED_FILTER_LABELS[registered]}
          onRemove={onRemoveRegistered}
        />
      )}
      <button
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1"
      >
        Limpiar todo
      </button>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-brand-teal/30 bg-brand-teal/10 px-2.5 py-0.5 text-xs font-medium text-brand-teal">
      {label}
      <button onClick={onRemove} aria-label={`Eliminar filtro ${label}`} className="hover:text-brand-teal/60">
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  );
}
```

---

#### `components/users/users-empty-state.tsx` — modificar para soporte filtros

Añadir prop `hasFilters` para mostrar un mensaje diferente cuando el vacío es consecuencia de los filtros:

```typescript
import { Users } from 'lucide-react';

interface Props {
  hasFilters?: boolean;
}

export function UsersEmptyState({ hasFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      <h3 className="text-lg font-medium text-foreground mb-1">
        {hasFilters ? 'Sin resultados' : 'Sin usuarios todavía'}
      </h3>
      <p className="text-sm text-muted-foreground">
        {hasFilters
          ? 'Prueba a ajustar o limpiar los filtros activos.'
          : 'Los usuarios aparecerán aquí cuando interactúen con Adresles.'}
      </p>
    </div>
  );
}
```

---

#### `lib/api.ts` — extender `getUsers()`

```typescript
export const getUsers = (
  page = 1,
  limit = 50,
  sortBy?: UserSortByColumn,
  sortDir?: SortDir,
  filters?: UsersFilters,
): Promise<UsersResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortBy)              params.set('sortBy', sortBy);
  if (sortDir)             params.set('sortDir', sortDir);
  if (filters?.q)          params.set('q', filters.q);
  if (filters?.registered) params.set('registered', filters.registered);
  return apiFetch(`/api/admin/users?${params.toString()}`);
};
```

---

### Capa backend (`apps/api`)

#### `admin.controller.ts` — añadir `UsersQuery` DTO

Siguiendo el patrón DTO existente de `OrdersQuery`:

```typescript
class UsersQuery extends PaginationQuery {
  @IsOptional()
  @IsIn(['name', 'email', 'orders', 'addresses', 'lastInteraction'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  registered?: string;
}

@Get('users')
getUsers(@Query() query: UsersQuery) {
  const page  = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '50', 10) || 50));
  return this.adminService.getUsers(page, limit, {
    sortBy:     query.sortBy,
    sortDir:    query.sortDir,
    q:          query.q?.trim() || undefined,
    registered: query.registered,
  });
}
```

> `PaginationQuery` sigue siendo la base tanto para `OrdersQuery` como para `UsersQuery`.

---

#### `admin.service.ts` — añadir `GetUsersParams`, `buildUsersOrderBy()` y `buildUsersWhere()`

```typescript
export interface GetUsersParams {
  sortBy?: string;
  sortDir?: string;
  q?: string;
  registered?: string;  // 'true' | 'false' | undefined
}

private readonly validUserSortColumns = [
  'name', 'email', 'orders', 'addresses', 'lastInteraction',
];

async getUsers(page: number, limit: number, params: GetUsersParams = {}) {
  const skip = (page - 1) * limit;

  const isValidSort =
    params.sortBy !== undefined &&
    this.validUserSortColumns.includes(params.sortBy);
  const resolvedSort = isValidSort ? params.sortBy! : 'lastInteraction';
  const dir: 'asc' | 'desc' = isValidSort
    ? (params.sortDir === 'asc' ? 'asc' : 'desc')
    : 'desc';

  const orderBy = this.buildUsersOrderBy(resolvedSort, dir);
  const where   = this.buildUsersWhere(params);

  const [data, total] = await this.prisma.$transaction([
    this.prisma.user.findMany({
      where,
      include: {
        phone: true,
        _count: { select: { orders: true, addresses: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    this.prisma.user.count({ where }),  // ← count también filtra
  ]);

  return { data, meta: { page, limit, total } };
}

private buildUsersOrderBy(sortBy: string, dir: 'asc' | 'desc') {
  const nullsLast = { sort: dir, nulls: 'last' as const };

  switch (sortBy) {
    case 'name':
      return [{ firstName: nullsLast }, { lastName: nullsLast }];
    case 'email':
      return [{ email: nullsLast }];
    case 'orders':
      return [{ orders: { _count: dir } }];
    case 'addresses':
      return [{ addresses: { _count: dir } }];
    case 'lastInteraction':
    default:
      return [{ lastInteractionAt: nullsLast }];
  }
}

private buildUsersWhere(params: GetUsersParams): Prisma.UserWhereInput {
  // isDeleted: false siempre como condición base (igual que getUsers original)
  const conditions: Prisma.UserWhereInput[] = [{ isDeleted: false }];

  if (params.q && params.q.trim()) {
    const q = params.q.trim();
    conditions.push({
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName:  { contains: q, mode: 'insensitive' } },
        { email:     { contains: q, mode: 'insensitive' } },
      ],
    });
  }

  if (params.registered === 'true') {
    conditions.push({ isRegistered: true });
  } else if (params.registered === 'false') {
    conditions.push({ isRegistered: false });
  }

  return { AND: conditions };
}
```

> **Importante**: `prisma.user.count({ where })` usa el mismo `where` que `findMany`, garantizando que `meta.total` refleja siempre el count filtrado.

> **`isDeleted: false` como condición base**: `buildUsersWhere` siempre incluye `{ isDeleted: false }` como primer elemento del array `AND`, preservando el filtro de usuarios no eliminados del comportamiento original.

---

## Criterios de aceptación

### Funcionalidad — ordenación

- [ ] Al entrar en `/users` sin params, los usuarios están ordenados por Última interacción DESC
- [ ] Al hacer clic en "Nombre", ordena por `firstName` → `lastName`, nulls al final
- [ ] Al hacer clic en "Email", ordena por `email`, nulls al final
- [ ] Al hacer clic en "Pedidos", ordena por conteo de pedidos del usuario
- [ ] Al hacer clic en "Direcciones", ordena por conteo de direcciones del usuario
- [ ] Al hacer clic en "Última interacción", ordena por `lastInteractionAt`, nulls al final
- [ ] Hacer clic en una columna activa alterna `asc` ↔ `desc`
- [ ] Los params de sort persisten en la URL y sobreviven a recargar la página
- [ ] `?sort=invalido&dir=invalido` → silenciosamente usa `lastInteraction desc`

### Visual / UX — ordenación

- [ ] Teléfono y Registrado no muestran icono de sort ni área clicable
- [ ] Columna activa muestra `ChevronUp` (asc) o `ChevronDown` (desc) en color `foreground`
- [ ] Columnas inactivas ordenables muestran `ChevronsUpDown` en color `muted-foreground/50`
- [ ] El `<th>` de la columna activa incluye `aria-sort="ascending"` o `aria-sort="descending"`
- [ ] El `<th>` de columnas inactivas ordenables incluye `aria-sort="none"`
- [ ] El botón tiene `aria-label` descriptivo: `"Ordenar por Nombre ascendente"`

### Filtros — search box

- [ ] El input busca en `firstName`, `lastName` y `email` (OR lógico)
- [ ] La búsqueda es case-insensitive
- [ ] La URL se actualiza con `?q=<término>` después de un debounce de 300 ms
- [ ] El icono ✕ aparece cuando hay texto; al pulsarlo limpia el campo y elimina `q` de la URL
- [ ] Buscar "garcia" devuelve usuarios con `firstName="García"`, `lastName="Garcia"` o `email="garcia@..."`

### Filtros — botones Registrado

- [ ] Los tres botones `[Todos]` / `[Registrado]` / `[No registrado]` se muestran en la barra de filtros
- [ ] "Todos" activo por defecto cuando no hay param `registered` en URL
- [ ] Clic en "Registrado" actualiza URL a `?registered=true` e inmediatamente filtra la tabla
- [ ] Clic en "No registrado" actualiza URL a `?registered=false` e inmediatamente filtra la tabla
- [ ] Clic en "Todos" elimina `registered` de la URL
- [ ] El botón activo muestra estilo diferenciado (`bg-brand-teal/10 text-brand-teal`)
- [ ] `?registered=invalido` → se ignora silenciosamente (equivale a "Todos", sin error 400)

### Integración filtros + sort

- [ ] Cambiar el sort preserva `q` y `registered` activos en la URL
- [ ] Cambiar cualquier filtro preserva `sort` y `dir` activos en la URL
- [ ] Combinar `q` + `registered` + `sort` produce la consulta SQL correcta (AND entre filtros)
- [ ] El `meta.total` en la respuesta refleja el número de usuarios filtrados
- [ ] El subtítulo de la página muestra "N usuario(s) encontrado(s)"

### Chips de filtros activos

- [ ] Los chips solo aparecen cuando hay ≥1 filtro activo
- [ ] Chip de texto muestra el término entre comillas: `"garcia"`
- [ ] Chip de registro muestra la etiqueta legible: `Registrado` o `No registrado`
- [ ] El ✕ de un chip elimina ese filtro específico preservando los demás
- [ ] "Limpiar todo" elimina todos los filtros pero preserva el sort activo

### Estado vacío con filtros

- [ ] Si los filtros no devuelven resultados: "Sin resultados / Prueba a ajustar o limpiar los filtros activos."
- [ ] Sin filtros y sin usuarios: "Sin usuarios todavía / Los usuarios aparecerán aquí cuando interactúen con Adresles."

### Build / compilación

- [ ] `tsc --noEmit` sin errores en `apps/web-admin`
- [ ] El build de Next.js no emite la advertencia `"useSearchParams() should be wrapped in a suspense boundary"` (la sección de tabla está envuelta en `<Suspense>`)
- [ ] Los 40+ tests existentes de `admin.service.spec.ts` y `admin.controller.spec.ts` siguen pasando tras refactorizar la firma de `getUsers`

### Accesibilidad

- [ ] El input de búsqueda tiene `aria-label="Buscar usuarios"`
- [ ] El control segmentado tiene `role="group"` + `aria-label="Filtrar por estado de registro"`
- [ ] Cada botón del control segmentado tiene `aria-pressed={isActive}`
- [ ] Los chips activos tienen `aria-label="Filtros activos"` en su contenedor
- [ ] Todos los botones de sort tienen `aria-label` descriptivo

### Backend

- [ ] `GET /api/admin/users?sortBy=name&sortDir=asc` devuelve usuarios ordenados por nombre, nulls al final
- [ ] `GET /api/admin/users?sortBy=orders&sortDir=desc` devuelve usuarios con más pedidos primero
- [ ] `GET /api/admin/users?sortBy=email&sortDir=asc` ordena por email, nulls al final
- [ ] `GET /api/admin/users` (sin params) equivale a `sortBy=lastInteraction&sortDir=desc`
- [ ] `sortBy` inválido → fallback a `lastInteraction desc` (no error 400)
- [ ] `GET /api/admin/users?q=garcia` filtra en `firstName`, `lastName` y `email` (OR, insensitive)
- [ ] `GET /api/admin/users?registered=true` devuelve solo usuarios con `isRegistered=true`
- [ ] `GET /api/admin/users?registered=false` devuelve solo usuarios con `isRegistered=false`
- [ ] `GET /api/admin/users?q=garcia&registered=true` aplica ambos filtros con AND
- [ ] `?registered=invalido` → se ignora silenciosamente (no error 400)
- [ ] `isDeleted: false` siempre presente en el `where` (condición base invariable)
- [ ] `meta.total` refleja el count filtrado, no el total global
- [ ] Tests unitarios en `admin.service.spec.ts` cubren `buildUsersOrderBy`: 5 columnas × 2 direcciones + fallback a `lastInteraction`
- [ ] Tests unitarios en `admin.service.spec.ts` cubren `buildUsersWhere`: q OR, registered=true, registered=false, combinación AND, condición base `isDeleted: false`, valor `registered` inválido ignorado
- [ ] Tests de integración en `admin.controller.spec.ts` verifican que `adminService.getUsers` se llama con los params correctos para `?sortBy=name&sortDir=asc`, `?q=garcia`, `?registered=true`

---

## Archivos a crear o modificar

| Archivo | Operación | Detalle |
|---------|-----------|---------|
| `apps/web-admin/src/types/api.ts` | Modificar | Añadir `UserSortByColumn`, `VALID_USER_SORT_COLUMNS`, `DEFAULT_USER_SORT`, `DEFAULT_USER_DIR`, `UsersFilters`, `USER_REGISTERED_FILTER_LABELS` |
| `apps/web-admin/src/lib/api.ts` | Modificar | `getUsers()` acepta `sortBy?`, `sortDir?`, `filters?: UsersFilters`; construye query string completo con `URLSearchParams` |
| `apps/web-admin/src/app/users/page.tsx` | Modificar | Firma con `searchParams: Promise<{...}>`, `await searchParams`, validación allowlist, subtítulo dinámico con `meta.total`, integrar `UsersFilterBar`, `<Suspense>` alrededor de `UsersTable`, pasar `hasFilters` a `UsersEmptyState` |
| `apps/web-admin/src/components/users/users-table.tsx` | Modificar | `'use client'`, props `sortBy: UserSortByColumn` / `sortDir: SortDir`, usar `UsersSortableColumnHeader` en 5 columnas ordenables, `aria-sort` en `<th>` |
| `apps/web-admin/src/components/users/users-sortable-column-header.tsx` | **Crear** | Client Component con `useRouter` + `usePathname` + `useSearchParams` (preserva `q` y `registered` al cambiar sort desde el inicio), iconos, `aria-label` |
| `apps/web-admin/src/components/users/users-filter-bar.tsx` | **Crear** | Client Component coordinador: `buildUrl` (único punto de mutación de URL), debounce 300ms en search, toggle inmediato en registered, chips de filtros activos |
| `apps/web-admin/src/components/users/users-search-input.tsx` | **Crear** | Input con icono `Search`, botón `X` cuando hay contenido, `aria-label="Buscar usuarios"` |
| `apps/web-admin/src/components/users/users-registered-filter.tsx` | **Crear** | Control segmentado [Todos] / [Registrado] / [No registrado] con `role="group"`, `aria-pressed` en cada botón |
| `apps/web-admin/src/components/users/users-active-filter-chips.tsx` | **Crear** | Chips `brand-teal` con ✕ individual y botón "Limpiar todo" |
| `apps/web-admin/src/components/users/users-empty-state.tsx` | Modificar | Añadir prop `hasFilters?: boolean`; mensaje alternativo cuando hay filtros activos |
| `apps/api/src/admin/admin.controller.ts` | Modificar | Nuevo DTO `UsersQuery` extendiendo `PaginationQuery` con `sortBy`, `sortDir`, `q`, `registered`; refactorizar endpoint `getUsers` para pasar objeto params |
| `apps/api/src/admin/admin.service.ts` | Modificar | Exportar `GetUsersParams`; refactorizar firma de `getUsers(page, limit, params)`; añadir `validUserSortColumns`, `buildUsersOrderBy()`, `buildUsersWhere()` con `isDeleted: false` como condición base |
| `apps/api/src/admin/admin.service.spec.ts` | Modificar | Tests de `buildUsersOrderBy`: 5 columnas × 2 direcciones + fallback; tests de `buildUsersWhere`: q, registered, combinación, base isDeleted, valor inválido ignorado |
| `apps/api/src/admin/admin.controller.spec.ts` | Modificar | Actualizar tests existentes (nueva firma de `getUsers` con objeto params); añadir tests con `?sortBy=name`, `?q=garcia`, `?registered=true` |

---

## Requisitos no funcionales

- **Accesibilidad WCAG 2.1 AA**: `aria-sort` en `<th>`, `aria-label` en todos los botones interactivos, `role="group"` + `aria-pressed` en el control segmentado, navegación por teclado (`focus-visible`)
- **TypeScript strict**: `UserSortByColumn` y `UsersFilters` en `types/api.ts`; no usar `string` suelto para tipos con dominio conocido; `Prisma.UserWhereInput` para el objeto `where`
- **Next.js 15+ compat**: `searchParams` como `Promise` en la firma del page — obligatorio en Next.js 15/16
- **`Suspense` boundary para `useSearchParams()`**: `UsersSortableColumnHeader` usa el hook `useSearchParams()`. En Next.js App Router, cualquier Client Component que use `useSearchParams()` debe estar envuelto en un `<Suspense>` explícito para evitar la advertencia de build y controlar el fallback durante SSR. En `UsersPage` (Server Component), envolver la sección de tabla en un `<Suspense fallback={<UsersTableSkeleton />}>` (o un fallback genérico de carga). Esto es consistente con el comportamiento del `loading.tsx` de la ruta.
- **Sin regresión**: `getOrders` y su tabla no se ven afectados; el comportamiento original de `getUsers` (sin params) es idéntico al actual
- **Lección W1 incorporada desde el inicio**: `UsersSortableColumnHeader` usa `useSearchParams()` para preservar filtros al cambiar el sort, evitando la regresión detectada en T02
- **Patrón DTO existente**: `UsersQuery` sigue exactamente el mismo patrón que `OrdersQuery` con `class-validator`
- **`isDeleted: false` invariable**: `buildUsersWhere` siempre incluye esta condición base, igual que el `getUsers` original

---

## Documentación a actualizar post-implementación

### `openspec/specs/admin-dashboard/spec.md`

Ampliar la sección **"Requirement: Vista de usuarios con badge registrado/no registrado"** con:

- Añadir columna "Ordenable" a la tabla de columnas (Nombre ✅, Email ✅, Pedidos ✅, Direcciones ✅, Última interacción ✅, Teléfono ✗, Registrado ✗)
- Cambiar "Ordenación: por `lastInteractionAt` descendente" → "Ordenación: dinámica vía query params `?sort=<columna>&dir=<asc|desc>`. Por defecto: `lastInteraction DESC`."
- Añadir frase "Filtros: la tabla SHALL ir precedida de la barra de filtros `UsersFilterBar`. Ver spec `users-sorting-filters` para los requisitos completos."
- Cambiar subtítulo fijo → "Subtítulo de la página: SHALL mostrar `'N usuario(s) encontrado(s)'` donde N es `meta.total` (total filtrado devuelto por la API)."
- Añadir escenarios: estado vacío con filtros activos, subtítulo con conteo filtrado, barra de filtros precede a la tabla
- Actualizar la entrada `users-table.tsx` en la estructura de archivos: de `Server Component` → `'use client'`
- Añadir a la estructura de archivos los nuevos componentes en `components/users/`: `users-sortable-column-header.tsx`, `users-filter-bar.tsx`, `users-search-input.tsx`, `users-registered-filter.tsx`, `users-active-filter-chips.tsx`

### `openspec/specs/admin-api/spec.md`

Ampliar la sección **"Requirement: Listar usuarios con conteos"** con:

- Sustituir "El endpoint SHALL aceptar los mismos parámetros de paginación que `/api/admin/orders`" por la tabla completa de query params:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | entero ≥ 1 | Página (defecto: 1) |
| `limit` | entero 1–100 | Tamaño de página (defecto: 50) |
| `sortBy` | `name\|email\|orders\|addresses\|lastInteraction` | Columna de ordenación (defecto: `lastInteraction`) |
| `sortDir` | `asc\|desc` | Dirección (defecto: `desc`) |
| `q` | string | Búsqueda libre en `firstName`, `lastName`, `email` (case-insensitive, OR) |
| `registered` | `true\|false` | Filtrar por `isRegistered`. Ausente = todos |

- Añadir: `meta.total` refleja siempre el número de usuarios que cumplen los filtros activos (no el total global).
- Documentar `buildUsersWhere(params)` (método privado análogo a `buildWhere`) con: condición base `isDeleted: false`, búsqueda OR en 3 columnas, filtro por `isRegistered`.
- Añadir escenarios: sortBy con nulls-last en name/email, ordenación por conteo de relación (orders/addresses), filtro q OR en 3 columnas, registered=true/false, combinación AND, meta.total filtrado.

### `openspec/specs/users-sorting-filters/spec.md` — NUEVO

Crear un nuevo spec análogo a `orders-column-sorting/spec.md` y `orders-filters/spec.md` unificados para usuarios. Debe cubrir:
- Columnas ordenables con sus campos Prisma y semántica de `nulls: 'last'`
- Ordenación por `_count` de relaciones (`orders`, `addresses`)
- Filtros: search box (debounce, OR en 3 columnas), control segmentado Registrado (3 estados)
- URL schema completo con tabla de parámetros
- Reglas de combinación filtros + sort
- `buildUsersOrderBy` y `buildUsersWhere` como contratos del servicio

### `memory-bank/sessions/` — nota de sesión post-implementación

Crear `memory-bank/sessions/YYYY-MM-DD-t03-users-sorting-filters.md` siguiendo la estructura de `2026-02-25-t02-orders-filters.md`:
- Resumen de lo completado (backend + frontend)
- Decisiones técnicas relevantes con motivo
- Archivos modificados/creados (árbol)
- Tests: nº de tests que pasan

---

## Out of scope

- Filtro por rango de fechas de registro (podría ser un T04 si se necesita)
- Filtro por número mínimo/máximo de pedidos (rango numérico)
- Paginación con controles UI (ticket posterior)
- Exportar usuarios filtrados a CSV
- Guardado de filtros favoritos / vistas guardadas
- Ordenación en otras tablas del dashboard
