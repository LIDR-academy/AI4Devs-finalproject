## Context

La infraestructura SSE de CU03-A2 expone tres endpoints operativos en el backend:
- `GET /api/mock/conversations/:id/history` → retorna `DynamoMessage[]` (array directo desde DynamoDB)
- `POST /api/mock/conversations/:id/reply` → guarda el mensaje del usuario y encola el job Worker
- `GET /api/mock/conversations/:id/events` → stream SSE (Redis Pub/Sub → NestJS `@Sse`)

El frontend (`apps/web-admin`) tiene el componente `ChatBubble` ya implementado y tipado con `ConversationMessage`. La página `/simulate` tiene placeholder vacíos para las Zonas B y C. Esta tarea conecta la capa de presentación con la infraestructura ya existente.

## Goals / Non-Goals

**Goals:**
- Implementar el chat en tiempo real con historial inicial, stream SSE y envío de respuestas
- Indicador visual de escritura animado mientras el agente procesa
- Gestión del ciclo de vida completo de la conversación (activa → estado final)
- Layout correcto: `SimulationChat` gestiona el scroll interno de Zona B y el input fijo de Zona C

**Non-Goals:**
- Reconexión automática del `EventSource` (fuera de alcance para MVP; el ADR-006 lo identifica como deuda técnica)
- Tests unitarios del componente React (los tests E2E del flujo completo se añadirán en un change futuro)
- Soporte multi-conversación simultánea en la misma página
- Cambios en el backend

## Decisions

### 1. Abrir SSE antes de cargar el historial

**Decisión**: El `useEffect` que abre el `EventSource` se ejecuta antes del `useEffect` que llama a `getConversationHistory`.

**Rationale**: El canal Redis Pub/Sub es fire-and-forget (ADR-006). Si el Worker publica un mensaje de assistant mientras la petición REST al historial está en vuelo (típicamente 50–200ms), ese evento se perdería sin que el cliente SSE esté ya escuchando. Al registrar el listener SSE primero, el frontend captura cualquier evento que llegue durante la carga inicial del historial.

**Alternativa descartada**: Cargar el historial y luego abrir SSE — introduce un race condition inherente sin beneficio.

### 2. SimulationChat gestiona Zonas B y C

**Decisión**: `SimulationChat` renderiza tanto el área de mensajes scrollable (Zona B) como el input fijo (Zona C) en un único fragmento `<>...</>`. `SimulationPage` solo provee un wrapper `flex-1 flex flex-col overflow-hidden`.

**Rationale**: El estado de `isTyping`, `finalStatus` e `inputValue` que controla si el input está habilitado o qué se muestra en Zona C es interno a `SimulationChat`. Separar Zona C en `SimulationPage` requeriría elevar ese estado, añadiendo complejidad de props sin beneficio.

**Alternativa descartada**: Zona C en `SimulationPage` con props pasadas a `SimulationChat` — crea acoplamiento innecesario.

### 3. FinalStatusMessage como subcomponente inline

**Decisión**: `FinalStatusMessage` se define en el mismo archivo que `SimulationChat` (no es un archivo separado).

**Rationale**: Es un componente de presentación puro, usado exclusivamente por `SimulationChat`, con tres variantes fijas. No justifica un archivo propio.

### 4. getConversationHistory retorna ConversationMessage[] directamente

**Decisión**: La función en `api.ts` se tipará como `Promise<ConversationMessage[]>` ya que el endpoint retorna un array JSON directo, no `{ messages: [...] }`.

**Rationale**: Refleja el contrato real del endpoint (verificado en `MockConversationsService.getConversationHistory()` — retorna `DynamoMessage[]`). La estructura de `DynamoMessage` es compatible campo a campo con `ConversationMessage` del frontend.

### 5. EventSource usa URL absoluta vía helper centralizado en api.ts

**Decisión**: El `EventSource` se instancia a través de `createConversationEventSource(conversationId)` en `api.ts`, que construye la URL completa `${API_URL}/api/mock/conversations/${conversationId}/events`.

**Rationale**: Una URL relativa (`/api/mock/...`) se resuelve contra el origen de la página Next.js (puerto 3001), no contra la API NestJS (puerto 3000). El `EventSource` nativo del navegador no pasa por `apiFetch`, por lo que necesita la URL absoluta explícitamente. Centralizarlo en `api.ts` garantiza que hereda `NEXT_PUBLIC_API_URL` automáticamente en todos los entornos (desarrollo, staging, producción).

**Alternativa descartada**: URL relativa directa en el componente — produce 404 en desarrollo porque Next.js no proxea `/api/*` por defecto.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|-----------|
| Race condition residual: entre los dos `useEffect` (SSE y historial), React puede ejecutar el segundo antes que el primero en casos extremos | En la práctica React ejecuta `useEffect` en orden de declaración en el mismo componente; declarar SSE primero es suficiente para MVP |
| Mensajes duplicados: si el historial ya incluye un mensaje y el SSE lo envía de nuevo | El historial carga el estado antes de que el Worker responda al primer mensaje; los mensajes SSE son siempre nuevos (generados después de que el usuario envíe su respuesta). Duplicación no es posible en el flujo normal |
| `EventSource` sin reconexión: si Redis cae, el stream se corta | `es.onerror = () => es.close()` cierra el stream limpiamente. El administrador puede recargar la página. Reconexión automática es deuda técnica (ADR-006) |
| `isSending` no resetea si `sendReply` lanza error | Añadir `try/finally` en `handleSend` para garantizar `setIsSending(false)` incluso en error |
