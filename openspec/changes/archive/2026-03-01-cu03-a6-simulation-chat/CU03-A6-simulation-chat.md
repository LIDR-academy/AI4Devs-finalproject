# CU03-A6 — Chat de simulación con SSE en tiempo real

**App**: `apps/web-admin` (Next.js 16 — componentes cliente)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
**Revisado**: 2026-03-01 (enriquecimiento técnico — correcciones de bugs, tipos, layout, race condition)  
**Prerrequisitos**: CU03-A2 completado (SSE endpoint disponible), CU03-A5 completado (`SimulationPage` ya recibe `conversationId`)

---

## Historia de Usuario

**Como** administrador del Dashboard Admin usando la sección `/simulate`,  
**quiero** ver en tiempo real los mensajes que el agente Adresles envía y poder responder como si fuera el usuario,  
**para** simular una conversación completa de obtención de dirección de entrega sin intervención manual en el backend.

---

## Descripción funcional

### Chat activo

La zona B (scrollable) y la zona C (input fijo) de la página `/simulate` se activan en cuanto hay una conversación iniciada. El chat:

- Muestra las burbujas de mensajes en tiempo real, reutilizando `ChatBubble` existente
- El mensaje del agente Adresles aparece en el lado izquierdo (rol `assistant`)
- Los mensajes del "usuario simulado" aparecen en el lado derecho (rol `user`)
- Los mensajes de sistema (`role: 'system'`) se omiten en el chat visible (no son relevantes para la simulación)
- Scroll automático hacia el último mensaje cada vez que llega uno nuevo
- Indicador "Adresles está escribiendo..." visible mientras se espera la respuesta del agente

### Indicador de escritura

Se muestra en el lado izquierdo (como si fuera un mensaje del agente) mientras el estado es "esperando respuesta del agente". Desaparece en cuanto llega el siguiente mensaje SSE.

```
┌──────────────────────────────────────┐
│  [🤖]  ···  (tres puntos animados)   │
└──────────────────────────────────────┘
```

### Input de respuesta

Fijo en el pie de la página. Deshabilitado mientras:
- El agente está procesando (estado `typing`)
- La conversación ha finalizado (evento SSE `conversation:complete`)

Cuando la conversación finaliza, el input se reemplaza por un mensaje de estado:
- `COMPLETED`: "Conversación completada ✓"
- `ESCALATED`: "Conversación escalada a soporte"
- `TIMEOUT`: "Conversación terminada por tiempo de espera"

### Carga inicial del historial

Al abrir el chat (conversationId disponible), se sigue esta secuencia **en orden estricto** para evitar race conditions:

1. **Primero** se abre el `EventSource` (SSE). Esto garantiza que si el Worker publica un mensaje durante el tiempo que tarda la petición HTTP al historial, no se pierde (el evento ya está escuchado).
2. **Luego** se hace una petición `GET /api/mock/conversations/:id/history` para cargar los mensajes previos.
3. Los mensajes del historial se colocan en el estado local. Los nuevos mensajes SSE que lleguen a partir de ese momento se añaden al estado de forma incremental.

> **Nota de respuesta del endpoint**: `GET /api/mock/conversations/:id/history` retorna un **array directo** `DynamoMessage[]`, **no** un objeto `{ messages: [...] }`. La función `getConversationHistory` en `api.ts` debe tiparlo correctamente como `Promise<ConversationMessage[]>` y usarse directamente sin acceso a `.messages`.

---

## Arquitectura de la solución

### `apps/web-admin/src/components/simulate/typing-indicator.tsx` (nuevo)

```typescript
export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal/10">
        <Bot className="h-4 w-4 text-brand-teal" aria-hidden="true" />
      </div>
      <div className="rounded-chat rounded-tl-sm border-l-2 border-brand-teal bg-gray-100 px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
```

### `apps/web-admin/src/components/simulate/simulation-chat.tsx` (nuevo)

Client Component que gestiona el historial de mensajes, la suscripción SSE y el envío de respuestas.

