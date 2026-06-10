# EventFlow — Non-Functional Requirements Document (NFR)

## 1. Propósito del documento

Este documento define los **Requerimientos No Funcionales (NFR)** del MVP de **EventFlow**, una plataforma asistida por IA para planificación de eventos y gestión simplificada de cotizaciones de proveedores.

Los NFR describen **cómo** debe comportarse el sistema en términos de calidad: performance, seguridad, privacidad, confiabilidad, usabilidad, accesibilidad, internacionalización, calidad de la IA, mantenibilidad, testabilidad, observabilidad, integridad de datos, demo readiness y despliegue.

El documento es el insumo formal para:

- Product Owner
- Software Architect
- Equipo de desarrollo
- QA / Testing
- DevOps / despliegue académico
- UX/UI
- Agentes de IA que generen historias de usuario, tareas técnicas y casos de prueba
- Evaluadores académicos del Master Final Project

Los NFR aquí definidos son **realistas para un MVP** y están **anclados a documentos fuente**. No introducen requisitos enterprise (PCI, SOC 2, ISO 27001, multi-región, real-time chat, etc.) salvo que estén explícitamente soportados por la documentación.

---

## 2. Alcance del documento

Este NFR cubre los atributos de calidad necesarios para que el MVP de EventFlow sea:

- **Seguro:** autenticación, autorización por rol, propiedad de recursos, captcha/anti-bot.
- **Confiable:** manejo controlado de errores, timeout de IA 1 minuto, fallback `MockAIProvider`.
- **Usable:** web responsive, dashboards claros por rol, sugerencias IA distinguidas de datos confirmados.
- **Trazable:** auditoría de acciones administrativas, soft delete de reseñas y attachments, `AIRecommendation` persistido.
- **Internacionalizable:** 4 idiomas obligatorios (es-LATAM, es-ES, pt, en), display de moneda sin conversión automática.
- **Testeable:** `MockAIProvider` determinista, seed reproducible.
- **Desplegable:** ambiente académico/demo con variables de entorno y modo IA configurable.

**Quedan fuera del alcance del MVP** (capturados como Future u Out of Scope):

- Pagos reales, PCI, comisiones, facturación fiscal.
- Aplicación móvil nativa.
- Chat en tiempo real, WhatsApp, sincronización con calendarios externos.
- Conversión automática entre monedas.
- Moderación / análisis de sentimiento por IA.
- Aprobación autónoma de proveedores, contratación o pago por IA.
- Lista de invitados, RSVP, plano de mesas.
- Cumplimiento legal formal por país (LFPDPPP, LOPD, GDPR).

---

## 3. Fuentes utilizadas

| Documento | Ruta | Aporte principal al NFR |
| --- | --- | --- |
| Domain Discovery Report | `/docs/1-Domain-Discovery-Report.md` | Riesgos transversales, JTBD por rol, mitigaciones de IA. |
| Product Owner Decisions | `/docs/2-Product-Owner-Decisions.md` | Stack, abstracción `LLMProvider`, cobertura de tests, seed. |
| MVP Scope Definition | `/docs/3-MVP-Scope-Definition.md` | Métricas P95, cobertura ≥ 50–60%, demo readiness, exclusiones. |
| Business Rules Document | `/docs/4-Business-Rules-Document.md` | BR-AUTH, BR-AI, BR-EVENT, BR-QUOTE, BR-PRIVACY, BR-OOS. |
| User Roles & Permissions Matrix | `/docs/5-User-Roles-Permissions-Matrix.md` | Aislamiento por rol, ownership-based access. |
| Domain Data Model | `/docs/6-Domain-Data-Model.md` | Constraints C-* (immutabilidad, soft delete, depth_level). |
| AI Features Specification | `/docs/7-AI-Features-Specification.md` | Timeout, fallback, JSON estricto, MockAIProvider determinista. |
| Use Cases Specification | `/docs/8-Use-Cases-Specification.md` | UC-* invocados por validación de NFRs. |
| Product Owner Decisions Addendum | `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md` | 19 decisiones vinculantes que parametrizan NFRs MVP. |
| Documentation Alignment Review | `/docs/8.2-Documentation-Alignment-Review-Before-FRD.md` | Cierre de alineación previo al FRD. |
| Functional Requirements Document | `/docs/9-Functional-Requirements-Document.md` | FR-* trazados por cada NFR. |

---

## 4. Principios no funcionales del MVP

1. **IA asistiva, nunca autónoma.** Toda salida de IA requiere validación humana antes de convertirse en dato oficial.
2. **Seguridad básica y proporcional.** Autenticación, RBAC, ownership, captcha/anti-bot. Sin SSO, MFA, KYC ni compliance formal en MVP.
3. **Privacidad por minimización.** Solo se recolectan datos estrictamente necesarios; prompts IA envían el subconjunto mínimo.
4. **Confiabilidad por fallback.** Si la IA falla o excede 1 minuto, el sistema degrada a `MockAIProvider` o plantilla estática.
5. **Trazabilidad obligatoria.** Acciones administrativas, eliminaciones y salidas de IA dejan rastro persistente.
6. **Demo-first.** El sistema debe ser reproducible en un comando y demostrable en 10–15 minutos.
7. **Web responsive, sin app nativa.** Compatible con escritorio y móvil vía browser; no se construyen experiencias nativas.
8. **Internacionalización configurada al crear el evento.** Idioma y moneda se fijan al inicio; moneda es inmutable y no se convierte automáticamente.
9. **Abstracción de proveedor IA.** `LLMProvider` desacoplado: `OpenAIProvider` funcional, `MockAIProvider` obligatorio, `AnthropicProvider` stub.
10. **No overengineering.** No se agregan requisitos enterprise sin evidencia documental.

---

## 5. Metodología de extracción de NFRs

El proceso seguido fue **Read → Extract → Classify → Validate Scope → Specify → Trace**.

- **Read:** Se leyeron los 11 documentos fuente listados en la sección 3.
- **Extract:** Se identificaron NFRs explícitos, derivados, recomendados y futuros.
- **Classify:** Cada NFR se etiquetó con tipo de fuente, prioridad y alcance.
- **Validate Scope:** Se verificó que ningún NFR convirtiera EventFlow en un marketplace transaccional.
- **Specify:** Se redactaron NFRs claros, medibles y testables.
- **Trace:** Se cruzaron NFRs contra FR-*, UC-*, BR-*, entidades y features de IA.

**Clasificación de fuente (Source type):**

- **Explicit:** Declarado directamente en una fuente.
- **Derived:** Implícito en una FR/BR/UC/permiso/feature IA/decisión MVP.
- **Assumption:** Necesario para coherencia, no especificado.
- **Recommended:** Buena práctica sugerida, opcional.

**Alcance (Scope):** `MVP / Future / Out of Scope / Requires Product Owner Decision`.

**Prioridad:** `Must Have / Should Have / Could Have / Future / Out of Scope`.

---

## 6. Non-Functional Requirements Extraction from Source Documents

