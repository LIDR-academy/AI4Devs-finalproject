# Valer.IA

> **Valer.IA** = **Val**oración **A**utomatizada de Lo **E**jecutado y la **R**entabilidad.
> El sufijo *.IA* se lee como *Inteligencia Artificial* y, en clave de producto, como *Imputación Automatizada* —el motor trabajo→partida que es el núcleo del sistema—.

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

### 0.1. Tu nombre completo:

Jose Carlos Martinez Muñoz

### 0.2. Nombre del proyecto:

**Valer.IA** — Agente de certificación y control de margen para subcontrata de fontanería en obra nueva.

### 0.3. Descripción breve del proyecto:

Valer.IA es una herramienta de desarrollo agéntico que cierra el hueco entre la obra y la oficina en una subcontrata de fontanería que ejecuta instalaciones en obra nueva residencial para empresas constructoras. Toma la información de campo ya estructurada (partes de trabajo del Google Form y albaranes de material), la imputa a las partidas del presupuesto adjudicado, alimenta la certificación mensual de Presto y prepara la facturación en Factucom. Con ello elimina la certificación manual en Excel y, por primera vez, calcula el **margen real por promoción mes a mes** (certificación − horas − material), con alertas tempranas de desviación.

> **Nota:** este repositorio corresponde a un proyecto en fase de diseño. El readme está redactado describiendo el sistema objetivo como si estuviera implementado, para servir de especificación de referencia.

### 0.4. URL del proyecto:

`[pendiente de despliegue]`

### 0.5. URL o archivo comprimido del repositorio

https://github.com/AI4Devs-202602-Senior/Valer.IA (repositorio privado)

---

## 1. Descripción general del producto

### 1.1. Objetivo:

En instalación de fontanería de obra nueva, los datos de ejecución existen (el parte de cada fontanero), pero hoy no se convierten en certificación valorada ni en control de margen: se quedan como un registro de horas que nadie cruza con los precios de contrato ni con el material. Además, la certificación se hace en Excel —volviendo a teclear a mano lo que Presto ya tiene modelado— y el material, que **suele ser el mayor coste de la obra, por encima de la mano de obra**, no se registra en absoluto. El resultado es que el margen se calcula a ciegas y se descubre la desviación cuando la promoción ya está liquidada.

Valer.IA resuelve esto para tres perfiles:

- **Oficial de obra:** sigue rellenando el parte que ya rellena; no añade trabajo.
- **Administración:** deja de teclear certificaciones; revisa y valida borradores que el agente prepara, y los carga en Presto.
- **Gerencia:** consulta el margen real por promoción durante la ejecución y recibe alertas cuando una obra empieza a comerse el margen.

El valor concreto: recuperar certificación hoy perdida por medición de menos y por retraso (mejora de caja), conocer el margen real durante la obra y detectar fugas de material (merma, desvío entre obras, errores de facturación del proveedor).

### 1.2. Características y funcionalidades principales:

- **Lectura de partes (Google Form):** lee periódicamente el Excel del formulario e identifica fontanero, fecha, promoción, trabajo ejecutado y horas, sin acción adicional del oficial.
- **Imputación trabajo → partida:** mapea cada trabajo descrito en el parte a la partida/línea de medición del presupuesto BC3, con puntuación de confianza; lo dudoso va a revisión humana sin bloquear el resto (motor detallado en §2.2 y en el DDT).
- **Valoración automática:** valora la ejecución acumulada contra el cuadro de precios de cada contrato (cada constructora puede tener precios distintos para la misma partida).
- **Certificación:** genera el borrador mensual por líneas, exportable a Presto como fase de certificación (campo FaseCert). El agente **propone**; la persona valida y carga; Presto emite la certificación oficial.
- **Facturación de certificación (Factucom):** prepara el borrador de factura a la constructora (base, IVA, retención de garantía, condiciones de cobro); una persona la emite. El agente nunca factura solo.
- **Captura de material (albaranes):** procesa PDF de un buzón dedicado y fotos de albaranes en papel (extracción multimodal), e imputa cada albarán a su promoción.
- **Margen y alertas:** calcula margen real por promoción/mes (certificación − horas − material), compara consumo teórico frente a compra real y emite alertas tempranas de desviación.
- **Conciliación albarán–factura:** al llegar la factura del proveedor, la casa contra los albaranes capturados y reporta diferencias (rappels, abonos, devoluciones, errores de facturación).

### 1.3. Diseño y experiencia de usuario:

Valer.IA no es una herramienta que el usuario "use" todo el día: trabaja en segundo plano y solo reclama atención humana cuando hace falta una decisión. La experiencia se organiza en torno a una aplicación web de revisión con **colas de trabajo** y un **panel de margen**.

