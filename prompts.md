> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras


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

Actúa como un Product Manager senior con experiencia en herramientas de gestión de proyectos ágiles (tipo Jira/Linear). Quiero crear un PRD para un producto llamado Tandem: una plataforma para centralizar la planificación, ejecución y seguimiento del desarrollo de software entre Product Owners y Developers, evitando la fragmentación de información entre documentos, chats y hojas de cálculo dispersas.

Antes de escribir nada, hazme todas las preguntas que necesites sobre problema, usuarios objetivo, alcance del MVP y flujo de trabajo principal para poder redactar un PRD completo.

**Prompt 2:**

Con las respuestas anteriores, redacta el PRD completo en `docs/prd.md` con esta estructura: resumen ejecutivo, problema a resolver, usuarios objetivo, propuesta de valor, objetivos medibles, alcance (MVP y fuera de alcance), arquitectura de alto nivel, user stories por rol, flujo de trabajo del entregable, requisitos no funcionales y criterios de éxito.

**Prompt 3:**

En el punto 9 del PRD (flujo de trabajo del entregable) creo que falta dejar claro que un entregable no puede pasar a desarrollo hasta que el Tech Lead valide los requisitos Y los reviewers aprueben el análisis técnico de los developers. Revisa esa sección y ajústala para que quede explícita esa doble validación, incluyendo qué pasa si el Tech Lead bloquea el entregable.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

Actúa como arquitecto de software. A partir de `docs/prd.md`, propón el stack tecnológico y la arquitectura de alto nivel para Tandem: backend que expone una API con la lógica de negocio, y frontend de escritorio nativo para macOS que la consume. Fija versiones concretas de cada tecnología, no dejes nada en genérico tipo "una base de datos SQL".

**Prompt 2:**

No todas las entidades del modelo de datos tienen la misma complejidad: Deliverable, TechnicalAnalysis y WorkItem tienen máquinas de estado con bastantes invariantes, pero Users, Workstreams o Comments son básicamente CRUD. ¿Tiene sentido aplicar DDD/hexagonal a todo el backend por igual, o solo donde de verdad aporta valor? Documenta la decisión y la regla práctica para saber a qué patrón se acoge un módulo nuevo.

**Prompt 3:**

Genera un diagrama de arquitectura en mermaid que muestre el frontend, la API, el núcleo del dominio (CQRS + eventos), los módulos de soporte, la base de datos y el almacenamiento de adjuntos, y justifica los beneficios y sacrificios de este enfoque.

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

Con el stack ya decidido en `docs/backend.md` y `docs/frontend.md`, escribe una descripción breve de los componentes principales del sistema (frontend, backend, autenticación, base de datos, almacenamiento de adjuntos, notificaciones), indicando la tecnología concreta usada en cada uno.

**Prompt 2:**

Falta explicar cómo se generan las notificaciones y cómo se relaciona el cliente Swift con el contrato de la API. Añádelo a la descripción de componentes.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

Propón la estructura de carpetas del backend (NestJS) separando claramente el núcleo del dominio (DDD ligero + CQRS) de los módulos de soporte (Controller → Service → Prisma), y la estructura de carpetas del frontend (SwiftUI) organizada por features. Documéntalo en `docs/backend.md` y `docs/frontend.md`.

**Prompt 2:**

Revisa la estructura de carpetas del núcleo del backend: cada agregado (deliverables, requirements, technical-analyses, work-items, blockers) debería tener sus propias subcarpetas domain/application/infrastructure/interface. Ajusta el árbol de carpetas para reflejarlo.

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

Aún no hemos decidido proveedor de hosting. Propón un pipeline de CI con GitHub Actions para el backend (lint, typecheck, tests con Postgres de servicio, build de imagen Docker) y otro para el frontend (runner macOS, SwiftLint, xcodebuild test, build firmado), dejando explícito qué queda pendiente de decisión y qué no depende de esa decisión.

**Prompt 2:**

Documenta esos pendientes de decisión en una sección aparte para no perderlos de vista (proveedor de hosting, storage de adjuntos, necesidad de WebSockets, CD).

### **2.5. Seguridad**

**Prompt 1:**

