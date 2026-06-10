# EventFlow — Business Rules Document

> Documento formal de Reglas de Negocio del MVP
> Versión: 1.0
> Idioma: Español LATAM neutral
> Audiencia: Product Owner, Business Analyst, equipo de desarrollo asistido por IA, QA, agentes IA generadores de user stories, FRD, casos de prueba y criterios de aceptación
> Documentos fuente: `1-Domain-Discovery-Report.md`, `2-Product-Owner-Decisions.md`, `3-MVP-Scope-Definition.md`

---

## 1. Propósito del documento

Este documento define de forma estructurada, trazable y testeable el conjunto de **reglas de negocio que gobiernan el comportamiento del MVP de EventFlow**. Su objetivo es:

- Establecer la **fuente única de verdad** sobre qué reglas aplican al MVP, cuáles aplican a futuro y cuáles están fuera de alcance.
- Servir como insumo formal para la generación posterior de **user stories, FRD, casos de prueba y criterios de aceptación**.
- Garantizar la **coherencia funcional** entre los documentos previos (Discovery, decisiones del Product Owner y MVP Scope Definition) y la implementación del producto.
- Reducir el riesgo de **sobre-alcance** hacia funcionalidades de marketplace transaccional completo que están explícitamente descartadas para v1.
- Permitir que QA, equipo de producto y agentes IA validen el comportamiento del sistema con criterios objetivos.

---

## 2. Alcance del documento

Este documento cubre las reglas de negocio aplicables al **MVP de EventFlow**, abarcando:

- Roles, permisos y autenticación.
- Ciclo de vida y propiedad de eventos.
- Tipos de evento soportados.
- Planificación asistida por IA y validación humana.
- Checklist y tareas de evento.
- Presupuesto, moneda e internacionalización.
- Perfiles de proveedor, servicios y categorías.
- Solicitudes de cotización, respuestas y comparación.
- Booking intent simulado.
- Reseñas y moderación manual.
- Notificaciones in-app y email simulado.
- Datos seed para demo.
- Gobernanza administrativa y auditoría.
- Privacidad, seguridad y buenas prácticas.
- Reglas fuera de alcance y reglas futuras recomendadas.

**Lo que este documento NO cubre:**

- Especificaciones técnicas de implementación (esquemas de base de datos, contratos de API, etc.).
- Diseño visual o guía de marca.
- Plan de pruebas detallado (sí se incluyen reglas críticas que QA debe verificar).
- Decisiones de despliegue, hosting o infraestructura.

---

## 3. Fuentes utilizadas

| # | Documento | Uso |
|---:|---|---|
| 1 | `/docs/1-Domain-Discovery-Report.md` | Modelo de dominio, JTBD, procesos de negocio, reglas iniciales (sección 8), riesgos. |
| 2 | `/docs/2-Product-Owner-Decisions.md` | Decisiones de producto sobre mercado, eventos, idiomas, moneda, branding, datos seed, moderación, modelo de negocio. |
| 3 | `/docs/3-MVP-Scope-Definition.md` | Alcance funcional, flujos principales, criterios de éxito, reglas de negocio aplicables al MVP (sección 12), checklist de cierre. |
| 4 | [`/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`](./8.1-Product-Owner-Decisions-Use-Cases-Addendum.md) | Addendum del Product Owner con 19 decisiones sobre preguntas abiertas (rating, portafolio, validez de cotizaciones, cancelación de booking, cierre automático, moneda, captcha, timeout IA, métricas admin, moderación de reseñas, AnthropicProvider, visibilidad de eventos por admin, EventType, jerarquía de categorías, soft delete de attachments). |

Toda regla aquí documentada se deriva o cita explícitamente de uno o más de estos documentos. Cuando la regla no aparece de forma explícita pero se infiere de manera razonable, se marca como `Assumption` o `Recommended` en el campo **Source type**.

---

## 4. Principios generales de reglas de negocio

Los siguientes principios actúan como **filtro transversal** para todas las reglas y deben aplicarse al evaluar comportamientos del sistema:

1. **Workspace primero, marketplace después.** Ninguna regla debe habilitar pagos reales, captura de medios de pago, firma de contratos o comisiones en el MVP.
2. **IA asiste, no decide.** Toda salida generada por IA es **sugerencia editable**; nunca se convierte en dato oficial sin confirmación explícita del usuario.
3. **Simular antes que integrar.** Notificaciones por email, WhatsApp, suscripciones y bookings deben simularse en v1.
4. **Seed antes que captación real.** El MVP se demuestra con datos seed reproducibles; los proveedores reales son opcionales.
5. **Validación humana obligatoria.** Decisiones de alto impacto (contratar, comprometer presupuesto, dejar reseña) son siempre del humano.
6. **Trazabilidad sobre automatización.** Todo paso asistido por IA debe registrarse para auditoría académica.
7. **Aislamiento por rol.** Un organizador no ve eventos ajenos; un proveedor solo ve sus propias solicitudes; el admin opera sobre catálogo y moderación.
8. **Realismo cultural LATAM.** Las reglas y plantillas deben ser coherentes con el contexto cultural (XV años, padrinos, hora loca, marimba, candy bar).
9. **Demostrable sobre completo.** Ante ambigüedad, se prefiere la regla que asegure flujo demostrable end-to-end sobre cobertura exhaustiva.
10. **No introducir lógica fuera de scope.** Cualquier regla que requiera comportamientos fuera del MVP Scope Definition debe marcarse como `Future` u `Out of Scope`.

---

## 5. Resumen ejecutivo de reglas críticas

Las siguientes reglas son **transversales y de máxima prioridad**. Cualquier desviación a estas reglas implica que el MVP no cumple su contrato de alcance.

| # | Regla crítica | Aplica a | Prioridad |
|---:|---|---|---|
| C1 | Todo evento tiene un único `owner` y solo este puede modificarlo o enviar `QuoteRequest`. | Eventos, permisos | Must Have |
| C2 | Toda sugerencia IA debe ser confirmada por el usuario antes de convertirse en dato oficial. | IA, tareas, presupuesto | Must Have |
| C3 | Solo proveedores con `VendorProfile.status = approved` son visibles en el directorio público. | Proveedores | Must Have |
| C4 | Un `BookingIntent` no implica pago real, contrato firmado ni captura de medios de pago. | Booking, cotizaciones | Must Have |
| C5 | Solo organizadores con `BookingIntent.confirmed_intent` con un proveedor pueden dejar `Review`. | Reseñas | Must Have |
| C6 | El MVP soporta es-LATAM, es-ES, pt y en; el inglés es no negociable. | i18n | Must Have |
| C7 | La moneda se configura por evento; no existe conversión automática entre monedas. | Presupuesto, moneda | Must Have |
| C8 | Solo el rol `admin` puede aprobar proveedores, gestionar categorías y moderar reseñas. | Admin, gobernanza | Must Have |
| C9 | Toda acción admin se registra en `AdminAction` para auditoría. | Admin, auditoría | Must Have |
| C10 | WhatsApp, pagos reales, firma electrónica, chat real-time y app móvil nativa están **fuera de alcance** del MVP. | Out of scope | Must Have |

---

## 6. Convenciones de identificación

### 6.1 Formato de Rule ID

Todas las reglas de negocio utilizan el siguiente formato:

```text
BR-[DOMAIN]-[NUMBER]
```

Donde:

- `BR` es el prefijo común para Business Rule.
- `[DOMAIN]` identifica el dominio funcional al que pertenece la regla.
- `[NUMBER]` es un número correlativo de tres dígitos dentro de ese dominio.

### 6.2 Prefijos de dominio

| Prefijo | Dominio |
|---|---|
| `BR-AUTH` | Autenticación y autorización |
| `BR-USER` | Usuarios |
| `BR-EVENT` | Eventos |
| `BR-EVENTTYPE` | Tipos de evento |
| `BR-AI` | Planificación asistida por IA |
| `BR-TASK` | Checklist y tareas |
| `BR-BUDGET` | Presupuesto y moneda |
| `BR-VENDOR` | Proveedores |
| `BR-SERVICE` | Servicios y categorías |
| `BR-QUOTE` | Solicitudes y respuestas de cotización |
| `BR-BOOKING` | Booking intent |
| `BR-REVIEW` | Reseñas y moderación |
| `BR-NOTIF` | Notificaciones |
| `BR-I18N` | Idioma y localización |
| `BR-SEED` | Datos seed y demo |
| `BR-ADMIN` | Gobernanza administrativa |
| `BR-PRIVACY` | Privacidad y tratamiento de datos |
| `BR-FUTURE` | Reglas futuras recomendadas |
| `BR-OOS` | Reglas fuera de alcance |

### 6.3 Convenciones de campos

| Campo | Valores válidos |
|---|---|
| **Prioridad** | `Must Have`, `Should Have`, `Could Have`, `Future` |
| **Scope** | `MVP`, `Future`, `Out of Scope` |
| **Source type** | `Explicit`, `Derived`, `Assumption`, `Recommended` |

---

