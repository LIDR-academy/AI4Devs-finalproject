## ADDED Requirements

### Requirement: Markdown consistente en processInformationJourney
La función `processInformationJourney` en `apps/worker/src/processors/conversation.processor.ts` SHALL emitir el campo `content` del mensaje usando Markdown estándar para resaltar los datos clave del pedido.

El mensaje SHALL seguir el siguiente formato:
```
¡Hola **{name}**! ✅

Tu pedido **#{orderNumber}** de **{storeName}** ha sido confirmado.

📍 **Dirección de entrega:**
{addressLine}

📦 Tu pedido será enviado pronto.

¡Gracias por tu compra!
```

Donde `addressLine` es la dirección completa si existe, o el texto informativo en caso contrario.

#### Scenario: Mensaje INFORMATION con dirección confirmada
- **WHEN** se procesa un journey `INFORMATION` con `orderAddress` definido
- **THEN** el `content` guardado en DynamoDB contiene `**#{orderNumber}**` y `📍 **Dirección de entrega:**` con la dirección en la línea siguiente

#### Scenario: Mensaje INFORMATION sin dirección
- **WHEN** se procesa un journey `INFORMATION` con `orderAddress: null`
- **THEN** el `content` guardado en DynamoDB contiene texto informativo en lugar de la dirección, manteniendo el formato Markdown para nombre y número de pedido

---

### Requirement: Markdown en buildConfirmationRequest
La función `buildConfirmationRequest` en `apps/worker/src/services/address.service.ts` SHALL usar Markdown para destacar la dirección propuesta con el formato `📍 **${addr}**`.

#### Scenario: Mensaje de confirmación con dirección en negrita
- **WHEN** se llama a `buildConfirmationRequest` con una dirección válida
- **THEN** el string resultante contiene `📍 **` seguido de la dirección y `**`

#### Scenario: Mensaje de confirmación en inglés
- **WHEN** se llama a `buildConfirmationRequest` con `language === 'English'`
- **THEN** el string resultante en inglés también usa `📍 **${addr}**`

---

### Requirement: Markdown en buildSyncSuccessMessage
La función `buildSyncSuccessMessage` en `apps/worker/src/services/address.service.ts` SHALL usar Markdown para destacar el nombre de la tienda y la dirección confirmada: `**${storeName}**` y `📍 **${addr}**`.

#### Scenario: Mensaje de éxito con tienda y dirección en negrita
- **WHEN** se llama a `buildSyncSuccessMessage` con dirección y nombre de tienda válidos
- **THEN** el string resultante contiene `**${storeName}**` y `📍 **${addr}**`

#### Scenario: Mensaje de éxito en inglés con Markdown
- **WHEN** se llama a `buildSyncSuccessMessage` con `language === 'English'`
- **THEN** el string resultante en inglés también usa `**${storeName}**` y `📍 **${addr}**`

---

### Requirement: Markdown en buildBuildingDetailsRequest
La función `buildBuildingDetailsRequest` en `apps/worker/src/services/address.service.ts` SHALL usar Markdown para destacar la dirección validada: `📍 **${addr}**`.

#### Scenario: Solicitud de detalles con dirección en negrita
- **WHEN** se llama a `buildBuildingDetailsRequest` con una dirección parcial
- **THEN** el string resultante contiene `📍 **` seguido de la dirección y `**`

---

### Requirement: Retrocompatibilidad del campo content en DynamoDB
El campo `content: string` del esquema de DynamoDB (tabla `adresles-messages-dev` / `adresles-messages-prod`) NO SHALL cambiar de tipo ni de nombre. El cambio es únicamente en el valor almacenado (texto con Markdown consistente).

Los mensajes ya almacenados con texto plano o Markdown parcial seguirán siendo válidos y se renderizarán correctamente en el frontend (texto plano pasa sin transformación por `react-markdown`).

#### Scenario: Mensajes históricos sin Markdown
- **WHEN** el frontend carga un mensaje histórico sin sintaxis `**`
- **THEN** el mensaje se muestra exactamente igual que antes — texto plano sin asteriscos visibles

#### Scenario: Mensajes ya almacenados con Markdown parcial
- **WHEN** el frontend carga un mensaje con `**${addr}**` (emitido por `buildAddressProposalMessage` antes de este change)
- **THEN** el mensaje se renderiza con la dirección en negrita — mejora retroactiva sin migración

---

### Requirement: Tests del Worker actualizados con strings Markdown
Los archivos de especificación del Worker (`apps/worker/src/processors/conversation.processor.spec.ts`) SHALL actualizar los strings esperados en los tests que validan los mensajes de los builders modificados, para que incluyan la sintaxis Markdown añadida.

Los tests NO SHALL cambiar su estructura lógica (mocks, flujo de ejecución, número de aserciones) — solo los valores literales de string esperados.

#### Scenario: Test de processInformationJourney con nuevo formato
- **WHEN** se ejecuta el test unitario de `processInformationJourney`
- **THEN** el test pasa validando que `saveMessage` fue llamado con un string que contiene `**#` (número de pedido en negrita)

#### Scenario: Todos los tests del Worker pasan tras el cambio
- **WHEN** se ejecuta `pnpm test` en `apps/worker/`
- **THEN** todos los tests pasan sin fallos de aserción de strings
