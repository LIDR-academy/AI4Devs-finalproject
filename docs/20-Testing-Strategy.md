# EventFlow — Testing Strategy

> Documento formal de Estrategia de Pruebas del MVP
> Versión: 1.0
> Fecha: 2026-06-09
> Producto: EventFlow — plataforma asistida por IA para planificación de eventos y gestión simplificada de cotizaciones de proveedores
> MVP target: AI-assisted event planning workspace + simplified vendor quote flow
> Idioma del documento: Español LATAM neutral
> Audiencia: QA Architect, QA Engineers, Backend Engineers, Frontend Engineers, AI Engineers, DevOps, Product Owner, evaluadores académicos, agentes IA generadores de pruebas.

---

## 1. Propósito del documento

Este documento define **cómo se prueba EventFlow** a lo largo de frontend, backend, API, base de datos, IA, seguridad, accesibilidad, internacionalización, datos semilla, readiness de demo y compuertas de calidad de CI/CD. No es un catálogo exhaustivo de casos de prueba: es una **estrategia accionable y trazable** que sirve como entrada para:

- Diseño de pruebas automatizadas (unitarias, integración, API, contrato, componente, E2E).
- Definición de escenarios manuales y demos.
- Generación de tareas en el backlog de desarrollo.
- Configuración de compuertas de calidad antes de merge, demo o entrega académica.
- Evaluación académica del MVP por parte del cuerpo docente del Máster AI4Devs.
- Agentes IA que generen pruebas automáticas siguiendo las reglas del MVP.

El documento responde, con nivel de detalle implementable, a las siguientes preguntas:

1. ¿Qué niveles y tipos de pruebas aplican al MVP de EventFlow?
2. ¿Qué herramientas y formatos se usan en frontend, backend, API, IA y E2E?
3. ¿Qué debe probarse manualmente y qué debe automatizarse?
4. ¿Cómo se prueban las features IA de manera determinística?
5. ¿Cómo se valida RBAC + ownership + assignment-based access?
6. ¿Cómo soporta el seed la repetibilidad de QA y la demo?
7. ¿Cómo se validan requerimientos funcionales, no funcionales y de seguridad?
8. ¿Cuál es la cobertura mínima aceptable y por qué?
9. ¿Qué compuertas de calidad deben pasar antes de demo o entrega?
10. ¿Qué riesgos de pruebas permanecen y cómo se mitigan?

El documento es **implementation-ready** pero no contiene código de producción. Se alinea estrictamente con los documentos previos del proyecto y respeta los límites del MVP.

---

## 2. Alcance del documento

### 2.1 Incluye

- Pruebas unitarias (dominio, aplicación, utilidades, mapeadores, hooks, componentes puros).
- Pruebas de integración (use case + repositorio Prisma, middleware + policy, IA con `MockAIProvider`).
- Pruebas de API REST (Supertest, validación Zod, RBAC, ownership, error envelope, paginación).
- Pruebas de contrato (DTO backend vs frontend, MSW alineado con API, OpenAPI-readiness).
- Pruebas de componentes frontend (Vitest + Testing Library).
- Pruebas de integración frontend (TanStack Query + MSW + flujos de formulario).
- Pruebas end-to-end (Playwright sobre entorno con seed).
- Pruebas de IA determinísticas (uso obligatorio de `MockAIProvider` en CI).
- Pruebas de seguridad (anti-bot, rate limiting, cookies, upload, headers).
- Pruebas de autorización (positivo y negativo: RBAC, ownership, assignment).
- Pruebas de accesibilidad mínima (teclado, foco, labels, contraste, ARIA).
- Pruebas de i18n y moneda (`es-LATAM`, `es-ES`, `pt`, `en`, inmutabilidad de moneda).
- Pruebas de base de datos y migraciones Prisma (constraints, FKs, enums, soft delete).
- Pruebas de datos semilla (idempotencia, reset, `is_seed = true`).
- Pruebas de regresión y smoke.
- Pruebas de readiness de demo.
- Compuertas de calidad de CI.

### 2.2 No incluye

- Pruebas de pagos reales o procesadores de pago.
- Pruebas de firma electrónica de contratos.
- Pruebas de integración con WhatsApp, SMS o push.
- Pruebas de aplicaciones móviles nativas.
- Pruebas de chat en tiempo real.
- Pruebas de certificación formal de cumplimiento (PCI DSS, SOC 2, ISO 27001, GDPR, LGPD).
- Pruebas de escaneo antimalware o pipelines de seguridad avanzados.
- Pruebas de moderación o aprobación autónoma por IA.
- Pruebas de RAG, búsqueda vectorial o agentes autónomos.
- Pruebas de aislamiento multi-tenant.
- Pruebas de flujos transaccionales de marketplace o comisiones.
- Pruebas de carga/estrés con escala enterprise.

---

## 3. Fuentes utilizadas

| # | Documento fuente | Aporta al testing |
|---:|---|---|
| 1 | `/docs/1-Domain-Discovery-Report.md` | Identificación de actores, dominios y journeys críticos a probar. |
| 2 | `/docs/2-Product-Owner-Decisions.md` | Decisiones de PO vinculantes (captcha, moderación manual, idiomas, monedas). |
| 3 | `/docs/3-MVP-Scope-Definition.md` | Define lo que entra y lo que no entra: fija el out-of-scope de pruebas. |
| 4 | `/docs/4-Business-Rules-Document.md` | Reglas de negocio (BR-*) que se transforman en aserciones de pruebas. |
| 5 | `/docs/5-User-Roles-Permissions-Matrix.md` | Matriz de roles/permisos: base de pruebas positivas y negativas de autorización. |
| 6 | `/docs/6-Domain-Data-Model.md` | Entidades, ownership y relaciones a validar a nivel base de datos. |
| 7 | `/docs/7-AI-Features-Specification.md` | Inventario de features IA y contratos JSON esperados por feature. |
| 8 | `/docs/8-Use-Cases-Specification.md` | Casos de uso UC-* a probar en flujos E2E e integración. |
| 8.1 | `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md` | Decisiones PO sobre timeouts IA, soft delete, validez de quotes. |
| 8.2 | `/docs/8.2-Documentation-Alignment-Review-Before-FRD.md` | Verificación de consistencia previa al FRD. |
| 9 | `/docs/9-Functional-Requirements-Document.md` | Requerimientos funcionales FR-* que se trazan a aserciones de prueba. |
| 10 | `/docs/10-Non-Functional-Requirements.md` | NFR-SEC-*, NFR-IA-*, NFR-PERF-*, NFR-OBS-*: definen compuertas no funcionales. |
| 11 | `/docs/11-Data-Seed-Strategy.md` | Datos semilla, `is_seed`, idempotencia, soporte de E2E. |
| 12 | `/docs/12-Architecture-Vision-and-Principles.md` | Principios arquitectónicos: pruebas honran Clean/Hexagonal. |
| 13 | `/docs/13-System-Architecture-Document.md` | Topología del sistema: define qué se prueba en qué capa. |
| 14 | `/docs/14-Backend-Technical-Design.md` | Estructura de use cases, repositorios, middleware: define pruebas unitarias e integración backend. |
| 15 | `/docs/15-Frontend-Architecture-Design.md` | App Router, TanStack Query, RHF, Zod, MSW: define pruebas de frontend. |
| 16 | `/docs/16-API-Design-Specification.md` | Endpoints REST, envelopes, paginación: define pruebas de API y contrato. |
| 17 | `/docs/17-AI-Architecture-and-PromptOps-Design.md` | `LLMProvider`, `MockAIProvider`, prompt versioning, timeouts: define pruebas IA determinísticas. |
| 18 | `/docs/18-Database-Physical-Design.md` | Constraints, índices, soft delete, `is_seed`: define pruebas de BD y migraciones. |
| 19 | `/docs/19-Security-and-Authorization-Design.md` | Catálogo de políticas SEC-POL-*: define pruebas negativas de autorización y seguridad. |

