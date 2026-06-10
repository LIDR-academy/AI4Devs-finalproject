# 4. Especificación de la API

La especificación REST formal de EventFlow vive en [`/docs/16-API-Design-Specification.md`](../docs/16-API-Design-Specification.md). Este documento la resume y expone endpoints representativos para evaluación académica.

## 4.1. Principios y convenciones

Trazables a `/docs/16` y formalizados por ADRs:

- **REST JSON** clásico, recursos en plural, verbos HTTP estándar (ADR-ARCH-003, ADR-API-001).
- **Base URL:** `/api/v1`.
- **JSON only**, excepto endpoints de attachments (`multipart/form-data`).
- **Auth:** sesión por **cookie HTTP-only firmada** (ADR-SEC-002). Sin tokens en `localStorage`. Sin OAuth obligatorio en MVP.
- **Authorization en backend:** RBAC + ownership + assignment-based (ADR-SEC-003). El frontend solo aporta UX guards (ADR-FE-003).
- **Validación de DTOs con Zod** en el límite del controlador (ADR-API-003).
- **Envelope de respuesta:** `{ data, pagination?, meta }`.
- **Envelope de error:** `{ error: { code, message, details? }, meta }` con catálogo de códigos documentado.
- **Correlation ID** obligatorio (`X-Correlation-Id`) en cada request/response y log (ADR-API-004).
- **Paginación** por `page` + `pageSize`, filtros y orden por query params.
- **Rate limiting** y **captcha** en flujos sensibles.
- **CSRF, CORS, security headers** y manejo de errores sin fuga de información (ADR-SEC-006).
- **Sin chat real-time, sin pagos reales, sin contratos digitales, sin SMS / WhatsApp / push** en MVP (ADR-ARCH-004).
- **Endpoints de IA bajo human-in-the-loop estricto** (ADR-AI-005): la respuesta IA queda como `AIRecommendation` `pending`/`accepted`/`edited`/`rejected`/`discarded`; no muta el dominio sin acción humana.
- **Health check público** en `/health`.

## 4.2. Módulos del API

| Módulo | Recursos representativos |
|---|---|
| Health | `GET /health`, `GET /health/ready` |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/password-reset/request`, `POST /auth/password-reset/confirm` |
| Users / Profile | `GET /me`, `PATCH /me`, `PATCH /me/password` |
| Events | `GET /events`, `POST /events`, `GET /events/{eventId}`, `PATCH /events/{eventId}` |
| Event Tasks | `GET /events/{eventId}/tasks`, `POST /events/{eventId}/tasks`, `PATCH /events/{eventId}/tasks/{taskId}` |
| Budget | `GET /events/{eventId}/budget`, `PATCH /events/{eventId}/budget`, `POST /events/{eventId}/budget/items` |
| Vendors (directory) | `GET /vendors`, `GET /vendors/{vendorProfileId}` |
| Vendor Profile (own) | `GET /me/vendor-profile`, `PUT /me/vendor-profile`, `POST /me/vendor-profile/services`, `PATCH /me/vendor-profile/services/{serviceId}` |
| Quote Requests | `GET /events/{eventId}/quote-requests`, `POST /events/{eventId}/quote-requests`, `PATCH /quote-requests/{quoteRequestId}` |
| Quotes | `GET /quote-requests/{quoteRequestId}/quotes`, `POST /quote-requests/{quoteRequestId}/quotes`, `PATCH /quotes/{quoteId}` |
| Booking Intents | `POST /quotes/{quoteId}/booking-intents`, `PATCH /booking-intents/{bookingIntentId}` |
| Reviews | `POST /booking-intents/{bookingIntentId}/reviews`, `GET /vendors/{vendorProfileId}/reviews` |
| Notifications | `GET /me/notifications`, `PATCH /me/notifications/{notificationId}` |
| AI recommendations | `POST /events/{eventId}/ai/plan`, `POST /events/{eventId}/ai/checklist`, `POST /events/{eventId}/ai/budget`, `POST /events/{eventId}/ai/vendor-categories`, `POST /quote-requests/{quoteRequestId}/ai/brief`, `POST /events/{eventId}/ai/quote-summary`, `PATCH /ai-recommendations/{recommendationId}` |
| Attachments | `POST /attachments` (multipart), `DELETE /attachments/{attachmentId}` |
| Admin | `GET /admin/vendors/pending`, `POST /admin/vendors/{vendorProfileId}/approve`, `POST /admin/vendors/{vendorProfileId}/reject`, `GET /admin/categories`, `POST /admin/categories`, `PATCH /admin/categories/{categoryId}`, `GET /admin/reviews/flagged`, `POST /admin/reviews/{reviewId}/moderate` |
| Seed / demo | `POST /admin/seed/reset` (protegido por rol + token operativo) |

La matriz completa de autorización (RBAC + ownership + assignment-based) por endpoint vive en [`/docs/16`](../docs/16-API-Design-Specification.md) y [`/docs/19`](../docs/19-Security-and-Authorization-Design.md).

## 4.3. OpenAPI readiness

El API está diseñada para ser **directamente convertible a OpenAPI 3.1** mediante anotación de los DTOs Zod del backend (sección §43 de `/docs/16`). La generación del YAML formal queda como tarea de implementación (`docs:openapi`) y **no se incluye un archivo OpenAPI completo en esta entrega** para no inventar contratos finales fuera del documento fuente.

## 4.4. Endpoints representativos (ejemplos)

Los siguientes ejemplos son **representativos**, no exhaustivos. El catálogo completo vive en `/docs/16`.

```txt
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout

