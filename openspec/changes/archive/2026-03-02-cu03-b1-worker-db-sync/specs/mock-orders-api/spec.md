## MODIFIED Requirements

### Requirement: Endpoint POST /api/mock/orders recibe JSON de compra

El sistema SHALL exponer un endpoint POST /api/mock/orders que reciba un JSON con datos de compra mock y procese el pedido según el modo indicado.

#### Scenario: JSON válido modo adresles

- **WHEN** se envía POST /api/mock/orders con JSON válido (store, buyer, mode: "adresles", items, total_amount, currency)
- **THEN** el sistema responde 201 Created con order_id y conversation_id
- **AND** se crea Order con status PENDING_ADDRESS
- **AND** se busca o crea User por teléfono del buyer
- **AND** se crea Conversation con type GET_ADDRESS
- **AND** se encola job process-conversation en BullMQ

#### Scenario: JSON válido modo tradicional

- **WHEN** se envía POST /api/mock/orders con JSON válido (mode: "tradicional", address completa)
- **THEN** el sistema responde 201 Created con order_id y conversation_id
- **AND** se crea Order con status READY_TO_PROCESS, syncedAt igual a la fecha de creación, y statusSource = 'STORE'
- **AND** se crea OrderAddress inmediatamente con la dirección proporcionada
- **AND** se crea Conversation con type INFORMATION
- **AND** se encola job process-conversation
- **AND** el estado del pedido NO se actualiza a COMPLETED en ningún momento del flujo mock

#### Scenario: JSON inválido - campos requeridos faltantes

- **WHEN** se envía POST /api/mock/orders sin store, buyer.phone o mode
- **THEN** el sistema responde 400 Bad Request con mensaje de validación

#### Scenario: Modo tradicional sin dirección

- **WHEN** se envía POST /api/mock/orders con mode: "tradicional" pero sin objeto address
- **THEN** el sistema responde 400 Bad Request
