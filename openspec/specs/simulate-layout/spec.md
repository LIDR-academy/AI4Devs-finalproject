# Spec: Simulate Layout — Dashboard Admin

> **Origen**: [`cu03-a4-simulate-layout`](../../changes/archive/2026-02-28-cu03-a4-simulate-layout/)  
> **Última actualización**: 2026-03-01

---

### Requirement: Enlace de simulación en el sidebar

El sidebar de navegación del Dashboard Admin SHALL incluir un ítem "Simulación" con el icono `MessageSquare` que enlaza a la ruta `/simulate`. El ítem SHALL mostrar el estilo activo (borde izquierdo + fondo) cuando `pathname.startsWith('/simulate')` sea verdadero.

#### Scenario: Ítem visible en el sidebar

- **WHEN** el administrador carga cualquier página del Dashboard Admin
- **THEN** el sidebar SHALL mostrar el ítem "Simulación" debajo de "Usuarios"

#### Scenario: Activación del ítem al navegar a /simulate

- **WHEN** el administrador navega a `/simulate` o a cualquier sub-ruta que empiece por `/simulate`
- **THEN** el ítem "Simulación" SHALL mostrar el estilo activo (clase `border-l-2 border-brand-lime bg-white/5 text-brand-lime`)
- **AND** los otros ítems del sidebar NO deben mostrar el estilo activo

#### Scenario: Desactivación del ítem al salir de /simulate

- **WHEN** el administrador navega a una ruta distinta (p.ej. `/orders`)
- **THEN** el ítem "Simulación" SHALL mostrar el estilo inactivo

---

### Requirement: Carga de datos de simulación en el servidor

La página `/simulate` SHALL precargar en el servidor (Server Component) la lista de tiendas y la lista de usuarios antes de renderizar, usando `Promise.all` para obtener ambas en paralelo.

#### Scenario: Precarga paralela de stores y usuarios

- **WHEN** el administrador navega a `/simulate`
- **THEN** el servidor SHALL llamar a `getStores()` y `getUsersForSimulate()` en paralelo
- **AND** pasar `stores` y `users` como props al Client Component `SimulationPage`

#### Scenario: Estado de carga mientras se precargan los datos

- **WHEN** la precarga está en curso
- **THEN** Next.js SHALL mostrar el contenido de `loading.tsx` (skeleton con barra animada)

#### Scenario: Error en la precarga de datos

- **WHEN** `getStores()` o `getUsersForSimulate()` lanza un error
- **THEN** Next.js SHALL mostrar el contenido de `error.tsx` con el mensaje "No se pudo cargar la simulación" y un botón "Reintentar"

---

### Requirement: Layout vertical de tres zonas en /simulate

La página `/simulate` SHALL mostrar un layout vertical con tres zonas usando `flex flex-col h-full`:
- **Zona A** (barra de resumen): `shrink-0`, siempre visible
- **Zona B** (área de chat): ocupa el espacio restante; cuando no hay conversación activa, es `flex-1 overflow-y-auto` implícitamente en `SimulationEmptyState`; cuando hay conversación activa, el wrapper es `flex-1 flex flex-col overflow-hidden` para que `SimulationChat` gestione su propio scroll interno
- **Zona C** (input): gestionada internamente por `SimulationChat` — ya no es un div separado en `SimulationPage`

#### Scenario: Layout ocupa la altura completa de la pantalla

- **WHEN** el administrador abre `/simulate` en pantalla completa
- **THEN** el layout SHALL ocupar toda la altura disponible sin desbordamiento de scroll en el contenedor raíz
- **AND** solo la zona de mensajes dentro de `SimulationChat` SHALL tener scroll vertical interno

#### Scenario: Estado vacío — sin conversación activa

- **WHEN** `activeConversation` es `null`
- **THEN** `SimulationPage` SHALL renderizar `SimulationEmptyState` directamente (sin wrapper adicional de zona B/C)
- **AND** la Zona C (input) SHALL estar completamente ausente del DOM

#### Scenario: Chat activo — con conversación activa

- **WHEN** `activeConversation` tiene un valor válido
- **THEN** `SimulationPage` SHALL renderizar un wrapper `div.flex-1.flex.flex-col.overflow-hidden` conteniendo `SimulationChat`
- **AND** `SimulationChat` SHALL gestionar internamente la zona de mensajes scrollable (Zona B) y el input fijo (Zona C)
- **AND** NO SHALL existir ningún div placeholder de Zona C separado en `SimulationPage`

---

### Requirement: Barra de resumen de pedido activo (Zona A)

La barra superior (`OrderSummaryBar`) SHALL mostrar siempre el título "Simulación de Compras" y el botón "Nueva Simulación". Cuando hay una conversación activa, SHALL mostrar adicionalmente el resumen del pedido y el botón "Cambiar pedido".

#### Scenario: Estado sin conversación activa

- **WHEN** `summary` es `null`
- **THEN** la barra SHALL mostrar solo el título y el botón "+ Nueva Simulación"
- **AND** el botón "Cambiar pedido" NO debe estar visible

#### Scenario: Estado con conversación activa

- **WHEN** `summary` es una cadena no vacía
- **THEN** la barra SHALL mostrar el resumen debajo del título
- **AND** el botón "✎ Cambiar pedido" SHALL estar visible junto a "+ Nueva Simulación"

---

### Requirement: Estado vacío de la zona de chat (Zona B)

Cuando no hay conversación activa, la Zona B SHALL mostrar un estado vacío centrado verticalmente y horizontalmente con: icono `MessageSquare`, texto "Ninguna simulación activa", subtexto "Configura un pedido para comenzar" y un botón "+ Nueva Simulación".

#### Scenario: Estado vacío visible sin conversación activa

- **WHEN** `activeConversation` es `null`
- **THEN** la Zona B SHALL mostrar `SimulationEmptyState` centrado en el área disponible

#### Scenario: Estado vacío se reemplaza al iniciar conversación

- **WHEN** `onConversationStarted` se llama con datos de conversación válidos
- **THEN** `SimulationEmptyState` SHALL dejar de renderizarse
- **AND** `SimulationChat` SHALL ocupar la Zona B

#### Scenario: Botón "Nueva Simulación" en estado vacío abre el modal

- **WHEN** el administrador hace clic en "+ Nueva Simulación" desde el estado vacío
- **THEN** `modalOpen` SHALL cambiar a `true`
- **AND** `OrderConfigModal` SHALL renderizarse
