# T02 — Filtros y búsqueda en la página de Pedidos

**App**: `apps/web-admin` (Dashboard Admin — Next.js 16) + `apps/api` (NestJS — AdminModule)  
**Estado**: Enriquecido ✅ — listo para `/opsx-ff t02-orders-filters`  
**Fecha**: 2026-02-25  
**Prerrequisito**: T01 completado ✅ (ordenación server-side operativa)

---

## Historia de Usuario

**Como** administrador del Dashboard Admin,  
**quiero** poder filtrar y buscar pedidos por Estado, Modo, texto libre (tienda/referencia/usuario) y rango de fechas,  
**para** localizar rápidamente pedidos concretos en tablas con muchos registros sin perder el contexto de ordenación activo.

---

## Descripción funcional

La página `/orders` añade una barra de filtros encima de la tabla. Todos los filtros son **server-side**: el estado persiste en la URL como query params y el servidor devuelve solo los pedidos que cumplen los criterios. Los filtros y el sort de T01 **coexisten** sin interferirse: cambiar un filtro preserva el sort activo, y cambiar el sort preserva los filtros activos.

### Barra de filtros — layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🔍 [Buscar por tienda, referencia o usuario...]  [Estado ▾]  [Modo ▾]  [📅 Fecha ▾]  │
└──────────────────────────────────────────────────────────────────────────────┘
```

Cuando hay filtros activos, se muestra una fila de chips debajo con los valores seleccionados y un botón "Limpiar todo":

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Filtros:  [● Dir. pendiente ✕]  [● Completado ✕]  [Adresles ✕]  [1–25 Feb ✕]   [Limpiar todo] │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Controles de filtro — especificación detallada

### 1. Search box (texto libre)

- **Placeholder**: `"Buscar por tienda, referencia o usuario..."`
- **Icono**: `Search` (lucide-react) a la izquierda del input
- **Comportamiento**: debounce de **300 ms** antes de actualizar la URL y lanzar la petición al servidor
- **Columnas que cubre** (OR lógico): `store.name`, `externalOrderNumber`, `user.firstName`, `user.lastName`
- **Case-insensitive** (modo Prisma `insensitive`)
- **Limpiar**: aparece icono `X` en el extremo derecho del input cuando tiene contenido; al hacer clic, limpia el campo y elimina el param `q` de la URL
- **URL param**: `?q=<término>`

### 2. Filtro Estado (multi-select dropdown)

- **Trigger**: botón `[Estado ▾]`; cuando hay ≥1 selección muestra badge con el conteo: `[Estado (2) ▾]`
- **Contenido del popover**: lista de checkboxes con todos los valores de `OrderStatus`, cada uno con el color de su badge:

| Checkbox label | Valor enum | Color indicador |
|---|---|---|
| Pago pendiente | `PENDING_PAYMENT` | gris |
| Dirección pendiente | `PENDING_ADDRESS` | lima |
| Listo | `READY_TO_PROCESS` | teal |
| Completado | `COMPLETED` | verde |
| Cancelado | `CANCELED` | rojo |

- **Comportamiento**: cada checkbox toggle actualiza la URL inmediatamente (sin botón "Aplicar")
- **URL param**: `?status=PENDING_ADDRESS,COMPLETED` (comma-separated, múltiples valores)

```
┌──────────────────────────┐
│  □  Pago pendiente       │
│  ☑  Dirección pendiente  │
│  □  Listo                │
│  ☑  Completado           │
│  □  Cancelado            │
└──────────────────────────┘
```

### 3. Filtro Modo (multi-select dropdown)

- Mismo patrón que Estado, con los valores de `OrderMode`:

| Checkbox label | Valor enum |
|---|---|
| Adresles | `ADRESLES` |
| Tradicional | `TRADITIONAL` |

- **URL param**: `?mode=ADRESLES,TRADITIONAL`

### 4. Date Range Picker (rango de fechas)

- **Trigger**: botón `[📅 Fecha ▾]`; cuando hay rango activo muestra el rango: `[📅 1 Feb – 25 Feb]`
- **Contenido del popover**: dos `<input type="date">` nativos etiquetados "Desde" y "Hasta"
- **Comportamiento**:
  - Los dos campos son independientes (se puede especificar solo "Desde" o solo "Hasta")
  - El botón **"Aplicar"** confirma el rango y cierra el popover → actualiza URL
  - El botón **"Limpiar"** limpia ambos campos y elimina `from`/`to` de la URL → cierra el popover
  - Al aplicar, `to` incluye el día completo (hasta `23:59:59.999` en el backend)
- **URL params**: `?from=2026-02-01&to=2026-02-25` (formato `YYYY-MM-DD`)
- **Implementación**: Shadcn `Popover` + `<input type="date">` nativo — sin dependencias extra

```
┌──────────────────────────────┐
│  Desde   [  2026-02-01  ]    │
│  Hasta   [  2026-02-25  ]    │
│                              │
│  [Limpiar]       [Aplicar]   │
└──────────────────────────────┘
```

---

## URL y estado — esquema completo

### Parámetros completos (filtros + sort coexistiendo)

```
/orders?q=zara&status=PENDING_ADDRESS,COMPLETED&mode=ADRESLES&from=2026-02-01&to=2026-02-25&sort=date&dir=desc
```

### Tabla de parámetros

| Param | Tipo | Valores válidos | Default | Notas |
|-------|------|-----------------|---------|-------|
| `q` | string | cualquier texto | — (sin filtro) | Vacío o ausente = sin búsqueda de texto |
| `status` | string | CSV de `OrderStatus` | — (todos) | Valores inválidos se ignoran silenciosamente |
| `mode` | string | CSV de `OrderMode` | — (todos) | Igual |
| `from` | string | `YYYY-MM-DD` | — | Fecha inicio del rango (inclusiva) |
| `to` | string | `YYYY-MM-DD` | — | Fecha fin del rango (inclusiva hasta 23:59:59) |
| `sort` | string | `ref\|store\|user\|amount\|date` | `date` | Heredado de T01 |
| `dir` | string | `asc\|desc` | `desc` | Heredado de T01 |
| `page` | string | entero positivo | `1` | Reservado para paginación futura |
| `limit` | string | 1–100 | `50` | Reservado para paginación futura |

### Reglas de combinación

- Filtros entre sí: **AND** lógico (se aplican todos simultáneamente)
- Dentro de `status` multi-valor: **OR** lógico (`PENDING_ADDRESS` OR `COMPLETED`)
- `q` con `status`/`mode`: los resultados de texto deben además cumplir los filtros discretos
- Cambiar cualquier filtro **preserva** el sort activo (`sort` + `dir`)
- Cambiar el sort **preserva** los filtros activos
- Cualquier cambio de filtro resetea a `page=1` (implícito, sin UI de paginación por ahora)

### Ejemplos de URLs

```
/orders                                         → sin filtros, date DESC
/orders?q=zara                                  → pedidos de tienda/referencia/usuario "zara"
/orders?status=PENDING_ADDRESS                  → solo "Dirección pendiente"
/orders?status=COMPLETED,CANCELED               → completados O cancelados
/orders?mode=ADRESLES&sort=amount&dir=desc      → modo Adresles, por importe mayor primero
/orders?from=2026-02-01&to=2026-02-28           → pedidos de febrero 2026
/orders?q=garcia&status=COMPLETED&from=2026-01-01  → búsqueda combinada con filtros
```

---

## Arquitectura de la solución

### Tipos compartidos (frontend)

Añadir en `apps/web-admin/src/types/api.ts`:

```typescript
// ─── Filtros de pedidos ─────────────────────────────────────────────────────

