## MODIFIED Requirements

### Requirement: Sección Productos

El modal SHALL mostrar un botón "Productos aleatorios" que seleccione una entrada aleatoria de `FAKE_ORDERS` y la cargue en la tabla de ítems. La tabla SHALL ser editable (nombre, cantidad, precio por fila). El total SHALL calcularse automáticamente como `sum(quantity × price)`. El campo Moneda SHALL tener valor por defecto `EUR`. **Al abrir el modal, la tabla de productos SHALL inicializarse automáticamente con una entrada aleatoria de `FAKE_ORDERS`**, usando un lazy initializer en `useState` y regenerando en `handleReset()`. El botón "Productos aleatorios" sigue disponible para regenerar la selección manualmente.

#### Scenario: Productos pre-rellenados al abrir el modal

- **WHEN** el administrador abre el modal por primera vez o después de un reset
- **THEN** la tabla de productos SHALL estar rellenada con los ítems de `getRandomOrder().items`
- **AND** el total SHALL calcularse automáticamente desde esos ítems
- **AND** los campos de producto SHALL ser editables (no readonly)

#### Scenario: Botón "Productos aleatorios" regenera ítems

- **WHEN** el administrador pulsa "Productos aleatorios"
- **THEN** la tabla SHALL rellenarse con una nueva entrada aleatoria de `getRandomOrder().items`
- **AND** el total SHALL recalcularse automáticamente

#### Scenario: Cálculo automático del total al editar

- **WHEN** el administrador modifica cantidad o precio de un ítem
- **THEN** el total SHALL recalcularse en tiempo real como `sum(item.quantity × item.price)`

---

### Requirement: Campo Modo (toggle ADRESLES / TRADICIONAL)

El modal SHALL mostrar dos botones de toggle: `ADRESLES` y `TRADICIONAL`. El valor por defecto SHALL ser `ADRESLES`. El modo seleccionado SHALL controlar qué secciones condicionales son visibles. **Al activar TRADICIONAL, si el campo de dirección de entrega está completamente vacío (`line1`, `postalCode`, `city` y `country` todos en `''`), SHALL pre-rellenarse automáticamente con `getRandomAddress()`. Si la dirección ya contiene datos, se conserva sin cambios.**

#### Scenario: Modo ADRESLES seleccionado por defecto

- **WHEN** el modal se abre por primera vez
- **THEN** el toggle SHALL mostrar `ADRESLES` como activo
- **AND** la sección "Parámetros simulados del eCommerce" SHALL estar visible
- **AND** la sección "Dirección" SHALL estar oculta

#### Scenario: Cambio a modo TRADICIONAL con dirección vacía

- **WHEN** el administrador pulsa el toggle "TRADICIONAL"
- **AND** los campos de dirección de entrega están completamente vacíos
- **THEN** la sección "Dirección" SHALL aparecer con los campos pre-rellenados con `getRandomAddress()`
- **AND** la sección "Parámetros simulados del eCommerce" SHALL ocultarse

#### Scenario: Cambio a modo TRADICIONAL con dirección ya rellenada

- **WHEN** el administrador pulsa el toggle "TRADICIONAL"
- **AND** los campos de dirección de entrega contienen datos previos
- **THEN** la sección "Dirección" SHALL aparecer conservando los datos existentes sin sobreescribirlos

---

### Requirement: Campo Comprador (combobox con búsqueda y filtro de registro)

El modal SHALL incluir un combobox (`UserCombobox`) que permita buscar usuarios de la DB por `firstName`, `lastName` o `phone.e164`. Al seleccionar un usuario, los campos nombre, apellidos y teléfono SHALL autocomplete con sus datos (`phone.e164`) y quedar como `readonly`. Un botón "Introducir manualmente" SHALL limpiar la selección y permitir edición libre. **El combobox SHALL mostrar tres pills de filtro (`[Todos]` / `[Adresles]` / `[No Adresles]`) alineadas a la derecha del label. Las pills filtran la lista del dropdown por el campo `isRegistered` del usuario y se combinan con la búsqueda por texto de cmdk. El filtro SHALL inicializarse a `Todos` en cada apertura del modal.**

#### Scenario: Búsqueda y selección de usuario de DB

- **WHEN** el administrador escribe en el combobox del comprador
- **THEN** SHALL filtrarse la lista de usuarios por coincidencia en `firstName`, `lastName` o `phone.e164`
- **AND** al seleccionar un usuario, los campos nombre, apellidos y teléfono SHALL rellenarse con sus datos y pasar a `readonly`

#### Scenario: Filtro "Adresles" muestra solo usuarios registrados

- **WHEN** el administrador pulsa la pill `[Adresles]`
- **THEN** el dropdown SHALL mostrar únicamente los usuarios con `isRegistered = true`
- **AND** la pill `[Adresles]` SHALL marcarse como activa visualmente (fondo sólido)

#### Scenario: Filtro "No Adresles" muestra solo usuarios no registrados

- **WHEN** el administrador pulsa la pill `[No Adresles]`
- **THEN** el dropdown SHALL mostrar únicamente los usuarios con `isRegistered = false`
- **AND** la pill `[No Adresles]` SHALL marcarse como activa visualmente

#### Scenario: Filtro "Todos" restablece la lista completa

- **WHEN** el administrador pulsa la pill `[Todos]`
- **THEN** el dropdown SHALL mostrar todos los usuarios sin discriminar por `isRegistered`

#### Scenario: Filtro combinado con búsqueda por texto

