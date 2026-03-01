## Why

La infraestructura SSE (CU03-A2) y el modal de configuración de pedido (CU03-A5) están operativos, pero la sección `/simulate` del Dashboard Admin aún no muestra la conversación en tiempo real ni permite responder como usuario simulado. Sin este componente, el flujo de simulación completa (configurar pedido → ver mensajes del agente → responder) no es funcional.

## What Changes

- **Nuevo componente** `SimulationChat` en `apps/web-admin`: gestiona el historial de mensajes, la suscripción SSE via `EventSource` y el envío de respuestas al agente
- **Nuevo componente** `TypingIndicator` en `apps/web-admin`: indicador animado de tres puntos mientras el agente procesa la respuesta
- **Nuevas funciones API** en `apps/web-admin/src/lib/api.ts`: `getConversationHistory()` y `sendReply()`
- **Reestructuración de layout** en `simulation-page.tsx`: las Zonas B y C pasan a ser gestionadas íntegramente por `SimulationChat` (el wrapper externo cambia de `overflow-y-auto` a `flex flex-col overflow-hidden`)

## Capabilities

### New Capabilities

- `simulation-chat`: Chat de simulación en tiempo real — historial de mensajes cargado desde DynamoDB vía REST, mensajes del agente recibidos via SSE (`EventSource`), envío de respuestas del usuario vía POST, indicador de escritura, scroll automático, estado final de conversación (COMPLETED / ESCALATED / TIMEOUT)

### Modified Capabilities

- `simulate-layout`: El layout de las Zonas B y C cambia: en lugar de ser divs separados en `SimulationPage`, `SimulationChat` gestiona ambas zonas internamente. El wrapper de Zona B pasa de `flex-1 overflow-y-auto` a `flex-1 flex flex-col overflow-hidden` cuando hay conversación activa.

## Impact

- **Archivos nuevos**: `apps/web-admin/src/components/simulate/simulation-chat.tsx`, `apps/web-admin/src/components/simulate/typing-indicator.tsx`
- **Archivos modificados**: `apps/web-admin/src/lib/api.ts` (nuevas funciones), `apps/web-admin/src/components/simulate/simulation-page.tsx` (reestructuración de layout)
- **APIs consumidas**: `GET /api/mock/conversations/:id/history`, `POST /api/mock/conversations/:id/reply`, `GET /api/mock/conversations/:id/events` (SSE — ya operativo desde CU03-A2)
- **Sin cambios en backend**: toda la implementación es frontend (`apps/web-admin`)
- **Rollback**: revertir `simulation-page.tsx` al placeholder original y eliminar los dos nuevos archivos de componentes. No hay cambios de DB ni breaking changes en la API.
