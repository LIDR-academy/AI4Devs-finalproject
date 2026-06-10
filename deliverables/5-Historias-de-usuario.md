# 5. Historias de Usuario

Backlog curado de historias de usuario para el MVP de EventFlow, organizado por épica. Las historias se derivan de FRD, Use Cases, Business Rules, AI Features, Security Design, Testing Strategy y DevOps Design. Todas las historias están sujetas a refinamiento durante implementación.

**Convención:**
- `ID:` identificador estable.
- `Epic:` agrupación funcional o técnica.
- `Prioridad:` Must Have (M) / Should Have (S) / Could Have (C).
- `Fuentes:` documentos fuente principales.

---

## Épica 1 — Autenticación y perfil de usuario

### US-AUTH-001 — Registrarse como usuario

**Epic:** Auth & User Profile · **Prioridad:** Must Have

**Como** visitante,
**quiero** registrarme con email, contraseña y rol (`organizer` o `vendor`),
**para** acceder al workspace correspondiente y construir mi historial de eventos o de proveedor.

**Criterios de aceptación:**
- El formulario exige captcha antes de aceptar el registro.
- El sistema valida fortaleza mínima de contraseña y unicidad del email.
- La contraseña se persiste con hashing seguro (`argon2id` o `bcrypt`).
- Los administradores no pueden crearse desde el registro público.
- Tras el registro exitoso se emite una cookie de sesión HTTP-only firmada.

**Fuentes:** FRD (`FR-AUTH-*`), `/docs/19`, `/docs/16`.

---

### US-AUTH-002 — Iniciar sesión y recuperar contraseña

**Epic:** Auth & User Profile · **Prioridad:** Must Have

**Como** usuario registrado,
**quiero** iniciar sesión con email + contraseña y recuperar mi contraseña vía email simulado,
**para** acceder a mi workspace de manera segura sin depender de SSO.

**Criterios de aceptación:**
- Captcha y rate limit aplicados a `/auth/login` y `/auth/password-reset/request`.
- El reset usa token de un solo uso con expiración corta.
- Logs estructurados con correlation ID; sin fuga de información sensible en mensajes de error.

**Fuentes:** `/docs/19`, `/docs/16`.

---

### US-PROFILE-001 — Actualizar perfil propio

**Epic:** Auth & User Profile · **Prioridad:** Should Have

**Como** usuario autenticado,
**quiero** actualizar nombre, idioma preferido y cambiar mi contraseña,
**para** mantener mis datos al día y operar en mi idioma.

**Criterios de aceptación:**
- Idioma preferido entre `es-LATAM`, `es-ES`, `pt`, `en`.
- Cambio de contraseña exige contraseña actual y revoca la sesión si está configurado así.

**Fuentes:** FRD, `/docs/15`.

---

## Épica 2 — Workspace de planificación del organizador

### US-EVENT-001 — Crear evento

**Epic:** Event Planning Workspace · **Prioridad:** Must Have

**Como** organizador,
**quiero** crear un evento indicando tipo, fecha, ciudad, moneda, idioma, número estimado de invitados y presupuesto,
**para** iniciar la planificación estructurada.

**Criterios de aceptación:**
- El organizador autenticado puede crear un evento propio (RBAC + ownership).
- La moneda se define durante la creación y **no puede modificarse después**.
- El sistema valida tipo de evento contra el catálogo (`wedding`, `xv`, `baptism`, `baby_shower`, `birthday`, `corporate`).
- El evento queda en estado `draft` con `is_seed=false`.

**Fuentes:** FRD, Use Cases, Business Rules, Domain Data Model.

---

### US-EVENT-002 — Ver dashboard del evento

**Epic:** Event Planning Workspace · **Prioridad:** Must Have

**Como** organizador,
**quiero** ver un dashboard con el progreso del checklist, presupuesto comprometido y cotizaciones activas,
**para** entender el estado del evento de un vistazo.

**Criterios de aceptación:**
- Solo el owner ve los datos del evento.
- El dashboard muestra warnings cuando el comprometido supera el planificado.
- El evento se auto-cierra 2 días después de `event_date` (job programado).

**Fuentes:** FRD, NFR, `/docs/14`, `/docs/15`.

---

### US-EVENT-003 — Gestionar tareas del checklist

**Epic:** Tasks & Budget · **Prioridad:** Must Have

**Como** organizador,
**quiero** crear, editar y completar tareas del checklist con estados `pending`/`in_progress`/`done`/`skipped`,
**para** controlar el progreso operativo del evento.

**Criterios de aceptación:**
- Tareas IA generadas requieren confirmación humana antes de contar en el progreso.
- Cada tarea puede tener `due_date` y descripción libre.

