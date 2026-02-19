# Spec: Mock Orders API

## Requisitos AÑADIDOS

### Requisito: Endpoint POST /api/mock/orders recibe JSON de compra

El sistema SHALL exponer un endpoint POST /api/mock/orders que reciba un JSON con datos de compra mock y procese el pedido según el modo indicado.

#### Escenario: JSON válido modo adresles

- **WHEN** se envía POST /api/mock/orders con JSON válido (store, buyer, mode: "adresles", items, total_amount, currency)
- **THEN** el sistema responde 201 Created con order_id y conversation_id
- **AND** se crea Order con status PENDING_ADDRESS
- **AND** se busca o crea User por teléfono del buyer
- **AND** se crea Conversation con type GET_ADDRESS
- **AND** se encola job process-conversation en BullMQ

#### Escenario: JSON válido modo tradicional

- **WHEN** se envía POST /api/mock/orders con JSON válido (mode: "tradicional", address completa)
- **THEN** el sistema responde 201 Created con order_id y conversation_id
- **AND** se crea Order con status ADDRESS_CONFIRMED
- **AND** se crea OrderAddress inmediatamente con la dirección proporcionada
- **AND** se crea Conversation con type INFORMATION
- **AND** se encola job process-conversation

#### Escenario: JSON inválido - campos requeridos faltantes

- **WHEN** se envía POST /api/mock/orders sin store, buyer.phone o mode
- **THEN** el sistema responde 400 Bad Request con mensaje de validación

#### Escenario: Modo tradicional sin dirección

- **WHEN** se envía POST /api/mock/orders con mode: "tradicional" pero sin objeto address
- **THEN** el sistema responde 400 Bad Request

### Requisito: Esquema JSON mock validado

El sistema SHALL validar el JSON de entrada con class-validator según el esquema definido.

#### Escenario: Estructura store

- **WHEN** el JSON incluye store
- **THEN** store DEBE tener name (string) y url (string, URL válida)

#### Escenario: Estructura buyer

- **WHEN** el JSON incluye buyer
- **THEN** buyer DEBE tener first_name, last_name, phone (string), email (opcional, email válido)

#### Escenario: Modo y address condicional

- **WHEN** mode es "tradicional"
- **THEN** address es requerido con full_address, street, postal_code, city, country
