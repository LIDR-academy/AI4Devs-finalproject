# EventFlow — AI Features Specification

> Documento formal de Especificación de Funcionalidades de IA del MVP
> Versión: 1.0
> Idioma: Español LATAM neutral
> Audiencia: Product Owner, AI Solutions Architect, Backend Engineer, Prompt Engineer, QA, Business Analyst, agentes IA generadores de FRD, user stories, contratos de API, prompts y casos de prueba
> Documentos fuente: `1-Domain-Discovery-Report.md`, `2-Product-Owner-Decisions.md`, `3-MVP-Scope-Definition.md`, `4-Business-Rules-Document.md`, `5-User-Roles-Permissions-Matrix.md`, `6-Domain-Data-Model.md`

---

## 1. Propósito del documento

Este documento define de forma estructurada, trazable y verificable las **funcionalidades de IA del MVP de EventFlow**. Su objetivo es:

- Consolidar el **catálogo de capacidades de IA** que dan soporte al MVP, distinguiendo qué se construye, qué se difiere y qué se excluye explícitamente.
- Servir como **fuente única de verdad de IA** para alimentar requisitos funcionales (FRD), user stories, criterios de aceptación, contratos de API, prompts versionados, servicios backend y casos de prueba.
- Definir los **inputs, outputs, validaciones humanas, reglas de persistencia y comportamientos de fallback** que toda funcionalidad de IA del MVP debe cumplir.
- Establecer la **estrategia de proveedor IA** (OpenAI principal, Anthropic opcional, MockAIProvider obligatorio) y la capa de abstracción `LLMProvider`.
- Mantener la coherencia con la decisión estratégica: EventFlow MVP es un **workspace de planificación asistido por IA**, no un marketplace transaccional ni un asistente conversacional libre.

El documento responde, de manera operativa, a seis preguntas:

1. ¿Qué funcionalidades de IA están dentro del alcance del MVP y cuáles no?
2. ¿Quién las usa, qué datos consumen y qué producen?
3. ¿Cómo se valida humanamente cada salida antes de volverse dato oficial?
4. ¿Cómo se persiste, audita y reproduce cada salida IA?
5. ¿Qué fallback aplica cuando el proveedor IA falla?
6. ¿Qué riesgos, métricas y criterios de aceptación gobiernan cada feature?

---

## 2. Alcance del documento

Este documento cubre la **dimensión funcional, de producto, de prompts, de proveedor y de calidad** de la IA en el MVP de EventFlow.

Incluye:

- Catálogo de features IA MVP, futuras y fuera de alcance.
- Roles y permisos sobre funcionalidades IA.
- Inputs requeridos, outputs esperados y estructuras JSON recomendadas.
- Reglas de validación humana, persistencia y trazabilidad.
- Estrategia de proveedor (OpenAI, Anthropic, MockAIProvider) y capa `LLMProvider`.
- Estrategia de prompts, versionado y multi-idioma.
- Reglas de fallback, errores y degradación.
- Seguridad, privacidad y manejo de datos sensibles.
- Métricas, criterios de aceptación y escenarios de QA.
- Roadmap IA post-MVP.

**Lo que este documento NO cubre:**

- Especificación técnica de implementación de backend (controladores, servicios concretos, DDL).
- Contratos OpenAPI formales (cubiertos por el documento de API).
- Diseño visual de pantallas (cubierto por el documento de UI/UX).
- Plan de pruebas detallado por endpoint (sí se incluyen escenarios QA críticos).
- Reglas de negocio en sí (cubiertas en `4-Business-Rules-Document.md`).

---

## 3. Fuentes utilizadas

| # | Documento | Uso principal |
|---:|---|---|
| 1 | `/docs/1-Domain-Discovery-Report.md` | Oportunidades de IA (§10), procesos de planificación (§6.2 a §6.10), pain points (§2.6, §2.7), regla transversal IA (§8.12), riesgos IA (§11). |
| 2 | `/docs/2-Product-Owner-Decisions.md` | Decisión de proveedor LLM (OpenAI + Anthropic + MockAIProvider, §4.1), branding premium, idiomas, moneda, datos seed, exclusión de moderación automática y análisis de sentimiento (§3, §12). |
| 3 | `/docs/3-MVP-Scope-Definition.md` | Features IA MVP (§8.1), features IA diferidas (§8.2), reglas de validación humana (§8.3), fallback y MockAIProvider (§8.4), riesgos IA (§8.5), flujo IA (§11.4). |
| 4 | `/docs/4-Business-Rules-Document.md` | Reglas BR-AI-001 a BR-AI-015 (planificación IA), BR-VENDOR-008 (bio IA opcional), BR-QUOTE-023/024 (resumen IA comparador), BR-REVIEW-006 (sin moderación IA), BR-OOS-007/008/016/018 (IA fuera de alcance), BR-FUTURE-008/009/012/013/015 (IA futura). |
| 5 | `/docs/5-User-Roles-Permissions-Matrix.md` | Permisos por rol sobre `AIRecommendation` (§9.16), sobre `EventTask`/`Budget`/`QuoteRequest` generados por IA, regla de aislamiento y trazabilidad (§10), reglas de permisos del organizador y proveedor sobre IA. |
| 6 | `/docs/6-Domain-Data-Model.md` | Entidad `AIRecommendation` (§11), entidad recomendada `AIPromptVersion` (§12), flags `ai_generated` en `EventTask`, `BudgetItem`, `QuoteRequest`, `VendorProfile`, `VendorService`. |

Toda funcionalidad IA aquí documentada se deriva o cita explícitamente de uno o más de estos documentos. Cuando una capacidad no aparece de forma explícita pero se infiere de manera razonable, se marca como **Derived**, **Assumption** o **Recommended**. Capacidades futuras o fuera de alcance se marcan como **Future** o **Out of Scope**.

---

## 4. Principios de uso de IA en EventFlow

Los siguientes principios actúan como **filtro transversal** para cualquier funcionalidad IA del MVP. Todos están alineados con la regla crítica BR-AI-001 a BR-AI-014 y con los principios de alcance del MVP (Doc 3, §4).

1. **Human-in-the-loop obligatorio.** Toda salida IA es una **sugerencia editable**; nunca se convierte en dato oficial del evento sin confirmación humana explícita (BR-AI-001).
2. **IA asistiva, no autónoma.** La IA apoya la planificación y la decisión, pero no contrata proveedores, no procesa pagos, no firma contratos, no aprueba proveedores y no modera reseñas de forma autónoma (BR-AI-004).
3. **Outputs editables.** Plan, checklist, presupuesto, brief, resumen comparativo, bio del proveedor y mensajes generados por IA son íntegramente editables antes de su confirmación (BR-AI-002).
4. **Trazabilidad completa.** Cada llamada IA se persiste como `AIRecommendation` con `type`, `llm_provider`, `prompt_version_id`, `language_code`, `input_payload`, `output_payload`, `accepted`, `edited` y `fallback_used` (BR-AI-007, BR-AI-010).
5. **Fallback obligatorio.** Si el proveedor LLM falla, supera el timeout o devuelve un payload inválido, el sistema degrada a plantillas estáticas y/o `MockAIProvider`, sin bloquear el flujo (BR-AI-009).
6. **Provider abstraction.** Toda llamada IA pasa por la interfaz `LLMProvider`, con implementaciones `OpenAIProvider` (principal), `MockAIProvider` (obligatorio) y `AnthropicProvider` (opcional/preparado) — BR-AI-005.
7. **Mínima recolección de datos.** Los prompts solo reciben los datos estrictamente necesarios para la tarea. No se envían medios de pago, números de identificación, contactos completos ni contenido legal.
8. **Sin automatización de alto riesgo.** No hay moderación automática, ni aprobación automática de proveedores, ni decisiones de booking, ni inferencias vinculantes sobre quién contratar (BR-AI-004, BR-REVIEW-006, BR-OOS-007/008).
9. **Foco en la cuña de producto.** El diferenciador es **convertir una idea de evento en un plan accionable en minutos**; las features IA del MVP se concentran en este vector.
10. **Multi-idioma desde el día uno.** Las salidas IA respetan el idioma del evento o del usuario; los prompts reciben el idioma como parámetro (BR-AI-011, BR-I18N-007).
11. **Sin chat libre conversacional.** La IA opera por features acotadas (plan, checklist, presupuesto, brief, comparación, bio, priorización). No hay chatbot de propósito general (BR-AI-014, BR-OOS-018).
12. **Sin generación de imágenes con IA.** El MVP no incluye generación de imágenes, decoración ni assets visuales (BR-AI-015, BR-OOS-016).

---

## 5. Metodología de extracción de features IA

El catálogo IA se construye siguiendo el flujo:

```text
Lectura → Extracción → Clasificación → Validación → Especificación
```

1. **Lectura:** se leen integralmente los 6 documentos fuente.
2. **Extracción:** se identifican candidatos a funcionalidad IA, ya sea por:
   - Mención explícita (e.g., Doc 3 §8.1, Doc 1 §10).
   - Derivación por flujo de negocio (e.g., generación de brief, comparación de cotizaciones).
   - Inferencia por reglas (BR-AI-*, BR-VENDOR-008, BR-QUOTE-023).
   - Soporte por el modelo de datos (`AIRecommendation.type`).
3. **Clasificación:** cada candidato se etiqueta por:
   - **Scope:** MVP, Future, Out of Scope.
   - **Source type:** Explicit, Derived, Assumption, Recommended.
   - **Priority:** Must Have, Should Have, Could Have, Future.
   - **Owner role:** Organizer, Vendor, Admin, System.
4. **Validación:** se contrasta cada candidato contra:
   - Alcance MVP (Doc 3) y reglas de negocio (BR-*).
   - Matriz de permisos por rol (Doc 5).
   - Entidades del modelo de datos (Doc 6).
   - Decisiones del Product Owner (Doc 2).
5. **Especificación:** se documentan inputs, outputs, JSON, validación humana, persistencia, prompt strategy, fallback, riesgos y criterios de aceptación.

---

## 6. AI Feature Extraction from Source Documents

Tabla de extracción de candidatos a funcionalidad IA derivada del análisis de los documentos fuente. Esta tabla precede a la definición final de features MVP.

| # | Candidate AI Feature | Found in source document | Evidence / context | Classification | MVP decision |
|---:|---|---|---|---|---|
| 1 | Generación de plan de evento | Doc 1 §10 (caso 1), Doc 3 §7.3, §8.1, Doc 4 BR-AI-001 a BR-AI-008, Doc 6 `AIRecommendation.type=event_plan` | Cuña principal del producto. Convierte datos básicos en timeline + categorías sugeridas. | Explicit | MVP |
| 2 | Generación de checklist | Doc 1 §6.3, §10 (caso 2), Doc 3 §7.4, §8.1, Doc 4 BR-TASK-002/003/006, Doc 6 `AIRecommendation.type=checklist`, `EventTask.ai_generated` | Tareas con fechas relativas (T-180, T-90, T-30, T-7, T-1) basadas en el tipo de evento. | Explicit | MVP |
| 3 | Sugerencia de distribución de presupuesto | Doc 1 §6.4, §10 (caso 3), Doc 3 §7.5, §8.1, Doc 4 BR-BUDGET-008, Doc 6 `AIRecommendation.type=budget_suggestion`, `BudgetItem.ai_generated` | Distribuye total entre categorías a partir de tipo, invitados y ciudad. | Explicit | MVP |
| 4 | Recomendación de categorías de proveedor | Doc 1 §10 (caso 4), Doc 3 §8.1, Doc 6 `AIRecommendation.type=vendor_categories` | Sugiere qué categorías son necesarias para el evento (must / should / optional). | Explicit | MVP |
| 5 | Generación de brief de cotización | Doc 1 §10 (caso 6), Doc 3 §7.8, §8.1, Doc 4 BR-QUOTE-002, BR-AI-002, Doc 6 `AIRecommendation.type=quote_brief`, `QuoteRequest.ai_generated_brief` | Autocompleta brief estructurado a partir de datos del evento. | Explicit | MVP |
| 6 | Resumen comparativo de cotizaciones | Doc 1 §6.8, §10 (caso 5), Doc 3 §7.10, §8.1, Doc 4 BR-QUOTE-023/024, Doc 6 `AIRecommendation.type=quote_comparison` | Identifica diferencias clave entre `Quotes` recibidas; no decide. | Explicit | MVP (Should Have) |
| 7 | Generación de bio / descripción de paquetes del proveedor | Doc 1 §10 (caso 7), Doc 3 §7.7, §8.1, Doc 4 BR-VENDOR-008, Doc 6 `VendorProfile.ai_generated_bio`, `VendorService.ai_generated_description`, `AIRecommendation.type=vendor_bio` | Apoya onboarding del proveedor; opcional y editable. | Explicit | MVP (Could Have) |
| 8 | Priorización de tareas urgentes | Doc 1 §10 (caso 8), Doc 3 §8.1, Doc 6 `AIRecommendation.type=task_prioritization` | Sugiere top 3 acciones urgentes según estado del checklist y cercanía del evento. | Explicit | MVP (Should Have) |
| 9 | Generación de mensajes / comunicación | Doc 1 §6.6, Doc 3 §8 implícito (brief), Doc 4 BR-AI-002 (editabilidad) | Mensaje editable para comunicación organizador↔proveedor. La validación checklist menciona AI message generation, pero los documentos fuente solo soportan brief y resumen comparativo como mensajería estructurada. | Assumption | Future (no soportado como feature independiente en MVP) |
| 10 | Recomendación de proveedores específicos | Doc 1 §10 (caso 11), Doc 3 §8.2, Doc 4 BR-FUTURE-012 | Requiere data real y feedback loop. | Explicit | Future |
| 11 | Resumen ejecutivo del evento | Doc 1 §10 (caso 9), Doc 3 §8.2, Doc 4 BR-FUTURE-013 | Bajo valor para MVP. | Explicit | Future |
| 12 | Detección de inconsistencias presupuesto vs cotizaciones | Doc 1 §10 (caso 10), Doc 3 §8.2, Doc 4 BR-FUTURE-015 | Futuro; coste de implementación moderado. | Explicit | Future |
| 13 | Análisis de sentimiento de reseñas | Doc 2 §3 (decisión 13), Doc 3 §8.2, Doc 4 BR-OOS-007, BR-FUTURE-008, Doc 5 §9.14 | PO difiere explícitamente. | Explicit | Out of Scope (Future) |
| 14 | Moderación automática de reseñas con IA | Doc 2 §12, Doc 3 §8.2, Doc 4 BR-REVIEW-006, BR-OOS-008, BR-FUTURE-009 | Admin modera manualmente en MVP. | Explicit | Out of Scope (Future) |
| 15 | Detección de fraude | No mencionado en docs fuente; se infiere por riesgo del Doc 1 §11 | No hay soporte ni decisión PO. | Assumption | Out of Scope |
| 16 | Recomendación de precios de mercado | Doc 1 §11 (riesgo de alucinación de precios) | El sistema evita explícitamente que IA invente precios. | Derived (riesgo) | Out of Scope |
| 17 | Chatbot conversacional para organizadores | Doc 4 BR-AI-014, BR-OOS-018 | Excluido explícitamente del MVP. | Explicit | Out of Scope |
| 18 | Chatbot conversacional para proveedores | Doc 4 BR-AI-014, BR-OOS-018 | Excluido explícitamente del MVP. | Explicit | Out of Scope |
| 19 | Asistente IA por WhatsApp | Doc 2 §3 (decisión 8), Doc 3 §9, Doc 4 BR-OOS-004, BR-NOTIF-006 | WhatsApp fuera de alcance MVP. | Explicit | Out of Scope |
| 20 | Decisión autónoma de booking | Doc 4 BR-AI-004, BR-BOOKING-002 | Confirmación bilateral humana obligatoria. | Explicit | Out of Scope |
| 21 | Decisión autónoma de pago | Doc 4 BR-OOS-001, BR-BOOKING-004 | Sin pagos reales. | Explicit | Out of Scope |
| 22 | Aprobación autónoma de proveedores | Doc 4 BR-VENDOR-006, BR-ADMIN-001, BR-OOS-009 | Aprobación 100% manual del admin. | Explicit | Out of Scope |
| 23 | Generación autónoma de contratos | Doc 4 BR-OOS-003 | Sin contratos digitales. | Explicit | Out of Scope |
| 24 | Generación de imágenes/decoración con IA | Doc 3 §8.2, Doc 4 BR-AI-015, BR-OOS-016 | Excluido del MVP. | Explicit | Out of Scope |
| 25 | Voice/audio assistants | Doc 3 §8.2 | Excluido del MVP. | Explicit | Out of Scope |
| 26 | Matching IA proveedores↔organizador con ranking | Doc 1 §10 (caso 11), Doc 4 BR-FUTURE-012 | Requiere data y feedback loop. | Explicit | Future |

