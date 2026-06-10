# EventFlow — Functional Requirements Document (FRD)

> **Versión:** 1.0
> **Fecha:** 2026-06-08
> **Producto:** EventFlow — plataforma asistida por IA para planificación de eventos y gestión simplificada de proveedores
> **MVP target:** AI-assisted event planning workspace + simplified vendor quote flow
> **Idioma del documento:** Español LATAM
> **Estado:** Listo para uso en User Stories, Acceptance Criteria, QA Scenarios y Development Tasks

---

## 1. Propósito del documento

Este Functional Requirements Document (FRD) define **qué debe hacer** el sistema EventFlow desde una perspectiva funcional para soportar su MVP. Su objetivo es:

- Consolidar, formalizar y trazabilizar los requerimientos funcionales del producto.
- Servir como fuente única de verdad funcional para el Product Owner, Business Analyst, equipos de desarrollo, QA, UX/UI, agentes IA generadores de tareas, historias y casos de prueba, revisores académicos y evaluadores de portafolio.
- Garantizar que los requerimientos derivan de la documentación previa y no de supuestos genéricos de SaaS, marketplace o productos de IA.
- Reflejar fielmente las 19 decisiones del Product Owner consolidadas en `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`.
- Mantener el MVP dentro del alcance acordado: **workspace de planificación asistido por IA + flujo simplificado de cotización de proveedores**. No es un marketplace transaccional.

---

## 2. Alcance del documento

Este FRD cubre:

- Requerimientos funcionales del MVP por módulo.
- Roles funcionales del sistema (Organizador, Proveedor, Administrador, Sistema).
- Comportamiento esperado del sistema, validaciones y reglas críticas.
- Requerimientos funcionales de IA con validación humana obligatoria.
- Trazabilidad uno-a-uno con reglas de negocio, permisos, entidades del modelo de datos, features IA y casos de uso.
- Matriz de restricciones MVP frente a capacidades comúnmente sobre-incluidas.
- Criterios de aceptación funcional por módulo.
- Escenarios funcionales principales y escenarios de demo.
- Requerimientos futuros, fuera de alcance y dependientes de decisión PO.

**Fuera del alcance del FRD:**

- Diseño visual detallado, wireframes y mockups (responsabilidad de UX/UI).
- Especificaciones técnicas de implementación, schemas SQL concretos, contratos REST/GraphQL (responsabilidad del Technical Design / API Spec).
- Requerimientos no funcionales completos (rendimiento, seguridad, accesibilidad detallada — se incluyen solo notas de alto nivel).
- Plan de iteraciones, sprints y estimaciones (responsabilidad del Plan de Proyecto).

---

## 3. Fuentes utilizadas

| # | Documento | Uso |
|---:|---|---|
| 1 | `/docs/1-Domain-Discovery-Report.md` | Contexto de dominio, problema, segmento, diferenciador. |
| 2 | `/docs/2-Product-Owner-Decisions.md` | Decisiones canónicas iniciales del Product Owner. |
| 3 | `/docs/3-MVP-Scope-Definition.md` | Alcance MVP, exclusiones, roadmap. |
| 4 | `/docs/4-Business-Rules-Document.md` | Reglas de negocio (BR-AUTH/USER/EVENT/.../OOS). |
| 5 | `/docs/5-User-Roles-Permissions-Matrix.md` | Roles, permisos por módulo y entidad, comportamiento del sistema (§17.bis). |
| 6 | `/docs/6-Domain-Data-Model.md` | Entidades, enums, constraints C-001..C-062. |
| 7 | `/docs/7-AI-Features-Specification.md` | Features IA, interface `LLMProvider`, timeout, fallback. |
| 8 | `/docs/8-Use-Cases-Specification.md` | Casos de uso UC-AUTH/EVENT/AI/.../ADMIN. |
| 8.1 | `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md` | 19 decisiones canónicas del Product Owner (fuente de verdad). |
| 8.2 | `/docs/8.2-Documentation-Alignment-Review-Before-FRD.md` | Revisión de alineación previa al FRD; mapa de impactos. |

---

## 4. Principios funcionales del MVP

1. **Workspace primero, marketplace después.** Toda funcionalidad debe ayudar al organizador a planificar y cotizar; no a transaccionar.
2. **IA asiste, no decide.** Toda salida IA es sugerencia validable por el humano antes de convertirse en dato oficial.
3. **Simular antes que integrar.** Email, notificaciones externas, pagos y reservas operan como simulaciones controladas (logs, in-app, intent simulado).
4. **Seed reproducible.** El MVP debe ser demostrable end-to-end con datos seed.
5. **Trazabilidad.** Todo requerimiento funcional debe poder rastrearse a una regla de negocio, permiso, caso de uso, entidad o feature IA.
6. **Demostrable sobre completo.** Ante duda entre profundidad y demostrabilidad, prevalece la demostrabilidad.
7. **Sin pagos, sin contratos firmados, sin chat real-time, sin app nativa, sin WhatsApp.** Esto es contractual y no negociable en MVP.
8. **Multi-idioma desde el día uno.** es-LATAM, es-ES, pt, en — con inglés como requerimiento obligatorio.
9. **Moneda configurable por evento; sin conversión automática.**
10. **Captcha/anti-bot obligatorio en autenticación.**

---

## 5. Metodología de extracción de requerimientos

El FRD se construyó siguiendo el flujo:

```text
Leer → Extraer → Clasificar → Validar restricciones MVP → Especificar → Trazar
```

**Tipos de origen del requerimiento (Source type):**

- **Explícito:** Directamente declarado en uno o más documentos fuente.
- **Derivado:** Implicado lógicamente por una regla, permiso, entidad, caso de uso o feature IA documentada.
- **Asunción:** Necesario para coherencia funcional pero no especificado explícitamente (declarado en supuestos).
- **Recomendado:** Buena práctica sugerida; no es obligatorio en MVP salvo justificación explícita.

**Alcance (Scope):**

- **MVP:** Forma parte del MVP funcional.
- **Future:** Diferido a versiones posteriores.
- **Out of Scope:** Explícitamente excluido.
- **Requires Product Owner Decision:** No resuelto; requiere decisión adicional del PO.

**Prioridad:**

- **Must Have / Should Have / Could Have / Future / Out of Scope**

**Formato de ID:** `FR-[DOMAIN]-[NUMBER]` (ej. `FR-AUTH-001`).

---

## 6. Functional Requirements Extraction from Source Documents

Esta sección lista los requerimientos candidatos extraídos directamente de la documentación fuente, antes de su consolidación final como requerimientos numerados.

| Candidate Requirement | Module | Found in source document | Evidence / context | Classification | MVP decision |
|---|---|---|---|---|---|
| Registro de usuario con email + password | AUTH | Doc 3 §7.1; Doc 4 BR-AUTH-001/002; Doc 8 UC-AUTH-001 | Wizard registro define rol y minimal data; BR-AUTH-001 obliga autenticación previa. | Explícito | MVP |
| Captcha y anti-bot en registro/login | AUTH | Doc 4 BR-AUTH-011; Doc 6 C-059; Doc 8 UC-AUTH-001/002; Addendum 8.1 #8 | Decisión PO 8.1 #8: obligatorio en MVP. | Explícito | MVP |
| Asignación de rol en registro (organizer/vendor) | AUTH | Doc 4 BR-AUTH-002; Doc 5 §5.1/5.2 | Organizer y vendor se registran; admin solo por seed. | Explícito | MVP |
| Login con email + password persistente | AUTH | Doc 3 §7.1; Doc 4 BR-AUTH-001/003; Doc 8 UC-AUTH-002 | Sesión persistente. | Explícito | MVP |
| Logout explícito | AUTH | Doc 4 BR-AUTH-003 | Sesión hasta logout o expiración. | Derivado | MVP |
| Recuperación de contraseña vía email | AUTH | Doc 3 §7.1; Doc 4 BR-AUTH-004 | Link simulado o real según infra. | Explícito | MVP |
| OAuth Google | AUTH | Doc 3 §7.1 | "Could Have" en MVP scope. | Explícito | MVP (Could Have) |
| Control de acceso por rol y aislamiento de datos | AUTH | Doc 4 BR-AUTH-005/009/010; Doc 5 §5 | Single-role en MVP; aislamiento por rol. | Explícito | MVP |
| Ver y editar perfil propio | USER | Doc 4 BR-USER-001; Doc 5 §5.1; Doc 8 UC-AUTH-005/006 | Perfil mínimo: email, nombre, teléfono opcional. | Explícito | MVP |
| Idioma preferido del usuario | USER | Doc 4 BR-USER-006; Doc 6 LanguageCode | 4 idiomas: es-LATAM, es-ES, pt, en. | Explícito | MVP |
| Crear evento (wizard) | EVENT | Doc 3 §7.2; Doc 4 BR-EVENT-001/003; Doc 8 UC-EVENT-001 | 6 tipos de evento, fecha, invitados, ciudad, moneda, idioma. | Explícito | MVP |
| Editar evento propio | EVENT | Doc 4 BR-EVENT-002; Doc 8 UC-EVENT-002 | Solo el owner edita. | Explícito | MVP |
| Cancelar evento | EVENT | Doc 3 §7.2; Doc 4 BR-EVENT-005/010 | Lifecycle `draft → active → completed | cancelled`. | Explícito | MVP |
| Ver listado de eventos propios con filtros | EVENT | Doc 3 §7.2; Doc 8 UC-EVENT-003 | Filtros básicos por estado y tipo. | Explícito | MVP |
| Dashboard del evento con progreso, tareas y cotizaciones | EVENT | Doc 3 §7.2; Doc 4 BR-EVENT-009; Doc 8 UC-EVENT-004 | Indicadores agregados. | Explícito | MVP |
| Moneda inmutable tras creación; local o USD | EVENT/BUDGET | Doc 4 BR-EVENT-007, BR-BUDGET-006; Doc 6 C-006; Doc 8 UC-EVENT-001, UC-BUDGET-004; Addendum 8.1 #7 | Decisión PO 8.1 #7. | Explícito | MVP |
| Cierre automático del evento 2 días después de event_date | EVENT | Doc 4 BR-EVENT-013; Doc 6 C-048/C-056; Doc 8 UC-EVENT-005; Addendum 8.1 #6 | Job programado; `auto_completed=true`. | Explícito | MVP |
| Admin lista eventos en solo lectura | EVENT/ADMIN | Doc 4 BR-EVENT-014; Doc 8 UC-ADMIN-002; Addendum 8.1 #16 | Acceso a detalle registra `view_event` en AdminAction. | Explícito | MVP |
| Generar plan IA del evento | AI | Doc 3 §7.3; Doc 4 BR-AI-001..009; Doc 7 AI-001; Doc 8 UC-AI-001 | Timeline + categorías sugeridas. | Explícito | MVP |
| Generar checklist IA | AI/TASK | Doc 3 §7.4; Doc 7 AI-002; Doc 8 UC-AI-002 | Tareas con fechas relativas. | Explícito | MVP |
| Sugerencia IA de distribución de presupuesto | AI/BUDGET | Doc 3 §7.5; Doc 7 AI-003; Doc 8 UC-AI-003 | Distribución por categoría. | Explícito | MVP |
| Recomendación IA de categorías de proveedor | AI | Doc 7 AI-004; Doc 8 UC-AI-004 | Lista priorizada. | Explícito | MVP |
| Generación IA de brief de cotización | AI/QUOTE | Doc 7 AI-005; Doc 8 UC-AI-005 | Brief estructurado autocompletado. | Explícito | MVP |
| Resumen IA del comparador de cotizaciones | AI/QUOTE | Doc 3 §7.10; Doc 7 AI-006; Doc 8 UC-AI-006 | Should Have. | Explícito | MVP (Should Have) |
| Generación IA de bio/paquetes del proveedor | AI/VENDOR | Doc 3 §7.7; Doc 7 AI-007; Doc 8 UC-AI-007 | Could Have. | Explícito | MVP (Could Have) |
| Priorización IA de tareas urgentes | AI/TASK | Doc 7 AI-008; Doc 8 UC-AI-008 | Top tareas, lectura asistida. | Explícito | MVP (Should Have) |
| Validación humana obligatoria de salidas IA | AI | Doc 3 §8.3; Doc 4 BR-AI-001..003; Doc 7 §22 | `AIRecommendation.accepted` default false. | Explícito | MVP |
| Capa de abstracción `LLMProvider` con OpenAI y Mock; Anthropic stub | AI | Doc 3 §8.4; Doc 4 BR-AI-005; Doc 7 §20; Addendum 8.1 #15 | Decisión PO 8.1 #15. | Explícito | MVP |
| Timeout IA 1 minuto + fallback controlado | AI | Doc 4 BR-AI-009; Doc 7 §22; Addendum 8.1 #9 | Decisión PO 8.1 #9. | Explícito | MVP |
| Trazabilidad IA: `AIRecommendation` con prompt versionado y output | AI | Doc 4 BR-AI-007/010; Doc 6 C-031..C-035 | Auditoría completa. | Explícito | MVP |
| Crear tarea manual | TASK | Doc 4 BR-TASK-002; Doc 8 UC-TASK-001 | Origen manual vs IA distinguido. | Explícito | MVP |
| Editar/eliminar tarea | TASK | Doc 4 BR-TASK-005; Doc 8 UC-TASK-002 | Individual o en bloque. | Explícito | MVP |
| Cambiar estado de tarea | TASK | Doc 4 BR-TASK-004; Doc 6 C-027; Doc 8 UC-TASK-003 | `pending → in_progress → done | skipped`. | Explícito | MVP |
| Confirmar tareas IA generadas | TASK | Doc 4 BR-TASK-003; Doc 8 UC-TASK-004 | Confirmación individual o bulk. | Explícito | MVP |
| Filtrar tareas por estado y rango temporal | TASK | Doc 4 BR-TASK-007; Doc 8 UC-TASK-005 | Should Have. | Explícito | MVP (Should Have) |
| Progreso del evento desde tareas | TASK | Doc 4 BR-TASK-009 | %done / %total. | Derivado | MVP |
| Crear/editar presupuesto y BudgetItem | BUDGET | Doc 4 BR-BUDGET-001..009; Doc 8 UC-BUDGET-001..003 | Por categoría con planned/committed. | Explícito | MVP |
| Cálculo en vivo de committed y warning si excede planned | BUDGET | Doc 4 BR-BUDGET-003/004 | Warning visual no bloqueante. | Explícito | MVP |
| Selección de moneda en wizard (local o USD) | BUDGET | Doc 4 BR-BUDGET-006; Doc 8 UC-EVENT-001/UC-BUDGET-004; Addendum 8.1 #7 | Decisión PO 8.1 #7. | Explícito | MVP |
| Sin conversión automática de moneda | BUDGET | Doc 4 BR-BUDGET-007 | Mostrar moneda configurada. | Explícito | MVP |
| Crear/editar perfil de proveedor | VENDOR | Doc 4 BR-VENDOR-001..004; Doc 8 UC-VENDOR-001/002 | Sujeto a aprobación admin. | Explícito | MVP |
| Cambios de categoría del proveedor (máx 5) y revisión admin | VENDOR | Doc 4 BR-VENDOR-004; Doc 6 C-011; Doc 8 UC-VENDOR-002; Addendum 8.1 #3 | Decisión PO 8.1 #3. | Explícito | MVP |
| Portafolio del proveedor: hasta 10 imágenes por trabajo | VENDOR | Doc 4 BR-VENDOR-005; Doc 6 C-038; Doc 8 UC-VENDOR-005; Addendum 8.1 #2 | Decisión PO 8.1 #2; `vendor_work` con `work_label`. | Explícito | MVP |
| Aprobación admin del perfil | VENDOR/ADMIN | Doc 4 BR-VENDOR-003, BR-ADMIN-001; Doc 8 UC-VENDOR-003/UC-ADMIN-004 | `pending → approved | rejected`. | Explícito | MVP |
| Soft delete obligatorio de attachments | VENDOR | Doc 4 BR-PRIVACY-011; Doc 6 C-037; Doc 8 UC-VENDOR-005; Addendum 8.1 #19 | Decisión PO 8.1 #19. | Explícito | MVP |
| Directorio público de proveedores aprobados | VENDOR | Doc 3 §7.6; Doc 4 BR-VENDOR-001; Doc 8 UC-VENDOR-006 | Filtros por categoría, ciudad, precio. | Explícito | MVP |
| Respuesta del proveedor a reseñas | REVIEW/VENDOR | Doc 4 BR-REVIEW-008; Doc 8 UC-VENDOR-008; Addendum 8.1 #14 | Decisión PO 8.1 #14: Future. | Explícito | Future |
| CRUD admin de categorías de servicio | SERVICE/ADMIN | Doc 4 BR-SERVICE-003, BR-ADMIN-002; Doc 8 UC-ADMIN-007 | Solo admin. | Explícito | MVP |
| Jerarquía de categorías máx 2 niveles | SERVICE | Doc 4 BR-SERVICE-005, BR-ADMIN-012; Doc 6 C-013; Addendum 8.1 #18 | Decisión PO 8.1 #18. | Explícito | MVP |
| Crear QuoteRequest | QUOTE | Doc 4 BR-QUOTE-001..004; Doc 8 UC-QUOTE-001 | Brief autocompletado. | Explícito | MVP |
| Máximo 5 QuoteRequest activas por categoría por evento | QUOTE | Doc 4 BR-QUOTE-009; Doc 6 C-016; Doc 8 UC-QUOTE-001; Addendum 8.1 #12 | Decisión PO 8.1 #12. | Explícito | MVP |
| Vendor responde a QuoteRequest | QUOTE | Doc 4 BR-QUOTE-011..014; Doc 8 UC-QUOTE-004 | `draft → sent → accepted | rejected | expired`. | Explícito | MVP |
| Validez default de Quote = 15 días calendario | QUOTE | Doc 4 BR-QUOTE-015; Doc 6 C-019; Doc 8 UC-QUOTE-004; Addendum 8.1 #4 | Decisión PO 8.1 #4. | Explícito | MVP |
| Comparación de Quotes y marcar preferred | QUOTE | Doc 4 BR-QUOTE-021/022; Doc 8 UC-QUOTE-006/007 | Vista side-by-side. | Explícito | MVP |
| Notificación al proveedor por Quote rechazada/expirada | QUOTE/NOTIF | Doc 4 BR-NOTIF-002; Doc 6 enum NotificationType; Doc 8 UC-QUOTE-009/010; Addendum 8.1 #13 | Decisión PO 8.1 #13. | Explícito | MVP |
| Crear BookingIntent simulado desde Quote vigente | BOOKING | Doc 4 BR-BOOKING-001..003; Doc 8 UC-BOOKING-001 | Sin pago real. | Explícito | MVP |
| Confirmación del proveedor a BookingIntent | BOOKING | Doc 4 BR-BOOKING-002; Doc 8 UC-BOOKING-002 | `pending → confirmed_intent`. | Explícito | MVP |
| Cancelar BookingIntent (incluido confirmed_intent) sin penalización en plataforma | BOOKING | Doc 4 BR-BOOKING-009; Doc 6 C-056; Doc 8 UC-BOOKING-003; Addendum 8.1 #5 | Decisión PO 8.1 #5. | Explícito | MVP |
| Crear reseña verificada (escala 1–5) | REVIEW | Doc 4 BR-REVIEW-001..003; Doc 6 C-024; Doc 8 UC-REVIEW-001; Addendum 8.1 #1 | Solo organizador con BookingIntent confirmado. Escala 1–5 (5=mejor). | Explícito | MVP |
| Moderación admin con soft delete y auditoría | REVIEW/ADMIN | Doc 4 BR-REVIEW-005, BR-ADMIN-011; Doc 6 C-057; Doc 8 UC-REVIEW-003; Addendum 8.1 #11 | Decisión PO 8.1 #11; status removed/hidden con AdminAction. | Explícito | MVP |
| Notificación in-app por eventos del sistema | NOTIF | Doc 4 BR-NOTIF-001..005; Doc 8 UC-NOTIF-001/002 | Quote creada, Quote respondida, booking confirmado, T-7, etc. | Explícito | MVP |
| Email simulado vía log estructurado | NOTIF | Doc 4 BR-NOTIF-003 | Sin SMTP real obligatorio. | Explícito | MVP |
| Soporte i18n es-LATAM, es-ES, pt, en | I18N | Doc 3 §7.15; Doc 4 BR-USER-006, BR-EVENT-008; Doc 8 UC-I18N-001 | 4 idiomas. | Explícito | MVP |
| Selector de idioma por usuario y por evento | I18N | Doc 3 §7.15; Doc 8 UC-I18N-001/002 | Idioma del evento dirige llamadas IA. | Explícito | MVP |
| Panel admin con métricas operativas/gobernanza | ADMIN | Doc 4 BR-ADMIN-005; Doc 8 UC-ADMIN-002; Addendum 8.1 #10 | Sin métricas comerciales reales. | Explícito | MVP |
| Aprobar/rechazar/ocultar proveedores | ADMIN | Doc 4 BR-ADMIN-001; Doc 8 UC-ADMIN-004/005 | Cambio de estado registrado en AdminAction. | Explícito | MVP |
| Gestión controlada de EventType (sin hard delete con eventos) | ADMIN | Doc 4 BR-EVENTTYPE-007; Doc 6 C-026c; Doc 8 UC-ADMIN-007; Addendum 8.1 #17 | Decisión PO 8.1 #17. | Explícito | MVP |
| Log inmutable de acciones admin (AdminAction) | ADMIN | Doc 4 BR-ADMIN-004; Doc 6 C-040/C-041 | Auditoría obligatoria. | Explícito | MVP |
| Seed reproducible de usuarios, eventos, proveedores, cotizaciones, reseñas | SEED | Doc 3 §7.16; Doc 4 BR-SEED-001..010; Doc 8 UC-DEMO-001 | Script único. | Explícito | MVP |
| WhatsApp / push / SMS | NOTIF | Doc 3 §9; Doc 4 BR-NOTIF-006/007 | Excluido. | Explícito | Out of Scope |
| Pagos reales / comisión / contratos firmados | BOOKING | Doc 3 §9; Doc 4 BR-BOOKING-004/005 | Excluido. | Explícito | Out of Scope |
| App nativa móvil | — | Doc 3 §9 | Excluido. | Explícito | Out of Scope |
| Chat en tiempo real | — | Doc 3 §9 | Excluido. | Explícito | Out of Scope |
| Moderación automática IA | REVIEW/AI | Doc 4 BR-REVIEW-006 | Manual por admin. | Explícito | Future |
| Análisis de sentimiento IA | AI | Doc 3 §8.2 | Diferido. | Explícito | Future |
| Multi-colaboradores por evento | EVENT | Doc 3 §9; Doc 4 BR-USER-004 | Diferido a v1.1. | Explícito | Future |
| RSVP / lista de invitados / plano de mesas | EVENT | Doc 3 §9 | Excluido. | Explícito | Out of Scope |
| Integración con calendarios externos (Google/Outlook/Apple) | — | Doc 3 §9 | Excluido. | Explícito | Future/Out of Scope |
| Conversión automática de moneda | BUDGET | Doc 3 §9; Doc 4 BR-BUDGET-007 | Excluido. | Explícito | Out of Scope |
| AnthropicProvider funcional | AI | Doc 4 BR-AI-005; Doc 7 §20; Addendum 8.1 #15 | Stub/Future. | Explícito | Future |

