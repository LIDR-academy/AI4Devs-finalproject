# EventFlow — MVP Scope Definition

> Plataforma de planificación de eventos y gestión de proveedores asistida por IA
> Versión: 1.0 — MVP Scope Definition
> Idioma: Español LATAM neutral
> Audiencia: Product Owner, equipo de desarrollo asistido por IA, comité académico, evaluadores de portafolio
> Documentos fuente: `1-Domain-Discovery-Report.md`, `2-Product-Owner-Decisions.md`

---

## 1. Propósito del documento

Este documento define de forma explícita y trazable el **alcance del MVP de EventFlow**. Su objetivo es servir como **fuente única de verdad** para las siguientes fases del proyecto (requisitos detallados, arquitectura, user stories, implementación, pruebas y demo) y como **mecanismo de control de alcance** frente al riesgo de sobre-ingeniería identificado en el Discovery.

El documento responde, de manera operativa, a cinco preguntas:

1. ¿Qué se construye en el MVP?
2. ¿Qué se excluye del MVP?
3. ¿Qué se simula, mockea o entrega como seed?
4. ¿Qué reglas, riesgos y criterios definen MVP terminado?
5. ¿Qué queda para el roadmap post-MVP?

Refuerza, además, la decisión estratégica documentada en el Discovery y ratificada por el Product Owner:

> **EventFlow MVP debe construirse como un workspace de planificación asistido por IA con un flujo simplificado de descubrimiento y cotización de proveedores. NO debe construirse como un marketplace transaccional completo en v1.**

---

## 2. Resumen del MVP

EventFlow MVP es una **aplicación web responsive multilenguaje** que permite a un **organizador** crear un evento social o corporativo, generar con asistencia de IA un **plan estructurado** (timeline + checklist + presupuesto + categorías de proveedor), descubrir proveedores en un **directorio curado con datos seed**, solicitar y comparar cotizaciones de forma estructurada, y registrar una **intención de reserva simulada**; al mismo tiempo, permite a un **proveedor** mantener un perfil aprobado y responder cotizaciones, y a un **administrador** curar el catálogo, aprobar proveedores y moderar reseñas. La IA actúa siempre como **copiloto sugerente**, con validación humana obligatoria, sobre una **capa de abstracción** que permite usar OpenAI, Anthropic o un MockAIProvider.

---

## 3. Objetivos del MVP

### 3.1 Objetivos de producto

- Demostrar que un organizador puede pasar de **idea suelta** a **plan accionable** (timeline + checklist + presupuesto) en **menos de 10 minutos**, asistido por IA.
- Demostrar el **flujo bilateral** organizador ↔ proveedor mediante una solicitud y respuesta estructurada de cotización.
- Demostrar gobernanza mínima del catálogo mediante un panel admin funcional.
- Demostrar la cuña de **workspace conversacional IA multi-evento en español LATAM**, evitando convertirse en un marketplace transaccional.

### 3.2 Objetivos académicos

- Cubrir el **ciclo completo de software asistido por IA**: discovery, requisitos, arquitectura, diseño, código, pruebas, deploy y demo.
- Generar **evidencia trazable** del uso de IA en cada fase (documentos, prompts, decisiones humanas, ADRs).
- Cumplir la rúbrica académica priorizada: flujo E2E, generación IA, multi-rol, panel admin, seed reproducible, tests críticos, deploy funcional y documentación.

### 3.3 Objetivos de portafolio

- Construir un proyecto **demostrable end-to-end** con datos seed que muestren un producto vivo (eventos creados, activos y completados).
- Mostrar competencias en: integración de LLMs, modelado de dominio no trivial, multi-rol, internacionalización, decisiones de producto y diseño de prompts.
- Posicionar EventFlow como **copiloto IA para eventos sociales LATAM**, no como un clon de The Knot/Bodas.net.

### 3.4 Objetivos técnicos

- Implementar una **capa de abstracción `LLMProvider`** con al menos dos implementaciones: `OpenAIProvider` (principal) y `MockAIProvider` (demo/test). `AnthropicProvider` es opcional/preparado.
- Mantener separación clara entre frontend, backend, base de datos y capa IA.
- Soportar i18n (es-LATAM, es-ES, pt, en) y moneda configurable por evento desde el día uno.
- Garantizar **prompts versionados** y outputs IA siempre validables por el usuario.

---

## 4. Principios de alcance

Estos principios deben usarse como **filtro de decisión** ante cualquier feature propuesta durante el desarrollo.

1. **Workspace primero, marketplace después.** Si una feature solo tiene sentido en un marketplace transaccional (pagos, comisiones, contratos, chat), queda fuera del MVP.
2. **IA asiste, no decide.** Toda salida IA debe ser **sugerencia validable** por el usuario antes de convertirse en dato oficial.
3. **Simular antes que integrar.** Email, notificaciones, suscripciones y bookings se simulan en MVP; no se integran proveedores externos reales.
4. **Seed antes que captación real.** El MVP se demuestra con datos seed reproducibles; los proveedores reales son opcionales y no bloqueantes.
5. **Una sola fuente de verdad: Product Owner.** Cualquier feature no documentada en este scope requiere aprobación explícita del PO antes de implementarse.
6. **Demostrable sobre completo.** Ante el dilema "más features vs. flujo demostrable", se prioriza el flujo demostrable.
7. **Trazabilidad sobre automatización.** Todo paso asistido por IA debe registrarse para evidencia académica.
8. **Realismo emocional y cultural.** Aunque el MVP usa seed, el contenido debe ser **culturalmente coherente con LATAM** (XV años, padrinos, hora loca, marimba, etc.).

