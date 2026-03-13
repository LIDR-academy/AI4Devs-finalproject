### Requirement: Barra de filtros sobre la tabla de pedidos
La página `/orders` SHALL renderizar una barra de filtros horizontal encima de la tabla, compuesta por cuatro controles: un search box de texto libre, un dropdown multi-select de Estado, un dropdown multi-select de Modo y un date range picker. Todos los controles SHALL ser `'use client'` agrupados en el componente `OrdersFilterBar`.

El estado de todos los filtros SHALL persistir en la URL mediante query params. Cambiar cualquier filtro SHALL preservar los params de ordenación (`sort`, `dir`) heredados de T01. Cambiar la ordenación SHALL preservar los params de filtro activos.

#### Scenario: Barra visible en /orders con datos
- **WHEN** el administrador accede a `/orders` con pedidos disponibles
- **THEN** se muestra la barra de filtros con los cuatro controles antes de la tabla

#### Scenario: Filtros y sort coexisten en la URL
- **WHEN** el administrador tiene activo `?sort=amount&dir=desc` y selecciona el estado `COMPLETED`
- **THEN** la URL pasa a ser `?sort=amount&dir=desc&status=COMPLETED` (ambos params presentes)

#### Scenario: Sort preserva filtros activos
- **WHEN** el administrador tiene activo `?status=COMPLETED` y hace clic en la columna "Importe"
- **THEN** la URL pasa a ser `?sort=amount&dir=asc&status=COMPLETED` (el filtro no desaparece)

---

### Requirement: Search box con debounce y búsqueda multi-columna
El search box SHALL buscar en `store.name`, `externalOrderNumber`, `user.firstName` y `user.lastName` con lógica OR y comparación case-insensitive. La búsqueda SHALL ser server-side: el frontend actualiza el param `?q=<término>` en la URL tras un debounce de 300 ms, provocando un nuevo fetch desde el Server Component.

El search box SHALL mostrar un icono `Search` a la izquierda y un icono `X` a la derecha cuando el campo tiene contenido. Al pulsar el `X` SHALL limpiar el campo y eliminar el param `q` de la URL.

#### Scenario: Búsqueda por nombre de tienda
- **WHEN** el administrador escribe "Zara" en el search box
- **THEN** tras 300 ms la URL se actualiza con `?q=Zara` y la tabla muestra solo pedidos cuya tienda contiene "Zara" (case-insensitive)

#### Scenario: Búsqueda por referencia de pedido
- **WHEN** el administrador escribe "#1001" en el search box
- **THEN** la tabla muestra solo pedidos cuyo `externalOrderNumber` contiene "#1001"

#### Scenario: Búsqueda por nombre de usuario
- **WHEN** el administrador escribe "García" en el search box
- **THEN** la tabla muestra pedidos cuyo `user.firstName` o `user.lastName` contiene "García"

#### Scenario: Búsqueda case-insensitive
- **WHEN** el administrador escribe "zara" (minúsculas)
- **THEN** la tabla muestra pedidos de tienda "Zara" (coincidencia sin distinción de mayúsculas)

#### Scenario: Botón clear limpia el filtro
- **WHEN** el search box tiene valor "García" y el administrador pulsa el icono X
- **THEN** el campo se vacía, el param `q` desaparece de la URL y la tabla muestra todos los pedidos (con los demás filtros activos)

#### Scenario: Debounce evita peticiones inmediatas
- **WHEN** el administrador escribe "Z", "Za", "Zar" en rápida sucesión
- **THEN** solo se lanza una petición al servidor (con el término final) tras 300 ms sin nuevas pulsaciones

---

### Requirement: Filtro de Estado multi-select
El dropdown de Estado SHALL mostrar los 5 valores posibles de `OrderStatus` como checkboxes con un punto de color identificativo (alineado con `OrderStatusBadge`). Seleccionar múltiples estados SHALL aplicar lógica OR: la tabla mostrará pedidos que cumplan CUALQUIERA de los estados seleccionados.

El trigger SHALL mostrar el texto "Estado" y, cuando hay ≥1 selección, un badge con el número de estados activos. El color del trigger SHALL cambiar a `brand-teal` cuando hay filtros activos. Cada toggle SHALL actualizar la URL inmediatamente (sin botón "Aplicar").

La URL SHALL codificar los estados como CSV en el param `status`: `?status=PENDING_ADDRESS,COMPLETED`.

#### Scenario: Seleccionar un estado filtra la tabla
- **WHEN** el administrador abre el dropdown y marca "Dirección pendiente"
- **THEN** la URL se actualiza con `?status=PENDING_ADDRESS` y la tabla muestra solo pedidos con ese estado