export interface OrdersFilters {
  q?: string;
  status?: OrderStatus[];
  mode?: OrderMode[];
  from?: string;  // YYYY-MM-DD
  to?: string;    // YYYY-MM-DD
}

export const VALID_ORDER_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT',
  'PENDING_ADDRESS',
  'READY_TO_PROCESS',
  'COMPLETED',
  'CANCELED',
];

export const VALID_ORDER_MODES: OrderMode[] = ['ADRESLES', 'TRADITIONAL'];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT:  'Pago pendiente',
  PENDING_ADDRESS:  'Dirección pendiente',
  READY_TO_PROCESS: 'Listo',
  COMPLETED:        'Completado',
  CANCELED:         'Cancelado',
};

export const ORDER_MODE_LABELS: Record<OrderMode, string> = {
  ADRESLES:    'Adresles',
  TRADITIONAL: 'Tradicional',
};
```

---

### Capa frontend (`apps/web-admin`)

#### `app/orders/page.tsx` — ampliar lectura de searchParams

```typescript
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    sort?: string; dir?: string;
    q?: string; status?: string; mode?: string;
    from?: string; to?: string;
  }>;
}) {
  const { sort, dir, q, status, mode, from, to } = await searchParams;

  // Validar sort (patrón heredado de T01)
  const isValidSort = VALID_SORT_COLUMNS.includes(sort as SortByColumn);
  const sortBy: SortByColumn = isValidSort ? (sort as SortByColumn) : DEFAULT_SORT;
  const sortDir: SortDir = isValidSort
    ? (dir === 'asc' || dir === 'desc' ? dir : DEFAULT_DIR)
    : DEFAULT_DIR;

  // Parsear y validar filtros (valores inválidos ignorados silenciosamente)
  const filters: OrdersFilters = {
    q: q?.trim() || undefined,
    status: status
      ? (status.split(',').filter(s => VALID_ORDER_STATUSES.includes(s as OrderStatus)) as OrderStatus[])
      : undefined,
    mode: mode
      ? (mode.split(',').filter(m => VALID_ORDER_MODES.includes(m as OrderMode)) as OrderMode[])
      : undefined,
    from: from || undefined,
    to: to || undefined,
  };

  const { data: orders, meta } = await getOrders(1, 50, sortBy, sortDir, filters);

  return (
    <div className="px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.total} pedido{meta.total !== 1 ? 's' : ''} encontrado{meta.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* FilterBar recibe los valores actuales como props para inicializar sus controles */}
      <OrdersFilterBar
        initialQ={filters.q}
        initialStatus={filters.status}
        initialMode={filters.mode}
        initialFrom={filters.from}
        initialTo={filters.to}
        sortBy={sortBy}
        sortDir={sortDir}
      />

      {orders.length === 0 ? (
        <OrdersEmptyState hasFilters={Object.values(filters).some(Boolean)} />
      ) : (
        <div className="mt-4 rounded-lg border bg-card">
          <OrdersTable orders={orders} sortBy={sortBy} sortDir={sortDir} filters={filters} />
        </div>
      )}
    </div>
  );
}
```

> **Nota**: el subtítulo cambia de "Todos los pedidos" a mostrar el `meta.total` dinámico para dar feedback inmediato del número de resultados filtrados.

---

#### `components/orders/orders-filter-bar.tsx` — NUEVO Client Component

Este es el componente central del ticket. Gestiona la URL de forma coordinada entre todos los controles.

```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect, useRef } from 'react';
import type { OrderStatus, OrderMode, SortByColumn, SortDir } from '@/types/api';

