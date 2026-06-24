# 7. Desglose de Trabajo por Disciplina

> [Volver al Índice PRD](../PRD.md) | [Anterior: Funcionalidades MVP](06-mvp-features.md) | [Siguiente: Métricas de Éxito](08-success-metrics.md)

---

## 7.1 UX

| Flujos de Trabajo Clave | Preguntas Abiertas |
|----------------|----------------|
| Flujos de usuario para 4 personas (Pareja, Invitado, Accomplice, Planner) | DECISIÓN NECESARIA: Flujo de onboarding de accomplice - cuenta vs. acceso solo con enlace |
| Optimización del formulario RSVP (mobile-first, <60s para completar) | DECISIÓN NECESARIA: Profundidad del formulario RSVP - campos mínimos vs. completos |
| Simplicidad del panel accomplice (swipe-to-send, mobile-first) | DECISIÓN NECESARIA: Número de plantillas de mensaje por defecto (5 vs. 8) |
| Journey de invitado mobile-first (micrositio, maps, calendario) | DECISIÓN NECESARIA: Prioridad de sincronización de calendario - solo Google Calendar o también Apple/Outlook |
| Flujos de registro/onboarding (wizard de 2 pasos) | DECISIÓN NECESARIA: Pasos del wizard de onboarding - obligatorios vs. omitibles |

## 7.2 UI

| Flujos de Trabajo Clave | Preguntas Abiertas |
|----------------|----------------|
| Sistema de diseño (tokens, componentes, tipografía, colores) | DECISIÓN NECESARIA: Profundidad de personalización de plantilla - solo colores/fuentes o también layout |
| Constructor del editor de plantillas (preview en tiempo real, auto-guardado) | DECISIÓN NECESARIA: Número de plantillas en lanzamiento (3 vs. 5) |
| Puntos de rotura responsive (mobile-first, tablet, desktop) | DECISIÓN NECESARIA: Soporte desktop para panel accomplice (click-drag vs. swipe) |
| Accesibilidad (cumplimiento WCAG 2.1 AA) | DECISIÓN NECESARIA: Alcance de accesibilidad para V1 - AA completo o parcial |
| Pantallas del wizard de onboarding (selección de plantilla, datos del evento) | DECISIÓN NECESARIA: Estilo visual del onboarding - paso a paso vs. página única |

## 7.3 Frontend (Angular 22)

| Flujos de Trabajo Clave | Preguntas Abiertas |
|----------------|----------------|
| SPA del dashboard del host (Angular 22, standalone components, signals) | DECISIÓN NECESARIA: Gestión de estado - solo signals o NgRx para estado complejo |
| SPA del panel accomplice (gestos táctiles, auth JWT) | DECISIÓN NECESARIA: Biblioteca de gestos - Angular CDK o Hammer.js |
| Generador de sitio estático para micrositios de invitados (plantillas Razor) | DECISIÓN NECESARIA: Pipeline de build del sitio estático - Razor vs. interpolación de strings |
| Formularios tipados (registro, RSVP, importación de invitados) | DECISIÓN NECESARIA: Validación de formularios - formularios reactivos vs. template-driven |
| Formularios de auth/registro (flujo magic link) | DECISIÓN NECESARIA: Almacenamiento de sesión - httpOnly cookie vs. localStorage |
| Editor de plantilla (color picker, selector de fuente, subida de imagen) | DECISIÓN NECESARIA: Manejo de subida de imágenes - directo a API o URL pre-firmada |

## 7.4 Backend (.NET 10)

| Flujos de Trabajo Clave | Preguntas Abiertas |
|----------------|----------------|
| Auth (magic links + JWT, rate limiting, gestión de sesiones) | DECISIÓN NECESARIA: Almacenamiento JWT - httpOnly cookie vs. Bearer token |
| Endpoint de registro, gestión de perfil, aceptación de términos | DECISIÓN NECESARIA: Estrategia de versionado de términos - forzar re-aceptación en actualización |
| CRUD de Events/Guests/Invitations/RSVPs | DECISIÓN NECESARIA: Algoritmo de generación de slug - determinístico vs. aleatorio |
| Importación CSV (validación, deduplicación, manejo de errores) | DECISIÓN NECESARIA: Codificación CSV - solo UTF-8 o auto-detectar |
| Webhook de pago (Stripe, procesamiento idempotente) | DECISIÓN NECESARIA: Reintento de webhook - integrado de Stripe o cola personalizada |
| Trabajos en background (eliminación a 30 días, recordatorios, dispatch email/WhatsApp) | DECISIÓN NECESARIA: Servicio en background - BackgroundService único o cola distribuida |