---

## 4. Resumen ejecutivo de la estrategia de testing

EventFlow adopta una **estrategia de pruebas pragmática para MVP académico**, basada en los siguientes pilares:

1. **Pirámide de pruebas adaptada al monolito modular.** Base ancha de pruebas unitarias sobre use cases y políticas de dominio; capa media sólida de pruebas de integración y API; cúspide reducida de E2E sobre flujos críticos.
2. **Backend como fuente de verdad.** Las reglas de negocio y la autorización se validan principalmente en backend; el frontend sólo se prueba a nivel de UX.
3. **API contract-first.** Cada endpoint se valida con Supertest contra su DTO Zod y su envelope estándar. MSW en frontend espeja exactamente el contrato.
4. **IA determinística.** Todas las pruebas automáticas de IA usan `MockAIProvider`. El uso real de `OpenAIProvider` es manual, opcional, y nunca obligatorio para CI.
5. **Human-in-the-loop probado explícitamente.** Cada salida IA debe poder ser aceptada, editada o rechazada por el usuario, y cada flujo verifica que ninguna decisión se aplica sin acción humana.
6. **Cobertura E2E mínima pero estratégica.** Playwright cubre flujos demo y críticos sobre un entorno sembrado y reproducible.
7. **Pruebas negativas obligatorias.** Por cada política de autorización debe existir al menos un caso negativo (acceso anónimo, rol incorrecto, ownership incorrecto, assignment incorrecto).
8. **Repetibilidad por seed.** El seed es idempotente, marcado con `is_seed = true`, sin PII real, y soporta el reset entre escenarios.
9. **Compuertas de calidad en CI.** Type check, lint, unit, integration, API, frontend, build, migraciones, seed y smoke E2E deben pasar antes de merge o demo.
10. **Sin sobre-ingeniería.** No se construye un programa QA enterprise: el objetivo es un MVP validable, seguro, trazable y demo-ready.

---

## 5. Principios de testing del MVP

| ID | Principio | Significado | Implicación |
|---|---|---|---|
| PT-01 | Test critical user journeys first | Priorizar journeys que sostienen la demo y el valor del producto. | Cobertura E2E enfocada en flujos demo, no en exhaustividad. |
| PT-02 | Backend business rules are source of truth | Las reglas BR-* se validan principalmente en backend. | Pruebas unitarias de use cases y políticas, no en frontend. |
| PT-03 | Frontend guards are UX only | Las protecciones del frontend son experiencia, no seguridad. | Toda denegación debe probarse también a nivel API. |
| PT-04 | AI must be deterministic in tests | Las pruebas IA no dependen de un proveedor externo. | `MockAIProvider` obligatorio en CI. |
| PT-05 | Human-in-the-loop must be tested explicitly | Toda salida IA requiere aceptación/edición/rechazo del usuario. | Pruebas verifican que no haya efectos sin acción humana. |
| PT-06 | Seed data must be reproducible | El seed es idempotente y determinístico. | Pruebas pueden ejecutarse repetidamente sin contaminar el entorno. |
| PT-07 | Authorization includes positive and negative scenarios | Cada política RBAC/ownership/assignment exige caso positivo y negativo. | No se considera completa una política sin su prueba negativa. |
| PT-08 | No overengineering | El MVP no requiere mutation testing, chaos engineering ni QA enterprise. | Sólo se exigen las pruebas que sostienen la calidad mínima del MVP. |
| PT-09 | Demo readiness is a quality requirement | La demo debe ser reproducible y estable. | Smoke E2E demo es compuerta de calidad. |
| PT-10 | Tests must be traceable | Cada prueba se traza a FR/BR/UC/NFR/SEC-POL. | Toda prueba debe indicar su referencia en su descripción o metadata. |
| PT-11 | Tests must be readable | Las pruebas son documentación viva del comportamiento esperado. | Nombrar pruebas con intención de negocio, no de implementación. |
| PT-12 | No flaky tolerance | Las pruebas flaky se aíslan o se eliminan. | Se prefieren pruebas pequeñas y determinísticas sobre suites grandes inestables. |

---

## 6. Niveles de testing

### 6.1 Unit tests

**Alcance.** Probar unidades aisladas sin dependencias externas. Son la base de la pirámide.

**Cubren al menos:**

- Políticas de dominio (`event.policy.ts`, `quote.policy.ts`, `vendor.policy.ts`, `review.policy.ts`).
- Use cases de aplicación (`CreateEventUseCase`, `RespondQuoteUseCase`, etc.) con repositorios mockeados.
- Funciones utilitarias (formateo de monedas, helpers de fecha, slugify, etc.).
- Esquemas Zod (validación, transformación, defaults).
- Mapeadores de prompts IA (input → prompt; output JSON → DTO).
- Componentes puros del frontend (sin side-effects ni queries).
- Hooks personalizados (cuando exista lógica relevante separable).

**Herramientas:** Vitest, Testing Library (en frontend).

### 6.2 Integration tests

**Alcance.** Verificar la integración entre componentes internos del backend con dependencias reales (BD de prueba o IA mock).

**Cubren al menos:**

- Use case + adaptador repositorio Prisma sobre BD de prueba.
- Constraints de base de datos (FKs, unique, enums, soft delete).
- Middleware de autenticación + middleware de policy.
- Módulo IA con `MockAIProvider`.
- Simulación de notificaciones (email mock).
- Simulación de subida de archivos (multer mock, storage adaptado a filesystem temporal).

**Herramientas:** Vitest + Prisma + base de datos efímera (PostgreSQL en contenedor o esquema temporal).

### 6.3 API tests

**Alcance.** Probar la capa HTTP a través del servidor Express completo.

**Cubren al menos:**

- Códigos HTTP correctos por endpoint y por error.
- Validación Zod de DTO de entrada (200 vs 400).
- Envelope estándar (`{ data | error }`).
- Paginación, filtrado y ordenamiento.
- Autenticación: 401 anónimo.
- Autorización: 403 por rol, ownership o assignment.
- Reglas de negocio (BR-*): respuestas 409 / 422 según corresponda.
- Soft delete y comportamiento esperado posterior.

**Herramientas:** Supertest + Vitest.

### 6.4 Contract tests

**Alcance.** Garantizar la consistencia entre el contrato API expuesto por el backend y el contrato consumido por el frontend.

**Cubren al menos:**

- Validación de forma de respuesta en frontend mediante esquemas Zod compartidos.
- Handlers MSW alineados con el contrato real de API.
- Si se genera OpenAPI, validar que las respuestas reales se ajusten al esquema.
- Detección de drift cuando el backend cambia DTO sin sincronizar frontend.

