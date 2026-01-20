
# Backend Instructions — Proyecto Meditation Builder

## Principios clave
- Arquitectura: Hexagonal (DDD + TDD + API First).
- Lenguaje: Java 21 + Spring Boot.
- Controllers: sin lógica de negocio; validación superficial; cumplir OpenAPI.
- Dominio: sin frameworks; solo reglas de negocio y puertos.
- Aplicación: orquestación; no conoce infra.
- Infraestructura: implementa puertos; no define reglas.

## Ubicación por capa
- Dominio: `.../domain/{model|enums|ports/{in|out}}`
- Aplicación: `.../application/usecases`
- Infraestructura:
  - Entrada: `.../infrastructure/in/rest/{controller|dto|mapper}`
  - Salida: `.../infrastructure/out/service/{impl|mapper}`
- OpenAPI: `src/main/resources/openapi/`

## Naming obligatorio
- Puertos out: `TextGenerationPort`, `MusicGenerationPort`, `ImageGenerationPort`.
- Use cases: `GenerateMeditationTextUseCase`, `GenerateMeditationMusicUseCase`, `GenerateMeditationImageUseCase`.
- Adapters IA: `TextGenerationAiAdapter`, `MusicGenerationAiAdapter`, `ImageGenerationAiAdapter`.
- Controller: `MeditationBuilderController`.
- DTOs: `<Recurso><Accion>{Request|Response}`.

## Reglas técnicas
- Para llamadas HTTP externas: usar **RestClient** (imperativo); **WebClient** solo si streaming/reactivo.
- Mapear errores IA → HTTP: `AiTimeout/AiUnavailable/AiRateLimited → 503/429`.
- No loguear prompts ni respuestas IA.
