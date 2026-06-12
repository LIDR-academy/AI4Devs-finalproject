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

AuditCare Timeline es una aplicación web orientada a profesionales sanitarios que permite reconstruir y visualizar la evolución clínica de un paciente mediante una línea temporal generada con Inteligencia Artificial.

El objetivo principal es reducir el tiempo necesario para revisar historiales clínicos extensos y facilitar la identificación de eventos relevantes, manteniendo al mismo tiempo un alto nivel de trazabilidad y transparencia sobre la información utilizada.

Para ello, el sistema combina:

* Inteligencia Artificial para extraer eventos clínicos desde texto libre.
* Revisión humana para validar la información generada.
* Statewave como capa de memoria contextual y trazabilidad.

Statewave permite mantener una representación longitudinal del paciente a través de múltiples encuentros clínicos, preservando el contexto histórico utilizado por la IA y facilitando la construcción de timelines clínicos auditables.

---

## 1.2. Características y funcionalidades principales

### MVP

#### Gestión de pacientes

* Registro de pacientes sintéticos.
* Consulta de información básica del paciente.
* Asociación de encuentros clínicos.

#### Gestión de encuentros clínicos

* Registro de consultas médicas.
* Almacenamiento de notas clínicas en texto libre.
* Relación entre encuentros y paciente.

#### Extracción de eventos mediante IA

* Procesamiento automático de notas clínicas.
* Identificación de diagnósticos.
* Identificación de síntomas.
* Identificación de procedimientos.
* Identificación de medicación.
* Identificación de resultados clínicos relevantes.

#### Memoria contextual mediante Statewave

* Almacenamiento del contexto longitudinal del paciente.
* Persistencia del historial clínico relevante.
* Recuperación de contexto para enriquecer futuras extracciones.
* Gestión de información contextual entre encuentros clínicos.

#### Trazabilidad y provenance

* Conservación de la fuente original de cada evento.
* Registro del texto clínico utilizado por la IA.
* Almacenamiento del nivel de confianza generado por el modelo.
* Preparación para futuras revisiones humanas.

#### Timeline clínico

* Visualización cronológica de eventos clínicos.
* Agrupación por fecha y encuentro.
* Navegación simplificada por la historia clínica del paciente.

---

### Funcionalidades futuras

#### Revisión humana

* Aprobación de eventos generados por IA.
* Corrección manual de información.
* Rechazo de eventos incorrectos.

#### Auditoría avanzada

* Historial completo de modificaciones.
* Registro de usuarios revisores.
* Comparación entre versión IA y versión validada.

#### Exportación

* PDF clínico.
* JSON estructurado.
* Compartición de timelines.

#### Interoperabilidad

* Integración FHIR.
* Integración con sistemas EHR.
* Importación de documentos clínicos.

#### Gestión avanzada

* Multiusuario.
* Gestión de roles.
* Control de acceso.

---

## 1.2.1. Uso de Statewave

Statewave constituye uno de los componentes centrales de la arquitectura del sistema.

Su función principal es proporcionar una capa de memoria contextual para aplicaciones basadas en IA.

En AuditCare Timeline, Statewave se utiliza para:

* Mantener contexto longitudinal del paciente.
* Relacionar múltiples encuentros clínicos.
* Preservar la información relevante entre sesiones.
* Facilitar la trazabilidad de la información utilizada por la IA.
* Permitir la generación de timelines clínicos consistentes y auditables.

A diferencia de una base de datos tradicional, Statewave aporta capacidades específicas para la gestión de memoria contextual orientada a sistemas inteligentes, mejorando la coherencia de los resultados generados por los modelos de lenguaje.

---

## 1.3. Diseño y experiencia de usuario

### Flujo principal MVP

1. Crear paciente.
2. Registrar encuentro clínico.
3. Introducir nota médica.
4. Procesar nota mediante IA.
5. Extraer eventos clínicos estructurados.
6. Actualizar memoria contextual del paciente en Statewave.
7. Recuperar contexto histórico relevante.
8. Generar timeline clínico.
9. Mostrar timeline cronológico auditado.

### Experiencia de usuario

El diseño del sistema prioriza:

* Simplicidad de uso.
* Visualización rápida de información clínica.
* Reducción de carga cognitiva.
* Transparencia sobre los resultados generados por IA.
* Navegación eficiente por historiales extensos.

Las capturas de pantalla, wireframes y vídeo demostrativo se incorporarán en las siguientes entregas del proyecto.

---

## 1.4. Instrucciones de instalación

### Requisitos

* Node.js 22+
* Python 3.12+
* PostgreSQL 16+
* Docker y Docker Compose

### Servicios necesarios

El sistema requiere:

* Frontend Next.js
* Backend FastAPI
* PostgreSQL
* Statewave

### Variables de entorno

Crear archivo `.env`:

```env
DATABASE_URL=postgresql://auditcare:auditcare@localhost:5433/auditcare
STATEWAVE_URL=http://localhost:8100
```

### PostgreSQL

```bash
docker compose up postgres -d
```

### Statewave

Documentación oficial:

https://www.statewave.ai/developers

Repositorio oficial:

https://github.com/smaramwbc/statewave

Instalación:

```bash
git clone https://github.com/smaramwbc/statewave.git

cd statewave

cp .env.example .env

docker compose up -d
```

Verificación:

```bash
curl http://localhost:8100/healthz

curl http://localhost:8100/readyz
```

Panel administrativo:

```text
http://localhost:8080
```

### Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Verificación:

```bash
curl http://localhost:8000/health
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Aplicación:

```text
http://localhost:3000
```

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

D --> B
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

* Statewave LLM (LiteLLM)

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

Integración de extracción IA vía Statewave LLM.

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

## PR-001 Setup inicial proyecto

Objetivo:
Crear la estructura base del proyecto.

Incluye:

- FastAPI bootstrap
- Next.js bootstrap
- PostgreSQL
- Docker Compose
- GitHub Actions
- Health Check
- Documentación inicial

Estado:
✅ Completado

---

## PR-002 Persistencia de pacientes y encuentros

Objetivo:
Implementar almacenamiento de pacientes y encuentros clínicos.

Incluye:

- Modelo Patient
- Modelo Encounter
- Migraciones PostgreSQL
- API CRUD

Estado:
🔄 Planificado

---

## PR-003 Extracción de eventos mediante IA

Objetivo:
Extraer eventos clínicos desde notas médicas.

Incluye:

- Integración Statewave LLM
- Prompt engineering
- Parsing estructurado
- Tests unitarios

Estado:
🔄 Planificado

---

## PR-004 Integración Statewave

Objetivo:
Gestionar memoria contextual longitudinal del paciente.

Incluye:

- Statewave Client
- Persistencia contextual
- Recuperación de contexto

Estado:
🔄 Planificado

---

## PR-005 Timeline clínico MVP

Objetivo:
Visualizar la evolución clínica del paciente.

Incluye:

- Timeline UI
- Filtros básicos
- Integración backend

Estado:
🔄 Planificado