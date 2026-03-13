## Context

El Dashboard Admin (`apps/web-admin`) ya tiene operativa la ordenación server-side de T01 (`sort` + `dir` en URL, `buildOrderBy()` en el servicio). Este change añade filtrado server-side sobre la misma query Prisma. El punto de extensión natural son:

- **Frontend**: `OrdersPage` (Server Component) ya lee `searchParams` — se amplía con los nuevos params de filtro. `OrdersTable` es un Client Component — no cambia su interfaz.
- **Backend**: `AdminService.getOrders()` ya tiene la firma con `sortBy`/`sortDir` — se refactoriza para recibir un objeto de params y añade `buildWhere()` análogo a `buildOrderBy()`.

La tabla muestra hasta 50 pedidos (paginación futura). El filtrado debe ser obligatoriamente server-side porque el cliente solo ve los 50 primeros resultados; filtrar en cliente daría una vista incompleta e incorrecta.

## Goals / Non-Goals

**Goals:**
- Filtrado server-side por texto libre (4 columnas), estado multi-valor, modo multi-valor y rango de fechas
- Estado persistido en URL — compatible con T01, compartible, recargable
- Sin nuevas dependencias npm en el frontend
- Sin migración de base de datos
- `meta.total` siempre refleja el count filtrado (no el global)
- Accesibilidad WCAG 2.1 AA en todos los controles nuevos

**Non-Goals:**
- Paginación con UI (ticket posterior)
- Filtros en `/users`
- Exportar a CSV
- Guardado de vistas / filtros favoritos
- Filtro por rango de importe
- Full-text search con índice PostgreSQL (el volumen del MVP no lo justifica; `contains + mode: insensitive` es suficiente)

## Decisions

### D1: State en URL (no estado React local)

**Decisión**: Los filtros se almacenan exclusivamente en la URL como query params. No se usa `useState` para el estado de filtros (excepto el valor local del search input por debounce y los campos del date picker antes de "Aplicar").

**Alternativa rechazada**: `useState` + `useEffect` para sincronizar con URL — introduce complejidad de dos fuentes de verdad y dificulta el refresco/compartir de links.

**Justificación**: El patrón URL-as-state es consistente con T01 (sort), permite refrescar la página conservando los filtros y compartir la URL con filtros activos. Es el patrón dominante en admin dashboards de referencia (Linear, GitHub Issues).

---

### D2: OrdersFilterBar como Client Component independiente de OrdersTable

**Decisión**: Se crea `OrdersFilterBar` como Client Component separado. `OrdersPage` (Server Component) lo recibe con los valores iniciales desde `searchParams`. `OrdersTable` no tiene conocimiento de los filtros; solo recibe los pedidos ya filtrados.

**Alternativa rechazada**: Integrar los filtros dentro de `OrdersTable` — haría la tabla más pesada y rompería la separación Server/Client Component.

**Justificación**: `OrdersPage` sigue siendo Server Component, hace el fetch con los filtros, y pasa los datos ya procesados a `OrdersTable`. `OrdersFilterBar` es Client Component solo para gestionar las interacciones de URL. Este patrón es coherente con `SortableColumnHeader` de T01.

---

### D3: buildUrl() centralizado en OrdersFilterBar

**Decisión**: La función `buildUrl()` dentro de `OrdersFilterBar` es la única responsable de construir la URL preservando TODOS los params activos (filtros + sort). Cada sub-componente (search, status, mode, date) recibe un callback `onChange` o `onToggle` que delega en `buildUrl()`.

**Alternativa rechazada**: Cada sub-componente gestiona su propia URL con `useSearchParams()` — duplicaría lógica y arriesgaría condiciones de carrera al actualizar múltiples params a la vez.

**Justificación**: Un único punto de mutación de URL es predecible, testeable y elimina el riesgo de perder un param al actualizar otro.

---

### D4: Debounce 300 ms solo en search, toggle inmediato en Status/Mode

**Decisión**: El search input aplica debounce de 300 ms. Los checkboxes de Estado y Modo actualizan la URL inmediatamente en cada toggle.

**Justificación**: El texto libre puede cambiar en cada tecla — el debounce evita N peticiones. Los toggles discretos (Status/Mode) son una sola acción del usuario; el usuario espera feedback inmediato al marcar/desmarcar.

---

### D5: Date range picker con botón "Aplicar" (estado local previo a confirmación)

**Decisión**: El date picker mantiene estado local (`useState`) para los dos campos. Solo al pulsar "Aplicar" se actualiza la URL. "Limpiar" elimina el estado local y los params.

**Alternativa rechazada**: Actualizar la URL al cambiar cada campo — una fecha parcial (solo `from` sin `to`) lanzaría una petición intermedia con un rango incompleto que el usuario no ha confirmado aún.

**Justificación**: El rango de fechas es una operación de dos campos que tiene sentido solo como unidad. Pedir confirmación explícita ("Aplicar") es el patrón correcto para filtros compuestos (consistente con Google Analytics, Stripe Dashboard).

---

