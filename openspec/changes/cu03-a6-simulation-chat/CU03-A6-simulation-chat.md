# CU03-A6 — Chat de simulación con SSE en tiempo real

**App**: `apps/web-admin` (Next.js 16 — componentes cliente)  
**Estado**: Pendiente de implementación  
**Fecha**: 2026-02-27  
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

Al abrir el chat (conversationId disponible), se hace una petición `GET /api/mock/conversations/:id/history` para cargar los mensajes existentes antes de abrir el SSE. Luego se abre el EventSource y los nuevos mensajes se añaden al estado local.

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

Client Component que gestiona el historial de mensajes, la suscripción SSE y el envío de respuestas:

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatBubble } from '@/components/chat/chat-bubble';
import { TypingIndicator } from './typing-indicator';
import { ConversationMessage } from '@/types/api';
import { sendReply, getConversationHistory } from '@/lib/api';

type ConversationFinalStatus = 'COMPLETED' | 'ESCALATED' | 'TIMEOUT' | null;

interface SimulationChatProps {
  conversationId: string;
  orderId: string;
}

export function SimulationChat({ conversationId, orderId }: SimulationChatProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [finalStatus, setFinalStatus] = useState<ConversationFinalStatus>(null);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Cargar historial inicial
  useEffect(() => {
    getConversationHistory(conversationId).then((data) => {
      const visible = data.messages.filter((m) => m.role !== 'system');
      setMessages(visible);
      // Si hay mensajes del agente, no mostrar typing
      if (visible.some((m) => m.role === 'assistant')) {
        setIsTyping(false);
      } else {
        setIsTyping(true); // Agente aún no ha respondido
      }
    });
  }, [conversationId]);

  // Suscribir a SSE
  useEffect(() => {
    const es = new EventSource(`/api/mock/conversations/${conversationId}/events`);

    es.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.event === 'conversation:complete') {
        setFinalStatus(payload.status);
        setIsTyping(false);
        es.close();
        return;
      }

      if (payload.role === 'assistant') {
        const newMsg: ConversationMessage = {
          messageId: crypto.randomUUID(),
          role: 'assistant',
          content: payload.content,
          timestamp: payload.timestamp,
          expiresAt: 0,
        };
        setMessages((prev) => [...prev, newMsg]);
        setIsTyping(false);
      }
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, [conversationId]);

  // Scroll automático al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isSending || finalStatus) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsSending(false);
    setIsTyping(true);

    // Añadir mensaje del usuario localmente
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
              disabled={isTyping || !!finalStatus}
              placeholder="Escribe tu respuesta..."
              rows={1}
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal disabled:opacity-50"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping || !!finalStatus || isSending}
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

```typescript
export async function getConversationHistory(conversationId: string) {
  return apiFetch<{ messages: ConversationMessage[] }>(
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

### Integración en `simulation-page.tsx`

Reemplazar el `<div>{/* placeholder para CU03-A6 */}</div>` con:

```typescript
{activeConversation && (
  <SimulationChat
    conversationId={activeConversation.conversationId}
    orderId={activeConversation.orderId}
  />
)}
```

La Zona C (input) está dentro de `SimulationChat` para que gestione su propio estado. La estructura del layout debe ajustarse: `simulation-page.tsx` envuelve la Zona B+C con `flex-1 flex flex-col overflow-hidden`, y `SimulationChat` gestiona internamente el `flex-1 overflow-y-auto` de la zona de mensajes más el input fijo.

---

## Lista de tareas

- [ ] Crear `apps/web-admin/src/components/simulate/typing-indicator.tsx` con animación de tres puntos
- [ ] Crear `apps/web-admin/src/components/simulate/simulation-chat.tsx` con gestión de historial, SSE y envío
- [ ] Implementar carga inicial del historial via `GET /api/mock/conversations/:id/history`
- [ ] Implementar suscripción SSE via `EventSource` con manejo de evento `conversation:complete`
- [ ] Implementar scroll automático al último mensaje en cada actualización
- [ ] Implementar envío de mensaje via `POST /api/mock/conversations/:id/reply` + añadir mensaje de usuario localmente
- [ ] Implementar estado de input deshabilitado mientras `isTyping` o `finalStatus !== null`
- [ ] Mostrar mensaje de estado final cuando la conversación termina (COMPLETED / ESCALATED / TIMEOUT)
- [ ] Añadir funciones `getConversationHistory()` y `sendReply()` en `apps/web-admin/src/lib/api.ts`
- [ ] Integrar `SimulationChat` en `simulation-page.tsx` (reemplazando el placeholder de CU03-A4)
- [ ] Ajustar el layout de `simulation-page.tsx` para que Zona B+C sean `flex-1 flex flex-col overflow-hidden`
- [ ] Verificar que los mensajes del agente aparecen en tiempo real sin recargar la página
- [ ] Verificar que el indicador de escritura aparece tras enviar una respuesta y desaparece al recibir la del agente
