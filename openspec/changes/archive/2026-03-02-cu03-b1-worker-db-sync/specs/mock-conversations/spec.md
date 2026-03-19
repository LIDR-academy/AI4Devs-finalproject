## ADDED Requirements

### Requirement: finalizeAddress actualiza Order con syncedAt y statusSource tras confirmar dirección

Cuando el Worker completa exitosamente el flujo de confirmación de dirección, `finalizeAddress()` SHALL actualizar el pedido con `status = 'READY_TO_PROCESS'`, `addressConfirmedAt`, `syncedAt` y `statusSource = 'ADRESLES'` en una única operación `prisma.order.update()`.

#### Scenario: Pedido actualizado con todos los campos de trazabilidad

- **WHEN** el usuario confirma su dirección de entrega y `simulateEcommerceSync()` retorna `{ success: true }`
- **THEN** `prisma.order.update()` se llama con `{ status: 'READY_TO_PROCESS', addressConfirmedAt: now, syncedAt: now, statusSource: 'ADRESLES' }`
- **THEN** el pedido en la DB tiene `status = 'READY_TO_PROCESS'`, `synced_at` y `status_source = 'ADRESLES'` con el timestamp de la confirmación

#### Scenario: Estado de la conversación marcada como COMPLETED

- **WHEN** `finalizeAddress()` actualiza el pedido correctamente
- **THEN** `prisma.conversation.update()` se llama con `{ status: 'COMPLETED', completedAt: now }`
- **THEN** `publishConversationComplete(conversationId, 'COMPLETED')` es llamado

### Requirement: buildSyncSuccessMessage incluye el nombre de la tienda en el mensaje de confirmación

`buildSyncSuccessMessage()` SHALL aceptar un tercer parámetro `storeName: string` y SHALL incluirlo en el mensaje de confirmación para comunicar al usuario que el pedido ha sido actualizado tanto en la tienda online como en Adresles.

#### Scenario: Mensaje de confirmación en español con storeName

- **WHEN** `buildSyncSuccessMessage(pending, 'Spanish', 'ModaMujer')` es llamado
- **THEN** retorna un string que contiene "ModaMujer" y "Adresles"
- **THEN** el mensaje confirma la dirección y menciona que el pedido está listo para envío

#### Scenario: Mensaje de confirmación en inglés con storeName

- **WHEN** `buildSyncSuccessMessage(pending, 'English', 'ModaMujer')` es llamado
- **THEN** retorna un string que contiene "ModaMujer" y "Adresles"

#### Scenario: Mensaje de confirmación en francés con storeName

- **WHEN** `buildSyncSuccessMessage(pending, 'French', 'ModaMujer')` es llamado
- **THEN** retorna un string que contiene "ModaMujer" y "Adresles"