---

## 5. Usuarios y roles incluidos en el MVP

### 5.1 Organizador

- **Perfil:** Persona que organiza un evento social o corporativo.
- **Permisos clave:** Crear, editar y eliminar sus propios eventos; generar plan/checklist/presupuesto con IA; buscar proveedores aprobados; enviar `QuoteRequest`; comparar `Quotes`; marcar `BookingIntent`; dejar `Review` post-evento.
- **Restricciones:** No puede ver eventos de otros organizadores; no puede modificar perfiles de proveedores; no tiene acceso al panel admin.

### 5.2 Proveedor

- **Perfil:** Pyme o freelancer que ofrece servicios para eventos.
- **Permisos clave:** Crear y mantener su `VendorProfile` (sujeto a aprobación admin); definir `VendorService`/paquetes; recibir y responder `QuoteRequests`; confirmar `BookingIntent`; ver reseñas recibidas.
- **Restricciones:** Solo ve solicitudes dirigidas a él; no puede ver eventos completos del organizador, solo el brief de cotización; no puede modificar reseñas.

### 5.3 Administrador

- **Perfil:** Product Owner del proyecto en el escenario de demo; equipo interno en futuro.
- **Permisos clave:** Aprobar/rechazar proveedores; gestionar `ServiceCategory`; moderar `Reviews` (eliminar/ocultar contenido ofensivo); ver métricas básicas de uso; gestionar usuarios seed.
- **Restricciones:** No actúa como organizador ni proveedor en flujos comerciales; toda acción admin se registra en `AdminAction`.

### Tabla resumen de roles y permisos

| Capacidad | Organizador | Proveedor | Administrador |
|---|:---:|:---:|:---:|
| Crear/editar evento propio | ✅ | ❌ | ❌ |
| Generar plan/checklist/presupuesto IA | ✅ | ❌ | ❌ |
| Crear/editar `VendorProfile` propio | ❌ | ✅ | ❌ |
| Aprobar `VendorProfile` | ❌ | ❌ | ✅ |
| Buscar directorio público | ✅ | ✅ | ✅ |
| Enviar `QuoteRequest` | ✅ | ❌ | ❌ |
| Responder `Quote` | ❌ | ✅ | ❌ |
| Marcar `BookingIntent` | ✅ | (confirma) | ❌ |
| Crear `Review` (post evento) | ✅ | ❌ | ❌ |
| Moderar/eliminar `Review` | ❌ | ❌ | ✅ |
| Gestionar categorías | ❌ | ❌ | ✅ |
| Ver métricas globales | ❌ | ❌ | ✅ |

---

## 6. Tipos de evento incluidos

El MVP incluye **seis tipos de evento**, según decisión del Product Owner (sección 3, fila 2 del documento de decisiones):

| Código (slug) | Nombre | Origen estratégico |
|---|---|---|
| `wedding` | Boda | Tipo de evento ancla, alto valor emocional y económico |
| `xv` | XV años | Diferenciador cultural LATAM frente a competidores globales |
| `baptism` | Bautizo | Diferenciador LATAM, evento social familiar |
| `baby_shower` | Baby shower | Evento social de alta frecuencia |
| `birthday` | Cumpleaños | Evento masivo, base amplia de usuarios |
| `corporate` | Evento corporativo | Diversifica el portafolio y abre vector B2B futuro |

Cada `EventType` debe tener:

- Plantilla por defecto de **categorías de proveedor** sugeridas.
- Plantilla por defecto de **tareas** con fechas relativas (T-180, T-90, T-30, T-7, T-1).
- Plantilla por defecto de **distribución de presupuesto** por categoría.
- Idiomas soportados: es-LATAM (base), es-ES, pt, en.

> **Supuesto:** Las plantillas iniciales son curadas manualmente por el equipo; la IA personaliza sobre esa base. No se construyen plantillas dinámicas auto-generadas en MVP.

---

## 7. Alcance funcional incluido

### 7.1 Autenticación y roles

- Registro y login por email + password.
- OAuth opcional con Google (recomendado, no obligatorio).
- Asignación de rol al registrarse: organizador o proveedor (admin se crea por seed/configuración).
- Recuperación de contraseña básica (link por email simulado o real, según infra disponible).
- Sesión persistente.

### 7.2 Gestión de eventos

- Wizard de creación: tipo de evento, fecha tentativa, número de invitados, ciudad, presupuesto estimado, moneda, idioma.
- Estados: `draft` → `active` → `completed` | `cancelled`.
- Listado de eventos del organizador con filtros básicos (estado, tipo).
- Edición y eliminación por el owner.
- Dashboard por evento con progreso, próximas tareas, presupuesto comprometido y cotizaciones activas.

### 7.3 Planificación asistida por IA

- Botón "Generar plan" disponible tras crear el evento.
- Output IA: timeline macro + categorías de proveedor sugeridas.
- Vista de revisión donde el usuario acepta, edita o regenera.
- Marcado visual claro de "sugerido por IA" vs "confirmado".
- Registro en `AIRecommendation` con `accepted: true/false`.

### 7.4 Checklist de tareas

- Generación IA de tareas con fechas relativas al evento.
- Estados: `pending` → `in_progress` → `done` | `skipped`.
- Edición individual y en bloque.
- Filtros por estado y rango temporal (próximos 7/30 días).
- Indicador visual de tareas próximas o vencidas.

### 7.5 Presupuesto

