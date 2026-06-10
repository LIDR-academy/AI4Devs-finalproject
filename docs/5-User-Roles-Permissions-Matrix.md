# EventFlow — User Roles & Permissions Matrix

> Documento formal de Roles de Usuario y Matriz de Permisos del MVP
> Versión: 1.0
> Idioma: Español LATAM neutral
> Audiencia: Product Owner, Business Analyst, equipo de desarrollo asistido por IA, QA, agentes IA generadores de FRD, casos de uso, user stories, criterios de aceptación y guardas de ruta
> Documentos fuente: `1-Domain-Discovery-Report.md`, `2-Product-Owner-Decisions.md`, `3-MVP-Scope-Definition.md`, `4-Business-Rules-Document.md`

---

## 1. Propósito del documento

Este documento define de forma estructurada, trazable y verificable el conjunto de **roles de usuario, responsabilidades, permisos por módulo y por entidad, reglas de propiedad, reglas de acceso y reglas de gobernanza** que aplican al MVP de EventFlow.

Sirve como **fuente única de verdad de autorización** para:

- Definir quién puede crear, ver, editar, eliminar, aprobar, rechazar, moderar, responder o comparar cada recurso del sistema.
- Alimentar la generación de **FRD, casos de uso, user stories y criterios de aceptación**.
- Definir **reglas de autorización backend** (controladores, servicios, capas de seguridad) y **guardas de ruta frontend**.
- Generar **escenarios de prueba de QA** para validar permisos por rol y por contexto.
- Mantener la coherencia con el alcance MVP y evitar la incorporación de capacidades fuera de alcance.

El documento responde, de manera operativa, a cinco preguntas:

1. ¿Qué roles existen en el MVP?
2. ¿Qué puede hacer cada rol y sobre qué recursos?
3. ¿Quién es dueño de cada recurso y qué reglas de acceso aplican?
4. ¿Qué permisos quedan explícitamente fuera del MVP?
5. ¿Qué reglas de autorización debe respetar tanto el backend como el frontend?

---

## 2. Alcance del documento

Este documento cubre la **autorización funcional del MVP**, incluyendo:

- Roles incluidos en el MVP y roles futuros.
- Responsabilidades por rol.
- Permisos por módulo del producto.
- Permisos por entidad de dominio (CRUD y acciones especiales).
- Reglas de propiedad de recursos (ownership) y reglas de acceso (visibility).
- Permisos transversales (IA, cotizaciones, reseñas, configuración).
- Permisos sobre datos seed y demo.
- Autorización a nivel de rutas/pantallas y a nivel de API/backend.
- Permisos explícitamente fuera de alcance del MVP.
- Escenarios de validación para QA.

**Lo que este documento NO cubre:**

- Especificación técnica detallada de implementación (esquemas de BD, contratos API formales, librerías de auth).
- Diseño visual ni interacciones específicas de UI.
- Plan de pruebas completo (sí se incluyen escenarios críticos para QA).
- Reglas de negocio en sí (cubiertas en `4-Business-Rules-Document.md`).

---

## 3. Fuentes utilizadas

| # | Documento | Uso |
|---:|---|---|
| 1 | `/docs/1-Domain-Discovery-Report.md` | Modelo de dominio, JTBD, entidades, reglas iniciales (sección 8), roles preliminares. |
| 2 | `/docs/2-Product-Owner-Decisions.md` | Decisiones de producto sobre mercado, idiomas, moneda, branding, modelo de negocio, datos seed, moderación. |
| 3 | `/docs/3-MVP-Scope-Definition.md` | Alcance funcional, flujos principales, roles MVP y tabla resumen de permisos (sección 5). |
| 4 | `/docs/4-Business-Rules-Document.md` | Reglas críticas (sección 5), reglas por dominio (BR-AUTH, BR-EVENT, BR-AI, BR-QUOTE, BR-BOOKING, BR-REVIEW, BR-ADMIN, BR-OOS, BR-FUTURE). |

Toda capacidad y permiso documentado se deriva o cita explícitamente de uno o más de estos documentos. Cuando un permiso no aparece de forma explícita pero se infiere de manera razonable, se marca como **Derived** o **Recommended**. Permisos futuros o fuera de alcance se marcan como **Future** o **Out of Scope**.

---

## 4. Principios de autorización del MVP

Estos principios actúan como filtro transversal para evaluar cualquier permiso, ruta o acción del sistema.

1. **Acceso basado en propiedad (ownership).** Los usuarios solo pueden gestionar los recursos que les pertenecen o que les son asignados explícitamente.
2. **Principio de menor privilegio.** Cada rol recibe únicamente los permisos necesarios para cumplir su responsabilidad en el MVP. Ningún rol recibe permisos por defecto.
3. **Human-in-the-loop para IA.** Toda salida generada por IA es sugerencia editable; nunca se convierte en dato oficial sin confirmación humana explícita (BR-AI-001).
4. **Moderación controlada por admin.** En el MVP, la moderación de contenido es manual; no existe moderación automática IA (BR-REVIEW-005, BR-REVIEW-006).
5. **Sin pagos reales.** Ningún rol puede procesar pagos, comisiones, facturas, captura de medios de pago o reembolsos en el MVP (BR-OOS-001, BR-OOS-002, BR-PRIVACY-006).
6. **Sin integración WhatsApp.** Ningún rol puede disparar flujos basados en WhatsApp en el MVP (BR-OOS-004, BR-NOTIF-006).
7. **Sin permisos específicos de aplicación móvil nativa.** El MVP es exclusivamente web responsive (BR-OOS-005).
8. **Aprobación previa del proveedor.** Los `VendorProfile` deben tener `status = approved` para aparecer en la búsqueda pública (BR-VENDOR-001).
9. **Restricción de visibilidad de cotizaciones.** Los proveedores solo pueden ver `QuoteRequest` dirigidas a ellos (BR-QUOTE-006).
10. **Privacidad de eventos.** Los organizadores no pueden ver eventos privados de otros organizadores (BR-EVENT-002, BR-AUTH-009).
11. **Aislamiento de datos por rol.** Las reglas de visibilidad garantizan que ningún usuario acceda a datos privados fuera de su contexto autorizado (BR-AUTH-009, BR-PRIVACY-003).
12. **Trazabilidad de acciones admin.** Toda acción del admin queda registrada en `AdminAction` para auditoría (BR-ADMIN-004, BR-AI-007).
13. **Mono-rol por usuario en el MVP.** Un usuario tiene un único rol activo en el MVP (BR-AUTH-005); multi-rol es futuro (BR-FUTURE-001).
14. **Sin colaboradores multi-usuario por evento.** En el MVP solo el `owner` gestiona el evento (BR-USER-004, BR-OOS-013).

---

## 5. Roles incluidos en el MVP

El MVP incluye exclusivamente **tres roles activos**: `organizer`, `vendor` y `admin`. Multi-rol simultáneo y roles colaborativos son funcionalidades futuras.

### 5.1 Organizador

**Descripción:** Persona usuaria que crea y gestiona eventos sociales o corporativos en la plataforma.

**Estado MVP:** Incluido (Must Have).

**Responsabilidad principal:** Convertir una idea de evento en un plan accionable con apoyo de IA y gestionar el ciclo completo del evento (creación, planificación, cotización, booking, reseña).

**El organizador puede:**

