## Context

El Dashboard Admin (`apps/web-admin`) es una aplicación Next.js 16 con App Router y Server Components por defecto. La tabla de pedidos (`OrdersTable`) era un Server Component que recibía datos directamente de la función `getOrders()`.

El endpoint backend `GET /api/admin/orders` (NestJS `AdminModule`) devolvía pedidos ordenados fijamente por `webhookReceivedAt DESC` sin parámetros de control. La capa de servicio usa Prisma con `$transaction` para paginación.

El controlador ya usa un patrón DTO con `class-validator` (`PaginationQuery`).

## Goals / Non-Goals

**Goals:**
- Añadir ordenación server-side de 5 columnas (Referencia, Tienda, Usuario, Importe, Fecha) con estado persistido en URL
- Mantener compatibilidad con el endpoint existente (aditivo, no breaking)
- Cumplir con los patrones ya establecidos: DTO con class-validator en backend, Server Components en frontend, accesibilidad WCAG 2.1 AA

**Non-Goals:**
- Filtrado por Estado o Modo (ticket separado)
- Paginación de pedidos (UI de paginación no existe aún)
- Ordenación de la tabla de Usuarios
- Ordenación en memoria / client-side

## Decisions

### D1: Ordenación server-side vía query params en URL

**Decisión**: La ordenación se implementa en el servidor (Prisma `orderBy`) y el estado se persiste en la URL como `?sort=<col>&dir=<asc|desc>`.

**Alternativas consideradas**:
- *Client-side sort*: Ordenar el array ya cargado en el cliente. Descartado porque con paginación real (>50 filas) el orden sería incorrecto al no tener todos los datos; además no persiste en URL.
- *Sort en `apiFetch` sin URL*: Guardar el sort en `useState`. Descartado porque se pierde al recargar y no es linkable.

**Razón**: La URL como fuente de verdad encaja con el patrón Server Components de Next.js — la página lee `searchParams`, llama al API con los parámetros correctos y renderiza los datos ya ordenados. Permite compartir el enlace con el mismo orden activo.

---

### D2: `searchParams` como `Promise` en Next.js 15/16

**Decisión**: La firma de `page.tsx` usa `searchParams: Promise<{ sort?: string; dir?: string }>` con `await searchParams`.

**Razón**: Next.js 15 cambió `searchParams` de objeto a `Promise` para permitir streaming y renderizado concurrente. No hacerlo así genera errores en tiempo de build o advertencias de deprecación en Next.js 16.

---

### D3: `OrdersTable` como Client Component con `SortableColumnHeader`

**Decisión**: `orders-table.tsx` se convierte a Client Component (`'use client'`). Se extrae un nuevo componente `SortableColumnHeader` también Client Component, que usa `useRouter().push()` y `usePathname()` de `next/navigation`.

**Alternativas consideradas**:
- *Mantener `OrdersTable` como Server Component con `<Link>` para los botones*: Técnicamente posible, pero calcular el `href` siguiente requeriría pasar la lógica de alternancia al servidor y volver a renderizar el layout completo. Con `useRouter().push()` la navegación es inmediata y no requiere full page reload.
- *Usar `useSearchParams()` en `SortableColumnHeader`*: Requiere un `Suspense` boundary adicional. Innecesario porque el sort actual llega como prop desde el Server Component padre.

**Razón**: La separación Server Component (página con datos) + Client Component (interactividad de botones) es el patrón correcto en Next.js App Router. `OrdersTable` recibe los datos ya ordenados como prop y solo gestiona la navegación al hacer clic.

---

### D4: Método privado `buildOrderBy()` en `AdminService`

**Decisión**: La lógica de construcción del objeto `orderBy` de Prisma se extrae a un método privado `buildOrderBy(sortBy, dir)` en el servicio.

**Razón**: Facilita los tests unitarios (testear el método directamente sin necesidad de mockear toda la transacción Prisma) y mantiene `getOrders()` limpio y legible.

---

### D5: DTO `OrdersQuery` extiende `PaginationQuery`

**Decisión**: Se añade una nueva clase `OrdersQuery extends PaginationQuery` con los campos `sortBy` y `sortDir` decorados con `@IsOptional()` y `@IsIn([...])`.

**Razón**: El controlador ya usa el patrón DTO con class-validator. Extender `PaginationQuery` respeta ese patrón sin duplicar la lógica de paginación.

---

### D6: Fallback silencioso para parámetros inválidos

**Decisión**: Valores de `sortBy` o `sortDir` no reconocidos no producen un error 400. El servicio hace fallback a `date DESC`.

**Razón**: Los params inválidos pueden venir de un enlace antiguo o de una URL editada manualmente. Un error 400 rompería la experiencia del usuario. El fallback silencioso es consistente con el comportamiento de la paginación existente (valores inválidos de `page`/`limit` también hacen fallback silencioso).

---

### D7: Tipos compartidos en `types/api.ts` del frontend

**Decisión**: `SortByColumn`, `SortDir`, `VALID_SORT_COLUMNS`, `DEFAULT_SORT` y `DEFAULT_DIR` se definen en `apps/web-admin/src/types/api.ts`.

**Razón**: Centraliza la allowlist de valores válidos para que `page.tsx`, `orders-table.tsx` y `sortable-column-header.tsx` importen del mismo sitio, sin duplicación ni riesgo de inconsistencia.

## Risks / Trade-offs

- **[Riesgo] `totalAmount` es Decimal en Prisma pero string en el tipo TypeScript del frontend** → `orderBy: { totalAmount: dir }` ordena correctamente en Prisma (tipo `Decimal`); no hay que convertir en JS. Mitigación: el test unitario verifica que la ordenación numérica es correcta.

- **[Riesgo] `externalOrderNumber` puede ser null** → Se usa `{ sort: dir, nulls: 'last' }` en Prisma para todos los ordenamientos que incluyen este campo. Mitigación: cubierto en spec y test.

- **[Trade-off] Subsort por Referencia solo cuando sortBy=store** → Podría añadirse subsort `webhookReceivedAt DESC` como desempate universal en todos los casos. Se omite para mantener el comportamiento determinista y predecible; se puede añadir en un ticket futuro si aparece la necesidad.

- **[Riesgo] Tests existentes en `admin.controller.spec.ts` verifican `getOrders(1, 50)` con 2 argumentos** → Tras el cambio la firma pasa a 4 argumentos. Los tests deben actualizarse explícitamente. Mitigación: tarea de tests en `tasks.md`.

## Migration Plan

1. Desplegar el cambio backend (`admin.service.ts` + `admin.controller.ts`) — es aditivo, el endpoint sigue funcionando igual sin params.
2. Desplegar el cambio frontend (`page.tsx` + `orders-table.tsx` + nuevo `sortable-column-header.tsx`) — carga en `/orders` con `?sort=date&dir=desc` implícito si no hay params.
3. Sin migración de datos ni migración de esquema de base de datos.

**Rollback**: Revertir los cambios en `admin.service.ts` y `admin.controller.ts` restaura el endpoint original. El frontend sin params de sort seguirá funcionando con el orden por defecto.

## Open Questions

- *Ninguna pendiente* — todas las decisiones de diseño han sido aclaradas durante el enriquecimiento del ticket.
