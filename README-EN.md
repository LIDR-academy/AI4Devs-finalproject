# AI4Devs Final Project - AuditCare Timeline

## Table of Contents

0. Project Information
1. Product Overview
2. System Architecture
3. Data Model
4. API Specification
5. User Stories
6. Work Items
7. Pull Requests

---

# 0. Project Information

### 0.1. Full Name

Miriam Diaz Hernandez

### 0.2. Project Name

AuditCare Timeline

### 0.3. Project Description

AuditCare Timeline is a web application that uses Artificial Intelligence to build an auditable clinical timeline from medical notes.

The system allows users to register patients, store clinical encounters, extract relevant events using AI, and present a chronological timeline that can be reviewed by healthcare professionals.

Statewave is used as a contextual memory and traceability layer to maintain the patient's longitudinal context and preserve the provenance of generated information.

### 0.4. Project URL

https://github.com/MiriamDiazH/AI4Devs-finalproject

### 0.5. Repository URL or Compressed File

GitHub Repository:

https://github.com/MiriamDiazH/AI4Devs-finalproject

Compressed File:

AI4Devs-finalproject.zip

---

> **Disclaimer**
>
> This project is intended for educational purposes only.
> All patient data used during development and testing is synthetic.
> The application is not intended for real clinical use.

---

# 1. Product Overview

## 1.1. Objective

AuditCare Timeline is a web application designed for healthcare professionals that enables the reconstruction and visualization of a patient's clinical history through an AI-generated timeline.

The main goal is to reduce the time required to review extensive clinical records and facilitate the identification of relevant events while maintaining a high level of traceability and transparency regarding the information used.

To achieve this, the system combines:

* Artificial Intelligence to extract clinical events from unstructured text.
* Human review to validate generated information.
* Statewave as a contextual memory and traceability layer.

Statewave enables the system to maintain a longitudinal representation of the patient across multiple clinical encounters, preserving historical context and supporting the generation of auditable clinical timelines.

---

## 1.2. Main Features and Functionalities

### MVP

#### Patient Management

* Register synthetic patients.
* View basic patient information.
* Associate clinical encounters with patients.

#### Clinical Encounter Management

* Register medical consultations.
* Store free-text clinical notes.
* Link encounters to patients.

#### AI-Powered Event Extraction

* Automatic processing of clinical notes.
* Identification of diagnoses.
* Identification of symptoms.
* Identification of procedures.
* Identification of medications.
* Identification of relevant clinical findings.

#### Contextual Memory with Statewave

* Store longitudinal patient context.
* Preserve relevant clinical history.
* Retrieve context to enrich future extractions.
* Manage contextual information across multiple encounters.

#### Traceability and Provenance

* Preserve the original source of each event.
* Store the clinical text used by the AI.
* Save model confidence scores.
* Prepare events for future human review.

#### Clinical Timeline

* Chronological visualization of clinical events.
* Grouping by date and encounter.
* Simplified navigation through patient history.

---

### Future Features

#### Human Review

* Approve AI-generated events.
* Manually correct information.
* Reject incorrect events.

#### Advanced Auditing

* Complete modification history.
* Reviewer tracking.
* Comparison between AI-generated and validated versions.

#### Export

* Clinical PDF export.
* Structured JSON export.
* Timeline sharing.

#### Interoperability

* FHIR integration.
* EHR integration.
* Clinical document import.

#### Advanced Management

* Multi-user support.
* Role management.
* Access control.

---

## 1.2.1. Statewave Usage

Statewave is one of the core components of the system architecture.

Its primary role is to provide a contextual memory layer for AI-driven applications.

Within AuditCare Timeline, Statewave is used to:

* Maintain longitudinal patient context.
* Connect multiple clinical encounters.
* Preserve relevant information across sessions.
* Improve traceability of AI-generated outputs.
* Support the generation of consistent and auditable clinical timelines.