- IA sugiere distribución por categorías a partir del total, tipo de evento e invitados.
- `BudgetItem` por categoría con `planned`, `committed`, `paid` (este último opcional en MVP).
- Cálculo en vivo de `committed` al aceptar cotizaciones (`BookingIntent`).
- Warning visual si `committed > total` (no bloquea).
- Moneda configurable por evento; sin conversión automática.

### 7.6 Directorio de proveedores

- Búsqueda por categoría, ciudad y rango de precio.
- Lista de resultados con tarjeta resumen (nombre, ciudad, categoría, rating promedio, precio referencial).
- Solo se muestran proveedores con `VendorProfile.status = approved`.
- Marcado de favoritos por organizador.

### 7.7 Perfil de proveedor

- Datos de negocio: nombre, bio, ciudad, categorías, idiomas atendidos.
- Portafolio simple: hasta N imágenes adjuntas (recomendado 6–10).
- Paquetes (`VendorService`): nombre, categoría, precio base, descripción.
- Estado: `pending` → `approved` | `rejected`.
- Generación IA opcional de bio/descripción de paquetes (validación humana).

### 7.8 Solicitudes de cotización

- Brief estructurado autocompletado desde los datos del evento.
- Campos editables antes de enviar.
- Notificación in-app al proveedor (email simulado por log).
- Estados: `sent` → `viewed` → `responded` | `expired` | `cancelled`.
- Regla: una sola `QuoteRequest` activa por (evento, proveedor).

### 7.9 Respuestas de cotización

- Plantilla de respuesta para el proveedor: total, desglose simple, condiciones, validez (`valid_until`).
- Una `Quote` vigente por `QuoteRequest`.
- Estados: `draft` → `sent` → `accepted` | `rejected` | `expired`.

### 7.10 Comparación de cotizaciones

- Vista lado a lado de las `Quotes` recibidas para una misma categoría.
- Resumen IA opcional con diferencias clave (versión simple).
- Marcado de `preferred` por el organizador.

### 7.11 Booking intent simulado

- Disparado desde una `Quote` vigente y aceptada.
- Requiere confirmación del proveedor para pasar a `confirmed_intent`.
- Sin pago real, sin contrato firmado, sin captura de tarjeta.
- Disclaimer visible: "El acuerdo final ocurre fuera de la plataforma".

### 7.12 Reseñas

- Solo organizadores con `BookingIntent.confirmed_intent` pueden dejar reseña a ese proveedor.
- Una reseña por (evento, proveedor).
- Rating numérico + comentario.
- Visibles en el perfil del proveedor.
- Admin puede eliminar/ocultar reseñas ofensivas (sin moderación automática IA).

### 7.13 Notificaciones simuladas o in-app

- In-app: nuevas solicitudes, nuevas cotizaciones, próximas tareas (T-7), confirmación de booking.
- Email: simulado mediante log estructurado "Se habría enviado a X". Integración real con SMTP/proveedor es opcional, no bloqueante.
- Sin push notifications, sin SMS, sin WhatsApp.

### 7.14 Panel administrativo

- CRUD de `ServiceCategory`.
- Lista de proveedores con filtros por estado; acciones de aprobar/rechazar.
- Lista de reseñas con acción de eliminar/ocultar.
- Vista básica de métricas: # eventos, # cotizaciones, # proveedores aprobados, # reseñas.
- Log de acciones admin (`AdminAction`).

### 7.15 Idiomas y moneda

- Idiomas soportados: **es-LATAM (base), es-ES, pt, en**. Inglés es no negociable.
- Selector de idioma por usuario y por evento.
- Moneda configurable por evento (GTQ, EUR, MXN, COP, USD como mínimo).
- Sin conversión automática entre monedas en MVP.
- Prompts IA reciben el idioma deseado como parámetro.

### 7.16 Datos seed para demo

Mínimos requeridos por el Product Owner (sección 11 del documento de decisiones):

| Tipo de dato | Cantidad mínima |
|---|---:|
| Usuarios organizadores | 5–10 |
| Usuarios proveedores | 10–20 |
| Eventos creados | 10–15 |
| Eventos en progreso | 5 |
| Eventos finalizados | 3 |
| Eventos recién creados | 3 |
| Categorías de servicio | 10–15 |
| Solicitudes de cotización | 15–25 |
| Cotizaciones respondidas | 10–20 |
| Reseñas | 20–40 |

### Tabla resumen — Funcionalidades incluidas en el MVP

| # | Funcionalidad | Prioridad |
|---|---|---|
| 1 | Autenticación + roles | Must |
| 2 | Wizard de creación de evento | Must |
| 3 | Generación de plan IA | Must |
| 4 | Generación de checklist IA | Must |
| 5 | Presupuesto con sugerencia IA | Must |
| 6 | Directorio de proveedores | Must |
| 7 | Perfil de proveedor | Must |
| 8 | Solicitud de cotización (brief) | Must |
| 9 | Respuesta de cotización | Must |
| 10 | Comparador de cotizaciones | Must |
| 11 | Booking intent simulado | Must |
| 12 | Dashboard de progreso del evento | Must |
| 13 | Panel admin (categorías, vendors, reseñas) | Must |
| 14 | Reseñas básicas | Must |
| 15 | Notificaciones in-app + email simulado | Should |
| 16 | Resumen IA del comparador | Should |
| 17 | Generación IA de perfil de proveedor | Could |
| 18 | OAuth Google | Could |
| 19 | i18n completo (4 idiomas) | Must |
| 20 | Moneda configurable | Must |

---

## 8. Alcance de IA en el MVP

### 8.1 Features IA incluidas