interface OrdersFilterBarProps {
  initialQ?: string;
  initialStatus?: OrderStatus[];
  initialMode?: OrderMode[];
  initialFrom?: string;
  initialTo?: string;
  sortBy: SortByColumn;
  sortDir: SortDir;
}

export function OrdersFilterBar({
  initialQ, initialStatus, initialMode, initialFrom, initialTo,
  sortBy, sortDir,
}: OrdersFilterBarProps) {
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

    // Mezclar con overrides
    const merged = {
      q: initialQ,
      status: initialStatus?.join(','),
      mode: initialMode?.join(','),
      from: initialFrom,
      to: initialTo,
      ...overrides,  // los overrides sobreescriben los valores actuales
    };

    if (merged.q)      params.set('q', merged.q);
    if (merged.status) params.set('status', merged.status);
    if (merged.mode)   params.set('mode', merged.mode);
    if (merged.from)   params.set('from', merged.from);
    if (merged.to)     params.set('to', merged.to);

    return `${pathname}?${params.toString()}`;
  }, [pathname, sortBy, sortDir, initialQ, initialStatus, initialMode, initialFrom, initialTo]);

  // Search con debounce 300ms
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ q: value.trim() || undefined }));
    }, 300);
  };

  // Toggle de un valor en un filtro multi-select
  const handleStatusToggle = (status: OrderStatus) => {
    const current = initialStatus ?? [];
    const next = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    router.push(buildUrl({ status: next.length ? next.join(',') : undefined }));
  };

  const handleModeToggle = (mode: OrderMode) => {
    const current = initialMode ?? [];
    const next = current.includes(mode)
      ? current.filter(m => m !== mode)
      : [...current, mode];
    router.push(buildUrl({ mode: next.length ? next.join(',') : undefined }));
  };

  // Date range (aplicado solo al pulsar "Aplicar")
  const handleDateApply = (from?: string, to?: string) => {
    router.push(buildUrl({ from, to }));
  };

  // Limpiar todo
  const handleClearAll = () => {
    router.push(`${pathname}?sort=${sortBy}&dir=${sortDir}`);
  };

  const hasActiveFilters = !!(
    (initialQ) || (initialStatus?.length) || (initialMode?.length) ||
    initialFrom || initialTo
  );

  return (
    <div className="mb-4 space-y-3">
      {/* Fila de controles */}
      <div className="flex items-center gap-2">
        <OrdersSearchInput value={searchValue} onChange={handleSearchChange} />
        <StatusFilterDropdown selected={initialStatus ?? []} onToggle={handleStatusToggle} />
        <ModeFilterDropdown selected={initialMode ?? []} onToggle={handleModeToggle} />
        <DateRangeFilter from={initialFrom} to={initialTo} onApply={handleDateApply} />
      </div>

      {/* Chips de filtros activos */}
      {hasActiveFilters && (
        <ActiveFilterChips
          q={initialQ}
          status={initialStatus}
          mode={initialMode}
          from={initialFrom}
          to={initialTo}
          onRemoveQ={() => router.push(buildUrl({ q: undefined }))}
          onRemoveStatus={(s) => handleStatusToggle(s)}
          onRemoveMode={(m) => handleModeToggle(m)}
          onRemoveDate={() => router.push(buildUrl({ from: undefined, to: undefined }))}
          onClearAll={handleClearAll}
        />
      )}
    </div>
  );
}
```

---

#### `components/orders/orders-search-input.tsx` — sub-componente

```typescript
'use client';