Resultado de la extracción: **8 features IA quedan dentro del MVP** (5 Must Have, 2 Should Have, 1 Could Have), **5 quedan como Future**, **11 quedan como Out of Scope**.

---

## 7. Resumen ejecutivo de IA en el MVP

EventFlow MVP integra IA como **copiloto sugerente** sobre los puntos de mayor fricción del flujo de planificación de eventos. La IA del MVP cumple cinco funciones:

1. **Convertir una idea suelta en un plan accionable** (plan + checklist + categorías sugeridas) en minutos.
2. **Acelerar la estructuración del presupuesto** con una distribución sugerida editable.
3. **Estandarizar la conversación con proveedores** mediante un brief autocompletado y un resumen comparativo de cotizaciones.
4. **Facilitar el onboarding del proveedor** con generación opcional de bio y descripciones de paquetes.
5. **Reducir el estrés del organizador en la recta final** priorizando tareas urgentes.

Toda salida IA respeta tres condiciones no negociables:

- Es **siempre sugerencia**, nunca decisión oficial sin confirmación humana.
- Es **editable** y trazable como `AIRecommendation`.
- Tiene **fallback** (plantillas estáticas o `MockAIProvider`) cuando el proveedor LLM no responde.

**Capa técnica:** interfaz `LLMProvider` con `OpenAIProvider` (principal), `MockAIProvider` (obligatorio para demo y tests) y `AnthropicProvider` (opcional/preparado). Prompts versionados, cacheo por plantilla y selección por configuración (`env var`).

**Lo que la IA del MVP NO hace:** no modera reseñas, no analiza sentimiento, no contrata, no paga, no firma, no chatea libre, no decide por el usuario, no aprueba proveedores, no genera imágenes ni intercambia mensajes con WhatsApp.

---

## 8. AI Features incluidas en el MVP

| # | ID | Feature | Prioridad | Rol principal | Doc fuente principal |
|---:|---|---|---|---|---|
| 1 | AI-001 | Generación de plan de evento | Must Have | Organizer | Doc 1 §10 c1, Doc 3 §8.1 |
| 2 | AI-002 | Generación de checklist | Must Have | Organizer | Doc 1 §10 c2, Doc 3 §8.1 |
| 3 | AI-003 | Sugerencia de distribución de presupuesto | Must Have | Organizer | Doc 1 §10 c3, Doc 3 §8.1 |
| 4 | AI-004 | Recomendación de categorías de proveedor | Must Have | Organizer | Doc 1 §10 c4, Doc 3 §8.1 |
| 5 | AI-005 | Generación de brief de cotización | Must Have | Organizer | Doc 1 §10 c6, Doc 3 §8.1 |
| 6 | AI-006 | Resumen comparativo de cotizaciones | Should Have | Organizer | Doc 3 §8.1, BR-QUOTE-023 |
| 7 | AI-007 | Generación de bio y paquetes del proveedor | Could Have | Vendor | Doc 3 §8.1, BR-VENDOR-008 |
| 8 | AI-008 | Priorización de tareas urgentes | Should Have | Organizer | Doc 1 §10 c8, Doc 3 §8.1 |

> Todas las features anteriores se modelan en `AIRecommendation.type` (Doc 6, §11), comparten la regla de validación humana BR-AI-001 y la regla de trazabilidad BR-AI-007.

---

## 9. AI Features futuras o fuera de alcance

### 9.1 Resumen

| Feature | Clasificación | Motivo principal | Fuente |
|---|---|---|---|
| Resumen ejecutivo del evento | Future | Bajo valor para MVP; útil cuando hay más datos por evento. | Doc 3 §8.2, BR-FUTURE-013 |
| Detección de inconsistencias presupuesto vs cotizaciones | Future | Implementable post-MVP cuando haya histórico. | BR-FUTURE-015 |
| Recomendaciones IA de proveedores específicos (ranking) | Future | Requiere data real y feedback loop. | BR-FUTURE-012 |
| Generación de mensajes libres entre organizador y proveedor | Future | Sustituible por brief + email simulado en MVP. | Inferido del catálogo de validación |
| Análisis de sentimiento de reseñas | Future / Out of Scope | Decisión PO: difiere análisis IA sobre reseñas. | BR-OOS-007, BR-FUTURE-008 |
| Moderación automática de reseñas con IA | Future / Out of Scope | Admin modera manualmente. | BR-REVIEW-006, BR-OOS-008, BR-FUTURE-009 |
| Detección de fraude con IA | Out of Scope | Sin soporte documental; riesgo identificado pero no abordable con IA en MVP. | Doc 1 §11 (riesgo) |
| Recomendación IA de precios "de mercado" | Out of Scope | EventFlow evita alucinar precios; los precios provienen de `Quote`. | Doc 1 §11 |
| Chatbot conversacional libre | Out of Scope | BR-AI-014: la IA opera por features acotadas. | BR-OOS-018 |
| WhatsApp AI assistant | Out of Scope | WhatsApp completo está fuera del MVP. | BR-OOS-004, BR-NOTIF-006 |
| Decisión autónoma de booking | Out of Scope | Confirmación bilateral humana obligatoria. | BR-AI-004, BR-BOOKING-002 |
| Decisión autónoma de pago | Out of Scope | MVP no procesa pagos reales. | BR-OOS-001 |
| Aprobación autónoma de proveedores | Out of Scope | Curaduría 100% manual del admin. | BR-VENDOR-006, BR-ADMIN-001 |
| Generación autónoma de contratos | Out of Scope | Sin contratos digitales en MVP. | BR-OOS-003 |
| Generación de imágenes/decoración con IA | Out of Scope | Excluido explícitamente. | BR-AI-015, BR-OOS-016 |
| Voice/audio assistants | Out of Scope | No definido en alcance. | Doc 3 §8.2 |

### 9.2 Justificación por feature

- **Resumen ejecutivo del evento (Future):** poco diferencial frente al dashboard; revaluar en v1.1. Requeriría ampliar `AIRecommendation.type` con `event_summary`.
- **Detección de inconsistencias (Future):** valioso cuando haya histórico de uso. Requiere reglas de reconciliación entre `Budget.committed` y `Quote.total_price`.
- **Matching IA de proveedores específicos (Future):** sin volumen real de bookings y reseñas, el ranking no es confiable.
- **Sentimiento / Moderación / Fraude (Out of Scope):** decisión expresa del PO (Doc 2 §3 fila 13, §12) y de los documentos de scope/reglas.
- **Pricing / Booking / Pago / Contrato / Aprobación autónomos (Out of Scope):** contradicen BR-AI-004, BR-BOOKING-002, BR-BOOKING-004, BR-BOOKING-005, BR-OOS-001, BR-OOS-002, BR-OOS-003, BR-VENDOR-006.
- **Chatbot libre / WhatsApp / Voice (Out of Scope):** exceden la cuña del MVP y contradicen BR-AI-014, BR-OOS-018, BR-OOS-004.

---

## 10. Catálogo detallado de AI Features MVP

### AI-001 — Generación de plan de evento

#### Descripción
Convierte los datos básicos de un `Event` recién creado en un **plan estructurado** compuesto por: timeline macro con fases, categorías de proveedor sugeridas con prioridad, próximas acciones recomendadas y advertencias relevantes.

#### Problema que resuelve
JTBD del organizador #1 (Doc 1 §5.1): "Cuando me entero de que voy a organizar un evento importante, quiero entender qué pasos seguir y en qué orden, para no sentirme perdida y empezar con confianza." Pain point principal: "No saber por dónde empezar" (Doc 1 §2.6 punto 1).

#### Usuario principal
Organizer.

#### Clasificación
- **Scope:** MVP
- **Priority:** Must Have
- **Source type:** Explicit (Doc 1 §10 caso 1, Doc 3 §8.1)

#### Input requerido

| Input | Type suggestion | Required | Source | Notes |
|---|---|---|---|---|
| event_type_code | enum (`wedding`, `xv`, `baptism`, `baby_shower`, `birthday`, `corporate`) | Sí | `Event.event_type_code` | BR-EVENTTYPE-001 |
| event_date | date | Sí | `Event.event_date` | Define ventana de planificación |
| guests_count | integer | Sí | `Event.guests_count` | Influye en categorías y presupuesto |
| location.country_code + city | string + string | Sí | `Location` | Contexto cultural |
| estimated_budget | decimal | Sí | `Event.estimated_budget` | Influye en priorización de categorías |
| currency_code | enum | Sí | `Event.currency_code` | Para mostrar montos, sin conversión |
| language_code | enum (`es-LATAM`, `es-ES`, `pt`, `en`) | Sí | `Event.language_code` | BR-AI-011, BR-I18N-007 |
| style_preferences | string (libre) | No | Notas del organizador | Opcional |

#### Output esperado

| Output | Type suggestion | Required | Description | Persisted? |
|---|---|---|---|---|
| summary | string | Sí | Resumen ejecutivo del plan. | Sí (en `AIRecommendation.output_payload`) |
| phases | array | Sí | Fases del timeline con timing relativo. | Sí (en payload) |
| recommended_vendor_categories | array | Sí | Categorías sugeridas con prioridad y razón. | Sí (puede semilla `vendor_categories` posterior) |
| warnings | array | No | Advertencias (presupuesto ajustado, fecha cercana, etc.). | Sí |

#### Estructura JSON recomendada

```json
{
  "summary": "Plan para boda de 120 invitados en Ciudad de Guatemala con presupuesto medio.",
  "phases": [
    {
      "name": "Definición y reservas clave",
      "description": "Asegurar salón, catering y fotografía.",
      "relative_timing": "T-180 a T-120",
      "recommended_actions": [
        "Cerrar venue",
        "Solicitar 3 cotizaciones de catering",
        "Reservar fotógrafo"
      ]
    },
    {
      "name": "Detalles y proveedores secundarios",
      "description": "Música, decoración, pastel, transporte.",
      "relative_timing": "T-120 a T-60",
      "recommended_actions": [
        "Confirmar DJ y hora loca",
        "Definir decoración y mobiliario",
        "Probar pastel y mesa de dulces"
      ]
    }
  ],
  "recommended_vendor_categories": [
    {"category": "venue", "priority": "must_have", "reason": "Define la fecha y la capacidad."},
    {"category": "catering", "priority": "must_have", "reason": "Mayor peso en el presupuesto."},
    {"category": "photography", "priority": "should_have", "reason": "Alta carga emocional del evento."},
    {"category": "dj_music", "priority": "should_have", "reason": "Define el ambiente."},
    {"category": "decor", "priority": "optional", "reason": "Depende del estilo elegido."}
  ],
  "warnings": [
    "El presupuesto estimado puede ser ajustado para 120 invitados; revisar categoría catering."
  ]
}
```

#### Reglas de validación humana
- El organizador debe ver el plan en una vista de revisión con badge "Sugerido por IA" (BR-AI-003).
- Puede **aceptar** el plan completo, **editar** cualquier fase o categoría sugerida, **regenerar** o **rechazar** (BR-AI-002).
- Solo al aceptar, el sistema persiste:
  - `EventTask` derivadas (vía AI-002 Checklist).
  - `BudgetItem` derivadas (vía AI-003 Budget Suggestion).
  - Marca `AIRecommendation.accepted = true` (BR-AI-001).
- Si el usuario no hace nada, el plan permanece como sugerencia visible pero sin impacto en datos oficiales.

