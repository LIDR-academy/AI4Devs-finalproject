## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Iván Gómez Rodríguez

### **0.2. Nombre del proyecto:**

Sport IT Service Management

### **0.3. Descripción breve del proyecto:**

Sport ITSM is an IT Service Management platform dedicated to supporting the Sports Competition Management System. It provides a centralized environment for managing incidents, service requests, problems, changes, releases, assets, and operational processes related to the competition platform, ensuring service availability, traceability, and continuous improvement throughout the application lifecycle.

```text
Sports Competition Management System (SCMS)
                 │
                 │ Support & Operations
                 ▼
             Sport ITSM
                 │
      ┌──────────┼──────────┐
      │          │          │
      ├── Incident Management
      ├── Service Request Management
      ├── Problem Management
      ├── Change Management
      ├── Release Management
      ├── Knowledge Base
      ├── Asset & Configuration Management
      └── SLA & Reporting
```

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

**Product purpose**

The product is **Sport ITSM**, a full **IT Service Management (ITSM) platform** dedicated to supporting the **Sports Competition Management System (SCMS)** — an application for managing competitions (tournaments, leagues, and group/division formats). It provides a centralized environment to manage **Incidents, Service Requests, Problems, Changes, Releases, Assets, and operational processes** related to the SCMS platform, ensuring **service availability, traceability, and continuous improvement** across the application lifecycle. The Service Desk acts as the **Single Point of Contact (SPOC)** for the platform's users — players, team managers, tournament organizers, and match officials — while the engineering and operations organization uses the platform to govern platform Changes, Releases, and Assets, all under Service Level Agreements (SLAs).

> **Scope:** Sport ITSM supports the _SCMS platform_, not the sporting operation itself. In-application sport decisions (reschedules, roster changes, result disputes) are made by organizers and officials **inside** SCMS and are out of scope; they reach Sport ITSM only when they surface as a platform defect or an entitled service request. Competition entities (Tournament, Match, Standings…) are therefore the **affected subject** of a ticket, never tickets in their own right. Conversely, **Changes and Releases of the SCMS platform itself** (new versions, features, configuration, hotfixes) are fully **in scope** and governed by the platform.

**Problem it solves**

Competition platforms concentrate user demand into critical live windows — registration deadlines, match days, and finals — when any application failure (standings not updating, brackets not rendering, scores not saving, payments not processed) directly disrupts an event in progress, and when uncontrolled platform changes can trigger those very failures. Without a structured service management function, issues arrive through fragmented channels with no consistent ticket lifecycle, no prioritization of competition-impacting failures, no controlled path for platform changes and releases, and no measurable SLA accountability. Sport ITSM replaces this with a **standardized, auditable, and metric-driven service operation** — spanning support (Incident, Request, Problem) and platform evolution (Change, Release, Asset & Configuration) — that protects service availability when it matters most, aligned with ITIL-based practices.

**Value delivered**

- **Operational consistency:** every interaction follows a controlled lifecycle (logging → categorization → prioritization → assignment → resolution → closure).
- **Event protection:** Major Incident handling and tiered escalation prioritize failures during live competition windows (match days / finals) to minimize time-to-restore.
- **Controlled platform evolution:** Change Management and Release & Deployment Management deliver SCMS changes with risk assessment, approval, and CMDB impact analysis, reducing change-induced Incidents.
- **Accountability:** SLA timers, escalation rules, and audit trails make response and resolution commitments measurable and enforceable.
- **Efficiency:** automated categorization, assignment, and Knowledge-Base self-service deflection reduce manual effort and Mean Time to Resolution (MTTR).
- **Experience:** a Self-Service Portal gives players, organizers, and officials transparency over their tickets and status.
- **Traceability & decision support:** an end-to-end audit trail plus real-time KPIs and dashboards (FCR, MTTR, SLA Compliance, Change Success Rate, CSAT, backlog) drive continual service improvement.

**Target audience (personas)**

- **Player / Competitor:** end user reporting application issues or requesting account services.
- **Team Manager / Captain:** raises team-level support for a team's participation.
- **Tournament Organizer / Admin:** power user configuring competitions; higher entitlement tier.
- **Referee / Match Official:** reports scoring and result-entry issues.
- **League Administrator:** oversees multiple competitions; acts as escalation contact.
- **Service Desk Agent (L1):** first-line operator who logs, triages, and resolves or routes tickets.
- **Application Support Analyst (L2/L3):** platform specialists / engineering resolver group handling escalated work.
- **Change / Release Manager:** governs platform Changes and coordinates SCMS Releases and deployments.
- **Service Owner / Service Manager:** accountable for SCMS service quality, SLAs, and continuous improvement.
- **System Administrator:** configures catalog, workflows, SLAs, CMDB, and access control.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