import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function OrdersSearchInput({ value, onChange }: Props) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Buscar por tienda, referencia o usuario..."
        className="w-full h-9 rounded-md border border-input bg-background pl-9 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
        aria-label="Buscar pedidos"
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

#### `components/orders/orders-status-filter.tsx` — sub-componente

```typescript
'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VALID_ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from '@/types/api';

// Color del punto indicador por estado (alineado con OrderStatusBadge)
const STATUS_DOT: Record<OrderStatus, string> = {
  PENDING_PAYMENT:  'bg-gray-400',
  PENDING_ADDRESS:  'bg-brand-lime',
  READY_TO_PROCESS: 'bg-brand-teal',
  COMPLETED:        'bg-emerald-500',
  CANCELED:         'bg-red-500',
};

interface Props {
  selected: OrderStatus[];
  onToggle: (status: OrderStatus) => void;
}

export function StatusFilterDropdown({ selected, onToggle }: Props) {
  const count = selected.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={cn(
          'flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors',
          count > 0
            ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
            : 'border-input bg-background text-foreground hover:bg-accent',
        )}>
          Estado
          {count > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-teal text-[10px] text-white">
              {count}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start">
        <div className="space-y-1" role="group" aria-label="Filtrar por estado">
          {VALID_ORDER_STATUSES.map(status => (
            <label
              key={status}
              className="flex cursor-pointer items-center gap-2.5 rounded px-2 py-1.5 text-sm hover:bg-accent"
            >
              <input
                type="checkbox"
                checked={selected.includes(status)}
                onChange={() => onToggle(status)}
                className="h-3.5 w-3.5 rounded accent-brand-teal"
              />
              <span className={cn('h-2 w-2 rounded-full shrink-0', STATUS_DOT[status])} aria-hidden="true" />
              {ORDER_STATUS_LABELS[status]}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

#### `components/orders/orders-mode-filter.tsx` — sub-componente

Mismo patrón que `StatusFilterDropdown`, con `VALID_ORDER_MODES` y `ORDER_MODE_LABELS`.

---

#### `components/orders/orders-date-filter.tsx` — sub-componente

```typescript
'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  from?: string;  // YYYY-MM-DD
  to?: string;    // YYYY-MM-DD
  onApply: (from?: string, to?: string) => void;
}

