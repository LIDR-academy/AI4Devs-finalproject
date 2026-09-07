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
4. Lee `CLAUDE.md` §3 y `docs/product/ARCHITECTURE.md` §5 para conocer los límites entre capas.

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

Agent: Claude Code - Sonnet 4.6

### Request:

Actúa como Architect / Tech Lead para UNA sola épica: C10 — Identity & Access Management. Raíz del repositorio: d:\repositories\ai4devs\proyecto_final\AI4Devs-finalproject El producto es Sport ITSM.

Carga el skill architect-tech-lead (Skill, skill="architect-tech-lead") y ejecútalo entero en DRILL MODE para la clave de épica C10.

Entregables:

- docs/backlog/C10/tickets/T-C10-nn.md — un fichero por ticket
- docs/backlog/C10/tickets/README.md — índice de tickets en orden de implementación
- docs/backlog/C10/test-plan.md — el test plan de la épica

IMPORTANTE: todo se escribe EN INGLÉS, con terminología estándar de Service Desk / ITSM. Este prompt está en español, los entregables no: los criterios Given/When/Then alimentan los ficheros .feature y el estándar de lenguaje del proyecto obliga a inglés técnico.

#### Arranque — lee en este orden

1. docs/backlog/C10/user-stories.md — las 16 historias US-C10-01 … US-C10-16. Ese documento es el dueño de los IDs de historia y de su trazabilidad a FR-IAM-\*. NO lo edites, NO renumeres una US-, NO inventes historias nuevas. Lee también su apartado de Findings: condiciona tres de las historias.
2. docs/backlog/epic-map.md — el apartado "### C10 · Identity & Access Management" Y el apartado "## Foundation ownership (priced once)". El segundo es el origen que deben citar tus tickets de cimentación.
3. CLAUDE.md §3 y docs/product/ARCHITECTURE.md §5 (estructura Nx, esquema de tags de tres ejes, matriz de constraints de boundaries) y §9 (colocación de auth, autorización, eventos de dominio, ClockPort). De ahí sale el campo `layer:` de cada ticket.
4. El paso de "leer el código" ES UNA OPERACIÓN VACÍA: no hay package.json, ni apps/, ni libs/, ni un solo test. No busques código y no informes de discrepancias con él.

#### Greenfield — afecta a la forma de TODOS los tickets

Las 16 historias son greenfield y ninguna lleva línea "Today:". Ningún ticket es de gap ni de defect: ninguno debe declarar "lo que ya funciona", porque no funciona nada. Todos llevan `shape: greenfield`.

#### Cimentación

Esta épica arrastra toda la cimentación del workspace, imputada a C10 y solo a C10 ("priced once" en el epic map): arranque de Nx con pnpm, ESLint 9 flat config con @nx/enforce-module-boundaries, Prettier, el esquema de tags de tres ejes, las 4 aplicaciones (api, api-e2e, web, web-e2e), libs/shared/{contracts,domain,ui,util} incluido el design system in-house, y el esquema base de PostgreSQL con su cadena de migraciones TypeORM.

El Business Analyst hizo bien en NO escribir historias para eso (hallazgo F14: no hay persona ni comportamiento observable). Emítelo como tickets de cimentación según la regla de la skill: `story: —`, `foundation: true`, y el origen citado en `## Context` — el apartado "Foundation ownership (priced once)" del epic map y el hallazgo F14 de user-stories.md.

Sus `## Acceptance criteria` son verificaciones mecánicas, no escenarios de usuario: el comando que debe pasar (`pnpm nx lint`, `pnpm nx graph` sin dependencias ilegales, la migración base corre y revierte), el tag que debe estar puesto, el boundary que debe romper la build si se viola.

#### Orden — es parte del entregable

Los tickets van numerados EN ORDEN DE IMPLEMENTACIÓN: T-C10-01 es lo primero que se construye. El orden lo manda la dependencia técnica real, no el número de la historia. Esqueleto de bloques; refínalo si la dependencia lo exige y explica por qué:

1. Cimentación: Nx + pnpm + lint/boundaries/tags → las 4 apps → libs/shared/{domain,contracts,util} → libs/shared/ui (design system) → PostgreSQL + migración base y cadena de migraciones.
2. Núcleo de identidad: librerías del contexto identity-access (domain, application, infrastructure, feature, data-access — NO lleva `ui` propio), IdentityProviderPort + adapter local (US-09), autenticación (US-01), guard global sin superficie anónima (US-02), sign-out (US-03).
3. RBAC: catálogo de roles de §4.3 del PRD (US-04), enforcement de mínimo privilegio en los casos de uso (US-05).
4. Visibilidad de registros: requester-scoped (US-06), competición para Organizer (US-07), liga para League Administrator (US-08).
5. Administración de roles: asignar (US-11), revocar con efecto inmediato (US-12), emitir eventos auditables (US-13).
6. Sesión: caducidad por inactividad (US-14), reautenticación step-up (US-15).
7. Registro de autorizaciones denegadas (US-16).
8. SSO de SCMS detrás del ACL (US-10).

El README.md del directorio lista los tickets en ese orden, agrupados por bloque, una línea por ticket (id, título, capa, agente, estimación) y el total de horas por bloque y de la épica.

#### Restricciones

