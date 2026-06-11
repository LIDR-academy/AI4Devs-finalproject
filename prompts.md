> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o los de corrección o adición de funcionalidades que consideres más relevantes.
> Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras.

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

```
Estoy desarrollando HolistiCare, plataforma de apoyo a la decisión clínica con IA
para rehabilitación holística en México (proyecto final del Máster AI4Devs).

Contexto del dominio:
- Practiciantes de naturopatía y Nueva Medicina Germánica documentan en papel
- Seguimiento entre sesiones ocurre por WhatsApp sin estructura
- No miden outcomes con instrumentos validados de forma sistemática
- Construyen planes desde intuición clínica sin evidencia estructurada

Ayúdame a redactar en español:
1. Problem statement (sección 5 de requirements)
2. Value proposition para clínico, paciente, operación y negocio (sección 6)
3. Tabla de alternativas existentes (papel, Excel, Doctoralia, SimplePractice, Jane App)

Restricciones:
- Basarte en la investigación de dominio ya documentada (FUNSALUD 2022, mercado MAC)
- No inventar estadísticas que no estén en las fuentes citadas
- Mantener enfoque en mercado mexicano y paradigma holístico/NMG
```

**Prompt 2:**

```
Para HolistiCare necesito documentar el alcance del MVP y las funcionalidades principales
para la entrega académica. El README del repo define 6 features:

1. Intake con LLM risk flagging
2. Plan generator RAG con approval gate
3. Session logger
4. Patient diary mobile-friendly
5. Progress analytics dashboard
6. Outcome prediction model

Genera la sección "Características y funcionalidades principales" en español,
incluyendo instrumentos de outcome (NRS, SF-12, PSQI, PHQ-9, Barthel, DASH, WOMAC, ODI)
y el principio de que todo output de IA requiere aprobación del practicante.
```

**Prompt 3:**

```
Documenta las instrucciones de instalación local de HolistiCare para Windows,
basándote en docs/setup.md y el README del repositorio.

Debe incluir:
- Prerrequisitos (Docker, Python 3.10+, Node.js)
- Comandos PowerShell para .env, venv, npm install
- docker compose up -d --build
- Ingesta mock: docker compose exec backend python -m scripts.ingest --source data/mock
- ALLOW_DEV_AUTH para login de desarrollo
- Comando de tests: python -m pytest -q
- URLs locales (5173 frontend, 8000 API docs)
```

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**

```
Genera un diagrama Mermaid de contexto (C4 Nivel 1) para HolistiCare con:
- Actores: Clínico/Admin, Paciente
- Sistema: Web app React+Vite, API FastAPI
- Externos: PostgreSQL+pgvector, Anthropic API (Claude), OpenAI API (embeddings)

Incluye justificación de por qué elegimos monolito modular con RAG embebido
en lugar de microservicios para un MVP unipersonal.
```

**Prompt 2:**

```
Documenta el pipeline RAG de 5 capas de HolistiCare:
1. Offline ingestion (PDF → chunking 400-600 tokens → embeddings → vector index)
2. Query construction (profile summarization + multi-query expansion)
3. Retrieval and reranking (top-k → rerank → top 8-10 chunks)
4. Prompt construction (citation-bound, contraindication checks)
5. Structured output and governance (JSON plan + practitioner approval)

Traduce a español y vincula con los módulos en backend/app/rag/.
```

**Prompt 3:**

```
Crea diagrama Mermaid de secuencia del flujo intake → plan:
UI → POST /rag/plan/generate → QueryBuilder → VectorRetriever → Reranker →
PlanGenerator → treatment_plans

Incluye el path alternativo cuando reranked chunks está vacío
(insufficient_evidence plan, pending_review, sin fabricación).
```

### **2.2. Descripción de componentes principales:**

**Prompt 1:**

```
Lista los componentes principales de HolistiCare con responsabilidad y tecnología:
Frontend (React/Vite/Tailwind), Backend (FastAPI), Pipeline RAG (Python modules),
PostgreSQL, pgvector, OpenAI embeddings, Anthropic Claude, reranker opcional Cohere,
ML scikit-learn/XGBoost.

Incluye los servicios de dominio: intake_service, plan_persistence, diary_service,
session_service, analytics_service, ingestion_service, plan_memory_bank_service.
```

**Prompt 2:**

```
Documenta las decisiones de arquitectura (ADRs) ya tomadas en el proyecto:
- ADR-001: PostgreSQL unificado para OLTP + pgvector (LlamaIndex PGVectorStore)
- ADR-002: Aprobación del practicante obligatoria (pending_review)

Para cada ADR: decisión, estado, rationale y trade-offs en español.
```