export function DateRangeFilter({ from, to, onApply }: Props) {
  const [localFrom, setLocalFrom] = useState(from ?? '');
  const [localTo, setLocalTo] = useState(to ?? '');
  const [open, setOpen] = useState(false);

  const isActive = !!(from || to);

  const label = isActive
    ? [
        from ? format(parseISO(from), 'd MMM', { locale: es }) : '…',
        to   ? format(parseISO(to),   'd MMM', { locale: es }) : '…',
      ].join(' – ')
    : 'Fecha';

  const handleApply = () => {
    onApply(localFrom || undefined, localTo || undefined);
    setOpen(false);
  };

  const handleClear = () => {
    setLocalFrom('');
    setLocalTo('');
    onApply(undefined, undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn(
          'flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors',
          isActive
            ? 'border-brand-teal bg-brand-teal/10 text-brand-teal'
            : 'border-input bg-background text-foreground hover:bg-accent',
        )}>
          <CalendarIcon className="h-3.5 w-3.5 opacity-60" aria-hidden="true" />
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Desde</label>
            <input
              type="date"
              value={localFrom}
              max={localTo || undefined}
              onChange={e => setLocalFrom(e.target.value)}
              className="w-full h-8 rounded-md border border-input px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Hasta</label>
            <input
              type="date"
              value={localTo}
              min={localFrom || undefined}
              onChange={e => setLocalTo(e.target.value)}
              className="w-full h-8 rounded-md border border-input px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
            />
          </div>
          <div className="flex justify-between pt-1">
            <button
              onClick={handleClear}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Limpiar
            </button>
            <button
              onClick={handleApply}
              className="rounded-md bg-brand-teal px-3 py-1 text-sm font-medium text-white hover:bg-brand-teal/90 focus-visible:ring-2 focus-visible:ring-brand-teal"
            >
              Aplicar
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

---

#### `components/orders/orders-active-filter-chips.tsx` — sub-componente

```typescript
'use client';

import { X } from 'lucide-react';
import { ORDER_STATUS_LABELS, ORDER_MODE_LABELS, type OrderStatus, type OrderMode } from '@/types/api';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  q?: string;
  status?: OrderStatus[];
  mode?: OrderMode[];
  from?: string;
  to?: string;
  onRemoveQ: () => void;
  onRemoveStatus: (s: OrderStatus) => void;
  onRemoveMode: (m: OrderMode) => void;
  onRemoveDate: () => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  q, status, mode, from, to,
  onRemoveQ, onRemoveStatus, onRemoveMode, onRemoveDate, onClearAll,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Filtros activos">
      {q && (
        <FilterChip label={`"${q}"`} onRemove={onRemoveQ} />
      )}
      {status?.map(s => (
        <FilterChip key={s} label={ORDER_STATUS_LABELS[s]} onRemove={() => onRemoveStatus(s)} />
      ))}
      {mode?.map(m => (
        <FilterChip key={m} label={ORDER_MODE_LABELS[m]} onRemove={() => onRemoveMode(m)} />
      ))}
      {(from || to) && (
        <FilterChip
          label={[
            from ? format(parseISO(from), 'd MMM yyyy', { locale: es }) : '…',
            to   ? format(parseISO(to),   'd MMM yyyy', { locale: es }) : '…',
          ].join(' – ')}
          onRemove={onRemoveDate}
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

#### `components/orders/orders-empty-state.tsx` — modificar para soporte filtros

Añadir prop `hasFilters` para mostrar un mensaje diferente cuando el vacío es consecuencia de los filtros:

```typescript
interface Props {
  hasFilters?: boolean;
}

export function OrdersEmptyState({ hasFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ShoppingCart className="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p className="text-base font-medium text-gray-900">
        {hasFilters ? 'Sin resultados' : 'Sin pedidos todavía'}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {hasFilters
          ? 'Prueba a ajustar o limpiar los filtros activos.'
          : 'Cuando se procese un pedido aparecerá aquí.'}
      </p>
    </div>
  );
}
```

---

#### `lib/api.ts` — extender `getOrders()`

```typescript
export const getOrders = (
  page = 1,
  limit = 50,
  sortBy?: SortByColumn,
  sortDir?: SortDir,
  filters?: OrdersFilters,
): Promise<OrdersResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortBy)          params.set('sortBy', sortBy);
  if (sortDir)         params.set('sortDir', sortDir);
  if (filters?.q)      params.set('q', filters.q);
  if (filters?.status?.length) params.set('status', filters.status.join(','));
  if (filters?.mode?.length)   params.set('mode', filters.mode.join(','));
  if (filters?.from)   params.set('from', filters.from);
  if (filters?.to)     params.set('to', filters.to);
  return apiFetch(`/api/admin/orders?${params.toString()}`);
};
```

---

### Capa backend (`apps/api`)

#### `admin.controller.ts` — ampliar `OrdersQuery` DTO

```typescript
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

