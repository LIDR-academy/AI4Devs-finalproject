## 1. Worker — consulta y mensaje INFORMATION

- [x] 1.1 En `conversation.processor.ts`, añadir `orderAddress: true` al `include` de `prisma.order.findUnique` (junto a `store: true`) en `conversationProcessor()`.
- [x] 1.2 En `processInformationJourney()`, cambiar el saludo a solo nombre: `name = user.firstName ?? 'Cliente'`.
- [x] 1.3 En `processInformationJourney()`, usar `order.externalOrderId` para el número de pedido en el texto del mensaje (en lugar de `order.externalOrderNumber ?? 'N/A'`).
- [x] 1.4 En `processInformationJourney()`, si existe `order.orderAddress`, incluir en el mensaje la frase con la dirección usando `order.orderAddress.fullAddress` (p. ej. «La dirección de entrega es: {fullAddress}.»); si no existe, mantener texto neutro sin dirección explícita.
- [x] 1.5 En `processInformationJourney()`, construir el mensaje con saltos de línea entre frases para mejorar legibilidad.
- [x] 1.6 Actualizar la firma/tipo de `processInformationJourney()` para que el parámetro `order` refleje el include `{ store: true, orderAddress: true }`.

## 2. Tests

- [x] 2.1 Añadir o actualizar tests en `conversation.processor.spec.ts` para el flujo INFORMATION: saludo solo con nombre y fallback «Cliente» cuando `firstName` es null.
- [x] 2.2 Añadir o actualizar tests que verifiquen que el número de pedido en el mensaje es `externalOrderId` (no N/A cuando está presente).
- [x] 2.3 Añadir o actualizar tests que verifiquen que el mensaje incluye la dirección cuando la Order tiene `orderAddress.fullAddress`, y comportamiento cuando no hay `orderAddress`.
- [x] 2.4 Asegurar que los mocks de Prisma en el spec incluyan `order.findUnique` con respuesta que tenga `store` y `orderAddress` según los casos (seguir worker-testing-patterns.md).
