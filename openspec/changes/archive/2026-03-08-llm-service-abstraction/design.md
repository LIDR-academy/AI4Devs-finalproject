## Context

El Worker (`apps/worker/`) es un proceso Node.js puro (sin NestJS) que procesa conversaciones con el Agente Adresles. Actualmente usa OpenAI `gpt-4o-mini` de forma directa en tres puntos:

1. `generateWithOpenAI()` en `conversation.processor.ts` — genera el mensaje inicial de bienvenida
2. `extractAddressFromConversation()` en `address.service.ts` — extrae dirección del historial (JSON mode)
3. `interpretUserIntent()` en `address.service.ts` — clasifica intención del usuario (JSON mode)

Cada uno instancia `new OpenAI({ apiKey })` de forma independiente. Las funciones mock (`mockExtractAddress`, `mockInterpretIntent`) están dentro de `address.service.ts` entremezcladas con la lógica de negocio. El ADR-004 documentó esta arquitectura como deuda técnica.

## Goals / Non-Goals

**Goals:**
- Definir `ILLMService` como contrato único para acceso al modelo de lenguaje
- Crear `OpenAILLMService` que encapsule todas las llamadas a `gpt-4o-mini`
- Crear `MockLLMService` que consolide los mocks existentes sin lógica de negocio
- Eliminar todo el código OpenAI disperso de `address.service.ts` y `conversation.processor.ts`
- Mantener los tests existentes pasando con cobertura ≥ 90%

**Non-Goals:**
- No añadir ninguna funcionalidad nueva al agente conversacional
- No cambiar la lógica de la máquina de estados ni los message builders
- No migrar el Worker a NestJS ni añadir inyección de dependencias de framework
- No implementar streaming ni caching de respuestas LLM

## Decisions

### D1 — Ubicación: `apps/worker/src/llm/`

Se crea una carpeta `llm/` dentro de `apps/worker/src/` con tres archivos:

```
apps/worker/src/llm/
├── llm.interface.ts        # ILLMService + tipos de parámetros
├── openai-llm.service.ts   # OpenAILLMService implements ILLMService
└── mock-llm.service.ts     # MockLLMService implements ILLMService
```

**Por qué aquí y no en `services/`**: `services/` ya contiene `address.service.ts` que mezcla lógica de negocio con acceso a datos. La capa LLM es una preocupación de infraestructura (acceso a API externa), por lo que merece su propia carpeta siguiendo el patrón de `dynamodb/`.

**Por qué no en `packages/shared-types/`**: La interfaz `ILLMService` es específica del Worker. La API NestJS no llama al LLM directamente. Moverla a shared-types añadiría acoplamiento innecesario.

### D2 — Tres métodos en la interfaz (no uno genérico)

```typescript
interface ILLMService {
  generateMessage(params: GenerateMessageParams): Promise<string>;
  extractAddress(messages: ConversationMessage[], language: string): Promise<ExtractedAddress>;
  interpretIntent(phase: ConversationPhase, userMessage: string, language: string): Promise<UserIntent>;
}
```

**Por qué tres métodos específicos y no un `call(prompt)` genérico**: Los tres usos tienen configuraciones distintas (temperatura diferente, JSON mode en dos de ellos, tipos de retorno distintos). Una interfaz genérica forzaría a los llamadores a conocer los detalles de configuración, perdiendo el valor de la abstracción. Con tres métodos específicos, el llamador solo habla en términos de dominio.

### D3 — Instanciación en `main.ts`, no inyección de framework

Sin NestJS en el Worker, la "inyección de dependencias" se resuelve manualmente en `main.ts`:

```typescript
const llmService: ILLMService = process.env.OPENAI_API_KEY
  ? new OpenAILLMService(process.env.OPENAI_API_KEY)
  : new MockLLMService();
```

El `llmService` se pasa como parámetro a los procesadores BullMQ. Esto es simple, explícito y no requiere ningún contenedor DI. Mantiene el Worker como Node.js puro.

### D4 — `address.service.ts` conserva los message builders pero pierde el acceso LLM

`address.service.ts` contiene dos tipos de cosas: (1) funciones de acceso a LLM (`extractAddressFromConversation`, `interpretUserIntent`, `getOpenAIClient`, mocks), y (2) message builders puros (`buildAddressProposalMessage`, `buildConfirmationRequest`, etc.) y lógica de Google Maps.

Solo se elimina el tipo (1). Los message builders y Google Maps se quedan en `address.service.ts` sin cambios. Esto evita un refactor más grande que está fuera de alcance.

## Risks / Trade-offs

**[Riesgo] Los tests actuales mockean el módulo `openai` a nivel de módulo Node.js** → Los tests de `address.service.spec.ts` y `conversation.processor.spec.ts` probablemente usan `jest.mock('openai')`. Después de la refactorización, deben mockear `ILLMService` directamente. Esto requiere reescribir las partes de setup de los tests, pero es un cambio mecánico y predecible.

**[Riesgo] Ruptura de comportamiento si los parámetros de OpenAI cambian al extraer** → Al mover la lógica a `OpenAILLMService`, los parámetros exactos (`model`, `temperature`, `max_tokens`, `response_format`) deben copiarse con precisión desde el código original. Una revisión cuidadosa previene regresiones.

**[Trade-off] El Worker sigue siendo un proceso Node.js puro**: no se introduce un contenedor DI formal. Esto mantiene la simplicidad pero significa que para añadir más implementaciones LLM en el futuro, habrá que tocar `main.ts`. Aceptable para el volumen actual.

## Migration Plan

1. Crear `apps/worker/src/llm/llm.interface.ts` con la interfaz y tipos
2. Crear `apps/worker/src/llm/openai-llm.service.ts` copiando parámetros exactos del código original
3. Crear `apps/worker/src/llm/mock-llm.service.ts` moviendo la lógica de `mockExtractAddress` y `mockInterpretIntent`
4. Actualizar `address.service.ts`: eliminar `getOpenAIClient`, `extractAddressFromConversation` (versión con OpenAI), `interpretUserIntent` (versión con OpenAI), `mockExtractAddress`, `mockInterpretIntent`. Actualizar las firmas de las funciones exportadas para recibir `ILLMService` como parámetro.
5. Actualizar `conversation.processor.ts`: eliminar `generateWithOpenAI`, recibir `ILLMService` como parámetro
6. Actualizar `main.ts`: instanciar el servicio correcto e inyectarlo
7. Actualizar `address.service.spec.ts` y `conversation.processor.spec.ts`: mockear `ILLMService`
8. Ejecutar `pnpm test` y verificar cobertura ≥ 90%

**Rollback**: Al ser una refactorización sin cambios de comportamiento, el rollback es revertir el commit si los tests fallan. No hay cambios en BD, API ni mensajes Redis.

## Open Questions

_Ninguna_: el alcance está completamente definido por los requisitos de la spec.