| Candidate NFR | Category | Found in source document | Evidence / context | Classification | MVP decision |
| --- | --- | --- | --- | --- | --- |
| Timeout de IA de 1 minuto con fallback a MockAIProvider | Reliability / AI | `8.1` decisión #9; `4` BR-AI-009; `7` §5 | "Si supera timeout, error controlado o fallback". | Explicit | MVP |
| Captcha / anti-bot obligatorio en registro y login | Security | `8.1` decisión #8; `4` BR-AUTH-011 | "Must Have" en autenticación. | Explicit | MVP |
| Validación humana obligatoria para salidas IA | AI safety / Data integrity | `4` BR-AI-001; `9` FR-AI-012 | "Toda sugerencia IA debe ser validada explícitamente". | Explicit | MVP |
| AIRecommendation persiste prompt_version_id y fallback_used | AI / Observability | `4` BR-AI-007/010; `6` C-031..035/058 | Persistencia y trazabilidad de outputs IA. | Explicit | MVP |
| OpenAIProvider funcional + MockAIProvider obligatorio + AnthropicProvider stub | Maintainability / AI | `8.1` decisión #15; `4` BR-AI-005/006 | LLMProvider abstraction. | Explicit | MVP |
| Soft delete obligatorio para Attachments | Data integrity / Privacy | `8.1` decisión #19; `4` BR-PRIVACY-011; `6` C-060 | `status='deleted'` + metadata. | Explicit | MVP |
| Audit + soft delete obligatorios para Reseñas | Data integrity | `8.1` decisión #11; `4` BR-REVIEW-005 | `status='removed/hidden'` + AdminAction. | Explicit | MVP |
| Currency inmutable tras creación del evento | Data integrity / i18n | `8.1` decisión #7; `4` BR-EVENT-007; `6` C-006 | "Local o USD; no editable". | Explicit | MVP |
| Auto-completion de evento 2 días después de event_date | Data integrity / Reliability | `8.1` decisión #6; `4` BR-EVENT-013; `9` FR-EVENT-009 | Job programado. | Explicit | MVP |
| Validez de cotización 15 días calendario por defecto | Data integrity | `8.1` decisión #4; `4` BR-QUOTE-015 | "15 días si no se especifica". | Explicit | MVP |
| Máximo 5 QuoteRequest activas por categoría/evento | Data integrity | `8.1` decisión #12; `4` BR-QUOTE-009 | Constraint de antiabuso. | Explicit | MVP |
| EventType no eliminable si tiene eventos asociados | Data integrity | `8.1` decisión #17; `4` BR-EVENTTYPE-007 | Soft delete forzado. | Explicit | MVP |
| Jerarquía de categorías de servicio máximo 2 niveles | Data integrity / Usability | `8.1` decisión #18; `4` BR-SERVICE-005; `6` C-013 | Limita complejidad. | Explicit | MVP |
| BookingIntent simulado y cancelable sin penalización | Data integrity / Reliability | `8.1` decisión #5; `4` BR-BOOKING-009 | No es contrato real. | Explicit | MVP |
| Web responsive only, sin app nativa | Usability | `3` §9; `4` BR-OOS-005; `2` decisión #6 | Excluye mobile nativo. | Explicit | MVP |
| 4 idiomas obligatorios (es-LATAM, es-ES, pt, en) | i18n | `2` decisión #15; `4` BR-I18N-001 | "Inglés es no negociable". | Explicit | MVP |
| Sin conversión automática entre monedas | i18n / Data integrity | `4` BR-BUDGET-007; `9` FR-BUDGET-007 | Display sin convertir. | Explicit | MVP |
| AI prompts reciben idioma como parámetro | AI / i18n | `4` BR-AI-011; `9` FR-AI-017 | Salida IA respeta idioma. | Explicit | MVP |
| MockAIProvider determinista para tests/demo | Testability / AI | `4` BR-AI-006; `9` FR-AI-014 | Reproducible. | Explicit | MVP |
| Seed reproducible en un comando | Demo readiness | `3` §14.3; `9` FR-DEMO-001 | "5–10 organizadores, 10–20 proveedores". | Explicit | MVP |
| AdminAction registra toda acción administrativa | Observability / Data integrity | `4` BR-ADMIN-004/011; `6` C-040/041 | Auditoría obligatoria. | Explicit | MVP |
| Email simulado por log estructurado | Observability | `4` BR-NOTIF-003; `9` FR-NOTIF-002 | "Se habría enviado a X". | Explicit | MVP |
| Cobertura de tests ≥ 50% lógica crítica, ≥ 60% recomendado | Testability | `2` §6.2; `3` §12.4 | Target MVP. | Explicit | MVP |
| P95 < 1.5s endpoints no-IA; P95 < 8s IA con streaming | Performance | `3` §12.4; `9` §6 | Recomendado MVP. | Recommended | MVP |
| Disponibilidad 99% en demo | Reliability | `3` §12.4 | Target académico. | Recommended | MVP |
| WCAG-inspired básico (semantic HTML, focus, contraste) | Accessibility | Implícito en "web responsive" | Buenas prácticas. | Derived | MVP |
| Datos mínimos del usuario (sin documentos ni medios de pago) | Privacy | `4` BR-USER-005; `9` FR-USER-005 | Minimización. | Explicit | MVP |
| Buenas prácticas de privacidad sin compliance formal por país | Privacy | `2` decisión #14; `3` §8.5 | No GDPR/LFPDPPP formal. | Explicit | MVP |
| Hash de contraseña (bcrypt/argon2) | Security | `6` C-061 | Sin almacenar plaintext. | Explicit | MVP |
| Aislamiento por rol (organizer no ve eventos ajenos) | Security | `4` BR-AUTH-009; `9` FR-AUTH-010 | Ownership enforcement. | Explicit | MVP |
| Vendor solo ve QuoteRequest dirigidas a él | Security | `4` BR-QUOTE-006; `9` FR-QUOTE-005 | Aislamiento por destinatario. | Explicit | MVP |
| Streaming + skeletons para latencia IA | Usability / Performance | `1` §11 Riesgo 9 | Mitigación UX. | Explicit | MVP |
| Modularidad FE/BE/DB/IA, ADRs | Maintainability | `3` §14.3; `2` §4.1 | Separation of concerns. | Explicit | MVP |
| Env vars para keys IA y modo provider | Deployment | `3` §9.4; `4` BR-AI-005 | `LLM_PROVIDER`, `AI_TIMEOUT_MS`. | Explicit | MVP |
| Pagos reales, PCI | Out of Scope | `4` BR-OOS-001 | Excluido explícito. | Explicit | Out of Scope |
| App móvil nativa | Out of Scope | `4` BR-OOS-005 | Solo web. | Explicit | Out of Scope |
| WhatsApp, push, SMS | Out of Scope | `4` BR-OOS-004/017 | Excluido. | Explicit | Out of Scope |
| Chat tiempo real | Out of Scope | `4` BR-OOS-006 | Excluido. | Explicit | Out of Scope |
| Sincronización calendarios externos | Future | `4` BR-OOS-019; BR-FUTURE-020 | Postpuesto. | Explicit | Future |
| Moderación / sentiment IA | Out of Scope | `4` BR-OOS-007/008 | Excluido. | Explicit | Out of Scope |
| Conversión automática de monedas | Out of Scope | `4` BR-OOS-015 | Excluido. | Explicit | Out of Scope |
| AnthropicProvider funcional | Future | `8.1` decisión #15 | Stub en MVP. | Explicit | Future |
| Multi-collaborators / co-organizadores | Future | `4` BR-OOS-013; BR-FUTURE-002 | Postpuesto. | Explicit | Future |
| Guest list / RSVP / seating | Out of Scope | `4` BR-OOS-014 | Excluido. | Explicit | Out of Scope |
| Geolocalización avanzada / planificación de rutas | Out of Scope | `4` BR-OOS-011 | Excluido. | Explicit | Out of Scope |
| KYC automatizado | Out of Scope | `4` BR-OOS-009 | Solo aprobación manual. | Explicit | Out of Scope |
| Cumplimiento legal país-específico (GDPR/LFPDPPP formal) | Future | `2` decisión #14; `3` §8.5 | Solo buenas prácticas. | Explicit | Future |
| Imagen generada por IA | Out of Scope | `4` BR-OOS-016; BR-AI-015 | Excluido. | Explicit | Out of Scope |
| Chatbot conversacional libre | Out of Scope | `4` BR-OOS-018; BR-AI-014 | Excluido. | Explicit | Out of Scope |

---

## 7. Resumen ejecutivo del NFR

El MVP de EventFlow es una **workspace web responsive asistida por IA para planificación de eventos** y **flujo simplificado de cotizaciones**. Los NFRs MVP buscan:

- Garantizar que la IA sea **rápida (timeout 1 min), trazable, editable y nunca autónoma**.
- Proteger los datos con **RBAC, ownership y captcha/anti-bot**, sin compliance enterprise.
- Asegurar **demo reproducible** con seed determinista y `MockAIProvider`.
- Mantener **integridad y trazabilidad de datos** con auditoría administrativa, soft delete y constraints de inmutabilidad.
- Soportar **4 idiomas y múltiples monedas display** sin convertir tipos de cambio.
- Habilitar **despliegue académico simple** con variables de entorno y modo IA conmutable.

Los NFRs explícitamente excluyen requerimientos de marketplace transaccional, pagos reales, contratos digitales, mobile nativo, chat real-time, calendarios externos, conversión de monedas y moderación IA.

---

## 8. Categorías NFR incluidas en el MVP

| Prefijo | Categoría | # NFRs MVP |
| --- | --- | --- |
| NFR-PERF | Performance | 6 |
| NFR-SEC | Seguridad | 8 |
| NFR-PRIV | Privacidad y protección de datos | 5 |
| NFR-REL | Confiabilidad y resiliencia | 6 |
| NFR-USAB | Usabilidad | 6 |
| NFR-A11Y | Accesibilidad | 5 |
| NFR-I18N | Internacionalización y localización | 6 |
| NFR-AI | Calidad, seguridad y fallback de IA | 10 |
| NFR-MAINT | Mantenibilidad | 5 |
| NFR-TEST | Testabilidad | 6 |
| NFR-OBS | Observabilidad y logging | 6 |
| NFR-DATA | Integridad, auditoría y trazabilidad | 10 |
| NFR-DEMO | Datos seed y demo readiness | 6 |
| NFR-DEPLOY | Despliegue y ambientes | 5 |

---

## 9. Requerimientos de performance

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-PERF-001 | El sistema debe responder los endpoints no-IA con un P95 inferior a 1.5 segundos bajo condiciones normales de demo. | Performance | Should Have | MVP | Explicit | Métrica P95 medida sobre endpoints REST principales con seed cargado. | FR-EVENT-004, FR-VENDOR-006, 3-MVP §12.4 |
| NFR-PERF-002 | La integración de IA debe responder con un P95 inferior a 8 segundos usando streaming y skeleton loaders en la UI. | Performance / AI | Should Have | MVP | Explicit | Métrica P95 con `OpenAIProvider` activo + streaming habilitado. | FR-AI-006, AI-006, 1-Discovery §11 Riesgo 9 |
| NFR-PERF-003 | La aplicación debe cargar las páginas principales en menos de 3 segundos bajo condiciones normales de demo. | Performance | Should Have | MVP | Recommended | Time-to-interactive medido con DevTools sobre seed. | FR-EVENT-004, FR-VENDOR-006 |
| NFR-PERF-004 | El dashboard administrativo debe renderizar sus métricas operativas en menos de 3 segundos con seed/demo data. | Performance | Should Have | MVP | Recommended | Tiempo de carga del panel admin con métricas FR-ADMIN-005. | FR-ADMIN-005, 8.1 decisión #10 |
| NFR-PERF-005 | El directorio de proveedores debe permanecer usable con el volumen esperado de seed (10–20 proveedores). | Performance | Must Have | MVP | Derived | Paginación funcional + filtros respondan en menos de 1.5 s. | FR-VENDOR-006, BR-VENDOR-001 |
| NFR-PERF-006 | El backend debe evitar llamadas IA innecesarias caché-pasibles y permitir regeneración explícita por el usuario. | Performance / AI | Should Have | MVP | Derived | No se invoca IA en cargas pasivas; solo bajo acción explícita o on-demand. | FR-AI-013, BR-AI-008 |

---

## 10. Requerimientos de seguridad

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-SEC-001 | El sistema debe exigir autenticación obligatoria para todas las funcionalidades que no sean páginas públicas. | Security | Must Have | MVP | Explicit | Acceso sin sesión retorna 401 en endpoints protegidos. | FR-AUTH-001, BR-AUTH-001 |
| NFR-SEC-002 | El backend debe aplicar autorización basada en rol (organizer/vendor/admin) sobre cada endpoint protegido. | Security | Must Have | MVP | Explicit | Tests de autorización por rol; rol incorrecto retorna 403. | FR-AUTH-008/009, BR-AUTH-005..009 |
| NFR-SEC-003 | El sistema debe aplicar control de propiedad: un organizer solo gestiona sus eventos; un vendor solo su perfil/servicios y solicitudes dirigidas a él. | Security | Must Have | MVP | Explicit | Acceso cruzado entre usuarios devuelve 403. | FR-EVENT-002, FR-QUOTE-005, BR-EVENT-002, BR-QUOTE-006 |
| NFR-SEC-004 | El sistema debe incluir mecanismos de Captcha / anti-bot en los flujos de registro y login. | Security | Must Have | MVP | Explicit | Endpoints de auth rechazan llamadas sin token captcha válido (o mock determinista en test). | FR-AUTH-002, BR-AUTH-011, 8.1 decisión #8 |
| NFR-SEC-005 | El backend debe almacenar contraseñas únicamente como hash mediante bcrypt o argon2; nunca en texto plano. | Security | Must Have | MVP | Explicit | Inspección de tabla `users` muestra `password_hash` no reversible. | C-061, BR-PRIVACY-008 |
| NFR-SEC-006 | El registro público debe impedir la creación del rol `admin`; el rol admin solo se crea por seed o por otro admin. | Security | Must Have | MVP | Explicit | Test que intenta registrar admin recibe error de validación. | FR-AUTH-007, BR-AUTH-002 |
| NFR-SEC-007 | El backend debe validar entradas básicas en cada endpoint (tipos, longitudes, formatos) antes de procesarlas. | Security | Must Have | MVP | Derived | Tests automatizados de validación + sanitización contra inyección. | BR-USER-002, FR-USER-001 |
| NFR-SEC-008 | El sistema debe almacenar las credenciales de proveedores IA (API keys) únicamente en variables de entorno, nunca en el repositorio. | Security | Must Have | MVP | Derived | Inspección de repositorio + `.env.example` sin valores reales. | 3-MVP §9.4, BR-AI-005 |

