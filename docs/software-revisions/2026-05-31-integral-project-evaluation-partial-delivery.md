# Revisión integral — entrega parcial (curso IA en desarrollo)

| Campo | Valor |
|-------|--------|
| **Fecha** | 2026-05-31 |
| **Alcance** | Lo implementado (sin Mongo HU-015 ni IA funcional HU-009/010/016) |
| **Tipo** | Evaluación arquitectónica + calidad (solo análisis, sin cambios en código) |

---

## Prompt

> tengo que hacer una entrega parcial del proyecto; es para un curso profesional de uso de IA en el desarrollo; en el curso se evalua el proyecto desarrollado de forma integral y se exige que cumpla con altos estándares de calidad. Actua como un arquitecto de sofware con experiencia en microservicios y vue que sigue las buenas practicas de la industria y evalua el proyecto en su conjunto del 1 al 5; No tengas en cuenta las cosas no implementadas (Mongo e IA) sino lo ya hecho. Quiero que evalúes: 1.- Diseño del sistema general 2.- Diseño de los microservicios 3.- Implementación java en Spring 4 .- implementación del frontend 5.- Uso de la IA 6.- Documentación (si echas en falta algun otro aspecto dimelo y analizalo también) No modifiques nada solo analiza estos aspectos puntuando

---

## Respuesta

### Alcance de esta revisión

**Alcance de esta revisión:** lo implementado y operativo (catálogo, media, notificaciones, gateway, SPA, infra local, observabilidad básica, tests). **Fuera de alcance** a propósito: Mongo (**HU-015**), IA funcional (**HU-009/010/016**), `ai-assistant-service` como esqueleto.

**Escala:** 1 = insuficiente para estándares profesionales · 5 = referencia de industria para un MVP académico/profesional bien ejecutado.

---

### 1. Diseño del sistema general — **4,5 / 5**

**Fortalezas**

- Arquitectura **clara y coherente** con el producto: SPA Vue → **API Gateway** → microservicios por contexto (`catalog`, `media`, `notification`), identidad en **Keycloak**, datos transaccionales en **PostgreSQL** por esquema, objetos en **MinIO**, desacoplamiento asíncrono con **Kafka** (`catalog.ejemplar.evento` → notificaciones).
- **Defensa en profundidad** en seguridad: JWT validado en gateway y revalidado en servicios (token relay documentado en [jwt-gateway-strategy.md](../security/jwt-gateway-strategy.md)).
- Contrato único hacia cliente ([openapi.yaml](../api/openapi.yaml)), errores **RFC 9457**, correlación `X-Correlation-Id` en gateway y servicios MVC.
- **Monorepo** legible: `frontend/`, `services/`, `infra/compose/`, `docs/`, `platform/observability/`, scripts de desarrollo.
- Decisiones explícitas en **ADRs** (claves numéricas, nomenclatura HTTP/persistencia, observabilidad, auditoría catálogo).
- Diagramas C1, casos de uso, backlog por épicas y tabla de flujos de arranque en [readme.md](../../readme.md) — adecuado para evaluación integral de un curso.

**Limitaciones (sin penalizar lo no pedido)**

- Descubrimiento **estático** (URIs en gateway); correcto para MVP/local, no para producción elástica sin más ADR.
- **HU-011** (maestros admin) está implementada según tickets “Hecho”, pero el [backlog.md](../backlog/backlog.md) aún la marca “Pendiente” — desalineación documental, no de arquitectura.
- Sin pipeline CI visible en `.github/workflows` (véase aspecto adicional más abajo).

**Veredicto:** diseño maduro para un MVP con intención didáctica de microservicios; no es sobre-ingeniería gratuita y sí trazable a historias de usuario.

---

### 2. Diseño de los microservicios — **4,5 / 5**

**Fortalezas**

- **Bounded contexts** respetados: catálogo (ejemplar + taxonomía + público), media (presign/confirm/galería), notificaciones (suscripción + consumo eventos + envíos).
- **Plantilla de paquetes** uniforme (`controller` → `application` → `domain` / `infrastructure`) documentada en [spring-boot-4-backend.mdc](../../.cursor/rules/spring-boot-4-backend.mdc) y aplicada; `catalog-service` como referencia.
- Responsabilidades bien repartidas: el catálogo **publica eventos**; notificaciones **persiste idempotencia** (`EVENTO_CATALOGO`) y orquesta envíos; media **no duplica** reglas de visibilidad del árbol (consulta permisos al catálogo).
- Gateway acotado a **enrutado, seguridad perimetral, CORS y correlación** — acorde a microservices-patterns.
- Persistencia **Flyway por servicio**, esquemas separados en una misma BD `mtl` — pragmático para desarrollo y curso.

