# Patrón: Markdown en Mensajes de Chat

> **Última actualización**: 2026-03-16  
> **Change origen**: `chat-markdown-rendering`  
> **Archivos clave**: `apps/web-admin/src/components/chat/markdown-message.tsx`, `apps/worker/src/services/address.service.ts`

---

## Contexto

Los mensajes de conversación se persisten en DynamoDB como `content: string`. El Worker genera estos mensajes con formato Markdown estándar para que el frontend los renderice visualmente (negrita, emojis, saltos de línea).

---

## Convención de Markdown en el Worker

### Estándar adoptado: Markdown estándar (CommonMark + GFM)

Se usa **Markdown estándar** (CommonMark), **no** WhatsApp Markdown (`*bold*`).

| Efecto | Sintaxis correcta | Sintaxis incorrecta (WhatsApp) |
|---|---|---|
| Negrita | `**texto**` | `*texto*` |
| Cursiva | `_texto_` o `*texto*` (ambivalente) | — |
| Salto línea (suave) | `\n` | `<br>` |
| Párrafo | `\n\n` | — |

**Motivo**: `react-markdown` con `remark-breaks` convierte los `\n` simples en `<br>`, mientras que WhatsApp Markdown no es estándar y añade complejidad sin beneficio real.

---

## Criterio D5: Qué mensajes aplican Markdown

Solo aplican Markdown los mensajes que contienen **datos clave que requieren énfasis visual**:

| Builder | ¿Markdown? | Datos resaltados |
|---|---|---|
| `processInformationJourney` | ✅ | Nombre, `#orderNumber`, nombre tienda, dirección |
| `buildConfirmationRequest` | ✅ | Dirección (`📍 **${addr}**`) |
| `buildSyncSuccessMessage` | ✅ | Nombre tienda, dirección |
| `buildBuildingDetailsRequest` | ✅ | Dirección (`📍 **${addr}**`) |
| `buildAddressProposalMessage` | ✅ | Dirección (pre-existente) |
| `buildSaveAddressOfferMessage` | ✅ | Dirección (pre-existente) |
| `buildAddressNotFoundMessage` | ❌ | Texto informativo sin datos clave |
| `buildUnknownIntentMessage` | ❌ | Texto de error corto |
| `buildRegistrationOfferMessage` | ❌ | Texto narrativo sin datos clave |
| `buildRegistrationSuccessMessage` | ❌ | Confirmación corta |
| `buildRegistrationDeclinedMessage` | ❌ | Cierre conversacional |
| Mensajes inline (escalada, sync error) | ❌ | Mensajes de error técnicos |

**Regla nemotécnica**: Si el mensaje contiene una dirección, referencia de pedido o nombre de tienda → usar `**...**`. Si es texto conversacional puro → texto plano.

---

## Patrón de mensaje multi-párrafo en el Worker

```typescript
// Patrón: array.join('\n\n') para separar párrafos
const message = [
  `¡Hola **${name}**!`,
  `✅ Tu pedido **#${orderNumber}** de **${storeName}** ha sido confirmado.`,
  `📍 **Dirección de entrega:**\n${address}`,  // \n suave dentro del párrafo
  `📦 Tu pedido será enviado pronto.\n\n¡Gracias por tu compra!`,
].join('\n\n');
```

**Regla**: Usar `\n\n` entre párrafos (via `.join('\n\n')`). Usar `\n` para saltos suaves dentro del mismo bloque (ej: "etiqueta + dirección").

---

## Componente MarkdownMessage (Frontend)

Ubicación: `apps/web-admin/src/components/chat/markdown-message.tsx`

```typescript
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

export const MarkdownMessage = memo(function MarkdownMessageBase({ content }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={chatComponents}>
      {content}
    </ReactMarkdown>
  );
});
```

**Plugins obligatorios**:
- `remark-gfm`: GFM — tablas, strikethrough (`~~`), task lists
- `remark-breaks`: **Crítico** — convierte `\n` simples a `<br>`. Sin este plugin, los saltos de línea del Worker no se renderizan.

**Props**:
- `content: string` — el texto Markdown del mensaje
- `colorScheme: 'light' | 'dark'` — contexto visual (actualmente no altera estilos, reservado para tematización)

---

## Integración en ChatBubble

```typescript
// apps/web-admin/src/components/chat/chat-bubble.tsx

// Rama assistant:
<MarkdownMessage content={message.content} colorScheme="light" />

// Rama user:
<MarkdownMessage content={message.content} colorScheme="dark" />

// Rama system: NUNCA usa MarkdownMessage — texto plano siempre
<p className="text-xs italic text-gray-400 px-2">{message.content}</p>
```

**Regla**: Los mensajes `system` NO pasan por Markdown. Son metadatos internos de la conversación, no mensajes visibles al usuario final.

---

## Retrocompatibilidad

`react-markdown` renderiza texto plano sin Markdown como texto plano. Los mensajes históricos en DynamoDB que no tienen sintaxis Markdown (guardados antes de este cambio) se renderizan correctamente sin necesidad de migración de datos.

---

## Mapeo de componentes Tailwind

Los elementos Markdown se renderizan con clases Tailwind para mantener la estética de burbuja de chat:

| Elemento | Clase Tailwind |
|---|---|
| `p` | `block mb-2 last:mb-0` |
| `strong` | `font-semibold` |
| `em` | `italic` |
| `del` | `line-through opacity-70` |
| `code` | `font-mono text-xs bg-black/10 rounded px-1 py-0.5` |
| `ul` | `list-disc pl-4 space-y-0.5 mb-2` |
| `ol` | `list-decimal pl-4 space-y-0.5 mb-2` |
| `h1`/`h2`/`h3` | Redirigidos a `<p className="font-semibold mb-1">` (evita tamaños desproporcionados) |
| `a` | `underline` + `target="_blank" rel="noopener noreferrer"` |

---

## Extensión futura

Si se añaden nuevos builders al Worker que generen mensajes con datos clave (ej: precio, fecha de entrega estimada), aplicar el criterio D5:
1. Añadir `**...**` alrededor del dato clave
2. Si hay dirección → usar `📍 **${addr}**`
3. Separar secciones con `\n\n`
4. No modificar `MarkdownMessage` — el componente ya maneja todos los casos

---

**Referencias**:
- Change completo: `openspec/changes/chat-markdown-rendering/` (archivado)
- `apps/worker/src/services/address.service.ts`
- `apps/worker/src/processors/conversation.processor.ts`
- `apps/web-admin/src/components/chat/markdown-message.tsx`
- `apps/web-admin/src/components/chat/chat-bubble.tsx`
