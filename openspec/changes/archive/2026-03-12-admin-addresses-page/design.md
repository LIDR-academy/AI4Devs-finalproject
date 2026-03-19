## Context

El Dashboard Admin ya tiene dos páginas de datos tabulares (Pedidos y Usuarios) que siguen un patrón consolidado: Server Component con `force-dynamic`, `await searchParams`, validación de query params con allowlist, fetch server-side, y componentes Client para interactividad (tabla con sort, barra de filtros, chips). Este cambio añade una tercera página siguiendo exactamente el mismo patrón, sin introducir nuevas abstracciones.

La tabla `Address` de Prisma ya existe con todos los campos necesarios y su relación `user` (FK `userId → User.id`). No hay migraciones de base de datos.

El `AdminModule` ya agrupa `AdminController` y `AdminService`. El nuevo endpoint se añade a estos archivos existentes sin modificar la estructura del módulo.

## Goals / Non-Goals

**Goals:**
- Página `/addresses` operativa con tabla ordenable, filtros (búsqueda multicampo + favorita) y chips de filtros activos, siguiendo el mismo patrón visual y de código que `/orders` y `/users`.
- Endpoint `GET /api/admin/addresses` con los mismos mecanismos de paginación, ordenación y filtrado que los endpoints existentes.
- Función `formatAddress()` en `lib/utils.ts` que concatene los campos de dirección omitiendo nulos sin comas dobles.
- Integración en la sidebar entre Usuarios y Simulación con icono `MapPin`.

**Non-Goals:**
- CRUD de direcciones desde el dashboard (solo lectura).
- Visualización geográfica ni integración con Google Maps en el frontend.
- Filtros adicionales (por país, ciudad específica mediante desplegable, rango de fechas de creación).
- Paginación con controles UI (queda reservado para un ticket futuro).
- Tests E2E con Playwright (el alcance de QA se limita a tests unitarios del servicio).

## Decisions

### Decisión 1: Reutilizar el patrón de Usuarios sin abstracciones nuevas

**Elegido:** Copiar y adaptar el patrón de `/users` (componentes, tipos, lógica de URL) en archivos con prefijo `addresses-*`.

**Alternativa descartada:** Crear un componente genérico `DataPage<T>` reutilizable para las tres páginas.

**Motivo:** El coste de generalizar (prop drilling profundo, tipos genéricos complejos, riesgo de regresión en `/orders` y `/users`) supera el beneficio en el MVP. Las tres páginas son suficientemente distintas (columnas diferentes, filtros diferentes, semántica de sort diferente). El patrón por duplicación es más legible y mantenible en este estadio.

### Decisión 2: Dirección como campo calculado solo en el frontend

**Elegido:** La concatenación `street + number + block + staircase + floor + door` se hace en el cliente mediante `formatAddress()`. La columna "Dirección" no es ordenable.

**Alternativa descartada:** Ordenar por `street` en el backend cuando se selecciona la columna "Dirección".

**Motivo:** Ordenar por `street` sería semánticamente confuso (el usuario esperaría orden por dirección completa, no por calle). La columna ya existe como `fullAddress` en la tabla, pero ese campo es generado por Google Maps y no siempre existe. La concatenación manual con `.filter(Boolean).join(', ')` es más predecible. Al no ser ordenable, no se necesita ninguna lógica backend adicional.

### Decisión 3: Búsqueda en 13 campos via OR en Prisma

**Elegido:** El filtro `q` genera un `OR` de 13 condiciones `contains` (insensitive) en `buildAddressesWhere`.

**Alternativa descartada:** Búsqueda full-text con `tsvector` en PostgreSQL.

**Motivo:** El volumen de datos en el MVP es pequeño. La búsqueda con `contains` en Prisma es suficiente y no requiere cambios de schema. Si el rendimiento se convierte en problema, se puede añadir un índice `GIN` en un ticket futuro.

### Decisión 4: isDefault como "Favorita"

**Elegido:** El campo `isDefault` de la tabla `Address` se muestra como columna "Favorita" (estrella rellena / vacía).

**Motivo:** `isDefault` es el único campo booleano de preferencia en el modelo `Address`. El nombre "Favorita" es más comprensible para el usuario del dashboard que "Por defecto" o "Default".

### Decisión 5: Separador diferenciado — espacio entre calle y número, coma para el resto

**Elegido:** `street` y `number` se unen con un espacio (ej. `"Calle Mayor 5"`). El resto de campos (`block`, `staircase`, `floor`, `door`) se separan entre sí y del bloque anterior con `, `. Los nulos se omiten sin dejar separadores adicionales.

**Motivo:** La notación postal española habitual escribe el número pegado a la calle (`Gran Vía 12`) sin coma intermedia. Las plantas, puertas y bloques sí se separan con coma por convención tipográfica. La implementación combina `.join(' ')` para `street+number` y `.join(', ')` para el resto.

### Decisión 6: `nulls: 'last'` para campos nullable en ordenación

**Elegido:** Los campos nullable (`label`, `province`, `user.firstName`, `user.lastName`) usan `{ sort: dir, nulls: 'last' }` en `buildAddressesOrderBy`.

**Motivo:** Consistente con el patrón de `buildUsersOrderBy`. Los registros sin valor se colocan al final independientemente de la dirección de ordenación, lo que es la expectativa natural del usuario.

## Risks / Trade-offs

- **[Riesgo] Rendimiento del OR con 13 campos** → Para el volumen esperado en el MVP (cientos de direcciones, no millones) el `OR` con `contains` es suficiente. Si el volumen crece, se puede añadir un índice de texto completo o limitar los campos de búsqueda.
- **[Riesgo] fullAddress no se usa** → El campo `fullAddress` en la tabla `Address` (generado por Google Maps) queda sin mostrarse en la UI. Se prefiere la concatenación manual para control y previsibilidad. No es un riesgo funcional.
- **[Trade-off] Duplicación de código** → Los componentes `addresses-*` son similares a los `users-*`. Se acepta esta duplicación a cambio de simplicidad y ausencia de riesgo de regresión.

## Migration Plan

1. Añadir el endpoint en `apps/api/src/admin/` (sin migraciones de base de datos).
2. Añadir tipos y función `getAddresses()` en el frontend.
3. Crear los archivos de la página y componentes en `apps/web-admin/`.
4. Actualizar `sidebar.tsx`.
5. Verificar build TypeScript: `pnpm --filter @adresles/web-admin build`.
6. Ejecutar tests del backend: `pnpm --filter @adresles/api test`.

**Rollback:** eliminar los archivos nuevos del frontend y revertir los cambios en `admin.controller.ts`, `admin.service.ts` y `sidebar.tsx`. No hay migraciones que deshacer.

## Open Questions

- *(Ninguna — todas las decisiones han sido tomadas en la fase de exploración con el propietario del producto.)*
