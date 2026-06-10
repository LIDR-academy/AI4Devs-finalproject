# EventFlow — Data Seed Strategy

## 1. Propósito del documento

Este documento define la **estrategia de datos seed (datos precargados) para el MVP de EventFlow**, plataforma asistida por IA para la planificación de eventos y la gestión simplificada de cotizaciones con proveedores.

La estrategia tiene como propósito:

- Definir qué datos deben precargarse en los ambientes de desarrollo, QA, demo y evaluación académica.
- Justificar cada dataset a partir de evidencias en la documentación fuente (Discovery, MVP Scope, Business Rules, FRD, NFR, Casos de Uso, Data Model, AI Features y decisiones del Product Owner).
- Garantizar que la demo del Trabajo Final de Máster sea **demostrable, repetible y libre de datos reales sensibles**.
- Soportar todos los flujos críticos del MVP: planificación con IA, cotizaciones, booking intent simulado, reseñas, moderación, notificaciones in-app y gobernanza por parte del admin.
- Preservar los límites de alcance del MVP, evitando datos que conviertan a EventFlow en un marketplace transaccional completo o que activen funcionalidades futuras (pagos reales, contratos, WhatsApp, app nativa, moderación IA autónoma, conversión de moneda, etc.).
- Servir como insumo directo para el equipo de desarrollo, QA, Product Owner, presentador de demo, revisores académicos, agentes de IA generadores de user stories/tareas/tests y para el script seed reproducible.

Este documento es una **fuente de verdad de planificación** y **no contiene código de implementación**.

---

## 2. Alcance del documento

### 2.1 Incluye

- Datasets seed obligatorios y recomendados para el MVP.
- Datasets clasificados como Futuro o Fuera de Alcance que se mencionan con fines de trazabilidad.
- Reglas de clasificación, priorización y trazabilidad de seed data.
- Definición de volúmenes recomendados.
- Escenarios demo y escenarios QA soportados.
- Estrategia de reset y regeneración.
- Convenciones de privacidad, nomenclatura y seguridad para datos seed.
- Matriz consolidada y matriz de trazabilidad hacia FRD, NFR, Use Cases, Business Rules, Entidades del Data Model y AI Features.
- Riesgos, supuestos, decisiones pendientes y checklist de readiness.

### 2.2 No incluye

- Código fuente del script seed.
- Especificación técnica de migraciones, ORM, ni scripts ejecutables.
- Diseño de UI/UX de pantallas de demo.
- Estrategia de tipo de cambio o conversión de monedas (fuera de alcance del MVP).
- Datos personales reales o datos de usuarios reales fuera del Product Owner.

---

## 3. Fuentes utilizadas

| Documento fuente | Uso principal en este documento |
|---|---|
| `1-Domain-Discovery-Report.md` | Contexto general de dominio, vertical de eventos, mercados, idiomas y monedas. |
| `2-Product-Owner-Decisions.md` | Decisiones del Product Owner sobre mercado piloto, idiomas, moneda, proveedor LLM, branding, datos seed (5–10 organizadores, 10–20 proveedores), moderación manual. |
| `3-MVP-Scope-Definition.md` | Alcance MVP, exclusiones explícitas, criterios de éxito de demo, volúmenes mínimos seed. |
| `4-Business-Rules-Document.md` | Reglas BR-AUTH, BR-EVENT, BR-VENDOR, BR-QUOTE, BR-BOOKING, BR-REVIEW, BR-AI, BR-SEED, BR-ADMIN, BR-PRIVACY, BR-OOS. |
| `5-User-Roles-Permissions-Matrix.md` | Matriz de roles Organizador, Proveedor, Admin; permisos por feature; reglas de visibilidad. |
| `6-Domain-Data-Model.md` | Entidades, campos, enums de estado, constraints (C-008, C-022, C-026b, C-027b, C-031, C-041, C-043, C-056, C-057, C-058, C-060). |
| `7-AI-Features-Specification.md` | Features AI-001 a AI-008, proveedores OpenAI/Mock/Anthropic, timeout 60 s, validación humana. |
| `8-Use-Cases-Specification.md` | UC-AUTH, UC-EVENT, UC-AI, UC-TASK, UC-BUDGET, UC-VENDOR, UC-QUOTE, UC-BOOKING, UC-REVIEW, UC-NOTIF, UC-I18N, UC-ADMIN, UC-DEMO. |
| `8.1-Product-Owner-Decisions-Use-Cases-Addendum.md` | Decisiones operativas: rating 1–5, 10 imágenes portafolio, 5 cambios de categoría, validez 15 días, límite 5 QuoteRequests por categoría, auto-completar 2 días, moneda inmutable, captcha, timeout IA 1 min, métricas admin, soft delete reseñas, jerarquía 2 niveles. |
| `8.2-Documentation-Alignment-Review-Before-FRD.md` | Validación cruzada y consistencia previa al FRD. |
| `9-Functional-Requirements-Document.md` | FR-AUTH, FR-USER, FR-EVENT, FR-AI, FR-TASK, FR-BUDGET, FR-VENDOR, FR-SERVICE, FR-QUOTE, FR-BOOKING, FR-REVIEW, FR-NOTIF, FR-I18N, FR-ADMIN, FR-SEED, FR-DEMO. |
| `10-Non-Functional-Requirements.md` | NFR-PERF, NFR-SEC, NFR-PRIV, NFR-REL, NFR-USAB, NFR-A11Y, NFR-I18N, NFR-AI, NFR-MAINT, NFR-TEST, NFR-OBS, NFR-DATA, NFR-DEMO, NFR-DEPLOY. |

---

## 4. Principios de seed data para el MVP

1. **Trazabilidad a fuente.** Cada dataset incluido en el MVP debe poder rastrearse a un FR, NFR, UC, BR, entidad, feature de IA o decisión documentada del Product Owner.
2. **Alcance MVP estricto.** No se siembran datos para pagos reales, contratos, comisiones, WhatsApp, chat en tiempo real, push nativo, RSVP, conversión de moneda o moderación IA autónoma.
3. **Demostrabilidad.** El seed debe permitir un recorrido guiado de 10–15 minutos cubriendo los cinco flujos principales (NFR-DEMO-006).
4. **Idempotencia y reproducibilidad.** El seed debe ejecutarse vía un único comando documentado (NFR-DEMO-003).
5. **Determinismo del MockAIProvider.** Las respuestas IA seed deben ser deterministas para garantizar demos reproducibles (NFR-AI-008).
6. **Privacidad por diseño.** Sin PII real, sin datos sensibles, sin credenciales en repositorio (NFR-PRIV-004, NFR-SEC-008, BR-PRIVACY-010).
7. **Marca `is_seed`.** Toda entidad sembrada debe llevar el flag `is_seed=true` para auditoría y separación lógica frente a datos operativos reales (BR-SEED-005).
8. **Coherencia cultural LATAM.** Contenido relevante para Guatemala como mercado piloto (padrinos, hora loca, marimba/mariachi/DJ, candy bar) y eventos representativos.
9. **Multi-idioma y multi-moneda.** Cubrir al menos 2 idiomas y 3 monedas (NFR-I18N-006).
10. **Sin contradicciones con reglas de negocio.** El seed debe respetar todas las invariantes (currency inmutable, validez 15 días, 5 QuoteRequests máx, rating 1–5, 10 imágenes portafolio, 2 niveles de categoría, auto-completar 2 días, soft delete).
11. **Escala adecuada.** Volúmenes suficientes para mostrar valor y filtros, pero pequeños para mantener performance demo (NFR-PERF-005).
12. **Separación de dominios.** Datasets organizados por dominio (USER, VENDOR, EVENT, QUOTE, …) para facilitar mantenimiento del script seed.

---

## 5. Metodología de extracción de seed data

La construcción de esta estrategia siguió el orden:

```text
Read → Extract → Classify → Validate Scope → Define Seed Strategy → Trace
```

### 5.1 Pasos aplicados

1. **Read.** Lectura completa de los 12 documentos fuente.
2. **Extract.** Identificación de datasets candidatos a partir de FR, NFR, BR, UC, entidades y decisiones PO.
3. **Classify.** Clasificación de cada dataset como **Explicit / Derived / Assumption / Recommended**.
4. **Validate Scope.** Verificación contra exclusiones explícitas (BR-OOS-001 a BR-OOS-018) y guardrails del MVP.
5. **Define Seed Strategy.** Volúmenes, estados, campos mínimos, escenarios demo y QA.
6. **Trace.** Mapeo bidireccional a FR / NFR / UC / BR / Entidades / AI.

### 5.2 Niveles de clasificación

| Clasificación | Significado |
|---|---|
| **Explicit** | Stated directamente en un documento fuente. |
| **Derived** | Inferido de un FR, NFR, BR, UC, entidad, AI feature o decisión PO. |
| **Assumption** | Necesario para hacer coherente el seed, sin sustento textual directo. |
| **Recommended** | Buena práctica para demo/QA/dev, opcional. |

### 5.3 Decisión de alcance

| Scope | Significado |
|---|---|
| **MVP** | Debe sembrarse en el MVP. |
| **Future** | No se siembra en MVP; reservado para evolución. |
| **Out of Scope** | Excluido por reglas del MVP. |
| **Requires Product Owner Decision** | Falta decisión formal del Product Owner. |

### 5.4 Prioridad

| Prioridad | Uso |
|---|---|
| **Must Have** | Sin él, la demo o el MVP no son funcionales/demostrables. |
| **Should Have** | Mejora demo y QA, pero no bloquea. |
| **Could Have** | Aporta valor secundario. |
| **Future** | Posterior al MVP. |
| **Out of Scope** | No aplicable al MVP. |

---

## 6. Seed Data Extraction from Source Documents

