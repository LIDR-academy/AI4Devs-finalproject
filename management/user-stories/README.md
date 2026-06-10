# EventFlow — User Stories Index

> **Versión:** 1.0
> **Generación:** 2026-06-09
> **Idioma:** Español LATAM neutral.
> **Producto:** EventFlow — workspace de planificación de eventos asistido por IA con flujo simplificado de cotización de proveedores.

---

## 1. Propósito

Esta carpeta contiene el **set completo de User Stories del MVP de EventFlow**, derivado del **Epic Map oficial** y la documentación canónica del producto. Cada historia sigue la plantilla `management/templates/user-story.tpl.md` y está trazada a FRD, Use Cases, Business Rules, NFRs, ADRs y entidades del Domain Data Model.

Este catálogo alimenta la generación posterior de:

- Backlog inicial y refinamiento.
- Sprint plan.
- Tareas de desarrollo (frontend, backend, BD, AI, QA, DevOps).
- QA scenarios y suites E2E.
- Demo guiada (10–15 min) y reporte académico AI4Devs.

---

## 2. Artefacto fuente

- **Epic Map:** [`management/artifacts/EventFlow-Epic-Map.md`](../artifacts/EventFlow-Epic-Map.md)
- **Plantilla:** [`management/templates/user-story.tpl.md`](../templates/user-story.tpl.md)
- **Documentación canónica:** `/docs/1` a `/docs/22`.

---

## 3. Resumen por épica

| Épica | Nombre | # User Stories | Rango IDs |
|---|---|---:|---|
| EPIC-AUTH-001 | Authentication & User Access | 8 | US-001 a US-008 |
| EPIC-EVT-001 | Organizer Event Management | 8 | US-009 a US-016 |
| EPIC-AIP-001 | AI-Assisted Event Planning | 10 | US-017 a US-026 |
| EPIC-TASK-001 | Checklist & Task Management | 8 | US-027 a US-034 |
| EPIC-BUD-001 | Budget Management & Currency | 5 | US-035 a US-039 |
| EPIC-VND-001 | Vendor Directory & Vendor Profile | 9 | US-040 a US-048 |
| EPIC-QR-001 | Quote Request & Quote Response Flow | 8 | US-049 a US-056 |
| EPIC-CMP-001 | Quote Comparison & Booking Intent | 8 | US-057 a US-064 |
| EPIC-REV-001 | Reviews & Moderation | 3 | US-065 a US-067 |
| EPIC-NOT-001 | Notifications (in-app + email simulado) | 6 | US-068 a US-073 |
| EPIC-ADM-001 | Admin Governance | 7 | US-074 a US-080 |
| EPIC-I18N-001 | Internationalization & Currency | 4 | US-081 a US-084 |
| EPIC-SEED-001 | Seed Data & Demo Scenarios | 4 | US-085 a US-088 |
| EPIC-BE-001 | Backend Modular Monolith Foundation | 5 | US-089 a US-093 |
| EPIC-API-001 | REST API Contract Implementation | 5 | US-094 a US-098 |
| EPIC-DB-001 | Database & Prisma Physical Model | 4 | US-099 a US-102 |
| EPIC-FE-001 | Frontend Next.js Application Foundation | 5 | US-103 a US-107 |
| EPIC-SEC-001 | Security & Authorization Enforcement | 5 | US-108 a US-112 |
| EPIC-OBS-001 | Observability, Audit & Traceability | 4 | US-113 a US-116 |
| EPIC-AI-001 | AI Architecture & PromptOps Foundation | 8 | US-117 a US-124 |
| EPIC-QA-001 | Testing & Quality Gates | 8 | US-125 a US-132 |
| EPIC-OPS-001 | Deployment & DevOps on AWS | 9 | US-133 a US-141 |
| EPIC-DEMO-001 | Demo Readiness Flow | 5 | US-142 a US-146 |
| EPIC-ACAD-001 | Academic Traceability & Documentation | 4 | US-147 a US-150 |
| **TOTAL** | | **150** | US-001 a US-150 |

---

## 4. Tabla completa de User Stories

