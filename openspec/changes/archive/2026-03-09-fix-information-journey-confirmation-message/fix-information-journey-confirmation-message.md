# FIX-INFO-001: Corrección del primer mensaje del journey INFORMATION (compra tradicional)

**ID**: FIX-INFO-001  
**Fecha**: 2026-03-09  
**Estado**: Definition of Ready (enriquecido)  
**Fuente**: Memory-Bank (README, project-context, patterns), ADR-005, ADR-008/009, worker-testing-patterns.

---

## Contexto y Problema

En el flujo de **compra tradicional** (modo `tradicional` del mock), el comprador recibe un primer mensaje automático del journey **INFORMATION** que confirma el pedido y la dirección. El estado actual del sistema presenta tres incidencias que degradan la experiencia y la consistencia de datos:

1. **Saludo formal en exceso**: Se usa nombre y apellido (`firstName` + `lastName`). Se requiere un tono más informal usando **solo el nombre**.
2. **Número de pedido incorrecto**: El mensaje muestra `#N/A` porque se usa el campo opcional `externalOrderNumber`, que en el mock suele no enviarse. El identificador de pedido visible para el usuario debe ser el **`external_order_id`** de la Order (siempre presente en el modelo).
3. **Dirección de entrega no mostrada**: El texto indica que "la dirección ha sido registrada correctamente" pero **no incluye la dirección completa**. Debe mostrarse la dirección de entrega **correctamente formateada** a partir del campo **`full_address`** de la tabla **OrderAddress** asociada al pedido. OrderAddress es una **tabla distinta** a Order, relacionada por `order_id` (relación 1:1). En compra **tradicional** la API crea primero la Order (con `store_id`, etc.) y acto seguido la OrderAddress con ese `order_id` y el `full_address`; el Worker solo debe leer y mostrar esos datos. En compra **no tradicional** (Adresles) solo se crea la Order al inicio; el journey INFORMATION se usa únicamente en compra tradicional, donde ya existen Order y OrderAddress.

**Mensaje actual (ejemplo)**:
> ¡Hola Carmen Martínez! ✅ Tu pedido #N/A de ModaMujer Outlet ha sido confirmado. La dirección de entrega que indicaste ha sido registrada correctamente. Tu pedido será enviado pronto. ¡Gracias por tu compra!

**Comportamiento esperado**:
- Saludo solo por nombre: *«¡Hola Carmen!»* (o *«Cliente»* / *«Usuario»* si no hay `firstName`).
- Número de pedido visible: *«Tu pedido #EXT-12345»* (valor de `order.externalOrderId`).
- Dirección completa en el mensaje: *«La dirección de entrega es: Calle Mayor 1, 3º A, 28001 Madrid.»* (valor de `OrderAddress.fullAddress`).
- Frases separadas con saltos de línea para mejor legibilidad.

---

## Especificaciones Técnicas

### Backend

- **Alcance**: Solo **Worker** (`apps/worker`). No se modifican endpoints de la API ni DTOs.
- **Archivo**: `apps/worker/src/processors/conversation.processor.ts`.

#### Consulta del pedido

- En `conversationProcessor()`, la Order se obtiene con `prisma.order.findUnique({ where: { id: orderId }, include: { store: true } })`.
- **Sobre `include: { store: true }`**: La tabla Order no tiene un campo `store`; tiene la FK `store_id`. En Prisma, `store` es el **nombre de la relación** con la tabla Store. El `include` hace que Prisma cargue la Store relacionada para poder usar `order.store.name` en el mensaje (p. ej. «ModaMujer Outlet»). Sin este include solo tendríamos `order.storeId` y habría que hacer otra consulta para el nombre de la tienda.
- **Cambio**: Añadir `orderAddress: true` al `include`. **OrderAddress** es una **tabla distinta** a Order, relacionada por el campo `order_id` (FK única en OrderAddress → relación 1:1). Esa tabla tiene el campo `full_address`. Con `include: { orderAddress: true }`, cuando `conversationType === 'INFORMATION'`, el objeto `order` tendrá disponible `order.orderAddress` (opcional) y podremos leer `order.orderAddress.fullAddress` para el mensaje.
- No se requieren nuevos DTOs ni cambios en `packages/shared-types`; el job `ProcessConversationJobData` sigue igual.

#### Lógica de negocio: `processInformationJourney()`

- **Firma**: Actualizar para recibir un `order` que incluya la relación `store` (para `order.store.name`) y la relación `orderAddress` (tipo derivado de Prisma con `include: { store: true, orderAddress: true }`).
- **Saludo**: Sustituir `name = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Usuario'` por **solo nombre**: `name = user.firstName ?? 'Cliente'` (alineado con `processGetAddressJourney`, que usa `user.firstName ?? 'Cliente'`).
- **Número de pedido**: Sustituir `order.externalOrderNumber ?? 'N/A'` por **`order.externalOrderId`** (campo obligatorio en el modelo Order, columna `external_order_id`).
- **Dirección de entrega**: Si existe `order.orderAddress` (registro en la tabla OrderAddress para esta Order), incluir en el mensaje una frase con la dirección completa usando `order.orderAddress.fullAddress` (campo `full_address` en DB). Ejemplo: *«La dirección de entrega es: {fullAddress}.»* Si no existe `order.orderAddress` (caso edge: compra no tradicional o dato faltante), mantener el texto actual sin dirección explícita o una variante neutra.
- **Formato del mensaje**: Construir el texto en varias líneas (saltos de línea entre frases) para mejorar legibilidad en el chat.