#### Scenario: Seleccionar múltiples estados aplica OR
- **WHEN** el administrador marca "Completado" y "Cancelado"
- **THEN** la URL contiene `?status=COMPLETED,CANCELED` y la tabla muestra pedidos en cualquiera de esos dos estados

#### Scenario: Deseleccionar un estado lo elimina del filtro
- **WHEN** el dropdown tiene "Completado" y "Cancelado" activos y el administrador desmarca "Cancelado"
- **THEN** la URL queda `?status=COMPLETED` y la tabla muestra solo pedidos completados

#### Scenario: Badge muestra el número de estados seleccionados
- **WHEN** hay 2 estados seleccionados
- **THEN** el trigger muestra "Estado" con un badge numérico "2" y color `brand-teal`

#### Scenario: Valor inválido en URL ignorado silenciosamente
- **WHEN** la URL contiene `?status=INVALID_VALUE`
- **THEN** el filtro se ignora (no error 400), la tabla muestra todos los pedidos sin filtrar por estado

---

### Requirement: Filtro de Modo multi-select
El dropdown de Modo SHALL seguir el mismo patrón que el filtro de Estado, con los 2 valores de `OrderMode`: `ADRESLES` ("Adresles") y `TRADITIONAL` ("Tradicional").

La URL SHALL codificar los modos como CSV en el param `mode`: `?mode=ADRESLES`.

#### Scenario: Filtrar por modo Adresles
- **WHEN** el administrador selecciona "Adresles" en el dropdown de Modo
- **THEN** la URL se actualiza con `?mode=ADRESLES` y la tabla muestra solo pedidos con `orderMode = ADRESLES`

#### Scenario: Seleccionar ambos modos equivale a sin filtro de modo
- **WHEN** el administrador selecciona "Adresles" y "Tradicional"
- **THEN** la URL contiene `?mode=ADRESLES,TRADITIONAL` y la tabla muestra todos los pedidos independientemente del modo

#### Scenario: Badge muestra el número de modos seleccionados
- **WHEN** hay 1 modo seleccionado
- **THEN** el trigger muestra "Modo" con badge "1" y color `brand-teal`

---

### Requirement: Date Range Picker (rango de fechas)
El date range picker SHALL usar un `Popover` de Shadcn con dos `<input type="date">` nativos etiquetados "Desde" y "Hasta". El popover SHALL tener dos botones: "Limpiar" (elimina el rango) y "Aplicar" (confirma y cierra el popover).

El trigger SHALL mostrar el icono `CalendarIcon` y el texto "Fecha"; cuando hay rango activo SHALL mostrar el rango formateado: `📅 1 Feb – 25 Feb`.

Las fechas SHALL filtrarse sobre `webhookReceivedAt`: `from` es inclusivo desde `00:00:00.000 UTC`, `to` es inclusivo hasta `23:59:59.999 UTC`. La URL SHALL usar formato `YYYY-MM-DD`: `?from=2026-02-01&to=2026-02-25`.

El campo "Hasta" SHALL tener `min` igual al valor de "Desde". El campo "Desde" SHALL tener `max` igual al valor de "Hasta". Es válido especificar solo "Desde" o solo "Hasta".

#### Scenario: Aplicar rango completo filtra la tabla
- **WHEN** el administrador introduce "Desde: 2026-02-01" y "Hasta: 2026-02-28" y pulsa "Aplicar"
- **THEN** la URL se actualiza con `?from=2026-02-01&to=2026-02-28` y la tabla muestra solo pedidos cuyo `webhookReceivedAt` está en ese rango (día completo incluido)

#### Scenario: Aplicar solo "Desde" filtra a partir de esa fecha
- **WHEN** el administrador introduce solo "Desde: 2026-02-15" y pulsa "Aplicar"
- **THEN** la URL contiene `?from=2026-02-15` (sin `to`) y la tabla muestra pedidos desde el 15 de febrero en adelante

#### Scenario: Botón Limpiar elimina el rango
- **WHEN** hay un rango activo `?from=2026-02-01&to=2026-02-28` y el administrador abre el popover y pulsa "Limpiar"
- **THEN** los params `from` y `to` desaparecen de la URL y la tabla muestra pedidos sin filtro de fecha

#### Scenario: Trigger muestra el rango formateado
- **WHEN** el rango activo es `from=2026-02-01&to=2026-02-28`
- **THEN** el trigger muestra "📅 1 Feb – 28 Feb"

#### Scenario: Campo Hasta no permite fecha anterior a Desde
- **WHEN** el administrador introduce "Desde: 2026-02-15"
- **THEN** el campo "Hasta" tiene `min="2026-02-15"` y no permite seleccionar fechas anteriores