- IDs T-C10-01, T-C10-02, … con dos dígitos y solo con este prefijo.
- No renumeres ni inventes IDs US- / FR- / NFR-.
- Máximo 3h por ticket. Si superas el cap, escribe la razón en `## Context`.
- El campo `agent:` solo admite `backend-engineer` o `frontend-engineer`, los únicos que existen en .claude/agents/. NO existen ci-cd-expert ni testing-implementer: para el tooling del workspace, Docker y despliegues, y para el código de test E2E / API-E2E, nombra la capa y la plataforma en las que cae el trabajo, no un agente inexistente.
- No escribas tickets de ninguna otra épica. En particular NO escribas tickets de C18: el hallazgo F5 dice que C10 y C18 se co-entregan en fase 0, pero US-C10-13 llega hasta publicar el evento de dominio; persistirlo y renderizarlo como AuditEntry es de C18. Declara la dependencia en el ticket, no la implementes.
- No escribas código, ni tests, ni migraciones: te paras en los tickets y el test plan.
- Escribe únicamente bajo docs/backlog/C10/. No modifiques user-stories.md ni epic-map.md.

#### Preguntas abiertas que NO debes resolver tú

Dos decisiones siguen pendientes de Product Owner o de arquitectura. No las inventes: entrega la parte no bloqueada y marca el resto como bloqueante.

- F16 — nadie ha enumerado qué operaciones son "privilegiadas". US-C10-15 propone un conjunto (asignación y revocación de roles, más la configuración de catálogo, taxonomía, políticas de SLA, workflows y plantillas de notificación) como ASUNCIÓN pendiente de confirmar. Afecta a US-C10-15 y a US-C10-16.
- F17 — no está decidido dónde se registra una autorización denegada: una entrada de auditoría de C18 no encaja (no tiene valor anterior ni valor nuevo ni referencia natural de registro), y la alternativa es un log de seguridad propio. Afecta a US-C10-16.

Marca esos tickets con `blocked_by: F16` / `blocked_by: F17` en el frontmatter y explica en `## Context` qué decisión falta y quién debe tomarla.

#### Fases

Las historias de C10 no llevan campo Phase. La fase sale del PRD §14 y del epic map: FR-IAM-01, 02, 03 y 05 son fase 0; FR-IAM-04, 06 y 07 no están asignados a ninguna fase (hallazgo F9), pese a que FR-IAM-06 es un control de seguridad. Refleja la fase en cada ticket con un campo `phase:` de valor `0` o `unphased (F9)`. No decidas tú la fase de los que no la tienen.

#### Informa al terminar

Número de tickets, desglose por bloque, horas totales y por bloque, cuántos son de cimentación sin historia, qué historias han quedado bloqueadas por F16/F17, y cualquier historia demasiado vaga para estimar — di cuál y por qué, sin reescribirla.

### Response:

Añdadido tickets en la carpeta docs/backlog/C10/tickets/

</br>

**Prompt 2:**

Agent: Claude Code - Sonnet 4.6

### Request:

Actúa como Architect / Tech Lead para UNA sola épica: C1 — Incident Management. Raíz del repositorio: d:\repositories\ai4devs\proyecto_final\AI4Devs-finalproject El producto es Sport ITSM.

Carga el skill architect-tech-lead (Skill, skill="architect-tech-lead") y ejecútalo entero en DRILL MODE para la clave de épica C1.

Entregables:

- docs/backlog/C1/tickets/T-C1-nn.md — un fichero por ticket
- docs/backlog/C1/tickets/README.md — índice de tickets en orden de implementación
- docs/backlog/C1/test-plan.md — el test plan de la épica

IMPORTANTE: todo se escribe EN INGLÉS, con terminología estándar de Service Desk / ITSM. Este prompt está en español, los entregables no: los criterios Given/When/Then alimentan los ficheros .feature y el estándar de lenguaje del proyecto obliga a inglés técnico.

#### Arranque — lee en este orden

1. docs/backlog/C1/user-stories.md — las 32 historias US-C1-01 … US-C1-32. Ese documento es el dueño de los IDs de historia, de su trazabilidad a FR-INC-\*, de su fase y de sus fronteras de alcance. NO lo edites, NO renumeres una US-, NO inventes historias. Lee entero su apartado "Scope boundary", su tabla "Phase boundary" y sus 10 Findings: condicionan un tercio de los tickets.
2. docs/backlog/epic-map.md — el apartado "### C1 · Incident Management" (dependencias declaradas e inferidas) Y el apartado "## Foundation ownership (priced once)", que te dice lo que esta épica NO paga.
3. docs/backlog/C10/tickets/ — los 67 tickets ya emitidos de C10. NO los repitas: son el precedente de formato y la prueba de qué cimentación ya está pagada.
4. CLAUDE.md §3 y docs/product/ARCHITECTURE.md §5 (estructura Nx, tags de tres ejes, matriz de boundaries), §8 (reglas de aislamiento entre contextos) y §9 (autorización, eventos de dominio, ClockPort). De ahí sale el campo `layer:` de cada ticket.
5. El paso de "leer el código" ES UNA OPERACIÓN VACÍA: no hay package.json, ni apps/, ni libs/, ni un solo test. No busques código y no informes de discrepancias con él.

#### Greenfield

Las 32 historias son greenfield y ninguna lleva línea "Today:". Ningún ticket es de gap ni de defect: ninguno declara "lo que ya funciona". Todos llevan `shape: greenfield`.