---

## 7. Validación de decisiones actualizadas del Product Owner

Las 19 decisiones del addendum `8.1` se reflejan en este FRD así:

| Decision ID | Product Owner decision | Reflected in FRD? | Related requirements | Notes |
|---|---|---|---|---|
| 1 | Escala de rating 1–5 (5 = mejor) | Sí | FR-REVIEW-002 | Validado en escala y validación de rango. |
| 2 | Hasta 10 imágenes por trabajo en portafolio | Sí | FR-VENDOR-006, FR-VENDOR-007 | Soporta `vendor_work` con `work_label`. |
| 3 | Máx 5 cambios de categoría con revisión admin | Sí | FR-VENDOR-004, FR-VENDOR-005 | `category_change_count <= 5`. |
| 4 | Validez default de Quote = 15 días calendario | Sí | FR-QUOTE-005 | Aplicado si vendor no especifica `valid_until`. |
| 5 | Cancelación de BookingIntent confirmado sin penalización en plataforma | Sí | FR-BOOKING-004 | Aplica a `pending` y `confirmed_intent`. |
| 6 | Cierre automático del evento 2 días post event_date | Sí | FR-EVENT-009 | Job programado; `auto_completed=true`. |
| 7 | Moneda inmutable; local o USD | Sí | FR-EVENT-003, FR-BUDGET-002 | Wizard ofrece dos opciones; cambios post-creación bloqueados. |
| 8 | Captcha / anti-bot en registro y login | Sí | FR-AUTH-002 | Tecnología (reCAPTCHA/hCaptcha) a definir en implementación. |
| 9 | Timeout IA = 1 minuto + fallback controlado | Sí | FR-AI-009 | `timeout_ms` default 60000. |
| 10 | Métricas admin operativas (sin métricas comerciales) | Sí | FR-ADMIN-005 | Foco en actividad, gobernanza, IA, cotizaciones, demo readiness. |
| 11 | Soft delete + auditoría de reseñas eliminadas | Sí | FR-REVIEW-004 | `Review.status = removed/hidden`; registro en AdminAction. |
| 12 | Máx 5 QuoteRequest activas por categoría por evento | Sí | FR-QUOTE-002 | Estados que cuentan: sent/viewed/responded/preferred. |
| 13 | Notificación al proveedor por Quote rechazada/expirada | Sí | FR-NOTIF-004, FR-QUOTE-009, FR-QUOTE-010 | In-app obligatoria; email simulado. |
| 14 | Respuesta del proveedor a reseñas | Sí | FR-FUTURE-005 | Excluida del MVP; marcada como Future. |
| 15 | AnthropicProvider stub/futuro | Sí | FR-AI-006, FR-FUTURE-007 | Interfaz preparada; OpenAI y Mock funcionales. |
| 16 | Admin lista eventos en solo lectura | Sí | FR-EVENT-010, FR-ADMIN-002 | Acceso a detalle registra `view_event`. |
| 17 | Admin gestiona EventType controlado (sin hard delete con eventos asociados) | Sí | FR-ADMIN-007 | Bloqueo de hard delete si hay eventos asociados. |
| 18 | Jerarquía categorías máx 2 niveles | Sí | FR-SERVICE-002 | `depth_level <= 2`. |
| 19 | Soft delete obligatorio para attachments | Sí | FR-VENDOR-008 | Eliminación física por proceso técnico posterior. |

---

## 8. Resumen ejecutivo del FRD

EventFlow MVP es una **aplicación web responsive multilenguaje** que provee a un organizador un workspace asistido por IA para planificar eventos sociales y corporativos, y un flujo simplificado para descubrir proveedores y solicitar/comparar cotizaciones. El producto:

- **Sí incluye:** registro/login con captcha, gestión de eventos por organizador (wizard, dashboard, ciclo de vida con cierre automático), generación IA de plan/checklist/presupuesto/brief/comparación, directorio de proveedores aprobados con portafolio (10 imágenes por trabajo), QuoteRequest con límite de 5 por categoría por evento, Quote con validez default 15 días, BookingIntent simulado (cancelable sin penalización), reseñas verificadas (escala 1–5) con moderación admin (soft delete + auditoría), panel admin con métricas operativas, multi-idioma (es-LATAM/es-ES/pt/en), moneda inmutable por evento (local o USD), notificaciones in-app + email simulado, y datos seed reproducibles.
- **No incluye:** pagos reales, comisiones, contratos firmados, app nativa, WhatsApp, chat en tiempo real, RSVP/mesas, geolocalización avanzada, conversión de moneda, integración con calendarios externos, moderación IA automática ni AnthropicProvider funcional (solo stub).
- **Capa IA:** interfaz `LLMProvider` con `OpenAIProvider` (funcional principal), `MockAIProvider` (obligatorio para demo/tests), `AnthropicProvider` (stub futuro). Timeout 1 minuto con fallback controlado. Toda salida IA requiere validación humana antes de persistirse como dato oficial.
- **Trazabilidad:** cada requerimiento se vincula a casos de uso, reglas de negocio, permisos, entidades y features IA de la documentación previa.

Total aproximado de requerimientos funcionales formales del MVP: ~120 (distribuidos en 15 módulos), más 12 requerimientos Future y 14 Out of Scope.

---

## 9. Descripción funcional del producto

EventFlow ofrece tres experiencias funcionales coordinadas:

1. **Workspace del Organizador.** Un organizador autenticado crea un evento (tipo, fecha, ciudad, invitados, presupuesto estimado, moneda, idioma), genera con IA un plan estructurado (timeline + categorías sugeridas), un checklist con tareas con fechas relativas, una distribución de presupuesto por categoría, y un brief de cotización autocompletado. Puede explorar el directorio de proveedores aprobados, enviar hasta 5 QuoteRequest activas por categoría, comparar Quotes (con resumen IA opcional), crear un BookingIntent simulado y, una vez confirmado, dejar una reseña (1–5).

2. **Portal del Proveedor.** Un proveedor registrado completa su perfil (datos, portafolio con hasta 10 imágenes por trabajo, paquetes/servicios). Tras aprobación admin, aparece en el directorio público. Recibe QuoteRequest dirigidas a su perfil, responde con Quote estructurada (validez default 15 días), confirma BookingIntent simulado y recibe reseñas. No responde a reseñas (Future). Se notifica al proveedor cuando su Quote es rechazada o expirada.

3. **Panel del Administrador.** El administrador aprueba/rechaza proveedores, gestiona categorías de servicio (jerarquía máx 2 niveles), gestiona `EventType` de forma controlada (sin hard delete con eventos asociados), modera reseñas (soft delete + auditoría), lista eventos en solo lectura para soporte/demo, consulta métricas operativas/gobernanza/IA/cotizaciones/demo readiness y revisa el log de `AdminAction`.

4. **Sistema (rol implícito).** El sistema ejecuta enforcement automático: expiración de Quote, expiración de QuoteRequest, cierre automático del evento 2 días después de `event_date`, generación de notificaciones in-app, actualización de `BudgetItem.committed` al confirmarse un BookingIntent, validación del límite de 5 QuoteRequest activas por categoría por evento, aplicación del timeout IA de 1 minuto con fallback a MockAIProvider en modo demo/testing, captcha/anti-bot en autenticación, inmutabilidad de moneda post-creación, soft delete obligatorio de attachments y reseñas, y bloqueo de hard delete de `EventType` con eventos asociados.

---

## 10. Objetivos funcionales del MVP

| # | Objetivo funcional | Cómo se mide |
|---:|---|---|
| 1 | Permitir a un organizador pasar de "idea suelta" a "plan accionable" (timeline + checklist + presupuesto) en menos de 10 minutos | Flujo end-to-end de demo cubre los pasos sin asistencia técnica. |
| 2 | Demostrar el flujo bilateral organizador ↔ proveedor mediante cotización estructurada | Al menos 1 QuoteRequest → Quote → BookingIntent confirmado por escenario de demo. |
| 3 | Demostrar gobernanza mínima del catálogo | Admin aprueba ≥1 proveedor y modera ≥1 reseña. |
| 4 | Soportar 4 idiomas y moneda configurable por evento | Selector de idioma operativo + moneda inmutable validada en wizard. |
| 5 | Asegurar que la IA actúa como copiloto sugerente con validación humana | `AIRecommendation.accepted` requerido antes de persistir entidades reales. |
| 6 | Demostrar resiliencia IA con fallback a MockAIProvider | Toggle de `LLM_PROVIDER` entre `openai` y `mock`. |
| 7 | Cubrir auditoría de acciones admin y moderación | `AdminAction` registrado para cada acción de gobernanza. |
| 8 | Hacer demostrable la plataforma end-to-end con datos seed | Seed reproducible en un solo comando. |

---

## 11. Roles funcionales del sistema

El MVP define **tres roles humanos activos** y **un rol implícito de sistema**:

| Rol | Descripción funcional | Acceso |
|---|---|---|
| **Organizador** | Persona que organiza un evento social o corporativo. | Eventos propios, IA, directorio público, QuoteRequest, Quotes recibidos, BookingIntent, reseñas propias. |
| **Proveedor** | Pyme o freelancer que ofrece servicios para eventos. | Perfil propio, QuoteRequest dirigidos, Quote propias, BookingIntent propios, reseñas recibidas (solo lectura). |
| **Administrador** | Product Owner/equipo interno que gobierna el catálogo y la moderación. | Panel admin: aprobaciones, categorías, EventTypes, moderación, métricas, AdminAction, listado de eventos solo lectura. |
| **Sistema (implícito)** | Procesos automáticos: jobs, validaciones, enforcement. | Comportamiento automático según §17.bis del Permissions Matrix. |

Cada usuario en MVP tiene **un único rol activo** (`organizer | vendor | admin`). Multi-rol queda para el futuro.

---

## 12. Módulos funcionales del MVP

| Módulo | Prefijo de requerimiento | Soportado por |
|---|---|---|
| Autenticación y acceso | FR-AUTH | Doc 4 BR-AUTH; Doc 8 UC-AUTH-001..006 |
| Usuarios y preferencias | FR-USER | Doc 4 BR-USER; Doc 8 UC-AUTH-005/006 |
| Gestión de eventos | FR-EVENT | Doc 4 BR-EVENT; Doc 8 UC-EVENT-001..006 |
| Planificación asistida por IA | FR-AI | Doc 4 BR-AI; Doc 7 §20..§22; Doc 8 UC-AI-001..009 |
| Checklist y tareas | FR-TASK | Doc 4 BR-TASK; Doc 8 UC-TASK-001..006 |
| Presupuesto y moneda | FR-BUDGET | Doc 4 BR-BUDGET; Doc 8 UC-BUDGET-001..004 |
| Proveedores y perfiles | FR-VENDOR | Doc 4 BR-VENDOR; Doc 8 UC-VENDOR-001..008 |
| Servicios y categorías | FR-SERVICE | Doc 4 BR-SERVICE; Doc 8 UC-ADMIN-007 |
| Solicitudes y cotizaciones | FR-QUOTE | Doc 4 BR-QUOTE; Doc 8 UC-QUOTE-001..010 |
| Booking intent simulado | FR-BOOKING | Doc 4 BR-BOOKING; Doc 8 UC-BOOKING-001..003 |
| Reseñas y moderación | FR-REVIEW | Doc 4 BR-REVIEW; Doc 8 UC-REVIEW-001..003 |
| Notificaciones | FR-NOTIF | Doc 4 BR-NOTIF; Doc 8 UC-NOTIF-001/002 |
| Idioma e internacionalización | FR-I18N | Doc 3 §7.15; Doc 8 UC-I18N-001/002 |
| Administración | FR-ADMIN | Doc 4 BR-ADMIN; Doc 8 UC-ADMIN-001..011 |
| Datos seed y demo | FR-SEED, FR-DEMO | Doc 3 §7.16; Doc 4 BR-SEED; Doc 8 UC-DEMO-001 |

---

## 13. Requerimientos funcionales — Autenticación y acceso

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-AUTH-001 | El sistema debe permitir el registro de usuarios con email único, nombre, contraseña y rol (`organizer` o `vendor`). | AUTH | Visitante | Must Have | MVP | Explícito | UC-AUTH-001 | Email único validado contra User.email (C-001). Contraseña con hash seguro (BR-AUTH-001). |
| FR-AUTH-002 | El sistema debe incluir captcha/anti-bot en los formularios de registro y login. | AUTH | Visitante | Must Have | MVP | Explícito | UC-AUTH-001, UC-AUTH-002 | Tecnología (reCAPTCHA v3, hCaptcha o equivalente) definida en implementación. Decisión PO 8.1 #8. |
| FR-AUTH-003 | El sistema debe permitir iniciar sesión con email y contraseña validados. | AUTH | Todos | Must Have | MVP | Explícito | UC-AUTH-002 | BR-AUTH-001. Mensajes de error genéricos para no exponer existencia de cuentas. |
| FR-AUTH-004 | El sistema debe mantener la sesión del usuario hasta logout explícito o expiración configurada. | AUTH | Todos | Must Have | MVP | Explícito | UC-AUTH-002 | BR-AUTH-003. Token/sesión con expiración (C-062). |
| FR-AUTH-005 | El sistema debe permitir cerrar sesión y limpiar credenciales locales. | AUTH | Todos | Must Have | MVP | Derivado | UC-AUTH-002 | BR-AUTH-003. |
| FR-AUTH-006 | El sistema debe permitir la recuperación de contraseña mediante link enviado por email (simulado o real según infraestructura). | AUTH | Visitante | Must Have | MVP | Explícito | UC-AUTH-003 | BR-AUTH-004. Email simulado vía log si SMTP no disponible. |
| FR-AUTH-007 | El sistema debe asignar un único rol activo (`organizer | vendor | admin`) a cada usuario. | AUTH | Sistema | Must Have | MVP | Explícito | UC-AUTH-001 | BR-AUTH-005; C-045. Multi-rol es Future. |
| FR-AUTH-008 | El sistema debe restringir el acceso a rutas y recursos según el rol del usuario autenticado. | AUTH | Sistema | Must Have | MVP | Explícito | UC-AUTH-004 | BR-AUTH-009/010. Devolver 401/403 para accesos no autorizados. |
| FR-AUTH-009 | El sistema debe impedir el acceso al panel admin a usuarios sin rol `admin`. | AUTH | Sistema | Must Have | MVP | Explícito | UC-ADMIN-001 | BR-AUTH-010. 403 explícito. |
| FR-AUTH-010 | El sistema debe asegurar el aislamiento de datos por rol: un organizador no ve eventos ajenos, un proveedor solo ve sus QuoteRequest. | AUTH | Sistema | Must Have | MVP | Explícito | UC-AUTH-004 | BR-AUTH-009; BR-EVENT-002; BR-QUOTE-006. |
| FR-AUTH-011 | El sistema debe ofrecer login con Google (OAuth) como opción adicional al email/password. | AUTH | Visitante | Could Have | MVP | Explícito | UC-AUTH-002 | Doc 3 §7.1. Implementación opcional; no bloquea MVP. |
| FR-AUTH-012 | El sistema debe almacenar las contraseñas con hash criptográfico fuerte (bcrypt/argon2) y nunca en texto plano. | AUTH | Sistema | Must Have | MVP | Derivado | UC-AUTH-001 | C-061. Buena práctica obligatoria. |