#### Reglas de persistencia
- Cada generación crea un registro en `AIRecommendation` con `type = "event_plan"`, `accepted = false` por defecto (BR-AI-007).
- Una vez aceptado, se actualiza `accepted = true`, `accepted_at`, `edited` si el usuario editó el output.
- Las entidades derivadas (tareas, presupuesto) llevan `ai_generated = true` y `ai_recommendation_id` referenciando la recomendación origen (BR-AI-008).
- La salida IA **no sobrescribe** datos existentes; en cada regeneración se crea un nuevo `AIRecommendation`.

#### Dependencias del modelo de datos
`Event`, `EventType`, `Location`, `AIRecommendation`, `AIPromptVersion`, `EventTask` (si el plan se materializa), `BudgetItem` (si el plan se materializa), `ServiceCategory` (para categorías recomendadas).

#### Prompt strategy
- Plantilla específica por `event_type_code` y por idioma.
- Contexto cultural LATAM cuando aplique (XV años, padrinos, hora loca, mariachi/marimba, candy bar) — BR-EVENTTYPE-004.
- Instrucción de devolver **JSON estricto** con el schema definido.
- Restricción explícita: "no inventes proveedores específicos ni precios; sugiere categorías y rangos cualitativos".
- Recordatorio de validación humana: incluir nota "Este plan es una sugerencia editable".
- Versión del prompt registrada en `AIPromptVersion` (BR-AI-010).

#### Fallback behavior
- **Timeout o error del proveedor:** degrada a plantilla estática por `event_type_code` (curada en código/seed) y muestra mensaje "Plan generado a partir de plantilla base".
- **JSON inválido:** reintento único; si vuelve a fallar, fallback a plantilla.
- **`MockAIProvider` activo:** devuelve plan determinista por tipo de evento.

#### Errores esperados
- `LLM_UNAVAILABLE`: degrada a plantilla.
- `LLM_TIMEOUT`: degrada a plantilla.
- `INVALID_JSON`: reintenta una vez, luego plantilla.
- `MISSING_INPUT`: 400 con mensaje claro al usuario.
- `UNSUPPORTED_LANGUAGE`: forzar `es-LATAM` y advertir al usuario.

#### Riesgos
- Alucinación de fases irrelevantes para el tipo de evento.
- Plan no culturalmente coherente (e.g., omitir padrinos en boda).
- Output excesivamente largo que afecta UX.

#### Criterios de aceptación
1. Dado un evento con `type`, `date`, `guests_count`, `location`, `budget`, `currency` y `language` válidos, cuando el organizador solicita el plan, entonces el sistema devuelve un JSON con `summary`, `phases`, `recommended_vendor_categories` y `warnings`.
2. La respuesta respeta el idioma del evento.
3. El plan no sugiere proveedores específicos por nombre.
4. La respuesta se persiste como `AIRecommendation(type="event_plan", accepted=false)`.
5. Al aceptar el plan, las entidades derivadas (si se materializan tareas o budget) llevan `ai_generated=true`.
6. Si el proveedor LLM falla, el sistema responde con plantilla estática y notifica al usuario.

---

### AI-002 — Generación de checklist

#### Descripción
Produce una **lista de tareas accionables** con fechas relativas (`T-180`, `T-90`, `T-30`, `T-7`, `T-1`) para el evento. Cada tarea tiene título, descripción, categoría sugerida, prioridad y origen IA.

#### Problema que resuelve
JTBD #3 (Doc 1 §5.1): "Quiero una checklist viva y con recordatorios para no olvidar tareas críticas". Pain point: "No olvidar rubros" (Doc 1 §2.6 punto 3).

#### Usuario principal
Organizer.

#### Clasificación
- **Scope:** MVP
- **Priority:** Must Have
- **Source type:** Explicit (Doc 1 §6.3, §10 caso 2; Doc 3 §7.4, §8.1)

#### Input requerido

| Input | Type suggestion | Required | Source | Notes |
|---|---|---|---|---|
| event_type_code | enum | Sí | `Event.event_type_code` | Plantilla base |
| event_date | date | Sí | `Event.event_date` | Para calcular fechas absolutas |
| guests_count | integer | Sí | `Event.guests_count` | Influye en granularidad |
| event_plan (opcional) | json | No | Plan aceptado previamente (AI-001) | Mejora coherencia |
| language_code | enum | Sí | `Event.language_code` | BR-AI-011 |
| budget_summary | object | No | `Budget` agregado | Permite priorizar tareas costosas |

#### Output esperado

| Output | Type suggestion | Required | Description | Persisted? |
|---|---|---|---|---|
| tasks | array | Sí | Lista de tareas con timing relativo. | Sí (`AIRecommendation.output_payload`) |
| tasks[].title | string | Sí | Título corto y accionable. | Pasa a `EventTask.title` al aceptar |
| tasks[].description | string | No | Detalle adicional. | Pasa a `EventTask.description` |
| tasks[].category | string | No | Categoría sugerida. | Pasa a `EventTask.category_hint` |
| tasks[].relative_due_date | string (`T-90`, etc.) | Sí | Offset relativo al evento. | Convertido a `EventTask.due_date` y `relative_offset_days` |
| tasks[].priority | enum (`low`, `medium`, `high`) | Sí | Prioridad sugerida. | UX/orden |
| tasks[].source | constante `"ai"` | Sí | Origen IA. | Determina `EventTask.ai_generated = true` |

#### Estructura JSON recomendada

```json
{
  "tasks": [
    {
      "title": "Cerrar reserva del salón",
      "description": "Confirmar contrato y anticipo con el venue elegido.",
      "category": "venue",
      "relative_due_date": "T-150",
      "priority": "high",
      "source": "ai"
    },
    {
      "title": "Probar menú con catering",
      "description": "Agendar degustación con 1 o 2 proveedores finalistas.",
      "category": "catering",
      "relative_due_date": "T-90",
      "priority": "medium",
      "source": "ai"
    },
    {
      "title": "Confirmar hora loca y playlist con DJ",
      "description": "Coordinar momento de la hora loca y canciones clave.",
      "category": "dj_music",
      "relative_due_date": "T-21",
      "priority": "medium",
      "source": "ai"
    }
  ]
}
```

#### Reglas de validación humana
- Cada tarea aparece marcada como "Sugerido por IA" (BR-AI-003).
- El organizador puede **aceptar en bloque**, **aceptar individualmente**, **editar** título, descripción, fecha o prioridad, o **rechazar** tareas (BR-TASK-003, BR-TASK-005).
- Las tareas aceptadas pasan a `EventTask` con `status="pending"`, `ai_generated=true`, `ai_recommendation_id` referenciado.
- Si el usuario no acepta, las tareas permanecen como sugerencia no vinculante.

#### Reglas de persistencia
- `AIRecommendation.type = "checklist"` con `output_payload` completo.
- `EventTask.due_date` se calcula como `event_date + relative_offset_days` (BR-TASK-006). Si se modifica `event_date`, las fechas absolutas se recalculan (Doc 6, notas EventTask).
- Si una tarea generada por IA no es aceptada, no se crea registro en `EventTask`.

#### Dependencias del modelo de datos
`Event`, `EventTask`, `AIRecommendation`, `ServiceCategory` (para `category_hint`).

#### Prompt strategy
- Plantilla por tipo de evento + idioma.
- Granularidad ajustable según `guests_count` (más tareas para eventos grandes).
- Instrucción: "evita duplicar tareas; usa máximo 25 tareas por defecto".
- Restricción cultural: incluir `padrinos` en bodas, `padrinos del bautizo` en bautizo, `hora loca` y `marimba/mariachi` en bodas y XV (LATAM).
- JSON estricto.

#### Fallback behavior
- **LLM falla:** usar checklist estática por `event_type_code` (plantilla en código/seed).
- **JSON inválido:** reintento único, luego plantilla.
- **`MockAIProvider`:** lista determinista por tipo de evento.

#### Errores esperados
- `LLM_UNAVAILABLE`, `LLM_TIMEOUT`, `INVALID_JSON`, `MISSING_INPUT`.
- `EMPTY_TASKS`: si el output viene vacío, fallback a plantilla.

#### Riesgos
- Lista demasiado larga o demasiado corta para el tipo de evento.
- Fechas relativas incoherentes (e.g., `T-1` para "reservar salón").
- Olvido de tareas culturales LATAM.

#### Criterios de aceptación
1. Dado un evento con datos válidos, cuando el organizador solicita la checklist, entonces el sistema devuelve un JSON con array `tasks` con al menos 8 elementos.
2. Cada tarea tiene `title`, `relative_due_date` y `priority`.
3. Al aceptar tareas individualmente, solo las aceptadas se persisten como `EventTask` con `ai_generated=true`.
4. Si se modifica la fecha del evento, las `due_date` absolutas se recalculan a partir del offset.
5. Si la generación falla, el sistema entrega la plantilla estática y muestra fallback.

---

### AI-003 — Sugerencia de distribución de presupuesto

#### Descripción
Distribuye el presupuesto total del evento entre **categorías de servicio**, devolviendo monto sugerido, porcentaje, prioridad y razón por cada categoría, más advertencias si el presupuesto luce ajustado para el tamaño del evento.

#### Problema que resuelve
JTBD #2 (Doc 1 §5.1): "Cuando defino el monto que puedo gastar, quiero un presupuesto realista por categoría". Pain point principal: "Estimar presupuesto realista" (Doc 1 §2.6 punto 2).

#### Usuario principal
Organizer.

#### Clasificación
- **Scope:** MVP
- **Priority:** Must Have
- **Source type:** Explicit (Doc 1 §10 caso 3, Doc 3 §8.1, BR-BUDGET-008)

#### Input requerido

| Input | Type suggestion | Required | Source | Notes |
|---|---|---|---|---|
| event_type_code | enum | Sí | `Event` | Plantilla por tipo |
| total_budget | decimal | Sí | `Event.estimated_budget` | Base de distribución |
| currency_code | enum | Sí | `Event.currency_code` | Sin conversión (BR-BUDGET-007) |
| guests_count | integer | Sí | `Event` | Ajusta categorías por persona |
| location | object | Sí | `Location` | Contexto cualitativo, no precios reales |
| categories_hint | array | No | Categorías ya recomendadas (AI-004) | Mejora coherencia |
| language_code | enum | Sí | `Event` | BR-AI-011 |

#### Output esperado

| Output | Type suggestion | Required | Description | Persisted? |
|---|---|---|---|---|
| currency | string | Sí | Espejo de `currency_code`. | Sí |
| total_budget | decimal | Sí | Espejo del input. | Sí |
| items | array | Sí | Distribución por categoría. | Sí (al aceptar → `BudgetItem`) |
| items[].category | string (slug) | Sí | Coincide con `ServiceCategory.code`. | Persistido |
| items[].suggested_amount | decimal | Sí | Monto sugerido. | → `BudgetItem.planned` |
| items[].percentage | decimal | Sí | % del total. | Solo en payload |
| items[].priority | enum (`must_have`, `should_have`, `optional`) | Sí | Prioridad sugerida. | Solo en payload |
| items[].reason | string | No | Justificación corta. | Solo en payload |
| warnings | array | No | E.g., "Presupuesto ajustado para 200 invitados". | Solo en payload |

#### Estructura JSON recomendada

```json
{
  "currency": "GTQ",
  "total_budget": 120000,
  "items": [
    {"category": "venue", "suggested_amount": 36000, "percentage": 30, "priority": "must_have", "reason": "Mayor peso típico en bodas."},
    {"category": "catering", "suggested_amount": 30000, "percentage": 25, "priority": "must_have", "reason": "Catering depende del número de invitados."},
    {"category": "photography", "suggested_amount": 12000, "percentage": 10, "priority": "should_have", "reason": "Cobertura del evento."},
    {"category": "dj_music", "suggested_amount": 8000, "percentage": 6.67, "priority": "should_have", "reason": "Incluye hora loca."},
    {"category": "decor", "suggested_amount": 12000, "percentage": 10, "priority": "should_have", "reason": "Decoración y mobiliario."},
    {"category": "cake_candy_bar", "suggested_amount": 6000, "percentage": 5, "priority": "should_have", "reason": "Pastel + mesa de dulces."},
    {"category": "makeup", "suggested_amount": 4000, "percentage": 3.33, "priority": "should_have", "reason": "Make-up y peinado."},
    {"category": "buffer", "suggested_amount": 12000, "percentage": 10, "priority": "must_have", "reason": "Imprevistos y propinas."}
  ],
  "warnings": [
    "Para 200 invitados, considera aumentar la categoría catering."
  ]
}
```

#### Reglas de validación humana
- El organizador ve la distribución como sugerencia; cada item es editable (BR-BUDGET-008, BR-BUDGET-009).
- Puede aceptar la distribución completa, editar montos, agregar categorías propias o eliminar las sugeridas.
- Al aceptar, cada item se materializa como `BudgetItem` con `ai_generated=true`.
- La regla de warning (`committed > total`) se mantiene visible y no bloquea (BR-BUDGET-004).

#### Reglas de persistencia
- `AIRecommendation.type = "budget_suggestion"`.
- `BudgetItem.service_category_id` apunta al `ServiceCategory` con `code = items[].category`.
- `BudgetItem.planned` = `suggested_amount`. `committed` arranca en 0.
- Si la moneda del evento se modifica, no se hace conversión automática (BR-BUDGET-007, BR-OOS-015).

#### Dependencias del modelo de datos
`Event`, `Budget`, `BudgetItem`, `ServiceCategory`, `AIRecommendation`.

#### Prompt strategy
- Plantilla por tipo de evento + tamaño + moneda + idioma.
- Instrucción: "no inventes precios de mercado; trabaja proporciones (%) del total".
- "Incluye categoría `buffer` o `imprevistos` de 5–15%".
- Categorías deben coincidir con slugs del catálogo `ServiceCategory` (curado por admin).
- JSON estricto.

#### Fallback behavior
- **LLM falla:** distribución porcentual estática por tipo de evento.
- **Suma de porcentajes ≠ 100% ±2pp:** normalizar antes de devolver.
- **`MockAIProvider`:** distribución determinista por tipo de evento.

