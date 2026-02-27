# CU03-A3 — Extensión del DTO mock: parámetros eCommerce y regalo manual

**App**: `apps/api` (NestJS — MockModule)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Prerrequisitos**: CU-01 completado ✅

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

### Ejemplo de payload completo para sub-journey 2.3

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

### `apps/api/src/mock/dto/create-mock-order.dto.ts` — nuevos campos

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

// --- En CreateMockOrderDto, añadir al final ---

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

### `apps/api/src/mock/mock-orders.service.ts` — pasar contexto al job

Los nuevos campos deben propagarse al job de BullMQ para que el Worker pueda acceder a ellos. Revisar `ConversationsService.createAndEnqueue()` para incluir `context` en el job data:

En `processAdreslesOrder()`, pasar los nuevos campos al crear la conversación:

```typescript
const conversation = await this.conversations.createAndEnqueue({
  orderId: order.id,
  userId,
  conversationType: 'GET_ADDRESS',
  userType: UserType.BUYER,
  context: {
    buyerRegisteredEcommerce: dto.buyer_registered_ecommerce ?? false,
    buyerEcommerceAddress: dto.buyer_ecommerce_address ?? null,
  },
});
```

### `apps/api/src/conversations/conversations.service.ts` — ampliar `createAndEnqueue()`

Añadir campo `context` opcional al DTO de entrada y pasarlo como parte del `job.data`:

```typescript
interface CreateConversationDto {
  orderId: string;
  userId: string;
  conversationType: ConversationType;
  userType: UserType;
  context?: {
    buyerRegisteredEcommerce?: boolean;
    buyerEcommerceAddress?: Record<string, unknown> | null;
  };
}
```

El `context` se incluye en el job data de BullMQ para que el Worker lo recupere en `job.data.context`.

### `apps/worker/src/processors/conversation.processor.ts` — leer `context` del job

Extender `ProcessConversationJobData` para incluir el contexto:

```typescript
export interface ProcessConversationJobData {
  conversationId: string;
  orderId: string;
  userId: string;
  conversationType: string;
  context?: {
    buyerRegisteredEcommerce?: boolean;
    buyerEcommerceAddress?: {
      full_address: string;
      street: string;
      number?: string;
      floor?: string;
      door?: string;
      postal_code: string;
      city: string;
      country: string;
    } | null;
  };
}
```

En `conversationProcessor`, el `context` se pasa a `processGetAddressJourney()` para que en CU03-B2 se pueda usar para seleccionar el sub-journey correcto. Por ahora se ignora (el journey básico sigue funcionando igual).

---

## Lista de tareas

- [ ] Añadir clase `MockGiftRecipientDto` en `apps/api/src/mock/dto/create-mock-order.dto.ts`
- [ ] Añadir campos `buyer_registered_ecommerce`, `buyer_ecommerce_address` y `gift_recipient` a `CreateMockOrderDto`
- [ ] Actualizar `MockOrdersService.processAdreslesOrder()` para pasar `context` al crear la conversación
- [ ] Ampliar `CreateConversationDto` en `ConversationsService` para aceptar campo `context` opcional
- [ ] Pasar `context` en el `job.data` al encolar el job BullMQ
- [ ] Extender `ProcessConversationJobData` en el Worker para incluir campo `context`
- [ ] Verificar que el endpoint `POST /api/mock/orders` sigue aceptando payloads sin los nuevos campos (retrocompatibilidad)
- [ ] Verificar que el endpoint acepta los nuevos campos opcionales sin errores de validación