class OrdersQuery extends PaginationQuery {
  // Sort (heredado de T01)
  @IsOptional()
  @IsIn(['ref', 'store', 'user', 'amount', 'date'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: string;

  // Filtros nuevos (T02)
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  status?: string;  // CSV de OrderStatus, validado en servicio

  @IsOptional()
  @IsString()
  mode?: string;    // CSV de OrderMode, validado en servicio

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from debe ser YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to debe ser YYYY-MM-DD' })
  to?: string;
}

@Get('orders')
getOrders(@Query() query: OrdersQuery) {
  const page  = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '50', 10) || 50));
  return this.adminService.getOrders(page, limit, {
    sortBy:  query.sortBy,
    sortDir: query.sortDir,
    q:       query.q?.trim() || undefined,
    status:  query.status,
    mode:    query.mode,
    from:    query.from,
    to:      query.to,
  });
}
```

---

#### `admin.service.ts` — añadir `buildWhere()` y refactorizar `getOrders()`

```typescript
// Tipos internos del servicio
import { OrderStatus, OrderMode, Prisma } from '@prisma/client';

interface GetOrdersParams {
  sortBy?: string;
  sortDir?: string;
  q?: string;
  status?: string;   // CSV
  mode?: string;     // CSV
  from?: string;     // YYYY-MM-DD
  to?: string;       // YYYY-MM-DD
}

// Valores válidos (duplicados del frontend para validación en el servidor)
private readonly VALID_SORT_COLUMNS = ['ref', 'store', 'user', 'amount', 'date'];
private readonly VALID_STATUSES: OrderStatus[] = [
  'PENDING_PAYMENT', 'PENDING_ADDRESS', 'READY_TO_PROCESS', 'COMPLETED', 'CANCELED',
];
private readonly VALID_MODES: OrderMode[] = ['TRADITIONAL', 'ADRESLES'];

async getOrders(page: number, limit: number, params: GetOrdersParams) {
  const skip = (page - 1) * limit;

  // Sort
  const isValidSort = params.sortBy !== undefined && this.VALID_SORT_COLUMNS.includes(params.sortBy);
  const resolvedSort = isValidSort ? params.sortBy! : 'date';
  const dir: 'asc' | 'desc' = isValidSort
    ? (params.sortDir === 'asc' ? 'asc' : 'desc')
    : 'desc';
  const orderBy = this.buildOrderBy(resolvedSort, dir);

  // Filtros
  const where = this.buildWhere(params);

  const [data, total] = await this.prisma.$transaction([
    this.prisma.order.findMany({
      where,
      include: {
        store: true,
        user: { include: { phone: true } },
        conversations: { select: { id: true } },
      },
      orderBy,
      skip,
      take: limit,
    }),
    this.prisma.order.count({ where }),  // ← count también filtra
  ]);

  return { data, meta: { page, limit, total } };
}