---

### Requirement: Chips de filtros activos con limpieza individual
Cuando hay ≥1 filtro activo, SHALL mostrarse una fila de chips debajo de la barra de filtros. Cada chip muestra el valor del filtro en texto legible (no el enum crudo). Cada chip tiene un icono `X` que al pulsarlo elimina solo ese filtro. Al final de la fila SHALL aparecer el enlace "Limpiar todo" que elimina todos los filtros pero preserva el sort activo.

Los chips de estado y modo SHALL mostrar su etiqueta en español. Los chips de fecha SHALL mostrar el rango formateado. El chip de búsqueda SHALL mostrar el término entre comillas: `"zara"`.

#### Scenario: Chips visibles cuando hay filtros activos
- **WHEN** hay `?status=COMPLETED&mode=ADRESLES` en la URL
- **THEN** se muestran dos chips: "Completado" y "Adresles", con color `brand-teal`

#### Scenario: No se muestran chips sin filtros activos
- **WHEN** la URL solo contiene `?sort=date&dir=desc`
- **THEN** la fila de chips no es visible

#### Scenario: Chip X elimina solo ese filtro
- **WHEN** hay chips "Completado" y "Adresles" y el administrador pulsa X en "Completado"
- **THEN** la URL pasa a `?mode=ADRESLES` (solo queda el filtro de modo) y desaparece el chip de estado

#### Scenario: Limpiar todo elimina filtros preservando sort
- **WHEN** la URL es `?status=COMPLETED&mode=ADRESLES&sort=amount&dir=desc` y el administrador pulsa "Limpiar todo"
- **THEN** la URL pasa a `?sort=amount&dir=desc` (sin filtros, sort preservado)

---

### Requirement: Endpoint GET /admin/orders acepta parámetros de filtro
El endpoint `GET /api/admin/orders` SHALL aceptar los query params opcionales `q`, `status`, `mode`, `from` y `to`. Todos son opcionales; si no se proporcionan, el comportamiento es equivalente al endpoint sin filtros.

Los filtros SHALL aplicarse con lógica AND entre sí: el resultado debe cumplir TODOS los filtros activos simultáneamente. Dentro de `status` (multi-valor) y dentro de `mode` (multi-valor) la lógica SHALL ser OR.

El campo `meta.total` de la respuesta SHALL reflejar el número de pedidos que cumplen los filtros activos, no el total global.

#### Scenario: Búsqueda de texto filtra en 4 columnas
- **WHEN** el cliente llama a `GET /api/admin/orders?q=garcia`
- **THEN** la respuesta incluye solo pedidos donde `store.name`, `externalOrderNumber`, `user.firstName` o `user.lastName` contiene "garcia" (case-insensitive)

#### Scenario: Filtro de status multi-valor aplica OR
- **WHEN** el cliente llama a `GET /api/admin/orders?status=COMPLETED,CANCELED`
- **THEN** la respuesta incluye pedidos con `status = COMPLETED` OR `status = CANCELED`

#### Scenario: Filtro de modo
- **WHEN** el cliente llama a `GET /api/admin/orders?mode=ADRESLES`
- **THEN** la respuesta incluye solo pedidos con `orderMode = ADRESLES`

#### Scenario: Filtro de rango de fechas
- **WHEN** el cliente llama a `GET /api/admin/orders?from=2026-02-01&to=2026-02-28`
- **THEN** la respuesta incluye solo pedidos con `webhookReceivedAt` entre `2026-02-01T00:00:00Z` y `2026-02-28T23:59:59.999Z`

#### Scenario: Filtros combinados aplican AND
- **WHEN** el cliente llama a `GET /api/admin/orders?q=zara&status=COMPLETED&mode=ADRESLES`
- **THEN** la respuesta incluye solo pedidos que cumplen TODOS: contienen "zara" en las columnas buscadas, tienen status COMPLETED y modo ADRESLES

#### Scenario: meta.total refleja el count filtrado
- **WHEN** el cliente llama a `GET /api/admin/orders?status=COMPLETED` y hay 3 pedidos completados de un total de 10
- **THEN** la respuesta tiene `meta.total = 3`

#### Scenario: status inválido ignorado silenciosamente
- **WHEN** el cliente llama a `GET /api/admin/orders?status=INVALID_STATUS`
- **THEN** la respuesta devuelve todos los pedidos sin filtrar y status HTTP 200 (no 400)

#### Scenario: Compatibilidad con sort de T01
- **WHEN** el cliente llama a `GET /api/admin/orders?q=zara&sortBy=amount&sortDir=desc`
- **THEN** la respuesta devuelve pedidos filtrados por "zara" y ordenados por importe descendente