#### Cimentación — lee esto con cuidado, C1 no es C10

La cimentación del WORKSPACE está imputada a C10 y solo a C10 ("priced once"): Nx, pnpm, lint/boundaries/tags, las 4 aplicaciones, libs/shared/{contracts,domain,ui,util}, el design system y el esquema base de PostgreSQL con su cadena de migraciones. **NO emitas ni un solo ticket para nada de eso.** Volver a pagarlo es exactamente lo que la regla "priced once" existe para impedir, y sus tickets ya están escritos en docs/backlog/C10/tickets/.

Lo que SÍ es cimentación de C1: levantar las **seis librerías del contexto `incident`** (domain, application, infrastructure, feature, ui, data-access) con sus tres tags correctos, vía generadores Nx. Ninguna historia lo respalda y el Business Analyst hizo bien en no escribirla. Emítelo como tickets de cimentación según la regla de la skill: `story: —`, `foundation: true`, y el origen citado en `## Context` — ARCHITECTURE.md §5.1 (que lista las seis librerías del contexto) y el párrafo "What actually remains" de C1 en el epic map.

Sus `## Acceptance criteria` son verificaciones mecánicas, no escenarios de usuario: la librería existe con los tres tags, `pnpm nx lint` pasa, y `pnpm nx graph` no muestra ninguna dependencia que la matriz de §5.3 prohíba.

#### Fronteras de contexto — el error más caro de esta épica

C1 depende de nueve épicas y casi ninguna existe. Para cada costura, entrega SOLO el lado del Incident, declara la dependencia en `## Context` y NO implementes la mitad ajena:

- US-C1-17 — `incident` NUNCA importa `sla`. Publica señales de pausa/reanudación; el SlaPolicyAdapter en apps/api es el único objeto que conoce ambos (ARCHITECTURE.md §8). El cálculo del reloj es de C7.
- US-C1-15 — el modelo de estados se realiza con el primitivo `StateModel` de libs/shared/domain (creado por C10, configurado por C12). No construyas un motor de workflow.
- US-C1-20 — enlazar al Major Incident padre es lado Incident; declarar, coordinar y cerrar el Major Incident es C13. No escribas tickets de FR-MIM-\*.
- US-C1-21 — Problem (C3), Change (C4), Release (C5) y CI (C6) son fase 2 y no existen. Entrega la referencia tipada y su degradación explícita, nada del lado destino.
- US-C1-24/25/26 — los Resolver Groups son de C14: se referencian, no se definen. El disparo automático de escalado por umbral de SLA lo levantan FR-SLA-07 y FR-WFL-05 (C7/C12); C1 ejecuta la ACCIÓN de escalado al recibir el evento.
- US-C1-27 — la conversión necesita el lado Service Request de C2. Solo lado Incident.
- US-C1-29/30 — la búsqueda de conocimiento, el ranking y el modelo de artículo son de C9. C1 llama a un puerto y registra la deflexión.
- Notificaciones (C16) y entradas de auditoría (C18) se consumen vía eventos de dominio publicados post-commit: C1 publica, ellas registran.

#### FR-INC-05 — no aplanes el comportamiento distintivo del producto

Las historias US-C1-11, 12, 13 y 14 hacen falsables cinco propiedades del flag de "competición en curso". Los tickets deben conservarlas, no resumirlas en "implementar el flag": justificación obligatoria forzada en el dominio; elevación configurable del Impact que RE-DERIVA la Priority por la matriz y nunca escribe una Priority directamente; set, cambio y limpieza auditados con la cadena causal en un solo evento; y sobre todo **US-C1-12**, cuyos casos negativos son el ticket más importante de la épica: el campo se rechaza en servidor en toda vía de entrada, NO existe ninguna ruta de escritura automatizada (ni calendario, ni feed de fixtures de SCMS, ni regla temporal, ni evento de umbral de SLA, ni importación), y un test unitario afirma que invocar la escritura con un actor de sistema es rechazado.

#### Orden — es parte del entregable

Los tickets van numerados EN ORDEN DE IMPLEMENTACIÓN: T-C1-01 es lo primero que se construye. El orden lo manda la dependencia técnica real, no el número de la historia. Esqueleto de bloques; refínalo si la dependencia lo exige y explica por qué en el README:

1.  Cimentación del contexto: las 6 librerías `incident` con tags.
2.  Registro base e intake: numeración de referencia (US-05), intake de requester (US-01), intake de agente en un solo flujo (US-02), sujeto e instancia de competición (US-03), adjuntos (US-04).
3.  Categorización: taxonomía configurable (US-06), puerta de salida de `New` (US-07).
4.  Priorización: configuración de la matriz (US-09), derivación en servidor (US-08), override con justificación (US-10).
5.  Flag de competición en curso: uplift configurable (US-14), activación (US-11), solo-agente y nunca automático (US-12), cambio y limpieza (US-13).
6.  Ciclo de vida: modelo de estados (US-15), puerta de resolución (US-16), señales de parada/reanudación del reloj (US-17).
7.  Cierre: confirmación o rechazo del requester (US-18), auto-cierre (US-19).
8.  Colaboración: comentario público vs work note interna (US-22), vista del requester (US-23).
9.  Asignación y escalado: reasignación con historial (US-24), escalado funcional (US-25), jerárquico y automático (US-26).
10. First Contact Resolution (US-32) — depende del historial de asignación de US-24.
11. Enlazado: Incidents y Major Incident padre (US-20), contextos diferidos (US-21).
12. Regla de alcance en el intake (US-28).
13. Conocimiento: sugerencias (US-29), registro de deflexión (US-30).
14. Fase 3: conversión Incident ↔ Service Request (US-27), detección de duplicados (US-31).