#### Errores esperados
- `LLM_UNAVAILABLE`, `LLM_TIMEOUT`, `INVALID_JSON`, `MISSING_INPUT`, `INVALID_PERCENTAGE_SUM`.

#### Riesgos
- Alucinación de precios "de mercado" — mitigada por la restricción de operar en porcentajes.
- Omisión de categorías culturales (mesa de dulces, padrinos, hora loca).
- Suma de porcentajes inconsistente — mitigada por normalización.

#### Criterios de aceptación
1. Dado un evento con `total_budget`, `currency`, `guests_count` y `type`, cuando el organizador solicita la sugerencia de presupuesto, entonces el sistema devuelve `items` cuya suma de `suggested_amount` no supera el `total_budget` por más de 2%.
2. La salida no incluye proveedores específicos.
3. La moneda devuelta coincide con la del evento.
4. Al aceptar, los `BudgetItem` se crean con `ai_generated=true` y `service_category_id` válido.
5. Si la suma de porcentajes es inválida, se normaliza antes de devolver.

---

### AI-004 — Recomendación de categorías de proveedor

#### Descripción
Recomienda **qué categorías de servicio** se necesitan para el evento, clasificadas en `must_have`, `should_have`, `optional`, con razón corta. Puede consumirse de forma independiente o derivarse de AI-001.

#### Problema que resuelve
Pain point: "Saber por dónde empezar" y "no sabe qué buscar" (Doc 1 §2.6, §10 caso 4).

#### Usuario principal
Organizer.

#### Clasificación
- **Scope:** MVP
- **Priority:** Must Have
- **Source type:** Explicit (Doc 1 §10 caso 4, Doc 3 §8.1)

#### Input requerido

| Input | Type suggestion | Required | Source | Notes |
|---|---|---|---|---|
| event_type_code | enum | Sí | `Event` | Plantilla base |
| guests_count | integer | Sí | `Event` | Influye en categorías opcionales |
| estimated_budget | decimal | Sí | `Event` | Filtra categorías "premium" si presupuesto ajustado |
| location | object | Sí | `Event.location` | Coherencia cultural |
| style_preferences | string | No | Notas del evento | Opcional |
| language_code | enum | Sí | `Event` | BR-AI-011 |

#### Output esperado

| Output | Type suggestion | Required | Description | Persisted? |
|---|---|---|---|---|
| categories | array | Sí | Categorías sugeridas con prioridad. | Sí (`AIRecommendation.output_payload`) |
| categories[].category | string (slug) | Sí | Coincide con `ServiceCategory.code`. | Sí |
| categories[].priority | enum (`must_have`, `should_have`, `optional`) | Sí | Prioridad. | Sí |
| categories[].reason | string | Sí | Justificación corta. | Sí |
| categories[].required | boolean | Sí | True si crítico para el tipo de evento. | Sí |

#### Estructura JSON recomendada

```json
{
  "categories": [
    {"category": "venue", "priority": "must_have", "required": true, "reason": "Sin venue no hay evento."},
    {"category": "catering", "priority": "must_have", "required": true, "reason": "Servicio de alimentos para invitados."},
    {"category": "photography", "priority": "should_have", "required": false, "reason": "Memoria visual del evento."},
    {"category": "dj_music", "priority": "should_have", "required": false, "reason": "Ambiente musical y hora loca."},
    {"category": "cake_candy_bar", "priority": "should_have", "required": false, "reason": "Pastel y mesa de dulces típicos."},
    {"category": "decor", "priority": "optional", "required": false, "reason": "Decoración y mobiliario adicional."}
  ]
}
```

#### Reglas de validación humana
- El organizador selecciona qué categorías incorporar al flujo de cotización.
- Las categorías aceptadas pueden disparar acciones derivadas (e.g., crear `QuoteRequest` por categoría) — siempre con confirmación humana.
- Las categorías rechazadas no afectan al evento.

#### Reglas de persistencia
- `AIRecommendation.type = "vendor_categories"`.
- No se crean entidades nuevas automáticamente; las decisiones (qué cotizar) se materializan a través del flujo manual de `QuoteRequest`.

#### Dependencias del modelo de datos
`Event`, `EventType`, `ServiceCategory`, `AIRecommendation`.

#### Prompt strategy
- Restricción: solo categorías del catálogo `ServiceCategory` (slug exacto).
- Contexto cultural por tipo de evento.
- JSON estricto.
- No inventar categorías nuevas.

#### Fallback behavior
- **LLM falla:** lista estática por `event_type_code`.
- **Categoría inexistente en catálogo:** se filtra del output.
- **`MockAIProvider`:** lista determinista.

#### Errores esperados
- `LLM_UNAVAILABLE`, `LLM_TIMEOUT`, `INVALID_JSON`, `UNKNOWN_CATEGORY`.

#### Riesgos
- Devolver categorías fuera del catálogo curado.
- Sobre-recomendar categorías premium en eventos con presupuesto ajustado.

#### Criterios de aceptación
1. Dado un evento válido, cuando se solicita la recomendación, entonces el sistema devuelve `categories` con al menos 2 `must_have` y al menos 3 categorías totales.
2. Todas las categorías existen en `ServiceCategory.code`.
3. La respuesta respeta el idioma del evento (campo `reason`).
4. Si la generación falla, se entrega plantilla estática por tipo de evento.

---

### AI-005 — Generación de brief de cotización

#### Descripción
Autocompleta un **brief estructurado** que el organizador envía al proveedor al solicitar una cotización: incluye descripción libre del proyecto, requerimientos, preguntas para el proveedor y restricciones/preferencias.

#### Problema que resuelve
Doc 1 §6.6 (proceso de solicitud) y §10 caso 6. Pain point del proveedor: "leads de baja calidad" (Doc 1 §2.7 punto 1) y "cotizaciones repetitivas". Para el organizador: comunicación clara con proveedores.

#### Usuario principal
Organizer.

#### Clasificación
- **Scope:** MVP
- **Priority:** Must Have
- **Source type:** Explicit (Doc 1 §10 caso 6, Doc 3 §7.8, §8.1, BR-QUOTE-002)

#### Input requerido

| Input | Type suggestion | Required | Source | Notes |
|---|---|---|---|---|
| event snapshot | object | Sí | `Event` (tipo, fecha, invitados, ciudad, presupuesto referencial) | Brief autocompletado |
| service_category | string | Sí | `QuoteRequest.service_category_id` | Categoría solicitada |
| vendor_summary | object | Sí | `VendorProfile` (nombre, ciudad, categorías) | Personaliza el brief |
| desired_budget_range | object | No | Subset del `Budget` | Opcional |
| language_code | enum | Sí | `Event` | BR-QUOTE-008, BR-AI-011 |

#### Output esperado

| Output | Type suggestion | Required | Description | Persisted? |
|---|---|---|---|---|
| brief | string | Sí | Texto editable del brief. | Sí (en `QuoteRequest.brief`) |
| requirements | array | Sí | Requerimientos estructurados. | Sí |
| questions | array | No | Preguntas para el proveedor. | Sí |
| constraints | array | No | Restricciones o preferencias. | Sí |

#### Estructura JSON recomendada

```json
{
  "brief": "Boda de 120 invitados en Ciudad de Guatemala el 14 de febrero de 2026. Buscamos servicio de catering con menú de 3 tiempos, opción vegetariana y mesa de dulces.",
  "requirements": [
    "Menú principal con 2 opciones de proteína",
    "Opción vegetariana",
    "Mesa de dulces para 120 personas",
    "Servicio de meseros"
  ],
  "questions": [
    "¿El precio incluye mantelería y cristalería?",
    "¿Cuál es la política de cambios de menú?",
    "¿Cuánto anticipo solicitan para reservar?",
    "¿Disponibilidad confirmada para esa fecha?"
  ],
  "constraints": [
    "Presupuesto referencial: GTQ 30,000",
    "Idioma de la respuesta: español"
  ]
}
```

#### Reglas de validación humana
- El organizador revisa el brief antes de enviarlo (BR-QUOTE-003).
- Puede editar el texto libremente, agregar o quitar requerimientos/preguntas/restricciones.
- Solo tras "Enviar" la `QuoteRequest` pasa a estado `sent` (BR-QUOTE-005). Si el organizador no envía, la sugerencia no se persiste como dato oficial; sí queda como `AIRecommendation` con `accepted=false`.

#### Reglas de persistencia
- `AIRecommendation.type = "quote_brief"`.
- Al enviar la `QuoteRequest`, `brief` se almacena en `QuoteRequest.brief` (json) y se marca `QuoteRequest.ai_generated_brief = true` con `ai_recommendation_id` vinculado (BR-AI-008, Doc 6 `QuoteRequest`).

#### Dependencias del modelo de datos
`Event`, `VendorProfile`, `ServiceCategory`, `QuoteRequest`, `AIRecommendation`.

#### Prompt strategy
- Tono profesional y claro.
- Recordar al modelo: "no comprometas precios, no negocies condiciones legales, no incluyas información sensible del organizador".
- Personalización por categoría (catering vs fotografía vs venue).
- Brief en idioma del evento.

#### Fallback behavior
- **LLM falla:** plantilla estática por categoría con placeholders rellenados con datos del evento.
- **`MockAIProvider`:** brief determinista.

#### Errores esperados
- `LLM_UNAVAILABLE`, `LLM_TIMEOUT`, `INVALID_JSON`, `MISSING_INPUT`.

#### Riesgos
- Inclusión de información personal innecesaria del organizador.
- Compromisos verbales del estilo "el monto está confirmado".
- Brief excesivamente largo.

#### Criterios de aceptación
1. Dado un evento `active` y un proveedor `approved`, cuando el organizador solicita el brief, entonces el sistema devuelve `brief`, `requirements` y `questions`.
2. El brief no incluye datos sensibles (email, teléfono del organizador) salvo si el organizador lo agrega manualmente.
3. El brief usa el idioma del evento.
4. Tras enviar, `QuoteRequest.ai_generated_brief = true` y `ai_recommendation_id` está poblado.
5. Si la generación falla, se entrega plantilla estática por categoría.

---

### AI-006 — Resumen comparativo de cotizaciones

#### Descripción
Recibe un set de `Quote` recibidas para una misma `service_category` y devuelve un **resumen estructurado** con fortalezas, riesgos, información faltante por cotización, más una recomendación **no vinculante** y notas para la decisión humana.

#### Problema que resuelve
JTBD #5 (Doc 1 §5.1) y pain point: "Comparar cotizaciones desiguales" (Doc 1 §2.6 punto 4, §10 caso 5). BR-QUOTE-023.

#### Usuario principal
Organizer.

#### Clasificación
- **Scope:** MVP
- **Priority:** Should Have
- **Source type:** Explicit (Doc 3 §7.10, §8.1, BR-QUOTE-023, BR-QUOTE-024)

#### Input requerido

| Input | Type suggestion | Required | Source | Notes |
|---|---|---|---|---|
| quotes | array de `Quote` | Sí | `Quote` (total, breakdown, conditions, valid_until, currency) | Al menos 2 cotizaciones |
| event_snapshot | object | Sí | `Event` | Contexto |
| service_category | string | Sí | Misma categoría en todas las cotizaciones | Comparable |
| language_code | enum | Sí | `Event` | BR-AI-011 |

#### Output esperado

| Output | Type suggestion | Required | Description | Persisted? |
|---|---|---|---|---|
| summary | string | Sí | Resumen general de la comparación. | Sí (`AIRecommendation.output_payload`) |
| quotes | array | Sí | Una entrada por `Quote.id`. | Sí |
| quotes[].quote_id | string | Sí | Referencia a `Quote.id`. | Sí |
| quotes[].strengths | array<string> | Sí | Fortalezas detectadas. | Sí |
| quotes[].risks | array<string> | Sí | Riesgos detectados. | Sí |
| quotes[].missing_information | array<string> | Sí | Datos faltantes. | Sí |
| non_binding_recommendation | string | Sí | Texto explícitamente no vinculante. | Sí |
| decision_notes | array<string> | No | Notas para la decisión humana. | Sí |

#### Estructura JSON recomendada

```json
{
  "summary": "Las tres cotizaciones varían en precio total entre GTQ 28,000 y GTQ 35,000. Una incluye mantelería; las otras dos no la especifican.",
  "quotes": [
    {
      "quote_id": "q-001",
      "strengths": ["Precio más bajo", "Incluye 2 meseros"],
      "risks": ["No menciona mantelería", "Validez corta (5 días)"],
      "missing_information": ["¿Cristalería incluida?", "¿Política de cambios de menú?"]
    },
    {
      "quote_id": "q-002",
      "strengths": ["Incluye mantelería y cristalería", "Validez 30 días"],
      "risks": ["Precio más alto", "Anticipo de 50%"],
      "missing_information": []
    },
    {
      "quote_id": "q-003",
      "strengths": ["Buen balance precio/inclusiones"],
      "risks": ["No incluye mesa de dulces"],
      "missing_information": ["¿Costo adicional por hora extra?"]
    }
  ],
  "non_binding_recommendation": "Sugerencia no vinculante: la cotización q-002 ofrece mayor claridad de inclusiones, aunque al precio más alto. La decisión final depende de tus prioridades.",
  "decision_notes": [
    "Pide aclaración sobre cristalería a q-001 antes de descartar.",
    "Revisa la validez antes de comparar precios."
  ]
}
```

#### Reglas de validación humana
- El resumen se ofrece como **lectura asistida** (Doc 3 §8.1, BR-QUOTE-023).
- El organizador no está obligado a seguir la recomendación; puede marcar cualquier `Quote` como `preferred` (BR-QUOTE-022).
- No altera el contenido original de las cotizaciones (BR-QUOTE-024).

#### Reglas de persistencia
- `AIRecommendation.type = "quote_comparison"` con `output_payload`.
- En MVP, el resumen puede regenerarse bajo demanda; no se requiere persistencia permanente más allá de `AIRecommendation` (decisión recomendada). Si se prefiere caché, almacenar la última versión con `accepted=false` y permitir regenerar.
- No modifica `Quote`.

