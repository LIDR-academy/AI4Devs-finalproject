## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-product-overview)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)
8. [AI Usage)](8.AI-Usage.md)

---
## 0. Project sheet

### **0.1. Full name:**
Jesús Ramírez Guerrero

### **0.2. Project name:**
RealSaveFooding - Stop Wasting Food & Money

### **0.3. Brief project description:**
RealSaveFooding is a pantry + consumption management mobile app concept focused on reducing food waste and saving money by helping people track what they buy, monitor expiration dates, and get recipe suggestions. A key capability is AI assistance—notably analyzing receipts to automatically infer items and suggest estimated expiration dates, reducing manual entry and improving automation.

### **0.4. Project URL:**
@ToDo JRG Missing - Not yet deployed
> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio
https://github.com/jesramgue/JRG-AI4Devs-finalproject.git

---

## 1. Product overview
[Product overview](docs/product/product.md)

## 2 System architecture
[System architecture](docs/architecture/architecture.md)


## 3. Data Model

### **3.1. Data model diagram:**
- [Database Model (conceptual + ER)](docs/db/database-model.md)

### **3.2. Description of main entities:**
The main entities of the MVP and their technical detail (typed attributes, PK/FK, relationships and constraints) are documented in:

- [Main Entities Specification](docs/db/main-entities.md)

Summary of core entities for implementation:

- USER: identity, authentication and account life cycle (soft delete).
- HOUSEHOLD: shared inventory collaboration and membership limit.
- HOUSEHOLD_MEMBER: user-household relationship with role and status.
- HOUSEHOLD_INVITATION: flow of invitations and acceptance statuses.
- PANTRY_ITEM: inventory unit with status, quantity and expiration.
- RECEIPT / RECEIPT_ITEM: OCR ingestion (header and lines) with optional mapping to inventory.
- EXPIRATION_ASSESSMENT: Suggested expiration traceability and confidence.
- CONSUMPTION_EVENT: consumption/waste events for analytics and auditing.
- NOTIFICATION_PREFERENCE: alert preferences per user.
- PRICE_CATALOG_ITEM: price reference dataset for comparison in MVP.

Design Notes:

- Normalized relational approach (3NF) to avoid duplicity and anomalies.
- Referential integrity through explicit foreign keys and domain constraints.
- Recommended PostgreSQL types: UUID, TIMESTAMPTZ, DATE and NUMERIC for monetary precision.

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

## 8. Prompts - AI usage
[Prompts and AI usage](prompts.md)


