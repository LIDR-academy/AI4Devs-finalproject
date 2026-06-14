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

### **0.2. Nombre del proyecto:**

### **0.3. Descripción breve del proyecto:**

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

The product is an **enterprise Service Desk platform** that acts as the **Single Point of Contact (SPOC)** between end users and the IT organization. It centralizes the capture, triage, fulfillment, and resolution of all support interactions — Incidents, Service Requests, Problems, and Changes — within a single ITSM workflow engine governed by Service Level Agreements (SLAs).

**Problem it solves**

Support organizations frequently operate with fragmented channels (email, phone, chat, walk-ups), no consistent ticket lifecycle, manual routing, and no measurable SLA accountability. This leads to lost requests, slow response and resolution times, low First Contact Resolution (FCR), and limited visibility for management. The platform replaces these ad-hoc operations with a **standardized, auditable, and metric-driven service operation model** aligned with ITIL-based practices.

**Value delivered**

- **Operational consistency:** every interaction follows a controlled lifecycle (logging → categorization → prioritization → assignment → resolution → closure).
- **Accountability:** SLA timers, escalation rules, and audit trails make response and resolution commitments measurable and enforceable.
- **Efficiency:** automated categorization, assignment, and self-service deflection reduce manual effort and Mean Time to Resolution (MTTR).
- **Experience:** a Self-Service Portal and omnichannel intake give end users transparency over their requests and status.
- **Decision support:** real-time KPIs and dashboards (FCR, MTTR, SLA Compliance, CSAT, backlog) drive continual service improvement.

**Target audience (personas)**

- **End Users / Requesters:** employees or customers who report Incidents and submit Service Requests.
- **Service Desk Agents (L1):** first-line operators who log, triage, and resolve or route tickets.
- **Support Analysts / Resolver Groups (L2/L3):** specialist teams that handle escalated work.
- **Service Owners / Process Owners:** accountable for service quality and process compliance.
- **Service Managers:** monitor performance, SLAs, and operational KPIs.
- **System Administrators:** configure catalog, workflows, SLAs, and access control.

### **1.2. Características y funcionalidades principales:**

> Enumera y describe las características y funcionalidades específicas que tiene el producto para satisfacer las necesidades identificadas.

The platform delivers the following core capabilities:

**1. Ticket Management (Incident & Service Request)**
End-to-end ticket lifecycle management with categorization, prioritization (Impact × Urgency → Priority matrix), status tracking, work notes, and closure codes. Supports Incident Management and Service Request fulfillment as distinct but unified workflows.

**2. Omnichannel Intake**
Capture of tickets from multiple channels — Self-Service Portal, email-to-ticket, chat, and phone-logged entries — normalized into a single ticket model with a unique reference number.

**3. Self-Service Portal & Knowledge Base**
End-user portal for submitting requests, tracking status, and searching Knowledge Articles. Knowledge-centered deflection reduces ticket volume and improves First Contact Resolution (FCR).

**4. Service Catalog Management**
A structured catalog of Service Offerings with request forms, eligibility rules, and predefined fulfillment workflows, enabling standardized and repeatable Service Request handling.

**5. Workflow & Automation Engine**
Configurable business rules for automated categorization, routing, and assignment to the correct Resolver Group or Assignment Queue, including round-robin/skill-based assignment and task orchestration.

**6. SLA Management & Escalation**
Definition of SLA/OLA targets (response and resolution) per service, priority, and customer. Automated SLA timers, breach warnings, and tiered escalation (functional and hierarchical) enforce service commitments.

**7. Assignment & Queue Management**
Support groups, queues, and workload distribution that route tickets to the appropriate team and provide agents with prioritized work lists.

**8. Problem Management**
Linking of recurring Incidents to a Problem record, Root Cause Analysis (RCA), Known Error tracking, and Workaround publication to reduce repeat Incidents.

**9. Change Enablement**
Logging and approval of Changes through an Approval Engine (including CAB-style approval flows), with risk categorization and linkage to affected services and Configuration Items (CIs).

**10. Notification Framework**
Event-driven email/portal notifications to requesters and agents on status changes, assignments, approvals, and SLA breaches.

**11. Approval Engine**
Configurable multi-level approval workflows for Service Requests and Changes, with delegation and audit trails.

**12. Reporting, Dashboards & Analytics**
Operational and management dashboards exposing key KPIs — FCR, MTTR, MTTA, SLA Compliance Rate, Reopen Rate, Backlog Volume, CSAT, and Agent Productivity — to support continual service improvement.

**13. Identity & Access Management (RBAC)**
Role-based access control for End Users, Agents, Resolver Groups, and Administrators, ensuring least-privilege access and auditability.

**14. Audit Trail & Activity History**
Immutable history of all ticket transitions, field changes, and user actions to guarantee traceability and compliance.

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