## 7. Reglas de roles y permisos

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-AUTH-001 | Autenticación obligatoria | Todo usuario debe autenticarse con email y contraseña antes de acceder a cualquier funcionalidad protegida del sistema. OAuth con Google es opcional. | Autenticación | Must Have | MVP | Explicit | QA debe verificar que rutas protegidas redirijan al login si la sesión no es válida. |
| BR-AUTH-011 | Captcha y anti-bot en registro y login | Los formularios de registro e inicio de sesión deben incluir captcha y mecanismos anti-bot (p. ej. reCAPTCHA, hCaptcha o rate-limiting equivalente) como medida básica de seguridad. Decisión PO 8.1 #8. | Autenticación, seguridad | Must Have | MVP | Explicit | QA verifica presencia del captcha y comportamiento ante intentos automatizados. |
| BR-AUTH-002 | Asignación de rol al registro | Al registrarse, el usuario selecciona rol `organizer` o `vendor`. El rol `admin` se crea exclusivamente por seed o configuración interna. | Autenticación, roles | Must Have | MVP | Explicit | QA debe verificar que el registro público no permita crear usuarios `admin`. |
| BR-AUTH-003 | Sesión persistente | La sesión del usuario se mantiene activa mediante mecanismo de sesión persistente hasta el cierre explícito o expiración configurada. | Autenticación | Must Have | MVP | Explicit | Verificar que el cierre de sesión invalide la sesión activa. |
| BR-AUTH-004 | Recuperación de contraseña | El sistema permite la recuperación de contraseña mediante un link enviado por email (simulado o real, según infraestructura disponible). | Autenticación | Should Have | MVP | Explicit | QA verifica que el link de recuperación expire tras uso o tiempo definido. |
| BR-AUTH-005 | Mono-rol por usuario en MVP | Un mismo usuario tiene un único rol activo en el MVP (`organizer`, `vendor` o `admin`). Multi-rol simultáneo es funcionalidad futura. | Roles | Must Have | MVP | Explicit | QA verifica que un usuario no pueda alternar rol dentro de la misma cuenta. |
| BR-AUTH-006 | Permisos del organizador | El rol `organizer` puede crear, editar y eliminar únicamente sus propios eventos; generar planes/checklist/presupuesto IA; enviar `QuoteRequest`; comparar `Quotes`; marcar `BookingIntent`; dejar `Review` post-evento. | Organizador | Must Have | MVP | Explicit | QA debe forzar intentos de acceder a eventos ajenos y validar respuesta 403/404. |
| BR-AUTH-007 | Permisos del proveedor | El rol `vendor` puede crear/editar su `VendorProfile`, definir `VendorService`/paquetes, recibir y responder `QuoteRequests`, confirmar `BookingIntent` y consultar reseñas recibidas. No puede modificar reseñas ni acceder a eventos del organizador (solo al brief). | Proveedor | Must Have | MVP | Explicit | QA verifica que el proveedor no acceda a datos del evento más allá del brief. |
| BR-AUTH-008 | Permisos del administrador | El rol `admin` puede aprobar/rechazar `VendorProfile`, gestionar `ServiceCategory`, moderar `Reviews` (eliminar/ocultar), ver métricas básicas y gestionar usuarios seed. No actúa en flujos comerciales como organizador ni proveedor. | Administrador | Must Have | MVP | Explicit | QA debe validar que el admin no figure como owner de eventos comerciales. |
| BR-AUTH-009 | Aislamiento de datos por rol | Las reglas de visibilidad deben garantizar que un usuario nunca acceda a datos privados de otro usuario fuera de su contexto autorizado. | Todos los roles | Must Have | MVP | Derived | QA debe ejecutar pruebas negativas de aislamiento entre cuentas. |
| BR-AUTH-010 | Acceso al panel admin restringido | Solo usuarios con rol `admin` pueden acceder a las rutas y operaciones del panel administrativo. | Administrador | Must Have | MVP | Explicit | QA verifica que el panel admin retorne 403 a roles no autorizados. |

---

## 8. Reglas de usuarios

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-USER-001 | Datos mínimos del usuario | Todo usuario debe tener al menos: email único, nombre, rol y fecha de creación. El teléfono es opcional. | Usuarios | Must Have | MVP | Explicit | Validar restricciones de unicidad de email en el sistema. |
| BR-USER-002 | Email único | El email del usuario es único en todo el sistema. No pueden coexistir dos usuarios activos con el mismo email. | Usuarios | Must Have | MVP | Derived | QA debe intentar registrar dos cuentas con el mismo email y esperar error. |
| BR-USER-003 | Un usuario puede tener múltiples eventos | Un mismo `organizer` puede crear y gestionar múltiples eventos simultáneamente. | Usuarios, eventos | Must Have | MVP | Explicit | QA crea varios eventos para el mismo organizador y valida coexistencia. |
| BR-USER-004 | Colaboradores por evento son futuro | La colaboración multi-usuario por evento (pareja, familia) está fuera del MVP. Solo el owner puede modificar el evento. | Usuarios, eventos | Future | Future | Explicit | Confirmar que la UI no expone funcionalidad de invitar colaboradores. |
| BR-USER-005 | Datos personales mínimos | El sistema debe minimizar la recolección de datos personales sensibles. No se solicitan documentos de identidad, datos fiscales ni medios de pago. | Privacidad, usuarios | Must Have | MVP | Explicit | QA verifica que formularios no expongan campos sensibles. |
| BR-USER-006 | Idioma preferido del usuario | Cada usuario puede configurar un idioma preferido entre los soportados (es-LATAM, es-ES, pt, en). | Usuarios, i18n | Must Have | MVP | Explicit | Verificar que la UI cambie de idioma según preferencia guardada. |

---

