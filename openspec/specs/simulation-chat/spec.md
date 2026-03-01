# Spec: Simulation Chat — Dashboard Admin

> **Origen**: [`cu03-a6-simulation-chat`](../../changes/archive/2026-03-01-cu03-a6-simulation-chat/)  
> **Última actualización**: 2026-03-01

---

### Requirement: Carga inicial del historial de conversación

Al montar `SimulationChat` con un `conversationId` válido, el componente SHALL cargar el historial de mensajes desde `GET /api/mock/conversations/:id/history` y mostrarlos en la zona de mensajes. Los mensajes con `role: 'system'` SHALL ser filtrados y no mostrados al usuario.

#### Scenario: Historial cargado con mensajes del agente

- **WHEN** `getConversationHistory(conversationId)` retorna mensajes que incluyen al menos uno con `role: 'assistant'`
- **THEN** `SimulationChat` SHALL renderizar esos mensajes usando el componente `ChatBubble` existente
- **AND** el indicador de escritura SHALL estar oculto (el agente ya respondió)

#### Scenario: Historial cargado sin mensajes del agente

- **WHEN** `getConversationHistory(conversationId)` retorna únicamente mensajes con `role: 'user'` o `role: 'system'`
- **THEN** `SimulationChat` SHALL mostrar el indicador `TypingIndicator` (el agente aún no ha respondido)

#### Scenario: Mensajes de sistema filtrados

- **WHEN** el historial contiene mensajes con `role: 'system'`
- **THEN** esos mensajes NO deben renderizarse en la zona de mensajes

---

### Requirement: Suscripción SSE para mensajes en tiempo real

`SimulationChat` SHALL abrir un `EventSource` en `GET /api/mock/conversations/:id/events` antes de cargar el historial, para no perder mensajes publicados durante el tiempo de la petición REST inicial.

#### Scenario: Mensaje del agente recibido vía SSE

- **WHEN** el Worker publica `{ role: 'assistant', content: '...', timestamp: '...' }` en Redis
- **THEN** el `EventSource` recibe el evento
- **AND** `SimulationChat` SHALL añadir el mensaje al estado local como `ConversationMessage` con `role: 'assistant'`
- **AND** el indicador `TypingIndicator` SHALL desaparecer

#### Scenario: Evento de fin de conversación recibido vía SSE

- **WHEN** el `EventSource` recibe `{ event: 'conversation:complete', status: 'COMPLETED' | 'ESCALATED' | 'TIMEOUT' }`
- **THEN** `SimulationChat` SHALL establecer `finalStatus` con el valor del campo `status`
- **AND** el `EventSource` SHALL cerrarse
- **AND** el área de input SHALL reemplazarse por el mensaje de estado final correspondiente

#### Scenario: Error en el EventSource

- **WHEN** el `EventSource` recibe un evento de error (`onerror`)
- **THEN** el `EventSource` SHALL cerrarse sin lanzar excepción no controlada

#### Scenario: Desmontaje del componente limpia el EventSource

- **WHEN** `SimulationChat` se desmonta (conversación cambiada o página cerrada)
- **THEN** el `EventSource` SHALL cerrarse mediante el cleanup del `useEffect`

---

### Requirement: Indicador de escritura animado

`SimulationChat` SHALL mostrar el componente `TypingIndicator` en el lado izquierdo del chat (lado del agente) mientras `isTyping` sea `true`. El indicador SHALL desaparecer en cuanto llegue un mensaje del agente vía SSE.

#### Scenario: Indicador visible mientras el agente procesa

- **WHEN** el usuario envía una respuesta con éxito
- **THEN** `TypingIndicator` SHALL ser visible en la zona de mensajes

#### Scenario: Indicador desaparece al recibir respuesta

- **WHEN** llega un mensaje con `role: 'assistant'` vía SSE
- **THEN** `TypingIndicator` SHALL dejar de renderizarse

---

### Requirement: Envío de respuesta del usuario simulado

El usuario puede escribir un mensaje en el textarea y enviarlo via `POST /api/mock/conversations/:id/reply`. El mensaje SHALL añadirse localmente al estado antes de que el servidor confirme, y el input SHALL deshabilitarse hasta recibir la respuesta del agente.

#### Scenario: Envío con botón

- **WHEN** el textarea tiene texto y el usuario hace clic en "Enviar"
- **THEN** el mensaje SHALL añadirse al estado local con `role: 'user'`
- **AND** `sendReply(conversationId, message)` SHALL llamarse con el texto del textarea
- **AND** el textarea y el botón SHALL deshabilitarse (`isSending: true`)
- **AND** `TypingIndicator` SHALL mostrarse

#### Scenario: Envío con Enter

- **WHEN** el usuario pulsa `Enter` (sin `Shift`) mientras el textarea tiene foco y texto
- **THEN** el envío SHALL comportarse igual que al hacer clic en "Enviar"

#### Scenario: Shift+Enter inserta salto de línea

- **WHEN** el usuario pulsa `Shift+Enter`
- **THEN** el mensaje NO se envía y se inserta un salto de línea en el textarea

#### Scenario: Botón deshabilitado con textarea vacío

- **WHEN** el textarea está vacío o contiene solo espacios
- **THEN** el botón "Enviar" SHALL estar deshabilitado

#### Scenario: Input recuperado tras error de red en sendReply

- **WHEN** `sendReply` lanza un error de red
- **THEN** `isSending` SHALL resetearse a `false` (via `finally`)
- **AND** el input SHALL volver a ser interactuable

---

### Requirement: Scroll automático al último mensaje

Cada vez que el estado de mensajes o `isTyping` cambia, la zona de mensajes SHALL hacer scroll automático al último elemento visible.

#### Scenario: Scroll al llegar mensaje nuevo

- **WHEN** un nuevo mensaje se añade al estado (vía SSE o localmente)
- **THEN** la zona de mensajes SHALL hacer `scrollIntoView({ behavior: 'smooth' })` al elemento `bottomRef`

#### Scenario: Scroll al aparecer indicador de escritura

- **WHEN** `isTyping` cambia a `true`
- **THEN** la zona de mensajes SHALL hacer scroll para mostrar el `TypingIndicator`

---

### Requirement: Estado final de conversación

Cuando `finalStatus` es distinto de `null`, el área de input SHALL reemplazarse por un mensaje descriptivo y el usuario no podrá enviar más mensajes.

#### Scenario: Conversación completada

- **WHEN** `finalStatus` es `'COMPLETED'`
- **THEN** SHALL mostrarse el texto "Conversación completada ✓"
- **AND** el textarea y el botón SHALL estar ausentes

#### Scenario: Conversación escalada

- **WHEN** `finalStatus` es `'ESCALATED'`
- **THEN** SHALL mostrarse el texto "Conversación escalada a soporte"

#### Scenario: Conversación por timeout

- **WHEN** `finalStatus` es `'TIMEOUT'`
- **THEN** SHALL mostrarse el texto "Conversación terminada por tiempo de espera"