> **Correcciones respecto al borrador inicial**:
> - `setIsSending(true)` (no `false`) al enviar un mensaje.
> - El SSE se abre **antes** de cargar el historial para evitar race condition.
> - `getConversationHistory` retorna `ConversationMessage[]` directamente (array, no `{ messages }`).
> - `Button` importado desde `@/components/ui/button`.
> - `FinalStatusMessage` definido como subcomponente inline.
> - `orderId` eliminado de `SimulationChatProps` (no se usa en este componente).

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChatBubble } from '@/components/chat/chat-bubble';
import { TypingIndicator } from './typing-indicator';
import type { ConversationMessage } from '@/types/api';
import { sendReply, getConversationHistory } from '@/lib/api';

type ConversationFinalStatus = 'COMPLETED' | 'ESCALATED' | 'TIMEOUT' | null;

const FINAL_STATUS_LABELS: Record<NonNullable<ConversationFinalStatus>, string> = {
  COMPLETED: 'Conversación completada ✓',
  ESCALATED: 'Conversación escalada a soporte',
  TIMEOUT: 'Conversación terminada por tiempo de espera',
};

function FinalStatusMessage({ status }: { status: NonNullable<ConversationFinalStatus> }) {
  return (
    <p className="text-center text-sm text-muted-foreground py-2">
      {FINAL_STATUS_LABELS[status]}
    </p>
  );
}

interface SimulationChatProps {
  conversationId: string;
}