### D6: Input type="date" nativo (sin Calendar de Shadcn)

**Decisión**: Se usan `<input type="date">` nativos dentro del Popover, no el componente `Calendar` de Shadcn.

**Alternativa rechazada**: Shadcn `Calendar` (react-day-picker) para un DateRangePicker — requiere instalar `react-day-picker`, más código y un UX de doble clic para rango que añade complejidad.

**Justificación**: `input[type=date]` es nativo, accesible, sin dependencias, soportado por todos los navegadores modernos (Chrome 110+, Firefox 110+, Safari 16+). El popover custom con dos inputs y botón "Aplicar" es una UX probada y más sencilla para el contexto admin.

---

### D7: Refactorizar firma de getOrders a objeto GetOrdersParams

**Decisión**: La firma de `AdminService.getOrders()` cambia de `(page, limit, sortBy?, sortDir?)` a `(page, limit, params: GetOrdersParams)` donde `GetOrdersParams` incluye sort y filtros.

**Justificación**: Agregar 5 params opcionales a la firma plana haría el método inmanejable (`getOrders(page, limit, sortBy, sortDir, q, status, mode, from, to)`). Un objeto tipado es más legible, extensible y facilita los tests.

---

### D8: buildWhere() privado en AdminService

**Decisión**: Se añade un método privado `buildWhere(params: GetOrdersParams): Prisma.OrderWhereInput` que construye el objeto `where` de Prisma.

**Justificación**: Análogo a `buildOrderBy()` de T01. Facilita tests unitarios aislados de la lógica de filtrado. El mismo `where` se usa en `findMany` y `count`, garantizando consistencia de `meta.total`.

---

### D9: Validación de enums en el servicio (no solo en el DTO)

**Decisión**: El `AdminService.buildWhere()` filtra los valores de `status` y `mode` contra las allowlists `VALID_STATUSES` y `VALID_MODES` antes de pasarlos a Prisma, aunque el DTO del controller ya tenga `@IsString()`.

**Justificación**: Defensa en profundidad. El DTO solo valida que el campo es un string; la validación de valores enum en el servicio evita que un valor inválido en el CSV (e.g., `status=COMPLETED,ROGUE`) cause un error Prisma en producción.

---

### D10: Prisma mode: 'insensitive' para búsqueda de texto

**Decisión**: La búsqueda de texto usa `{ contains: q, mode: 'insensitive' }` de Prisma (PostgreSQL `ILIKE`).

**Alternativa rechazada**: Full-text search con `@@index([...], type: Gin)` — overhead de migración y complejidad innecesaria para el volumen del MVP.

**Justificación**: `ILIKE` es suficientemente performante para tablas de miles de filas. Si el volumen crece, se puede añadir índice GIN en una migración posterior sin cambiar la API.

## Risks / Trade-offs

**[Riesgo] Múltiples peticiones durante escritura en el search** → Mitigación: debounce de 300 ms en `OrdersSearchInput`. Si el servidor tarda más de 300 ms en responder, Next.js cancela la navegación anterior y solo procesa la última.

**[Riesgo] URL muy larga con todos los filtros activos** → Mitigación: las URLs con filtros CSV y fechas son cortas (< 200 caracteres). No es un problema práctico.

**[Riesgo] `ILIKE` sin índice puede ser lento en tablas grandes** → Mitigación: documentado como deuda técnica. Para MVP (< 10K pedidos) es aceptable. Añadir índice GIN si se detecta lentitud en producción.

**[Trade-off] Date picker nativo vs. Calendar UI** → El `input[type=date]` tiene apariencia distinta en cada navegador y no soporta localización de formato visual (aunque el valor interno es siempre YYYY-MM-DD). Aceptable para admin dashboard interno.

**[Trade-off] Refactor de firma de getOrders** → Los tests existentes de `admin.controller.spec.ts` y `admin.service.spec.ts` necesitan actualización. Coste controlado: son tests unitarios con mocks explícitos.

## Migration Plan

1. Deploy es aditivo: los nuevos params del endpoint son todos opcionales. Sin filtros activos, el comportamiento es idéntico al anterior (T01).
2. Rollback: revertir los archivos modificados restaura el comportamiento de T01. No hay migración de base de datos.
3. Sin cambios en el contrato de respuesta: `meta.total` ya existía — ahora refleja el count filtrado en vez del global, lo cual es un comportamiento más correcto.

## Open Questions

- _(Resuelto)_ ¿Debounce en Status/Mode? No — los toggles discretos deben ser inmediatos.
- _(Resuelto)_ ¿DatePicker con Shadcn Calendar o nativo? Nativo (ver D6).
- _(Resuelto)_ ¿Buscar también en `externalOrderId`? No — `externalOrderNumber` es el campo visible al usuario; `externalOrderId` es un ID interno. Añadir `externalOrderId` a la búsqueda si hay demanda futura.
- _(Pendiente)_ ¿Debería el reset de `page=1` ser explícito en la URL o implícito? Implícito por ahora (sin UI de paginación); a resolver cuando se implemente la paginación.
