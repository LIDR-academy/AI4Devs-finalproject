# AI4Devs Final Project - AuditCare Timeline

## Índice

0. Ficha del proyecto
1. Descripción general del producto
2. Arquitectura del sistema
3. Modelo de datos
4. Especificación de la API
5. Historias de usuario
6. Tickets de trabajo
7. Pull Requests

---

# 0. Ficha del proyecto

### 0.1. Tu nombre completo

Miriam Diaz Hernandez

### 0.2. Nombre del proyecto

AuditCare Timeline

### 0.3. Descripción breve del proyecto

AuditCare Timeline es una aplicación web que utiliza Inteligencia Artificial para construir una línea temporal clínica auditada a partir de notas médicas.

El sistema permite registrar pacientes, almacenar encuentros clínicos, extraer eventos relevantes mediante IA y presentar una línea temporal cronológica revisable por profesionales.

Statewave se utiliza como capa de memoria contextual y trazabilidad para mantener el contexto longitudinal del paciente y preservar la procedencia de la información generada.

### 0.4. URL del proyecto

https://github.com/MiriamDiazH/AI4Devs-finalproject

### 0.5. URL o archivo comprimido del repositorio

Repositorio GitHub:

https://github.com/MiriamDiazH/AI4Devs-finalproject

Archivo comprimido:

AI4Devs-finalproject.zip

---

# 1. Descripción general del producto

## 1.1. Objetivo

Ayudar a profesionales sanitarios a reconstruir rápidamente la historia clínica de un paciente mediante una línea temporal generada por IA y validada por humanos.

El sistema busca reducir el tiempo de revisión documental y mejorar la trazabilidad de la información clínica.

---

## 1.2. Características y funcionalidades principales

### MVP

* Registro de pacientes.
* Gestión de encuentros clínicos.
* Ingesta de notas médicas.
* Extracción automática de eventos clínicos mediante IA.
* Almacenamiento de contexto longitudinal mediante Statewave.
* Visualización básica del timeline clínico.

### Funcionalidades futuras

* Revisión humana de eventos.
* Exportación PDF y JSON.
* Filtros avanzados.
* Integración FHIR.
* Multiusuario.
* Historial completo de auditoría.

---

## 1.3. Diseño y experiencia de usuario

Flujo principal:

1. Crear paciente.
2. Registrar encuentro clínico.
3. Introducir nota médica.
4. Procesar nota mediante IA.
5. Generar eventos clínicos.
6. Guardar contexto en Statewave.
7. Mostrar timeline cronológico.

Las capturas de pantalla, wireframes y vídeo demostrativo se incorporarán en las siguientes entregas.

---

## 1.4. Instrucciones de instalación

### Requisitos

* Node.js 22+
* Python 3.12+
* PostgreSQL 16+
* Docker y Docker Compose
* Cuenta OpenAI (opcional)

---

### Clonar repositorio

```bash
git clone https://github.com/MiriamDiazH/AI4Devs-finalproject.git

cd AI4Devs-finalproject
```

---

### Variables de entorno

Crear archivo `.env`

```bash
cp .env.example .env
```

Configurar:

```env
DATABASE_URL=postgresql://auditcare:auditcare@localhost:5432/auditcare

OPENAI_API_KEY=your_openai_api_key

STATEWAVE_URL=http://localhost:8100
```

---

### PostgreSQL

```bash
docker compose up postgres -d
```

Verificar:

```bash
docker ps
```

---

### Statewave

AuditCare Timeline utiliza Statewave como capa de memoria contextual y trazabilidad.

Documentación oficial:

https://www.statewave.ai/developers

Repositorio oficial:

https://github.com/smaramwbc/statewave

#### Instalación local

```bash
git clone https://github.com/smaramwbc/statewave.git

cd statewave

cp .env.example .env

docker compose up -d
```

#### Verificación

Health:

```bash
curl http://localhost:8100/healthz
```

Ready:

```bash
curl http://localhost:8100/readyz
```

#### Consola administrativa

```text
http://localhost:8080
```

---

### Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Verificar:

```bash
curl http://localhost:8000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "auditcare-timeline-api",
  "version": "0.1.0"
}
```

---

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Abrir:

```text
http://localhost:3000
```

---

### Verificación completa

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
http://localhost:8080
```

Si todos los servicios responden correctamente, el entorno está preparado para ejecutar el MVP.

---

# 2. Arquitectura del Sistema

## 2.1. Diagrama de arquitectura

```mermaid
flowchart LR

A[Next.js Frontend]
--> B[FastAPI Backend]

B --> C[(PostgreSQL)]

B --> D[Statewave API :8100]

B --> E[OpenAI]

D --> B
E --> B
```

Arquitectura por capas con separación entre:

* Presentación
* Lógica de negocio
* Persistencia
* Memoria contextual
* Servicios de IA

---

## 2.2. Componentes principales

### Frontend

* Next.js
* TypeScript
* TailwindCSS

### Backend

* FastAPI
* Python
* Pydantic

### Persistencia

* PostgreSQL

### Memoria contextual

* Statewave

### Inteligencia Artificial

* OpenAI GPT

---

## 2.3. Estructura del proyecto

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

## 2.4. Infraestructura y despliegue

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

## 2.5. Seguridad

* Variables sensibles mediante `.env`.
* GitHub Secrets.
* Validación mediante Pydantic.
* Uso de ORM para prevenir SQL Injection.
* HTTPS en producción.
* No se utilizan datos clínicos reales.
* Todos los pacientes utilizados son sintéticos.
* Statewave se utiliza únicamente con datos de prueba.

---

## 2.6. Tests

Se implementarán:

* Tests unitarios.
* Tests de integración.
* Tests End-to-End del flujo principal.

---

# 3. Modelo de Datos

## 3.1. Diagrama

```mermaid
erDiagram

PATIENT ||--o{ ENCOUNTER : has

PATIENT ||--o{ CLINICAL_EVENT : generates

ENCOUNTER ||--o{ CLINICAL_EVENT : contains

CLINICAL_EVENT ||--o{ AUDIT_LOG : records
```

---

## 3.2. Entidades principales

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

# 4. Especificación de la API

## GET /health

Verifica que el backend está activo.

## POST /patients

Crear paciente.

## GET /patients

Listar pacientes.

## POST /encounters

Crear encuentro clínico.

## POST /encounters/{id}/extract-events

Extraer eventos mediante IA.

## GET /patients/{id}/timeline

Obtener timeline clínico.

---

# 5. Historias de Usuario

### HU01

Como profesional sanitario quiero registrar un paciente para almacenar su historial clínico.

### HU02

Como profesional sanitario quiero registrar encuentros clínicos para documentar consultas médicas.

### HU03

Como profesional sanitario quiero que la IA extraiga eventos clínicos para reducir tiempo de revisión documental.

### HU04

Como profesional sanitario quiero visualizar una línea temporal para comprender rápidamente la evolución del paciente.

---

# 6. Tickets de Trabajo

### BE-001

Setup inicial FastAPI.

### BE-002

Modelo Patient.

### BE-003

Modelo Encounter.

### BE-004

Integración OpenAI.

### BE-005

Integración Statewave.

### FE-001

Setup inicial Next.js.

### FE-002

Pantalla listado pacientes.

### FE-003

Visualización timeline.

### DB-001

Diseño esquema PostgreSQL.

### QA-001

Test unitario Health Check.

---

# 7. Pull Requests

### PR-001

Setup inicial proyecto.

### PR-002

Persistencia pacientes y encuentros.

### PR-003

Integración OpenAI y extracción de eventos.

### PR-004

Integración Statewave.

### PR-005

Timeline clínico MVP.
