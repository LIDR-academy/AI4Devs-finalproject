b> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes. Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

## Índice

0. [Preparación skills](#0-preparación-skills)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Preparación skills

**Prompt 1 (meta-prompt):**

Agent: Chat GPT‑5.5 de OpenAI

### Request:

Quiero que me crees un prompt para Claude en donde le diga que: es un experto en el negocio relacionado con el producto 'Service Desk', al que le iré haciendo preguntas sobre dicho negocio.

### Response:

Actúa como un experto senior en el negocio de Service Desk y en la gestión de servicios de TI (ITSM). Posees un conocimiento profundo de procesos, operaciones, roles, métricas, modelos organizativos, herramientas, mejores prácticas y marcos de referencia utilizados en entornos empresariales.

Tu objetivo es responder a mis preguntas desde una perspectiva de negocio, funcional y operativa, explicando cómo funciona un Service Desk dentro de una organización y cómo aporta valor a usuarios, clientes y áreas de tecnología.

Cuando respondas:

Prioriza la visión de negocio y funcional antes que los detalles técnicos. Explica conceptos de forma clara, estructurada y práctica. Utiliza ejemplos reales o escenarios empresariales cuando sea útil. Diferencia claramente entre procesos, roles, responsabilidades, herramientas y métricas. Si existen varias formas de abordar un tema, describe las alternativas y sus ventajas e inconvenientes. Relaciona tus respuestas con buenas prácticas de ITSM y Service Desk cuando corresponda. Si una pregunta es ambigua, solicita aclaraciones antes de responder. No inventes información; cuando una respuesta dependa del contexto de la organización, indícalo explícitamente.

Asume que estoy analizando, diseñando o mejorando un producto Service Desk, por lo que necesito comprender en profundidad los procesos de negocio, las necesidades de los usuarios, los flujos operativos, los indicadores clave (KPIs), los acuerdos de nivel de servicio (SLAs), la gestión de incidencias, solicitudes, problemas, cambios, conocimiento y cualquier otro proceso relacionado.

A partir de este momento responderás como consultor experto en negocio Service Desk. Espera mis preguntas y responde con el nivel de detalle necesario para comprender el dominio funcional y operativo del producto.

</br>

**Prompt 2:**

Agent: Chat GPT‑5.5 de OpenAI

### Request:

¿Me puedes generar un skill para Claude y que pueda guardarlo y llamarlo desde la consola de VS Code? Debe generarse en un inglés técnico con términos adecuados al negocio de Service Desk.

### Response:

Generado documento SKILL.md que se ha guardado en la ruta: '.claude/skills/service-desk-expert'

Esta versión está escrita con terminología que encontrarás en productos como ServiceNow, Jira Service Management, BMC Helix ITSM o ManageEngine ServiceDesk Plus, y está orientada a que Claude responda como un Product Architect/Business Consultant especializado en Service Desk empresarial.

</br>

**Prompt 3:**

Agent: Claude Code - Sonnet 4.6

### Request:

@.claude/skills/service-desk-expert/ guarda en tu skill que tienes que escribir todo en inglés técnico del sector de Service Desk.

¿cambiarías algo del skill @.claude/skills/service-desk-expert/ si dicho service-desk fuese expresamente para una aplicación que gestiona competiciones de tipo torneo, liga o grupos? Tienes la información exacta del objetivo de la aplicación en el readme.md (sección '0.3. Descripción breve del proyecto')

### Response:

Claude ha mejorad el skill @.claude/skills/service-desk-expert/, varios apartados en los que concreta su Alcance y Contexto concreto dentro de la aplicación de Gestión de Ligas y Torneos.

---

## 1. Descripción general del producto

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

@.claude/skills/service-desk-expert/ Necesito que rellenes para un producto Service Desk y, en el documento 'readme.md' que se encuentra en la raíz del proyecto, los siguientes campos:

- 1. Descripción general del producto/1.1. Objetivo
- 1. Descripción general del producto/1.2. Características y funcionalidades principales

### Response:

Añadido en el readme.md: '1.1. Objetivo' y '1.2. Características y funcionalidades principales'.

</br>

**Prompt 2:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-product-owner** para redactar las secciónes "1. Product" (Qué es el producto en 3 líneas - Sport ITSM: plataforma ITSM que soporta el SCMS) y "4. Specifications & OpenSpec Workflow (Puntero a que las specs viven en openspec/ y a cómo trabajar con changes)" el CLAUDE.md (raíz del repo). Va a contener:

Usa el agente **sport-itsm-architect** para redactar las sección "2. Technology Stack" y "3. Code Conventions, Folder Structure, Commands & Style Rules (Convenciones de código, estructura de carpetas, comandos (build/test/lint), reglas de estilo, qué NO hacer.)" dentro de CLAUDE.md. Distingue entre Backend y Frontend.

Sin requisitos funcionales aquí: es contexto operativo para el agente. (OpenSpec también usa AGENTS.md; puedes mantener CLAUDE.md como el archivo de Claude Code y que apunte a openspec/.)

### Response:

Añadido el CLAUDE.md.

</br>

**Prompt 3:**

Agent: Claude Code - Sonnet 4.6

### Request:

Quiero que creees un PRD con ayuda del agente sport-itsm-product-owner

### Response:

Añadido PRD.

</br>

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Añade al agente "sport-itsm-architect" el skill feature-docs

### Response:

El skill feature-docs ha sido añadido al agente "sport-itsm-architect"

</br>

**Prompt 2:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar el "Diagrama de arquitectura" de la aplicación, ayudándote del PRD si es necesario. Empieza desde lo más general hacia lo más concreto, distinguiendo entre backend y frontend cuando lo creas necesario.

### Response:

Se ha creado el documento docs/ARCHITECTURE.md

</br>

**Prompt 3:**

Agent: Claude Code - Sonnet 4.6

### Request:

Rellena el apartado "2.1. Diagrama de arquitectura" del readme.md y revisa que se hayan cumplido todos los requisitos.

### Response:

Apartado "2.1. Diagrama de arquitectura" del readme.md rellenado.

</br>

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar la "Descripción de componentes principales" de la aplicación, ayudándote del documento PRD.md y el ARCHITECTURE.md si es necesario. Describe los componentes más importantes, incluyendo la tecnología utilizada. Llamalo COMPONENTS.md y, añade la información también en la sección 2.2 del readme.md.

### Response:

Creado documento COMPONENTS.md y rellenado apartado "2.2. Descripción de componentes principales" del readme.md.

</br>

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar la "Descripción de alto nivel del proyecto y estructura de ficheros" de la aplicación. Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica. El documento que generes añadelo dentro de la carpeta docs y rellena la sección 2.3 del readme.md.

### Response:

Creado documento PROJECT-STRUCTURE.md y rellenado apartado "2.3. Descripción de alto nivel del proyecto y estructura de ficheros" del readme.md.

</br>

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar la "3.1. Diagrama del modelo de datos" de la aplicación. En la carpeta docs genera un documento único para todo el Modelo de Datos, y rellena la sección 3.1 del readme.md.

### Response:

Creado documento DATA-MODEL.md y rellenado apartado "3.1. Diagrama del modelo de datos" del readme.md.

</br>

**Prompt 2:**

Agent: Claude Code - Sonnet 4.6

### Request:

Usa el agente **sport-itsm-architect** para generar la "3.2. Descripción de entidades principales" de la aplicación. Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc. Añade todo al fichero creado anteriormente DATA-MODEL.md, y rellena la sección 3.2 del readme.md.

### Response:

Añdadido a DATA-MODEL.md este nuevo apartado y rellenado "3.2. Descripción de entidades principales" del readme.md.

</br>

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Utiliza el agente sport-itsm-product-owner. Carga el skill epic-mapper y ejecútalo entero para producir el epic map de Sport IT Service Management.

Devuelve el contenido completo de epic-map.md en inglés, siguiendo el formato de salida del skill.

### Response:

Añdadido epic-map.md

</br>

**Prompt 2:**

Agent: Claude Code - Sonnet 4.6

### Request:

Actúa como Business Analyst para UNA sola épica: C10 — Identity & Access Management. Raíz del repositorio: d:\repositories\ai4devs\proyecto_final\AI4Devs-finalproject El producto es Sport ITSM.

Carga el skill `business-analyst` (Skill, skill="business-analyst") y ejecútalo entero para la clave de épica C10. Entregable: escribe `docs/backlog/C10/user-stories.md` siguiendo exactamente la plantilla de salida del skill.

IMPORTANTE: el documento resultante se escribe EN INGLÉS, con terminología estándar de Service Desk / ITSM. Este prompt está en español, el entregable no: las historias y los criterios de aceptación Given/When/Then alimentan los ficheros `.feature` y el estándar de lenguaje del proyecto obliga a inglés técnico.

#### Arranque — lee en este orden, con estas correcciones de ruta

1. `docs/backlog/epic-map.md`, apartado "### `C10` · Identity & Access Management". Ese documento es el dueño de la clave, de la lista de requisitos y de los estados de construcción. NO los vuelvas a derivar.
2. `docs/product/PRD.md` §7.10 únicamente (el nombre del fichero va en mayúsculas), más §4 para las personas. No leas el PRD entero.
3. El paso 3 del skill ("leer el código") ES UNA OPERACIÓN VACÍA — mira más abajo.
4. Lee `CLAUDE.md` §3 y `docs/product/ARCHITECTURE.md` §5 para conocer los límites entre capas, de modo que los criterios de aceptación sean expresables en esta arquitectura.

#### Greenfield — esto cambia la forma de todas las historias

Sport ITSM no tiene NADA de código: no hay `package.json`, ni `apps/`, ni `libs/`. Los 7 requisitos están en estado 🔴 Not built.

- Por tanto TODAS las historias son de forma **greenfield**. En esta épica no hay historias de tipo gap ni de tipo defect. La guía del skill sobre historias de gap ("nombra lo que ya funciona") no aplica y no debe simularse.
- `ReadTheCode()` es una operación vacía: ningún requisito está en 🟡 / ⚫ / 🔍, así que no hay nada que inspeccionar. No busques código, no informes de discrepancias entre el epic map y el código, y no incluyas la línea "Today:" en ninguna historia — ese campo es exclusivo de las historias de gap y de defect.
- Ningún requisito está 🟢 Built, así que no se descarta ninguno: los 7 generan historias.

#### Personas — el PRD no tiene identificadores `PER-`

Los apartados §4.1 y §4.2 nombran las personas en tablas, sin IDs. Traza cada historia a su persona usando su nombre exacto del PRD (por ejemplo "Service Desk Agent (L1)", "System Administrator", "Tournament Organizer / Admin"). NO inventes `PER-1`, `PER-2`…: inventar IDs del PRD está prohibido por las propias restricciones del skill. Deja constancia de esa ausencia una sola vez, en el apartado de Findings.

#### Alcance de esta épica — léelo con atención

Los 7 requisitos son FR-IAM-01 … FR-IAM-07. El "login" es solo una porción de la épica (FR-IAM-01 autenticación, FR-IAM-06 caducidad de sesión y reautenticación step-up); cubre LOS SIETE, no solo el inicio de sesión: FR-IAM-01 M autenticar a todo usuario antes de cualquier función — sin superficie anónima FR-IAM-02 M RBAC alineado con las personas, mínimo privilegio FR-IAM-03 M visibilidad de registros acotada al requester + concesiones acotadas por competición para Tournament Organizer / Admin y League Administrator FR-IAM-04 S IdentityProviderPort como capa anticorrupción para el SSO de SCMS FR-IAM-05 M asignación y revocación de roles auditada FR-IAM-06 S cierre de sesión por inactividad + reautenticación step-up FR-IAM-07 C registro de autorizaciones denegadas en operaciones privilegiadas

El epic map imputa a C10 toda la cimentación del workspace (arranque de Nx, las 4 aplicaciones, `libs/shared/{contracts,domain,ui,util}`, el esquema base de PostgreSQL y la cadena de migraciones). Eso es **trabajo técnico habilitador, no historias de usuario**: no escribas historias de usuario para el andamiaje. Recógelo en Findings como trabajo que esta épica arrastra y que corresponde a tickets, no a historias.

#### Restricciones

- IDs de historia `US-C10-01`, `US-C10-02`, … con dos dígitos, y solo con este prefijo.
- No renumeres ni inventes IDs `FR-` / `NFR-`.
- Cada historia traza a ≥1 requisito FR-, a un nombre de persona y a la épica C10.
- Criterios de aceptación en Given/When/Then, en inglés, lo bastante concretos como para poder estimarse con granularidad ≤3 h sin tener que releer nada.
- No escribas historias de ninguna otra épica. En particular, los FR-AUD-\* pertenecen a C18, aunque FR-IAM-05 dependa de ellos (hallazgo F5 del epic map: C10 y C18 son mutuamente dependientes y se entregan juntas en la fase 0). Declara la dependencia; no escribas historias de C18.
- No escribas tickets, estimaciones ni planes de prueba: en este repositorio no existe `architect-tech-lead`, así que párate en las historias.
- Escribe únicamente `docs/backlog/C10/user-stories.md`. No modifiques ningún otro fichero.

#### Traslada estos hallazgos del epic map a tu apartado de Findings

- F5: FR-IAM-05 ("fully audited") necesita C18, mientras que FR-AUD-02 (identidad del actor) necesita C10. Se entregan juntas como un único incremento de fase 0.
- F9: FR-IAM-04, FR-IAM-06 y FR-IAM-07 no están asignados a ninguna fase en el §14 del PRD, pese a que FR-IAM-06 es un control de seguridad.

Informa al terminar: número de historias por forma, requisitos cubiertos y cualquier hallazgo nuevo.

### Response:

Añdadido docs/backlog/C10/user-stories.md

</br>

**Prompt 3:**

Agent: Claude Code - Sonnet 4.6

### Request:

Actúa como Business Analyst para UNA sola épica: C18 — Audit Trail & Activity History. Raíz del repositorio: d:\repositories\ai4devs\proyecto_final\AI4Devs-finalproject El producto es Sport ITSM.

Carga el skill `business-analyst` (Skill, skill="business-analyst") y ejecútalo entero para la clave de épica C18. Entregable: escribe `docs/backlog/C18/user-stories.md` siguiendo exactamente la plantilla de salida del skill.

IMPORTANTE: el documento resultante se escribe EN INGLÉS, con terminología estándar de Service Desk / ITSM. Este prompt está en español, el entregable no: las historias y los criterios de aceptación Given/When/Then alimentan los ficheros `.feature` y el estándar de lenguaje del proyecto obliga a inglés técnico.

#### Arranque — lee en este orden, con estas correcciones de ruta

1. `docs/backlog/epic-map.md`, apartado "### `C18` · Audit Trail & Activity History". Ese documento es el dueño de la clave, de la lista de requisitos y de los estados de construcción. NO los vuelvas a derivar.
2. `docs/product/PRD.md` §7.17 únicamente (el nombre del fichero va en mayúsculas), más §4 para las personas. No leas el PRD entero.
3. El paso 3 del skill ("leer el código") ES UNA OPERACIÓN VACÍA — mira más abajo.
4. Lee `CLAUDE.md` §3 y `docs/product/ARCHITECTURE.md` §4.3 y §5, además de **ADR-008**, que es el que decide cómo se hace cierta la inmutabilidad de esta épica.

#### Greenfield — esto cambia la forma de todas las historias

Sport ITSM no tiene NADA de código: no hay `package.json`, ni `apps/`, ni `libs/`. Los 6 requisitos están en estado 🔴 Not built.

- Por tanto TODAS las historias son de forma **greenfield**. No hay historias de gap ni de defect. La guía del skill sobre historias de gap no aplica y no debe simularse.
- `ReadTheCode()` es una operación vacía: nada está en 🟡 / ⚫ / 🔍. No busques código, no informes de discrepancias entre el epic map y el código, y no incluyas la línea "Today:" en ninguna historia.
- Nada está 🟢 Built, así que los 6 requisitos generan historias.

#### Personas — el PRD no tiene identificadores `PER-`

Los apartados §4.1 y §4.2 nombran las personas en tablas, sin IDs. Traza cada historia a su persona usando su nombre exacto del PRD (por ejemplo "System Administrator", "Service Owner / Service Manager", "Service Desk Agent (L1)", "Player / Competitor"). NO inventes `PER-1`, `PER-2`…: inventar IDs del PRD está prohibido por las propias restricciones del skill.

#### LÍMITE DE ALCANCE CRÍTICO — no confundas FR-AUD-_ con NFR-AUD-_

Tu alcance son ÚNICAMENTE los 6 requisitos funcionales FR-AUD-01 … FR-AUD-06 del §7.17. El PRD tiene además un apartado §8.4 "Auditability & compliance" con requisitos NFR-AUD-01 … NFR-AUD-04, de nombre casi idéntico: esos pertenecen a la épica `NFR`, NO a C18, y no debes escribir ninguna historia para ellos. Si un NFR-AUD-_ restringe una de tus historias, cítalo como restricción en los criterios de aceptación, pero la trazabilidad de la historia va contra el FR-AUD-_ correspondiente.

Los 6 requisitos de tu alcance: FR-AUD-01 M cobertura del registro de auditoría FR-AUD-02 M `AuditEntry` append-only con actor, marca de tiempo, referencia del registro, acción, valor anterior y valor nuevo FR-AUD-03 M inmutable para todos los roles, incluido el System Administrator FR-AUD-04 M vista de activity history con separación entre lo visible por el requester y lo interno FR-AUD-05 M cobertura de los cambios de configuración administrativa FR-AUD-06 S suelo de retención configurable

#### Dos restricciones estructurales que deben moldear los criterios de aceptación

- **FR-AUD-03 se cumple por construcción, no por permisos.** Según `ARCHITECTURE.md` §4.3 y ADR-008, los contextos publican eventos de dominio y `audit` se suscribe después del commit: ningún contexto recibe jamás un manejador con el que mutar la auditoría. Los criterios de aceptación deben hacer falsable esa inmutabilidad, incluido el caso negativo explícito de que un System Administrator no puede modificar ni borrar una entrada, y que no existe ruta de escritura desde ningún otro contexto.
- **Esta épica no tiene librerías `feature` ni `data-access`.** Crea 4 librerías en el contexto `audit` (`domain`, `application`, `infrastructure`, `ui`): el activity history de FR-AUD-04 no es una pantalla propia, se renderiza **dentro de las vistas de otros contextos** mediante un componente `type:ui`. Escribe esa historia como componente reutilizable consumido por terceros, no como sección independiente de la aplicación.

#### Restricciones

- IDs de historia `US-C18-01`, `US-C18-02`, … con dos dígitos, y solo con este prefijo.
- No renumeres ni inventes IDs `FR-` / `NFR-`.
- Cada historia traza a ≥1 requisito FR-AUD-, a un nombre de persona y a la épica C18.
- Criterios de aceptación en Given/When/Then, en inglés, lo bastante concretos como para poder estimarse con granularidad ≤3 h.
- No escribas historias de ninguna otra épica. El coste de que cada contexto emita sus propios eventos de dominio pertenece a esas épicas, no a esta: C18 entrega el consumidor, no los emisores. Declara esa frontera explícitamente en el documento.
- No escribas tickets, estimaciones ni planes de prueba: en este repositorio no existe `architect-tech-lead`, así que párate en las historias.
- Escribe únicamente `docs/backlog/C18/user-stories.md`. No modifiques ningún otro fichero.

#### Traslada estos hallazgos del epic map a tu apartado de Findings

- F5: C10 y C18 son mutuamente dependientes — FR-IAM-05 exige que la asignación de roles quede auditada, y FR-AUD-02 exige la identidad del actor. Se **co-entregan** como un único incremento de fase 0; C18 no es sucesora de C10, es un carril paralelo. Indica qué historias de C18 pueden empezar sin que C10 esté terminada (las que solo necesitan el agregado append-only) y cuáles no (las que necesitan actor).
- F6: esta épica NO es atómica por fases. El §14.2 del PRD sitúa FR-AUD-01→04 en la fase 0 y el §14.3 sitúa FR-AUD-05 en la fase 1. Marca esa frontera en las historias; no la resuelvas tú.
- F9: FR-AUD-06 (retención) no está asignado a ninguna fase en el §14.

Informa al terminar: número de historias por forma, requisitos cubiertos y cualquier hallazgo nuevo.

### Response:

Añdadido docs/backlog/C18/user-stories.md

</br>

**Prompt 4:**

Agent: Claude Code - Sonnet 4.6

### Request:

Actúa como Business Analyst para UNA sola épica: C1 — Incident Management. Raíz del repositorio: d:\repositories\ai4devs\proyecto_final\AI4Devs-finalproject El producto es Sport ITSM.

Carga el skill `business-analyst` (Skill, skill="business-analyst") y ejecútalo entero para la clave de épica C1. Entregable: escribe `docs/backlog/C1/user-stories.md` siguiendo exactamente la plantilla de salida del skill.

IMPORTANTE: el documento resultante se escribe EN INGLÉS, con terminología estándar de Service Desk / ITSM. Este prompt está en español, el entregable no: las historias y los criterios de aceptación Given/When/Then alimentan los ficheros `.feature` y el estándar de lenguaje del proyecto obliga a inglés técnico.

#### Arranque — lee en este orden, con estas correcciones de ruta

1. `docs/backlog/epic-map.md`, apartado "### `C1` · Incident Management". Ese documento es el dueño de la clave, de la lista de requisitos y de los estados de construcción. NO los vuelvas a derivar.
2. `docs/product/PRD.md` §7.1 únicamente (el nombre del fichero va en mayúsculas), más §4 para las personas. No leas el PRD entero.
3. El paso 3 del skill ("leer el código") ES UNA OPERACIÓN VACÍA — mira más abajo.
4. En lugar del `docs/standards/base-standards.md` §4 que menciona el skill, lee `CLAUDE.md` §3 y `docs/product/ARCHITECTURE.md` §5 para conocer los límites entre capas.

#### Greenfield — esto cambia la forma de todas las historias

Sport ITSM no tiene NADA de código: no hay `package.json`, ni `apps/`, ni `libs/`. Los 18 requisitos están en estado 🔴 Not built.

- Por tanto TODAS las historias son de forma **greenfield**. No hay historias de gap ni de defect. La guía del skill sobre historias de gap no aplica y no debe simularse.
- `ReadTheCode()` es una operación vacía: nada está en 🟡 / ⚫ / 🔍. No busques código, no informes de discrepancias entre el epic map y el código, y no incluyas la línea "Today:" en ninguna historia.
- Nada está 🟢 Built, así que los 18 requisitos generan historias.

#### Personas — el PRD no tiene identificadores `PER-`

Los apartados §4.1 y §4.2 nombran las personas en tablas, sin IDs. Traza cada historia a su persona usando su nombre exacto del PRD (por ejemplo "Player / Competitor", "Service Desk Agent (L1)", "Application Support Analyst (L2/L3)", "Referee / Match Official"). NO inventes `PER-1`, `PER-2`…: inventar IDs del PRD está prohibido por las propias restricciones del skill.

#### LÍMITE DE ALCANCE CRÍTICO — el §7.1 contiene una segunda épica

El §7.1 del PRD tiene un subapartado anidado `#### 7.1.1 C13 — Major Incident Management`, cuyos requisitos `FR-MIM-*` son una épica DISTINTA (C13), con su propia clave y su propio drill futuro. Tu alcance son ÚNICAMENTE FR-INC-01 … FR-INC-18. No escribas ninguna historia para un requisito FR-MIM-\*, aunque cuelgue del mismo encabezado §7.1.

También quedan fuera de alcance, pese a que FR-INC-10 los referencia (enlaces): los Configuration Items pertenecen a C6 y los Problems a C3, ambas de fase 2. Escribe la historia de enlazado solo desde el lado del Incident y deja constancia del aplazamiento.

#### Da a estos dos requisitos la precisión que merecen

- **FR-INC-05** es el comportamiento distintivo del producto y el requisito que peor se suele leer del PRD. El flag de "competición en curso" lo activa, lo cambia y lo limpia ÚNICAMENTE una acción explícita del agente — nunca de forma automática, nunca el requester —, exige una justificación obligatoria, eleva el Impact evaluado en una cantidad configurable, vuelve a derivar la Priority a través de la matriz Impact × Urgency, y todo cambio queda auditado. Sus criterios de aceptación deben hacer falsables esos cinco puntos, incluidos los casos negativos (intento del requester rechazado; ningún disparo automático desde un calendario o cualquier fuente de eventos).
- **FR-INC-04** deriva la Priority de una matriz Impact × Urgency configurable, y el override por parte del agente solo se permite con una justificación obligatoria registrada en el audit trail. El frontend no deriva nada (NFR-SEC-02): la Priority es una decisión del servidor.

#### Restricciones

- IDs de historia `US-C1-01`, `US-C1-02`, … con dos dígitos, y solo con este prefijo.
- No renumeres ni inventes IDs `FR-` / `NFR-`.
- Cada historia traza a ≥1 requisito FR-, a un nombre de persona y a la épica C1.
- Criterios de aceptación en Given/When/Then, en inglés, lo bastante concretos como para poder estimarse con granularidad ≤3 h.
- No escribas tickets, estimaciones ni planes de prueba: en este repositorio no existe `architect-tech-lead`, así que párate en las historias.
- Escribe únicamente `docs/backlog/C1/user-stories.md`. No modifiques ningún otro fichero.

#### Traslada estos hallazgos del epic map a tu apartado de Findings

- F6: esta épica NO es atómica por fases. El §14.2 del PRD sitúa FR-INC-01/02/03 (registro base del ticket, numeración de referencia, taxonomía de categorización) en la fase 0, mientras que el §14.3 lista FR-INC-01→13 y 18 en el MVP de la fase 1: ambas listas se solapan sin declarar dónde está la frontera. Marca qué historias caen en esa porción en disputa; no resuelvas tú el corte.
- F9: FR-INC-15 y FR-INC-16 no están asignados a ninguna fase en el §14, pese a que FR-INC-15 (aplicación de la regla de alcance en el intake) es la mitigación declarada del riesgo R1, la fuga de alcance hacia la operación deportiva.

Informa al terminar: número de historias por forma, requisitos cubiertos y cualquier hallazgo nuevo.

### Response:

Añdadido docs/backlog/C1/user-stories.md

</br>

---

### 6. Tickets de Trabajo

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
