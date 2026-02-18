# Proposal: CU-01 Procesar Compra desde eCommerce (Mock)

## Por Qué

El MVP de Adresles requiere un punto de entrada para simular compras desde eCommerce sin integración real. El CU-01 permite validar el flujo completo: recepción de pedido, creación de usuario, inicio de conversación IA y sincronización de dirección, usando entrada manual de JSON.

## Qué Cambia

- Nuevo endpoint `POST /api/mock/orders` para recibir JSON de compra mock
- Orquestación que detecta modo (adresles vs tradicional) y ejecuta flujo correspondiente
- Flujo principal: Order PENDING_ADDRESS → conversación GET_ADDRESS → validación Google Maps → OrderAddress → sync mock → SYNCED
- Flujo FA-2 (tradicional): Order ADDRESS_CONFIRMED desde inicio → conversación INFORMATION → sync mock → SYNCED
- Servicios: OrdersService, UsersService, ConversationsService, EcommerceSyncService
- Worker BullMQ para procesar conversaciones (journeys GET_ADDRESS e INFORMATION)
- Migraciones Supabase, configuración DynamoDB y Redis

## Capacidades

### Nuevas Capacidades

- `mock-orders-api`: Endpoint POST /api/mock/orders con validación de JSON, DTOs y orquestación por modo
- `orders-users-conversations`: Servicios Orders, Users, Conversations con lógica de buscar/crear usuario y crear conversación
- `ecommerce-sync-mock`: Servicio de simulación de sync a eCommerce (log estructurado)
- `conversation-worker`: Worker BullMQ con processors y journeys GET_ADDRESS e INFORMATION

### Capacidades Modificadas

- (ninguna - capacidades nuevas)

## Impacto

- Nuevo módulo mock en API NestJS
- Módulos orders, users, conversations, addresses
- Worker con processors BullMQ
- Base de datos: migraciones Prisma para Supabase
- Infraestructura: Redis, DynamoDB (configuración)

## Plan de Rollback

Si hay problemas: deshabilitar endpoint mock mediante feature flag; migraciones son aditivas (no destructivas).