| # | Feature IA | Input | Output | Validación humana |
|---|---|---|---|---|
| 1 | Generación de plan de evento | Tipo, fecha, invitados, presupuesto, ciudad | Timeline + categorías sugeridas | Aceptar/editar/regenerar |
| 2 | Generación de checklist | Plan aprobado + tipo de evento | Tareas con fechas relativas | Aceptar bloque/individual |
| 3 | Sugerencia de distribución de presupuesto | Total + tipo + invitados + ciudad | Distribución por categoría | Editable antes de guardar |
| 4 | Recomendación de categorías de proveedor | Tipo + presupuesto | Lista priorizada de categorías | Seleccionable |
| 5 | Generación de brief de cotización | Datos del evento | Brief estructurado | Editable antes de enviar |
| 6 | Resumen comparativo de cotizaciones | Set de Quotes | Tabla normalizada + insights | Lectura asistida |
| 7 | Generación de perfil de proveedor (opcional) | Inputs básicos del vendor | Bio + descripciones | Editable antes de publicar |
| 8 | Priorización de tareas urgentes | Estado actual del checklist | Top 3 tareas | Lectura asistida |

### 8.2 Features IA diferidas

| Feature | Razón de aplazamiento |
|---|---|
| Análisis de sentimiento en reseñas | Decisión PO: futuro |
| Moderación automática de reseñas | Decisión PO: futuro; admin modera manualmente |
| Recomendaciones IA de proveedores específicos | Requiere data real y feedback loop |
| Detección de inconsistencias presupuesto vs cotizaciones | Futuro |
| Resumen ejecutivo del evento | Bajo valor para MVP |
| Generación de contratos / términos legales | Fuera de alcance |
| Generación de imágenes/decoración con IA | Fuera de alcance |
| Voice/audio assistants | Fuera de alcance |
| Chatbot conversacional libre | Fuera de alcance (IA es por feature, no chat libre) |

### 8.3 Validación humana obligatoria

**Regla transversal crítica (heredada del Discovery, sección 8.12):**

> Toda salida IA debe pasar por un paso explícito de validación humana antes de convertirse en dato oficial del evento. El sistema debe distinguir visualmente "sugerido por IA" vs "confirmado por el usuario".

Implementación mínima:

- Toda `AIRecommendation` se almacena con `accepted: boolean` (default `false`).
- Las entidades creadas a partir de IA (`EventTask`, `BudgetItem`) llevan el flag `ai_generated: true`.
- UI muestra badge o color distintivo para contenido sugerido aún no confirmado.

### 8.4 Fallback y MockAIProvider

- **`LLMProvider`** es una interfaz que abstrae al proveedor del SDK.
- Implementaciones en MVP:
  - `OpenAIProvider` (principal).
  - `MockAIProvider` (obligatorio para demos controladas, tests automáticos y modo offline).
  - `AnthropicProvider` (recomendado pero no obligatorio; preparado a nivel de arquitectura).
- Selección por configuración (`env var`) sin recompilar.
- Fallback automático a `MockAIProvider` si el proveedor real falla o supera un timeout configurado.
- Cache de salidas IA por plantilla cuando aplique para reducir costo.

### 8.5 Riesgos de IA en el MVP

| Riesgo IA | Mitigación MVP |
|---|---|
| Alucinaciones (precios, categorías inexistentes) | Plantillas por tipo de evento + validación humana obligatoria |
| Latencia perceptible | Streaming + skeleton loaders + fallback a plantillas estáticas |
| Costo por tokens | Modelos económicos para tareas simples, cache, MockAIProvider en demo |
| Dependencia de un solo proveedor | Capa de abstracción `LLMProvider` |
| Salidas en idioma incorrecto | Prompt incluye idioma; validación de output |
| Sesgo cultural (no entender LATAM) | Plantillas curadas con modismos locales (XV, padrinos, hora loca) |
| Falta de trazabilidad | Persistir cada `AIRecommendation` con prompt versionado y output |

---

## 9. Fuera de alcance del MVP

| Área | Razón |
|---|---|
| App móvil nativa (iOS/Android) | Decisión PO: web responsive es suficiente |
| Pagos reales y captura de tarjeta | Riesgo, complejidad y no necesario para demo |
| Contratos digitales con firma electrónica | Complejidad legal y técnica |
| Chat en tiempo real con presencia | No necesario para demostrar valor |
| Integración WhatsApp | Decisión PO: futuro |
| Geolocalización avanzada / mapas interactivos | Fuera del foco MVP |
| Listas de invitados, RSVP, asignación de mesas | Fuera del foco MVP |
| Calendario completo de disponibilidad de proveedor | Se simula con campo simple |
| Verificación automática de proveedores (KYC) | Admin aprueba manualmente |
| Multi-colaboradores por evento (pareja, mamá, suegra) | Diferido a v1.1 (modelo freemium futuro) |
| Comisión real por contrato cerrado | Diferido al futuro comercial |
| Análisis de sentimiento / moderación automática IA | Decisión PO: futuro |
| Cumplimiento legal país-específico (LFPDPPP, LOPD, etc.) | Solo buenas prácticas en MVP |
| Conversión automática entre monedas | Decisión PO: no en MVP |
| Generación IA de imágenes/decoración | Fuera de alcance |
| SEO avanzado / marketing site complejo | Fuera del foco MVP |
| Integraciones con Google Calendar/Outlook | Futuro |
| Push notifications / SMS | Futuro |
| Marketplace transaccional completo | Decisión estratégica explícita |

---

## 10. Funcionalidades simuladas o simplificadas