Sport ITSM delivers the following core capabilities, spanning end-user support and platform operations for the SCMS platform:

**1. Ticket Management (Incident & Service Request)** End-to-end ticket lifecycle management with categorization, prioritization (Impact × Urgency → Priority matrix), status tracking, work notes, and closure codes. Handles **Incidents** (platform defects — e.g., standings not updating, bracket not rendering, scores not saving) and **Service Request** fulfillment as distinct but unified workflows. Each ticket records the **affected competition subject** (Tournament, League, Group, Bracket, Fixture, Standings, Registration, Roster, Team, Player Account) without treating it as the ticket itself.

**2. Omnichannel Intake** Capture of tickets from multiple channels — Self-Service Portal, email-to-ticket, in-app help, and phone-logged entries — normalized into a single ticket model with a unique reference number.

**3. Self-Service Portal & Knowledge Base** End-user portal for players, organizers, and officials to submit tickets, track status, and search Knowledge Articles (how-tos, known issues, workarounds). Knowledge-centered deflection reduces ticket volume and improves First Contact Resolution (FCR).

**4. Service Catalog Management** A structured catalog of platform-support Service Offerings with request forms, eligibility rules, and predefined fulfillment workflows — e.g., account creation, role/entitlement and organizer-access provisioning, password reset / account recovery, data export (fixtures, standings, rosters, results), and billing/registration-payment support.

**5. Workflow & Automation Engine** Configurable business rules for automated categorization, routing, and assignment to the correct Resolver Group or Assignment Queue, including skill-based and round-robin assignment and task orchestration.

**6. SLA Management & Escalation** Definition of SLA/OLA targets (response and resolution) per service and priority, with **event-aware policies** that tighten targets during live competition windows (match days / finals). Automated SLA timers, breach warnings, and tiered (functional and hierarchical) escalation enforce service commitments.

**7. Major Incident Management** Dedicated handling for high-impact failures that disrupt an event in progress (e.g., a scoring outage on finals day), with accelerated escalation, coordinated resolver engagement, and stakeholder communication to minimize time-to-restore.

**8. Assignment & Queue Management** Support groups, queues, and workload distribution that route tickets to the appropriate team and provide agents with prioritized work lists.

**9. Problem Management** Linking of recurring Incidents to a Problem record, Root Cause Analysis (RCA), Known Error (KEDB) tracking, and Workaround publication to reduce repeat platform Incidents.

**10. Change Management** Controlled lifecycle for modifications to the SCMS platform (standard, normal, and emergency changes) with risk and impact assessment, CAB-style approval via the Approval Engine, scheduling around competition windows, and change calendars to avoid conflicts with live events.

**11. Release & Deployment Management** Planning, packaging, and coordinated deployment of SCMS versions, with release calendars, rollout/rollback plans, and linkage of releases to the Changes and Configuration Items they deliver.

**12. Asset & Configuration Management (CMDB)** A Configuration Management Database tracking the SCMS platform's Configuration Items (services, environments, components) and their relationships, enabling impact analysis for Incidents, Problems, Changes, and Releases.

**13. Notification Framework** Event-driven notifications (email, push, in-app) to requesters and agents on status changes, assignments, approvals, and SLA breaches, integrated with the platform's participant notification channels.

**14. Approval Engine** Configurable multi-level approval workflows for entitled Service Requests and for Changes/Releases (e.g., organizer-access provisioning, change authorization), with delegation and audit trails.

**15. Reporting, Dashboards & Analytics** Operational and management dashboards exposing key KPIs — FCR, MTTR, MTTA, SLA Compliance Rate, Reopen Rate, Backlog Volume, CSAT, Agent Productivity — plus domain metrics such as time-to-restore for competition-impacting Incidents, Major Incident rate during live windows, Change Success Rate, and release lead time.

**16. Identity & Access Management (RBAC)** Role-based access control aligned with platform personas (Player, Team Manager, Organizer, Official, Agent, Analyst, Change/Release Manager, Service Manager, Administrator), integrated with the platform's identity provider / SSO and enforcing least-privilege access.

**17. Audit Trail & Activity History** Immutable history of all ticket, change, and release transitions, field changes, and user actions to guarantee traceability and compliance across the SCMS application lifecycle.

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

### **1.4. Instrucciones de instalación:**

> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.

### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

### **2.4. Infraestructura y despliegue**

> Detalla la infraestructura del proyecto, incluyendo un diagrama en el formato que creas conveniente, y explica el proceso de despliegue que se sigue

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.

### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto.

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**
