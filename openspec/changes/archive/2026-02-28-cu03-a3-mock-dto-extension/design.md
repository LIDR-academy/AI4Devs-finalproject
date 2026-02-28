## Context

El endpoint `POST /api/mock/orders` ya procesa pedidos mock en dos modos (`adresles` y `tradicional`). El flujo adresles encola un job `process-conversation` en BullMQ que el Worker consume para iniciar la conversación con el comprador. Sin embargo, el job no lleva ningún contexto sobre el estado del comprador en el eCommerce ni sobre datos de regalo introducidos manualmente.

El próximo ticket CU03-B2 implementará la selección de sub-journey en el Worker (p.ej. proponer la dirección guardada en el eCommerce si el comprador está registrado allí). Para que CU03-B2 pueda funcionar, el job debe transportar ese contexto desde el momento en que se crea la orden. Esta change sienta esa base sin cambiar la lógica del journey actual.

Stack involucrado: NestJS (API) · BullMQ + Redis (cola) · Worker TypeScript standalone.

## Goals / Non-Goals

**Goals:**
- Añadir tres campos opcionales al DTO de entrada (`buyer_registered_ecommerce`, `buyer_ecommerce_address`, `gift_recipient`).
- Propagar esos campos como objeto `context` a través de `ConversationsService` → `QueueService` → payload del job BullMQ.
- Hacer disponible el `context` en el Worker (extraído de `job.data`) sin modificar la lógica actual del journey GET_ADDRESS.
- Mantener retrocompatibilidad total: payloads sin los nuevos campos siguen funcionando.

**Non-Goals:**
- Implementar la lógica de selección de sub-journey (CU03-B2).
- Añadir un modo `gift` al enum de `mode` (decisión diferida a CU03-B3).
- Persistir `context` en la base de datos (solo viaja en el job BullMQ).
- Validación cross-field (ej. `buyer_ecommerce_address` requiere `buyer_registered_ecommerce=true`); se hará en CU03-B2 cuando se conozca el contrato completo.

## Decisions

### 1. Objeto `context` en lugar de parámetros planos en `createAndEnqueue()`

`ConversationsService.createAndEnqueue()` ya tiene parámetros planos `isRegisteredAdresles` y `hasAddressAdresles`. En lugar de añadir más parámetros planos al mismo nivel, los nuevos campos se agrupan bajo una clave `context` opcional.

**Alternativa descartada**: añadir `buyerRegisteredEcommerce`, `buyerEcommerceAddress` y `giftRecipient` como parámetros planos junto a los existentes.

**Razón de la elección**: el objeto `context` escala limpiamente —CU03-B2 y CU03-B3 añadirán más campos sin ensanchar la firma principal. Los parámetros planos existentes (`isRegisteredAdresles`, `hasAddressAdresles`) representan una preocupación distinta (registro en Adresles) y se mantienen separados.

### 2. Extraer `ProcessConversationJobData` a `packages/shared-types` en lugar de mantener dos copias

La interfaz existe actualmente en `apps/api/src/queue/queue.service.ts` y duplicada en `apps/worker/src/processors/conversation.processor.ts`. Cualquier cambio futuro (como añadir `context` en este ticket) obliga a actualizar ambas copias manualmente, con riesgo de drift silencioso.

**Decisión**: crear el paquete `packages/shared-types` (`@adresles/shared-types`) que exporta `ProcessConversationJobData`, `ProcessResponseJobData` y `MockOrderContext`. API y Worker eliminan sus definiciones locales e importan desde el paquete.

**Por qué es viable sin sobrecarga**:
- `pnpm-workspace.yaml` ya tiene `packages/*` declarado — cero cambio de infraestructura de workspaces.
- Turborepo con `"dependsOn": ["^build"]` ya gestiona el orden de build; basta añadir la misma dependencia a la tarea `dev`.
- El paquete tiene cero dependencias de producción: solo interfaces TypeScript.

**Alternativa descartada**: actualizar ambas copias en el mismo commit con un comentario `// keep in sync`. Funciona a corto plazo pero crea deuda técnica explícita y no tiene garantía en tiempo de compilación.

### 3. Tipo explícito para `buyerEcommerceAddress` en lugar de `Record<string, unknown>`

Se usa una interfaz inline con los mismos campos que `MockAddressDto` (incluyendo los opcionales `block`, `staircase`, `additional_info`, `province`). El ticket original usaba `Record<string, unknown>`, lo que pierde type-safety en el Worker.

**Razón**: el Worker necesita acceder a campos concretos (p.ej. `full_address`) para construir el mensaje al comprador en CU03-B2. Type-safety ahora evita bugs difíciles de detectar después.

### 4. `gift_recipient` se incluye en `context`, no se procesa en este ticket

El campo se propaga hasta `job.data.context.giftRecipient` pero el Worker no actúa sobre él todavía. Esto respeta el principio de que esta change solo sienta la infraestructura de transporte de datos.

## Risks / Trade-offs

- **[Riesgo] Race condition en `dev`: API/Worker arrancan antes de que `shared-types` esté compilado** → Mitigación: añadir `"dependsOn": ["^build"]` a la tarea `dev` en `turbo.json`. Así Turborepo garantiza que `shared-types` compila primero.

- **[Riesgo] `context` no persistido en DB** — si el Worker reinicia y reprocesa el job, el contexto se pierde si Redis lo descartó → Mitigación: BullMQ persiste el job data en Redis hasta completarse; el contexto estará disponible mientras el job exista. Aceptable para MVP mock.

- **[Trade-off] No validación cross-field en este ticket** — un payload con `buyer_ecommerce_address` pero sin `buyer_registered_ecommerce=true` es técnicamente aceptado → Mitigación: la validación cruzada no tiene valor hasta que el Worker la consuma (CU03-B2). Añadir el decorador `@ValidateIf` antes de que el Worker la use sería over-engineering prematuro.
