> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

> **Nota:** en este proyecto no se usaron prompts de texto libre para generar los entregables — se usaron los *skills* (comandos) de Claude Code definidos en [`.claude/skills/`](.claude/skills/), que encapsulan el proceso guiado (preguntas dirigidas, plantillas y validaciones) para cada fase. Por eso, en lugar de transcribir un prompt, cada sección enlaza al skill que generó ese contenido. Las secciones sin skill asociado fueron completadas directamente en conversación con el asistente, y las que aún no tienen contenido quedan marcadas como pendientes (consistente con el [README](readme.md)).

## Índice

1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 1. Descripción general del producto

**Prompt 1:**

Skill [`/1-project-discovery`](.claude/skills/1-project-discovery/SKILL.md) — genera el PRD del proyecto mediante una entrevista guiada (problema, objetivo, usuarios, funcionalidades del MVP, restricciones, riesgos y puntos abiertos). Resultado: [docs/PRD-plataforma-arrendamiento-larga-estadia.md](docs/PRD-plataforma-arrendamiento-larga-estadia.md).

**Prompt 2:**

**Prompt 3:**

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

Skill [`/architecture`](.claude/skills/architecture/SKILL.md) — a partir del PRD y las historias de usuario, delega en el subagente `software-architect` el diseño del diagrama de sistemas, justificando el patrón (hexagonal + slicing por dominio) y sus trade-offs. Resultado: [docs/architecture/architecture.md §1](docs/architecture/architecture.md#1-diagrama-de-sistemas).

**Prompt 2:**

**Prompt 3:**

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

Mismo skill [`/architecture`](.claude/skills/architecture/SKILL.md), que además produce la tabla de componentes y tecnologías asociadas.

**Prompt 2:**

**Prompt 3:**

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

Mismo skill [`/architecture`](.claude/skills/architecture/SKILL.md), que genera la estructura de carpetas de backend (FastAPI, hexagonal por dominio) y frontend (React, por feature). Resultado: [docs/architecture/architecture.md §4-5](docs/architecture/architecture.md#4-estructura-de-carpetas--backend-fastapi).

**Prompt 2:**

**Prompt 3:**

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

> Pendiente — no se ha ejecutado ningún skill para esta sección todavía; no hay infraestructura de despliegue definida (ver [README §2.4](readme.md#24-infraestructura-y-despliegue)).

**Prompt 2:**

**Prompt 3:**

### **2.5. Seguridad**

**Prompt 1:**

Contenido derivado de las decisiones y riesgos ya documentados por el skill [`/architecture`](.claude/skills/architecture/SKILL.md) (autenticación JWT, puertos abstractos para aislar credenciales de proveedores externos, cumplimiento Ley 1581/2012), redactado directamente en conversación con el asistente al completar el README.

**Prompt 2:**

**Prompt 3:**

### **2.6. Tests**

**Prompt 1:**

> Pendiente — no se ha ejecutado ningún skill para esta sección; no existe código implementado ni tests todavía (ver [README §2.6](readme.md#26-tests)).

**Prompt 2:**

**Prompt 3:**

---

### 3. Modelo de Datos

**Prompt 1:**

Mismo skill [`/architecture`](.claude/skills/architecture/SKILL.md), que genera el diagrama entidad-relación y la descripción de entidades a partir del PRD y las historias de usuario. Resultado: [docs/architecture/architecture.md §2](docs/architecture/architecture.md#2-diagrama-de-base-de-datos).

**Prompt 2:**

**Prompt 3:**

---

### 4. Especificación de la API

**Prompt 1:**

No se usó un skill dedicado — los 3 endpoints de ejemplo (`POST /inmuebles`, `GET /inmuebles`, `POST /identidad/validar`) se redactaron directamente en conversación con el asistente, a partir de los routers previstos en [docs/architecture/architecture.md §4](docs/architecture/architecture.md#4-estructura-de-carpetas--backend-fastapi) y de las historias de usuario correspondientes.

**Prompt 2:**

**Prompt 3:**

---

### 5. Historias de Usuario

**Prompt 1:**

Skill [`/2-user-stories`](.claude/skills/2-user-stories/SKILL.md) — descompone el PRD en historias de usuario individuales (una por archivo), con criterios de aceptación, notas técnicas, prioridad y estimación. Resultado: [docs/user-stories/](docs/user-stories/).

**Prompt 2:**

Skill [`/3-new-user-story`](.claude/skills/3-new-user-story/SKILL.md) — disponible para agregar nuevas historias de usuario a un proyecto ya en marcha, validando que encajen en el PRD existente. No se ha usado todavía en este proyecto.

**Prompt 3:**

---

### 6. Tickets de Trabajo

**Prompt 1:**

No se usó un skill dedicado (todavía no existe un skill de generación de tickets en [.claude/skills/](.claude/skills/)) — los 3 tickets de ejemplo (backend, frontend y base de datos para HU-001) se redactaron directamente en conversación con el asistente, a partir de la historia de usuario [HU-001](docs/user-stories/HU-001-publicacion-inmueble-propietario.md) y de la estructura de carpetas definida en la arquitectura.

**Prompt 2:**

**Prompt 3:**

---

### 7. Pull Requests

**Prompt 1:**

> Pendiente — el proyecto está en fase de diseño; no hay Pull Requests de implementación que documentar todavía (ver [README §7](readme.md#7-pull-requests)).

**Prompt 2:**

**Prompt 3:**
