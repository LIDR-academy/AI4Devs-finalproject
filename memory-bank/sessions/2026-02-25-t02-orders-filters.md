# Sesión 2026-02-25: T02 — Filtros y Búsqueda en Tabla de Pedidos — Completado

> **Change**: `t02-orders-filters`  
> **Estado**: ✅ Completado (34/34 tareas) — verificado y docs actualizados

## Resumen

Implementación de filtrado y búsqueda server-side en la tabla de pedidos del Dashboard Admin. Se añadieron cuatro controles de filtrado (búsqueda de texto libre, multi-select de estado, multi-select de modo y date range picker), persistidos en URL y compatibles con la ordenación de T01. Se refactorizó el backend para aceptar los nuevos query params y aplicar un `buildWhere()` análogo al `buildOrderBy()` de T01.

---

## Completado

### Backend — AdminModule (NestJS)

- **`admin.controller.ts`**: `OrdersQuery` ampliado con `q`, `status`, `mode` (`@IsString`) y `from`/`to` (`@Matches(/^\d{4}-\d{2}-\d{2}$/)`). El método `getOrders` ahora pasa un objeto `GetOrdersParams` al servicio.
- **`admin.service.ts`**:
  - Interfaz exportada `GetOrdersParams` con campos `sortBy?`, `sortDir?`, `q?`, `status?`, `mode?`, `from?`, `to?`
  - Firma de `getOrders()` refactorizada de `(page, limit, sortBy?, sortDir?)` a `(page, limit, params: GetOrdersParams = {})`
  - Constantes internas `VALID_STATUSES` y `VALID_MODES` como allowlists de enums
  - Método privado `buildWhere(params): Prisma.OrderWhereInput` con cuatro bloques AND: búsqueda de texto (OR sobre 4 columnas con `mode: 'insensitive'`), status CSV (split + allowlist + `{ in: [...] }`), mode CSV (mismo patrón), rango de fechas (`gte 00:00:00.000Z` / `lte 23:59:59.999Z` sobre `webhookReceivedAt`)
  - `prisma.order.count({ where })` usa el mismo `where` que `findMany` → `meta.total` siempre refleja el count filtrado
- **`admin.service.spec.ts`**: Tests existentes adaptados a la nueva firma con objeto params; 11 nuevos tests de `buildWhere()` (q OR, status CSV válido/inválido/total inválido, mode CSV, solo from, solo to, from+to con horas correctas, combinación AND)
- **`admin.controller.spec.ts`**: Tests existentes adaptados al nuevo objeto params; 2 nuevos tests verificando paso de `q` y `status`/`from`/`to`

### Frontend — Dashboard Admin (Next.js)

- **`apps/web-admin/src/types/api.ts`**: Añadidos `OrdersFilters`, `VALID_ORDER_STATUSES`, `VALID_ORDER_MODES`, `ORDER_STATUS_LABELS`, `ORDER_MODE_LABELS`
- **`apps/web-admin/src/lib/api.ts`**: `getOrders()` con nuevo parámetro `filters?: OrdersFilters`; serializa arrays como CSV con `join(',')`
- **`apps/web-admin/src/app/orders/page.tsx`**:
  - `searchParams` ampliado con `q`, `status`, `mode`, `from`, `to`
  - Parsing y validación: `q` (trim), `status`/`mode` (split + allowlist), `from`/`to` (tal cual)
  - Subtítulo dinámico: `"{meta.total} pedido(s) encontrado(s)"`
  - `OrdersFilterBar` integrado encima de la tabla
  - `OrdersEmptyState` recibe `hasFilters`