**Fuentes:** FRD, Business Rules, `/docs/15`.

---

### US-BUDGET-001 — Gestionar presupuesto por categorías

**Epic:** Tasks & Budget · **Prioridad:** Must Have

**Como** organizador,
**quiero** distribuir el presupuesto en líneas por categoría de servicio con montos planificados y comprometidos,
**para** mantener trazabilidad del gasto sin perder el total del evento.

**Criterios de aceptación:**
- Misma moneda que el evento.
- Warning visible cuando comprometido > planificado.
- `committed_amount` se actualiza al confirmar `BookingIntent`.

**Fuentes:** FRD, Domain Data Model, Business Rules.

---

## Épica 3 — Asistencia IA con human-in-the-loop

### US-AI-001 — Generar plan de evento con IA

**Epic:** AI-Assisted Planning · **Prioridad:** Must Have

**Como** organizador,
**quiero** generar un plan inicial del evento usando IA,
**para** convertir una idea suelta en un timeline accionable.

**Criterios de aceptación:**
- Endpoint `POST /events/{eventId}/ai/plan` aplica RBAC + ownership previo a invocar IA.
- Toda salida IA se persiste como `AIRecommendation` con `accepted=false`, `llm_provider`, `prompt_version_id`, `language_code`, `fallback_used`, `timeout_ms`.
- Timeout fijo de 60 000 ms; fallback controlado por entorno (`MockAIProvider`).
- La salida IA **no muta el dominio** hasta que el organizador acepta o edita.

**Fuentes:** AI Features, `/docs/17`, FRD (`FR-AI-*`), ADR-AI-005.

---

### US-AI-002 — Aceptar, editar o descartar sugerencia IA

**Epic:** AI-Assisted Planning · **Prioridad:** Must Have

**Como** organizador,
**quiero** revisar la sugerencia IA y decidir aceptarla, editarla o descartarla,
**para** mantener el control sobre los datos oficiales del evento.

**Criterios de aceptación:**
- UI distingue visualmente contenido IA pendiente vs aceptado.
- Estados del `AIRecommendation`: `pending` → `accepted` / `edited` / `rejected` / `discarded`.
- Cambios aceptados se reflejan en checklist, presupuesto o categorías sugeridas según el tipo.

**Fuentes:** `/docs/17`, `/docs/15`, AI Features.

---

### US-AI-003 — Resumir comparación de cotizaciones con IA

**Epic:** AI-Assisted Planning · **Prioridad:** Should Have

**Como** organizador,
**quiero** obtener un resumen IA opcional al comparar cotizaciones recibidas,
**para** acelerar la toma de decisiones sin alterar las cotizaciones originales.

**Criterios de aceptación:**
- El resumen IA es opcional y se persiste como `AIRecommendation` independiente.
- No modifica `Quote` ni `QuoteRequest` originales.
- La UX deja claro que es asistencia, no decisión.

**Fuentes:** `/docs/17`, `/docs/16`.

---

## Épica 4 — Directorio y perfil de proveedor

### US-VENDOR-001 — Explorar directorio de proveedores aprobados

**Epic:** Vendor Directory & Vendor Profile · **Prioridad:** Must Have

**Como** organizador,
**quiero** filtrar proveedores aprobados por categoría, ciudad y rango de precio,
**para** elegir candidatos relevantes para mi evento.

**Criterios de aceptación:**
- Solo se listan `VendorProfile.status = approved`.
- Soporta paginación y orden estable.
- Las páginas públicas SEO-ready están preparadas en la arquitectura frontend (ADR-FE-004) aunque no sean obligatorias en MVP.

**Fuentes:** FRD, `/docs/15`, `/docs/16`.

---

### US-VENDOR-002 — Mantener mi perfil de proveedor

**Epic:** Vendor Directory & Vendor Profile · **Prioridad:** Must Have

**Como** proveedor,
**quiero** editar mi perfil, servicios y portafolio,
**para** atraer organizadores y recibir solicitudes pertinentes.

**Criterios de aceptación:**
- El portafolio acepta hasta 10 imágenes por trabajo/evento exhibido.
- Cambios sensibles de categoría se limitan y pueden disparar `requires_admin_review`.
- Solo el proveedor edita su propio perfil (ownership).

**Fuentes:** FRD, Business Rules, `/docs/14`.

---

## Épica 5 — Flujo de cotización

### US-QUOTE-001 — Enviar solicitud de cotización

**Epic:** Quote Flow · **Prioridad:** Must Have

