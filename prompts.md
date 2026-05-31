> Detalla en esta sección los prompts principales utilizados durante la creación del proyecto, que justifiquen el uso de asistentes de código en todas las fases del ciclo de vida del desarrollo. Esperamos un máximo de 3 por sección, principalmente los de creación inicial o  los de corrección o adición de funcionalidades que consideres más relevantes.
Puedes añadir adicionalmente la conversación completa como link o archivo adjunto si así lo consideras

> **Nota:** El proyecto se ha generado con un **sistema multi-agente** orquestado (7 agentes + 7 skills) cuyo prompt maestro está versionado en el repositorio del proyecto: [prompt-sistema-multi-agente.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/prompt-sistema-multi-agente.md). El registro completo de decisiones consultadas está en [docs/Decisiones-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/docs/Decisiones-PeredaHR.md).

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
"Crea los agentes necesarios para generar la documentación de PeredaHR (Product Manager senior con 12 años en productos HR y registro de tiempos, experto en casos de uso, arquitecto de modelado de datos, experto en diseño de sistemas y diagramas C4, orquestador y revisor de calidad) y las skills asociadas. Cualquier duda en una toma de decisión, consúltamela al usuario."

**Prompt 2:**
"Genera el PRD de PeredaHR siguiendo estrictamente la plantilla `Estructura PRD.md`, usando como fuente primaria la descripción del software ya existente, enriqueciéndola solo donde sea ambigua y marcando explícitamente las inferencias. En los artefactos finales no debe haber ninguna referencia al producto del cual se ha extraído la información inicial."

**Prompt 3:**
"Quiero que aparezca todo el detalle de los módulos funcionales (empleado y administrador) tal como se plasma en la descripción del software, no resumido."

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

**Prompt 1:**
"Diseña la arquitectura de PeredaHR con el modelo C4 (niveles 1-3: Contexto, Contenedor, Componente) en Mermaid, justificando el patrón elegido, sus beneficios y sacrificios."

**Prompt 2:**
"Fija el stack tecnológico: TypeScript full-stack (Next.js + NestJS + Prisma), PostgreSQL + pgvector y OpenAI (GPT-4o + text-embedding-3). Preséntalo como decisión cerrada para no interrumpir el flujo posterior."

### **2.2. Descripción de componentes principales:**

**Prompt 1:**
"Separa la solución en contenedores: web (Next.js/PWA), API (NestJS con RBAC), worker de sincronización (ETL) y servicio de IA (RAG + Text-to-SQL con guardrails)."

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

**Prompt 1:**
"Crea físicamente los archivos de agentes y skills antes de invocarlos, ya que deben poder consultarse como prueba de entrega del proyecto; organízalos en /agents, /skills y /docs."

### **2.4. Infraestructura y despliegue**

**Prompt 1:**
"(Previsto para Entrega 2) Documenta el pipeline CI/CD, la gestión de secretos y el despliegue con URL pública."

### **2.5. Seguridad**

**Prompt 1:**
"Aplica seguridad por diseño: OAuth2/OIDC, RBAC con 3 roles, cifrado en tránsito y reposo, y exclusión de PII sensible (DNI, NSS, geolocalización) del Text-to-SQL mediante whitelist; el RAG debe responder 'no consta' si no hay evidencia."

### **2.6. Tests**

**Prompt 1:**
"(Previsto para Entrega 2) Define una suite con tests unitarios, de integración, un test E2E del flujo principal y tests de contrato sobre el esquema de las BD externas (BioStar/SAGE)."

---

## 3. Modelo de Datos

**Prompt 1:**
"Parte de las 7 entidades raíz (Employee, Center, Department, Schedule, WorkCalendar, LeaveType, CollectiveAgreement), deriva las de los flujos críticos (ClockEntry, WorkDay, LeaveRequest, ApprovalLog, LeaveAllocation) y modela en Mermaid erDiagram con tipos, claves y cardinalidades, más un diccionario de datos con indicador de PII."

**Prompt 2:**
"Marca DNI, NSS y geolocalización como PII sensible y exclúyelos de la whitelist de Text-to-SQL; documenta las exclusiones."

**Prompt 3:**
"El Arquitecto de Datos es la autoridad de nomenclatura: consolida los nombres canónicos de entidades y atributos en el glosario."

---

## 4. Especificación de la API

**Prompt 1:**
"Incluye un esbozo de contrato de API de alto nivel por recurso y rol (p. ej. POST /api/clock-entries, POST /api/leave-requests, GET /api/reports/monthly-journey); el detalle formal OpenAPI se deja para la Entrega 2."

---

## 5. Historias de Usuario

**Prompt 1:**
"Redacta las user stories en formato 'Como [rol], quiero [acción], para [beneficio]' con criterios de aceptación en Gherkin y priorización MoSCoW, trazables a la descripción del software."

**Prompt 2:**
"Corrección: los empleados no pueden confirmar las jornadas pendientes; debe ser un perfil con rol Administrador o de RRHH. El empleado solo puede marcar entradas y salidas, sin posibilidad de modificación alguna de éstas (fichaje inmutable)."

---

## 6. Tickets de Trabajo

**Prompt 1:**
"Deriva de las historias del flujo E2E tres tickets de desarrollo (uno de backend, uno de frontend y uno de base de datos) con objetivo, detalle, criterios de aceptación y Definition of Done."

---

## 7. Pull Requests

**Prompt 1:**
"Inicializa el repositorio git, crea la rama feature-entrega1-FSF y prepara el commit de los artefactos de documentación, excluyendo el material de origen que contenga el nombre del producto sustituido."

**Prompt 2:**
"Completa el readme.md y el prompts.md de la plantilla del repositorio del curso, enlazando a los artefactos reales del repositorio privado del proyecto, y súbelos en la rama feature-entrega1-FSF."
