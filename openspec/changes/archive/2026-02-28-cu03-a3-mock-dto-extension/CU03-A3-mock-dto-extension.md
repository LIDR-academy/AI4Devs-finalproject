# CU03-A3 — Extensión del DTO mock: parámetros eCommerce y regalo manual

**App**: `apps/api` (NestJS — MockModule) + `apps/worker`  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU-01 completado ✅, CU03-A1 completado ✅

---

## Historia de Usuario

**Como** sistema de simulación de compras,  
**quiero** poder enviar parámetros adicionales junto con el pedido mock (si el comprador está registrado en el eCommerce, su dirección allí, y datos del destinatario del regalo introducidos manualmente),  
**para** que el Worker pueda decidir qué sub-journey ejecutar sin tener que inferirlo.

---

## Descripción funcional

El DTO actual (`CreateMockOrderDto`) no tiene campos para indicar si el comprador está registrado en el eCommerce, ni si tiene una dirección guardada allí, ni para enviar datos manuales de un destinatario de regalo (distinto a los usuarios ya existentes en DB).

### Nuevos campos del DTO

| Campo | Tipo | Oblig. | Descripción |
|---|---|---|---|
| `buyer_registered_ecommerce` | `boolean` | No | El comprador está registrado en el eCommerce de la tienda |
| `buyer_ecommerce_address` | `MockAddressDto` | No | Dirección del comprador en el eCommerce (solo si `buyer_registered_ecommerce=true`) |
| `gift_recipient` | `MockGiftRecipientDto` | No | Datos del destinatario del regalo cuando se introduce manualmente (sin userId de DB) |

### Nuevo tipo `MockGiftRecipientDto`

Permite enviar los datos básicos del destinatario de regalo cuando no es un usuario existente en la DB:

```json
{
  "first_name": "Lucía",
  "last_name": "García",
  "phone": "+34612345099"
}
```

### Payload de ejemplo completo (sub-journey 2.3 — comprador registrado eCommerce con dirección)

```json
{
  "store": { "name": "ModaMujer Tienda Principal", "url": "https://modamujer.example.com" },
  "external_order_id": "SIM-001",
  "buyer": { "first_name": "Laura", "last_name": "Sánchez", "phone": "+34612345005" },
  "mode": "adresles",
  "buyer_registered_ecommerce": true,
  "buyer_ecommerce_address": {
    "full_address": "Calle Fuencarral 45, 3º, 28004 Madrid",
    "street": "Calle Fuencarral",
    "number": "45",
    "floor": "3",
    "postal_code": "28004",
    "city": "Madrid",
    "country": "ES"
  },
  "items": [{ "name": "Vestido floral", "quantity": 1, "price": 59.99 }],
  "total_amount": 59.99,
  "currency": "EUR"
}
```

---

## Arquitectura de la solución

### Archivos a modificar (en orden de implementación)

| # | Archivo | Cambio |
|---|---|---|
| 0 | `packages/shared-types/` _(nuevo)_ | Crear paquete `@adresles/shared-types` con `ProcessConversationJobData` (+ `context`), `ProcessResponseJobData` y `MockOrderContext` |
| 1 | `apps/api/src/mock/dto/create-mock-order.dto.ts` | Añadir `MockGiftRecipientDto` y los 3 nuevos campos a `CreateMockOrderDto` |
| 2 | `apps/api/src/mock/mock-orders.service.ts` | Pasar `context` a `createAndEnqueue()` en `processAdreslesOrder()` |
| 3 | `apps/api/src/conversations/conversations.service.ts` | Importar `MockOrderContext` de `@adresles/shared-types`; añadir `context?` a `createAndEnqueue()` |
| 4 | `apps/api/src/queue/queue.service.ts` | Eliminar definiciones locales; re-exportar desde `@adresles/shared-types` |
| 5 | `apps/worker/src/processors/conversation.processor.ts` | Eliminar definiciones locales; importar desde `@adresles/shared-types` |
| 6 | `apps/api/package.json` + `apps/worker/package.json` | Añadir `"@adresles/shared-types": "workspace:*"` |
| 7 | `turbo.json` | Añadir `"dependsOn": ["^build"]` a la tarea `dev` |

> ✅ **`ProcessConversationJobData` en fuente única**: el paquete `@adresles/shared-types` es la única definición. `queue.service.ts` y `conversation.processor.ts` importan desde él; TypeScript garantiza en tiempo de compilación que ambos usen exactamente el mismo contrato.

---

### 0. `packages/shared-types/` — paquete nuevo

Estructura completa del paquete:

```
packages/
  shared-types/
    package.json
    tsconfig.json
    src/
      index.ts
```

**`packages/shared-types/package.json`**:

```json
{
  "name": "@adresles/shared-types",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

**`packages/shared-types/tsconfig.json`**:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

**`packages/shared-types/src/index.ts`**:

```typescript
export interface MockOrderContext {
  buyerRegisteredEcommerce?: boolean;
  buyerEcommerceAddress?: {
    full_address: string;
    street: string;
    number?: string;
    block?: string;
    staircase?: string;
    floor?: string;
    door?: string;
    additional_info?: string;
    postal_code: string;
    city: string;
    province?: string;
    country: string;
  } | null;
  giftRecipient?: {
    first_name: string;
    last_name: string;
    phone: string;
  } | null;
}

export interface ProcessConversationJobData {
  conversationId: string;
  orderId: string;
  userId: string;
  conversationType: string;
  context?: MockOrderContext;
}

export interface ProcessResponseJobData {
  conversationId: string;
  orderId: string;
  userId: string;
  userMessage: string;
}
```

**`turbo.json`** — añadir `dependsOn` a la tarea `dev`:

```json
"dev": {
  "cache": false,
  "persistent": true,
  "dependsOn": ["^build"]
}
```

Esto garantiza que `shared-types` compila (`tsc`) antes de que `api` y `worker` arranquen su proceso de desarrollo.

---

### 1. `apps/api/src/mock/dto/create-mock-order.dto.ts` — nuevos campos

Añadir `IsBoolean` a los imports de `class-validator`. Añadir la nueva clase y los tres campos al final de `CreateMockOrderDto`:

```typescript
import {
  IsString, IsNumber, IsOptional, IsEnum, IsObject, IsArray,
  ValidateNested, IsUrl, IsEmail, IsBoolean, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Añadir clase nueva ---

export class MockGiftRecipientDto {
  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsString()
  phone!: string;
}

// --- En CreateMockOrderDto, añadir al final de los campos existentes ---

export class CreateMockOrderDto {
  // ... campos existentes sin cambios ...

  @IsOptional()
  @IsBoolean()
  buyer_registered_ecommerce?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => MockAddressDto)
  @IsObject()
  buyer_ecommerce_address?: MockAddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MockGiftRecipientDto)
  @IsObject()
  gift_recipient?: MockGiftRecipientDto;
}
```

> **Nota sobre `MockAddressDto`**: Ya existe en este mismo archivo con todos sus campos (`full_address`, `street`, `number`, `block`, `staircase`, `floor`, `door`, `additional_info`, `postal_code`, `city`, `province`, `country`). No hace falta crearla.

---

### 2. `apps/api/src/mock/mock-orders.service.ts` — pasar contexto al job

En `processAdreslesOrder()`, pasar los tres nuevos campos como `context` a `createAndEnqueue()`:

```typescript
private async processAdreslesOrder(
  dto: CreateMockOrderDto,
  storeId: string,
  userId: string,
): Promise<MockOrderResult> {
  const order = await this.orders.createFromMock(dto, storeId, userId, {
    initialStatus: 'PENDING_ADDRESS',
    orderMode: 'ADRESLES',
  });

  const conversation = await this.conversations.createAndEnqueue({
    orderId: order.id,
    userId,
    conversationType: 'GET_ADDRESS',
    userType: UserType.BUYER,
    context: {
      buyerRegisteredEcommerce: dto.buyer_registered_ecommerce ?? false,
      buyerEcommerceAddress: dto.buyer_ecommerce_address ?? null,
      giftRecipient: dto.gift_recipient ?? null,
    },
  });

  return { order_id: order.id, conversation_id: conversation.id };
}
```

---

### 3. `apps/api/src/conversations/conversations.service.ts` — ampliar `createAndEnqueue()`

El servicio ya tiene los parámetros `isRegisteredAdresles` y `hasAddressAdresles` (indican si el usuario está registrado en **Adresles**, distinto al registro en el eCommerce de la tienda). El nuevo `context` es ortogonal a esos campos: no reemplazarlos.

Importar `MockOrderContext` desde `@adresles/shared-types` y añadir el parámetro `context` opcional:

```typescript
import { MockOrderContext } from '@adresles/shared-types';

