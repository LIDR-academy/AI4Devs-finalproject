# Sesión 2026-03-08 — llm-service-abstraction

> **Estado**: ✅ Completado (15/15 tareas, verificado, listo para archivar)  
> **Change**: `openspec/changes/llm-service-abstraction/`  
> **Duración estimada**: 1 sesión  
> **Tests**: 41 pasando, 0 fallos

---

## Contexto

El Worker (`apps/worker/`) usaba el SDK de OpenAI directamente en dos sitios distintos — `address.service.ts` (extracción de direcciones e interpretación de intención) y `conversation.processor.ts` (generación de mensajes conversacionales). Esto impedía testear sin `OPENAI_API_KEY` y hacía que los mocks en los specs fueran frágiles (parcheaban funciones internas de `address.service`).

El change `cu03-b4-worker-address-book` quedó con una nota de deuda técnica en ADR-004: "ILLMService abstraction — pendiente". Esta sesión resuelve esa deuda.

---

## Qué se implementó

### Nuevos archivos

| Archivo | Rol |
|---------|-----|
| `apps/worker/src/llm/llm.interface.ts` | Interfaz `ILLMService` con 3 métodos |
| `apps/worker/src/llm/openai-llm.service.ts` | Implementación real con `gpt-4o-mini` |
| `apps/worker/src/llm/mock-llm.service.ts` | Implementación mock sin red (consolida mocks previos) |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `apps/worker/src/services/address.service.ts` | Eliminadas `extractAddressFromConversation`, `interpretUserIntent`, `getOpenAIClient`, constantes de prompt LLM, `mockExtractAddress`, `mockInterpretIntent` |
| `apps/worker/src/processors/conversation.processor.ts` | Eliminado `import OpenAI`, `generateWithOpenAI`; añadido `_llmService: ILLMService` + `setLLMService()` |
| `apps/worker/src/main.ts` | Inyecta `OpenAILLMService` o `MockLLMService` según `OPENAI_API_KEY` |
| `apps/worker/src/processors/conversation.processor.spec.ts` | Usa `jest.Mocked<ILLMService>` + `setLLMService()` en lugar del mock parcial de `address.service` |

### ILLMService — contrato

```typescript
export interface ILLMService {
  generateMessage(params: { systemPrompt: string; userPrompt: string }): Promise<string>;
  extractAddress(messages: ConversationMessage[], language: string): Promise<ExtractedAddress>;
  interpretIntent(phase: ConversationPhase, userMessage: string, language: string): Promise<UserIntent>;
}
```

La interfaz tiene 3 métodos deliberadamente distintos (no un `call()` genérico) porque cada operación LLM tiene parámetros, temperatura y formato de respuesta diferentes:
- `generateMessage`: temperatura 0.7, texto libre
- `extractAddress`: temperatura 0, `response_format: json_object`
- `interpretIntent`: temperatura 0, `response_format: json_object`

### Inyección de dependencia en el Worker (sin NestJS)

El Worker es Node.js puro, sin framework de DI. El patrón adoptado:

```typescript
// conversation.processor.ts
let _llmService: ILLMService = new MockLLMService();
export function setLLMService(svc: ILLMService): void { _llmService = svc; }

// main.ts — en bootstrap
const apiKey = process.env.OPENAI_API_KEY;
setLLMService(apiKey ? new OpenAILLMService(apiKey) : new MockLLMService());

// specs — en beforeAll
beforeAll(async () => {
  const { setLLMService } = await import('./conversation.processor');
  setLLMService(mockLLMService);
});
```

---

## Decisiones clave

### Por qué 3 métodos y no `call(prompt)`

Cada operación LLM del Worker tiene comportamiento técnico diferente (temperatura, JSON mode). Una interfaz genérica `call(prompt)` habría requerido pasar opciones como objeto de configuración en cada llamada, acoplando al llamador a los detalles del proveedor. Con 3 métodos semánticos, el caller describe *qué quiere* (extraer dirección, interpretar intención, generar mensaje) sin saber *cómo* se hace.

### Por qué `setLLMService()` y no constructor injection

El Worker no usa NestJS. Los procesadores BullMQ son funciones, no clases. Pasar el servicio LLM por parámetro a cada función habría requerido modificar la firma de todos los handlers de estado (9 fases). El módulo-level setter es el patrón más limpio para este contexto: una llamada en `main.ts` configura todo.

### Por qué `MockLLMService` como valor por defecto

`let _llmService = new MockLLMService()` garantiza que el módulo puede cargarse sin `OPENAI_API_KEY`. Los tests no necesitan hacer nada especial para evitar llamadas reales — basta con inyectar el mock antes de ejecutar.

---

## Aprendizajes

1. **`jest.clearAllMocks()` limpia registros pero no implementaciones**: No elimina `mockImplementation()`. Sin embargo, es buena práctica restaurar las implementaciones en `beforeEach` para garantizar el estado inicial en cada test, especialmente cuando algunos tests usan `mockResolvedValueOnce`.

2. **El patrón `jest.mock + jest.requireActual` con override parcial es frágil**: Depende de la estructura interna del módulo que se mockea. Al mover la lógica a una interfaz explícita, los tests son más estables porque mockean el contrato, no la implementación.

3. **Verificar con `openspec verify` antes de archivar**: El comando confirmó 3/3 dimensiones correctas (completeness, correctness, coherence) y no encontró issues críticos.

---

## Estado del proyecto post-sesión

- Worker completamente desacoplado de OpenAI en el código de negocio
- `address.service.ts` contiene exclusivamente lógica de utilidad y Google Maps
- `conversation.processor.ts` contiene exclusivamente la máquina de estados
- Todo el código LLM centralizado en `apps/worker/src/llm/`

### Pendiente (post-MVP o próxima sesión)

- Mejorar el "Journey INFORMATION" con mensajes generados dinámicamente por OpenAI (actualmente texto estático)
- Instrucción de cambio de idioma ya incluida en el system prompt (`buildGetAddressSystemPrompt`) — pendiente de extender al resto de journeys
- Archivar el change `llm-service-abstraction`
