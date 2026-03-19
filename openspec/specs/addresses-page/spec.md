## ADDED Requirements

### Requirement: Página /addresses con tabla de direcciones paginada
La página `/addresses` SHALL obtener las direcciones vía `GET /api/admin/addresses` (Server Component con `export const dynamic = 'force-dynamic'`) y renderizarlas en una tabla Shadcn.

Solo se muestran direcciones con `isDeleted = false`. El orden por defecto es `name ASC` (nombre de usuario A→Z, nulls al final).

**Columnas de la tabla (en orden):**

| Columna | Origen | Ordenable | Notas |
|---|---|---|---|
| Usuario | `user.firstName + user.lastName` | ✅ (`name`) | `formatFullName(firstName, lastName)` — "—" si ambos null |
| Alias | `label` | ✅ (`alias`) | "—" si null |
| Dirección | Concat. de `street, number, block, staircase, floor, door` | ✗ | `formatAddress()` — omite nulos sin dejar comas dobles |
| Código Postal | `postalCode` | ✅ (`postalCode`) | |
| Ciudad | `city` | ✅ (`city`) | |
| Provincia | `province` | ✅ (`province`) | "—" si null |
| País | `country` | ✅ (`country`) | |
| Favorita | `isDefault` | ✅ (`favorite`) | ⭐ `Star` rellena (`fill-amber-400 text-amber-400`) si `true`; ☆ `Star` vacía (`text-muted-foreground/40`) si `false` |

**No ordenable:** columna Dirección (campo calculado en el frontend; en el backend no existe campo directo equivalente).

**Ordenación**: dinámica vía query params `?sort=<sortBy>&dir=<asc|desc>`. Valores válidos de `sort`: `name | alias | postalCode | city | province | country | favorite`. Por defecto: `sort=name&dir=asc`.

**Filtros**: la tabla SHALL ir precedida de la barra de filtros `AddressesFilterBar` con dos controles:
- **Search box multicampo**: búsqueda simultánea en `user.firstName`, `user.lastName`, `label`, `street`, `number`, `block`, `staircase`, `floor`, `door`, `postalCode`, `city`, `province`, `country` (OR lógico, case-insensitive, debounce 300ms). URL param: `?q=<texto>`.
- **Control segmentado Favorita**: `[Todas] / [Favorita] / [No favorita]`, toggle inmediato. URL param: `?favorite=true|false` (ausente = Todas).

Filtros y sort coexisten y se preservan mutuamente al cambiar cualquiera de ellos.

**Subtítulo de la página**: SHALL mostrar `"N dirección(es) encontrada(s)"` donde N es `meta.total` (total filtrado devuelto por la API).

La tabla SHALL mostrar un skeleton durante la carga (`loading.tsx`) y un empty state adaptativo:
- Sin direcciones y sin filtros: icono `MapPin` + "Sin direcciones todavía. Las direcciones guardadas por los usuarios aparecerán aquí."
- Sin resultados con filtros activos: icono `MapPin` + "Sin resultados" + "Prueba a ajustar o limpiar los filtros activos."

#### Scenario: Tabla renderiza direcciones correctamente
- **WHEN** el usuario accede a `/addresses` y hay direcciones disponibles
- **THEN** la tabla muestra una fila por dirección con las 8 columnas especificadas

#### Scenario: Orden por defecto es nombre de usuario A→Z
- **WHEN** el usuario accede a `/addresses` sin parámetros de ordenación
- **THEN** las filas se ordenan por `user.firstName ASC`, luego `user.lastName ASC`, con nulls al final

#### Scenario: Columna Dirección concatena omitiendo nulos
- **WHEN** una dirección tiene `street="Calle Mayor"`, `number="5"`, `block=null`, `staircase=null`, `floor="3º"`, `door="A"`
- **THEN** la celda muestra `"Calle Mayor 5, 3º, A"` (espacio entre calle y número; coma entre el resto; sin campos vacíos)

#### Scenario: Columna Favorita muestra estrella rellena
- **WHEN** `isDefault = true`
- **THEN** se muestra el icono `Star` con `fill-amber-400 text-amber-400` y `aria-label="Favorita"`

#### Scenario: Columna Favorita muestra estrella vacía
- **WHEN** `isDefault = false`
- **THEN** se muestra el icono `Star` con `text-muted-foreground/40` y `aria-label="No favorita"`

#### Scenario: Columna Dirección no tiene flechita de ordenación
- **WHEN** el usuario accede a `/addresses`
- **THEN** la cabecera "Dirección" no muestra icono de sort ni es interactiva

#### Scenario: Barra de filtros precede a la tabla
- **WHEN** el usuario accede a `/addresses`
- **THEN** se muestra la barra de filtros (`AddressesFilterBar`) encima de la tabla

#### Scenario: Subtítulo muestra el conteo filtrado
- **WHEN** hay 5 direcciones favoritas de un total de 20 y el filtro `?favorite=true` está activo
- **THEN** el subtítulo muestra "5 direcciones encontradas"

#### Scenario: Estado vacío sin filtros activos
- **WHEN** la API devuelve `data: []` y no hay filtros activos
- **THEN** se muestra el componente `AddressesEmptyState` con mensaje "Sin direcciones todavía"

#### Scenario: Estado vacío con filtros activos
- **WHEN** la API devuelve `data: []` y hay al menos un filtro activo
- **THEN** se muestra `AddressesEmptyState` con mensaje "Sin resultados" y "Prueba a ajustar o limpiar los filtros activos."