## 9. Reglas de eventos

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-EVENT-001 | Propiedad única del evento | Todo `Event` pertenece a un único `User` con rol `organizer`, identificado como `owner`. | Eventos | Must Have | MVP | Explicit | QA valida que el campo `owner_id` sea obligatorio y no nulo. |
| BR-EVENT-002 | Solo el owner edita el evento | Únicamente el `owner` puede editar, eliminar el evento o enviar `QuoteRequest` desde el mismo. | Eventos, permisos | Must Have | MVP | Explicit | QA fuerza ediciones desde cuentas distintas y espera rechazo. |
| BR-EVENT-003 | Datos mínimos del evento | Todo evento debe registrar: tipo, fecha tentativa, número estimado de invitados, ciudad/país, presupuesto estimado, moneda, idioma y owner. | Eventos | Must Have | MVP | Explicit | QA verifica que la creación falle si faltan campos obligatorios. |
| BR-EVENT-004 | Tipo de evento obligatorio | Todo evento debe asociarse a un `EventType` del catálogo soportado por el MVP. | Eventos, tipos de evento | Must Have | MVP | Explicit | QA valida que el wizard solo permita seleccionar tipos soportados. |
| BR-EVENT-005 | Estados del evento | El ciclo de vida del evento es: `draft` → `active` → `completed` o `cancelled`. Las transiciones son lineales y no se permite retroceder de `completed`/`cancelled` a estados anteriores. | Eventos, ciclo de vida | Must Have | MVP | Explicit | QA verifica las transiciones permitidas y prohibidas. |
| BR-EVENT-006 | Solo eventos activos cotizan | Únicamente eventos en estado `active` pueden generar nuevas `QuoteRequest`. Eventos en `draft`, `completed` o `cancelled` no pueden enviar solicitudes. | Eventos, cotizaciones | Must Have | MVP | Explicit | QA intenta crear `QuoteRequest` desde un evento no `active` y espera bloqueo. |
| BR-EVENT-007 | Moneda inmutable tras creación del evento | La moneda del evento se configura obligatoriamente en la creación y **no puede modificarse posteriormente** (decisión PO 8.1 #7). Durante el wizard de creación, el organizador debe elegir entre **moneda local** o **dólares estadounidenses (USD)**. La conversión automática queda fuera de alcance (BR-OOS-015). | Eventos, moneda | Must Have | MVP | Explicit | QA valida que el campo `currency_code` no se exponga como editable después de crear el evento. |
| BR-EVENT-008 | Idioma configurable por evento | El idioma del evento se configura al crearlo y se utiliza como parámetro para las llamadas IA y el contenido del evento. | Eventos, i18n | Must Have | MVP | Explicit | QA verifica que los prompts IA reciban el idioma del evento. |
| BR-EVENT-009 | Dashboard por evento | Cada evento dispone de un dashboard con progreso porcentual, próximas tareas, presupuesto comprometido y cotizaciones activas. | Eventos | Must Have | MVP | Explicit | QA valida que las métricas se actualicen al cambiar estados internos. |
| BR-EVENT-010 | Eliminación de evento por owner | El owner puede eliminar un evento `draft`. Para eventos `active` o `completed`, la eliminación se restringe o se marca como `cancelled` para preservar trazabilidad. | Eventos | Should Have | MVP | Derived | QA valida comportamiento esperado al eliminar eventos en estados distintos. |
| BR-EVENT-011 | Múltiples eventos por organizador | Un organizador puede tener múltiples eventos simultáneamente en distintos estados sin restricción de cantidad en MVP. | Eventos | Must Have | MVP | Explicit | QA crea ≥3 eventos para el mismo usuario y valida coexistencia. |
| BR-EVENT-012 | Fecha del evento futura preferente | Al crear un evento, se recomienda (pero no se obliga) que la fecha tentativa sea futura. La UI debe advertir cuando la fecha es pasada. | Eventos | Should Have | MVP | Recommended | QA valida que se muestre warning para fechas pasadas. |
| BR-EVENT-013 | Cierre automático del evento | El evento se marca automáticamente como `completed` **2 días calendario después de la fecha del evento** (decisión PO 8.1 #6). Un job/cron del sistema actualiza el estado y registra `completed_at`. El owner no necesita ejecutar la transición manualmente. | Eventos, ciclo de vida | Must Have | MVP | Explicit | QA simula el avance del reloj y valida la transición automática a `completed`. |
| BR-EVENT-014 | Visibilidad de eventos por admin | El admin puede **listar y consultar eventos** para fines de demo, soporte y gobernanza, pero **no puede editar el contenido** del evento ni actuar como organizador (decisión PO 8.1 #16). El acceso queda registrado en `AdminAction` cuando se ingresa al detalle. | Eventos, admin | Must Have | MVP | Explicit | QA verifica acceso de solo lectura para admin y bloqueo de operaciones de edición. |

---

## 10. Reglas de tipos de evento

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-EVENTTYPE-001 | Catálogo cerrado de tipos MVP | El MVP soporta exclusivamente los tipos: `wedding`, `xv`, `baptism`, `baby_shower`, `birthday`, `corporate`. | Tipos de evento | Must Have | MVP | Explicit | QA verifica que el catálogo no incluya otros tipos. |
| BR-EVENTTYPE-002 | Plantilla por defecto por tipo | Cada `EventType` debe contar con plantilla por defecto de: categorías de proveedor sugeridas, tareas con fechas relativas y distribución de presupuesto. | Tipos de evento, IA | Must Have | MVP | Explicit | QA valida que la generación IA invoque la plantilla del tipo correspondiente. |
| BR-EVENTTYPE-003 | Plantillas curadas manualmente | Las plantillas iniciales por tipo son curadas manualmente por el equipo del producto; la IA personaliza sobre esa base. No se generan plantillas dinámicas auto-generadas en MVP. | Tipos de evento, IA | Must Have | MVP | Explicit | Documentar la fuente de cada plantilla en el repositorio del proyecto. |
| BR-EVENTTYPE-004 | Coherencia cultural LATAM | Las plantillas de tipos relevantes (bodas, XV años, bautizos, baby showers) deben incluir modismos y categorías culturales LATAM (padrinos, hora loca, mariachi/marimba, candy bar/mesa de dulces). | Tipos de evento, contenido | Must Have | MVP | Explicit | Revisar curaduría con el Product Owner. |
| BR-EVENTTYPE-005 | Soporte multi-idioma de plantillas | Las plantillas por tipo deben estar disponibles al menos en los 4 idiomas soportados: es-LATAM, es-ES, pt, en. | Tipos de evento, i18n | Must Have | MVP | Derived | QA valida la disponibilidad de plantillas en los 4 idiomas. |
| BR-EVENTTYPE-006 | Tipos adicionales son futuro | La incorporación de tipos de evento no listados en el catálogo MVP queda como funcionalidad futura. | Tipos de evento | Future | Future | Explicit | Confirmar que la UI no exponga creación de tipos ad hoc. |
| BR-EVENTTYPE-007 | Gestión controlada de EventType por admin | El admin puede gestionar el catálogo de `EventType` desde el panel administrativo: **activar/desactivar, editar nombre visible, editar descripción y definir orden de visualización** (decisión PO 8.1 #17). **No se permite eliminación física (hard delete)** de un `EventType` cuando ya existen eventos asociados; en ese caso debe usarse soft delete / desactivación. | Tipos de evento, admin | Must Have | MVP | Explicit | QA intenta eliminar `EventType` con eventos asociados y espera bloqueo; valida soft delete. |

---

## 11. Reglas de planificación asistida por IA

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-AI-001 | Validación humana obligatoria de sugerencias IA | Toda sugerencia generada por IA debe ser revisada y explícitamente confirmada por el usuario antes de convertirse en dato oficial del evento (tarea, presupuesto, recomendación de proveedor, brief, perfil). | Recomendaciones IA, tareas, presupuesto | Must Have | MVP | Explicit | QA verifica que ninguna salida IA se persista como entidad oficial sin confirmación explícita. |
| BR-AI-002 | Editabilidad de salidas IA | Plan, checklist, presupuesto, brief y mensajes generados por IA deben ser totalmente editables por el usuario antes de su confirmación. | IA, plan, checklist, presupuesto | Must Have | MVP | Explicit | QA edita cada salida IA y valida persistencia de los cambios. |
| BR-AI-003 | Distinción visual sugerencia vs confirmado | El sistema debe diferenciar visualmente (badge, color o etiqueta) entre contenido sugerido por IA y contenido confirmado por el usuario. | IA, UI | Must Have | MVP | Explicit | QA valida la presencia del indicador visual antes y después de confirmar. |
| BR-AI-004 | IA asiste decisiones, no las toma | La IA no debe tomar de forma autónoma decisiones de alto impacto como contratar proveedores, comprometer presupuesto, eliminar reseñas o aprobar proveedores. | IA, decisiones | Must Have | MVP | Explicit | QA verifica que ningún flujo permita acciones IA sin intervención humana. |
| BR-AI-005 | Capa de abstracción LLM | El sistema debe implementar una interfaz `AIProvider`/`LLMProvider` que permita alternar entre proveedores sin cambios en la lógica de negocio. En MVP: **`OpenAIProvider` es el proveedor funcional principal**, **`MockAIProvider` es obligatorio** (tests, demo, offline, fallback) y **`AnthropicProvider` queda como stub/contrato futuro, opcional y no funcional en MVP** (decisión PO 8.1 #15). No se requiere selector dinámico de proveedor en UI ni failover automático a Anthropic. | IA, arquitectura | Must Have | MVP | Explicit | QA alterna proveedor vía `env var LLM_PROVIDER` y valida que `mock` y `openai` operen; `anthropic` puede responder con stub. |
| BR-AI-006 | MockAIProvider obligatorio | `MockAIProvider` debe estar disponible para demos controladas, tests automatizados y modo offline. | IA, demos, tests | Must Have | MVP | Explicit | QA ejecuta flujo IA completo con `MockAIProvider` sin acceso a la nube. |
| BR-AI-007 | Trazabilidad de salidas IA | Cada llamada IA debe persistirse como `AIRecommendation` con su prompt versionado, el payload de salida y un flag `accepted` (default `false`). | IA, auditoría | Must Have | MVP | Explicit | QA verifica la existencia de registro `AIRecommendation` por cada llamada. |
| BR-AI-008 | Flag ai_generated en entidades | Las entidades creadas a partir de IA (`EventTask`, `BudgetItem`) deben llevar el flag `ai_generated: true`. | IA, tareas, presupuesto | Must Have | MVP | Explicit | QA valida que el flag se mantenga en BD tras confirmación. |
| BR-AI-009 | Timeout y fallback de IA | El timeout máximo aceptable para llamadas IA es de **1 minuto (60 000 ms)** (decisión PO 8.1 #9). Si el proveedor LLM principal falla o supera ese timeout, el sistema debe mostrar **error controlado** al usuario y, cuando el modo demo/testing esté habilitado (`LLM_PROVIDER=mock` o flag equivalente), degradar a `MockAIProvider` para no bloquear el flujo. La degradación se registra en `AIRecommendation.fallback_used = true`. | IA, resiliencia | Must Have | MVP | Explicit | QA simula timeout >60s y valida error controlado y/o fallback según modo. |
| BR-AI-010 | Prompt versionado | Cada prompt utilizado por la IA debe estar versionado en el repositorio del proyecto y referenciado por su versión en `AIRecommendation`. | IA, trazabilidad | Must Have | MVP | Explicit | Auditoría debe poder reproducir cualquier salida IA usando el prompt versionado. |
| BR-AI-011 | Idioma como parámetro IA | El idioma deseado para la salida debe pasarse como parámetro explícito a la capa LLM y respetarse en la respuesta. | IA, i18n | Must Have | MVP | Explicit | QA cambia idioma del evento y valida que la salida IA respete el idioma. |
| BR-AI-012 | Streaming y skeleton para latencia | Las funciones IA deben implementar streaming de respuesta o skeleton loaders para mitigar la latencia perceptible. | IA, UX | Should Have | MVP | Recommended | QA mide latencia perceptible y valida que la UI no se bloquee. |
| BR-AI-013 | Cache de salidas IA | Cuando aplique (mismo input y plantilla), las salidas IA deben cachearse para reducir costo por tokens. | IA, costos | Could Have | MVP | Recommended | QA valida que la segunda llamada con mismo input no incremente costo. |
| BR-AI-014 | No chat libre conversacional | La IA opera por features acotadas (plan, checklist, presupuesto, brief, resumen). No se implementa chatbot conversacional de propósito general en MVP. | IA, alcance | Must Have | MVP | Explicit | QA valida ausencia de interfaz de chat libre. |
| BR-AI-015 | No generación de imágenes IA | El MVP no incluye generación IA de imágenes, decoración ni assets visuales. | IA, alcance | Must Have | Out of Scope | Explicit | Confirmar que la UI no expone esta funcionalidad. |

---

## 12. Reglas de checklist y tareas

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-TASK-001 | Pertenencia a un evento | Toda `EventTask` debe pertenecer a un único `Event`. No existen tareas huérfanas. | Tareas | Must Have | MVP | Explicit | QA valida restricción referencial obligatoria a `event_id`. |
| BR-TASK-002 | Origen de la tarea | Una tarea puede ser generada por IA o creada manualmente por el organizador. El origen debe quedar registrado mediante el flag `ai_generated`. | Tareas, IA | Must Have | MVP | Explicit | QA verifica que el flag se establezca correctamente en ambos flujos. |
| BR-TASK-003 | Confirmación de tareas IA | Las tareas generadas por IA arrancan en estado `pending` y deben ser confirmadas explícitamente por el usuario (individual o en bloque) para volverse activas. | Tareas, IA | Must Have | MVP | Explicit | QA valida que tareas IA no confirmadas no contribuyan al progreso. |
| BR-TASK-004 | Estados de tarea | El ciclo de vida de una tarea es: `pending` → `in_progress` → `done` o `skipped`. Las transiciones son explícitas por el usuario. | Tareas | Must Have | MVP | Explicit | QA valida transiciones permitidas y rechazo de transiciones inválidas. |
| BR-TASK-005 | Edición individual y en bloque | El usuario puede editar tareas individualmente o aprobar/rechazar bloques completos generados por IA. | Tareas | Must Have | MVP | Explicit | QA valida aceptación masiva y edición unitaria. |
| BR-TASK-006 | Fecha relativa al evento | Las tareas generadas por IA usan fechas relativas al evento (T-180, T-90, T-30, T-7, T-1). El sistema calcula fechas absolutas tomando como base la fecha del evento. | Tareas, IA | Must Have | MVP | Explicit | QA valida el recálculo cuando se modifica la fecha del evento. |
| BR-TASK-007 | Filtros por estado y rango | El sistema permite filtrar tareas por estado y por rango temporal (próximos 7 días, próximos 30 días). | Tareas, UX | Should Have | MVP | Explicit | QA valida que los filtros respondan correctamente. |
| BR-TASK-008 | Indicador de tareas vencidas | El sistema marca visualmente las tareas vencidas o próximas a vencer (T-7) y emite notificación in-app. | Tareas, notificaciones | Should Have | MVP | Explicit | QA simula fechas para validar marcado y notificación. |
| BR-TASK-009 | Contribución al progreso del evento | El porcentaje de progreso del evento se calcula a partir del estado de las tareas confirmadas (`done` / total confirmado). | Tareas, dashboard | Must Have | MVP | Derived | QA valida actualización del progreso al cambiar estados. |
| BR-TASK-010 | Tareas en eventos no activos | No se permite cambiar el estado de tareas en eventos `cancelled`. En eventos `completed`, las tareas son de solo lectura. | Tareas, eventos | Should Have | MVP | Derived | QA valida bloqueo de modificación en estados terminales. |

---

## 13. Reglas de presupuesto y moneda

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-BUDGET-001 | Pertenencia a un evento | Todo `Budget` debe pertenecer a un único `Event` (relación 1:1). | Presupuesto | Must Have | MVP | Explicit | QA valida la restricción referencial obligatoria. |
| BR-BUDGET-002 | Estructura por BudgetItem | El presupuesto se desglosa en `BudgetItem` por categoría, con campos `planned`, `committed` y `paid` (este último opcional en MVP). | Presupuesto | Must Have | MVP | Explicit | QA verifica creación, edición y eliminación de `BudgetItem`. |
| BR-BUDGET-003 | Cálculo de totales | El total del presupuesto se calcula como `SUM(BudgetItem.planned)`. El comprometido se calcula como `SUM(BudgetItem.committed)`. | Presupuesto | Must Have | MVP | Explicit | QA valida cálculos en tiempo real al modificar items. |
| BR-BUDGET-004 | Warning por exceso de comprometido | Cuando `committed > total`, el sistema muestra un warning visible al usuario pero no bloquea la operación. | Presupuesto | Must Have | MVP | Explicit | QA fuerza exceso y valida warning sin bloqueo. |
| BR-BUDGET-005 | Actualización por booking intent | El `committed` de un `BudgetItem` debe actualizarse automáticamente al confirmar un `BookingIntent` que afecte esa categoría. | Presupuesto, booking | Must Have | MVP | Explicit | QA valida la actualización transaccional. |
| BR-BUDGET-006 | Moneda configurable por evento | La moneda se configura **exclusivamente durante la creación del evento** y queda inmutable (ver BR-EVENT-007). Durante el wizard, el organizador elige entre **moneda local** o **dólares estadounidenses (USD)** (decisión PO 8.1 #7). Las monedas soportadas como mínimo son: GTQ, EUR, MXN, COP, USD. | Presupuesto, moneda | Must Have | MVP | Explicit | QA verifica selección durante creación y bloqueo de cambio posterior. |
| BR-BUDGET-007 | Sin conversión automática | El MVP no implementa conversión automática entre monedas ni consulta de tipo de cambio en tiempo real. Todas las cifras se muestran en la moneda del evento. | Presupuesto, moneda | Must Have | MVP | Explicit | QA confirma ausencia de funcionalidad de conversión. |
| BR-BUDGET-008 | Sugerencia IA del presupuesto | La IA puede sugerir una distribución inicial del presupuesto por categoría a partir del total, tipo de evento, número de invitados y ciudad. La sugerencia siempre es editable antes de guardarse. | Presupuesto, IA | Must Have | MVP | Explicit | QA valida que la sugerencia se persista solo tras confirmación. |
| BR-BUDGET-009 | Edición libre de BudgetItem | El usuario puede agregar, editar o eliminar `BudgetItem` libremente, incluso después de aceptar la sugerencia IA inicial. | Presupuesto | Must Have | MVP | Explicit | QA verifica CRUD completo de `BudgetItem`. |
| BR-BUDGET-010 | Visualización con moneda | Las cifras de presupuesto y cotización siempre deben mostrarse acompañadas del código o símbolo de la moneda del evento. | Presupuesto, UX | Must Have | MVP | Explicit | QA valida que ningún total se muestre sin moneda. |

---

## 14. Reglas de proveedores

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-VENDOR-001 | Aprobación previa a visibilidad | Un `VendorProfile` solo aparece en búsqueda pública del directorio si su `status = approved`. Perfiles `pending` o `rejected` no son visibles para organizadores. | Proveedores, directorio | Must Have | MVP | Explicit | QA valida la visibilidad por estado del perfil. |
| BR-VENDOR-002 | Datos mínimos del perfil | Todo perfil aprobado debe incluir: nombre del negocio, bio, ciudad, categorías asociadas e idiomas atendidos. | Proveedores | Must Have | MVP | Explicit | QA bloquea aprobación si faltan datos obligatorios. |
| BR-VENDOR-003 | Estados del perfil | El ciclo de vida del `VendorProfile` es: `pending` → `approved` o `rejected`. Las transiciones son responsabilidad del admin. | Proveedores, ciclo de vida | Must Have | MVP | Explicit | QA verifica transiciones permitidas y trazas en `AdminAction`. |
| BR-VENDOR-004 | Edición tras aprobación y límite de cambios de categoría | El proveedor puede editar su perfil tras aprobación. Los **cambios de categoría** están limitados a un **máximo de 5 ediciones** acumuladas (decisión PO 8.1 #3). Los cambios sustantivos de categoría que afecten la visibilidad pública del proveedor deben quedar sujetos a **revisión o validación por admin**. Cada cambio queda registrado en `AdminAction` o equivalente auditable. | Proveedores | Must Have | MVP | Explicit | QA valida bloqueo tras 5 cambios de categoría y disparo de revisión admin. |
| BR-VENDOR-005 | Portafolio del proveedor por trabajo/evento | El proveedor puede crear una sección de portafolio y cargar hasta **10 imágenes por evento o trabajo mostrado** (decisión PO 8.1 #2). No existe galería avanzada en MVP. Los attachments del portafolio aplican la política de soft delete definida en BR-PRIVACY-011. | Proveedores, portafolio | Must Have | MVP | Explicit | QA intenta cargar la imagen #11 en un mismo trabajo y espera bloqueo. |
| BR-VENDOR-006 | Verificación manual del proveedor | La verificación del proveedor se realiza de forma manual por el admin. No existe KYC automatizado en MVP. | Proveedores, admin | Must Have | MVP | Explicit | QA valida que la aprobación quede registrada como acción admin. |
| BR-VENDOR-007 | Suscripción simulada | El estado de suscripción del proveedor (`subscription: active/inactive`) es conceptual en MVP, sin cobro real ni integración de pagos. | Proveedores, modelo de negocio | Must Have | MVP | Explicit | QA valida ausencia de captura de pago. |
| BR-VENDOR-008 | Generación IA opcional de bio | La IA puede generar bio y descripciones de paquetes para proveedores nuevos, siempre como sugerencia editable antes de publicar. | Proveedores, IA | Could Have | MVP | Explicit | QA valida que la salida IA no se publique sin confirmación. |
| BR-VENDOR-009 | Disponibilidad simplificada | La disponibilidad del proveedor en MVP es un campo simple (no calendario completo). El calendario interactivo queda para futuro. | Proveedores | Should Have | MVP | Explicit | QA verifica ausencia de calendario interactivo en MVP. |
| BR-VENDOR-010 | Proveedores reales opcionales | Los proveedores reales son opcionales y no bloquean la demo. El MVP se demuestra con datos seed. | Proveedores, seed | Must Have | MVP | Explicit | QA valida que el flujo funcione 100% con datos seed. |

---

## 15. Reglas de servicios y categorías

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-SERVICE-001 | Pertenencia del servicio | Todo `VendorService` debe pertenecer a un `VendorProfile` aprobado y asociarse a una `ServiceCategory` existente. | Servicios | Must Have | MVP | Explicit | QA valida restricción referencial. |
| BR-SERVICE-002 | Datos mínimos del servicio | Cada servicio debe incluir: nombre del paquete, categoría, precio base y descripción. | Servicios | Must Have | MVP | Explicit | QA bloquea creación con campos incompletos. |
| BR-SERVICE-003 | Catálogo de categorías curado | El catálogo de `ServiceCategory` es gestionado exclusivamente por el admin (CRUD). Los proveedores no crean categorías. | Categorías, admin | Must Have | MVP | Explicit | QA valida que los proveedores no puedan crear categorías. |
| BR-SERVICE-004 | Catálogo culturalmente coherente | Las categorías deben reflejar las necesidades culturales LATAM: catering, salón/venue, decoración, fotografía, video, música (DJ, mariachi, marimba, hora loca), pastel/mesa de dulces, makeup/peinado, animación, transporte, papelería, florería, iluminación, planner, entre otras. | Categorías, contenido | Must Have | MVP | Explicit | Revisar el catálogo seed con el Product Owner. |
| BR-SERVICE-005 | Categorías jerárquicas simples (máximo 2 niveles) | El modelo soporta jerarquía simple parent/child para subcategorías, con **profundidad máxima de 2 niveles** (categoría padre → subcategoría) (decisión PO 8.1 #18). No se permiten jerarquías profundas (3+ niveles). Ejemplos: `Catering → Mesa de dulces`, `Música → DJ/Marimba/Mariachi`, `Decoración → Flores/Mobiliario`. | Categorías | Must Have | MVP | Explicit | QA intenta crear una sub-sub-categoría (nivel 3) y espera bloqueo. |
| BR-SERVICE-006 | Precio referencial por servicio | El precio base del servicio es referencial y no constituye una cotización formal. La cotización formal se establece mediante `Quote`. | Servicios, cotizaciones | Must Have | MVP | Derived | QA verifica que el precio del servicio no se use como cotización oficial. |
| BR-SERVICE-007 | Eliminación lógica de categorías | La eliminación de categorías con servicios asociados debe manejarse de forma segura (soft delete o validación) para no romper referencias existentes. | Categorías, admin | Should Have | MVP | Recommended | QA valida el comportamiento al eliminar categorías en uso. |

---

## 16. Reglas de solicitudes de cotización

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-QUOTE-001 | Solo organizador inicia solicitud | Únicamente el rol `organizer` puede crear una `QuoteRequest` desde uno de sus eventos en estado `active`. | Cotizaciones, permisos | Must Have | MVP | Explicit | QA valida bloqueo para otros roles. |
| BR-QUOTE-002 | Brief estructurado obligatorio | Toda `QuoteRequest` debe incluir un brief estructurado autocompletado desde los datos del evento (tipo, fecha, ciudad, invitados, presupuesto referencial). | Cotizaciones | Must Have | MVP | Explicit | QA verifica que el brief contenga los campos mínimos. |
| BR-QUOTE-003 | Edición del brief antes de enviar | El organizador puede editar el brief antes de enviarlo al proveedor. | Cotizaciones | Must Have | MVP | Explicit | QA valida la persistencia de ediciones. |
| BR-QUOTE-004 | Una solicitud activa por par | Solo puede existir una `QuoteRequest` activa simultáneamente entre un mismo evento y un mismo proveedor. Para enviar una nueva, la previa debe estar `expired` o `cancelled`. | Cotizaciones | Must Have | MVP | Explicit | QA intenta duplicar solicitudes activas y espera error. |
| BR-QUOTE-005 | Estados de la solicitud | El ciclo de vida es: `sent` → `viewed` → `responded` o `expired` o `cancelled`. | Cotizaciones | Must Have | MVP | Explicit | QA valida cada transición. |
| BR-QUOTE-006 | Visibilidad limitada al proveedor | El proveedor solo puede ver `QuoteRequest` dirigidas a él. No puede ver solicitudes dirigidas a otros proveedores. | Cotizaciones, permisos | Must Have | MVP | Explicit | QA intenta acceder a solicitudes ajenas y espera 403/404. |
| BR-QUOTE-007 | Notificación al proveedor | Al crear una `QuoteRequest`, el proveedor recibe notificación in-app (y email simulado por log). | Cotizaciones, notificaciones | Must Have | MVP | Explicit | QA verifica la creación de la notificación. |
| BR-QUOTE-008 | Brief incluye idioma del evento | El brief enviado al proveedor se genera en el idioma configurado en el evento. | Cotizaciones, i18n | Should Have | MVP | Derived | QA valida la coherencia idiomática. |
| BR-QUOTE-009 | Solicitudes múltiples por evento con límite por categoría | Un mismo evento puede enviar `QuoteRequest` a múltiples proveedores en paralelo, incluso en la misma categoría, con un **límite máximo de 5 `QuoteRequest` activas por categoría de servicio por evento** (decisión PO 8.1 #12). Se consideran "activas" los estados `sent`, `viewed`, `responded` y `preferred`; **no se cuentan** `cancelled`, `expired` ni `rejected`. | Cotizaciones | Must Have | MVP | Explicit | QA intenta crear la 6ª solicitud activa en la misma categoría y espera bloqueo (409). |
| BR-QUOTE-010 | Cancelación por organizador | El organizador puede cancelar una `QuoteRequest` propia mientras esté en estados `sent` o `viewed`. | Cotizaciones | Should Have | MVP | Derived | QA valida la cancelación y su efecto. |

---

## 17. Reglas de respuestas de cotización

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-QUOTE-011 | Solo proveedor responde | Únicamente el proveedor destinatario puede responder una `QuoteRequest` mediante una `Quote`. | Cotizaciones, permisos | Must Have | MVP | Explicit | QA bloquea respuestas desde otros usuarios. |
| BR-QUOTE-012 | Datos mínimos de la cotización | Toda `Quote` debe incluir: precio total, desglose simple, condiciones y fecha de validez (`valid_until`). | Cotizaciones | Must Have | MVP | Explicit | QA valida la presencia de los campos obligatorios. |
| BR-QUOTE-013 | Una cotización vigente por solicitud | Solo puede existir una `Quote` vigente por `QuoteRequest` por proveedor. | Cotizaciones | Must Have | MVP | Explicit | QA intenta crear segunda `Quote` vigente y espera error. |
| BR-QUOTE-014 | Estados de la cotización | El ciclo de vida es: `draft` → `sent` → `accepted` o `rejected` o `expired`. | Cotizaciones | Must Have | MVP | Explicit | QA valida cada transición. |
| BR-QUOTE-015 | Vigencia con valor por defecto | Toda `Quote` debe contar con una fecha `valid_until`. Si el proveedor **no especifica** una fecha de validez al enviar, el sistema aplica el valor por defecto **`created_at + 15 días calendario`** (decisión PO 8.1 #4). El proveedor puede sobrescribir el valor antes de enviar. | Cotizaciones | Must Have | MVP | Explicit | QA envía `Quote` sin `valid_until` y valida que el sistema asigne 15 días desde la creación. |
| BR-QUOTE-016 | Expiración por vigencia | Una `Quote` cuyo `valid_until` ha pasado debe marcarse automáticamente como `expired` y no puede generar `BookingIntent`. | Cotizaciones | Must Have | MVP | Explicit | QA simula vencimiento y valida bloqueo. |
| BR-QUOTE-017 | Edición antes de enviar | El proveedor puede editar la `Quote` mientras esté en estado `draft`. Una vez en `sent`, no se permite edición. | Cotizaciones | Must Have | MVP | Derived | QA valida la edición permitida y bloqueada. |
| BR-QUOTE-018 | Notificación al organizador | Al pasar a `sent`, la `Quote` dispara notificación in-app al organizador. | Cotizaciones, notificaciones | Must Have | MVP | Explicit | QA verifica la creación de la notificación. |
| BR-QUOTE-019 | Moneda heredada del evento | La `Quote` se expresa en la moneda del evento asociado, sin conversión. | Cotizaciones, moneda | Must Have | MVP | Derived | QA valida la coherencia de moneda. |
| BR-QUOTE-020 | Plantilla de respuesta | El proveedor responde sobre una plantilla simple (total + desglose + condiciones + validez), no sobre un formato libre extenso. | Cotizaciones, UX | Should Have | MVP | Explicit | QA verifica la presencia de la plantilla. |

---

## 18. Reglas de comparación de cotizaciones

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-QUOTE-021 | Vista comparativa por categoría | El sistema debe permitir al organizador visualizar lado a lado las `Quotes` recibidas para una misma categoría de servicio. | Cotizaciones, UX | Must Have | MVP | Explicit | QA verifica la presencia y usabilidad de la vista. |
| BR-QUOTE-022 | Marcado de cotización preferida | El organizador puede marcar una `Quote` como `preferred` para facilitar la decisión. | Cotizaciones | Must Have | MVP | Explicit | QA valida persistencia del estado `preferred`. |
| BR-QUOTE-023 | Resumen IA opcional del comparador | La IA puede generar un resumen estructurado de diferencias clave entre cotizaciones (versión simple). El resumen es lectura asistida, no decisión automática. | Cotizaciones, IA | Should Have | MVP | Explicit | QA valida que el resumen no se genere sin solicitud del usuario. |
| BR-QUOTE-024 | No alteración de cotizaciones por IA | La IA no debe modificar el contenido original de las cotizaciones; solo las resume o destaca diferencias. | Cotizaciones, IA | Must Have | MVP | Derived | QA valida que las cotizaciones originales se mantengan intactas. |
| BR-QUOTE-025 | Inclusión de cotizaciones vencidas en historial | Las cotizaciones expiradas pueden visualizarse en historial, pero no participan de la comparación activa. | Cotizaciones | Should Have | MVP | Derived | QA verifica el filtrado correcto. |

---

## 19. Reglas de booking intent simulado

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-BOOKING-001 | Origen del booking intent | Un `BookingIntent` solo puede crearse a partir de una `Quote` vigente (no expirada) y aceptada por el organizador. | Booking | Must Have | MVP | Explicit | QA intenta crear booking sobre `Quote` expirada y espera bloqueo. |
| BR-BOOKING-002 | Confirmación bilateral | Para pasar a `confirmed_intent`, el proveedor debe confirmar explícitamente el booking intent. | Booking | Must Have | MVP | Explicit | QA valida que sin confirmación del proveedor el estado no cambie. |
| BR-BOOKING-003 | Estados del booking intent | El ciclo de vida es: `pending` → `confirmed_intent` o `cancelled`. | Booking | Must Have | MVP | Explicit | QA valida transiciones permitidas. |
| BR-BOOKING-004 | Sin pago real | El `BookingIntent` no implica captura de tarjeta, transferencia, depósito ni cobro de comisión. | Booking, pagos | Must Have | MVP | Explicit | QA confirma ausencia total de captura de pago. |
| BR-BOOKING-005 | Sin contrato firmado | El `BookingIntent` no genera contrato digital con firma electrónica. | Booking, legal | Must Have | MVP | Explicit | QA confirma ausencia de firma electrónica. |
| BR-BOOKING-006 | Disclaimer visible | La interfaz debe mostrar un disclaimer claro indicando que el acuerdo final ocurre fuera de la plataforma. | Booking, UX | Must Have | MVP | Explicit | QA verifica la visibilidad del disclaimer en el flujo de booking. |
| BR-BOOKING-007 | Booking únicamente por categoría aceptada | Solo puede existir un `BookingIntent.confirmed_intent` por (evento, categoría) en MVP. Booking adicionales en la misma categoría implican cancelar el previo. | Booking | Should Have | MVP | Derived | QA valida la regla y el comportamiento al duplicar. |
| BR-BOOKING-008 | Actualización del presupuesto | Al confirmar un `BookingIntent`, el `committed` del `BudgetItem` correspondiente debe actualizarse. | Booking, presupuesto | Must Have | MVP | Explicit | QA valida coherencia entre booking y presupuesto. |
| BR-BOOKING-009 | Cancelación del booking incluso confirmado | Tanto el organizador como el proveedor pueden cancelar un `BookingIntent`, incluyendo los que se encuentren en estado `confirmed_intent` (decisión PO 8.1 #5). En MVP **no existe penalización financiera dentro de la plataforma** porque no se procesan pagos; cualquier penalización depende del acuerdo externo entre organizador y proveedor. La cancelación debe registrar `cancelled_at`, `cancelled_by` y `cancellation_reason`. | Booking | Must Have | MVP | Explicit | QA cancela un `BookingIntent` confirmado y valida la trazabilidad sin cobros. |
| BR-BOOKING-010 | Habilitación de reseña | Solo tras alcanzar `confirmed_intent`, el organizador queda habilitado para dejar `Review` al proveedor. | Booking, reseñas | Must Have | MVP | Explicit | QA verifica el bloqueo previo y la habilitación posterior. |

---

## 20. Reglas de reseñas y moderación

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-REVIEW-001 | Solo reseñas verificadas | Solo organizadores con `BookingIntent.confirmed_intent` con un proveedor específico pueden dejar `Review` sobre ese proveedor. | Reseñas | Must Have | MVP | Explicit | QA intenta dejar reseña sin booking confirmado y espera bloqueo. |
| BR-REVIEW-002 | Una reseña por par evento-proveedor | Solo se permite una `Review` por combinación `(event_id, vendor_id)`. | Reseñas | Must Have | MVP | Explicit | QA intenta crear segunda reseña y espera error. |
| BR-REVIEW-003 | Datos mínimos y escala 1–5 de la reseña | Toda reseña debe incluir: **rating numérico entero en escala de 1 a 5**, donde **5 representa la mejor calificación** y **1 la peor** (decisión PO 8.1 #1), y comentario textual no vacío. | Reseñas | Must Have | MVP | Explicit | QA intenta valores fuera del rango 1–5 y espera rechazo. |
| BR-REVIEW-004 | Visibilidad de reseñas | Las reseñas aprobadas y no moderadas se muestran públicamente en el perfil del proveedor. | Reseñas, directorio | Must Have | MVP | Explicit | QA verifica visibilidad post creación. |
| BR-REVIEW-005 | Moderación manual del admin con soft delete y auditoría | Solo el rol `admin` puede ocultar o eliminar reseñas con contenido ofensivo. La moderación es manual; no se aplica análisis automatizado. La eliminación se implementa como **soft delete** (estado `hidden` o `removed`); **no se permite eliminación física** que rompa la trazabilidad (decisión PO 8.1 #11). La acción debe registrar `moderated_by`, `moderated_at`, `moderation_reason` y entrada correspondiente en `AdminAction`. | Reseñas, admin, auditoría | Must Have | MVP | Explicit | QA valida que la reseña eliminada deje de mostrarse al público pero permanezca consultable por admin con registro de auditoría. |
| BR-REVIEW-006 | Sin moderación automática IA | El MVP no implementa análisis de sentimiento, detección automática de lenguaje ofensivo ni moderación IA. | Reseñas, IA | Must Have | Future | Explicit | Confirmar ausencia de funcionalidad IA en moderación. |
| BR-REVIEW-007 | Inalterabilidad post publicación | Una vez publicada, la reseña no puede ser editada por el organizador en MVP. Las correcciones se gestionan vía solicitud al admin. | Reseñas | Should Have | MVP | Derived | QA valida bloqueo de edición. |
| BR-REVIEW-008 | Respuesta del proveedor a reseñas (fuera de MVP) | El proveedor puede leer las reseñas recibidas pero **no puede responder, editar ni eliminar** reseñas en el MVP. La respuesta pública del proveedor queda **completamente fuera del alcance del MVP** y se difiere como funcionalidad futura (decisión PO 8.1 #14). | Reseñas, proveedor | Future | Future | Explicit | QA confirma ausencia de UI/endpoint para responder reseñas. |
| BR-REVIEW-009 | Promedio de calificaciones | El sistema calcula el promedio de calificaciones por proveedor y lo muestra en su perfil y en el directorio. | Reseñas, directorio | Should Have | MVP | Derived | QA valida cálculo y actualización. |
| BR-REVIEW-010 | Reseñas seed permitidas | Para la demo se admiten reseñas seed asociadas a bookings simulados. Deben marcarse con flag `seed: true` para trazabilidad. | Reseñas, seed | Must Have | MVP | Explicit | QA valida el flag en datos seed. |

---

## 21. Reglas de notificaciones

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-NOTIF-001 | Canales soportados en MVP | El MVP soporta notificaciones in-app y email simulado mediante log estructurado. Push, SMS y WhatsApp están fuera de alcance. | Notificaciones | Must Have | MVP | Explicit | QA verifica la presencia del log y ausencia de otros canales. |
| BR-NOTIF-002 | Eventos disparadores principales | Como mínimo, se generan notificaciones para: nueva `QuoteRequest` al proveedor, nueva `Quote` al organizador, **`Quote` rechazada o expirada al proveedor** (decisión PO 8.1 #13), próximas tareas (T-7), confirmación y cancelación de `BookingIntent`. Las notificaciones se entregan in-app de forma obligatoria; el envío por email se simula vía log estructurado (BR-NOTIF-003) y se materializa cuando la funcionalidad real de email esté disponible. | Notificaciones | Must Have | MVP | Explicit | QA valida la creación de notificación in-app al rechazar/expirar una `Quote`. |
| BR-NOTIF-003 | Email simulado por log | Las notificaciones por email se simulan mediante un log estructurado: "Se habría enviado a X". La integración real con SMTP es opcional. | Notificaciones | Must Have | MVP | Explicit | QA verifica la entrada en el log con destinatario y contenido. |
| BR-NOTIF-004 | Acuse de lectura in-app | Las notificaciones in-app deben incluir un campo `read_at` que se actualice al ser visualizadas por el usuario. | Notificaciones | Should Have | MVP | Derived | QA valida la actualización del campo. |
| BR-NOTIF-005 | Notificaciones solo al destinatario | Cada notificación se entrega exclusivamente al usuario destinatario. No existen notificaciones broadcast cross-rol en MVP. | Notificaciones, privacidad | Must Have | MVP | Derived | QA verifica el aislamiento de notificaciones. |
| BR-NOTIF-006 | WhatsApp fuera de alcance | Cualquier integración con WhatsApp (Business API u otros) queda explícitamente fuera del MVP. | Notificaciones | Must Have | Out of Scope | Explicit | Confirmar ausencia de integraciones WhatsApp. |
| BR-NOTIF-007 | Idioma de la notificación | El contenido de las notificaciones debe respetar el idioma preferido del destinatario o el del evento asociado, según corresponda. | Notificaciones, i18n | Should Have | MVP | Derived | QA valida la coherencia idiomática. |

---

## 22. Reglas de idioma e internacionalización

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-I18N-001 | Idiomas soportados | El MVP debe soportar es-LATAM neutral (base), es-ES, pt e en. El inglés es no negociable. | i18n | Must Have | MVP | Explicit | QA verifica disponibilidad de los 4 idiomas. |
| BR-I18N-002 | Idioma base por defecto | El idioma base por defecto del sistema es es-LATAM neutral. | i18n | Must Have | MVP | Explicit | QA verifica el idioma por defecto en sesiones nuevas. |
| BR-I18N-003 | Selector de idioma por usuario | El usuario puede cambiar su idioma preferido desde su configuración de cuenta. | i18n | Must Have | MVP | Explicit | QA valida persistencia y aplicación del cambio. |
| BR-I18N-004 | Idioma del evento independiente | Cada evento puede configurarse con un idioma propio que dirige las llamadas IA y los contenidos generados para ese evento. | i18n, eventos | Must Have | MVP | Explicit | QA valida la coherencia idiomática del evento. |
| BR-I18N-005 | Traducción de navegación y labels | Como mínimo, navegación, labels, botones, mensajes de error y notificaciones deben estar traducidos en los 4 idiomas. | i18n, UX | Must Have | MVP | Explicit | QA realiza recorrido por idiomas y valida cobertura. |
| BR-I18N-006 | Sin localización profunda por país | El MVP no implementa lógica país-específica compleja (modismos locales, normativas, formatos avanzados). | i18n | Must Have | MVP | Explicit | Confirmar ausencia de lógica país-específica. |
| BR-I18N-007 | Prompts IA reciben idioma | Los prompts enviados al `LLMProvider` deben recibir el idioma deseado como parámetro y respetarlo en la salida. | i18n, IA | Must Have | MVP | Explicit | QA valida la salida IA en cada idioma soportado. |
| BR-I18N-008 | Soporte de moneda separado de idioma | El idioma y la moneda son configuraciones independientes; cambiar el idioma no altera la moneda del evento. | i18n, moneda | Must Have | MVP | Derived | QA valida la independencia entre ambas configuraciones. |

---

## 23. Reglas de datos seed y demo

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-SEED-001 | Seed reproducible | El sistema debe disponer de un script único reproducible que genere todos los datos seed necesarios para la demo. | Seed | Must Have | MVP | Explicit | QA ejecuta el script desde estado limpio y valida coherencia. |
| BR-SEED-002 | Cantidades mínimas | El seed debe incluir al menos: 5–10 organizadores, 10–20 proveedores, 10–15 eventos, 10–15 categorías, 15–25 `QuoteRequests`, 10–20 `Quotes`, 20–40 reseñas. | Seed | Must Have | MVP | Explicit | QA valida cantidades tras la ejecución. |
| BR-SEED-003 | Diversidad de estados de evento | El seed debe incluir eventos en estados `draft`, `active` y `completed`, con la distribución mínima: 3 recién creados, 5 en progreso, 3 finalizados. | Seed | Must Have | MVP | Explicit | QA valida la distribución por estado. |
| BR-SEED-004 | Coherencia cultural | El contenido seed debe ser culturalmente coherente con LATAM (categorías, nombres de paquetes, modismos en plantillas). | Seed, contenido | Must Have | MVP | Explicit | QA revisa el contenido seed con el Product Owner. |
| BR-SEED-005 | Marca de seed en entidades | Las entidades creadas por seed deben llevar un flag `seed: true` o equivalente para distinguirlas de datos generados durante la demo. | Seed | Should Have | MVP | Recommended | QA verifica el flag en BD. |
| BR-SEED-006 | Booking intent confirmado en seed | El seed debe incluir al menos un `BookingIntent.confirmed_intent` para evidenciar el cierre del flujo. | Seed | Must Have | MVP | Explicit | QA valida la presencia de al menos un booking confirmado. |
| BR-SEED-007 | Reseñas seed asociadas a booking | Las reseñas seed deben asociarse a `BookingIntent.confirmed_intent` para respetar la regla `BR-REVIEW-001`. | Seed, reseñas | Must Have | MVP | Derived | QA valida la coherencia referencial. |
| BR-SEED-008 | Independencia de proveedores reales | La demo debe funcionar de extremo a extremo sin requerir proveedores reales. | Seed, proveedores | Must Have | MVP | Explicit | QA ejecuta la demo en entorno aislado y valida flujo completo. |
| BR-SEED-009 | Multi-idioma en seed | El seed debe incluir contenido representativo en los 4 idiomas soportados (al menos para entidades clave). | Seed, i18n | Should Have | MVP | Recommended | QA valida la cobertura multi-idioma. |
| BR-SEED-010 | Datos demo sin información sensible | El seed no debe contener datos personales reales ni medios de pago reales. Toda información personal es ficticia. | Seed, privacidad | Must Have | MVP | Explicit | QA valida la ausencia de datos personales identificables reales. |

---

## 24. Reglas de administración y auditoría

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-ADMIN-001 | Aprobación de proveedores | Solo el admin puede aprobar o rechazar `VendorProfile` en estado `pending`. | Admin, proveedores | Must Have | MVP | Explicit | QA verifica que otros roles no puedan aprobar. |
| BR-ADMIN-002 | Gestión de categorías | El admin puede crear, editar y eliminar `ServiceCategory`. | Admin, categorías | Must Have | MVP | Explicit | QA valida el CRUD. |
| BR-ADMIN-003 | Moderación de reseñas | El admin puede ocultar o eliminar reseñas ofensivas. | Admin, reseñas | Must Have | MVP | Explicit | QA valida la acción y su trazabilidad. |
| BR-ADMIN-004 | Registro en AdminAction | Toda acción administrativa relevante (aprobar, rechazar, eliminar, moderar) debe registrarse en `AdminAction` con admin, target, acción y timestamp. | Admin, auditoría | Must Have | MVP | Explicit | QA valida la presencia del registro tras cada acción. |
| BR-ADMIN-005 | Métricas operativas y de gobernanza del panel admin | El panel admin debe ofrecer **métricas operativas, de gobernanza, uso de IA, cotizaciones y demo readiness** (decisión PO 8.1 #10). No se incluyen métricas comerciales reales (ingresos, comisiones, CAC, LTV, ROI). Métricas Must Have: total de usuarios, organizadores, proveedores, proveedores pendientes de aprobación, proveedores aprobados, eventos creados, eventos por estado, `QuoteRequest` creadas, `Quote` respondidas. Métricas Should Have: reseñas publicadas, reseñas ocultas/eliminadas, `AIRecommendation` generadas, eventos completados, `BookingIntent` creados. | Admin, métricas, gobernanza | Must Have | MVP | Explicit | QA valida que el panel exponga las métricas Must Have y no exponga métricas comerciales reales. |
| BR-ADMIN-006 | Sin doble función comercial | El admin no actúa como organizador ni proveedor en flujos comerciales del MVP. | Admin | Must Have | MVP | Explicit | QA verifica que el admin no aparezca como owner ni vendor. |
| BR-ADMIN-007 | Acciones masivas básicas | El panel admin debe soportar al menos filtros y búsquedas básicas, no acciones masivas complejas en MVP. | Admin, UX | Could Have | MVP | Explicit | QA valida los filtros disponibles. |
| BR-ADMIN-008 | Acceso a logs de IA | El admin debe poder consultar el log de `AIRecommendation` para auditoría de salidas IA. | Admin, IA, auditoría | Should Have | MVP | Recommended | QA valida la disponibilidad del log. |
| BR-ADMIN-009 | Gestión de usuarios seed | El admin puede gestionar usuarios seed (creación/edición), siempre marcando como `seed`. | Admin, seed | Should Have | MVP | Explicit | QA valida la gestión de usuarios seed. |
| BR-ADMIN-010 | Trazabilidad del seed | Las acciones administrativas sobre datos seed quedan también registradas en `AdminAction`. | Admin, seed | Should Have | MVP | Derived | QA valida la traza en BD. |
| BR-ADMIN-011 | Auditoría exhaustiva de acciones admin sobre catálogos y contenido | Todas las acciones admin sobre `Review` (ocultar/eliminar), `VendorProfile` (aprobar/rechazar/ocultar), `EventType` (activar/desactivar/editar/desactivar), `ServiceCategory` (crear/editar/desactivar/jerarquía) y `Attachment` (ocultar/moderar) deben registrarse en `AdminAction` con `admin_id`, `target_type`, `target_id`, `action`, `reason` y timestamp. | Admin, auditoría | Must Have | MVP | Explicit | QA valida el registro en `AdminAction` para cada tipo de acción. |
| BR-ADMIN-012 | Gestión de jerarquía de categorías por admin | El admin puede gestionar la jerarquía simple de `ServiceCategory` (parent/child) respetando el máximo de 2 niveles (ver BR-SERVICE-005). No se permite eliminar físicamente categorías con servicios asociados; se usa soft delete (BR-SERVICE-007). | Admin, categorías | Must Have | MVP | Explicit | QA crea jerarquía válida y bloquea creación de 3er nivel. |

---

## 25. Reglas de privacidad y buenas prácticas

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-PRIVACY-001 | Buenas prácticas de seguridad | El MVP debe aplicar buenas prácticas de seguridad: cifrado en tránsito (HTTPS) y en reposo para datos sensibles. | Privacidad, seguridad | Must Have | MVP | Explicit | QA valida HTTPS y configuración mínima de cifrado. |
| BR-PRIVACY-002 | Minimización de datos | El sistema debe recolectar la mínima cantidad de datos personales necesarios para la operación del producto. | Privacidad | Must Have | MVP | Explicit | QA revisa formularios y bases de datos. |
| BR-PRIVACY-003 | Aislamiento entre roles | Los datos privados de un usuario no deben ser accesibles a otros usuarios fuera del contexto autorizado. | Privacidad, permisos | Must Have | MVP | Explicit | QA ejecuta pruebas de aislamiento entre cuentas. |
| BR-PRIVACY-004 | Sin cumplimiento normativo país-específico | El MVP no implementa cumplimiento legal formal por país (LFPDPPP México, LOPD España, etc.). Solo buenas prácticas. | Privacidad, normativa | Must Have | MVP | Explicit | Documentar la decisión en ADR. |
| BR-PRIVACY-005 | Política de privacidad disponible | El sistema debe exponer una política de privacidad accesible al usuario. | Privacidad | Should Have | MVP | Recommended | QA valida la presencia y accesibilidad. |
| BR-PRIVACY-006 | Sin captura de medios de pago | El sistema no captura ni almacena medios de pago (números de tarjeta, CVV, IBAN, etc.). | Privacidad, pagos | Must Have | MVP | Explicit | QA confirma ausencia total de captura de medios de pago. |
| BR-PRIVACY-007 | Sin datos sensibles especiales | El sistema no recolecta categorías especiales de datos personales (salud, ideología, biometría). | Privacidad | Must Have | MVP | Explicit | QA verifica formularios y modelos de datos. |
| BR-PRIVACY-008 | Manejo seguro de contraseñas | Las contraseñas deben almacenarse con hashing seguro (bcrypt, argon2 o equivalente). | Privacidad, autenticación | Must Have | MVP | Recommended | QA valida la estrategia de hashing. |
| BR-PRIVACY-009 | Sesión segura | Los tokens de sesión deben tener expiración configurada y rotarse de forma segura. | Privacidad, autenticación | Must Have | MVP | Recommended | QA valida la configuración de tokens. |
| BR-PRIVACY-010 | Datos seed sin PII real | Los datos seed no deben contener información personal identificable real. | Privacidad, seed | Must Have | MVP | Explicit | QA revisa el script seed antes de la demo. |
| BR-PRIVACY-011 | Soft delete para attachments | La eliminación de attachments (imágenes del portafolio del proveedor, evidencias, etc.) debe implementarse como **soft delete** sobre la metadata (`status='deleted'` o `is_active=false`), ocultando el archivo de la UI pública. La **eliminación física** del archivo del storage puede ejecutarse posteriormente mediante un proceso técnico de mantenimiento (decisión PO 8.1 #19). | Privacidad, attachments, storage | Must Have | MVP | Explicit | QA valida que un attachment "eliminado" deje de mostrarse pero conserve metadata para auditoría. |

---

## 26. Reglas fuera de alcance para el MVP

Las siguientes reglas describen funcionalidades **explícitamente fuera del alcance del MVP**. Ninguna implementación debe habilitarlas en v1.

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-OOS-001 | Sin pagos reales | El MVP no procesa pagos, no captura medios de pago y no integra pasarelas de pago (Stripe, PayPal, etc.). | Pagos | Must Have | Out of Scope | Explicit | QA confirma ausencia de funcionalidades de pago. |
| BR-OOS-002 | Sin comisiones reales | No se implementan comisiones por contrato cerrado, ni cobros automáticos al proveedor. | Modelo de negocio | Must Have | Out of Scope | Explicit | Confirmar ausencia en la lógica de negocio. |
| BR-OOS-003 | Sin contratos legales | No se generan contratos digitales con firma electrónica. | Legal | Must Have | Out of Scope | Explicit | Confirmar ausencia de firma electrónica. |
| BR-OOS-004 | Sin integración WhatsApp | No se integra WhatsApp Business API ni canales SMS. | Integraciones | Must Have | Out of Scope | Explicit | Confirmar ausencia de la integración. |
| BR-OOS-005 | Sin app móvil nativa | No se desarrolla aplicación móvil nativa para iOS o Android. Solo web responsive. | Plataforma | Must Have | Out of Scope | Explicit | Confirmar que el proyecto no incluye repos móviles. |
| BR-OOS-006 | Sin chat real-time | No se implementa chat real-time entre organizador y proveedor con presencia. | Comunicaciones | Must Have | Out of Scope | Explicit | Confirmar ausencia de chat real-time. |
| BR-OOS-007 | Sin análisis de sentimiento | No se implementa análisis de sentimiento sobre reseñas ni textos generados por usuarios. | IA, reseñas | Must Have | Out of Scope | Explicit | Confirmar ausencia de la funcionalidad. |
| BR-OOS-008 | Sin moderación automática IA | No se implementa moderación automática de contenido mediante IA. | IA, reseñas | Must Have | Out of Scope | Explicit | Confirmar ausencia de la funcionalidad. |
| BR-OOS-009 | Sin verificación automática de proveedores | No se realiza KYC automatizado ni verificación de identidad/documentación con servicios externos. | Proveedores | Must Have | Out of Scope | Explicit | Confirmar ausencia de la funcionalidad. |
| BR-OOS-010 | Sin manejo fiscal complejo | No se manejan impuestos, facturación electrónica ni reportes fiscales. | Pagos, fiscal | Must Have | Out of Scope | Explicit | Confirmar ausencia de funcionalidades fiscales. |
| BR-OOS-011 | Sin geolocalización avanzada | No se incluyen mapas interactivos, rutas o geofencing. | UX | Must Have | Out of Scope | Explicit | Confirmar ausencia de mapas interactivos. |
| BR-OOS-012 | Sin marketplace transaccional | El MVP no opera como marketplace transaccional completo (pagos, comisiones, garantías, disputas). | Estrategia | Must Have | Out of Scope | Explicit | Confirmar la naturaleza no transaccional del flujo. |
| BR-OOS-013 | Sin multi-colaboradores por evento | No se habilita colaboración multi-usuario por evento. | Eventos, usuarios | Must Have | Out of Scope | Explicit | Confirmar ausencia de invitación de colaboradores. |
| BR-OOS-014 | Sin lista de invitados/RSVP | No se gestiona lista de invitados, RSVP ni asignación de mesas. | Eventos | Must Have | Out of Scope | Explicit | Confirmar ausencia de la funcionalidad. |
| BR-OOS-015 | Sin conversión automática de moneda | No se realizan conversiones automáticas entre monedas ni consultas a tipos de cambio. | Moneda | Must Have | Out of Scope | Explicit | Confirmar ausencia de la funcionalidad. |
| BR-OOS-016 | Sin generación de imágenes con IA | No se generan imágenes, decoración o assets visuales mediante IA. | IA | Must Have | Out of Scope | Explicit | Confirmar ausencia de la funcionalidad. |
| BR-OOS-017 | Sin push notifications/SMS | No se implementan push notifications móviles ni SMS. | Notificaciones | Must Have | Out of Scope | Explicit | Confirmar ausencia de los canales. |
| BR-OOS-018 | Sin chat libre IA | No se implementa chatbot conversacional libre con IA. | IA | Must Have | Out of Scope | Explicit | Confirmar ausencia del chatbot. |

---

## 27. Reglas futuras recomendadas

Las siguientes reglas no se implementan en el MVP, pero se documentan para versiones posteriores y para evitar decisiones contradictorias durante el desarrollo del MVP.

| Rule ID | Rule name | Description | Applies to | Priority | Scope | Source type | Validation notes |
|---|---|---|---|---|---|---|---|
| BR-FUTURE-001 | Multi-rol por usuario | Un mismo usuario podrá tener múltiples roles activos (ej. organizador y proveedor). | Roles | Future | Future | Explicit | Diseño de permisos preparado para multi-rol futuro. |
| BR-FUTURE-002 | Colaboradores por evento | Se permitirán colaboradores por evento (pareja, familia, planner) con permisos básicos. | Eventos, usuarios | Future | Future | Explicit | Documentar requerimientos detallados antes de implementar. |
| BR-FUTURE-003 | Pagos reales y comisiones | Integración con pasarela de pago, captura de medios de pago, comisión por contrato cerrado. | Pagos, modelo de negocio | Future | Future | Explicit | Diseño debe incluir compliance y manejo de disputas. |
| BR-FUTURE-004 | Contratos digitales | Generación de contratos digitales con firma electrónica. | Legal | Future | Future | Explicit | Evaluar proveedor de firma electrónica adecuado por mercado. |
| BR-FUTURE-005 | Chat real-time | Chat entre organizador y proveedor con presencia, historial y notificaciones push. | Comunicaciones | Future | Future | Explicit | Diseñar infraestructura adecuada (WebSockets, etc.). |
| BR-FUTURE-006 | App móvil nativa | Aplicación móvil iOS/Android. | Plataforma | Future | Future | Explicit | Evaluar stack y modelo de distribución. |
| BR-FUTURE-007 | WhatsApp Business | Integración con WhatsApp Business API para notificaciones salientes. | Notificaciones | Future | Future | Explicit | Considerar costos y políticas de WhatsApp. |
| BR-FUTURE-008 | Análisis de sentimiento IA | Análisis automático del sentimiento de reseñas y alertas de reputación. | Reseñas, IA | Future | Future | Explicit | Definir umbral de alerta y políticas. |
| BR-FUTURE-009 | Moderación automática IA | Detección automática de lenguaje ofensivo en reseñas y comentarios. | Reseñas, IA | Future | Future | Explicit | Definir flujo de revisión humana sobre alertas IA. |
| BR-FUTURE-010 | KYC de proveedores | Verificación automatizada de identidad y documentación de proveedores. | Proveedores | Future | Future | Explicit | Evaluar proveedor KYC adecuado por mercado. |
| BR-FUTURE-011 | Calendario completo de disponibilidad | Calendario interactivo de disponibilidad por proveedor. | Proveedores | Future | Future | Explicit | Diseñar UX y backend para conflictos de doble booking. |
| BR-FUTURE-012 | Recomendaciones IA específicas | Recomendaciones IA de proveedores concretos basadas en historial y feedback loop. | IA, proveedores | Future | Future | Explicit | Requiere data real significativa. |
| BR-FUTURE-013 | Resumen ejecutivo del evento | Resumen IA del estado global del evento al final del flujo. | IA, dashboard | Future | Future | Explicit | Bajo valor para MVP. |
| BR-FUTURE-014 | RSVP y gestión de invitados | Lista de invitados, RSVP, asignación de mesas, recordatorios. | Eventos | Future | Future | Explicit | Diseñar como módulo independiente. |
| BR-FUTURE-015 | Detección de inconsistencias IA | Detección automática de inconsistencias entre presupuesto y cotizaciones. | IA, presupuesto | Future | Future | Explicit | Bajo costo de implementación cuando se priorice. |
| BR-FUTURE-016 | Cumplimiento normativo por país | Cumplimiento formal LFPDPPP, LOPD, GDPR según mercado. | Privacidad, normativa | Future | Future | Explicit | Evaluar antes de operación comercial. |
| BR-FUTURE-017 | Modelo freemium colaborativo | Plan freemium para organizadores con upgrade por colaboradores. | Modelo de negocio | Future | Future | Explicit | Diseñar gating de funcionalidades. |
| BR-FUTURE-018 | Suscripción real de proveedores | Suscripción mensual real con cobro automatizado. | Modelo de negocio | Future | Future | Explicit | Requiere integración de pagos. |
| BR-FUTURE-019 | Plan premium con galería destacada | Plan premium para proveedores con galería destacada y boost en directorio. | Modelo de negocio | Future | Future | Explicit | Diseñar reglas de priorización. |
| BR-FUTURE-020 | Integración Google Calendar/Outlook | Sincronización con calendarios externos. | Integraciones | Future | Future | Explicit | Evaluar oAuth y privacidad. |

---

## 28. Matriz consolidada de reglas de negocio

| Dominio | Total reglas | MVP | Future | Out of Scope |
|---|---:|---:|---:|---:|
| Autenticación y roles (BR-AUTH) | 10 | 10 | 0 | 0 |
| Usuarios (BR-USER) | 6 | 5 | 1 | 0 |
| Eventos (BR-EVENT) | 12 | 12 | 0 | 0 |
| Tipos de evento (BR-EVENTTYPE) | 6 | 5 | 1 | 0 |
| Planificación IA (BR-AI) | 15 | 14 | 0 | 1 |
| Checklist y tareas (BR-TASK) | 10 | 10 | 0 | 0 |
| Presupuesto y moneda (BR-BUDGET) | 10 | 10 | 0 | 0 |
| Proveedores (BR-VENDOR) | 10 | 10 | 0 | 0 |
| Servicios y categorías (BR-SERVICE) | 7 | 7 | 0 | 0 |
| Cotizaciones (BR-QUOTE) | 25 | 25 | 0 | 0 |
| Booking intent (BR-BOOKING) | 10 | 10 | 0 | 0 |
| Reseñas y moderación (BR-REVIEW) | 10 | 8 | 2 | 0 |
| Notificaciones (BR-NOTIF) | 7 | 6 | 0 | 1 |
| Idioma e i18n (BR-I18N) | 8 | 8 | 0 | 0 |
| Datos seed (BR-SEED) | 10 | 10 | 0 | 0 |
| Administración (BR-ADMIN) | 10 | 10 | 0 | 0 |
| Privacidad (BR-PRIVACY) | 10 | 10 | 0 | 0 |
| Fuera de alcance (BR-OOS) | 18 | 0 | 0 | 18 |
| Futuras recomendadas (BR-FUTURE) | 20 | 0 | 20 | 0 |
| **Total** | **214** | **170** | **24** | **20** |

> Las cifras se actualizarán si se agregan o eliminan reglas en revisiones posteriores del documento.

---

## 29. Reglas críticas para QA y aceptación

Las siguientes reglas son **críticas para el cierre del MVP** y deben verificarse antes de declarar el producto listo para la demo y la evaluación académica.

### 29.1 Flujo end-to-end del organizador

- BR-AUTH-001, BR-AUTH-006 (autenticación y permisos del organizador).
- BR-EVENT-001 a BR-EVENT-009 (creación, propiedad, estados y dashboard).
- BR-AI-001 a BR-AI-008 (planificación IA con validación humana y trazabilidad).
- BR-TASK-001 a BR-TASK-009 (checklist y tareas).
- BR-BUDGET-001 a BR-BUDGET-010 (presupuesto y moneda).
- BR-QUOTE-001 a BR-QUOTE-009 (solicitudes de cotización).
- BR-QUOTE-021 a BR-QUOTE-024 (comparación).
- BR-BOOKING-001 a BR-BOOKING-008 (booking intent simulado).
- BR-REVIEW-001 a BR-REVIEW-005 (reseñas verificadas).

### 29.2 Flujo del proveedor

- BR-AUTH-002, BR-AUTH-007 (registro y permisos del proveedor).
- BR-VENDOR-001 a BR-VENDOR-010 (perfil y aprobación).
- BR-SERVICE-001, BR-SERVICE-002 (servicios y paquetes).
- BR-QUOTE-011 a BR-QUOTE-020 (respuesta a cotización).
- BR-BOOKING-002, BR-BOOKING-006 (confirmación de booking).

### 29.3 Flujo del administrador

- BR-AUTH-008, BR-AUTH-010 (acceso restringido al admin).
- BR-ADMIN-001 a BR-ADMIN-010 (gobernanza y auditoría).
- BR-REVIEW-005, BR-REVIEW-006 (moderación manual sin IA).
- BR-SERVICE-003 (gestión de categorías).

### 29.4 Validaciones transversales

- BR-AI-001 (validación humana obligatoria de IA).
- BR-AI-005, BR-AI-006 (capa de abstracción LLM y MockAIProvider).
- BR-I18N-001 a BR-I18N-007 (multi-idioma operativo).
- BR-BUDGET-006, BR-BUDGET-007 (moneda configurable y sin conversión).
- BR-SEED-001, BR-SEED-002, BR-SEED-003 (seed reproducible y completo).
- BR-PRIVACY-001 a BR-PRIVACY-010 (privacidad y seguridad).
- BR-OOS-001 a BR-OOS-018 (verificación de ausencia de funcionalidades fuera de alcance).

### 29.5 Criterios de aceptación del MVP

El MVP se considera aceptado solo si **todas las reglas Must Have del scope MVP se cumplen y todas las reglas Out of Scope se confirman como ausentes**. Las reglas Should Have y Could Have se cumplen en la medida de lo posible sin comprometer el cierre.

---

## 30. Preguntas abiertas o decisiones pendientes

Las 15 preguntas originales de este documento fueron resueltas por el Product Owner mediante el addendum [`/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`](./8.1-Product-Owner-Decisions-Use-Cases-Addendum.md) (en adelante "Addendum 8.1"). Las reglas afectadas fueron actualizadas en este documento.

### 30.1 Decisiones resueltas (PO 8.1)

| # | Pregunta original | Decisión PO 8.1 | Reglas actualizadas | Estado |
|---:|---|---|---|---|
| 1 | Escala numérica de `rating` | Escala **1–5** (5 = mejor, 1 = peor) | BR-REVIEW-003 | Resuelta |
| 2 | Límite máximo de imágenes en portafolio | Hasta **10 imágenes por evento/trabajo mostrado** | BR-VENDOR-005 | Resuelta |
| 3 | Cambios de categoría tras aprobación | Hasta **5 ediciones**; revisión admin si afectan visibilidad pública | BR-VENDOR-004 | Resuelta |
| 4 | Validez por defecto de `Quote` | **15 días calendario** desde `created_at` si no se especifica | BR-QUOTE-015 | Resuelta |
| 5 | Cancelación de `BookingIntent` confirmado | **Permitida en MVP**; sin penalización en plataforma (no hay pagos) | BR-BOOKING-009 | Resuelta |
| 6 | Cierre automático de eventos pasados | Auto-`completed` **2 días después** de la fecha del evento | BR-EVENT-013 | Resuelta |
| 7 | Cambio de moneda con `BudgetItem` existentes | **No se permite cambio**; moneda inmutable tras creación; opciones: local o USD | BR-EVENT-007, BR-BUDGET-006 | Resuelta |
| 8 | Captcha/anti-bot en registro y login | **Obligatorio** en ambos formularios | BR-AUTH-011 | Resuelta |
| 9 | Timeout de IA antes de fallback | **1 minuto (60 000 ms)** | BR-AI-009 | Resuelta |
| 10 | Métricas exactas del panel admin | Métricas operativas, gobernanza, IA, cotizaciones y demo readiness (sin métricas comerciales reales) | BR-ADMIN-005 | Resuelta |
| 11 | Eliminación de reseñas por admin | **Soft delete + auditoría** obligatoria (no hard delete) | BR-REVIEW-005 | Resuelta |
| 12 | Límite de `QuoteRequest` activas | Máximo **5 activas por categoría de servicio por evento** | BR-QUOTE-009 | Resuelta |
| 13 | Notificación al proveedor por `Quote` rechazada/expirada | Notificación **in-app obligatoria**; email cuando exista la funcionalidad | BR-NOTIF-002 | Resuelta |
| 14 | Respuesta del proveedor a reseñas | **Fuera del MVP**; queda como funcionalidad futura | BR-REVIEW-008 | Resuelta |
| 15 | `AnthropicProvider` operativo en MVP | **No obligatorio**; basta con interfaz preparada (stub/futuro) | BR-AI-005 | Resuelta |

### 30.2 Preguntas abiertas remanentes

Al cierre de esta revisión **no quedan preguntas abiertas críticas que bloqueen la generación del FRD**. Cualquier ajuste menor que surja durante la implementación deberá registrarse en una nueva versión de este documento.

---

## 31. Resumen final

Este documento consolida **214 reglas de negocio** que gobiernan el comportamiento del MVP de EventFlow, distribuidas en 17 dominios funcionales y 2 dominios meta (futuro y fuera de alcance).

- **170 reglas aplican al MVP** y deben implementarse y validarse antes del cierre.
- **24 reglas se documentan como futuras** para preservar consistencia conceptual y evitar decisiones contradictorias durante el desarrollo del MVP.
- **20 reglas declaran funcionalidades fuera de alcance** explícitas, alineadas con la decisión estratégica de no construir un marketplace transaccional completo en v1.

Las **reglas críticas** (sección 5) y las **reglas de QA y aceptación** (sección 29) constituyen el filtro mínimo para declarar el MVP listo para demo y evaluación académica. Las **preguntas abiertas** (sección 30) deben resolverse con el Product Owner durante el desarrollo para afinar las reglas correspondientes.

Este documento debe **mantenerse vivo**: cualquier cambio de alcance, ajuste de decisión del Product Owner o aprendizaje durante el desarrollo debe reflejarse en una nueva versión del documento, manteniendo la trazabilidad con los documentos fuente (`1-Domain-Discovery-Report.md`, `2-Product-Owner-Decisions.md`, `3-MVP-Scope-Definition.md`).

> **Próximo paso recomendado:** convertir las reglas Must Have del MVP en **user stories** y **criterios de aceptación** trazables, asegurando que cada feature `Must Have` del MVP Scope Definition esté cubierta por al menos una historia y al menos una regla.
