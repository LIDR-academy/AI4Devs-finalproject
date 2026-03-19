# Spec: Mock Orders API

> **Última actualización**: 2026-03-02 (actualizado en `cu03-b1-worker-db-sync`)

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
- **AND** se crea Order con status READY_TO_PROCESS, syncedAt igual a la fecha de creación, y statusSource = 'STORE'
- **AND** se crea OrderAddress inmediatamente con la dirección proporcionada
- **AND** se crea Conversation con type INFORMATION
- **AND** se encola job process-conversation
- **AND** el estado del pedido NO se actualiza a COMPLETED en ningún momento del flujo mock

#### Escenario: JSON inválido - campos requeridos faltantes

- **WHEN** se envía POST /api/mock/orders sin store, buyer.phone o mode
- **THEN** el sistema responde 400 Bad Request con mensaje de validación

#### Escenario: Modo tradicional sin dirección

- **WHEN** se envía POST /api/mock/orders con mode: "tradicional" pero sin objeto address
- **THEN** el sistema responde 400 Bad Request

### Requisito: Esquema JSON mock validado

El sistema SHALL validar el JSON de entrada con class-validator según el esquema definido. El campo `external_order_id` es **opcional**: si no se incluye en el payload, el backend lo genera automáticamente según la plataforma de la tienda. Si se incluye, se usa el valor proporcionado.

#### Escenario: Estructura store

- **WHEN** el JSON incluye store
- **THEN** store DEBE tener name (string) y url (string, URL válida)

#### Escenario: Estructura buyer

- **WHEN** el JSON incluye buyer
- **THEN** buyer DEBE tener first_name, last_name, phone (string), email (opcional, email válido)

#### Escenario: Modo y address condicional

- **WHEN** mode es "tradicional"
- **THEN** address es requerido con full_address, street, postal_code, city, country

#### Escenario: Payload sin external_order_id — backend genera el ID

- **WHEN** se envía POST /api/mock/orders sin el campo `external_order_id`
- **THEN** el sistema responde 201 Created con `order_id` y `conversation_id`
- **AND** el pedido creado tiene un `externalOrderId` coherente con la plataforma de la tienda seleccionada

#### Escenario: Payload con external_order_id explícito — se usa el valor proporcionado

- **WHEN** se envía POST /api/mock/orders con `external_order_id: "ext-001"`
- **THEN** el sistema responde 201 Created
- **AND** el pedido creado tiene `externalOrderId = "ext-001"`

#### Escenario: external_order_id inválido (no string) devuelve 400

- **WHEN** se envía POST /api/mock/orders con `external_order_id: 12345` (número en lugar de string)
- **THEN** el sistema responde 400 Bad Request con mensaje de validación

### Requisito: POST /api/mock/orders acepta campos opcionales de contexto eCommerce

El sistema SHALL aceptar en el body de `POST /api/mock/orders` tres campos opcionales que enriquecen el contexto del pedido para la selección de sub-journey: `buyer_registered_ecommerce` (boolean), `buyer_ecommerce_address` (objeto dirección) y `gift_recipient` (objeto destinatario de regalo).

#### Escenario: Payload con buyer_registered_ecommerce true y buyer_ecommerce_address

- **WHEN** se envía POST /api/mock/orders con `mode: "adresles"`, `buyer_registered_ecommerce: true` y `buyer_ecommerce_address` con `full_address`, `street`, `postal_code`, `city`, `country`
- **THEN** el sistema responde 201 Created con `order_id` y `conversation_id`
- **AND** el job `process-conversation` encolado en BullMQ contiene `context.buyerRegisteredEcommerce: true`
- **AND** el job contiene `context.buyerEcommerceAddress` con los campos de dirección enviados

#### Escenario: Payload con gift_recipient manual

- **WHEN** se envía POST /api/mock/orders con `mode: "adresles"` y `gift_recipient` con `first_name`, `last_name`, `phone`
- **THEN** el sistema responde 201 Created con `order_id` y `conversation_id`
- **AND** el job `process-conversation` encolado contiene `context.giftRecipient` con los datos del destinatario

#### Escenario: Payload sin campos opcionales de contexto — retrocompatibilidad

- **WHEN** se envía POST /api/mock/orders con `mode: "adresles"` sin `buyer_registered_ecommerce`, `buyer_ecommerce_address` ni `gift_recipient`
- **THEN** el sistema responde 201 Created
- **AND** el job encolado contiene `context.buyerRegisteredEcommerce: false`
- **AND** el job contiene `context.buyerEcommerceAddress: null`
- **AND** el job contiene `context.giftRecipient: null`

### Requisito: Validación del esquema MockGiftRecipientDto

El sistema SHALL validar que, cuando `gift_recipient` está presente, contenga los campos requeridos `first_name` (string), `last_name` (string) y `phone` (string).

#### Escenario: gift_recipient con todos los campos requeridos

- **WHEN** se envía POST /api/mock/orders con `gift_recipient: { "first_name": "Lucía", "last_name": "García", "phone": "+34612345099" }`
- **THEN** el sistema acepta el payload y responde 201 Created

#### Escenario: gift_recipient incompleto

- **WHEN** se envía POST /api/mock/orders con `gift_recipient` presente pero sin campo `phone`
- **THEN** el sistema responde 400 Bad Request con mensaje de validación indicando que `phone` es requerido

### Requisito: Validación del esquema buyer_ecommerce_address

El sistema SHALL validar que, cuando `buyer_ecommerce_address` está presente, sea un objeto con los campos requeridos de `MockAddressDto`: `full_address` (string), `street` (string), `postal_code` (string), `city` (string), `country` (string).

#### Escenario: buyer_ecommerce_address con campos requeridos

- **WHEN** se envía POST /api/mock/orders con `buyer_ecommerce_address` que incluye `full_address`, `street`, `postal_code`, `city` y `country`
- **THEN** el sistema acepta el payload y responde 201 Created

#### Escenario: buyer_ecommerce_address con campo requerido faltante

- **WHEN** se envía POST /api/mock/orders con `buyer_ecommerce_address` presente pero sin campo `country`
- **THEN** el sistema responde 400 Bad Request con mensaje de validación