**Prompt 3:**

```
Describe los principios de arquitectura de HolistiCare:
- Practitioner-in-the-loop by default
- Traceability for every AI recommendation
- Privacy and security by design
- Modular services for phased delivery
- Observable and testable AI behavior
```

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**

```
Genera el árbol de directorios del repositorio holisticare/ con descripción breve
de cada carpeta principal (backend/app/api, core, rag, schemas, services;
frontend/src; infra; docs).

Indica que sigue patrón monorepo con backend y frontend separados, comunicación REST+JWT.
```

**Prompt 2:**

```
Explica la organización de la documentación en docs/ por fases:
01-requirements, 02-architecture, 03-data-dictionary, 04-feature-specs,
05-test-plan, 06-deployment-runbook, más guías operativas (setup, user-guide, security).
```

**Prompt 3:**

```
Mapea los módulos del frontend actual:
- App.jsx (router)
- AuthProvider (JWT en localStorage)
- Dashboard.jsx (intake + plan generation)
- PlanReview (aprobación)
- Chunks (navegación de corpus)
```

### **2.4. Infraestructura y despliegue**

**Prompt 1:**

```
Resume las opciones de despliegue analizadas para HolistiCare MVP
(holisticare_deployment_analysis.md):
- Recomendación: topología híbrida Hetzner/Fly.io + Neon/Supabase + Cloudflare Pages
- Costo estimado $25-45/mes
- Alternativas: AWS/GCP managed ($180-350/mes), VPS puro, PaaS

Incluye consideraciones NOM-024 y LFPDPPP para transferencia internacional de datos.
```

**Prompt 2:**

```
Documenta el proceso de CI/CD de HolistiCare según .github/workflows/ci.yml:
- backend-tests (pytest)
- frontend-checks (lint, test, build)
- security-audit (pip-audit, bandit, npm audit — bloqueante por defecto)
- ai-quality-smoke (scripts/ai_quality_smoke.py)
```

**Prompt 3:**

```
Escribe el checklist de despliegue del MVP:
1. Build artifacts
2. Quality gates
3. Staging deploy
4. Smoke tests
5. Production approval
6. Post-deploy verification

Basado en docs/06-deployment-and-ops-runbook.md.
```

### **2.5. Seguridad**

**Prompt 1:**

```
Enumera las prácticas de seguridad implementadas en HolistiCare:
JWT con roles (clinician, admin, patient), ALLOW_DEV_AUTH=false por defecto,
SQL parametrizado en chunk_query, auditoría intake_profile_audit,
trazabilidad de planes, escaneo CI (pip-audit, bandit, npm audit).

Referencia docs/09-security-audit-and-todos.md para remediaciones completadas.
```

**Prompt 2:**

```
Documenta los requisitos de cumplimiento regulatorio mexicano para HolistiCare:
- NOM-024-SSA3-2012 (expediente electrónico, trazabilidad, aprobación practicante)
- LFPDPPP (consentimiento, ARCO, DPA con Anthropic/OpenAI, anonymización pre-API)

Incluye que HolistiCare es CDS, no dispositivo de diagnóstico autónomo.
```

**Prompt 3:**

```
Lista los controles de gobernanza clínica de IA:
- requires_practitioner_review: true en todo plan generado
- insufficient_evidence path sin alucinación
- citations_used con REF-IDs
- Plan memory bank desidentificado (US-PLAN-004)
```

### **2.6. Tests**

**Prompt 1:**

```
Define la estrategia de pruebas de HolistiCare según docs/05-test-plan.md:
niveles (unit, integration, API contract, E2E, AI evaluation, security),
herramientas (pytest, Vitest, ai_quality_smoke.py), y enfoque shift-left.
```

**Prompt 2:**

```
Documenta los tests de calidad IA en ai_quality_smoke.py:
- Verificación de insufficient_evidence
- Contrato JSON del plan (plan_id, status, weeks, citations_used)
- Groundedness y citation correctness
- Integración en CI con flag AI_QUALITY_SMOKE_ADVISORY
```

**Prompt 3:**

```
Lista ejemplos concretos de tests del backend:
test_plan_generate_api.py, test_diary_api.py, test_chunk_query_security.py,
test_auth_dev_login.py — con qué contrato HTTP validan cada uno.
```

---

### 3. Modelo de Datos

**Prompt 1:**