---

## 14. Requerimientos funcionales — Usuarios y preferencias

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-USER-001 | El sistema debe permitir al usuario ver su perfil propio (nombre, email, idioma preferido, rol, teléfono opcional). | USER | Todos | Must Have | MVP | Explícito | UC-AUTH-005 | BR-USER-001. |
| FR-USER-002 | El sistema debe permitir al usuario editar su nombre, teléfono e idioma preferido. | USER | Todos | Must Have | MVP | Explícito | UC-AUTH-006 | BR-USER-001/006. Email no editable en MVP. |
| FR-USER-003 | El sistema debe permitir al usuario configurar su idioma preferido entre `es-LATAM`, `es-ES`, `pt`, `en`. | USER | Todos | Must Have | MVP | Explícito | UC-I18N-001 | BR-USER-006; C-043/C-046. Default `es-LATAM`. |
| FR-USER-004 | El sistema debe registrar la fecha de creación y la última actualización del perfil. | USER | Sistema | Must Have | MVP | Derivado | UC-AUTH-005 | Auditoría mínima. |
| FR-USER-005 | El sistema debe recolectar únicamente los datos personales mínimos necesarios (email, nombre, rol; teléfono opcional). | USER | Sistema | Must Have | MVP | Explícito | UC-AUTH-001 | BR-USER-005; BR-PRIVACY-001/002. No documentos legales ni fiscales. |
| FR-USER-006 | El sistema debe asegurar que el email sea único entre usuarios activos. | USER | Sistema | Must Have | MVP | Explícito | UC-AUTH-001 | BR-USER-002; C-001. |

---

## 15. Requerimientos funcionales — Gestión de eventos

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-EVENT-001 | El sistema debe permitir al organizador crear un evento mediante un wizard con campos: tipo de evento, fecha tentativa, número de invitados estimado, ubicación (ciudad/país), presupuesto estimado, moneda, idioma. | EVENT | Organizador | Must Have | MVP | Explícito | UC-EVENT-001 | BR-EVENT-001/003. `event_type_code` ∈ {wedding, xv, baptism, baby_shower, birthday, corporate}. |
| FR-EVENT-002 | El sistema debe asociar cada evento a un único organizador (owner) y registrar la propiedad de forma inmutable. | EVENT | Sistema | Must Have | MVP | Explícito | UC-EVENT-001 | BR-EVENT-001; C-002. |
| FR-EVENT-003 | El sistema debe ofrecer durante el wizard la elección entre moneda local del organizador o USD, y debe impedir cambiar la moneda después de creado el evento. | EVENT | Organizador | Must Have | MVP | Explícito | UC-EVENT-001, UC-BUDGET-004 | BR-EVENT-007; C-006. Decisión PO 8.1 #7. |
| FR-EVENT-004 | El sistema debe permitir al organizador editar los datos del evento propio (fecha, invitados, ubicación, presupuesto, idioma) mientras el evento no esté en estado `completed` o `cancelled`. | EVENT | Organizador | Must Have | MVP | Explícito | UC-EVENT-002 | BR-EVENT-002. La moneda nunca se edita. |
| FR-EVENT-005 | El sistema debe gestionar el ciclo de vida del evento mediante el flujo `draft → active → completed | cancelled`, sin retornos desde estados terminales. | EVENT | Sistema | Must Have | MVP | Explícito | UC-EVENT-002, UC-EVENT-005 | BR-EVENT-005; C-005/C-047. |
| FR-EVENT-006 | El sistema debe impedir la creación de QuoteRequest desde eventos en estado `draft`, `completed` o `cancelled`. | EVENT | Sistema | Must Have | MVP | Explícito | UC-QUOTE-001 | BR-EVENT-006. Solo eventos `active` pueden generar cotizaciones. |
| FR-EVENT-007 | El sistema debe permitir al organizador listar y filtrar sus eventos propios por estado y tipo. | EVENT | Organizador | Must Have | MVP | Explícito | UC-EVENT-003 | BR-EVENT-009. |
| FR-EVENT-008 | El sistema debe mostrar un dashboard por evento con el progreso (%), las próximas tareas, el presupuesto comprometido y las cotizaciones activas. | EVENT | Organizador | Must Have | MVP | Explícito | UC-EVENT-004 | BR-EVENT-009; BR-TASK-009. |
| FR-EVENT-009 | El sistema debe marcar automáticamente como `completed` los eventos cuyo `event_date` fue alcanzado y han transcurrido 2 días calendario después, sin requerir acción del organizador. | EVENT | Sistema | Must Have | MVP | Explícito | UC-EVENT-005 | BR-EVENT-013; C-048/C-056. Job programado. Marca `auto_completed=true` y `completed_at`. Decisión PO 8.1 #6. |
| FR-EVENT-010 | El sistema debe permitir al administrador listar y consultar el detalle de cualquier evento en modo solo lectura, sin permitir edición. | EVENT | Administrador | Must Have | MVP | Explícito | UC-ADMIN-002 | BR-EVENT-014. Acceso registrado como `view_event` en `AdminAction`. Decisión PO 8.1 #16. |
| FR-EVENT-011 | El sistema debe permitir al organizador cancelar su evento propio en cualquier momento previo a estado `completed`. | EVENT | Organizador | Must Have | MVP | Explícito | UC-EVENT-006 | BR-EVENT-005/010. |
| FR-EVENT-012 | El sistema debe permitir al organizador eliminar (soft delete) eventos en estado `draft`; eventos `active` o `completed` no se eliminan, solo se cancelan. | EVENT | Organizador | Should Have | MVP | Derivado | UC-EVENT-002 | BR-EVENT-010. |
| FR-EVENT-013 | El sistema debe asociar cada evento a un `EventType` válido del catálogo activo (`wedding`, `xv`, `baptism`, `baby_shower`, `birthday`, `corporate`). | EVENT | Sistema | Must Have | MVP | Explícito | UC-EVENT-001 | BR-EVENT-004; BR-EVENTTYPE-001; C-003. |
| FR-EVENT-014 | El sistema debe permitir seleccionar el idioma del evento entre los soportados (es-LATAM, es-ES, pt, en) y usarlo como parámetro en las llamadas IA y la UI del evento. | EVENT | Organizador | Must Have | MVP | Explícito | UC-EVENT-001, UC-AI-001 | BR-EVENT-008; BR-AI-011. |

---

## 16. Requerimientos funcionales — Planificación asistida por IA

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-AI-001 | El sistema debe permitir al organizador generar un plan IA del evento (timeline + categorías de proveedor sugeridas) a partir del tipo, fecha, invitados, presupuesto y ciudad. | AI | Organizador | Must Have | MVP | Explícito | UC-AI-001 | BR-AI-001; AI-001. Output editable antes de aceptar. |
| FR-AI-002 | El sistema debe permitir al organizador generar un checklist IA con tareas con fechas relativas al `event_date` (T-180, T-90, T-30, T-7, T-1, etc.). | AI | Organizador | Must Have | MVP | Explícito | UC-AI-002 | BR-AI-001; BR-TASK-006; AI-002. |
| FR-AI-003 | El sistema debe permitir al organizador generar una sugerencia IA de distribución de presupuesto por categoría a partir del total y tipo de evento. | AI | Organizador | Must Have | MVP | Explícito | UC-AI-003 | BR-AI-001; BR-BUDGET-008; AI-003. |
| FR-AI-004 | El sistema debe permitir al organizador obtener una recomendación IA de categorías de proveedor priorizadas para su tipo de evento. | AI | Organizador | Must Have | MVP | Explícito | UC-AI-004 | BR-AI-001; AI-004. |
| FR-AI-005 | El sistema debe permitir al organizador generar un brief IA de cotización autocompletado desde los datos del evento. | AI | Organizador | Must Have | MVP | Explícito | UC-AI-005, UC-QUOTE-001 | BR-AI-001; AI-005. Editable antes de enviar. |
| FR-AI-006 | El sistema debe permitir al organizador obtener un resumen IA comparativo de las Quotes recibidas para una misma categoría. | AI | Organizador | Should Have | MVP | Explícito | UC-AI-006, UC-QUOTE-006 | BR-QUOTE-023/024; AI-006. Resumen no altera Quotes originales. |
| FR-AI-007 | El sistema debe permitir al proveedor generar opcionalmente bio y descripciones de paquetes con IA, siempre editables antes de publicar. | AI | Proveedor | Could Have | MVP | Explícito | UC-AI-007, UC-VENDOR-001 | BR-VENDOR-008; AI-007. |
| FR-AI-008 | El sistema debe permitir al organizador obtener una priorización IA de las próximas tareas urgentes del checklist. | AI | Organizador | Should Have | MVP | Explícito | UC-AI-008 | AI-008. Lectura asistida; no altera estado de tareas. |
| FR-AI-009 | El sistema debe aplicar un timeout de 60.000 ms (1 minuto) a toda invocación IA y, al superarse, mostrar un error controlado o degradar a `MockAIProvider` cuando esté habilitado el modo demo/testing. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-009; C-058. `AIRecommendation.timeout_ms=60000`; `fallback_used=true` al degradar. Decisión PO 8.1 #9. |
| FR-AI-010 | El sistema debe persistir cada salida IA como `AIRecommendation` con `accepted` (default `false`), `payload`, `prompt_version_id`, `provider`, `language`, `fallback_used` y `timeout_ms`. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-007/010; C-031..C-035. |
| FR-AI-011 | El sistema debe distinguir visualmente el contenido sugerido por IA (no confirmado) frente al contenido confirmado por el usuario, mediante badge, color o etiqueta clara. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-003. |
| FR-AI-012 | El sistema debe impedir que cualquier salida IA se convierta en `Event`, `EventTask`, `BudgetItem`, `Quote`, `Review`, `VendorProfile`, `BookingIntent` o acción admin oficial sin confirmación humana explícita. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-001/004; regla canónica del producto. |
| FR-AI-013 | El sistema debe marcar las entidades creadas a partir de IA (`EventTask`, `BudgetItem`) con `ai_generated=true`. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-002/003 | BR-AI-008; C-058/C-059. |
| FR-AI-014 | El sistema debe usar una interfaz `LLMProvider` con implementación funcional principal `OpenAIProvider` e implementación obligatoria `MockAIProvider`. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-005/006; Doc 7 §20. |
| FR-AI-015 | El sistema debe preparar la interfaz `AnthropicProvider` como stub no funcional en MVP, sin failover automático ni selector dinámico en UI. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-005; Doc 7 §20; C-062. Decisión PO 8.1 #15. Implementación funcional es Future. |
| FR-AI-016 | El sistema debe seleccionar el proveedor IA en tiempo de ejecución a partir de la variable de configuración `LLM_PROVIDER` con valores `openai | mock`. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | Doc 7 §20.3. Sin selector dinámico en UI. |
| FR-AI-017 | El sistema debe pasar el idioma del evento (o el preferido del usuario si no aplica) como parámetro a cada invocación IA y el output debe respetar ese idioma. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-011. |
| FR-AI-018 | El sistema debe versionar las plantillas de prompt y referenciar la versión usada en cada `AIRecommendation`. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-010; C-034/C-035. |
| FR-AI-019 | El sistema debe permitir al usuario aceptar, editar o regenerar la salida IA antes de persistirla como dato oficial. | AI | Organizador, Proveedor | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-002. |
| FR-AI-020 | El sistema debe impedir el uso de IA para tomar decisiones autónomas: aprobar proveedores, contratar, ejecutar pagos, eliminar reseñas, generar contratos legales o enviar mensajes externos. | AI | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-004; regla canónica. |

---

## 17. Requerimientos funcionales — Checklist y tareas

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-TASK-001 | El sistema debe permitir al organizador ver el checklist completo del evento propio. | TASK | Organizador | Must Have | MVP | Explícito | UC-TASK-001 | BR-TASK-001. |
| FR-TASK-002 | El sistema debe permitir al organizador crear tareas manualmente con nombre, descripción, `due_date` y categoría opcional. | TASK | Organizador | Must Have | MVP | Explícito | UC-TASK-001 | BR-TASK-002. `ai_generated=false`. |
| FR-TASK-003 | El sistema debe permitir al organizador editar las tareas (nombre, descripción, fecha, categoría) de su evento. | TASK | Organizador | Must Have | MVP | Explícito | UC-TASK-002 | BR-TASK-005. |
| FR-TASK-004 | El sistema debe permitir al organizador cambiar el estado de una tarea siguiendo el flujo `pending → in_progress → done | skipped`. | TASK | Organizador | Must Have | MVP | Explícito | UC-TASK-003 | BR-TASK-004; C-027. |
| FR-TASK-005 | El sistema debe permitir al organizador confirmar las tareas generadas por IA individualmente o en bloque, marcándolas como aceptadas. | TASK | Organizador | Must Have | MVP | Explícito | UC-TASK-004 | BR-TASK-003. Solo tras confirmación se vuelven oficiales en el dashboard. |
| FR-TASK-006 | El sistema debe permitir al organizador eliminar tareas propias o rechazar tareas IA no confirmadas. | TASK | Organizador | Must Have | MVP | Derivado | UC-TASK-002 | BR-TASK-005. |
| FR-TASK-007 | El sistema debe calcular el progreso del evento (% completitud) en función de las tareas confirmadas en estado `done` sobre el total confirmado. | TASK | Sistema | Must Have | MVP | Explícito | UC-TASK-001, UC-EVENT-004 | BR-TASK-009. |
| FR-TASK-008 | El sistema debe convertir las fechas relativas de las tareas IA (T-180, T-90, T-30, T-7, T-1) a fechas absolutas usando el `event_date`. | TASK | Sistema | Must Have | MVP | Explícito | UC-AI-002 | BR-TASK-006; C-028. |
| FR-TASK-009 | El sistema debe permitir filtrar las tareas por estado y por rango temporal (próximos 7 días, próximos 30 días). | TASK | Organizador | Should Have | MVP | Explícito | UC-TASK-005 | BR-TASK-007. |
| FR-TASK-010 | El sistema debe destacar visualmente las tareas próximas a vencer (T-7) y las vencidas, y generar notificación in-app correspondiente. | TASK | Sistema | Should Have | MVP | Explícito | UC-TASK-005, UC-NOTIF-001 | BR-TASK-008. |
| FR-TASK-011 | El sistema debe impedir cambios de estado en tareas de eventos `cancelled` y debe poner en solo lectura las tareas de eventos `completed`. | TASK | Sistema | Should Have | MVP | Explícito | UC-TASK-006 | BR-TASK-010. |
| FR-TASK-012 | El sistema debe distinguir el origen de cada tarea mediante un indicador `ai_generated` (true/false) tanto en backend como en UI. | TASK | Sistema | Must Have | MVP | Explícito | UC-AI-002, UC-TASK-001 | BR-AI-008; BR-TASK-002. |

---

## 18. Requerimientos funcionales — Presupuesto y moneda

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-BUDGET-001 | El sistema debe asociar a cada evento un único presupuesto (`Budget`) con relación 1:1. | BUDGET | Sistema | Must Have | MVP | Explícito | UC-BUDGET-001 | BR-BUDGET-001; C-007. |
| FR-BUDGET-002 | El sistema debe ofrecer durante la creación del evento exactamente dos opciones de moneda: moneda local del organizador o USD, y debe impedir cambiarla después. | BUDGET | Organizador | Must Have | MVP | Explícito | UC-EVENT-001, UC-BUDGET-004 | BR-BUDGET-006; BR-EVENT-007; C-006. Decisión PO 8.1 #7. |
| FR-BUDGET-003 | El sistema debe permitir al organizador crear, editar y eliminar `BudgetItem` por categoría con campos `planned`, `committed`, `paid` (opcional). | BUDGET | Organizador | Must Have | MVP | Explícito | UC-BUDGET-001, UC-BUDGET-002 | BR-BUDGET-002; C-008/C-009. |
| FR-BUDGET-004 | El sistema debe calcular en vivo `total = SUM(BudgetItem.planned)` y `committed = SUM(BudgetItem.committed)` y mostrarlos en el dashboard del evento. | BUDGET | Sistema | Must Have | MVP | Explícito | UC-BUDGET-001, UC-EVENT-004 | BR-BUDGET-003. |
| FR-BUDGET-005 | El sistema debe mostrar un warning visible (no bloqueante) cuando `committed` supera `total`. | BUDGET | Sistema | Must Have | MVP | Explícito | UC-BUDGET-001 | BR-BUDGET-004. |
| FR-BUDGET-006 | El sistema debe actualizar automáticamente `BudgetItem.committed` al confirmarse un `BookingIntent` afectando la categoría correspondiente. | BUDGET | Sistema | Must Have | MVP | Explícito | UC-BOOKING-002 | BR-BUDGET-005; BR-BOOKING-008. |
| FR-BUDGET-007 | El sistema debe mostrar todas las cifras del presupuesto y las cotizaciones en la moneda configurada del evento, sin aplicar conversión automática. | BUDGET | Sistema | Must Have | MVP | Explícito | UC-BUDGET-001 | BR-BUDGET-007/010. La conversión de moneda está fuera de alcance. |
| FR-BUDGET-008 | El sistema debe permitir al organizador editar libremente los `BudgetItem` incluso después de aceptar una sugerencia IA. | BUDGET | Organizador | Must Have | MVP | Explícito | UC-BUDGET-002 | BR-BUDGET-009. |
| FR-BUDGET-009 | El sistema debe soportar como mínimo las monedas `GTQ`, `EUR`, `MXN`, `COP`, `USD` y mostrar su código o símbolo en UI. | BUDGET | Sistema | Must Have | MVP | Explícito | UC-EVENT-001 | BR-BUDGET-006/010; C-044. |
| FR-BUDGET-010 | El sistema debe permitir aceptar la distribución IA de presupuesto como `BudgetItem` con `ai_generated=true`, editables antes de guardar. | BUDGET | Organizador | Must Have | MVP | Explícito | UC-AI-003, UC-BUDGET-003 | BR-AI-008; BR-BUDGET-008/009. |

---