Unlike a traditional database, Statewave provides specialized capabilities for AI-oriented contextual memory management, improving the consistency and reliability of generated results.

---

## 1.3. User Experience and Workflow

### Main MVP Workflow

1. Create a patient.
2. Register a clinical encounter.
3. Enter a clinical note.
4. Process the note using AI.
5. Extract structured clinical events.
6. Update the patient's contextual memory in Statewave.
7. Retrieve relevant historical context.
8. Generate the clinical timeline.
9. Display the auditable chronological timeline.

### User Experience Principles

The system prioritizes:

* Ease of use.
* Fast access to clinical information.
* Reduced cognitive load.
* Transparency regarding AI-generated outputs.
* Efficient navigation through large clinical histories.

Screenshots, wireframes, and a demonstration video will be included in future project deliveries.

---

## 1.4. Installation Guide

### Requirements

* Node.js 22+
* Python 3.12+
* PostgreSQL 16+
* Docker and Docker Compose

### Required Services

The system requires:

* Next.js Frontend
* FastAPI Backend
* PostgreSQL
* Statewave

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://auditcare:auditcare@localhost:5433/auditcare
STATEWAVE_URL=http://localhost:8100
```

### PostgreSQL

```bash
docker compose up postgres -d
```

### Statewave

Official documentation:

https://www.statewave.ai/developers

Official repository:

https://github.com/smaramwbc/statewave

Installation:

```bash
git clone https://github.com/smaramwbc/statewave.git

cd statewave

cp .env.example .env

docker compose up -d
```

Verification:

```bash
curl http://localhost:8100/healthz
curl http://localhost:8100/readyz
```

Administrative Console:

```text
http://localhost:8081
```

### Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Verification:

```bash
curl http://localhost:8000/health
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Application:

```text
http://localhost:3000
```

### Full Environment Verification

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:8000/docs
```

Statewave API:

```text
http://localhost:8100/healthz
```

Statewave Admin:

```text
http://localhost:8081
```

If all services respond correctly, the environment is ready to run the MVP.

### Quick Checklist (Statewave-only)

Run these 3 commands to validate that AI extraction is fully routed through Statewave:

```bash
curl -sS http://localhost:8000/health && echo
curl -sS http://localhost:8100/healthz && echo
```

```bash
PATIENT_JSON=$(curl -sS -X POST http://localhost:8000/patients \
   -H 'Content-Type: application/json' \
   -d '{"name":"Statewave Checklist","birth_date":"1990-01-01","sex":"F"}')