---

## 11. Requerimientos de privacidad y protección de datos

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-PRIV-001 | El sistema debe seguir buenas prácticas de privacidad sin implementar cumplimiento legal formal por país (LFPDPPP/LOPD/GDPR) en MVP. | Privacy | Must Have | MVP | Explicit | Política de privacidad básica publicada; no se garantizan derechos formales DSR automatizados. | 2-PO decisión #14, 3-MVP §8.5 |
| NFR-PRIV-002 | El sistema debe recolectar el mínimo de datos personales necesarios y no solicitar documentos de identidad, datos fiscales ni medios de pago. | Privacy | Must Have | MVP | Explicit | Esquema de `User` sin campos sensibles fuera de email/nombre/rol/teléfono opcional. | FR-USER-005, BR-USER-005 |
| NFR-PRIV-003 | La integración de IA debe enviar únicamente los datos estrictamente necesarios al LLM, evitando incluir información personal innecesaria. | Privacy / AI | Must Have | MVP | Explicit | Auditoría de prompts vs `AIRecommendation.payload` para verificar minimización. | 7-AI-Features §12, BR-AI-011 |
| NFR-PRIV-004 | El sistema debe excluir datos sensibles (tokens, contraseñas, payloads completos de IA con PII) de los logs en producción y demo. | Privacy / Observability | Must Have | MVP | Derived | Revisión de logger central; redacción configurada. | BR-PRIVACY-008, BR-ADMIN-004 |
| NFR-PRIV-005 | El sistema debe mantener separación lógica de datos entre organizers, vendors y admin para evitar fugas entre perfiles. | Privacy | Must Have | MVP | Derived | Tests cruzados por rol verifican ausencia de datos ajenos. | FR-AUTH-010, BR-AUTH-009 |

---

## 12. Requerimientos de confiabilidad y resiliencia

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-REL-001 | La integración de IA debe abortar la espera al alcanzar 1 minuto (60 000 ms) y mostrar un error controlado o degradar a `MockAIProvider`/plantilla estática. | Reliability / AI | Must Have | MVP | Explicit | Test de integración con `AI_TIMEOUT_MS=60000` + provider lento simulado. | FR-AI-009/015, BR-AI-009, 8.1 decisión #9 |
| NFR-REL-002 | El sistema debe mostrar errores controlados (mensaje al usuario + log) ante fallas de IA, base de datos o servicios externos. | Reliability | Must Have | MVP | Derived | Pantallas de error revisadas en QA por flujo. | 3-MVP §8.5, FR-AI-009 |
| NFR-REL-003 | `OpenAIProvider` es el proveedor IA funcional MVP; `MockAIProvider` es obligatorio para tests/demo; `AnthropicProvider` es stub/futuro. | Reliability / AI | Must Have | MVP | Explicit | Inspección de `LLMProvider` interface + factory configurable. | FR-AI-014/016, BR-AI-005/006, 8.1 decisión #15 |
| NFR-REL-004 | El backend debe ejecutar un job programado que marque `Quote` con `valid_until` vencido como `expired` automáticamente. | Reliability / Data | Must Have | MVP | Explicit | Test de expiración con fecha simulada confirma cambio de estado. | FR-QUOTE-005, BR-QUOTE-016, UC-QUOTE-010 |
| NFR-REL-005 | El backend debe ejecutar un job que complete automáticamente eventos 2 días calendario después de su `event_date` si no se completaron manualmente. | Reliability / Data | Must Have | MVP | Explicit | Test de auto-completion sobre eventos seed pasados. | FR-EVENT-009, BR-EVENT-013, 8.1 decisión #6 |
| NFR-REL-006 | El `BookingIntent` simulado debe permitir confirmar y cancelar sin penalización ni interacción con pasarelas reales. | Reliability / Data | Must Have | MVP | Explicit | Test E2E del flujo organizer → confirmar → cancelar. | BR-BOOKING-004/009, 8.1 decisión #5 |

---

## 13. Requerimientos de usabilidad

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-USAB-001 | La aplicación debe ser web responsive y funcionar en navegadores modernos en escritorio y móvil; no se construye app nativa en v1. | Usability | Must Have | MVP | Explicit | QA visual en breakpoints estándar (sm/md/lg/xl). | 3-MVP §9, BR-OOS-005, 2-PO decisión #6 |
| NFR-USAB-002 | La interfaz debe distinguir visualmente las sugerencias de IA respecto a los datos confirmados (badge, color o label). | Usability / AI | Must Have | MVP | Explicit | Revisión de componentes; tests de UI verifican badge `ai_generated`. | FR-AI-011, BR-AI-003/008 |
| NFR-USAB-003 | El sistema debe proveer dashboards específicos por rol (organizer, vendor, admin) con métricas e información relevante para cada rol. | Usability | Must Have | MVP | Explicit | QA confirma dashboards diferenciados por rol. | FR-EVENT-004, FR-VENDOR-007, FR-ADMIN-005 |
| NFR-USAB-004 | El sistema debe mostrar mensajes de validación y error claros y accionables en formularios y flujos críticos. | Usability | Must Have | MVP | Derived | Revisión QA de formularios + tests de validación. | FR-AUTH-001..007, FR-EVENT-001 |
| NFR-USAB-005 | El sistema debe permitir comparación lado a lado de cotizaciones recibidas para el mismo `QuoteRequest`. | Usability | Must Have | MVP | Explicit | Vista de comparación funcional con seed. | FR-QUOTE-006, BR-QUOTE-021 |
| NFR-USAB-006 | El sistema debe presentar etiquetas de estado claras y consistentes para eventos, cotizaciones, reseñas y tareas. | Usability | Must Have | MVP | Derived | QA verifica etiquetas + traducción multi-idioma. | FR-EVENT-004, FR-QUOTE-003, FR-REVIEW-001 |

---

## 14. Requerimientos de accesibilidad

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-A11Y-001 | La aplicación debe usar HTML semántico (encabezados jerárquicos, landmarks, elementos nativos) en las pantallas MVP. | Accessibility | Should Have | MVP | Recommended | Auditoría con Lighthouse/Axe en páginas principales. | FR-EVENT-004, FR-VENDOR-006 |
| NFR-A11Y-002 | La aplicación debe permitir navegación por teclado en los flujos principales (login, creación de evento, comparación de cotizaciones). | Accessibility | Should Have | MVP | Recommended | Recorrido manual con Tab/Shift+Tab/Enter en flujos críticos. | FR-AUTH-001, FR-EVENT-001, FR-QUOTE-006 |
| NFR-A11Y-003 | Los elementos interactivos deben mostrar estado de foco visible. | Accessibility | Should Have | MVP | Recommended | Revisión visual + tests de foco. | FR-EVENT-001, FR-QUOTE-006 |
| NFR-A11Y-004 | Los formularios deben tener etiquetas asociadas a sus campos y mensajes de error accesibles para lectores de pantalla. | Accessibility | Should Have | MVP | Derived | Auditoría Axe + revisión manual. | FR-AUTH-001, FR-EVENT-001 |
| NFR-A11Y-005 | Los textos deben mantener un contraste mínimo recomendado por WCAG (≥ 4.5:1 para texto regular). | Accessibility | Should Have | MVP | Recommended | Verificación con contrast checker en paleta principal. | Design system MVP |

---

## 15. Requerimientos de internacionalización y localización

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-I18N-001 | La aplicación debe soportar 4 idiomas: español LATAM neutral, español España, portugués e inglés. El inglés es obligatorio. | i18n | Must Have | MVP | Explicit | Inspección de archivos de traducción + switcher funcional. | FR-I18N-002, BR-I18N-001, 2-PO decisión #15 |
| NFR-I18N-002 | El usuario debe poder elegir su idioma preferido y la aplicación debe persistirlo en su perfil. | i18n | Must Have | MVP | Explicit | Test E2E confirma persistencia por usuario. | FR-USER-003, BR-USER-006 |
| NFR-I18N-003 | El idioma del evento debe configurarse al crearlo y pasarse como parámetro a todas las llamadas IA relacionadas. | i18n / AI | Must Have | MVP | Explicit | Inspección de prompts versionados + test de salida. | FR-EVENT-014, FR-AI-017, BR-AI-011 |
| NFR-I18N-004 | El sistema debe mostrar montos en la moneda configurada del evento, soportando al menos GTQ, MXN, COP, EUR y USD, sin convertir automáticamente entre monedas. | i18n / Data | Must Have | MVP | Explicit | QA sobre seed multi-moneda; ausencia de tipo de cambio aplicado. | FR-BUDGET-007/009, BR-BUDGET-007 |
| NFR-I18N-005 | La moneda del evento debe ser inmutable después de la creación. | i18n / Data | Must Have | MVP | Explicit | Endpoint de edición rechaza cambio de `currency_code`. | FR-EVENT-014, BR-EVENT-007, 8.1 decisión #7 |
| NFR-I18N-006 | El seed/demo data debe cubrir al menos 2 idiomas y 3 monedas distintas para validar internacionalización end-to-end. | i18n / Demo | Should Have | MVP | Derived | Inspección del seed: eventos con diferentes `locale` y `currency`. | FR-DEMO-001, BR-SEED-* |

---