**Recorrido de Administración (cierre de mes):**

1. **Aterrizaje en el panel principal.** Al entrar, ve un resumen por promoción: cuánto se ha ejecutado e imputado este mes, cuántos partes están pendientes de revisión y el estado de la certificación.

   ![Panel principal de Administración — resumen por promoción, ejecución e imputación del mes, partes pendientes y estado de certificación](docs/screenshots/panel-principal.png)
2. **Cola de imputaciones dudosas.** Cada elemento muestra el texto del parte original, las partidas candidatas que el agente ha propuesto (con su confianza) y la cantidad. Con un clic confirma la partida correcta o elige otra; esa decisión alimenta el aprendizaje del sistema.

   ![Cola de imputaciones dudosas — parte original, partidas candidatas con su confianza y acción de confirmar o cambiar](docs/screenshots/cola-imputaciones.png)
3. **Borrador de certificación.** Una vista por líneas de medición con su origen y su valoración. Administración revisa, ajusta si procede y pulsa "generar BC3", que descarga el fichero listo para importar en Presto.

   ![Borrador de certificación — líneas de medición con FaseCert, valoración y origen, listo para generar el BC3](docs/screenshots/borrador-certificacion.png)
4. **Borrador de factura.** Tras aprobar la certificación en Presto, el sistema precarga la factura a la constructora con base, IVA y retención calculados; Administración la revisa y la emite en Factucom.

   ![Borrador de factura a la constructora — base imponible, IVA y retención de garantía calculados, pendiente de emitir en Factucom](docs/screenshots/borrador-factura.png)
5. **Conciliación.** Cuando llega la factura del proveedor, una vista muestra las diferencias frente a los albaranes capturados, señalando posibles errores de facturación.

   ![Informe de conciliación albarán–factura — diferencias detectadas con su tipo (exceso, desvío de precio, abono, rappel)](docs/screenshots/informe-conciliacion.png)

**Recorrido de Gerencia:** entra directamente al **panel de margen**, donde ve cada promoción con su margen real acumulado, la comparación consumo teórico vs. compra real y las alertas de desviación activas.

![Panel de margen de Gerencia — margen real por promoción, comparación consumo teórico vs. compra real y alertas de desviación](docs/screenshots/panel-margen.png)

**Recorrido del Oficial:** no cambia. Sigue rellenando el Google Form al cerrar jornada y, al recibir material, hace una foto del albarán y la envía por el canal habitual. No accede a la aplicación web.

### 1.4. Instrucciones de instalación:

**Requisitos previos:** Docker y Docker Compose, **Node.js 20+** (runtime necesario para construir y servir el frontend React + Vite), **Python 3.12+** (backend FastAPI y workers), una cuenta de servicio de Google Cloud (acceso a Sheets/Gmail), una API key de Anthropic y credenciales IMAP del buzón de albaranes.

```bash
# 1. Clonar el repositorio
git clone [URL del repositorio] valeria && cd valeria

# 2. Configurar variables de entorno
cp .env.example .env
#   editar .env y rellenar:
#   DATABASE_URL=postgresql+psycopg://valeria:valeria@localhost:5432/valeria
#   ANTHROPIC_API_KEY=...
#   GOOGLE_SERVICE_ACCOUNT_JSON=./secrets/google-sa.json
#   GOOGLE_SHEET_ID=...            # hoja del Google Form
#   IMAP_HOST / IMAP_USER / IMAP_PASSWORD   # buzón albaranes@empresa

# 3. Levantar PostgreSQL (con extensión pgvector)
docker compose up -d db

# 4. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head          # migraciones (crea esquema y habilita pgvector)
python -m app.seed            # semillas: roles, datos de ejemplo, BC3 demo
uvicorn app.main:app --reload # API en http://localhost:8000

# 5. Worker de tareas en segundo plano (en otra terminal)
python -m app.workers.main    # polling del Form y del buzón de albaranes

# 6. Frontend
cd ../frontend
npm install
npm run dev                   # web en http://localhost:5173
```

Acceso por defecto en `http://localhost:5173`. FastAPI publica automáticamente la documentación interactiva (Swagger UI) de la API en `http://localhost:8000/docs`, generada a partir de la especificación OpenAPI del backend.

---

## 2. Arquitectura del Sistema

### 2.1. Diagrama de arquitectura:

Valer.IA sigue una **arquitectura hexagonal (puertos y adaptadores)** sobre una **separación estricta entre razonamiento del LLM y lógica determinista**. El dominio (entidades y reglas) no conoce a Presto, Factucom, Google ni al modelo de IA: todos son adaptadores enchufados a puertos. El agente interviene solo en los pasos difusos (imputar, extraer, conciliar) y nunca calcula importes ni emite nada por su cuenta.