El README.md lista los tickets en ese orden, agrupados por bloque, una línea por ticket (id, título, historia, capa, agente, estimación) y el total de horas por bloque y de la épica.

#### Fases — léelas, no las derives

A diferencia de C10, CADA historia de C1 lleva ya un campo `- **Phase:**`. Cópialo al campo `phase:` del ticket tal cual. Hay cuatro valores en uso: `disputed 0/1 (F6)` (US-01…07), `1 (MVP)` (la mayoría), `3 (§14.5)` (US-27, US-31) y `unphased (F9)` (US-28, 29, 30).

**NO resuelvas el corte de fase 0/1 del hallazgo F6.** El §14.2 del PRD sitúa FR-INC-01/02/03 en fase 0 y el §14.3 sitúa FR-INC-01→13 y 18 en el MVP de fase 1, solapándose sin declarar la frontera. Esa decisión es del Product Owner. Los tickets de US-01…07 conservan `disputed 0/1`.

#### Preguntas abiertas que NO debes resolver tú

Seis hallazgos bloquean o condicionan ocho historias. No inventes ninguna de estas decisiones: entrega la parte no bloqueada, marca el ticket con `blocked_by: Fnn` en el frontmatter y explica en `## Context` qué decisión falta y quién debe tomarla.

- **F24** → US-C1-11. La elevación del Impact no está definida en el techo de la escala: si el Incident ya está en el Impact máximo, nadie ha dicho si se satura o si se rechaza el flag. El ticket exige comportamiento determinista y prohíbe el no-op silencioso, pero NO elige.
- **F25** → US-C1-28. FR-INC-15 dice "reject **or** flag" sin decidirlo, y no dice dónde viven las reglas de detección. La historia asume que son datos de configuración y que rechazar-vs-marcar también se configura: es asunción pendiente de confirmar.
- **F27** → US-C1-22. Nadie ha dicho si el tipo de una entrada (comentario público / work note interna) puede cambiarse después de creada. Es una divulgación en un sentido y una retractación en el otro. Recomendación de la historia: inmutable, corrección por entrada nueva.
- **F28** → US-C1-32. "La primera interacción" no está definida, así que FCR no tiene definición testable. Entrega lo inequívoco (historial de asignación y tier resolutor); la frontera de interacción queda bloqueada.
- **F29** → US-C1-01 y US-C1-03. FR-INC-01 es ambiguo sobre si un requester puede fijar el sujeto de competición estructurado. La lectura de las historias es: requester en texto libre, agente fija la referencia estructurada. Si se confirma lo contrario cambian el formulario y los permisos.
- **F30** → US-C1-10 y US-C1-13. El override de Priority (FR-INC-04) y la re-derivación por el flag (FR-INC-05) pueden contradecirse y el PRD no dice cuál gana. Las historias asumen que el override se mantiene hasta que un agente vuelve explícitamente al valor derivado, y exigen un test explícito. Dos implementaciones razonables dan recuentos de P1 distintos.

Los hallazgos **F23** (la mitigación del riesgo R1 está sin fase mientras el intake que protege es fase 1) y **F26** (el registro de deflexión de FR-INC-16 choca con FR-KNW-06, que es fase 3) son de fasing, no bloquean la implementación: recógelos en el README como riesgos de secuencia.

#### Restricciones

- IDs T-C1-01, T-C1-02, … con dos dígitos y solo con este prefijo.
- No renumeres ni inventes IDs US- / FR- / NFR-.
- Máximo 3h por ticket. Si superas el cap, escribe la razón en `## Context`.
- El campo `agent:` solo admite `backend-engineer` o `frontend-engineer`, los únicos que existen en .claude/agents/. NO existen ci-cd-expert ni testing-implementer: para el código de test E2E / API-E2E nombra la capa y la plataforma, no un agente inexistente.
- No escribas tickets de ninguna otra épica, ni de FR-MIM-\* (C13), ni de los lados destino de C2, C3, C4, C5, C6, C7, C9, C12, C14, C16 o C18.
- No escribas código, ni tests, ni migraciones: te paras en los tickets y el test plan.
- Escribe únicamente bajo docs/backlog/C1/. No modifiques user-stories.md ni epic-map.md, ni nada bajo docs/backlog/C10/.

#### Informa al terminar

Número de tickets, desglose por bloque, horas totales y por bloque, cuántos son de cimentación del contexto, qué historias han quedado bloqueadas y por qué hallazgo, y cualquier historia demasiado vaga para estimar — di cuál y por qué, sin reescribirla.

### Response:

Añdadido tickets en la carpeta docs/backlog/C1/tickets/

</br>

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

Agent: Claude Code - Sonnet 4.6

### Request:

