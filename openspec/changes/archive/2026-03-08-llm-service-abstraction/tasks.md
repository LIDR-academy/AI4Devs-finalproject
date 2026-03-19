## 1. Capa LLM — Interfaz y estructura

- [x] 1.1 [backend] Crear `apps/worker/src/llm/llm.interface.ts` con `ILLMService`, `GenerateMessageParams` y los tipos de retorno
- [x] 1.2 [backend] Crear `apps/worker/src/llm/openai-llm.service.ts` implementando `ILLMService` con `gpt-4o-mini` (copiar parámetros exactos del código original)
- [x] 1.3 [backend] Crear `apps/worker/src/llm/mock-llm.service.ts` moviendo la lógica de `mockExtractAddress` y `mockInterpretIntent` desde `address.service.ts`

## 2. Limpieza de address.service.ts

- [x] 2.1 [backend] Eliminar `getOpenAIClient()` de `address.service.ts`
- [x] 2.2 [backend] Eliminar la función `extractAddressFromConversation()` (versión OpenAI + mock) de `address.service.ts` y reemplazarla por una versión que recibe `ILLMService` como parámetro
- [x] 2.3 [backend] Eliminar la función `interpretUserIntent()` (versión OpenAI + mock) de `address.service.ts` y reemplazarla por una versión que recibe `ILLMService` como parámetro
- [x] 2.4 [backend] Eliminar `import OpenAI from 'openai'` de `address.service.ts` — verificar que no quede ninguna referencia directa

## 3. Limpieza de conversation.processor.ts

- [x] 3.1 [backend] Eliminar la función `generateWithOpenAI()` de `conversation.processor.ts`
- [x] 3.2 [backend] Actualizar `conversationProcessor` y `processResponseProcessor` para recibir `ILLMService` como parámetro y pasarlo a las llamadas correspondientes
- [x] 3.3 [backend] Eliminar `import OpenAI from 'openai'` de `conversation.processor.ts` — verificar que no quede ninguna referencia directa

## 4. Actualización de main.ts

- [x] 4.1 [backend] Actualizar `apps/worker/src/main.ts` para instanciar `OpenAILLMService` o `MockLLMService` según `OPENAI_API_KEY` e inyectarlo en los procesadores BullMQ

## 5. Actualización de tests

- [x] 5.1 [qa] Actualizar `conversation.processor.spec.ts`: reemplazar mock de `address.service.interpretUserIntent` por mock de `ILLMService` con `jest.fn()`
- [x] 5.2 [qa] Verificar `address.service.spec.ts`: sin cambios necesarios (solo prueba message builders puros, sin dependencia de OpenAI)
- [x] 5.3 [qa] Ejecutar `pnpm test` en `apps/worker/` — 41 tests pasando, 0 fallos
- [x] 5.4 [qa] Verificar cobertura con `pnpm test:cov` — sin regresiones respecto al estado previo
