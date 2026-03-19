# Spec: Mock Conversations API (delta — fix INFORMATION first message)

> **Change**: fix-information-journey-confirmation-message  
> **Capability**: mock-conversations (modified)

---

## ADDED Requirements

### Requirement: Primer mensaje del journey INFORMATION tiene formato correcto en compra tradicional

Cuando el job `process-conversation` tiene `conversationType: 'INFORMATION'`, el Worker SHALL generar un primer mensaje que: (1) salude al usuario solo por su nombre (o «Cliente» si no hay `firstName`), (2) muestre el número de pedido con el valor de `order.externalOrderId` (nunca #N/A cuando la Order tiene ese campo), (3) incluya la dirección de entrega formateada usando `order.orderAddress.fullAddress` cuando exista la relación `order.orderAddress`, y (4) esté formateado con saltos de línea entre frases. El Worker SHALL cargar la Order con `include: { store: true, orderAddress: true }` para disponer del nombre de la tienda y de la OrderAddress.

#### Scenario: Saludo solo por nombre

- **WHEN** `processInformationJourney` se ejecuta con un usuario con `firstName: 'Carmen'` y `lastName: 'Martínez'`
- **THEN** el mensaje comienza con un saludo que usa solo «Carmen» (p. ej. «¡Hola Carmen!»)
- **AND** el mensaje NO incluye el apellido en el saludo

#### Scenario: Fallback cuando no hay nombre

- **WHEN** `processInformationJourney` se ejecuta con un usuario con `firstName: null`
- **THEN** el mensaje usa el fallback «Cliente» (o equivalente) en el saludo

#### Scenario: Número de pedido con external_order_id

- **WHEN** `processInformationJourney` se ejecuta con una Order con `externalOrderId: 'EXT-12345'`
- **THEN** el mensaje incluye el número de pedido visible para el usuario (p. ej. «Tu pedido #EXT-12345»)
- **AND** el mensaje NO muestra #N/A cuando `externalOrderId` está presente

#### Scenario: Dirección de entrega incluida cuando existe OrderAddress

- **WHEN** `processInformationJourney` se ejecuta con una Order que tiene `orderAddress` con `fullAddress: 'Calle Mayor 1, 3º A, 28001 Madrid'`
- **THEN** el mensaje incluye una frase con la dirección de entrega (p. ej. «La dirección de entrega es: Calle Mayor 1, 3º A, 28001 Madrid.»)
- **AND** el texto usa el valor de `order.orderAddress.fullAddress`

#### Scenario: Mensaje sin dirección cuando no hay OrderAddress

- **WHEN** `processInformationJourney` se ejecuta con una Order sin `orderAddress` (null)
- **THEN** el mensaje puede no incluir una línea explícita con la dirección o usar una variante neutra
- **AND** no se produce error por acceso a `order.orderAddress.fullAddress`

#### Scenario: Order cargada con store y orderAddress

- **WHEN** `conversationProcessor` procesa un job con `conversationType: 'INFORMATION'`
- **THEN** la Order se obtiene con `prisma.order.findUnique` con `include: { store: true, orderAddress: true }`
- **THEN** el objeto `order` tiene disponible `order.store.name` y opcionalmente `order.orderAddress`
