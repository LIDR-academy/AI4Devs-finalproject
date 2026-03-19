## 1. Seed — Actualización de externalOrderId y eliminación de externalOrderNumber

- [x] 1.1 [backend] En `packages/prisma-db/seed.ts`, actualizar los 8 pedidos de `store1` (WOOCOMMERCE) con los nuevos `externalOrderId` numéricos: `"100"`, `"102"`, `"105"`, `"108"`, `"110"`, `"113"`, `"115"`, `"118"`
- [x] 1.2 [backend] En `packages/prisma-db/seed.ts`, actualizar los 7 pedidos de `store2` (SHOPIFY) con los nuevos `externalOrderId`: `"MM-01001-OUT"` … `"MM-01007-OUT"`
- [x] 1.3 [backend] En `packages/prisma-db/seed.ts`, actualizar los 5 pedidos de `store3` (PRESTASHOP) con los nuevos `externalOrderId` de 9 letras mayúsculas: `"XCVBGTWQA"`, `"KLMNPRSTB"`, `"FGHWQZXCD"`, `"BVNMKLJHQ"`, `"RTYUIOPAS"`
- [x] 1.4 [backend] En `packages/prisma-db/seed.ts`, eliminar el campo `externalOrderNumber` de todos los `prisma.order.create` (dejar el campo a `null`)

## 2. Backend API — ExternalOrderIdService (nuevo)

- [x] 2.1 [backend] Crear `apps/api/src/orders/external-order-id.service.ts` con `@Injectable()` y constructor que recibe `PrismaService`
- [x] 2.2 [backend] Implementar método `generate(storeId: string): Promise<string>` — lógica WOOCOMMERCE: obtener max numérico, sumar delta random 1-5, fallback `"100"`
- [x] 2.3 [backend] Implementar lógica SHOPIFY en `generate()`: obtener pedido más reciente, aplicar regex `/^(.*?)(\d{4,})(.*)$/`, incrementar número preservando padding, fallback `"1001"`
- [x] 2.4 [backend] Implementar lógica PRESTASHOP en `generate()`: generar 9 letras mayúsculas aleatorias, verificar unicidad contra BD, reintentar hasta 10 veces, lanzar error si se supera
- [x] 2.5 [backend] Implementar fallback `"SIM-" + Date.now()` para plataformas no reconocidas
- [x] 2.6 [backend] Exportar `ExternalOrderIdService` desde `apps/api/src/orders/orders.module.ts`

## 3. Backend API — DTO y MockOrdersService

- [x] 3.1 [backend] En `apps/api/src/mock/dto/create-mock-order.dto.ts`, cambiar `external_order_id` de requerido a opcional: añadir `@IsOptional()` y cambiar tipo a `external_order_id?: string`
- [x] 3.2 [backend] En `apps/api/src/mock/mock-orders.service.ts`, inyectar `ExternalOrderIdService` en el constructor
- [x] 3.3 [backend] En `MockOrdersService`, antes de llamar a `orders.createFromMock`, si `dto.external_order_id` no tiene valor: resolver `storeId`, obtener `Store.platform`, llamar a `ExternalOrderIdService.generate(storeId)` y asignar el resultado al DTO
- [x] 3.4 [backend] En `apps/api/src/mock/mock.module.ts`, importar `OrdersModule` (si no está ya importado) para que `ExternalOrderIdService` sea inyectable en `MockModule`

## 4. Backend API — AdminService

- [x] 4.1 [backend] En `apps/api/src/admin/admin.service.ts`, en `buildOrderBy`: caso `'ref'` → cambiar `{ externalOrderNumber: { sort: dir, nulls: 'last' } }` por `{ externalOrderId: dir }`
- [x] 4.2 [backend] En `buildOrderBy`: caso `'store'` (subsort) → cambiar `externalOrderNumber` por `externalOrderId` (sin `nulls: 'last'`)
- [x] 4.3 [backend] En `buildWhere`: en el bloque `OR` del parámetro `q`, sustituir `{ externalOrderNumber: { contains: q, mode: 'insensitive' } }` por `{ externalOrderId: { contains: q, mode: 'insensitive' } }`
- [x] 4.4 [backend] En `getConversationMessages`: en `select`, reemplazar `{ externalOrderNumber: true, externalOrderId: true }` por `{ externalOrderId: true }`; en el return, cambiar `externalOrderNumber: conversation.order.externalOrderNumber ?? conversation.order.externalOrderId` por `externalOrderId: conversation.order.externalOrderId`

## 5. Worker — conversation.processor.ts

