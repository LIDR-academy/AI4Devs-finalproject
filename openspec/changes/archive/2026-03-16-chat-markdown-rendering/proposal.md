## Why

El componente `ChatBubble` renderiza el campo `content` de los mensajes como texto plano. Sin embargo, el Worker ya emite sintaxis Markdown estándar (`**negrita**`, `\n` y `\n\n`, emojis 📍✅) en varios de sus builders (ver `buildAddressProposalMessage`, `buildSaveAddressOfferMessage` en `address.service.ts`). El resultado es que el usuario ve literalmente los asteriscos en lugar del formato enriquecido. Adicionalmente, algunos builders del Worker aún no aplican Markdown de forma consistente (`processInformationJourney`, `buildConfirmationRequest`, `buildSyncSuccessMessage`), por lo que el campo `content` almacenado en DynamoDB no tiene un formato uniforme que pueda ser renderizado correctamente.

## What Changes

- Instalación de `react-markdown`, `remark-gfm` y `remark-breaks` en `apps/web-admin/` (~50 KB tree-shaken; sin dependencias de estilos adicionales — usa Tailwind v4 CSS-first)
- Nuevo componente `MarkdownMessage` (`React.memo`) con `components` personalizados que eliminan headings gigantes y aplican estilos de burbuja de chat; `remark-breaks` convierte `\n` simple en `<br>` (crítico porque el Worker usa ambos `\n` y `\n\n`)
- `ChatBubble` sustituye `{message.content}` por `<MarkdownMessage>` en los roles `assistant` y `user`; los mensajes `system` mantienen su tratamiento visual actual (texto centrado en cursiva)
- Actualización de los message builders del Worker que aún no usan Markdown consistente, para que `content` en DynamoDB se almacene ya en el formato correcto para ser renderizado

## Capabilities

### New Capabilities

- `chat-message-markdown-rendering`: Renderizado de Markdown estándar en burbujas de chat del Dashboard Admin (`ChatBubble` + nuevo componente `MarkdownMessage`), cubriendo tanto la vista de historial de conversación (`/conversations/[conversationId]`) como la vista de simulación en tiempo real (`/simulate`)
- `worker-markdown-message-format`: Normalización de los message builders del Worker para emitir Markdown estándar consistente en el campo `content`, garantizando que lo almacenado en DynamoDB se renderice correctamente en el Dashboard

### Modified Capabilities

- `admin-dashboard`: La especificación de renderizado de mensajes en burbujas cambia: el campo `content` pasa a interpretarse como Markdown estándar en lugar de texto plano

## Impact

**Frontend** (`apps/web-admin/`):
- `package.json`: +3 dependencias (`react-markdown`, `remark-gfm`, `remark-breaks`)
- `src/components/chat/chat-bubble.tsx`: sustitución de `{message.content}` por `<MarkdownMessage>` en ramas `assistant` y `user`
- `src/components/chat/markdown-message.tsx`: archivo nuevo — `MarkdownMessage` con `React.memo`, plugins `remarkGfm` + `remarkBreaks`, `components` personalizados con Tailwind (p, strong, em, del, code, ul, ol, blockquote, a; h1/h2/h3 redirigidos a `<p className="font-semibold">`)
- Sin cambios en `chat-view.tsx`, `simulation-chat.tsx`, ni en ningún otro componente del Dashboard

**Worker** (`apps/worker/`):
- `src/processors/conversation.processor.ts`: `processInformationJourney` — añadir Markdown (negrita en número de pedido y nombre de tienda, emoji 📍 para la dirección)
- `src/services/address.service.ts`: revisión y actualización de builders sin Markdown consistente (`buildBuildingDetailsRequest`, `buildConfirmationRequest`, `buildSyncSuccessMessage`, `buildRegistrationOfferMessage`) para usar `**texto**` en los valores clave
- `src/processors/conversation.processor.spec.ts`: actualización de strings esperados en los tests afectados

**DynamoDB** (ADR-002):
- Sin cambios de esquema. El campo `content: string` ya es el correcto; el cambio es en el contenido (Markdown consistente en lugar de texto plano parcial)
- Retrocompatibilidad garantizada: mensajes sin sintaxis Markdown se renderizan idénticos a texto plano a través de `react-markdown`
- Mensajes ya almacenados con `**...**` (p. ej. de `buildAddressProposalMessage`) se mostrarán ahora correctamente en negrita sin necesidad de migración

**Sin impacto**:
- API NestJS (`apps/api/`): sin cambios — el `content` se almacena y se devuelve sin modificaciones
- Redis, esquema Prisma, SSE: sin cambios
- `packages/shared-types`: sin cambios — `MessageRole` y el contrato de colas no se ven afectados (ADR-007)