Actúa como sport-itsm-architect e implementa UN SOLO ticket: docs/backlog/C10/tickets/T-C10-01.md · Bootstrap the Nx workspace with pnpm and strict TypeScript Raíz del repositorio: d:\repositories\ai4devs\proyecto_final\AI4Devs-finalproject

#### El ticket es el contrato

Lee docs/backlog/C10/tickets/T-C10-01.md entero. Su `## Scope` es exhaustivo y su lista de "Out of scope" es vinculante. Lee también CLAUDE.md §2 (versiones pinneadas: Node 20 LTS, Nx 21.6, TypeScript 5.9, pnpm como único gestor) y §3 (comandos y estructura de carpetas). No leas el resto del backlog: el ticket es autocontenido.

#### Lo que NO debes hacer — es el riesgo real de este ticket

Vas a arrancar un workspace Nx y la tentación de dejarlo "completo y usable" es enorme. No lo hagas:

- **ESLint 9 flat config y Prettier 3 son T-C10-02.** No los configures.
- **El esquema de tags de tres ejes y la matriz de boundaries son T-C10-03.** No los configures.
- **Ninguna aplicación y ninguna librería.** Ni `apps/api`, ni `apps/web`, ni nada bajo `libs/`. El criterio de aceptación exige explícitamente que `pnpm nx graph` reporte CERO proyectos.

Adelantarte convierte tickets greenfield en tickets de gap dentro de un proyecto que todavía no tiene una línea de código, y el backlog entero deja de reflejar la realidad. Haz exactamente el Scope, ni un paso más. Si crees que algo del Scope es imposible sin invadir otro ticket, para y dilo en vez de resolverlo por tu cuenta.

#### Precaución con el directorio

El repositorio NO está vacío: contiene CLAUDE.md, readme.md, prompts.md, skills-lock.json, docs/ y .claude/. `create-nx-workspace` espera normalmente un directorio limpio. Bajo ninguna circunstancia borres, muevas, sobrescribas ni renombres nada de lo existente. Si el generador se niega a operar sobre un directorio no vacío, para y dime el error exacto y la orden que has usado — no improvises una salida que toque los ficheros que ya están.

#### Verificación — ejecútala, no la afirmes

Los cuatro criterios de aceptación son comprobaciones mecánicas. Ejecuta cada comando de verdad y pega su salida:

1. `pnpm install` completa sin error y produce SOLO `pnpm-lock.yaml` — ni `package-lock.json` ni `yarn.lock` en ningún punto del árbol.
2. `pnpm nx report` imprime Nx 21.6, TypeScript 5.9 y Node 20.x.
3. `tsconfig.base.json` tiene `compilerOptions.strict: true`, además de `noImplicitOverride`, `noUnusedLocals` y `noFallthroughCasesInSwitch`.
4. `pnpm nx graph --file=tmp/graph.json` funciona y reporta cero proyectos.

Si alguno falla, dilo con su salida completa. Un criterio que no has ejecutado se reporta como no ejecutado, nunca como pasado.

#### Restricciones

- No modifiques nada bajo docs/ ni bajo .claude/. El ticket no se edita ni se marca como hecho.
- No instales dependencias que el Scope no pida.
- No hagas commit ni push salvo que te lo pida explícitamente.
- Si necesitas red y no la tienes, para y dilo.

#### Informa al terminar

Qué ficheros has creado, la salida de las cuatro verificaciones, y cualquier decisión que hayas tomado que el ticket no cubría — en particular si has elegido entre preset integrado y package-based, o cómo has resuelto la colisión con el directorio no vacío.

### Response:

Implementado ticket T-C10-01

</br>

**Prompt 2:**

Agent: Claude Code - Sonnet 4.6

### Request:

Actúa como sport-itsm-architect e implementa UN SOLO ticket: docs/backlog/C10/tickets/T-C10-02.md · ESLint 9 flat config, Prettier 3 y el esquema de tags Raíz del repositorio: d:\repositories\ai4devs\proyecto_final\AI4Devs-finalproject

#### Precondición

T-C10-01 debe estar hecho. Compruébalo antes de tocar nada:

    ls package.json nx.json tsconfig.base.json && pnpm nx report

Si no existe el workspace, PARA y dilo: este ticket no lo crea.

#### El ticket es el contrato

Lee docs/backlog/C10/tickets/T-C10-02.md entero. Su `## Scope` es exhaustivo y su "Out of scope" es vinculante. Lee además:

- CLAUDE.md §3, apartados "Style rules" y "What NOT to do" — de ahí salen las reglas de Prettier (comillas simples, punto y coma) y la prohibición de reglas ESLint estilísticas que entren en conflicto con Prettier.
- docs/product/ARCHITECTURE.md §5.2 — el esquema de tags que este ticket declara.
- docs/product/ARCHITECTURE.md §4.1 — la tabla de bounded contexts, fuente autoritativa de los valores de `scope:`.

#### El vocabulario de tags — los tres ejes, completos

`scope:` son **15** valores: los 14 contextos de ARCHITECTURE.md §4.1 más `shared`.

    incident, service-request, sla, service-catalog, knowledge, identity-access,
    approval, notification, audit, reporting, problem, change, release, asset-config, shared

Los cuatro genéricos de soporte —`approval`, `notification`, `audit`, `reporting`— vienen de ADR-001 y son tan obligatorios como los demás: si faltan, las épicas C15, C16, C17 y C18 no podrán taggear sus librerías y el fallo aparecerá meses después.

