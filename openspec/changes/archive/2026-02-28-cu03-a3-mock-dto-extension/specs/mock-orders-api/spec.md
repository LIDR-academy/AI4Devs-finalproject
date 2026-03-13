## ADDED Requirements

### Requirement: POST /api/mock/orders acepta campos opcionales de contexto eCommerce

El sistema SHALL aceptar en el body de `POST /api/mock/orders` tres campos opcionales que enriquecen el contexto del pedido para la selección de sub-journey: `buyer_registered_ecommerce` (boolean), `buyer_ecommerce_address` (objeto dirección) y `gift_recipient` (objeto destinatario de regalo).

#### Scenario: Payload con buyer_registered_ecommerce true y buyer_ecommerce_address

- **WHEN** se envía POST /api/mock/orders con `mode: "adresles"`, `buyer_registered_ecommerce: true` y `buyer_ecommerce_address` con `full_address`, `street`, `postal_code`, `city`, `country`
- **THEN** el sistema responde 201 Created con `order_id` y `conversation_id`
- **AND** el job `process-conversation` encolado en BullMQ contiene `context.buyerRegisteredEcommerce: true`
- **AND** el job contiene `context.buyerEcommerceAddress` con los campos de dirección enviados

#### Scenario: Payload con gift_recipient manual

- **WHEN** se envía POST /api/mock/orders con `mode: "adresles"` y `gift_recipient` con `first_name`, `last_name`, `phone`
- **THEN** el sistema responde 201 Created con `order_id` y `conversation_id`
- **AND** el job `process-conversation` encolado contiene `context.giftRecipient` con los datos del destinatario

#### Scenario: Payload sin campos opcionales de contexto — retrocompatibilidad

- **WHEN** se envía POST /api/mock/orders con `mode: "adresles"` sin `buyer_registered_ecommerce`, `buyer_ecommerce_address` ni `gift_recipient`
- **THEN** el sistema responde 201 Created
- **AND** el job encolado contiene `context.buyerRegisteredEcommerce: false`
- **AND** el job contiene `context.buyerEcommerceAddress: null`
- **AND** el job contiene `context.giftRecipient: null`

### Requirement: Validación del esquema MockGiftRecipientDto

El sistema SHALL validar que, cuando `gift_recipient` está presente, contenga los campos requeridos `first_name` (string), `last_name` (string) y `phone` (string).

#### Scenario: gift_recipient con todos los campos requeridos

- **WHEN** se envía POST /api/mock/orders con `gift_recipient: { "first_name": "Lucía", "last_name": "García", "phone": "+34612345099" }`
- **THEN** el sistema acepta el payload y responde 201 Created

#### Scenario: gift_recipient incompleto

- **WHEN** se envía POST /api/mock/orders con `gift_recipient` presente pero sin campo `phone`
- **THEN** el sistema responde 400 Bad Request con mensaje de validación indicando que `phone` es requerido

### Requirement: Validación del esquema buyer_ecommerce_address

El sistema SHALL validar que, cuando `buyer_ecommerce_address` está presente, sea un objeto con los campos requeridos de `MockAddressDto`: `full_address` (string), `street` (string), `postal_code` (string), `city` (string), `country` (string).

#### Scenario: buyer_ecommerce_address con campos requeridos

- **WHEN** se envía POST /api/mock/orders con `buyer_ecommerce_address` que incluye `full_address`, `street`, `postal_code`, `city` y `country`
- **THEN** el sistema acepta el payload y responde 201 Created

#### Scenario: buyer_ecommerce_address con campo requerido faltante

- **WHEN** se envía POST /api/mock/orders con `buyer_ecommerce_address` presente pero sin campo `country`
- **THEN** el sistema responde 400 Bad Request con mensaje de validación