#### Dependencias del modelo de datos
`Event`, `Quote`, `QuoteRequest`, `ServiceCategory`, `AIRecommendation`.

#### Prompt strategy
- Instrucción explícita: "tu recomendación es **no vinculante**; siempre indica que la decisión final es del usuario".
- Restricción: no inventar atributos que no estén en el input.
- Resaltar diferencias estructurales (qué incluye/no incluye cada cotización).
- Comparar en la misma moneda; advertir si las monedas difieren (no convertir).
- JSON estricto.

#### Fallback behavior
- **LLM falla:** mostrar vista comparativa estática (tabla lado a lado sin resumen IA) y mensaje "Resumen IA no disponible".
- **`MockAIProvider`:** resumen determinista por número de cotizaciones.

#### Errores esperados
- `LLM_UNAVAILABLE`, `LLM_TIMEOUT`, `INVALID_JSON`, `INSUFFICIENT_QUOTES` (menos de 2).
- `MIXED_CURRENCIES`: si las cotizaciones están en monedas distintas, advertir y no normalizar.

#### Riesgos
- Recomendación percibida como vinculante.
- Falsas equivalencias entre cotizaciones con inclusiones distintas.
- Sesgo a favor del precio más bajo o más alto.

#### Criterios de aceptación
1. Dado un conjunto de ≥2 `Quote` para la misma categoría, cuando el organizador solicita el resumen, entonces el sistema devuelve `summary`, `quotes[]`, `non_binding_recommendation`.
2. El resumen incluye la frase "no vinculante" o equivalente.
3. La salida no inventa atributos ausentes en las cotizaciones originales.
4. Las `Quote` originales permanecen inalteradas (BR-QUOTE-024).
5. Si hay menos de 2 cotizaciones, la API devuelve `INSUFFICIENT_QUOTES` y la UI invita a esperar más respuestas.

---

### AI-007 — Generación de bio y paquetes del proveedor

#### Descripción
Asiste al **proveedor** durante el onboarding o edición de perfil: genera una bio profesional, una descripción del proveedor y descripciones por paquete (`VendorService`).

#### Problema que resuelve
Doc 1 §10 caso 7: "Vendors no saben describirse". Doc 3 §7.7, §8.1. BR-VENDOR-008.

#### Usuario principal
Vendor.

#### Clasificación
- **Scope:** MVP
- **Priority:** Could Have
- **Source type:** Explicit (BR-VENDOR-008)

#### Input requerido

| Input | Type suggestion | Required | Source | Notes |
|---|---|---|---|---|
| business_name | string | Sí | `VendorProfile.business_name` | Identidad |
| categories | array<string> | Sí | `VendorService.service_category_id` | Define tono |
| city | string | Sí | `Location` | Contexto regional |
| short_intro | string | No | Notas del vendor | Apunta al tono deseado |
| sample_packages | array | No | Datos preliminares de paquetes | Para descripciones |
| language_code | enum | Sí | Usuario o evento | BR-AI-011 |

#### Output esperado

| Output | Type suggestion | Required | Description | Persisted? |
|---|---|---|---|---|
| bio | string | Sí | Bio profesional editable. | Sí (al aceptar → `VendorProfile.bio`) |
| short_description | string | No | Descripción breve para tarjeta de directorio. | Opcional |
| packages | array | No | Descripciones sugeridas por paquete. | Al aceptar → `VendorService.description` |

#### Estructura JSON recomendada

```json
{
  "bio": "Catering Bella Vista es un equipo guatemalteco con más de 10 años especializándose en bodas y eventos sociales. Ofrecemos menús personalizados con énfasis en sabor casero y presentación elegante.",
  "short_description": "Catering para bodas y eventos sociales en Guatemala.",
  "packages": [
    {
      "package_name": "Menú Clásico",
      "description": "Menú de 3 tiempos con opción vegetariana, incluye servicio de meseros y montaje básico."
    },
    {
      "package_name": "Menú Premium",
      "description": "Menú de 4 tiempos con maridaje, servicio de meseros, mantelería y cristalería incluida."
    }
  ]
}
```

#### Reglas de validación humana
- El proveedor revisa la bio y descripciones antes de publicar (BR-VENDOR-008, BR-AI-002).
- Puede aceptar, editar o regenerar.
- Solo tras aceptar, se actualizan `VendorProfile.bio` y `VendorService.description` con flags `ai_generated_bio = true` / `ai_generated_description = true` (Doc 6).
- El perfil sigue requiriendo aprobación admin (BR-VENDOR-001).

#### Reglas de persistencia
- `AIRecommendation.type = "vendor_bio"` con vínculo a `vendor_profile_id`.
- `VendorProfile.ai_generated_bio` y `VendorService.ai_generated_description` se marcan al aceptar.

#### Dependencias del modelo de datos
`User`, `VendorProfile`, `VendorService`, `ServiceCategory`, `Location`, `AIRecommendation`.

#### Prompt strategy
- Tono "premium accesible" según branding (Doc 2 §5).
- No inventar credenciales, premios o cantidad de eventos realizados.
- No inventar precios.
- Bio en idioma del usuario; descripciones por paquete en el mismo idioma.

#### Fallback behavior
- **LLM falla:** plantilla estática con placeholders rellenados (`{business_name} es un proveedor de {categories} ubicado en {city}.`).
- **`MockAIProvider`:** bio determinista.

#### Errores esperados
- `LLM_UNAVAILABLE`, `LLM_TIMEOUT`, `INVALID_JSON`, `INVALID_LANGUAGE`.

#### Riesgos
- Invención de credenciales/historial.
- Tono inadecuado (demasiado corporativo o demasiado informal).
- Inclusión de claims que no se pueden sostener legalmente.

#### Criterios de aceptación
1. Dado un proveedor con datos mínimos, cuando solicita generación de bio, entonces el sistema devuelve `bio` y opcionalmente `packages`.
2. La salida no contiene credenciales inventadas (premios, certificaciones).
3. Al aceptar, `VendorProfile.ai_generated_bio = true`.
4. El perfil sigue pasando por aprobación admin.
5. Si la generación falla, se entrega plantilla estática.

---

### AI-008 — Priorización de tareas urgentes

#### Descripción
A partir del estado actual del checklist y de la cercanía del evento, sugiere las **top 3 acciones más urgentes** con razón y timing recomendado.

#### Problema que resuelve
Doc 1 §10 caso 8: "Estrés a 2 semanas del evento". Pain point del organizador.

#### Usuario principal
Organizer.

#### Clasificación
- **Scope:** MVP
- **Priority:** Should Have
- **Source type:** Explicit (Doc 1 §10 caso 8, Doc 3 §8.1)

#### Input requerido

| Input | Type suggestion | Required | Source | Notes |
|---|---|---|---|---|
| event_date | date | Sí | `Event` | Cercanía |
| tasks | array | Sí | `EventTask` (id, title, due_date, status, priority) | Estado actual |
| quote_requests_summary | object | No | `QuoteRequest`s del evento | Para identificar gaps |
| budget_summary | object | No | `Budget` | Para identificar gaps presupuestales |
| language_code | enum | Sí | `Event` | BR-AI-011 |

#### Output esperado

| Output | Type suggestion | Required | Description | Persisted? |
|---|---|---|---|---|
| top_actions | array (≤3) | Sí | Acciones priorizadas. | Sí |
| top_actions[].title | string | Sí | Acción sugerida. | Sí |
| top_actions[].reason | string | Sí | Razón corta. | Sí |
| top_actions[].suggested_timing | string | Sí | "Hoy", "Esta semana", "Antes de T-7". | Sí |
| top_actions[].related_task_id | uuid | No | Vínculo a `EventTask` si aplica. | Sí |

#### Estructura JSON recomendada

```json
{
  "top_actions": [
    {
      "title": "Confirmar disponibilidad con el catering",
      "reason": "El catering aún no ha respondido la cotización y faltan 21 días.",
      "suggested_timing": "Hoy",
      "related_task_id": "task-123"
    },
    {
      "title": "Enviar invitaciones formales",
      "reason": "Tarea pendiente con vencimiento en 7 días.",
      "suggested_timing": "Esta semana",
      "related_task_id": "task-129"
    },
    {
      "title": "Reservar el DJ",
      "reason": "No hay BookingIntent confirmado en categoría dj_music.",
      "suggested_timing": "Antes de T-14",
      "related_task_id": null
    }
  ]
}
```

#### Reglas de validación humana
- La priorización es **lectura asistida** (Doc 3 §8.1 línea 8).
- El usuario no necesita aceptar/rechazar; las acciones sirven para guiar el dashboard.
- Si decide actuar sobre una acción, lo hace sobre la `EventTask` real (no se crea entidad nueva desde la priorización).

#### Reglas de persistencia
- `AIRecommendation.type = "task_prioritization"`.
- No crea ni modifica `EventTask`; solo lectura.

#### Dependencias del modelo de datos
`Event`, `EventTask`, `Budget`, `QuoteRequest`, `BookingIntent`, `AIRecommendation`.

#### Prompt strategy
- Considerar `due_date` vs hoy.
- Considerar tareas `pending` vs `in_progress` vs `done`.
- Considerar categorías sin `QuoteRequest` o sin `BookingIntent.confirmed_intent`.
- Máximo 3 acciones.

#### Fallback behavior
- **LLM falla:** algoritmo determinista local (próximas 3 tareas vencidas / por vencer + categorías sin booking).
- **`MockAIProvider`:** priorización determinista.

#### Errores esperados
- `LLM_UNAVAILABLE`, `LLM_TIMEOUT`, `INVALID_JSON`, `NO_TASKS_AVAILABLE`.

#### Riesgos
- Priorizar tareas irrelevantes para el contexto del evento.
- Recomendar acciones imposibles (e.g., "reservar venue" cuando el evento es mañana).

#### Criterios de aceptación
1. Dado un evento con tareas y `event_date` futura, cuando el organizador abre el dashboard, entonces el sistema devuelve `top_actions` con ≤3 elementos.
2. Cada acción tiene `reason` y `suggested_timing`.
3. Si no hay tareas, el sistema devuelve un mensaje claro y no falla.
4. Si la generación falla, se entrega lista determinista local.

---

## 11. AI Features recomendadas pero no obligatorias

| ID | Feature | Razón de "recomendada" | Beneficio si se incluye |
|---|---|---|---|
| AI-006 | Resumen comparativo de cotizaciones | Should Have (Doc 3 §8.1); muy alto valor para el organizador, pero la vista comparativa estática ya cubre el flujo MVP. | Mejora decisión, reduce sesgo, ayuda al organizador a pedir aclaraciones a proveedores. |
| AI-007 | Generación de bio / paquetes del proveedor | Could Have (Doc 3 §8.1, BR-VENDOR-008). | Acelera onboarding del proveedor, mejora calidad del directorio. |
| AI-008 | Priorización de tareas urgentes | Should Have (Doc 1 §10 caso 8). | Reduce estrés en la recta final del evento. |
| Caching de outputs IA por plantilla | Recomendado (BR-AI-013) | Reduce costos de tokens en demos y reproducciones. Could Have. |
| `AIPromptVersion` como entidad | Recomendado (Doc 6 §12) | Si los prompts se mantienen en código/git, basta con registrar hash; tabla solo si se requiere consulta desde admin. |
| Streaming de respuestas IA | Recomendado (BR-AI-012) | Mitiga latencia percibida; aplica especialmente a AI-001, AI-002, AI-005. |

---

## 12. AI Features diferidas para versiones futuras

| Feature | Versión target | Pre-requisito | Notas |
|---|---|---|---|
| Resumen ejecutivo del evento | v1.1 | Decisión de UX y dashboard. | Bajo valor inmediato, alto valor narrativo. |
| Detección de inconsistencias presupuesto vs cotizaciones | v1.1 | Histórico de uso. | Implementable con reglas + IA validadora. |
| Recomendación de proveedores específicos (ranking) | v2.0 | Volumen real de bookings y reseñas; feedback loop. | Requiere data significativa. |
| Análisis de sentimiento de reseñas | v2.0 | Decisión de moderación humana sobre alertas IA. | BR-FUTURE-008. |
| Moderación automática de reseñas con IA | v2.0 | Política de revisión humana sobre flagged. | BR-FUTURE-009. |
| Detección automática de inconsistencias en perfiles del proveedor | v2.0 | KYC futuro. | Apoyo a admin. |
| Generación de mensajes libres entre roles | v1.1 | Decisión sobre chat real-time. | Hoy se cubre con `brief` + email simulado. |
| Asistente IA por WhatsApp | v2.0 | Integración WhatsApp Business (BR-FUTURE-007). | Requiere infraestructura adicional. |

---

## 13. AI Features explícitamente fuera de alcance

Las siguientes capacidades de IA están **explícitamente fuera del MVP**. No deben implementarse en v1 bajo ninguna circunstancia.

| Feature | Motivo | Fuente | ¿Podría considerarse en futuro? |
|---|---|---|---|
| Chatbot conversacional libre (organizador o proveedor) | La IA opera por features acotadas; un chat libre rompe la trazabilidad y la validación humana por feature. | BR-AI-014, BR-OOS-018 | Solo con UX clara y guardrails fuertes; v2+. |
| Generación de imágenes / decoración con IA | Excluido por scope; sin valor diferencial para el MVP. | BR-AI-015, BR-OOS-016 | Posible en v2.0 con casos de uso definidos. |
| Voice / audio assistants | Sin infraestructura ni casos de uso claros. | Doc 3 §8.2 | Lejano. |
| Asistente IA por WhatsApp | WhatsApp completo está fuera del MVP. | BR-OOS-004 | v2.0 junto a WhatsApp Business. |
| Análisis de sentimiento de reseñas | Decisión PO: difiere. | BR-OOS-007, BR-FUTURE-008 | v2.0. |
| Moderación automática de reseñas | Admin modera manualmente. | BR-REVIEW-006, BR-OOS-008, BR-FUTURE-009 | v2.0 con revisión humana. |
| Detección de fraude con IA | Sin soporte documental ni data en MVP. | Doc 1 §11 (riesgo) | Posiblemente en escala comercial. |
| Recomendación IA de precios "de mercado" | EventFlow evita alucinar precios. | Doc 1 §11 | Solo con data agregada real y disclaimer. |
| Decisión autónoma de booking | Confirmación bilateral humana obligatoria. | BR-AI-004, BR-BOOKING-002 | No alineado con la cuña del producto. |
| Decisión autónoma de pago | Sin pagos reales en MVP. | BR-OOS-001 | v2.0 si se integran pagos. |
| Aprobación autónoma de proveedores | Curaduría manual. | BR-VENDOR-006, BR-ADMIN-001 | Posible junto a KYC futuro. |
| Contratos generados por IA | Sin contratos digitales en MVP. | BR-OOS-003 | v2.0 con firma electrónica. |
| Ranking de proveedores reales basado en scoring oculto | Riesgo reputacional y legal. | Inferido | Solo con transparencia total. |
| Recomendaciones IA vinculantes "quién contratar" | Contradice human-in-the-loop. | BR-AI-004 | No previsto. |