**Herramientas:** Zod (esquemas compartidos), MSW, validador OpenAPI opcional.

### 6.5 Frontend tests

**Alcance.** Probar componentes, páginas y flujos del frontend con dependencias externas mockeadas.

**Cubren al menos:**

- Render de componentes con estados loading / error / empty / success.
- Validación de formularios con React Hook Form + Zod.
- Estados de TanStack Query (pending, error, success, stale).
- Rendering basado en i18n (`next-intl`).
- Visibilidad condicional según rol del usuario.
- Componentes de revisión de sugerencias IA (aceptar, editar, rechazar).
- Smoke de página pública SEO de proveedor.
- Que el frontend **nunca** llame directamente al LLM.

**Herramientas:** Vitest, Testing Library, MSW.

### 6.6 End-to-end tests

**Alcance.** Validar flujos completos del usuario sobre la aplicación real conectada a un entorno con seed.

**Cubren al menos:**

- Flujo de autenticación (register, login, logout, password reset por token).
- Flujo crítico de organizador (crear evento, generar plan IA, aceptar, ver checklist).
- Flujo crítico de proveedor (crear perfil, responder cotización).
- Flujo crítico de admin (aprobar proveedor, moderar reseña).
- Flujo IA asistida con `MockAIProvider`.
- Flujo de cotización: organizador envía solicitud, proveedor responde, organizador compara.
- Flujo de booking intent y confirmación.
- Flujo de review post-confirmación.
- Smoke demo.

**Herramientas:** Playwright sobre entorno con seed.

### 6.7 Manual exploratory testing

**Alcance.** Lo que no se automatiza pero se valida humanamente.

**Cubren al menos:**

- Pulido de UX y microcopy.
- Comportamiento responsive en distintos breakpoints.
- Inspección visual y consistencia de marca.
- Revisión de copies por idioma.
- Exploración de edge cases no cubiertos.
- Ensayo de demo (demo rehearsal).
- Revisión cualitativa de salidas IA usando proveedor real en entorno controlado, fuera de CI.

---

## 7. Test pyramid for EventFlow

EventFlow adopta una pirámide de pruebas adaptada al monolito modular con dominio claro:

```mermaid
flowchart TD
    E2E[🎯 Pocas pruebas E2E\n(Playwright, demo flows)]
    API[🔌 Capa media: API + integración\n(Supertest + Prisma + IA mock)]
    UNIT[🧱 Base amplia: pruebas unitarias\n(use cases, políticas, schemas, hooks)]
    E2E --> API
    API --> UNIT
```

**Justificación.** Un MVP académico con E2E como única defensa es frágil, lento y caro de mantener. La estrategia prioriza pruebas unitarias rápidas y determinísticas sobre la lógica de dominio (donde viven las reglas), refuerza con pruebas de API e integración (donde viven los acoplamientos reales), y reserva E2E exclusivamente para journeys de demo, autenticación y flujos críticos transversales.

**Distribución orientativa de esfuerzo:**

| Nivel | Proporción aproximada | Velocidad esperada | Dependencias |
|---|---|---|---|
| Unit | ~60% | <50ms por test | Ninguna externa |
| Integration + API | ~30% | <500ms por test | BD de prueba, IA mock |
| E2E | ~10% | Segundos por test | Aplicación real + seed |

---

## 8. Test types by quality attribute

| Atributo de calidad | Tipo de prueba | Herramienta | Evidencia esperada |
|---|---|---|---|
| Funcionalidad correcta | Unit + Integration + API + E2E | Vitest, Supertest, Playwright | Tests verdes que validan BR/FR |
| Autorización (RBAC + ownership + assignment) | API + Unit policy | Supertest + Vitest | Casos positivos y negativos por política |
| Seguridad (cookies, captcha, rate limit, upload) | API + E2E parcial | Supertest, Playwright | 401/403/429, validación de MIME |
| Determinismo IA | Unit + Integration + E2E | `MockAIProvider` | Salidas reproducibles y schema válido |
| Human-in-the-loop | E2E + Frontend integration | Playwright + Testing Library | Acciones aceptar/editar/rechazar verificadas |
| Integridad de datos | Integration | Vitest + Prisma | Constraints FKs/unique fallan cuando deben |
| Constraints de BD | Integration + Migration validation | Prisma | `prisma migrate validate` y violaciones esperadas |
| Smoke de rendimiento | API | Supertest, Playwright | Tiempos por endpoint clave dentro de NFR |
| Accesibilidad | Frontend + E2E | Testing Library, Playwright, axe-core opcional | Labels, foco, contraste, teclado |
| i18n | Frontend + E2E | Testing Library, Playwright | Render por locale, parámetro `language` en IA |
| Responsive | Manual + Playwright opcional | Playwright (viewports) | Render correcto en mobile / tablet / desktop |
| Observabilidad | API + Integration | Supertest + log capture | Correlation ID presente, logs estructurados |
| Demo readiness | E2E + Manual | Playwright + ensayo manual | Smoke demo verde, ensayo aprobado |
| Regresión | Suite completa CI | Vitest + Playwright | Suite verde en main y en PR |

---

## 9. Functional testing strategy by module

### 9.1 Auth

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Register | Crear cuenta con captcha válido / inválido | API, E2E | Alta | FR-AUTH, SEC-POL-AUTH |
| Login | Login exitoso, password incorrecta, rate limit | API, E2E | Alta | FR-AUTH, SEC-POL-AUTH |
| Logout | Limpieza de cookie, invalidación de sesión | API | Alta | SEC-POL-AUTH |
| Password reset | Generación y consumo de token de un solo uso | API | Alta | SEC-POL-AUTH |
| Sesión | Cookie HTTP-only, flags secure/SameSite | API | Alta | SEC-POL-AUTH |

### 9.2 Users

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Perfil propio | Lectura y edición de datos propios | API | Alta | FR-USERS |
| Ownership | Un usuario no puede leer ni editar a otro | API | Alta | SEC-POL-OWNER |
| Cambio de contraseña | Verificación de contraseña actual | API | Alta | SEC-POL-AUTH |

### 9.3 Events

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Crear evento | Organizador crea, moneda inmutable después | Unit, API, E2E | Alta | FR-EVENTS, BR-EVENT-* |
| Auto-completar | Evento se marca completo 2 días después de la fecha | Integration | Alta | BR-EVENT-AUTO-COMPLETE |
| Soft delete | El evento se oculta pero no se borra físicamente | Integration | Media | BR-EVENT-DELETE |
| Listado por organizador | Sólo eventos propios | API | Alta | SEC-POL-OWNER |
| Cambio de moneda | Bloqueado tras creación | API | Alta | BR-EVENT-CURRENCY |

### 9.4 AI Assistance

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Generación de plan | `MockAIProvider` produce JSON válido | Unit, Integration | Alta | FR-AI, NFR-IA |
| Schema strict | JSON inválido produce error controlado | Integration | Alta | NFR-IA |
| Timeout 60s | Fallback / error controlado al timeout | Integration | Alta | NFR-IA-TIMEOUT |
| Persistencia | Cada salida se persiste en `AIRecommendation` | Integration | Alta | DB-AIRECO |
| Human-in-the-loop | Aceptar / editar / rechazar | E2E | Alta | BR-AI-HITL |
| Idioma | Parámetro `language` se respeta en prompt | Unit | Alta | FR-AI |
| No llamadas desde frontend | Frontend nunca contacta al LLM | Frontend test | Alta | SEC-POL-AI |

