## ADDED Requirements

### Requirement: Apertura del modal desde SimulationPage

El sistema SHALL abrir `OrderConfigModal` cuando el administrador pulse "+ Nueva Simulación" (en `OrderSummaryBar` o en `SimulationEmptyState`) o "✎ Cambiar pedido" (en `OrderSummaryBar`). El modal SHALL cerrarse sin cambios al pulsar "Cancelar" o el botón `×` del Dialog.

#### Scenario: Abrir modal con "Nueva Simulación"

- **WHEN** el administrador pulsa "+ Nueva Simulación" desde cualquier punto de la página `/simulate`
- **THEN** `OrderConfigModal` SHALL renderizarse con `open=true`
- **AND** el formulario SHALL mostrarse con los valores por defecto: Modo = ADRESLES, ¿Es regalo? = desactivado, Moneda = EUR

#### Scenario: Cerrar modal sin submit

- **WHEN** el administrador pulsa "Cancelar" o el icono `×` del Dialog
- **THEN** `OrderConfigModal` SHALL cerrarse (`open=false`)
- **AND** `SimulationPage` SHALL permanecer en su estado anterior sin cambios

---

### Requirement: Campo Tienda (obligatorio)

El modal SHALL mostrar un `Select` de Shadcn con todas las tiendas recibidas por prop (`stores: SimulateStore[]`). Cada opción SHALL mostrar el nombre de la tienda y el nombre del eCommerce (`ecommerceName`). No SHALL ser posible pulsar "Simular Compra" sin haber seleccionado una tienda.

#### Scenario: Selección de tienda

- **WHEN** el administrador abre el select de tienda y elige una opción
- **THEN** la tienda seleccionada SHALL quedar registrada en el estado del formulario
- **AND** la opción SHALL mostrar `"${store.name} — ${store.ecommerceName}"`

#### Scenario: Botón deshabilitado sin tienda

- **WHEN** no se ha seleccionado ninguna tienda
- **THEN** el botón "Simular Compra" SHALL estar deshabilitado (`disabled=true`)

---

### Requirement: Campo Modo (toggle ADRESLES / TRADICIONAL)

El modal SHALL mostrar dos botones de toggle: `ADRESLES` y `TRADICIONAL`. El valor por defecto SHALL ser `ADRESLES`. El modo seleccionado SHALL controlar qué secciones condicionales son visibles.

#### Scenario: Modo ADRESLES seleccionado por defecto

- **WHEN** el modal se abre por primera vez
- **THEN** el toggle SHALL mostrar `ADRESLES` como activo
- **AND** la sección "Parámetros simulados del eCommerce" SHALL estar visible
- **AND** la sección "Dirección" SHALL estar oculta

#### Scenario: Cambio a modo TRADICIONAL

- **WHEN** el administrador pulsa el toggle "TRADICIONAL"
- **THEN** la sección "Dirección" SHALL aparecer
- **AND** la sección "Parámetros simulados del eCommerce" SHALL ocultarse

---

### Requirement: Campo Comprador (combobox con búsqueda)

El modal SHALL incluir un combobox (`UserCombobox`) que permita buscar usuarios de la DB por `firstName`, `lastName` o `phone.e164`. Al seleccionar un usuario, los campos nombre, apellidos y teléfono SHALL autocomplete con sus datos (`phone.e164`) y quedar como `readonly`. Un botón "Introducir manualmente" SHALL limpiar la selección y permitir edición libre.

#### Scenario: Búsqueda y selección de usuario de DB

- **WHEN** el administrador escribe en el combobox del comprador
- **THEN** SHALL filtrarse la lista de usuarios por coincidencia en `firstName`, `lastName` o `phone.e164`
- **AND** al seleccionar un usuario, los campos nombre, apellidos y teléfono SHALL rellenarse con sus datos y pasar a `readonly`

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

### Requirement: Sección Dirección (solo modo TRADICIONAL)

Cuando el modo es TRADICIONAL, el modal SHALL mostrar los campos de dirección al estilo eCommerce: **Dirección** (texto libre, obligatorio), **Dirección 2** (texto libre, opcional — para piso, puerta, bloque, escalera u otra información), **C.P.** (obligatorio), **Ciudad** (obligatorio), **Provincia** (opcional) y **País** (obligatorio). El campo `street` del payload se construye concatenando Dirección + Dirección 2 sin normalizar. `full_address` es la concatenación de street + C.P. + Ciudad + Provincia + País. Un botón "Dirección aleatoria" SHALL rellenar los campos con una entrada aleatoria de `FAKE_ADDRESSES` usando `getRandomAddress()`.

#### Scenario: Sección Dirección oculta en modo ADRESLES

- **WHEN** el modo es ADRESLES
- **THEN** la sección Dirección SHALL estar completamente oculta

#### Scenario: Sección Dirección visible en modo TRADICIONAL

- **WHEN** el modo es TRADICIONAL
- **THEN** los campos de dirección SHALL mostrarse (Dirección, Dirección 2, C.P., Ciudad, Provincia, País)
- **AND** el botón "Dirección aleatoria" SHALL estar disponible

#### Scenario: Botón "Dirección aleatoria" rellena campos

- **WHEN** el administrador pulsa "Dirección aleatoria" en la sección Dirección
- **THEN** los campos SHALL rellenarse con `getRandomAddress().line1`, `line2`, `postalCode`, `city`, `province`, `country`
- **AND** la variedad de las entradas ficticias SHALL reflejar estilos reales de eCommerce (algunos con todo en Dirección, otros con piso/puerta en Dirección 2)

#### Scenario: Validación de campos de dirección obligatorios (modo TRADICIONAL)