private buildWhere(params: GetOrdersParams): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  // Búsqueda de texto — OR entre columnas
  if (params.q) {
    where.OR = [
      { externalOrderNumber: { contains: params.q, mode: 'insensitive' } },
      { store: { name: { contains: params.q, mode: 'insensitive' } } },
      { user: { firstName: { contains: params.q, mode: 'insensitive' } } },
      { user: { lastName:  { contains: params.q, mode: 'insensitive' } } },
    ];
  }

  // Filtro por Status (CSV → array validado)
  if (params.status) {
    const statuses = params.status
      .split(',')
      .filter(s => this.VALID_STATUSES.includes(s as OrderStatus)) as OrderStatus[];
    if (statuses.length > 0) {
      where.status = { in: statuses };
    }
  }

  // Filtro por Mode (CSV → array validado)
  if (params.mode) {
    const modes = params.mode
      .split(',')
      .filter(m => this.VALID_MODES.includes(m as OrderMode)) as OrderMode[];
    if (modes.length > 0) {
      where.orderMode = { in: modes };
    }
  }

  // Filtro por rango de fechas sobre webhookReceivedAt
  if (params.from || params.to) {
    where.webhookReceivedAt = {};
    if (params.from) {
      where.webhookReceivedAt.gte = new Date(`${params.from}T00:00:00.000Z`);
    }
    if (params.to) {
      where.webhookReceivedAt.lte = new Date(`${params.to}T23:59:59.999Z`);
    }
  }

  return where;
}
```

> **Importante**: el `prisma.order.count({ where })` usa el mismo `where` que el `findMany`, garantizando que el total refleja siempre los registros filtrados y el subtítulo de la página es preciso.

---

## Criterios de aceptación

### Search box

- [ ] El input busca en `store.name`, `externalOrderNumber`, `user.firstName` y `user.lastName` (OR)
- [ ] La búsqueda es case-insensitive
- [ ] La URL se actualiza con `?q=<término>` después de un debounce de 300 ms
- [ ] El icono ✕ aparece cuando hay texto y al pulsarlo limpia el campo y el param `q` de la URL
- [ ] Buscar "zara" con pedidos de tienda "Zara" y usuario "García" devuelve ambos

### Filtro Estado

- [ ] El dropdown muestra los 5 estados posibles con su punto de color
- [ ] Seleccionar varios estados devuelve pedidos que cumplen CUALQUIERA de ellos (OR)
- [ ] El botón muestra badge con el nº de estados seleccionados cuando hay ≥1
- [ ] Los estados seleccionados persisten en la URL: `?status=PENDING_ADDRESS,COMPLETED`
- [ ] Valores inválidos en la URL se ignoran silenciosamente (sin 400)

### Filtro Modo

- [ ] El dropdown muestra las 2 opciones de Modo
- [ ] Misma lógica multi-select que Estado
- [ ] URL: `?mode=ADRESLES,TRADITIONAL`

### Date Range Picker

- [ ] El popover muestra dos `<input type="date">`: "Desde" y "Hasta"
- [ ] El campo "Hasta" tiene `min` = valor de "Desde" (evita rango inválido)
- [ ] El campo "Desde" tiene `max` = valor de "Hasta"
- [ ] El botón "Aplicar" cierra el popover y actualiza la URL con `?from=...&to=...`
- [ ] El botón "Limpiar" elimina ambos params y cierra el popover
- [ ] El trigger muestra el rango formateado cuando está activo: `📅 1 Feb – 25 Feb`
- [ ] El filtro de fecha actúa sobre `webhookReceivedAt`: `from` es inclusive desde 00:00 UTC, `to` hasta 23:59:59 UTC

### Integración filtros + sort

- [ ] Cambiar el sort preserva todos los filtros activos
- [ ] Cambiar cualquier filtro preserva el sort activo
- [ ] Combinar q + status + mode + date + sort produce la consulta SQL correcta (AND entre filtros, OR dentro de status y mode)
- [ ] El `meta.total` en la respuesta refleja el número de pedidos filtrados
- [ ] El subtítulo de la página muestra "N pedidos encontrados"

### Chips de filtros activos

- [ ] Los chips solo aparecen cuando hay ≥1 filtro activo
- [ ] Cada chip muestra el valor legible (no el enum crudo)
- [ ] El ✕ de un chip elimina ese filtro específico preservando los demás
- [ ] "Limpiar todo" elimina todos los filtros pero preserva el sort activo

### Estado vacío con filtros

- [ ] Si los filtros no devuelven resultados, se muestra "Sin resultados" con mensaje de ayuda diferente al estado vacío sin filtros

### Accesibilidad

- [ ] El input de búsqueda tiene `aria-label="Buscar pedidos"`
- [ ] Los checkboxes de status y mode tienen `role="group"` + `aria-label` en el contenedor
- [ ] Todos los botones tienen `aria-label` descriptivo
- [ ] El popover de fechas es navigable por teclado (Tab, Enter, Escape para cerrar)
- [ ] Los chips activos tienen `aria-label="Filtros activos"` en su contenedor

### Backend

- [ ] `GET /api/admin/orders?q=zara` filtra correctamente en 4 columnas
- [ ] `GET /api/admin/orders?status=COMPLETED,CANCELED` devuelve solo esos dos estados
- [ ] `GET /api/admin/orders?from=2026-02-01&to=2026-02-28` filtra por `webhookReceivedAt`
- [ ] `GET /api/admin/orders?status=INVALID` se ignora silenciosamente (no 400)
- [ ] `meta.total` refleja el count filtrado, no el total global
- [ ] Tests unitarios en `admin.service.spec.ts` cubren `buildWhere()`: texto, status, mode, fechas, combinaciones
- [ ] Tests en `admin.controller.spec.ts` verifican que los params se pasan correctamente al servicio

---

## Archivos a crear o modificar

| Archivo | Operación | Detalle |
|---------|-----------|---------|
| `apps/web-admin/src/types/api.ts` | Modificar | Añadir `OrdersFilters`, `VALID_ORDER_STATUSES`, `VALID_ORDER_MODES`, `ORDER_STATUS_LABELS`, `ORDER_MODE_LABELS` |
| `apps/web-admin/src/lib/api.ts` | Modificar | `getOrders()` acepta `filters?: OrdersFilters`, construye query string completo |
| `apps/web-admin/src/app/orders/page.tsx` | Modificar | Leer `q`, `status`, `mode`, `from`, `to` de `searchParams`; pasar a `OrdersFilterBar` y `getOrders()`; subtítulo dinámico con `meta.total` |
| `apps/web-admin/src/components/orders/orders-filter-bar.tsx` | **Crear** | Client Component — coordina todos los filtros y las actualizaciones de URL |
| `apps/web-admin/src/components/orders/orders-search-input.tsx` | **Crear** | Input con debounce, icono Search y botón clear |
| `apps/web-admin/src/components/orders/orders-status-filter.tsx` | **Crear** | Popover con checkboxes para OrderStatus |
| `apps/web-admin/src/components/orders/orders-mode-filter.tsx` | **Crear** | Popover con checkboxes para OrderMode |
| `apps/web-admin/src/components/orders/orders-date-filter.tsx` | **Crear** | Popover con dos `<input type="date">` y botones Aplicar/Limpiar |
| `apps/web-admin/src/components/orders/orders-active-filter-chips.tsx` | **Crear** | Chips de filtros activos con ✕ individual y "Limpiar todo" |
| `apps/web-admin/src/components/orders/orders-empty-state.tsx` | Modificar | Añadir prop `hasFilters` para mensaje alternativo |
| `apps/api/src/admin/admin.controller.ts` | Modificar | Ampliar `OrdersQuery` con `q`, `status`, `mode`, `from`, `to`; refactorizar llamada a `adminService.getOrders` con objeto params |
| `apps/api/src/admin/admin.service.ts` | Modificar | Refactorizar firma de `getOrders` a objeto `GetOrdersParams`; añadir `buildWhere()`; aplicar `where` en `findMany` y `count` |
| `apps/api/src/admin/admin.service.spec.ts` | Modificar | Tests de `buildWhere()`: q, status multi-valor, mode, rango de fechas, combinaciones, valores inválidos ignorados |
| `apps/api/src/admin/admin.controller.spec.ts` | Modificar | Actualizar tests existentes para nueva firma de `getOrders`; añadir tests de filtros |

---

## Requisitos no funcionales

- **TypeScript strict**: todos los tipos de filtro en `types/api.ts`; no `string` suelto para enums
- **Next.js 15+ compat**: `searchParams` como `Promise` con todos los nuevos params tipados
- **Sin regresión de T01**: los params `sort` y `dir` se preservan en todas las actualizaciones de URL
- **Performance**: el debounce de 300 ms en el search evita peticiones excesivas al servidor
- **Accesibilidad WCAG 2.1 AA**: todos los controles son accesibles por teclado; aria-labels en todos los interactivos; el popover de fechas puede cerrarse con Escape
- **Prisma type-safety**: usar `Prisma.OrderWhereInput` para el objeto `where`; no `any`
- **Shadcn Popover**: ya instalado en `apps/web-admin`; no se añaden dependencias nuevas
- **Sin paginación UI**: el reset de página es implícito (siempre page=1 en filtros); la UI de paginación es un ticket posterior

---

## Out of scope

- Paginación con controles UI (ticket posterior)
- Filtros en la tabla de Usuarios (`/users`)
- Ordenación en la tabla de Usuarios
- Exportar pedidos filtrados a CSV
- Guardado de filtros favoritos / vistas guardadas
- Filtros por importe (rango numérico) — complejidad adicional para MVP
