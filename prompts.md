> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.

> 📎 Registro completo de prompts con metadatos: [prompts/00-all-prompts.md](prompts/00-all-prompts.md)

## Índice

- [Índice](#índice)
- [1. Descripción general del producto](#1-descripción-general-del-producto)
- [2. Arquitectura del Sistema](#2-arquitectura-del-sistema)
  - [**2.1. Diagrama de arquitectura:**](#21-diagrama-de-arquitectura)
  - [**2.2. Descripción de componentes principales:**](#22-descripción-de-componentes-principales)
  - [**2.3. Descripción de alto nivel del proyecto y estructura de ficheros**](#23-descripción-de-alto-nivel-del-proyecto-y-estructura-de-ficheros)
  - [**2.4. Infraestructura y despliegue**](#24-infraestructura-y-despliegue)
  - [**2.5. Seguridad**](#25-seguridad)
  - [**2.6. Tests**](#26-tests)
  - [3. Modelo de Datos](#3-modelo-de-datos)
  - [4. Especificación de la API](#4-especificación-de-la-api)
  - [5. Historias de Usuario](#5-historias-de-usuario)
  - [6. Tickets de Trabajo](#6-tickets-de-trabajo)
  - [7. Pull Requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1** — Generación del meta-prompt para documentación técnica:
```
Genera un prompt especializado para IA (meta prompt) en base al archivo initial.md y guarda este
prompt en un archivo llamado master-prompt-docs.md dentro de la carpeta prompts de la raiz del proyecto
```
> 📋 2026-06-09 · VS Code · Claude Opus 4.6 · rodri
> Resultado: prompts/master-prompt-docs.md — meta-prompt con rol, contexto, misión y restricciones

**Prompt 2** — Ejecución del plan de documentación completa:
```
ejecuta el plan de master-prompt-docs-plan.md
```
> 📋 2026-06-10T07:08:35Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: docs/documentacion.md completo (descripción, Lean Canvas, 8 CU, modelo ER, arquitectura, C4)

**Prompt 3** — Análisis de coherencia del proyecto:
```
Analiza readme.md y verifica que el proyecto tiene coherencia, en especial con los archivos de
documentación como documentacion.md, data-model.md y si no tiene coherencia indica por qué y un
plan para corregir. Me interesa también que el modelo de datos soporte todas las funcionalidades
principales y que la documentación sea coherente
```
> 📋 2026-06-10T07:57:23Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: 7 inconsistencias detectadas y corregidas (fixs/issue-001.md)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1** — Generación de diagramas C4 y arquitectura:
```
ejecuta el plan de master-prompt-docs-plan.md
```
> 📋 2026-06-10T07:08:35Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Diagramas C4 (Contexto, Contenedores, Componentes) en Mermaid dentro de docs/documentacion.md

**Prompt 2** — Corrección de errores en diagramas Mermaid:
```
Revisa y corrige el archivo documentacion.md generado recién, tiene algunos errores como este:
**Unable to render rich display**
Parse error on line 24:...de reserva S-->>Note over S: Notific---^
```
> 📋 2026-06-10T07:14:46Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Sintaxis Mermaid corregida en todos los diagramas de secuencia

### **2.2. Descripción de componentes principales:**

**Prompt 1** — Mismo prompt de ejecución del plan (sección 4 del plan incluía arquitectura):
```
ejecuta el plan de master-prompt-docs-plan.md
```
> Generó la sección "Diseño del Sistema a Alto Nivel" con capas, servicios de dominio e integraciones externas

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1** — Bootstrap de la Entrega 2 (análisis y documentación permanente):
```
Analiza y ejecuta c:\repo\ai4devs\AI4Devs-finalproject\prompts\MASTER_BOOTSTRAP_PROMPT.md
```
> 📋 2026-07-14 · Claude Code CLI · Claude Fable 5 · rodri
> Resultado: informe de inconsistencias (fixs/issue-004.md), documentos permanentes (PROJECT_STATUS, DEVELOPMENT_PLAN, ARCHITECTURE, CONTRIBUTING, PROMPT_REGISTRY) y skill prompt-registry

**Prompt 2** — Cambio de stack tecnológico:
```
Modifica los archivos ai-specs/agents/backend-developer.md, ai-specs/agents/frontend-developer.md,
docs/backend-standards.md, docs/frontend-standards.md para que adopten el stack tecnológico de este
proyecto, que es: netcore 10 C#, base de datos PostgreSQL, Angular 20.
```
> 📋 2026-06-09 · VS Code · rodri
> Resultado: 4 archivos de estándares actualizados al stack definitivo (.NET Core 10 / Angular 20 / PostgreSQL)

### **2.4. Infraestructura y despliegue**

**Prompt 1** — Fase 0: fundaciones de infraestructura (desbloqueada por las decisiones de issue-004 §E):
```
continua
```
> 📋 2026-07-14T21:30:00Z · Claude Code CLI · Claude Fable 5 · medium · rodri
> Resultado: docker-compose (PostgreSQL 16 + PostGIS, MinIO), scaffolding .NET 10 por capas + Angular 20, Dockerfiles y CI de GitHub Actions (build + tests obligatorios en cada PR) — registro completo en [prompt 46](prompts/00-all-prompts.md)

**Prompt 2** — Configuración segura de credenciales por entorno:
```
Pasemos al sandbox. Donde dejo la API KEY y la Secret Key ? Ojo que esto no debe quedar en github por seghuridad ni tampoco en el odigo fuente pero debe funcionar para que probemos en local y si se publica en produccion
```
> 📋 2026-07-16T22:30:00Z · Claude Code · Claude Fable 5 · medium · rodri
> Resultado: user-secrets (UserSecretsId en csproj) / appsettings.Development.json gitignored en local, `.env` + variables `Flow__*` en docker-compose (`.env.example` documentado), variables de entorno en producción — las claves nunca tocan el repo

**Prompt 3** — Seed de imágenes en Object Storage:
```
Crea un seed de imágenes en MinIO desde picsum.photos para que la vitrina tenga imágenes de muestra sin problemas de copyright.
```
> 📋 2026-07-15T00:00:00Z · Copilot CLI · Claude Opus 4.6 · medium · rodri
> Resultado: perfil `seed-images` en docker-compose + script `scripts/seed-images.ps1` idempotente

### **2.5. Seguridad**

**Prompt 1** — Validación real de la integración de pagos (destapó dos hallazgos de seguridad/robustez):
```
listo, lo hice con la alternativa del appsettings.development, ahora podemos probar?
```
> 📋 2026-07-16T23:00:00Z · Claude Code · Claude Fable 5 · medium · rodri
> Resultado: detectado y corregido secret JWT débil (<256 bits, IDX10720) y bug de FK en la limpieza de holds expirados con pago iniciado (bloqueaba reservas del artista); firma HMAC-SHA256 del FlowClient validada contra sandbox real

**Prompt 2** — Confirmación de pago con webhook autenticado:
```
listo, pagué con la tarjeta de prueba, confirma el pago
```
> 📋 2026-07-16T23:45:00Z · Claude Code · Claude Fable 5 · medium · rodri
> Resultado: verificado que `POST /payments/confirm` es seguro e idempotente — el token por sí solo no otorga nada: el estado se consulta a Flow con petición firmada antes de confirmar la reserva

### **2.6. Tests**

**Prompt 1** — TDD con tests de integración reales (patrón de todas las US):
```
Implementa el TASK0001 de US0003: endpoint GET /api/showcase con secciones dinámicas y PostGIS para geolocalización. Sigue TDD.
```
> 📋 2026-07-14T22:00:00Z · Copilot CLI · Claude Opus 4.6 · medium · rodri
> Resultado: 7 tests de integración con TestContainers (PostgreSQL/PostGIS real) escritos antes de la implementación — el patrón se repitió en las 13 US hasta llegar a 235 tests (109 backend + 126 frontend)

**Prompt 2** — Hermeticidad de la suite descubierta al activar el sandbox:
```
listo, cuando pasen los tests continúa con el push y PR
```
> 📋 2026-07-17T00:30:00Z · Claude Code · Claude Fable 5 · medium · rodri
> Resultado: 5 PaymentTests fallaron porque cargaban el appsettings.Development.json local (con Flow real) — corregidos forzando `Flow:UseMock=true` en la factory de tests; la suite ya no depende de la configuración local del desarrollador

---

### 3. Modelo de Datos

**Prompt 1** — Creación del modelo de datos completo:
```
Analiza data-model-sample.md y usalo para crear data-model.md con la misma estructura pero basado
en el proyecto de INK-LINK con la documentación sobre el proyecto
```
> 📋 2026-06-10T07:42:48Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: docs/data-model.md con 13 entidades, campos, validaciones, relaciones y diagrama ER Mermaid

**Prompt 2** — Corrección de inconsistencias en el modelo:
```
Ejecutalo
```
> 📋 2026-06-10T08:10:01Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Campo cancelled_at agregado a Booking, eliminada entidad Notification, alineación con Won't-Have

---

### 4. Especificación de la API

**Prompt 1** — Regeneración de la especificación API (sesión 4):
```
(continuación de sesión anterior — ejecución de fixs/issue-002.md pasos 1-5)
```
> 📋 2026-06-10 · VS Code · Claude Opus 4.6 · rodri
> Resultado: docs/api-spec.yml regenerado a partir de las historias de usuario (auth, artists, bookings, reviews, payments, geo)

**Prompt 2** — Sincronización definitiva de la spec (decisiones de issue-004 §E):
```
1. Si, 2. Agregalo como alcance del MVP, 3. Lo que sea mas coherente y atinente al proyecto, 4. Si,
5. Deja el modelo como recomendado, pero no obligatorio y openspec no es obligatorio pero sí se debe
considerar para el futuro hasta que aprenda a implementarlo. A menos que me des instrucciones de como
implementarlo desde ya con lo qu ya existe si es posible y no es complejo. 6. Confirmo comenzar con la
Fase 0 y luego US0001 PERO EN UNA RAMA APARTE A TODO LO DEMÁS, primero hacer commit y push de lo que
hay en una rama llamada docs/entrega2 y luego puedes comenzar con el punto 6
```
> 📋 2026-07-14T21:00:00Z · Claude Code CLI · Claude Fable 5 · medium · rodri
> Resultado: api-spec.yml v2.0.0 alineada con el backlog de 13 US y data-model (schemas, numeración de US, endpoints de pago create/confirm/return, cancelación como alcance MVP) — desde entonces es la fuente de verdad del contrato REST

**Prompt 3** — La spec como árbitro ante inconsistencias de producto:
```
listo el merge, continuemos con la US0011. Pero ojo: Creo que existe una inconsistencia en el proyecto:
Al reservar, se deja un 30% del valor...pero de que valor? o el valor es fijo por artista? 
Porque depende del tatuaje el valor, y para eso, esta también el chatbot que ayuda a cotizar, pero, si existen montos predefinidos, para que existe el chatbot? Comentame si me equivoco en esto antes de proceder
```
> 📋 2026-07-16T20:30:00Z · Claude Code · Claude Fable 5 · medium · rodri
> Resultado: la spec ya definía `QuoteResponse.depositAmount` sobre el mínimo cotizado — la decisión (depósito según cotización, `fixs/issue-007.md`) alineó el código al contrato con cambios aditivos (CA9, `factors`, `GET /styles`)

---

### 5. Historias de Usuario

**Prompt 1** — Creación del backlog completo:
```
Crea las historias de usuario del proyecto
```
> 📋 2026-06-10T08:18:56Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Plan de 20 US propuesto, refinado iterativamente a 14 US (10 Must-Have + 4 Should-Have)

**Prompt 2** — Refinamiento de scope (eliminación de panel artista):
```
**CU-02: Configurar perfil** seran datos seed.
US0014 solo el cliente vera la agenda del arista, no "entraremos" con el artista a la web por el momento, ese es un wont have por ahora
US0018 sera wont have, no la implementaremos. De hecho eliminalo de todo el proyecto
US0019 sera wont have, no se implementara en esta version
```
> 📋 2026-06-10T08:25:29Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: Backlog reducido de 20 a 14 US, Won't-Have definidos (foto curación, notificaciones, respuestas a reseñas)

**Prompt 3** — Verificación de coherencia CU ↔ US:
```
Los casos de uso que agregaste tienen coherencia con los diagramas de casos de uso?
```
> 📋 2026-06-10T17:18:29Z · VS Code · Claude Opus 4.6 · High · rodri
> Resultado: 12/14 coherentes, 2 correcciones aplicadas (US0010 → Transversal, US0014 → CU-08)

---

### 6. Tickets de Trabajo

**Prompt 1** — Generación de los tickets de trabajo de todo el backlog:
```
analiza la carpeta US y luego crea los tickets de trabajo necesarios para completarlas junto sus criterios de aceptación. Incluye que sea TDD, buenas practicas de desarrollo, etc y la logica de negocio correspondiente que se cumpla. Considera también el modelo de datos y el contexto de negocio en readme.md. Al finalizar actualiza all-prompts.md con lo que he escrito hoy en el chat.
```
> 📋 2026-06-12T11:00:00Z · VS Code · Claude Opus 4.6 · Medium · rodri
> Resultado: 25 task files distribuidos en las 13 US (backend + frontend por US) con TDD obligatorio, criterios de done y estimación — la unidad de trabajo de toda la Entrega 2

---

### 7. Pull Requests

**Prompt 1** — Cierre de US según protocolo: documentación + commit + push + PR:
```
Listo, funciona. Si hay que actualizar los archivos .md de prompts y otros archivos mrkdown luego hacer commit, push y PR creo que debemos comenzar. Luego que sigue?
```
> 📋 2026-07-16T01:45:00Z · Claude Code · Claude Fable 5 · medium · rodri
> Resultado: patrón de cierre aplicado en cada US — PROJECT_STATUS/HANDOFF/registro de prompts actualizados, suites en verde y PR a main (en este caso PR #16, US0012); 20 PRs mergeados en total

**Prompt 2** — Protocolo completo de una US en un solo ciclo (rama → TDD → verificación → PR):
```
listo el merge. Ahora continuemos con la US0014 segun el protocolo
```
> 📋 2026-07-16T03:30:00Z · Claude Code · Claude Fable 5 · medium · rodri
> Resultado: US0014 de punta a punta en 5 commits: rama feature, test rojo→verde en backend (sponsorships con relationshipType según api-spec), seed con los 3 tipos de relación, componentes frontend con 11 specs, verificación visual en dev y PR #17

**Prompt 3** — Coordinación multi-agente en una misma rama/PR:
```
recién le pedi a copilot que actualice sus prompts e hizo un push. Revisa los cambios y ve que debes commitear y hacer push igual para que se vaya todo junto
```
> 📋 2026-07-17T01:00:00Z · Claude Code · Claude Fable 5 · medium · rodri
> Resultado: trabajo de GitHub Copilot (sesión 14 del registro) y de Claude Code (sincronización de estado) reconciliados en la rama compartida `chore/sync-status-docs` y mergeados juntos en el PR #20
