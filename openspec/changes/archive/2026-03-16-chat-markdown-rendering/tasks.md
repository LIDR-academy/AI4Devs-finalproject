## 1. Frontend — Instalación de dependencias

- [x] 1.1 [frontend] Instalar `react-markdown`, `remark-gfm` y `remark-breaks` en `apps/web-admin/` con `pnpm add react-markdown remark-gfm remark-breaks`
- [x] 1.2 [qa] Verificar que `pnpm build` en `apps/web-admin/` completa sin errores tras la instalación

## 2. Frontend — Componente MarkdownMessage

- [x] 2.1 [frontend] Crear `apps/web-admin/src/components/chat/markdown-message.tsx` con el componente `MarkdownMessage` (`React.memo`, plugins `remarkGfm` + `remarkBreaks`, prop `content: string`, prop `colorScheme: 'light' | 'dark'`)
- [x] 2.2 [frontend] Implementar el mapeo completo de `components` de `react-markdown` con clases Tailwind: `p`, `strong`, `em`, `del`, `code`, `ul`, `ol`, `blockquote`, `h1`/`h2`/`h3` (redirigir a `<p className="font-semibold mb-1">`), `a`
- [x] 2.3 [qa] Verificar manualmente en el navegador que `**texto**` se renderiza en negrita, `_texto_` en cursiva y que `\n` simple produce un salto de línea visible

## 3. Frontend — Integración en ChatBubble

- [x] 3.1 [frontend] Actualizar `apps/web-admin/src/components/chat/chat-bubble.tsx`: sustituir `{message.content}` por `<MarkdownMessage content={message.content} colorScheme="light" />` en la rama `assistant`
- [x] 3.2 [frontend] Actualizar `apps/web-admin/src/components/chat/chat-bubble.tsx`: sustituir `{message.content}` por `<MarkdownMessage content={message.content} colorScheme="dark" />` en la rama `user`
- [x] 3.3 [qa] Verificar que la rama `system` de `ChatBubble` no ha sido modificada (sigue renderizando texto plano centrado en cursiva)
- [x] 3.4 [qa] Verificar en el navegador (ruta `/conversations/[id]`) que los mensajes del asistente con `**addr**` muestran la dirección en negrita y sin asteriscos literales

## 4. Worker — Actualización de message builders

- [x] 4.1 [backend] Actualizar `processInformationJourney` en `apps/worker/src/processors/conversation.processor.ts`: usar `**#{orderNumber}**`, `**${order.store.name}**` y bloque `📍 **Dirección de entrega:**\n${addressLine}` con separaciones `\n\n` entre párrafos
- [x] 4.2 [backend] Actualizar `buildConfirmationRequest` en `apps/worker/src/services/address.service.ts`: cambiar `📍 ${addr}` por `📍 **${addr}**` en las tres variantes de idioma (español, inglés, francés)
- [x] 4.3 [backend] Actualizar `buildSyncSuccessMessage` en `apps/worker/src/services/address.service.ts`: añadir `**${storeName}**` y `📍 **${addr}**` en las tres variantes de idioma
- [x] 4.4 [backend] Actualizar `buildBuildingDetailsRequest` en `apps/worker/src/services/address.service.ts`: cambiar `📍 ${addr}` por `📍 **${addr}**` en las tres variantes de idioma

## 5. Worker — Actualización de tests

- [x] 5.1 [qa] Localizar en `apps/worker/src/processors/conversation.processor.spec.ts` todos los tests que validan el `content` de los mensajes de los builders modificados (buscar strings con `📍`, `orderNumber`, `storeName`)
- [x] 5.2 [qa] Actualizar los strings esperados en los tests de `processInformationJourney` para incluir `**#` en el número de pedido y `**` en el nombre de tienda
- [x] 5.3 [qa] Actualizar los strings esperados en los tests de `buildConfirmationRequest`, `buildSyncSuccessMessage` y `buildBuildingDetailsRequest` para incluir `**${addr}**`
- [x] 5.4 [qa] Ejecutar `pnpm test` en `apps/worker/` y verificar que todos los tests pasan

## 6. Verificación final

- [x] 6.1 [qa] Ejecutar `pnpm build` en `apps/web-admin/` y confirmar build sin errores TypeScript ni de módulo
- [x] 6.2 [qa] Verificar en la ruta `/simulate` que las burbujas del asistente renderizan Markdown (negrita en direcciones, emojis 📍, saltos de línea correctos)
- [x] 6.3 [qa] Verificar en la ruta `/conversations/[id]` que mensajes históricos sin Markdown se renderizan idénticos al estado anterior (retrocompatibilidad)
- [x] 6.4 [qa] Confirmar que `pnpm lint` en `apps/web-admin/` pasa sin errores en los archivos nuevos y modificados