## 19. Requerimientos funcionales — Proveedores y perfiles

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-VENDOR-001 | El sistema debe permitir al proveedor crear su `VendorProfile` con nombre del negocio, biografía, ciudad, categorías asociadas e idiomas atendidos. | VENDOR | Proveedor | Must Have | MVP | Explícito | UC-VENDOR-001 | BR-VENDOR-001/002. Estado inicial `pending`. |
| FR-VENDOR-002 | El sistema debe permitir al proveedor editar los datos de su perfil propio mientras éste no esté en estado `rejected`. | VENDOR | Proveedor | Must Have | MVP | Explícito | UC-VENDOR-002 | BR-VENDOR-004. |
| FR-VENDOR-003 | El sistema debe mostrar en el directorio público únicamente los `VendorProfile` con estado `approved`. | VENDOR | Sistema | Must Have | MVP | Explícito | UC-VENDOR-006 | BR-VENDOR-001; C-010. |
| FR-VENDOR-004 | El sistema debe llevar un contador `category_change_count` del proveedor y debe impedir más de 5 cambios acumulados de categorías. | VENDOR | Sistema | Must Have | MVP | Explícito | UC-VENDOR-002 | BR-VENDOR-004; C-011. Decisión PO 8.1 #3. |
| FR-VENDOR-005 | El sistema debe marcar el perfil como `requires_admin_review=true` cuando los cambios de categoría afecten la visibilidad pública (modificaciones del conjunto de `service_category_id`). | VENDOR | Sistema | Must Have | MVP | Explícito | UC-VENDOR-002 | BR-VENDOR-004; Supuesto 8.2 §9 #2. |
| FR-VENDOR-006 | El sistema debe permitir al proveedor cargar hasta 10 imágenes por trabajo/evento mostrado en el portafolio, identificadas por un `work_label`. | VENDOR | Proveedor | Must Have | MVP | Explícito | UC-VENDOR-005 | BR-VENDOR-005; C-038; `AttachmentOwnerType='vendor_work'`. Decisión PO 8.1 #2. |
| FR-VENDOR-007 | El sistema debe permitir al proveedor agrupar las imágenes del portafolio por trabajo/evento con etiqueta libre (`work_label`). | VENDOR | Proveedor | Must Have | MVP | Explícito | UC-VENDOR-005 | BR-VENDOR-005. |
| FR-VENDOR-008 | El sistema debe aplicar soft delete a las imágenes eliminadas del portafolio (marca `status=deleted` con `deleted_at`, `deleted_by`, `deletion_reason`); la eliminación física se ejecuta por proceso técnico posterior. | VENDOR | Sistema | Must Have | MVP | Explícito | UC-VENDOR-005 | BR-PRIVACY-011; C-037/C-060. Decisión PO 8.1 #19. |
| FR-VENDOR-009 | El sistema debe permitir al proveedor crear y mantener `VendorService` (paquetes) con nombre, categoría, precio base y descripción. | VENDOR | Proveedor | Must Have | MVP | Explícito | UC-VENDOR-004 | BR-VENDOR-002; BR-SERVICE-001/002. |
| FR-VENDOR-010 | El sistema debe gestionar el ciclo de vida del `VendorProfile` mediante `pending → approved | rejected`. | VENDOR | Sistema | Must Have | MVP | Explícito | UC-ADMIN-004 | BR-VENDOR-003; C-010. |
| FR-VENDOR-011 | El sistema debe enviar al proveedor una notificación in-app al aprobarse o rechazarse su perfil. | VENDOR | Sistema | Must Have | MVP | Derivado | UC-ADMIN-004, UC-NOTIF-001 | BR-NOTIF-001. |
| FR-VENDOR-012 | El sistema debe permitir al proveedor consultar las reseñas recibidas en modo solo lectura, sin poder responderlas en MVP. | VENDOR | Proveedor | Must Have | MVP | Explícito | UC-VENDOR-007 | BR-REVIEW-008; Decisión PO 8.1 #14 (respuesta es Future). |
| FR-VENDOR-013 | El sistema debe denormalizar `rating_avg` y `reviews_count` en el `VendorProfile` y actualizarlos al crear o moderar una reseña. | VENDOR | Sistema | Must Have | MVP | Explícito | UC-REVIEW-001, UC-REVIEW-003 | BR-REVIEW-009. |

---

## 20. Requerimientos funcionales — Servicios y categorías

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-SERVICE-001 | El sistema debe gestionar un catálogo de `ServiceCategory` administrado exclusivamente por el administrador. | SERVICE | Administrador | Must Have | MVP | Explícito | UC-ADMIN-007 | BR-SERVICE-003; BR-ADMIN-002. |
| FR-SERVICE-002 | El sistema debe soportar una jerarquía simple de categorías de servicio con profundidad máxima de 2 niveles (`parent → child`). | SERVICE | Sistema | Must Have | MVP | Explícito | UC-ADMIN-007 | BR-SERVICE-005; BR-ADMIN-012; C-013. Decisión PO 8.1 #18. |
| FR-SERVICE-003 | El sistema debe impedir la eliminación física (hard delete) de una categoría con servicios o subcategorías asociadas, y debe ofrecer soft delete o desactivación. | SERVICE | Sistema | Must Have | MVP | Explícito | UC-ADMIN-007 | BR-SERVICE-007. |
| FR-SERVICE-004 | El sistema debe permitir al organizador y al proveedor consultar el listado público de categorías activas. | SERVICE | Todos | Must Have | MVP | Derivado | UC-VENDOR-006 | BR-SERVICE-001/003. |
| FR-SERVICE-005 | El sistema debe permitir al proveedor asignar sus `VendorService` a categorías existentes del catálogo (no crear categorías). | SERVICE | Proveedor | Must Have | MVP | Explícito | UC-VENDOR-004 | BR-SERVICE-001/003. |
| FR-SERVICE-006 | El sistema debe permitir al administrador activar, desactivar, editar nombre y descripción, y reordenar las categorías. | SERVICE | Administrador | Must Have | MVP | Explícito | UC-ADMIN-007 | BR-ADMIN-002/012. |
| FR-SERVICE-007 | El sistema debe garantizar que el `base_price` de un `VendorService` es referencial y no constituye una cotización formal. | SERVICE | Sistema | Must Have | MVP | Explícito | UC-VENDOR-004 | BR-SERVICE-006; C-050. |

---

## 21. Requerimientos funcionales — Solicitudes y cotizaciones

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-QUOTE-001 | El sistema debe permitir al organizador crear una `QuoteRequest` desde un evento `active` propio, dirigida a un proveedor `approved`. | QUOTE | Organizador | Must Have | MVP | Explícito | UC-QUOTE-001 | BR-QUOTE-001; BR-EVENT-006. |
| FR-QUOTE-002 | El sistema debe impedir más de 5 `QuoteRequest` activas por categoría de servicio en un mismo evento. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-001 | BR-QUOTE-009; C-016. Estados que cuentan como activas: `sent`, `viewed`, `responded`, `preferred`. Decisión PO 8.1 #12. |
| FR-QUOTE-003 | El sistema debe permitir una única `QuoteRequest` activa por par (evento, proveedor); para enviar otra al mismo proveedor, la anterior debe estar `cancelled`, `expired` o `rejected`. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-001 | BR-QUOTE-004. |
| FR-QUOTE-004 | El sistema debe autocompletar el brief de la `QuoteRequest` desde los datos del evento (tipo, fecha, ciudad, invitados, presupuesto) y permitir al organizador editarlo antes de enviar. | QUOTE | Organizador | Must Have | MVP | Explícito | UC-QUOTE-002, UC-AI-005 | BR-QUOTE-002/003. |
| FR-QUOTE-005 | El sistema debe asignar a la `Quote` una validez por defecto de 15 días calendario desde `created_at` cuando el proveedor no especifica `valid_until`. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-004 | BR-QUOTE-015; C-019. Decisión PO 8.1 #4. |
| FR-QUOTE-006 | El sistema debe gestionar el ciclo de vida de `QuoteRequest` mediante `sent → viewed → responded | expired | cancelled`. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-001..010 | BR-QUOTE-005; C-015. |
| FR-QUOTE-007 | El sistema debe gestionar el ciclo de vida de `Quote` mediante `draft → sent → accepted | rejected | expired`. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-004..010 | BR-QUOTE-014; C-017. |
| FR-QUOTE-008 | El sistema debe permitir al proveedor responder a una `QuoteRequest` dirigida a su perfil con una `Quote` que contenga total, desglose, condiciones y `valid_until`. | QUOTE | Proveedor | Must Have | MVP | Explícito | UC-QUOTE-004 | BR-QUOTE-011/012. |
| FR-QUOTE-009 | El sistema debe marcar automáticamente las `Quote` como `expired` cuando se supera `valid_until`, y debe notificar al proveedor en plataforma. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-010, UC-NOTIF-001 | BR-QUOTE-016; BR-NOTIF-002. Decisión PO 8.1 #13. |
| FR-QUOTE-010 | El sistema debe notificar al proveedor en plataforma cuando su `Quote` es rechazada por el organizador, y debe enviar email simulado cuando la funcionalidad de email esté disponible. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-009, UC-NOTIF-001 | BR-NOTIF-002. Decisión PO 8.1 #13. |
| FR-QUOTE-011 | El sistema debe permitir al organizador ver una vista comparativa side-by-side de las `Quote` recibidas para una misma categoría. | QUOTE | Organizador | Must Have | MVP | Explícito | UC-QUOTE-006 | BR-QUOTE-021. |
| FR-QUOTE-012 | El sistema debe permitir al organizador marcar una `Quote` como `preferred` para la comparación, sin que ello altere su estado oficial. | QUOTE | Organizador | Must Have | MVP | Explícito | UC-QUOTE-007 | BR-QUOTE-022. |
| FR-QUOTE-013 | El sistema debe ofrecer opcionalmente un resumen IA del comparador con diferencias clave, fortalezas y riesgos; el resumen no modifica las `Quote` originales. | QUOTE | Organizador | Should Have | MVP | Explícito | UC-AI-006 | BR-QUOTE-023/024. |
| FR-QUOTE-014 | El sistema debe restringir la visibilidad de la `QuoteRequest` exclusivamente al proveedor destinatario, y la visibilidad de la `Quote` al proveedor que la creó y al organizador del evento. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-003, UC-QUOTE-005 | BR-QUOTE-006/011. |
| FR-QUOTE-015 | El sistema debe permitir al organizador cancelar una `QuoteRequest` en estados `sent` o `viewed`. | QUOTE | Organizador | Should Have | MVP | Explícito | UC-QUOTE-008 | BR-QUOTE-010. |
| FR-QUOTE-016 | El sistema debe enviar una notificación in-app al proveedor al crearse una `QuoteRequest` dirigida a su perfil. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-001, UC-NOTIF-001 | BR-QUOTE-007; BR-NOTIF-001. |
| FR-QUOTE-017 | El sistema debe enviar una notificación in-app al organizador al pasar la `Quote` a estado `sent`. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-004, UC-NOTIF-001 | BR-QUOTE-018; BR-NOTIF-001. |
| FR-QUOTE-018 | El sistema debe expresar la `Quote` en la moneda configurada del evento sin aplicar conversión automática. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-004 | BR-QUOTE-019; BR-BUDGET-007. |
| FR-QUOTE-019 | El sistema debe permitir al proveedor editar la `Quote` únicamente en estado `draft`; tras `sent`, la `Quote` es inmutable. | QUOTE | Sistema | Must Have | MVP | Explícito | UC-QUOTE-004 | BR-QUOTE-017. |
| FR-QUOTE-020 | El sistema debe permitir consultar el historial de cotizaciones expiradas o rechazadas en modo solo lectura para auditoría/demo. | QUOTE | Organizador, Proveedor | Should Have | MVP | Explícito | UC-QUOTE-009/010 | BR-QUOTE-025. |

---

## 22. Requerimientos funcionales — Booking intent simulado

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-BOOKING-001 | El sistema debe permitir al organizador crear un `BookingIntent` solo a partir de una `Quote` aceptada y vigente (no expirada). | BOOKING | Organizador | Must Have | MVP | Explícito | UC-BOOKING-001 | BR-BOOKING-001; C-021. |
| FR-BOOKING-002 | El sistema debe gestionar el ciclo de vida del `BookingIntent` mediante `pending → confirmed_intent | cancelled`. | BOOKING | Sistema | Must Have | MVP | Explícito | UC-BOOKING-001..003 | BR-BOOKING-003; C-020. |
| FR-BOOKING-003 | El sistema debe requerir la confirmación explícita del proveedor para que el `BookingIntent` pase de `pending` a `confirmed_intent`. | BOOKING | Proveedor | Must Have | MVP | Explícito | UC-BOOKING-002 | BR-BOOKING-002; C-055. |
| FR-BOOKING-004 | El sistema debe permitir cancelar el `BookingIntent` incluso desde el estado `confirmed_intent`, tanto al organizador como al proveedor, sin penalización en plataforma. | BOOKING | Organizador, Proveedor | Must Have | MVP | Explícito | UC-BOOKING-003 | BR-BOOKING-009; C-056. Decisión PO 8.1 #5. |
| FR-BOOKING-005 | El sistema debe registrar al cancelar un `BookingIntent` los campos `cancelled_at`, `cancelled_by` y `cancellation_reason`. | BOOKING | Sistema | Must Have | MVP | Explícito | UC-BOOKING-003 | BR-BOOKING-009. |
| FR-BOOKING-006 | El sistema debe mostrar un disclaimer visible al crear o confirmar un `BookingIntent` indicando que el acuerdo final ocurre fuera de la plataforma y que no hay penalización financiera en plataforma. | BOOKING | Sistema | Must Have | MVP | Explícito | UC-BOOKING-001..003 | BR-BOOKING-006. |
| FR-BOOKING-007 | El sistema debe impedir cualquier captura de medios de pago, tokenización de tarjetas, cobro real, transferencia o depósito asociado al `BookingIntent`. | BOOKING | Sistema | Must Have | MVP | Explícito | UC-BOOKING-001..003 | BR-BOOKING-004. Pagos reales son Out of Scope. |
| FR-BOOKING-008 | El sistema debe actualizar `BudgetItem.committed` de la categoría afectada al confirmarse el `BookingIntent`, y debe revertir esa actualización al cancelarse. | BOOKING | Sistema | Must Have | MVP | Explícito | UC-BOOKING-002, UC-BOOKING-003 | BR-BOOKING-008; BR-BUDGET-005. |
| FR-BOOKING-009 | El sistema debe permitir como máximo un `BookingIntent` confirmado por par (evento, categoría); para confirmar otro en la misma categoría, el anterior debe cancelarse. | BOOKING | Sistema | Must Have | MVP | Explícito | UC-BOOKING-002 | BR-BOOKING-007; C-022. |
| FR-BOOKING-010 | El sistema debe notificar al organizador y al proveedor en plataforma cada cambio de estado del `BookingIntent` (creación, confirmación, cancelación). | BOOKING | Sistema | Must Have | MVP | Derivado | UC-NOTIF-001 | BR-NOTIF-001. |

---

## 23. Requerimientos funcionales — Reseñas y moderación

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-REVIEW-001 | El sistema debe permitir crear una `Review` solo al organizador cuyo evento alcanzó `BookingIntent.confirmed_intent` con el proveedor reseñado. | REVIEW | Organizador | Must Have | MVP | Explícito | UC-REVIEW-001 | BR-REVIEW-001; BR-BOOKING-010. |
| FR-REVIEW-002 | El sistema debe validar que el `rating` sea un entero en la escala 1–5, donde 5 es la mejor calificación y 1 la peor. | REVIEW | Sistema | Must Have | MVP | Explícito | UC-REVIEW-001 | BR-REVIEW-003; C-024. Decisión PO 8.1 #1. |
| FR-REVIEW-003 | El sistema debe permitir una única `Review` por combinación (evento, proveedor). | REVIEW | Sistema | Must Have | MVP | Explícito | UC-REVIEW-001 | BR-REVIEW-002; C-025. |
| FR-REVIEW-004 | El sistema debe permitir al administrador ocultar o remover una `Review` aplicando soft delete con estados `hidden` o `removed`, y registrar la acción con `moderated_by`, `moderated_at`, `moderation_reason` y `admin_action_id`. | REVIEW | Administrador | Must Have | MVP | Explícito | UC-REVIEW-003 | BR-REVIEW-005; BR-ADMIN-003/011; C-057. Decisión PO 8.1 #11. |
| FR-REVIEW-005 | El sistema debe impedir el hard delete físico de reseñas. | REVIEW | Sistema | Must Have | MVP | Explícito | UC-REVIEW-003 | BR-REVIEW-005. |
| FR-REVIEW-006 | El sistema debe mostrar en el perfil público del proveedor únicamente las reseñas con estado `published`. | REVIEW | Sistema | Must Have | MVP | Explícito | UC-VENDOR-006 | BR-REVIEW-004/010; C-057. |
| FR-REVIEW-007 | El sistema debe impedir la edición de una `Review` una vez publicada. | REVIEW | Sistema | Must Have | MVP | Explícito | UC-REVIEW-001 | BR-REVIEW-007. La edición es Out of Scope/Future. |
| FR-REVIEW-008 | El sistema debe impedir cualquier respuesta del proveedor a reseñas en MVP. | REVIEW | Sistema | Must Have | MVP | Explícito | UC-REVIEW-001, UC-VENDOR-007 | BR-REVIEW-008. Decisión PO 8.1 #14. Funcionalidad de respuesta es Future. |
| FR-REVIEW-009 | El sistema debe impedir la moderación automática IA y debe requerir intervención manual del administrador para ocultar o remover reseñas. | REVIEW | Sistema | Must Have | MVP | Explícito | UC-REVIEW-003 | BR-REVIEW-006; BR-AI-004. |
| FR-REVIEW-010 | El sistema debe permitir al organizador y al proveedor ver las reseñas asociadas al evento/proveedor correspondiente en modo solo lectura. | REVIEW | Organizador, Proveedor | Must Have | MVP | Derivado | UC-REVIEW-002, UC-VENDOR-007 | BR-REVIEW-004/010. |

---

