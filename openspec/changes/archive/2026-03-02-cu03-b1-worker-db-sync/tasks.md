## 1. Schema y migración (apps/api)

- [x] 1.1 Añadir enum `StatusSource { ADRESLES STORE }` en `apps/api/prisma/schema.prisma` (después de `enum OrderStatus`)
- [x] 1.2 Añadir campo `statusSource StatusSource? @map("status_source")` al modelo `Order` (entre `syncedAt` y `createdAt`)
- [x] 1.3 Ejecutar `npx prisma migrate dev --name add-order-status-source` en `apps/api/`
- [x] 1.4 Ejecutar `npx prisma generate` en `apps/api/` y verificar que el cliente incluye el tipo `StatusSource`

## 2. Schema del Worker: Opción C — apuntar al schema del API (apps/worker)

- [x] 2.1 En `apps/worker/package.json`, añadir la sección `"prisma": { "schema": "../api/prisma/schema.prisma" }` al nivel raíz del JSON
- [x] 2.2 Eliminar el archivo `apps/worker/prisma/schema.prisma` (ya no es la fuente de verdad; el Worker lee el schema del API directamente)
- [x] 2.3 Ejecutar `npx prisma generate` en `apps/worker/` y verificar que el cliente generado incluye los tipos `StatusSource` y los valores correctos de `OrderStatus`
- [x] 2.4 Ejecutar `npx tsc --noEmit` en `apps/worker/` y confirmar que no hay errores de tipo con `OrderStatus` ni `StatusSource`

## 3. OrdersService — API (apps/api)

- [x] 3.1 Añadir import de `StatusSource` desde `@prisma/client` en `apps/api/src/orders/orders.service.ts`
- [x] 3.2 Actualizar la firma de `updateStatus()`: el tercer parámetro pasa de `timestamps?: { addressConfirmedAt?: Date; syncedAt?: Date }` a `options?: { addressConfirmedAt?: Date; syncedAt?: Date; statusSource?: StatusSource }`
- [x] 3.3 En `createFromMock()`, añadir `syncedAt: isAddressReady ? now : undefined` y `statusSource: isAddressReady ? 'STORE' : undefined` al objeto `data` del `prisma.order.create()`
- [x] 3.4 En `MockOrdersService.processTraditionalOrder()`, eliminar las líneas que llaman a `updateStatus(order.id, 'COMPLETED', { syncedAt: new Date() })` y el `simulateSync` si ya no aplica como acción con efecto en DB
- [x] 3.5 Actualizar tests en `apps/api/src/orders/orders.service.spec.ts`: corregir el test "creates an order with READY_TO_PROCESS and also creates an OrderAddress" para verificar que `syncedAt` y `statusSource: 'STORE'` se incluyen en el `prisma.order.create()`
- [x] 3.6 Actualizar tests en `apps/api/src/mock/mock-orders.service.spec.ts`: corregir el test "updates order status to COMPLETED after sync" para reflejar que ya no se llama a `updateStatus` con `COMPLETED`
- [x] 3.7 Ejecutar `npx tsc --noEmit` en `apps/api/` sin errores

## 4. Worker — finalizeAddress (apps/worker)

- [x] 4.1 En `finalizeAddress()` (`apps/worker/src/processors/conversation.processor.ts`), actualizar `prisma.order.update()` para incluir `syncedAt: now` y `statusSource: 'ADRESLES'` junto a los campos existentes
- [x] 4.2 Actualizar la firma de `buildSyncSuccessMessage()` en `apps/worker/src/services/address.service.ts`: añadir tercer parámetro `storeName: string`
- [x] 4.3 Actualizar el cuerpo de `buildSyncSuccessMessage()` para los tres idiomas (ES/EN/FR): el mensaje debe incluir `storeName` y mencionar que el pedido ha sido actualizado tanto en la tienda como en Adresles
- [x] 4.4 Actualizar la llamada a `buildSyncSuccessMessage()` en `finalizeAddress()` para pasar `ctx.order.store.name` como tercer argumento
- [x] 4.5 Añadir parámetro opcional `storeName?: string` a `simulateEcommerceSync()` en `address.service.ts`
- [x] 4.6 Mejorar los `console.log` de `simulateEcommerceSync()` para incluir `storeName`, el nuevo estado `READY_TO_PROCESS` y el `syncedAt` timestamp
- [x] 4.7 Actualizar la llamada a `simulateEcommerceSync()` en `finalizeAddress()` para pasar `ctx.order.store.name`
- [x] 4.8 Actualizar el `console.log` final de `finalizeAddress()` para reflejar `status=READY_TO_PROCESS`, `syncedAt` y `statusSource=ADRESLES`

## 5. Tests del Worker (apps/worker)

- [x] 5.1 Añadir test unitario para `buildSyncSuccessMessage()` con los tres idiomas (ES/EN/FR) verificando que `storeName` aparece en cada mensaje
- [x] 5.2 Verificar que `npx tsc --noEmit` en `apps/worker/` pasa sin errores tras todos los cambios

## 6. Verificación end-to-end

- [x] 6.1 Ejecutar simulación completa desde `/simulate` en el Dashboard Admin: confirmar que el mensaje final en el chat menciona el nombre de la tienda
- [x] 6.2 Verificar en la DB (tabla `orders`) que el pedido ADRESLES post-confirmación tiene `status='READY_TO_PROCESS'`, `synced_at` con timestamp y `status_source='ADRESLES'`
- [x] 6.3 Verificar en la DB que un pedido TRADITIONAL recién creado tiene `status='READY_TO_PROCESS'`, `synced_at` y `status_source='STORE'`
- [x] 6.4 Verificar en los logs del Worker el formato mejorado de `[SYNC_SIMULATED]` con storeName, estado y timestamp
- [x] 6.5 Confirmar que el chat de simulación se cierra correctamente tras recibir el evento `conversation:complete`
