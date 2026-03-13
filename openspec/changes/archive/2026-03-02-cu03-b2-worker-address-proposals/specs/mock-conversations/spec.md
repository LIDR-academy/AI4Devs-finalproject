# Spec: Mock Conversations — Delta CU03-B2

> **Delta para**: `mock-conversations`  
> **Change**: `cu03-b2-worker-address-proposals`

## ADDED Requirements

### Requirement: Sub-journey 2.1 propone dirección Adresles guardada cuando el usuario está registrado

Cuando el job `process-conversation` tiene `conversationType: 'GET_ADDRESS'` y el usuario tiene `isRegistered: true` con al menos una dirección en su libreta Adresles, el Worker SHALL proponer directamente esa dirección en lugar de preguntarla.

#### Scenario: Usuario registrado con dirección favorita

- **WHEN** `processGetAddressJourney` recibe un usuario con `isRegistered: true` y al menos una `Address` (isDeleted: false) asociada
- **THEN** selecciona la dirección con `isDefault: true` o la primera por `createdAt`
- **THEN** genera mensaje con `buildAddressProposalMessage(..., 'adresles', language)`
- **THEN** guarda estado con `phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM'` y `pendingAddress`
- **THEN** publica el mensaje vía `publishConversationUpdate`

#### Scenario: Usuario registrado sin direcciones — fallback a pregunta estándar

- **WHEN** `processGetAddressJourney` recibe usuario con `isRegistered: true` pero sin direcciones en libreta
- **THEN** continúa con el flujo estándar (OpenAI pregunta la dirección)

### Requirement: Sub-journey 2.3 propone dirección eCommerce cuando el usuario no está registrado

Cuando el job `process-conversation` tiene `conversationType: 'GET_ADDRESS'` y el usuario tiene `isRegistered: false` pero `context.buyerRegisteredEcommerce === true` y `context.buyerEcommerceAddress` tiene valor, el Worker SHALL proponer esa dirección.

#### Scenario: Usuario no registrado con dirección eCommerce

- **WHEN** `processGetAddressJourney` recibe usuario con `isRegistered: false` y `context?.buyerRegisteredEcommerce` y `context.buyerEcommerceAddress` presentes
- **THEN** mapea `buyerEcommerceAddress` a `PendingAddress` (full_address → gmapsFormatted, snake_case → camelCase)
- **THEN** genera mensaje con `buildAddressProposalMessage(..., 'ecommerce', language)`
- **THEN** guarda estado con `phase: 'WAITING_ADDRESS_PROPOSAL_CONFIRM'` y `pendingAddress`

#### Scenario: Usuario no registrado sin dirección eCommerce — fallback

- **WHEN** `processGetAddressJourney` recibe usuario con `isRegistered: false` y sin `context.buyerEcommerceAddress` válido
- **THEN** continúa con el flujo estándar

### Requirement: Fase WAITING_ADDRESS_PROPOSAL_CONFIRM y handler handleAddressProposalConfirm

El processor SHALL incluir un handler para la fase `WAITING_ADDRESS_PROPOSAL_CONFIRM` que interprete la respuesta del usuario y confirme o rechace la dirección propuesta.

#### Scenario: Usuario confirma la dirección propuesta

- **WHEN** el estado es `WAITING_ADDRESS_PROPOSAL_CONFIRM` y `interpretUserIntent` retorna `type: 'CONFIRM'`
- **THEN** llama a `finalizeAddress(ctx, state.pendingAddress!)` sin pasar por extracción ni Google Maps

#### Scenario: Usuario rechaza o da otra dirección

- **WHEN** el estado es `WAITING_ADDRESS_PROPOSAL_CONFIRM` y el usuario rechaza o proporciona corrección
- **THEN** transiciona a `WAITING_ADDRESS`
- **AND** si hay `intent.correction`, la usa como `userMessage` para el handler estándar

### Requirement: buildAddressProposalMessage genera mensajes bilingües según fuente

`buildAddressProposalMessage(pending, storeName, source, language)` SHALL generar mensajes que incluyan la dirección formateada y un CTA para confirmar o dar otra dirección, diferenciando entre fuente Adresles y eCommerce.

#### Scenario: Mensaje en español fuente Adresles

- **WHEN** `buildAddressProposalMessage(pending, 'TiendaX', 'adresles', 'Spanish')` es llamado
- **THEN** retorna string que contiene "tu dirección guardada en Adresles" y "Responde 'Sí' para confirmar"

#### Scenario: Mensaje en inglés fuente eCommerce

- **WHEN** `buildAddressProposalMessage(pending, 'StoreY', 'ecommerce', 'English')` es llamado
- **THEN** retorna string que contiene "your address registered at StoreY" y "Reply \"Yes\" to confirm"