#### Base de datos

- **Sin migraciones**: No se modifican el schema Prisma ni las tablas.
- **Tablas y relaciones**: Order tiene la FK `store_id` y la relación Prisma `store` con la tabla Store. Order tiene la relación 1:1 opcional `orderAddress` con la tabla **OrderAddress**, que es distinta y se relaciona por el campo `order_id` (FK única). OrderAddress tiene el campo `fullAddress` (mapeado en DB como `full_address`).
- **Flujo en la API**: En compra **tradicional**, `OrdersService.createFromMock(..., createAddress: { ... })` crea primero la Order (con todos los datos, incluido `store_id`) y luego la OrderAddress con `order_id` de esa Order y el `full_address` indicado. En compra **no tradicional** solo se crea la Order; la OrderAddress se crea más tarde cuando el usuario confirma la dirección en la conversación. El journey INFORMATION solo se dispara en compra tradicional, donde ya existen ambos registros; el Worker únicamente lee esos datos.

### Frontend

- **No aplica**: No se crean ni modifican componentes, estados ni hooks. El mensaje se muestra en el chat de simulación existente (`SimulationChat`, SSE); los cambios son solo en el contenido del mensaje generado por el Worker.

---

## Arquitectura

- **ADR-005 (BullMQ + Worker dedicado)**: El cambio se realiza íntegramente en el Worker que procesa el job `process-conversation` para `conversationType === 'INFORMATION'`. No se añaden colas ni jobs nuevos.
- **ADR-002 (Supabase + DynamoDB)**: Los mensajes se siguen guardando en DynamoDB vía `saveMessage`; el contenido del mensaje es el único cambio. La Order y OrderAddress residen en PostgreSQL (Supabase).
- **ADR-008 / ADR-009 (Prisma)**: El Worker usa el cliente Prisma generado desde `@adresles/prisma-db` (schema en `packages/prisma-db`). La consulta con `include: { store: true, orderAddress: true }` es coherente con el modelo actual (Order → OrderAddress 1:1 opcional).

---

## Definición de Hecho (DoD)

- [ ] **Código**: En `conversation.processor.ts`, el `findUnique` de Order incluye `orderAddress: true` cuando se usa para el processor (para todos los conversationTypes, para no bifurcar la query; o solo cuando `conversationType === 'INFORMATION'` si se prefiere optimizar).
- [ ] **Código**: `processInformationJourney()` usa `user.firstName ?? 'Cliente'` para el saludo.
- [ ] **Código**: `processInformationJourney()` usa `order.externalOrderId` para el número de pedido en el texto.
- [ ] **Código**: `processInformationJourney()` incluye en el mensaje la dirección de entrega cuando `order.orderAddress` existe, usando `order.orderAddress.fullAddress`, con frase del tipo «La dirección de entrega es: {fullAddress}.».
- [ ] **Código**: El mensaje se compone con saltos de línea entre frases.
- [ ] **Tests unitarios**: Añadir o actualizar tests en `conversation.processor.spec.ts` para el flujo INFORMATION:
  - Saludo solo con nombre (y fallback «Cliente» cuando `firstName` es null).
  - Número de pedido igual a `externalOrderId` (no N/A cuando `externalOrderId` está presente).
  - Mensaje incluye la dirección cuando la Order tiene `orderAddress` con `fullAddress`; y opcionalmente, no incluye dirección o mensaje neutro cuando no hay `orderAddress`.
- [ ] **Patrones**: Seguir `worker-testing-patterns.md`: mock de Prisma (incluyendo `order.findUnique` con `include: { store: true, orderAddress: true }`), mock de DynamoDB y redis-publisher; sin llamadas reales a OpenAI (processInformationJourney no usa LLM).
- [ ] **Documentación**: Si se introduce un contrato o comportamiento estable nuevo, actualizar la documentación afectada (p. ej. `openspec/specs/data-model.md` o comentarios en código) según las reglas de documentation-standards; en este cambio la lógica es acotada y puede no requerir cambios en docs si no hay nuevos contratos públicos.

---

## Requisitos No Funcionales

- **Seguridad**: No se exponen datos sensibles adicionales; la dirección de entrega ya es visible en el flujo de compra tradicional y se muestra solo al usuario de la conversación. No se requieren cambios en autenticación ni autorización.
- **Rendimiento**: Una única query adicional implícita por el `include: { orderAddress: true }` (join 1:1). Impacto despreciable; no se añaden N+1 ni consultas en bucle.
- **Observabilidad**: Mantener el log existente en `processInformationJourney` (`console.log('[INFORMATION] Conversation ${conversationId}: ${message}')`) para trazabilidad; no se requieren nuevas métricas ni alertas para este cambio.
