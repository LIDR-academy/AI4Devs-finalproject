# Tasks: CU-01 Procesar Compra Mock

## 1. Infraestructura

- [x] 1.1 Crear monorepo root (package.json, pnpm-workspace.yaml, turbo.json)
- [x] 1.2 Crear migraciones Prisma para Supabase (ecommerce, store, user, order, order_address, gift_recipient, conversation)
- [ ] 1.3 Configurar DynamoDB (tabla adresles-messages, TTL 90 días)
- [x] 1.4 Configurar Redis y BullMQ (colas process-conversation, process-response)
- [x] 1.5 Crear seeds con ecommerce y store mock

## 2. Backend API - Estructura

- [x] 2.1 Crear app NestJS en apps/api con estructura modular
- [x] 2.2 Configurar Prisma, Supabase client y módulos de infraestructura
- [x] 2.3 Crear DTOs para MockOrder (CreateMockOrderDto con validación class-validator)
- [x] 2.4 Crear MockOrdersController con POST /api/mock/orders

## 3. Backend API - Servicios

- [x] 3.1 Implementar UsersService.findOrCreateByPhone
- [x] 3.2 Implementar OrdersService.createFromMock (con cálculo de fee)
- [x] 3.3 Implementar ConversationsService.createAndEnqueue
- [x] 3.4 Implementar EcommerceSyncService.simulateSync (log estructurado)
- [x] 3.5 Implementar orquestación en MockOrdersService (detectar mode, ejecutar flujo)

## 4. Worker

- [x] 4.1 Crear app Worker con BullMQ
- [x] 4.2 Implementar ConversationProcessor para process-conversation
- [ ] 4.3 Implementar journey GET_ADDRESS (prompt, OpenAI, guardar en DynamoDB)
- [x] 4.4 Implementar journey INFORMATION (mensaje confirmatorio)
- [ ] 4.5 Implementar ResponseProcessor para process-response (validar dirección, actualizar Order)

## 5. Integración y pruebas

- [x] 5.1 Crear script de seed ejecutable
- [ ] 5.2 Añadir tests unitarios para OrdersService y UsersService
- [ ] 5.3 Añadir test de integración para POST /api/mock/orders
- [x] 5.4 Crear página Mock UI básica en web-admin (opcional) o documentar ejemplos curl