GET    /api/v1/events
POST   /api/v1/events
GET    /api/v1/events/{eventId}

POST   /api/v1/events/{eventId}/ai/plan
POST   /api/v1/events/{eventId}/ai/checklist
POST   /api/v1/events/{eventId}/ai/budget

POST   /api/v1/events/{eventId}/quote-requests
POST   /api/v1/quote-requests/{quoteRequestId}/quotes
POST   /api/v1/quotes/{quoteId}/booking-intents

POST   /api/v1/booking-intents/{bookingIntentId}/reviews

GET    /api/v1/admin/vendors/pending
POST   /api/v1/admin/vendors/{vendorProfileId}/approve
POST   /api/v1/admin/seed/reset
```

## 4.5. Ejemplo de contrato — Crear evento

Borrador derivado de `/docs/16` y de los DTOs documentados en `/docs/14`. **No reemplaza el contrato final** del API Design Specification.

```yaml
openapi: 3.1.0
info:
  title: EventFlow API (excerpt)
  version: "1.0.0-academic-draft"
  description: >
    Extracto representativo derivado de /docs/16-API-Design-Specification.md.
    No es el contrato completo; es una muestra para evaluación académica.
servers:
  - url: https://api.eventflow.local/api/v1
paths:
  /events:
    post:
      summary: Crear un evento
      description: Crea un evento propiedad del organizador autenticado. Aplica RBAC (organizer) y persiste un Event en estado draft con currency inmutable.
      security:
        - cookieAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - eventTypeCode
                - eventDate
                - guestsCount
                - locationCity
                - locationCountryCode
                - estimatedBudget
                - currencyCode
                - languageCode
              properties:
                eventTypeCode:
                  type: string
                  enum: [wedding, xv, baptism, baby_shower, birthday, corporate]
                name:
                  type: string
                  maxLength: 120
                eventDate:
                  type: string
                  format: date
                guestsCount:
                  type: integer
                  minimum: 1
                locationCity:
                  type: string
                locationCountryCode:
                  type: string
                  enum: [GT, MX, CO, ES, US]
                estimatedBudget:
                  type: number
                currencyCode:
                  type: string
                  enum: [GTQ, USD, EUR, MXN, COP]
                languageCode:
                  type: string
                  enum: [es-LATAM, es-ES, pt, en]
      responses:
        "201":
          description: Evento creado en estado draft.
        "400": { description: Datos inválidos (Zod). }
        "401": { description: Usuario no autenticado. }
        "403": { description: Rol no autorizado. }
        "429": { description: Rate limit excedido. }
  /events/{eventId}/ai/plan:
    post:
      summary: Generar plan de evento con IA
      description: Genera un plan preliminar usando LLMProvider. Persiste el resultado como AIRecommendation con accepted=false por defecto.
      security:
        - cookieAuth: []
      parameters:
        - in: path
          name: eventId
          required: true
          schema: { type: string, format: uuid }
      responses:
        "200":
          description: Recomendación IA generada y almacenada.
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: object
                    properties:
                      recommendationId: { type: string, format: uuid }
                      type: { type: string, enum: [event_plan] }
                      status: { type: string, enum: [pending] }
                      accepted: { type: boolean, example: false }
                      fallbackUsed: { type: boolean }
                      promptVersionId: { type: string }
                      output: { type: object, additionalProperties: true }
        "401": { description: No autenticado. }
        "403": { description: Evento ajeno o rol no permitido. }
        "404": { description: Evento no encontrado. }
        "408": { description: Timeout de IA (60s) o degradación. }
        "503": { description: LLMProvider no disponible y fallback deshabilitado. }
  /events/{eventId}/quote-requests:
    post:
      summary: Crear solicitud de cotización
      description: Envía una QuoteRequest a un proveedor aprobado. Valida límites (máx 5 activas por categoría/evento; una activa por evento+proveedor).
      security:
        - cookieAuth: []
      parameters:
        - in: path
          name: eventId
          required: true
          schema: { type: string, format: uuid }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [vendorProfileId, serviceCategoryId, brief]
              properties:
                vendorProfileId: { type: string, format: uuid }
                serviceCategoryId: { type: string, format: uuid }
                brief: { type: string, maxLength: 4000 }
                aiGeneratedBrief: { type: boolean, default: false }
      responses:
        "201": { description: Solicitud creada con status sent. }
        "400": { description: Datos inválidos o límite excedido. }
        "401": { description: No autenticado. }
        "403": { description: No es owner del evento o vendor no visible. }
        "409": { description: Ya existe una QuoteRequest activa para el mismo (evento, proveedor). }
components:
  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: eventflow.sid
```

## 4.6. Documentos fuente

- [API Design Specification](../docs/16-API-Design-Specification.md)
- [Backend Technical Design](../docs/14-Backend-Technical-Design.md)
- [Security & Authorization Design](../docs/19-Security-and-Authorization-Design.md)
- [AI Architecture & PromptOps Design](../docs/17-AI-Architecture-and-PromptOps-Design.md)
- [Frontend Architecture Design](../docs/15-Frontend-Architecture-Design.md)