---

## 14. Roles y permisos sobre funcionalidades IA

Resumen de permisos por feature IA, derivado del Doc 5 §9.16 y de las reglas BR-AI-*.

| Feature IA | Organizer | Vendor | Admin |
|---|---|---|---|
| AI-001 Plan | C, R, U(aceptar/editar), D(rechazar) (Own event) | N/A | R (auditoría, todos los eventos) |
| AI-002 Checklist | C, R, U, D (Own event) | N/A | R (auditoría) |
| AI-003 Budget Suggestion | C, R, U, D (Own event) | N/A | R (auditoría) |
| AI-004 Vendor Categories | C, R, U, D (Own event) | N/A | R (auditoría) |
| AI-005 Quote Brief | C, R, U, D (Own event) | N/A (sólo recibe el brief enviado) | R (auditoría) |
| AI-006 Quote Comparison Summary | C, R (Own event con ≥2 Quotes) | N/A | R (auditoría) |
| AI-007 Vendor Bio / Packages | N/A | C, R, U, D (Own profile) | R (auditoría) |
| AI-008 Task Prioritization | C, R (Own event) | N/A | R (auditoría) |

Reglas transversales:

- Un organizador **nunca** puede generar IA sobre el evento de otro organizador (BR-AUTH-009).
- Un proveedor **solo** puede usar IA sobre su propio perfil (BR-VENDOR-008, BR-AUTH-007).
- El admin **no** puede actuar como organizador ni proveedor en flujos IA comerciales (BR-ADMIN-006). Su acceso a `AIRecommendation` es de lectura para auditoría (BR-ADMIN-008).
- El admin **no** puede usar IA para moderar reseñas en MVP (BR-REVIEW-006).
- Mock/demo: todos los roles pueden disparar `MockAIProvider` en entornos de demo/test (BR-AI-006).

---

## 15. Datos de entrada requeridos por feature

Resumen consolidado. La fuente de cada campo proviene del modelo de datos (Doc 6).

| Input | Origen | AI-001 | AI-002 | AI-003 | AI-004 | AI-005 | AI-006 | AI-007 | AI-008 |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| event_type_code | `Event.event_type_code` | ● | ● | ● | ● | ● |  |  | ● |
| event_date | `Event.event_date` | ● | ● | ● |  | ● |  |  | ● |
| guests_count | `Event.guests_count` | ● | ● | ● | ● | ● |  |  |  |
| location | `Event.location_id` → `Location` | ● |  | ● | ● | ● |  | ● |  |
| estimated_budget | `Event.estimated_budget` | ● |  | ● | ● | ● |  |  |  |
| currency_code | `Event.currency_code` | ● |  | ● |  | ● | ● |  |  |
| language_code | `Event.language_code` / `User.preferred_language` | ● | ● | ● | ● | ● | ● | ● | ● |
| event_plan (aceptado) | `AIRecommendation` previo |  | ● |  |  |  |  |  |  |
| budget_summary | `Budget` agregado |  | ● | ● |  | ● |  |  | ● |
| service_category | `QuoteRequest.service_category_id` |  |  |  |  | ● | ● |  |  |
| vendor_summary | `VendorProfile` |  |  |  |  | ● |  |  |  |
| quotes | `Quote[]` |  |  |  |  |  | ● |  |  |
| business_name | `VendorProfile.business_name` |  |  |  |  |  |  | ● |  |
| categories | `VendorService` |  |  |  |  |  |  | ● |  |
| sample_packages | preliminar |  |  |  |  |  |  | ● |  |
| tasks | `EventTask[]` |  |  |  |  |  |  |  | ● |

> Datos **prohibidos en inputs IA**: contraseñas, hashes, tokens de sesión, medios de pago, números de identificación, emails y teléfonos personales completos (más allá de lo estrictamente necesario), contenido legal.

---

## 16. Outputs esperados por feature

| Feature | Outputs estructurados principales | Persistencia clave |
|---|---|---|
| AI-001 Plan | `summary`, `phases[]`, `recommended_vendor_categories[]`, `warnings[]` | `AIRecommendation` + opcionalmente `EventTask`/`BudgetItem` al aceptar |
| AI-002 Checklist | `tasks[]` con `title`, `relative_due_date`, `priority`, `source` | `AIRecommendation`; `EventTask` al aceptar (con `ai_generated=true`) |
| AI-003 Budget Suggestion | `currency`, `total_budget`, `items[]`, `warnings[]` | `AIRecommendation`; `BudgetItem` al aceptar |
| AI-004 Vendor Categories | `categories[]` con `priority`, `required`, `reason` | `AIRecommendation` |
| AI-005 Quote Brief | `brief`, `requirements[]`, `questions[]`, `constraints[]` | `AIRecommendation`; `QuoteRequest.brief` y `ai_generated_brief=true` al enviar |
| AI-006 Quote Comparison Summary | `summary`, `quotes[]`, `non_binding_recommendation`, `decision_notes[]` | `AIRecommendation` (regenerable) |
| AI-007 Vendor Bio | `bio`, `short_description`, `packages[]` | `AIRecommendation`; `VendorProfile.bio` + `ai_generated_bio=true` al aceptar |
| AI-008 Task Prioritization | `top_actions[]` con `title`, `reason`, `suggested_timing`, `related_task_id` | `AIRecommendation` (lectura asistida) |

---

## 17. Formatos de respuesta y estructura JSON recomendada

Los ejemplos de JSON ya fueron presentados en el catálogo (sección 10). Resumen consolidado:

- **Event Plan JSON:** ver AI-001.
- **Checklist JSON:** ver AI-002.
- **Budget Suggestion JSON:** ver AI-003.
- **Vendor Categories JSON:** ver AI-004.
- **Quote Brief JSON:** ver AI-005.
- **Quote Comparison JSON:** ver AI-006.
- **Vendor Bio JSON:** ver AI-007.
- **Task Prioritization JSON:** ver AI-008.

Convenciones comunes:

- **JSON estricto** (sin texto fuera del objeto raíz).
- Todos los campos `enum` usan slugs en `snake_case` y deben mapearse contra `ServiceCategory.code` o catálogos del dominio.
- Las cantidades monetarias se devuelven en la moneda del evento, sin conversión.
- Las fechas relativas usan formato `T-N` (negativo) o `T+N`; las absolutas usan ISO 8601 (`YYYY-MM-DD`).
- Texto en el idioma especificado en el input.

---

## 18. Reglas de validación humana

Regla fundamental (BR-AI-001, Doc 3 §8.3, Doc 4 §11):

```text
Ninguna salida IA se convierte en dato oficial del evento, presupuesto, cotización, brief, perfil o booking hasta que un humano confirma explícitamente.
```

Reglas operativas por feature:

| Feature | ¿Quién valida? | ¿Qué se puede aceptar? | ¿Qué se puede editar? | ¿Qué se rechaza? | ¿Qué pasa si no hace nada? |
|---|---|---|---|---|---|
| AI-001 Plan | Organizer | Plan completo o parcial | Fases, acciones, categorías | Plan completo (regenera o descarta) | Permanece como sugerencia visible; no impacta tareas/budget |
| AI-002 Checklist | Organizer | Bloque o tareas individuales | Título, descripción, fecha, prioridad | Cualquier tarea | No se crean `EventTask`; sugerencia visible |
| AI-003 Budget | Organizer | Distribución completa o parcial | Categoría, monto, prioridad | Cualquier item | No se crean `BudgetItem` |
| AI-004 Categories | Organizer | Cualquier categoría | Prioridad sugerida | Categorías no deseadas | Solo sugerencia; sin efecto |
| AI-005 Brief | Organizer | Brief completo | Texto, requerimientos, preguntas, restricciones | Brief completo | No se envía la `QuoteRequest` |
| AI-006 Comparison | Organizer | Lectura asistida | Notas propias (no IA) | Resumen completo (regenera) | Solo lectura; sin efecto |
| AI-007 Bio | Vendor | Bio, descripciones | Texto, tono | Bio completa | No se actualiza `VendorProfile` |
| AI-008 Prioritization | Organizer | Lectura asistida | — | — | Solo lectura |

Comportamientos transversales:

- **Distinción visual obligatoria:** badge "Sugerido por IA" mientras `AIRecommendation.accepted=false` (BR-AI-003).
- Si el usuario **edita** antes de aceptar, se marca `AIRecommendation.edited=true` (Doc 6).
- Si el usuario **rechaza**, la `AIRecommendation` permanece con `accepted=false` para trazabilidad.
- Regenerar genera un **nuevo** `AIRecommendation`, sin pisar el anterior.

---

## 19. Reglas de persistencia y trazabilidad

Toda salida IA se persiste como `AIRecommendation` (Doc 6 §11), con los siguientes campos relevantes:

| Campo | Obligatorio | Uso |
|---|---|---|
| `id` | Sí | PK |
| `requested_by_user_id` | Sí | Auditoría / aislamiento |
| `event_id` | Sí (para plan/checklist/budget/categorías/brief/comparación/priorización) | Vínculo al evento |
| `vendor_profile_id` | Sí (para AI-007) | Vínculo al perfil |
| `type` | Sí | enum: `event_plan`, `checklist`, `budget_suggestion`, `vendor_categories`, `quote_brief`, `quote_comparison`, `vendor_bio`, `task_prioritization` |
| `input_payload` | Sí | Snapshot de entrada (sanitizado) |
| `output_payload` | Sí | Salida del modelo |
| `prompt_version_id` | Sí | Vínculo a `AIPromptVersion` o hash de prompt |
| `llm_provider` | Sí | `openai`, `anthropic`, `mock` |
| `language_code` | Sí | Idioma usado |
| `accepted` | Sí (default false) | Estado humano |
| `accepted_at` | No | Marca al aceptar |
| `edited` | No | True si hubo edición antes de aceptar |
| `latency_ms` | No | Métrica técnica |
| `token_count` | No | Coste |
| `fallback_used` | No | True si se usó plantilla/Mock |

Materialización de entidades derivadas:

- **AI-002 → `EventTask`:** al aceptar tarea, crear `EventTask` con `ai_generated=true`, `ai_recommendation_id` vinculado, `status="pending"` (BR-TASK-003).
- **AI-003 → `BudgetItem`:** al aceptar items, crear `BudgetItem` con `ai_generated=true`, `ai_recommendation_id` vinculado.
- **AI-004 → `QuoteRequest` (indirecto):** las categorías aceptadas pueden disparar la creación de `QuoteRequest` por categoría, pero la decisión final es del usuario.
- **AI-005 → `QuoteRequest.brief`:** al enviar, copiar `brief` al campo y marcar `QuoteRequest.ai_generated_brief=true`.
- **AI-006:** sin materialización directa.
- **AI-007 → `VendorProfile.bio` / `VendorService.description`:** al aceptar, copiar texto y marcar `ai_generated_bio`/`ai_generated_description = true`.
- **AI-008:** sin materialización; solo lectura.

Reglas adicionales:

- La salida IA **nunca** sobrescribe datos oficiales sin confirmación humana (BR-AI-001).
- En cada regeneración se crea un **nuevo** `AIRecommendation`; el anterior queda histórico.
- Las entidades creadas a partir de IA mantienen `ai_generated=true` aun después de ser editadas por el usuario, salvo que el usuario las recree manualmente.
- El admin puede consultar `AIRecommendation` para auditoría global (BR-ADMIN-008).

---

## 20. Modelo de proveedor IA

### 20.1 Capa de abstracción