- [x] 5.1 [backend] En `apps/worker/src/processors/conversation.processor.ts`, en `processGetAddressJourney`: actualizar el tipo del parámetro `order` de `{ externalOrderNumber: string | null; store: { name: string } }` a `{ externalOrderId: string; store: { name: string } }`
- [x] 5.2 [backend] En `processGetAddressJourney`: cambiar la llamada a `buildGetAddressUserPrompt` de `orderNumber: order.externalOrderNumber` a `orderNumber: order.externalOrderId`
- [x] 5.3 [backend] Verificar que la carga de la `Order` para GET_ADDRESS incluye `externalOrderId` en el select/findUnique (sin `select` explícito que lo excluya)

## 6. Frontend — Tipos y componentes

- [x] 6.1 [frontend] En `apps/web-admin/src/types/api.ts`, en `ConversationContext.order`: cambiar `order: { externalOrderNumber: string | null }` por `order: { externalOrderId: string }`
- [x] 6.2 [frontend] En `apps/web-admin/src/types/api.ts`, en `CreateMockOrderPayload`: cambiar `external_order_id: string` por `external_order_id?: string`
- [x] 6.3 [frontend] En `apps/web-admin/src/components/orders/orders-table.tsx`: cambiar `const orderNumber = order.externalOrderNumber ?? order.externalOrderId` por `const orderNumber = order.externalOrderId`
- [x] 6.4 [frontend] En `apps/web-admin/src/components/chat/chat-view.tsx`: cambiar `const orderNumber = conversation.order.externalOrderNumber` por `const orderNumber = conversation.order.externalOrderId`
- [x] 6.5 [frontend] En `apps/web-admin/src/components/simulate/order-config-modal.tsx`: eliminar el campo `external_order_id: \`SIM-${Date.now()}\`` del payload en `handleSubmit`

## 7. Tests — Actualización y nuevos tests

- [x] 7.1 [qa] Crear `apps/api/src/orders/external-order-id.service.spec.ts` con tests para los 7 escenarios del ticket §8.5: WOOCOMMERCE sin pedidos, WOOCOMMERCE con pedidos, PRESTASHOP formato, PRESTASHOP con colisión, SHOPIFY sin pedidos, SHOPIFY patrón `MM-01007-OUT`, SHOPIFY numérico simple
- [x] 7.2 [qa] En `apps/api/src/admin/admin.service.spec.ts`: actualizar expectation de `sortBy=ref` a `[{ externalOrderId: 'asc' }]` (sin `nulls`)
- [x] 7.3 [qa] En `apps/api/src/admin/admin.service.spec.ts`: actualizar expectation de subsort por tienda a `[{ store: { name: 'asc' } }, { externalOrderId: 'asc' }]`
- [x] 7.4 [qa] En `apps/api/src/admin/admin.service.spec.ts`: actualizar test de búsqueda `q` para esperar `{ externalOrderId: { contains: ..., mode: 'insensitive' } }` en el OR
- [x] 7.5 [qa] En `apps/api/src/admin/admin.service.spec.ts`: actualizar test de `getConversationMessages` para esperar `order: { externalOrderId: '...' }` (eliminar test del fallback `externalOrderNumber`)
- [x] 7.6 [qa] En `apps/api/src/mock/mock-orders.service.spec.ts`: añadir test donde el DTO sin `external_order_id` provoca llamada a `ExternalOrderIdService.generate()` y el resultado se pasa a `orders.createFromMock`
- [x] 7.7 [qa] En `apps/api/src/mock/mock-orders.service.spec.ts`: verificar que cuando el DTO incluye `external_order_id: 'ext-001'`, el servicio lo usa directamente (sin llamar al generador)
- [x] 7.8 [qa] En `apps/api/src/mock/mock-orders.controller.spec.ts`: ajustar el DTO de prueba para que `external_order_id` sea opcional (no requerido)
- [x] 7.9 [qa] En `apps/worker/src/processors/conversation.processor.spec.ts`: en los tests del journey GET_ADDRESS, cambiar los mocks de `order` de `{ externalOrderNumber: '...', store: ... }` a `{ externalOrderId: '...', store: ... }` y verificar que el prompt al LLM contiene el valor de `externalOrderId`

## 8. Verificación final

- [x] 8.1 [qa] Ejecutar `pnpm build` en el root del monorepo y confirmar que no hay errores TypeScript en ningún workspace
- [x] 8.2 [qa] Ejecutar `pnpm test` en `apps/api` y verificar que todos los tests pasan (incluyendo los nuevos de `external-order-id.service.spec.ts`) — 161 tests ✓
- [x] 8.3 [qa] Ejecutar `pnpm test` en `apps/worker` y verificar que todos los tests pasan — 49 tests ✓
- [x] 8.4 [qa] Ejecutar el seed con `pnpm db:seed` y verificar que los pedidos de cada tienda tienen `externalOrderId` en el formato correcto para su plataforma (requiere Docker/DB activa)