| Candidate Seed Dataset | Domain | Found in source document | Evidence / context | Classification | MVP decision |
|---|---|---|---|---|---|
| Usuario admin (Product Owner) | USER | Doc 2 §3 (#10); BR-AUTH-002; FR-AUTH-007; NFR-DEMO-001 | "El administrador principal será el Product Owner". | Explicit | MVP |
| 5–10 usuarios organizadores | USER | Doc 2 §11; FR-SEED-002; NFR-DEMO-001; BR-SEED-002 | Cantidad recomendada para la demo. | Explicit | MVP |
| 10–20 usuarios proveedores | USER | Doc 2 §11; FR-SEED-002; NFR-DEMO-001; BR-SEED-002 | Necesarios para el directorio público y respuesta a cotizaciones. | Explicit | MVP |
| 6 EventTypes MVP | EVENTTYPE | Doc 2 §3 (#2); BR-EVENTTYPE-001; FR-EVENT-013; UC-ADMIN-007 | Lista cerrada: wedding, xv, baptism, baby_shower, birthday, corporate. | Explicit | MVP |
| 10–15 ServiceCategories con jerarquía 2 niveles | CATEGORY | Doc 8.1 §6 (#18); BR-SERVICE-005; FR-SERVICE-002; NFR-DEMO-005 | Soporta directorio, cotizaciones y presupuesto. | Explicit | MVP |
| Vendor profiles aprobados, pendientes, rechazados, ocultos | VENDOR | BR-VENDOR-003; FR-VENDOR-010; UC-ADMIN-003..006; NFR-DEMO-002 | Necesario para directorio y demo de moderación admin. | Derived | MVP |
| VendorServices por categoría | VENDOR | BR-SERVICE-001; FR-VENDOR-009; FR-SERVICE-005 | Catálogo de paquetes para cotización y comparación. | Derived | MVP |
| Portafolio con hasta 10 imágenes por trabajo | VENDOR | Doc 8.1 §2 (#2); BR-VENDOR-005; FR-VENDOR-006 | Decisión PO explícita. | Explicit | MVP |
| Attachments con soft delete | VENDOR | Doc 8.1 §6 (#19); BR-PRIVACY-011; FR-VENDOR-008 | Soft delete obligatorio. | Explicit | MVP |
| 10–15 Events en draft/active/completed/cancelled | EVENT | Doc 2 §11; FR-SEED-002; BR-EVENT-005; BR-SEED-003; NFR-DEMO-001/002 | Estados visibles en demo. | Explicit | MVP |
| Eventos con moneda local y USD | EVENT | Doc 8.1 §2 (#7); BR-EVENT-007; FR-EVENT-003; NFR-I18N-006 | Inmutable post-creación. | Explicit | MVP |
| Eventos en distintos idiomas (es-LATAM, es-ES, pt, en) | EVENT | BR-I18N-001..005; FR-I18N-001..005; NFR-I18N-006 | Demo multi-idioma. | Explicit | MVP |
| 50–100 EventTasks (manual + AI) | TASK | FR-TASK-001..012; BR-TASK-001..010 | Tareas con estados y origen. | Derived | MVP |
| 10–15 Budgets y 40–80 BudgetItems | BUDGET | FR-BUDGET-001..010; BR-BUDGET-001..010 | Soporta dashboard, warning, currency display. | Derived | MVP |
| 15–25 QuoteRequests | QUOTE | Doc 2 §11; FR-SEED-004; BR-QUOTE-001..009; FR-QUOTE-002 | Volumen + límite 5 activas por categoría por evento. | Explicit | MVP |
| 10–20 Quotes en distintos estados | QUOTE | Doc 2 §11; FR-SEED-004; BR-QUOTE-011..025 | Lifecycle draft/sent/accepted/rejected/expired. | Explicit | MVP |
| Quote default validity 15 días | QUOTE | Doc 8.1 §2 (#4); BR-QUOTE-015; FR-QUOTE-005 | Regla explícita. | Explicit | MVP |
| BookingIntents pending y confirmed_intent | BOOKING | FR-SEED-005; BR-BOOKING-001..010; FR-BOOKING-001..010 | Al menos 1 confirmado obligatorio. | Explicit | MVP |
| BookingIntent cancelado desde confirmed_intent | BOOKING | Doc 8.1 §2 (#5); BR-BOOKING-009; FR-BOOKING-004 | Cancelación permitida. | Explicit | MVP |
| 20–40 Reviews (rating 1–5) | REVIEW | Doc 2 §11; Doc 8.1 §2 (#1); BR-REVIEW-003; FR-REVIEW-002; FR-SEED-005 | Escala 1–5. | Explicit | MVP |
| Reviews published/hidden/removed | REVIEW | BR-REVIEW-005; FR-REVIEW-004/005; Doc 8.1 §2 (#11) | Soft delete + auditoría. | Explicit | MVP |
| 15–30 Notifications in-app | NOTIF | FR-NOTIF-001..006; BR-NOTIF-001..007 | Eventos de quote, booking, vendor, tareas. | Derived | MVP |
| AIRecommendations seed (8 features) | AI | FR-AI-001..020; AI-001..008; BR-AI-001..015; FR-SEED-006 | Plan, checklist, budget, brief, comparison, prioritization, vendor bio. | Derived | MVP |
| MockAIProvider respuestas deterministas | AI | BR-AI-005/006; NFR-AI-007/008; NFR-REL-003; NFR-DEMO-004 | Mandatorio. | Explicit | MVP |
| AnthropicProvider stub | AI | Doc 8.1 §5; BR-AI-005; FR-AI-015 | Interface preparada, no funcional MVP. | Explicit | Future |
| AdminActions de auditoría | ADMIN | BR-ADMIN-004/011; FR-ADMIN-006; NFR-OBS-001 | Auditoría obligatoria. | Explicit | MVP |
| Acceso `view_event` de admin auditado | ADMIN | BR-EVENT-014; FR-EVENT-010; FR-ADMIN-008 | Read-only con bitácora. | Explicit | MVP |
| Idiomas activos (es-LATAM, es-ES, pt, en) | I18N | BR-I18N-001..008; FR-I18N-001..006 | Inglés obligatorio. | Explicit | MVP |
| Monedas (GTQ, USD, EUR, MXN, COP) | I18N | NFR-I18N-004; FR-BUDGET-009; Doc 2 §10 | GTQ por mercado piloto; USD mandatorio. | Explicit | MVP |
| Currency conversion rates | I18N | Doc 2 §10; BR-OOS-015 | Excluido. | Explicit | Out of Scope |
| Pagos / tarjetas / comisiones / contratos | OOS | BR-OOS-001..003; FR-BOOKING-007 | Excluido. | Explicit | Out of Scope |
| WhatsApp / chat real-time / push nativo / SMS | OOS | BR-NOTIF-006; BR-OOS-004/006/017; FR-NOTIF-006 | Excluido. | Explicit | Out of Scope |
| Guest list / RSVP / seating | OOS | BR-OOS-014 | Excluido. | Explicit | Out of Scope |
| AI moderación / análisis sentimiento | OOS | BR-REVIEW-006; BR-OOS-007/008; Doc 2 §12 | Excluido. | Explicit | Out of Scope |
| Multi-collaborators por evento | OOS | BR-OOS-013; BR-AUTH-005 | Excluido. | Explicit | Out of Scope |
| KYC y verificación automática de vendor | OOS | BR-VENDOR-006; BR-OOS | Excluido; aprobación manual. | Explicit | Out of Scope |
| External calendar integration | OOS | Doc 2 §8.2; BR-FUTURE-020 | Futuro. | Explicit | Future |
| Suscripciones reales de proveedor | OOS | BR-VENDOR-007 | Solo conceptual en MVP. | Explicit | Future |

> **Conclusión de la extracción:** todos los datasets MVP listados arriba tienen soporte documental directo o derivado. Los datasets marcados como **Out of Scope** o **Future** se incluyen exclusivamente con fines de trazabilidad y para reforzar los guardrails del MVP.

---

## 7. Resumen ejecutivo de la estrategia seed

La estrategia seed de EventFlow para el MVP se construye sobre **18 dominios de datos** que cubren la totalidad de los flujos demostrables del producto:

1. **Identidad y roles** — 1 admin (Product Owner), 5–10 organizadores y 10–20 proveedores en estados diversos (`active`, `suspended`).
2. **Catálogos cerrados** — 6 EventTypes y 10–15 ServiceCategories con jerarquía de máximo 2 niveles.
3. **Catálogo de proveedores** — Perfiles `approved`, `pending`, `rejected` y `hidden`, con servicios y portafolios.
4. **Eventos** — 10–15 eventos cubriendo `draft`, `active`, `completed` y `cancelled`, en GTQ y USD, en es-LATAM e inglés (con muestras de es-ES y pt).
5. **Checklist y presupuesto** — Tareas IA y manuales en distintos estados; BudgetItems en categorías representativas.
6. **Cotizaciones** — QuoteRequests/Quotes en todos los estados del lifecycle, respetando límite 5 activas por categoría y validez 15 días por defecto.
7. **Booking intent simulado** — Al menos 1 `confirmed_intent` para habilitar reseñas; ejemplos cancelados desde confirmado.
8. **Reseñas y moderación** — Rating 1–5, escenarios `published`, `hidden`, `removed`, con auditoría en AdminAction.
9. **Notificaciones in-app** — Cobertura de todos los triggers del MVP.
10. **IA** — Respuestas seed del MockAIProvider para cada una de las 8 features AI-001..AI-008, registradas como AIRecommendation.
11. **Gobernanza admin** — AdminActions inmutables para aprobaciones, moderaciones, cambios de catálogo y accesos `view_event`.
12. **Idioma y moneda** — Catálogos `Language` y `Currency` activos.

> **Resultado esperado:** una plataforma viva y consistente, capaz de demostrar el flujo E2E del organizador, el flujo del proveedor, el flujo del admin, multilingüismo, multi-moneda (sin conversión) y la integración responsable de IA con human-in-the-loop.

---

## 8. Objetivos de la estrategia seed

| ID | Objetivo | Resultado verificable |
|---|---|---|
| OBJ-SEED-01 | Habilitar la demo guiada de 10–15 minutos. | UC-DEMO-001 ejecutable end-to-end con datos seed. |
| OBJ-SEED-02 | Soportar la evaluación académica E2E. | Cinco flujos principales demostrables sin carga manual. |
| OBJ-SEED-03 | Cubrir QA funcional y de reglas de negocio. | Casos de prueba para BR críticas pasan con seed. |
| OBJ-SEED-04 | Permitir desarrollo local sin dependencia de IA real. | App funcional con `LLM_PROVIDER=mock`. |
| OBJ-SEED-05 | Mantener los guardrails del MVP. | No se siembran datos de pagos, contratos, WhatsApp, etc. |
| OBJ-SEED-06 | Garantizar privacidad. | 100% de datos seed son ficticios. |
| OBJ-SEED-07 | Soportar trazabilidad. | Cada dataset MVP enlazado a FR/NFR/UC/BR/entidad/AI feature. |
| OBJ-SEED-08 | Habilitar reset reproducible. | Un único comando regenera la base seed. |
| OBJ-SEED-09 | Reflejar cultura LATAM y mercado piloto Guatemala. | Categorías y eventos con referencias culturalmente coherentes. |
| OBJ-SEED-10 | Validar i18n y moneda. | Eventos en ≥2 idiomas y ≥3 monedas distintas. |

---

## 9. Ambientes que usarán seed data

| Ambiente | Uso del seed | Comando conceptual |
|---|---|---|
| **Local development** | Setup inicial del proyecto; trabajo del equipo dev. | `seed:demo` |
| **CI / pruebas automatizadas** | Determinismo en tests E2E e integración. | `seed:qa` |
| **Staging / Demo público** | Presentaciones académicas y de Product Owner. | `seed:demo` |
| **Evaluación académica** | Reviewer del Master ejecuta la app pública con datos preparados. | `seed:demo` |
| **Producción** | **No aplica.** El seed nunca se ejecuta en producción real. | — |

> **NFR-DEMO-003 + NFR-MAINT-005:** El script seed debe ser idempotente, separado de la lógica productiva y ejecutable como comando independiente.

---

## 10. Datasets incluidos en el MVP

| Dataset | Dominio | Prioridad | Sección |
|---|---|---|---|
| Usuarios y roles | USER | Must Have | §12 |
| EventTypes | EVENTTYPE | Must Have | §13 |
| ServiceCategories | CATEGORY | Must Have | §14 |
| VendorProfiles y VendorServices | VENDOR | Must Have | §15 |
| VendorPortfolio y Attachments | VENDOR | Must Have | §16 |
| Events | EVENT | Must Have | §17 |
| EventTasks (checklist) | TASK | Must Have | §18 |
| Budgets y BudgetItems | BUDGET | Must Have | §19 |
| QuoteRequests y Quotes | QUOTE | Must Have | §20 |
| BookingIntents | BOOKING | Must Have | §21 |
| Reviews | REVIEW | Must Have | §22 |
| Notifications | NOTIF | Should Have | §23 |
| AIRecommendations + MockAIProvider | AI | Must Have | §24 |
| AdminActions | ADMIN | Must Have | §25 |
| Languages y Currencies | I18N | Must Have | §26 |
| Locations | EVENT/VENDOR | Should Have | §17/§15 |
| AIPromptVersion | AI | Should Have | §24 |

---

## 11. Datasets futuros o fuera de alcance

| Dataset | Clasificación | Razón |
|---|---|---|
| Pagos, tarjetas, tokens, transferencias | Out of Scope | BR-OOS-001/002; FR-BOOKING-007. |
| Contratos legales, firmas digitales | Out of Scope | BR-OOS-003. |
| Comisiones reales | Out of Scope | BR-OOS-002. |
| Invoices y tax documents | Out of Scope | BR-OOS-001; BR-PRIVACY-007. |
| Mensajes de WhatsApp / SMS / push nativo | Out of Scope | BR-NOTIF-006; FR-NOTIF-006. |
| Chat en tiempo real | Out of Scope | BR-OOS-006. |
| RSVP / Guest list / Seating plan | Out of Scope | BR-OOS-014. |
| Calendarios externos (Google/Outlook) | Future | BR-FUTURE-020. |
| Multi-collaborators por evento | Future | BR-OOS-013; BR-AUTH-005. |
| KYC automatizado | Out of Scope | BR-VENDOR-006. |
| AI sentiment analysis / AI moderation | Out of Scope | BR-REVIEW-006; BR-OOS-007/008. |
| Currency conversion rates | Out of Scope | BR-OOS-015. |
| Suscripciones y planes premium reales | Future | BR-VENDOR-007. |
| Imágenes generadas por IA | Out of Scope | BR-AI-015. |
| AnthropicProvider funcional | Future | Doc 8.1 §5. |
| Respuestas a reseñas por proveedor | Future | BR-REVIEW-008. |

Estos elementos **no se siembran** y, si aparecen, deben rechazarse durante revisión.

---

## 12. Usuarios y roles demo

### SEED-USER-001 — Cuenta admin Product Owner

#### Propósito
Habilitar el flujo administrativo y la gobernanza durante la demo y QA, sin exponer endpoints públicos para crear admins.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit

#### Entidades involucradas
`User`, `Role`, `AdminAction`.

#### Flujos soportados
UC-AUTH-002, UC-ADMIN-001..011, UC-DEMO-001.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| Admin user | 1 | Reservado al Product Owner. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| email | `admin@eventflow.demo` | Dominio ficticio reservado. |
| name | "EventFlow Admin" | Sin PII real. |
| role | `admin` | Asignado solo por seed (NFR-SEC-006). |
| preferred_language | `es-LATAM` | Idioma neutral base. |
| status | `active` | — |
| password | Placeholder | Definir vía script o variable de entorno. |
| is_seed | true | — |

#### Estados requeridos
`active`.

#### Reglas de negocio relacionadas
BR-AUTH-002, BR-AUTH-008, BR-AUTH-010, BR-ADMIN-001..012, NFR-SEC-006.

#### Consideraciones QA
- Validar 403 al intentar acceder al panel admin con otros roles.
- Validar registro de cada acción del admin en `AdminAction`.

#### Consideraciones demo
- Login del Product Owner debe ser el primer paso de cualquier escenario admin.

#### Notas de implementación
- Generar password aleatorio fuerte por entorno; no almacenar en repositorio.
- Marcar la cuenta con `is_seed=true` para diferenciarla de usuarios reales futuros.

---

### SEED-USER-002 — Organizadores demo

#### Propósito
Demostrar el ciclo del organizador en múltiples estados de evento, idioma y moneda.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 2 §11; FR-SEED-002; NFR-DEMO-001)

#### Entidades involucradas
`User`, `Event`, `Budget`, `EventTask`, `QuoteRequest`, `Review`.

#### Flujos soportados
UC-AUTH-001/002, UC-EVENT-001..006, UC-AI-001..008, UC-TASK-*, UC-BUDGET-*, UC-QUOTE-*, UC-BOOKING-*, UC-REVIEW-001, UC-NOTIF-*.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| Organizadores activos | 6 | Suficientes para 10–15 eventos. |
| Organizadores adicionales (rango superior) | hasta 10 | Para reforzar dashboard y métricas. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| email | `organizer01@eventflow.demo` … `organizer10@eventflow.demo` | Dominio ficticio. |
| name | Nombres ficticios LATAM | "Lucía Hernández", "Diego Morales", etc. |
| role | `organizer` | — |
| preferred_language | `es-LATAM`, `es-ES`, `pt`, `en` | Mix para validar i18n. |
| status | `active` | — |
| is_seed | true | — |

#### Estados requeridos
`active`. Opcionalmente 1 `suspended` para QA (Recommended).

#### Reglas de negocio relacionadas
BR-AUTH-006, BR-USER-001..006, BR-I18N-003, BR-SEED-002.

#### Consideraciones QA
- Validar aislamiento: el organizador A no debe ver eventos del organizador B (NFR-SEC-003).
- Validar que el cambio de idioma persiste y se aplica a UI (FR-I18N-002).

#### Consideraciones demo
- Asignar al menos un organizador con eventos en cada estado (`draft`, `active`, `completed`, `cancelled`).
- Asignar idiomas diversos para mostrar i18n con datos reales.

#### Notas de implementación
- Distribuir los eventos entre los 5–10 organizadores siguiendo §17.
- Usar nombres ficticios variados de LATAM e ibéricos para reflejar mercado piloto y visión futura.

---

### SEED-USER-003 — Proveedores demo

#### Propósito
Soportar el directorio público, el flujo de cotización, las reseñas y la moderación admin.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 2 §11; FR-SEED-002; NFR-DEMO-001)

#### Entidades involucradas
`User`, `VendorProfile`, `VendorService`, `Attachment`, `Quote`, `Review`, `Notification`.

#### Flujos soportados
UC-AUTH-001/002, UC-VENDOR-001..008, UC-QUOTE-003..010, UC-BOOKING-002, UC-REVIEW-002.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| Vendors aprobados (`approved`) | 8–12 | Visibles en directorio. |
| Vendors pendientes (`pending`) | 2–4 | Para flujo admin. |
| Vendors rechazados (`rejected`) | 1–2 | Validar moderación negativa. |
| Vendors ocultos (`hidden`) | 1 | Validar ocultamiento. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| email | `vendor01@eventflow.demo` … `vendor20@eventflow.demo` | Dominio ficticio. |
| role | `vendor` | — |
| preferred_language | `es-LATAM` mayormente; algunos `en`, `pt`, `es-ES` | — |
| status | `active` | — |
| is_seed | true | — |

#### Estados requeridos
`active`. Más 1 vendor con `suspended` (Recommended) para QA.

#### Reglas de negocio relacionadas
BR-AUTH-007, BR-VENDOR-001..010, BR-SEED-002.

#### Consideraciones QA
- Verificar que solo los `approved` aparezcan en el directorio público (FR-VENDOR-003).
- Verificar visibilidad cruzada bloqueada (NFR-SEC-003): un vendor no ve los QuoteRequests de otros.

#### Consideraciones demo
- Distribuir vendors en distintas ciudades (Guatemala, Antigua, Quetzaltenango, Ciudad de México, Madrid) para soportar visión futura.

#### Notas de implementación
- Asociar cada vendor a un único `User`. La relación `User → VendorProfile` es 1:1.
- Reservar al menos un vendor con perfil incompleto (`pending`) y otro con `requires_admin_review=true` para demostrar el flujo de aprobación.

---

## 13. EventTypes seed

### SEED-EVENTTYPE-001 — Catálogo cerrado de tipos de evento MVP

#### Propósito
Habilitar la creación de eventos sobre un catálogo curado, con templates por tipo para la IA.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 2 §3 #2; BR-EVENTTYPE-001..007; FR-EVENT-013; FR-ADMIN-007)

#### Entidades involucradas
`EventType`, `AIPromptVersion`.

#### Flujos soportados
UC-EVENT-001, UC-AI-001..004, UC-ADMIN-007.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| EventTypes activos | 6 | Lista cerrada. |

#### Campos mínimos

| Code | Display name | Description | Active | Suggested vendor categories | AI template key |
|---|---|---|---|---|---|
| `wedding` | "Boda" | Boda completa. | true | catering, venue, photography, video, music, decoration, flowers, cake, makeup_hair | `plan.wedding.v1` |
| `xv` | "XV años" | Celebración de quinceaños. | true | venue, catering, music_dj, mariachi/marimba, decoration, photography, cake, dress | `plan.xv.v1` |
| `baptism` | "Bautizo" | Bautizo religioso/social. | true | venue, catering, decoration, photography, cake | `plan.baptism.v1` |
| `baby_shower` | "Baby shower" | Reunión prenatal. | true | venue, catering, decoration, entertainment, gifts | `plan.baby_shower.v1` |
| `birthday` | "Cumpleaños" | Cumpleaños general. | true | venue, catering, decoration, music_dj, cake, entertainment | `plan.birthday.v1` |
| `corporate` | "Evento corporativo" | Empresarial. | true | venue, catering, av, photography, transport, planner | `plan.corporate.v1` |

#### Estados requeridos
`active`.

#### Reglas de negocio relacionadas
BR-EVENTTYPE-001..007, BR-AI-014, FR-ADMIN-007.

#### Consideraciones QA
- Validar bloqueo de hard delete cuando un EventType tiene eventos asociados.
- Validar que solo el admin puede editar el catálogo.

#### Consideraciones demo
- Permitir al admin activar/desactivar tipos durante la demo de gobernanza.

#### Notas de implementación
- Cada display_name debe estar disponible en los 4 idiomas (BR-EVENTTYPE-005).
- El `AI template key` se referencia desde el MockAIProvider para garantizar respuestas deterministas (NFR-AI-008).

---

## 14. ServiceCategories seed

### SEED-CATEGORY-001 — Categorías de servicio con jerarquía 2 niveles

#### Propósito
Soportar el directorio de proveedores, las cotizaciones, los presupuestos y las recomendaciones IA por categoría.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 8.1 §6 #18; BR-SERVICE-003..005; FR-SERVICE-001..006; FR-ADMIN-004)

#### Entidades involucradas
`ServiceCategory`, `VendorService`, `BudgetItem`, `QuoteRequest`.

#### Flujos soportados
UC-VENDOR-006/007, UC-QUOTE-001, UC-BUDGET-002, UC-AI-004, UC-ADMIN-007.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| Categorías padre | 10–13 | Cobertura de necesidades MVP. |
| Subcategorías | 3–6 | Hasta 2 niveles. |
| Total ServiceCategory | 13–18 | Dentro del rango 10–15 recomendado en NFR-DEMO-005, ampliado por las subcategorías. |

Sugerencia de jerarquía (máx. 2 niveles):

```text
Catering
Venue / Salón
Fotografía
Video
Música
  └── DJ
  └── Marimba
  └── Mariachi
Decoración
  └── Flores
  └── Mobiliario
Pasteles y postres
Maquillaje y peinado
Entretenimiento
  └── Hora loca
  └── Show infantil
Transporte
Event planner
Audio/video corporativo (AV)
```

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| code | `catering`, `venue`, `music`, `music_dj`, ... | Unique. |
| display_name (i18n) | "Catering", "Música > DJ" | Traducciones en 4 idiomas. |
| parent_id | NULL o categoría padre | Solo 1 nivel de hijos. |
| depth_level | 1 o 2 | Max 2. |
| is_active | true | — |
| is_seed | true | — |

#### Estados requeridos
`active`. Una categoría `inactive` (Recommended) para QA del flag.

#### Reglas de negocio relacionadas
BR-SERVICE-001..007, BR-EVENTTYPE-002.

#### Consideraciones QA
- Validar que un intento de crear 3er nivel falle (NFR-DATA-006).
- Validar bloqueo de hard delete cuando hay servicios o subcategorías asociados (FR-SERVICE-003).

#### Consideraciones demo
- Mostrar al admin el árbol de categorías y permitir activar/desactivar.

#### Notas de implementación
- Definir `code` estable para referenciar desde EventType templates y BudgetItems.
- Los `display_name` deben traducirse a `es-LATAM`, `es-ES`, `pt`, `en`.

---

## 15. VendorProfiles y VendorServices seed

### SEED-VENDOR-001 — Perfiles de proveedor en estados diversos

#### Propósito
Mostrar el directorio público, la moderación admin y el flujo de cotización.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit + Derived (BR-VENDOR-001..010; FR-VENDOR-001..013; NFR-DEMO-001/002)

#### Entidades involucradas
`VendorProfile`, `User`, `Location`, `VendorService`, `Attachment`, `Review`.

#### Flujos soportados
UC-VENDOR-001..008, UC-QUOTE-001..010, UC-REVIEW-002, UC-ADMIN-003..006.

#### Cantidad recomendada

| Vendor seed type | Quantity | Status | Purpose |
|---|---:|---|---|
| Vendors aprobados completos | 6–8 | `approved` | Catálogo principal del directorio. |
| Vendors aprobados con portafolio mínimo | 2 | `approved` | Validar UI con datos escasos. |
| Vendors pendientes de aprobación | 2–4 | `pending` | Flujo admin de aprobación. |
| Vendors rechazados | 1–2 | `rejected` | Flujo admin negativo. |
| Vendors ocultos | 1 | `hidden` | Validar ocultamiento. |
| Vendor cerca del límite de cambios de categoría | 1 | `approved` | `category_change_count=4`; QA del límite 5. |
| Vendor con `requires_admin_review=true` | 1 | `approved` | Demo de revisión por cambios. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| business_name | "Hacienda San Lucas Events" | Ficticio. |
| bio | Texto promocional de 2–4 líneas | Premium/aspiracional. |
| location_id | Locations de Guatemala mayoritariamente | Mercado piloto. |
| languages_supported | `["es-LATAM", "en"]` | Mix. |
| categories | 1–3 ServiceCategory | Vía VendorService. |
| status | `pending` / `approved` / `rejected` / `hidden` | — |
| rating_avg | Calculado a partir de reviews seed | Denormalizado. |
| reviews_count | Calculado | — |
| category_change_count | 0..4 | Validar regla 5 máx. |
| ai_generated_bio | true en 2 vendors | Para mostrar AI-007. |
| is_seed | true | — |

#### Estados requeridos
`pending`, `approved`, `rejected`, `hidden`.

#### Reglas de negocio relacionadas
BR-VENDOR-001..010, BR-SERVICE-001, BR-PRIVACY-002.

#### Consideraciones QA
- Validar que el sexto cambio de categoría sea bloqueado (BR-VENDOR-004).
- Validar que `hidden` no aparezca en directorio público (FR-VENDOR-003).

#### Consideraciones demo
- Asociar reviews y portafolio sólo a `approved` para resaltar el catálogo.
- Mantener un vendor `pending` listo para que el admin lo apruebe en vivo.

#### Notas de implementación
- Los `vendor` user-accounts deben crearse en SEED-USER-003 y enlazarse 1:1.
- Las ciudades pueden ser ficticias pero coherentes (Guatemala, Antigua, Quetzaltenango, Ciudad de México, Madrid).

---

### SEED-VENDOR-002 — Paquetes / VendorServices

#### Propósito
Habilitar cotizaciones por categoría con un catálogo realista.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Derived (BR-SERVICE-001/002/006; FR-VENDOR-009; FR-SERVICE-005/007)

#### Entidades involucradas
`VendorService`, `VendorProfile`, `ServiceCategory`, `Currency`.

#### Flujos soportados
UC-VENDOR-004, UC-QUOTE-001/004, UC-AI-005.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| VendorServices totales | 20–40 | 2–4 por vendor aprobado. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| vendor_profile_id | FK al vendor aprobado | — |
| service_category_id | FK a ServiceCategory activa | — |
| package_name | "Paquete bronce / plata / oro" | Distintos tiers. |
| base_price | 5 000–50 000 (en moneda) | Solo referencial. |
| currency_code | GTQ predominante; USD/EUR en algunos | NFR-I18N-004. |
| description | Texto comercial corto | — |
| ai_generated_description | true en 3 servicios | Demostrar AI-007. |
| is_active | true | — |
| is_seed | true | — |

#### Estados requeridos
`is_active=true`.

#### Reglas de negocio relacionadas
BR-SERVICE-006 (precio referencial), BR-VENDOR-008.

#### Consideraciones QA
- Validar que la edición de `base_price` no afecta Quotes ya enviados.

#### Consideraciones demo
- Mostrar tres tiers de paquete por vendor aprobado destacado.

#### Notas de implementación
- Mantener consistencia entre `service_category_id` del VendorService y la categoría del QuoteRequest.

---

## 16. VendorPortfolio y Attachments seed

### SEED-VENDOR-003 — Portafolio del proveedor

#### Propósito
Mostrar trabajos previos del proveedor y validar los límites de portafolio.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 8.1 §2 #2; BR-VENDOR-005; FR-VENDOR-006..008)

#### Entidades involucradas
`Attachment` (owner_type=`vendor_work`), `VendorProfile`.

#### Flujos soportados
UC-VENDOR-005, UC-VENDOR-007, UC-ADMIN-006.

#### Cantidad recomendada

| Portfolio scenario | Quantity | Purpose |
|---|---:|---|
| Vendor aprobado con portafolio completo (3 trabajos × ~8 imágenes) | 3 vendors | Demo aspiracional. |
| Vendor aprobado con portafolio mínimo (1 trabajo × 2 imágenes) | 2 vendors | UI con datos escasos. |
| Vendor con trabajo en el límite (1 trabajo × 10 imágenes) | 1 vendor | QA del límite 10. |
| Vendor con attachment `deleted` (soft delete) | 1 vendor | QA de soft delete y auditoría. |
| Vendor con attachment intentando exceder 10 | 0 (no se siembra) | El límite debe validarse vía test. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| owner_type | `vendor_work` | Polimórfico. |
| owner_id | UUID del VendorProfile | — |
| work_label | "Boda Hacienda San Lucas - Julio 2026" | Free text. |
| url | Placeholder local o CDN ficticio | Sin tracking de PII. |
| mime_type | `image/jpeg`, `image/png` | — |
| size_bytes | <= 5 MB | Consistente con almacenamiento. |
| status | `active` o `deleted` | — |
| deleted_at, deleted_by, deletion_reason | Solo si soft delete | — |
| is_seed | true | — |

#### Estados requeridos
`active`, `deleted` (soft delete).

#### Reglas de negocio relacionadas
BR-VENDOR-005, BR-PRIVACY-011, C-022, C-060.

#### Consideraciones QA
- Validar que un attachment `deleted` no aparezca en el perfil público (FR-VENDOR-008).
- Validar que un 11º upload por trabajo sea rechazado.

#### Consideraciones demo
- Usar imágenes placeholder libres de derechos o referencias estáticas de demo.

#### Notas de implementación
- Si el repositorio no incluye archivos físicos, sembrar URLs placeholder estables.
- Documentar en el script seed la ruta de los assets demo.

---

### SEED-VENDOR-004 — Attachments adicionales (QuoteRequest brief)

#### Propósito
Permitir que el organizador adjunte referencias al brief de cotización (opcional).

#### Clasificación
- Scope: MVP
- Priority: Should Have
- Source type: Derived (Attachment.owner_type=`quote_request`; FR-QUOTE-004)

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| Briefs con attachments | 2–3 | Demostración de adjuntos en brief. |

#### Notas de implementación
- Mantener `is_seed=true` y usar placeholders.

---

## 17. Events seed

### SEED-EVENT-001 — Eventos en estados representativos

#### Propósito
Demostrar dashboard del organizador, planificación IA, cotizaciones, booking intent, completados/cancelados y auto-completar.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 2 §11; FR-EVENT-001..014; BR-EVENT-001..014; FR-SEED-002/003)

#### Entidades involucradas
`Event`, `EventType`, `User`, `Location`, `Currency`, `Language`, `Budget`, `EventTask`.

#### Flujos soportados
UC-EVENT-001..006, UC-AI-001..008, UC-TASK-*, UC-BUDGET-*, UC-QUOTE-*, UC-BOOKING-*, UC-REVIEW-001, UC-ADMIN-002/008.

#### Cantidad recomendada

| Estado | Cantidad | Notas |
|---|---:|---|
| `draft` | 2–3 | Recién creados sin checklist confirmado. |
| `active` | 4–5 | En planificación; varios con QuoteRequests. |
| `completed` | 2–3 | Con BookingIntent y reseñas. |
| `cancelled` | 1–2 | Con razón de cancelación. |
| Eventos cercanos a auto-completar (fecha pasada ≤ 2 días) | 1 | QA de job (NFR-REL-005). |
| Eventos auto-completados (`auto_completed=true`) | 1 | Validar bandera y `completed_at`. |

Total Events: **10–15**.

#### Campos mínimos / matriz de escenarios

| Scenario | Event type | Status | Currency | Language | Notes |
|---|---|---|---|---|---|
| Boda Premium Guatemala | wedding | active | GTQ | es-LATAM | 120 invitados; demo IA principal. |
| XV años clásicos | xv | active | GTQ | es-LATAM | Con padrinos, hora loca, marimba. |
| Bautizo familiar | baptism | draft | GTQ | es-LATAM | Recién creado. |
| Baby shower | baby_shower | active | USD | en | Multi-idioma/multi-moneda. |
| Cumpleaños 30 | birthday | draft | GTQ | es-LATAM | — |
| Evento corporativo internacional | corporate | active | USD | en | Demo i18n. |
| Boda España | wedding | active | EUR | es-ES | Visión futura. |
| Cumpleaños infantil completado | birthday | completed | GTQ | es-LATAM | Con reseña. |
| XV completado | xv | completed | GTQ | es-LATAM | Con reseña 5★. |
| Corporativo completado | corporate | completed | USD | en | Reseña 4★. |
| Boda cancelada | wedding | cancelled | GTQ | es-LATAM | Cancelación documentada. |
| Bautizo cerca de auto-completar | baptism | active | GTQ | es-LATAM | event_date hoy-2; QA NFR-REL-005. |
| Cumpleaños auto-completado | birthday | completed | GTQ | es-LATAM | `auto_completed=true`. |
| Boda en pt (Brasil futuro) | wedding | active | USD | pt | Demo idioma pt. |

#### Estados requeridos
`draft`, `active`, `completed`, `cancelled`. Banderas: `auto_completed`.

#### Reglas de negocio relacionadas
BR-EVENT-001..014 (currency inmutable; lifecycle linear; auto-completar 2 días).

#### Consideraciones QA
- Validar inmutabilidad de moneda (C-008, BR-EVENT-007).
- Validar que `draft`/`completed`/`cancelled` no permitan crear QuoteRequest (FR-EVENT-006).
- Validar auto-complete a 2 días (NFR-DATA-002).

#### Consideraciones demo
- Cada estado debe estar visible en el dashboard del admin (FR-ADMIN-002).
- El evento estrella de la demo debe ser una boda en es-LATAM con dataset completo.

#### Notas de implementación
- Distribuir owners entre los 5–10 organizadores.
- Para el evento auto-completado, registrar `completed_at` ≈ event_date + 2 días.

---

## 18. EventTasks y checklist seed

### SEED-TASK-001 — Checklist por evento (IA y manual)

#### Propósito
Soportar dashboard de progreso, validación human-in-the-loop, filtros por estado y notificación T-7.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Derived + Explicit (FR-TASK-001..012; BR-TASK-001..010; AI-002; FR-AI-013)

#### Entidades involucradas
`EventTask`, `Event`, `AIRecommendation`.

#### Flujos soportados
UC-TASK-001..006, UC-AI-003, UC-EVENT-004.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| Total EventTasks | 50–100 | 5–10 por evento promedio. |
| Tasks `ai_generated=true` confirmadas | 50% | Resultado de UC-TASK-001. |
| Tasks manuales | 30% | Creadas por organizador. |
| Tasks `ai_generated=true` pendientes de confirmar | 20% | Demo de validación humana. |

Distribución de estados por evento `active`:

| Estado | Proporción aprox |
|---|---|
| `pending` | 50% |
| `in_progress` | 25% |
| `done` | 20% |
| `skipped` | 5% |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| event_id | FK | — |
| title | "Reservar venue", "Contratar fotógrafo" | Coherente con event type. |
| description | Texto corto | — |
| due_date | Calculado a partir de event_date + offset | T-180, T-90, T-30, T-7, T-1. |
| relative_offset_days | -180, -90, -30, -7, -1 | BR-TASK-006. |
| status | `pending` / `in_progress` / `done` / `skipped` | — |
| ai_generated | true / false | — |
| ai_recommendation_id | FK opcional | Cuando aplica. |
| is_seed | true | — |

#### Estados requeridos
`pending`, `in_progress`, `done`, `skipped`.

#### Reglas de negocio relacionadas
BR-TASK-001..010, BR-AI-008.

#### Consideraciones QA
- Validar cálculo de progreso (FR-TASK-007).
- Validar notificación T-7 (FR-TASK-010, FR-NOTIF-001).
- Validar bloqueo en eventos `cancelled` (FR-TASK-011).

#### Consideraciones demo
- Para el evento estrella, mostrar mezcla pendiente/done; resaltar que la mitad provienen de IA confirmada.

#### Notas de implementación
- Para eventos `completed`, marcar la mayoría de tasks como `done`.
- Para eventos `cancelled`, congelar estados; no crear tareas nuevas.

---

## 19. Budgets y BudgetItems seed

### SEED-BUDGET-001 — Presupuestos por evento

#### Propósito
Demostrar dashboard de presupuesto, ítems por categoría, warning de exceso e inmutabilidad de moneda.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Derived (FR-BUDGET-001..010; BR-BUDGET-001..010; AI-003)

#### Entidades involucradas
`Budget`, `BudgetItem`, `Event`, `ServiceCategory`, `AIRecommendation`, `Currency`.

#### Flujos soportados
UC-BUDGET-001..004, UC-AI-004, UC-EVENT-004.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| Budgets | 10–15 | Uno por evento. |
| BudgetItems | 40–80 | 4–8 por presupuesto. |

#### Escenarios sugeridos

| Escenario | Notas |
|---|---|
| Presupuesto bajo control | `committed` ≈ 60% de `total`. |
| Presupuesto cerca del límite | `committed` ≈ 95% de `total`. |
| Presupuesto excedido (warning) | `committed` > `total`; mensaje no bloqueante (FR-BUDGET-005). |
| Presupuesto con item de origen IA aceptado | `ai_generated=true` en al menos 2 ítems. |
| Presupuesto con BookingIntent confirmado | Item afectado actualiza `committed` (FR-BUDGET-006). |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| budget_id | FK Budget | — |
| service_category_id | FK ServiceCategory | — |
| label | "Catering principal" | Texto libre. |
| planned | número | En moneda del evento. |
| committed | número | Actualizado por BookingIntent. |
| paid | 0 | Sin pagos reales. |
| ai_generated | true/false | — |
| is_seed | true | — |

#### Estados requeridos
No tiene enum; refleja `committed` vs `planned`.

#### Reglas de negocio relacionadas
BR-BUDGET-001..010, BR-EVENT-007 (currency inmutable).

#### Consideraciones QA
- Validar que `paid` no sea modificable por la UI (no hay pagos reales en MVP).
- Validar que la moneda del Budget coincide con la del Event (FR-BUDGET-007).

#### Consideraciones demo
- Mostrar warning de exceso en al menos un presupuesto.
- Mostrar actualización automática de `committed` al confirmar BookingIntent.

#### Notas de implementación
- Para presupuestos en USD/EUR, mantener consistencia con el currency del Event.

---

## 20. QuoteRequests y Quotes seed

### SEED-QUOTE-001 — Solicitudes y respuestas de cotización

#### Propósito
Demostrar el flujo cotización organizador-proveedor, comparación, límite 5 activas por categoría, expiración 15 días, notificaciones in-app.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 2 §11; Doc 8.1 §4; FR-SEED-004; FR-QUOTE-001..020; BR-QUOTE-001..025)

#### Entidades involucradas
`QuoteRequest`, `Quote`, `Event`, `VendorProfile`, `ServiceCategory`, `Notification`, `AIRecommendation`.

#### Flujos soportados
UC-QUOTE-001..010, UC-AI-005/006, UC-NOTIF-001.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| QuoteRequests | 15–25 | Distribuidos entre eventos `active`. |
| Quotes | 10–20 | Subset de QuoteRequests con respuesta. |

#### Matriz de escenarios

| Scenario | QuoteRequest status | Quote status | Notas |
|---|---|---|---|
| Solicitud recién enviada | `sent` | — | Vendor aún no la abre. |
| Solicitud vista sin responder | `viewed` | — | `viewed_at` registrado. |
| Solicitud respondida | `responded` | `sent` | Lista para comparar. |
| Solicitud respondida y aceptada | `responded` | `accepted` | Habilita BookingIntent. |
| Quote rechazada por organizador | `responded` | `rejected` | Notificación al vendor (FR-QUOTE-010). |
| Quote expirada por validez 15 días | `responded` | `expired` | Job auto-marca (NFR-REL-004). |
| QuoteRequest cancelada por organizador | `cancelled` | — | UC-QUOTE-002. |
| Categoría con 5 QuoteRequests activas (límite) | `sent`/`viewed`/`responded` | varios | QA de límite (FR-QUOTE-002). |
| Quote con `is_preferred=true` | `responded` | `sent` | Marca preferida (FR-QUOTE-012). |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| event_id | FK | — |
| vendor_profile_id | FK | — |
| service_category_id | FK | — |
| brief (JSON) | Auto-completado IA | `ai_generated_brief=true` en algunos. |
| language_code | igual al evento | — |
| valid_until | created_at + 15 días | BR-QUOTE-015 si no se especifica. |
| total_price | número en currency del evento | — |
| breakdown (JSON) | Items y subtotales | — |
| conditions | Texto corto | — |
| is_preferred | true/false | — |
| is_seed | true | — |

#### Estados requeridos
QuoteRequest: `sent`, `viewed`, `responded`, `expired`, `cancelled`.  
Quote: `draft`, `sent`, `accepted`, `rejected`, `expired`.

#### Reglas de negocio relacionadas
BR-QUOTE-001..025, NFR-DATA-003/004.

#### Consideraciones QA
- Validar que no se acepten más de 5 activas por categoría por evento (C-027b).
- Validar expiración automática a 15 días (NFR-REL-004).
- Validar visibilidad cruzada: vendor solo ve sus QuoteRequests.

#### Consideraciones demo
- Para el evento estrella, sembrar 2 vendors con Quotes para mostrar comparación lado a lado (FR-QUOTE-011) y resumen IA (AI-006).

#### Notas de implementación
- Asegurar `vendor_profile.status='approved'` en todos los QuoteRequests sembrados.
- No sembrar Quotes con `valid_until` en el pasado salvo el escenario `expired`.

---

## 21. BookingIntent seed

### SEED-BOOKING-001 — Booking intents simulados

#### Propósito
Demostrar la simulación de contratación sin pagos reales, la confirmación del vendor, la cancelación de un confirmado, y habilitar reseñas verificadas.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 8.1 §2 #5; FR-SEED-005; BR-BOOKING-001..010; FR-BOOKING-001..010)

#### Entidades involucradas
`BookingIntent`, `Quote`, `Event`, `VendorProfile`, `BudgetItem`, `Notification`, `Review`.

#### Flujos soportados
UC-BOOKING-001..003, UC-REVIEW-001.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| BookingIntents totales | 5–8 | — |
| `confirmed_intent` | ≥3 | Requeridos para habilitar reseñas verificadas. |
| `pending` | 1–2 | Esperando confirmación del vendor. |
| `cancelled` (desde `pending`) | 1 | UC-BOOKING-003. |
| `cancelled` (desde `confirmed_intent`) | 1 | Doc 8.1 §2 #5; BR-BOOKING-009. |

#### Matriz de escenarios

| Scenario | Status | Notas |
|---|---|---|
| Booking pendiente de confirmación | `pending` | Vendor aún no confirma. |
| Booking confirmado por vendor | `confirmed_intent` | Habilita reseña. |
| Booking confirmado y luego cancelado | `cancelled` | `cancelled_by=organizer`, registrar razón. |
| Booking cancelado en `pending` | `cancelled` | `cancelled_by=vendor`. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| quote_id | FK al Quote `accepted` no expirado | BR-BOOKING-001. |
| event_id | FK | — |
| vendor_profile_id | FK | — |
| service_category_id | FK | — |
| status | `pending` / `confirmed_intent` / `cancelled` | — |
| is_simulated | true | Siempre. |
| cancelled_by | `organizer` / `vendor` / `system` | Si aplica. |
| cancellation_reason | Texto corto | Si aplica. |
| is_seed | true | — |

#### Estados requeridos
`pending`, `confirmed_intent`, `cancelled`.

#### Reglas de negocio relacionadas
BR-BOOKING-001..010 (sin pagos, sin contrato, cancelable desde confirmed), BR-BUDGET-005/006.

#### Consideraciones QA
- Validar que solo se cree desde Quotes `accepted` no expirados (FR-BOOKING-001).
- Validar que cancelar revierte `BudgetItem.committed` (FR-BOOKING-008).
- Validar único `confirmed_intent` por `(event, category)` (FR-BOOKING-009).

#### Consideraciones demo
- Mostrar disclaimer en UI (FR-BOOKING-006) durante la demo.

#### Notas de implementación
- El BookingIntent cancelado desde `confirmed_intent` debe llevar `cancelled_at` posterior a `confirmed_at`.

---

## 22. Reviews y moderación seed

### SEED-REVIEW-001 — Reseñas y moderación

#### Propósito
Demostrar el flujo de reseñas verificadas, la calificación 1–5, la moderación admin con soft delete y la auditoría obligatoria.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 2 §11; Doc 8.1 §2 #1, #11; FR-REVIEW-001..010; BR-REVIEW-001..010)

#### Entidades involucradas
`Review`, `BookingIntent`, `User`, `VendorProfile`, `AdminAction`.

#### Flujos soportados
UC-REVIEW-001..003, UC-ADMIN-005, UC-VENDOR-008.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| Reviews totales | 20–40 | — |
| Reviews `published` | 70% | Catálogo público. |
| Reviews `hidden` | 20% | Moderación admin (no ofensivo). |
| Reviews `removed` | 10% | Moderación con auditoría. |

#### Matriz de escenarios

| Scenario | Rating | Status | Notas |
|---|---:|---|---|
| Reseña positiva | 5 | `published` | Resalta brand premium. |
| Reseña positiva moderada | 4 | `published` | — |
| Reseña neutral | 3 | `published` | — |
| Reseña baja | 2 | `published` | Demo de honestidad. |
| Reseña ocultada por contenido inapropiado | 3 | `hidden` | Moderación sin texto ofensivo. |
| Reseña eliminada por moderación | 1 | `removed` | Auditoría obligatoria (AdminAction). |
| Reseña vinculada a BookingIntent confirmado | varía | `published` | Verifica BR-REVIEW-001. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| event_id | FK | — |
| vendor_profile_id | FK | — |
| author_id | FK Organizador | — |
| booking_intent_id | FK `confirmed_intent` | Requisito. |
| rating | 1..5 | Integer; CHECK. |
| comment | Texto neutro/positivo (sin lenguaje ofensivo real) | — |
| status | `published` / `hidden` / `removed` | — |
| moderated_by, moderated_at, moderation_reason | Solo si `hidden`/`removed` | — |
| admin_action_id | FK AdminAction | Si aplica. |
| is_seed | true | — |

#### Estados requeridos
`published`, `hidden`, `removed`.

#### Reglas de negocio relacionadas
BR-REVIEW-001..010, FR-REVIEW-005 (no hard delete), C-041, C-043.

#### Consideraciones QA
- Validar rating range 1–5.
- Validar imposibilidad de hard delete (FR-REVIEW-005).
- Validar que el vendor no pueda responder (FR-REVIEW-008).

#### Consideraciones demo
- No usar texto ofensivo real en reseñas seed; describir el escenario con un comentario genérico tipo "Comentario marcado por incumplir lineamientos".

#### Notas de implementación
- Cada Review `hidden`/`removed` debe tener su AdminAction asociada (ver §25).
- Actualizar `rating_avg` y `reviews_count` denormalizados en los VendorProfile correspondientes (FR-VENDOR-013).

---

## 23. Notifications seed

### SEED-NOTIF-001 — Notificaciones in-app

#### Propósito
Demostrar el centro de notificaciones in-app y los disparadores del MVP.

#### Clasificación
- Scope: MVP
- Priority: Should Have
- Source type: Derived (FR-NOTIF-001..006; BR-NOTIF-001..007)

#### Entidades involucradas
`Notification`, `User`, varios FK a Event/Quote/BookingIntent/Vendor.

#### Flujos soportados
UC-NOTIF-001/002, todos los flujos que producen notificaciones.

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| Notifications totales | 15–30 | — |
| `unread` | ~60% | Demo del badge. |
| `read` | ~40% | — |

#### Matriz de escenarios

| Tipo | Destinatario | Trigger |
|---|---|---|
| `quote_request_received` | vendor | Nueva QuoteRequest. |
| `quote_received` | organizador | Quote enviada. |
| `quote_rejected` | vendor | Organizador rechaza. |
| `quote_expired` | vendor | Job de expiración. |
| `task_due_soon` | organizador | T-7 días. |
| `booking_confirmed` | ambos | Vendor confirma. |
| `booking_cancelled` | ambos | Cancelación. |
| `vendor_approved` | vendor | Admin aprueba. |
| `vendor_rejected` | vendor | Admin rechaza. |
| `review_received` | vendor | Organizador publica reseña. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| user_id | FK destinatario | — |
| type | enum | — |
| payload | JSON con IDs y resumen | — |
| channel | `in_app` (mayoría); `email_simulated` (subset) | FR-NOTIF-003. |
| language_code | preferred_language del user | — |
| status | `unread` / `read` | — |
| read_at | timestamp si `read` | — |
| is_seed | true | — |

#### Estados requeridos
`unread`, `read`.

#### Reglas de negocio relacionadas
BR-NOTIF-001..007, NFR-OBS-004 (simulación de email vía log).

#### Consideraciones QA
- Validar aislamiento de notificaciones por usuario (FR-NOTIF-005).
- Validar que ningún flujo emita push/SMS/WhatsApp (FR-NOTIF-006).

#### Consideraciones demo
- Mostrar el badge con varias notificaciones `unread` por usuario.

#### Notas de implementación
- Para `email_simulated`, registrar un log estructurado en lugar de enviar correo real.

---

## 24. AIRecommendations y MockAIProvider seed

### SEED-AI-001 — AIRecommendations seed por feature

#### Propósito
Demostrar las 8 features AI-001..AI-008 con respuestas reproducibles, soportar human-in-the-loop y la auditoría IA del admin.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit + Derived (AI-001..008; FR-AI-001..020; BR-AI-001..015; FR-SEED-006; NFR-AI-001..010)

#### Entidades involucradas
`AIRecommendation`, `AIPromptVersion`, `Event`, `VendorProfile`, `EventTask`, `BudgetItem`, `QuoteRequest`.

#### Flujos soportados
UC-AI-001..009, UC-ADMIN-009 (log AIRecommendation).

#### Cantidad recomendada

| AI Feature | Quantity | Estado |
|---|---:|---|
| AI-001 Event plan | 4 | 3 `accepted=true`, 1 `accepted=false` (regenerado/rechazado). |
| AI-002 Checklist | 4 | 3 aceptados; 1 editado antes de aceptar. |
| AI-003 Budget suggestion | 3 | 2 aceptados; 1 rechazado. |
| AI-004 Vendor categories | 3 | Recomendados por evento. |
| AI-005 Quote brief | 4 | Pre-llenado de QuoteRequest. |
| AI-006 Quote comparison | 2 | Resumen comparativo. |
| AI-007 Vendor bio | 2 | Para vendors aprobados. |
| AI-008 Task prioritization | 2 | Top 3 acciones urgentes. |

Total AIRecommendations seed: **20–24** (consistente con rango recomendado 10–20, ampliado por cobertura completa de features).

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| requested_by_user_id | FK organizador o vendor | — |
| type | enum AIRecommendationType | — |
| input_payload | JSON entrada | Sin PII innecesaria. |
| output_payload | JSON salida determinista | Generado por MockAIProvider. |
| prompt_version_id | FK AIPromptVersion | Versionado. |
| llm_provider | `mock` (mayoría) y `openai` (algunos) | — |
| timeout_ms | 60000 | NFR-AI-003. |
| language_code | igual al evento | NFR-I18N-003. |
| accepted | true/false | Human-in-the-loop. |
| edited | true/false | — |
| latency_ms | número | Simulado. |
| token_count | número | Estimación. |
| fallback_used | true en al menos 1 caso | Demo de fallback. |
| is_seed | true | — |

#### Estados requeridos
`accepted=true` (oficial), `accepted=false` (sugerencia no oficial).

#### Reglas de negocio relacionadas
BR-AI-001..015, NFR-AI-001..010.

#### Consideraciones QA
- Validar que `accepted=false` no genere entidades oficiales (FR-AI-012).
- Validar marca `ai_generated=true` en EventTasks/BudgetItems derivados (FR-AI-013).
- Validar que el timeout cierre llamadas a 60 s (NFR-REL-001).

#### Consideraciones demo
- Sembrar al menos 1 caso `fallback_used=true` con `llm_provider=mock` para demostrar resiliencia.
- Asegurar que toggling `LLM_PROVIDER=mock` produce las mismas respuestas (NFR-AI-008).

#### Notas de implementación
- Cada respuesta MockAIProvider se identifica por `(feature, event_type_code, language_code)` para garantizar determinismo.
- Versionar prompts en repo (NFR-AI-010) y referenciar `prompt_version_id`.

---

### SEED-AI-002 — Prompt versions

#### Propósito
Soportar la auditoría y reproducibilidad de respuestas IA.

#### Clasificación
- Scope: MVP
- Priority: Should Have
- Source type: Derived (NFR-AI-004/010)

#### Cantidad recomendada

| Item | Quantity | Notes |
|---|---:|---|
| AIPromptVersion seed | 8 | Una por feature. |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| feature | AI-001..008 | — |
| version | `v1.0` | Semver. |
| template | Texto del prompt | — |
| supported_languages | `["es-LATAM","es-ES","pt","en"]` | NFR-I18N-005. |

#### Notas de implementación
- Mantener templates versionados en el repositorio bajo `/prompts`.

---

## 25. AdminActions y governance seed

### SEED-ADMIN-001 — Bitácora de acciones admin

#### Propósito
Demostrar la auditoría inmutable de todas las acciones del admin sobre vendors, reseñas, catálogos y attachments, incluyendo el acceso `view_event`.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (BR-ADMIN-004/010/011; FR-ADMIN-006/008/009; NFR-OBS-001/005)

#### Entidades involucradas
`AdminAction`, `User` (admin), `VendorProfile`, `Review`, `ServiceCategory`, `EventType`, `Event`, `Attachment`.

#### Flujos soportados
UC-ADMIN-004..010, UC-EVENT-* (consulta admin).

#### Cantidad recomendada

| AdminAction type | Quantity |
|---|---:|
| `approve_vendor` | 2 |
| `reject_vendor` | 1 |
| `hide_vendor` | 1 |
| `hide_review` | 1 |
| `remove_review` | 1 |
| `update_category` | 1 |
| `deactivate_category` | 1 |
| `update_event_type` | 1 |
| `view_event` | 2 |
| `hide_attachment` | 1 |
| Total | ~12 |

#### Campos mínimos

| Field | Example value | Notes |
|---|---|---|
| admin_id | FK admin Product Owner | — |
| action | enum AdminActionType | — |
| target_type | `vendor_profile`, `review`, `service_category`, `event_type`, `event`, `attachment` | — |
| target_id | UUID | — |
| reason | Texto corto | — |
| metadata | JSON contextual | — |
| created_at | timestamp | — |
| ip_address | placeholder | Sin IP real. |
| is_seed | true | — |

#### Estados requeridos
N/A (append-only).

#### Reglas de negocio relacionadas
BR-ADMIN-004/010/011, NFR-DATA-007 (moderación reseñas con auditoría).

#### Consideraciones QA
- Validar que `AdminAction` sea append-only (no updates/deletes).
- Validar filtros por action, entity, date, user (FR-ADMIN-009).

#### Consideraciones demo
- Mostrar el log de AdminAction en vivo tras una aprobación o moderación.

#### Notas de implementación
- Vincular cada Review `hidden`/`removed` a su correspondiente AdminAction vía `admin_action_id`.

---

## 26. Idiomas, monedas y localización seed

### SEED-I18N-001 — Catálogo de idiomas

#### Propósito
Soportar la selección de idioma de UI, perfil y evento.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (BR-I18N-001..008; NFR-I18N-001; FR-I18N-001..006)

#### Entidades involucradas
`Language`.

#### Cantidad

| Code | Display name | Default | Notes |
|---|---|---|---|
| `es-LATAM` | "Español (LATAM)" | true | Idioma base. |
| `es-ES` | "Español (España)" | false | Visión futura. |
| `pt` | "Português" | false | Visión futura. |
| `en` | "English" | false | Obligatorio. |

#### Notas
- Inglés es no negociable (Doc 2 §3 #15).
- Mantener `is_active=true` para los 4.

---

### SEED-I18N-002 — Catálogo de monedas

#### Propósito
Soportar la selección de moneda del evento (local o USD) sin conversión automática.

#### Clasificación
- Scope: MVP
- Priority: Must Have
- Source type: Explicit (Doc 8.1 §2 #7; NFR-I18N-004; FR-BUDGET-009)

#### Entidades involucradas
`Currency`.

#### Cantidad

| Code | Display name | Symbol | Notes |
|---|---|---|---|
| `GTQ` | "Quetzal guatemalteco" | "Q" | Mercado piloto. |
| `USD` | "Dólar estadounidense" | "$" | Mandatorio. |
| `EUR` | "Euro" | "€" | Visión futura España. |
| `MXN` | "Peso mexicano" | "$" | LATAM. |
| `COP` | "Peso colombiano" | "$" | LATAM. |

#### Notas
- Sin tabla de tipos de cambio (BR-OOS-015).
- Seed debe incluir eventos en al menos 3 monedas distintas (NFR-I18N-006).

---

### SEED-I18N-003 — Locations seed (Recommended)

#### Propósito
Normalizar ciudades para eventos y vendors.

#### Clasificación
- Scope: MVP
- Priority: Should Have
- Source type: Derived (Entidad `Location` en Data Model)

#### Cantidad sugerida

| Ciudad | País | Notes |
|---|---|---|
| Ciudad de Guatemala | GT | Predominante. |
| Antigua Guatemala | GT | Premium. |
| Quetzaltenango | GT | — |
| Ciudad de México | MX | Demo LATAM. |
| Madrid | ES | Demo España. |
| São Paulo | BR | Demo pt. |

#### Notas
- Mantener `is_active=true`.
- Asociar a vendors y eventos coherentemente.

---

## 27. Demo scenarios soportados por seed data

### SEED-DEMO-001 — Demo 1: Organizador crea evento con IA

**Soporte requerido:** SEED-USER-002, SEED-EVENTTYPE-001, SEED-CATEGORY-001, SEED-AI-001 (AI-001..004), SEED-AI-002.  
**Salida:** Nuevo evento `draft → active` con plan IA aceptado, checklist confirmado, presupuesto sugerido.

### SEED-DEMO-002 — Demo 2: Organizador solicita y compara cotizaciones

**Soporte requerido:** SEED-EVENT-001 (evento `active`), SEED-VENDOR-001/002 (aprobados), SEED-QUOTE-001 (Quotes en `responded`), SEED-AI-001 (AI-005/006), SEED-BOOKING-001 (`confirmed_intent`).  
**Salida:** Comparación lado a lado, marca preferida, BookingIntent confirmado.

### SEED-DEMO-003 — Demo 3: Proveedor responde a una cotización

**Soporte requerido:** SEED-USER-003, SEED-VENDOR-001 (vendor `approved`), SEED-QUOTE-001 (QuoteRequest `sent`/`viewed`), SEED-NOTIF-001.  
**Salida:** Vendor recibe notificación in-app, abre QuoteRequest y envía Quote.

### SEED-DEMO-004 — Demo 4: Admin gobierna la plataforma

**Soporte requerido:** SEED-USER-001, SEED-VENDOR-001 (`pending`/`rejected`), SEED-REVIEW-001 (con caso para moderar), SEED-EVENTTYPE-001, SEED-CATEGORY-001, SEED-ADMIN-001.  
**Salida:** Aprobación de vendor, moderación de reseña, gestión de catálogo, consulta de bitácora.

### SEED-DEMO-005 — Demo 5: Multi-idioma y multi-moneda

**Soporte requerido:** SEED-I18N-001/002, SEED-EVENT-001 (eventos en GTQ/USD/EUR; idiomas es-LATAM/es-ES/pt/en), SEED-AI-001 (respuestas IA en cada idioma).  
**Salida:** UI cambia de idioma; eventos muestran moneda configurada; IA responde en el idioma del evento.

---

## 28. QA scenarios soportados por seed data

| QA scenario | Dataset soporte | Regla/FR/NFR |
|---|---|---|
| Login por rol | SEED-USER-001..003 | FR-AUTH-002/008. |
| Aislamiento de organizadores | SEED-EVENT-001 | NFR-SEC-003. |
| Visibilidad cruzada de vendors | SEED-QUOTE-001 | FR-QUOTE-014. |
| Permisos del admin | SEED-USER-001 | FR-AUTH-009, BR-ADMIN-006. |
| Inmutabilidad de moneda | SEED-EVENT-001 | C-008, BR-EVENT-007. |
| Validez default 15 días | SEED-QUOTE-001 | BR-QUOTE-015, NFR-DATA-003. |
| Límite 5 QuoteRequests por categoría | SEED-QUOTE-001 | C-027b, NFR-DATA-004. |
| Auto-complete a 2 días | SEED-EVENT-001 | NFR-DATA-002, NFR-REL-005. |
| Cancelación de BookingIntent confirmado | SEED-BOOKING-001 | BR-BOOKING-009. |
| Rating 1–5 | SEED-REVIEW-001 | C-041. |
| Soft delete reseñas | SEED-REVIEW-001 + SEED-ADMIN-001 | C-043, FR-REVIEW-005. |
| Soft delete attachments | SEED-VENDOR-003 | C-060. |
| Límite cambios categoría vendor | SEED-VENDOR-001 | BR-VENDOR-004. |
| Jerarquía 2 niveles | SEED-CATEGORY-001 | NFR-DATA-006. |
| Timeout IA 1 min y fallback | SEED-AI-001 | NFR-AI-003, NFR-REL-001. |
| MockAIProvider determinista | SEED-AI-001 | NFR-AI-008. |
| Multi-idioma output | SEED-AI-001, SEED-I18N-001 | NFR-I18N-005. |
| Display moneda sin conversión | SEED-BUDGET-001 | NFR-I18N-004. |
| Ausencia de pagos/contratos | (todos) | BR-OOS-001..003. |

---

## 29. Estrategia de reset y regeneración de datos

### 29.1 Comandos conceptuales

```text
seed:reset    # Limpia tablas con is_seed=true y deja el esquema estable
seed:demo     # Carga el set demo completo (todos los SEED-* MVP)
seed:qa       # Carga un subset acotado para tests automatizados
```

### 29.2 Lineamientos

- **Idempotente.** Re-ejecutar `seed:demo` produce el mismo estado (NFR-DEMO-003).
- **Filtrado por `is_seed=true`.** `seed:reset` no debe borrar datos sin la bandera.
- **Sin destrucción en producción.** El script debe rehusarse a ejecutarse si `NODE_ENV=production` salvo flag explícito de operador.
- **Determinismo.** UUIDs/PKs deterministas para los assets demo principales (cuentas de demo, evento estrella).
- **Flag de ambiente.** Variable `SEED_MODE=demo|qa|off` permite alternar el set sin recompilar.
- **MockAIProvider.** Respuestas seed deben ser deterministas (NFR-AI-008).
- **Documentación.** README incluye pasos: clone → install → seed:demo → start (NFR-DEPLOY-004).
- **Separación de capa.** El script vive bajo `/scripts/seed` o equivalente, separado de la lógica productiva (NFR-MAINT-005).

### 29.3 Ciclos de vida temporal

- Para QA recurrente, `seed:qa` debe ejecutarse en `beforeAll` de los tests E2E.
- Para presentaciones, `seed:demo` se ejecuta antes de la presentación.

---

## 30. Convenciones de nombres y datos demo

### 30.1 Emails

```text
admin@eventflow.demo
organizer01@eventflow.demo … organizer10@eventflow.demo
vendor01@eventflow.demo … vendor20@eventflow.demo
```

### 30.2 Passwords

```text
Las contraseñas se configuran de forma segura en el script seed o como variable de entorno.
No deben quedar embebidas en el repositorio.
```

### 30.3 Nombres y negocios

- **Personas:** Mezclar nombres ficticios LATAM (Lucía Hernández, Diego Morales) y, en menor proporción, ibéricos y brasileños.
- **Negocios:** Marcas ficticias evocativas (p. ej., "Hacienda San Lucas Events", "Marimba Imperial", "Sabores de Antigua").

### 30.4 Telefonía y direcciones

- Sin teléfonos reales; usar placeholders documentados (p. ej., `+502-0000-0000`).
- Sin direcciones reales; sólo ciudad y país.

### 30.5 Identificadores y banderas

- Todos los datos seed llevan `is_seed=true`.
- Para entidades núcleo (admin, evento estrella) usar UUIDs deterministas o sufijo `-seed` reconocible.

### 30.6 Contenido textual

- Mantener un tono **premium, cálido, aspiracional y profesional** (Doc 2 §5).
- Reseñas con texto neutro/positivo y, cuando se muestre moderación, usar marcadores genéricos en lugar de texto ofensivo real.

---

## 31. Seguridad, privacidad y datos sensibles en seed

### 31.1 Reglas obligatorias

| Regla | Sustento |
|---|---|
| Sin PII real. | BR-PRIVACY-010, NFR-PRIV-002. |
| Sin métodos de pago. | BR-PRIVACY-006, FR-BOOKING-007. |
| Sin documentos de identidad ni datos fiscales. | NFR-PRIV-002. |
| Sin secretos en repositorio. | NFR-SEC-008. |
| Logs sin tokens/passwords/IA payloads completos. | NFR-PRIV-004. |
| Passwords hash bcrypt/argon2. | BR-PRIVACY-008, NFR-SEC-005. |
| Sin enviar PII innecesaria a prompts IA. | NFR-PRIV-003. |
| Soft delete para reseñas y attachments. | C-043, C-060. |
| `is_seed=true` para separación lógica. | BR-SEED-005. |

### 31.2 Contenido sensible

- No describir alergias, padecimientos, datos médicos, religión, ideología, datos biométricos (NFR-PRIV-002).
- Reseñas moderadas se etiquetan con texto genérico de demo; no incluir lenguaje ofensivo real.

### 31.3 Captcha / anti-bot

- En ambientes de desarrollo y QA, configurar `CAPTCHA_DISABLED=true` o stub determinista (NFR-TEST-006). No se siembran tokens reales.

---

## 32. Datos explícitamente fuera de alcance

| Categoría | Razón |
|---|---|
| Tarjetas de crédito, débitos, transferencias, tokens de pago | BR-OOS-001, FR-BOOKING-007. |
| Comisiones reales | BR-OOS-002. |
| Facturas / NIT / RFC / impuestos | BR-PRIVACY-007, NFR-PRIV-002. |
| Contratos PDF / firmas digitales | BR-OOS-003. |
| Mensajes de WhatsApp / SMS / push nativo | BR-NOTIF-006, FR-NOTIF-006. |
| Dispositivos móviles y tokens nativos | BR-OOS-004/017. |
| Mensajería en tiempo real / chat | BR-OOS-006. |
| Integraciones de calendario externas | BR-FUTURE-020. |
| Listas de invitados / RSVP / planos de mesa | BR-OOS-014. |
| Rutas geográficas avanzadas | BR-OOS. |
| Resultados de moderación IA y análisis de sentimiento | BR-REVIEW-006, BR-OOS-007/008. |
| Datos de verificación KYC | BR-VENDOR-006. |
| PII real / documentos de identidad | NFR-PRIV-002. |
| Tipos de cambio / conversión de moneda | BR-OOS-015. |
| Imágenes generadas por IA | BR-AI-015. |
| Co-organizadores por evento | BR-AUTH-005, BR-OOS-013. |

---

## 33. Matriz consolidada de seed data

| Seed ID | Nombre | Dominio | Scope | Priority | Source type |
|---|---|---|---|---|---|
| SEED-USER-001 | Cuenta admin Product Owner | USER | MVP | Must Have | Explicit |
| SEED-USER-002 | Organizadores demo (5–10) | USER | MVP | Must Have | Explicit |
| SEED-USER-003 | Proveedores demo (10–20) | USER | MVP | Must Have | Explicit |
| SEED-EVENTTYPE-001 | Catálogo de 6 EventTypes MVP | EVENTTYPE | MVP | Must Have | Explicit |
| SEED-CATEGORY-001 | ServiceCategories con jerarquía 2 niveles | CATEGORY | MVP | Must Have | Explicit |
| SEED-VENDOR-001 | VendorProfiles en estados diversos | VENDOR | MVP | Must Have | Explicit/Derived |
| SEED-VENDOR-002 | VendorServices (paquetes) | VENDOR | MVP | Must Have | Derived |
| SEED-VENDOR-003 | VendorPortfolio (attachments) | VENDOR | MVP | Must Have | Explicit |
| SEED-VENDOR-004 | Attachments en QuoteRequest brief | VENDOR | MVP | Should Have | Derived |
| SEED-EVENT-001 | Eventos en estados representativos | EVENT | MVP | Must Have | Explicit |
| SEED-TASK-001 | Checklist por evento (IA y manual) | TASK | MVP | Must Have | Derived |
| SEED-BUDGET-001 | Budgets y BudgetItems | BUDGET | MVP | Must Have | Derived |
| SEED-QUOTE-001 | QuoteRequests y Quotes | QUOTE | MVP | Must Have | Explicit |
| SEED-BOOKING-001 | BookingIntents simulados | BOOKING | MVP | Must Have | Explicit |
| SEED-REVIEW-001 | Reviews y moderación | REVIEW | MVP | Must Have | Explicit |
| SEED-NOTIF-001 | Notifications in-app | NOTIF | MVP | Should Have | Derived |
| SEED-AI-001 | AIRecommendations por feature | AI | MVP | Must Have | Explicit/Derived |
| SEED-AI-002 | AIPromptVersion | AI | MVP | Should Have | Derived |
| SEED-ADMIN-001 | AdminActions de auditoría | ADMIN | MVP | Must Have | Explicit |
| SEED-I18N-001 | Catálogo de idiomas | I18N | MVP | Must Have | Explicit |
| SEED-I18N-002 | Catálogo de monedas | I18N | MVP | Must Have | Explicit |
| SEED-I18N-003 | Locations | I18N | MVP | Should Have | Derived |
| SEED-DEMO-001..005 | Demo scenarios | DEMO | MVP | Must Have | Derived |
| SEED-QA-001 | Datasets QA (subset) | QA | MVP | Should Have | Derived |
| SEED-OOS-* | Datos fuera de alcance | OOS | Out of Scope | N/A | Explicit |

---

## 34. Matriz de trazabilidad seed → FRD / NFR / UC / Entidades

| Seed ID | FRD | NFR | UC | Business Rule | Entidad | AI feature |
|---|---|---|---|---|---|---|
| SEED-USER-001 | FR-AUTH-002/007/008/009, FR-ADMIN-001 | NFR-SEC-006, NFR-DEMO-001 | UC-AUTH-002, UC-ADMIN-001 | BR-AUTH-002/008/010 | User, Role, AdminAction | — |
| SEED-USER-002 | FR-AUTH-001..010, FR-USER-001..006, FR-SEED-002 | NFR-DEMO-001, NFR-I18N-001..006 | UC-AUTH-001..006, UC-EVENT-* | BR-AUTH-006, BR-USER-*, BR-I18N-003, BR-SEED-002 | User | — |
| SEED-USER-003 | FR-VENDOR-001..013, FR-SEED-002 | NFR-DEMO-001 | UC-VENDOR-001..008 | BR-AUTH-007, BR-VENDOR-* | User, VendorProfile | — |
| SEED-EVENTTYPE-001 | FR-EVENT-013, FR-ADMIN-007 | NFR-DEMO-005 | UC-EVENT-001, UC-ADMIN-007 | BR-EVENTTYPE-001..007 | EventType | AI-001..004 templates |
| SEED-CATEGORY-001 | FR-SERVICE-001..006, FR-ADMIN-004 | NFR-DATA-006, NFR-DEMO-005 | UC-ADMIN-007, UC-VENDOR-006/007 | BR-SERVICE-001..007 | ServiceCategory | AI-004 |
| SEED-VENDOR-001 | FR-VENDOR-001..013 | NFR-DEMO-002 | UC-VENDOR-001..008, UC-ADMIN-003..006 | BR-VENDOR-001..010 | VendorProfile | AI-007 |
| SEED-VENDOR-002 | FR-VENDOR-009, FR-SERVICE-005..007 | NFR-DEMO-005 | UC-VENDOR-004, UC-QUOTE-001 | BR-SERVICE-001/006 | VendorService | AI-005 |
| SEED-VENDOR-003 | FR-VENDOR-006/007/008 | NFR-DATA-008, NFR-USAB-002 | UC-VENDOR-005/007 | BR-VENDOR-005, BR-PRIVACY-011, C-022, C-060 | Attachment | — |
| SEED-EVENT-001 | FR-EVENT-001..014, FR-SEED-003 | NFR-DATA-001/002, NFR-I18N-005/006, NFR-DEMO-002 | UC-EVENT-001..006, UC-AI-001..008 | BR-EVENT-001..014, C-008, C-056 | Event, Budget | AI-001..004 |
| SEED-TASK-001 | FR-TASK-001..012, FR-AI-013 | NFR-USAB-002 | UC-TASK-001..006, UC-AI-003 | BR-TASK-001..010, BR-AI-008 | EventTask | AI-002, AI-008 |
| SEED-BUDGET-001 | FR-BUDGET-001..010 | NFR-I18N-004, NFR-DATA-001 | UC-BUDGET-001..004 | BR-BUDGET-001..010 | Budget, BudgetItem | AI-003 |
| SEED-QUOTE-001 | FR-QUOTE-001..020, FR-SEED-004 | NFR-DATA-003/004, NFR-REL-004 | UC-QUOTE-001..010, UC-AI-005/006 | BR-QUOTE-001..025, C-027b, C-031 | QuoteRequest, Quote | AI-005, AI-006 |
| SEED-BOOKING-001 | FR-BOOKING-001..010, FR-SEED-005 | NFR-DATA-010 | UC-BOOKING-001..003 | BR-BOOKING-001..010, C-057 | BookingIntent | — |
| SEED-REVIEW-001 | FR-REVIEW-001..010, FR-SEED-005 | NFR-DATA-007 | UC-REVIEW-001..003, UC-ADMIN-005 | BR-REVIEW-001..010, C-041, C-043 | Review | — |
| SEED-NOTIF-001 | FR-NOTIF-001..006 | NFR-OBS-004 | UC-NOTIF-001/002 | BR-NOTIF-001..007 | Notification | — |
| SEED-AI-001 | FR-AI-001..020, FR-SEED-006 | NFR-AI-001..010, NFR-REL-001/003, NFR-DEMO-004 | UC-AI-001..009, UC-ADMIN-009 | BR-AI-001..015, C-058 | AIRecommendation | AI-001..008 |
| SEED-AI-002 | FR-AI-018 | NFR-AI-010 | UC-AI-* | BR-AI-010 | AIPromptVersion | AI-001..008 |
| SEED-ADMIN-001 | FR-ADMIN-002..012 | NFR-OBS-001/005 | UC-ADMIN-002..010 | BR-ADMIN-004/010/011 | AdminAction | — |
| SEED-I18N-001 | FR-I18N-001..006, FR-USER-003 | NFR-I18N-001..003 | UC-I18N-001/002, UC-AUTH-006 | BR-I18N-001..008 | Language | — |
| SEED-I18N-002 | FR-BUDGET-002/007/009, FR-EVENT-003 | NFR-I18N-004/005, NFR-DATA-001 | UC-BUDGET-004, UC-EVENT-001 | BR-EVENT-007, BR-BUDGET-006/007 | Currency | — |
| SEED-I18N-003 | FR-USER-001, FR-VENDOR-001 | — | UC-VENDOR-001, UC-EVENT-001 | BR-EVENT-003, BR-VENDOR-002 | Location | — |

> **Nota:** los IDs SEED-DEMO-001..005 y SEED-QA-001 referencian la matriz como agrupaciones de los seed IDs anteriores, no como entidades nuevas.

---

## 35. Riesgos de seed data y mitigaciones

| Risk ID | Risk | Impact | Probability | Mitigation | Related dataset |
|---|---|---|---|---|---|
| RISK-SEED-001 | Volumen seed insuficiente; demo se ve vacía. | High | Medium | Respetar volúmenes mínimos §10–§24. | SEED-EVENT-001, SEED-QUOTE-001 |
| RISK-SEED-002 | Volumen seed excesivo; performance degradada. | Medium | Low | Mantener rangos sugeridos; respetar NFR-PERF-005. | SEED-NOTIF-001, SEED-TASK-001 |
| RISK-SEED-003 | Estados inconsistentes entre Quote, BookingIntent y Review. | High | Medium | Aplicar BR-BOOKING-010 y BR-REVIEW-001 en el script; tests de integridad. | SEED-BOOKING-001, SEED-REVIEW-001 |
| RISK-SEED-004 | Script seed no idempotente; ejecuciones duplican datos. | High | Medium | Uso de `is_seed=true` para reset; UUIDs deterministas. | Todos |
| RISK-SEED-005 | PII real accidentalmente sembrada. | High | Low | Revisión de listas de nombres/emails antes de merge; lint en CI. | SEED-USER-002/003 |
| RISK-SEED-006 | Demo IA inestable sin MockAIProvider. | High | Medium | `LLM_PROVIDER=mock` por defecto en demo. | SEED-AI-001 |
| RISK-SEED-007 | Flujo de cotización no demostrable por falta de vendors aprobados. | High | Low | Garantizar 8–12 vendors `approved`. | SEED-VENDOR-001 |
| RISK-SEED-008 | Flujo admin no demostrable por falta de vendors pendientes / reseñas a moderar. | High | Low | Sembrar 2–4 vendors `pending` y al menos 1 review `hidden`. | SEED-VENDOR-001, SEED-REVIEW-001 |
| RISK-SEED-009 | Traducciones incompletas. | Medium | Medium | Cubrir 4 idiomas en EventTypes, ServiceCategories y AIPromptVersion. | SEED-EVENTTYPE-001, SEED-CATEGORY-001, SEED-AI-002 |
| RISK-SEED-010 | Escenarios de moneda ausentes. | Medium | Medium | Sembrar eventos en GTQ, USD y EUR. | SEED-EVENT-001 |
| RISK-SEED-011 | Seed contradice reglas de negocio (e.g., 6 QuoteRequests activas en una categoría). | High | Medium | Validar invariantes en el script seed; pruebas unitarias dedicadas. | SEED-QUOTE-001 |
| RISK-SEED-012 | Datos fuera de alcance siembran funcionalidades futuras. | High | Low | Revisión de PR contra §32; bloqueo en code review. | Todos |
| RISK-SEED-013 | Assets de portafolio no disponibles. | Medium | Medium | Usar placeholders documentados y URLs estables. | SEED-VENDOR-003 |
| RISK-SEED-014 | Seed se ejecuta en producción real. | High | Low | Guardrail por `NODE_ENV`/`SEED_MODE`. | Todos |
| RISK-SEED-015 | Auditoría de moderación incompleta. | Medium | Medium | Vincular cada Review `hidden`/`removed` a un AdminAction. | SEED-REVIEW-001, SEED-ADMIN-001 |
| RISK-SEED-016 | Respuestas IA no deterministas; demos no reproducibles. | High | Medium | MockAIProvider con clave `(feature, event_type, language)`. | SEED-AI-001 |

---

## 36. Supuestos, restricciones y dependencias

### 36.1 Supuestos

- El equipo dispone de un único Product Owner que asume el rol admin durante la demo.
- El proyecto se desplegará en un entorno público de evaluación (Vercel, Render, Railway, Supabase o equivalente).
- El equipo cuenta con placeholders de imágenes para el portafolio.
- El consumidor del seed conoce el `LLM_PROVIDER` y puede configurarlo (`mock` por defecto en demo).

### 36.2 Restricciones

- El seed no se ejecuta en producción real.
- El seed no contiene secretos ni datos reales.
- El seed respeta el rango de volúmenes definido en §10–§24.
- El seed respeta todas las invariantes BR/NFR.

### 36.3 Dependencias

- Esquema de base de datos alineado con el Data Model (Doc 6).
- Disponibilidad del MockAIProvider para garantizar determinismo.
- Templates IA versionados en `/prompts`.
- Catálogos de idiomas y monedas activos en la BD.

---

## 37. Preguntas abiertas o decisiones pendientes

| ID | Pregunta | Estado | Propuesta |
|---|---|---|---|
| Q-SEED-01 | ¿Se incluirá un escenario con `User.status='suspended'` para QA? | Requires Product Owner Decision | Recomendado (1 organizador y 1 vendor `suspended`). |
| Q-SEED-02 | ¿Cuántas reseñas seed por vendor aprobado se desean exactamente? | Recommended | 2–5 por vendor aprobado destacado. |
| Q-SEED-03 | ¿Se sembrará un evento en pt y otro en es-ES, o sólo se mostrará via cambio de idioma de UI? | Recommended | Sembrar al menos 1 evento por idioma adicional. |
| Q-SEED-04 | ¿Se incluirá un escenario de Quote en `draft` para el vendor? | Recommended | Sí, 1 por vendor `approved` destacado. |
| Q-SEED-05 | ¿Las imágenes del portafolio serán archivos físicos en el repo, en un CDN, o solo URLs placeholder? | Requires Product Owner Decision | Placeholder remoto estable. |
| Q-SEED-06 | ¿El seed cargará passwords iguales para todos los usuarios demo o se generará una por usuario? | Recommended | Misma password de demo configurada por variable de entorno. |
| Q-SEED-07 | ¿Se desea un dataset adicional para `seed:qa` separado del `seed:demo`? | Recommended | Sí, subset reducido para CI. |
| Q-SEED-08 | ¿Se requieren datos seed para evidenciar el flujo de captcha? | Out of scope para seed (stub vía NFR-TEST-006). | No se siembran tokens. |

---

## 38. Checklist de readiness de seed data

```markdown
## Checklist de readiness de seed data

- [ ] Admin demo user exists (SEED-USER-001).
- [ ] Organizer demo users exist (5–10, SEED-USER-002).
- [ ] Vendor demo users exist (10–20, SEED-USER-003).
- [ ] EventTypes seed include all 6 MVP event types (SEED-EVENTTYPE-001).
- [ ] ServiceCategories seed support quote and vendor flows with 2-level hierarchy (SEED-CATEGORY-001).
- [ ] Vendor profiles include approved, pending, rejected and hidden examples (SEED-VENDOR-001).
- [ ] Vendor portfolio examples respect 10-image limit (SEED-VENDOR-003).
- [ ] Soft-delete attachment scenario exists.
- [ ] Events exist in draft, active, completed, cancelled and auto_completed states (SEED-EVENT-001).
- [ ] Event currency scenarios are represented (GTQ, USD, EUR mínimo).
- [ ] EventTasks support progress demo with mix manual/AI (SEED-TASK-001).
- [ ] Budgets and BudgetItems support currency, warning and committed scenarios (SEED-BUDGET-001).
- [ ] QuoteRequests and Quotes support full lifecycle and 5-active limit (SEED-QUOTE-001).
- [ ] Quote default validity (15 days) and expired scenarios exist.
- [ ] BookingIntent includes pending, confirmed_intent and cancelled-from-confirmed scenarios (SEED-BOOKING-001).
- [ ] Reviews include rating 1–5 across published / hidden / removed (SEED-REVIEW-001).
- [ ] Review moderation and audit scenarios exist (SEED-ADMIN-001).
- [ ] Notifications support quote, vendor, booking and review scenarios (SEED-NOTIF-001).
- [ ] AIRecommendations cover AI-001..AI-008 with MockAIProvider outputs (SEED-AI-001).
- [ ] AIPromptVersion seed exists per feature (SEED-AI-002).
- [ ] AdminActions seed support governance demo (SEED-ADMIN-001).
- [ ] Multi-language examples exist in es-LATAM, es-ES, pt, en.
- [ ] Currency catalog includes GTQ, USD, EUR, MXN, COP.
- [ ] Out-of-scope data is NOT seeded (payments, contracts, WhatsApp, etc.).
- [ ] Seed reset and regeneration strategy is documented (§29).
- [ ] All seed records carry `is_seed=true`.
- [ ] Seed script is idempotent and refuses to run in production.
- [ ] No real PII appears in seed data.
- [ ] MockAIProvider responses are deterministic.
- [ ] Demo scenarios SEED-DEMO-001..005 are executable end-to-end.
```

---

## 39. Resumen final

La presente estrategia de seed data deja a EventFlow listo para una **demo viva, repetible y trazable** de su MVP, sin desviarse del alcance acordado con el Product Owner ni de las reglas de negocio documentadas.

Aspectos clave:

1. **Demostrabilidad E2E.** Cinco demo scenarios (organizador con IA, cotizaciones, vendor, admin, multi-idioma/multi-moneda) están soportados por datasets MVP claramente identificados.
2. **Cobertura de reglas críticas.** Cada invariante (currency inmutable, validez 15 días, 5 QuoteRequests máx, rating 1–5, 10 imágenes portafolio, 2 niveles de categoría, auto-completar 2 días, soft delete) cuenta con escenarios seed dedicados para QA.
3. **IA responsable.** Las 8 features AI tienen respuestas MockAIProvider deterministas y persistencia con `accepted=false/true`, reforzando el human-in-the-loop.
4. **Privacidad por diseño.** Sin PII real, sin secretos, sin datos sensibles; passwords seguros, soft delete para reseñas y attachments.
5. **Gobernanza demostrable.** AdminAction se siembra con casos de aprobación, moderación y consulta `view_event`, evidenciando la auditoría obligatoria.
6. **Repetibilidad.** Un único comando (`seed:demo`) regenera la base de datos demo desde cero, idempotente y aislado de producción.
7. **Trazabilidad total.** Cada dataset se mapea a su origen documental (FR/NFR/UC/BR/Entidad/AI feature) en la matriz §34.
8. **Guardrails MVP.** Datos fuera de alcance (pagos, contratos, WhatsApp, push nativo, RSVP, calendar sync, moderación IA, conversión de moneda) quedan **explícitamente excluidos**.

Con esta estrategia, el equipo de desarrollo cuenta con un plan de carga de datos completo, el equipo de QA con un conjunto de escenarios validables y el Product Owner con una base demostrable para la evaluación académica de EventFlow.
