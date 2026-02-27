## ADDED Requirements

### Requirement: Ordenación dinámica de la tabla de usuarios por columna
La página `/users` SHALL permitir ordenar la tabla por columna mediante query params `?sort=<sortBy>&dir=<asc|desc>` persistidos en URL. La ordenación SHALL ser server-side: el servidor devuelve los datos ya ordenados. El valor por defecto SHALL ser `sort=lastInteraction&dir=desc` (usuarios con interacción más reciente primero). Valores de `sort` no válidos SHALL hacer fallback silencioso a `lastInteraction desc` sin devolver error 400.

Las columnas ordenables y su mapeo a campos Prisma SHALL ser:

| `sortBy` | Campo Prisma | Comportamiento |
|----------|-------------|----------------|
| `name` | `firstName` → `lastName` | Ambos con `nulls: 'last'` |
| `email` | `email` | `nulls: 'last'` |
| `orders` | `orders: { _count: dir }` | Ordenación por conteo de relación |
| `addresses` | `addresses: { _count: dir }` | Ordenación por conteo de relación |
| `lastInteraction` | `lastInteractionAt` | `nulls: 'last'`; **default `desc`** |

Las columnas Teléfono y Registrado SHALL NO ser ordenables (sin icono ni área clicable).

#### Scenario: Acceso sin params usa orden por defecto
- **WHEN** el usuario accede a `/users` sin query params de sort
- **THEN** la tabla muestra usuarios ordenados por `lastInteractionAt DESC`, con nulls al final

#### Scenario: Clic en columna inactiva activa orden ascendente
- **WHEN** el usuario hace clic en el encabezado de una columna que no estaba activa
- **THEN** la URL se actualiza con `?sort=<columna>&dir=asc` y la tabla se reordena

#### Scenario: Clic en columna activa alterna la dirección
- **WHEN** el usuario hace clic en el encabezado de la columna actualmente activa
- **THEN** la dirección cambia de `asc` a `desc` o viceversa en la URL

#### Scenario: Parámetro sort inválido hace fallback silencioso
- **WHEN** la URL contiene `?sort=invalido&dir=invalido`
- **THEN** la tabla usa `lastInteraction DESC` sin emitir error 400

#### Scenario: Ordenación por nombre coloca nulls al final
- **WHEN** la URL contiene `?sort=name&dir=asc` y hay usuarios sin firstName
- **THEN** los usuarios con `firstName = null` aparecen al final de la lista

#### Scenario: Ordenación por Pedidos usa conteo de relación
- **WHEN** la URL contiene `?sort=orders&dir=desc`
- **THEN** los usuarios con más pedidos aparecen primero

---

### Requirement: Indicador visual de columna ordenable activa
Cada encabezado de columna ordenable SHALL mostrar un icono a la derecha que indica el estado de ordenación. El encabezado activo SHALL mostrar `ChevronUp` (asc) o `ChevronDown` (desc) en color `foreground`. Los encabezados inactivos ordenables SHALL mostrar `ChevronsUpDown` en color `muted-foreground/50`. El `<th>` SHALL incluir el atributo `aria-sort` apropiado.

#### Scenario: Icono de columna activa en ascendente
- **WHEN** la columna "Nombre" está activa con `dir=asc`
- **THEN** el encabezado muestra el icono `ChevronUp` en color `foreground` y `aria-sort="ascending"`

#### Scenario: Icono de columna activa en descendente
- **WHEN** la columna "Última interacción" está activa con `dir=desc`
- **THEN** el encabezado muestra el icono `ChevronDown` en color `foreground` y `aria-sort="descending"`

#### Scenario: Icono de columna inactiva ordenable
- **WHEN** la columna "Email" no está activa pero es ordenable
- **THEN** el encabezado muestra `ChevronsUpDown` en color `muted-foreground/50` y `aria-sort="none"`

---

### Requirement: Barra de filtros en la página de usuarios
La página `/users` SHALL mostrar una barra de filtros encima de la tabla compuesta por un search box y un control segmentado de registro. Los filtros SHALL ser server-side: el estado persiste en URL como `?q=<texto>&registered=<true|false>`. Los filtros y el sort SHALL coexistir sin interferirse: cambiar un filtro preserva el sort activo, y cambiar el sort preserva los filtros activos.

#### Scenario: Barra de filtros visible encima de la tabla
- **WHEN** el usuario accede a `/users`
- **THEN** se muestra la barra de filtros (`UsersFilterBar`) encima de la tabla de usuarios

#### Scenario: Cambiar filtro preserva sort activo
- **WHEN** hay un sort activo `?sort=name&dir=asc` y el usuario escribe en el search box
- **THEN** la URL resultante contiene `?sort=name&dir=asc&q=<término>`

#### Scenario: Cambiar sort preserva filtros activos
- **WHEN** hay filtros activos `?q=garcia&registered=true` y el usuario hace clic en una columna
- **THEN** la URL resultante contiene `?sort=<col>&dir=asc&q=garcia&registered=true`

---

