## MODIFIED Requirements

### Requirement: Submit — llamada a POST /api/mock/orders

Al pulsar "Simular Compra", el sistema SHALL construir el payload `CreateMockOrderPayload`, llamar a `startSimulation()`, y en caso de éxito cerrar el modal y notificar a `SimulationPage`. Durante la llamada el botón SHALL estar deshabilitado y mostrar un spinner. En caso de error SHALL mostrarse un toast destructivo y el modal permanecer abierto.

**Cambio respecto a la spec anterior**: el payload ya NO incluye el campo `external_order_id`. El backend genera automáticamente el `externalOrderId` según la plataforma de la tienda seleccionada. El tipo `CreateMockOrderPayload` en `types/api.ts` define `external_order_id` como campo **opcional** (`external_order_id?: string`).

#### Scenario: Submit exitoso — payload sin external_order_id

- **WHEN** el administrador pulsa "Simular Compra" con el formulario válido
- **THEN** `startSimulation(payload)` SHALL ser llamado con el payload correcto
- **AND** el payload NO incluye el campo `external_order_id` (ni `"SIM-<timestamp>"` ni ningún otro valor generado en el frontend)
- **AND** el modal SHALL cerrarse
- **AND** `onConversationStarted` SHALL ser llamado con `{ conversationId, orderId, summary }`

#### Scenario: Estado de carga durante el submit

- **WHEN** `startSimulation()` está en progreso
- **THEN** el botón "Simular Compra" SHALL mostrar un spinner (`Loader2`) y estar deshabilitado

#### Scenario: Error en el submit

- **WHEN** `startSimulation()` lanza una excepción
- **THEN** SHALL aparecer un toast destructivo con el mensaje "Error al crear la simulación. Inténtalo de nuevo."
- **AND** el modal SHALL permanecer abierto con el formulario intacto