- **WHEN** modo es TRADICIONAL y alguno de los campos `Dirección`/`C.P.`/`Ciudad`/`País` está vacío
- **THEN** el botón "Simular Compra" SHALL estar deshabilitado

---

### Requirement: Toggle ¿Es regalo? y sección Destinatario

El modal SHALL incluir un toggle "¿Es regalo?" desactivado por defecto. Al activarlo, SHALL aparecer una sección "Destinatario del regalo" con el mismo `UserCombobox` del Comprador (búsqueda en DB, entrada manual y badges).

#### Scenario: Sección destinatario oculta por defecto

- **WHEN** el modal se abre
- **THEN** el toggle "¿Es regalo?" SHALL estar desactivado
- **AND** la sección "Destinatario del regalo" SHALL estar oculta

#### Scenario: Sección destinatario visible al activar toggle

- **WHEN** el administrador activa el toggle "¿Es regalo?"
- **THEN** la sección "Destinatario del regalo" SHALL aparecer con su propio `UserCombobox`

---

### Requirement: Sección Parámetros simulados del eCommerce (solo modo ADRESLES)

Cuando el modo es ADRESLES, el modal SHALL mostrar: toggle "¿El comprador está registrado en el eCommerce?" (por defecto desactivado). Si activado, SHALL aparecer toggle "¿Tiene dirección guardada en el eCommerce?" (por defecto desactivado). Si este segundo toggle está activado, SHALL mostrarse campos de dirección más botón "Dirección aleatoria".

#### Scenario: Sección eCommerce oculta en modo TRADICIONAL

- **WHEN** el modo es TRADICIONAL
- **THEN** la sección "Parámetros simulados del eCommerce" SHALL estar oculta

#### Scenario: Toggle registrado en eCommerce desactivado

- **WHEN** `buyerRegisteredEcommerce = false`
- **THEN** el toggle de dirección en eCommerce SHALL estar oculto

#### Scenario: Dirección en eCommerce activada

- **WHEN** `buyerRegisteredEcommerce = true` y `buyerHasEcommerceAddress = true`
- **THEN** los campos de dirección del eCommerce SHALL mostrarse (Dirección, Dirección 2, C.P., Ciudad, Provincia, País)
- **AND** el botón "Dirección aleatoria" SHALL estar disponible y SHALL rellenar los campos con `getRandomAddress()`

---

### Requirement: Sección Productos

El modal SHALL mostrar un botón "Productos aleatorios" que seleccione una entrada aleatoria de `FAKE_ORDERS` y la cargue en la tabla de ítems. La tabla SHALL ser editable (nombre, cantidad, precio por fila). El total SHALL calcularse automáticamente como `sum(quantity × price)`. El campo Moneda SHALL tener valor por defecto `EUR`.

#### Scenario: Botón "Productos aleatorios" carga ítems

- **WHEN** el administrador pulsa "Productos aleatorios"
- **THEN** la tabla SHALL rellenarse con los ítems de `getRandomOrder().items`
- **AND** el total SHALL calcularse automáticamente

#### Scenario: Cálculo automático del total al editar

- **WHEN** el administrador modifica cantidad o precio de un ítem
- **THEN** el total SHALL recalcularse en tiempo real como `sum(item.quantity × item.price)`

---

### Requirement: Submit — llamada a POST /api/mock/orders

Al pulsar "Simular Compra", el sistema SHALL construir el payload `CreateMockOrderPayload`, llamar a `startSimulation()`, y en caso de éxito cerrar el modal y notificar a `SimulationPage`. Durante la llamada el botón SHALL estar deshabilitado y mostrar un spinner. En caso de error SHALL mostrarse un toast destructivo y el modal permanecer abierto.

#### Scenario: Submit exitoso

- **WHEN** el administrador pulsa "Simular Compra" con el formulario válido
- **THEN** `startSimulation(payload)` SHALL ser llamado con el payload correcto
- **AND** el modal SHALL cerrarse
- **AND** `onConversationStarted` SHALL ser llamado con `{ conversationId, orderId, summary }`
- **AND** `summary` SHALL tener el formato `"${storeName} · ${firstName} ${lastName} · ${total} ${currency}"`

#### Scenario: Estado de carga durante el submit

- **WHEN** `startSimulation()` está en progreso
- **THEN** el botón "Simular Compra" SHALL mostrar un spinner (`Loader2`) y estar deshabilitado

#### Scenario: Error en el submit

- **WHEN** `startSimulation()` lanza una excepción
- **THEN** SHALL aparecer un toast destructivo con el mensaje "Error al crear la simulación. Inténtalo de nuevo."
- **AND** el modal SHALL permanecer abierto con el formulario intacto

---

### Requirement: gift_recipient en el payload

Cuando `isGift = true` y `giftRecipient` está rellenado, el payload SHALL incluir siempre el objeto `gift_recipient` con `first_name`, `last_name` y `phone`, independientemente de si el destinatario se seleccionó de la DB o se introdujo manualmente. La presencia del objeto implica `is_gift` en el backend (no existe campo `is_gift` separado en el DTO).

#### Scenario: gift_recipient incluido con usuario de DB

- **WHEN** `isGift = true` y el destinatario fue seleccionado de la DB
- **THEN** el payload SHALL incluir `gift_recipient` con los datos del usuario

#### Scenario: gift_recipient incluido con datos manuales

- **WHEN** `isGift = true` y los datos del destinatario fueron introducidos manualmente
- **THEN** el payload SHALL incluir `gift_recipient` con los datos introducidos

#### Scenario: gift_recipient ausente cuando isGift es false

- **WHEN** `isGift = false`
- **THEN** el payload NO SHALL incluir el campo `gift_recipient`