| ID | Título | Epic | Feature | Rol | Prioridad | Status | Archivo |
|---|---|---|---|---|---|---|---|
| US-001 | Registrarme como organizador con captcha | EPIC-AUTH-001 | Registro Organizador | Anonymous → Organizer | Must Have | Draft | [US-001](US-001-register-organizer-account.md) |
| US-002 | Registrarme como proveedor con captcha | EPIC-AUTH-001 | Registro Vendor | Anonymous → Vendor | Must Have | Draft | [US-002](US-002-register-vendor-account.md) |
| US-003 | Iniciar sesión con email y contraseña | EPIC-AUTH-001 | Login | Authenticated | Must Have | Draft | [US-003](US-003-login-email-password.md) |
| US-004 | Recuperar mi contraseña vía email | EPIC-AUTH-001 | Recuperación | Anonymous | Must Have | Draft | [US-004](US-004-recover-password.md) |
| US-005 | Cerrar sesión | EPIC-AUTH-001 | Logout | Authenticated | Must Have | Draft | [US-005](US-005-logout-session.md) |
| US-006 | Ver y editar mi perfil propio | EPIC-AUTH-001 | Perfil propio | Authenticated | Must Have | Draft | [US-006](US-006-view-edit-own-profile.md) |
| US-007 | Cambiar mi idioma preferido | EPIC-AUTH-001 | Idioma preferido | Authenticated | Must Have | Draft | [US-007](US-007-change-preferred-language.md) |
| US-008 | Iniciar sesión con Google | EPIC-AUTH-001 | OAuth Google | Anonymous | Could Have | Draft | [US-008](US-008-login-with-google.md) |
| US-009 | Crear un evento mediante wizard | EPIC-EVT-001 | Wizard creación | Organizer | Must Have | Draft | [US-009](US-009-create-event-wizard.md) |
| US-010 | Editar mi evento (excepto moneda) | EPIC-EVT-001 | Edición evento | Organizer | Must Have | Draft | [US-010](US-010-edit-own-event.md) |
| US-011 | Cancelar mi evento | EPIC-EVT-001 | Cancelación | Organizer | Must Have | Draft | [US-011](US-011-cancel-own-event.md) |
| US-012 | Eliminar mi evento `draft` (soft) | EPIC-EVT-001 | Soft delete draft | Organizer | Must Have | Draft | [US-012](US-012-soft-delete-draft-event.md) |
| US-013 | Listar y filtrar mis eventos | EPIC-EVT-001 | Listado y filtros | Organizer | Must Have | Draft | [US-013](US-013-list-filter-own-events.md) |
| US-014 | Ver el dashboard de mi evento | EPIC-EVT-001 | Dashboard evento | Organizer | Must Have | Draft | [US-014](US-014-view-event-dashboard.md) |
| US-015 | Auto-cierre 2 días post-evento | EPIC-EVT-001 | Job auto-complete | System | Must Have | Draft | [US-015](US-015-auto-complete-event-job.md) |
| US-016 | Admin ve mi evento en solo lectura | EPIC-EVT-001 | Admin read-only | Admin | Must Have | Draft | [US-016](US-016-admin-view-event-readonly.md) |
| US-017 | Generar plan IA de mi evento | EPIC-AIP-001 | AI-001 Plan IA | Organizer | Must Have | Draft | [US-017](US-017-generate-ai-event-plan.md) |
| US-018 | Generar checklist IA | EPIC-AIP-001 | AI-002 Checklist | Organizer | Must Have | Draft | [US-018](US-018-generate-ai-checklist.md) |
| US-019 | Pedir sugerencia IA de presupuesto | EPIC-AIP-001 | AI-003 Budget | Organizer | Must Have | Draft | [US-019](US-019-ai-budget-distribution.md) |
| US-020 | Obtener categorías IA priorizadas | EPIC-AIP-001 | AI-004 Categorías | Organizer | Must Have | Draft | [US-020](US-020-ai-recommended-categories.md) |
| US-021 | Autocompletar brief de cotización | EPIC-AIP-001 | AI-005 Brief | Organizer | Must Have | Draft | [US-021](US-021-ai-quote-brief-autocompletion.md) |
| US-022 | Resumen IA del comparador | EPIC-AIP-001 | AI-006 Resumen | Organizer | Should Have | Draft | [US-022](US-022-ai-quote-comparison-summary.md) |
| US-023 | Vendor: Generar bio/paquetes con IA | EPIC-AIP-001 | AI-007 Vendor IA | Vendor | Could Have | Draft | [US-023](US-023-ai-vendor-bio-packages.md) |
| US-024 | Top 3 tareas urgentes IA | EPIC-AIP-001 | AI-008 Priorización | Organizer | Should Have | Draft | [US-024](US-024-ai-task-prioritization.md) |
| US-025 | Aceptar/editar/descartar sugerencia | EPIC-AIP-001 | HITL transversal | Organizer/Vendor | Must Have | Draft | [US-025](US-025-accept-edit-discard-ai-suggestion.md) |
| US-026 | Regenerar sugerencia con feedback | EPIC-AIP-001 | Regenerar IA | Organizer/Vendor | Should Have | Draft | [US-026](US-026-regenerate-ai-suggestion-with-feedback.md) |
| US-027 | Ver checklist del evento | EPIC-TASK-001 | Listado checklist | Organizer | Must Have | Draft | [US-027](US-027-view-event-checklist.md) |
| US-028 | Crear tarea manual | EPIC-TASK-001 | Crear tarea | Organizer | Must Have | Draft | [US-028](US-028-create-manual-task.md) |
| US-029 | Editar/eliminar tarea | EPIC-TASK-001 | Edit/Delete tarea | Organizer | Must Have | Draft | [US-029](US-029-edit-delete-task.md) |
| US-030 | Cambiar estado de tarea | EPIC-TASK-001 | Cambio de estado | Organizer | Must Have | Draft | [US-030](US-030-change-task-status.md) |
| US-031 | Confirmar tareas IA en bloque | EPIC-TASK-001 | Bulk confirm IA | Organizer | Must Have | Draft | [US-031](US-031-confirm-ai-tasks-bulk.md) |
| US-032 | Filtrar tareas 7/30 días | EPIC-TASK-001 | Filtros temporales | Organizer | Must Have | Draft | [US-032](US-032-filter-tasks-by-timerange.md) |
| US-033 | Ver progreso (% done) | EPIC-TASK-001 | Indicador progreso | Organizer | Must Have | Draft | [US-033](US-033-view-progress-dashboard.md) |
| US-034 | Notif in-app T-7 (job) | EPIC-TASK-001 | Job T-7 | System | Should Have | Draft | [US-034](US-034-inapp-notification-t-minus-7.md) |
| US-035 | Ver/editar mi presupuesto | EPIC-BUD-001 | Vista budget | Organizer | Must Have | Draft | [US-035](US-035-view-edit-budget.md) |
| US-036 | CRUD BudgetItem por categoría | EPIC-BUD-001 | CRUD items | Organizer | Must Have | Draft | [US-036](US-036-crud-budget-items.md) |
| US-037 | Aceptar distribución IA | EPIC-BUD-001 | HITL budget IA | Organizer | Must Have | Draft | [US-037](US-037-accept-ai-budget-distribution.md) |
| US-038 | Warning committed > total | EPIC-BUD-001 | Warning overcommit | Organizer | Must Have | Draft | [US-038](US-038-budget-overcommitted-warning.md) |
| US-039 | Committed actualizado por booking | EPIC-BUD-001 | Update committed | Organizer/System | Must Have | Draft | [US-039](US-039-committed-updated-on-booking-confirm.md) |
| US-040 | Crear mi VendorProfile | EPIC-VND-001 | Crear perfil | Vendor | Must Have | Draft | [US-040](US-040-create-vendor-profile.md) |
| US-041 | Editar mi perfil (excepto rejected) | EPIC-VND-001 | Editar perfil | Vendor | Must Have | Draft | [US-041](US-041-edit-vendor-profile.md) |
| US-042 | Cambiar categorías (máx 5) | EPIC-VND-001 | Cambio categorías | Vendor | Must Have | Draft | [US-042](US-042-change-vendor-categories.md) |
| US-043 | Subir hasta 10 imágenes por trabajo | EPIC-VND-001 | Portafolio | Vendor | Must Have | Draft | [US-043](US-043-upload-portfolio-images.md) |
| US-044 | Gestionar mis paquetes (CRUD) | EPIC-VND-001 | CRUD VendorService | Vendor | Must Have | Draft | [US-044](US-044-manage-vendor-services.md) |
| US-045 | Buscar proveedores por categoría/ciudad | EPIC-VND-001 | Búsqueda directorio | Organizer | Must Have | Draft | [US-045](US-045-search-vendors.md) |
| US-046 | Ver perfil público SEO de vendor | EPIC-VND-001 | Perfil público SEO | Anonymous | Must Have | Draft | [US-046](US-046-public-vendor-profile-seo.md) |
| US-047 | Admin aprueba/rechaza/oculta vendor | EPIC-VND-001 | Moderación vendor | Admin | Must Have | Draft | [US-047](US-047-admin-approve-reject-vendor.md) |
| US-048 | Soft delete imagen de portafolio | EPIC-VND-001 | Soft delete attachment | Vendor | Must Have | Draft | [US-048](US-048-soft-delete-portfolio-image.md) |
| US-049 | Enviar QuoteRequest con brief | EPIC-QR-001 | Crear QR | Organizer | Must Have | Draft | [US-049](US-049-send-quote-request.md) |
| US-050 | Validar límite 5 QR por categoría | EPIC-QR-001 | Límite QR | Organizer | Must Have | Draft | [US-050](US-050-quote-request-category-limit.md) |
| US-051 | Vendor marca QR como viewed | EPIC-QR-001 | Transición viewed | Vendor | Must Have | Draft | [US-051](US-051-vendor-mark-quote-request-viewed.md) |
| US-052 | Vendor responde Quote con desglose | EPIC-QR-001 | Respuesta Vendor | Vendor | Must Have | Draft | [US-052](US-052-vendor-respond-quote.md) |
| US-053 | Validez Quote default 15 días | EPIC-QR-001 | Validez Quote | Vendor | Must Have | Draft | [US-053](US-053-quote-validity-15-days.md) |
| US-054 | Notif Vendor Quote rechazada/expirada | EPIC-QR-001 | Notif rechazos | Vendor/System | Must Have | Draft | [US-054](US-054-notify-vendor-quote-rejected-expired.md) |
| US-055 | Auto-expiration jobs (QR/Quote) | EPIC-QR-001 | Jobs expiración | System | Must Have | Draft | [US-055](US-055-auto-expire-quotes-job.md) |
| US-056 | Cancelar QuoteRequest activa | EPIC-QR-001 | Cancelar QR | Organizer | Must Have | Draft | [US-056](US-056-cancel-active-quote-request.md) |
| US-057 | Comparar Quotes lado a lado | EPIC-CMP-001 | Comparador | Organizer | Must Have | Draft | [US-057](US-057-compare-quotes-side-by-side.md) |
| US-058 | Marcar Quote `preferred` | EPIC-CMP-001 | Preferred flag | Organizer | Must Have | Draft | [US-058](US-058-mark-quote-preferred.md) |
| US-059 | Ver resumen IA del comparador | EPIC-CMP-001 | Surface AI-006 | Organizer | Should Have | Draft | [US-059](US-059-view-ai-comparator-summary.md) |
| US-060 | Crear BookingIntent | EPIC-CMP-001 | Crear booking | Organizer | Must Have | Draft | [US-060](US-060-create-booking-intent.md) |
| US-061 | Vendor confirma BookingIntent | EPIC-CMP-001 | Confirmar booking | Vendor | Must Have | Draft | [US-061](US-061-vendor-confirm-booking-intent.md) |
| US-062 | Cancelar BookingIntent (sin penalty) | EPIC-CMP-001 | Cancel booking | Organizer/Vendor | Must Have | Draft | [US-062](US-062-cancel-booking-intent.md) |
| US-063 | Disclaimer visible al confirmar | EPIC-CMP-001 | Disclaimer | Cross-role | Must Have | Draft | [US-063](US-063-booking-disclaimer-visible.md) |
| US-064 | Ver committed actualizado en budget | EPIC-CMP-001 | Surface committed | Organizer | Must Have | Draft | [US-064](US-064-view-committed-updated-budget.md) |
| US-065 | Crear reseña verificada (1-5) | EPIC-REV-001 | Crear review | Organizer | Must Have | Draft | [US-065](US-065-create-verified-review.md) |
| US-066 | Ver reseñas en perfil vendor | EPIC-REV-001 | Listado reseñas | Anonymous/All | Must Have | Draft | [US-066](US-066-view-reviews-on-vendor-profile.md) |
| US-067 | Admin modera reseña (soft) | EPIC-REV-001 | Moderación reseña | Admin | Must Have | Draft | [US-067](US-067-admin-moderate-review.md) |
| US-068 | Notif nueva QuoteRequest | EPIC-NOT-001 | Notif QR creada | Vendor | Should Have | Draft | [US-068](US-068-inapp-notification-new-quote-request.md) |
| US-069 | Notif nueva Quote | EPIC-NOT-001 | Notif Quote enviada | Organizer | Should Have | Draft | [US-069](US-069-inapp-notification-new-quote.md) |
| US-070 | Notif Booking confirmado | EPIC-NOT-001 | Notif booking | Organizer/Vendor | Should Have | Draft | [US-070](US-070-inapp-notification-booking-confirmed.md) |
| US-071 | Notif T-7 (surface organizer) | EPIC-NOT-001 | Surface T-7 | Organizer | Should Have | Draft | [US-071](US-071-inapp-notification-t-minus-7-recipe.md) |
| US-072 | Marcar notif como leída | EPIC-NOT-001 | Mark as read | Organizer/Vendor | Should Have | Draft | [US-072](US-072-mark-notification-read.md) |
| US-073 | Surface UI rechazo/expiración vendor | EPIC-NOT-001 | Surface US-054 | Vendor | Must Have | Draft | [US-073](US-073-vendor-quote-rejected-notification-surface.md) |
| US-074 | Admin aprueba/rechaza vendor (panel) | EPIC-ADM-001 | Panel vendors | Admin | Must Have | Draft | [US-074](US-074-admin-approve-reject-vendor-extended.md) |
| US-075 | CRUD ServiceCategory (2 niveles) | EPIC-ADM-001 | CRUD categorías | Admin | Must Have | Draft | [US-075](US-075-admin-crud-service-categories.md) |
| US-076 | Gestionar EventType | EPIC-ADM-001 | CRUD EventType | Admin | Must Have | Draft | [US-076](US-076-admin-manage-event-types.md) |
| US-077 | Moderar reseña (panel) | EPIC-ADM-001 | Panel reviews | Admin | Must Have | Draft | [US-077](US-077-admin-moderate-review-panel.md) |
| US-078 | Listar eventos read-only | EPIC-ADM-001 | Lectura eventos | Admin | Must Have | Draft | [US-078](US-078-admin-list-events-readonly.md) |
| US-079 | Dashboard métricas operativas | EPIC-ADM-001 | Métricas | Admin | Must Have | Draft | [US-079](US-079-admin-operational-metrics-dashboard.md) |
| US-080 | Consultar log AdminAction | EPIC-ADM-001 | Visor AdminAction | Admin | Must Have | Draft | [US-080](US-080-admin-action-log-viewer.md) |
| US-081 | Cambiar idioma (surface i18n) | EPIC-I18N-001 | Selector idioma | Authenticated | Must Have | Draft | [US-081](US-081-user-change-language.md) |
| US-082 | Configurar idioma del evento | EPIC-I18N-001 | Idioma evento | Organizer | Must Have | Draft | [US-082](US-082-configure-event-language.md) |
| US-083 | Cifras en moneda del evento | EPIC-I18N-001 | Moneda inmutable | Organizer | Must Have | Draft | [US-083](US-083-view-amounts-in-event-currency.md) |
| US-084 | Prompts IA respetan idioma | EPIC-I18N-001 | i18n IA | System | Must Have | Draft | [US-084](US-084-ai-prompts-respect-event-language.md) |
| US-085 | Ejecutar npm run seed | EPIC-SEED-001 | Seed script | System/Dev | Must Have | Draft | [US-085](US-085-run-seed-script.md) |
| US-086 | Admin reset Demo | EPIC-SEED-001 | Reset Demo | Admin/System | Must Have | Draft | [US-086](US-086-admin-reset-demo.md) |
| US-087 | Demo con eventos draft/active/completed | EPIC-SEED-001 | Cobertura estados | System | Must Have | Draft | [US-087](US-087-seed-event-mix.md) |
| US-088 | Seed con ≥1 confirmed_intent | EPIC-SEED-001 | BookingIntent demo | System | Must Have | Draft | [US-088](US-088-seed-confirmed-booking-intent.md) |
| US-089 | Bootstrap Node + Express + TS | EPIC-BE-001 | Bootstrap | System | Must Have (P0) | Draft | [US-089](US-089-bootstrap-node-express-ts.md) |
| US-090 | Carpetas feature-first | EPIC-BE-001 | Estructura | System | Must Have (P0) | Draft | [US-090](US-090-feature-first-domain-modules.md) |
| US-091 | Pipeline de middlewares | EPIC-BE-001 | Middlewares | System | Must Have (P0) | Draft | [US-091](US-091-middleware-pipeline.md) |
| US-092 | Validación Zod en DTOs | EPIC-BE-001 | Zod validation | System | Must Have (P0) | Draft | [US-092](US-092-zod-validation.md) |
| US-093 | Error envelope unificado | EPIC-BE-001 | Error envelope | System | Must Have (P0) | Draft | [US-093](US-093-unified-error-envelope.md) |
| US-094 | Endpoints AUTH | EPIC-API-001 | API Auth | System | Must Have (P0) | Draft | [US-094](US-094-auth-endpoints-implementation.md) |
| US-095 | Endpoints EVENT | EPIC-API-001 | API Event | System | Must Have (P0) | Draft | [US-095](US-095-event-endpoints-implementation.md) |
| US-096 | Endpoints QUOTE / Booking | EPIC-API-001 | API Quote | System | Must Have (P0) | Draft | [US-096](US-096-quote-endpoints-implementation.md) |
| US-097 | Endpoints AI | EPIC-API-001 | API AI | System | Must Have (P0) | Draft | [US-097](US-097-ai-endpoints-implementation.md) |
| US-098 | OpenAPI snapshot | EPIC-API-001 | OpenAPI | System | Should Have | Draft | [US-098](US-098-openapi-snapshot.md) |
| US-099 | Schema Prisma por dominio | EPIC-DB-001 | Schema Prisma | System | Must Have (P0) | Draft | [US-099](US-099-prisma-schema.md) |
| US-100 | Migrations base | EPIC-DB-001 | Migrations | System | Must Have (P0) | Draft | [US-100](US-100-prisma-migrations.md) |
| US-101 | Índices críticos | EPIC-DB-001 | Índices | System | Must Have (P0) | Draft | [US-101](US-101-critical-indexes.md) |
| US-102 | Validar constraints C-001..C-062 | EPIC-DB-001 | Constraints | System | Must Have (P0) | Draft | [US-102](US-102-db-constraints.md) |
| US-103 | Bootstrap Next.js | EPIC-FE-001 | Next.js Setup | System | Must Have (P0) | Draft | [US-103](US-103-bootstrap-nextjs-app-router.md) |
| US-104 | Configurar i18n (4 locales) | EPIC-FE-001 | i18n setup | System | Must Have (P0) | Draft | [US-104](US-104-i18n-config-4-locales.md) |
| US-105 | Route groups por rol | EPIC-FE-001 | Route groups | System | Must Have (P0) | Draft | [US-105](US-105-route-groups-by-role.md) |
| US-106 | TanStack Query + MSW | EPIC-FE-001 | TanStack + MSW | System | Must Have (P0) | Draft | [US-106](US-106-tanstack-query-and-msw.md) |
| US-107 | Layouts y navegación por rol | EPIC-FE-001 | Layouts por rol | System | Must Have (P0) | Draft | [US-107](US-107-layouts-and-navigation.md) |
| US-108 | Cookies HTTP-only firmadas | EPIC-SEC-001 | Cookies | System | Must Have (P0) | Draft | [US-108](US-108-configure-httponly-cookies.md) |
| US-109 | Captcha en auth | EPIC-SEC-001 | Captcha | System | Must Have (P0) | Draft | [US-109](US-109-integrate-captcha-auth.md) |
| US-110 | Rate limit en login/recovery/AI | EPIC-SEC-001 | Rate limit | System | Must Have (P0) | Draft | [US-110](US-110-rate-limiting-auth-and-ai.md) |
| US-111 | Orden de middlewares | EPIC-SEC-001 | Middleware chain | System | Must Have (P0) | Draft | [US-111](US-111-middleware-chain-order.md) |
| US-112 | Tests negativos RBAC | EPIC-SEC-001 | Suite negativa | System | Must Have (P0) | Draft | [US-112](US-112-negative-rbac-ownership-tests.md) |
| US-113 | Logger estructurado | EPIC-OBS-001 | Logger | System | Should Have | Draft | [US-113](US-113-structured-logger.md) |
| US-114 | Correlation ID | EPIC-OBS-001 | Correlation | System | Should Have | Draft | [US-114](US-114-correlation-id-propagation.md) |
| US-115 | Métricas IA | EPIC-OBS-001 | Métricas IA | System | Should Have | Draft | [US-115](US-115-ai-minimum-metrics.md) |
| US-116 | Healthcheck + readiness | EPIC-OBS-001 | Health endpoints | System | Should Have | Draft | [US-116](US-116-healthcheck-readiness-endpoint.md) |
| US-117 | Puerto LLMProvider | EPIC-AI-001 | Puerto LLM | System | Must Have (P0) | Draft | [US-117](US-117-llm-provider-port.md) |
| US-118 | OpenAIProvider | EPIC-AI-001 | OpenAI adapter | System | Must Have (P0) | Draft | [US-118](US-118-openai-provider-adapter.md) |
| US-119 | MockAIProvider determinista | EPIC-AI-001 | Mock AI | System | Must Have (P0) | Draft | [US-119](US-119-mock-ai-provider.md) |
| US-120 | AnthropicProvider stub | EPIC-AI-001 | Anthropic stub | System | Must Have (P0) | Draft | [US-120](US-120-anthropic-provider-stub.md) |
| US-121 | Prompt registry versionado | EPIC-AI-001 | Prompt registry | System | Must Have (P0) | Draft | [US-121](US-121-prompt-registry-versioned.md) |
| US-122 | Persistir AIRecommendation | EPIC-AI-001 | AIRecommendation | System | Must Have (P0) | Draft | [US-122](US-122-persist-ai-recommendation.md) |
| US-123 | Timeout 60s + fallback Mock | EPIC-AI-001 | Timeout + fallback | System | Must Have (P0) | Draft | [US-123](US-123-ai-timeout-and-fallback.md) |
| US-124 | Validación JSON + retry | EPIC-AI-001 | JSON + retry | System | Must Have (P0) | Draft | [US-124](US-124-ai-json-validation-with-retry.md) |
| US-125 | Configurar Vitest/Supertest/Playwright/MSW | EPIC-QA-001 | Tooling | System | Must Have | Draft | [US-125](US-125-configure-vitest-supertest-playwright-msw.md) |
| US-126 | Suite unit/integration backend | EPIC-QA-001 | Backend tests | System | Must Have | Draft | [US-126](US-126-unit-integration-backend-suite.md) |
| US-127 | Suite contract con MSW | EPIC-QA-001 | Contract tests | System | Must Have | Draft | [US-127](US-127-contract-tests-with-msw.md) |
| US-128 | E2E Playwright sobre seed | EPIC-QA-001 | E2E principal | System | Must Have | Draft | [US-128](US-128-e2e-playwright-on-seed.md) |
| US-129 | Suite IA con MockAIProvider | EPIC-QA-001 | AI tests | System | Must Have | Draft | [US-129](US-129-ai-tests-with-mock-provider.md) |
| US-130 | Suite RBAC negativa | EPIC-QA-001 | RBAC negativa | System | Must Have | Draft | [US-130](US-130-rbac-negative-suite.md) |
| US-131 | Suite A11Y mínima | EPIC-QA-001 | A11Y | System | Must Have | Draft | [US-131](US-131-a11y-minimum-suite.md) |
| US-132 | Quality gates GitHub Actions | EPIC-QA-001 | CI Gates | System | Must Have | Draft | [US-132](US-132-quality-gates-github-actions.md) |
| US-133 | Dockerfile backend | EPIC-OPS-001 | Dockerfile | System | Must Have (P0) | Draft | [US-133](US-133-backend-dockerfile.md) |
| US-134 | Pipeline CI/CD GH Actions | EPIC-OPS-001 | Pipeline | System | Must Have (P0) | Draft | [US-134](US-134-github-actions-pipeline.md) |
| US-135 | Deploy frontend Amplify | EPIC-OPS-001 | Amplify | System | Must Have (P0) | Draft | [US-135](US-135-deploy-frontend-amplify.md) |
| US-136 | Deploy backend (App Runner) | EPIC-OPS-001 | Backend service | System | Must Have (P0) | Draft | [US-136](US-136-deploy-backend-managed-service.md) |
| US-137 | Conectar RDS PostgreSQL | EPIC-OPS-001 | RDS | System | Must Have (P0) | Draft | [US-137](US-137-connect-rds-postgresql.md) |
| US-138 | Secrets Manager | EPIC-OPS-001 | Secrets | System | Must Have (P0) | Draft | [US-138](US-138-configure-secrets-manager.md) |
| US-139 | Prisma migrations en pipeline | EPIC-OPS-001 | Migrations CI/CD | System | Must Have (P0) | Draft | [US-139](US-139-prisma-migrations-in-pipeline.md) |
| US-140 | Reset Demo endpoint | EPIC-OPS-001 | Demo reset | System/Admin | Must Have (P0) | Draft | [US-140](US-140-seed-reset-endpoint-demo.md) |
| US-141 | Healthcheck monitoring | EPIC-OPS-001 | Monitoring | System | Must Have (P0) | Draft | [US-141](US-141-healthcheck-readiness-monitoring.md) |
| US-142 | Guion de demo 10-15 min | EPIC-DEMO-001 | Guion demo | PO | Must Have | Draft | [US-142](US-142-prepare-demo-guion.md) |
| US-143 | Checklist pre-demo | EPIC-DEMO-001 | Pre-demo check | PO/Tech Lead | Must Have | Draft | [US-143](US-143-pre-demo-checklist-validation.md) |
| US-144 | Toggle Mock/OpenAI | EPIC-DEMO-001 | Toggle provider | System/Demo Op | Must Have | Draft | [US-144](US-144-toggle-mock-openai-provider.md) |
| US-145 | Asegurar confirmed_intent visible | EPIC-DEMO-001 | Seed visible | System | Must Have | Draft | [US-145](US-145-ensure-confirmed-booking-visible.md) |
| US-146 | Smoke Demo URL | EPIC-DEMO-001 | Smoke Demo | System/QA | Must Have | Draft | [US-146](US-146-demo-url-smoke.md) |
| US-147 | Índice ADRs | EPIC-ACAD-001 | Índice ADRs | PO/Tech Lead | Should Have | Draft | [US-147](US-147-adr-index.md) |
| US-148 | Trazabilidad US → FRD/UC/BR | EPIC-ACAD-001 | Traceability | PO/BA | Should Have | Draft | [US-148](US-148-us-frd-uc-traceability.md) |
| US-149 | Prompts y outputs ejemplares | EPIC-ACAD-001 | Prompts académicos | AI Eng/PO | Should Have | Draft | [US-149](US-149-document-prompt-outputs.md) |
| US-150 | Reporte evidencia académica | EPIC-ACAD-001 | Reporte final | PO | Should Have | Draft | [US-150](US-150-academic-evidence-report.md) |

---

## 5. Cómo usar este catálogo

1. Revisar la **Coverage Matrix** (`User-Stories-Coverage-Matrix.md`) para validar cobertura de cada feature del Epic Map y detectar gaps.
2. Refinar las stories con el equipo (PO/BA/Tech Lead) y completar campos `Status` y `Owner`.
3. Asignar Sprint / Milestone según el camino crítico MVP (sección 17.3 del Epic Map).
4. Generar tareas de desarrollo, QA scenarios y plan de demo a partir de las stories.
5. Mantener trazabilidad bidireccional: cada PR debe referenciar la(s) US correspondiente(s).

---

## 6. Notas operativas

- **Status inicial:** todas las stories están en `Draft` hasta validación PO/BA.
- **Owner:** `Product Owner / Business Analyst` por defecto; se reasignará en refinamiento.
- **Idioma:** Español LATAM neutral.
- **Cumplimiento MVP:** ninguna story introduce features Out of Scope (pagos reales, contratos, chat real-time, WhatsApp/SMS/push, app nativa, conversión FX, IA autónoma, etc.).

---

> **Estado:** Listo para refinamiento, estimación y construcción del Backlog Inicial de EventFlow.
