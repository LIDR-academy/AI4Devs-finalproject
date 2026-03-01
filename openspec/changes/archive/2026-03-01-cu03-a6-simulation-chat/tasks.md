## 1. Funciones API en api.ts

- [x] 1.1 Añadir import de `ConversationMessage` al inicio de `apps/web-admin/src/lib/api.ts`
- [x] 1.2 Añadir función `getConversationHistory(conversationId: string): Promise<ConversationMessage[]>` que llame a `GET /api/mock/conversations/:id/history` (retorna array directo, no objeto wrapeado)
- [x] 1.3 Añadir función `sendReply(conversationId: string, message: string): Promise<void>` que llame a `POST /api/mock/conversations/:id/reply` con body `{ message }`

## 2. Componente TypingIndicator

- [x] 2.1 Crear `apps/web-admin/src/components/simulate/typing-indicator.tsx` con el icono `Bot` de lucide-react a la izquierda y tres puntos `animate-bounce` con `animation-delay` de 0ms, 150ms y 300ms respectivamente
- [x] 2.2 Verificar que las clases Tailwind `rounded-chat` y `brand-teal` existen y funcionan visualmente (ya usadas en `ChatBubble`)

## 3. Componente SimulationChat

- [x] 3.1 Crear `apps/web-admin/src/components/simulate/simulation-chat.tsx` con `'use client'` y estado local: `messages`, `isTyping`, `finalStatus`, `inputValue`, `isSending`
- [x] 3.2 Definir `FINAL_STATUS_LABELS` y el subcomponente inline `FinalStatusMessage`
- [x] 3.3 Implementar `useEffect` de suscripción SSE (declarado PRIMERO): abrir `EventSource`, manejar `onmessage` para mensajes `assistant` y evento `conversation:complete`, cerrar en `onerror` y en cleanup del effect
- [x] 3.4 Implementar `useEffect` de carga del historial (declarado SEGUNDO): llamar a `getConversationHistory`, filtrar mensajes `system`, actualizar `messages` e `isTyping`
- [x] 3.5 Implementar `useEffect` de scroll automático: `bottomRef.current?.scrollIntoView({ behavior: 'smooth' })` cuando cambian `messages` o `isTyping`
- [x] 3.6 Implementar `handleSend` con `useCallback`: guard de `inputValue.trim()`, `isSending` y `finalStatus`; `setIsSending(true)` antes del await; `setIsSending(false)` en bloque `finally`; añadir mensaje de usuario al estado local antes de llamar a `sendReply`
- [x] 3.7 Implementar `handleKeyDown`: `Enter` sin `Shift` llama `handleSend`; `Shift+Enter` inserta salto de línea (comportamiento nativo del textarea)
- [x] 3.8 Renderizar Zona B (`div[role="log"]` con `aria-live="polite"` y `aria-label`): iterar `messages` con `ChatBubble`, mostrar `TypingIndicator` si `isTyping`, añadir `<div ref={bottomRef} />`
- [x] 3.9 Renderizar Zona C: si `finalStatus` mostrar `FinalStatusMessage`; si no, mostrar textarea + botón "Enviar" deshabilitados cuando `isTyping || isSending`

## 4. Integración en SimulationPage

- [x] 4.1 En `apps/web-admin/src/components/simulate/simulation-page.tsx`, eliminar el bloque `div.flex-1.overflow-y-auto` que envuelve el contenido condicional de Zona B y el bloque separado de Zona C (`div.border-t.p-4` con placeholder)
- [x] 4.2 Reemplazar ambos bloques por: cuando `!activeConversation` renderizar `SimulationEmptyState` directamente; cuando hay conversación renderizar `<div className="flex-1 flex flex-col overflow-hidden"><SimulationChat conversationId={activeConversation.conversationId} /></div>`
- [x] 4.3 Añadir import de `SimulationChat` en `simulation-page.tsx`

## 5. Verificación

- [x] 5.1 Ejecutar `tsc --noEmit` en `apps/web-admin` y confirmar cero errores de compilación
- [x] 5.2 Verificar manualmente que al iniciar una simulación los mensajes del agente aparecen en tiempo real (con la aplicación en ejecución)
- [x] 5.3 Verificar que el `TypingIndicator` aparece al enviar y desaparece al recibir respuesta del agente
- [x] 5.4 Verificar que el scroll automático funciona al llegar mensajes nuevos
- [x] 5.5 Verificar que cuando la conversación termina (`COMPLETED`) el input se reemplaza por el mensaje de estado final