## 24. Requerimientos funcionales — Notificaciones

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-NOTIF-001 | El sistema debe generar notificaciones in-app ante cambios de estado relevantes: nueva `QuoteRequest`, `Quote` enviada, `Quote` aceptada/rechazada/expirada, `BookingIntent` creado/confirmado/cancelado, tareas próximas a vencer (T-7), aprobación/rechazo de `VendorProfile`. | NOTIF | Sistema | Must Have | MVP | Explícito | UC-NOTIF-001 | BR-NOTIF-001; BR-NOTIF-002. |
| FR-NOTIF-002 | El sistema debe permitir al usuario consultar sus notificaciones in-app y marcarlas como leídas. | NOTIF | Todos | Must Have | MVP | Explícito | UC-NOTIF-002 | BR-NOTIF-004; C-030. |
| FR-NOTIF-003 | El sistema debe simular el envío de email mediante un log estructurado con remitente, destinatario, asunto y cuerpo cuando no exista integración SMTP real disponible. | NOTIF | Sistema | Must Have | MVP | Explícito | UC-NOTIF-001 | BR-NOTIF-003. |
| FR-NOTIF-004 | El sistema debe notificar in-app al proveedor cuando su `Quote` es rechazada o expira; el envío de email aplicará cuando la funcionalidad de email esté disponible. | NOTIF | Sistema | Must Have | MVP | Explícito | UC-QUOTE-009, UC-QUOTE-010 | BR-NOTIF-002. Decisión PO 8.1 #13. |
| FR-NOTIF-005 | El sistema debe asegurar que cada usuario reciba únicamente las notificaciones que le corresponden, sin acceso a notificaciones de otros usuarios. | NOTIF | Sistema | Must Have | MVP | Explícito | UC-NOTIF-002 | BR-NOTIF-005; C-029. |
| FR-NOTIF-006 | El sistema debe impedir el envío de notificaciones por WhatsApp, SMS o push nativas en MVP. | NOTIF | Sistema | Must Have | MVP | Explícito | UC-NOTIF-001 | BR-NOTIF-006/007. WhatsApp/SMS/Push son Out of Scope. |

---

## 25. Requerimientos funcionales — Idioma e internacionalización

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-I18N-001 | El sistema debe soportar al menos los idiomas `es-LATAM` (base), `es-ES`, `pt` y `en`; el inglés es de soporte obligatorio. | I18N | Sistema | Must Have | MVP | Explícito | UC-I18N-001 | Doc 3 §7.15; C-043. |
| FR-I18N-002 | El sistema debe permitir al usuario cambiar su idioma preferido desde su perfil y aplicar el cambio inmediatamente en la UI. | I18N | Todos | Must Have | MVP | Explícito | UC-I18N-001 | BR-USER-006; C-046. |
| FR-I18N-003 | El sistema debe permitir al organizador seleccionar el idioma del evento durante la creación y usar ese idioma como parámetro en las llamadas IA. | I18N | Organizador | Must Have | MVP | Explícito | UC-EVENT-001, UC-I18N-002 | BR-EVENT-008; BR-AI-011. |
| FR-I18N-004 | El sistema debe traducir las etiquetas, botones, mensajes de UI, mensajes de error y notificaciones en los 4 idiomas soportados. | I18N | Sistema | Must Have | MVP | Derivado | UC-I18N-001 | Doc 3 §7.15. |
| FR-I18N-005 | El sistema debe respetar el idioma seleccionado en la salida IA (plan, checklist, presupuesto, brief, resumen comparativo, bio). | I18N | Sistema | Must Have | MVP | Explícito | UC-AI-001..009 | BR-AI-011. |
| FR-I18N-006 | El sistema debe usar `es-LATAM` como idioma por defecto para nuevos usuarios y eventos sin idioma especificado. | I18N | Sistema | Should Have | MVP | Derivado | UC-I18N-001 | C-046. |

---

## 26. Requerimientos funcionales — Administración

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-ADMIN-001 | El sistema debe permitir al administrador autenticarse y acceder al panel admin exclusivo. | ADMIN | Administrador | Must Have | MVP | Explícito | UC-ADMIN-001 | BR-AUTH-010. |
| FR-ADMIN-002 | El sistema debe mostrar al administrador un dashboard con métricas operativas: total de usuarios, organizadores, proveedores (pendientes/aprobados), eventos por estado, `QuoteRequest` creadas, `Quote` respondidas, `BookingIntent` creados, reseñas publicadas/ocultas/removidas, `AIRecommendation` generadas. | ADMIN | Administrador | Must Have | MVP | Explícito | UC-ADMIN-002 | BR-ADMIN-005. Decisión PO 8.1 #10. Sin métricas comerciales reales. |
| FR-ADMIN-003 | El sistema debe permitir al administrador aprobar, rechazar u ocultar `VendorProfile`, registrando la acción en `AdminAction`. | ADMIN | Administrador | Must Have | MVP | Explícito | UC-ADMIN-004, UC-ADMIN-005 | BR-ADMIN-001; BR-VENDOR-003. |
| FR-ADMIN-004 | El sistema debe permitir al administrador CRUD del catálogo de `ServiceCategory`, respetando la jerarquía máxima de 2 niveles. | ADMIN | Administrador | Must Have | MVP | Explícito | UC-ADMIN-007 | BR-ADMIN-002/012; BR-SERVICE-005. Decisión PO 8.1 #18. |
| FR-ADMIN-005 | El sistema debe permitir al administrador moderar reseñas (ocultar/remover) aplicando soft delete con auditoría obligatoria en `AdminAction`. | ADMIN | Administrador | Must Have | MVP | Explícito | UC-ADMIN-008 | BR-ADMIN-003/011; BR-REVIEW-005. Decisión PO 8.1 #11. |
| FR-ADMIN-006 | El sistema debe registrar todas las acciones administrativas en `AdminAction` de forma inmutable, con `user_id`, `action`, `entity`, `entity_id`, `reason`, `created_at`. | ADMIN | Sistema | Must Have | MVP | Explícito | UC-ADMIN-009 | BR-ADMIN-004; C-039/C-040/C-041. |
| FR-ADMIN-007 | El sistema debe permitir al administrador gestionar el catálogo de `EventType` de forma controlada: activar/desactivar, editar nombre y descripción, definir orden; debe impedir el hard delete cuando existan eventos asociados. | ADMIN | Administrador | Must Have | MVP | Explícito | UC-ADMIN-007 | BR-EVENTTYPE-007; C-026c. Decisión PO 8.1 #17. |
| FR-ADMIN-008 | El sistema debe permitir al administrador listar y consultar eventos en modo solo lectura, registrando cada acceso al detalle como `view_event` en `AdminAction`. | ADMIN | Administrador | Must Have | MVP | Explícito | UC-ADMIN-002 | BR-EVENT-014. Decisión PO 8.1 #16. |
| FR-ADMIN-009 | El sistema debe permitir al administrador consultar el log inmutable de `AdminAction` con filtros por acción, entidad, fecha y usuario. | ADMIN | Administrador | Should Have | MVP | Explícito | UC-ADMIN-009 | BR-ADMIN-004. |
| FR-ADMIN-010 | El sistema debe impedir que el administrador edite eventos pertenecientes a otros organizadores. | ADMIN | Sistema | Must Have | MVP | Explícito | UC-ADMIN-002 | BR-ADMIN-006; BR-EVENT-014. |
| FR-ADMIN-011 | El sistema debe permitir al administrador consultar el log de `AIRecommendation` para auditoría del uso de IA. | ADMIN | Administrador | Should Have | MVP | Explícito | UC-ADMIN-010 | BR-ADMIN-008. |
| FR-ADMIN-012 | El sistema debe permitir al administrador gestionar (crear/inactivar) usuarios seed cuando aplique para mantener el catálogo de demo. | ADMIN | Administrador | Should Have | MVP | Explícito | UC-ADMIN-011 | BR-ADMIN-009. |

---

## 27. Requerimientos funcionales — Datos seed y demo

| Requirement ID | Requirement | Module | Primary role | Priority | Scope | Source type | Related use case | Validation notes |
|---|---|---|---|---|---|---|---|---|
| FR-SEED-001 | El sistema debe permitir cargar (seed) usuarios organizadores y proveedores reproducibles mediante un script único. | SEED | Sistema | Must Have | MVP | Explícito | UC-DEMO-001 | Doc 3 §7.16; BR-SEED-001. |
| FR-SEED-002 | El sistema debe cargar al menos 5–10 organizadores, 10–20 proveedores y 10–15 eventos distribuidos en estados `draft`, `active` y `completed`. | SEED | Sistema | Must Have | MVP | Explícito | UC-DEMO-001 | Doc 3 §7.16. |
| FR-SEED-003 | El sistema debe cargar 10–15 `ServiceCategory` con jerarquía simple (máx 2 niveles) culturalmente coherentes con LATAM. | SEED | Sistema | Must Have | MVP | Explícito | UC-DEMO-001 | Doc 3 §7.16; BR-EVENTTYPE-004. |
| FR-SEED-004 | El sistema debe cargar 15–25 `QuoteRequest` y 10–20 `Quote` respondidas para mostrar el flujo de cotización en la demo. | SEED | Sistema | Must Have | MVP | Explícito | UC-DEMO-001 | Doc 3 §7.16. |
| FR-SEED-005 | El sistema debe cargar al menos un `BookingIntent.confirmed_intent` y 20–40 reseñas en los estados `published`/`hidden`/`removed`. | SEED | Sistema | Must Have | MVP | Explícito | UC-DEMO-001 | Doc 3 §7.16. |
| FR-SEED-006 | El sistema debe cargar ejemplos seed de `AIRecommendation` (plan, checklist, presupuesto) con `accepted=true` para demostrar la validación humana. | SEED | Sistema | Should Have | MVP | Derivado | UC-DEMO-001 | BR-AI-007. |
| FR-SEED-007 | El sistema debe permitir resetear y volver a cargar los datos seed mediante un solo comando reproducible. | SEED | Sistema | Must Have | MVP | Explícito | UC-DEMO-001 | Doc 3 §14.4. |
| FR-DEMO-001 | El sistema debe soportar una demo guiada de 10–15 minutos cubriendo los 5 flujos principales (organizador, proveedor, admin, IA, cotización). | DEMO | Sistema | Must Have | MVP | Explícito | UC-DEMO-001 | Doc 3 §14.4. |
| FR-DEMO-002 | El sistema debe permitir alternar entre `OpenAIProvider` y `MockAIProvider` mediante la variable `LLM_PROVIDER` para demostrar la abstracción IA. | DEMO | Sistema | Must Have | MVP | Explícito | UC-DEMO-001 | BR-AI-005/006; FR-AI-016. |
| FR-DEMO-003 | El sistema debe garantizar que la demo funcione 100% offline con `MockAIProvider` y datos seed. | DEMO | Sistema | Must Have | MVP | Explícito | UC-DEMO-001 | BR-AI-006; Doc 3 §8.4. |

---

## 28. Requerimientos funcionales de IA — Detalle consolidado

Esta sección consolida el detalle funcional por feature IA del MVP, alineado con `/docs/7-AI-Features-Specification.md`.

### 28.1 Regla canónica transversal

> Ninguna salida IA se convierte en `Event`, `EventTask`, `BudgetItem`, `QuoteRequest`, `Quote`, `Review`, `VendorProfile`, `BookingIntent` o acción admin oficial hasta que un usuario humano la confirme explícitamente. La IA actúa siempre como copiloto sugerente.

La IA NO puede en MVP:

- Decidir contrataciones finales de proveedores.
- Procesar pagos o ejecutar transferencias.
- Aprobar/rechazar `VendorProfile` autónomamente.
- Moderar reseñas automáticamente.
- Crear `BookingIntent` o `Quote` sin intervención humana.
- Generar contratos legales o firmas electrónicas.
- Enviar mensajes externos (WhatsApp/SMS/Email transaccional real).
- Sustituir la aprobación del administrador.

### 28.2 Estrategia de provider canónica

```text
AIProvider/LLMProvider interface (obligatorio)
  ├── OpenAIProvider — funcional principal en MVP
  ├── MockAIProvider — funcional obligatorio para demo/testing/fallback
  └── AnthropicProvider — stub no funcional en MVP (Future)

Selector dinámico de provider en UI: NO requerido en MVP
Failover automático OpenAI → Anthropic: NO requerido en MVP
Comparación OpenAI vs Anthropic en tiempo real: NO requerida en MVP
Selección por variable de entorno LLM_PROVIDER: `openai | mock`
```

### 28.3 Timeout y fallback canónico

> Si una invocación IA supera 60.000 ms (1 minuto), el sistema debe detener la espera y mostrar un error controlado al usuario. Si el modo demo/testing está habilitado (`LLM_PROVIDER=mock` o `AI_FALLBACK_ENABLED=true`), el sistema degrada automáticamente a `MockAIProvider` y marca `AIRecommendation.fallback_used=true`.

### 28.4 Detalle por feature IA

#### AI-001 — Generación de plan IA del evento

| Campo | Valor |
|---|---|
| Feature | Generación de plan IA del evento |
| Requirement | FR-AI-001 |
| Primary user | Organizador |
| Input | `event_type_code`, `event_date`, `guests_count`, `estimated_budget`, `location`, `language` |
| Output | Timeline macro + categorías de proveedor sugeridas (estructurado JSON) |
| Human validation | Aceptar / editar / regenerar antes de persistir entidades oficiales |
| Persistence | `AIRecommendation(type='event_plan', accepted=false)` hasta confirmación |
| Fallback | Plantilla estática por `EventType` cuando el provider falla o expira |
| Provider strategy | OpenAI primario, Mock fallback obligatorio |
| Timeout | 60.000 ms |
| Related entity | `AIRecommendation`, `Event`, `EventType` |
| Related use case | UC-AI-001 |
| Acceptance notes | Output editable; `language` respetado; fallback registra `fallback_used=true`. |

#### AI-002 — Generación de checklist IA

| Campo | Valor |
|---|---|
| Feature | Generación de checklist IA |
| Requirement | FR-AI-002 |
| Primary user | Organizador |
| Input | Plan aprobado + `event_type_code` + `event_date` |
| Output | Tareas con fechas relativas (T-180, T-90, T-30, T-7, T-1) |
| Human validation | Aceptar individualmente o en bloque; convertir en `EventTask` con `ai_generated=true` |
| Persistence | `AIRecommendation(type='checklist')` + creación condicional de `EventTask` |
| Fallback | Plantilla estática por `EventType` |
| Provider strategy | OpenAI primario, Mock fallback obligatorio |
| Timeout | 60.000 ms |
| Related entity | `AIRecommendation`, `EventTask` |
| Related use case | UC-AI-002 |
| Acceptance notes | Tareas convertidas a fechas absolutas mediante `event_date`; tareas marcadas `pending` hasta confirmación. |

#### AI-003 — Sugerencia IA de distribución de presupuesto

| Campo | Valor |
|---|---|
| Feature | Sugerencia IA de distribución de presupuesto |
| Requirement | FR-AI-003 |
| Primary user | Organizador |
| Input | `estimated_budget` + `event_type_code` + `guests_count` + `currency` + `language` |
| Output | Distribución por categoría con porcentajes y montos sugeridos |
| Human validation | Editable antes de guardar; cada línea aceptada se crea como `BudgetItem` con `ai_generated=true` |
| Persistence | `AIRecommendation(type='budget_suggestion')` + creación condicional de `BudgetItem` |
| Fallback | Porcentajes estáticos por `EventType` |
| Provider strategy | OpenAI primario, Mock fallback obligatorio |
| Timeout | 60.000 ms |
| Related entity | `AIRecommendation`, `Budget`, `BudgetItem`, `ServiceCategory` |
| Related use case | UC-AI-003 |
| Acceptance notes | Todas las cifras en moneda del evento; suma de porcentajes ≈ 100% (con tolerancia). |

#### AI-004 — Recomendación IA de categorías de proveedor

| Campo | Valor |
|---|---|
| Feature | Recomendación IA de categorías de proveedor |
| Requirement | FR-AI-004 |
| Primary user | Organizador |
| Input | `event_type_code` + `estimated_budget` + `language` |
| Output | Lista priorizada de `ServiceCategory` con justificación corta |
| Human validation | Lectura asistida; selección discrecional para enviar `QuoteRequest` |
| Persistence | `AIRecommendation(type='vendor_categories')` |
| Fallback | Lista estática por `EventType` |
| Provider strategy | OpenAI primario, Mock fallback obligatorio |
| Timeout | 60.000 ms |
| Related entity | `AIRecommendation`, `ServiceCategory` |
| Related use case | UC-AI-004 |
| Acceptance notes | Categorías sugeridas existen en el catálogo activo; no crea categorías. |

#### AI-005 — Generación IA de brief de cotización

| Campo | Valor |
|---|---|
| Feature | Generación IA de brief de cotización |
| Requirement | FR-AI-005 |
| Primary user | Organizador |
| Input | Datos del evento + categoría objetivo + `language` |
| Output | Brief estructurado (fecha, ubicación, invitados, presupuesto referencial, requerimientos específicos) |
| Human validation | Editable antes de enviar como `QuoteRequest.brief` |
| Persistence | `AIRecommendation(type='quote_brief')`; el brief final se persiste en `QuoteRequest` |
| Fallback | Plantilla estática por categoría |
| Provider strategy | OpenAI primario, Mock fallback obligatorio |
| Timeout | 60.000 ms |
| Related entity | `AIRecommendation`, `QuoteRequest` |
| Related use case | UC-AI-005, UC-QUOTE-001 |
| Acceptance notes | Brief en idioma del evento; no contiene datos confidenciales del organizador no relacionados al brief. |

#### AI-006 — Resumen IA comparativo de cotizaciones

| Campo | Valor |
|---|---|
| Feature | Resumen IA comparativo de cotizaciones |
| Requirement | FR-AI-006, FR-QUOTE-013 |
| Primary user | Organizador |
| Input | Set de `Quote` recibidas para una misma categoría + `language` |
| Output | Tabla normalizada de comparación + insights (precio, condiciones, validez, fortalezas/riesgos) |
| Human validation | Lectura asistida; no altera `Quote` originales |
| Persistence | `AIRecommendation(type='quote_comparison')` |
| Fallback | Ninguno (feature opcional Should Have) |
| Provider strategy | OpenAI primario, Mock fallback opcional |
| Timeout | 60.000 ms |
| Related entity | `AIRecommendation`, `Quote` |
| Related use case | UC-AI-006, UC-QUOTE-006 |
| Acceptance notes | El resumen no recomienda contratar; solo describe diferencias. |

#### AI-007 — Generación IA de bio/paquetes del proveedor

| Campo | Valor |
|---|---|
| Feature | Generación IA de bio/paquetes del proveedor |
| Requirement | FR-AI-007 |
| Primary user | Proveedor |
| Input | Inputs básicos del proveedor (categoría, ciudad, idiomas, experiencia, paquetes) + `language` |
| Output | Biografía + descripciones de paquetes |
| Human validation | Editable antes de publicar; `VendorProfile`/`VendorService` se actualiza solo tras aceptación humana |
| Persistence | `AIRecommendation(type='vendor_bio')` |
| Fallback | Ninguno (feature opcional Could Have) |
| Provider strategy | OpenAI primario, Mock fallback opcional |
| Timeout | 60.000 ms |
| Related entity | `AIRecommendation`, `VendorProfile`, `VendorService` |
| Related use case | UC-AI-007, UC-VENDOR-001 |
| Acceptance notes | No incluye precios definitivos; el `base_price` es referencial. |

#### AI-008 — Priorización IA de tareas urgentes