`platform:` ∈ {backend, frontend, shared}.

`type:` ∈ {domain, application, infrastructure, feature, ui, data-access, contracts, util, app, e2e} — `app` y `e2e` incluidos, por ADR-002.

#### Lo que NO debes hacer — el riesgo real de este ticket

**La matriz `depConstraints` es T-C10-03, no este ticket.** Es la trampa evidente: cualquiera que configure `@nx/enforce-module-boundaries` escribe la matriz a continuación por inercia. Aquí solo se declara el VOCABULARIO de tags —qué valores existen en cada eje— y se deja la regla que los consume para el siguiente ticket, que tiene su propia verificación.

Tampoco crees ningún proyecto: sigue sin haber aplicaciones ni librerías, y este ticket no las añade.

#### Verificación

Tres de los cuatro criterios son ejecutables. Córrelos de verdad y pega la salida:

1. `pnpm nx run-many -t lint` termina con código de salida 0.
2. `pnpm prettier --check .` no reporta ninguna diferencia de formato.
3. `eslint.config.mjs` es flat config (exporta un array), no queda ningún `.eslintrc` ni fallback a él, y los tres ejes de tags con sus valores permitidos están enumerados **en un solo sitio** del fichero.

El cuarto criterio ("el vocabulario declarado aquí es el conjunto que validará la regla de T-C10-03") no es ejecutable hoy: es estructural. Confírmalo señalando la constante o bloque exacto que T-C10-03 va a consumir, y comprueba que no está duplicado en otro punto del fichero.

Ojo con el criterio 1: con cero proyectos en el workspace, `run-many -t lint` puede salir 0 sin haber ejecutado nada. Dilo si es el caso —"0 proyectos, nada que lintar"— en vez de presentarlo como prueba de que la config funciona. Para demostrar que carga de verdad, ejecuta también `pnpm eslint --print-config eslint.config.mjs` o equivalente y pega la salida.

Si algún criterio falla, dilo con su salida completa. Un criterio no ejecutado se reporta como no ejecutado, nunca como pasado.

#### Restricciones

- No modifiques nada bajo docs/ ni bajo .claude/. El ticket no se edita ni se marca como hecho.
- No instales dependencias que el Scope no pida.
- No introduzcas un segundo gestor de paquetes: pnpm es el único soportado.
- No hagas commit ni push salvo que te lo pida explícitamente.

#### Informa al terminar

Qué ficheros has creado o modificado, la salida de las verificaciones, cuántos valores has declarado en cada eje de tags, y cualquier decisión que el ticket no cubriera — en particular si has tenido que elegir entre configurar `angular-eslint` ahora o dejarlo para cuando exista `apps/web` (T-C10-05).

### Response:

Implementado ticket T-C10-02

</br>

**Prompt 3:**

Agent: Claude Code - Sonnet 4.6

### Request:

Actúa como sport-itsm-architect e implementa UN SOLO ticket:
docs/backlog/C10/tickets/T-C10-03.md · Encode the type constraint matrix and the scope/platform rules
Raíz del repositorio: d:\repositories\ai4devs\proyecto_final\AI4Devs-finalproject

#### Precondición

T-C10-01 y T-C10-02 deben estar hechos. Compruébalo antes de tocar nada:

    ls package.json nx.json eslint.config.mjs && pnpm nx report

`eslint.config.mjs` debe existir ya, en flat config, con el vocabulario de tags de tres ejes
declarado en un solo sitio. Si no está, PARA y dilo: este ticket lo consume, no lo crea.

#### Por qué este ticket importa más que los demás

Su propio Context lo dice citando ARCHITECTURE.md §5.4: es "the single most important
structural rule in this document". Las diecinueve épicas están dimensionadas asumiendo que un
import ilegal **rompe la build**, no que lo caza alguien en revisión. Si esta configuración
queda mal, el error no se manifiesta aquí: se manifiesta dentro de seis meses como un grafo de
dependencias corrupto que ya nadie puede desenredar.

#### El ticket es el contrato

Lee docs/backlog/C10/tickets/T-C10-03.md entero, y con él:

- docs/product/ARCHITECTURE.md §5.3 — la matriz de diez filas, la regla de `scope:` y la de
  `platform:`. Es la fuente literal de lo que hay que codificar; transcríbela, no la deduzcas.
- docs/product/ARCHITECTURE.md §5.2 — "exactamente tres tags, sin excepciones".
- docs/product/ARCHITECTURE.md §5.4 — el grafo permitido, para contrastar.
- CLAUDE.md §3, "What NOT to do" — la prohibición de relajar la regla para que compile un
  import ilegal.

Consume el vocabulario de tags que T-C10-02 dejó declarado en un único punto de
`eslint.config.mjs`. **No lo redeclares ni lo dupliques**: si acabas con dos listas de tags en
el fichero, has roto el cuarto criterio de aceptación de T-C10-02.

Tres detalles de la matriz que se fallan con frecuencia:

- `type:app` puede depender de todos los tipos de su plataforma más `shared`, y es el ÚNICO
  que cruza contextos, porque es la raíz de composición y su scope es `scope:shared`.
- `type:e2e` solo puede depender de `type:contracts` y `type:util`. Nada más.
- **Ninguna** librería puede depender de un `type:app`. Esa fila no existe en la matriz: es una
  prohibición explícita que hay que codificar.

