## PSRP-003: feat(api): base-api-infrastructure

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** M (2-3d)
**Sprint Week:** W1
**Dependencies:** PSRP-001, PSRP-002

## Resumen de Funcionalidad
Implementar la capa de infraestructura base de la API incluyendo endpoints de health check para probes de Kubernetes, middleware global de manejo de excepciones, configuración CORS, middleware de rate limiting respaldado por Dragonfly, middleware de security headers, integración FluentValidation, y documentación Swagger/OpenAPI. Esto establece el pipeline HTTP que todos los endpoints de la API usarán.

## Requisitos
- [ ] Configurar endpoints de health check: `/health/live` (liveness) y `/health/ready` (readiness con PostgreSQL, Dragonfly, MinIO checks)
- [ ] Implementar middleware global de manejo de excepciones que mapea excepciones de dominio a códigos de estado HTTP (400, 401, 403, 404, 409, 429, 500)
- [ ] Configurar política CORS con orígenes permitidos basados en environment (localhost para dev, aura.planning para producción)
- [ ] Implementar middleware de rate limiting respaldado por Dragonfly: 100 req/min por IP globalmente, 3 magic link requests por email por hora
- [ ] Implementar middleware de security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Content-Security-Policy, Strict-Transport-Security
- [ ] Configurar pipeline behavior de FluentValidation para validación automática de DTOs en todos los endpoints POST/PUT
- [ ] Configurar Swagger/OpenAPI con soporte de JWT bearer auth
- [ ] Registrar todos los servicios en contenedor DI: DbContext, repositories, Dragonfly connection, MinIO client
- [ ] Configurar Serilog para logging JSON estructurado con correlation IDs
- [ ] Implementar políticas de autorización: EventOwner, AccompliceScoped, PublishedEvent, DraftGuestLimit, ActiveAccomplice

## Notas Técnicas
- **Backend:** ASP.NET Core minimal API or controllers. Program.cs es el composition root. El orden del middleware importa: ExceptionHandling → SecurityHeaders → RateLimiting → CORS → Auth → Routing
- **Frontend:** N/A
- **Database:** Health checks consultan PostgreSQL, Dragonfly, MinIO connectivity
- **Integrations:** Dragonfly para distributed rate limiting (patrón INCR + EXPIRE)
- **Key files:**
  - `backend/src/Aura.Api/Program.cs`
  - `backend/src/Aura.Api/Middleware/ExceptionHandlingMiddleware.cs`
  - `backend/src/Aura.Api/Middleware/RateLimitingMiddleware.cs`
  - `backend/src/Aura.Api/Middleware/SecurityHeadersMiddleware.cs`
  - `backend/src/Aura.Api/Health/HealthChecksSetup.cs`
  - `backend/src/Aura.Api/Filters/ValidationFilter.cs`
  - `backend/src/Aura.Api/appsettings.json`
  - `backend/src/Aura.Api/appsettings.Development.json`

## Criterios de Aceptación
- [ ] AC1: Dado que la API está corriendo, cuando se llama `GET /health/live`, entonces se devuelve 200 OK
- [ ] AC2: Dado que la API está corriendo y PostgreSQL es reachable, cuando se llama `GET /health/ready`, entonces se devuelve 200 OK con status de cada dependencia
- [ ] AC3: Dado que la API está corriendo, cuando una request dispara una excepción no manejada, entonces se devuelve 500 con un JSON error body (no stack trace en producción)
- [ ] AC4: Dado que se envían 101 requests dentro de 1 minuto desde la misma IP, entonces la request 101 devuelve 429 con header Retry-After
- [ ] AC5: Dado un POST request con DTO inválido (campo requerido faltante), entonces se devuelve 400 con detalles de error de FluentValidation
- [ ] AC6: Dado cualquier respuesta de API, entonces la respuesta incluye headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Strict-Transport-Security

## Elementos Relacionados
- **PRD section:** 07-work-breakdown.md (Security/Compliance)
- **Architecture:** 05-security.md (rate limiting, security headers, authorization policies), 03-project-structure.md (Aura.Api structure)
- **Data model:** N/A

## Bloqueadores
Bloqueado por: PSRP-001, PSRP-002

## Branch Name
`feature/PSRP-003-base-api-infrastructure`