PID=$(echo "$PATIENT_JSON" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

ENCOUNTER_JSON=$(curl -sS -X POST http://localhost:8000/encounters \
   -H 'Content-Type: application/json' \
   -d '{"patient_id":"'"$PID"'","date":"2026-06-12","type":"consultation","note_text":"Patient reports headache, nausea and photophobia. Analgesia is prescribed and follow-up in 48 hours is requested."}')
EID=$(echo "$ENCOUNTER_JSON" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

curl -sS -X POST "http://localhost:8000/encounters/$EID/extract-events" | jq 'length'
```

```bash
curl -sS "http://localhost:8000/patients/$PID/timeline" | jq '.events | length'
```

Expected result:

- `extract-events` returns a number greater than 0.
- `timeline.events` returns the same number of events or more.

---

# 2. System Architecture

## 2.1. Architecture Diagram

```mermaid
flowchart LR

A[Next.js Frontend]
--> B[FastAPI Backend]

B --> C[(PostgreSQL)]

B --> D[Statewave API :8100]

D --> B
```

The architecture follows a layered approach separating:

* Presentation
* Business Logic
* Persistence
* Contextual Memory
* AI Services

---

## 2.2. Main Components

### Frontend

* Next.js
* TypeScript
* TailwindCSS

### Backend

* FastAPI
* Python
* Pydantic

### Persistence

* PostgreSQL

### Contextual Memory

* Statewave

### Artificial Intelligence

* Statewave LLM (LiteLLM)

---

## 2.3. Project Structure

```text
AI4Devs-finalproject
│
├── backend
├── frontend
├── docs
├── infra
├── e2e
├── .github
├── prompts.md
└── README.md
```

---

## 2.4. Infrastructure and Deployment

```text
GitHub
   │
GitHub Actions
   │
Docker
   │
Railway / Render / Vercel
```

---

## 2.5. Security

* Sensitive values managed through `.env`.
* GitHub Secrets.
* Pydantic validation.
* ORM usage to prevent SQL Injection.
* HTTPS in production.
* No real clinical data is used.
* All patients are synthetic.
* Statewave is used only with test data.

---

## 2.6. Testing Strategy

The project will include:

* Unit tests.
* Integration tests.
* End-to-End tests for the main workflow.

---

# 3. Data Model

## 3.1. Diagram

```mermaid
erDiagram

PATIENT ||--o{ ENCOUNTER : has

PATIENT ||--o{ CLINICAL_EVENT : generates

ENCOUNTER ||--o{ CLINICAL_EVENT : contains

CLINICAL_EVENT ||--o{ AUDIT_LOG : records
```

---

## 3.2. Main Entities

### Patient

* id
* name
* birthDate
* sex

### Encounter

* id
* patientId
* date
* type
* noteText

### ClinicalEvent

* id
* encounterId
* category
* title
* description
* confidence
* sourceQuote

### AuditLog

* id
* entityId
* action
* actor
* timestamp

---

# 4. API Specification

## GET /health

Checks whether the backend is running.

## POST /patients

Create a patient.

## GET /patients

List patients.

## POST /encounters

Create a clinical encounter.

## POST /encounters/{id}/extract-events

Extract clinical events using AI.

## GET /patients/{id}/timeline

Retrieve the patient's clinical timeline.

---

# 5. User Stories

### US-01

As a healthcare professional,

I want to register a patient,

So that I can maintain their clinical history.

### US-02

As a healthcare professional,

I want to register clinical encounters,

So that I can document medical consultations.

### US-03

As a healthcare professional,

I want AI to extract clinical events,

So that I can reduce the time spent reviewing documentation.

### US-04

As a healthcare professional,

I want to visualize a timeline,

So that I can quickly understand the patient's clinical evolution.

---

# 6. Work Items

### BE-001

Initial FastAPI setup.

### BE-002

Patient model.

### BE-003

Encounter model.

### BE-004

AI extraction via Statewave LLM integration.

### BE-005

Statewave integration.

### FE-001

Initial Next.js setup.

### FE-002

Patient list screen.

### FE-003

Timeline visualization.

### DB-001

PostgreSQL schema design.

### QA-001

Health Check unit test.

---

# 7. Pull Requests

## PR-001 Initial Project Setup

Objective:

Create the foundational project structure.

Includes:

* FastAPI bootstrap
* Next.js bootstrap
* PostgreSQL
* Docker Compose
* GitHub Actions
* Health Check
* Initial documentation

Status:

✅ Completed

---

## PR-002 Patient and Encounter Persistence

Objective:

Implement storage for patients and clinical encounters.

Includes:

* Patient model
* Encounter model
* PostgreSQL migrations
* CRUD API

Status:

🔄 Planned

---

## PR-003 AI Event Extraction

Objective:

Extract clinical events from medical notes.

Includes:

* Statewave LLM integration
* Prompt engineering
* Structured parsing
* Unit tests

Status:

🔄 Planned

---

## PR-004 Statewave Integration

Objective:

Manage longitudinal contextual memory for patients.

Includes:

* Statewave client
* Context persistence
* Context retrieval

Status:

🔄 Planned

---

## PR-005 Clinical Timeline MVP

Objective:

Visualize the patient's clinical evolution.

Includes:

* Timeline UI
* Basic filters
* Backend integration

Status:

🔄 Planned