| Funcionalidad | Cómo se simula en MVP |
|---|---|
| Notificaciones por email | Log estructurado "Se habría enviado a X"; integración real opcional |
| Booking / reserva | `BookingIntent.confirmed_intent` sin pago real ni contrato |
| Suscripción de proveedor | Estado conceptual en `VendorProfile` (`subscription: active/inactive`); sin cobro real |
| Verificación de proveedor | Aprobación manual por admin |
| Disponibilidad del proveedor | Campo simple en `VendorProfile`/`VendorService`, no calendario completo |
| Proveedores reales | Reemplazados por 10–20 datos seed (real opcional) |
| Pago de eventos / cobros | No existe; se asume offline |
| Moderación de contenido | Manual por admin (sin IA) |
| Email service real | `MockEmailService` que loguea contenido y destinatario |
| WhatsApp | No existe en MVP |
| Modelo freemium colaborativo | Conceptual en docs; no implementado |
| Comisión por contrato | Conceptual; no implementada |

---

## 11. Flujos principales del MVP

### 11.1 Flujo del organizador

1. Se registra o inicia sesión.
2. Crea un evento mediante el wizard (tipo, fecha, invitados, ciudad, presupuesto, moneda, idioma).
3. Solicita "Generar plan" → revisa sugerencia IA → acepta o edita.
4. Solicita "Generar checklist" → revisa tareas IA → acepta o edita.
5. Solicita "Sugerir presupuesto" → revisa distribución IA → ajusta.
6. Busca proveedores en el directorio por categoría y ciudad.
7. Envía `QuoteRequest` a 2–4 proveedores con brief autocompletado.
8. Recibe `Quotes`; abre vista comparativa (con resumen IA opcional).
9. Marca su `Quote` preferida → genera `BookingIntent`.
10. Tras confirmación del proveedor, marca el booking como `confirmed_intent`.
11. Marca el evento como `completed` después de la fecha.
12. Deja `Review` al proveedor.

### 11.2 Flujo del proveedor

1. Se registra como proveedor.
2. Completa su `VendorProfile` (datos, portafolio, paquetes).
3. Espera aprobación admin.
4. Una vez aprobado, aparece en el directorio público.
5. Recibe notificación in-app de `QuoteRequest`.
6. Abre el brief; responde con `Quote` (plantilla con total + desglose + validez).
7. Recibe notificación si su `Quote` es aceptada → confirma `BookingIntent`.
8. Tras el evento, recibe `Review` del organizador.

### 11.3 Flujo del administrador

1. Inicia sesión como admin.
2. Revisa proveedores pendientes → aprueba o rechaza.
3. Gestiona categorías (CRUD).
4. Revisa reseñas y modera (elimina/oculta ofensivas).
5. Consulta métricas básicas (eventos, cotizaciones, proveedores, reseñas).
6. Revisa log de `AdminAction`.

### 11.4 Flujo de IA

1. Usuario dispara una acción asistida por IA (plan, checklist, presupuesto, brief, resumen).
2. Backend construye el prompt con plantilla versionada + datos del evento + idioma.
3. `LLMProvider.generate*()` invoca al proveedor configurado (OpenAI / Anthropic / Mock).
4. Respuesta se persiste como `AIRecommendation` (`accepted: false`).
5. UI muestra la sugerencia marcada como "sugerido por IA".
6. Usuario acepta, edita o regenera.
7. Al aceptar, las entidades reales (`EventTask`, `BudgetItem`, etc.) se crean con `ai_generated: true` y la `AIRecommendation` se marca `accepted: true`.

### 11.5 Flujo de cotización

1. Organizador selecciona proveedor → "Solicitar cotización".
2. Sistema autocompleta brief desde datos del evento → usuario revisa y envía.
3. Se crea `QuoteRequest` en estado `sent`; proveedor recibe notificación.
4. Proveedor abre la solicitud (estado → `viewed`) y responde con `Quote` (estado `sent`).
5. Organizador ve la `Quote`; si recibe más de una en la misma categoría, abre vista comparativa.
6. Organizador acepta una `Quote` → estado `accepted`.
7. Sistema crea `BookingIntent` ligado a esa `Quote`.
8. Proveedor confirma → `BookingIntent.status = confirmed_intent`.
9. Presupuesto del evento actualiza `committed`.

---

## 12. Reglas de negocio aplicables al MVP

1. **Propiedad del evento.** Cada `Event` pertenece a un único `User` (owner). Solo el owner puede editar o enviar `QuoteRequest`.
2. **Estados del evento.** `draft` → `active` → `completed` | `cancelled`. Solo eventos `active` pueden enviar `QuoteRequest`.
3. **Estados de tarea.** `pending` → `in_progress` → `done` | `skipped`. Las tareas IA arrancan `pending` y requieren confirmación.
4. **Presupuesto.** `total = SUM(BudgetItem.planned)`; `committed = SUM(BudgetItem.committed)`. Si `committed > total`, se muestra warning, no se bloquea.
5. **Visibilidad del proveedor.** Solo `VendorProfile.status = approved` aparece en directorio público.
6. **Cotización única por (evento, proveedor).** Una sola `QuoteRequest` activa simultáneamente entre un mismo evento y proveedor.
7. **Validez de cotización.** Cada `Quote` tiene `valid_until`; vencida, no puede pasar a `BookingIntent`.
8. **Booking intent sin pago real.** Solo registra intención; no captura tarjeta ni firma contrato.
9. **Reseña verificada.** Solo organizadores con `BookingIntent.confirmed_intent` con ese proveedor pueden reseñar. Una reseña por (evento, proveedor).
10. **Notificaciones MVP.** Canales: in-app + email simulado. WhatsApp/SMS/Push fuera de alcance.
11. **Permisos por rol.** `organizer`, `vendor`, `admin`. Multi-rol simultáneo en un mismo usuario es futuro.
12. **IA = sugerencia.** Toda salida IA requiere validación humana antes de convertirse en dato oficial.
13. **Auditoría admin.** Toda acción admin se registra en `AdminAction`.
14. **Idioma del evento.** Se selecciona al crear y dirige las llamadas IA y la UI del evento.
15. **Moneda del evento.** Se configura al crear; sin conversión automática.
16. **Trazabilidad IA.** Cada `AIRecommendation` debe persistirse con su prompt versionado y la decisión humana.

