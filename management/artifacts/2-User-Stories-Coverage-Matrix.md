# EventFlow — User Stories Coverage Matrix

> **Versión:** 1.0
> **Generación:** 2026-06-09
> **Fuente:** [`management/artifacts/EventFlow-Epic-Map.md`](../artifacts/EventFlow-Epic-Map.md)
> **Plantilla:** [`management/templates/user-story.tpl.md`](../templates/user-story.tpl.md)

---

## 1. Propósito

Esta matriz documenta la **cobertura completa de cada Epic / Feature del Epic Map MVP** con las User Stories generadas. Permite validar que ninguna capability quede fuera del backlog y detectar gaps / decisiones pendientes del Product Owner.

---

## 2. Matriz Epic → Feature → User Story

| Epic | Feature | User Story ID | User Story Title | Priority | Status | Notas |
|---|---|---|---|---|---|---|
| EPIC-AUTH-001 | Registro Organizador con captcha | US-001 | Registrarme como organizador con captcha | Must Have | Draft | — |
| EPIC-AUTH-001 | Registro Vendor con captcha | US-002 | Registrarme como proveedor con captcha | Must Have | Draft | — |
| EPIC-AUTH-001 | Login email/password | US-003 | Iniciar sesión con email y contraseña | Must Have | Draft | Captcha condicional por intentos |
| EPIC-AUTH-001 | Recuperación de contraseña | US-004 | Recuperar mi contraseña vía email | Must Have | Draft | Email simulado en MVP |
| EPIC-AUTH-001 | Logout explícito | US-005 | Cerrar sesión | Must Have | Draft | — |
| EPIC-AUTH-001 | Perfil propio | US-006 | Ver y editar mi perfil propio | Must Have | Draft | Email no editable en MVP |
| EPIC-AUTH-001 | Idioma preferido | US-007 | Cambiar mi idioma preferido | Must Have | Draft | — |
| EPIC-AUTH-001 | OAuth Google (Could) | US-008 | Iniciar sesión con Google | Could Have | Draft | Confirmar inclusión MVP con PO |
| EPIC-EVT-001 | Wizard de creación | US-009 | Crear un evento mediante wizard | Must Have | Draft | Moneda inmutable |
| EPIC-EVT-001 | Edición evento | US-010 | Editar mi evento (excepto moneda) | Must Have | Draft | — |
| EPIC-EVT-001 | Cancelación | US-011 | Cancelar mi evento | Must Have | Draft | Sin penalty (PO #5) |
| EPIC-EVT-001 | Soft delete draft | US-012 | Eliminar mi evento `draft` | Must Have | Draft | Soft delete |
| EPIC-EVT-001 | Listado y filtros | US-013 | Listar y filtrar mis eventos | Must Have | Draft | Ocultar deleted_at |
| EPIC-EVT-001 | Dashboard evento | US-014 | Ver dashboard de progreso de mi evento | Must Have | Draft | Vista central organizer |
| EPIC-EVT-001 | Auto-cierre 2 días | US-015 | Cierre automático 2 días post-fecha | Must Have | Draft | Decisión PO #6 |
| EPIC-EVT-001 | Admin read-only | US-016 | Admin ve mi evento en solo lectura | Must Have | Draft | Decisión PO #16 |
| EPIC-AIP-001 | AI-001 Plan IA | US-017 | Generar plan IA del evento | Must Have | Draft | Timeout 60s + fallback |
| EPIC-AIP-001 | AI-002 Checklist IA | US-018 | Generar checklist IA T-180/.../T-1 | Must Have | Draft | HITL obligatorio |
| EPIC-AIP-001 | AI-003 Budget IA | US-019 | Sugerencia IA presupuesto | Must Have | Draft | Suma 100% validada |
| EPIC-AIP-001 | AI-004 Categorías | US-020 | Categorías IA priorizadas | Must Have | Draft | Filtra catálogo activo |
| EPIC-AIP-001 | AI-005 Brief IA | US-021 | Autocompletar brief IA | Must Have | Draft | Editable antes de envío |
| EPIC-AIP-001 | AI-006 Resumen comparador | US-022 | Resumen IA del comparador | Should Have | Draft | IA informativa |
| EPIC-AIP-001 | AI-007 Vendor IA (Could) | US-023 | Vendor genera bio/paquetes con IA | Could Have | Draft | Confirmar MVP |
| EPIC-AIP-001 | AI-008 Priorización tareas | US-024 | Top 3 tareas urgentes IA | Should Have | Draft | — |
| EPIC-AIP-001 | HITL transversal | US-025 | Aceptar/editar/descartar sugerencia | Must Have | Draft | Surface API y UX común |
| EPIC-AIP-001 | Regenerar IA | US-026 | Regenerar sugerencia con feedback | Should Have | Draft | Cap a N regeneraciones |
| EPIC-TASK-001 | Ver checklist | US-027 | Ver mi checklist del evento | Must Have | Draft | — |
| EPIC-TASK-001 | Crear tarea manual | US-028 | Crear tarea manual | Must Have | Draft | — |
| EPIC-TASK-001 | Edit/Delete tarea | US-029 | Editar/eliminar tarea | Must Have | Draft | Soft delete |
| EPIC-TASK-001 | Cambio de estado | US-030 | Cambiar estado de tarea | Must Have | Draft | State machine |
| EPIC-TASK-001 | Confirmar IA bulk | US-031 | Confirmar tareas IA en bloque | Must Have | Draft | HITL |
| EPIC-TASK-001 | Filtros 7/30 | US-032 | Filtrar por próximos 7/30 días | Must Have | Draft | — |
| EPIC-TASK-001 | Progreso % | US-033 | Ver progreso (% done) | Must Have | Draft | Dashboard |
| EPIC-TASK-001 | Notif T-7 | US-034 | Recibir notif in-app T-7 | Should Have | Draft | Job programado |
| EPIC-BUD-001 | Vista budget | US-035 | Ver/editar mi presupuesto | Must Have | Draft | Moneda inmutable |
| EPIC-BUD-001 | CRUD items | US-036 | CRUD BudgetItem por categoría | Must Have | Draft | — |
| EPIC-BUD-001 | HITL budget IA | US-037 | Aceptar distribución IA | Must Have | Draft | Items editables |
| EPIC-BUD-001 | Warning overcommit | US-038 | Warning cuando committed > total | Must Have | Draft | No bloqueante |
| EPIC-BUD-001 | Update committed | US-039 | Committed actualizado por booking | Must Have | Draft | Atómico con confirmación |
| EPIC-VND-001 | Crear perfil | US-040 | Crear mi VendorProfile | Must Have | Draft | Estado pending |
| EPIC-VND-001 | Editar perfil | US-041 | Editar mi perfil (excepto rejected) | Must Have | Draft | — |
| EPIC-VND-001 | Cambio categorías (5 máx) | US-042 | Cambiar categorías (máx 5) | Must Have | Draft | Decisión PO #3 |
| EPIC-VND-001 | Portafolio 10 imágenes | US-043 | Subir hasta 10 imágenes por trabajo | Must Have | Draft | Decisión PO #2 |
| EPIC-VND-001 | CRUD VendorService | US-044 | Gestionar paquetes | Must Have | Draft | — |
| EPIC-VND-001 | Búsqueda directorio | US-045 | Buscar proveedores | Must Have | Draft | Sólo approved |
| EPIC-VND-001 | Perfil público SEO | US-046 | Ver perfil público SEO | Must Have | Draft | Server Components |
| EPIC-VND-001 | Moderación admin | US-047 | Admin aprueba/rechaza/oculta | Must Have | Draft | AdminAction obligatoria |
| EPIC-VND-001 | Soft delete attachment | US-048 | Soft delete imagen portafolio | Must Have | Draft | Decisión PO #19 |
| EPIC-QR-001 | Crear QR + brief | US-049 | Enviar QuoteRequest con brief | Must Have | Draft | — |
| EPIC-QR-001 | Límite 5 por categoría | US-050 | Validar límite 5 activas | Must Have | Draft | Decisión PO #12 |
| EPIC-QR-001 | Vendor viewed | US-051 | Vendor marca QR viewed | Must Have | Draft | Auto transición |
| EPIC-QR-001 | Respuesta Quote | US-052 | Vendor responde Quote con desglose | Must Have | Draft | — |
| EPIC-QR-001 | Validez 15d | US-053 | valid_until default 15 días | Must Have | Draft | Decisión PO #4 |
| EPIC-QR-001 | Notif rechazo/expire | US-054 | Notificar vendor rechazo/expiración | Must Have | Draft | Decisión PO #13 |
| EPIC-QR-001 | Auto-expiration | US-055 | Jobs de expiración QR/Quote | Must Have | Draft | Clock injectable |
| EPIC-QR-001 | Cancelar QR | US-056 | Cancelar QuoteRequest activa | Must Have | Draft | — |
| EPIC-CMP-001 | Comparador | US-057 | Comparar Quotes lado a lado | Must Have | Draft | — |
| EPIC-CMP-001 | Preferred flag | US-058 | Marcar Quote `preferred` | Must Have | Draft | Una por (event, category) |
| EPIC-CMP-001 | Surface AI-006 | US-059 | Ver resumen IA del comparador | Should Have | Draft | Consume US-022 |
| EPIC-CMP-001 | Crear BookingIntent | US-060 | Crear BookingIntent desde Quote | Must Have | Draft | Disclaimer obligatorio |
| EPIC-CMP-001 | Confirm vendor | US-061 | Vendor confirma BookingIntent | Must Have | Draft | Atómico committed |
| EPIC-CMP-001 | Cancel sin penalty | US-062 | Cancelar BookingIntent | Must Have | Draft | Decisión PO #5 |
| EPIC-CMP-001 | Disclaimer | US-063 | Disclaimer visible al confirmar | Must Have | Draft | — |
| EPIC-CMP-001 | Surface committed | US-064 | Ver committed actualizado | Must Have | Draft | — |
| EPIC-REV-001 | Crear review | US-065 | Crear reseña verificada (1-5) | Must Have | Draft | Decisión PO #1 |
| EPIC-REV-001 | Visualización | US-066 | Ver reseñas en perfil vendor | Must Have | Draft | Excluye removed/hidden |
| EPIC-REV-001 | Moderación admin | US-067 | Admin oculta/elimina (soft) | Must Have | Draft | Decisión PO #11, AdminAction |
| EPIC-NOT-001 | Notif QR creada | US-068 | Aviso nueva QuoteRequest | Should Have | Draft | — |
| EPIC-NOT-001 | Notif Quote enviada | US-069 | Aviso nueva Quote | Should Have | Draft | — |
| EPIC-NOT-001 | Notif booking | US-070 | Aviso BookingIntent confirmado | Should Have | Draft | — |
| EPIC-NOT-001 | Surface T-7 | US-071 | Aviso T-7 (organizer) | Should Have | Draft | Consume US-034 |
| EPIC-NOT-001 | Mark as read | US-072 | Marcar notificación como leída | Should Have | Draft | Single + bulk |
| EPIC-NOT-001 | Vendor rechazos | US-073 | Vendor recibe aviso rechazo/expire | Must Have | Draft | Surface US-054 |
| EPIC-ADM-001 | Panel vendors | US-074 | Admin aprueba/rechaza (panel) | Must Have | Draft | UI completa US-047 |
| EPIC-ADM-001 | CRUD categorías | US-075 | CRUD ServiceCategory 2 niveles | Must Have | Draft | Decisión PO #18 |
| EPIC-ADM-001 | CRUD EventType | US-076 | Gestionar EventType (no hard delete) | Must Have | Draft | Decisión PO #17 |
| EPIC-ADM-001 | Panel reviews | US-077 | Moderar reseña (panel) | Must Have | Draft | Surface US-067 |
| EPIC-ADM-001 | Lectura eventos | US-078 | Listar eventos read-only | Must Have | Draft | Decisión PO #16 |
| EPIC-ADM-001 | Métricas | US-079 | Dashboard métricas operativas | Must Have | Draft | Sin métricas comerciales (PO #10) |
| EPIC-ADM-001 | Visor AdminAction | US-080 | Consultar log AdminAction | Must Have | Draft | Append-only |
| EPIC-I18N-001 | Selector idioma | US-081 | Cambiar idioma (surface) | Must Have | Draft | Surface US-007 |
| EPIC-I18N-001 | Idioma evento | US-082 | Configurar idioma del evento | Must Have | Draft | — |
| EPIC-I18N-001 | Moneda inmutable | US-083 | Cifras en moneda del evento | Must Have | Draft | Sin FX |
| EPIC-I18N-001 | i18n IA | US-084 | Prompts IA respetan idioma | Must Have | Draft | language_code en prompts |
| EPIC-SEED-001 | Seed script | US-085 | Ejecutar npm run seed reproducible | Must Have | Draft | Idempotente |
| EPIC-SEED-001 | Reset Demo | US-086 | Admin reset del entorno Demo | Must Have | Draft | Sólo Demo |
| EPIC-SEED-001 | Cobertura estados | US-087 | Eventos draft/active/completed | Must Have | Draft | — |
| EPIC-SEED-001 | BookingIntent demo | US-088 | ≥1 confirmed_intent visible | Must Have | Draft | Habilita reseñas |
| EPIC-BE-001 | Bootstrap Node + Express | US-089 | Inicializar Node + Express + TS | Must Have (P0) | Draft | — |
| EPIC-BE-001 | Estructura feature-first | US-090 | Carpetas por dominio | Must Have (P0) | Draft | Clean/Hex |
| EPIC-BE-001 | Pipeline middlewares | US-091 | Cadena de middlewares | Must Have (P0) | Draft | — |
| EPIC-BE-001 | Validación Zod | US-092 | Validación DTO con Zod | Must Have (P0) | Draft | — |
| EPIC-BE-001 | Error envelope | US-093 | Error envelope unificado | Must Have (P0) | Draft | — |
| EPIC-API-001 | Endpoints AUTH | US-094 | Implementar endpoints AUTH | Must Have (P0) | Draft | Conforme Doc 16 |
| EPIC-API-001 | Endpoints EVENT | US-095 | Implementar endpoints EVENT | Must Have (P0) | Draft | Conforme Doc 16 |
| EPIC-API-001 | Endpoints QUOTE/Booking | US-096 | Implementar endpoints QUOTE | Must Have (P0) | Draft | Conforme Doc 16 |
| EPIC-API-001 | Endpoints AI | US-097 | Implementar endpoints AI | Must Have (P0) | Draft | Backend-only LLM |
| EPIC-API-001 | OpenAPI | US-098 | Generar OpenAPI snapshot | Should Have | Draft | — |
| EPIC-DB-001 | Schema Prisma | US-099 | Definir schema Prisma | Must Have (P0) | Draft | — |
| EPIC-DB-001 | Migrations | US-100 | Generar migrations base | Must Have (P0) | Draft | — |
| EPIC-DB-001 | Índices | US-101 | Implementar índices críticos | Must Have (P0) | Draft | — |
| EPIC-DB-001 | Constraints | US-102 | Validar constraints C-001..C-062 | Must Have (P0) | Draft | — |
| EPIC-FE-001 | Bootstrap Next.js | US-103 | Inicializar Next.js + deps | Must Have (P0) | Draft | — |
| EPIC-FE-001 | i18n setup | US-104 | Configurar i18n (4 locales) | Must Have (P0) | Draft | next-intl |
| EPIC-FE-001 | Route groups | US-105 | Route groups por rol | Must Have (P0) | Draft | — |
| EPIC-FE-001 | TanStack + MSW | US-106 | Configurar TanStack Query + MSW | Must Have (P0) | Draft | — |
| EPIC-FE-001 | Layouts | US-107 | Layouts y navegación por rol | Must Have (P0) | Draft | — |
| EPIC-SEC-001 | Cookies HttpOnly | US-108 | Configurar cookies firmadas | Must Have (P0) | Draft | — |
| EPIC-SEC-001 | Captcha | US-109 | Integrar captcha en auth | Must Have (P0) | Draft | Decisión PO #8 |
| EPIC-SEC-001 | Rate limit | US-110 | Rate limit en login/recovery/AI | Must Have (P0) | Draft | — |
| EPIC-SEC-001 | Middleware order | US-111 | Cadena en orden correcto | Must Have (P0) | Draft | — |
| EPIC-SEC-001 | Tests negativos | US-112 | Negative tests RBAC + ownership | Must Have (P0) | Draft | — |
| EPIC-OBS-001 | Logger | US-113 | Logger estructurado JSON | Should Have | Draft | — |
| EPIC-OBS-001 | Correlation | US-114 | Correlation ID por request | Should Have | Draft | — |
| EPIC-OBS-001 | Métricas IA | US-115 | Métricas mínimas de IA | Should Have | Draft | — |
| EPIC-OBS-001 | Healthcheck | US-116 | /healthz /readyz | Should Have | Draft | — |
| EPIC-AI-001 | Puerto LLMProvider | US-117 | Implementar puerto LLMProvider | Must Have (P0) | Draft | — |
| EPIC-AI-001 | OpenAIProvider | US-118 | Implementar OpenAIProvider | Must Have (P0) | Draft | Primary MVP |
| EPIC-AI-001 | MockAIProvider | US-119 | Implementar Mock determinista | Must Have (P0) | Draft | Tests + demo |
| EPIC-AI-001 | Anthropic stub | US-120 | Crear AnthropicProvider stub | Must Have (P0) | Draft | Decisión PO #15 |
| EPIC-AI-001 | Prompt registry | US-121 | Prompt registry versionado | Must Have (P0) | Draft | + AIPromptVersion |
| EPIC-AI-001 | AIRecommendation | US-122 | Persistir AIRecommendation | Must Have (P0) | Draft | Trazabilidad |
| EPIC-AI-001 | Timeout + fallback | US-123 | Timeout 60s + fallback Mock | Must Have (P0) | Draft | Decisión PO #9 |
| EPIC-AI-001 | JSON validation | US-124 | Validación JSON + 1 retry | Must Have (P0) | Draft | — |
| EPIC-QA-001 | Tooling | US-125 | Vitest+Supertest+Playwright+MSW | Must Have | Draft | — |
| EPIC-QA-001 | Backend tests | US-126 | Suite unit/integration backend | Must Have | Draft | ≥50% cobertura |
| EPIC-QA-001 | Contract tests | US-127 | Suite contract con MSW | Must Have | Draft | — |
| EPIC-QA-001 | E2E | US-128 | E2E Playwright sobre seed | Must Have | Draft | Demo readiness |
| EPIC-QA-001 | AI tests | US-129 | Suite IA con MockAIProvider | Must Have | Draft | Determinista |
| EPIC-QA-001 | RBAC negativa | US-130 | Suite RBAC negativa | Must Have | Draft | — |
| EPIC-QA-001 | A11Y | US-131 | Suite A11Y mínima | Must Have | Draft | — |
| EPIC-QA-001 | CI Gates | US-132 | Quality gates GH Actions | Must Have | Draft | — |
| EPIC-OPS-001 | Dockerfile | US-133 | Dockerfile backend | Must Have (P0) | Draft | — |
| EPIC-OPS-001 | Pipeline | US-134 | Pipeline CI/CD GH Actions | Must Have (P0) | Draft | — |
| EPIC-OPS-001 | Amplify | US-135 | Deploy frontend Amplify | Must Have (P0) | Draft | — |
| EPIC-OPS-001 | Backend deploy | US-136 | Deploy backend servicio gestionado | Must Have (P0) | Draft | App Runner / Beanstalk |
| EPIC-OPS-001 | RDS | US-137 | Conectar RDS PostgreSQL | Must Have (P0) | Draft | — |
| EPIC-OPS-001 | Secrets | US-138 | Configurar Secrets Manager | Must Have (P0) | Draft | — |
| EPIC-OPS-001 | Migrations CI | US-139 | Migrations Prisma en pipeline | Must Have (P0) | Draft | — |
| EPIC-OPS-001 | Demo reset | US-140 | Seed reset endpoint Demo | Must Have (P0) | Draft | Sólo Demo |
| EPIC-OPS-001 | Monitoring | US-141 | Healthcheck/readiness monitoring | Must Have (P0) | Draft | CloudWatch |
| EPIC-DEMO-001 | Guion demo | US-142 | Preparar guion 10-15 min | Must Have | Draft | — |
| EPIC-DEMO-001 | Pre-demo check | US-143 | Validar checklist pre-demo | Must Have | Draft | — |
| EPIC-DEMO-001 | Toggle provider | US-144 | Toggle Mock/OpenAI | Must Have | Draft | Demo robusto |
| EPIC-DEMO-001 | Seed visible | US-145 | confirmed_intent visible | Must Have | Draft | — |
| EPIC-DEMO-001 | Smoke Demo | US-146 | Smoke en Demo URL | Must Have | Draft | — |
| EPIC-ACAD-001 | ADR index | US-147 | Índice de ADRs | Should Have | Draft | ≥5 aceptados |
| EPIC-ACAD-001 | Traceability US | US-148 | US → FRD/UC/BR | Should Have | Draft | Cumplido en cada US |
| EPIC-ACAD-001 | Prompts ejemplares | US-149 | Documentar prompts y outputs | Should Have | Draft | PromptOps responsable |
| EPIC-ACAD-001 | Reporte académico | US-150 | Generar reporte de evidencia | Should Have | Draft | Entregable final |

---

## 3. Cobertura por Epic

| Epic | # Features (Epic Map) | # User Stories generadas | Cobertura | Notas |
|---|---:|---:|---|---|
| EPIC-AUTH-001 | 8 candidatas | 8 | 100% | OAuth Google como Could |
| EPIC-EVT-001 | 8 candidatas | 8 | 100% | Lifecycle completo + admin read-only |
| EPIC-AIP-001 | 10 candidatas | 10 | 100% | AI-001..AI-008 + HITL + regenerar |
| EPIC-TASK-001 | 8 candidatas | 8 | 100% | + notif T-7 |
| EPIC-BUD-001 | 5 candidatas | 5 | 100% | + warning + sync committed |
| EPIC-VND-001 | 9 candidatas | 9 | 100% | Perfil, portafolio, búsqueda, moderación |
| EPIC-QR-001 | 8 candidatas | 8 | 100% | Bilateral completo + jobs |
| EPIC-CMP-001 | 8 candidatas | 8 | 100% | Comparador + booking + disclaimer |
| EPIC-REV-001 | 3 candidatas | 3 | 100% | Crear + visualizar + moderar |
| EPIC-NOT-001 | 6 candidatas | 6 | 100% | In-app + email simulado |
| EPIC-ADM-001 | 7 candidatas | 7 | 100% | Governance + métricas + audit |
| EPIC-I18N-001 | 4 candidatas | 4 | 100% | Idioma + moneda + IA |
| EPIC-SEED-001 | 4 candidatas | 4 | 100% | Seed reproducible + reset Demo |
| EPIC-BE-001 | 5 candidatas | 5 | 100% | Foundation backend |
| EPIC-API-001 | 5 candidatas | 5 | 100% | + OpenAPI snapshot |
| EPIC-DB-001 | 4 candidatas | 4 | 100% | Schema + migrations + índices + constraints |
| EPIC-FE-001 | 5 candidatas | 5 | 100% | Next.js + i18n + TanStack + MSW |
| EPIC-SEC-001 | 5 candidatas | 5 | 100% | Cookies + captcha + rate limit + RBAC |
| EPIC-OBS-001 | 4 candidatas | 4 | 100% | Logs + correlation + métricas IA + healthcheck |
| EPIC-AI-001 | 8 candidatas | 8 | 100% | LLMProvider + Mock + AIRecommendation + timeout |
| EPIC-QA-001 | 8 candidatas | 8 | 100% | Tooling + suites + gates |
| EPIC-OPS-001 | 9 candidatas | 9 | 100% | Docker + CI/CD + AWS + secrets + monitoring |
| EPIC-DEMO-001 | 5 candidatas | 5 | 100% | Guion + checklist + toggle + seed + smoke |
| EPIC-ACAD-001 | 4 candidatas | 4 | 100% | ADR + traceability + prompts + reporte |
| **TOTAL** | **150** | **150** | **100%** | Cobertura total del Epic Map MVP |

---

## 4. Potential Gaps / Requires Product Owner Review

Durante la generación se identificaron las siguientes decisiones u observaciones que requieren validación del Product Owner antes de cerrar el backlog:

### 4.1 Decisiones de scope pendientes

- **US-008 (Login con Google):** marcado como Could Have en EPIC-AUTH-001. Confirmar inclusión en MVP o diferir como Future.
- **US-023 (AI-007 Vendor bio/paquetes):** marcado como Could Have. Confirmar inclusión MVP o diferir.
- **US-022, US-024, US-026 (Should Have):** definir si entran al primer MVP o se difieren a iteración 1.1.

### 4.2 Parámetros operacionales por confirmar

- **Límites configurables:**
  - US-026 — máximo de regeneraciones IA por sugerencia (sugerido 5).
  - US-031 — máximo de IDs por bulk confirm (sugerido 50).
  - US-053 — máximo de validez de Quote (sugerido 90 días).
  - US-055 — días sin respuesta para expirar QR (sugerido 30).
- **Horarios de jobs (UTC):**
  - US-015 — `AutoCompleteEventsJob` (sugerido 00:30 UTC).
  - US-034 — `EmitT7NotificationsJob` (sugerido 08:00 hora local del evento).
  - US-055 — `QuoteExpirationJob` / `QuoteRequestExpirationJob` (diario).
- **Duraciones de sesión y tokens:**
  - US-003 — vida de cookie de sesión (sugerido 30 días).
  - US-004 — vida de token de reseteo (sugerido 30 minutos).

### 4.3 Decisiones funcionales

- **US-010 (Edit evento):** política de recálculo vs override manual de tareas T-x cuando cambia `event_date`. Confirmar prioridad: respetar overrides manuales del usuario.
- **US-011 (Cancel evento):** comportamiento sobre `BookingIntent.confirmed_intent` cuando se cancela el evento. Sugerido: cascada `cancelled` con notificación.
- **US-056 (Cancel QR):** comportamiento si existe `BookingIntent` activo. Sugerido: no permitir cancel si hay booking confirmado; sí si solo hay Quote.
- **US-065 (Crear reseña):** ventana temporal post-evento para crear reseña (¿N días?). Confirmar política.
- **US-006 (Change password):** ¿se invalidan otras sesiones automáticamente?
- **US-007 (Idioma):** confirmar nombres nativos en selector (Español LATAM, Español, Português, English).
- **US-053:** confirmar máximo absoluto de validez.

### 4.4 Capacidades de moderación / re-aprobación

- **US-041 (Edit vendor profile):** ¿cambios mayores re-disparan revisión admin? Sugerido sí para campos sensibles (nombre, ciudad, categorías).
- **US-077 (Moderar reseña):** ¿se notifica al organizador / vendor afectado? Sugerido sin notif MVP.

### 4.5 Académico / trazabilidad

- **US-148:** consolidar matriz trazabilidad US ↔ FRD/UC/BR en herramienta canónica para entrega académica.
- **US-149:** definir formato del catálogo de prompts y outputs sanitizados para evaluación AI4Devs.

### 4.6 Calidad técnica

- **US-098 (OpenAPI):** confirmar si se genera con zod-to-openapi o se mantiene manual.
- **US-115 (Métricas IA):** confirmar formato de export (Prometheus, OpenTelemetry o JSON).

### 4.7 Demo readiness

- **US-144 (Toggle provider):** documentar formalmente el procedimiento de toggle en runbook de demo.
- **US-145:** asegurar que el seed incluye al menos 1 reseña verificada por vendor demo principal.

---

## 5. Próximos pasos sugeridos

1. **Reunión PO + BA:** revisar sección 4 y resolver decisiones pendientes.
2. **Refinamiento backlog:** estimar (story points / WSJF) cada US tras decisiones.
3. **Sprint planning:** ordenar por camino crítico (sección 17.3 del Epic Map).
4. **Asignar Owner / Sprint:** actualizar metadata `Owner` y `Sprint / Milestone` en cada US.
5. **Validar trazabilidad:** correr herramienta de validación que confirme que cada Use Case (UC-*) está cubierto por al menos una US.

---

> **Conclusión:** Las 150 User Stories cubren el 100% de las features candidatas del Epic Map MVP. No se detectaron gaps bloqueantes, sólo decisiones de scope/parámetros pendientes de confirmación con el Product Owner (sección 4).