EventFlow implementa una interfaz `AIProvider`/`LLMProvider` (Doc 2 §4, Doc 3 §8.4, BR-AI-005, decisión PO 8.1 #15) con la siguiente estrategia para el MVP:

| Provider | Estado MVP | Uso |
|---|---|---|
| `AIProvider` interface | **Obligatoria MVP** | Contrato común para todas las implementaciones. Sin acoplamiento a un SDK específico. |
| `OpenAIProvider` | **Funcional MVP — principal** | Producción y demos con red. Implementa la interfaz completa. |
| `MockAIProvider` | **Funcional MVP — obligatorio** | Tests automatizados, demos controladas, modo offline, fallback ante timeout/error. |
| `AnthropicProvider` | **Stub / Futuro — opcional, no funcional en MVP** | Solo contrato preparado para evolución futura. **No se requiere operatividad en MVP.** Sin SDK ni configuración productiva. |

> **Regla canónica del proveedor (decisión PO 8.1 #15):**
>
> ```text
> AIProvider interface is required.
> OpenAIProvider is the primary functional MVP provider.
> MockAIProvider is required for testing/demo.
> AnthropicProvider is future or optional stub, not required as functional MVP implementation.
> ```
>
> No se requiere selector dinámico de proveedor en UI, ni failover automático OpenAI → Anthropic, ni comparación real OpenAI vs Anthropic. Estas capacidades quedan diferidas a versiones posteriores.

### 20.2 Interfaz recomendada

```ts
interface AIProvider {
  generateEventPlan(input: EventPlanInput, ctx: AIContext): Promise<EventPlanOutput>;
  generateChecklist(input: ChecklistInput, ctx: AIContext): Promise<ChecklistOutput>;
  suggestBudget(input: BudgetSuggestionInput, ctx: AIContext): Promise<BudgetSuggestionOutput>;
  recommendVendorCategories(input: VendorCategoriesInput, ctx: AIContext): Promise<VendorCategoriesOutput>;
  generateQuoteBrief(input: QuoteBriefInput, ctx: AIContext): Promise<QuoteBriefOutput>;
  compareQuotes(input: QuoteComparisonInput, ctx: AIContext): Promise<QuoteComparisonOutput>;
  generateVendorBio(input: VendorBioInput, ctx: AIContext): Promise<VendorBioOutput>;
  prioritizeTasks(input: TaskPrioritizationInput, ctx: AIContext): Promise<TaskPrioritizationOutput>;
}

interface AIContext {
  language: LanguageCode;     // 'es-LATAM' | 'es-ES' | 'pt' | 'en'
  currency?: CurrencyCode;    // 'GTQ' | 'EUR' | 'MXN' | 'COP' | 'USD'
  userId: string;
  eventId?: string;
  vendorProfileId?: string;
  promptVersionId: string;
  timeoutMs: number;          // default 60_000 (1 min) por BR-AI-009 / decisión PO 8.1 #9
}
```

### 20.3 Selección de provider

- **`env var` `LLM_PROVIDER`** con valores `openai | mock` (operativos en MVP). El valor `anthropic` queda permitido en el enum como contrato preparado, pero **no opera funcionalmente en MVP** (decisión PO 8.1 #15).
- En desarrollo/test/demo, por defecto `mock`.
- En producción/staging, por defecto `openai`.
- Cualquier cambio entre `openai` y `mock` **no requiere recompilar** ni modificar la lógica de negocio (BR-AI-005).
- **No se implementa selector dinámico de proveedor en UI** ni **failover automático a Anthropic**. La degradación ante error/timeout va a `MockAIProvider` o a plantilla estática, nunca a Anthropic.

### 20.4 Modelo recomendado por feature

| Feature | Provider primario | Modelo sugerido | Notas |
|---|---|---|---|
| AI-001 a AI-005 | OpenAI | Modelo flagship con buena adherencia a JSON | Doc 2 §4 (modelos flagship para razonamiento). |
| AI-006 | OpenAI | Flagship con caching si aplica | Doc 2 §4 (Anthropic caching como alternativa). |
| AI-007 | OpenAI | Modelo eficiente (mini/nano) | Texto corto; ahorrar tokens. |
| AI-008 | OpenAI | Modelo eficiente | Output corto. |

> La decisión de modelo concreto puede diferirse a la fase de implementación; el documento prescribe arquitectura, no SKU.

### 20.5 Anti-patrones a evitar

- Acoplar la lógica de negocio al SDK específico (OpenAI o Anthropic) — BR-AI-005.
- Asumir capacidades exclusivas de un provider en la capa de dominio.
- Orquestación compleja, vector DBs o RAG: **no requeridos por los documentos fuente** y descartados por overengineering (Doc 3 §4 principios).

---

## 21. Estrategia de prompts y versionado

### 21.1 Plantillas por feature

Cada feature IA tiene una o más plantillas de prompt versionadas (BR-AI-010, Doc 6 §12 `AIPromptVersion`). Cada plantilla incluye:

- **System instruction:** tono, restricciones globales, formato JSON estricto, recordatorio "sugerencia editable".
- **User instruction:** contexto del evento/proveedor (datos sanitizados).
- **Output schema:** JSON ejemplificado.
- **Locale:** idioma destino (es-LATAM, es-ES, pt, en).

### 21.2 Versionado

- Cada plantilla se versiona con `semver` (`1.0.0`, `1.1.0`) o `git hash`.
- La versión se registra en `AIRecommendation.prompt_version_id`.
- El cambio de versión no rompe registros históricos; permite reproducir el output original.
- Recomendado mantener las plantillas en repositorio Git con review formal de prompts antes de promover.

### 21.3 Multi-idioma

- Los prompts reciben `language_code` y devuelven el output en ese idioma (BR-AI-011, BR-I18N-007).
- No se requieren modismos profundos por país (BR-I18N-006).
- Inglés es no negociable (BR-I18N-001).

### 21.4 Salvaguardas comunes en los prompts

- "Devuelve **solo JSON válido** según el schema. No agregues texto fuera del objeto raíz."
- "**No inventes** proveedores específicos, marcas, precios de mercado, ni credenciales no provistas en el input."
- "**No comprometas** pagos, contratos ni acuerdos legales en nombre del usuario."
- "Recuerda al usuario que la salida es una **sugerencia editable**."
- "Si el input es insuficiente, devuelve `warnings` y solicita los datos faltantes en lugar de inventarlos."
- "Respeta el idioma `{language_code}` en toda la respuesta."

### 21.5 Caché

- Permitir cache por `(feature, prompt_version_id, input_hash)` (BR-AI-013).
- Útil en demo y para reducir costos en escenarios repetidos.

### 21.6 No producción de prompts largos en este documento

Las plantillas completas (texto del prompt) son artefacto independiente del repositorio (ver `/prompts/` futuro). Este documento define **estrategia**, no el texto exacto.

---

## 22. Fallback, errores y MockAIProvider

### 22.1 Tabla de errores y comportamiento

| Error scenario | User-facing behavior | System behavior | Fallback |
|---|---|---|---|
| LLM_UNAVAILABLE (red, 5xx) | Banner: "Generamos una versión base mientras restablecemos la IA." | Log + métrica de error; `AIRecommendation.fallback_used=true`. | Plantilla estática por tipo de evento / `MockAIProvider`. |
| LLM_TIMEOUT (**> 60 000 ms / 1 minuto** — decisión PO 8.1 #9) | Mostrar **error controlado**: "La generación tomó más de lo esperado. Generamos una versión base mientras la IA se recupera." | Cancelar request al alcanzar el timeout; log de evento; `AIRecommendation.fallback_used=true`. | En modo demo/testing (`LLM_PROVIDER=mock` o flag equivalente): degradar a `MockAIProvider`. En producción sin modo demo: mostrar error controlado y permitir reintento manual. |
| INVALID_JSON | Mensaje: "Reintentando..." y, si falla, "Usamos plantilla base." | Reintento único; si vuelve a fallar, fallback. | Plantilla / `MockAIProvider`. |
| UNSAFE_OR_IRRELEVANT_OUTPUT | "No pudimos generar una respuesta confiable." | Marcar `AIRecommendation` con flag de descarte. | No materializar; sugerir reintento manual. |
| UNSUPPORTED_LANGUAGE | "Idioma no soportado. Usando español LATAM." | Forzar `es-LATAM`. | Continuar con idioma base. |
| MISSING_REQUIRED_INPUT | Validación frontend + 400 al backend con campos faltantes. | No invocar al provider. | Pedir al usuario los datos faltantes. |
| PROVIDER_QUOTA_EXCEEDED | "Servicio IA temporalmente saturado." | Alerta operativa. | `MockAIProvider`. |
| USER_CANCELS_GENERATION | Cancelación silenciosa. | Abortar request; no persistir. | Ninguno. |
| USER_REJECTS_OUTPUT | Tomar nota silenciosa. | `AIRecommendation.accepted=false` queda; no materializa entidades. | El usuario puede regenerar. |
| MOCK_MODE_ACTIVE | UI puede mostrar badge "Modo demo IA". | `LLM_PROVIDER=mock`. | Outputs deterministas. |

### 22.2 MockAIProvider — comportamiento esperado

- **Determinista**: mismo input → mismo output.
- Output válido contra el JSON schema de cada feature.
- Datos coherentes con la cultura LATAM y con los tipos de evento del MVP.
- Permite escenarios de error simulados via `env var` (`MOCK_FORCE_TIMEOUT`, `MOCK_FORCE_INVALID_JSON`) para QA.
- No depende de red.
- Pretende ser usable tanto para tests como para la demo guiada.

### 22.3 Plantillas estáticas por tipo de evento

- Existen plantillas estáticas curadas (en código/seed) por `event_type_code` para AI-001, AI-002, AI-003, AI-004 (BR-EVENTTYPE-002, BR-EVENTTYPE-003).
- Las plantillas se usan tanto como **fallback** como base inicial sobre la que la IA personaliza.
- Cumplen BR-EVENTTYPE-004 (coherencia cultural LATAM) y BR-EVENTTYPE-005 (multi-idioma).

### 22.4 Regla canónica de timeout y fallback (decisión PO 8.1 #9)

```text
If an AI request exceeds 1 minute (60 000 ms), the system must stop waiting and
show a controlled error or use fallback/MockAIProvider when demo/testing mode is
enabled.
```

- **Valor del timeout:** 60 000 ms, configurable vía `AI_TIMEOUT_MS` para no acoplar el valor al código fuente.
- **Comportamiento por entorno:**
  - `LLM_PROVIDER=mock` (demo/test): degradar a `MockAIProvider` y mostrar badge "Modo demo IA".
  - `LLM_PROVIDER=openai` (producción/staging): mostrar error controlado y permitir reintento manual; no se degrada automáticamente a Anthropic.
- **Trazabilidad:** todo timeout debe quedar registrado en `AIRecommendation` con `fallback_used=true` cuando aplique, y en métricas operativas para análisis de SLOs.

---

## 23. Seguridad, privacidad y manejo de datos

Alineado con BR-PRIVACY-001 a BR-PRIVACY-010 y los principios del Doc 3 §17.

### 23.1 Principios

- **Minimización**: enviar al LLM solo lo necesario (`event_type`, fechas, `guests_count`, `location`, `budget`, `currency`, `language`, snippets de `Quote` para AI-006).
- **No enviar** contraseñas, hashes, tokens, IDs de tarjetas, datos de identificación, contenido legal, contratos.
- **No enviar** el detalle completo de contactos del organizador en prompts. El email/teléfono del organizador no se envía al LLM salvo si el organizador lo redacta manualmente en un brief.
- **Sanitización** del `input_payload` antes de persistirlo en `AIRecommendation`.
- **Aislamiento**: la IA respeta el modelo de permisos (BR-AUTH-009, BR-PRIVACY-003). Un organizador nunca recibe `AIRecommendation` ajena.
- **Privacidad de outputs**: las recomendaciones de un usuario no son visibles para otros usuarios, salvo lectura del admin para auditoría (BR-ADMIN-008).
- **Logs sin secretos**: ni la API key del LLM ni datos sensibles aparecen en logs (BR-PRIVACY-001).
- **Admin sin moderación IA en MVP** (BR-REVIEW-006).

### 23.2 Datos prohibidos en prompts

| Categoría | Prohibido | Permitido |
|---|---|---|
| Identificación | DPI/INE/Cédula/Passport | Nombre del organizador (si esencial al brief) |
| Pago | Tarjeta, CVV, IBAN | — |
| Contacto | Email/teléfono completos del organizador | Email/teléfono del proveedor si forma parte del perfil público |
| Legal | Cláusulas contractuales | — |
| Salud | Cualquier dato clínico | — |
| Ideología/Biometría | Cualquier dato | — |

### 23.3 Retención

- `AIRecommendation` se retiene mientras exista el evento o el perfil del proveedor.
- Al eliminar lógicamente un `Event`/`VendorProfile`, las recomendaciones asociadas se mantienen para trazabilidad pero se anonimizan donde aplique.
- No hay export ni borrado automatizado en MVP.

### 23.4 Almacenamiento de prompts

- Los textos completos de prompts se mantienen en repositorio Git versionado.
- `AIPromptVersion` registra metadatos; el texto puede estar en código o en tabla.
- No almacenar API keys en BD ni en el repositorio.

---

## 24. Riesgos de IA y mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigación |
|---:|---|---|---|---|
| R1 | Alucinaciones (precios de mercado, proveedores específicos, fases irrelevantes) | Alta | Medio-Alto | Plantillas por tipo de evento, restricciones explícitas en el prompt, validación humana obligatoria (BR-AI-001). |
| R2 | Output IA en idioma incorrecto | Media | Medio | Pasar `language_code` como parámetro, validar idioma del output, forzar `es-LATAM` si no se detecta. |
| R3 | Sesgo cultural (omitir padrinos, hora loca, candy bar) | Media | Medio | Plantillas curadas con modismos LATAM (BR-EVENTTYPE-004). |
| R4 | Latencia percibida que frustra UX | Media | Medio | Streaming, skeleton loaders, fallback a plantilla (BR-AI-012). |
| R5 | Costos de tokens fuera de presupuesto | Media | Medio | Caché por feature, modelos económicos, `MockAIProvider` en demo (BR-AI-013). |
| R6 | Dependencia de un único proveedor LLM | Media | Medio | Capa `LLMProvider`, preparar `AnthropicProvider` (BR-AI-005). |
| R7 | Falta de trazabilidad de prompts | Baja-Media | Alto | `AIPromptVersion` y `prompt_version_id` en cada `AIRecommendation` (BR-AI-010). |
| R8 | Datos personales filtrados a logs IA | Baja | Alto | Sanitización + revisión de logs (BR-PRIVACY-001, BR-PRIVACY-002). |
| R9 | Usuario percibe IA como vinculante (especialmente AI-006) | Media | Medio | Texto explícito "no vinculante", disclaimer visible, edición obligatoria. |
| R10 | Output JSON inválido bloquea el flujo | Media | Medio | Reintento único + fallback a plantilla (BR-AI-009). |
| R11 | Spam de regeneraciones eleva el coste | Media | Medio | Rate limit por usuario por feature; caché. |
| R12 | Bio del proveedor con credenciales inventadas | Media | Medio-Alto | Restricción explícita en prompt y revisión admin (BR-VENDOR-001). |
| R13 | Comparador IA introduce sesgo a favor del precio más bajo | Media | Medio | Prompt instruido para considerar inclusiones, validez, riesgos. |
| R14 | Filtración de `AIRecommendation` entre usuarios | Baja | Alto | Aislamiento estricto por `requested_by_user_id` y por `event_id` (BR-AUTH-009). |
| R15 | Uso accidental de `MockAIProvider` en producción | Baja | Medio | `env var` clara + alerta operativa si `LLM_PROVIDER=mock` en prod. |

---

## 25. Criterios de aceptación por feature IA

Los criterios completos están incluidos por feature en la sección 10. Resumen consolidado:

| Feature | Aceptación clave |
|---|---|
| AI-001 | Plan estructurado, no inventa proveedores, persistido como `AIRecommendation`, fallback a plantilla. |
| AI-002 | Tareas con `relative_due_date` y `priority`, materializables como `EventTask` con `ai_generated=true`, recálculo si cambia `event_date`. |
| AI-003 | Distribución coherente con `total_budget`, en la moneda del evento, materializable como `BudgetItem` al aceptar. |
| AI-004 | Categorías existentes en `ServiceCategory`, con `must_have`/`should_have`/`optional`. |
| AI-005 | Brief en el idioma del evento, sin datos sensibles, vinculado a `QuoteRequest.brief` al enviar. |
| AI-006 | Resumen con frase "no vinculante", no altera las `Quote` originales, requiere ≥2 `Quote`. |
| AI-007 | Bio sin credenciales inventadas, requiere aprobación admin del perfil, materializable como `VendorProfile.bio`. |
| AI-008 | Máximo 3 acciones, no requiere materialización, fallback determinista local. |

Criterios transversales:

- Todas las features registran `AIRecommendation` con `accepted=false` por defecto.
- Todas respetan el idioma del evento/usuario.
- Todas tienen comportamiento de fallback verificable.
- Todas distinguen visualmente "sugerido" vs "confirmado" (BR-AI-003).
- Ninguna sobrescribe datos oficiales sin confirmación humana (BR-AI-001).

---

## 26. Escenarios de prueba para QA

### 26.1 Escenarios funcionales positivos

| # | Escenario | Resultado esperado |
|---:|---|---|
| 1 | Organizador con evento `active`, datos completos, idioma es-LATAM → genera plan IA. | JSON válido, `AIRecommendation(type=event_plan)`. |
| 2 | Organizador acepta checklist completo. | `EventTask`s creadas con `ai_generated=true`. |
| 3 | Organizador edita la sugerencia de presupuesto y acepta. | `BudgetItem`s creados con `ai_generated=true`, `AIRecommendation.edited=true`. |
| 4 | Organizador genera brief, lo envía a 2 proveedores → recibe 2 `Quote` → solicita comparación. | Resumen con `non_binding_recommendation`. |
| 5 | Proveedor genera bio, edita texto y acepta. | `VendorProfile.bio` actualizada, `ai_generated_bio=true`. |
| 6 | Organizador con evento en idioma `en` solicita plan. | Output en inglés. |
| 7 | Organizador con moneda `EUR` solicita presupuesto. | `currency = "EUR"` en output; sin conversión. |
| 8 | Organizador cancela generación. | No se persiste `AIRecommendation`. |

### 26.2 Escenarios funcionales negativos

| # | Escenario | Resultado esperado |
|---:|---|---|
| 9 | Organizador intenta generar plan para evento ajeno. | 403/404 (BR-AUTH-009). |
| 10 | Organizador intenta solicitar comparación con 1 `Quote`. | Error `INSUFFICIENT_QUOTES`. |
| 11 | Vendor intenta generar plan IA. | 403 (BR-AUTH-006/007). |
| 12 | Admin intenta moderar reseñas con IA. | 403 / no implementado (BR-REVIEW-006). |
| 13 | Proveedor del directorio intenta usar IA para perfil ajeno. | 403 (BR-VENDOR-008, BR-AUTH-009). |

### 26.3 Escenarios de robustez (fallback)

| # | Escenario | Resultado esperado |
|---:|---|---|
| 14 | Provider devuelve 5xx. | `AIRecommendation.fallback_used=true`, plantilla estática mostrada. |
| 15 | Provider devuelve JSON inválido. | 1 reintento; si falla, plantilla. |
| 16 | Provider tarda más del timeout. | Cancelar y degradar a `MockAIProvider`. |
| 17 | `LLM_PROVIDER=mock` activo. | Outputs deterministas, sin red. |
| 18 | Idioma no soportado. | Forzar `es-LATAM` con warning. |

### 26.4 Escenarios de aislamiento

| # | Escenario | Resultado esperado |
|---:|---|---|
| 19 | Listar `AIRecommendation` por usuario A no muestra las de B. | Aislamiento confirmado. |
| 20 | Admin consulta `AIRecommendation` global. | Acceso permitido para auditoría (BR-ADMIN-008). |

### 26.5 Escenarios de moneda e idioma

| # | Escenario | Resultado esperado |
|---:|---|---|
| 21 | Comparar `Quote` en monedas distintas. | Warning + sin conversión. |
| 22 | Evento en moneda `GTQ` → output respeta `GTQ` y no convierte. | Confirmado. |

### 26.6 Escenarios seed/demo

| # | Escenario | Resultado esperado |
|---:|---|---|
| 23 | Demo con `MockAIProvider`. | Plan/checklist/presupuesto deterministas; demo reproducible. |
| 24 | Cargar seed con `AIRecommendation.is_seed=true`. | Distinguibles en consulta. |

---

## 27. Escenarios seed/demo para IA

Para la demo guiada (Doc 3 §14.4), se requiere lo siguiente:

| Item | Cantidad | Notas |
|---|---:|---|
| Eventos seed con `AIRecommendation(type=event_plan, accepted=true)` | 5–8 | Cubrir los 6 tipos (wedding, xv, baptism, baby_shower, birthday, corporate). |
| Eventos con checklist IA aceptada y `EventTask` materializadas | 5–8 | `ai_generated=true`. |
| Eventos con `BudgetItem` IA materializados | 5–8 | `ai_generated=true`. |
| Eventos con `QuoteRequest.ai_generated_brief=true` | 8–12 | Brief autocompletado. |
| Eventos con ≥2 `Quote` para misma categoría + `AIRecommendation(type=quote_comparison)` | 2–3 | Cubrir AI-006. |
| Vendors con `VendorProfile.ai_generated_bio=true` | 4–6 | Cubrir AI-007. |
| Evento con `AIRecommendation(type=task_prioritization)` | 1–2 | Cubrir AI-008. |
| Escenario de fallback IA documentado en seed | 1 | `fallback_used=true` para demo. |

Reglas:

- Todo seed lleva `is_seed=true` (BR-SEED-005).
- Idiomas variados: al menos un evento por idioma soportado.
- Monedas variadas: al menos un evento por moneda (GTQ, EUR, MXN, USD).
- Reset reproducible vía script único (BR-SEED-001).
- `MockAIProvider` debe poder reemplazar al provider real durante toda la demo (BR-AI-006).

---

## 28. Métricas de evaluación de IA

### 28.1 Métricas de producto

| Métrica | Definición | Objetivo MVP |
|---|---|---|
| AI plan acceptance rate | `AIRecommendation(type=event_plan, accepted=true) / total event_plan` | ≥ 60% en demo. |
| Checklist usefulness | % de `EventTask` IA aceptadas sin edición destructiva | ≥ 70%. |
| Budget suggestion acceptance rate | % de `BudgetItem` IA aceptados | ≥ 60%. |
| Quote comparison usefulness | % de `AIRecommendation(type=quote_comparison)` consultadas más de una vez | Tracking. |
| AI output edit rate | `AIRecommendation.edited=true / accepted=true` | Tracking. |
| AI regeneration rate | Regeneraciones por feature por sesión | < 3 promedio. |

### 28.2 Métricas técnicas

| Métrica | Objetivo |
|---|---|
| Latencia P95 endpoints IA | < 8s con streaming (Doc 3 §14.3). |
| Tasa de error IA | < 5%. |
| Tasa de `fallback_used` | < 10% en condiciones normales. |
| Cobertura de pruebas en lógica crítica IA | ≥ 50%. |
| Tasa de éxito con `MockAIProvider` | 100%. |

### 28.3 Métricas académicas

| Métrica | Objetivo |
|---|---|
| # features IA implementadas | ≥ 5 (Must Have completas). |
| # prompts versionados | ≥ 1 por feature. |
| # `AIRecommendation` persistidas | > 0 por feature en demo. |
| Trazabilidad evidente en panel admin | Sí (BR-ADMIN-008). |
| Demostración de fallback | Sí (al menos 1 escenario). |

### 28.4 Métricas de demo

| Métrica | Objetivo |
|---|---|
| Tiempo desde "Crear evento" a "Plan IA aceptado" | < 10 minutos en demo guiada (Doc 3 §3.1). |
| Tiempo de generación de checklist | < 30s. |
| Reset de demo | < 2 minutos. |
| Toggle `OpenAIProvider` ↔ `MockAIProvider` sin recompilar | Operativo. |

---

## 29. Roadmap de IA post-MVP

### Versión 1.1 (post-MVP cercano)

- **AI Event Summary** (BR-FUTURE-013): resumen ejecutivo del evento al cierre.
- **AI Inconsistency Detection** (BR-FUTURE-015): inconsistencias entre `Budget` y `Quote`/`BookingIntent`.
- **AI Message Generation** estructurada para follow-up entre roles.
- Caché avanzado de prompts (BR-AI-013).
- Streaming optimizado.

### Versión 2.0 (comercial)

- **AI Vendor Recommendation** con ranking (BR-FUTURE-012).
- **AI Sentiment Analysis** sobre reseñas (BR-FUTURE-008).
- **AI Moderation** con revisión humana (BR-FUTURE-009).
- **WhatsApp AI Assistant** post-integración WhatsApp (BR-FUTURE-007).
- Vector DB y RAG para recomendaciones basadas en histórico real.

### Futuro comercial (v2.0+)

- Generación de imágenes y assets visuales (BR-AI-015 levantado).
- Voice assistants (web/móvil).
- AI Copilot conversacional con guardrails sobre datos del workspace.
- Recomendación de precios "rangos de mercado" basada en data agregada real (con disclaimer).

---

## 30. Preguntas abiertas o decisiones pendientes

### 30.1 Decisiones resueltas por el addendum 8.1

| # | Pregunta original | Decisión PO 8.1 | Estado |
|---:|---|---|---|
| 3 | Timeout exacto antes de degradar a `MockAIProvider` (BR-AI-009) | **1 minuto (60 000 ms)** (decisión PO 8.1 #9) | Resuelta |
| 4 | `AnthropicProvider` operativo en MVP (BR-AI-005) | **No funcional en MVP**; basta interfaz preparada como stub/futuro (decisión PO 8.1 #15) | Resuelta |

### 30.2 Preguntas abiertas remanentes

Estas decisiones técnicas no bloquean el FRD; quedan para la fase de implementación.

| # | Pregunta abierta | Impacto |
|---:|---|---|
| 1 | ¿Qué modelo concreto de OpenAI se usa por feature en MVP (flagship vs mini)? | Medio (costos y latencia). |
| 2 | ¿Se persiste el `AIRecommendation(type=quote_comparison)` o se regenera bajo demanda sin almacenar payload? | Bajo (caché o stateless). |
| 5 | ¿Se implementa caché de outputs IA por hash de input en MVP? (BR-AI-013) | Bajo. |
| 6 | ¿Cuántas regeneraciones por feature por sesión son aceptables antes de rate-limit? | Bajo. |
| 7 | ¿La priorización (AI-008) se ejecuta en cada carga de dashboard o bajo demanda explícita del usuario? | Medio (costos). |
| 8 | ¿Cuál es la escala numérica del `Quote.total_price` aceptable como input al modelo (decimal vs integer en centavos)? | Bajo. |
| 9 | ¿Las plantillas estáticas por tipo de evento viven en código o como `AIPromptVersion` con `template`? | Bajo. |
| 10 | ¿Quién valida la curaduría cultural LATAM de las plantillas seed y de los prompts? (BR-EVENTTYPE-004) | Medio. |

---

## 31. Resumen final

Este documento especifica las **funcionalidades de IA del MVP de EventFlow** a partir de la lectura, extracción, clasificación y validación de los seis documentos fuente. Las decisiones clave son:

- **8 features IA dentro del MVP** (5 Must Have, 2 Should Have, 1 Could Have): AI-001 a AI-008.
- **5 features futuras** que extienden el copiloto sin romper la cuña.
- **11 capacidades fuera de alcance** (sentiment, moderación, fraude, ranking de proveedores, chat libre, WhatsApp, generación de imágenes, contratos, pagos autónomos, aprobación autónoma de proveedores, recomendaciones vinculantes).
- **Capa de abstracción `LLMProvider`** con `OpenAIProvider` (principal), `MockAIProvider` (obligatorio) y `AnthropicProvider` (opcional).
- **Validación humana obligatoria** sobre todas las salidas IA (BR-AI-001, BR-AI-002, BR-AI-003).
- **Trazabilidad completa** vía `AIRecommendation` con `prompt_version_id`, `llm_provider`, `language_code`, `accepted`, `edited`, `fallback_used`.
- **Fallback obligatorio** a plantillas estáticas o `MockAIProvider` ante fallas del proveedor LLM (BR-AI-009).
- **Multi-idioma** (es-LATAM base, es-ES, pt, en) y **moneda configurable** (GTQ, EUR, MXN, COP, USD), sin conversión automática.
- **Seguridad y privacidad** alineadas con BR-PRIVACY-* y BR-AUTH-009.

La IA del MVP de EventFlow se enmarca dentro de la filosofía estratégica del producto:

> **EventFlow es un workspace de planificación asistido por IA, no un marketplace transaccional ni un asistente conversacional libre.** La IA asiste decisiones; el humano las toma.

Este documento es la **fuente única de verdad de IA** para el MVP. Cualquier cambio sustantivo (nueva feature IA, eliminación de feature Must Have, cambio de proveedor principal, cambio de comportamiento de fallback) requiere actualización formal del documento y aprobación del Product Owner antes de ejecutarse.

> **Próximo paso recomendado:** convertir las features Must Have y Should Have de este catálogo en **user stories**, **criterios de aceptación detallados** y **contratos de API IA**, asegurando que cada `AIRecommendation.type` definido en el modelo de datos tenga al menos una historia de usuario, una plantilla de prompt versionada en `AIPromptVersion` y un escenario QA verificable.