#### Scenario: Skeleton durante carga
- **WHEN** la página está cargando datos de la API
- **THEN** se muestra el skeleton de 8 filas con `<Skeleton>` en cada celda

---

### Requirement: Filtro de búsqueda multicampo con debounce
El componente `AddressesSearchInput` SHALL buscar en los 13 campos especificados de forma simultánea (OR lógico) con debounce de 300ms antes de actualizar la URL.

El input SHALL mostrar un icono `X` cuando tiene contenido para limpiar la búsqueda inmediatamente.

#### Scenario: Búsqueda multicampo case-insensitive
- **WHEN** el usuario escribe "madrid" en el buscador
- **THEN** tras 300ms se actualiza `?q=madrid` y la tabla muestra direcciones donde cualquiera de los 13 campos contiene "madrid" (case-insensitive)

#### Scenario: Limpiar búsqueda
- **WHEN** el usuario hace clic en el icono X del buscador
- **THEN** el campo se vacía y se elimina el param `q` de la URL

#### Scenario: Cambio de sort preserva el filtro q
- **WHEN** hay `?q=garcia` activo y el usuario hace clic en la cabecera "Ciudad"
- **THEN** la URL actualiza el sort pero mantiene `?q=garcia`

---

### Requirement: Filtro segmentado de Favorita
El componente `AddressesFavoriteFilter` SHALL mostrar un control segmentado de selección única con tres opciones: `[Todas]`, `[Favorita]`, `[No favorita]`. La selección es inmediata (sin debounce, sin botón "Aplicar").

El botón activo SHALL tener estilo `bg-brand-teal/10 text-brand-teal`. El contenedor SHALL tener `role="group"` y `aria-label="Filtrar por favorita"`. Cada botón SHALL tener `aria-pressed={isActive}`.

#### Scenario: Filtro Favorita selecciona solo isDefault=true
- **WHEN** el usuario hace clic en "Favorita"
- **THEN** la URL se actualiza a `?favorite=true` y la tabla muestra solo direcciones con `isDefault = true`

#### Scenario: Filtro No favorita selecciona solo isDefault=false
- **WHEN** el usuario hace clic en "No favorita"
- **THEN** la URL se actualiza a `?favorite=false` y la tabla muestra solo direcciones con `isDefault = false`

#### Scenario: Filtro Todas elimina el param favorite
- **WHEN** el usuario hace clic en "Todas"
- **THEN** el param `favorite` se elimina de la URL y se muestran todas las direcciones

#### Scenario: Cambio de sort preserva el filtro favorite
- **WHEN** hay `?favorite=true` activo y el usuario hace clic en la cabecera "País"
- **THEN** la URL actualiza el sort pero mantiene `?favorite=true`

---

### Requirement: Chips de filtros activos
Cuando hay al menos un filtro activo, SHALL mostrarse una fila de chips debajo de la barra de filtros. Cada chip tiene un botón ✕ para eliminarlo individualmente. Un botón "Limpiar todo" elimina todos los filtros preservando el sort activo.

#### Scenario: Chip de texto muestra el término entre comillas
- **WHEN** hay `?q=garcia` activo
- **THEN** se muestra un chip con el texto `"garcia"` y un botón ✕

#### Scenario: Chip de favorita muestra etiqueta legible
- **WHEN** hay `?favorite=true` activo
- **THEN** se muestra un chip con el texto `Favorita` y un botón ✕

#### Scenario: Eliminar un chip preserva los demás filtros
- **WHEN** hay `?q=garcia&favorite=true` activos y el usuario hace clic en ✕ del chip de favorita
- **THEN** el chip desaparece, se elimina `favorite` de la URL y se mantiene `?q=garcia`

#### Scenario: Limpiar todo elimina filtros pero preserva sort
- **WHEN** hay `?q=garcia&favorite=true&sort=city&dir=asc` activos y el usuario hace clic en "Limpiar todo"
- **THEN** la URL queda como `?sort=city&dir=asc` (sin `q` ni `favorite`)

---

### Requirement: formatAddress con separador diferenciado para número
La función utilitaria `formatAddress()` en `lib/utils.ts` SHALL generar una cadena de texto con la siguiente lógica de separadores:
- `street` y `number` se unen con un **espacio** (sin coma).
- El resto de campos (`block`, `staircase`, `floor`, `door`) se separan entre sí y del bloque `street number` con `, `.
- Los campos nulos, `undefined` o cadenas vacías SHALL omitirse completamente sin dejar separadores adicionales.

#### Scenario: Solo calle y número
- **WHEN** `street="Calle Mayor"`, `number="5"`, resto null
- **THEN** `formatAddress()` devuelve `"Calle Mayor 5"` (espacio, sin coma)

#### Scenario: Campos intermedios nulos omitidos
- **WHEN** `street="Gran Vía"`, `number="12"`, `block=null`, `staircase=null`, `floor="3º"`, `door="A"`
- **THEN** `formatAddress()` devuelve `"Gran Vía 12, 3º, A"` (espacio entre calle y número; coma entre el resto)

#### Scenario: Solo calle sin campos opcionales
- **WHEN** `street="Paseo de la Castellana"`, resto null o undefined
- **THEN** `formatAddress()` devuelve `"Paseo de la Castellana"` (sin coma final)