| Campo | Valor |
|---|---|
| Feature | Priorización IA de tareas urgentes |
| Requirement | FR-AI-008 |
| Primary user | Organizador |
| Input | Estado actual del checklist + `event_date` + `language` |
| Output | Top 3 tareas urgentes con justificación corta |
| Human validation | Lectura asistida; no cambia estados de tareas automáticamente |
| Persistence | `AIRecommendation(type='task_prioritization')` |
| Fallback | Ninguno |
| Provider strategy | OpenAI primario, Mock fallback opcional |
| Timeout | 60.000 ms |
| Related entity | `AIRecommendation`, `EventTask` |
| Related use case | UC-AI-008 |
| Acceptance notes | Frecuencia de cálculo (bajo demanda vs por carga) queda como decisión técnica abierta. |

---

## 29. Requerimientos futuros

| Future Requirement ID | Requirement | Reason deferred | Dependency | Possible version |
|---|---|---|---|---|
| FR-FUTURE-001 | Respuesta del proveedor a reseñas | Decisión PO 8.1 #14 | Modelo de moderación adicional | v1.1 |
| FR-FUTURE-002 | Moderación automática IA de reseñas (sentiment + clasificación) | Decisión PO; admin modera manualmente en MVP | Capa IA + reglas de moderación | v2.0 |
| FR-FUTURE-003 | Análisis de sentimiento en reseñas | Decisión PO 8.1 + Doc 3 §8.2 | Capa IA | v2.0 |
| FR-FUTURE-004 | Recomendación IA de proveedores específicos | Requiere data real y feedback loop | Histórico de interacciones | v2.0 |
| FR-FUTURE-005 | Edición de reseñas tras publicación | BR-REVIEW-007; requiere auditoría adicional | Modelo de versionado de reseñas | v1.1 |
| FR-FUTURE-006 | Integración real con SMTP/proveedor de email | Email simulado en MVP | Proveedor SMTP | v1.1 |
| FR-FUTURE-007 | `AnthropicProvider` funcional con failover OpenAI ↔ Anthropic | Decisión PO 8.1 #15 | SDK Anthropic; estrategia de failover | v1.1 |
| FR-FUTURE-008 | Multi-colaboradores por evento (pareja, padres, planner) con permisos | Diferido a v1.1 | Modelo de `EventCollaborator` | v1.1 |
| FR-FUTURE-009 | Integración WhatsApp Business para notificaciones salientes | Decisión PO; canal externo | WhatsApp Business API | v1.1 |
| FR-FUTURE-010 | Calendario de disponibilidad del proveedor | Doc 3 §9 | Entidad `Availability` | v1.1 |
| FR-FUTURE-011 | Lista de invitados básica | Doc 3 §18.1 | Entidad invitados | v1.1 |
| FR-FUTURE-012 | RSVP, asignación de mesas y plano | Doc 3 §9 | Modelo de invitados y disposición | v2.0 |
| FR-FUTURE-013 | Pagos reales (tarjeta/transferencia/local) | Decisión PO; no parte del MVP | Proveedor de pagos (Stripe/local) | v2.0 |
| FR-FUTURE-014 | Comisión por contrato cerrado | Modelo comercial futuro | Pagos reales | v2.0 |
| FR-FUTURE-015 | Contratos digitales con firma electrónica | Out of MVP | Proveedor de e-signature | v2.0 |
| FR-FUTURE-016 | App móvil nativa (iOS/Android) | Doc 3 §9 | Stack móvil | v2.0 |
| FR-FUTURE-017 | Chat en tiempo real entre organizador y proveedor | Doc 3 §9 | Messaging stack | v2.0 |
| FR-FUTURE-018 | Verificación KYC automatizada de proveedores | Doc 3 §9 | Proveedor KYC | v2.0 |
| FR-FUTURE-019 | Integración con calendarios externos (Google/Outlook/Apple) | Doc 3 §9 | Conectores | v1.1 |
| FR-FUTURE-020 | Galería destacada premium del proveedor (boost en directorio) | Modelo freemium futuro | Suscripción real | Futuro comercial |
| FR-FUTURE-021 | Suscripción real para proveedores | Modelo freemium futuro | Pasarela de pago | Futuro comercial |
| FR-FUTURE-022 | Resumen ejecutivo del evento generado por IA | Bajo valor para MVP (Doc 3 §8.2) | Capa IA | v1.1 |
| FR-FUTURE-023 | Detección IA de inconsistencias presupuesto vs cotizaciones | Doc 3 §8.2 | Capa IA | v1.1 |
| FR-FUTURE-024 | Jerarquía profunda de categorías (>2 niveles) | Decisión PO 8.1 #18 | Refactor del modelo | v1.1 |
| FR-FUTURE-025 | Multi-rol simultáneo por usuario | BR-AUTH-005; Future | Refactor de modelo de roles | v1.1 |
| FR-FUTURE-026 | Cache configurable de outputs IA por hash de input | BR-AI-013; Could Have | Capa IA | v1.1 |

---

## 30. Funcionalidades explícitamente fuera de alcance

| Out-of-Scope ID | Functionality | Source evidence | Reason excluded from MVP | Risk if included now |
|---|---|---|---|---|
| FR-OOS-001 | Procesamiento real de pagos | Doc 3 §9; BR-BOOKING-004 | No es transaccional; demo no lo requiere | Riesgo legal, PCI, complejidad |
| FR-OOS-002 | Comisión real por contrato cerrado | Doc 3 §9 | Modelo comercial no activo en MVP | Requiere pagos reales |
| FR-OOS-003 | Facturación o manejo fiscal complejo | Doc 3 §9 | No transaccional | Cumplimiento por país |
| FR-OOS-004 | Generación o firma de contratos legales | Doc 3 §9; BR-BOOKING-005 | Riesgo legal | Cumplimiento local |
| FR-OOS-005 | WhatsApp para notificaciones | Doc 3 §9; BR-NOTIF-006 | Canal externo, costo y aprobaciones | Aprobación Meta |
| FR-OOS-006 | App nativa iOS/Android | Doc 3 §9 | Web responsive cubre demo | Stack adicional |
| FR-OOS-007 | Chat en tiempo real / módulo de mensajería | Doc 3 §9 | Brief estructurado cubre el caso | Latencia y moderación |
| FR-OOS-008 | Verificación automatizada KYC de proveedores | Doc 3 §9 | Manual por admin | Proveedor KYC externo |
| FR-OOS-009 | Análisis de sentimiento IA en reseñas | Doc 3 §8.2; BR-REVIEW-006 | Moderación manual MVP | Calidad del modelo |
| FR-OOS-010 | Moderación automática IA de contenido | Doc 3 §8.2; BR-REVIEW-006 | Decisión humana obligatoria | Falsos positivos/negativos |
| FR-OOS-011 | Aprobación autónoma de proveedores por IA | BR-AI-004 | Gobernanza requiere humano | Errores costosos |
| FR-OOS-012 | Booking/pago autónomo por IA | BR-AI-004 | Validación humana obligatoria | Compromisos no deseados |
| FR-OOS-013 | Marketplace transaccional completo | Doc 3 §9 (decisión estratégica) | Workspace + cotización, no marketplace | Sobre-alcance |
| FR-OOS-014 | Geolocalización avanzada / planificación de rutas | Doc 3 §9 | Fuera del foco | Costo de mapas |
| FR-OOS-015 | Integración con calendarios externos (Google/Outlook/Apple) | Doc 3 §9 | Diferido | OAuth + APIs externas |
| FR-OOS-016 | RSVP / lista de invitados / plano de mesas | Doc 3 §9 | Fuera del foco | Sobre-alcance |
| FR-OOS-017 | Conversión automática de moneda | Doc 3 §9; BR-BUDGET-007 | Sin operación FX | Pricing y tipo de cambio |
| FR-OOS-018 | Cumplimiento legal país-específico (LFPDPPP, LOPD, etc.) | Doc 3 §9 | Solo buenas prácticas en MVP | Asesoría legal por país |
| FR-OOS-019 | Generación IA de imágenes / decoración | Doc 3 §8.2; BR-AI-015 | Sin valor demo crítico | Costo y moderación |
| FR-OOS-020 | Chatbot conversacional libre | Doc 3 §8.2; BR-AI-014 | IA scoped por feature | Alucinaciones |
| FR-OOS-021 | Push notifications / SMS | Doc 3 §9; BR-NOTIF-007 | Out of scope MVP | Proveedor externo |
| FR-OOS-022 | Co-organizadores / multi-usuario en un evento | Doc 3 §9 (v1.1) | Diferido | Refactor de permisos |

---

## 31. Reglas funcionales críticas

Estas reglas son **inviolables** durante el MVP y deben respaldarse en validaciones de backend, UI y/o jobs automáticos:

| # | Regla crítica | Sustento |
|---:|---|---|
| 1 | El sistema NO procesa pagos reales ni captura medios de pago. | BR-BOOKING-004; FR-BOOKING-007. |
| 2 | El sistema NO genera ni firma contratos legales. | BR-BOOKING-005; FR-OOS-004. |
| 3 | Ninguna salida IA se vuelve dato oficial sin confirmación humana explícita. | BR-AI-001; FR-AI-012. |
| 4 | La moneda del evento es inmutable tras creación. | BR-EVENT-007; FR-EVENT-003. |
| 5 | El captcha/anti-bot es obligatorio en registro y login. | BR-AUTH-011; FR-AUTH-002. |
| 6 | El timeout IA es de 1 minuto con fallback controlado. | BR-AI-009; FR-AI-009. |
| 7 | El rating de reseñas usa escala entera 1–5 (5=mejor). | BR-REVIEW-003; FR-REVIEW-002. |
| 8 | Hasta 10 imágenes por trabajo en portafolio del proveedor. | BR-VENDOR-005; FR-VENDOR-006. |
| 9 | Máximo 5 cambios de categoría acumulados por proveedor. | BR-VENDOR-004; FR-VENDOR-004. |
| 10 | Validez default de Quote = 15 días calendario. | BR-QUOTE-015; FR-QUOTE-005. |
| 11 | Máximo 5 `QuoteRequest` activas por categoría por evento. | BR-QUOTE-009; FR-QUOTE-002. |
| 12 | El evento se auto-completa 2 días calendario después de `event_date`. | BR-EVENT-013; FR-EVENT-009. |
| 13 | Las reseñas usan soft delete con auditoría obligatoria; sin hard delete. | BR-REVIEW-005; FR-REVIEW-004/005. |
| 14 | Los attachments usan soft delete obligatorio. | BR-PRIVACY-011; FR-VENDOR-008. |
| 15 | El admin no edita eventos de organizadores. | BR-EVENT-014; FR-ADMIN-010. |
| 16 | El admin no elimina físicamente `EventType` con eventos asociados. | BR-EVENTTYPE-007; FR-ADMIN-007. |
| 17 | Jerarquía de categorías máx 2 niveles. | BR-SERVICE-005; FR-SERVICE-002. |
| 18 | `BookingIntent` confirmado se puede cancelar sin penalización en plataforma. | BR-BOOKING-009; FR-BOOKING-004. |
| 19 | Cada acción admin queda registrada en `AdminAction` de forma inmutable. | BR-ADMIN-004; FR-ADMIN-006. |
| 20 | `AnthropicProvider` no es funcional en MVP. | BR-AI-005; FR-AI-015. |

---

## 32. Validaciones funcionales principales

| Área | Validación | Aplicación | Referencia |
|---|---|---|---|
| Campos obligatorios | Validar email, nombre, contraseña, rol al registrarse; validar tipo, fecha, ciudad, invitados, presupuesto, moneda, idioma al crear evento. | Backend + UI | FR-AUTH-001; FR-EVENT-001. |
| Captcha/anti-bot | Verificar token captcha válido en registro y login antes de procesar la solicitud. | Backend | FR-AUTH-002. |
| Ownership | Verificar que el `Event`, `EventTask`, `Budget`, `BudgetItem`, `QuoteRequest`, `Review` pertenecen al usuario autenticado antes de mutar. | Backend | FR-EVENT-002; FR-QUOTE-014. |
| Acceso por rol | Devolver 403 cuando un organizador intenta operar como proveedor o acceder al panel admin. | Backend + middleware | FR-AUTH-008/009. |
| Transiciones de estado | Validar transiciones válidas en `Event`, `EventTask`, `QuoteRequest`, `Quote`, `BookingIntent`, `Review`. | Backend | FR-EVENT-005; FR-TASK-004; FR-QUOTE-006/007; FR-BOOKING-002. |
| Validación IA | Bloquear persistencia de entidades reales desde IA hasta `AIRecommendation.accepted=true`. | Backend | FR-AI-012. |
| Timeout IA | Cancelar invocación IA al superarse 60.000 ms y aplicar fallback o error controlado. | Backend | FR-AI-009. |
| Visibilidad Quote/QuoteRequest | Devolver 404/403 cuando un usuario consulta una `Quote`/`QuoteRequest` que no le corresponde. | Backend | FR-QUOTE-014. |
| Validez default de Quote | Asignar `valid_until = created_at + 15 días` si el proveedor no lo especifica. | Backend | FR-QUOTE-005. |
| Límite de QuoteRequest activas | Rechazar creación si ya existen 5 activas en la categoría para el evento. | Backend | FR-QUOTE-002. |
| Visibilidad de proveedores | Filtrar `VendorProfile.status=approved` en el directorio público. | Backend | FR-VENDOR-003. |
| Cambios de categoría | Rechazar si `category_change_count >= 5`; marcar `requires_admin_review` cuando aplique. | Backend | FR-VENDOR-004/005. |
| Imágenes por trabajo | Rechazar carga si la cantidad de attachments con el mismo `work_label` ya es 10. | Backend | FR-VENDOR-006. |
| Rating de reseña | Validar entero entre 1 y 5; rechazar valores fuera del rango. | Backend | FR-REVIEW-002. |
| Moderación de reseña | Bloquear hard delete; permitir solo soft delete con auditoría. | Backend | FR-REVIEW-004/005. |
| Cancelación BookingIntent | Permitir cancelación desde `pending` y `confirmed_intent`; registrar trazas. | Backend | FR-BOOKING-004/005. |
| Cierre automático evento | Marcar `completed`, `completed_at`, `auto_completed=true` 2 días post `event_date`. | Job programado | FR-EVENT-009. |
| Inmutabilidad de moneda | Bloquear updates de `Event.currency_code`. | Backend | FR-EVENT-003. |
| Idioma | Validar `language_code` ∈ {es-LATAM, es-ES, pt, en}. | Backend | FR-I18N-001. |
| Moneda | Validar `currency_code` ∈ catálogo soportado. | Backend | FR-BUDGET-009. |
| Seed/demo | Garantizar reproducibilidad del seed mediante script único. | Backend | FR-SEED-007. |
| Restricciones MVP | Bloquear cualquier endpoint o flujo de WhatsApp, pagos reales, contratos, chat tiempo real, app nativa, conversión de moneda, calendarios externos. | Backend + UI | §30 Out of Scope. |

---

## 33. Matriz de trazabilidad funcional

Esta matriz vincula los principales requerimientos funcionales con sus casos de uso, reglas de negocio, permisos, entidades, features IA y fuente documental.