### Requirement: Search box para búsqueda de usuarios por nombre o email
El search box SHALL buscar en `firstName`, `lastName` y `email` del usuario (OR lógico, case-insensitive) con un debounce de 300ms antes de actualizar la URL y lanzar la petición. El input SHALL mostrar el icono `Search` a la izquierda y el icono `X` a la derecha cuando tenga contenido para limpiar el campo.

#### Scenario: Búsqueda OR en tres campos
- **WHEN** el usuario escribe "garcia" en el search box
- **THEN** la URL se actualiza con `?q=garcia` y la tabla muestra usuarios con `firstName`, `lastName` o `email` que contienen "garcia" (case-insensitive)

#### Scenario: Debounce de 300ms antes de actualizar URL
- **WHEN** el usuario escribe caracteres rápidamente en el search box
- **THEN** la URL se actualiza solo 300ms después del último carácter escrito (no en cada pulsación)

#### Scenario: Limpiar búsqueda con botón X
- **WHEN** el search box tiene contenido y el usuario hace clic en el icono X
- **THEN** el campo se vacía, el param `q` se elimina de la URL y la tabla muestra todos los usuarios

---

### Requirement: Control segmentado para filtrar por estado de registro
El control segmentado SHALL mostrar tres opciones de selección única: `[Todos]`, `[Registrado]`, `[No registrado]`. La actualización SHALL ser inmediata (sin debounce). El botón activo SHALL mostrar estilos diferenciados (`bg-brand-teal/10 text-brand-teal`). El control SHALL tener `role="group"` y `aria-label="Filtrar por estado de registro"`.

#### Scenario: "Todos" activo por defecto
- **WHEN** la URL no contiene el param `registered`
- **THEN** el botón "Todos" aparece activo (estilo `bg-brand-teal/10`) y la tabla muestra todos los usuarios

#### Scenario: Filtrar solo registrados
- **WHEN** el usuario hace clic en "Registrado"
- **THEN** la URL se actualiza con `?registered=true` y la tabla muestra solo usuarios con `isRegistered = true`

#### Scenario: Filtrar solo no registrados
- **WHEN** el usuario hace clic en "No registrado"
- **THEN** la URL se actualiza con `?registered=false` y la tabla muestra solo usuarios con `isRegistered = false`

#### Scenario: Volver a Todos limpia el param
- **WHEN** hay un filtro `?registered=true` activo y el usuario hace clic en "Todos"
- **THEN** el param `registered` se elimina de la URL

#### Scenario: Valor de registered inválido se ignora silenciosamente
- **WHEN** la URL contiene `?registered=invalido`
- **THEN** la tabla se comporta como si `registered` no estuviera (todos los usuarios)

---

### Requirement: Chips de filtros activos y botón limpiar todo
Cuando hay ≥1 filtro activo, SHALL aparecer una fila de chips debajo de la barra de filtros mostrando los valores activos. Cada chip SHALL tener un botón ✕ para eliminar ese filtro individualmente sin afectar los demás. Un botón "Limpiar todo" SHALL eliminar todos los filtros preservando el sort activo.

#### Scenario: Chips aparecen solo con filtros activos
- **WHEN** no hay filtros activos (`q` ni `registered` en URL)
- **THEN** la fila de chips NO se muestra

#### Scenario: Chip de búsqueda muestra el término entre comillas
- **WHEN** el filtro `?q=garcia` está activo
- **THEN** aparece un chip con el texto `"garcia"` y un botón ✕

#### Scenario: Chip de registro muestra etiqueta legible
- **WHEN** el filtro `?registered=true` está activo
- **THEN** aparece un chip con el texto "Registrado" (no el valor enum crudo)

#### Scenario: ✕ individual elimina solo ese filtro
- **WHEN** hay filtros `?q=garcia&registered=true` y el usuario hace clic en ✕ del chip "garcia"
- **THEN** la URL queda `?registered=true` (el filtro de registro se mantiene)

#### Scenario: Limpiar todo elimina filtros pero mantiene sort
- **WHEN** la URL es `?sort=name&dir=asc&q=garcia&registered=true` y el usuario hace clic en "Limpiar todo"
- **THEN** la URL queda `?sort=name&dir=asc` (sort preservado, filtros eliminados)

---

### Requirement: Subtítulo dinámico y empty state adaptativo en usuarios
La página `/users` SHALL mostrar un subtítulo dinámico con el número de usuarios filtrados: `"N usuario(s) encontrado(s)"` donde N es `meta.total` devuelto por la API (siempre refleja el count filtrado). El empty state SHALL distinguir entre tabla vacía sin filtros y sin resultados con filtros activos.

#### Scenario: Subtítulo refleja el count filtrado
- **WHEN** hay 3 usuarios registrados de un total de 10 y el filtro `?registered=true` está activo
- **THEN** el subtítulo muestra "3 usuarios encontrados"

#### Scenario: Empty state sin filtros
- **WHEN** la API devuelve `data: []` y no hay filtros activos
- **THEN** se muestra "Sin usuarios todavía" con mensaje "Los usuarios aparecerán aquí cuando interactúen con Adresles."

#### Scenario: Empty state con filtros activos
- **WHEN** la API devuelve `data: []` y hay al menos un filtro activo
- **THEN** se muestra "Sin resultados" con mensaje "Prueba a ajustar o limpiar los filtros activos."
