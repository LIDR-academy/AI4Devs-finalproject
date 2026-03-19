## MODIFIED Requirements

### Requirement: Primer mensaje del journey GET_ADDRESS usa externalOrderId

Cuando el job `process-conversation` tiene `conversationType: 'GET_ADDRESS'`, el Worker SHALL generar el prompt al LLM usando `order.externalOrderId` (NOT NULL, siempre presente) en lugar de `order.externalOrderNumber` (nullable). Esto elimina el caso en el que el prompt incluía `"N/A"` cuando `externalOrderNumber` era `null`.

El tipo del parámetro `order` en `processGetAddressJourney` SHALL ser `{ externalOrderId: string; store: { name: string } }`. El campo `externalOrderNumber` ya no forma parte del tipo de este parámetro.

#### Scenario: Prompt al LLM incluye externalOrderId real

- **WHEN** `processGetAddressJourney` recibe un pedido con `externalOrderId: "100"` y `store.name: "ModaMujer"`
- **THEN** `buildGetAddressUserPrompt` recibe `orderNumber: "100"` (no `null`, no `"N/A"`)
- **AND** el prompt enviado al LLM contiene el valor `"100"` como referencia del pedido

#### Scenario: Eliminación del fallback N/A

- **WHEN** `processGetAddressJourney` se ejecuta para cualquier pedido de simulación
- **THEN** el parámetro `orderNumber` del prompt nunca es `null` ni `"N/A"`
- **AND** el prompt menciona el identificador real del pedido

#### Scenario: Order cargada incluye externalOrderId en el select

- **WHEN** `conversationProcessor` carga la Order para el journey GET_ADDRESS
- **THEN** la consulta Prisma incluye `externalOrderId` en los campos seleccionados (o usa `findUnique` sin `select` explícito)
- **AND** `order.externalOrderId` está disponible como `string` (nunca `undefined`)