export function SimulationChat({ conversationId }: SimulationChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [finalStatus, setFinalStatus] = useState<ConversationFinalStatus>(null);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Suscribir a SSE PRIMERO para no perder eventos publicados durante la carga del historial
  useEffect(() => {
    const es = new EventSource(`/api/mock/conversations/${conversationId}/events`);

    es.onmessage = (event) => {
      const payload = JSON.parse(event.data) as {
        event?: string;
        status?: string;
        role?: string;
        content?: string;
        timestamp?: string;
      };

      if (payload.event === 'conversation:complete') {
        setFinalStatus(payload.status as ConversationFinalStatus);
        setIsTyping(false);
        es.close();
        return;
      }

      if (payload.role === 'assistant') {
        const newMsg: ConversationMessage = {
          messageId: crypto.randomUUID(),
          role: 'assistant',
          content: payload.content ?? '',
          timestamp: payload.timestamp ?? new Date().toISOString(),
          expiresAt: 0,
        };
        setMessages((prev) => [...prev, newMsg]);
        setIsTyping(false);
      }
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, [conversationId]);

  // Cargar historial inicial DESPUÉS de abrir el SSE
  useEffect(() => {
    getConversationHistory(conversationId).then((history) => {
      const visible = history.filter((m) => m.role !== 'system');
      setMessages(visible);
      // Mostrar typing solo si el agente aún no ha respondido
      setIsTyping(!visible.some((m) => m.role === 'assistant'));
    });
  }, [conversationId]);

  // Scroll automático al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isSending || finalStatus) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsSending(true);  // ← era false (bug corregido)
    setIsTyping(true);

    setMessages((prev) => [
      ...prev,
      {
        messageId: crypto.randomUUID(),
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
        expiresAt: 0,
      },
    ]);

    await sendReply(conversationId, userMessage);
    setIsSending(false);
  }, [inputValue, isSending, finalStatus, conversationId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Zona B: mensajes scrollables */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Conversación simulada"
        className="flex-1 overflow-y-auto bg-white px-6 py-4 space-y-4"
      >
        {messages.map((msg) => (
          <ChatBubble key={msg.messageId} message={msg} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Zona C: input fijo */}
      <div className="shrink-0 border-t bg-background px-4 py-3">
        {finalStatus ? (
          <FinalStatusMessage status={finalStatus} />
        ) : (
          <div className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping || isSending}
              placeholder="Escribe tu respuesta..."
              rows={1}
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal disabled:opacity-50"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping || isSending}
              size="sm"
            >
              Enviar
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
```

### `apps/web-admin/src/lib/api.ts` — nuevas funciones

> **Importante**: `GET /api/mock/conversations/:id/history` retorna `DynamoMessage[]` — un **array directo**, no `{ messages: [...] }`. El tipo de respuesta en el frontend debe ser `ConversationMessage[]`.

```typescript
export async function getConversationHistory(
  conversationId: string,
): Promise<ConversationMessage[]> {
  return apiFetch<ConversationMessage[]>(
    `/api/mock/conversations/${conversationId}/history`,
  );
}

export async function sendReply(conversationId: string, message: string): Promise<void> {
  await apiFetch(`/api/mock/conversations/${conversationId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
}
```

Añadir también el import de `ConversationMessage` al inicio del archivo `api.ts`:

```typescript
import type { ..., ConversationMessage } from '@/types/api';
```

### Integración en `simulation-page.tsx`

El layout actual tiene la Zona B y la Zona C como divs separados en `simulation-page.tsx`. `SimulationChat` gestiona **ambas zonas internamente**, por lo que hay que reestructurar el layout. La zona `flex-1 overflow-y-auto` que hoy envuelve el contenido condicional pasa a ser `flex-1 flex flex-col overflow-hidden` para que `SimulationChat` pueda gestionar su propio scroll interno.

**Estructura actual** (en `simulation-page.tsx`):

```tsx
{/* Zona B: área de chat scrollable */}
<div className="flex-1 overflow-y-auto">
  {!activeConversation ? (
    <SimulationEmptyState onNewSimulation={() => setModalOpen(true)} />
  ) : (
    <div>{/* SimulationChat — CU03-A6 */}</div>
  )}
</div>

{/* Zona C: input fijo — CU03-A6 */}
{activeConversation && (
  <div className="border-t p-4">
    {/* ChatInput — CU03-A6 */}
  </div>
)}
```

**Estructura final** (reemplazar ambos bloques):

```tsx
{/* Zona B+C: chat scrollable + input — gestionados por SimulationChat */}
{!activeConversation ? (
  <SimulationEmptyState onNewSimulation={() => setModalOpen(true)} />
) : (
  <div className="flex-1 flex flex-col overflow-hidden">
    <SimulationChat conversationId={activeConversation.conversationId} />
  </div>
)}
```

Cuando `!activeConversation`, `SimulationEmptyState` ocupa el espacio completo (`flex-1 overflow-y-auto` ya está en el padre). Cuando hay conversación, el wrapper `flex-1 flex flex-col overflow-hidden` permite que `SimulationChat` gestione su scroll interno.

---

## Lista de tareas

### Nuevos archivos

- [ ] Crear `apps/web-admin/src/components/simulate/typing-indicator.tsx` con animación de tres puntos `animate-bounce` con delays 0ms / 150ms / 300ms
- [ ] Crear `apps/web-admin/src/components/simulate/simulation-chat.tsx`:
  - Abrir `EventSource` ANTES de cargar el historial (evitar race condition)
  - `FinalStatusMessage` como subcomponente inline con `FINAL_STATUS_LABELS`
  - `SimulationChatProps` solo con `conversationId` (sin `orderId`)
  - `setIsSending(true)` al enviar (no `false`)
  - Import de `Button` desde `@/components/ui/button`

### Modificaciones en archivos existentes

- [ ] Añadir `getConversationHistory()` en `apps/web-admin/src/lib/api.ts`:
  - Tipo de retorno: `Promise<ConversationMessage[]>` (array directo, no `{ messages }`)
  - Añadir import de `ConversationMessage` al inicio del archivo
- [ ] Añadir `sendReply()` en `apps/web-admin/src/lib/api.ts` (POST con `{ message }`)
- [ ] Reestructurar layout de `apps/web-admin/src/components/simulate/simulation-page.tsx`:
  - Eliminar la Zona B (`div.flex-1.overflow-y-auto` con el placeholder) y la Zona C separada
  - Reemplazar por bloque condicional: `SimulationEmptyState` si no hay conversación, `div.flex-1.flex.flex-col.overflow-hidden > SimulationChat` si la hay
  - Pasar solo `conversationId` a `SimulationChat` (sin `orderId`)

### Verificación funcional

- [ ] Verificar que los mensajes del agente aparecen en tiempo real sin recargar la página
- [ ] Verificar que el indicador de escritura aparece tras enviar una respuesta y desaparece al recibir la del agente
- [ ] Verificar que el scroll automático lleva al último mensaje en cada actualización
- [ ] Verificar que el input se deshabilita mientras `isTyping` o `isSending`
- [ ] Verificar que al completarse la conversación (`conversation:complete`) se muestra el mensaje de estado final y el input desaparece
- [ ] Ejecutar `tsc --noEmit` en `apps/web-admin` sin errores de compilación