- Registrarse e iniciar sesión.
- Crear, ver, editar y eliminar **sus propios** eventos.
- Solicitar generación IA de plan, checklist, presupuesto, recomendaciones de categorías y brief de cotización.
- Aceptar, editar, rechazar o regenerar las sugerencias IA.
- Gestionar tareas (`EventTask`) de sus propios eventos.
- Gestionar presupuesto (`Budget`, `BudgetItem`) de sus propios eventos.
- Configurar idioma y moneda de sus eventos **únicamente durante la creación** (moneda local o USD; inmutable después — BR-EVENT-007, decisión PO 8.1 #7).
- Buscar y filtrar en el directorio público de proveedores aprobados.
- Marcar proveedores como favoritos (recomendado).
- Enviar `QuoteRequest` a proveedores aprobados respetando el **límite de 5 solicitudes activas por categoría de servicio por evento** (BR-QUOTE-009, decisión PO 8.1 #12).
- Ver, comparar y marcar como `preferred` las `Quote` recibidas para sus eventos.
- Solicitar y leer un resumen IA opcional del comparador.
- Crear `BookingIntent` simulados a partir de `Quote` vigentes y aceptadas.
- Cancelar `BookingIntent` propios, **incluyendo los confirmados** (`confirmed_intent`), sin penalización en plataforma (BR-BOOKING-009, decisión PO 8.1 #5).
- Crear `Review` para proveedores con `BookingIntent.confirmed_intent` con su evento usando **escala 1–5** (BR-REVIEW-003, decisión PO 8.1 #1).
- Ver y marcar como leídas sus propias notificaciones.
- Cambiar idioma preferido de su cuenta.
- Ver su propio perfil y editar sus datos personales mínimos.

**El organizador no puede:**

- Ver, editar ni eliminar eventos de otros organizadores (BR-AUTH-009, BR-EVENT-002).
- **Cambiar la moneda del evento después de creado** (BR-EVENT-007).
- **Exceder el límite de 5 `QuoteRequest` activas por categoría de servicio por evento** (BR-QUOTE-009).
- Aprobar, rechazar u ocultar `VendorProfile` (BR-VENDOR-001, BR-ADMIN-001).
- Gestionar `ServiceCategory` ni `EventType` (BR-SERVICE-003).
- Moderar, ocultar o eliminar reseñas (BR-REVIEW-005).
- Responder como proveedor a `QuoteRequest` (BR-QUOTE-011).
- Acceder al panel admin ni a sus rutas (BR-AUTH-010).
- Procesar pagos, comisiones, contratos legales ni facturación (BR-OOS-001, BR-OOS-002, BR-OOS-003, BR-OOS-010).
- Disparar notificaciones por WhatsApp (BR-NOTIF-006, BR-OOS-004).
- Editar `Review` ya publicadas (BR-REVIEW-007).

### 5.2 Proveedor

**Descripción:** Pyme o freelancer que ofrece servicios para eventos (catering, fotografía, DJ, decoración, salón, makeup, etc.).

**Estado MVP:** Incluido (Must Have).

**Responsabilidad principal:** Mantener un perfil aprobado, ofrecer paquetes/servicios y responder de forma estructurada a las solicitudes de cotización recibidas.

**El proveedor puede:**

- Registrarse e iniciar sesión.
- Crear, ver y editar **su propio** `VendorProfile`.
- Someter su `VendorProfile` para aprobación admin (estado `pending`).
- Gestionar **sus propios** `VendorService` / paquetes (crear, ver, editar, eliminar).
- Asociar `VendorService` a `ServiceCategory` existentes en el catálogo.
- **Editar/cambiar las categorías de su perfil hasta un máximo de 5 ediciones acumuladas** (BR-VENDOR-004, decisión PO 8.1 #3). Cambios sustantivos pueden disparar revisión admin.
- Gestionar su portafolio dividido por trabajos/eventos mostrados, con **hasta 10 imágenes por trabajo** (BR-VENDOR-005, decisión PO 8.1 #2). Eliminación de imágenes mediante soft delete (BR-PRIVACY-011).
- Ver `QuoteRequest` dirigidas exclusivamente a su `VendorProfile`.
- Crear y editar `Quote` en estado `draft`.
- Enviar `Quote` como respuesta a `QuoteRequest` (transición a `sent`). Si no se especifica `valid_until`, el sistema aplica **15 días calendario por defecto** (BR-QUOTE-015, decisión PO 8.1 #4).
- Confirmar o rechazar `BookingIntent` ligados a sus `Quote` aceptadas.
- Cancelar `BookingIntent` propios, **incluso confirmados**, sin penalización en plataforma (BR-BOOKING-009, decisión PO 8.1 #5).
- Ver `Review` recibidas en su `VendorProfile` (sin respuesta — funcionalidad futura, BR-REVIEW-008).
- Recibir notificaciones in-app de cambios de estado relevantes, **incluyendo `Quote` rechazada o expirada** (BR-NOTIF-002, decisión PO 8.1 #13). Email simulado por log mientras no exista la funcionalidad real.
- Cambiar idioma preferido de su cuenta.
- Usar generación IA opcional para bio/descripción de paquetes (Could Have, BR-VENDOR-008).
- Ver su propio perfil y editar sus datos personales mínimos.

**El proveedor no puede:**

- Ver `QuoteRequest` dirigidas a otros proveedores (BR-QUOTE-006).
- Ver detalles privados del evento del organizador fuera del brief incluido en la `QuoteRequest` (BR-AUTH-007).
- Editar eventos del organizador (BR-EVENT-002).
- Aprobar su propio `VendorProfile` ni el de otros (BR-VENDOR-001, BR-ADMIN-001).
- **Responder, moderar, ocultar ni editar reseñas** (BR-REVIEW-005, BR-REVIEW-008, decisión PO 8.1 #14 — la respuesta del proveedor queda fuera del MVP).
- **Editar/cambiar categorías más allá del límite de 5 ediciones acumuladas** (BR-VENDOR-004).
- **Cargar más de 10 imágenes por trabajo/evento mostrado en el portafolio** (BR-VENDOR-005).
- Crear, editar ni eliminar `ServiceCategory` (BR-SERVICE-003).
- Editar `Quote` después de pasarlas a estado `sent` (BR-QUOTE-017).
- Procesar pagos, comisiones, contratos legales ni facturación (BR-OOS-001, BR-OOS-002, BR-OOS-003, BR-OOS-010).
- Acceder al panel admin ni a sus rutas (BR-AUTH-010).
- Disparar notificaciones por WhatsApp (BR-OOS-004).

### 5.3 Administrador

**Descripción:** Responsable interno de gobernanza, curaduría de catálogo, aprobación de proveedores, moderación manual y operación de la demo. En el escenario académico es el Product Owner; en futuro es el equipo interno.

**Estado MVP:** Incluido (Must Have).

**Responsabilidad principal:** Mantener la calidad del catálogo y la confianza de la plataforma mediante aprobación de proveedores, gestión de categorías y moderación manual de reseñas, con trazabilidad total en `AdminAction`.

**El administrador puede:**

- Iniciar sesión con cuenta admin (creada por seed/configuración, BR-AUTH-002).
- Acceder al panel administrativo y sus rutas.
- Ver el listado de `User` relevantes para operaciones admin/demo.
- Aprobar, rechazar y ocultar `VendorProfile`.
- Validar/revisar cambios de categoría de proveedor que afecten visibilidad pública (BR-VENDOR-004).
- Gestionar `ServiceCategory` (crear, ver, editar, soft delete) **con jerarquía simple de máximo 2 niveles** (BR-SERVICE-005, decisión PO 8.1 #18).
- **Gestionar `EventType` de forma controlada**: activar/desactivar, editar nombre visible, editar descripción y orden de visualización. **No puede eliminar físicamente un `EventType` con eventos asociados** (BR-EVENTTYPE-007, decisión PO 8.1 #17).
- Ver `VendorProfile` en cualquier estado (`pending`, `approved`, `rejected`).
- **Moderar `Review` mediante soft delete / hidden status** con auditoría obligatoria en `AdminAction` (BR-REVIEW-005, BR-ADMIN-011, decisión PO 8.1 #11).
- **Listar y consultar eventos** para fines de demo, soporte y gobernanza, en modo **solo lectura** (BR-EVENT-014, decisión PO 8.1 #16). El acceso al detalle queda registrado en `AdminAction`.
- Ver el dashboard de admin con **métricas operativas, de gobernanza, uso de IA, cotizaciones y demo readiness** (BR-ADMIN-005, decisión PO 8.1 #10). No se muestran métricas comerciales reales (ingresos, comisiones, CAC/LTV/ROI).
- Moderar attachments mediante soft delete (BR-PRIVACY-011, BR-ADMIN-011).
- Gestionar usuarios seed (creación/edición) — BR-ADMIN-009.
- Gestionar datos seed/demo (cargas y reinicios, vía scripts).
- Ver `QuoteRequest` / `Quote` de forma agregada para soporte o auditoría (Recomendado, no operativa).
- Consultar el log de `AIRecommendation` para auditoría IA — BR-ADMIN-008.
- Ver y consultar el log de `AdminAction` (su propio log).
- Toda acción admin queda automáticamente registrada en `AdminAction` (BR-ADMIN-004, BR-ADMIN-011).

**El administrador no puede:**

- Actuar como organizador en flujos comerciales (no es `owner` de eventos comerciales) — BR-ADMIN-006.
- Actuar como proveedor en flujos comerciales (no responde `Quote` propias) — BR-ADMIN-006.
- **Editar eventos propiedad de organizadores** (BR-EVENT-014, decisión PO 8.1 #16). Solo dispone de visibilidad de lectura.
- Editar reseñas (solo ocultarlas/eliminarlas mediante soft delete) — BR-REVIEW-005.
- **Eliminar físicamente (hard delete) `EventType`, `ServiceCategory`, `Review` o `Attachment` con dependencias activas o que rompan trazabilidad** (BR-EVENTTYPE-007, BR-SERVICE-007, BR-REVIEW-005, BR-PRIVACY-011).
- **Crear jerarquías de categorías de más de 2 niveles** (BR-SERVICE-005, decisión PO 8.1 #18).
- Procesar pagos reales, comisiones, contratos legales ni facturación (BR-OOS-001, BR-OOS-002, BR-OOS-003, BR-OOS-010).
- Disparar moderación automática IA, análisis de sentimiento ni aprobación autónoma de proveedores (BR-REVIEW-006, BR-OOS-007, BR-OOS-008).
- Modificar contraseñas de usuarios sin un flujo controlado (Recomendado).
- Acceder a datos personales sensibles fuera de lo estrictamente necesario (BR-PRIVACY-002).

---

## 6. Roles futuros o fuera de alcance

Los siguientes roles **no se incluyen en el MVP**. Se documentan aquí para preservar coherencia conceptual, evitar decisiones contradictorias durante el desarrollo y orientar futuras evoluciones.

### 6.1 Colaborador de evento (event collaborator)

| Aspecto | Detalle |
|---|---|
| Descripción | Persona invitada por el `owner` del evento para colaborar (pareja, mamá, suegra, padrino, planner contratado). |
| Por qué es útil | Los eventos sociales LATAM se organizan en equipo; permitiría compartir checklist, presupuesto y cotizaciones. |
| Por qué no está en MVP | BR-USER-004, BR-OOS-013: multi-colaboradores está fuera de alcance MVP. Modelo freemium futuro (BR-FUTURE-002, BR-FUTURE-017). |
| Permisos potenciales en futuro | Ver evento asignado; editar tareas y presupuesto con permisos delegados; ver cotizaciones; comentar; sin permisos de eliminación ni de cambio de owner. |

### 6.2 Super Admin

| Aspecto | Detalle |
|---|---|
| Descripción | Rol técnico de alto nivel con capacidad para gestionar otros admins, configuración de plataforma y datos críticos. |
| Por qué es útil | A escala futura, se requiere separar el admin operativo del admin con privilegios elevados (configuración, secrets, billing). |
| Por qué no está en MVP | En MVP solo existe un admin (Product Owner). No hay necesidad operativa de separar niveles. |
| Permisos potenciales en futuro | Gestionar cuentas admin; configurar feature flags; ver logs sensibles; gestionar facturación e integraciones. |

### 6.3 Moderador especializado

| Aspecto | Detalle |
|---|---|
| Descripción | Usuario con permisos específicos de moderación de contenido (reseñas, reportes, comentarios) sin acceso completo al panel admin. |
| Por qué es útil | A escala futura, separar moderación de gobernanza reduce riesgo y permite escalar la operación. |
| Por qué no está en MVP | El admin único cubre la moderación manual en MVP (BR-REVIEW-005). |
| Permisos potenciales en futuro | Moderar reseñas y comentarios; gestionar reportes de abuso; sin permisos sobre proveedores ni categorías. |

### 6.4 Proveedor multiusuario / equipo de proveedor

| Aspecto | Detalle |
|---|---|
| Descripción | Equipo de personas operando bajo un mismo `VendorProfile` (ej. una empresa de catering con varios coordinadores). |
| Por qué es útil | Permite distribuir la operación entre miembros del equipo y mantener trazabilidad por persona. |
| Por qué no está en MVP | El MVP asume mono-rol mono-usuario por proveedor (BR-AUTH-005). |
| Permisos potenciales en futuro | Owner del `VendorProfile`; miembros con permisos delegados (responder `Quote`, ver bandeja). Roles internos por proveedor. |

### 6.5 Invitado del evento (guest/invitee)

| Aspecto | Detalle |
|---|---|
| Descripción | Persona invitada al evento (no organizadora) que confirma asistencia, ve detalles públicos del evento o RSVPea. |
| Por qué es útil | Cierra el ciclo del evento desde el lado de los asistentes. |
| Por qué no está en MVP | BR-OOS-014: lista de invitados, RSVP y asignación de mesas están fuera del MVP. |
| Permisos potenciales en futuro | Ver datos públicos del evento; confirmar asistencia; ver detalle de mesa asignada; sin acceso a cotizaciones ni presupuesto. |

### Otros roles futuros o fuera de alcance

| Rol | Estado | Razón |
|---|---|---|
| Co-organizador | Future | Variante de colaborador de evento con permisos elevados; depende de BR-FUTURE-002. |
| Familiar colaborador | Future | Caso particular del colaborador de evento. |
| Payment manager | Out of Scope | Requiere pagos reales (BR-OOS-001). |
| Finance/accounting user | Out of Scope | Requiere manejo fiscal complejo (BR-OOS-010). |
| External auditor | Out of Scope | No hay necesidad de auditoría externa formal en MVP. |
| Planner profesional (B2B) | Future | Posible roadmap (white-label para planners), no en MVP. |

---

## 7. Resumen de responsabilidades por rol

| Rol | Descripción | MVP/Future | Responsabilidad principal | Scope de acceso |
|---|---|---|---|---|
| Organizador | Persona que organiza un evento social o corporativo. | MVP | Convertir una idea en plan accionable y completar el ciclo del evento (plan, presupuesto, cotización, booking, reseña). | **Own** (sus eventos, su perfil, sus notificaciones) + **Public** (directorio de proveedores aprobados). |
| Proveedor | Pyme o freelancer que ofrece servicios para eventos. | MVP | Mantener perfil aprobado y responder cotizaciones de forma estructurada. | **Own** (su perfil, sus servicios, sus reseñas) + **Assigned** (`QuoteRequest` dirigidas a él) + **Public** (categorías). |
| Administrador | Responsable de gobernanza, curaduría y moderación manual. | MVP | Aprobar proveedores, gestionar catálogo y moderar reseñas con trazabilidad. | **All** (sobre catálogo y moderación) + **Seed/Demo** (sobre datos seed). |
| Colaborador de evento | Persona invitada por el owner a colaborar. | Future | Colaborar en la gestión del evento. | Future. |
| Super Admin | Rol técnico de alto nivel. | Future | Gestionar configuración crítica y otros admins. | Future. |
| Moderador especializado | Foco en moderación de contenido. | Future | Moderar reseñas y comentarios. | Future. |
| Proveedor multiusuario | Equipo operando bajo un perfil. | Future | Distribuir la operación entre miembros del equipo. | Future. |
| Invitado del evento | Asistente del evento. | Future | Confirmar asistencia y ver detalles públicos del evento. | Future. |

---

## 8. Matriz general de permisos por módulo

> Notación: **C** Create · **R** Read/View · **U** Update/Edit · **D** Delete · **A** Approve · **X** Reject · **M** Moderate · **S** Send/Submit · **RESP** Respond · **COMP** Compare · **SIM** Simulated · **N/A** No permitido.
> Scope: **Own** propios · **Assigned** asignados · **Public** públicos · **All** todos · **Seed/Demo** seed/demo · **Future** futuro.

| Módulo | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Autenticación y cuenta | C, R, U (Own) | C, R, U (Own) | R, U (Own); usuarios seed: R, U | El registro público crea solo `organizer` o `vendor` (BR-AUTH-002). |
| Eventos | C, R, U, D (Own) | N/A | R agregado (Recommended) | Solo owner gestiona el evento (BR-EVENT-002). |
| Plan IA | C, R, U (Own) | N/A | R (auditoría) | Sugerencia siempre validable (BR-AI-001). |
| Checklist y tareas | C, R, U, D (Own) | N/A | R agregado (Recommended) | Tareas IA inician `pending` (BR-TASK-003). |
| Presupuesto | C, R, U, D (Own) | N/A | R agregado (Recommended) | Warning sin bloqueo si committed > total (BR-BUDGET-004). |
| Directorio de proveedores | R (Public approved) | R (Public approved) | R (All) | Solo `approved` visible (BR-VENDOR-001). |
| Perfil de proveedor | R (Public approved) | C, R, U (Own) | R, A, X, M (All) | Aprobación admin (BR-VENDOR-006). |
| Servicios y paquetes | R (Public) | C, R, U, D (Own) | R (All) | Asociar `ServiceCategory` (BR-SERVICE-001). |
| Categorías de servicio | R (Public) | R (Public) | C, R, U, D (All) | CRUD solo admin (BR-SERVICE-003). |
| Tipos de evento | R (Public) | N/A | R, U (Recomendado) | Catálogo cerrado (BR-EVENTTYPE-001). |
| Cotizaciones — Solicitudes | C, R, U, D/Cancel (Own) | R, RESP (Assigned) | R agregado (Recommended) | Solo organizador crea (BR-QUOTE-001). |
| Cotizaciones — Respuestas | R, COMP (Own event) | C, R, U (Own draft), S | R agregado (Recommended) | Una vigente por solicitud (BR-QUOTE-013). |
| Comparador de cotizaciones | R, COMP (Own event) | N/A | N/A | Resumen IA opcional (BR-QUOTE-023). |
| Booking intent | C (SIM), R, U/Cancel (Own) | A/Confirm (Assigned), Cancel (Own) | R agregado (Recommended) | Sin pago real (BR-BOOKING-004). |
| Reseñas | C, R (Own + Public) | R (Own + Public) | R, M, D (All) | Solo con booking confirmado (BR-REVIEW-001). |
| Notificaciones | R, U(read) (Own) | R, U(read) (Own) | R agregado (Recommended) | In-app + email simulado (BR-NOTIF-001). |
| AI Recommendations | C, R, U(accept) (Own) | C, R (Own opt-in) | R (All para auditoría) | Trazabilidad obligatoria (BR-AI-007). |
| Idioma y moneda | R, U (Own user + Own event) | R, U (Own user) | R (All) | Sin conversión automática (BR-BUDGET-007). |
| Panel admin | N/A | N/A | R, C, U, D, A, X, M (All) | Acceso restringido (BR-AUTH-010). |
| Datos seed / demo | N/A | N/A | C, R, U, D (Seed/Demo) | Marca `seed: true` (BR-SEED-005). |
| Logs de auditoría (`AdminAction`) | N/A | N/A | R (All); auto-C en acciones | Toda acción admin registrada (BR-ADMIN-004). |
| Pagos reales | Out of Scope | Out of Scope | Out of Scope | BR-OOS-001. |
| Chat real-time | Out of Scope | Out of Scope | Out of Scope | BR-OOS-006. |
| WhatsApp | Out of Scope | Out of Scope | Out of Scope | BR-OOS-004. |

---

## 9. Matriz de permisos por entidad

> Cada celda indica permisos CRUD + scope. **N/A** = no permitido. Acciones especiales (Approve, Moderate, Confirm, Respond) se anotan explícitamente.

### 9.1 User

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear (registro público) | C (Own) | C (Own) | N/A (admin se crea por seed) | BR-AUTH-002 |
| Ver perfil propio | R (Own) | R (Own) | R (Own) | BR-USER-001 |
| Editar perfil propio | U (Own) | U (Own) | U (Own) | BR-USER-001 |
| Eliminar cuenta | U/D (Own, soft) Recomendado | U/D (Own, soft) Recomendado | U/D (sobre usuarios seed) | Recomendado |
| Ver usuarios (listado) | N/A | N/A | R (All relevante a admin) | BR-ADMIN-009 |
| Cambiar contraseña | U (Own) | U (Own) | U (Own) | BR-PRIVACY-008 |
| Cambiar idioma preferido | U (Own) | U (Own) | U (Own) | BR-I18N-003 |

### 9.2 Role

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Asignación de rol | Auto (registro) | Auto (registro) | Seed/Configuración | BR-AUTH-002 |
| Cambiar rol propio | N/A | N/A | N/A | Multi-rol futuro (BR-FUTURE-001) |
| Listar roles | N/A | N/A | R (catálogo) | Derived |

### 9.3 Event

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear evento | C (Own) | N/A | N/A | BR-EVENT-001 |
| Ver evento | R (Own) | R parcial (Brief solo en QuoteRequest) | **R (All, solo lectura)** | BR-EVENT-002, BR-EVENT-014, BR-AUTH-007 |
| Listar eventos para soporte/demo | N/A | N/A | **R (All, solo lectura; acceso registrado en `AdminAction`)** | BR-EVENT-014 (decisión PO 8.1 #16) |
| Editar evento | U (Own) | N/A | **N/A (admin no edita eventos de organizadores)** | BR-EVENT-002, BR-EVENT-014 |
| Eliminar / cancelar | D (Own draft); cancel (Own active) | N/A | N/A | BR-EVENT-010 |
| Cambiar estado | U (Own, transiciones permitidas) | N/A | N/A | BR-EVENT-005 |
| Cierre automático a `completed` | Auto sistema (T+2 días) | N/A | N/A | BR-EVENT-013 (decisión PO 8.1 #6) |
| Ver dashboard del evento | R (Own) | N/A | N/A | BR-EVENT-009 |

### 9.4 EventType

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Listar tipos | R (Public, activos) | N/A | R (All, incluye inactivos) | BR-EVENTTYPE-001 |
| Crear tipo | N/A | N/A | **C (All, curaduría controlada)** | BR-EVENTTYPE-007 (decisión PO 8.1 #17) |
| Editar tipo (nombre visible, descripción, orden) | N/A | N/A | **U (All)** | BR-EVENTTYPE-007 |
| Activar / desactivar tipo (soft delete) | N/A | N/A | **U (All, soft)** | BR-EVENTTYPE-007 |
| Eliminar físicamente tipo | N/A | N/A | **N/A si hay eventos asociados (bloqueado)** | BR-EVENTTYPE-007 |
| Asociar a evento | R/Select (Own event) | N/A | N/A | BR-EVENT-004 |

### 9.5 EventTask

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear tarea | C (Own event) | N/A | N/A | BR-TASK-002 |
| Ver tarea | R (Own event) | N/A | R agregado (Recommended) | BR-TASK-001 |
| Editar tarea | U (Own event) | N/A | N/A | BR-TASK-005 |
| Eliminar tarea | D (Own event) | N/A | N/A | BR-TASK-005 |
| Cambiar estado | U (Own event, transiciones) | N/A | N/A | BR-TASK-004 |
| Confirmar tarea IA | U (Own event, individual o bloque) | N/A | N/A | BR-TASK-003 |

### 9.6 Budget

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear presupuesto | C (Own event) | N/A | N/A | BR-BUDGET-001 |
| Ver presupuesto | R (Own event) | N/A | R agregado (Recommended) | BR-BUDGET-001 |
| Editar presupuesto | U (Own event) | N/A | N/A | BR-BUDGET-009 |
| Eliminar presupuesto | D (Own event con cascade) | N/A | N/A | Derived |
| Ver warnings | R (Own event) | N/A | N/A | BR-BUDGET-004 |

### 9.7 BudgetItem

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear item | C (Own budget) | N/A | N/A | BR-BUDGET-002 |
| Ver item | R (Own budget) | N/A | N/A | BR-BUDGET-002 |
| Editar item | U (Own budget) | N/A | N/A | BR-BUDGET-009 |
| Eliminar item | D (Own budget) | N/A | N/A | BR-BUDGET-009 |
| Aceptar sugerencia IA | U (Own budget) | N/A | N/A | BR-BUDGET-008 |
| Actualizar `committed` | Auto al confirmar BookingIntent | N/A | N/A | BR-BUDGET-005 |

### 9.8 VendorProfile

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear perfil | N/A | C (Own) | N/A | BR-VENDOR-002 |
| Ver perfil (público) | R (Public approved) | R (Public approved) | R (All estados) | BR-VENDOR-001 |
| Ver perfil propio | N/A | R (Own) | N/A | BR-AUTH-007 |
| Editar perfil | N/A | U (Own) | N/A | BR-VENDOR-004 |
| Cambiar categorías del perfil (límite acumulado: 5) | N/A | **U (Own, máx 5 cambios; puede disparar revisión admin)** | Validar revisión cuando aplique | BR-VENDOR-004 (decisión PO 8.1 #3) |
| Eliminar perfil | N/A | D (Own, soft Recomendado) | D (All, soft Recomendado) | Derived |
| Someter para aprobación | N/A | S (Own → `pending`) | N/A | BR-VENDOR-003 |
| Aprobar | N/A | N/A | A (All) | BR-VENDOR-001, BR-ADMIN-001 |
| Rechazar | N/A | N/A | X (All) | BR-VENDOR-003 |
| Ocultar | N/A | N/A | M (All) | Derived |

### 9.9 VendorService

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear servicio | N/A | C (Own profile) | N/A | BR-SERVICE-001 |
| Ver servicio | R (Public en perfiles approved) | R (Own + Public) | R (All) | BR-SERVICE-001 |
| Editar servicio | N/A | U (Own) | N/A | BR-SERVICE-002 |
| Eliminar servicio | N/A | D (Own) | N/A | Derived |
| Asociar a categoría | N/A | U (Own; selecciona del catálogo) | N/A | BR-SERVICE-001 |

### 9.10 ServiceCategory

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Listar categorías | R (Public) | R (Public) | R (All) | BR-SERVICE-003 |
| Crear categoría (raíz o subcategoría hasta nivel 2) | N/A | N/A | **C (All; profundidad máx = 2)** | BR-ADMIN-002, BR-SERVICE-005 (decisión PO 8.1 #18) |
| Editar categoría / mover en jerarquía | N/A | N/A | **U (All; profundidad máx = 2)** | BR-ADMIN-002, BR-ADMIN-012 |
| Eliminar categoría | N/A | N/A | D (All, **soft delete obligatorio** si hay servicios asociados) | BR-SERVICE-007 |

### 9.11 QuoteRequest

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear solicitud | C (Own event active) | N/A | N/A | BR-QUOTE-001, BR-EVENT-006 |
| Verificar límite "máx 5 activas por categoría por evento" | Auto sistema | N/A | N/A | BR-QUOTE-009 (decisión PO 8.1 #12) |
| Ver solicitud | R (Own event) | R (Assigned a su perfil) | R agregado (Recommended) | BR-QUOTE-006 |
| Editar brief | U (Own event, antes de enviar) | N/A | N/A | BR-QUOTE-003 |
| Enviar | S (Own → `sent`) | N/A | N/A | BR-QUOTE-005 |
| Marcar `viewed` | N/A | Auto al abrir (Assigned) | N/A | BR-QUOTE-005 |
| Cancelar | U (Own en `sent`/`viewed`) | N/A | N/A | BR-QUOTE-010 |
| Eliminar | D (Own draft, Recomendado) | N/A | N/A | Recomendado |

### 9.12 Quote

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear cotización | N/A | C (Assigned QuoteRequest, `draft`) | N/A | BR-QUOTE-011 |
| Aplicar default de vigencia (15 días calendario) | N/A | Auto sistema si `valid_until` no especificado | N/A | BR-QUOTE-015 (decisión PO 8.1 #4) |
| Ver cotización | R (Own event) | R (Own) | R agregado (Recommended) | BR-QUOTE-006 |
| Editar cotización | N/A | U (Own en `draft`) | N/A | BR-QUOTE-017 |
| Enviar cotización | N/A | S (Own → `sent`) | N/A | BR-QUOTE-014 |
| Aceptar | A (Own event) | N/A | N/A | BR-QUOTE-014 |
| Rechazar | X (Own event) | N/A | N/A | BR-QUOTE-014 |
| Notificar al proveedor por rechazo/expiración | Auto sistema (in-app) | Recibe (Own) | N/A | BR-NOTIF-002 (decisión PO 8.1 #13) |
| Marcar `preferred` | U (Own event) | N/A | N/A | BR-QUOTE-022 |
| Comparar | COMP (Own event) | N/A | N/A | BR-QUOTE-021 |
| Expirar | Auto (sistema) | Auto (sistema) | N/A | BR-QUOTE-016 |
| Solicitar resumen IA | C (Own event) | N/A | N/A | BR-QUOTE-023 |

### 9.13 BookingIntent

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear booking intent | C SIM (Own event sobre Quote vigente aceptada) | N/A | N/A | BR-BOOKING-001 |
| Ver booking intent | R (Own event) | R (Assigned) | R agregado (Recommended) | Derived |
| Confirmar | N/A | A/Confirm (Assigned, `pending` → `confirmed_intent`) | N/A | BR-BOOKING-002 |
| Cancelar (incluye `confirmed_intent`, sin penalización en plataforma) | U/Cancel (Own) | U/Cancel (Own assigned) | N/A | BR-BOOKING-009 (decisión PO 8.1 #5) |
| Procesar pago real | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-OOS-001, BR-BOOKING-004 |
| Generar contrato | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-OOS-003, BR-BOOKING-005 |

### 9.14 Review

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear reseña (escala 1–5) | C (Own event con BookingIntent.confirmed_intent) | N/A | C SIM (sobre seed) | BR-REVIEW-001, BR-REVIEW-003 (decisión PO 8.1 #1) |
| Ver reseña (pública) | R (Public, status `published`) | R (Public + Own) | R (All, incluye `hidden`/`removed`) | BR-REVIEW-004 |
| Editar reseña | N/A (Out of Scope MVP) | N/A | N/A | BR-REVIEW-007 |
| Eliminar (soft delete) reseña | N/A (Out of Scope MVP) | N/A | **M/D soft (All, moderación con auditoría)** | BR-REVIEW-005 (decisión PO 8.1 #11) |
| Ocultar reseña (`status='hidden'`) | N/A | N/A | M (All) | BR-REVIEW-005 |
| Auditar moderación en `AdminAction` | Auto sistema | N/A | Auto al ejecutar acción | BR-ADMIN-004, BR-ADMIN-011 |
| Responder reseña | N/A | **Future (fuera de MVP)** | N/A | BR-REVIEW-008 (decisión PO 8.1 #14) |
| Moderación automática IA | N/A | N/A | **Future** | BR-REVIEW-006 |

### 9.15 Notification

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Recibir notificación | Auto (Own) | Auto (Own) | Auto (Own) | BR-NOTIF-005 |
| Ver notificaciones | R (Own) | R (Own) | R (Own + agregado Recomendado) | BR-NOTIF-005 |
| Marcar como leída | U (Own, `read_at`) | U (Own) | U (Own) | BR-NOTIF-004 |
| Disparar in-app | Auto sistema | Auto sistema | Auto sistema | BR-NOTIF-002 |
| Disparar email simulado | Auto sistema (log) | Auto sistema (log) | Auto sistema (log) | BR-NOTIF-003 |
| Disparar WhatsApp | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-OOS-004, BR-NOTIF-006 |
| Disparar push/SMS | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-OOS-017 |

### 9.16 AIRecommendation

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Generar (plan) | C (Own event) | N/A | N/A | BR-AI-001 |
| Generar (checklist) | C (Own event) | N/A | N/A | BR-AI-001 |
| Generar (presupuesto) | C (Own event) | N/A | N/A | BR-AI-001 |
| Generar (brief) | C (Own event) | N/A | N/A | BR-AI-001 |
| Generar (resumen comparador) | C (Own event) | N/A | N/A | BR-QUOTE-023 |
| Generar (bio/paquete) | N/A | C (Own profile, opcional) | N/A | BR-VENDOR-008 |
| Ver recomendación | R (Own) | R (Own) | R (All, auditoría) | BR-ADMIN-008 |
| Aceptar (`accepted=true`) | U (Own) | U (Own) | N/A | BR-AI-001 |
| Editar contenido sugerido | U (Own) | U (Own) | N/A | BR-AI-002 |
| Rechazar / Regenerar | U/D (Own) | U/D (Own) | N/A | BR-AI-002 |
| Usar MockAIProvider | SIM (Demo/Test) | SIM (Demo/Test) | SIM (Demo/Test) | BR-AI-006 |
| Chat libre conversacional | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-AI-014, BR-OOS-018 |
| Generar imágenes IA | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-AI-015, BR-OOS-016 |

### 9.17 Location

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Listar ubicaciones | R (Public) | R (Public) | R (All) | Derived |
| Crear ubicación | N/A | N/A | C (Recomendado, curaduría) | Recomendado |
| Editar ubicación | N/A | N/A | U (Recomendado) | Recomendado |
| Asociar a evento/perfil | U (Own event) | U (Own profile) | N/A | BR-EVENT-003 |

### 9.18 Attachment

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Adjuntar (brief) | C (Own QuoteRequest) | N/A | N/A | Derived |
| Adjuntar (portafolio, **hasta 10 imágenes por trabajo/evento mostrado**) | N/A | C (Own profile, máx 10 por trabajo) | N/A | BR-VENDOR-005 (decisión PO 8.1 #2) |
| Ver | R (según owner del recurso padre) | R (según owner) | R (All) | Derived |
| Eliminar (**soft delete obligatorio sobre metadata**) | D soft (Own) | D soft (Own) | D soft (All, moderación) | BR-PRIVACY-011 (decisión PO 8.1 #19) |
| Eliminación física del archivo en storage | N/A | N/A | Proceso técnico de mantenimiento | BR-PRIVACY-011 |

### 9.19 AdminAction

| Acción | Organizador | Proveedor | Administrador | Notas |
|---|---|---|---|---|
| Crear log | N/A | N/A | Auto (sistema, en cada acción admin) | BR-ADMIN-004 |
| Ver log | N/A | N/A | R (All) | BR-ADMIN-004 |
| Editar log | N/A | N/A | N/A (inmutable) | Recomendado |
| Eliminar log | N/A | N/A | N/A (inmutable) | Recomendado |

---

## 10. Reglas de propiedad y acceso

| # | Regla | Aplica a | Fuente |
|---:|---|---|---|
| 1 | Todo `Event` pertenece a un único `User` con rol `organizer` (campo `owner_id`). | Eventos | BR-EVENT-001 |
| 2 | Solo el `owner` de un evento puede editarlo, eliminarlo o iniciar una `QuoteRequest` desde él. | Eventos | BR-EVENT-002 |
| 3 | `EventTask`, `Budget`, `BudgetItem` y `AIRecommendation` heredan la propiedad del evento padre. | Tareas, presupuesto, IA | Derived |
| 4 | Todo `VendorProfile` pertenece a un único `User` con rol `vendor`. | Proveedores | BR-AUTH-007 |
| 5 | `VendorService` y `Attachment` del portafolio heredan la propiedad del `VendorProfile`. | Servicios | BR-SERVICE-001 |
| 6 | `QuoteRequest` pertenece al evento (organizador owner) y se asigna a un único `VendorProfile`. | Cotizaciones | BR-QUOTE-001 |
| 7 | `Quote` pertenece al proveedor y se vincula a una `QuoteRequest`. | Cotizaciones | BR-QUOTE-011 |
| 8 | `BookingIntent` pertenece al evento (owner organizador) y referencia una `Quote`. | Booking | BR-BOOKING-001 |
| 9 | `Review` pertenece al organizador autor y referencia al proveedor y al evento. | Reseñas | BR-REVIEW-001 |
| 10 | `Notification` pertenece exclusivamente al usuario destinatario. | Notificaciones | BR-NOTIF-005 |
| 11 | `ServiceCategory` y `EventType` son recursos del catálogo y pertenecen al sistema (gestionados por admin). | Catálogo | BR-SERVICE-003 |
| 12 | `AdminAction` se crea de forma automática y pertenece al sistema; el admin solo puede consultarlo. | Auditoría | BR-ADMIN-004 |
| 13 | Un organizador nunca puede ver eventos, tareas, presupuestos o cotizaciones de otro organizador. | Aislamiento | BR-AUTH-009 |
| 14 | Un proveedor nunca puede ver `QuoteRequest` dirigidas a otros proveedores. | Aislamiento | BR-QUOTE-006 |
| 15 | Un proveedor solo accede a la información del evento incluida en el `brief` de la `QuoteRequest`. | Aislamiento | BR-AUTH-007 |
| 16 | Las acciones admin no pueden falsificar autoría: el `admin_id` se asigna desde la sesión autenticada. | Auditoría | BR-ADMIN-004 |
| 17 | Las entidades creadas por seed se marcan con flag `seed: true` y se aíslan de la operación normal. | Seed/Demo | BR-SEED-005 |

---

## 11. Reglas de permisos para el organizador

| # | Regla | Estado |
|---:|---|---|
| 11.1 | El organizador solo puede gestionar eventos que él mismo creó (BR-EVENT-002). | MVP |
| 11.2 | El organizador puede tener múltiples eventos en cualquier combinación de estados (BR-EVENT-011). | MVP |
| 11.3 | El organizador solo puede enviar `QuoteRequest` desde eventos en estado `active` (BR-EVENT-006). | MVP |
| 11.4 | El organizador puede enviar `QuoteRequest` a múltiples proveedores en paralelo, incluso en la misma categoría, hasta un **máximo de 5 solicitudes activas por categoría de servicio por evento** (BR-QUOTE-009, decisión PO 8.1 #12). | MVP |
| 11.5 | El organizador no puede tener dos `QuoteRequest` activas simultáneamente al mismo proveedor para el mismo evento (BR-QUOTE-004). | MVP |
| 11.6 | El organizador puede aceptar o rechazar `Quote` recibidas para sus eventos (BR-QUOTE-014). | MVP |
| 11.7 | El organizador no puede crear `BookingIntent` sobre `Quote` expiradas (BR-BOOKING-001, BR-QUOTE-016). | MVP |
| 11.8 | El organizador puede dejar `Review` solo si existe `BookingIntent.confirmed_intent` con ese proveedor (BR-REVIEW-001). | MVP |
| 11.9 | El organizador no puede editar una `Review` ya publicada (BR-REVIEW-007). | MVP |
| 11.10 | Toda salida IA solicitada por el organizador requiere su confirmación explícita para volverse oficial (BR-AI-001, BR-AI-002). | MVP |
| 11.11 | El organizador configura idioma y moneda **únicamente durante la creación del evento**; la moneda elegida (local o USD) es **inmutable** después (BR-EVENT-007, BR-EVENT-008, decisión PO 8.1 #7). | MVP |
| 11.15 | El organizador puede cancelar un `BookingIntent` propio incluso en `confirmed_intent` sin penalización en plataforma (BR-BOOKING-009, decisión PO 8.1 #5). | MVP |
| 11.16 | Las reseñas creadas por el organizador usan **escala 1–5** (5 = mejor, 1 = peor) (BR-REVIEW-003, decisión PO 8.1 #1). | MVP |
| 11.17 | El organizador debe pasar verificación captcha/anti-bot al registrarse e iniciar sesión (BR-AUTH-011, decisión PO 8.1 #8). | MVP |
| 11.12 | El organizador no tiene acceso al panel admin ni puede aprobar proveedores, gestionar categorías o moderar reseñas (BR-AUTH-010). | MVP |
| 11.13 | El organizador no puede ver eventos, tareas, presupuestos, notificaciones ni AIRecommendations de otros organizadores (BR-AUTH-009). | MVP |
| 11.14 | El organizador no puede invitar colaboradores a su evento en el MVP (BR-OOS-013, BR-USER-004). | Out of Scope |

---

## 12. Reglas de permisos para el proveedor

| # | Regla | Estado |
|---:|---|---|
| 12.1 | El proveedor solo puede crear y mantener un `VendorProfile` propio (BR-AUTH-007). | MVP |
| 12.2 | El `VendorProfile` requiere aprobación del admin para aparecer en búsqueda pública (BR-VENDOR-001). | MVP |
| 12.3 | El proveedor puede editar su perfil tras aprobación. Las **ediciones de categoría están limitadas a 5 cambios acumulados**; los cambios que afecten visibilidad pública pueden requerir revisión admin (BR-VENDOR-004, decisión PO 8.1 #3). | MVP |
| 12.4 | El proveedor solo puede ver `QuoteRequest` dirigidas a su `VendorProfile` (BR-QUOTE-006). | MVP |
| 12.5 | El proveedor solo accede a los datos del evento incluidos en el brief de la `QuoteRequest`; no ve el evento completo (BR-AUTH-007). | MVP |
| 12.6 | El proveedor solo puede responder a `QuoteRequest` que le hayan sido asignadas (BR-QUOTE-011). | MVP |
| 12.7 | El proveedor puede mantener una sola `Quote` vigente por `QuoteRequest` (BR-QUOTE-013). | MVP |
| 12.8 | El proveedor puede editar su `Quote` solo mientras esté en estado `draft` (BR-QUOTE-017). | MVP |
| 12.9 | Toda `Quote` enviada debe contar con `valid_until`; si el proveedor no lo especifica, el sistema aplica el valor por defecto de **15 días calendario** desde la creación (BR-QUOTE-015, decisión PO 8.1 #4). | MVP |
| 12.10 | El proveedor confirma o rechaza el `BookingIntent` para que pase a `confirmed_intent` (BR-BOOKING-002). | MVP |
| 12.11 | El proveedor puede cancelar un `BookingIntent` propio dejando trazabilidad (BR-BOOKING-009). | MVP (Should Have) |
| 12.12 | El proveedor no puede aprobar su propio perfil ni el de otros (BR-VENDOR-001, BR-ADMIN-001). | MVP |
| 12.13 | El proveedor no puede crear, editar ni eliminar `ServiceCategory` (BR-SERVICE-003). | MVP |
| 12.14 | El proveedor no puede moderar, editar, eliminar **ni responder** reseñas; solo puede leerlas. La respuesta a reseñas queda **fuera del MVP** (BR-REVIEW-005, BR-REVIEW-008, decisión PO 8.1 #14). | MVP |
| 12.18 | El proveedor cargará hasta **10 imágenes por trabajo/evento mostrado** en su portafolio; eliminación mediante soft delete (BR-VENDOR-005, BR-PRIVACY-011, decisiones PO 8.1 #2 y #19). | MVP |
| 12.19 | El proveedor recibe notificación in-app cuando su `Quote` es rechazada o expira (BR-NOTIF-002, decisión PO 8.1 #13). | MVP |
| 12.20 | El proveedor puede cancelar un `BookingIntent` propio incluso en `confirmed_intent`, sin penalización en plataforma (BR-BOOKING-009, decisión PO 8.1 #5). | MVP |
| 12.21 | El proveedor debe pasar verificación captcha/anti-bot al registrarse e iniciar sesión (BR-AUTH-011, decisión PO 8.1 #8). | MVP |
| 12.15 | El proveedor puede usar IA opcional para generar bio/descripción de paquetes, sujeta a validación humana (BR-VENDOR-008). | MVP (Could Have) |
| 12.16 | El proveedor no tiene acceso al panel admin (BR-AUTH-010). | MVP |
| 12.17 | El proveedor no puede procesar pagos reales (BR-OOS-001). | Out of Scope |

---

## 13. Reglas de permisos para el administrador

| # | Regla | Estado |
|---:|---|---|
| 13.1 | El admin se crea exclusivamente por seed o configuración interna; no puede crearse por registro público (BR-AUTH-002). | MVP |
| 13.2 | Solo el admin accede a rutas y operaciones del panel administrativo (BR-AUTH-010). | MVP |
| 13.3 | El admin puede aprobar, rechazar u ocultar `VendorProfile` (BR-ADMIN-001, BR-VENDOR-003). | MVP |
| 13.4 | El admin gestiona el catálogo `ServiceCategory` (CRUD) con **jerarquía simple de máximo 2 niveles** y eliminación lógica (soft delete) cuando hay servicios asociados — BR-ADMIN-002, BR-SERVICE-005, BR-ADMIN-012 (decisión PO 8.1 #18). | MVP |
| 13.5 | El admin puede moderar reseñas mediante **soft delete / hidden status** con auditoría obligatoria en `AdminAction`; no se permite hard delete que rompa trazabilidad — BR-ADMIN-003, BR-REVIEW-005, BR-ADMIN-011 (decisión PO 8.1 #11). | MVP |
| 13.6 | Toda acción admin queda registrada automáticamente en `AdminAction` con admin, target, acción y timestamp (BR-ADMIN-004). | MVP |
| 13.7 | El admin no actúa como organizador ni proveedor en flujos comerciales (BR-ADMIN-006). | MVP |
| 13.8 | El admin puede consultar `AIRecommendation` para auditoría (BR-ADMIN-008). | MVP (Should Have) |
| 13.9 | El admin puede ver el dashboard con **métricas operativas, de gobernanza, IA, cotizaciones y demo readiness** (Must Have: totales de usuarios/organizadores/proveedores, pendientes de aprobación, eventos por estado, `QuoteRequest` creadas, `Quote` respondidas; Should Have: reseñas publicadas/ocultas, `AIRecommendation` generadas, eventos completados, `BookingIntent` creados). **No se exponen métricas comerciales reales** (BR-ADMIN-005, decisión PO 8.1 #10). | MVP |
| 13.10 | El admin puede gestionar usuarios seed marcando `seed: true` (BR-ADMIN-009). | MVP (Should Have) |
| 13.11 | El admin no puede editar el contenido de las reseñas; solo ocultarlas o eliminarlas (BR-REVIEW-005). | MVP |
| 13.12 | El admin no puede modificar el contenido original de `Quote` ni `QuoteRequest` (Derived, integridad). | MVP |
| 13.13 | El admin no puede ejecutar moderación automática IA (BR-REVIEW-006, BR-OOS-008). | Out of Scope |
| 13.14 | El admin no puede acceder a categorías especiales de datos personales (BR-PRIVACY-007). | MVP |
| 13.15 | El admin puede **listar y consultar eventos en modo solo lectura** para demo/soporte/gobernanza; **no puede editar eventos propiedad de organizadores**. El acceso al detalle queda registrado en `AdminAction` (BR-EVENT-014, decisión PO 8.1 #16). | MVP |
| 13.16 | El admin puede gestionar `EventType` en forma controlada (activar/desactivar, editar nombre, descripción y orden). **No se permite hard delete si existen eventos asociados** (BR-EVENTTYPE-007, decisión PO 8.1 #17). | MVP |
| 13.17 | El admin puede gestionar la jerarquía simple de `ServiceCategory` con **profundidad máxima de 2 niveles** (BR-SERVICE-005, BR-ADMIN-012, decisión PO 8.1 #18). | MVP |
| 13.18 | El admin debe registrar en `AdminAction` toda acción sobre `Review`, `VendorProfile`, `EventType`, `ServiceCategory` y `Attachment` (BR-ADMIN-011). | MVP |
| 13.19 | El admin valida cambios de categoría de proveedor cuando afecten visibilidad pública (BR-VENDOR-004, decisión PO 8.1 #3). | MVP |

---

## 14. Permisos sobre funcionalidades de IA

Toda funcionalidad asistida por IA opera bajo la **regla transversal de human-in-the-loop** (BR-AI-001): el usuario debe confirmar explícitamente la salida antes de que se convierta en dato oficial.

| # | Feature IA | Organizador | Proveedor | Administrador | MVP/Future | Validación humana requerida |
|---:|---|---|---|---|---|---|
| 1 | Generación de plan de evento | C (Own event) | N/A | N/A | MVP | Sí — aceptar / editar / regenerar |
| 2 | Generación de checklist | C (Own event) | N/A | N/A | MVP | Sí — aceptar bloque / individual |
| 3 | Sugerencia de distribución de presupuesto | C (Own event) | N/A | N/A | MVP | Sí — editable antes de guardar |
| 4 | Recomendación de categorías de proveedor | C (Own event) | N/A | N/A | MVP | Sí — seleccionable |
| 5 | Generación de brief de cotización | C (Own event) | N/A | N/A | MVP | Sí — editable antes de enviar |
| 6 | Resumen comparativo de cotizaciones | C (Own event) | N/A | N/A | MVP (Should) | Sí — lectura asistida |
| 7 | Generación de bio/descripción de paquetes | N/A | C (Own profile) | N/A | MVP (Could) | Sí — editable antes de publicar |
| 8 | Priorización de tareas urgentes | C (Own event) | N/A | N/A | MVP | Sí — lectura asistida |
| 9 | Uso de `MockAIProvider` | SIM | SIM | SIM | MVP | N/A (modo demo/test) |
| 10 | Chat libre conversacional | N/A | N/A | N/A | **Out of Scope** | — BR-AI-014 |
| 11 | Generación de imágenes / decoración | N/A | N/A | N/A | **Out of Scope** | — BR-AI-015, BR-OOS-016 |
| 12 | Análisis de sentimiento de reseñas | N/A | N/A | N/A | **Future** | — BR-REVIEW-006, BR-FUTURE-008 |
| 13 | Moderación automática IA | N/A | N/A | N/A | **Future** | — BR-FUTURE-009, BR-OOS-008 |
| 14 | Detección de inconsistencias presupuesto vs cotizaciones | N/A | N/A | N/A | **Future** | — BR-FUTURE-015 |
| 15 | Recomendaciones específicas de proveedores | N/A | N/A | N/A | **Future** | — BR-FUTURE-012 |
| 16 | Resumen ejecutivo del evento | N/A | N/A | N/A | **Future** | — BR-FUTURE-013 |

**Reglas transversales IA aplicables a todos los roles:**

- Toda llamada a la capa `LLMProvider`/`AIProvider` registra una `AIRecommendation` con prompt versionado, payload y `accepted: false` por defecto (BR-AI-007, BR-AI-010).
- Las entidades creadas a partir de IA (`EventTask`, `BudgetItem`) llevan el flag `ai_generated: true` (BR-AI-008).
- El idioma del evento se pasa como parámetro al prompt (BR-AI-011).
- **El timeout máximo para llamadas IA es 1 minuto (60 000 ms)**. Tras el timeout, el sistema muestra error controlado y, en modo demo/testing, degrada a `MockAIProvider` (BR-AI-009, decisión PO 8.1 #9).
- **Estrategia de proveedor:** `OpenAIProvider` funcional como principal en MVP; `MockAIProvider` obligatorio para tests/demo/offline; `AnthropicProvider` queda como stub/futuro opcional, no funcional en MVP. No se requiere selector dinámico en UI ni failover automático a Anthropic (BR-AI-005, decisión PO 8.1 #15).
- Solo el admin puede consultar el log completo de `AIRecommendation` para auditoría (BR-ADMIN-008).

---

## 15. Permisos sobre cotizaciones y booking intent

### 15.1 Matriz de cotizaciones

| # | Acción | Organizador | Proveedor | Administrador | Regla |
|---:|---|---|---|---|---|
| 1 | Crear `QuoteRequest` | C (Own event active) | N/A | N/A | BR-QUOTE-001, BR-EVENT-006 |
| 2 | Editar brief antes de enviar | U (Own draft) | N/A | N/A | BR-QUOTE-003 |
| 3 | Enviar `QuoteRequest` | S (Own) | N/A | N/A | BR-QUOTE-005 |
| 4 | Ver `QuoteRequest` recibida | N/A | R (Assigned) | R agregado (Recommended) | BR-QUOTE-006 |
| 5 | Marcar `QuoteRequest` como `viewed` | N/A | Auto (Assigned) | N/A | BR-QUOTE-005 |
| 6 | Cancelar `QuoteRequest` | U (Own, en `sent`/`viewed`) | N/A | N/A | BR-QUOTE-010 |
| 7 | Crear `Quote` (draft) | N/A | C (Assigned) | N/A | BR-QUOTE-011 |
| 8 | Editar `Quote` | N/A | U (Own en `draft`) | N/A | BR-QUOTE-017 |
| 9 | Enviar `Quote` | N/A | S (Own → `sent`) | N/A | BR-QUOTE-014 |
| 10 | Aceptar `Quote` | A (Own event) | N/A | N/A | BR-QUOTE-014 |
| 11 | Rechazar `Quote` | X (Own event) | N/A | N/A | BR-QUOTE-014 |
| 12 | Marcar `Quote` como `preferred` | U (Own event) | N/A | N/A | BR-QUOTE-022 |
| 13 | Comparar `Quotes` | COMP (Own event) | N/A | N/A | BR-QUOTE-021 |
| 14 | Solicitar resumen IA del comparador | C (Own event) | N/A | N/A | BR-QUOTE-023 |
| 15 | Expirar `Quote` automáticamente | Auto sistema | Auto sistema | N/A | BR-QUOTE-016 |
| 16 | Ver historial de cotizaciones expiradas | R (Own event) | R (Own) | R agregado | BR-QUOTE-025 |

### 15.2 Matriz de booking intent

| # | Acción | Organizador | Proveedor | Administrador | Regla |
|---:|---|---|---|---|---|
| 1 | Crear `BookingIntent` (simulado) | C SIM (Own event sobre Quote vigente aceptada) | N/A | N/A | BR-BOOKING-001 |
| 2 | Confirmar `BookingIntent` → `confirmed_intent` | N/A | A/Confirm (Assigned) | N/A | BR-BOOKING-002 |
| 3 | Rechazar `BookingIntent` | N/A | X (Assigned) | N/A | Derived |
| 4 | Cancelar `BookingIntent` | U/Cancel (Own) | U/Cancel (Own assigned) | N/A | BR-BOOKING-009 |
| 5 | Visualizar disclaimer "acuerdo fuera de la plataforma" | R (Own) | R (Assigned) | N/A | BR-BOOKING-006 |
| 6 | Actualizar `committed` del `BudgetItem` | Auto sistema | N/A | N/A | BR-BOOKING-008 |
| 7 | Habilitar creación de `Review` post booking | R (Own) | N/A | N/A | BR-BOOKING-010 |
| 8 | Procesar pago real | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-BOOKING-004, BR-OOS-001 |
| 9 | Generar contrato firmado | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-BOOKING-005, BR-OOS-003 |
| 10 | Cobrar comisión por contrato | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-OOS-002 |

---

## 16. Permisos sobre reseñas y moderación

| # | Acción | Organizador | Proveedor | Administrador | Regla |
|---:|---|---|---|---|---|
| 1 | Crear `Review` | C (Own event + Booking confirmado) | N/A | C SIM (sobre datos seed) | BR-REVIEW-001, BR-SEED-007 |
| 2 | Verificar regla de elegibilidad de reseña | Auto sistema | N/A | N/A | BR-REVIEW-001 |
| 3 | Una reseña por par (evento, proveedor) | Auto sistema (validación) | N/A | N/A | BR-REVIEW-002 |
| 4 | Ver reseñas públicas | R (Public) | R (Own + Public) | R (All) | BR-REVIEW-004 |
| 5 | Ver promedio de calificación del proveedor | R (Public) | R (Own + Public) | R (All) | BR-REVIEW-009 |
| 6 | Editar reseña publicada | **N/A (Out of Scope MVP)** | N/A | N/A | BR-REVIEW-007 |
| 7 | Eliminar reseña propia | N/A | N/A | D vía admin (M) | BR-REVIEW-005 |
| 8 | Ocultar reseña ofensiva | N/A | N/A | M (All) | BR-REVIEW-005 |
| 9 | Eliminar reseña ofensiva | N/A | N/A | D (All) | BR-REVIEW-005 |
| 10 | Registro en `AdminAction` | Auto sistema | Auto sistema | Auto al ejecutar moderación | BR-ADMIN-004 |
| 11 | Responder a reseña como proveedor | **Future** | **Future** | N/A | BR-REVIEW-008 |
| 12 | Análisis de sentimiento sobre reseñas | **Future** | **Future** | **Future** | BR-REVIEW-006, BR-OOS-007 |
| 13 | Moderación automática IA | **Future** | **Future** | **Future** | BR-FUTURE-009, BR-OOS-008 |

---

## 17. Permisos sobre idioma, moneda y configuración

| # | Acción | Organizador | Proveedor | Administrador | Regla |
|---:|---|---|---|---|---|
| 1 | Cambiar idioma preferido de usuario | U (Own) | U (Own) | U (Own) | BR-I18N-003, BR-USER-006 |
| 2 | Cambiar idioma por evento | U (Own event) | N/A | N/A | BR-I18N-004 |
| 3 | Configurar moneda del evento (**solo durante creación**, después **inmutable**; opciones: moneda local o USD) | C (Own event, al crear) | N/A | N/A | BR-EVENT-007 (decisión PO 8.1 #7) |
| 4 | Selección de moneda soportada (GTQ/EUR/MXN/COP/USD min) | R/Select (Own event) | N/A | R (catálogo) | BR-BUDGET-006 |
| 4b | Cambiar moneda del evento después de creado | **N/A (bloqueado)** | N/A | N/A | BR-EVENT-007 |
| 5 | Conversión automática entre monedas | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-BUDGET-007, BR-OOS-015 |
| 6 | Idioma de prompt IA | Auto desde evento | Auto desde perfil | N/A | BR-AI-011, BR-I18N-007 |
| 7 | Independencia idioma/moneda | Sistema | Sistema | Sistema | BR-I18N-008 |
| 8 | Configuración avanzada por país (modismos, normativas) | **Future** | **Future** | **Future** | BR-I18N-006 |

---

## 17.bis Comportamiento del sistema (System) y enforcement automático

Aunque el sistema no es un "rol" en el sentido humano, varias capacidades del MVP son ejecutadas o aplicadas automáticamente por el backend/jobs. Esta sección consolida esos comportamientos para evitar dejarlos sin asignación de responsabilidad.

| # | Capacidad | Disparador | Permiso | Regla |
|---:|---|---|---|---|
| S.1 | Auto-completar evento **2 días calendario después** de la fecha del evento | Job programado / cron | Auto sistema | BR-EVENT-013 (decisión PO 8.1 #6) |
| S.2 | Aplicar default de `Quote.valid_until` = `created_at + 15 días` cuando el proveedor no lo especifica | Envío de `Quote` | Auto sistema | BR-QUOTE-015 (decisión PO 8.1 #4) |
| S.3 | Expirar automáticamente `Quote` cuando `valid_until` se cumple | Job programado | Auto sistema | BR-QUOTE-016 |
| S.4 | Marcar `QuoteRequest` como `expired` cuando aplique | Job programado | Auto sistema | BR-QUOTE-005 |
| S.5 | Enforcement del límite "máx 5 `QuoteRequest` activas por categoría por evento" | Creación de `QuoteRequest` | Validación obligatoria | BR-QUOTE-009 (decisión PO 8.1 #12) |
| S.6 | Enforcement de **timeout de IA a 1 minuto** y fallback a `MockAIProvider` en modo demo/testing | Llamada IA | Validación obligatoria | BR-AI-009 (decisión PO 8.1 #9) |
| S.7 | Enforcement de captcha/anti-bot en registro y login | Submit del formulario | Validación obligatoria | BR-AUTH-011 (decisión PO 8.1 #8) |
| S.8 | Enforcement de inmutabilidad de `Event.currency_code` tras creación | API/Service de eventos | Validación obligatoria | BR-EVENT-007 (decisión PO 8.1 #7) |
| S.9 | Soft delete obligatorio para `Review`, `Attachment` y `ServiceCategory` con dependencias | API/Service de moderación | Validación obligatoria | BR-REVIEW-005, BR-PRIVACY-011, BR-SERVICE-007 |
| S.10 | Bloqueo de hard delete de `EventType` con eventos asociados | API/Service admin | Validación obligatoria | BR-EVENTTYPE-007 (decisión PO 8.1 #17) |
| S.11 | Notificación in-app al proveedor cuando su `Quote` es rechazada o expira | Evento de estado | Auto sistema | BR-NOTIF-002 (decisión PO 8.1 #13) |
| S.12 | Registro automático en `AdminAction` para toda acción admin sobre `Review`, `VendorProfile`, `EventType`, `ServiceCategory`, `Attachment` | Ejecución de acción admin | Auto sistema | BR-ADMIN-004, BR-ADMIN-011 |
| S.13 | Enforcement de límite de 5 cambios de categoría por proveedor | Edición de `VendorProfile` | Validación obligatoria | BR-VENDOR-004 (decisión PO 8.1 #3) |
| S.14 | Enforcement de límite de 10 imágenes por trabajo/evento mostrado en portafolio | Subida de attachment | Validación obligatoria | BR-VENDOR-005 (decisión PO 8.1 #2) |
| S.15 | Enforcement de profundidad máxima de 2 niveles en jerarquía de categorías | Edición de `ServiceCategory` | Validación obligatoria | BR-SERVICE-005 (decisión PO 8.1 #18) |

---

## 18. Permisos sobre datos seed y demo

| # | Acción | Organizador | Proveedor | Administrador | Regla |
|---:|---|---|---|---|---|
| 1 | Ejecutar script seed | N/A | N/A | C/U (Seed) | BR-SEED-001 |
| 2 | Marcar entidad con flag `seed: true` | Auto al ejecutar seed | Auto | Auto | BR-SEED-005 |
| 3 | Gestionar usuarios seed (organizadores y proveedores demo) | N/A | N/A | C, R, U, D (Seed) | BR-ADMIN-009 |
| 4 | Gestionar eventos demo | N/A | N/A | R, U (Seed) | Recomendado |
| 5 | Gestionar reseñas seed | N/A | N/A | C, R, U, D (Seed) | BR-SEED-007, BR-SEED-010 |
| 6 | Validar coherencia cultural del seed | N/A | N/A | R (Seed) | BR-SEED-004 |
| 7 | Cargar datos personales reales en seed | N/A | N/A | **N/A** | BR-SEED-010, BR-PRIVACY-010 |
| 8 | Resetear datos seed | N/A | N/A | D (Seed) | Derived |
| 9 | Reproducir seed desde estado limpio | N/A | N/A | Auto (script) | BR-SEED-001 |
| 10 | Trazabilidad de acciones sobre seed | N/A | N/A | Auto en `AdminAction` | BR-ADMIN-010 |

---

## 19. Reglas de autorización para rutas y pantallas

> Las rutas listadas son **sugerencias funcionales de autorización**; no constituyen una arquitectura técnica definitiva.

| # | Ruta / Pantalla | Organizador | Proveedor | Administrador | Regla de acceso |
|---:|---|---|---|---|---|
| 1 | `/login` | Público | Público | Público | Sin sesión activa requerida. |
| 2 | `/register` | Público | Público | N/A | El registro público no crea admin (BR-AUTH-002). |
| 3 | `/password-recovery` | Público | Público | Público | BR-AUTH-004 |
| 4 | `/dashboard` | R (Own) | R (Own) | Redirige a `/admin/dashboard` | Dashboard por rol. |
| 5 | `/events` | R (Own list) | N/A | N/A | BR-EVENT-002 |
| 6 | `/events/new` | C (Own) | N/A | N/A | BR-EVENT-001 |
| 7 | `/events/:eventId` | R, U (Own) | N/A | R agregado (Recommended) | BR-EVENT-002 |
| 8 | `/events/:eventId/plan` | R, U (Own) | N/A | N/A | BR-AI-001 |
| 9 | `/events/:eventId/checklist` | R, U (Own) | N/A | N/A | BR-TASK-001 |
| 10 | `/events/:eventId/budget` | R, U (Own) | N/A | N/A | BR-BUDGET-001 |
| 11 | `/vendors` | R (Public approved) | R (Public approved) | R (All) | BR-VENDOR-001 |
| 12 | `/vendors/:vendorId` | R (Public approved) | R (Public approved + Own) | R (All) | BR-VENDOR-001 |
| 13 | `/quotes` | R (Own event list) | N/A | N/A | BR-QUOTE-006 |
| 14 | `/quotes/:quoteRequestId` | R (Own event) | N/A | R agregado (Recommended) | BR-QUOTE-006 |
| 15 | `/quotes/:quoteRequestId/compare` | R, COMP (Own event) | N/A | N/A | BR-QUOTE-021 |
| 16 | `/booking-intents` | R (Own list) | R (Own assigned) | R agregado | BR-BOOKING-001 |
| 17 | `/reviews/new?vendorId=` | C (Own + booking confirmado) | N/A | N/A | BR-REVIEW-001 |
| 18 | `/vendor/dashboard` | N/A | R (Own) | N/A | BR-AUTH-007 |
| 19 | `/vendor/profile` | N/A | R, U (Own) | N/A | BR-VENDOR-002 |
| 20 | `/vendor/services` | N/A | R, C, U, D (Own) | N/A | BR-SERVICE-002 |
| 21 | `/vendor/quotes` | N/A | R (Assigned) | N/A | BR-QUOTE-006 |
| 22 | `/vendor/quotes/:quoteRequestId` | N/A | R, RESP (Assigned) | N/A | BR-QUOTE-011 |
| 23 | `/admin/dashboard` | N/A | N/A | R (All) | BR-AUTH-010 |
| 24 | `/admin/categories` | N/A | N/A | C, R, U, D (All) | BR-ADMIN-002 |
| 25 | `/admin/vendors` | N/A | N/A | R, A, X, M (All) | BR-ADMIN-001 |
| 26 | `/admin/reviews` | N/A | N/A | R, M, D (All) | BR-ADMIN-003 |
| 27 | `/admin/demo-data` | N/A | N/A | C, R, U, D (Seed/Demo) | BR-SEED-001, BR-ADMIN-009 |
| 28 | `/admin/ai-logs` | N/A | N/A | R (All) | BR-ADMIN-008 |
| 29 | `/admin/audit-logs` | N/A | N/A | R (All) | BR-ADMIN-004 |
| 30 | `/notifications` | R, U(read) (Own) | R, U(read) (Own) | R, U(read) (Own) | BR-NOTIF-005 |
| 31 | `/account` | R, U (Own) | R, U (Own) | R, U (Own) | BR-USER-001 |

**Reglas adicionales para guardas de ruta:**

- Toda ruta protegida exige sesión activa (BR-AUTH-001); sin sesión, redirige a `/login`.
- Las rutas `/admin/*` retornan 403 a `organizer` y `vendor` (BR-AUTH-010).
- Las rutas `/vendor/*` retornan 403 a `organizer` y `admin` salvo lectura agregada (Derived).
- Las rutas `/events/:eventId/*` retornan 403/404 si el `:eventId` no pertenece al organizador autenticado (BR-EVENT-002).
- Las rutas `/vendor/quotes/:id` retornan 403/404 si la `QuoteRequest` no está asignada al proveedor (BR-QUOTE-006).

---

## 20. Reglas de autorización para API/backend

> Los recursos listados son **sugerencias funcionales de autorización**; no constituyen un contrato API formal.

| # | Recurso API | Organizador | Proveedor | Administrador | Regla de autorización |
|---:|---|---|---|---|---|
| 1 | `POST /auth/register` | Público (rol `organizer` o `vendor`) | Público | N/A | BR-AUTH-002 |
| 2 | `POST /auth/login` | Público | Público | Público | BR-AUTH-001 |
| 3 | `POST /auth/logout` | Sesión propia | Sesión propia | Sesión propia | BR-AUTH-003 |
| 4 | `GET /users/me` | R (Own) | R (Own) | R (Own) | BR-USER-001 |
| 5 | `PATCH /users/me` | U (Own) | U (Own) | U (Own) | BR-USER-001 |
| 6 | `GET /users` | N/A | N/A | R (All) | BR-ADMIN-009 |
| 7 | `POST /events` | C (Own) | 403 | 403 | BR-EVENT-001 |
| 8 | `GET /events/:id` | R si `owner_id == userId` | 403/404 | R agregado | BR-EVENT-002 |
| 9 | `PATCH /events/:id` | U si owner | 403 | 403 | BR-EVENT-002 |
| 10 | `DELETE /events/:id` | D si owner y estado válido | 403 | 403 | BR-EVENT-010 |
| 11 | `POST /events/:id/plan/generate` | C (Own) | 403 | 403 | BR-AI-001 |
| 12 | `POST /events/:id/checklist/generate` | C (Own) | 403 | 403 | BR-AI-001 |
| 13 | `POST /events/:id/budget/suggest` | C (Own) | 403 | 403 | BR-BUDGET-008 |
| 14 | `POST /event-tasks` | C (Own event) | 403 | 403 | BR-TASK-001 |
| 15 | `PATCH /event-tasks/:id` | U (Own event) | 403 | 403 | BR-TASK-004 |
| 16 | `POST /budgets/:id/items` | C (Own budget) | 403 | 403 | BR-BUDGET-002 |
| 17 | `GET /vendors` | R (Public approved) | R (Public approved) | R (All) | BR-VENDOR-001 |
| 18 | `GET /vendors/:id` | R (Public approved) | R (Public approved + Own) | R (All) | BR-VENDOR-001 |
| 19 | `POST /vendors` | 403 | C (Own) | 403 | BR-VENDOR-002 |
| 20 | `PATCH /vendors/:id` | 403 | U (Own) | U (limitado a estado, no contenido) | BR-VENDOR-004 |
| 21 | `POST /vendors/:id/approve` | 403 | 403 | A (All) | BR-ADMIN-001 |
| 22 | `POST /vendors/:id/reject` | 403 | 403 | X (All) | BR-VENDOR-003 |
| 23 | `POST /vendor-services` | 403 | C (Own profile) | 403 | BR-SERVICE-001 |
| 24 | `PATCH /vendor-services/:id` | 403 | U (Own) | 403 | BR-SERVICE-002 |
| 25 | `GET /service-categories` | R (Public) | R (Public) | R (All) | BR-SERVICE-003 |
| 26 | `POST /service-categories` | 403 | 403 | C (All) | BR-ADMIN-002 |
| 27 | `POST /quote-requests` | C (Own event active) | 403 | 403 | BR-QUOTE-001 |
| 28 | `GET /quote-requests/:id` | R (Own event) | R si dirigida a Own profile | R agregado | BR-QUOTE-006 |
| 29 | `PATCH /quote-requests/:id/cancel` | U (Own) | 403 | 403 | BR-QUOTE-010 |
| 30 | `POST /quotes` | 403 | C (Assigned QuoteRequest) | 403 | BR-QUOTE-011 |
| 31 | `PATCH /quotes/:id` | 403 | U (Own draft) | 403 | BR-QUOTE-017 |
| 32 | `POST /quotes/:id/accept` | A (Own event) | 403 | 403 | BR-QUOTE-014 |
| 33 | `POST /quotes/:id/reject` | X (Own event) | 403 | 403 | BR-QUOTE-014 |
| 34 | `POST /quotes/:id/preferred` | U (Own event) | 403 | 403 | BR-QUOTE-022 |
| 35 | `POST /booking-intents` | C SIM (Own event) | 403 | 403 | BR-BOOKING-001 |
| 36 | `POST /booking-intents/:id/confirm` | 403 | A (Assigned) | 403 | BR-BOOKING-002 |
| 37 | `POST /booking-intents/:id/cancel` | U (Own) | U (Own assigned) | 403 | BR-BOOKING-009 |
| 38 | `POST /reviews` | C (Own event + booking confirmado) | 403 | C SIM seed | BR-REVIEW-001 |
| 39 | `GET /reviews?vendorId=` | R (Public) | R (Public + Own) | R (All) | BR-REVIEW-004 |
| 40 | `PATCH /reviews/:id/hide` | 403 | 403 | M (All) | BR-REVIEW-005 |
| 41 | `DELETE /reviews/:id` | 403 | 403 | D (All) | BR-REVIEW-005 |
| 42 | `GET /notifications` | R (Own) | R (Own) | R (Own) | BR-NOTIF-005 |
| 43 | `PATCH /notifications/:id/read` | U (Own) | U (Own) | U (Own) | BR-NOTIF-004 |
| 44 | `GET /ai/recommendations/:id` | R (Own) | R (Own) | R (All) | BR-AI-007, BR-ADMIN-008 |
| 45 | `POST /ai/quote-summary` | C (Own event) | 403 | 403 | BR-QUOTE-023 |
| 46 | `GET /admin/metrics` | 403 | 403 | R (All) | BR-ADMIN-005 |
| 47 | `GET /admin/audit-logs` | 403 | 403 | R (All) | BR-ADMIN-004 |
| 48 | `POST /admin/seed/run` | 403 | 403 | C (Seed) | BR-SEED-001 |
| 49 | `POST /payments` | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-OOS-001 |
| 50 | `POST /whatsapp/notify` | **Out of Scope** | **Out of Scope** | **Out of Scope** | BR-OOS-004 |

**Reglas transversales para API/backend:**

- Toda llamada a un recurso protegido valida la sesión y el rol antes de aplicar reglas de ownership/assignment.
- Las violaciones de ownership devuelven `403 Forbidden` o `404 Not Found` (preferir 404 para no exponer existencia, según política).
- Las acciones admin auto-registran un `AdminAction` antes de devolver respuesta exitosa (BR-ADMIN-004).
- Los recursos marcados como `seed: true` se aíslan de las consultas operativas por defecto (Derived).

---

## 21. Permisos explícitamente fuera de alcance del MVP

| # | Permiso | Rol impactado | Razón de exclusión del MVP | Consideración futura |
|---:|---|---|---|---|
| 1 | Procesar pagos reales (tarjetas, transferencias, depósitos) | Todos | BR-OOS-001, BR-PRIVACY-006 | BR-FUTURE-003 (v2.0) |
| 2 | Cobrar comisiones por contrato cerrado | Admin / Sistema | BR-OOS-002 | BR-FUTURE-003 |
| 3 | Generar contratos digitales con firma electrónica | Organizador / Proveedor | BR-OOS-003, BR-BOOKING-005 | BR-FUTURE-004 |
| 4 | Enviar notificaciones por WhatsApp | Todos | BR-OOS-004, BR-NOTIF-006 | BR-FUTURE-007 |
| 5 | Enviar push notifications móviles o SMS | Todos | BR-OOS-017 | Future |
| 6 | Acceder desde app móvil nativa | Todos | BR-OOS-005 | BR-FUTURE-006 |
| 7 | Chat real-time entre organizador y proveedor | Organizador / Proveedor | BR-OOS-006 | BR-FUTURE-005 |
| 8 | Chat libre conversacional con IA | Todos | BR-AI-014, BR-OOS-018 | Future |
| 9 | Análisis de sentimiento sobre reseñas | Admin / Sistema | BR-OOS-007, BR-REVIEW-006 | BR-FUTURE-008 |
| 10 | Moderación automática de contenido con IA | Admin / Sistema | BR-OOS-008 | BR-FUTURE-009 |
| 11 | Generación de imágenes/decoración con IA | Todos | BR-AI-015, BR-OOS-016 | Future |
| 12 | KYC automatizado de proveedores | Admin / Sistema | BR-OOS-009 | BR-FUTURE-010 |
| 13 | Conversión automática entre monedas | Organizador | BR-OOS-015, BR-BUDGET-007 | Future |
| 14 | Geolocalización avanzada / mapas interactivos | Organizador / Proveedor | BR-OOS-011 | Future |
| 15 | Lista de invitados, RSVP, asignación de mesas | Organizador | BR-OOS-014 | BR-FUTURE-014 |
| 16 | Colaboración multi-usuario por evento | Organizador / Colaborador | BR-OOS-013, BR-USER-004 | BR-FUTURE-002 |
| 17 | Multi-rol simultáneo por usuario | Todos | BR-AUTH-005 | BR-FUTURE-001 |
| 18 | Manejo fiscal complejo (impuestos, facturación electrónica) | Admin / Sistema | BR-OOS-010 | Future |
| 19 | Respuesta del proveedor a reseñas | Proveedor | BR-REVIEW-008 | Future |
| 20 | Edición de reseñas publicadas por el organizador | Organizador | BR-REVIEW-007 | Future |
| 21 | Calendario completo de disponibilidad del proveedor | Proveedor | BR-VENDOR-009 | BR-FUTURE-011 |
| 22 | Integración con Google Calendar / Outlook | Todos | Future | BR-FUTURE-020 |
| 23 | Cumplimiento legal país-específico (LFPDPPP, LOPD, GDPR) | Sistema | BR-PRIVACY-004 | BR-FUTURE-016 |
| 24 | Plan freemium colaborativo | Organizador | Future | BR-FUTURE-017 |
| 25 | Suscripción real de proveedores con cobro automatizado | Proveedor | Future | BR-FUTURE-018 |
| 26 | Plan premium con galería destacada / boost | Proveedor | Future | BR-FUTURE-019 |
| 27 | Recomendaciones IA específicas de proveedores | Organizador | Future | BR-FUTURE-012 |
| 28 | Detección automática de inconsistencias por IA | Organizador / Sistema | Future | BR-FUTURE-015 |
| 29 | Resumen ejecutivo del evento generado por IA | Organizador | Future | BR-FUTURE-013 |
| 30 | Export masivo de datos | Admin | Future (no en fuentes) | Future |

---

## 22. Matriz CRUD consolidada

> Consolidación CRUD por entidad y rol. Acciones especiales se anotan en la columna "Acciones especiales".

| Entidad | Organizador | Proveedor | Administrador | Acciones especiales |
|---|---|---|---|---|
| User | C (Own registro), R, U (Own) | C (Own registro), R, U (Own) | R, U (sobre usuarios seed) | Cambio de contraseña (Own). |
| Role | R (rol propio) | R (rol propio) | R (catálogo) | Asignación automática al registrarse. |
| Event | C, R, U, D (Own) | R parcial (brief) | R agregado (Recommended) | Cambio de estado solo por owner. |
| EventType | R (Public) | N/A | C, R, U, D (Recomendado) | Curaduría manual. |
| EventTask | C, R, U, D (Own event) | N/A | R agregado | Confirmar IA, cambiar estado. |
| Budget | C, R, U, D (Own event) | N/A | R agregado | Warnings sin bloqueo. |
| BudgetItem | C, R, U, D (Own budget) | N/A | N/A | Auto-update `committed` al confirmar booking. |
| VendorProfile | R (Public approved) | C, R, U (Own); D (Own soft) | R, A, X, M (All) | Approve / Reject / Hide. |
| VendorService | R (Public) | C, R, U, D (Own) | R (All) | Asociar a categoría. |
| ServiceCategory | R (Public) | R (Public) | C, R, U, D (All) | Soft delete recomendado. |
| QuoteRequest | C, R, U/Cancel (Own event) | R (Assigned) | R agregado | Solo desde evento `active`. |
| Quote | R, COMP (Own event) | C, R, U (Own draft), S | R agregado | Aceptar / Rechazar / Preferred. Solo organizador. |
| BookingIntent | C SIM, R, U/Cancel (Own) | A/Confirm, X, U/Cancel (Assigned) | R agregado | Sin pago real ni contrato. |
| Review | C (Own + booking), R (Own + Public) | R (Own + Public) | R, M, D (All) | Solo verificada por booking confirmado. |
| Notification | R, U(read) (Own) | R, U(read) (Own) | R, U(read) (Own) | Email simulado por log. |
| AIRecommendation | C, R, U(accept) (Own) | C, R, U(accept) (Own opcional) | R (All para auditoría) | Trazabilidad obligatoria. |
| Location | R (Public) | R (Public); U (Own profile) | C, R, U (Recomendado) | Curaduría manual. |
| Attachment | C, R, U, D (Own QuoteRequest/Event) | C, R, U, D (Own portfolio) | R, D (All para moderación) | Límite de portafolio. |
| AdminAction | N/A | N/A | R (All); auto-C en cada acción admin | Inmutable. |

---

## 23. Matriz RACI simplificada

> **R** Responsable (ejecuta) · **A** Accountable (rinde cuentas) · **C** Consultado · **I** Informado.

| Proceso | Organizador | Proveedor | Administrador | Sistema (IA/auto) |
|---|---|---|---|---|
| Creación de evento | R, A | I (cuando recibe `QuoteRequest`) | I (agregado) | C (sugerencias IA) |
| Generación de plan IA | A | — | I (auditoría) | R (genera, requiere validación) |
| Confirmación de plan IA | R, A | — | — | I |
| Generación de checklist IA | A | — | I (auditoría) | R |
| Confirmación de tareas IA | R, A | — | — | I |
| Sugerencia IA de presupuesto | A | — | I (auditoría) | R |
| Aprobación de presupuesto | R, A | — | — | I |
| Búsqueda de proveedores | R, A | I (visibilidad en directorio si aprobado) | C (curaduría) | I |
| Envío de `QuoteRequest` | R, A | I (recibe notificación) | I (agregado) | C (autocompleta brief) |
| Respuesta `Quote` | I (recibe notificación) | R, A | I (agregado) | C (asistencia opcional) |
| Comparación de cotizaciones | R, A | I | I | C (resumen IA opcional) |
| Aceptación de `Quote` | R, A | I (recibe notificación) | I | I |
| Confirmación de `BookingIntent` | C | R, A | I (agregado) | I |
| Creación de `Review` | R, A | I (recibe notificación) | A (moderación) | I |
| Aprobación de `VendorProfile` | I (al aparecer en directorio) | C (recibe decisión) | R, A | I |
| Gestión de `ServiceCategory` | I | I | R, A | — |
| Moderación de reseñas | I (si su reseña se modera) | I (si reseña recibida se modera) | R, A | — |
| Gestión de datos seed | I | I | R, A | C (scripts) |
| Auditoría (`AdminAction`) | — | — | A (consulta) | R (registra) |
| Configuración de idioma/moneda | R, A (por evento) | R, A (por perfil) | C (catálogo) | I |

---

## 24. Escenarios de validación para QA

> Escenarios mínimos que QA debe validar para confirmar que las reglas de autorización se cumplen. Prioridad: **Alta**, **Media**, **Baja**.

| # | Escenario | Comportamiento esperado | Prioridad |
|---:|---|---|---|
| 1 | Usuario sin sesión accede a `/events` | Redirección a `/login` (BR-AUTH-001). | Alta |
| 2 | Organizador A intenta ver evento de organizador B | 403/404 (BR-EVENT-002, BR-AUTH-009). | Alta |
| 3 | Organizador A intenta editar evento de organizador B | 403 (BR-EVENT-002). | Alta |
| 4 | Proveedor intenta acceder a `/events/:eventId` ajeno | 403/404 (BR-AUTH-007). | Alta |
| 5 | Proveedor intenta ver `QuoteRequest` dirigida a otro proveedor | 403/404 (BR-QUOTE-006). | Alta |
| 6 | Proveedor intenta aprobar su propio perfil | 403 (BR-VENDOR-001, BR-ADMIN-001). | Alta |
| 7 | Organizador intenta acceder a `/admin/*` | 403 (BR-AUTH-010). | Alta |
| 8 | Registro público intenta crear cuenta con rol `admin` | 403 / Validación rechaza (BR-AUTH-002). | Alta |
| 9 | Organizador intenta enviar `QuoteRequest` desde evento `draft` | Bloqueado (BR-EVENT-006). | Alta |
| 10 | Organizador intenta crear segunda `QuoteRequest` activa al mismo proveedor | Bloqueado (BR-QUOTE-004). | Alta |
| 11 | Proveedor intenta editar `Quote` ya enviada | Bloqueado (BR-QUOTE-017). | Alta |
| 12 | Organizador intenta crear `BookingIntent` sobre `Quote` expirada | Bloqueado (BR-BOOKING-001, BR-QUOTE-016). | Alta |
| 13 | Organizador intenta dejar `Review` sin `BookingIntent.confirmed_intent` | Bloqueado (BR-REVIEW-001). | Alta |
| 14 | Organizador intenta dejar segunda `Review` para el mismo (evento, proveedor) | Bloqueado (BR-REVIEW-002). | Alta |
| 15 | Organizador intenta editar `Review` publicada | Bloqueado (BR-REVIEW-007). | Alta |
| 16 | Admin oculta una reseña ofensiva | Reseña dejas de ser pública; `AdminAction` registrado (BR-REVIEW-005, BR-ADMIN-004). | Alta |
| 17 | Admin aprueba un `VendorProfile` `pending` | Estado pasa a `approved`; proveedor aparece en directorio público; `AdminAction` registrado. | Alta |
| 18 | Vendor `pending` aparece en directorio público | No debe aparecer (BR-VENDOR-001). | Alta |
| 19 | IA genera plan; organizador no confirma | El plan no se persiste como dato oficial; `AIRecommendation.accepted=false` (BR-AI-001, BR-AI-007). | Alta |
| 20 | IA genera tareas; organizador acepta solo algunas | Solo las aceptadas se crean con `ai_generated=true` (BR-AI-008, BR-TASK-003). | Alta |
| 21 | Capa LLM falla / timeout | Fallback automático a `MockAIProvider` (BR-AI-009). | Media |
| 22 | Organizador cambia idioma del evento | Los nuevos prompts IA respetan el idioma (BR-AI-011, BR-I18N-007). | Media |
| 23 | Organizador intenta procesar pago real | Funcionalidad inexistente (BR-OOS-001). | Alta |
| 24 | Organizador intenta enviar notificación WhatsApp | Funcionalidad inexistente (BR-OOS-004). | Alta |
| 25 | Admin intenta actuar como `owner` de un evento comercial | No permitido por flujo (BR-ADMIN-006). | Alta |
| 26 | Admin elimina una categoría con servicios asociados | Se aplica soft delete o validación que protege referencias (BR-SERVICE-007). | Media |
| 27 | Acción admin no genera `AdminAction` | Falla del sistema; QA reporta (BR-ADMIN-004). | Alta |
| 28 | Conversión automática entre monedas se ofrece en UI | No debe existir (BR-OOS-015, BR-BUDGET-007). | Alta |
| 29 | Multi-colaboradores aparece en UI del evento | No debe existir en MVP (BR-OOS-013, BR-USER-004). | Alta |
| 30 | Chat real-time disponible en MVP | No debe existir (BR-OOS-006). | Alta |
| 31 | Proveedor responde a una reseña | Funcionalidad inexistente en MVP (BR-REVIEW-008). | Media |
| 32 | Organizador ve resumen IA del comparador | Disponible y editable como lectura asistida (BR-QUOTE-023). | Media |
| 33 | Notificaciones llegan a un usuario distinto del destinatario | Falla; deben aislarse por usuario (BR-NOTIF-005). | Alta |
| 34 | Datos seed contienen PII real | Falla de seed; debe corregirse (BR-PRIVACY-010, BR-SEED-010). | Alta |
| 35 | Admin consulta `AIRecommendation` para auditoría | Disponible (BR-ADMIN-008). | Media |
| 36 | Admin intenta editar contenido de una `Quote` o `QuoteRequest` | Bloqueado (integridad, Derived). | Media |
| 37 | Idioma y moneda son independientes | Cambiar idioma no altera moneda (BR-I18N-008). | Media |
| 38 | Solicitar generación IA en evento ajeno (vía API directa) | 403/404 (BR-AUTH-009, BR-AI-001). | Alta |
| 39 | Cambio de rol durante sesión activa | No permitido (BR-AUTH-005). | Alta |
| 40 | Cierre de sesión invalida la sesión | Validar (BR-AUTH-003). | Alta |

---

## 25. Preguntas abiertas o decisiones pendientes

Las 15 preguntas originales fueron resueltas por el Product Owner mediante el addendum [`/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`](./8.1-Product-Owner-Decisions-Use-Cases-Addendum.md) y reflejadas en este documento. La trazabilidad se mantiene a continuación:

| # | Pregunta original | Decisión PO 8.1 | Sección actualizada | Estado |
|---:|---|---|---|---|
| 1 | Listado de eventos para admin | Sí, **solo lectura** para demo/soporte/gobernanza; no edición; acceso registrado en `AdminAction` | 5.3, 9.3, 13.15 | Resuelta |
| 2 | Gestión de `EventType` desde panel | Sí, **controlada**; no hard delete si hay eventos asociados | 5.3, 9.4, 13.16 | Resuelta |
| 3 | `ServiceCategory` jerárquicas | Sí, **jerarquía simple de máximo 2 niveles** | 9.10, 13.17 | Resuelta |
| 4 | Cancelación de `BookingIntent.confirmed_intent` | Permitida en MVP, sin penalización en plataforma | 5.1, 5.2, 9.13, 11.15, 12.20 | Resuelta |
| 5 | Proveedor multiusuario | **Futuro** (sección 6.4) | 6.4 | Resuelta (Future) |
| 6 | Eliminación definitiva de `Attachment` | **Soft delete obligatorio** sobre metadata; limpieza física por mantenimiento técnico | 9.18, S.9 | Resuelta |
| 7 | Acceso completo a log de `AIRecommendation` | Solo admin con prompts versionados (BR-ADMIN-008) | 14, S.6 | Resuelta |
| 8 | Notificaciones agregadas al admin | Solo agregadas, no por evento individual | 7, 14 | Resuelta |
| 9 | Export de histórico del proveedor | **Future** | 25 (closed-out) | Resuelta (Future) |
| 10 | Captcha / anti-bot en login y registro | **Obligatorio** en ambos formularios | 5.1, 5.2, 11.17, 12.21, S.7 | Resuelta |
| 11 | Límite máximo de `QuoteRequest` activas por evento | **5 activas por categoría de servicio por evento** | 5.1, 9.11, 11.4, S.5 | Resuelta |
| 12 | Eliminación de reseñas por admin | **Soft delete + auditoría obligatoria** | 5.3, 9.14, 13.5, S.9 | Resuelta |
| 13 | Rechazo explícito vs expiración | El organizador puede rechazar explícitamente; expiración automática también permitida | 9.12, 15.1 | Resuelta |
| 14 | Notificación al proveedor por `Quote` rechazada/expirada | **In-app obligatoria**; email cuando exista funcionalidad | 5.2, 9.12, 12.19, S.11 | Resuelta |
| 15 | `AnthropicProvider` operativo | **No obligatorio**; basta interfaz preparada (stub/futuro) | 14 (Reglas transversales IA) | Resuelta |

Al cierre de esta revisión **no quedan preguntas abiertas críticas** para la generación del FRD.

---

## 26. Resumen final

Este documento define los **3 roles activos del MVP** (`organizer`, `vendor`, `admin`) y documenta los **roles futuros** previstos (colaborador de evento, super admin, moderador especializado, proveedor multiusuario, invitado del evento) sin habilitarlos en v1.

Se especifican permisos por **módulo** y por **entidad de dominio** (User, Role, Event, EventType, EventTask, Budget, BudgetItem, VendorProfile, VendorService, ServiceCategory, QuoteRequest, Quote, BookingIntent, Review, Notification, AIRecommendation, Location, Attachment, AdminAction) y se establecen **reglas de propiedad y acceso** consistentes con `4-Business-Rules-Document.md`.

Los **principios transversales** (ownership, least privilege, human-in-the-loop para IA, moderación controlada por admin, ausencia de pagos reales, sin WhatsApp, sin app nativa, aprobación de proveedores, restricción de visibilidad de cotizaciones, privacidad del evento, aislamiento por rol y trazabilidad admin) constituyen el filtro de autorización que cualquier feature o ruta debe respetar.

Las **matrices CRUD, RACI, autorización de rutas, autorización de API y QA** ofrecen al equipo de desarrollo y de QA un marco verificable de aceptación. Las **listas explícitas de funcionalidades fuera de alcance** previenen la incorporación accidental de capacidades fuera del MVP.

Las **15 preguntas abiertas originales fueron resueltas** por el Product Owner mediante el addendum [`/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`](./8.1-Product-Owner-Decisions-Use-Cases-Addendum.md) y aplicadas en este documento (ver sección 25). El documento debe **mantenerse vivo**: cualquier cambio de alcance, decisión PO o aprendizaje durante la implementación se reflejará en una nueva versión, preservando la trazabilidad con los documentos fuente.

> **Próximo paso recomendado:** convertir esta matriz, junto con las reglas Must Have del documento de Business Rules, en **user stories** y **criterios de aceptación** trazables. Cada feature Must Have del MVP Scope Definition debe cubrirse con al menos una historia, al menos una regla y al menos un escenario de QA.
