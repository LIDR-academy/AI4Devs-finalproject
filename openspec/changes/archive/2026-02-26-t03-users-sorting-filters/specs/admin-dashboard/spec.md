## MODIFIED Requirements

### Requirement: Vista de usuarios con badge registrado/no registrado

La página `/users` SHALL obtener los usuarios vía `GET /api/admin/users` (Server Component) y renderizarlos en una tabla Shadcn.

**Columnas de la tabla (en orden):**


| Columna            | Origen                 | Ordenable | Notas                                                                       |
| ------------------ | ---------------------- | --------- | --------------------------------------------------------------------------- |
| Nombre             | `firstName + lastName` | ✅         | `formatFullName(firstName, lastName)` — "—" si ambos null                   |
| Teléfono           | `phone.e164`           | ✗         | `formatPhone(e164)`                                                         |
| Email              | `email`                | ✅         | "—" si null                                                                 |
| Registrado         | `isRegistered`         | ✗         | `<UserRegisteredBadge>`                                                     |
| Pedidos            | `_count.orders`        | ✅         | Número entero                                                               |
| Direcciones        | `_count.addresses`     | ✅         | Número entero                                                               |
| Última interacción | `lastInteractionAt`    | ✅         | `formatRelativeDate()` — "Hace 2h"; tooltip con fecha absoluta; "—" si null |


**Ordenación**: dinámica vía query params `?sort=<columna>&dir=<asc|desc>`. Por defecto: `lastInteraction DESC` (más recientes primero, nulls al final). Ver spec `users-sorting-filters` para requisitos completos de ordenación.

**Filtros**: la tabla SHALL ir precedida de la barra de filtros `UsersFilterBar`. Ver spec `users-sorting-filters` para requisitos completos de filtrado y búsqueda.

**Subtítulo de la página**: SHALL mostrar `"N usuario(s) encontrado(s)"` donde N es `meta.total` (total filtrado devuelto por la API), no un texto fijo.

La tabla SHALL mostrar un skeleton de filas durante la carga (`loading.tsx`) y un empty state adaptativo:

- Sin usuarios y sin filtros: icono `Users` + "Sin usuarios todavía. Los usuarios aparecerán aquí cuando interactúen con Adresles."
- Sin resultados con filtros activos: icono `Users` + "Sin resultados" + "Prueba a ajustar o limpiar los filtros activos."

La columna "Registrado" SHALL usar `UserRegisteredBadge`:

- `isRegistered = true` → `bg-brand-teal/10 text-brand-teal` — texto "Sí"
- `isRegistered = false` → `bg-gray-100 text-gray-500` — texto "No"

#### Scenario: Tabla renderiza usuarios correctamente

- **WHEN** el usuario accede a `/users` y hay usuarios disponibles
- **THEN** la tabla muestra una fila por usuario con las 7 columnas especificadas

#### Scenario: Barra de filtros precede a la tabla

- **WHEN** el usuario accede a `/users`
- **THEN** se muestra la barra de filtros (`UsersFilterBar`) encima de la tabla

#### Scenario: Subtítulo muestra el conteo filtrado

- **WHEN** hay 3 usuarios registrados de un total de 10 y el filtro `?registered=true` está activo
- **THEN** el subtítulo muestra "3 usuarios encontrados"

#### Scenario: Badge registrado

- **WHEN** `isRegistered = true`
- **THEN** el badge muestra "Sí" con fondo `bg-brand-teal/10`

#### Scenario: Badge no registrado

- **WHEN** `isRegistered = false`
- **THEN** el badge muestra "No" con fondo `bg-gray-100`

#### Scenario: Estado vacío sin filtros activos

- **WHEN** la API devuelve `data: []` y no hay filtros activos
- **THEN** se muestra `UsersEmptyState` con mensaje "Sin usuarios todavía"

#### Scenario: Estado vacío con filtros activos

- **WHEN** la API devuelve `data: []` y hay al menos un filtro activo
- **THEN** se muestra `UsersEmptyState` con mensaje "Sin resultados" y "Prueba a ajustar o limpiar los filtros activos."