### 9.5 Tasks

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Crear tarea manual | Organizador crea tareas | API | Alta | FR-TASKS |
| Tareas generadas por IA | Provienen de checklist aceptado | Integration | Alta | FR-AI |
| Estado y prioridad | Transiciones válidas | Unit | Media | BR-TASKS |

### 9.6 Budget

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Distribución sugerida IA | Schema válido vía Mock | Integration | Alta | FR-AI |
| Edición humana | Aceptar / editar valores sugeridos | E2E | Alta | BR-AI-HITL |
| Moneda fija | No se permite cambiar moneda del evento | API | Alta | BR-EVENT-CURRENCY |

### 9.7 Vendors

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Crear perfil | Proveedor crea su perfil | API | Alta | FR-VENDORS |
| Aprobación admin | Sólo admin aprueba | API | Alta | SEC-POL-ADMIN |
| Visibilidad pública | Sólo proveedores aprobados aparecen públicos | API | Alta | BR-VENDOR-PUBLIC |
| Bio/paquete IA | Generación Mock + edición humana | Integration, E2E | Media | FR-AI |

### 9.8 Service Categories

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Jerarquía 2 niveles | No se permite anidar más allá del nivel 2 | API | Alta | BR-CAT-DEPTH |
| Edición sólo admin | Organizer/Vendor reciben 403 | API | Alta | SEC-POL-ADMIN |

### 9.9 Quotes

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Envío de solicitud | Organizador envía a proveedor aprobado | API | Alta | FR-QUOTES |
| Validez 15 días | Validez por defecto 15 días | Unit, API | Alta | BR-QUOTE-VALIDITY |
| Visibilidad por assignment | Proveedor sólo ve sus propias solicitudes asignadas | API | Alta | SEC-POL-ASSIGN |
| Comparación | Brief IA y resumen comparativo vía Mock | Integration | Alta | FR-AI |

### 9.10 Booking Intent

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Crear intent | Organizador crea sobre quote válido | API | Alta | FR-BOOKING |
| Confirmar | Proveedor confirma | API | Alta | FR-BOOKING |
| Sin pagos | El flujo nunca dispara cobros | API | Alta | OUT-OF-SCOPE |

### 9.11 Reviews

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Crear review | Sólo tras booking confirmado | API | Alta | BR-REVIEW-CONFIRMED |
| Rating 1–5 | Fuera de rango → 422 | Unit, API | Alta | BR-REVIEW-RANGE |
| Moderación admin | Admin puede ocultar review | API | Media | SEC-POL-ADMIN |

### 9.12 Notifications

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Envío simulado | Mock de email captura eventos | Integration | Media | FR-NOTIFY |
| Sin WhatsApp/SMS/Push | Esos canales no se invocan | Integration | Alta | OUT-OF-SCOPE |

### 9.13 Admin

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Aprobar proveedor | Sólo admin puede | API | Alta | SEC-POL-ADMIN |
| Audit log `AdminAction` | Cada acción admin queda registrada | Integration | Alta | NFR-OBS-AUDIT |
| Métricas básicas | Endpoint admin agrega contadores | API | Media | FR-ADMIN |

### 9.14 Attachments

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Allowlist MIME | Tipos no permitidos rechazados | API | Alta | SEC-POL-UPLOAD |
| Tamaño máximo | Excede límite → 413 | API | Alta | SEC-POL-UPLOAD |
| Soft delete | Archivo lógicamente eliminado | Integration | Media | BR-ATTACH-DELETE |

### 9.15 Seed/Demo

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Idempotencia | Reset repetido produce mismo estado | Integration | Alta | SEED-IDEMPOTENT |
| `is_seed = true` | Toda fila de seed lleva la marca | Integration | Alta | SEED-FLAG |
| Reset | Solo elimina registros con `is_seed = true` | Integration | Alta | SEED-RESET |

### 9.16 i18n

| Área | Qué probar | Nivel | Prioridad | Trazabilidad |
|---|---|---|---|---|
| Locales soportados | `es-LATAM`, `es-ES`, `pt`, `en` | Frontend | Alta | FR-I18N |
| Idioma del evento | Persistencia y propagación a IA | API, Integration | Alta | FR-AI |
| Moneda | No conversión automática, formato por locale | Frontend, API | Alta | BR-EVENT-CURRENCY |

---

## 10. Backend testing strategy

El backend es la **fuente de verdad** para autorización y reglas de negocio, y concentra la mayor densidad de pruebas.

**Cobertura por capa:**

- **Unit tests** sobre use cases de aplicación con repositorios fake/mock.
- **Unit tests** sobre políticas de dominio (`event.policy.ts`, `quote.policy.ts`, etc.).
- **Integration tests** con Prisma sobre BD efímera para validar constraints, FKs, soft delete, transacciones.
- **Repository adapter tests** que verifican mapeos entidad ↔ persistencia.
- **Controller tests** con Supertest sobre el servidor Express, incluyendo middlewares completos.
- **Middleware tests** dedicados: auth, policy, error handler, correlation ID, rate limit.
- **Auth and authorization tests** con casos positivos y negativos por endpoint sensible.
- **Transaction boundary tests** para use cases con múltiples writes.
- **Error handler tests** que verifican envelope `{ error }` consistente y sin fuga de stack traces.
- **Job tests** para tareas en segundo plano (ej. auto-completar evento +2 días).
- **Seed reset tests** que verifican idempotencia y `is_seed`.
- **AI provider adapter tests** que verifican `MockAIProvider` produce JSON conforme al schema.

**Estructura recomendada de carpetas:**

```text
backend/
  src/
  tests/
    unit/
      domain/
      application/
      schemas/
      ai/
    integration/
      repositories/
      use-cases/
      ai/
      jobs/
      seed/
    api/
      auth/
      events/
      quotes/
      vendors/
      admin/
    fixtures/
      users/
      events/
      ai-responses/
    helpers/
      test-db.ts
      test-server.ts
      mock-ai.ts
```

---

## 11. Frontend testing strategy

El frontend prioriza **calidad de experiencia**, no lógica de negocio. La seguridad nunca depende del frontend.

**Cobertura por capa:**

- **Component tests** para componentes con estados visuales (loading, error, empty, success, skeleton).
- **Page flow tests** que simulan interacción usuario sobre páginas con MSW.
- **Form validation tests** con RHF + Zod (mensajes, focus management, submit deshabilitado).
- **Role-based navigation tests** que verifican que la UI condicional se renderiza correctamente.
- **TanStack Query state tests** (pending → success / error / refetch).
- **MSW API mocking** alineado al contrato real del backend.
- **i18n tests** para asegurar que cada string proviene del catálogo y no del código.
- **Accessibility checks** sobre labels, roles, focus order, navegación por teclado.
- **AI human-in-the-loop UI** que verifica aceptar/editar/rechazar.
- **Public vendor SEO page smoke tests** (rutas accesibles, metadatos básicos).
- **Error/loading/empty/skeleton states** verificados explícitamente.

**Estructura recomendada de carpetas:**

```text
frontend/
  src/
  tests/
    unit/
      components/
      hooks/
      utils/
    integration/
      pages/
      flows/
    e2e/
      organizer/
      vendor/
      admin/
      ai/
      auth/
    mocks/
      handlers/
      data/
    fixtures/
```