**Como** organizador,
**quiero** enviar una `QuoteRequest` con brief estructurado a un proveedor aprobado,
**para** recibir una cotización comparable.

**Criterios de aceptación:**
- Máximo 5 `QuoteRequest` activas por categoría y evento.
- Una sola activa por `(evento, proveedor)`; intento duplicado → `409 CONFLICT`.
- El brief puede ser generado por IA (`aiGeneratedBrief=true`) y editado.

**Fuentes:** FRD, Business Rules, `/docs/16`, AI Features.

---

### US-QUOTE-002 — Responder cotización como proveedor

**Epic:** Quote Flow · **Prioridad:** Must Have

**Como** proveedor,
**quiero** responder a `QuoteRequest` con `Quote` (total, desglose, condiciones, validez),
**para** competir por el evento con información clara.

**Criterios de aceptación:**
- El proveedor solo ve `QuoteRequest` dirigidas a su perfil (assignment-based access).
- `Quote.valid_until` por defecto a 15 días calendario si no se define.
- Una `Quote` enviada no vuelve a `draft`.
- El proveedor recibe notificación si su cotización es rechazada o expira.

**Fuentes:** FRD, Business Rules, `/docs/16`, `/docs/19`.

---

### US-QUOTE-003 — Comparar cotizaciones lado a lado

**Epic:** Quote Flow · **Prioridad:** Must Have

**Como** organizador,
**quiero** comparar las cotizaciones recibidas y marcar una como preferida,
**para** decidir con qué proveedor avanzar.

**Criterios de aceptación:**
- Vista responsive de comparación.
- `Quote.is_preferred` puede marcarse solo una a la vez por categoría.
- La aceptación/rechazo dispara notificación al proveedor.

**Fuentes:** FRD, `/docs/15`, `/docs/16`.

---

## Épica 6 — Booking simulado y reseñas

### US-BOOK-001 — Crear `BookingIntent` simulado

**Epic:** Booking Intent & Reviews · **Prioridad:** Must Have

**Como** organizador,
**quiero** marcar una cotización aceptada como `BookingIntent`,
**para** registrar la intención de reserva sin pago ni contrato.

**Criterios de aceptación:**
- Requiere confirmación del proveedor para transicionar a `confirmed`.
- Puede cancelarse incluso si está confirmado, con motivo registrado.
- La UI muestra disclaimer claro de "simulado, sin pago ni contrato".

**Fuentes:** FRD, Business Rules, `/docs/15`.

---

### US-REVIEW-001 — Dejar reseña verificada

**Epic:** Booking Intent & Reviews · **Prioridad:** Must Have

**Como** organizador,
**quiero** dejar una reseña 1–5 estrellas con comentario después del evento,
**para** ayudar a otros organizadores a decidir.

**Criterios de aceptación:**
- Solo permitido si existe `BookingIntent.confirmed` para ese `(evento, proveedor)`.
- Una sola reseña por `(evento, proveedor)`.
- Rating entero entre 1 y 5.
- Las reseñas pasan por moderación manual con soft delete cuando aplica.

**Fuentes:** Business Rules, `/docs/19`, FRD.

---

## Épica 7 — Gobernanza administrativa

### US-ADMIN-001 — Aprobar o rechazar proveedores

**Epic:** Admin Governance · **Prioridad:** Must Have

**Como** administrador,
**quiero** aprobar o rechazar proveedores en estado `pending`,
**para** mantener la calidad del directorio.

**Criterios de aceptación:**
- Toda acción queda registrada en `AdminAction` con motivo.
- Aprobado o rechazado dispara notificación al proveedor.
- Las acciones son auditables y append-only.

**Fuentes:** `/docs/19`, FRD, Business Rules.

---

### US-ADMIN-002 — Moderar reseñas

**Epic:** Admin Governance · **Prioridad:** Must Have

**Como** administrador,
**quiero** ocultar reseñas que violan políticas,
**para** preservar confianza en la plataforma.

**Criterios de aceptación:**
- Soft delete con motivo obligatorio.
- Trazabilidad por `moderated_by`, `moderated_at`, `moderation_reason` y `AdminAction`.

**Fuentes:** Business Rules, `/docs/19`.

---

### US-ADMIN-003 — Gestionar catálogo de categorías

**Epic:** Admin Governance · **Prioridad:** Must Have

**Como** administrador,
**quiero** crear, editar y desactivar `ServiceCategory` (máx 2 niveles),
**para** mantener un catálogo curado y coherente.

**Criterios de aceptación:**
- Soft delete preferente cuando hay dependencias.
- Cambios registrados en `AdminAction`.

**Fuentes:** Business Rules, `/docs/14`.

---