## 16. Requerimientos no funcionales de IA

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-AI-001 | Toda salida generada por IA debe ser editable por el usuario antes de convertirse en dato oficial del sistema. | AI safety | Must Have | MVP | Explicit | Tests E2E confirman edición previa a "aceptar". | FR-AI-012/019, BR-AI-001/002 |
| NFR-AI-002 | La IA no debe tomar decisiones autónomas (no aprueba proveedores, no contrata, no paga, no modera). | AI safety | Must Have | MVP | Explicit | Revisión de código + ausencia de side-effects directos desde provider. | BR-AI-004, BR-REVIEW-006, BR-VENDOR-006 |
| NFR-AI-003 | La integración de IA debe respetar un timeout máximo de 1 minuto por solicitud. | AI / Reliability | Must Have | MVP | Explicit | Variable `AI_TIMEOUT_MS=60000`; test de timeout. | FR-AI-015, BR-AI-009, 8.1 decisión #9 |
| NFR-AI-004 | El sistema debe persistir cada salida IA como `AIRecommendation` con `type`, `payload`, `prompt_version_id`, `accepted`, `fallback_used` y `timeout_ms`. | AI / Observability | Must Have | MVP | Explicit | Inspección de tabla `AIRecommendation` tras invocación. | FR-AI-010, BR-AI-007/010, C-031..035/058 |
| NFR-AI-005 | El sistema debe validar el JSON de cada salida IA contra el schema esperado y reintentar una vez en caso de payload inválido. | AI / Reliability | Must Have | MVP | Explicit | Tests con payload corrupto verifican reintento + fallback. | FR-AI-009, 7-AI-Features §5, AI-001..009 |
| NFR-AI-006 | El sistema debe marcar con `ai_generated=true` las entidades creadas a partir de sugerencias IA (EventTask, BudgetItem, etc.). | AI / Data | Must Have | MVP | Explicit | Inspección de columnas + tests de creación vía IA. | FR-AI-013, BR-AI-008 |
| NFR-AI-007 | El sistema debe exponer una abstracción `LLMProvider` con implementaciones `OpenAIProvider`, `MockAIProvider` y stub `AnthropicProvider`. | AI / Maintainability | Must Have | MVP | Explicit | Inspección de interfaz + factory; toggle por `LLM_PROVIDER`. | FR-AI-014/016, BR-AI-005/006 |
| NFR-AI-008 | `MockAIProvider` debe producir salidas deterministas para los mismos inputs en modo demo/test. | AI / Testability | Must Have | MVP | Explicit | Snapshot tests sobre el mock. | FR-AI-014, BR-AI-006 |
| NFR-AI-009 | Las sugerencias IA deben distinguirse visualmente y persistirse como no-oficiales hasta confirmación humana. | AI / Usability | Must Have | MVP | Explicit | QA UI + tests de estado `accepted=false`. | FR-AI-011/012, BR-AI-003/008 |
| NFR-AI-010 | Los prompts deben versionarse en el repositorio y referenciarse por `prompt_version_id` en `AIRecommendation`. | AI / Maintainability / Observability | Must Have | MVP | Explicit | Inspección del repo: carpeta `prompts/` + persistencia. | BR-AI-010, 7-AI-Features §3 |

---

## 17. Requerimientos de mantenibilidad

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-MAINT-001 | El proyecto debe organizarse en módulos por dominio (auth, events, vendors, quotes, ai, admin) con separación clara entre frontend, backend, base de datos y capa de IA. | Maintainability | Must Have | MVP | Explicit | Inspección de estructura de carpetas + ADR. | 3-MVP §14.3, 2-PO §4.1 |
| NFR-MAINT-002 | La capa de IA debe consumir exclusivamente la interfaz `LLMProvider`; los servicios de negocio no deben acoplarse al SDK de un proveedor específico. | Maintainability / AI | Must Have | MVP | Explicit | Inspección de imports; tests de doble cambio de provider. | BR-AI-005, FR-AI-014/016 |
| NFR-MAINT-003 | El comportamiento configurable (proveedor IA, timeout, idioma por defecto, moneda por defecto) debe leerse desde variables de entorno o configuración versionada. | Maintainability / Deployment | Must Have | MVP | Derived | Inspección de `.env.example`. | 3-MVP §9.4, BR-AI-005 |
| NFR-MAINT-004 | Las reglas de negocio críticas deben referenciar el ID de regla (`BR-*`) en comentarios o nombres de prueba para trazabilidad. | Maintainability / Testability | Should Have | MVP | Recommended | Inspección de tests/comentarios. | 4-Business-Rules-* |
| NFR-MAINT-005 | Los scripts de seed/demo deben estar separados de la lógica de producción y ser ejecutables como comando independiente. | Maintainability / Demo | Must Have | MVP | Explicit | Comando `npm run seed` (o equivalente) documentado. | FR-DEMO-001, 3-MVP §14.3 |

---

## 18. Requerimientos de testabilidad

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-TEST-001 | El proyecto debe alcanzar cobertura de pruebas de al menos 50% en lógica crítica de negocio (target recomendado 60%). | Testability | Should Have | MVP | Explicit | Reporte de cobertura en CI. | 2-PO §6.2, 3-MVP §12.4 |
| NFR-TEST-002 | Las reglas críticas (validez de cotización, moneda inmutable, máx. 5 QuoteRequests, soft delete) deben tener tests unitarios automatizados. | Testability / Data | Must Have | MVP | Derived | Inspección de suite de tests. | BR-QUOTE-015/009, BR-EVENT-007, BR-PRIVACY-011 |
| NFR-TEST-003 | El `MockAIProvider` debe usarse en tests automatizados y soportar respuestas deterministas. | Testability / AI | Must Have | MVP | Explicit | Tests de IA usan mock; sin llamadas reales en CI. | FR-AI-014, BR-AI-006 |
| NFR-TEST-004 | Los flujos E2E principales (registro/login, creación de evento, solicitar/comparar/aceptar cotización, completar evento) deben tener al menos un test automatizado. | Testability | Should Have | MVP | Derived | Inspección de suite E2E. | UC-EVENT-001..010, UC-QUOTE-001..010 |
| NFR-TEST-005 | Los tests de autorización deben cubrir accesos cruzados entre organizers y vendors. | Testability / Security | Must Have | MVP | Derived | Casos negativos (otro user) presentes en suite. | FR-AUTH-010, BR-AUTH-009 |
| NFR-TEST-006 | La estrategia de captcha debe ser testeable mediante mock o stub determinista en entornos de CI/QA. | Testability / Security | Must Have | MVP | Derived | Variable de entorno o flag desactiva captcha real en CI. | FR-AUTH-002, BR-AUTH-011 |

---

## 19. Requerimientos de observabilidad y logging

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-OBS-001 | Toda acción administrativa relevante (aprobación/rechazo de vendor, eliminación de reseña, edición de catálogo, vista de detalle de evento) debe registrarse en `AdminAction`. | Observability / Data | Must Have | MVP | Explicit | Inspección de tabla `AdminAction` por acción. | FR-ADMIN-008, FR-EVENT-010, FR-REVIEW-003, BR-ADMIN-004/011 |
| NFR-OBS-002 | El sistema debe loggear errores de proveedor IA, timeouts, JSON inválido y uso de fallback con contexto suficiente para diagnóstico. | Observability / AI | Must Have | MVP | Explicit | Inspección de logs en flujo IA simulado fallido. | FR-AI-009/010, BR-AI-007 |
| NFR-OBS-003 | El sistema debe loggear fallos de autenticación, autorización y captcha de manera estructurada. | Observability / Security | Must Have | MVP | Derived | Inspección de logs por intento fallido. | FR-AUTH-002, BR-AUTH-011 |
| NFR-OBS-004 | Las notificaciones por email deben simularse mediante log estructurado en MVP (sin enviar emails reales). | Observability / Reliability | Must Have | MVP | Explicit | Log `[EMAIL] to=… subject=…` por cada notificación disparada. | FR-NOTIF-002, BR-NOTIF-003 |
| NFR-OBS-005 | Los cambios de estado críticos (cotización vencida, evento auto-completado, BookingIntent cancelado, attachment soft-deleted) deben registrarse en logs o en `AdminAction` cuando aplica. | Observability / Data | Must Have | MVP | Derived | Inspección cruzada de logs + tablas. | FR-EVENT-009, FR-QUOTE-005, BR-PRIVACY-011 |
| NFR-OBS-006 | El sistema NO debe requerir observabilidad enterprise (distributed tracing, APM, ELK) en MVP. Logging estructurado a stdout es suficiente. | Observability | Should Have | MVP | Derived | Ausencia de dependencias APM en stack. | 3-MVP §9.4 |

---

## 20. Requerimientos de integridad, auditoría y trazabilidad de datos

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-DATA-001 | La moneda del evento debe ser inmutable después de la creación. | Data integrity / i18n | Must Have | MVP | Explicit | Endpoint de update rechaza cambio de `currency_code`. | BR-EVENT-007, 8.1 decisión #7, C-006 |
| NFR-DATA-002 | El sistema debe completar automáticamente eventos 2 días calendario después de su `event_date` si no se completan manualmente, registrando `auto_completed=true`. | Data integrity / Reliability | Must Have | MVP | Explicit | Test de job + inspección del flag. | BR-EVENT-013, 8.1 decisión #6, C-048 |
| NFR-DATA-003 | La validez por defecto de una `Quote` debe ser 15 días calendario si el vendor no especifica `valid_until`. | Data integrity | Must Have | MVP | Explicit | Test de creación sin `valid_until` confirma valor por defecto. | BR-QUOTE-015, 8.1 decisión #4, C-019 |
| NFR-DATA-004 | Un evento no debe permitir más de 5 `QuoteRequest` activas por categoría de servicio. | Data integrity | Must Have | MVP | Explicit | Test rechaza la sexta solicitud activa. | BR-QUOTE-009, 8.1 decisión #12, C-016 |
| NFR-DATA-005 | El sistema no debe permitir borrado físico (hard delete) de `EventType` si existen eventos asociados; debe usar soft delete. | Data integrity | Must Have | MVP | Explicit | Test rechaza hard delete; soft delete permitido. | BR-EVENTTYPE-007, 8.1 decisión #17 |
| NFR-DATA-006 | La jerarquía de categorías de servicio debe limitarse a un máximo de 2 niveles. | Data integrity / Usability | Must Have | MVP | Explicit | Constraint en `depth_level <= 2`. | BR-SERVICE-005, 8.1 decisión #18, C-013 |
| NFR-DATA-007 | La eliminación de reseñas debe ser soft delete con `status='removed'/'hidden'`, registro de `moderated_by`, `moderated_at`, `moderation_reason` y entrada en `AdminAction`. | Data integrity / Privacy | Must Have | MVP | Explicit | Inspección post-eliminación + audit. | BR-REVIEW-005, 8.1 decisión #11, C-043 |
| NFR-DATA-008 | La eliminación de attachments debe ser soft delete con `status='deleted'`, `deleted_at`, `deleted_by` y `deletion_reason`. | Data integrity / Privacy | Must Have | MVP | Explicit | Inspección post-eliminación. | BR-PRIVACY-011, 8.1 decisión #19, C-060 |
| NFR-DATA-009 | Las salidas IA persistidas deben requerir validación humana explícita (`accepted=true`) para convertirse en datos oficiales. | Data integrity / AI | Must Have | MVP | Explicit | Tests verifican flujo accept; sin auto-accept. | BR-AI-001, FR-AI-012, C-031..035 |
| NFR-DATA-010 | El `BookingIntent` debe ser simulado y cancelable sin penalización ni efectos en sistemas externos. | Data integrity / Reliability | Must Have | MVP | Explicit | Test E2E confirma cancelación sin side-effects. | BR-BOOKING-009, 8.1 decisión #5 |

---