---

## 12. API testing strategy

Cada endpoint REST del MVP se prueba con Supertest sobre la app completa. Las aserciones cubren:

- **Status codes**: 200, 201, 204, 400, 401, 403, 404, 409, 413, 415, 422, 429.
- **Validación DTO de request** con Zod: payload inválido → 400 con detalle.
- **Response envelope** estándar `{ data, meta }`.
- **Error envelope** estándar `{ error: { code, message, details?, correlationId } }` sin fuga de stack.
- **Paginación**: `page`, `pageSize`, `meta.total`, `meta.hasNext`.
- **Sorting / filtering**: parámetros válidos vs inválidos.
- **Correlation ID** presente en headers de respuesta y en logs.
- **Auth required**: anónimo → 401 cuando aplica.
- **Role denied**: rol incorrecto → 403.
- **Ownership denied**: usuario distinto al propietario → 403/404 (según política).
- **Business rule violations** → 409 / 422 con código de error semántico.
- **Soft delete behavior**: tras delete, recursos no aparecen en listados públicos pero permanecen en BD.
- **File upload validation**: MIME allowlist, tamaño máximo, multipart correcto.

Toda nueva ruta declarada en `/docs/16-API-Design-Specification.md` debe contar con al menos un test positivo, un test 401 (si requiere auth) y un test 403 (si tiene política).

---

## 13. AI testing strategy

Esta sección es **crítica** y diferencia EventFlow de un MVP estándar: la IA debe probarse **sin depender del proveedor real**.

### 13.1 AI testing principles

| ID | Principio | Implicación operacional |
|---|---|---|
| AI-T-01 | Nunca depender de OpenAI real para pruebas automáticas | CI usa exclusivamente `MockAIProvider` |
| AI-T-02 | Validar JSON estricto contra schema | Toda salida IA pasa por Zod antes de aceptarse |
| AI-T-03 | Probar fallback / error controlado | Si JSON inválido → error semántico, no crash |
| AI-T-04 | Probar timeout 60s | Promesa cancelada y respuesta de error controlada |
| AI-T-05 | Persistencia en `AIRecommendation` | Toda salida IA, aceptada o no, queda registrada |
| AI-T-06 | Human-in-the-loop obligatorio | Aceptar / editar / rechazar probados en E2E |
| AI-T-07 | Parámetro `language` respetado | Idioma del evento se pasa al prompt |
| AI-T-08 | Frontend no llama directamente al LLM | Todo llamado IA ocurre desde backend |
| AI-T-09 | Prompt versioning observable | El `promptVersion` queda registrado en cada salida |

### 13.2 AI feature test matrix

| Feature IA | Enfoque de prueba | Mock esperado | Validación humana requerida | Prioridad |
|---|---|---|---|---|
| Generación de plan de evento | Unit + Integration + E2E con Mock | Sí | Sí (aceptar/editar/rechazar) | Alta |
| Generación de checklist | Unit + Integration | Sí | Sí | Alta |
| Distribución de presupuesto | Unit + Integration | Sí | Sí | Alta |
| Recomendación de categoría de proveedor | Unit + Integration | Sí | Sí | Media |
| Generación de brief de cotización | Unit + Integration | Sí | Sí | Alta |
| Resumen comparativo de cotizaciones | Unit + Integration | Sí | Sí | Alta |
| Bio/paquete de proveedor | Unit + Integration + E2E | Sí | Sí | Media |
| Priorización de tareas urgentes | Unit + Integration | Sí | Sí | Media |

### 13.3 Real provider testing

Las pruebas con `OpenAIProvider` real **no son requeridas para CI** y existen como verificación cualitativa manual.

**Condiciones:**

- Sólo en entorno controlado del desarrollador o staging interno.
- Nunca con datos personales reales.
- Se omiten automáticamente si `OPENAI_API_KEY` no está presente (skip explícito).
- Las aserciones sólo validan **schema y forma**, jamás texto literal.
- El costo y rate limit se controlan: máximo N llamadas por sesión, configurables.
- No bloquean PR ni demo.
- Documentadas claramente como `@manual` o `@real-provider` para excluirlas de CI por tag.

---

## 14. Security and authorization testing strategy

Las pruebas de seguridad y autorización son **obligatorias** y cubren tanto el camino feliz como el malicioso.

**Casos obligatorios por endpoint sensible:**

- Acceso anónimo → 401.
- Rol incorrecto → 403.
- Ownership incorrecto → 403/404.
- Proveedor asignado sólo ve sus solicitudes asignadas.
- Endpoints admin negados para organizer/vendor.
- Captcha requerido en register/login (sin captcha o inválido → 400/403).
- Rate limiting activo en register/login/password reset (excedido → 429).
- Token de reset de contraseña: válido sólo una vez, expira tras consumirse o tras TTL.
- Cookies de sesión con `HttpOnly`, `Secure`, `SameSite=Lax`/`Strict`.
- CSRF: si aplica double-submit cookie, se prueba ausencia/diferencia del token → 403.
- CORS restringido al origen del frontend; orígenes no permitidos → bloqueados.
- Límite de payload superado → 413.
- MIME no permitido en upload → 415.
- No hay secretos expuestos en el bundle frontend.
- Errores no exponen stack traces ni rutas internas.
- Toda acción admin queda registrada en `AdminAction`.

| Escenario | Resultado esperado | Nivel | Prioridad |
|---|---|---|---|
| GET endpoint propietario con sesión ausente | 401 | API | Alta |
| Organizer accede a evento de otro organizer | 403/404 | API | Alta |
| Vendor accede a quote no asignada a él | 403/404 | API | Alta |
| Organizer ejecuta endpoint admin | 403 | API | Alta |
| Register sin captcha | 400/403 | API + E2E | Alta |
| Login excede rate limit | 429 | API | Alta |
| Password reset con token consumido | 400/410 | API | Alta |
| Upload con MIME no permitido | 415 | API | Alta |
| Upload supera tamaño máximo | 413 | API | Alta |
| Admin moderation persiste `AdminAction` | 200 + registro | Integration | Alta |
| Error en endpoint expone stack | Falla la prueba | API | Alta |

---

## 15. Database and migration testing strategy

**Cubren al menos:**

- Validación de migraciones Prisma (`prisma migrate diff` / `prisma migrate validate`).
- Constraints NOT NULL y CHECK.
- Foreign keys: borrar entidad referenciada con FK bloqueante falla.
- Enums: valores fuera del enum rechazados.
- Soft delete uniqueness: campos únicos respetan filas no eliminadas.
- `is_seed` flag preservada y reseteable.
- Transacciones: un paso fallido revierte todo el caso de uso.
- Validez de quote por defecto = 15 días.
- Rating reviews ∈ [1..5].
- Categoría de servicio jerarquía máxima 2 niveles.
- Moneda de evento inmutable después de creación.
- Auto-completar evento 2 días después de su fecha (job).
- Integridad de `AIRecommendation`: FK a usuario/evento/quote según corresponda, `promptVersion` no nulo.

Las pruebas de BD usan una base de datos efímera por suite (esquema temporal o contenedor) y se aíslan por transacción cuando es posible.

---

## 16. Seed data testing strategy

El seed es la columna vertebral de la repetibilidad QA y de la demo.

