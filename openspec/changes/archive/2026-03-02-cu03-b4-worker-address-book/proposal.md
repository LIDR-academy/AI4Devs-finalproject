# Proposal: CU03-B4 — Worker: Libreta de direcciones

## Why

Tras confirmar la dirección de entrega, el sistema cierra la conversación sin ofrecer guardarla en la libreta de Adresles. Los usuarios registrados (o recién registrados) no pueden aprovechar la confirmación automática en futuras compras. CU03-B3 dejó un handler temporal para `WAITING_SAVE_ADDRESS`; este change lo reemplaza con la lógica real.

## What Changes

- Ofrecer guardar la dirección confirmada cuando sea nueva (no está en la libreta del usuario).
- Pedir el alias de la dirección antes de persistir (ej: "Casa", "Trabajo"); usarlo en `Address.label`.
- Nueva fase `WAITING_SAVE_ADDRESS_LABEL` para solicitar el alias; handler `handleWaitingSaveAddressLabel`.
- Función `offerSaveAddress()` que detecta dirección nueva y transiciona a `WAITING_SAVE_ADDRESS`.
- Función `closeConversation()` como helper compartido.
- Modificar `finalizeAddress()` para usuarios registrados: llamar a `offerSaveAddress()` en lugar de cerrar.
- Modificar `handleWaitingRegisterEmail()`: tras registro, llamar a `offerSaveAddress()`.
- Crear registros en `prisma.address` con `label` = alias del usuario (o `'Mi dirección'` si vacío).

## Capabilities

### New Capabilities
_(Ninguna — la funcionalidad extiende el flujo existente de conversaciones.)_

### Modified Capabilities
- `mock-conversations`: Requisitos para ofrecer guardar dirección, fase WAITING_SAVE_ADDRESS_LABEL, pedido de alias, creación de Address en Prisma, y helpers `offerSaveAddress` / `closeConversation`.

## Impact

- **apps/worker/src/services/address.service.ts**: Funciones `buildSaveAddressOfferMessage`, `buildSaveAddressLabelRequestMessage`, `buildAddressSavedMessage`, `buildAddressNotSavedMessage`; fase `WAITING_SAVE_ADDRESS_LABEL` en `ConversationPhase`.
- **apps/worker/src/processors/conversation.processor.ts**: `offerSaveAddress`, `closeConversation`, `handleWaitingSaveAddress` (reemplazo), `handleWaitingSaveAddressLabel` (nuevo), cambios en `finalizeAddress` y `handleWaitingRegisterEmail`.
- **Base de datos**: Inserciones en tabla `Address` (schema existente; sin migraciones).

## Rollback

Revertir commits del change y restaurar el handler temporal de `handleWaitingSaveAddress` que solo cierra la conversación. No hay migraciones que deshacer. Las Address creadas quedan en DB; si se requiere limpieza, ejecutar script de borrado por rango de fechas.