---

## 13. Entidades principales incluidas en el MVP

| Entidad | Propósito en MVP |
|---|---|
| `User` | Persona registrada (organizador, proveedor o admin) |
| `Role` | Rol asignado (`organizer`, `vendor`, `admin`) |
| `Event` | Evento planificado por un organizador |
| `EventType` | Catálogo de tipos (wedding, xv, baptism, baby_shower, birthday, corporate) |
| `EventTask` | Tarea del checklist |
| `Budget` | Presupuesto de un evento |
| `BudgetItem` | Línea de presupuesto por categoría |
| `VendorProfile` | Perfil del proveedor |
| `VendorService` | Servicio/paquete del proveedor |
| `ServiceCategory` | Categoría de servicio (catering, foto, DJ, etc.) |
| `QuoteRequest` | Solicitud de cotización |
| `Quote` | Respuesta del proveedor con precio y condiciones |
| `BookingIntent` | Intención de reserva simulada |
| `Review` | Reseña verificada |
| `Notification` | Aviso al usuario (in-app) |
| `AIRecommendation` | Salida IA persistida para trazabilidad y validación |
| `Location` | Ubicación normalizada (país, ciudad) |
| `Attachment` | Archivo adjunto (portafolio, brief) |
| `AdminAction` | Log de acciones administrativas |

**Diferidas a futuro (no en MVP):** `Availability` (calendario real), `Conversation`/`Message` (chat real), `Payment`/`Invoice` (pagos reales), `EventCollaborator` (multi-usuario por evento), `SubscriptionPlan` (suscripciones reales), `Commission` (comisión por contrato).

---

## 14. Criterios de éxito del MVP

### 14.1 Criterios funcionales

- Un organizador puede completar el flujo end-to-end (registro → evento → plan IA → checklist IA → presupuesto IA → cotización → comparación → booking intent → reseña) sin asistencia técnica.
- Un proveedor puede recibir y responder al menos una `QuoteRequest`.
- Un admin puede aprobar un proveedor, gestionar categorías y moderar una reseña.
- El sistema soporta los **4 idiomas** y permite cambiar moneda por evento.
- La capa `LLMProvider` permite alternar entre `OpenAIProvider` y `MockAIProvider` por configuración.

### 14.2 Criterios académicos

- Discovery, decisiones PO y MVP scope documentados.
- User stories trazables para cada feature `Must Have`.
- Modelo de datos documentado.
- Contrato de API documentado.
- ADRs (Architecture Decision Records) que evidencien criterio humano.
- Evidencia de prompts versionados.
- Evidencia de cobertura de pruebas en lógica crítica (≥ 50%).
- Deploy funcional accesible para evaluación.
- Documentación de IA usada en cada fase del proyecto.

### 14.3 Criterios técnicos

- Disponibilidad ≥ 99% durante demo.
- P95 < 1.5s en endpoints no-IA.
- P95 < 8s en endpoints IA (con streaming aceptable).
- Tasa de error < 1%.
- Cobertura de pruebas ≥ 50% en lógica crítica (organizador, cotización, IA).
- Seed reproducible en un solo comando.
- Separación clara frontend / backend / DB / IA.

### 14.4 Criterios de demo

- Demo guiada de 10–15 minutos cubre los 5 flujos (organizador, proveedor, admin, IA, cotización).
- Seed muestra eventos en estados `draft`, `active` y `completed`.
- Al menos un `BookingIntent.confirmed_intent` visible.
- Al menos una reseña visible.
- Métricas de admin visibles en pantalla.
- IA demostrada con `OpenAIProvider` y con `MockAIProvider` (toggle).

---

## 15. Métricas académicas recomendadas

Priorizadas según el documento de decisiones PO (sección 7):

| Prioridad | Métrica | Qué demuestra |
|---:|---|---|
| 1 | Flujo E2E del organizador completado | Corazón del producto |
| 2 | Generación de plan IA funcional | Diferenciador principal |
| 3 | Generación de checklist IA funcional | Utilidad práctica |
| 4 | Flujo de cotización organizador ↔ proveedor | Interacción multi-rol |
| 5 | Panel proveedor funcional | Segundo lado del producto |
| 6 | Admin funcional (categorías, proveedores, reseñas) | Gobernanza |
| 7 | Seed reproducible | Demo y evaluación |
| 8 | Tests en lógica crítica | Calidad técnica |
| 9 | Deploy funcional | Ciclo E2E completo |
| 10 | Documentación trazable de IA + decisiones humanas | Alineación con master |

Métricas complementarias:

- # features asistidas por IA (≥ 5).
- # de prompts documentados (≥ 1 por feature IA).
- # de ADRs (≥ 5 cubriendo proveedor LLM, multi-rol, i18n, simulación, capa de abstracción).
- # de outputs IA editables por usuario (100% de features IA).
- # de fallbacks `MockAIProvider` demostrables (≥ 1).
- Tasa de error controlado (mensajes claros en UI/API).