**Cubren al menos:**

- Idempotencia: ejecutar el seed N veces produce el mismo estado.
- Determinismo: mismos UUIDs y mismos valores en cada ejecución (sin `now()` ni random no seedeado).
- Marca `is_seed = true` en todas las filas.
- Reset elimina exclusivamente filas con `is_seed = true`.
- Existen usuarios demo (organizer, vendor, admin) con credenciales conocidas (no productivas).
- Existen eventos demo en distintos estados.
- Existen proveedores demo aprobados y pendientes.
- Existen quote requests, quotes, booking intents y reviews demo.
- Existen `AIRecommendation` demo trazables a un `promptVersion`.
- No hay PII real (nombres ficticios, emails `@example.com`, etc.).
- Soporta los flujos E2E críticos sin requerir crear datos en cada test.

| Dataset semilla | Pruebas que soporta | Prioridad |
|---|---|---|
| Usuarios demo (3 roles) | Auth, autorización, role visibility | Alta |
| Eventos demo en estados clave | Flujos organizador, listados, auto-complete | Alta |
| Proveedores aprobados + pendientes | Listado público, aprobación admin | Alta |
| Categorías de servicio | Búsqueda y filtrado, validación jerarquía 2 niveles | Alta |
| Solicitudes y cotizaciones demo | Flujo quote, comparación, assignment | Alta |
| Booking intents demo | Confirmación y posterior review | Alta |
| Reviews demo | Moderación admin, listado público | Media |
| `AIRecommendation` demo | UI human-in-the-loop, persistencia | Media |

---

## 17. Accessibility testing strategy

EventFlow no busca conformidad formal WCAG completa para MVP, pero garantiza accesibilidad mínima usable y testeable.

**Cubren al menos:**

- Navegación completa por teclado en flujos críticos.
- Gestión de foco en aperturas/cierres de modal y navegación entre páginas.
- Inputs con labels asociados y mensajes de error programáticamente vinculados.
- Contraste de color mínimo (verificación con axe-core opcional o checklist manual).
- Encabezados semánticos (`h1` único por página, jerarquía ordenada).
- ARIA usado solo donde no hay equivalente nativo.
- Diálogos/modales con role correcto, focus trap y restauración de foco al cerrar.
- UI de revisión de sugerencias IA navegable por teclado y anunciada por lector.
- Verificación responsive móvil mínima.

**Herramientas:**

- Testing Library accessibility queries (`getByRole`, `getByLabelText`).
- Playwright accessibility helpers.
- axe-core (recomendado, opcional).

---

## 18. i18n and currency testing strategy

**Cubren al menos:**

- Locales soportados: `es-LATAM`, `es-ES`, `pt`, `en`.
- Selector de idioma del usuario persiste en cookie/preferencia y aplica en cliente y servidor.
- Idioma del evento se almacena en BD y se propaga al prompt IA como parámetro.
- Cada salida IA respeta el idioma solicitado.
- Las monedas se muestran con formato correcto por locale (separadores, posición del símbolo).
- La moneda del evento es **inmutable** tras creación: cualquier intento de cambio → 422 con código semántico.
- No existe conversión automática entre monedas.
- Catálogo de strings completo por locale: la ausencia de una clave falla en pruebas de smoke i18n.

---

## 19. Performance and reliability testing strategy

El MVP no exige pruebas de carga enterprise. La estrategia es **smoke + sanity**.

**Cubren al menos:**

- Smoke de tiempos de respuesta de API en endpoints críticos (login, listar eventos, listar quotes, generar plan IA con mock).
- Frontend renderiza estados loading en menos del tiempo definido por NFR.
- Timeout de IA a 60s respetado (error controlado).
- Retry / fallback en IA observable y sin loops infinitos.
- Smoke de índices de BD: queries clave devuelven en tiempo razonable con seed.
- No se realizan pruebas de carga sostenida ni stress tests.

---

## 20. Observability and audit testing strategy

**Cubren al menos:**

- Cada request tiene `correlationId` único y se propaga a logs.
- Logs estructurados en JSON con nivel correcto (no `console.log` desnudo).
- `AIRecommendation` persiste `promptVersion`, `provider`, `latencyMs`, `fallbackUsed`.
- `AdminAction` se crea para toda acción admin (aprobar proveedor, moderar review, reset seed).
- Errores no incluyen datos sensibles (passwords, tokens, payloads completos).
- Si se usa fallback IA, queda registrado y observable.
- Reset de seed (si está habilitado en demo) queda auditado.

---

## 21. Regression testing strategy

**En cada PR:**

- Type check, lint, unit, integration, API, frontend.
- Suite mínima de E2E smoke.
- Migraciones y seed validados.

**Antes de demo:**

- Suite completa de E2E (organizer, vendor, admin, IA, auth).
- Smoke demo end-to-end ejecutado al menos una vez sobre entorno demo.
- Ensayo manual de demo.

**Nightly o manual:**

- Pruebas con `OpenAIProvider` real (opcionales).
- Pruebas exploratorias y revisión cualitativa de salidas IA.

**Smoke vs full regression:**

| Aspecto | Smoke | Regression completa |
|---|---|---|
| Duración esperada | < 5 min | < 20 min |
| Frecuencia | Cada PR | Antes de demo / merge a main protegido |
| Cobertura | Flujos críticos demo | Todos los módulos |
| Falla bloqueante | Sí (merge bloqueado) | Sí (demo bloqueado) |

---

## 22. CI/CD quality gates

Sin construir un pipeline DevOps enterprise, EventFlow define las siguientes compuertas mínimas:

| Compuerta | Obligatoria | Etapa |
|---|---|---|
| Type check (TypeScript strict) | Sí | PR |
| Lint (ESLint + reglas del proyecto) | Sí | PR |
| Unit tests | Sí | PR |
| Integration tests (backend) | Sí | PR |
| API tests (Supertest) | Sí | PR |
| Frontend tests (Vitest + Testing Library) | Sí | PR |
| E2E smoke (Playwright) | Sí | PR |
| Build verification (frontend + backend) | Sí | PR |
| Migration validation (`prisma migrate validate`) | Sí | PR |
| Seed validation (idempotencia ejecutada en CI) | Sí | PR |
| Cobertura mínima global | Sí | PR |
| Sin tests críticos saltados (`.skip` / `xfail`) | Sí | PR |
| Sin pruebas de seguridad/autorización falladas | Sí | PR |

**Umbrales de cobertura recomendados:**

```text
Cobertura automática global mínima:                                60%
Use cases backend críticos y políticas de autorización:            80%+
```

La cobertura es **métrica de soporte**, no la única métrica de calidad. Una suite con 90% de cobertura pero sin pruebas negativas de autorización es **insuficiente**.

---

## 23. Definition of test readiness

Una historia o feature se considera lista para ser probada cuando:

- Tiene criterios de aceptación claros (referencia a FR/UC).
- Datos de prueba están identificados o existen en seed.
- Roles, ownership y assignment relevantes están definidos.
- Contrato de API está definido (request DTO, response DTO, errores).
- Casos de error y reglas de negocio están identificados.
- Si afecta seed, los cambios necesarios al seed están documentados.
- Si involucra IA, la respuesta esperada del `MockAIProvider` está definida (fixture).
- Expectativas de observabilidad y auditoría están definidas (`AdminAction`, `AIRecommendation`).

