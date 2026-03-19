# Sesión 2026-03-01: CU03-A6 — Chat de Simulación con SSE en Tiempo Real — Completado

> **Change**: `cu03-a6-simulation-chat`  
> **Estado**: ✅ Completado y verificado (22/22 tareas) — pendiente de `/opsx-archive`

## Resumen

Implementación completa del chat de simulación en la sección `/simulate` del Dashboard Admin. El componente `SimulationChat` conecta la infraestructura SSE ya existente (CU03-A2) con la UI: carga el historial inicial desde DynamoDB, suscribe al stream SSE para mensajes en tiempo real, gestiona el envío de respuestas del usuario simulado, muestra un `TypingIndicator` animado mientras el agente procesa, y presenta el estado final de la conversación (COMPLETED / ESCALATED / TIMEOUT). Se resolvieron además tres bugs emergentes durante las pruebas en runtime.

---

## Completado

### Componentes nuevos — `apps/web-admin/src/components/simulate/`

- **`typing-indicator.tsx`** (nuevo):
  - Icono `Bot` de lucide-react a la izquierda
  - Tres puntos animados con `animate-bounce` y delays 0ms / 150ms / 300ms
  - Estilos coherentes con `ChatBubble` (`rounded-chat`, `border-brand-teal`, `bg-brand-teal`)

- **`simulation-chat.tsx`** (nuevo):
  - Client Component con estado local: `messages`, `isTyping`, `finalStatus`, `inputValue`, `isSending`
  - `useEffect` SSE declarado **primero** para evitar race condition con la carga de historial (ver Decisión de Diseño)
  - `useEffect` historial declarado **segundo**: carga de `GET .../history`, filtra `role: 'system'`, deriva `isTyping`
  - `useEffect` scroll automático: `scrollIntoView({ behavior: 'smooth' })` en cada cambio de `messages` o `isTyping`
  - `handleSend` con `useCallback` y `try/finally` para garantizar reset de `isSending` en caso de error de red
  - `handleKeyDown`: `Enter` envía, `Shift+Enter` inserta salto de línea (comportamiento nativo del textarea)
  - `FinalStatusMessage` como subcomponente inline con `FINAL_STATUS_LABELS` (no archivo separado)
  - Renderiza Zona B (`div[role="log"]` con `aria-live="polite"`) y Zona C (input fijo con botón "Enviar")

### API — `apps/web-admin/src/lib/api.ts`

- **`createConversationEventSource(conversationId)`** (nuevo): crea `EventSource` con URL absoluta `${API_URL}/api/mock/...` para evitar el 404 que se produce con URLs relativas en Next.js (ver Patrón 5 en `real-time-sse-patterns.md`)
- **`getConversationHistory(conversationId)`** (nuevo): `Promise<ConversationMessage[]>` — tipado correcto como array directo, no `{ messages: [...] }`
- **`sendReply(conversationId, message)`** (nuevo): POST con body `{ message }`

### Layout — `apps/web-admin/src/components/simulate/simulation-page.tsx`

- Eliminados los divs placeholder de Zona B y Zona C separados
- Nuevo bloque condicional: `SimulationEmptyState` si no hay conversación, `div.flex-1.flex.flex-col.overflow-hidden > SimulationChat` si la hay
- **`key={activeConversation.conversationId}`** en `SimulationChat` para garantizar desmontaje y reset completo de estado al cambiar de conversación (ver Patrón 6 en `frontend-form-patterns.md`)

### Backend — `apps/api/src/mock/mock-conversations.service.ts`

- Filtro `__state__` añadido en `getConversationHistory`: el item DynamoDB de estado interno del Worker (`messageId: '__state__'`) ya no se devuelve al frontend (causa raíz del bug `Invalid time value` en `ChatBubble`)

### Componente compartido — `apps/web-admin/src/components/chat/chat-bubble.tsx`

- `safeTimeLabel()` añadido: parseo defensivo de timestamp con `isNaN` check antes de llamar a `date-fns format()`. Previene `RangeError: Invalid time value` ante timestamps inválidos o ausentes

---

## Bugs Encontrados y Resueltos