- **`apps/web-admin/src/components/ui/popover.tsx`**: Nuevo componente Popover Shadcn (`@radix-ui/react-popover` instalado)
- **`apps/web-admin/src/components/orders/orders-search-input.tsx`**: Input con icono `Search`, botón `X` cuando hay contenido, `type="search"`, `aria-label="Buscar pedidos"`
- **`apps/web-admin/src/components/orders/orders-status-filter.tsx`**: Popover con checkboxes para los 5 `OrderStatus`; trigger con badge de conteo y color `brand-teal` cuando activo; punto de color alineado con `OrderStatusBadge`
- **`apps/web-admin/src/components/orders/orders-mode-filter.tsx`**: Mismo patrón que status-filter para los 2 `OrderMode`
- **`apps/web-admin/src/components/orders/orders-date-filter.tsx`**: Popover con dos `<input type="date">` nativos (`min`/`max` cruzados), estado local antes de confirmar, botones "Limpiar" y "Aplicar"; trigger con emoji 📅 y rango formateado cuando activo
- **`apps/web-admin/src/components/orders/orders-active-filter-chips.tsx`**: Chips `brand-teal` por cada filtro activo (q entre comillas, estados/modos con etiqueta en español, fecha con rango formateado), botón X individual, "Limpiar todo"
- **`apps/web-admin/src/components/orders/orders-filter-bar.tsx`**: Client Component coordinador; recibe `initialQ/Status/Mode/From/To` + `sortBy`/`sortDir`; implementa `buildUrl(overrides)` (único punto de mutación de URL, siempre preserva sort); debounce 300ms en search con `useRef`; toggles inmediatos en status/mode
- **`apps/web-admin/src/components/orders/orders-empty-state.tsx`**: Prop `hasFilters?: boolean`; muestra "Sin resultados / Prueba a ajustar o limpiar los filtros activos." cuando `hasFilters = true`
- **`apps/web-admin/src/components/orders/sortable-column-header.tsx`**: Corregido en verificación post-implementación — ahora usa `useSearchParams()` para preservar `q`, `status`, `mode`, `from`, `to` al cambiar la ordenación (escenario "Sort preserva filtros activos")

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **Estado en URL (no `useState`)** | Consistente con T01 (sort), permite compartir/refrescar la URL con filtros activos |
| **`OrdersFilterBar` como Client Component separado** | `OrdersPage` sigue siendo Server Component; la tabla no conoce los filtros |
| **`buildUrl()` centralizado en `OrdersFilterBar`** | Único punto de mutación de URL: evita race conditions al actualizar múltiples params |
| **Debounce 300ms solo en search** | El texto libre cambia en cada tecla; los toggles discretos (status/mode) son inmediatos |
| **Date picker con botón "Aplicar"** | El rango de fechas es una operación de dos campos: se confirma como unidad |
| **`<input type="date">` nativo** | Sin dependencias adicionales; soportado por todos los navegadores modernos del target |
| **`buildWhere()` privado en `AdminService`** | Análogo a `buildOrderBy()`; facilita tests unitarios aislados; mismo `where` en `findMany` y `count` |
| **Allowlist en servicio (no solo DTO)** | Defensa en profundidad: valores enum inválidos en CSV se ignoran en lugar de causar error Prisma |
| **`@Matches` en DTO para from/to** | Con `ValidationPipe({ forbidNonWhitelisted: true })`, formato de fecha inválido → HTTP 400 (comportamiento documentado, diferente a status/mode) |

---

## Correcciones Post-Verificación

- **W1 (corregido)**: `SortableColumnHeader` perdía los filtros activos al cambiar la ordenación. Corregido usando `useSearchParams()` para copiar `q`, `status`, `mode`, `from`, `to` al construir la nueva URL de sort.

---

## Archivos Modificados/Creados

```
apps/api/src/admin/
├── admin.controller.ts           # Modificado (OrdersQuery con q/status/mode/from/to, objeto params)
├── admin.service.ts              # Modificado (GetOrdersParams, buildWhere, firma refactorizada)
├── admin.service.spec.ts         # Modificado (firma adaptada, +11 tests buildWhere)
└── admin.controller.spec.ts      # Modificado (objeto params, +2 tests filtros)

apps/web-admin/src/
├── types/api.ts                  # Modificado (+OrdersFilters, +VALID_*, +LABELS)
├── lib/api.ts                    # Modificado (getOrders con filters?)
├── app/orders/page.tsx           # Modificado (nuevos searchParams, OrdersFilterBar, subtítulo dinámico)
└── components/
    ├── ui/popover.tsx             # Nuevo (Popover Shadcn con @radix-ui/react-popover)
    └── orders/
        ├── orders-filter-bar.tsx          # Nuevo (coordinador: buildUrl, debounce, toggles)
        ├── orders-search-input.tsx        # Nuevo (input con icono + botón X)
        ├── orders-status-filter.tsx       # Nuevo (Popover checkboxes OrderStatus)
        ├── orders-mode-filter.tsx         # Nuevo (Popover checkboxes OrderMode)
        ├── orders-date-filter.tsx         # Nuevo (Popover date range picker nativo)
        ├── orders-active-filter-chips.tsx # Nuevo (chips activos + Limpiar todo)
        ├── orders-empty-state.tsx         # Modificado (+hasFilters prop)
        └── sortable-column-header.tsx     # Modificado (+useSearchParams para preservar filtros)
```

---

## Documentación Actualizada

- `openspec/specs/admin-dashboard/spec.md` — Requisito "Vista de órdenes" ampliado (FilterBar, subtítulo dinámico, empty state adaptativo, estructura de archivos)
- `openspec/specs/admin-api/spec.md` — Endpoint `/admin/orders` con tabla de params, `buildWhere`, `meta.total` filtrado, nuevos tipos
- `openspec/specs/orders-column-sorting/spec.md` — Escenarios de coexistencia filtros + sort

---

## Tests

- Backend: **40/40 tests pasan** (`admin.service.spec.ts` + `admin.controller.spec.ts`)
- Frontend: `tsc --noEmit` sin errores

---

**Duración estimada**: 1 sesión  
**Conversación de referencia**: [T02 Orders Filters](c8e7b86b-9f0e-4f08-866f-72d1aa5a4da7)