- **WHEN** el administrador selecciona la pill `[Adresles]` y escribe un texto en el combobox
- **THEN** el dropdown SHALL mostrar únicamente los usuarios con `isRegistered = true` cuyo `firstName`, `lastName` o `phone.e164` contengan el texto buscado

#### Scenario: Filtro se resetea al cerrar el modal

- **WHEN** el modal se cierra (por Cancelar, × o submit exitoso)
- **THEN** el filtro del combobox de Comprador SHALL volver a `Todos` en la próxima apertura

#### Scenario: Badge de usuario registrado en Adresles

- **WHEN** el usuario seleccionado tiene `isRegistered = true`
- **THEN** SHALL aparecer un badge verde con el texto `"Registrado Adresles · N dirección(es)"`
- **AND** N SHALL corresponder al valor `adminUser._count.addresses`

#### Scenario: Badge de usuario no registrado en Adresles

- **WHEN** el usuario seleccionado tiene `isRegistered = false`
- **THEN** SHALL aparecer un badge gris con el texto `"No Registrado Adresles · 0 direcciones"`

#### Scenario: Introducción manual sin usuario de DB

- **WHEN** el administrador pulsa "Introducir manualmente"
- **THEN** la selección SHALL limpiarse
- **AND** los campos nombre, apellidos y teléfono SHALL quedar editables (no `readonly`)
- **AND** no SHALL mostrarse ningún badge

#### Scenario: Botón deshabilitado sin comprador válido

- **WHEN** los campos `firstName` o `phone` del comprador están vacíos
- **THEN** el botón "Simular Compra" SHALL estar deshabilitado

---

### Requirement: Toggle ¿Es regalo? y sección Destinatario

El modal SHALL incluir un toggle "¿Es regalo?" desactivado por defecto. Al activarlo, SHALL aparecer una sección "Destinatario del regalo" con el mismo `UserCombobox` del Comprador (búsqueda en DB, entrada manual y badges). **El `UserCombobox` del destinatario SHALL incluir también las tres pills de filtro de registro (`[Todos]` / `[Adresles]` / `[No Adresles]`) con el mismo comportamiento que el combobox del Comprador.**

#### Scenario: Sección destinatario oculta por defecto

- **WHEN** el modal se abre
- **THEN** el toggle "¿Es regalo?" SHALL estar desactivado
- **AND** la sección "Destinatario del regalo" SHALL estar oculta

#### Scenario: Sección destinatario visible al activar toggle

- **WHEN** el administrador activa el toggle "¿Es regalo?"
- **THEN** la sección "Destinatario del regalo" SHALL aparecer con su propio `UserCombobox`
- **AND** el combobox del destinatario SHALL incluir las pills de filtro de registro inicializadas a `Todos`

#### Scenario: Filtros de Comprador y Destinatario son independientes

- **WHEN** el administrador cambia el filtro del combobox del Comprador a `[Adresles]`
- **THEN** el filtro del combobox del Destinatario SHALL permanecer en su propio estado sin verse afectado

---

### Requirement: Sección Parámetros simulados del eCommerce (solo modo ADRESLES)

Cuando el modo es ADRESLES, el modal SHALL mostrar: toggle "¿El comprador está registrado en el eCommerce?" (por defecto desactivado). Si activado, SHALL aparecer toggle "¿Tiene dirección guardada en el eCommerce?" (por defecto desactivado). Si este segundo toggle está activado, SHALL mostrarse campos de dirección más botón "Dirección aleatoria". **Al activar el toggle "¿Tiene dirección guardada en el eCommerce?", si los campos de la dirección eCommerce están completamente vacíos, SHALL pre-rellenarse automáticamente con `getRandomAddress()`. Si la dirección ya contiene datos, se conserva sin cambios. Al desactivar el toggle, la dirección eCommerce SHALL limpiarse a `EMPTY_ADDRESS` (comportamiento existente, sin cambio).**

#### Scenario: Sección eCommerce oculta en modo TRADICIONAL

- **WHEN** el modo es TRADICIONAL
- **THEN** la sección "Parámetros simulados del eCommerce" SHALL estar oculta

#### Scenario: Toggle registrado en eCommerce desactivado

- **WHEN** `buyerRegisteredEcommerce = false`
- **THEN** el toggle de dirección en eCommerce SHALL estar oculto

#### Scenario: Dirección en eCommerce activada con dirección vacía

- **WHEN** `buyerRegisteredEcommerce = true` y el administrador activa `buyerHasEcommerceAddress`
- **AND** los campos de dirección eCommerce están completamente vacíos
- **THEN** los campos de dirección del eCommerce SHALL mostrarse pre-rellenados con `getRandomAddress()`
- **AND** el botón "Dirección aleatoria" SHALL estar disponible y SHALL rellenar los campos con `getRandomAddress()`

#### Scenario: Dirección en eCommerce activada con dirección ya rellenada

- **WHEN** `buyerRegisteredEcommerce = true` y el administrador reactiva `buyerHasEcommerceAddress`
- **AND** los campos de dirección eCommerce ya contienen datos previos
- **THEN** los campos SHALL mostrarse conservando los datos existentes sin sobreescribirlos

#### Scenario: Desactivar switch limpia la dirección eCommerce

- **WHEN** el administrador desactiva el toggle "¿Tiene dirección guardada en el eCommerce?"
- **THEN** los campos de dirección eCommerce SHALL limpiarse a valores vacíos (`EMPTY_ADDRESS`)
