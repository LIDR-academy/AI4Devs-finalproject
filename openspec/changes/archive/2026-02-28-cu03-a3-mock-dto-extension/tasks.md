## 1. Paquete compartido `packages/shared-types`

- [x] 1.1 Crear `packages/shared-types/package.json` con `name: "@adresles/shared-types"`, `"main": "./dist/index.js"`, `"types": "./dist/index.d.ts"` y scripts `"build": "tsc"` y `"dev": "tsc --watch"`
- [x] 1.2 Crear `packages/shared-types/tsconfig.json` con `"module": "commonjs"`, `"target": "ES2021"`, `"outDir": "./dist"`, `"rootDir": "./src"`, `"declaration": true` y `"strict": true`
- [x] 1.3 Crear `packages/shared-types/src/index.ts` exportando: `MockOrderContext` (con `buyerRegisteredEcommerce`, `buyerEcommerceAddress` tipado completo y `giftRecipient`), `ProcessConversationJobData` (con campo `context?: MockOrderContext`) y `ProcessResponseJobData`
- [x] 1.4 Añadir `"@adresles/shared-types": "workspace:*"` a `dependencies` en `apps/api/package.json`
- [x] 1.5 Añadir `"@adresles/shared-types": "workspace:*"` a `dependencies` en `apps/worker/package.json`
- [x] 1.6 Actualizar `turbo.json`: añadir `"dependsOn": ["^build"]` a la tarea `dev` para que `shared-types` compile antes de que API y Worker arranquen
- [x] 1.7 Ejecutar `pnpm install` en la raíz para crear los symlinks del workspace
- [x] 1.8 Ejecutar `pnpm build --filter=@adresles/shared-types` y verificar que se genera `packages/shared-types/dist/index.js` y `dist/index.d.ts`

## 2. DTO — Nuevos tipos y campos

- [x] 2.1 Añadir `IsBoolean` a los imports de `class-validator` en `apps/api/src/mock/dto/create-mock-order.dto.ts`
- [x] 2.2 Añadir clase `MockGiftRecipientDto` con `first_name`, `last_name` y `phone` en `create-mock-order.dto.ts`
- [x] 2.3 Añadir campo `buyer_registered_ecommerce?: boolean` a `CreateMockOrderDto` con decoradores `@IsOptional()` y `@IsBoolean()`
- [x] 2.4 Añadir campo `buyer_ecommerce_address?: MockAddressDto` a `CreateMockOrderDto` con decoradores `@IsOptional()`, `@ValidateNested()`, `@Type(() => MockAddressDto)` y `@IsObject()`
- [x] 2.5 Añadir campo `gift_recipient?: MockGiftRecipientDto` a `CreateMockOrderDto` con decoradores `@IsOptional()`, `@ValidateNested()`, `@Type(() => MockGiftRecipientDto)` y `@IsObject()`

## 3. Servicio — Propagación del contexto

- [x] 3.1 En `apps/api/src/conversations/conversations.service.ts`, añadir import de `MockOrderContext` desde `@adresles/shared-types`
- [x] 3.2 Añadir parámetro `context?: MockOrderContext` a `createAndEnqueue()` en `ConversationsService` (sin modificar los parámetros existentes `isRegisteredAdresles` y `hasAddressAdresles`)
- [x] 3.3 Pasar `context: params.context` en la llamada a `this.queue.addProcessConversationJob()` dentro de `createAndEnqueue()`
- [x] 3.4 Actualizar `MockOrdersService.processAdreslesOrder()` en `apps/api/src/mock/mock-orders.service.ts` para pasar `context: { buyerRegisteredEcommerce, buyerEcommerceAddress, giftRecipient }` a `createAndEnqueue()`

## 4. Queue y Worker — Migración a tipos compartidos

- [x] 4.1 En `apps/api/src/queue/queue.service.ts`, eliminar las definiciones locales de `ProcessConversationJobData` y `ProcessResponseJobData` y sustituirlas por `export { ProcessConversationJobData, ProcessResponseJobData } from '@adresles/shared-types'` (re-exportar para no romper imports existentes que usen `queue.service.ts`)
- [x] 4.2 En `apps/worker/src/processors/conversation.processor.ts`, eliminar la definición local de `ProcessConversationJobData` y `ProcessResponseJobData` e importarlas desde `@adresles/shared-types`
- [x] 4.3 Actualizar `conversationProcessor` para extraer `context` de `job.data` y pasarlo como cuarto argumento a `processGetAddressJourney()`
- [x] 4.4 Actualizar la firma de `processGetAddressJourney()` para aceptar `context?: MockOrderContext` como parámetro opcional (sin modificar el cuerpo de la función)

## 5. Tests

- [x] 5.1 En `apps/api/src/mock/mock-orders.service.spec.ts`, añadir caso: `processAdreslesOrder` con `buyer_registered_ecommerce: true` y `buyer_ecommerce_address` pasa `context.buyerRegisteredEcommerce: true` y `context.buyerEcommerceAddress` a `createAndEnqueue()`
- [x] 5.2 Añadir caso: payload sin nuevos campos opcionales → `createAndEnqueue()` recibe `context` con `buyerRegisteredEcommerce: false`, `buyerEcommerceAddress: null` y `giftRecipient: null`
- [x] 5.3 Añadir caso: payload con `gift_recipient` → `createAndEnqueue()` recibe `context.giftRecipient` con los datos del destinatario

## 6. Verificación

- [x] 6.1 Ejecutar `pnpm build` en la raíz y verificar que compilan los tres paquetes: `shared-types`, `api` y `worker`
- [x] 6.2 Ejecutar `pnpm test` en `apps/api` y verificar que todos los tests pasan (incluyendo los 3 nuevos)
- [x] 6.3 Verificar que un payload sin los nuevos campos responde 201 (retrocompatibilidad manual con curl o REST client)
- [x] 6.4 Verificar que un payload con `gift_recipient` sin campo `phone` responde 400 Bad Request
- [x] 6.5 Verificar que un payload con `buyer_ecommerce_address` sin `country` responde 400 Bad Request
