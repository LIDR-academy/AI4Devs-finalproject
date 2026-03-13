## Why

CU03-A4 implementó el layout de `/simulate` dejando `OrderConfigModal` como placeholder vacío (`return null`). Sin este modal, el administrador no puede configurar ningún parámetro de la compra simulada y el flujo CU03 no puede avanzar. Este change completa el modal con todos sus campos, lógica condicional e integración con `POST /api/mock/orders`.

## What Changes

- **Nuevo**: `apps/web-admin/src/lib/simulate-data.ts` — catálogos de 20 direcciones y 20 compras ficticias con helpers `getRandomAddress()`, `getRandomOrder()` y `toAddressPayload()`
- **Nuevo**: `apps/web-admin/src/components/simulate/user-combobox.tsx` — combobox reutilizable para seleccionar usuario de la DB o introducir datos manualmente, con badges de estado Adresles
- **Actualizado**: `apps/web-admin/src/components/simulate/order-config-modal.tsx` — reemplaza el placeholder por la implementación completa con 7 secciones de campos, lógica condicional y submit con manejo de errores
- **Actualizado**: `apps/web-admin/src/types/api.ts` — nuevos tipos `CreateMockOrderPayload` y `StartSimulationResult`
- **Actualizado**: `apps/web-admin/src/lib/api.ts` — `apiFetch` con soporte para `init?: RequestInit` y nueva función `startSimulation()`

## Capabilities

### New Capabilities

- `order-config-modal`: Modal de configuración del pedido simulado en el Dashboard Admin — campos condicionales por modo (ADRESLES/TRADICIONAL), selección de comprador/destinatario, catálogos de datos ficticios e integración con `POST /api/mock/orders`

### Modified Capabilities

- `simulate-layout`: El placeholder `OrderConfigModal` (CU03-A4) se convierte en componente funcional; el req de "OrderConfigModal SHALL renderizarse (CU03-A5)" pasa a implementado

## Impact

- **Solo frontend**: `apps/web-admin` — no hay cambios en backend ni en base de datos
- **No breaking changes**: el contrato de props de `OrderConfigModal` ya estaba fijado en CU03-A4 (`open`, `onClose`, `stores`, `users`, `onConversationStarted`)
- **Dependencia de runtime**: `POST /api/mock/orders` (disponible desde CU03-A1/CU03-A3)
- **Rollback**: revertir a la versión placeholder de `order-config-modal.tsx` (`return null`) es suficiente para volver al estado anterior sin afectar otras funcionalidades