## 21. Requerimientos de datos seed y demo readiness

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-DEMO-001 | El seed debe poblar entre 5 y 10 usuarios organizers, entre 10 y 20 vendors, 1 admin (Product Owner) y entre 10 y 15 eventos en estados variados. | Demo readiness | Must Have | MVP | Explicit | Inspección post-seed. | FR-DEMO-001, 2-PO §11, 3-MVP §7.16 |
| NFR-DEMO-002 | El seed debe incluir eventos en estados `draft`, `active`, `advanced` y `completed`, al menos un `BookingIntent` confirmado y al menos una reseña visible. | Demo readiness | Must Have | MVP | Explicit | QA visual sobre demo. | FR-DEMO-001, 3-MVP §14.4 |
| NFR-DEMO-003 | El seed debe poder ejecutarse mediante un único comando documentado (`npm run seed` o equivalente) y ser idempotente. | Demo readiness / Deployment | Must Have | MVP | Explicit | Ejecución repetida sin duplicados. | FR-DEMO-001, 3-MVP §14.3 |
| NFR-DEMO-004 | El sistema debe permitir alternar entre `OpenAIProvider` y `MockAIProvider` mediante variable de entorno para demos reproducibles. | Demo readiness / AI | Must Have | MVP | Explicit | Cambio de `LLM_PROVIDER` activa el provider correspondiente. | FR-AI-016, 3-MVP §14.4 |
| NFR-DEMO-005 | El seed debe cubrir al menos 10–15 categorías de servicio y al menos 5 tipos de evento (bodas, XV años, bautizo, cumpleaños, corporativo). | Demo readiness | Must Have | MVP | Explicit | Inspección de catálogos seed. | FR-DEMO-001, BR-EVENTTYPE-004 |
| NFR-DEMO-006 | La demo guiada debe poder completarse en 10–15 minutos cubriendo: registro/login, creación de evento + plan IA, solicitar/comparar/aceptar cotización, completar evento, panel admin. | Demo readiness | Must Have | MVP | Explicit | Cronómetro durante ensayo de demo. | 3-MVP §14.4 |

---

## 22. Requerimientos de despliegue y ambientes

| NFR ID | Requirement | Category | Priority | Scope | Source type | Measurement / Validation | Related FR / UC |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NFR-DEPLOY-001 | El MVP debe ser desplegable en un entorno cloud accesible para evaluación académica (Vercel, Render, Railway, Supabase o equivalente). | Deployment | Must Have | MVP | Explicit | URL pública del demo activa durante la evaluación. | 3-MVP §9.4 |
| NFR-DEPLOY-002 | El proyecto debe incluir un archivo `.env.example` con todas las variables necesarias (`LLM_PROVIDER`, `OPENAI_API_KEY`, `AI_TIMEOUT_MS`, `DATABASE_URL`, secretos de auth) sin valores reales. | Deployment / Security | Must Have | MVP | Derived | Inspección del repo. | 3-MVP §9.4, BR-AI-005 |
| NFR-DEPLOY-003 | El sistema debe permitir un modo demo/test que use `MockAIProvider` sin requerir API keys reales. | Deployment / AI | Must Have | MVP | Explicit | `LLM_PROVIDER=mock` opera sin `OPENAI_API_KEY`. | FR-AI-014/016, BR-AI-006 |
| NFR-DEPLOY-004 | El repositorio debe incluir documentación básica de setup (README) con pasos para clonar, instalar, seed y arrancar local. | Deployment / Maintainability | Must Have | MVP | Derived | Revisión del README. | 3-MVP §14.3 |
| NFR-DEPLOY-005 | El despliegue no debe requerir infraestructura compleja (Kubernetes, multi-región, blue-green) en MVP. | Deployment | Should Have | MVP | Derived | Stack documentado en `3-MVP-Scope §9.4`. | 3-MVP §9.4 |

---

## 23. NFRs futuros

