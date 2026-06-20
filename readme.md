## Índice

- [0. Project sheet](#0-project-sheet)
	- [0.1. Full name](#01-full-name)
	- [0.2. Project name](#02-project-name)
	- [0.3. Brief project description](#03-brief-project-description)
	- [0.4. Project URL](#04-project-url)
	- [0.5. URL o archivo comprimido del repositorio](#05-url-o-archivo-comprimido-del-repositorio)
- [1. Product overview](#1-product-overview)
- [2. System architecture](#2-system-architecture)
- [3. Data Model](#3-data-model)
	- [3.1. Data model diagram](#31-data-model-diagram)
	- [3.2. Description of main entities](#32-description-of-main-entities)
- [4. API Specification](#4-api-specification)
- [5. User Stories](#5-user-stories)
- [6. Development Tickets](#6-development-tickets)
- [7. Pull Requests](#7-pull-requests)
- [8. Prompts - AI usage](prompts.md)

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

Implementation guides:
- [Frontend README](front/README.md)
- [Backend README](back/README.md)
- [Local Development Setup](docs/local-development-setup.md)


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

## 4. API Specification

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. User Stories

The main MVP user stories, written with product best practices (clear persona-goal-value format, testable acceptance criteria, and traceability to FR/data model), are documented in:

- [MVP Main User Stories](docs/product/4_User-stories.md)

Covered scope includes identity, pantry management, receipt OCR flow, expiration intelligence, notifications, price comparison, sharing, waste tracking, and use-next prioritization.

Post-MVP feature roadmap, gap analysis, and extended requirements are documented in:

- [Extended Non-MVP PRD](docs/product/5_Extended-Non-MVP-PRD.md)

Future feature roadmap, not in the scope for the extended MVP are documented in:
- [Future functionalities](docs/product/6_Future-Capabilities.md)
---

## 6. Development Tickets

The main MVP development tickets, with full end-to-end implementation technical detail, are documented in:

- [Tickets Index](docs/tickets/README.md)

Selection of 3 main tickets (backend, frontend, database):
1. Backend - [TKT-011 - Backend Receipt Upload and OCR Pipeline](docs/tickets/TKT-011-backend-receipt-ocr-pipeline.md)
2. Frontend - [TKT-012 - Frontend Pantry Add Item Flow](docs/tickets/TKT-012-frontend-pantry-add-item-flow.md)
3. Database - [TKT-013 - Database Core Schema for Household, Pantry and Events](docs/tickets/TKT-013-database-core-schema-household-pantry-events.md)

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

## 8. Prompts - AI usage
[Prompts and AI usage](prompts.md)


