## MODIFIED Requirements

### Requirement: Esquema JSON mock validado

El sistema SHALL validar el JSON de entrada con class-validator según el esquema definido. El campo `external_order_id` es **opcional**: si no se incluye en el payload, el backend lo genera automáticamente según la plataforma de la tienda. Si se incluye, se usa el valor proporcionado.

#### Scenario: Estructura store

- **WHEN** el JSON incluye store
- **THEN** store DEBE tener name (string) y url (string, URL válida)

#### Scenario: Estructura buyer

- **WHEN** el JSON incluye buyer
- **THEN** buyer DEBE tener first_name, last_name, phone (string), email (opcional, email válido)

#### Scenario: Modo y address condicional

- **WHEN** mode es "tradicional"
- **THEN** address es requerido con full_address, street, postal_code, city, country

#### Scenario: Payload sin external_order_id — backend genera el ID

- **WHEN** se envía POST /api/mock/orders sin el campo `external_order_id`
- **THEN** el sistema responde 201 Created con `order_id` y `conversation_id`
- **AND** el pedido creado tiene un `externalOrderId` coherente con la plataforma de la tienda seleccionada

#### Scenario: Payload con external_order_id explícito — se usa el valor proporcionado

- **WHEN** se envía POST /api/mock/orders con `external_order_id: "ext-001"`
- **THEN** el sistema responde 201 Created
- **AND** el pedido creado tiene `externalOrderId = "ext-001"`

#### Scenario: external_order_id inválido (no string) devuelve 400

- **WHEN** se envía POST /api/mock/orders con `external_order_id: 12345` (número en lugar de string)
- **THEN** el sistema responde 400 Bad Request con mensaje de validación