---

## 24. Definition of done from testing perspective

Una historia se considera **terminada desde la perspectiva de pruebas** cuando:

- Se han agregado o actualizado pruebas unitarias.
- Se han agregado pruebas de integración y/o API donde corresponda.
- Se han agregado pruebas frontend donde corresponda.
- Se han cubierto los casos negativos de autorización.
- Si involucra IA, hay tests con `MockAIProvider`.
- Si el cambio toca un flujo crítico, el smoke E2E está actualizado.
- Si el cambio impacta el seed, el seed se actualizó y sigue siendo idempotente.
- La suite completa pasa sin regresiones.
- La documentación (FRD, API spec, seed) se actualizó cuando el comportamiento cambió.

---

## 25. Critical MVP test scenarios

### 25.1 Organizer flow

1. Register con captcha y login exitoso.
2. Crear evento con moneda inicial.
3. Generar plan IA (Mock) y aceptar resultado.
4. Generar checklist IA (Mock) y editar antes de aceptar.
5. Distribución de presupuesto IA (Mock), aceptar.
6. Buscar proveedores aprobados por categoría.
7. Enviar quote request a 2 proveedores.
8. Comparar cotizaciones con resumen IA (Mock).
9. Crear booking intent sobre cotización elegida.
10. Tras confirmación del proveedor, dejar review (rating 1–5).

### 25.2 Vendor flow

1. Register con captcha y login.
2. Crear perfil de proveedor y enviar a aprobación.
3. Bajo `pendingApproval`, no aparecer en listado público.
4. Tras aprobación admin, aparecer en listado público.
5. Gestionar servicios y portafolio.
6. Recibir quote request asignada (assignment-based access).
7. Responder cotización dentro del plazo de validez (15 días).
8. Confirmar booking intent.

### 25.3 Admin flow

1. Login admin.
2. Aprobar proveedor pendiente; `AdminAction` registrado.
3. Crear y administrar categorías (máx. 2 niveles).
4. Visualizar métricas básicas.
5. Moderar review reportada; `AdminAction` registrado.
6. Reset seed/demo si está habilitado.

### 25.4 AI flow

1. Generación de plan vía `MockAIProvider`.
2. `AIRecommendation` persiste con `promptVersion`, `provider`, `latencyMs`.
3. Aceptar / editar / rechazar la sugerencia.
4. Timeout simulado a 60s → error controlado y `fallbackUsed=true` cuando aplica.
5. JSON inválido del provider → error semántico, sin crash.

### 25.5 Security flow

1. Acceso anónimo a endpoint privado → 401.
2. Acceso con rol incorrecto → 403.
3. Acceso con ownership incorrecto → 403/404.
4. Vendor accede a quote no asignada → 403/404.
5. Register sin captcha → rechazado.
6. Login excede rate limit → 429.
7. Upload con MIME no permitido → 415.
8. Upload excede tamaño → 413.

---

## 26. Test data management

- **Fixtures** versionadas en repo, organizadas por dominio.
- **Seed** como mecanismo principal de población; sólo lo que la prueba necesite específicamente se crea ad-hoc.
- **Base de datos de prueba** efímera por suite (schema temporal o contenedor PostgreSQL desechable).
- **Aislamiento** entre pruebas: transacción por test cuando sea posible, o reset por suite.
- **Cleanup** automático al finalizar suite (drop schema o rollback).
- **Sin PII real**: nombres ficticios, emails `@example.com`, sin imágenes de personas reales.
- **IDs deterministas** donde aporta legibilidad (UUIDs fijos para usuarios demo).
- **Variables de entorno de test**: `NODE_ENV=test`, `AI_PROVIDER=mock`, `DATABASE_URL` apuntando a la BD de prueba, sin secretos productivos.

---

## 27. Environment strategy

| Entorno | Propósito | Proveedor IA | Base de datos | Notas |
|---|---|---|---|---|
| Local dev | Desarrollo cotidiano | `MockAIProvider` por defecto; `OpenAIProvider` opcional por env | PostgreSQL local | Seed disponible bajo demanda |
| Test | Ejecución de suite automatizada local y CI | `MockAIProvider` obligatorio | PostgreSQL efímero | Cleanup automático |
| CI | Ejecución de PR y pipelines | `MockAIProvider` obligatorio | PostgreSQL en contenedor | Sin secretos OpenAI |
| Demo | Sustento de la demo académica | `MockAIProvider` por defecto; `OpenAIProvider` opcional controlado | PostgreSQL con seed `is_seed=true` | Reset entre ensayos |
| Staging (opcional) | Validación previa a demo en entorno cercano a producción | `MockAIProvider` o `OpenAIProvider` controlado | PostgreSQL aislado | No requerido por MVP |

**Regla:** CI **nunca** ejecuta llamadas reales a proveedores de IA externos.

---

## 28. Tooling summary

| Área | Herramienta | Propósito | Requerido / Recomendado |
|---|---|---|---|
| Backend unit + integration | Vitest | Runner unificado de pruebas | Requerido |
| Frontend unit + integration | Vitest + Testing Library | Componentes y flujos | Requerido |
| API HTTP testing | Supertest | Endpoints Express | Requerido |
| E2E | Playwright | Flujos críticos en navegador | Requerido |
| API mocking en frontend | MSW | Mock alineado al contrato | Requerido |
| ORM y migraciones | Prisma | Validación y aplicación de migraciones | Requerido |
| Validación de schemas | Zod | Validación entrada/salida | Requerido |
| IA determinística | `MockAIProvider` | Pruebas de IA reproducibles | Requerido |
| IA real (opcional) | `OpenAIProvider` | Validación cualitativa manual | Opcional |
| Accesibilidad | axe-core | Aserciones a11y automatizadas | Recomendado |
| Cobertura | c8 / istanbul (vía Vitest) | Reporte de cobertura | Requerido |
| OpenAPI validation | herramienta de validación de schema | Asegurar drift detection si se publica OpenAPI | Opcional |
| Captura de logs en pruebas | pino-test / custom logger sink | Aserciones sobre logs estructurados | Recomendado |

---

## 29. Risks and mitigations

| Riesgo | Impacto | Mitigación | Responsable |
|---|---|---|---|
| Exceso de E2E provoca suite lenta y flaky | Bloqueo de merges, ruido | Limitar E2E a flujos demo y críticos | QA Architect |
| Salida IA no determinística rompe pruebas | Falsos positivos/negativos | `MockAIProvider` obligatorio en CI; tests sobre schema, no texto literal | AI Engineer |
| Gaps de autorización no detectados | Brechas reales de seguridad | Reglas: toda política exige caso negativo; revisión obligatoria en PR | Backend Engineer |
| Drift de seed | Tests pasan localmente, fallan en demo | CI ejecuta seed y verifica idempotencia | DevOps |
| MSW frontend desalineado del contrato real | Bugs invisibles hasta integración | Esquemas Zod compartidos backend/frontend; contract tests | Frontend Engineer |
| Constraints de BD no cubiertos | Bugs visibles sólo en producción | Pruebas de integración con BD real efímera | Backend Engineer |
| QA solo manual | Cobertura inconsistente y baja repetibilidad | Compuertas CI con cobertura mínima 60% | QA Architect |
| Baja cobertura de casos negativos | Falsa sensación de seguridad | Checklist DoD exige negativos | Tech Lead |
| Inconsistencia entre entorno demo y dev | Demo falla en vivo | Demo usa seed; ensayo previo obligatorio | Product Owner |
| Dependencia de OpenAI real en CI | Costos, rate limits, flakiness | `OPENAI_API_KEY` no presente en CI; mocks obligatorios | DevOps |
| Tests acumulan deuda sin mantenimiento | Suite ignorada con el tiempo | Política: tests rotos se reparan o eliminan, jamás `.skip` permanente | Tech Lead |