## 7.5 Base de Datos (PostgreSQL/EF Core)

| Flujos de Trabajo Clave | Preguntas Abiertas |
|----------------|----------------|
| Schema para todas las entidades (11 entidades, relaciones, constraints) | DECISIÓN NECESARIA: Tipo de clave primaria - ULID vs. GUID vs. entero |
| Tabla Users con campos de perfil (name, terms, timezone, locale) | DECISIÓN NECESARIA: Extensibilidad del perfil de usuario - blob JSON o columnas dedicadas |
| Soft deletes (flag IsDeleted, global query filters) | DECISIÓN NECESARIA: Cascada de soft delete - automática o manual por entidad |
| Índices para patrones de consulta (16 índices mapeados a consultas) | DECISIÓN NECESARIA: Índices compuestos - qué combinaciones para consultas comunes |
| Migraciones (EF Core, versionadas, reversibles) | DECISIÓN NECESARIA: Estrategia de migración - automática o revisión manual |
| Encriptación en reposo | DECISIÓN NECESARIA: SQLCipher vs. encriptación AES-256 a nivel de aplicación |

## 7.6 Integraciones

| Flujos de Trabajo Clave | Preguntas Abiertas |
|----------------|----------------|
| WhatsApp Business API (plantillas, webhooks, rate limits, lógica de reintento) | DECISIÓN NECESARIA: API Meta directa vs. BSP (Twilio/MessageBird) |
| Gmail SMTP (plantillas, límite 500/día, sin webhooks de bounce) | DECISIÓN NECESARIA: Abstracción IEmailService para swap futuro |
| Stripe Connect (pago de publicación, webhook, registro de regalos futuro) | DECISIÓN NECESARIA: Stripe Connect vs. Stripe estándar para MVP |
| Google Maps (embed, geocodificación, deep links de direcciones) | DECISIÓN NECESARIA: Seguridad de clave API de Maps - restricción por referrer vs. IP |
| Aprobación de API de WhatsApp | DECISIÓN NECESARIA: Pre-enviar plantillas 1 semana antes del lanzamiento |

## 7.7 Infraestructura/DevOps

| Flujos de Trabajo Clave | Preguntas Abiertas |
|----------------|----------------|
| CDN para sitios estáticos (Cloudflare, origin MinIO, invalidación de caché) | Resuelto: Cloudflare |
| Pipeline CI/CD (GitHub Actions, Docker build, GHCR, kubectl apply) | Resuelto: Kustomize + kubectl |
| Entornos (local, staging, producción) | DECISIÓN NECESARIA: Entorno staging - compartido o por PR |
| Observabilidad (Serilog, OpenTelemetry, Sentry) | DECISIÓN NECESARIA: Seguimiento de errores - Sentry vs. Application Insights |
| Gestión de secretos (variables de entorno, rotación de claves) | DECISIÓN NECESARIA: Almacenamiento de secretos - GitHub Secrets vs. Azure Key Vault |

## 7.8 Seguridad/Cumplimiento

| Flujos de Trabajo Clave | Preguntas Abiertas |
|----------------|----------------|
| Políticas AuthZ (EventOwner, AccompliceScoped, PublishedEvent, DraftGuestLimit) | DECISIÓN NECESARIA: Granularidad de políticas - coarse (role-based) o fine (resource-based) |
| Rate limiting (5 categorías de endpoints, respuestas 429) | DECISIÓN NECESARIA: Almacenamiento de rate limit - en memoria vs. distribuido (Redis) |
| Manejo de PII (encriptación AES-256 a nivel de aplicación) | DECISIÓN NECESARIA: SQLCipher vs. encriptación a nivel de app para MVP |
| Trabajo de auto-eliminación a 30 días (BackgroundService, transaccional) | DECISIÓN NECESARIA: Manejo de fallo de eliminación - alertar vs. auto-reintentar |
| Endpoints de derechos GDPR (acceso, rectificar, borrar, portabilidad) | DECISIÓN NECESARIA: Formato de exportación de datos GDPR - CSV vs. JSON vs. ambos |
| Seguimiento de consentimiento (versión de términos, timestamp, opt-in marketing) | DECISIÓN NECESARIA: Banner de consentimiento de cookies - necesario o no (sin cookies de terceros) |

---

> [Volver al Índice PRD](../PRD.md) | [Anterior: Funcionalidades MVP](06-mvp-features.md) | [Siguiente: Métricas de Éxito](08-success-metrics.md)