---

## 16. Riesgos de alcance y mitigaciones

| # | Riesgo | Impacto | Prob. | Mitigación |
|---:|---|---|---|---|
| 1 | Sobre-alcance hacia marketplace transaccional | Alto | Alta | Este documento como contrato; cualquier feature fuera requiere aprobación PO |
| 2 | Tentación de chat real-time | Medio | Media | Bloqueado explícitamente; brief estructurado cubre el caso |
| 3 | Tentación de pagos reales | Alto | Media | Booking intent simulado; disclaimer visible |
| 4 | Alucinaciones IA | Medio-Alto | Alta | Plantillas versionadas + validación humana obligatoria |
| 5 | Latencia IA frustra UX | Medio | Media | Streaming + skeleton + fallback plantilla |
| 6 | Costos LLM se disparan | Medio | Media | Cache, modelos económicos, `MockAIProvider` para demo |
| 7 | Dependencia de un solo LLM | Medio | Media | Capa de abstracción `LLMProvider` |
| 8 | Seed pobre o incoherente | Alto | Media | Seed culturalmente coherente, revisado por PO, scripts reproducibles |
| 9 | Multi-idioma incompleto | Medio | Media | i18n desde día uno; es-LATAM base + EN obligatorio |
| 10 | Confusión multi-rol en UI | Medio | Media | UX clara por rol; rutas y dashboards separados |
| 11 | Inseguridad / datos sensibles expuestos | Alto | Baja | Cifrado en tránsito y reposo; mínima recolección; políticas claras |
| 12 | Tiempo académico desbordado | Alto | Alta | Scope congelado; cualquier feature `Could` se evalúa al final |
| 13 | Demo no demostrable por dependencias externas | Alto | Media | `MockAIProvider` + seed garantizan demo offline |
| 14 | Confusión entre "sugerido por IA" y "confirmado" | Medio | Media | Badge visual + estado `accepted` en `AIRecommendation` |
| 15 | Branding inconsistente | Bajo-Medio | Media | Guía de estilo premium/aspiracional + accesible documentada |

---

## 17. Supuestos, restricciones y dependencias

### 17.1 Supuestos

- El Product Owner está disponible para resolver dudas durante el desarrollo.
- El equipo dispone de acceso a un API key de OpenAI con presupuesto suficiente para desarrollo y demo.
- La demo se realizará con datos seed; no se requiere captación real de proveedores antes de la entrega.
- El idioma base para contenidos seed es **es-LATAM neutral**; traducciones a es-ES, pt y en cubren navegación/labels (no contenido cultural específico).
- Los evaluadores acceden vía web responsive desde cualquier navegador moderno.
- La duración del proyecto académico es la determinada por el programa de máster.

### 17.2 Restricciones

- Solo se construye web responsive; no hay app móvil nativa.
- No se procesan pagos reales ni se capturan medios de pago.
- No se firman contratos digitales.
- No se integra WhatsApp ni canales de mensajería externos.
- No se realiza moderación automática con IA.
- No se cumplen normativas país-específicas formales más allá de buenas prácticas.
- Multi-colaboradores por evento queda fuera del MVP.
- Sin conversión automática de monedas.

### 17.3 Dependencias

- **Externas:** Proveedor LLM (OpenAI principal; Anthropic opcional); proveedor de hosting cloud; servicio de auth (gestionado o propio).
- **Internas:** Seed scripts reproducibles; capa `LLMProvider`; plantillas de prompt versionadas; sistema de i18n.
- **De negocio:** Decisiones PO consolidadas; criterios de evaluación académica del comité.
- **Riesgo de dependencia:** Si OpenAI cambia pricing o API, el `MockAIProvider` y la capa de abstracción permiten continuar la demo.

---

## 18. Roadmap post-MVP

### 18.1 Versión 1.1

- Multi-colaboradores por evento (pareja, familia) con permisos básicos.
- Recordatorios por email reales (SMTP/proveedor real).
- Integración inicial con WhatsApp Business API (notificaciones salientes).
- Calendario de disponibilidad simple para proveedores.
- Resumen ejecutivo del evento generado por IA.
- Mejoras de UX en el comparador de cotizaciones.
- Lista de invitados básica (sin RSVP).

### 18.2 Versión 2.0

- Marketplace transaccional con pagos reales (Stripe/PayPal/proveedor local).
- Contratos digitales con firma electrónica.
- Comisión por contrato cerrado.
- Análisis de sentimiento y moderación automática IA en reseñas.
- KYC básico para proveedores.
- Recomendaciones IA de proveedores específicos basadas en historial.
- Chat real-time entre organizador y proveedor.
- App móvil nativa (iOS/Android).
- RSVP, asignación de mesas, gestión de invitados completa.

### 18.3 Futuro comercial

- Modelo freemium para organizadores (gratis básico; pago por colaboración).
- Suscripción mensual real para proveedores.
- Plan premium para proveedores con galería destacada / boost en directorio.
- Comisión variable por contrato cerrado.
- Expansión a España (es-ES) y otros mercados LATAM (México, Colombia).
- Marketplace de planners profesionales.
- White-label para wedding planners independientes.
- Integraciones nativas: Pinterest, Instagram, Google Calendar.

---

## 19. Resumen ejecutivo de alcance

**EventFlow MVP es un workspace web responsive multilenguaje, asistido por IA, para organizar eventos sociales y corporativos en Guatemala (con visión LATAM/España), con un flujo simplificado de descubrimiento y cotización de proveedores y un panel administrativo curado.**