```
Genera diagrama ER en Mermaid para las tablas de HolistiCare:
intake_profiles, intake_profile_audit, treatment_plans, care_sessions,
patient_diary_entries, clinical_chunks, plan_memory_bank.

Nota: patient_id es clave transversal sin tabla patients física.
clinical_chunks no tiene FK a patient_id (vinculación en query-time via RAG).
```

**Prompt 2:**

```
Documenta en tabla cada entidad principal con atributos, tipos, restricciones
(PK, FK, UNIQUE, CHECK, NOT NULL) basándote en infra/init.sql.

Incluye constraints:
- treatment_plans.status IN (pending_review, approved, rejected, active)
- clinical_chunks.evidence_level IN (A, B, C, expert_opinion)
- uq_patient_diary_entry_day UNIQUE (patient_id, entry_date)
```

**Prompt 3:**

```
Describe el esquema JSONB intake_json (generic_holistic_v0) según
backend/app/schemas/intake_v0.py:
profile_version, chief_complaint, conditions, goals, contraindications,
current_medications, allergies, baseline_outcomes, demographics.
```

---

### 4. Especificación de la API

**Prompt 1:**

```
Documenta POST /rag/intake en formato OpenAPI-style:
request con patient_id + intake_json generic_holistic_v0,
response 200, errores 401/422/403.
Basado en backend/app/api/rag.py y test_plan_generate_api.py.
```

**Prompt 2:**

```
Documenta POST /rag/plan/generate:
body con patient_id, intake_json, available_therapies, preferred_language.
Response con plan_id, status pending_review, weeks, citations_used,
insufficient_evidence, requires_practitioner_review.
Incluye path alternativo de evidencia insuficiente.
```

**Prompt 3:**

```
Documenta POST /rag/diary:
upsert por (patient_id, entry_date), diary_json con pain_nrs, sleep, mood,
function, free_text_es. Control de acceso por rol patient/clinician.
```

---

### 5. Historias de Usuario

**Prompt 1:**

```
Redacta US-PLAN-001 en formato estándar (Como/Quiero/Para) con criterios
Given-When-Then:
- Generación de plan multi-semana desde intake válido
- Citaciones REF-ID cuando hay evidencia
- insufficient_evidence sin fabricación
- Estado pending_review siempre

Basado en docs/04-feature-specs-and-user-stories.md y sprint-01.md.
```

**Prompt 2:**

```
Redacta US-PLAN-003 (aprobación/rechazo de planes):
- approve → status approved con approved_at/approved_by
- reject → status rejected
- 401 sin autenticación
- Vinculación con biblioteca de plantillas US-PLAN-004
```

**Prompt 3:**

```
Redacta US-DIARY-001 (check-in diario del paciente):
- Persistencia por (patient_id, entry_date)
- Upsert sin duplicados
- Notas libres en español
- Historial cronológico inverso para clínico autorizado
```

---

### 6. Tickets de Trabajo

**Prompt 1:**

```
Crea ticket de backend para Sprint 1 (US-PLAN-001):
Implementar POST /rag/plan/generate con pipeline RAG completo.
Incluye criterios de done, tests, notas de seguridad LFPDPPP,
estimación L (1 semana).
```

**Prompt 2:**

```
Crea ticket de frontend para US-INT-004 + US-INT-005:
Formulario estructurado de intake, UUID v4 automático, pacientes recientes,
validación, panel Avanzado con JSON read-only.
Archivos: Dashboard.jsx, intakeBuilder.js, uuidV4.js, recentPatients.js.
```

**Prompt 3:**

```
Crea ticket de bases de datos para infra/init.sql:
Esquema PostgreSQL + pgvector, tablas transaccionales, índices IVFFlat y GIN,
constraints CHECK y UNIQUE, nota sobre init.sql solo en volumen nuevo.
```

---

### 7. Pull Requests

**Prompt 1:**

```
Documenta PR conceptual del Sprint 1 (US-PLAN-001):
Rama feature/sprint-01-plan-generate, cambios en pipeline RAG y
POST /rag/plan/generate, criterios de merge (pytest verde, pending_review,
insufficient_evidence sin alucinación).
```

**Prompt 2:**

```
Documenta PR del Sprint 4 (US-DIARY-001):
POST/GET /rag/diary, upsert por día, test_diary_api.py,
control de acceso por rol.
```

**Prompt 3:**

```
Documenta PR del Sprint 9 (US-INT-005):
Frontend UUID automático y pacientes recientes,
uuidV4.js, recentPatients.js, tests Vitest,
validación v4 antes de operaciones.
```