| Future NFR ID | Requirement | Reason deferred | Dependency | Possible version |
| --- | --- | --- | --- | --- |
| NFR-FUT-001 | Cumplimiento legal formal por país (LFPDPPP México, LOPD España, GDPR UE). | MVP solo aplica buenas prácticas; compliance formal requiere asesoría legal e infraestructura DSR. | Negocio + Legal | v2 (Lanzamiento comercial) |
| NFR-FUT-002 | Certificación formal de accesibilidad WCAG 2.1 AA. | MVP cubre prácticas básicas; certificación requiere auditoría externa. | UX + QA | v2 |
| NFR-FUT-003 | Observabilidad enterprise (APM, distributed tracing, dashboards Grafana). | Logging estructurado es suficiente para demo académica. | DevOps | v2 |
| NFR-FUT-004 | Despliegue multi-región con HA. | No requerido para MVP académico. | DevOps | v3 |
| NFR-FUT-005 | Rate limiting avanzado por endpoint y por usuario. | MVP cubre captcha y validación básica. | Backend | v1.x |
| NFR-FUT-006 | SSO/MFA para usuarios. | Login básico es suficiente para MVP. | Auth | v2 |
| NFR-FUT-007 | Performance nativa móvil (PWA avanzada o app nativa). | MVP es web responsive only. | FE / Mobile | v2 |
| NFR-FUT-008 | `AnthropicProvider` funcional como segundo proveedor IA. | Stub presente; MVP usa OpenAI + Mock. | AI | v1.x |
| NFR-FUT-009 | Sincronización con calendarios externos (Google, Outlook, Apple) con SLA de entrega. | Excluido del MVP. | Integrations | v2 |
| NFR-FUT-010 | Capacidad de respuesta del vendor a reseñas con auditoría. | Excluido del MVP (decisión 8.1 #14). | Backend | v1.x |
| NFR-FUT-011 | Verificación avanzada de proveedores (KYC automatizado, validación de documentos). | MVP solo aprobación manual del admin. | Trust & Safety | v2 |
| NFR-FUT-012 | Co-organizadores y colaboración multi-usuario sobre un evento. | Excluido del MVP. | Backend | v2 |

---

## 24. NFRs explícitamente fuera de alcance

| Out-of-Scope NFR ID | Requirement / capability | Source evidence | Reason excluded from MVP | Risk if included now |
| --- | --- | --- | --- | --- |
| NFR-OOS-001 | Calidad/seguridad de pagos reales (PCI, tokenización de tarjetas, integración con pasarelas). | BR-OOS-001, BR-BOOKING-004 | EventFlow no procesa pagos en MVP. | Convierte el MVP en marketplace transaccional. |
| NFR-OOS-002 | Confiabilidad de cálculo de comisiones reales. | BR-OOS-002 | No hay comisiones financieras en MVP. | Riesgo legal/financiero. |
| NFR-OOS-003 | Cumplimiento fiscal y emisión de facturas (CFDI, FEL, AFIP, etc.). | BR-OOS-010 | MVP no maneja contabilidad. | Carga regulatoria desproporcionada. |
| NFR-OOS-004 | Garantías de entrega de mensajería WhatsApp / SMS / push nativo. | BR-OOS-004/017 | Excluidas; solo email simulado e in-app. | Dependencia de proveedores externos. |
| NFR-OOS-005 | Latencia de chat en tiempo real entre usuarios. | BR-OOS-006 | No hay chat real-time en MVP. | Complejidad de socket scaling. |
| NFR-OOS-006 | Confiabilidad de sincronización con calendarios externos. | BR-OOS-019 | Excluido del MVP. | Manejo de tokens OAuth y SLAs externos. |
| NFR-OOS-007 | Cumplimiento enterprise (SOC 2, ISO 27001, HIPAA). | 2-PO decisión #14 | Fuera de alcance académico. | Carga de auditoría no factible. |
| NFR-OOS-008 | Detección automatizada de fraude. | 1-Discovery §11 Riesgo 4 | Mitigación MVP es aprobación manual del admin. | ML pipeline no requerido. |
| NFR-OOS-009 | Seguridad/calidad de moderación automática por IA (toxicidad, sesgo). | BR-OOS-007/008, BR-REVIEW-006 | Sin moderación IA en MVP. | Riesgo de daño reputacional. |
| NFR-OOS-010 | Escalabilidad de colaboración multi-usuario en un mismo evento. | BR-OOS-013 | Excluido del MVP. | Complejidad de control de concurrencia. |
| NFR-OOS-011 | Exactitud de geolocalización avanzada y planificación de rutas. | BR-OOS-011 | Excluido del MVP. | Costos de mapas externos. |
| NFR-OOS-012 | Performance de lista de invitados / RSVP / plano de mesas. | BR-OOS-014 | Excluido del MVP. | Cambia el foco del producto. |
| NFR-OOS-013 | Exactitud de conversión automática entre monedas. | BR-OOS-015, BR-BUDGET-007 | Solo display por moneda configurada. | Riesgo de errores contables. |
| NFR-OOS-014 | Calidad de aplicación móvil nativa (iOS/Android). | BR-OOS-005, 2-PO decisión #6 | Web responsive only. | Doble esfuerzo de mantenimiento. |
| NFR-OOS-015 | Calidad de generación de imágenes por IA. | BR-OOS-016, BR-AI-015 | Excluido del MVP. | Costos y compliance de contenido visual. |

---

## 25. Matriz consolidada de NFRs

| NFR ID | Categoría | Prioridad | Alcance | Source type |
| --- | --- | --- | --- | --- |
| NFR-PERF-001 | Performance | Should Have | MVP | Explicit |
| NFR-PERF-002 | Performance / AI | Should Have | MVP | Explicit |
| NFR-PERF-003 | Performance | Should Have | MVP | Recommended |
| NFR-PERF-004 | Performance | Should Have | MVP | Recommended |
| NFR-PERF-005 | Performance | Must Have | MVP | Derived |
| NFR-PERF-006 | Performance / AI | Should Have | MVP | Derived |
| NFR-SEC-001 | Security | Must Have | MVP | Explicit |
| NFR-SEC-002 | Security | Must Have | MVP | Explicit |
| NFR-SEC-003 | Security | Must Have | MVP | Explicit |
| NFR-SEC-004 | Security | Must Have | MVP | Explicit |
| NFR-SEC-005 | Security | Must Have | MVP | Explicit |
| NFR-SEC-006 | Security | Must Have | MVP | Explicit |
| NFR-SEC-007 | Security | Must Have | MVP | Derived |
| NFR-SEC-008 | Security | Must Have | MVP | Derived |
| NFR-PRIV-001 | Privacy | Must Have | MVP | Explicit |
| NFR-PRIV-002 | Privacy | Must Have | MVP | Explicit |
| NFR-PRIV-003 | Privacy / AI | Must Have | MVP | Explicit |
| NFR-PRIV-004 | Privacy / Observability | Must Have | MVP | Derived |
| NFR-PRIV-005 | Privacy | Must Have | MVP | Derived |
| NFR-REL-001 | Reliability / AI | Must Have | MVP | Explicit |
| NFR-REL-002 | Reliability | Must Have | MVP | Derived |
| NFR-REL-003 | Reliability / AI | Must Have | MVP | Explicit |
| NFR-REL-004 | Reliability / Data | Must Have | MVP | Explicit |
| NFR-REL-005 | Reliability / Data | Must Have | MVP | Explicit |
| NFR-REL-006 | Reliability / Data | Must Have | MVP | Explicit |
| NFR-USAB-001 | Usability | Must Have | MVP | Explicit |
| NFR-USAB-002 | Usability / AI | Must Have | MVP | Explicit |
| NFR-USAB-003 | Usability | Must Have | MVP | Explicit |
| NFR-USAB-004 | Usability | Must Have | MVP | Derived |
| NFR-USAB-005 | Usability | Must Have | MVP | Explicit |
| NFR-USAB-006 | Usability | Must Have | MVP | Derived |
| NFR-A11Y-001 | Accessibility | Should Have | MVP | Recommended |
| NFR-A11Y-002 | Accessibility | Should Have | MVP | Recommended |
| NFR-A11Y-003 | Accessibility | Should Have | MVP | Recommended |
| NFR-A11Y-004 | Accessibility | Should Have | MVP | Derived |
| NFR-A11Y-005 | Accessibility | Should Have | MVP | Recommended |
| NFR-I18N-001 | i18n | Must Have | MVP | Explicit |
| NFR-I18N-002 | i18n | Must Have | MVP | Explicit |
| NFR-I18N-003 | i18n / AI | Must Have | MVP | Explicit |
| NFR-I18N-004 | i18n / Data | Must Have | MVP | Explicit |
| NFR-I18N-005 | i18n / Data | Must Have | MVP | Explicit |
| NFR-I18N-006 | i18n / Demo | Should Have | MVP | Derived |
| NFR-AI-001 | AI safety | Must Have | MVP | Explicit |
| NFR-AI-002 | AI safety | Must Have | MVP | Explicit |
| NFR-AI-003 | AI / Reliability | Must Have | MVP | Explicit |
| NFR-AI-004 | AI / Observability | Must Have | MVP | Explicit |
| NFR-AI-005 | AI / Reliability | Must Have | MVP | Explicit |
| NFR-AI-006 | AI / Data | Must Have | MVP | Explicit |
| NFR-AI-007 | AI / Maintainability | Must Have | MVP | Explicit |
| NFR-AI-008 | AI / Testability | Must Have | MVP | Explicit |
| NFR-AI-009 | AI / Usability | Must Have | MVP | Explicit |
| NFR-AI-010 | AI / Maintainability / Observability | Must Have | MVP | Explicit |
| NFR-MAINT-001 | Maintainability | Must Have | MVP | Explicit |
| NFR-MAINT-002 | Maintainability / AI | Must Have | MVP | Explicit |
| NFR-MAINT-003 | Maintainability / Deployment | Must Have | MVP | Derived |
| NFR-MAINT-004 | Maintainability / Testability | Should Have | MVP | Recommended |
| NFR-MAINT-005 | Maintainability / Demo | Must Have | MVP | Explicit |
| NFR-TEST-001 | Testability | Should Have | MVP | Explicit |
| NFR-TEST-002 | Testability / Data | Must Have | MVP | Derived |
| NFR-TEST-003 | Testability / AI | Must Have | MVP | Explicit |
| NFR-TEST-004 | Testability | Should Have | MVP | Derived |
| NFR-TEST-005 | Testability / Security | Must Have | MVP | Derived |
| NFR-TEST-006 | Testability / Security | Must Have | MVP | Derived |
| NFR-OBS-001 | Observability / Data | Must Have | MVP | Explicit |
| NFR-OBS-002 | Observability / AI | Must Have | MVP | Explicit |
| NFR-OBS-003 | Observability / Security | Must Have | MVP | Derived |
| NFR-OBS-004 | Observability / Reliability | Must Have | MVP | Explicit |
| NFR-OBS-005 | Observability / Data | Must Have | MVP | Derived |
| NFR-OBS-006 | Observability | Should Have | MVP | Derived |
| NFR-DATA-001 | Data integrity / i18n | Must Have | MVP | Explicit |
| NFR-DATA-002 | Data integrity / Reliability | Must Have | MVP | Explicit |
| NFR-DATA-003 | Data integrity | Must Have | MVP | Explicit |
| NFR-DATA-004 | Data integrity | Must Have | MVP | Explicit |
| NFR-DATA-005 | Data integrity | Must Have | MVP | Explicit |
| NFR-DATA-006 | Data integrity / Usability | Must Have | MVP | Explicit |
| NFR-DATA-007 | Data integrity / Privacy | Must Have | MVP | Explicit |
| NFR-DATA-008 | Data integrity / Privacy | Must Have | MVP | Explicit |
| NFR-DATA-009 | Data integrity / AI | Must Have | MVP | Explicit |
| NFR-DATA-010 | Data integrity / Reliability | Must Have | MVP | Explicit |
| NFR-DEMO-001 | Demo readiness | Must Have | MVP | Explicit |
| NFR-DEMO-002 | Demo readiness | Must Have | MVP | Explicit |
| NFR-DEMO-003 | Demo readiness / Deployment | Must Have | MVP | Explicit |
| NFR-DEMO-004 | Demo readiness / AI | Must Have | MVP | Explicit |
| NFR-DEMO-005 | Demo readiness | Must Have | MVP | Explicit |
| NFR-DEMO-006 | Demo readiness | Must Have | MVP | Explicit |
| NFR-DEPLOY-001 | Deployment | Must Have | MVP | Explicit |
| NFR-DEPLOY-002 | Deployment / Security | Must Have | MVP | Derived |
| NFR-DEPLOY-003 | Deployment / AI | Must Have | MVP | Explicit |
| NFR-DEPLOY-004 | Deployment / Maintainability | Must Have | MVP | Derived |
| NFR-DEPLOY-005 | Deployment | Should Have | MVP | Derived |

---

## 26. Matriz de trazabilidad NFR → FRD / UC / BR / Entidades

| NFR ID | Related FRD requirement | Related use case | Related business rule | Related entity | Related AI feature | Source document |
| --- | --- | --- | --- | --- | --- | --- |
| NFR-PERF-001 | FR-EVENT-004, FR-VENDOR-006 | UC-EVENT-004, UC-VENDOR-006 | BR-PERF (derivado) | Event, VendorProfile | — | 3-MVP §12.4, 9-FRD §6 |
| NFR-PERF-002 | FR-AI-006, AI-006 | UC-QUOTE-005 | BR-AI-009 | AIRecommendation | AI-006 Comparación cotizaciones | 3-MVP §12.4, 7-AI §5 |
| NFR-PERF-005 | FR-VENDOR-006 | UC-VENDOR-003 | BR-VENDOR-001 | VendorProfile, ServiceCategory | — | 3-MVP §7.16 |
| NFR-SEC-001 | FR-AUTH-001 | UC-AUTH-001 | BR-AUTH-001 | User, Session | — | 4-BR §AUTH |
| NFR-SEC-002 | FR-AUTH-008, FR-AUTH-009 | UC-AUTH-* | BR-AUTH-005..009 | User | — | 4-BR §AUTH |
| NFR-SEC-003 | FR-EVENT-002, FR-QUOTE-005 | UC-EVENT-002, UC-QUOTE-005 | BR-EVENT-002, BR-QUOTE-006 | Event, QuoteRequest | — | 4-BR §EVENT/QUOTE |
| NFR-SEC-004 | FR-AUTH-002 | UC-AUTH-001, UC-AUTH-002 | BR-AUTH-011 | — | — | 8.1 decisión #8 |
| NFR-SEC-005 | FR-AUTH-012 | UC-AUTH-001 | BR-PRIVACY-008 | User (`password_hash`) | — | 6-DDM C-061 |
| NFR-SEC-006 | FR-AUTH-007 | UC-AUTH-001 | BR-AUTH-002 | User | — | 4-BR §AUTH |
| NFR-PRIV-001 | — | — | (políticas) | — | — | 2-PO decisión #14 |
| NFR-PRIV-002 | FR-USER-005 | UC-USER-001 | BR-USER-005 | User | — | 4-BR §USER |
| NFR-PRIV-003 | FR-AI-017 | UC-AI-* | BR-AI-011 | AIRecommendation | AI-001..009 | 7-AI §12 |
| NFR-PRIV-004 | — | — | BR-PRIVACY-008 | AdminAction | — | 4-BR §PRIVACY |
| NFR-PRIV-005 | FR-AUTH-010 | UC-AUTH-* | BR-AUTH-009 | User, Event | — | 4-BR §AUTH |
| NFR-REL-001 | FR-AI-009, FR-AI-015 | UC-AI-* | BR-AI-009 | AIRecommendation | AI-001..009 | 8.1 decisión #9 |
| NFR-REL-002 | FR-AI-009 | UC-AI-* | BR-AI-009 | — | — | 3-MVP §8.5 |
| NFR-REL-003 | FR-AI-014, FR-AI-016 | UC-AI-* | BR-AI-005/006 | AIPromptVersion | All AI | 8.1 decisión #15 |
| NFR-REL-004 | FR-QUOTE-005 | UC-QUOTE-010 | BR-QUOTE-016 | Quote | — | 4-BR §QUOTE |
| NFR-REL-005 | FR-EVENT-009 | UC-EVENT-009 | BR-EVENT-013 | Event | — | 8.1 decisión #6 |
| NFR-REL-006 | FR-BOOKING-* | UC-BOOKING-* | BR-BOOKING-009 | BookingIntent | — | 8.1 decisión #5 |
| NFR-USAB-001 | — | — | BR-OOS-005 | — | — | 3-MVP §9 |
| NFR-USAB-002 | FR-AI-011 | UC-AI-* | BR-AI-003/008 | AIRecommendation, EventTask, BudgetItem | All AI | 4-BR §AI |
| NFR-USAB-003 | FR-EVENT-004, FR-VENDOR-007, FR-ADMIN-005 | UC-* | BR-* | Event, VendorProfile, AdminAction | — | 9-FRD |
| NFR-USAB-005 | FR-QUOTE-006 | UC-QUOTE-006 | BR-QUOTE-021 | Quote | AI-006 | 4-BR §QUOTE |
| NFR-A11Y-001..005 | (transversal) | — | (derivado) | — | — | (derivado) |
| NFR-I18N-001 | FR-I18N-002 | UC-I18N-001 | BR-I18N-001 | User (`locale`) | — | 2-PO decisión #15 |
| NFR-I18N-002 | FR-USER-003 | UC-USER-001 | BR-USER-006 | User | — | 4-BR §USER |
| NFR-I18N-003 | FR-AI-017, FR-EVENT-014 | UC-EVENT-001, UC-AI-* | BR-AI-011, BR-EVENT-008 | Event, AIRecommendation | All AI | 4-BR §AI |
| NFR-I18N-004 | FR-BUDGET-007, FR-BUDGET-009 | UC-BUDGET-* | BR-BUDGET-007 | Budget, BudgetItem | — | 4-BR §BUDGET |
| NFR-I18N-005 | FR-EVENT-014 | UC-EVENT-002 | BR-EVENT-007 | Event (`currency_code`) | — | 8.1 decisión #7 |
| NFR-AI-001 | FR-AI-012, FR-AI-019 | UC-AI-* | BR-AI-001/002 | AIRecommendation | All AI | 4-BR §AI |
| NFR-AI-002 | FR-AI-020 | UC-AI-* | BR-AI-004 | AIRecommendation | All AI | 4-BR §AI |
| NFR-AI-003 | FR-AI-015 | UC-AI-* | BR-AI-009 | AIRecommendation | All AI | 8.1 decisión #9 |
| NFR-AI-004 | FR-AI-010 | UC-AI-* | BR-AI-007/010 | AIRecommendation | All AI | 6-DDM C-031..035/058 |
| NFR-AI-005 | FR-AI-009 | UC-AI-* | BR-AI-007 | AIRecommendation | All AI | 7-AI §5 |
| NFR-AI-006 | FR-AI-013 | UC-AI-* | BR-AI-008 | EventTask, BudgetItem | All AI | 4-BR §AI |
| NFR-AI-007 | FR-AI-014, FR-AI-016 | UC-AI-* | BR-AI-005/006 | AIPromptVersion | All AI | 8.1 decisión #15 |
| NFR-AI-008 | FR-AI-014 | UC-AI-* | BR-AI-006 | AIRecommendation | All AI | 4-BR §AI |
| NFR-AI-009 | FR-AI-011, FR-AI-012 | UC-AI-* | BR-AI-003/008 | AIRecommendation | All AI | 4-BR §AI |
| NFR-AI-010 | FR-AI-018 | UC-AI-* | BR-AI-010 | AIPromptVersion | All AI | 4-BR §AI |
| NFR-MAINT-001 | — | — | (arquitectura) | — | — | 3-MVP §14.3 |
| NFR-MAINT-002 | FR-AI-014, FR-AI-016 | UC-AI-* | BR-AI-005 | AIPromptVersion | All AI | 2-PO §4.1 |
| NFR-TEST-001 | — | — | (cobertura) | — | — | 2-PO §6.2 |
| NFR-TEST-002 | FR-QUOTE-005, FR-EVENT-014 | UC-QUOTE-010, UC-EVENT-002 | BR-QUOTE-015/009, BR-EVENT-007 | Quote, Event | — | 4-BR §QUOTE/EVENT |
| NFR-TEST-003 | FR-AI-014 | UC-AI-* | BR-AI-006 | — | All AI | 4-BR §AI |
| NFR-TEST-005 | FR-AUTH-010 | UC-AUTH-* | BR-AUTH-009 | User, Event | — | 4-BR §AUTH |
| NFR-TEST-006 | FR-AUTH-002 | UC-AUTH-001 | BR-AUTH-011 | — | — | 8.1 decisión #8 |
| NFR-OBS-001 | FR-ADMIN-008, FR-EVENT-010, FR-REVIEW-003 | UC-ADMIN-* | BR-ADMIN-004/011, BR-EVENT-014 | AdminAction | — | 4-BR §ADMIN |
| NFR-OBS-002 | FR-AI-009, FR-AI-010 | UC-AI-* | BR-AI-007 | AIRecommendation | All AI | 4-BR §AI |
| NFR-OBS-003 | FR-AUTH-002 | UC-AUTH-* | BR-AUTH-011 | — | — | 4-BR §AUTH |
| NFR-OBS-004 | FR-NOTIF-002 | UC-NOTIF-* | BR-NOTIF-003 | Notification | — | 4-BR §NOTIF |
| NFR-OBS-005 | FR-EVENT-009, FR-QUOTE-005 | UC-EVENT-009, UC-QUOTE-010 | BR-EVENT-013, BR-QUOTE-016, BR-PRIVACY-011 | Event, Quote, Attachment | — | 4-BR |
| NFR-DATA-001 | FR-EVENT-014 | UC-EVENT-002 | BR-EVENT-007 | Event | — | 8.1 decisión #7 |
| NFR-DATA-002 | FR-EVENT-009 | UC-EVENT-009 | BR-EVENT-013 | Event | — | 8.1 decisión #6 |
| NFR-DATA-003 | FR-QUOTE-001 | UC-QUOTE-003 | BR-QUOTE-015 | Quote | — | 8.1 decisión #4 |
| NFR-DATA-004 | FR-QUOTE-001 | UC-QUOTE-001 | BR-QUOTE-009 | QuoteRequest | — | 8.1 decisión #12 |
| NFR-DATA-005 | FR-ADMIN-007 | UC-ADMIN-007 | BR-EVENTTYPE-007 | EventType | — | 8.1 decisión #17 |
| NFR-DATA-006 | FR-ADMIN-006 | UC-ADMIN-006 | BR-SERVICE-005 | ServiceCategory | — | 8.1 decisión #18 |
| NFR-DATA-007 | FR-REVIEW-003 | UC-REVIEW-003 | BR-REVIEW-005 | Review, AdminAction | — | 8.1 decisión #11 |
| NFR-DATA-008 | FR-ATTACH-003 | UC-ATTACH-* | BR-PRIVACY-011 | Attachment | — | 8.1 decisión #19 |
| NFR-DATA-009 | FR-AI-012 | UC-AI-* | BR-AI-001 | AIRecommendation | All AI | 4-BR §AI |
| NFR-DATA-010 | FR-BOOKING-* | UC-BOOKING-* | BR-BOOKING-009 | BookingIntent | — | 8.1 decisión #5 |
| NFR-DEMO-001..006 | FR-DEMO-001 | — | BR-SEED-* | All seed | All AI | 3-MVP §14.4 |
| NFR-DEPLOY-001..005 | — | — | (despliegue) | — | — | 3-MVP §9.4 |

> **Nota:** los IDs de UC y FR usados aquí siguen la nomenclatura de los documentos 8 y 9. En los casos donde un FR/UC no tiene ID exacto, la trazabilidad es por nombre de feature/regla.

---

## 27. Criterios de validación por categoría NFR

| NFR Category | Validation Criteria ID | Criteria | Related NFR |
| --- | --- | --- | --- |
| Performance | VC-PERF-001 | Dado un endpoint no-IA bajo carga normal de demo, cuando se mide su latencia, entonces P95 ≤ 1.5 s. | NFR-PERF-001 |
| Performance | VC-PERF-002 | Dada una llamada IA con streaming activo, cuando se mide su latencia, entonces P95 ≤ 8 s. | NFR-PERF-002 |
| Security | VC-SEC-001 | Dado un usuario sin sesión, cuando intenta acceder a un endpoint protegido, entonces el sistema responde 401. | NFR-SEC-001 |
| Security | VC-SEC-002 | Dado un usuario con rol incorrecto, cuando intenta acceder a un endpoint reservado a otro rol, entonces el sistema responde 403. | NFR-SEC-002 |
| Security | VC-SEC-003 | Dado un organizador que intenta acceder al evento de otro organizador, cuando hace la solicitud, entonces el acceso es denegado. | NFR-SEC-003 |
| Security | VC-SEC-004 | Dado un intento de registro o login sin token captcha válido, cuando se envía la solicitud, entonces el sistema rechaza la operación. | NFR-SEC-004 |
| Privacy | VC-PRIV-001 | Dado un payload IA, cuando se envía al LLM, entonces solo contiene los campos estrictamente necesarios documentados en `prompts/`. | NFR-PRIV-003 |
| Reliability | VC-REL-001 | Dada una solicitud IA que excede 60 000 ms, cuando se alcanza el timeout, entonces el sistema deja de esperar y muestra error controlado o usa `MockAIProvider` en modo demo/testing. | NFR-REL-001, NFR-AI-003 |
| Reliability | VC-REL-002 | Dada una `Quote` cuyo `valid_until` pasó, cuando se ejecuta el job de expiración, entonces su estado cambia a `expired`. | NFR-REL-004 |
| Reliability | VC-REL-003 | Dado un evento cuyo `event_date` ocurrió hace ≥ 2 días, cuando se ejecuta el job de auto-completion, entonces el evento queda en estado `completed` con `auto_completed=true`. | NFR-REL-005, NFR-DATA-002 |
| Usability | VC-USAB-001 | Dada una sugerencia IA renderizada en la UI, cuando el usuario la observa, entonces es visualmente distinguible de un dato confirmado (badge, color o label). | NFR-USAB-002, NFR-AI-009 |
| Accessibility | VC-A11Y-001 | Dado un flujo crítico (login, creación de evento, comparación de cotizaciones), cuando se navega solo con teclado, entonces todos los controles son accesibles. | NFR-A11Y-002 |
| i18n | VC-I18N-001 | Dado un usuario con idioma preferido `es-ES`, cuando inicia sesión, entonces la UI se renderiza en español España. | NFR-I18N-001, NFR-I18N-002 |
| i18n | VC-I18N-002 | Dado un evento creado con `currency_code='GTQ'`, cuando el organizer edita el evento, entonces no puede cambiar la moneda. | NFR-I18N-005, NFR-DATA-001 |
| AI | VC-AI-001 | Dado un plan IA generado, cuando se persiste, entonces `AIRecommendation` contiene `prompt_version_id`, `payload`, `accepted=false`, `fallback_used` y `timeout_ms`. | NFR-AI-004 |
| AI | VC-AI-002 | Dado un payload IA inválido, cuando se procesa, entonces el sistema reintenta una vez y, si vuelve a fallar, usa fallback. | NFR-AI-005 |
| AI | VC-AI-003 | Dado `LLM_PROVIDER=mock`, cuando se invoca cualquier feature IA, entonces se usa `MockAIProvider` y produce salida determinista. | NFR-AI-007, NFR-AI-008 |
| Testability | VC-TEST-001 | Dado el reporte de cobertura del CI, cuando se ejecuta el pipeline, entonces la cobertura en lógica crítica de negocio es ≥ 50%. | NFR-TEST-001 |
| Observability | VC-OBS-001 | Dada cualquier acción admin (aprobar vendor, eliminar reseña, ver evento), cuando se ejecuta, entonces se registra una fila en `AdminAction`. | NFR-OBS-001 |
| Data integrity | VC-DATA-001 | Dado un evento con `QuoteRequest` activas en una categoría, cuando se intenta crear la sexta solicitud activa, entonces el sistema la rechaza. | NFR-DATA-004 |
| Data integrity | VC-DATA-002 | Dado un `EventType` con eventos asociados, cuando un admin intenta hard delete, entonces el sistema lo rechaza; el soft delete sí se permite. | NFR-DATA-005 |
| Data integrity | VC-DATA-003 | Dada una reseña eliminada por admin, cuando se completa la acción, entonces queda con `status='removed'`, datos de moderación y entrada en `AdminAction`. | NFR-DATA-007 |
| Data integrity | VC-DATA-004 | Dado un attachment eliminado, cuando la acción se completa, entonces su `status='deleted'` con `deleted_at`, `deleted_by` y `deletion_reason`. | NFR-DATA-008 |
| Demo readiness | VC-DEMO-001 | Dado un repositorio limpio, cuando se ejecuta el comando seed, entonces se crean usuarios, eventos en distintos estados, cotizaciones, reseñas y categorías sin duplicar al reejecutarse. | NFR-DEMO-001, NFR-DEMO-003 |
| Deployment | VC-DEPLOY-001 | Dado `LLM_PROVIDER=mock` sin `OPENAI_API_KEY` configurada, cuando se inicia la app, entonces arranca correctamente y la IA usa el mock. | NFR-DEPLOY-003 |

---

## 28. Riesgos no funcionales y mitigaciones

| Risk ID | Risk | Impact | Probability | Mitigation | Related NFR |
| --- | --- | --- | --- | --- | --- |
| RISK-NFR-001 | Falla o latencia alta del proveedor IA durante la demo. | High | Medium | Timeout 1 min + fallback a `MockAIProvider` + plantillas estáticas. | NFR-REL-001, NFR-AI-003, NFR-DEMO-004 |
| RISK-NFR-002 | Pobre calidad de salida IA (alucinaciones, formato inválido). | Medium | Medium | Prompts versionados, JSON schema validation, reintento + fallback, validación humana obligatoria. | NFR-AI-004, NFR-AI-005, NFR-AI-001 |
| RISK-NFR-003 | Acceso no autorizado entre usuarios (organizer ve evento ajeno, vendor ve cotización ajena). | High | Low | Tests de autorización + ownership checks en API. | NFR-SEC-002, NFR-SEC-003, NFR-TEST-005 |
| RISK-NFR-004 | Bots automatizados en registro/login. | Medium | Medium | Captcha/anti-bot obligatorio. | NFR-SEC-004, NFR-TEST-006 |
| RISK-NFR-005 | Datos seed inconsistentes que rompen demo. | High | Medium | Seed idempotente + verificación post-seed en CI. | NFR-DEMO-003, NFR-MAINT-005 |
| RISK-NFR-006 | Demo se rompe en el día de evaluación (URL caída, key expirada). | High | Low | `.env.example` documentado + modo mock disponible sin keys reales. | NFR-DEPLOY-002, NFR-DEPLOY-003 |
| RISK-NFR-007 | Traducciones faltantes generan UI inconsistente. | Medium | Medium | Cobertura de 4 idiomas validada antes de demo + fallback al idioma por defecto. | NFR-I18N-001 |
| RISK-NFR-008 | Inconsistencia de moneda entre eventos. | Medium | Low | Moneda inmutable + display sin conversión automática. | NFR-I18N-005, NFR-DATA-001 |
| RISK-NFR-009 | Overengineering — agregar features enterprise no requeridas. | Medium | Medium | Guardrails explícitos en NFR-OOS y revisión PR contra MVP scope. | (transversal) |
| RISK-NFR-010 | Scope creep hacia marketplace transaccional. | High | Medium | NFR-OOS-001/002/003 + decisiones PO documentadas. | NFR-OOS-001..015 |
| RISK-NFR-011 | Errores no controlados que dejen UI en estado roto. | Medium | Medium | Manejo controlado obligatorio + tests de paths de error. | NFR-REL-002, NFR-OBS-002 |
| RISK-NFR-012 | Auditoría faltante en eliminaciones o moderación. | High | Low | `AdminAction` obligatorio + soft delete para reseñas/attachments. | NFR-OBS-001, NFR-DATA-007, NFR-DATA-008 |
| RISK-NFR-013 | Attachments eliminados quedan accesibles por URL antigua. | Medium | Medium | Soft delete + filtro en API de descarga. | NFR-DATA-008 |
| RISK-NFR-014 | Dashboard admin se vuelve demasiado complejo y lento. | Medium | Low | Métricas limitadas a actividad/gobernanza/IA/demo (no comerciales) + paginación. | NFR-PERF-004, 8.1 decisión #10 |
| RISK-NFR-015 | Falta de cobertura de tests críticos. | Medium | Medium | Target ≥ 50% lógica crítica + tests obligatorios para reglas listadas en NFR-TEST-002. | NFR-TEST-001, NFR-TEST-002 |

---

## 29. Supuestos, restricciones y dependencias

**Supuestos**

- Se asume que el evaluador académico puede acceder a la URL pública del demo durante la presentación.
- Se asume disponibilidad razonable del proveedor IA (OpenAI) durante la demo; si no, se conmuta a `MockAIProvider`.
- Se asume que el seed cubre el volumen suficiente para demostrar los flujos principales sin necesidad de datos reales.
- Se asume que los navegadores objetivo son evergreen (Chrome, Firefox, Edge, Safari).

**Restricciones**

- Sin app móvil nativa en MVP.
- Sin pagos reales, contratos firmados ni comisiones.
- Sin chat en tiempo real, WhatsApp ni push nativo.
- Sin conversión de monedas ni cumplimiento legal formal por país.
- `AnthropicProvider` queda como stub; el funcional MVP es OpenAI + Mock.

**Dependencias**

- Variables de entorno: `LLM_PROVIDER`, `OPENAI_API_KEY` (cuando `LLM_PROVIDER=openai`), `AI_TIMEOUT_MS`, `DATABASE_URL`, secretos de autenticación, claves de captcha (o flag de test).
- Servicio captcha (reCAPTCHA, hCaptcha o equivalente) — debe tener modo test/mock para CI.
- Hosting cloud (Vercel + Render/Railway/Supabase o equivalente).
- Catálogos de seed (EventType, ServiceCategory) versionados en el repo.

---

## 30. Preguntas abiertas o decisiones pendientes

Las 19 decisiones pendientes del addendum `8.1` están **resueltas** y se incorporaron al NFR.

Quedan algunas preguntas técnicas no bloqueantes que pueden cerrarse durante implementación (notadas en `8.2` §10.1):

| Pregunta | Categoría NFR potencialmente afectada | Marca |
| --- | --- | --- |
| ¿Qué modelo OpenAI (flagship vs. mini) por feature IA? | NFR-PERF-002, NFR-AI-003 | Requires technical decision (no bloqueante) |
| ¿Se persiste `AIRecommendation(quote_comparison)` o se regenera on-demand? | NFR-AI-004 | Requires technical decision |
| ¿Estrategia de caché para salidas IA repetidas? | NFR-PERF-006, NFR-AI-004 | Requires Product Owner Decision (rate limit + UX implications) |
| ¿Límite de regeneraciones por feature por usuario por día? | NFR-PERF-006 | Requires Product Owner Decision |
| ¿La priorización de tareas se calcula on-load o on-demand? | NFR-PERF-001 | Requires technical decision |
| ¿Plantillas estáticas viven en código o en `AIPromptVersion`? | NFR-AI-010, NFR-REL-001 | Requires technical decision |

---

## 31. Checklist de readiness no funcional

- [ ] Performance básica validada para flujos principales (login, dashboard, directorio, comparación).
- [ ] Auth y RBAC validados con tests de roles y ownership.
- [ ] Captcha/anti-bot habilitado en registro y login, con flag de test en CI.
- [ ] AI timeout de 1 minuto configurado vía `AI_TIMEOUT_MS=60000` y testeado.
- [ ] `MockAIProvider` disponible para demo/testing y determinista en CI.
- [ ] `OpenAIProvider` funcional con API key configurada en entornos productivos/demo.
- [ ] `AnthropicProvider` presente como stub sin uso funcional en MVP.
- [ ] Manejo de errores controlado en todos los flujos críticos.
- [ ] Seed reproducible con un solo comando, idempotente y poblando estados variados.
- [ ] 4 idiomas (es-LATAM, es-ES, pt, en) configurados y testeados.
- [ ] Moneda inmutable validada por test sobre `Event`.
- [ ] Conversión automática de moneda explícitamente ausente del producto.
- [ ] Auditoría de reseñas eliminadas en `AdminAction` documentada y probada.
- [ ] Soft delete de attachments con metadata (`deleted_at`, `deleted_by`, `deletion_reason`) implementado.
- [ ] Admin actions trazables en `AdminAction` para todas las acciones administrativas relevantes.
- [ ] Auto-completion de evento 2 días después de `event_date` operativa y auditable.
- [ ] Expiración automática de `Quote` operativa (`valid_until` + job).
- [ ] Máximo 5 `QuoteRequest` activas por categoría/evento aplicado.
- [ ] Jerarquía de categorías limitada a 2 niveles.
- [ ] `EventType` no eliminable si tiene eventos asociados.
- [ ] Cobertura de tests ≥ 50% lógica crítica, idealmente ≥ 60%.
- [ ] `.env.example` con todas las variables necesarias, sin secretos reales.
- [ ] README con pasos de setup, seed y modo demo documentados.
- [ ] Métricas del admin dashboard limitadas a actividad/gobernanza/IA/demo (no comerciales).
- [ ] Restricciones out-of-scope validadas: sin pagos reales, sin app móvil, sin chat real-time, sin WhatsApp, sin conversión de moneda, sin moderación IA.
- [ ] Demo guiada de 10–15 min ensayada cubriendo los flujos principales.

---

## 32. Resumen final

EventFlow MVP cumple sus NFRs cuando:

1. La IA opera bajo timeout de 1 minuto con fallback a `MockAIProvider` y validación humana obligatoria.
2. La seguridad básica (autenticación, RBAC, ownership, captcha/anti-bot) está implementada y testeada.
3. La privacidad se garantiza por minimización de datos en la app y en los prompts IA, sin compliance legal formal.
4. La integridad de datos respeta las decisiones del addendum 8.1: moneda inmutable, auto-completion a 2 días, validez de cotización 15 días, máximo 5 `QuoteRequest` activas, soft delete de reseñas/attachments, jerarquía de categorías ≤ 2 niveles, no hard delete de `EventType` con eventos asociados.
5. La internacionalización soporta es-LATAM, es-ES, pt y en, con moneda configurada al crear el evento y sin conversión automática.
6. El demo es reproducible en un comando, con seed determinista y soporte para modo `MockAIProvider` sin API keys reales.
7. La trazabilidad operativa funciona vía `AdminAction`, `AIRecommendation` y logs estructurados.
8. Quedan claramente separados los NFRs MVP de los Future (sincronización con calendarios, AnthropicProvider funcional, KYC, certificación WCAG AA) y Out of Scope (pagos reales, app nativa, chat real-time, conversión de monedas, moderación IA).
9. El stack y la operación están alineados con un MVP académico — sin observabilidad enterprise, sin multi-región, sin Kubernetes — pero con observabilidad práctica suficiente para demo y QA.

Con estos NFRs, EventFlow está listo para generar User Stories, Acceptance Criteria, tareas técnicas, plan de pruebas, decisiones de arquitectura y checklist de readiness para la presentación del Master Final Project.