#### El problema de verificación — resuélvelo así, no lo ignores

Cinco de los seis criterios de aceptación exigen sondas sobre proyectos: import de `type:domain`
a `type:infrastructure`, de `platform:frontend` a `platform:backend`, de un `scope:` a otro, y
un proyecto declarado con dos tags. **En este punto el workspace tiene cero proyectos**: las
aplicaciones son T-C10-04→06 y las librerías de `identity-access` son T-C10-18.

No puedes verificarlos sin proyectos, y no puedes crear los proyectos de verdad. La salida es
**andamiaje desechable**:

1. Genera librerías temporales mínimas, con nombres inequívocamente de sonda
   (`libs/__probe/a`, `libs/__probe/b`, …) y los tags que cada criterio necesita. NO uses los
   nombres reales de contextos ni de aplicaciones: `scope:identity-access` es de T-C10-18 y no
   debe aparecer aquí ni siquiera de forma temporal.
2. Introduce el import ilegal correspondiente.
3. Ejecuta `pnpm nx lint <proyecto>` y comprueba que **falla**, y que el mensaje nombra la regla
   y los dos tags implicados. Pega la salida del error: un criterio de este ticket se demuestra
   con el fallo, no con el éxito.
4. Repite para los cinco casos, incluido el proyecto con dos tags en vez de tres.
5. **Borra todo el andamiaje** y demuestra con `git status` y `pnpm nx show projects` que el
   workspace vuelve a tener cero proyectos y ningún residuo.

Si crees que hay una forma mejor de verificarlo, dila antes de ejecutarla. Lo que NO es
aceptable es declarar pasado un criterio que no has ejecutado.

#### Lo que NO debes hacer

- **No crees ningún proyecto real.** `apps/api`, `apps/web`, `apps/api-e2e`, `apps/web-e2e` y
  cualquier `libs/shared/*` o `libs/<contexto>/*` pertenecen a tickets posteriores. El único
  andamiaje permitido es el desechable de la sección anterior, y se borra antes de cerrar.
- **No relajes ninguna regla para que algo pase.** Si una sonda no falla cuando debería, el fallo
  está en tu configuración, no en la regla: arréglala. Añadir una excepción, un `allow` o un
  `ignoredCircularDependencies` para salir del paso es exactamente lo que CLAUDE.md §3 prohíbe.
- No toques el vocabulario de tags de T-C10-02 salvo que esté objetivamente mal; si lo está,
  dilo en el informe en lugar de corregirlo en silencio.

#### Verificación final

Además de las cinco sondas, con el andamiaje ya borrado:

- `pnpm nx run-many -t lint` pasa sobre el workspace vacío.
- `pnpm nx graph --file=tmp/graph.json` se genera sin aristas prohibidas (trivial con cero
  proyectos: dilo así, no lo presentes como prueba de nada).
- `git status` limpio de sondas y de proyectos temporales.

#### Restricciones

- No modifiques nada bajo docs/ ni bajo .claude/. El ticket no se edita ni se marca como hecho.
- No instales dependencias que el Scope no pida.
- No hagas commit ni push salvo que te lo pida explícitamente.

#### Informa al terminar

La configuración `depConstraints` resultante, la salida de las cinco sondas (con el mensaje de
error de cada una), la confirmación de que el andamiaje quedó borrado, y cualquier fila de la
matriz de §5.3 que no hayas podido expresar en `@nx/enforce-module-boundaries` — si la hay, es
un hallazgo de arquitectura, no un detalle de implementación: dilo claramente.

### Response:

Implementado ticket T-C10-03

</br>

**Prompt 4:**

Agent: Claude Code - Sonnet 4.6

### Request:

Actúa como backend-engineer e implementa UN SOLO ticket: docs/backlog/C10/tickets/T-C10-04.md · Scaffold `apps/api` — NestJS 11 composition root with validated configuration
Raíz del repositorio: d:\repositories\ai4devs\proyecto_final\AI4Devs-finalproject

#### Precondición
T-C10-01, T-C10-02 y T-C10-03 deben estar hechos. Compruébalo antes de tocar nada:

    ls package.json nx.json eslint.config.mjs tools/boundary-probes/verify.mjs
    pnpm nx report
    pnpm verify:boundaries

`verify:boundaries` debe salir 0 con las 9 sondas en verde. Si falla, PARA: la regla de fronteras
está rota y este ticket crea el primer proyecto que la va a pisar de verdad.

#### El ticket es el contrato
Lee docs/backlog/C10/tickets/T-C10-04.md entero. Su `## Scope` es exhaustivo y su lista de
"Out of scope" es vinculante — remite a tres tickets distintos, no los invadas. Lee además:

- CLAUDE.md §2 (versiones pinneadas) y §3, apartados "Backend idioms" y "What NOT to do":
  de ahí salen la prohibición de `process.env` en código de feature, el `ValidationPipe` global,
  el prefijo `/api` sin health endpoints dentro, y la prohibición de `console.log`.
- docs/product/ARCHITECTURE.md §5.4 y §6.3 — qué es la raíz de composición y por qué `apps/api`
  es el único proyecto backend autorizado a cruzar contextos.
- ADR-002 (`type:app`) y ADR-003 (puertos resueltos en la raíz de composición).

