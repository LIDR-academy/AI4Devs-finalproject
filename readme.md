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

> **Nota sobre esta entrega (Entrega 2 – Primer MVP ejecutable).** Este `readme.md` resume el proyecto **PeredaHR** y enlaza al **repositorio privado** del proyecto, donde reside todo el código, la documentación y la evidencia: [github.com/franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) — rama **`feature-entrega2-FSF`** (PR de entrega: [#12](https://github.com/franpereda/PeredaHR/pull/12)). Al ser privado, el acceso para el equipo evaluador está concedido (ver 0.6). Los componentes de IA (RAG del convenio + Text-to-SQL) son alcance de la Entrega Final.

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Fran Sales Folch (FSF)

### **0.2. Nombre del proyecto:**

PeredaHR

### **0.3. Descripción breve del proyecto:**

PeredaHR es una plataforma interna de gestión de tiempo, presencia y operaciones de RRHH. Sustituye al SaaS de control horario actual eliminando el coste de licencia, integra por **acceso directo a las bases de datos SQL** de los terminales de fichaje (BioStar) y del ERP (SAGE), e incorpora **IA generativa verticalizada al dominio real**: un asistente RAG sobre el convenio colectivo con citación y un reporting conversacional (Text-to-SQL) con guardrails de privacidad.

### **0.4. URL del proyecto:**

**No hay URL pública.** Por requisitos de **RGPD + LOPDGDD** (los datos biométricos de BioStar y la geolocalización deben permanecer en infraestructura controlada por la empresa), PeredaHR se despliega **on-premise** en un servidor Windows interno; el acceso del evaluador se concede por **Terminal Server/RDP** ("privada con acceso concedido"). La aplicación también se ejecuta en **local en un comando** (ver 1.4).

Como evidencia del MVP en funcionamiento se aportan **capturas del flujo E2E completo** en [docs/evidencia-entrega2.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/evidencia-entrega2.md).

> Repositorio privado: el acceso al código está concedido al equipo evaluador (ver 0.6). Para credenciales adicionales se pueden compartir de forma segura a [alvaro@lidr.co](mailto:alvaro@lidr.co) vía [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

Repositorio **privado** del proyecto: [https://github.com/franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) — rama de la entrega: **`feature-entrega2-FSF`** · PR de entrega: [#12](https://github.com/franpereda/PeredaHR/pull/12).

> Al tratarse de un repositorio privado, el acceso está compartido con el equipo evaluador (ver 0.6).

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

Detalle completo en el [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/PRD-PeredaHR.md) (§01).

### **1.2. Características y funcionalidades principales:**

Implementadas en el MVP (Entrega 2):

| Módulo | Funcionalidad | Estado |
|---|---|---|
| Fichaje | Fichaje web Entrar/Salir con geolocalización opcional y restricción por IP de centro; **inmutable para el empleado** | ✅ MVP |
| Presencia | Mi Presencia (solo lectura), **confirmación de jornadas** y **validación de incidencias (exclusivas de Admin/RRHH)** | ✅ MVP |
| Solicitudes/Ausencias | Creación, saldos, calendario y **aprobación individual/masiva** con árbol de 2 niveles | ✅ MVP |
| Informes | **Registro mensual de jornada RD-Ley 8/2019** (export CSV/PDF) | ✅ MVP |
| Auth | SSO OIDC (Keycloak) + RBAC de 3 roles; acceso de demo por rol para evaluación | ✅ MVP |
| IA | Asistente RAG sobre convenio + reporting Text-to-SQL con guardrails | ⏳ Final |

Catálogo funcional completo en el [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/PRD-PeredaHR.md) (§03).

### **1.3. Diseño y experiencia de usuario:**

El diseño es **mobile-first** (el fichaje diario ocurre mayoritariamente en móvil), con accesibilidad **WCAG 2.1 AA**. Los user flows, wireframes y design system están en [UX-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/UX-PeredaHR.md).

**Capturas del MVP en funcionamiento** (login con acceso por rol → fichaje empleado/admin → Mi Presencia → solicitar/ver ausencias → confirmar/validar jornadas → registro RD-Ley con export → aprobación): **[docs/evidencia-entrega2.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/evidencia-entrega2.md)**.

### **1.4. Instrucciones de instalación:**

Monorepo **Turborepo + pnpm**: `apps/web` (Next.js 15), `apps/api` (NestJS 11), `packages/db` (Prisma 6 + PostgreSQL 16 + pgvector). Requisitos: Node 20+, pnpm 10, Docker con Compose v2.

```bash
# 1. Dependencias
pnpm install

# 2. Configuración
cp .env.example .env

# 3. Servicios de apoyo (PostgreSQL+pgvector y Keycloak)
docker compose up -d

# 4. Base de datos: cliente Prisma + migraciones + semillas
pnpm db:generate && pnpm db:migrate && pnpm db:seed

# 5. Levantar API (:3001) y Web (:3000)
pnpm dev
```

Abre **http://localhost:3000**. Para el **acceso de demo por rol** en `/login`: pon `DEMO_LOGIN_ENABLED="true"` en el `.env` raíz y `NEXT_PUBLIC_DEMO_LOGIN=true` en `apps/web/.env.local` (Next.js lee las `NEXT_PUBLIC_*` desde `apps/web/`). Para **datos de demo realistas** (fichajes, jornadas y solicitudes): `pnpm --filter @peredahr/api seed:demo`.

Instrucciones completas (local y despliegue on-premise) en el [readme.md del proyecto](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/readme.md).

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

El diagrama completo en **modelo C4 (niveles 1-3)** está en [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/Arquitectura-PeredaHR.md).

**Patrón y justificación.** Arquitectura por **contenedores**: aplicación web (Next.js/PWA), API de negocio (NestJS con RBAC), un **worker de sincronización** (ETL de lectura directa de las BD SQL de BioStar y SAGE) y un **servicio de IA** (RAG + Text-to-SQL con guardrails).

- **Por qué:** el stack único TypeScript reduce el coste cognitivo y acelera el MVP; PostgreSQL + pgvector cubre datos productivos y búsqueda vectorial en **un solo motor**, favoreciendo la **soberanía del dato** (hosting de la empresa, exigible por RGPD).
- **Beneficios:** menos piezas móviles, despliegue sencillo, datos bajo control propio, IA integrada.
- **Sacrificios:** el acceso directo a las BD de BioStar/SAGE acopla al esquema del proveedor (mitigado con capa de adaptación y tests de contrato); pgvector es suficiente para el volumen actual.

> En el MVP (Entrega 2) están implementados web, API, base de datos y autenticación. El **worker ETL** (BioStar/SAGE) y el **servicio de IA** están diferidos a la Entrega Final (requieren credenciales del cliente y pesan más en la fase de IA).

### **2.2. Descripción de componentes principales:**

- **Web App** — Next.js 15 (React), PWA mobile-first. Interfaz de empleado, manager y administrador. ✅
- **API** — NestJS 11 (Node/TypeScript), REST con autenticación OIDC y autorización RBAC (3 roles). ✅
- **Base de datos** — PostgreSQL 16 + pgvector (Prisma 6). ✅
- **IdP** — Keycloak (OIDC) para el SSO real; login de demo por rol para evaluación. ✅
- **Worker de sincronización** — lectura directa de las BD SQL de BioStar y SAGE. ⏳ Entrega Final.
- **Servicio de IA** — RAG (text-embedding-3 + pgvector + GPT-4o con citación) y Text-to-SQL con whitelist y exclusión de PII. ⏳ Entrega Final.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Monorepo con organización modular por dominio:

```
apps/web/                  · Frontend Next.js 15 (App Router, PWA mobile-first)
apps/api/                  · Backend NestJS 11 (REST + RBAC + OIDC)
packages/db/               · Prisma 6 (schema, migraciones, seed) sobre PostgreSQL+pgvector
docs/                      · PRD, UX, Casos de uso, Modelo de datos, Arquitectura,
                             runbook de despliegue y evidencia (capturas)
openspec/                  · Especificaciones spec-driven (cambios + specs vivas)
.github/workflows/ci.yml   · Pipeline de CI (typecheck, lint, tests, build)
docker-compose*.yml        · Orquestación local y de producción (db, keycloak, api, web)
deploy.ps1 / backup.ps1    · Despliegue on-premise y copias de seguridad
```

### **2.4. Infraestructura y despliegue**

- **Runtime:** 4 contenedores Docker — `db` (PostgreSQL+pgvector), `keycloak` (IdP), `api` (NestJS), `web` (Next.js) — orquestados por `docker-compose.prod.yml`. Las imágenes base se traen de `mirror.gcr.io`/`quay.io` (la red corporativa bloquea Docker Hub).
- **CI:** GitHub Actions ([.github/workflows/ci.yml](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/.github/workflows/ci.yml)) ejecuta en cada push/PR: `db:generate` → typecheck → lint → tests → build sobre un servicio Postgres+pgvector.
- **Despliegue (CD):** on-premise en servidor Windows interno con un **script de un comando** (`deploy.ps1`): `git pull` → build → `prisma migrate deploy` (nunca `migrate dev`) → `db seed` idempotente → `up` → **smoke E2E como puerta**. Backups con `pg_dump -Fc` + copia externa (`backup.ps1`); rollback documentado.
- **Acceso del evaluador:** Terminal Server/RDP al servidor interno (RGPD: datos en infraestructura de la empresa).

Runbook completo: [docs/despliegue-entrega2.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/despliegue-entrega2.md).

### **2.5. Seguridad**

- **Autenticación** OIDC/SSO (Keycloak) y **autorización RBAC** con 3 roles (Empleado, Manager, Admin/RRHH); el rol es la **fuente de verdad en BD**, no el claim del IdP. Guards globales en la API.
- **Sesión:** JWT propio en cookie `httpOnly`, `sameSite=lax`, `secure` configurable (`COOKIE_SECURE`).
- **Fichaje:** sellado en servidor, **inmutable para el empleado**, restricción por IP de centro; toda corrección es de Admin/RRHH y queda auditada.
- **Privacidad por diseño:** PII sensible (`dni`, `nss`, geolocalización, biométricos) excluida del Text-to-SQL; `/api/me` sin PII.
- **Auditoría (`AuditLog`):** login, fichajes/incidencias, confirmaciones y validaciones de jornada, correcciones, aprobaciones y generación de informes, con autoría y timestamp.
- **Soberanía del dato:** hosting on-premise controlado por la empresa (RGPD/LOPDGDD).

Detalle en [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/PRD-PeredaHR.md) §06 y [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/Arquitectura-PeredaHR.md) §8.

### **2.6. Tests**

- **API:** **212 tests** (Jest) — unitarios (lógica de dominio: emparejamiento de fichajes, consolidación de jornadas, saldos, días laborables…) e **integración** con guards reales y RBAC sobre la API.
- **Web:** tests del helper de calendario de ausencias.
- **E2E / smoke:** `scripts/smoke.mjs` firma un JWT y recorre el camino crítico (US-01/04/06/08); actúa de **puerta del despliegue** (`deploy.ps1` aborta si falla).
- **Calidad en CI:** typecheck del monorepo y `next build` en cada push/PR.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

El diagrama entidad-relación completo en **Mermaid `erDiagram`** (tipos, PK/FK y cardinalidades) está en [ModeloDatos-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/ModeloDatos-PeredaHR.md) (§1). El esquema implementado vive en [packages/db/prisma/schema.prisma](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/packages/db/prisma/schema.prisma).

### **3.2. Descripción de entidades principales:**

**Entidades raíz (7):** `Employee`, `Center`, `Department`, `Schedule`, `WorkCalendar`, `LeaveType`, `CollectiveAgreement`.

**Entidades derivadas de los flujos críticos:** `ClockEntry`, `WorkDay`, `LeaveRequest`, `ApprovalLog`, `LeaveAllocation`.

**Entidades de soporte:** `Site`, `Position`, `Role`, `Contract`, `Holiday`, `AgreementChunk` (fragmentos del convenio con embedding para el RAG), `Document`, `AuditLog`.

Ejemplos de atributos y restricciones (diccionario completo con indicador PII en el artefacto enlazado):

- **`Employee`** — `id` (uuid, PK), `first_name`/`last_name`, `email` (unique), `dni` (unique, **PII sensible**), `nss` (unique, **PII sensible**), `department_id`/`position_id`/`role_id`/`schedule_id` (FK), `manager_l1_id`/`manager_l2_id` (FK self), `active` (bool).
- **`ClockEntry`** — `id` (PK), `employee_id` (FK), `center_id` (FK), `ts` (timestamptz), `type` (ENTRADA/SALIDA), `geo_lat`/`geo_lng` (decimal, nullable, **PII opcional**), `source` (PEREDAHR/BIOSTAR), `immutable_for_employee` (bool).
- **`WorkDay`** — `status` (PENDING/CONFIRMED/INCIDENT/VALIDATED), `confirmed_by`/`validated_by` (FK, Admin/RRHH), `confirmed_at`/`validated_at`, `@@unique([employee_id, day])`.
- **`LeaveRequest` / `LeaveAllocation` / `ApprovalLog`** — ciclo de solicitud con reserva de saldo y aprobación de 1.º/2.º nivel.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

Endpoints principales del MVP (esbozo de contrato completo por recurso y rol en [Arquitectura-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/Arquitectura-PeredaHR.md) §7):

```yaml
openapi: 3.0.3
info: { title: PeredaHR API, version: "0.2.0 (Entrega 2)" }
paths:
  /api/clock-entries:
    post:
      summary: Registrar fichaje de entrada/salida (rol Empleado)
      security: [{ cookieAuth: [] }]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              required: [type]
              properties:
                type: { type: string, enum: [ENTRADA, SALIDA] }
                geoLat: { type: number, nullable: true }
                geoLng: { type: number, nullable: true }
      responses:
        "201": { description: Fichaje creado (ts sellado en servidor) }
        "403": { description: IP de centro no autorizada }
  /api/leave-requests:
    post:
      summary: Crear solicitud de ausencia (autoservicio)
      responses:
        "201": { description: Solicitud creada (PENDING, saldo reservado) }
        "409": { description: Solapamiento con otra solicitud }
  /api/reports/monthly-journey:
    get:
      summary: Registro mensual de jornada RD-Ley 8/2019 (rol Admin/RRHH)
      parameters:
        - { name: month, in: query, required: true, schema: { type: string, example: "2026-06" } }
      responses:
        "200": { description: Informe totalizado por empleado (JSON/CSV) }
```

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

Las 10 historias completas con criterios Gherkin están en el [PRD-PeredaHR.md](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/docs/PRD-PeredaHR.md) (§04). Las 3 del flujo E2E prioritario, ya implementadas:

**Historia de Usuario 1** · US-01 — Fichar entrada/salida
**Como** empleado, **quiero** fichar mi entrada y salida desde la web, **para** registrar mi jornada y cumplir con el registro horario legal.
*Criterios clave:* `ClockEntry` con timestamp, tipo y centro; geolocalización opcional; rechazo desde IP no autorizada; **inmutable para el empleado** (corrección solo Admin/RRHH, auditada).

**Historia de Usuario 2** · US-06 — Gestionar solicitudes (Admin/RRHH)
**Como** administrador de RRHH, **quiero** aprobar o rechazar solicitudes de forma individual y masiva con comentarios, **para** gestionar el pico de 73 solicitudes sin cuello de botella.
*Criterios clave:* aprobación individual y en lote; cada acción genera un `ApprovalLog`, actualiza el saldo (con devolución al rechazar) y soporta **2.º nivel**.

**Historia de Usuario 3** · US-08 — Generar el Registro mensual de jornada (Admin/RRHH)
**Como** administrador, **quiero** generar el informe oficial de Registro mensual de jornada, **para** cumplir el RD-Ley 8/2019 y responder a Inspección al momento.
*Criterios clave:* selección de mes y ámbito (empleado/centro/compañía); totales por empleado + detalle diario; exportable (CSV/PDF).

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos.

Tickets reales de la Entrega 2 (gestionados en Linear `PER-XX`, desarrollo spec-driven con OpenSpec; índice completo en el [readme.md del proyecto](https://github.com/franpereda/PeredaHR/blob/feature-entrega2-FSF/readme.md) §8):

**Ticket 1 · Backend** — PER-5 · Endpoint de fichaje (US-01)
- **Objetivo:** `POST /api/clock-entries` en NestJS.
- **Detalle:** empleado autenticado y centro asignado; `ClockEntry` (ts sellado en servidor, tipo, canal, geo opcional, `source=PEREDAHR`); restricción por IP de centro; **inmutable para el empleado**; secuencia inválida → incidencia auditada.
- **Aceptación:** escenarios Gherkin de US-01; 201 con el recurso; 403 si la IP no está autorizada. **DoD:** tests unitarios + integración y auditoría. ✅ (PR #1)

**Ticket 2 · Frontend** — PER-5 · Pantalla de fichaje (US-01)
- **Objetivo:** UI de fichaje en Next.js, mobile-first.
- **Detalle:** botón persistente Entrar/Salir con estado y contador del día; permiso de geolocalización opcional; feedback de éxito/error (incl. rechazo por IP); sin acciones de edición sobre fichajes.
- **Aceptación:** accesibilidad WCAG 2.1 AA; sin scroll horizontal en desktop (PER-23). **DoD:** verificación responsive. ✅ (PR #1, #13)

**Ticket 3 · Base de datos** — PER-16 · Esquema de presencia
- **Objetivo:** modelar y migrar `ClockEntry` y `WorkDay` con Prisma sobre PostgreSQL.
- **Detalle:** tipos, FKs y enums de estado (`PENDING/CONFIRMED/INCIDENT/VALIDATED`); auditoría (`confirmed_by/at`, `validated_by/at`); `@@unique([employee_id, day])`; índice HNSW para el RAG.
- **Aceptación:** migración reproducible (`migrate deploy`) + semillas; confirmación como competencia de Admin/RRHH. **DoD:** migración aplicada en entorno limpio. ✅

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

El MVP se construyó con **una PR por ticket** sobre el repo privado [franpereda/PeredaHR](https://github.com/franpereda/PeredaHR) (12 PRs, #1–#13), integradas en la rama de entrega y agrupadas en la PR de entrega **[#12](https://github.com/franpereda/PeredaHR/pull/12)** (`feature-entrega2-FSF` → `main`). Tres representativas:

**Pull Request 1** · [#1](https://github.com/franpereda/PeredaHR/pull/1) — PER-5 · UC-01 fichar entrada/salida web
Backend (endpoint inmutable + restricción IP) y frontend (widget de fichaje) del núcleo legal de control horario.

**Pull Request 2** · [#8](https://github.com/franpereda/PeredaHR/pull/8) — PER-10 · Gestionar solicitudes (aprobación individual y masiva)
Workflow de aprobación de 2 niveles con `ApprovalLog` y devolución de saldo al rechazar.

**Pull Request 3** · [#5](https://github.com/franpereda/PeredaHR/pull/5) — PER-12 · Registro mensual de jornada RD-Ley 8/2019
Informe legal totalizado por empleado con detalle diario y exportación CSV/PDF (criterio no-go de la entrega).

> Además, en **este repositorio** (`AI4Devs-finalproject`), la rama `feature-entrega2-FSF` actualiza `readme.md` con la documentación de la Entrega 2.