- **Sí construye:** auth + roles, eventos, plan IA, checklist IA, presupuesto IA, directorio, perfil de proveedor, solicitud y respuesta de cotización, comparador, booking intent simulado, reseñas verificadas, panel admin, i18n (4 idiomas), moneda configurable, datos seed reproducibles.
- **No construye:** pagos reales, contratos, chat, app nativa, WhatsApp, moderación IA, KYC, cumplimiento legal país-específico, multi-colaboradores, RSVP/mesas, marketplace transaccional completo.
- **Simula:** notificaciones email, booking, suscripciones de proveedor, verificación, disponibilidad detallada.
- **Diferenciador:** Workspace conversacional IA multi-evento en español LATAM, con cotización estructurada.
- **Capa IA:** `LLMProvider` con `OpenAIProvider` + `MockAIProvider` (Anthropic opcional); validación humana obligatoria.
- **Demo:** 5–10 organizadores, 10–20 proveedores, eventos en `draft`/`active`/`completed`, reseñas seed y al menos un `BookingIntent.confirmed_intent`.
- **Restricción estratégica:** Nada que requiera pagos, contratos o chat real entra al MVP.

---

## 20. Checklist final de alcance MVP

Lista para validar al cierre del MVP. Cada ítem debe ser verificable.

### Producto

- [ ] Wizard de creación de evento funcional para los 6 tipos definidos.
- [ ] Estados de evento (`draft`, `active`, `completed`, `cancelled`) implementados.
- [ ] Generación IA de plan operativa con validación humana.
- [ ] Generación IA de checklist operativa con estados de tarea.
- [ ] Sugerencia IA de presupuesto operativa con `BudgetItem`.
- [ ] Directorio de proveedores con búsqueda por categoría/ciudad/precio.
- [ ] Perfil de proveedor con portafolio y paquetes.
- [ ] `QuoteRequest` con brief autocompletado.
- [ ] `Quote` con plantilla y `valid_until`.
- [ ] Vista comparativa de cotizaciones.
- [ ] `BookingIntent` simulado con confirmación del proveedor.
- [ ] Dashboard de progreso por evento.
- [ ] Panel admin (categorías, proveedores, reseñas).
- [ ] Reseñas verificadas por `BookingIntent.confirmed_intent`.
- [ ] Notificaciones in-app + email simulado en log.

### IA

- [ ] Capa `LLMProvider` implementada.
- [ ] `OpenAIProvider` funcional.
- [ ] `MockAIProvider` funcional para demos y tests.
- [ ] (Opcional) `AnthropicProvider` o stub preparado.
- [ ] Prompts versionados y trazables.
- [ ] Validación humana antes de persistir entidades reales.
- [ ] Distinción visual "sugerido por IA" vs "confirmado".
- [ ] `AIRecommendation` registrada con `accepted` y `payload`.
- [ ] Fallback a `MockAIProvider` ante timeout/falla del proveedor real.

### Multi-rol

- [ ] Organizador puede completar flujo end-to-end.
- [ ] Proveedor puede registrarse, ser aprobado y responder cotizaciones.
- [ ] Admin puede aprobar proveedores, gestionar categorías y moderar reseñas.
- [ ] Reglas de visibilidad respetadas (un organizador no ve eventos ajenos; un proveedor solo ve sus solicitudes).

### Internacionalización y moneda

- [ ] i18n completo en es-LATAM, es-ES, pt, en.
- [ ] Selector de idioma operativo.
- [ ] Moneda configurable por evento (GTQ, EUR, MXN, COP, USD mínimo).
- [ ] Prompts IA reciben idioma como parámetro.

### Datos seed

- [ ] 5–10 organizadores seed.
- [ ] 10–20 proveedores seed.
- [ ] 10–15 eventos seed con distribución `draft`/`active`/`completed`.
- [ ] 10–15 categorías seed.
- [ ] 15–25 `QuoteRequests` seed.
- [ ] 10–20 `Quotes` seed.
- [ ] 20–40 reseñas seed.
- [ ] Script único reproducible.

### Calidad técnica

- [ ] Tests en lógica crítica ≥ 50%.
- [ ] Endpoints principales documentados.
- [ ] Errores controlados en API y UI.
- [ ] Seed reproducible en un comando.
- [ ] Deploy público funcional.
- [ ] Separación frontend / backend / DB / IA.

### Documentación

- [ ] Domain Discovery completo.
- [ ] Product Owner Decisions completo.
- [ ] MVP Scope Definition (este documento) aprobado.
- [ ] User stories trazables por feature `Must Have`.
- [ ] Modelo de datos documentado.
- [ ] Contrato de API documentado.
- [ ] ADRs (≥ 5) que evidencien criterio humano.
- [ ] Guía de deploy.
- [ ] Evidencia de prompts versionados.
- [ ] Plan de demo guiada (10–15 min) listo.

### Control de alcance

- [ ] No se han incorporado funcionalidades fuera del scope sin aprobación PO.
- [ ] No hay pagos reales, contratos, chat real-time ni app nativa.
- [ ] No hay integración WhatsApp ni moderación automática IA.
- [ ] El marketplace permanece como flujo simulado, no transaccional.

---

> **Nota final:** Este documento es el **contrato de alcance del MVP**. Cualquier cambio sustantivo (nueva feature, eliminación de feature `Must Have`, cambio de prioridad) requiere actualización formal del documento y aprobación del Product Owner antes de ejecutarse.