**Limitaciones**

- Integración **síncrona** media↔catálogo (aceptable en MVP; acoplamiento operativo a documentar en entrega).
- `ai-assistant-service`: solo arranque Spring; coherente con “no evaluar IA”.
- Tests de integración **desiguales** entre servicios (notificaciones y catálogo más fuertes que media en capa IT).

**Veredicto:** partición y fronteras de microservicio al nivel que se espera en un curso avanzado con estándares altos.

---

### 3. Implementación Java (Spring) — **4 / 5**

**Fortalezas**

- Stack actual y disciplinado: **Spring Boot 4**, **Java 21**, JPA, validación en borde, **MapStruct/Lombok** con convenciones, **Actuator + Micrometer + logs JSON**.
- Calidad de código alineada a reglas del repo: no exponer entidades en API, `ProblemDetail`, roles `ROLE_*`, perfiles `dev`/`test`/`testIT` bien separados.
- **catalog-service** es el núcleo más completo: alta/edición/baja, consulta pública, taxonomía admin, Kafka, caché Redis, consultas nativas (`unaccent`), auditoría R3.
- **notification-service**: pipeline Kafka + idempotencia + restricciones CHECK en IT — demuestra dominio real, no CRUD vacío.
- **media-service**: flujo presign/PUT/confirm y políticas de subida bien acotadas.
- Estrategia de pruebas backend seria (Surefire/Failsafe, Testcontainers donde aporta, `system-e2e-tests` para HU-001 vía gateway).

**Limitaciones**

- Algunos **IT redundantes** (`contextLoads` duplicados) y cobertura IT más fina en media.
- **CI automatizado** para `mvn verify` + E2E back no cerrado en repo (riesgo en evaluación “integral” del curso).
- Resiliencia del proxy gateway (timeouts, 502) documentada como roadmap más que cerrada.

**Veredicto:** implementación sólida y mantenible; un punto por debajo del diseño por automatización y pulido transversal de tests/ops.

---

### 4. Implementación del frontend (Vue) — **4 / 5**

**Fortalezas**

- **Vue 3 + TypeScript + Composition API**, cliente HTTP con `HttpError`/`Problem`, **OIDC** con roles desde JWT, **i18n** en flujos con errores.
- **Router** con guards por `requiresAuth` y `requiredRoles`; tests dedicados (HU-001/013 en cliente).
- Lógica de negocio en **composables** (`useCreateTreeForm`, `useEditTreeForm`, suscripción pública, admin suscripciones, subida de fotos) con **172 tests Vitest** pasando.
- Separación **servicios** (API) vs **UI**; `publicApiFetch` sin Bearer donde corresponde.
- Vistas admin y flujos colaborador alineados con backlog cerrado (alta, edición, listados, maestros, suscripciones).

**Limitaciones**

- Cobertura **desigual en vistas** (mucho peso en composables — correcto en principio, pero listados/detalle público con pocos tests de integración UI).
- Sin **E2E navegador** en el repo (aceptable si el curso valora Vitest + E2E back; conviene explicarlo en la memoria).
- Router: faltan casos de **refresh silencioso** y rutas colaborador con sesión en tests.

**Veredicto:** frontend profesional para MVP; la lógica crítica está probada; la capa “shell” y E2E UI son el hueco principal.

---

### 5. Uso de la IA — **4 / 5**

**Fortalezas (gobierno del desarrollo asistido)**

- Ecosistema **Cursor** muy bien planteado para un curso de IA en desarrollo:
  - [AGENTS.md](../../AGENTS.md) + [canonical-sources.md](../engineering/canonical-sources.md) (una fuente por tema).
  - Reglas `.cursor/rules/*` por capa (API, seguridad, Spring, Kafka, frontend).
  - **Skills** operativos: encargo, refinamiento HU, breakdown, DB.
  - [ai-development-playbook.md](../onboarding/ai-development-playbook.md): flujo HU → refinamiento → tickets → implementación → PR.