**Diagrama de contexto (C4 nivel 1):**

```mermaid
flowchart TB
    subgraph PERSONAS[" "]
        oficial["👷 Oficial de obra"]
        admin["🧑‍💼 Administración"]
        gerencia["👔 Gerencia"]
    end

    valeria{{"<b>Valer.IA</b><br/>Imputa · Certifica · Controla margen"}}

    subgraph EXTERNOS[" "]
        form["Google Form / Sheets"]
        correo["Buzón de albaranes"]
        presto["Presto"]
        factucom["Factucom"]
        claude["Claude API"]
    end

    oficial -->|rellena parte| form
    oficial -->|foto albarán| correo
    admin -->|revisa y valida| valeria
    gerencia -->|consulta| valeria

    valeria -->|lee partes| form
    valeria -->|lee albaranes| correo
    valeria -->|BC3 in/out| presto
    valeria -->|factura / proveedor| factucom
    valeria -->|razonamiento| claude

    classDef person fill:#08427b,stroke:#052e56,color:#fff;
    classDef sys fill:#1168bd,stroke:#0b4884,color:#fff;
    classDef ext fill:#999,stroke:#6b6b6b,color:#fff;
    class oficial,admin,gerencia person;
    class valeria sys;
    class form,correo,presto,factucom,claude ext;
    style PERSONAS fill:none,stroke:none;
    style EXTERNOS fill:none,stroke:none;
```

**Diagrama de contenedores (C4 nivel 2):**

```mermaid
flowchart TB
    admin["🧑‍💼 Administración"]
    gerencia["👔 Gerencia"]

    subgraph valeria["Valer.IA"]
        direction TB
        web["Aplicación web<br/><i>React + Vite</i>"]
        api["API Backend<br/><i>FastAPI</i>"]
        agent["Servicio de agente<br/><i>Claude tool-use</i>"]
        worker["Worker de tareas<br/><i>Python</i>"]
        db[("PostgreSQL<br/>+ pgvector")]
    end

    claude["Claude API"]
    fuentes["Fuentes externas<br/><i>Sheets · Buzón · Presto · Factucom</i>"]

    admin --> web
    gerencia --> web
    web -->|JSON/HTTPS| api
    api -->|SQL| db
    api -->|solicita razonamiento| agent
    agent -->|tool-use| claude
    worker -->|SQL| db
    worker -->|lee| fuentes
    api -->|BC3 / factura| fuentes

    classDef person fill:#08427b,stroke:#052e56,color:#fff;
    classDef cont fill:#1168bd,stroke:#0b4884,color:#fff;
    classDef ext fill:#999,stroke:#6b6b6b,color:#fff;
    class admin,gerencia person;
    class web,api,agent,worker,db cont;
    class claude,fuentes ext;
    style valeria fill:#e8f0fb,stroke:#1168bd,color:#0b4884;
```

**Justificación.** La arquitectura hexagonal permite que Presto, Factucom o el propio modelo de IA se cambien sin tocar la lógica de negocio: hoy la integración con Presto/Factucom es por fichero porque son aplicaciones de escritorio, pero si mañana aparece una API, solo cambia el adaptador. La separación LLM/determinista garantiza que las cifras (margen, base, IVA) sean exactas y auditables, y abarata la operación (el modelo solo se invoca en lo difuso). **Sacrificio asumido:** parte del flujo con Presto/Factucom tiene un paso humano de exportar/importar que no es automatizable de extremo a extremo; se diseña explícitamente así, sin fingir una integración total.

### 2.2. Descripción de componentes principales:

- **Aplicación web (React + Vite):** colas de revisión (imputaciones, certificación, factura, conciliación) y panel de margen. Solo presentación; toda la lógica está en el backend.
- **API Backend (FastAPI, Python):** expone los casos de uso y contiene el dominio puro (entidades y reglas) y la capa de aplicación (imputar, valorar, certificar, facturar, conciliar). Hace de orquestador.
- **Servicio de agente (Claude tool-use):** encapsula las tres capacidades de IA. En la imputación, recibe el texto del parte y las partidas candidatas recuperadas y elige (o declara "ninguna") con confianza; en albaranes, extrae JSON estructurado de imagen/PDF; en conciliación, empareja líneas y redacta las discrepancias. **No calcula importes ni inventa partidas.**
- **Worker de tareas (Python):** procesos en segundo plano que sondean el Google Sheet y el buzón IMAP, encolan partes y albaranes y disparan el pipeline de imputación/extracción.
- **Parsers y generadores (Python, deterministas):** lector/escritor BC3 (FIEBDC), generador de certificación con FaseCert, generador de factura para Factucom, generador de informes. Validan el BC3 con el chequeador oficial de FIEBDC.
- **Base de datos (PostgreSQL + pgvector):** sistema de registro del dominio y, a la vez, índice semántico (embeddings de las partidas) para la recuperación de candidatas en la imputación.