| Bug | Causa | Solución |
|-----|-------|----------|
| `EventSource` devuelve 404 | URL relativa `/api/...` se resuelve contra Next.js (puerto 3001), no la API NestJS (puerto 3000) | `createConversationEventSource()` en `api.ts` con URL absoluta usando `API_URL` |
| Estado persistente entre simulaciones | React reutilizaba el componente al cambiar `conversationId` sin desmontarlo; `finalStatus: 'ESCALATED'` de conversación anterior contaminaba la siguiente | `key={activeConversation.conversationId}` en `SimulationChat` fuerza desmontaje completo |
| `Invalid time value` en ChatBubble | `GET .../history` devolvía el item `__state__` de DynamoDB sin campos `role`, `content` ni `timestamp` | Filtro `__state__` en API (causa raíz) + `safeTimeLabel` defensivo en `ChatBubble` (defensa) |

---

## Decisiones Técnicas Relevantes

| Decisión | Motivo |
|----------|--------|
| **SSE abre antes que el historial** | Redis Pub/Sub es fire-and-forget; si el Worker publica mientras la petición REST está en vuelo, el evento se perdería si el `EventSource` no está abierto aún |
| **`SimulationChat` gestiona Zonas B y C** | El estado `isTyping`, `finalStatus` e `inputValue` es interno; separar Zona C en el padre requeriría elevar estado sin beneficio |
| **`FinalStatusMessage` inline** | Componente de presentación puro, solo usado por `SimulationChat`, con tres variantes fijas — no justifica archivo propio |
| **`getConversationHistory` → `ConversationMessage[]` directo** | El endpoint retorna un array JSON, no `{ messages: [...] }` (verificado en `MockConversationsService`) |
| **`createConversationEventSource` en `api.ts`** | `EventSource` nativo no pasa por `apiFetch`; centralizarlo en `api.ts` hereda `NEXT_PUBLIC_API_URL` en todos los entornos |
| **`key` prop para reset de estado** | Patrón React idiomático para componentes con estado complejo que deben reiniciarse al cambiar de entidad; más limpio que resetear manualmente en `useEffect` |

---

## Patrones Documentados

- `frontend-form-patterns.md` — Patrón 5: `safeTimeLabel` para timestamps defensivos
- `frontend-form-patterns.md` — Patrón 6: `key` prop para reset completo de estado en React
- `real-time-sse-patterns.md` — Patrón 5: `EventSource` con URL absoluta vía helper centralizado

---

## Specs Actualizadas

- `openspec/specs/mock-conversations/spec.md` — Nuevo requirement: filtro `__state__` en endpoint de historial
- `openspec/changes/cu03-a6-simulation-chat/design.md` — Decisión 5: URL absoluta para `EventSource`

---

## Archivos Creados/Modificados

```
apps/web-admin/src/
├── lib/
│   └── api.ts                                    # Modificado — createConversationEventSource, getConversationHistory, sendReply
└── components/
    ├── chat/
    │   └── chat-bubble.tsx                       # Modificado — safeTimeLabel defensivo
    └── simulate/
        ├── typing-indicator.tsx                  # Nuevo — indicador animado de escritura
        ├── simulation-chat.tsx                   # Nuevo — chat completo con SSE, historial, envío
        └── simulation-page.tsx                   # Modificado — layout reestructurado, key prop

apps/api/src/mock/
└── mock-conversations.service.ts                 # Modificado — filtro __state__ en getConversationHistory

memory-bank/
├── README.md                                     # Actualizado
├── patterns/frontend-form-patterns.md            # Patrones 5 y 6 añadidos
├── patterns/real-time-sse-patterns.md            # Patrón 5 añadido
└── sessions/2026-03-01-cu03-a6-simulation-chat.md  # Este archivo

openspec/
├── specs/mock-conversations/spec.md              # Requirement __state__ filter añadido
└── changes/cu03-a6-simulation-chat/design.md     # Decisión 5 añadida
```

---

**Duración estimada**: 1 sesión  
**Conversación de referencia**: [CU03-A6 Simulation Chat](c3d9f2a1-7b4e-4f8c-9d1a-5e6b3c8a2f0d)
