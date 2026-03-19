## Why

El Worker (`apps/worker/`) llama directamente a `new OpenAI()` en múltiples funciones dispersas (`generateWithOpenAI`, `extractAddressFromConversation`, `interpretUserIntent`) sin ninguna capa de abstracción. Esto viola el ADR-004 que documentó la interfaz `ILLMService` como deuda técnica pendiente, dificulta el testing, y acopla el código al proveedor OpenAI.

## What Changes

- **Nueva interfaz `ILLMService`** con tres métodos: `generateMessage`, `extractAddress`, `interpretIntent`
- **Nueva implementación `OpenAILLMService`** que encapsula todas las llamadas a `gpt-4o-mini`
- **Nueva implementación `MockLLMService`** que consolida las funciones mock existentes (`mockExtractAddress`, `mockInterpretIntent`) en un servicio coherente
- **Eliminación de código disperso**: se eliminan `generateWithOpenAI()`, `getOpenAIClient()`, `mockExtractAddress()`, `mockInterpretIntent()` como funciones sueltas
- `address.service.ts` y `conversation.processor.ts` usan la interfaz en lugar de llamadas directas a OpenAI
- Los tests existentes del Worker se actualizan para mockear `ILLMService` en lugar de módulos de OpenAI

## Capabilities

### New Capabilities

- `llm-service-interface`: Definición de la interfaz `ILLMService` y sus tipos asociados (`GenerateMessageParams`, `ExtractAddressParams`, `InterpretIntentParams`) en `apps/worker/src/llm/`

### Modified Capabilities

_Ninguna_: El comportamiento externo del Worker no cambia. Solo se refactoriza la capa interna de acceso al LLM.

## Impact

- `apps/worker/src/services/address.service.ts`: se eliminan las llamadas directas a OpenAI y las funciones mock sueltas
- `apps/worker/src/processors/conversation.processor.ts`: se elimina `generateWithOpenAI()`, se recibe el servicio LLM como dependencia
- `apps/worker/src/main.ts`: inicializa `OpenAILLMService` o `MockLLMService` según `OPENAI_API_KEY` y lo inyecta
- Tests: `conversation.processor.spec.ts` y `address.service.spec.ts` mockean `ILLMService`
- Sin cambios en API, schema de BD, ni comportamiento observable para el usuario final
