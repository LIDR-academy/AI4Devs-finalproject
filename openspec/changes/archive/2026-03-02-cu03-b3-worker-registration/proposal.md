## Why

Los usuarios no registrados que completan una compra no tienen oportunidad de registrarse en Adresles al final del proceso, perdiendo conversión y adopción de la libreta de direcciones. El Journey 3 requiere ofrecer el registro voluntario tras confirmar la dirección, permitiendo que futuras compras usen confirmación automática.

## What Changes

- **Modificar `finalizeAddress()`**: Bifurcar según `user.isRegistered`. Si no registrado, ofrecer registro en lugar de cerrar la conversación.
- **Nuevas fases**: `WAITING_REGISTER` (espera Sí/No) y `WAITING_REGISTER_EMAIL` (espera email vía chat).
- **Nuevos handlers**: `handleWaitingRegister` (acepta → pide email; rechaza → cierra) y `handleWaitingRegisterEmail` (email válido → actualiza User, mensaje confirmación, transición a CU03-B4; inválido → re-pide).
- **Mensajes nuevos**: oferta de registro, petición de email, confirmación tras registro, despedida al rechazar.
- **Extracción de email**: `extractEmailFromMessage()` (regex u OpenAI) para validar el correo indicado vía chat.
- **Estado**: Campo `confirmedAddress` en `ConversationState` para pasar la dirección a CU03-B4 (libreta).
- **Rollback**: Revertir cambios en `address.service.ts` y `conversation.processor.ts`; el flujo anterior (cierre directo tras confirmar dirección) se restaura.

## Capabilities

### New Capabilities

- Ninguna (el flujo se extiende dentro del journey GET_ADDRESS existente).

### Modified Capabilities

- **mock-conversations**: Nuevos requirements para el flujo de registro voluntario post-confirmación: fases WAITING_REGISTER y WAITING_REGISTER_EMAIL, handlers, bifurcación en finalizeAddress según isRegistered, actualización de User con email indicado vía chat, transición a WAITING_SAVE_ADDRESS para CU03-B4.

## Impact

- **apps/worker**: `address.service.ts` (tipos, mensajes, extractEmailFromMessage), `conversation.processor.ts` (finalizeAddress, handleWaitingRegister, handleWaitingRegisterEmail, mapa handlers).
- **Base de datos**: `prisma.user.update` con `isRegistered`, `registeredAt`, `email` — campos ya existentes.
- **Sin cambios**: API REST, frontend, schema Prisma.
- **Dependencias**: CU03-B1 y CU03-B2 completados. CU03-B4 consumirá el estado `WAITING_SAVE_ADDRESS` con `confirmedAddress`.
