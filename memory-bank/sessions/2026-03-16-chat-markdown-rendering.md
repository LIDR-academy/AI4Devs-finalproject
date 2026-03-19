# Sesión: chat-markdown-rendering

> **Fecha**: 2026-03-16  
> **Change**: `chat-markdown-rendering`  
> **Estado**: ✅ Completado (21/21 tareas)  
> **Tipo**: Mejora de UX — Renderizado Markdown en burbujas de chat

---

## Qué se hizo

Se implementó renderizado Markdown en el chat del Dashboard Admin y se estandarizó el formato de los mensajes generados por el Worker.

### Frontend (`apps/web-admin/`)
- Instaladas dependencias: `react-markdown`, `remark-gfm`, `remark-breaks`
- Creado componente `MarkdownMessage` (`React.memo`, mapeo completo de elementos Tailwind)
- Actualizado `ChatBubble` para usar `MarkdownMessage` en ramas `assistant` y `user`
- La rama `system` permanece con texto plano (es metadata, no mensaje de usuario final)

### Backend — Worker (`apps/worker/`)
- Actualizados 4 builders para emitir Markdown consistente:
  - `processInformationJourney` → `**#orderNumber**`, `**storeName**`, `📍 **Dirección:**\n${addr}`
  - `buildConfirmationRequest` → `📍 **${addr}**` (ES/EN/FR)
  - `buildSyncSuccessMessage` → `**${storeName}**` + `📍 **${addr}**` (ES/EN/FR)
  - `buildBuildingDetailsRequest` → `📍 **${addr}**` (ES/EN/FR)
- Tests actualizados en `conversation.processor.spec.ts` para los nuevos strings

---

## Aprendizajes clave

### 1. Markdown estándar, no WhatsApp Markdown

La petición inicial fue "añadir soporte para WhatsApp Markdown". Sin embargo, al revisar el Worker se detectó que los builders ya usaban Markdown estándar (`**bold**`). La decisión fue **mantener Markdown estándar** y renderizarlo correctamente en el frontend, en lugar de migrar a la sintaxis de WhatsApp (`*bold*`).

**Consecuencia**: Todo el contenido en DynamoDB es/será Markdown estándar. No mezclar sintaxis.

### 2. `remark-breaks` es imprescindible

El Worker usa `\n` simples para saltos de línea dentro de un párrafo (ej: `📍 **Dirección:**\n${addr}`). Sin `remark-breaks`, estos `\n` se ignorarían al renderizar. Con el plugin, cada `\n` se convierte en `<br>`.

**Regla a recordar**: `remark-gfm` + `remark-breaks` siempre juntos en el contexto de este chat.

### 3. Criterio D5 — no todo mensaje necesita Markdown

La tentación fue añadir Markdown a todos los builders. El diseño estableció un criterio claro (llamado D5 en `design.md`):

> "Solo aplican Markdown los mensajes que contienen datos clave que requieren énfasis visual: direcciones, referencias de pedido, nombres de tienda."

Los mensajes conversacionales cortos (`buildRegistrationOfferMessage`, `buildUnknownIntentMessage`, etc.) se dejan en texto plano. Esto es intencional.

### 4. Retrocompatibilidad automática

Los mensajes históricos en DynamoDB sin Markdown se renderizan correctamente sin migración. `react-markdown` trata texto plano como texto plano. No fue necesaria ninguna estrategia de migración de datos.

### 5. Headings redirigidos en chatComponents

`h1`, `h2`, `h3` se redirigen a `<p className="font-semibold mb-1">` en el componente `chatComponents`. Esto previene que el LLM o un builder futuro que use `# Título` rompa el layout de la burbuja con texto gigante.

---

## Tests

- `pnpm test` en `apps/worker/`: ✅ todos pasan
- `pnpm build` + `pnpm lint` en `apps/web-admin/`: ✅ sin errores

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `apps/web-admin/package.json` | `+react-markdown`, `+remark-gfm`, `+remark-breaks` |
| `apps/web-admin/src/components/chat/markdown-message.tsx` | Nuevo componente |
| `apps/web-admin/src/components/chat/chat-bubble.tsx` | Integración `MarkdownMessage` |
| `apps/worker/src/processors/conversation.processor.ts` | `processInformationJourney` con Markdown |
| `apps/worker/src/services/address.service.ts` | 3 builders con `📍 **${addr}**` |
| `apps/worker/src/processors/conversation.processor.spec.ts` | Tests actualizados |

---

## Patrón documentado

Ver: [`patterns/chat-markdown-patterns.md`](../patterns/chat-markdown-patterns.md)