Necesito definir la estrategia de autenticación y autorización de Tandem. Los usuarios pueden tener varios roles a la vez (admin, product_owner, developer, team_lead) sin una entidad de roles independiente. Recomiéndame cómo implementar la autenticación (JWT vs sesión) y cómo derivar los permisos de esos roles en NestJS, incluyendo cómo guardar el token de forma segura en un cliente de escritorio macOS.

**Prompt 2:**

Algunas reglas de autorización son más finas que el rol global, por ejemplo "solo el Tech Lead puede aprobar un Deliverable" o "solo un reviewer_id concreto del Deliverable puede aprobar su TechnicalAnalysis". ¿Dónde debería vivir esa validación, en la entidad de dominio o en el handler que la invoca? Explica el motivo de tu recomendación.

### **2.6. Tests**

**Prompt 1:**

Define la estrategia de testing para el backend y el frontend de Tandem, diferenciando entre el núcleo del dominio (con reglas de negocio no triviales) y los módulos CRUD de soporte. Indica qué framework usar en cada capa y qué flujos end-to-end son críticos de cubrir.

---

### 3. Modelo de Datos

**Prompt 1:**

Actúa como ingeniero de software experto en modelado de datos. A partir de `docs/prd.md`, diseña el modelo de datos lógico de Tandem: entidades principales con sus atributos y tipos, relaciones entre ellas y las reglas de negocio clave que hay que respetar en cualquier transición de estado. Antes de proponer nada, pregúntame las dudas que tengas sobre las entidades menos claras del PRD (por ejemplo, cómo se relacionan Requirement, RequirementType, Form y FormField).

**Prompt 2:**

Añade dos diagramas en mermaid: uno conceptual de clases y uno entidad-relación con claves primarias y foráneas. Usa ULID como tipo de identificador en todas las entidades.

**Prompt 3:**

Revisa la entidad WorkItem: debe poder pertenecer a un Deliverable o directamente a un Workstream, pero nunca a los dos a la vez ni a ninguno. Añade esa restricción como regla de negocio explícita y refleja en el diagrama que ambas relaciones son opcionales pero mutuamente excluyentes.

---

### 4. Especificación de la API

**Prompt 1:**

A partir de `docs/prd.md` y `docs/modelo-datos.md`, documenta en formato OpenAPI 3 los 3 endpoints más representativos del flujo de un entregable: crear un requisito funcional, aprobar la revisión funcional (transición de estado por el Tech Lead) y listar work items para el board Kanban con filtros. Incluye los schemas de request/response y añade un ejemplo de petición y respuesta para el primero.

**Prompt 2:**

En el endpoint de aprobación, añade las respuestas de error: qué debe devolver la API si el usuario no tiene rol team_lead, y qué debe devolver si el entregable no está en el estado esperado.

---

### 5. Historias de Usuario

**Prompt 1:**

De todas las user stories del PRD (sección 8), elige las 3 que mejor representen el flujo completo del producto: una del Product Owner definiendo requisitos, una del Tech Lead revisando/aprobando un entregable, y una del Developer trabajando en el board Kanban. Redáctalas con esta plantilla:

```
Como [rol], quiero [acción], para [beneficio].

Criterios de aceptación:
- Dado... cuando... entonces...
```

**Prompt 2:**

Revisa los criterios de aceptación de la historia del board Kanban: falta cubrir qué pasa si intento mover un work item a "done" con campos obligatorios sin completar, y qué pasa si tiene un bloqueo abierto. Añádelo.

---

### 6. Tickets de Trabajo

**Prompt 1:**

Necesito 3 tickets de trabajo detallados a partir de la historia de usuario de revisión funcional del Tech Lead: uno de backend, uno de frontend y uno de base de datos. Divide el trabajo en tareas técnicas pequeñas y concretas, no lo dejes en una descripción genérica. Para cada ticket incluye: descripción, tareas técnicas paso a paso, criterios de aceptación y dependencias con los otros tickets.

**Prompt 2:**

El ticket de backend debe respetar la arquitectura del núcleo (DDD ligero + CQRS): que quede claro que la transición se modela como un Command con su Handler, que la autorización por rol se valida en el handler y no en la entidad, y que la transición emite un evento de dominio.

**Prompt 3:**

En el ticket de base de datos añade las restricciones de las claves foráneas obligatorias (NOT NULL, ON DELETE RESTRICT) y un seed mínimo para poder probar el flujo completo en local.

---

### 7. Pull Requests

**Prompt 1:**

**Prompt 2:**

**Prompt 3:**