---

## 30. Out of scope testing

EventFlow MVP **no incluye** pruebas para los siguientes ámbitos:

- Procesamiento real de pagos / certificación PCI.
- Firma electrónica de contratos.
- Integración con WhatsApp, SMS, push notifications.
- Pruebas de aplicaciones móviles nativas (iOS/Android).
- Pruebas de chat en tiempo real.
- Pruebas de carga / estrés a escala enterprise.
- Pruebas de cumplimiento formal (SOC 2, ISO 27001, GDPR/LGPD formal).
- Escaneo antimalware en pipeline.
- Pruebas de RAG, búsqueda vectorial o agentes autónomos.
- Aislamiento multi-tenant.
- Comisiones, escrow o flujos transaccionales marketplace.
- Conversión automática de moneda.
- Moderación o aprobación autónoma por IA.

Cualquier prueba sobre estos ámbitos queda explícitamente **fuera del MVP** y debe revisarse en una fase post-MVP si el alcance se amplía.

---

## 31. Traceability matrix

| Área de testing | Documentos fuente | Referencias relacionadas | Evidencia esperada |
|---|---|---|---|
| Auth + sesión | 5, 19 | FR-AUTH, SEC-POL-AUTH, NFR-SEC | Tests Supertest 401/429/200, cookies con flags correctos |
| Autorización RBAC + ownership + assignment | 5, 6, 19 | SEC-POL-OWNER, SEC-POL-ASSIGN, SEC-POL-ADMIN | Tests positivos y negativos por endpoint |
| Reglas de negocio | 4, 8 | BR-EVENT-*, BR-QUOTE-*, BR-REVIEW-*, BR-VENDOR-* | Aserciones unit y API por regla |
| Casos de uso | 8, 8.1 | UC-* | Pruebas de integración o E2E por caso |
| IA features | 7, 17 | NFR-IA, BR-AI-HITL, prompt versioning | Tests Mock, persistencia `AIRecommendation`, timeout |
| API contract | 16 | DTOs, envelope, paginación | Tests Supertest + MSW alineado |
| BD + migraciones | 6, 18 | Constraints, soft delete, `is_seed` | Tests Prisma sobre BD efímera |
| Seed/demo | 11 | Idempotencia, reset | Tests de integración del seed |
| Seguridad operativa | 19 | Captcha, rate limit, MIME, payload | Tests API 400/415/413/429 |
| Observabilidad | 10, 19 | NFR-OBS, `AdminAction`, `AIRecommendation` | Aserciones sobre logs estructurados y registros |
| i18n + moneda | 2, 9 | FR-I18N, BR-EVENT-CURRENCY | Tests frontend y API |
| Accesibilidad | 10, 15 | NFR-A11Y mínimo | Tests Testing Library / Playwright |

> Las referencias específicas (FR-XXX, BR-XXX, UC-XXX, SEC-POL-XXX) se alinean con los documentos fuente. Cuando una referencia exacta no exista en los fuentes, se referencia al nivel del documento o módulo.

---

## 32. Testing roadmap

### 32.1 MVP Must Have

Requeridas antes de la entrega académica y la demo:

- Suite unit completa para use cases backend y políticas de dominio.
- Pruebas de integración para repositorios Prisma y use cases con BD.
- Pruebas API Supertest para todos los endpoints del MVP.
- Pruebas de autorización positivas y negativas para cada endpoint sensible.
- Pruebas frontend de componentes críticos con estados clave.
- Pruebas IA con `MockAIProvider` para cada feature IA.
- Smoke E2E Playwright para organizer / vendor / admin / IA / auth.
- Pruebas de seed (idempotencia, reset, `is_seed`).
- Compuertas CI: type check, lint, unit, integration, API, frontend, build, migraciones, seed, smoke E2E.

### 32.2 MVP Should Have

Útiles pero no bloqueantes:

- Pruebas de accesibilidad con axe-core integradas en CI.
- Pruebas de contrato OpenAPI si se publica spec.
- Cobertura por rama además de líneas.
- Test de visual regression para componentes claves (Chromatic / Playwright snapshots).
- Pruebas de smoke con `OpenAIProvider` real (opcional, manual).

### 32.3 Future

Después del MVP:

- Mutation testing dirigido (Stryker) sobre dominio crítico.
- Pruebas de carga ligeras (k6) para endpoints clave.
- Suite a11y completa según WCAG 2.1 AA.
- Pruebas de seguridad de aplicación (DAST/SAST básicos).
- Tests de migración con dataset productivo anonimizado.
- Pruebas de robustez sobre proveedores IA adicionales (Anthropic real).

---

## 33. Checklist de readiness del Testing Strategy

- [x] Módulos funcionales cubiertos (Auth, Users, Events, AI, Tasks, Budget, Vendors, Categories, Quotes, Booking, Reviews, Notifications, Admin, Attachments, Seed, i18n).
- [x] Estrategia de testing backend definida.
- [x] Estrategia de testing frontend definida.
- [x] Estrategia de testing API definida.
- [x] Estrategia de testing IA definida con `MockAIProvider` obligatorio.
- [x] Estrategia de testing de seguridad definida.
- [x] Estrategia de testing de autorización (positivos + negativos) definida.
- [x] Estrategia de testing de seed definida.
- [x] Estrategia de testing de base de datos definida.
- [x] Smoke E2E de demo definido.
- [x] Compuertas de calidad CI definidas.
- [x] Out-of-scope testing declarado explícitamente.
- [x] Matriz de trazabilidad incluida.
- [x] Riesgos identificados y mitigados.
- [x] Roadmap MVP / Should-Have / Future definido.

---

## 34. Conclusión

Esta estrategia de pruebas habilita a EventFlow para ser validado como un **MVP académico seguro, trazable, asistido por IA y demo-ready**, sin caer en la sobre-ingeniería de un programa QA enterprise. Combina una base sólida de pruebas unitarias sobre dominio y use cases, una capa media robusta de pruebas de API e integración (con autorización positiva y negativa obligatoria), pruebas IA estrictamente determinísticas mediante `MockAIProvider`, y una cúspide reducida pero estratégica de pruebas E2E sobre flujos críticos sembrados.

El backend permanece como **fuente de verdad** para reglas de negocio y autorización. La IA permanece **observable, validada por humano y nunca autónoma**. El seed garantiza **repetibilidad**. Las compuertas de CI garantizan **calidad mínima por PR**. La cobertura es métrica de soporte, no la única; la calidad real se mide por la presencia de casos negativos, por la fidelidad del contrato API y por la estabilidad del smoke demo.

Cumplido este documento, EventFlow tiene un marco claro y accionable para que QA, desarrollo, IA, DevOps y agentes IA generadores de pruebas trabajen alineados hacia un MVP entregable y defendible académicamente.
