# Research — Núcleo Compartido y Seguridad

**Feature**: `002-nucleo-compartido-seguridad` | **Date**: 2026-07-28

Decisiones técnicas para completar `shared-kernel` y `shared-auth`. El stack proviene de la constitución (Principios I, VI); aquí se decide **cómo** se organizan.

---

## D1 — Ubicación de las piezas web (`GlobalExceptionHandler`, `CorrelationIdFilter`)

- **Decisión**: `shared-kernel` permanece Java puro (`Result`, `DomainException` + subclases, `ApiResponse`). Las piezas que requieren Spring Web (`GlobalExceptionHandler` con `@RestControllerAdvice`, `CorrelationIdFilter`) se ubican en `shared-auth`, no en `shared-kernel`.
- **Rationale**: Las capas `domain` dependen de `shared-kernel`; si este arrastrara Spring, se violaría la pureza exigida por el Principio II. `ApiResponse<T>` sí vive en `shared-kernel` porque es un `record` sin framework.
- **Alternativas**: (a) Todo en `shared-kernel` como pedía literalmente TKT-002 → contamina el kernel con Spring; descartado. (b) Crear un módulo `shared-web` nuevo → scope creep innecesario para el andamiaje; descartado (se puede extraer luego si crece).

## D2 — `Result<T>`: API y forma

- **Decisión**: Ampliar el `Result<T>` existente para exponer `isSuccess()`, `isFailure()`, acceso al valor (`getValue()`/`value()`) y al error (`getError()`/`error()`), manteniendo el tipo sellado (`sealed interface` con `Success`/`Failure`). Sin excepciones verificadas.
- **Rationale**: Cumple FR-001 y los criterios del ticket; el tipo sellado permite exhaustividad con `switch`.
- **Alternativas**: Usar `Optional`/excepciones → no distingue error de dominio de ausencia; descartado.

## D3 — Jerarquía de excepciones y mapeo HTTP

- **Decisión**: `DomainException` (base) con subclases `RecursoNoEncontradoException`, `ConflictoEstadoException`, `ReglaNegocioException`. `GlobalExceptionHandler` (`@RestControllerAdvice`) mapea: `RecursoNoEncontrado` → 404, `ConflictoEstado` → 409, `ReglaNegocio` → 422, `MethodArgumentNotValidException`/validación → 400, cualquier otra → 500. Todas responden con `ApiResponse` estándar.
- **Rationale**: Cumple FR-002/FR-004 y Principio IX; centraliza el contrato de error.
- **Alternativas**: Manejo por servicio → inconsistencia; descartado.

## D4 — OAuth2 Resource Server con AWS Cognito

- **Decisión**: `SecurityConfig` configura Spring Security como Resource Server JWT. `CognitoProperties` (`@ConfigurationProperties` con prefix `security.cognito`) toma `region`, `userPoolId`, `issuerUri`, `jwkSetUri`, `clientId`, `scopes` desde variables de entorno. El `JwtDecoder` valida firma contra el JWKS del User Pool + emisor + audiencia (`clientId`). `/health`, `/health/**` y `/actuator/health` públicos; `/api/**` requiere JWT.
- **Rationale**: Cumple FR-006/FR-007/FR-008 y Principios VI/VII; parametrizable por ambiente.
- **Alternativas**: Introspección remota de token → añade latencia y dependencia; el modelo JWT con JWKS es el recomendado para Cognito M2M.

## D5 — Política CORS centralizada

- **Decisión**: `SecurityConfig` define un `CorsConfigurationSource` único: `allowedOriginPatterns=https://*.ccb.org.co` (más `http://localhost:4200` solo en perfiles no productivos), métodos `GET,POST,PUT,DELETE,OPTIONS`, headers `Authorization,Content-Type,X-Correlation-Id`, expone `X-Correlation-Id`, `allowCredentials=true`, `maxAge=3600`. Prohibido comodín de origen con credenciales.
- **Rationale**: Cumple FR-009 y Principio VI; una sola fuente evita relajaciones ad-hoc.
- **Alternativas**: CORS por controlador → viola la centralización; descartado.

## D6 — Correlation ID

- **Decisión**: `CorrelationIdFilter` (OncePerRequestFilter, orden alto) lee `X-Correlation-Id`; si falta, genera un UUID; lo coloca en MDC durante el request y lo escribe en el header de respuesta; limpia el MDC al finalizar. Valor entrante saneado/acotado.
- **Rationale**: Cumple FR-005 y Principio X; se integra con el `logback` JSON del andamiaje (que ya incluye `correlationId`).
- **Alternativas**: Interceptor MVC → no cubre respuestas de error tempranas; el filtro es más robusto.

## D7 — Dependencias nuevas y estrategia de prueba

- **Decisión**: Añadir al version catalog y a `shared-auth`: `spring-boot-starter-web`, `spring-boot-starter-oauth2-resource-server`, `spring-boot-starter-validation`; y en test `spring-security-test`. Pruebas: unidades puras para `shared-kernel`; `@WebMvcTest` + `MockMvc` + `spring-security-test` (`jwt()`/sin token) para el handler, seguridad y CORS; test de filtro para correlation id.
- **Rationale**: Versiones gestionadas por el BOM de Spring Boot (single source vía catalog); `spring-security-test` permite simular JWT sin un Cognito real.
- **Alternativas**: Servidor JWKS embebido (WireMock) → útil para un IT dedicado del `JwtDecoder`; se contempla como test de integración opcional, pero las reglas de autorización se prueban con `spring-security-test`.

## D8 — Regla ArchUnit adicional

- **Decisión**: Añadir en los `ArchitectureTest` de cada `*-api` una regla: las capas `domain` y `application` NO deben depender de `co.org.ccb.certificados.shared.auth..` ni de `...shared.web..`.
- **Rationale**: `shared-auth` es transversal con Spring; permitir que `application` lo use rompería la pureza (Principio II).
- **Alternativas**: No verificarlo → riesgo de fuga de framework a capas puras; descartado.

---

## Resumen de resolución

Sin marcadores `NEEDS CLARIFICATION`. Todas las incógnitas quedaron resueltas (D1–D8), alineadas con la constitución.