#### Express 5, no Express 4 — el Scope del ticket está desactualizado
El `## Scope` del ticket dice "NestJS 11 on **Express 4** (pin intentional, `CLAUDE.md` §2)".
Esa línea ya no es correcta y **CLAUDE.md §2 la reemplaza**: `@nestjs/platform-express@11` incluye
Express 5 desde su versión `11.0.0`, así que NestJS 11 nunca ha ido sobre Express 4. El pin era
inalcanzable, no obsoleto. CLAUDE.md, ARCHITECTURE.md y COMPONENTS.md ya están corregidos; el
ticket no, porque los tickets no se editan.

En consecuencia:
- Instala NestJS 11 tal cual y deja que llegue Express 5.
- **No añadas un override de pnpm** ni ninguna otra maniobra para forzar Express 4.
- Verifica con `pnpm why express` qué versión ha quedado y pega la salida en el informe.
- Ten en cuenta que Express 5 cambia el emparejado de rutas (`path-to-regexp@8`): los comodines
  tipo `*` ya no valen como en Express 4. Si defines exclusiones de ruta para el prefijo `/api`,
  compruébalas de verdad en vez de asumir la sintaxis antigua.

#### Lo que NO debes hacer — el riesgo real de este ticket
Es el primer proyecto real del monorepo y el generador de Nx quiere darte una aplicación
"completa". No la aceptes tal cual:

- **No generes `apps/api-e2e`.** El generador de Nx crea el proyecto e2e por defecto; es T-C10-06,
  y además ese ticket lo quiere con Cypress + Cucumber, no con lo que ponga el generador.
  Pásale `--e2eTestRunner=none` y verifica después que solo existe UN proyecto.
- **Ni logging estructurado (pino), ni health probes (`/health/live`, `/health/ready`), ni Swagger.**
  Son del slice de observabilidad (T-C10-28). Este ticket SOLO reserva las exclusiones de ruta que
  esos endpoints usarán, para que la lista de exenciones de T-C10-28 no cambie después. Reservar
  la exclusión no es implementar el endpoint: no crees controladores de health.
- **Ni conexión a base de datos, ni TypeORM, ni `data-source.ts`, ni migraciones** (T-C10-16).
- **Ni `apps/web`** (T-C10-05), **ni ninguna librería bajo `libs/`** (T-C10-07 en adelante).
- **No toques `eslint.config.mjs`.** El vocabulario de tags y la matriz `depConstraints` son de
  T-C10-02 y T-C10-03. Si el generador de Nx intenta escribir un `.eslintrc` o modificar la config
  raíz, deshazlo: la flat config es la única fuente.
- **pnpm es el único gestor.** Si algún generador invoca npm y aparece un `package-lock.json`,
  párate y dilo.

Adelantarte convierte tickets greenfield en tickets de gap. Haz exactamente el Scope.

#### Verificación — ejecútala, no la afirmes
Los cinco criterios de aceptación son mecánicos. Ejecuta cada uno de verdad y pega su salida:

1. `pnpm nx build api` termina con éxito.
2. `pnpm nx serve api` arranca y **responde en el puerto configurado**. No basta con ver el log de
   arranque: levanta el proceso en segundo plano, haz una petición HTTP real, pega la respuesta y
   mata el proceso. Si lo dejas colgado, dilo.
3. Quita una clave de configuración obligatoria del entorno y arranca: debe **fallar rápido** con un
   mensaje que **nombre la clave que falta**. Pega el mensaje literal. Un arranque con `undefined`
   es un fallo del criterio, no un detalle.
4. Los tags del proyecto son exactamente `platform:backend`, `scope:shared`, `type:app` — ni uno más
   ni uno menos — y `pnpm nx lint api` pasa la regla de fronteras de T-C10-03.
5. `grep -rn "process.env" apps/api/src` devuelve coincidencias ÚNICAMENTE dentro del módulo de
   configuración. Pega la salida completa del grep, no un resumen.

Y dos comprobaciones más, porque este ticket cambia el estado del workspace:

6. `pnpm verify:boundaries` sigue en verde ahora que existe un proyecto real.
7. `pnpm nx show projects` devuelve exactamente `api` y nada más (en particular, ningún `api-e2e`).

Si algún criterio falla, dilo con su salida completa. Un criterio que no has ejecutado se reporta
como no ejecutado, nunca como pasado.

#### Restricciones
- No modifiques nada bajo `docs/` ni bajo `.claude/`. El ticket no se edita ni se marca como hecho.
- No instales dependencias que el Scope no pida.
- No hagas commit ni push salvo que te lo pida explícitamente.
- Si necesitas red y no la tienes, para y dilo.

#### Informa al terminar
- Qué ficheros has creado o modificado, y qué dependencias has añadido con su versión exacta.
- La salida de las siete verificaciones.
- La salida de `pnpm why express`, confirmando Express 5 y que no hay ningún override.
- Qué te ha generado Nx que hayas tenido que quitar o recortar por estar fuera de Scope.
- Cualquier nota de estado que este ticket deje obsoleta en `readme.md` §2.3.6 o en
  `docs/product/ARCHITECTURE.md` §12.3: **repórtala, no la corrijas** — yo decido si se actualiza.

### Response:

Implementado ticket T-C10-04

</br>