### 2.3. Descripción de alto nivel del proyecto y estructura de ficheros

Monorepo con backend y frontend separados. El backend sigue **clean/hexagonal**: `domain` no depende de nada; `application` orquesta casos de uso; `infrastructure` contiene los adaptadores (DB, conectores, agente, generadores).

El proyecto se desarrolla con **Spec-Driven Development (SDD) usando [OpenSpec](https://openspec.dev/)**: la especificación es la fuente de verdad y se acuerda *antes* de escribir código. La carpeta `openspec/` vive en el repositorio junto al código y mantiene dos espacios separados: `openspec/specs/` (la verdad actual, organizada por capacidad: imputación, certificación, material, margen) y `openspec/changes/` (propuestas de cambio, cada una con su `proposal.md`, `tasks.md`, `design.md` y sus *spec deltas*; al completarse se fusionan en `specs/` y se archivan). Esto da especificaciones vivas, sincronizadas con la implementación y auditables.

**Cómo encajan los tres niveles de especificación.** El proyecto distingue qué manda en cada plano para evitar solapamientos:

- **PRD y DDT** son los documentos *fundacionales*: fijan el alcance, las reglas de negocio y el diseño técnico de partida. Cambian poco y sirven de referencia y onboarding.
- **OpenSpec (`openspec/specs/`)** es la *fuente de verdad viva* del comportamiento del sistema: lo que el software hace ahora mismo, capacidad a capacidad. Cuando el comportamiento evoluciona, manda OpenSpec, no el PRD.
- **Jira** es la *gestión del trabajo*: épicas (historias de usuario) y tickets que planifican y siguen la ejecución.

El flujo los enlaza: una necesidad nace como historia/épica en Jira → se concreta en un *change* de OpenSpec (`proposal.md` + spec deltas + `tasks.md`) → esas tareas se reflejan como tickets de Jira → el código se entrega en un merge request de GitLab que referencia el ticket → al cerrarse, los spec deltas se fusionan en `openspec/specs/`. Así, **PRD/DDT explican el porqué y el diseño, OpenSpec define el qué vigente, y Jira lleva el cuándo y quién**, con trazabilidad de spec → ticket → código.

```
valeria/
├── backend/
│   ├── app/
│   │   ├── domain/            # Entidades y reglas de negocio (puro, sin I/O)
│   │   ├── application/       # Casos de uso: imputar, valorar, certificar, conciliar
│   │   ├── infrastructure/
│   │   │   ├── connectors/    # bc3, google_sheets, email (adaptadores de entrada)
│   │   │   ├── agent/         # herramientas y orquestación de Claude
│   │   │   ├── generators/    # bc3 certif., factura Factucom, informes (salida)
│   │   │   └── persistence/   # SQLAlchemy, repositorios, pgvector
│   │   ├── api/               # Routers FastAPI (HTTP)
│   │   └── workers/           # Tareas en segundo plano (polling, colas)
│   ├── alembic/
│   │   └── versions/
│   │       └── 0001_initial_schema.py   # Primera migración (modelo del DDT)
│   ├── db/
│   │   └── schema.sql         # Esquema SQL de referencia (snapshot)
│   ├── tests/                 # unit, integración, evals del modelo de imputación
│   ├── Dockerfile             # Imagen de backend (API + worker)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/             # Colas de revisión, panel de margen
│   │   ├── components/
│   │   └── api/               # Cliente de la API
│   ├── Dockerfile             # Build React+Vite servido por Nginx
│   ├── nginx.conf             # SPA + proxy /api
│   └── package.json
├── .gitlab-ci.yml             # Pipeline CI/CD: test → build → publish → deploy
├── .env.example              # Plantilla de variables de entorno
├── docker-compose.yml         # Despliegue en el host (api, worker, frontend, db)
├── openspec/                  # Spec-Driven Development (OpenSpec)
│   ├── project.md             # Convenciones, stack y estándares del proyecto
│   ├── AGENTS.md              # Instrucciones de workflow para los asistentes de IA
│   ├── specs/                 # Fuente de verdad, organizada por capacidad
│   │   ├── imputacion/
│   │   │   └── spec.md
│   │   ├── certificacion/
│   │   │   └── spec.md
│   │   ├── material/
│   │   │   └── spec.md
│   │   └── margen/
│   │       └── spec.md
│   └── changes/               # Propuestas de cambio (cada una su carpeta)
│       ├── <id-del-cambio>/
│       │   ├── proposal.md     # Propuesta del cambio
│       │   ├── tasks.md        # Tareas pequeñas y estructuradas
│       │   ├── design.md       # Notas de diseño
│       │   └── specs/          # Spec deltas (ADDED / MODIFIED Requirements)
│       └── archive/           # Cambios completados y fusionados en specs/
└── readme.md
```

### 2.4. Infraestructura y despliegue

El despliegue es **basado en imágenes de contenedor**, no en artefactos sueltos, de forma coherente con el diseño multiservicio (frontend, API y worker son contenedores independientes que comparten la base de datos). Esto da paridad dev→producción y reproducibilidad: la misma imagen probada en CI es la que corre en producción. La orquestación local es con Docker Compose; en producción, con la plataforma de contenedores que se elija (sin proveedor prefijado).

El registro de imágenes es el **GitLab Container Registry** integrado en el propio GitLab, sin servicios externos: el pipeline construye cada imagen y la publica con las variables predefinidas de GitLab (`$CI_REGISTRY_IMAGE`), y la fase de despliegue las descarga de ahí. Despliegue continuo mediante **GitLab CI/CD** (pipeline en `.gitlab-ci.yml`): en cada push a `main` se ejecutan tests, se construyen las imágenes y se publican.

```mermaid
flowchart LR
    dev["Desarrollo local"] -->|push| gl["GitLab"]
    gl -->|tests + build| ci["GitLab CI/CD<br/>(.gitlab-ci.yml)"]
    ci -->|imágenes| reg["GitLab Container Registry"]
    reg -->|deploy| env
    subgraph env["Entorno de ejecución"]
        fe["Contenedor Frontend<br/>React build + Nginx"]
        be["Contenedor API<br/>FastAPI / Uvicorn"]
        wk["Contenedor Worker<br/>Python"]
        db[("PostgreSQL + pgvector")]
    end
    fe --> be
    be --> db
    wk --> db
```

Proceso de despliegue: (1) merge request con tests en verde y revisión; (2) fusión a `main`; (3) el pipeline de GitLab CI/CD ejecuta la suite completa y **construye las imágenes de backend (compartida por API y worker) y de frontend**; (4) **publica las imágenes en el GitLab Container Registry**; (5) la fase de despliegue **descarga las imágenes del registro** y arranca los contenedores (API y worker desde la misma imagen de backend, con distinto comando de arranque), ejecutando automáticamente las migraciones (`alembic upgrade head`).

### 2.5. Seguridad

- **OAuth / cuenta de servicio con mínimo privilegio:** acceso de **solo lectura** a Google Sheets y al buzón de albaranes; sin permisos de escritura sobre las fuentes.
- **Gestión de secretos:** API keys y credenciales fuera del código, en variables de entorno / gestor de secretos; nunca en el repositorio.
- **Control de acceso por rol (RBAC):** Administración y Gerencia tienen vistas y acciones distintas; el Oficial no accede a la web.
- **No emisión autónoma:** por diseño, el sistema nunca cierra una certificación ni emite una factura sin validación humana (acción irreversible siempre tras confirmación).
- **Trabajo sobre copia:** ninguna operación contra Presto/Factucom se prueba sobre datos vivos; el volcado de BC3 de certificación se valida sobre copia por el riesgo de borrado de fases previas.
- **Trazabilidad/auditoría:** toda imputación, validación y emisión queda registrada con autor y marca de tiempo, base de la defensa en el contradictorio y de la auditoría del margen.
- **Datos sensibles fuera de la URL:** ningún dato personal o de negocio viaja en query strings.

### 2.6. Tests

**Backend**

- **Unitarios deterministas (críticos):** parser BC3, valoración (cantidad × precio), cálculo de margen, base/IVA/retención. Son la parte que debe ser exacta: cobertura alta y casos límite (certificación a origen vs. parcial).
- **Evals del modelo de imputación:** conjunto "golden" de partes con su partida correcta; se mide tasa de autoimputación y tasa de override en cada cambio del prompt o del catálogo, evitando regresiones.
- **Contract tests de conectores:** lectura de un Sheet de ejemplo, de un BC3 de ejemplo y de albaranes de muestra (PDF y foto), comprobando el JSON extraído.
- **Integración:** flujo extremo a extremo de un mes simulado (partes → imputación → valoración → borrador de certificación) sobre base de datos efímera.
- **Idempotencia:** reprocesar el mismo Excel/BC3 no duplica datos (dedupe por `form_response_id`).

Herramientas: `pytest` con base de datos efímera (servicio `pgvector` en CI).

**Frontend**

- **Unitarios y de componente:** lógica de las vistas y componentes de las colas de revisión y del panel de margen (renderizado, estados de carga/vacío, interacción de confirmar/cambiar partida), con **Vitest** y **React Testing Library**.
- **Linter y comprobación de tipos:** ESLint y TypeScript como puerta de calidad previa.
- **End-to-end (E2E):** recorridos clave (resolver una imputación dudosa, validar una certificación) con **Playwright** contra un backend de prueba.
- **Verificación de build:** `npm run build` en CI para asegurar que la compilación de producción no se rompe.

Ambas suites se ejecutan en paralelo en la etapa `test` del pipeline (jobs `test:backend` y `test:frontend`).

---

## 3. Modelo de Datos

### 3.1. Diagrama del modelo de datos:

```mermaid
erDiagram
    PROMOCION ||--o{ PARTIDA : "tiene"
    PROMOCION ||--o{ PARTE : "recibe"
    PROMOCION ||--o{ ALBARAN : "consume"
    PARTIDA ||--o{ LINEA_MEDICION : "se mide en"
    PARTIDA ||--o{ PARTIDA_ALIAS : "se conoce como"
    PARTIDA ||--o{ IMPUTACION : "recibe"
    PARTE ||--o{ IMPUTACION : "genera"
    ALBARAN ||--o{ ALBARAN_LINEA : "contiene"
    FACTURA_PROVEEDOR ||--o{ CONCILIACION : "origina"
    ALBARAN ||--o{ CONCILIACION : "se concilia en"
    PROMOCION ||--o{ CERTIFICACION : "produce"

    PROMOCION {
        int id PK
        string nombre
        string constructora
        date fecha_entrega
        string estado
    }
    PARTIDA {
        int id PK
        int promocion_id FK
        string codigo
        string resumen
        string unidad
        decimal precio_contrato
        string capitulo
    }
    LINEA_MEDICION {
        int id PK
        int partida_id FK
        string comentario
        decimal cantidad_presupuestada
        string ubicacion
    }
    PARTIDA_ALIAS {
        int id PK
        int partida_id FK
        string texto_alias
        string origen
    }
    PARTE {
        int id PK
        string form_response_id UK
        int promocion_id FK
        string fontanero
        date fecha
        string texto_trabajo
        string unidad_seleccionada
        decimal cantidad
        decimal horas
        bool procesado
    }
    IMPUTACION {
        int id PK
        int parte_id FK
        int partida_id FK
        decimal cantidad_imputada
        float confianza
        string estado
        string revisor
        datetime ts
    }
    ALBARAN {
        int id PK
        int promocion_id FK
        string proveedor
        date fecha
        string numero
        string estado_imputacion
    }
    ALBARAN_LINEA {
        int id PK
        int albaran_id FK
        string descripcion
        decimal cantidad
        decimal precio
        decimal importe
    }
    FACTURA_PROVEEDOR {
        int id PK
        string proveedor
        string numero
        date fecha
        decimal importe_total
        string fuente
    }
    CONCILIACION {
        int id PK
        int factura_proveedor_id FK
        int albaran_id FK
        string estado
        json diferencias
    }
    CERTIFICACION {
        int id PK
        int promocion_id FK
        string periodo
        string tipo
        string estado
        decimal total
    }
```

### 3.2. Descripción de entidades principales:

- **PROMOCION** — Obra adjudicada (contrato con una constructora). PK `id`. Restricciones: `nombre` y `constructora` not null. Relación 1:N con PARTIDA, PARTE, ALBARAN y CERTIFICACION.
- **PARTIDA** — Unidad de obra importada del BC3, con su precio **por contrato**. PK `id`, FK `promocion_id`. `precio_contrato` (decimal) not null. El mismo concepto puede existir en varias promociones con precio distinto (clave de RF-2.3). 1:N con LINEA_MEDICION, PARTIDA_ALIAS e IMPUTACION.
- **LINEA_MEDICION** — Líneas de medición del BC3, base del campo FaseCert al certificar. PK `id`, FK `partida_id`.
- **PARTIDA_ALIAS** — Sinónimos en el lenguaje real del fontanero asociados a una partida; alimenta la recuperación del motor de imputación. PK `id`, FK `partida_id`. `origen` indica si el alias es del catálogo o aprendido de correcciones.
- **PARTE** — Una fila del Excel del Google Form. PK `id`, FK `promocion_id`. `form_response_id` **unique** (garantiza idempotencia). Contiene el trabajo descrito, la unidad/cantidad y las horas.
- **IMPUTACION** — Resultado del modelo trabajo→partida. PK `id`, FK `parte_id` y `partida_id`. `estado` ∈ {auto, pendiente, validada, rechazada}; `confianza` (float 0–1); `revisor` y `ts` para auditoría. La acumulación mensual se calcula agregando las imputaciones en estado válido (no se almacena como dato editable).
- **ALBARAN / ALBARAN_LINEA** — Cabecera y líneas del material capturado (PDF o foto). PK `id`; ALBARAN_LINEA FK `albaran_id`. `estado_imputacion` marca si ya está asignado a promoción.
- **FACTURA_PROVEEDOR** — Factura recibida del proveedor (de Factucom o PDF). PK `id`. Fuente del coste contable cerrado para la conciliación.
- **CONCILIACION** — Resultado de casar factura contra albaranes. PK `id`, FK `factura_proveedor_id` y `albaran_id`. `diferencias` (JSON) con discrepancias detectadas.
- **CERTIFICACION** — Certificación mensual de una promoción. PK `id`, FK `promocion_id`. `tipo` ∈ {origen, parcial}; `estado` refleja el flujo borrador → validada → cargada en Presto.

---

## 4. Especificación de la API

La especificación de referencia es la que se recoge a continuación. El backend FastAPI la expone, además, como documentación interactiva autogenerada (Swagger UI) en la ruta `/docs` una vez en ejecución. Tres endpoints principales:

```yaml
openapi: 3.0.3
info:
  title: Valer.IA API
  version: 1.0.0
paths:
  /promociones/{id}/bc3:
    post:
      summary: Importar el presupuesto BC3 de una promoción
      description: Carga el catálogo de partidas y líneas de medición desde un fichero BC3 (FIEBDC) y construye el índice semántico de imputación.
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                fichero: { type: string, format: binary }
      responses:
        '201':
          description: Catálogo importado
          content:
            application/json:
              schema:
                type: object
                properties:
                  partidas_importadas: { type: integer }
                  version_fiebdc: { type: string }

  /promociones/{id}/imputaciones:
    get:
      summary: Listar imputaciones (cola de revisión)
      description: Devuelve las imputaciones de una promoción, filtrables por estado para alimentar la cola de revisión.
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
        - name: estado
          in: query
          schema: { type: string, enum: [auto, pendiente, validada, rechazada] }
      responses:
        '200':
          description: Lista de imputaciones
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id: { type: integer }
                    texto_trabajo: { type: string }
                    candidatas:
                      type: array
                      items:
                        type: object
                        properties:
                          partida_codigo: { type: string }
                          resumen: { type: string }
                          confianza: { type: number }
                    estado: { type: string }

  /promociones/{id}/certificaciones:
    post:
      summary: Generar borrador de certificación mensual
      description: Agrega la ejecución validada del periodo y genera el borrador por líneas, listo para validación y exportación a BC3.
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: integer }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                periodo: { type: string, example: "2026-06" }
                tipo: { type: string, enum: [origen, parcial] }
      responses:
        '201':
          description: Borrador generado
          content:
            application/json:
              schema:
                type: object
                properties:
                  certificacion_id: { type: integer }
                  total: { type: number }
                  lineas: { type: integer }
```

**Ejemplo — generar borrador de certificación:**

Petición:
```json
POST /promociones/12/certificaciones
{ "periodo": "2026-06", "tipo": "parcial" }
```
Respuesta:
```json
{ "certificacion_id": 87, "total": 18432.55, "lineas": 41 }
```

---

## 5. Historias de Usuario

**Historia de Usuario 1 — Revisión de imputaciones dudosas**
*Como* persona de Administración, *quiero* revisar los partes que el agente no ha podido imputar con confianza, *para* asegurar que toda la ejecución del mes queda asignada a la partida correcta antes de certificar.
**Criterios de aceptación:**
- Veo una cola con el texto original del parte y las partidas candidatas con su confianza.
- Puedo confirmar una candidata o buscar y elegir otra partida del contrato.
- Al resolver, el parte sale de la cola y la decisión queda registrada (autor y fecha).
- Mi corrección se incorpora como alias para mejorar futuras imputaciones.

**Historia de Usuario 2 — Generación y validación de la certificación mensual**
*Como* persona de Administración, *quiero* generar el borrador de certificación del mes y validarlo, *para* cargarlo en Presto sin teclear a mano y certificar completo y en plazo.
**Criterios de aceptación:**
- Genero el borrador por líneas de medición con su valoración y su origen.
- Puedo ajustar líneas antes de cerrarlo.
- Descargo un BC3 válido (verificado con el chequeador FIEBDC) para importar en Presto.
- El sistema distingue certificación a origen de parcial del periodo.

**Historia de Usuario 3 — Alerta de desviación de margen**
*Como* Gerencia, *quiero* recibir una alerta cuando una promoción empieza a comerse el margen, *para* actuar durante la ejecución y no al cerrar la obra.
**Criterios de aceptación:**
- Veo el margen real por promoción (certificación − horas − material) actualizado.
- Recibo alerta cuando la desviación supera un umbral configurable.
- Puedo comparar consumo teórico de material frente a compra real para localizar la fuga.

---

## 6. Tickets de Trabajo

> Los tickets de trabajo se crean y gestionan en **Jira**, donde se vinculan a las historias de usuario (épicas) y a los *spec deltas* de OpenSpec del cambio correspondiente. Los siguientes son representativos del trabajo inicial; la clave de cada ticket en Jira se referencia desde el merge request de GitLab para mantener la trazabilidad spec → ticket → código.

**Ticket 1 — Backend: motor de imputación trabajo → partida**
- **Descripción:** implementar el pipeline que, dado un `parte`, recupera partidas candidatas de su promoción (búsqueda híbrida semántica + léxica con pgvector), invoca al agente para elegir la partida y confianza, reconcilia unidades y enruta a imputación automática o a la cola de revisión según umbral.
- **Tareas:** repositorio de partidas con embeddings; herramienta del agente "elegir partida entre candidatas"; reglas de reconciliación de unidades; persistencia de `imputacion` con estado y confianza; dedupe por `form_response_id`.
- **Criterios de aceptación:** un parte con descripción clara se imputa solo con confianza ≥ umbral; uno ambiguo va a `pendiente` con candidatas; reprocesar no duplica.
- **Estimación:** 5 puntos.

**Ticket 2 — Frontend: cola de revisión de imputaciones**
- **Descripción:** construir la vista de cola que muestra el parte original, las candidatas con su confianza y la acción de confirmar/cambiar partida, conectada a `GET/PATCH /promociones/{id}/imputaciones`.
- **Tareas:** componente de tarjeta de imputación; buscador de partidas del contrato; estado de carga/vacío; feedback visual de confianza; registro de la acción.
- **Criterios de aceptación:** resolver un elemento lo retira de la cola y refleja el cambio sin recargar; accesible y usable en escritorio.
- **Estimación:** 3 puntos.

**Ticket 3 — Base de datos: esquema de imputación e índice semántico**
- **Descripción:** crear las tablas `partida`, `partida_alias`, `parte` e `imputacion`, habilitar la extensión `pgvector` y el índice de embeddings sobre partidas, con su migración Alembic.
- **Tareas:** definición de modelos SQLAlchemy; `CREATE EXTENSION vector`; columna de embedding + índice ANN; restricción unique en `form_response_id`; semilla con un BC3 de ejemplo.
- **Criterios de aceptación:** `alembic upgrade head` crea el esquema desde cero; la búsqueda por similitud devuelve candidatas en < 100 ms sobre el dataset de ejemplo.
- **Estimación:** 3 puntos.

---

## 7. Pull Requests

**Pull Request 1 — feat: parser BC3 e importación de presupuesto**
- Implementa el lector FIEBDC y el endpoint `POST /promociones/{id}/bc3`; persiste partidas y líneas de medición y valida el fichero con el chequeador oficial.
- Incluye tests unitarios del parser con BC3 de ejemplo (versiones FIEBDC-3/2016 y /2020).
- Issues vinculadas: #12 (parser), #15 (importación). *(Ejemplo ilustrativo.)*

**Pull Request 2 — feat: motor de imputación trabajo→partida con cola de revisión**
- Añade la recuperación híbrida con pgvector, la herramienta del agente para elegir partida, la reconciliación de unidades y el enrutado por umbral; expone la cola de imputaciones.
- Incluye el set de evals "golden" y la métrica de tasa de autoimputación en CI.
- Issues vinculadas: #21 (pipeline), #23 (evals), #24 (cola). *(Ejemplo ilustrativo.)*

**Pull Request 3 — feat: generación de certificación BC3 y validación**
- Implementa la agregación de la ejecución validada, el borrador por líneas y la exportación a BC3 con FaseCert; añade la vista de validación en el frontend.
- Incluye test de integración del flujo mensual y verificación de idempotencia.
- Issues vinculadas: #31 (generador), #33 (validación UI). *(Ejemplo ilustrativo.)*