async createAndEnqueue(params: {
  orderId: string;
  userId: string;
  conversationType: ConversationType;
  userType: UserType;
  isRegisteredAdresles?: boolean;   // existente — no cambiar
  hasAddressAdresles?: boolean;     // existente — no cambiar
  context?: MockOrderContext;       // nuevo
}) {
  const conversation = await this.prisma.conversation.create({
    data: {
      orderId: params.orderId,
      userId: params.userId,
      conversationType: params.conversationType,
      userType: params.userType,
      isRegisteredAdresles: params.isRegisteredAdresles ?? false,
      hasAddressAdresles: params.hasAddressAdresles ?? false,
    },
  });

  await this.queue.addProcessConversationJob({
    conversationId: conversation.id,
    orderId: params.orderId,
    userId: params.userId,
    conversationType: params.conversationType,
    context: params.context,   // nuevo
  });

  return conversation;
}
```

---

### 4. `apps/api/src/queue/queue.service.ts` — migrar a tipos compartidos

Eliminar las definiciones locales de `ProcessConversationJobData` y `ProcessResponseJobData` (líneas 5-17) y sustituirlas por re-exportaciones desde `@adresles/shared-types`. La re-exportación preserva la compatibilidad con cualquier código que importe estos tipos desde `queue.service.ts`:

```typescript
export {
  ProcessConversationJobData,
  ProcessResponseJobData,
} from '@adresles/shared-types';
```

---

### 5. `apps/worker/src/processors/conversation.processor.ts` — migrar a tipos compartidos y leer `context`

Eliminar las definiciones locales de `ProcessConversationJobData` y `ProcessResponseJobData` (líneas 30-42) e importarlas desde `@adresles/shared-types`:

```typescript
import {
  ProcessConversationJobData,
  ProcessResponseJobData,
} from '@adresles/shared-types';
```

En `conversationProcessor`, extraer `context` y pasarlo a `processGetAddressJourney()` para que CU03-B2 pueda usarlo. Por ahora solo se canaliza sin modificar la lógica interna:

```typescript
export async function conversationProcessor(job: Job<ProcessConversationJobData>) {
  const { conversationId, orderId, userId, conversationType, context } = job.data;

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { phone: true } });
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { store: true } });

  if (!user || !order) throw new Error(`User ${userId} or Order ${orderId} not found`);

  if (conversationType === 'GET_ADDRESS') return processGetAddressJourney(conversationId, user, order, context);
  if (conversationType === 'INFORMATION') return processInformationJourney(conversationId, user, order);

  throw new Error(`Unknown conversation type: ${conversationType}`);
}
```

Actualizar la firma de `processGetAddressJourney()` para aceptar el parámetro opcional (sin cambiar su lógica interna):

```typescript
async function processGetAddressJourney(
  conversationId: string,
  user: { firstName: string | null; lastName: string | null; preferredLanguage: string | null },
  order: { externalOrderNumber: string | null; store: { name: string } },
  context?: ProcessConversationJobData['context'],
) {
  // ... lógica existente sin cambios — context ignorado hasta CU03-B2
}
```

---

## Lista de tareas

**Paquete compartido**
- [ ] Crear `packages/shared-types/package.json`, `tsconfig.json` y `src/index.ts` con `MockOrderContext`, `ProcessConversationJobData` y `ProcessResponseJobData`
- [ ] Añadir `"@adresles/shared-types": "workspace:*"` a `apps/api/package.json` y `apps/worker/package.json`
- [ ] Añadir `"dependsOn": ["^build"]` a la tarea `dev` en `turbo.json`
- [ ] Ejecutar `pnpm install` y `pnpm build --filter=@adresles/shared-types`

**DTO**
- [ ] Añadir `IsBoolean` a los imports de `class-validator` en `create-mock-order.dto.ts`
- [ ] Añadir clase `MockGiftRecipientDto` en `apps/api/src/mock/dto/create-mock-order.dto.ts`
- [ ] Añadir campos `buyer_registered_ecommerce`, `buyer_ecommerce_address` y `gift_recipient` a `CreateMockOrderDto`

**Servicio**
- [ ] Importar `MockOrderContext` de `@adresles/shared-types` en `conversations.service.ts`
- [ ] Ampliar `createAndEnqueue()` en `ConversationsService` para aceptar `context?: MockOrderContext` y pasarlo a `queue.addProcessConversationJob()`
- [ ] Actualizar `MockOrdersService.processAdreslesOrder()` para pasar `context` (con los 3 campos) a `createAndEnqueue()`

**Queue y Worker**
- [ ] En `queue.service.ts`, eliminar interfaces locales y re-exportar desde `@adresles/shared-types`
- [ ] En `conversation.processor.ts`, eliminar interfaces locales e importar desde `@adresles/shared-types`
- [ ] Actualizar `conversationProcessor` para extraer `context` de `job.data` y pasarlo a `processGetAddressJourney()`
- [ ] Actualizar firma de `processGetAddressJourney()` para aceptar `context?: MockOrderContext` opcional (sin cambiar la lógica interna)

**Tests y verificación**
- [ ] En `mock-orders.service.spec.ts`: añadir 3 casos (context con campos, sin campos → defaults, gift_recipient)
- [ ] Ejecutar `pnpm build` en la raíz y verificar que compilan los 3 paquetes
- [ ] Verificar retrocompatibilidad: payload sin nuevos campos responde 201
- [ ] Verificar que `gift_recipient` sin `phone` responde 400 y que `buyer_ecommerce_address` sin `country` responde 400

---

> **Nota para CU03-B2**: El `context` ya estará disponible en `job.data.context` del Worker. La selección del sub-journey correcto se implementará en ese ticket, no aquí.