- **ADR-0003** documenta el refinamiento de reglas para evitar deriva entre IA y docs.
- Mensaje de producto sobre **IA orientativa** en reglas de producto (coherente con readme, aunque la feature IA no esté entregada).

**Limitaciones (importantes para la evaluación del curso)**

- La **infraestructura para usar IA bien** está al 4,5; la **demostrabilidad en la entrega** depende de evidencias externas al código: PRs con trazabilidad HU/TASK, prompts/skills usados, revisión humana — no siempre visibles solo leyendo el repo.
- Riesgo de **sobre-documentación** generada/asistida: hay que demostrar criterio (qué se aceptó/rechazó), no solo volumen de markdown.
- Backlog vs código (p. ej. HU-011) sugiere que conviene **una pasada humana de cierre** antes de la entrega.

**Veredicto:** uso de IA **por encima de la media** en estructura y gobernanza; la nota en el curso subirá si la memoria/PRs muestran supervisión, no solo generación.

---

### 6. Documentación — **4,5 / 5**

**Fortalezas**

- [readme.md](../../readme.md) como **documento de entrega** muy completo (producto, arquitectura, modelo, API, HUs, instalación).
- `docs/` estructurado: backlog, desgloses por HU, OpenAPI, modelo de datos, Kafka, seguridad, testing Java/frontend, onboarding, ADRs.
- Enlaces cruzados entre **infra**, **services/README** y guías de prueba — reduce fricción para corrección.
- Plantillas de PR en `.github/`.

**Limitaciones**

- **Inconsistencias puntuales** (estados en `backlog.md` vs tickets “Hecho”).
- readme muy extenso: excelente para corrección, pero un **resumen ejecutivo de 2 páginas** ayudaría al evaluador del curso.
- Contrato OpenAPI con tags `ai` aún presentes aunque la funcionalidad no esté — coherente como contrato futuro, pero hay que aclararlo en la entrega.

**Veredicto:** documentación de nivel alto para proyecto académico-profesional; pequeño descuento por sincronización y síntesis.

---

### Aspectos adicionales recomendados

| Aspecto | Nota | Comentario breve |
|--------|------|------------------|
| **Aseguramiento de calidad (tests)** | **4 / 5** | Backend y frontend con estrategia explícita; E2E sistema (`system-e2e-tests`) bien orientado; falta CI que los ejecute siempre. |
| **DevOps / automatización** | **3 / 5** | Compose, scripts PowerShell y observabilidad local fuertes; **sin workflows GitHub Actions** visibles — hueco claro para “estándares altos” en entrega integral. |
| **Experiencia de desarrollo local** | **4,5 / 5** | `.env.example`, puertos documentados, perfiles `dev`, Mailpit, reset Flyway, guías de arranque por flujo. |
| **Seguridad y privacidad** | **4 / 5** | JWT, roles, rutas públicas acotadas, enmascaramiento en errores de correo; falta endurecer actuator en prod (documentado). |

---

### Cuadro resumen

| # | Dimensión | Nota |
|---|-----------|------|
| 1 | Diseño del sistema general | **4,5** |
| 2 | Diseño de microservicios | **4,5** |
| 3 | Implementación Java (Spring) | **4** |
| 4 | Implementación frontend (Vue) | **4** |
| 5 | Uso de la IA | **4** |
| 6 | Documentación | **4,5** |
| + | Calidad / tests (transversal) | **4** |
| + | DevOps / CI | **3** |

**Nota global orientativa para entrega parcial: 4,2 / 5**

---

### Mensaje para el evaluador del curso

El proyecto demuestra **arquitectura de microservicios real** (no solo carpetas): contrato HTTP, seguridad OIDC de extremo a extremo, eventos Kafka, almacenamiento de objetos y tres dominios implementados con tests significativos y documentación extensa. Está **por encima de un TFG típico** en trazabilidad y normas. Para subir a **4,5–5 en conjunto** en la corrección final: (1) alinear backlog con estado real, (2) añadir **CI** mínimo (`mvn verify`, `npm test`, opcional E2E con Docker), (3) memoria breve que explique **cómo se usó la IA** (skills, revisión humana, límites), (4) un **demo script** de 10 minutos que recorra flujos cerrados (público → alta colaborador → foto → correo Mailpit → admin).