## Épica 8 — Seed, demo y operación

### US-SEED-001 — Resetear datos de demo

**Epic:** Seed & Demo Readiness · **Prioridad:** Should Have

**Como** administrador / operador,
**quiero** ejecutar un reset surgical (`DELETE WHERE is_seed = true`) y volver a sembrar datos demo,
**para** garantizar demos reproducibles.

**Criterios de aceptación:**
- Endpoint protegido (`POST /admin/seed/reset`) con token operativo.
- Idempotente: dos ejecuciones consecutivas dejan el sistema en el mismo estado.
- No afecta filas con `is_seed=false`.

**Fuentes:** `/docs/11`, `/docs/14`, `/docs/21`.

---

### US-DEMO-001 — Operar en modo demo sin OpenAI

**Epic:** Seed & Demo Readiness · **Prioridad:** Should Have

**Como** evaluador académico,
**quiero** ejecutar el sistema con `LLM_PROVIDER=mock`,
**para** revisar flujos IA sin depender de OpenAI ni de costos externos.

**Criterios de aceptación:**
- `MockAIProvider` retorna salidas deterministas alineadas con los schemas Zod.
- La UI no distingue el modo demo en datos del dominio, pero los logs sí registran `fallback_used` o `provider=mock`.

**Fuentes:** `/docs/17`, `/docs/21`, ADR-AI-003.

---

## Épica 9 — Seguridad y autorización (transversal)

### US-SEC-001 — Aplicar RBAC + ownership en todos los endpoints

**Epic:** Security & Authorization · **Prioridad:** Must Have

**Como** equipo de plataforma,
**queremos** que cada endpoint protegido valide rol y ownership/assignment en backend,
**para** evitar elevación de privilegios.

**Criterios de aceptación:**
- Tests negativos cubren intentos de acceder a recursos ajenos (organizador → evento ajeno, proveedor → request ajena, admin → operaciones que requieren razón).
- Frontend solo provee UX guards; no es fuente de verdad.

**Fuentes:** `/docs/19`, `/docs/5`, ADR-SEC-003.

---

### US-SEC-002 — Mitigar prompt injection y minimizar datos al LLM

**Epic:** Security & Authorization · **Prioridad:** Must Have

**Como** equipo IA,
**queremos** minimizar el payload enviado al LLM y aplicar mitigaciones de prompt injection,
**para** evitar fugas o salidas no controladas.

**Criterios de aceptación:**
- Solo se envían los campos necesarios para la feature IA específica.
- Logs redactan datos sensibles.
- Schemas de salida con validación estricta JSON (Zod); reintentos acotados.

**Fuentes:** `/docs/17`, `/docs/19`, ADR-SEC-001.

---

## Épica 10 — Testing y calidad

### US-TEST-001 — Tests deterministas de IA con `MockAIProvider`

**Epic:** Testing & Quality · **Prioridad:** Must Have

**Como** equipo QA,
**queremos** ejecutar los tests de IA con `MockAIProvider`,
**para** que CI sea reproducible y no dependa de OpenAI.

**Criterios de aceptación:**
- CI corre con `LLM_PROVIDER=mock`.
- Cobertura cubre `pending` → `accepted` / `edited` / `rejected` / `discarded`.

**Fuentes:** `/docs/20`, ADR-TEST-003.

---

### US-TEST-002 — Tests negativos de autorización como quality gate

**Epic:** Testing & Quality · **Prioridad:** Must Have

**Como** equipo de plataforma,
**queremos** que el pipeline rechace cambios sin tests negativos de autorización,
**para** prevenir regresiones de seguridad.

**Criterios de aceptación:**
- Suites cubren RBAC, ownership y assignment con respuestas 401/403/404 esperadas.
- CI bloquea el merge si fallan.

**Fuentes:** `/docs/20`, ADR-TEST-004.

---

## Documentos fuente

- [Functional Requirements Document](../docs/9-Functional-Requirements-Document.md)
- [Use Cases Specification](../docs/8-Use-Cases-Specification.md)
- [Business Rules Document](../docs/4-Business-Rules-Document.md)
- [User Roles & Permissions Matrix](../docs/5-User-Roles-Permissions-Matrix.md)
- [AI Features Specification](../docs/7-AI-Features-Specification.md)
- [AI Architecture & PromptOps Design](../docs/17-AI-Architecture-and-PromptOps-Design.md)
- [Security & Authorization Design](../docs/19-Security-and-Authorization-Design.md)
- [Testing Strategy](../docs/20-Testing-Strategy.md)
- [Deployment & DevOps Design](../docs/21-Deployment-and-DevOps-Design.md)
