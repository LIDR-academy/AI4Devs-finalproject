## MODIFIED Requirements

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
