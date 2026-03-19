# Spec: llm-service-interface

> **Capability**: Interfaz de abstracción del servicio LLM en el Worker  
> **Última actualización**: 2026-03-08  
> **Origen**: change `llm-service-abstraction`

---

### Requirement: Interfaz ILLMService unificada
El Worker SHALL definir una interfaz `ILLMService` en `apps/worker/src/llm/llm.interface.ts` que exponga exactamente tres métodos: `generateMessage`, `extractAddress` e `interpretIntent`. Todos los accesos al modelo de lenguaje en el Worker MUST pasar por esta interfaz.

#### Scenario: Contrato de la interfaz
- **WHEN** un consumidor del Worker importa el servicio LLM
- **THEN** el contrato expuesto es `ILLMService` con los tres métodos, sin dependencia directa a `openai` ni a implementaciones concretas

#### Scenario: Inyección en el procesador de conversaciones
- **WHEN** `conversation.processor.ts` necesita generar un mensaje inicial
- **THEN** llama a `llmService.generateMessage()` a través de `ILLMService`, sin instanciar `OpenAI` directamente

### Requirement: Implementación OpenAILLMService
El Worker SHALL proveer `OpenAILLMService` en `apps/worker/src/llm/openai-llm.service.ts` que implemente `ILLMService` usando el cliente `openai` con el modelo `gpt-4o-mini`.

#### Scenario: Generación de mensaje inicial
- **WHEN** `OPENAI_API_KEY` está configurada y se llama `generateMessage()`
- **THEN** se realiza una llamada a `gpt-4o-mini` con `temperature: 0.7` y `max_tokens: 300` y se retorna el contenido de texto

#### Scenario: Extracción de dirección
- **WHEN** se llama `extractAddress()` con el historial de conversación
- **THEN** se llama a `gpt-4o-mini` con `response_format: { type: 'json_object' }`, `temperature: 0` y se retorna el objeto `ExtractedAddress` parseado

#### Scenario: Interpretación de intención
- **WHEN** se llama `interpretIntent()` con la fase actual y el mensaje del usuario
- **THEN** se llama a `gpt-4o-mini` con `response_format: { type: 'json_object' }`, `temperature: 0` y se retorna el objeto `UserIntent` parseado

### Requirement: Implementación MockLLMService
El Worker SHALL proveer `MockLLMService` en `apps/worker/src/llm/mock-llm.service.ts` que implemente `ILLMService` sin llamadas de red, consolidando la lógica de las funciones `mockExtractAddress` y `mockInterpretIntent` actualmente en `address.service.ts`.

#### Scenario: Activación automática sin API key
- **WHEN** `OPENAI_API_KEY` no está configurada en el entorno
- **THEN** `main.ts` instancia `MockLLMService` y lo pasa al procesador, sin lanzar ningún error

#### Scenario: Comportamiento mock de generateMessage
- **WHEN** `MockLLMService.generateMessage()` es llamado
- **THEN** retorna una cadena predefinida en español sin realizar ninguna llamada de red

#### Scenario: Comportamiento mock de extractAddress
- **WHEN** `MockLLMService.extractAddress()` recibe un historial de mensajes
- **THEN** aplica la misma heurística regex de la función `mockExtractAddress` actual y retorna un `ExtractedAddress`

#### Scenario: Comportamiento mock de interpretIntent
- **WHEN** `MockLLMService.interpretIntent()` recibe una fase y un mensaje
- **THEN** aplica la misma heurística de la función `mockInterpretIntent` actual y retorna un `UserIntent`

### Requirement: Eliminación de código LLM disperso
Una vez creada la capa de abstracción, el código directo de OpenAI en `address.service.ts` y `conversation.processor.ts` MUST ser eliminado por completo, sin dejar funciones huérfanas ni imports no usados.

#### Scenario: Sin referencias a openai en address.service
- **WHEN** se compila `address.service.ts`
- **THEN** el archivo no contiene `import OpenAI` ni instancias de `new OpenAI()`

#### Scenario: Sin referencias a openai en conversation.processor
- **WHEN** se compila `conversation.processor.ts`
- **THEN** el archivo no contiene `import OpenAI` ni la función `generateWithOpenAI`

### Requirement: Compatibilidad de tests existentes
Los tests en `conversation.processor.spec.ts` y `address.service.spec.ts` MUST seguir pasando tras la refactorización, mockeando `ILLMService` en lugar de los módulos de OpenAI.

#### Scenario: Tests del procesador con mock del servicio
- **WHEN** se ejecuta `pnpm test` en `apps/worker/`
- **THEN** todos los tests pasan con cobertura ≥ 90% en ramas, funciones y líneas

#### Scenario: Sin cambios en comportamiento observable
- **WHEN** el Worker procesa una conversación con `OPENAI_API_KEY` configurada
- **THEN** el comportamiento externo (mensajes publicados en Redis, estados guardados en DynamoDB) es idéntico al comportamiento previo a la refactorización
