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

> **Nota sobre esta entrega (Entrega 1 – Documentación Técnica).** Este `readme.md` resume el proyecto **PeredaHR** y enlaza a los artefactos de documentación, que residen en el repositorio **privado** del proyecto: [github.com/franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) (rama `feature-entrega1-FSF`). Las secciones referidas a código, despliegue y tests se completarán en las Entregas 2 y Final.

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Fran Sales Folch (FSF)

### **0.2. Nombre del proyecto:**

PeredaHR

### **0.3. Descripción breve del proyecto:**

PeredaHR es una plataforma interna de gestión de tiempo, presencia y operaciones de RRHH. Sustituye al SaaS de control horario actual eliminando el coste de licencia, integra por **acceso directo a las bases de datos SQL** de los terminales de fichaje (BioStar) y del ERP (SAGE), e incorpora **IA generativa verticalizada al dominio real**: un asistente RAG sobre el convenio colectivo con citación y un reporting conversacional (Text-to-SQL) con guardrails de privacidad.

### **0.4. URL del proyecto:**

Pendiente de despliegue (Entrega 2). La aplicación se desplegará con URL pública accesible en la siguiente entrega.

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

Repositorio **privado** del proyecto: [https://github.com/franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) — rama de la entrega: `feature-entrega1-FSF`.

> Al tratarse de un repositorio privado, se compartirá el acceso con el equipo evaluador (ver 0.6).

### 0.6. Accesos concedidos al repositorio privado (equipo evaluador)

Se concede acceso al repositorio privado [franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) a los siguientes perfiles:

| Rol | Persona | Perfil de GitHub |
|---|---|---|
| Teaching Assistant | Vick | [@Vick-lidr](https://github.com/Vick-lidr) |
| Mentor | Jorge Pilo | [@soyJorgePilo](https://github.com/soyJorgePilo) |

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

### **1.1. Objetivo:**

PeredaHR unifica fichaje, presencia, ausencias, informes de cumplimiento legal y configuración de RRHH en un **sistema único de verdad**, eliminando la fragmentación entre terminales, ERP y SaaS de ausencias, y el coste recurrente de licencia.

- **Valor que aporta:** elimina el coste de licencia (objetivo −85%, de 8.000-12.000 € a ~1.500 €/año de infraestructura), libera capacidad del equipo de RRHH (gestión de solicitudes de ~10 h/sem a <4 h/sem) y garantiza el cumplimiento del registro horario (RD-Ley 8/2019).
- **Qué soluciona:** fragmentación de fuentes de verdad, sobrecarga administrativa (picos de 73 solicitudes simultáneas y 5.201 registros/mes) e "IA cosmética" del mercado.
- **Para quién:** empleados (scope propio), managers (scope equipo) y administradores/RRHH (scope compañía) de la empresa cliente.

**North Star Metric:** horas de RRHH liberadas por semana.

Detalle completo en el [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/PRD-PeredaHR.md) (§01).

### **1.2. Características y funcionalidades principales:**

| Módulo | Funcionalidad | Prioridad |
|---|---|---|
| Fichaje | Fichaje web Entrar/Salir con geolocalización opcional y restricción por IP de centro; **inmutable para el empleado** | Must |
| Presencia | Mi Presencia (solo lectura), validación y **confirmación de jornadas (exclusiva de Admin/RRHH)** | Must |
| Solicitudes/Ausencias | Creación, saldos y aprobación individual/masiva con árbol de 2 niveles | Must |
| Informes | Informes de cumplimiento legal (Registro mensual de jornada, Anexo de horas extra) | Must |
| Configuración | Centros, convenios, horarios, departamentos, cargos, roles | Must |
| IA | Asistente RAG sobre convenio (con citación) + reporting conversacional Text-to-SQL con guardrails | Must |

Catálogo funcional completo (módulos Empleado, Administrador e IA) en el [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/PRD-PeredaHR.md) (§03).

### **1.3. Diseño y experiencia de usuario:**

El diseño es **mobile-first** (el fichaje diario ocurre mayoritariamente en móvil), con optimistic updates en el fichaje y streaming en el chat de IA, y accesibilidad **WCAG 2.1 AA**.

En esta entrega, la experiencia de usuario se documenta mediante **user flows (Mermaid)**, **wireframes descritos** y un **design system básico** en el artefacto [UX-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/UX-PeredaHR.md). Las capturas y/o videotutorial de la aplicación se incorporarán en la Entrega 2, cuando exista frontend ejecutable.

### **1.4. Instrucciones de instalación:**

La Entrega 1 es exclusivamente documental; aún no hay código que instalar. El stack previsto (justificado en la arquitectura) es **TypeScript full-stack (Next.js + NestJS + Prisma) sobre PostgreSQL + pgvector**, con OpenAI para el módulo de IA. Las instrucciones precisas de instalación (dependencias, backend, frontend, base de datos, migraciones y semillas) se documentarán en la Entrega 2, junto con el primer MVP ejecutable.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

El diagrama de arquitectura completo en **modelo C4 (niveles 1-3: Contexto, Contenedor, Componente)** se encuentra en el artefacto [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/Arquitectura-PeredaHR.md).

**Patrón y justificación.** Se adopta una arquitectura por **contenedores** con separación clara entre: aplicación web (Next.js/PWA), API de negocio (NestJS con RBAC), un **worker de sincronización** (ETL de lectura directa de las BD SQL de BioStar y SAGE) y un **servicio de IA** (RAG + Text-to-SQL con guardrails).

- **Por qué esta arquitectura:** el stack único TypeScript reduce el coste cognitivo y acelera el MVP dentro del presupuesto (~30 h); PostgreSQL + pgvector permite cubrir datos productivos y búsqueda vectorial en **un solo motor**, favoreciendo la **soberanía del dato** (hosting controlado por la empresa, exigible por RGPD).
- **Beneficios:** menos piezas móviles, despliegue sencillo, datos bajo control propio, IA integrada.
- **Sacrificios/déficits:** el acceso directo a las BD de BioStar/SAGE acopla el sistema al esquema del proveedor (mitigado con una capa de adaptación y tests de contrato); pgvector es suficiente para el volumen actual pero podría requerir un vector store dedicado a mayor escala.

### **2.2. Descripción de componentes principales:**

- **Web App** — Next.js (React), PWA mobile-first. Interfaz de empleado, manager y administrador.
- **API** — NestJS (Node/TypeScript), REST con autenticación OAuth2/OIDC y autorización RBAC (3 roles).
- **Worker de sincronización** — proceso programado que **lee directamente las BD SQL** de BioStar (fichajes) y SAGE (maestros: empleados, centros, contratos) y reconcilia con los datos productivos.
- **Servicio de IA** — pipeline RAG (embeddings text-embedding-3 + búsqueda vectorial en pgvector + GPT-4o con citación) y Text-to-SQL con whitelist de tablas/columnas y exclusión de PII.
- **Base de datos** — PostgreSQL + pgvector.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

En la Entrega 1, el repositorio del proyecto contiene la documentación técnica y la definición del **sistema multi-agente** usado para generarla:

```
PRD-PeredaHR.md            · Product Requirements Document (00-09)
UX-PeredaHR.md             · Diseño de experiencia (flows, wireframes, design system)
CasosDeUso-PeredaHR.md     · Casos de uso + diagramas de flujos críticos
ModeloDatos-PeredaHR.md    · Modelo de datos (ER + diccionario + clasificación PII)
Arquitectura-PeredaHR.md   · Arquitectura C4 + integraciones + pipeline IA
readme.md / prompts.md     · Documentación de proyecto y prompts
/agents/                   · 7 definiciones de agente del sistema generador
/skills/                   · 7 skills asociadas
/docs/                     · Glosario canónico + log de decisiones
```

La estructura de código (backend/frontend) seguirá una organización modular por dominio en la Entrega 2.

### **2.4. Infraestructura y despliegue**

Pendiente de la Entrega 2. El plan previsto incluye: pipeline **CI/CD básico**, gestión de secretos, despliegue del frontend y backend con **URL pública accesible** y base de datos gestionada (PostgreSQL + pgvector). El diagrama de infraestructura y el proceso de despliegue se documentarán en esa entrega.

### **2.5. Seguridad**

Prácticas de seguridad contempladas en el diseño (detalle en [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/PRD-PeredaHR.md) §06 y [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/Arquitectura-PeredaHR.md) §8):

- **Autenticación** OAuth2/OIDC (SSO) y **autorización RBAC** con 3 roles (Empleado, Manager, Admin/RRHH).
- **Cifrado** en tránsito (TLS) y en reposo.
- **Privacidad por diseño:** PII sensible (`dni`, `nss`, geolocalización, biométricos) **excluida del Text-to-SQL** mediante whitelist; el asistente RAG responde "no consta" si no hay evidencia (anti-alucinación).
- **Auditoría:** traza de aprobaciones, confirmaciones de jornada y correcciones de fichaje con autoría y timestamp.
- **Soberanía del dato:** hosting controlado por la empresa (RGPD/LOPDGDD).

### **2.6. Tests**

Pendiente de la Entrega 2. El plan de pruebas incluye tests **unitarios**, de **integración** y al menos un test **E2E** del flujo principal (US-01 → US-04 → US-06 → US-08), además de **tests de contrato** sobre el esquema de las BD externas (BioStar/SAGE) por el acoplamiento del acceso directo.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

El diagrama entidad-relación completo en **Mermaid `erDiagram`** (con tipos, claves primarias/foráneas y cardinalidades) está en el artefacto [ModeloDatos-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/ModeloDatos-PeredaHR.md) (§1).

### **3.2. Descripción de entidades principales:**

**Entidades raíz (7):** `Employee`, `Center`, `Department`, `Schedule`, `WorkCalendar`, `LeaveType`, `CollectiveAgreement`.

**Entidades derivadas de los flujos críticos:** `ClockEntry`, `WorkDay`, `LeaveRequest`, `ApprovalLog`, `LeaveAllocation`.

**Entidades de soporte:** `Site`, `Position`, `Role`, `Contract`, `Holiday`, `AgreementChunk` (fragmentos del convenio con embedding para el RAG), `Document`, `AuditLog`.

Ejemplos de atributos y restricciones (detalle y diccionario completo con indicador PII en el artefacto enlazado):

- **`Employee`** — `id` (uuid, PK), `first_name`/`last_name`, `email` (unique), `dni` (unique, **PII sensible**), `nss` (unique, **PII sensible**), `department_id`/`position_id`/`role_id`/`schedule_id` (FK), `manager_l1_id`/`manager_l2_id` (FK self), `active` (bool).
- **`ClockEntry`** — `id` (PK), `employee_id` (FK), `center_id` (FK), `ts` (timestamptz), `type` (ENTRADA/SALIDA), `geo` (point, nullable, **PII opcional**), `source` (PEREDAHR/BIOSTAR), `immutable_for_employee` (bool).
- **`WorkDay`** — `status` (PENDING/CONFIRMED/INCIDENT/VALIDATED), `confirmed_by` (FK, Admin/RRHH), `confirmed_at`.
- **`LeaveRequest` / `LeaveAllocation` / `ApprovalLog`** — soportan el ciclo de solicitud con reserva de saldo y aprobación de 1.º/2.º nivel.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

En la Entrega 1 (documentación) se ha definido un **esbozo de contrato de API de alto nivel** por recurso y rol, disponible en [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/Arquitectura-PeredaHR.md) (§7). Los 3 endpoints principales previstos son:

- `POST /api/clock-entries` — registrar fichaje de entrada/salida (rol Empleado).
- `POST /api/leave-requests` — crear solicitud de ausencia (rol Empleado).
- `GET /api/reports/monthly-journey` — generar el Registro mensual de jornada (rol Admin/RRHH).

La **especificación formal en formato OpenAPI** (esquemas, ejemplos de petición/respuesta, errores) se completará en la Entrega 2, junto con la implementación del backend.

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

Las 10 historias completas con criterios de aceptación en Gherkin están en el [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/PRD-PeredaHR.md) (§04). Se seleccionan las 3 del flujo E2E prioritario:

**Historia de Usuario 1** · US-01 — Fichar entrada/salida
**Como** empleado, **quiero** fichar mi entrada y salida desde la web, **para** registrar mi jornada y cumplir con el registro horario legal.
*Criterios clave:* el sistema registra un `ClockEntry` con timestamp, tipo y centro; la geolocalización es opcional; se rechaza el fichaje desde IP no autorizada; **el fichaje es inmutable para el empleado** (no puede editarlo ni borrarlo; toda corrección es competencia de Admin/RRHH con auditoría).

**Historia de Usuario 2** · US-06 — Gestionar solicitudes (Admin/RRHH)
**Como** administrador de RRHH, **quiero** aprobar o rechazar solicitudes de forma individual y masiva con comentarios, **para** gestionar el pico de 73 solicitudes sin cuello de botella.
*Criterios clave:* aprobación individual y en lote filtrada por tipo/departamento; cada acción genera un `ApprovalLog` y actualiza el saldo; soporte de aprobación de **2.º nivel**.

**Historia de Usuario 3** · US-08 — Generar el Registro mensual de jornada (Admin/RRHH)
**Como** administrador, **quiero** generar el informe oficial de Registro mensual de jornada, **para** cumplir el RD-Ley 8/2019 y responder a Inspección al momento.
*Criterios clave:* selección de mes y ámbito (empleado/centro/compañía); informe con datos totalizados por empleado; exportable (CSV/PDF).

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos.

Tickets previstos para el MVP de la Entrega 2, derivados de las historias anteriores (índice en el [readme.md del proyecto](https://github.com/franpereda/PeredaHR/blob/feature-entrega1-FSF/readme.md) §8):

**Ticket 1 · Backend** — Endpoint de fichaje (US-01)
- **Objetivo:** implementar `POST /api/clock-entries` en NestJS.
- **Detalle:** validar empleado autenticado y centro asignado; registrar `ClockEntry` (timestamp, tipo ENTRADA/SALIDA, canal, geo opcional, `source=PEREDAHR`); aplicar restricción por IP de centro; **impedir edición/borrado por el empleado** (inmutabilidad).
- **Criterios de aceptación:** cubrir los escenarios Gherkin de US-01; respuesta 201 con el recurso creado; 403 si la IP no está autorizada.
- **DoD:** tests unitarios y de integración; auditoría de la operación.

**Ticket 2 · Frontend** — Pantalla de fichaje (US-01)
- **Objetivo:** UI de fichaje en Next.js, mobile-first.
- **Detalle:** botón persistente Entrar/Salir con estado claro y **optimistic update**; gestión del permiso de geolocalización (opcional); feedback de éxito/error (incluido rechazo por IP); sin acciones de edición sobre fichajes.
- **Criterios de aceptación:** accesibilidad WCAG 2.1 AA (foco visible, `aria-label` dinámico, contraste ≥ 4.5:1); rollback visual si falla la petición.
- **DoD:** test de componente; verificación responsive.

**Ticket 3 · Base de datos** — Esquema de presencia
- **Objetivo:** modelar y migrar las entidades `ClockEntry` y `WorkDay` con Prisma sobre PostgreSQL.
- **Detalle:** definir tipos, claves foráneas y enums de estado (`PENDING/CONFIRMED/INCIDENT/VALIDATED`); campos de auditoría (`confirmed_by`, `confirmed_at`); índice por `employee_id` y `day`.
- **Criterios de aceptación:** migración reproducible + semillas mínimas; restricción que refleje la confirmación como competencia de Admin/RRHH.
- **DoD:** migración aplicada en entorno limpio; diccionario de datos actualizado.

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1** · Entrega 1 – Documentación Técnica (repo del proyecto)
Rama `feature-entrega1-FSF` sobre [franpereda/PeredaHR](https://github.com/franpereda/PeredaHR): incorpora todos los artefactos de documentación (PRD, UX, Casos de Uso, Modelo de Datos, Arquitectura), el sistema multi-agente (`/agents`, `/skills`) y los documentos de control (`/docs`).

**Pull Request 2** · Entrega 1 – Documentación del curso (este repositorio)
Rama `feature-entrega1-FSF` sobre [franpereda/AI4Devs-finalproject](https://github.com/franpereda/AI4Devs-finalproject): `readme.md` y `prompts.md` cumplimentados según la plantilla de entrega.

**Pull Request 3** · Pendiente (Entrega 2)
Se documentará con el primer MVP ejecutable (código de backend/frontend, tests y despliegue).