| Requirement ID | Related use case | Related business rule | Related permission (Doc 5) | Related entity | Related AI feature | Source document |
|---|---|---|---|---|---|---|
| FR-AUTH-001 | UC-AUTH-001 | BR-AUTH-001/002 | §11 Organizer / §12 Vendor (registro) | User | — | Doc 3 §7.1; Doc 4 §7; Doc 8 |
| FR-AUTH-002 | UC-AUTH-001, UC-AUTH-002 | BR-AUTH-011 | §17.bis Sistema (captcha) | User | — | Doc 4 §7; Doc 6 C-059; Addendum 8.1 #8 |
| FR-AUTH-003 | UC-AUTH-002 | BR-AUTH-001/003 | §17.bis Sistema | User, Session | — | Doc 4 §7 |
| FR-AUTH-007 | UC-AUTH-001 | BR-AUTH-005 | §11/§12/§13 | User, Role | — | Doc 6 C-045 |
| FR-AUTH-008 | UC-AUTH-004 | BR-AUTH-009/010 | §8/§9 | User, Role | — | Doc 5 §8 |
| FR-USER-003 | UC-I18N-001 | BR-USER-006 | §11/§12/§13 | User | — | Doc 6 C-046 |
| FR-EVENT-001 | UC-EVENT-001 | BR-EVENT-001/003 | §9.3 Event Organizer (create) | Event, EventType, Location | — | Doc 8 UC-EVENT-001 |
| FR-EVENT-002 | UC-EVENT-001 | BR-EVENT-001 | §9.3 owner | Event | — | Doc 6 C-002 |
| FR-EVENT-003 | UC-EVENT-001, UC-BUDGET-004 | BR-EVENT-007, BR-BUDGET-006 | §17 (moneda) | Event, Budget | — | Addendum 8.1 #7; Doc 6 C-006 |
| FR-EVENT-005 | UC-EVENT-002, UC-EVENT-005 | BR-EVENT-005 | §9.3 owner | Event | — | Doc 6 C-005/C-047 |
| FR-EVENT-009 | UC-EVENT-005 | BR-EVENT-013 | §17.bis Sistema (job) | Event | — | Addendum 8.1 #6; Doc 6 C-048/C-056 |
| FR-EVENT-010 | UC-ADMIN-002 | BR-EVENT-014 | §13 Admin | Event, AdminAction | — | Addendum 8.1 #16 |
| FR-AI-001 | UC-AI-001 | BR-AI-001..009 | §14 IA | AIRecommendation, Event | AI-001 | Doc 7 §20–§22 |
| FR-AI-002 | UC-AI-002 | BR-AI-001, BR-TASK-006 | §14 IA | AIRecommendation, EventTask | AI-002 | Doc 7 |
| FR-AI-003 | UC-AI-003 | BR-AI-001, BR-BUDGET-008 | §14 IA | AIRecommendation, Budget, BudgetItem | AI-003 | Doc 7 |
| FR-AI-005 | UC-AI-005, UC-QUOTE-001 | BR-AI-001, BR-QUOTE-002 | §14 IA + §9.x QuoteRequest | AIRecommendation, QuoteRequest | AI-005 | Doc 7 |
| FR-AI-006 | UC-AI-006, UC-QUOTE-006 | BR-QUOTE-023/024 | §14 IA + §9.x Quote | AIRecommendation, Quote | AI-006 | Doc 7 |
| FR-AI-009 | UC-AI-001..009 | BR-AI-009 | §17.bis Sistema (timeout) | AIRecommendation | All AI | Addendum 8.1 #9; Doc 7 §22 |
| FR-AI-012 | UC-AI-001..009 | BR-AI-001/004 | §14 IA | AIRecommendation, all derived entities | All AI | Doc 4 §11 |
| FR-AI-014/015 | UC-AI-001..009 | BR-AI-005 | §14 IA | AIRecommendation | All AI | Addendum 8.1 #15; Doc 7 §20 |
| FR-TASK-004 | UC-TASK-003 | BR-TASK-004 | §9.x EventTask Organizer | EventTask | — | Doc 6 C-027 |
| FR-TASK-005 | UC-TASK-004 | BR-TASK-003 | §9.x EventTask Organizer | EventTask, AIRecommendation | AI-002 | Doc 8 UC-TASK-004 |
| FR-TASK-008 | UC-AI-002 | BR-TASK-006 | §9.x EventTask | EventTask | AI-002 | Doc 6 C-028 |
| FR-BUDGET-002 | UC-EVENT-001, UC-BUDGET-004 | BR-EVENT-007, BR-BUDGET-006 | §9.x Budget Organizer | Event, Budget | — | Addendum 8.1 #7 |
| FR-BUDGET-005 | UC-BUDGET-001 | BR-BUDGET-004 | §17.bis Sistema | Budget, BudgetItem | — | Doc 4 §13 |
| FR-VENDOR-004 | UC-VENDOR-002 | BR-VENDOR-004 | §9.x VendorProfile Vendor + Admin | VendorProfile | — | Addendum 8.1 #3; Doc 6 C-011 |
| FR-VENDOR-006 | UC-VENDOR-005 | BR-VENDOR-005 | §9.x VendorProfile Vendor | VendorProfile, Attachment (vendor_work) | — | Addendum 8.1 #2; Doc 6 C-038 |
| FR-VENDOR-008 | UC-VENDOR-005 | BR-PRIVACY-011 | §17.bis Sistema (soft delete) | Attachment | — | Addendum 8.1 #19; Doc 6 C-037/C-060 |
| FR-VENDOR-010 | UC-ADMIN-004 | BR-VENDOR-003 | §13 Admin (approve vendor) | VendorProfile, AdminAction | — | Doc 6 C-010 |
| FR-VENDOR-012 | UC-VENDOR-007 | BR-REVIEW-008 | §9.x Review Vendor (read-only) | Review, VendorProfile | — | Addendum 8.1 #14 |
| FR-SERVICE-002 | UC-ADMIN-007 | BR-SERVICE-005, BR-ADMIN-012 | §13 Admin (categories) | ServiceCategory | — | Addendum 8.1 #18; Doc 6 C-013 |
| FR-QUOTE-002 | UC-QUOTE-001 | BR-QUOTE-009 | §17.bis Sistema (límite) | QuoteRequest | — | Addendum 8.1 #12; Doc 6 C-016 |
| FR-QUOTE-005 | UC-QUOTE-004 | BR-QUOTE-015 | §17.bis Sistema (default 15 días) | Quote | — | Addendum 8.1 #4; Doc 6 C-019 |
| FR-QUOTE-009 | UC-QUOTE-010 | BR-QUOTE-016, BR-NOTIF-002 | §17.bis Sistema (expiración) | Quote, Notification | — | Addendum 8.1 #13 |
| FR-QUOTE-010 | UC-QUOTE-009 | BR-NOTIF-002 | §9.x Notification | Quote, Notification | — | Addendum 8.1 #13 |
| FR-QUOTE-011 | UC-QUOTE-006 | BR-QUOTE-021 | §9.x Quote Organizer | Quote | AI-006 | Doc 8 UC-QUOTE-006 |
| FR-BOOKING-004 | UC-BOOKING-003 | BR-BOOKING-009 | §9.x BookingIntent (cancel) | BookingIntent | — | Addendum 8.1 #5; Doc 6 C-056 |
| FR-BOOKING-008 | UC-BOOKING-002, UC-BOOKING-003 | BR-BOOKING-008, BR-BUDGET-005 | §17.bis Sistema | BookingIntent, BudgetItem | — | Doc 4 §13/§19 |
| FR-REVIEW-001 | UC-REVIEW-001 | BR-REVIEW-001 | §9.x Review Organizer | Review, BookingIntent | — | Doc 4 §20 |
| FR-REVIEW-002 | UC-REVIEW-001 | BR-REVIEW-003 | §17.bis Sistema (validación) | Review | — | Addendum 8.1 #1; Doc 6 C-024 |
| FR-REVIEW-004 | UC-REVIEW-003 | BR-REVIEW-005, BR-ADMIN-003/011 | §13 Admin (moderate) | Review, AdminAction | — | Addendum 8.1 #11; Doc 6 C-057 |
| FR-NOTIF-004 | UC-QUOTE-009/010 | BR-NOTIF-002 | §9.x Notification + §17.bis Sistema | Notification, Quote | — | Addendum 8.1 #13 |
| FR-I18N-001 | UC-I18N-001 | BR-USER-006, BR-EVENT-008 | §11/§12/§13 | User, Event | — | Doc 3 §7.15 |
| FR-ADMIN-002 | UC-ADMIN-002 | BR-ADMIN-005 | §13 Admin | AdminAction, métricas agregadas | — | Addendum 8.1 #10 |
| FR-ADMIN-004 | UC-ADMIN-007 | BR-ADMIN-002/012 | §13 Admin (categories) | ServiceCategory | — | Addendum 8.1 #18 |
| FR-ADMIN-005 | UC-ADMIN-008 | BR-ADMIN-003/011, BR-REVIEW-005 | §13 Admin (moderate review) | Review, AdminAction | — | Addendum 8.1 #11 |
| FR-ADMIN-006 | UC-ADMIN-009 | BR-ADMIN-004 | §17.bis Sistema | AdminAction | — | Doc 6 C-039..C-041 |
| FR-ADMIN-007 | UC-ADMIN-007 | BR-EVENTTYPE-007 | §13 Admin (EventType) | EventType, AdminAction | — | Addendum 8.1 #17; Doc 6 C-026c |
| FR-SEED-007 | UC-DEMO-001 | BR-SEED-001 | §17.bis Sistema | All seed entities | — | Doc 3 §7.16 |
| FR-DEMO-002 | UC-DEMO-001 | BR-AI-005/006 | §17.bis Sistema | AIRecommendation | All AI | Doc 3 §8.4 |

> Esta matriz no es exhaustiva — cubre los requerimientos cuyas trazas resultan más sensibles para QA, evaluación académica y validación de decisiones del PO. Los requerimientos no listados explícitamente heredan la trazabilidad del módulo correspondiente (Doc 4 §X, Doc 8 UC-X-XXX).

---

## 34. Matriz de restricciones MVP

| Restricted capability | Source classification | MVP status | Allowed as MVP requirement? | Reason | Future consideration |
|---|---|---|---|---|---|
| Pagos reales / procesamiento de pagos | Out of Scope (Doc 3 §9; BR-BOOKING-004) | No incluido | No | El MVP es workspace + cotización, no transaccional. | v2.0 con pasarela real |
| Comisión real | Out of Scope (Doc 3 §9) | No incluido | No | Modelo comercial futuro. | v2.0 |
| Facturación / impuestos | Out of Scope (Doc 3 §9) | No incluido | No | Cumplimiento por país complejo. | Roadmap |
| Contratos legales con firma electrónica | Out of Scope (BR-BOOKING-005) | No incluido | No | Riesgo legal. | v2.0 |
| Integración WhatsApp | Out of Scope (Doc 3 §9; BR-NOTIF-006) | No incluido | No | Canal externo, costos. | v1.1 |
| Notificaciones push / SMS | Out of Scope (BR-NOTIF-007) | No incluido | No | Diferido. | v1.1+ |
| Native mobile app (iOS/Android) | Out of Scope (Doc 3 §9) | No incluido | No | Web responsive cubre demo. | v2.0 |
| Chat en tiempo real | Out of Scope (Doc 3 §9) | No incluido | No | Brief estructurado cubre el caso. | v2.0 |
| Verificación KYC automatizada | Out of Scope (Doc 3 §9) | No incluido | No | Admin aprueba manualmente. | v2.0 |
| Análisis de sentimiento IA | Future (Doc 3 §8.2; BR-REVIEW-006) | Diferido | Only as Future | Moderación manual MVP. | v2.0 |
| Moderación automática IA | Future (BR-REVIEW-006) | Diferido | Only as Future | Decisión humana obligatoria. | v2.0 |
| Decisiones IA autónomas (aprobar vendor, contratar, pagar, eliminar review) | Out of Scope (BR-AI-004) | No incluido | No | Validación humana obligatoria. | No previsto |
| Marketplace transaccional completo | Out of Scope (decisión estratégica) | No incluido | No | EventFlow es workspace + cotización. | v2.0 |
| Geolocalización avanzada / rutas | Out of Scope (Doc 3 §9) | No incluido | No | Fuera del foco. | Roadmap |
| Integración con calendarios externos (Google/Outlook/Apple) | Future/Out of Scope (Doc 3 §9) | Diferido | Only as Future | Conectores OAuth externos. | v1.1 |
| Multi-colaboradores por evento | Future (Doc 3 §9; BR-USER-004) | Diferido | Only as Future | Refactor de permisos. | v1.1 |
| Lista de invitados / RSVP / plano de mesas | Out of Scope (Doc 3 §9) | No incluido | No | Sobre-alcance. | v2.0 |
| Conversión automática de moneda | Out of Scope (BR-BUDGET-007) | No incluido | No | Sin operación FX. | Future |
| `AnthropicProvider` funcional | Future (BR-AI-005; Addendum 8.1 #15) | Diferido (stub) | Only as Future | Stub aceptable en MVP. | v1.1 |
| Respuesta del proveedor a reseñas | Future (BR-REVIEW-008; Addendum 8.1 #14) | Diferido | Only as Future | Confirmado por PO. | v1.1 |
| Edición de reseñas publicadas | Future (BR-REVIEW-007) | Diferido | Only as Future | Requiere auditoría adicional. | v1.1 |
| Jerarquía profunda de categorías (>2 niveles) | Future (Addendum 8.1 #18) | No incluido | No | Mantener simplicidad. | v1.1 |

---

## 35. Criterios de aceptación funcional por módulo

| Module | Acceptance Criteria ID | Criteria | Related requirement |
|---|---|---|---|
| AUTH | AC-AUTH-001 | Dado un visitante con email válido, contraseña fuerte y captcha verificado, cuando se registra como organizador, entonces el usuario queda creado con rol `organizer` y email único validado. | FR-AUTH-001, FR-AUTH-002 |
| AUTH | AC-AUTH-002 | Dado un visitante con credenciales válidas y captcha verificado, cuando inicia sesión, entonces obtiene una sesión activa hasta logout o expiración. | FR-AUTH-002, FR-AUTH-003, FR-AUTH-004 |
| AUTH | AC-AUTH-003 | Dado un usuario sin rol `admin`, cuando intenta acceder al panel admin, entonces recibe 403 y no ve datos sensibles. | FR-AUTH-009 |
| USER | AC-USER-001 | Dado un usuario autenticado, cuando consulta su perfil, entonces ve email, nombre, rol e idioma preferido. | FR-USER-001 |
| USER | AC-USER-002 | Dado un usuario que cambia su idioma preferido, cuando guarda el cambio, entonces la UI se renderiza inmediatamente en el nuevo idioma. | FR-USER-003, FR-I18N-002 |
| EVENT | AC-EVENT-001 | Dado un organizador autenticado, cuando crea un evento con datos válidos (tipo, fecha, ciudad, invitados, presupuesto, moneda, idioma), entonces el evento se guarda con `status='draft'` y se asocia al organizador. | FR-EVENT-001, FR-EVENT-002 |
| EVENT | AC-EVENT-002 | Dado un evento ya creado, cuando el organizador intenta cambiar la moneda, entonces el sistema impide la modificación y muestra mensaje claro. | FR-EVENT-003, FR-BUDGET-002 |
| EVENT | AC-EVENT-003 | Dado un evento cuya `event_date` fue alcanzada hace 2 días, cuando se ejecuta el job programado, entonces el sistema marca `status='completed'`, `auto_completed=true`, `completed_at=<timestamp>`. | FR-EVENT-009 |
| EVENT | AC-EVENT-004 | Dado un administrador, cuando consulta el detalle de un evento, entonces el sistema registra `AdminAction(action='view_event', user_id=admin, entity_id=event_id)`. | FR-EVENT-010, FR-ADMIN-008 |
| AI | AC-AI-001 | Dado un organizador con evento `active`, cuando solicita "Generar plan", entonces el sistema crea un `AIRecommendation(type='event_plan', accepted=false)` con timeout ≤ 60.000 ms. | FR-AI-001, FR-AI-009, FR-AI-010 |
| AI | AC-AI-002 | Dado un checklist IA generado, cuando el organizador acepta las tareas seleccionadas, entonces solo las tareas aceptadas se convierten en `EventTask` con `ai_generated=true` y `status='pending'`. | FR-AI-002, FR-TASK-005, FR-TASK-012 |
| AI | AC-AI-003 | Dado el modo `LLM_PROVIDER=mock` o un timeout IA, cuando el provider real falla, entonces el sistema degrada a `MockAIProvider` y persiste `AIRecommendation.fallback_used=true`. | FR-AI-009, FR-AI-014..016 |
| AI | AC-AI-004 | Dado un `AIRecommendation` sin confirmar, cuando el sistema recibe una solicitud de persistir entidades reales, entonces rechaza la operación hasta `accepted=true`. | FR-AI-012 |
| TASK | AC-TASK-001 | Dado un evento `active`, cuando el organizador cambia el estado de una tarea, entonces solo se aceptan transiciones válidas (`pending → in_progress → done | skipped`). | FR-TASK-004 |
| TASK | AC-TASK-002 | Dado un evento `cancelled`, cuando se intenta cambiar el estado de una tarea, entonces el sistema rechaza la operación. | FR-TASK-011 |
| BUDGET | AC-BUDGET-001 | Dado un presupuesto con `committed > total`, cuando se renderiza el dashboard, entonces se muestra warning visible no bloqueante. | FR-BUDGET-005 |
| BUDGET | AC-BUDGET-002 | Dado un `BookingIntent` que pasa a `confirmed_intent`, cuando el sistema procesa el cambio, entonces actualiza `BudgetItem.committed` de la categoría correspondiente. | FR-BUDGET-006, FR-BOOKING-008 |
| VENDOR | AC-VENDOR-001 | Dado un proveedor que intenta cambiar categorías por sexta vez, cuando ejecuta la acción, entonces el sistema rechaza el cambio y mantiene `category_change_count=5`. | FR-VENDOR-004 |
| VENDOR | AC-VENDOR-002 | Dado un proveedor que ya cargó 10 imágenes con `work_label='boda-pareja-001'`, cuando intenta cargar una imagen adicional con el mismo `work_label`, entonces el sistema rechaza la carga. | FR-VENDOR-006 |
| VENDOR | AC-VENDOR-003 | Dado un attachment eliminado por el usuario o admin, cuando consulta el directorio público, entonces la imagen no se muestra (status `deleted`) pero la metadata se conserva. | FR-VENDOR-008 |
| SERVICE | AC-SERVICE-001 | Dado un administrador que intenta crear una categoría hija de una subcategoría existente, cuando ejecuta la acción, entonces el sistema rechaza la operación por superar el nivel 2 de jerarquía. | FR-SERVICE-002 |
| QUOTE | AC-QUOTE-001 | Dado un evento con 5 `QuoteRequest` activas en la categoría `fotografia`, cuando el organizador intenta crear una sexta, entonces el sistema rechaza la solicitud. | FR-QUOTE-002 |
| QUOTE | AC-QUOTE-002 | Dado un proveedor que envía una `Quote` sin `valid_until`, cuando el sistema procesa el envío, entonces asigna `valid_until = created_at + 15 días`. | FR-QUOTE-005 |
| QUOTE | AC-QUOTE-003 | Dada una `Quote` con `valid_until` vencido, cuando se ejecuta el job de expiración, entonces se marca `status='expired'` y se notifica in-app al proveedor. | FR-QUOTE-009, FR-NOTIF-004 |
| QUOTE | AC-QUOTE-004 | Dado un organizador que rechaza una `Quote`, cuando completa la acción, entonces el sistema notifica in-app al proveedor. | FR-QUOTE-010, FR-NOTIF-004 |
| BOOKING | AC-BOOKING-001 | Dado un `BookingIntent.confirmed_intent`, cuando el organizador o el proveedor lo cancela, entonces el sistema persiste `status='cancelled'`, `cancelled_at`, `cancelled_by`, `cancellation_reason` y revierte `BudgetItem.committed`. | FR-BOOKING-004, FR-BOOKING-005, FR-BOOKING-008 |
| REVIEW | AC-REVIEW-001 | Dado un organizador con `BookingIntent.confirmed_intent` con un proveedor, cuando crea una reseña con rating entero entre 1 y 5 y comentario, entonces se publica con `status='published'`. | FR-REVIEW-001, FR-REVIEW-002 |
| REVIEW | AC-REVIEW-002 | Dado un administrador que oculta o remueve una reseña ofensiva, cuando completa la acción, entonces el sistema marca `status='hidden' | 'removed'`, registra `moderated_by`, `moderated_at`, `moderation_reason` y `admin_action_id`. | FR-REVIEW-004, FR-ADMIN-005 |
| REVIEW | AC-REVIEW-003 | Dado un proveedor, cuando intenta responder a una reseña, entonces el sistema rechaza la acción (Future). | FR-REVIEW-008 |
| NOTIF | AC-NOTIF-001 | Dada una nueva `QuoteRequest` dirigida a un proveedor, cuando se crea, entonces el proveedor recibe notificación in-app y un email simulado se loguea. | FR-NOTIF-001, FR-NOTIF-003 |
| I18N | AC-I18N-001 | Dado un evento con `language='pt'`, cuando se genera el plan IA, entonces el output IA está en portugués. | FR-I18N-005, FR-AI-017 |
| ADMIN | AC-ADMIN-001 | Dado un administrador que aprueba un proveedor, cuando completa la acción, entonces se registra `AdminAction(action='vendor_approved')` y el `VendorProfile.status='approved'`. | FR-ADMIN-003, FR-ADMIN-006 |
| ADMIN | AC-ADMIN-002 | Dado un administrador que intenta eliminar un `EventType` con eventos asociados, cuando ejecuta la acción, entonces el sistema rechaza la operación. | FR-ADMIN-007 |
| SEED | AC-SEED-001 | Dada la ejecución del script de seed, cuando finaliza, entonces existen al menos 5–10 organizadores, 10–20 proveedores, 10–15 eventos en estados `draft`/`active`/`completed`, 15–25 `QuoteRequest`, 10–20 `Quote`, 20–40 reseñas y al menos 1 `BookingIntent.confirmed_intent`. | FR-SEED-002..005 |
| DEMO | AC-DEMO-001 | Dada la variable `LLM_PROVIDER=mock`, cuando se ejecuta la demo, entonces la plataforma opera offline con MockAIProvider y datos seed. | FR-DEMO-002, FR-DEMO-003 |

---

## 36. Escenarios funcionales principales

### 36.1 Escenario funcional — Crear evento con asistencia IA

1. Organizador inicia sesión.
2. Crea evento (tipo, fecha, ciudad, invitados, presupuesto, moneda local o USD, idioma).
3. El sistema persiste el evento con `status='draft'`.
4. Organizador solicita "Generar plan IA" → el sistema invoca `LLMProvider.generateEventPlan()`.
5. Sistema persiste `AIRecommendation(type='event_plan', accepted=false)`.
6. Organizador revisa, edita y acepta el plan → `AIRecommendation.accepted=true`.
7. Organizador genera checklist IA → confirma tareas → se crean `EventTask` con `ai_generated=true`.
8. Organizador acepta distribución IA de presupuesto → se crean `BudgetItem`.
9. Organizador activa el evento (`status='active'`).
10. El dashboard muestra progreso, próximas tareas y presupuesto comprometido.

**Requerimientos involucrados:** FR-EVENT-001..014, FR-AI-001..020, FR-TASK-001..012, FR-BUDGET-001..010, FR-I18N-003/005.

### 36.2 Escenario funcional — Solicitar y comparar cotizaciones

1. Organizador abre evento `active`.
2. Visualiza recomendación IA de categorías (FR-AI-004).
3. Filtra el directorio de proveedores aprobados por categoría/ciudad.
4. Selecciona 3 proveedores → genera/edita brief IA (FR-AI-005).
5. Envía hasta 5 `QuoteRequest` activas por categoría (FR-QUOTE-002).
6. Proveedores responden con `Quote` (`valid_until` default 15 días si no se especifica).
7. Organizador ve la vista comparativa side-by-side (FR-QUOTE-011) con resumen IA opcional (FR-AI-006).
8. Marca su `Quote` preferida (FR-QUOTE-012).
9. Acepta una `Quote` y crea `BookingIntent` simulado (FR-BOOKING-001).
10. Proveedor confirma → `BookingIntent.confirmed_intent` (FR-BOOKING-003); `BudgetItem.committed` se actualiza (FR-BOOKING-008).

**Requerimientos involucrados:** FR-QUOTE-001..020, FR-BOOKING-001..010, FR-AI-004..006, FR-VENDOR-003.

### 36.3 Escenario funcional — Cancelación de BookingIntent confirmado

1. Organizador o proveedor decide cancelar un `BookingIntent.confirmed_intent`.
2. Sistema valida que la cancelación es permitida (FR-BOOKING-004).
3. Registra `cancelled_at`, `cancelled_by`, `cancellation_reason` (FR-BOOKING-005).
4. Revierte `BudgetItem.committed` (FR-BOOKING-008).
5. Notifica al organizador y al proveedor en plataforma (FR-BOOKING-010).
6. Disclaimer recuerda que cualquier penalización depende del acuerdo externo (FR-BOOKING-006).

### 36.4 Escenario funcional — Crear reseña y moderación admin

1. Tras evento, organizador con `BookingIntent.confirmed_intent` crea `Review` con rating entre 1 y 5 (FR-REVIEW-001/002).
2. Sistema persiste `Review(status='published')`.
3. Admin recibe una reseña reportada → la oculta o remueve (FR-REVIEW-004).
4. Sistema marca `status='hidden' | 'removed'` con `moderated_by`, `moderated_at`, `moderation_reason`, `admin_action_id` (FR-ADMIN-005).
5. Reseña deja de aparecer en el perfil público del proveedor (FR-REVIEW-006).

### 36.5 Escenario funcional — Cierre automático del evento

1. Job programado se ejecuta diariamente.
2. Sistema localiza eventos con `event_date <= today - 2 days` y `status='active'`.
3. Para cada evento, marca `status='completed'`, `completed_at=now`, `auto_completed=true` (FR-EVENT-009).
4. Se generan notificaciones in-app correspondientes (FR-NOTIF-001).

### 36.6 Escenario funcional — Timeout IA y fallback

1. Organizador solicita generación IA (plan, checklist, presupuesto, brief o comparación).
2. Sistema invoca el `LLMProvider` configurado.
3. Si la respuesta supera 60.000 ms (FR-AI-009):
   - En modo `LLM_PROVIDER=mock` o `AI_FALLBACK_ENABLED=true`: degrada a `MockAIProvider`, persiste `AIRecommendation.fallback_used=true`.
   - En producción real: muestra error controlado y permite reintento.
4. La UI no queda colgada; los skeleton loaders se reemplazan por la salida o el error (FR-AI-011).

---

## 37. Escenarios funcionales de demo

### Demo Scenario 1 — Organizador crea evento con asistencia IA

1. Login como organizador seed.
2. Crear evento "Boda de María — 2026-09-15" en GTQ con idioma `es-LATAM`.
3. Generar plan IA → revisar → aceptar.
4. Generar checklist IA → confirmar 8 tareas.
5. Aceptar distribución IA de presupuesto.
6. Activar evento; ver dashboard con progreso, tareas y presupuesto.

**Requerimientos:** FR-EVENT-001, FR-AI-001/002/003, FR-TASK-005, FR-BUDGET-010, FR-EVENT-008.

### Demo Scenario 2 — Organizador solicita y compara cotizaciones

1. Abrir evento "Boda de María".
2. Ver recomendación IA de categorías.
3. Buscar fotógrafos en directorio.
4. Ver perfil de "Estudio Lara" (proveedor seed aprobado).
5. Generar brief IA → editar → enviar `QuoteRequest`.
6. Repetir con otros 2 fotógrafos (máx 5 activas por categoría).
7. Ver `Quote` recibidas → abrir comparador → ver resumen IA.
8. Marcar preferred y crear `BookingIntent` simulado.
9. Demostrar cancelación de `BookingIntent` confirmado (FR-BOOKING-004).

**Requerimientos:** FR-QUOTE-001..020, FR-VENDOR-003, FR-BOOKING-001..010, FR-AI-004/005/006.

### Demo Scenario 3 — Proveedor responde a QuoteRequest

1. Login como proveedor seed.
2. Ver bandeja de `QuoteRequest` asignadas.
3. Abrir brief y responder con `Quote` (total + desglose + condiciones).
4. Demostrar que el sistema asigna `valid_until = +15 días` cuando no se especifica.
5. Recibir notificación in-app cuando organizador acepta/rechaza/expira la `Quote`.

**Requerimientos:** FR-QUOTE-008/009/010, FR-QUOTE-005, FR-NOTIF-004, FR-VENDOR-012.

### Demo Scenario 4 — Admin gobierna la plataforma

1. Login como administrador seed.
2. Aprobar 1 proveedor pendiente (registrado en `AdminAction`).
3. Crear nueva categoría hija dentro de "Música" (máx 2 niveles).
4. Gestionar `EventType` (activar/desactivar uno sin eventos asociados; demostrar bloqueo si tiene eventos).
5. Moderar una reseña ofensiva (soft delete → `status='removed'`).
6. Ver listado de eventos en solo lectura (registro `view_event` en `AdminAction`).
7. Consultar el dashboard de métricas operativas.
8. Consultar log de `AdminAction`.

**Requerimientos:** FR-ADMIN-001..012, FR-VENDOR-010, FR-SERVICE-002/006, FR-REVIEW-004, FR-EVENT-010.

### Demo Scenario 5 — Multi-idioma y moneda

1. Cambiar idioma del usuario a `pt`.
2. Verificar UI traducida.
3. Crear evento con `language='en'` y `currency='USD'`.
4. Generar plan IA → output en inglés.
5. Intentar cambiar la moneda → bloqueado por el sistema.
6. Mostrar que las cifras se muestran en USD sin conversión.

**Requerimientos:** FR-I18N-001..006, FR-EVENT-003, FR-BUDGET-002/007.

### Demo Scenario 6 — Fallback IA (Mock)

1. Cambiar `LLM_PROVIDER=mock`.
2. Ejecutar generación de plan/checklist/presupuesto/brief.
3. Verificar que `AIRecommendation.fallback_used=true` (cuando aplica) y la demo funciona offline.

**Requerimientos:** FR-AI-009/014/015/016, FR-DEMO-002/003.

---

## 38. Supuestos, restricciones y dependencias

### 38.1 Supuestos (heredados de `8.2 §9`)

| # | Supuesto | Justificación |
|---:|---|---|
| 1 | Las imágenes por trabajo del portafolio se modelan con `Attachment(owner_type='vendor_work')` y `work_label`. | Permite cumplir el límite de 10/trabajo sin entidad adicional. |
| 2 | Los cambios de categoría que "afectan la visibilidad pública" son aquellos que modifican el conjunto de `service_category_id` asociados. Renombrar/reordenar no cuenta. | Mantiene simple la regla de revisión admin. |
| 3 | El job de cierre automático de eventos corre al menos diariamente (cron). | Suficiente para la regla de 2 días sin infraestructura realtime. |
| 4 | El captcha se implementa con reCAPTCHA v3, hCaptcha o equivalente; la elección es del equipo de implementación. | El addendum no fija la tecnología. |
| 5 | El email simulado vía log se mantiene en producción hasta que exista integración SMTP real. | Alineado con BR-NOTIF-003. |
| 6 | Las plantillas iniciales por `EventType` (timeline, presupuesto, categorías) son curadas manualmente; la IA personaliza sobre ellas. | BR-EVENTTYPE-003. |

### 38.2 Restricciones funcionales

- Sólo web responsive en MVP (sin app nativa).
- Sin pagos reales ni captura de medios de pago.
- Sin contratos digitales con firma electrónica.
- Sin integración WhatsApp/SMS/push nativas.
- Sin chat en tiempo real ni módulo de mensajería completo.
- Sin moderación automática IA ni decisiones IA autónomas.
- Sin marketplace transaccional.
- Sin conversión automática de moneda.
- Sin integración con calendarios externos (Google/Outlook/Apple).
- Sin multi-colaboradores por evento (Future).
- Sin lista de invitados / RSVP / plano de mesas.
- Sin verificación KYC automatizada (manual por admin).
- Sin AnthropicProvider funcional (sólo stub).
- Sin respuesta de proveedor a reseñas (Future).
- Sin jerarquía profunda de categorías (>2 niveles).

### 38.3 Dependencias

| Tipo | Dependencia | Impacto |
|---|---|---|
| Externa | Proveedor LLM (OpenAI principal) | Latencia, costo, disponibilidad; mitigado con MockAIProvider y timeout 1 min. |
| Externa | Captcha provider (reCAPTCHA, hCaptcha o equivalente) | Bloqueo de registro/login si no está disponible. |
| Externa | Hosting cloud para deploy | Demo accesible. |
| Externa | Storage para attachments | Soft delete; eliminación física por proceso técnico. |
| Interna | Seed scripts reproducibles | Demo end-to-end. |
| Interna | Versionado de prompts IA | Trazabilidad de `AIRecommendation`. |
| Interna | Sistema i18n | Soporte 4 idiomas. |
| Interna | Job programado (cron) | Auto-completar eventos, expirar Quotes. |
| Negocio | Decisiones del Product Owner (Doc 2 y 8.1) | Fuente de verdad funcional. |
| Negocio | Criterios académicos del programa | Evaluación final del MVP. |

---

## 39. Riesgos funcionales y mitigaciones

| # | Riesgo funcional | Impacto | Probabilidad | Mitigación funcional |
|---:|---|---|---|---|
| 1 | Sobre-alcance hacia marketplace transaccional (pagos, contratos, comisiones, chat tiempo real) | Alto | Alta | Este FRD como contrato; revisión PO ante cualquier feature fuera del alcance. |
| 2 | Salidas IA tratadas como datos oficiales sin validación humana | Alto | Media | Regla canónica BR-AI-001 + FR-AI-012; badge visual; `AIRecommendation.accepted` default false. |
| 3 | Timeout o caída del proveedor IA real durante demo | Medio | Media | `MockAIProvider` obligatorio + fallback automático + FR-AI-009 (timeout 1 min). |
| 4 | Spam o ruido de cotizaciones | Medio | Media | Máx 5 `QuoteRequest` activas/categoría + única por (evento, proveedor) + FR-QUOTE-002/003. |
| 5 | Confusión sobre cancelación de booking | Medio | Media | Disclaimer claro FR-BOOKING-006; cancelación sin penalización en plataforma; trazas obligatorias. |
| 6 | Cambio de moneda inadvertido o conversión incorrecta | Medio | Baja | Moneda inmutable FR-EVENT-003; sin conversión automática FR-BUDGET-007. |
| 7 | Eliminación accidental o malintencionada de reseñas | Alto | Baja | Hard delete prohibido FR-REVIEW-005; soft delete con auditoría FR-REVIEW-004/FR-ADMIN-005. |
| 8 | Acceso indebido a recursos ajenos | Alto | Baja | Aislamiento por rol FR-AUTH-010; ownership en backend FR-EVENT-002/FR-QUOTE-014. |
| 9 | Bot/abuso en autenticación | Medio | Media | Captcha/anti-bot FR-AUTH-002 + rate limiting (recomendado). |
| 10 | Eventos antiguos quedan abiertos por error humano | Bajo | Alta | Cierre automático 2 días FR-EVENT-009. |
| 11 | Proveedor cambia categorías repetidamente saltándose la moderación | Medio | Media | Máx 5 cambios FR-VENDOR-004; revisión admin obligatoria si afecta visibilidad pública FR-VENDOR-005. |
| 12 | Latencia perceptible en IA frustra la demo | Medio | Media | Streaming/skeleton + timeout 1 min + fallback Mock. |
| 13 | Documentación inconsistente entre Business Rules, Data Model y UC | Alto | Baja | Revisión 8.2 ya garantizó alineación; este FRD usa la misma fuente. |
| 14 | Roadmap futuro confundido con MVP | Medio | Media | Secciones §29 y §30 separadas; clasificación explícita. |
| 15 | EventType eliminado por error con eventos asociados | Medio | Baja | Bloqueo de hard delete FR-ADMIN-007. |

---

## 40. Preguntas abiertas o decisiones pendientes

Al cierre de este FRD **no quedan preguntas abiertas que bloqueen la implementación**. Las siguientes son decisiones técnicas remanentes (heredadas de `8.2 §10.1`) que pueden resolverse iterativamente durante la implementación:

| # | Pregunta técnica | Documento de origen | Impacto | Recomendación |
|---:|---|---|---|---|
| 1 | ¿Qué modelo concreto de OpenAI se usa por feature (flagship vs mini)? | Doc 7 §30 | Medio (costo/latencia) | Definir en `AIPromptVersion.model_hint`. |
| 2 | ¿Se persiste `AIRecommendation(type='quote_comparison')` o se regenera bajo demanda? | Doc 7 §30 | Bajo | Recomendado persistir para auditoría. |
| 3 | ¿Se implementa cache de outputs IA por hash de input en MVP? | Doc 7 §30; BR-AI-013 | Bajo | Could Have. |
| 4 | ¿Cuántas regeneraciones por feature/sesión antes de rate-limit? | Doc 7 §30 | Bajo | Definir en implementación. |
| 5 | ¿La priorización IA de tareas se ejecuta en cada carga del dashboard o bajo demanda? | Doc 7 §30 | Medio | Recomendado bajo demanda. |
| 6 | ¿Las plantillas estáticas por `EventType` viven en código o como `AIPromptVersion`? | Doc 7 §30 | Bajo | Recomendado `AIPromptVersion`. |
| 7 | ¿Quién valida la curaduría cultural LATAM de los prompts? | Doc 7 §30; BR-EVENTTYPE-004 | Medio | Validación PO + equipo de contenido. |

Estas preguntas no afectan ningún requerimiento funcional MVP y pueden resolverse durante la fase de implementación sin renegociar el alcance.

---

## 41. Resumen final

Este Functional Requirements Document (FRD) consolida ~120 requerimientos funcionales MVP de EventFlow distribuidos en 15 módulos (Auth, User, Event, AI, Task, Budget, Vendor, Service, Quote, Booking, Review, Notif, I18N, Admin, Seed/Demo) y los conecta con las reglas de negocio, permisos por rol, entidades del modelo, features IA y casos de uso de la documentación previa. Cada requerimiento se clasifica por prioridad (Must/Should/Could), alcance (MVP/Future/Out of Scope) y origen (Explícito/Derivado/Asunción/Recomendado), con trazabilidad explícita.

El FRD refleja íntegramente las 19 decisiones del Product Owner consolidadas en `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`:

- Escala de rating 1–5 (FR-REVIEW-002).
- Portafolio máx 10 imágenes por trabajo (FR-VENDOR-006).
- Máx 5 cambios de categoría con revisión admin (FR-VENDOR-004/005).
- Validez default de Quote = 15 días (FR-QUOTE-005).
- Cancelación de BookingIntent confirmado sin penalización en plataforma (FR-BOOKING-004).
- Cierre automático del evento 2 días post `event_date` (FR-EVENT-009).
- Moneda inmutable; local o USD (FR-EVENT-003, FR-BUDGET-002).
- Captcha/anti-bot obligatorio (FR-AUTH-002).
- Timeout IA de 1 minuto con fallback (FR-AI-009).
- Métricas admin operativas (FR-ADMIN-002).
- Soft delete + auditoría de reseñas (FR-REVIEW-004).
- Máx 5 `QuoteRequest` activas por categoría (FR-QUOTE-002).
- Notificación al proveedor por Quote rechazada/expirada (FR-QUOTE-009/010, FR-NOTIF-004).
- Respuesta del proveedor a reseñas diferida a Future (FR-REVIEW-008, FR-FUTURE-001).
- AnthropicProvider stub no funcional (FR-AI-015).
- Admin lista eventos en solo lectura (FR-EVENT-010, FR-ADMIN-008).
- Gestión controlada de EventType (FR-ADMIN-007).
- Jerarquía de categorías máx 2 niveles (FR-SERVICE-002).
- Soft delete obligatorio de attachments (FR-VENDOR-008).

El FRD respeta el principio rector del MVP:

> **EventFlow MVP es un workspace de planificación asistido por IA con un flujo simplificado de descubrimiento y cotización de proveedores. No es un marketplace transaccional.**

No se introduce como MVP ninguna de las capacidades comúnmente sobre-alcance (pagos reales, comisiones, contratos firmados, WhatsApp, app nativa, chat tiempo real, moderación IA automática, decisiones IA autónomas, marketplace transaccional, geolocalización avanzada, calendarios externos, multi-colaboradores, RSVP/mesas, conversión de moneda, jerarquía profunda de categorías). Estas funcionalidades están explícitamente clasificadas como `Future` o `Out of Scope` en las secciones §29 y §30.

Este FRD está **listo para usarse como fuente de verdad funcional** en:

- Generación de User Stories y Acceptance Criteria.
- Definición de QA Scenarios y planes de pruebas.
- Diseño técnico, API contracts y modelado de datos detallado.
- Creación de Development Tasks y planificación de iteraciones.
- Evaluación académica y revisión de portafolio.
- Generación de seed data, demo guiada y plan de presentación final.

> **Próximo paso recomendado:** generar las User Stories y Acceptance Criteria detallados por módulo a partir de este FRD, manteniendo los IDs (`FR-<DOMAIN>-NNN`) como referencia primaria para garantizar trazabilidad end-to-end.
