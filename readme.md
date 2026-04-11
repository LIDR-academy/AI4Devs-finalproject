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

### **0.1. Tu nombre completo:**
Celia Merino Valladolid

### **0.2. Nombre del proyecto:**

### **0.3. Descripción breve del proyecto:**

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

**Reading Analytics Platform** es una aplicación web orientada a escritorio (desktop-first) para lectoras intensivas que quieren registrar lecturas y obtener estadísticas avanzadas de forma visual, sencilla y automatizada. Sustituye el uso de Excel como herramienta de seguimiento, elimina fórmulas manuales y reduce la entrada repetitiva de datos. El foco es la **analítica de libros leídos**: no es una red social, sino un espacio personal con dashboards, comparativas y objetivos.

### **1.1. Objetivo:**

**Propósito:** permitir que lectoras orientadas a datos registren lecturas con poca fricción, gestionen TBR mensuales, analicen métricas mensuales y anuales, sigan una meta anual, exporten visuales atractivos y descubran patrones en sus hábitos.

**Valor y problema que resuelve:** centraliza el tracking lector y la analítica en un solo producto, con captura de metadatos automatizada (frente a hojas de cálculo) y estadísticas pensadas para quienes ya disfrutan analizando patrones.

**Para quién:** lectoras que leen varios libros al mes y suelen usar Excel o Notion; como caso secundario, perfiles que quieren wrap-ups y estadísticas visuales para contenido (por ejemplo Instagram o TikTok).

### **1.2. Características y funcionalidades principales:**

- **Registro y seguimiento de lecturas:** añadir libros con búsqueda que enriquece metadatos (con fallback entre fuentes: Open Library, Google Books, Goodreads y entrada manual); progreso por página o porcentaje; lecturas simultáneas.
- **Home:** vista con libros en curso, progreso, meta anual, KPIs del mes y TBR actual.
- **Book Tracker:** tabla visual, filtros, búsqueda interna, edición y altas.
- **Reading Stats:** dashboards, gráficos, comparativas e insights.
- **Listas y TBR:** TBR mensual, listas personalizadas, favoritos y retos; apoyo a flujos tipo drag and drop (según diseño).
- **Goals:** meta anual, forecast y evolución.
- **Biblioteca (Library):** histórico completo con búsqueda avanzada y filtros (autora, género, trope, saga, año, formato, rating, etc.).
- **Recap / Insights:** resúmenes mensuales y anuales; exportación.
- **Import / Export:** Excel, CSV, export de Goodreads; export en PNG, PDF y formato story 9:16.
- **Tags personalizados:** etiquetas propias (por ejemplo géneros de nicho o book club).
- **Perfil y ajustes:** preferencias, temas visuales, fuentes de datos y objetivos.

**Prioridades de producto (referencia PRD):** MVP centrado en alta automática de libros, listas TBR, meta anual e insights automáticos; en evolución, comparativas, export story, búsqueda avanzada y tags.

### **1.3. Diseño y experiencia de usuario:**

**Estilo:** línea visual *soft feminine / coquette*: elegante, suave, cálida y limpia, más cercana a una app de journaling o *reading planner* que a un SaaS corporativo.

**Navegación:** barra lateral fija a la izquierda que da acceso a Home, Book Tracker, Reading Stats, Listas, Goals, Library, Recap/Insights, Import/Export y Perfil/Ajustes.

**Principios de interfaz:** tarjetas con bordes redondeados, tipografía editorial, dashboards y gráficos claros, microinteracciones y edición inline, modales y filtros persistentes donde aplique.

**Paleta (referencia):** Veranda blue `#6BB1AD` (primarios y navegación), Sky cloud `#A7BCBD` (secundarios), blanco `#FFFFFF` (fondo), Lychee `#ECECDB` (cards/modales), Melon `#E5A9A9` (highlights), Cupid pink `#E6748E` (KPIs y acentos).

**Accesibilidad:** cumplimiento orientado a la normativa española (Ley 11/2023, RD 193/2023) y estándar UNE-EN 301 549 alineado con WCAG 2.1/2.2 nivel AA.


### **1.4. Instrucciones de instalación:**

Stack previsto: **frontend** React y TypeScript; **backend** Node.js con NestJS; **base de datos** PostgreSQL. Los pasos concretos (`package.json`, scripts, migraciones y semillas) dependerán del repositorio cuando el código esté en el árbol; como guía típica en local:

1. **Requisitos:** Node.js (LTS), npm o pnpm, PostgreSQL instalado o vía Docker, y Git.
2. **Base de datos:** crear una base y un usuario; configurar la URL en un archivo `.env` del backend (por ejemplo `DATABASE_URL` o variables que use TypeORM/Prisma según se elija).
3. **Backend:** clonar el repositorio, entrar en la carpeta del API, instalar dependencias, ejecutar migraciones y, si existen, semillas (`npm install`, `npm run migration:run`, `npm run seed`, u homólogos).
4. **Frontend:** en la carpeta del cliente, instalar dependencias y arrancar en desarrollo (`npm install`, `npm run dev` o `npm start`), apuntando la URL del API en variables de entorno (por ejemplo `VITE_*` o `REACT_APP_*`).
5. **Servicios externos (opcional):** claves para Open Library / Google Books si el backend las requiere para cuotas o configuración.

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura**

La plataforma sigue un modelo **cliente-servidor**: una SPA en el navegador consume una **API REST** stateless; el backend concentra la lógica de negocio por dominios (alineados con los casos de uso del [PRD](PRD.md) y [`documents/use-cases.md`](documents/use-cases.md)); **PostgreSQL** es la fuente de verdad para biblioteca, lecturas, listas, metas y agregados analíticos. La resolución de metadatos de libros pasa por **Open Library** primero y **Google Books** en **fallback secuencial** (UC-01).

![Diagrama de arquitectura del sistema](documents/architecture_diagram.png)

```mermaid
flowchart TB
  subgraph client["Cliente web (desktop-first)"]
    SPA["React + TypeScript SPA"]
  end

  subgraph api["Backend NestJS + Node.js"]
    REST["API REST / JSON"]
    BookSvc["BookService"]
    StatsSvc["StatsService"]
    TBRSvc["TBRService"]
    GoalSvc["GoalService"]
    ImportSvc["ImportService"]
    RenderSvc["RenderService"]
  end

  subgraph data["Persistencia"]
    PG[("PostgreSQL")]
  end

  subgraph ext["Fuentes externas (catálogo)"]
    OL["Open Library API"]
    GB["Google Books API"]
  end

  SPA <-->|"HTTPS · REST"| REST
  REST --> BookSvc & StatsSvc & TBRSvc & GoalSvc & ImportSvc & RenderSvc
  BookSvc & StatsSvc & TBRSvc & GoalSvc & ImportSvc & RenderSvc --> PG
  BookSvc -->|"1 · búsqueda primaria"| OL
  BookSvc -.->|"2 · fallback si sin resultados / error"| GB
  ImportSvc -.->|"enriquecimiento / normalización vía catálogo"| BookSvc
```

**Patrón arquitectónico.** Se adopta un **monolito modular por capas** en el backend (NestJS: módulos + providers inyectables), expuesto como **API REST**. El frontend es una **SPA** que orquesta vistas ricas (dashboards, tablas, export) sin lógica de persistencia propia.

Encaja con el producto porque: (1) **desktop-first** y **sin red social** no exigen fan-out en tiempo real ni grafos de relaciones entre usuarias: el tráfico es petición-respuesta y lecturas/escrituras acotadas a la sesión de una usuaria. (2) **Analytics-heavy** se resuelve bien con **consultas y jobs sobre un único esquema relacional** coherente (StatsService y agregados derivados de libros y eventos de lectura), evitando la complejidad operativa de sincronizar microservicios para métricas que deben ser consistentes entre Home, Reading Stats y Goals. (3) Los **servicios nombrados** mapean directamente a capacidades del PRD y UC: libros y estados (BookService), KPIs y series temporales (StatsService), TBR mensual (TBRService), meta anual y forecast (GoalService), ingestas Excel/CSV/Goodreads (ImportService), artefactos visuales PNG/PDF/story (RenderService).

**Beneficios principales para el proyecto**

1. **Una fuente de verdad y analítica coherente:** todo el historial de lectura y las listas viven en PostgreSQL; las mismas reglas alimentan tracker, estadísticas, TBR y metas, reduciendo discrepancias entre pantallas.
2. **Coste cognitivo y de despliegue bajos para el alcance MVP:** un solo despliegue backend, trazabilidad clara UC → módulo/servicio, y tests de integración contra una base de datos real sin orquestación distribuida.
3. **Encapsulación de integraciones frágiles:** el fallback Open Library → Google Books queda acotado al dominio de catálogo (BookService); el resto de la API no depende del contrato concreto de cada proveedor externo.

**Sacrificios y limitaciones**

1. **Escalado horizontal del monolito:** si el volumen de usuarias o de informes pesados crece, el mismo proceso sirve API y trabajos costosos (p. ej. RenderService); puede hacer falta extraer colas/workers o instancias dedicadas sin rediseñar el modelo de datos.
2. **Acoplamiento a disponibilidad y cuotas de terceros:** caídas o límites de Open Library / Google Books degradan el alta de libros; hace falta caché, reintentos y entrada manual (UC-01) como válvula de escape ya prevista en producto.
3. **SPA + REST:** la primera carga y la hidratación de dashboards pueden ser más pesadas que un enfoque multipágina server-rendered; se compensa con buen code splitting y endpoints de agregación pensados para no multiplicar round-trips innecesarios.

### **2.2. Descripción de componentes principales:**

La aplicación se organiza en **capas** sobre un **monolito modular NestJS** y una **SPA React**. La tabla siguiente resume responsabilidades, tecnología y dependencias; después se detallan los **servicios de dominio** alineados con el PRD y los UC.

#### Capas transversales

| Componente | Responsabilidad | Tecnología | Dependencias clave |
| --- | --- | --- | --- |
| **Capa de presentación (SPA)** | Rutas y vistas por módulo de producto (Home, Book Tracker, Reading Stats, Lists/TBR, Goals, Library, Recap/Insights, Import/Export, Perfil); estado de UI, formularios, tablas y gráficos; consumo de la API REST. | React 18+, TypeScript, enrutador (p. ej. React Router), cliente HTTP (p. ej. TanStack Query + `fetch`/`axios`), librería de gráficos según diseño. | API REST del backend (`apps/api`); tipos compartidos opcionales (`packages/shared`). |
| **Capa de API (HTTP)** | Exponer recursos REST versionados; validar entrada (DTOs + `class-validator`); autenticación/autorización por usuaria; traducir HTTP ↔ dominio; códigos de error homogéneos. | NestJS (`Controllers`, `Guards`, `Interceptors`, `Pipes`). | Servicios de dominio del mismo proceso; sin lógica de negocio pesada en controladores. |
| **Capa de servicios de dominio** | Reglas de negocio: libros y lecturas, listas y TBR, metas, agregados analíticos, importación, generación de exportaciones visuales; orquestación entre repositorios y proveedores externos. | NestJS `Providers` / `@Injectable()` servicios por módulo funcional. | Repositorios ORM, otros servicios del monolito, clientes HTTP a catálogos externos. |
| **Capa de acceso a datos** | Persistencia relacional, transacciones, consultas para estadísticas y biblioteca; migraciones y esquema coherente con una sola fuente de verdad. | PostgreSQL; **TypeORM** (o Prisma) con **entidades** y repositorios inyectables. | Solo desde servicios de dominio (no desde controladores). |
| **Servicios externos (catálogo)** | Búsqueda y enriquecimiento de metadatos de libros con política de fallback. | APIs públicas: **Open Library** (primaria), **Google Books** (fallback). | Cliente HTTP (p. ej. `axios`/`fetch`) encapsulado en el módulo de catálogo; reintentos y degradación a alta manual (UC-01). |

#### Servicios de dominio y módulos Nest (alineación PRD / UC)

| Servicio / módulo | Responsabilidad (resumen) | UC principal | Dependencias clave |
| --- | --- | --- | --- |
| **Auth / Users** | Identidad de la usuaria, sesión o JWT, aislamiento de datos por `userId`; preferencias de perfil y ajustes (tema, fuentes de datos visibles, etc.). | Transversal a todos | Entidad `User`, guards JWT, bcrypt o similar para secretos. |
| **BookService** (`books`) | Alta y búsqueda de libros (catálogo + manual), estados de lectura (UC-02), progreso páginas/% (UC-03), puntuación y etiquetas (UC-04); consultas de biblioteca (UC-09). | UC-01, UC-02, UC-03, UC-04, UC-09 | Entidades libro/lectura, **CatalogProvider** (Open Library / Google Books), **TBRService** para completar ítems al pasar a `Leído`. |
| **ListService** + **TBRService** (`lists`) | Listas personalizadas, favoritos, retos (PRD); TBR mensual: creación manual o automática, edición en cualquier mes, orden por prioridad (UC-05). | UC-05 | Entidades lista / ítem de lista, **BookService**. |
| **GoalService** (`goals`) | Meta anual, seguimiento, forecast e insights de ritmo (UC-06). | UC-06 | Entidad meta, lecturas agregadas vía **StatsService** o consultas a libros leídos. |
| **StatsService** (`stats`) | KPIs, series temporales, comparativas e insights para Reading Stats, Home y Recap (UC-07); datos de contexto para exportaciones. | UC-07 | PostgreSQL (consultas y vistas materializables si se necesitan), entidades de lectura/libro. |
| **ImportService** (`import`) | Ingesta Excel, CSV, Goodreads: validación, deduplicación, normalización vía catálogo cuando aplique (UC-08). | UC-08 | **BookService**, ficheros temporales o streaming, jobs opcionales para lotes grandes. |
| **RenderService** (`export` o `render`) | Generación de PNG, PDF y story 9:16 a partir de plantillas y datos de wrap-up (UC-10). | UC-10 | **StatsService**, **BookService**, motor de plantillas / render headless si aplica. |

#### Alineación rápida UC-01 … UC-10

| UC | Superficie producto | Backend (orientativo) |
| --- | --- | --- |
| UC-01 | Book Tracker | `books` + clientes catálogo |
| UC-02 | Book Tracker / Home | `books`, evento a `lists` (TBR) |
| UC-03 | Book Tracker / Home | `books` (progreso) |
| UC-04 | Book Tracker / modal post-lectura | `books` (rating, tags) |
| UC-05 | Lists / TBR | `lists` |
| UC-06 | Goals | `goals` |
| UC-07 | Reading Stats / Home | `stats` |
| UC-08 | Import / Export | `import` |
| UC-09 | Library | `books` (consultas filtradas) |
| UC-10 | Recap / Insights | `export` (`RenderService`) + `stats` |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

Patrón elegido: **monorepo** con dos aplicaciones (`apps/web`, `apps/api`) y un paquete opcional de tipos compartidos. El backend sigue **módulos verticales NestJS** (controller / service / entity por dominio); el frontend sigue **features** por módulo de producto más **carpetas transversales** (`components`, `hooks`, `services`).

```text
reading-analytics/                 # raíz del monorepo
├── apps/
│   ├── api/                       # Backend NestJS + Node.js (API REST)
│   │   ├── src/
│   │   │   ├── main.ts            # bootstrap HTTP, prefijos globales, validación
│   │   │   ├── app.module.ts      # importa módulos de dominio y configuración
│   │   │   ├── common/            # guards, pipes, filters, decorators, utilidades HTTP
│   │   │   ├── config/            # carga y validación de variables de entorno
│   │   │   ├── database/          # data source TypeORM, suscripción a migraciones
│   │   │   └── modules/
│   │   │       ├── auth/          # autenticación, JWT, estrategias
│   │   │       ├── users/         # perfil, preferencias y ajustes (Perfil)
│   │   │       ├── books/         # tracker, estados, progreso, ratings, biblioteca; clientes catálogo OL/GB (UC-01…04, UC-09)
│   │   │       ├── lists/         # TBR mensual, listas personalizadas, favoritos, retos (UC-05)
│   │   │       ├── goals/         # meta anual y forecast (UC-06)
│   │   │       ├── stats/         # agregados y endpoints para dashboards (UC-07, datos Recap)
│   │   │       ├── import/        # Excel, CSV, Goodreads (UC-08)
│   │   │       └── export/        # PNG, PDF, story 9:16 (UC-10)
│   │   │       # convención Nest por módulo: *.module.ts, *.controller.ts, *.service.ts, entities/, dto/
│   │   ├── test/                  # e2e y tests de integración API
│   │   └── package.json
│   │
│   └── web/                       # Frontend React + TypeScript (SPA desktop-first)
│       ├── src/
│       │   ├── main.tsx           # entrada React, providers (router, query client)
│       │   ├── app/               # layout raíz, sidebar PRD, rutas principales
│       │   ├── features/
│       │   │   ├── home/          # Home: KPIs, lecturas en curso, TBR actual, meta
│       │   │   ├── book-tracker/  # tabla, filtros, alta libro, estados (UC-01, UC-02, UC-03, UC-04)
│       │   │   ├── reading-stats/ # dashboards y comparativas (UC-07)
│       │   │   ├── lists/         # TBR y listas (UC-05)
│       │   │   ├── goals/         # meta anual (UC-06)
│       │   │   ├── library/       # histórico y búsqueda avanzada (UC-09)
│       │   │   ├── recap/         # resúmenes mensuales/anuales y disparo de export (UC-10)
│       │   │   ├── import-export/ # importaciones y descargas (UC-08, export)
│       │   │   └── profile/       # perfil y ajustes
│       │   │   # por feature: pages/, components/, hooks, cliente API local (p. ej. api.ts)
│       │   ├── components/        # UI reutilizable (botones, modales, tablas, charts envoltorio)
│       │   ├── hooks/             # hooks transversales (auth, media query, debounce)
│       │   ├── services/          # cliente API REST tipado, una función por recurso
│       │   ├── lib/               # utilidades puras, formateo fechas, constantes
│       │   └── types/             # tipos TS del front si no usas paquete shared
│       ├── public/
│       └── package.json
│
├── packages/
│   └── shared/                    # opcional: DTOs/tipos de contrato API compartidos entre web y api
│       └── src/
│
├── package.json                   # workspaces del monorepo (npm/pnpm/yarn)
├── turbo.json / nx.json           # opcional: orquestación de build en monorepo
└── README.md
```

### **2.4. Infraestructura y despliegue**

#### Propuesta de infraestructura cloud (MVP)

Para la fase **MVP** conviene minimizar coste fijo y operación, manteniendo **separación** entre frontend estático, API y base de datos, con despliegue continuo desde Git.

| Pieza | Propuesta | Motivo |
| --- | --- | --- |
| **Código y CI/CD** | **GitHub** + **GitHub Actions** | Integración nativa con el repositorio, secretos centralizados, runners gratuitos suficientes para builds de MVP. |
| **Base de datos** | **PostgreSQL gestionado en región UE** (p. ej. **Neon**, **Supabase** o **RDS** en `eu-west-3` París / `europe-west1` o similar) | Copias automáticas, parches y cifrado en reposo gestionados; alineación con **RGPD** y expectativas de la **Ley 11/2023** (datos alojados en **Espacio Económico Europeo**). |
| **API (NestJS)** | **Contenedor** desplegado en **Railway**, **Render** o **Fly.io** (región UE cercana a la BD) | Un servicio Node por app; escalado manual a 0 o 1 instancia en MVP; variables de entorno para `DATABASE_URL` y JWT. |
| **Frontend (React SPA)** | **Vercel**, **Netlify** o **Cloudflare Pages** | CDN global para activos estáticos, HTTPS automático, preview por rama opcional; **desktop-first** sin app nativa encaja con SPA + API. |
| **Dominio y TLS** | Dominio propio + certificados gestionados por el proveedor del front y del API | HTTPS obligatorio en tránsito. |

No se asume app móvil nativa ni tráfico social; el modelo **cliente → API REST → PostgreSQL** es suficiente. Si más adelante el **RenderService** (export PNG/PDF) consume mucha CPU, se puede extraer a un **worker** en la misma plataforma o a un job en cola sin cambiar el diseño lógico.

#### Diagrama Mermaid — pipeline de despliegue (Git → producción)

![Pipeline CI/CD — desarrollo, GitHub Actions, despliegue y producción](documents/despliegue.png)

```mermaid
flowchart LR
  subgraph dev["Desarrollo"]
    DEV[Desarrolladora local]
    GIT[(Repositorio Git / GitHub)]
    DEV -->|git push| GIT
  end

  subgraph ci["CI — GitHub Actions"]
    TRG[Workflow on push main]
    LNT[Lint + typecheck monorepo]
    TST[Tests unitarios e integración]
    BAPI[Build imagen Docker API]
    BWEB[Build SPA estática]
    TRG --> LNT --> TST
    TST --> BAPI
    TST --> BWEB
  end

  subgraph cd["CD — despliegue"]
    REG[(Registry GHCR)]
    MIG[Migraciones SQL en PostgreSQL]
    DEPAPI[Desplegar API NestJS]
    DEPWEB[Publicar dist SPA]
    BAPI --> REG --> DEPAPI
    BWEB --> DEPWEB
    REG --> MIG
    MIG --> DEPAPI
  end

  subgraph prod["Producción"]
    PG[("PostgreSQL UE")]
    API[NestJS API]
    CDN[CDN + SPA React]
    DEPAPI --> API
    DEPWEB --> CDN
    API --> PG
  end

  GIT --> TRG
  CDN -->|HTTPS REST| API
```

#### Proceso paso a paso

1. **Desarrollo local:** la fundadora trabaja en el monorepo (`apps/web`, `apps/api`), con PostgreSQL local o una base de desarrollo en la nube; variables sensibles solo en `.env` local (nunca en Git).
2. **Push a GitHub:** al integrar cambios en `main` (o al etiquetar una release, según política del equipo), se dispara el workflow de GitHub Actions.
3. **CI — calidad:** se ejecutan **lint**, **typecheck** y **tests** (Jest en API, Vitest en web) para fallar rápido si se rompe el contrato o la lógica crítica.
4. **CI — artefactos:** se construye la **imagen Docker** del API (o el bundle Node según plataforma) y el **build estático** del frontend (`vite build` o equivalente).
5. **CD — base de datos:** contra el PostgreSQL de **producción** (o un entorno `staging` previo) se aplican **migraciones** de TypeORM/Prisma de forma ordenada, normalmente como paso explícito en el pipeline o como comando de release previo al arranque del contenedor.
6. **CD — API:** el proveedor cloud **tira de la nueva imagen** o del nuevo commit, reinicia el servicio NestJS con las variables de entorno de producción (`DATABASE_URL`, `JWT_SECRET`, claves de catálogo si aplica).
7. **CD — frontend:** se sube el directorio de salida del build a Vercel/Netlify/Pages; la SPA queda servida por HTTPS con **CORS** apuntando solo al origen del API de producción.
8. **Verificación:** smoke manual o comprobación automatizada (healthcheck `GET /health`, una petición autenticada de prueba) y revisión de logs del primer despliegue.

Entornos recomendados en MVP: al menos **producción** + opcional **preview** por PR (frontend) y **staging** (API + BD clonada o esquema aparte) cuando el volumen de cambios lo justifique.

---

### **2.5. Seguridad**

La aplicación trata **datos personales de hábitos de lectura** (qué libros se leen, cuándo, valoraciones, listas). La superficie de ataque principal es la **API REST**, el **almacenamiento** y las **integraciones externas** (catálogo, import CSV). A continuación, prácticas esenciales alineadas con **WCAG 2.1/2.2 AA** (accesibilidad no es seguridad perimetral, pero sí cumplimiento y confianza) y con la **Ley 11/2023** y normativa de accesibilidad asociada en España.

| Práctica | Descripción breve | Ejemplo o referencia en el sistema |
| --- | --- | --- |
| **Autenticación segura** | Contraseñas fuertes almacenadas con **hash** (bcrypt/argon2); sesión basada en **JWT de corta vida** o **cookies HttpOnly + refresh**; nunca devolver el hash al cliente. | Módulo `auth`: `AuthService.validateUser()` + `JwtStrategy`; DTO `LoginDto` con validación de formato. |
| **Autorización por recurso** | Cada consulta y mutación debe filtrar por **`userId`** de la usuaria autenticada; prohibido confiar en IDs enviados sin comprobar pertenencia. | `BookService.findOne(id, userId)` y `ListsController` con `@Request() req.user.sub` inyectado en el servicio. |
| **Protección de datos personales (lectura)** | Minimización: solo campos necesarios en DTOs de respuesta; **RGPD**: base legal (ejecución del servicio), derecho de acceso/borrado documentado; datos en **UE**; registro de tratamiento interno. | `users`: endpoint de exportación/borrado de cuenta; política de retención en documentación de privacidad enlazada desde **Perfil**. |
| **Transporte cifrado** | **TLS 1.2+** en todo tráfico cliente–API y API–PostgreSQL si el proveedor lo soporta; HSTS en el dominio del front. | URLs de producción `https://api.readinganalytics.example` y `https://app.readinganalytics.example` en variables `VITE_API_URL` / `CORS_ORIGIN`. |
| **CORS restringido** | Orígenes permitidos **lista blanca** (solo el dominio del SPA en prod); sin `*` con credenciales. | `main.ts` Nest: `app.enableCors({ origin: process.env.CORS_ORIGIN?.split(','), credentials: true })`. |
| **Cabeceras HTTP de endurecimiento** | Reducir riesgo de XSS/clickjacking en el front servido. | Helmet en Nest (`helmet()`); meta CSP en el host estático del SPA según guía del proveedor CDN. |
| **Rate limiting (API propia)** | Limitar abuso de login y endpoints costosos. | `@nestjs/throttler` en `AppModule`: `ThrottlerGuard` global; límites más estrictos en `POST /auth/login`. |
| **Rate limiting / resiliencia (APIs externas)** | Open Library y Google Books tienen cuotas; evitar tormentas de peticiones desde cada usuaria. | Módulo `books`: cola o **token bucket** en un `CatalogService` con `p-limit`/`Bottleneck`; caché en memoria/Redis opcional para búsquedas repetidas (UC-01). |
| **Validación de entrada** | Todos los body/query validados con **class-validator**; rechazar tipos y tamaños anómalos. | DTOs en `books/dto`, `import/dto`; `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` global. |
| **Import CSV / Excel (UC-08)** | Límite de tamaño de fichero, número máximo de filas, charset UTF-8, rechazo de fórmulas tipo `=cmd`; parsing en streaming si el fichero es grande. | `ImportService.parseCsv(buffer)`: validar cabeceras esperadas, `maxRows: 10_000`, sanitizar celdas con librería tipo `csv-parse` + reglas por columna. |
| **Secretos y configuración** | Nunca commitear `.env`; secretos solo en el proveedor cloud y GitHub **Secrets** para CI. | `ConfigModule` Nest con esquema Joi/Zod; `JWT_SECRET` rotado si compromiso. |
| **Dependencias** | Reducir vulnerabilidades conocidas en cadena de suministro. | `npm audit` en CI; Dependabot en GitHub; actualizaciones periódicas de Nest y React. |

La accesibilidad **WCAG 2.1/2.2 AA** se cubre en **diseño y QA** (contraste, foco visible, etiquetas en formularios, navegación por teclado en el **Book Tracker** y modales UC-01/UC-04); conviene incluir **tests automáticos** con **axe** en Playwright o eslint-plugin-jsx-a11y en el front.

---

### **2.6. Tests**

#### Estrategia de testing (stack React + NestJS + PostgreSQL)

| Capa | Herramienta propuesta | Alcance |
| --- | --- | --- |
| **Backend — unitario** | **Jest** | Servicios Nest con dependencias **mockeadas** (`BookService`, `StatsService`, `ImportService`, clientes HTTP de catálogo). |
| **Backend — integración API** | **Jest** + **Supertest** | App Nest levantada en memoria o contra **PostgreSQL de test** (Testcontainers o BD efímera en CI); contrato HTTP real sin mockear el ORM si se busca fidelidad. |
| **Frontend — unitario / componentes** | **Vitest** + **React Testing Library** | Componentes y hooks aislados; alineado con Vite en el `apps/web`. Alternativa equivalente: Jest + RTL si el proyecto unifica en Jest. |
| **E2E** | **Playwright** | Navegador real; flujos críticos UC-01, UC-02 y vistas que dependen de **UC-07**; ejecutable en CI contra **staging** o entorno docker-compose `api + web + postgres`. |

**Pirámide:** muchas pruebas **rápidas** (unitarias), un conjunto mediano de **integración** sobre API + BD, y un número **reducido** pero **estable** de E2E que cubran el camino feliz y regresiones del MVP. Los datos de test deben ser **deterministas** (fixtures por `userId`) para que estadísticas (UC-07) sean reproducibles.

#### Tests representativos (ejemplos concretos)

1. **Unitario (servicio — UC-01 / catálogo):** test de `BookService` que, cuando **Open Library** devuelve lista vacía, invoca el cliente de **Google Books** una sola vez y mapea el primer resultado a la entidad interna; mockea ambos providers con `jest.fn()`.
2. **Integración API (UC-02):** con Supertest, `PATCH /books/:id/status` con JWT válido de la usuaria A: el libro pertenece a A y pasa a `Leído`; respuesta 200 y cuerpo coherente; si el libro es de la usuaria B, respuesta **403/404** sin filtrar por existencia global.
3. **Integración servicio + BD (UC-07):** tras insertar tres libros `Leído` en el mes actual vía repositorio o factory, `StatsService.getMonthlyKpis(userId)` devuelve el conteo y agregados esperados (sin mockear SQL salvo que se testee solo lógica pura en otra prueba).
4. **Componente UI (frontend):** con Vitest y Testing Library, el **selector de estado** en la fila del **Book Tracker** llama al callback/mutation con el valor `Leído` y muestra el estado actualizado en el DOM (mock del hook `useUpdateBookStatus`).
5. **E2E Playwright (flujo crítico UC-01 + UC-02):** iniciar sesión (usuario de prueba), abrir **Book Tracker**, pulsar «Añadir libro», buscar un título conocido del mock de API o del entorno de staging, seleccionar edición, confirmar; comprobar que el libro aparece en la tabla; cambiar estado a **Leyendo** y luego a **Leído** y verificar que el KPI del **Home** o de **Reading Stats** refleja el incremento acorde a **UC-07** (aserción sobre un número visible o llamada de red interceptada).

**Priorización PRD:** en CI debe ejecutarse siempre al menos **(1)** lógica de alta de libro/fallback de catálogo, **(2)** cambio de estado con aislamiento por usuaria, y **(3)** un test que valide **cálculo o contrato de estadísticas**; los E2E pueden correr en rama `main` nocturna o en cada merge si el tiempo de pipeline lo permite.

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

Modelo lógico **PostgreSQL** alineado con el PRD: biblioteca por usuaria, registro de lectura 1:1 por libro, TBR mensual único por mes, metas anuales e histórico de progreso por sesiones.

![Diagrama entidad–relación del modelo de datos (Reading Analytics Platform)](documents/data_model.png)

```mermaid
erDiagram
  %% === Reading Analytics Platform · PostgreSQL logical model ===
  %% PK/FK and types as implemented names; CHECK/UNIQUE as comments on fields where relevant.

  USERS {
    uuid id PK "gen_random_uuid()"
    varchar email UK "UNIQUE; NOT NULL si login local"
    varchar password_hash "NULL si solo OAuth/SSO"
    timestamptz created_at "NOT NULL DEFAULT now()"
    timestamptz updated_at "NOT NULL DEFAULT now()"
  }

  USER_PROFILES {
    uuid user_id PK "PK; FK → users.id ON DELETE CASCADE"
    varchar display_name "NULL permitido"
    text avatar_url "NULL"
    jsonb preferences "NOT NULL DEFAULT '{}'; tema, densidad UI, defaults de stats"
    timestamptz created_at "NOT NULL DEFAULT now()"
    timestamptz updated_at "NOT NULL DEFAULT now()"
  }

  BOOKS {
    uuid id PK "gen_random_uuid()"
    uuid user_id FK "FK → users.id ON DELETE CASCADE; índice por usuaria"
    text title "NOT NULL"
    text authors "NOT NULL; texto o JSON según convención de API"
    varchar isbn_13 "NULL"
    varchar isbn_10 "NULL"
    text cover_image_url "NULL"
    integer page_count "NULL; CHECK ≥ 0 si NOT NULL"
    varchar genre "NULL; género principal o para gráficos rápidos"
    varchar series_name "NULL; UC-09 saga"
    smallint publication_year "NULL"
    varchar data_source "NOT NULL; open_library|google_books|goodreads|manual"
    varchar external_provider_id "NULL; id en fuente externa"
    text notes "NULL; edición manual UC-01"
    timestamptz created_at "NOT NULL DEFAULT now()"
    timestamptz updated_at "NOT NULL DEFAULT now()"
  }

  READING_RECORDS {
    uuid book_id PK "PK; FK → books.id ON DELETE CASCADE; 1 registro por libro"
    varchar status "NOT NULL; CHECK IN leyendo|leido|dnf|pendiente (UC-02)"
    integer current_page "NULL; obligatorio lógico si status=leyendo y hay page_count (UC-03)"
    numeric progress_percent "NULL o GENERATED; (current_page/page_count)*100"
    smallint rating "NULL; CHECK 1–5 (UC-04)"
    varchar read_format "NULL; fisico|ebook|audio (UC-04)"
    date started_on "NULL"
    date finished_on "NULL; clave para stats por mes/año (UC-07)"
    timestamptz updated_at "NOT NULL DEFAULT now()"
  }

  TAGS {
    uuid id PK "gen_random_uuid()"
    uuid user_id FK "FK → users.id ON DELETE CASCADE"
    varchar name "NOT NULL; UNIQUE(user_id, lower(name)) (UC-04)"
    timestamptz created_at "NOT NULL DEFAULT now()"
  }

  BOOK_TAGS {
    uuid book_id PK "PK compuesta; FK → books.id ON DELETE CASCADE"
    uuid tag_id PK "PK compuesta; FK → tags.id ON DELETE CASCADE"
    timestamptz created_at "NOT NULL DEFAULT now()"
  }

  MONTHLY_TBR_LISTS {
    uuid id PK "gen_random_uuid()"
    uuid user_id FK "FK → users.id ON DELETE CASCADE"
    smallint year "NOT NULL"
    smallint month "NOT NULL; CHECK 1–12"
    varchar list_status "NOT NULL DEFAULT active; active|archived opcional"
    boolean auto_created "NOT NULL DEFAULT false; job día previo al mes (UC-05)"
    timestamptz created_at "NOT NULL DEFAULT now()"
    timestamptz updated_at "NOT NULL DEFAULT now()"
    %% UNIQUE(user_id, year, month) — como máximo un TBR por mes (UC-05)
  }

  TBR_ENTRIES {
    uuid id PK "gen_random_uuid()"
    uuid monthly_tbr_id FK "FK → monthly_tbr_lists.id ON DELETE CASCADE"
    uuid book_id FK "FK → books.id ON DELETE CASCADE"
    integer sort_order "NOT NULL; drag and drop (UC-05)"
    boolean completed "NOT NULL DEFAULT false; auto al pasar a leido (UC-02/05)"
    timestamptz completed_at "NULL"
    timestamptz added_at "NOT NULL DEFAULT now()"
    %% UNIQUE(monthly_tbr_id, book_id) — un libro una vez por lista
  }

  ANNUAL_READING_GOALS {
    uuid id PK "gen_random_uuid()"
    uuid user_id FK "FK → users.id ON DELETE CASCADE"
    smallint year "NOT NULL"
    integer target_book_count "NOT NULL; CHECK > 0 (UC-06 / US3)"
    timestamptz created_at "NOT NULL DEFAULT now()"
    timestamptz updated_at "NOT NULL DEFAULT now()"
    %% UNIQUE(user_id, year) — una meta activa por año
  }

  READING_SESSIONS {
    uuid id PK "gen_random_uuid()"
    uuid book_id FK "FK → books.id ON DELETE CASCADE"
    integer page_at_session "NOT NULL; CHECK ≥ 1"
    timestamptz recorded_at "NOT NULL DEFAULT now()"
    varchar source "NULL; manual|import|sync"
    %% Histórico de progreso / series temporales (UC-03); índice (book_id, recorded_at)
  }

  %% --- Cardinalidades ---
  USERS ||--|| USER_PROFILES : "perfil 1:1"
  USERS ||--o{ BOOKS : "biblioteca"
  BOOKS ||--|| READING_RECORDS : "registro lectura 1:1"
  USERS ||--o{ TAGS : "etiquetas propias"
  BOOKS ||--o{ BOOK_TAGS : "asignación"
  TAGS ||--o{ BOOK_TAGS : "asignación"
  USERS ||--o{ MONTHLY_TBR_LISTS : "TBR por mes"
  MONTHLY_TBR_LISTS ||--o{ TBR_ENTRIES : "entradas ordenadas"
  BOOKS ||--o{ TBR_ENTRIES : "libro en lista"
  USERS ||--o{ ANNUAL_READING_GOALS : "metas anuales"
  BOOKS ||--o{ READING_SESSIONS : "histórico páginas"
```

### **3.2. Descripción de entidades principales:**

La nomenclatura de tablas coincide con el diagrama de la §3.1 (`snake_case` en PostgreSQL). Donde el enunciado usa un nombre de dominio (p. ej. **ReadingEntry**), se indica la tabla física **`reading_records`**.

---

#### 1. User (`users` + `user_profiles`)

Identidad de la usuaria y perfil ampliado (preferencias, tema, avatar). En el producto, casi toda consulta está acotada por `user_id` (aislamiento entre bibliotecas, UC-09).

**Tabla `users`**

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | `UUID` | `PK`, `NOT NULL`, `DEFAULT gen_random_uuid()` | Identificador único de la cuenta. |
| `email` | `VARCHAR(320)` | `UNIQUE`, `NOT NULL` si hay login local | Contacto e inicio de sesión (PRD backend Nest). |
| `password_hash` | `VARCHAR(255)` | `NULL` permitido | Hash de contraseña; **opcional** si el acceso es solo OAuth/SSO (futuro). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Alta de cuenta. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Última modificación de fila (actualizar en cada `UPDATE`). |

**Tabla `user_profiles`**

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `user_id` | `UUID` | `PK`, `FK → users.id`, `ON DELETE CASCADE`, `NOT NULL` | Misma clave que la usuaria; perfil 1:1. |
| `display_name` | `VARCHAR(120)` | `NULL` permitido | Nombre mostrado; **opcional** hasta que la usuaria personalice el perfil. |
| `avatar_url` | `TEXT` | `NULL` permitido | Imagen de perfil; **opcional**. |
| `preferences` | `JSONB` | `NOT NULL`, `DEFAULT '{}'` | Tema visual, densidad de UI, periodo por defecto en stats (PRD *Perfil / Ajustes*). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Creación del perfil. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Última actualización. |

**Claves y relaciones**

- **PK `users`:** `id`, generación **UUID v4** vía `gen_random_uuid()` (estándar en PostgreSQL 13+).
- **PK `user_profiles`:** `user_id` (también **FK** a `users.id`).
- **Relaciones:** `users` **1:1** `user_profiles`; `users` **1:N** con `books`, `tags`, `monthly_tbr_lists`, `annual_reading_goals` (poseedora de datos).

**Índices recomendados**

- `UNIQUE` en `users.email` (ya implica índice).
- Ninguno adicional obligatorio en `user_profiles` más allá del PK; opcional `(preferences)` con **GIN** solo si se filtra por claves JSON de forma frecuente.

---

#### 2. Book (`books`)

Metadatos de un volumen en la **biblioteca de una usuaria** (no catálogo global). Alta por búsqueda APIs o manual (**UC-01**); edición de metadatos tras selección aproximada; importación masiva (**UC-08**).

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | `UUID` | `PK`, `NOT NULL`, `DEFAULT gen_random_uuid()` | Identificador del libro en la biblioteca. |
| `user_id` | `UUID` | `FK → users.id`, `ON DELETE CASCADE`, `NOT NULL` | Propietaria del registro. |
| `title` | `TEXT` | `NOT NULL` | Título de la edición (UC-01). |
| `authors` | `TEXT` | `NOT NULL` | Autoras/os; texto plano o JSON según convenio de mapeo desde Open Library / Google Books. |
| `isbn_13` | `VARCHAR(13)` | `NULL` | ISBN-13 si la fuente lo aporta (**opcional** en entrada manual o datos incompletos). |
| `isbn_10` | `VARCHAR(10)` | `NULL` | ISBN-10; **opcional**. |
| `cover_image_url` | `TEXT` | `NULL` | URL de portada; **opcional** si no hay imagen en la API. |
| `page_count` | `INTEGER` | `NULL`, `CHECK (page_count IS NULL OR page_count >= 0)` | Total de páginas; **opcional** hasta completarlo (UC-03 exige total para calcular %). |
| `genre` | `VARCHAR(100)` | `NULL` | Género principal para gráficos (UC-07); **opcional** si la fuente no lo devuelve. |
| `series_name` | `VARCHAR(255)` | `NULL` | Saga / serie (**UC-09** filtro); **opcional**. |
| `publication_year` | `SMALLINT` | `NULL` | Año de publicación; **opcional**. |
| `data_source` | `VARCHAR(32)` | `NOT NULL`, `CHECK` en valores permitidos | Origen: `open_library`, `google_books`, `goodreads`, `manual` (PRD *Data sources*). |
| `external_provider_id` | `VARCHAR(128)` | `NULL` | Id en la fuente externa para reconciliar o reconsultar; **opcional** en manual puro. |
| `notes` | `TEXT` | `NULL` | Notas de la usuaria o correcciones tras UC-01. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Alta en biblioteca. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Última modificación de metadatos. |

**Claves y relaciones**

- **PK:** `id`, **UUID v4** con `gen_random_uuid()`.
- **FK:** `user_id` → `users.id`.
- **Relaciones:** **1:1** con `reading_records` (un registro de lectura por libro); **1:N** con `book_tags`, `tbr_entries`, `reading_sessions`; **N:M** con `tags` vía `book_tags`.

**Índices recomendados**

- `(user_id)` — listados Book Tracker, Library, Home (**UC-01**, **UC-09**).
- `(user_id, title)` o **índice GIN** con `to_tsvector` sobre `title` + `authors` si la búsqueda texto libre es intensiva (**UC-09**).
- Opcional `(user_id, genre)`, `(user_id, publication_year)` si los filtros del producto los usan como columnas discretas.

---

#### 3. ReadingEntry (`reading_records`)

Registro de lectura de una usuaria **sobre un libro concreto** de su biblioteca: estado, progreso, rating, formato y fechas. Es la base de estadísticas (**UC-07**), meta anual (**UC-06**), TBR automático (**UC-05**) y KPIs del Home.

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `book_id` | `UUID` | `PK`, `FK → books.id`, `ON DELETE CASCADE`, `NOT NULL` | Libro al que pertenece el registro (1:1). |
| `status` | `VARCHAR(20)` | `NOT NULL`, `CHECK` en `leyendo`, `leido`, `dnf`, `pendiente` | Estado de lectura (**UC-02**); al añadir libro suele ser `pendiente` (UC-01). |
| `current_page` | `INTEGER` | `NULL`, `CHECK` coherente con `books.page_count` en aplicación | Página actual (**UC-03**); **opcional** si no está en lectura o aún no se informa. |
| `progress_percent` | `NUMERIC(5,2)` | `NULL` o columna `GENERATED` | Porcentaje de avance; puede calcularse en app o con `STORED` si existen `current_page` y `page_count`. |
| `rating` | `SMALLINT` | `NULL`, `CHECK (rating BETWEEN 1 AND 5)` | Valoración al cerrar como leído (**UC-04**); **opcional** porque la usuaria puede cerrar el modal sin guardar datos extra. |
| `read_format` | `VARCHAR(20)` | `NULL`, `CHECK` en `fisico`, `ebook`, `audio` | Formato de lectura (**UC-04**); **opcional** por el mismo flujo de cierre anticipado del modal. |
| `started_on` | `DATE` | `NULL` | Fecha de inicio de lectura; **opcional** (import o registro posterior). |
| `finished_on` | `DATE` | `NULL` | Fecha de fin; **opcional** hasta marcar `leido` o completar UC-04; imprescindible para agregar por mes/año (**UC-07**, **UC-08** histórico). |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Última actualización de estado o progreso. |

**Claves y relaciones**

- **PK:** `book_id` (reutiliza la FK como clave única del registro).
- **FK:** `book_id` → `books.id`.
- **Relaciones:** **1:1** con `books`; desde la usuaria es **1:N** (muchos libros, cada uno con su registro).

**Índices recomendados**

- El PK ya indexa `book_id`.
- **Parcial** `(finished_on) WHERE status = 'leido'` o compuesto vía join: para agregaciones mensuales/anuales (**UC-07**, **UC-06**, **UC-10**).
- `(status)` filtrado por `user_id` suele resolverse con join a `books` + índice `(user_id)` en `books`; opcional índice en `reading_records(status)` si el volumen es muy alto.

---

#### 4. Tag (`tags`) y BookTag (`book_tags`)

Etiquetas **definidas por la usuaria** (**UC-04**, PRD *Tags*); la tabla pivote materializa la **N:M** entre libros y tags para filtros y búsqueda (**UC-09**).

**Tabla `tags`**

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | `UUID` | `PK`, `NOT NULL`, `DEFAULT gen_random_uuid()` | Identificador de la etiqueta. |
| `user_id` | `UUID` | `FK → users.id`, `ON DELETE CASCADE`, `NOT NULL` | Dueña del vocabulario de tags. |
| `name` | `VARCHAR(80)` | `NOT NULL`, `UNIQUE (user_id, lower(name))` | Texto visible (p. ej. «cozy fantasy»); unicidad **case-insensitive** por usuaria. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Creación (incl. alta al vuelo en el modal UC-04). |

**Tabla `book_tags`**

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `book_id` | `UUID` | `PK`, `FK → books.id`, `ON DELETE CASCADE`, `NOT NULL` | Libro etiquetado. |
| `tag_id` | `UUID` | `PK`, `FK → tags.id`, `ON DELETE CASCADE`, `NOT NULL` | Etiqueta aplicada. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Momento de asociación. |

**Claves y relaciones**

- **PK `tags`:** `id` (**UUID v4**).
- **PK `book_tags`:** compuesta `(book_id, tag_id)`.
- **FK:** `tags.user_id` → `users.id`; `book_tags` → `books.id`, `tags.id`.
- **Relaciones:** `users` **1:N** `tags`; `books` **N:M** `tags` a través de `book_tags`.

**Índices recomendados**

- `UNIQUE (user_id, lower(name))` en `tags` (definir con índice único funcional en PostgreSQL, p. ej. en `lower(name)`).
- `book_tags(tag_id)` — listar libros por etiqueta (**UC-09**).
- `book_tags(book_id)` — cargar tags de un libro en ficha y export.

---

#### 5. MonthlyTBR (`monthly_tbr_lists`) y TBREntry (`tbr_entries`)

Lista **To Be Read** por mes y año: como máximo **una lista por usuaria y mes** (**UC-05**); entradas ordenadas (drag & drop) y marcado automático al pasar el libro a `leido` (**UC-02** / **UC-05**).

**Tabla `monthly_tbr_lists`**

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | `UUID` | `PK`, `NOT NULL`, `DEFAULT gen_random_uuid()` | Identificador de la lista mensual. |
| `user_id` | `UUID` | `FK → users.id`, `ON DELETE CASCADE`, `NOT NULL` | Propietaria. |
| `year` | `SMALLINT` | `NOT NULL` | Año del TBR. |
| `month` | `SMALLINT` | `NOT NULL`, `CHECK (month BETWEEN 1 AND 12)` | Mes (1–12). |
| `list_status` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'active'` | p. ej. `active` / `archived` si el producto distingue listas cerradas visualmente. |
| `auto_created` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | `true` si la creó el job del día previo al mes (**UC-05**). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Creación. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Última edición. |
| — | — | `UNIQUE (user_id, year, month)` | **Restricción de negocio:** un solo TBR por mes. |

**Tabla `tbr_entries`**

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | `UUID` | `PK`, `NOT NULL`, `DEFAULT gen_random_uuid()` | Identificador de la fila (útil para APIs y sync). |
| `monthly_tbr_id` | `UUID` | `FK → monthly_tbr_lists.id`, `ON DELETE CASCADE`, `NOT NULL` | Lista a la que pertenece. |
| `book_id` | `UUID` | `FK → books.id`, `ON DELETE CASCADE`, `NOT NULL` | Libro de la biblioteca incluido en el TBR. |
| `sort_order` | `INTEGER` | `NOT NULL` | Orden de prioridad (**UC-05** drag & drop). |
| `completed` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Checklist; puede ponerse a `true` al marcar `leido` el libro. |
| `completed_at` | `TIMESTAMPTZ` | `NULL` | Marca temporal del completado; **opcional** si solo se usa el booleano. |
| `added_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Cuándo se añadió a la lista. |
| — | — | `UNIQUE (monthly_tbr_id, book_id)` | Un mismo libro no se duplica en la misma lista. |

**Claves y relaciones**

- **PKs:** `id` en ambas tablas (**UUID v4**).
- **FK:** `monthly_tbr_lists.user_id` → `users.id`; `tbr_entries` → `monthly_tbr_lists.id`, `books.id`.
- **Relaciones:** `users` **1:N** `monthly_tbr_lists`; `monthly_tbr_lists` **1:N** `tbr_entries`; `books` **1:N** `tbr_entries` (el mismo libro puede aparecer en TBR de meses distintos).

**Índices recomendados**

- `UNIQUE (user_id, year, month)` en `monthly_tbr_lists`.
- `tbr_entries(monthly_tbr_id, sort_order)` — renderizar la lista ordenada.
- `tbr_entries(book_id)` — al marcar `leido`, localizar entradas abiertas a actualizar (**UC-05**).

---

#### 6. AnnualGoal (`annual_reading_goals`)

Objetivo numérico de libros a leer en un año calendario (**UC-06**, historia de usuario 3). El progreso (libros `leido` en ese año) se calcula desde `reading_records` + `finished_on`, no se duplica aquí.

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | `UUID` | `PK`, `NOT NULL`, `DEFAULT gen_random_uuid()` | Identificador de la meta (útil si en el futuro hay historial de metas). |
| `user_id` | `UUID` | `FK → users.id`, `ON DELETE CASCADE`, `NOT NULL` | Usuaria que define la meta. |
| `year` | `SMALLINT` | `NOT NULL` | Año objetivo. |
| `target_book_count` | `INTEGER` | `NOT NULL`, `CHECK (target_book_count > 0)` | Número de libros meta (p. ej. 50). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Primera definición. |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Última edición (**UC-06** permite cambiar la meta en cualquier momento). |
| — | — | `UNIQUE (user_id, year)` | Una meta por usuaria y año. |

**Claves y relaciones**

- **PK:** `id` (**UUID v4**).
- **FK:** `user_id` → `users.id`.
- **Relaciones:** `users` **1:N** `annual_reading_goals` (en la práctica una fila activa por año gracias al `UNIQUE`).

**Índices recomendados**

- `UNIQUE (user_id, year)` — lectura O(1) del widget Home / Goals.

---

#### 7. ReadingSession (`reading_sessions`)

Histórico de **instantes de progreso por página** (**UC-03**): series temporales para gráficos de ritmo, auditoría de cambios y posibles insights (**UC-07** / US5). **UC-08** puede generar sesiones sintéticas con `source = import` si el archivo aporta fechas de progreso.

| Atributo | Tipo | Restricciones | Descripción |
| --- | --- | --- | --- |
| `id` | `UUID` | `PK`, `NOT NULL`, `DEFAULT gen_random_uuid()` | Identificador del evento. |
| `book_id` | `UUID` | `FK → books.id`, `ON DELETE CASCADE`, `NOT NULL` | Libro cuyo progreso se registra. |
| `page_at_session` | `INTEGER` | `NOT NULL`, `CHECK (page_at_session >= 1)` | Página alcanzada en ese momento. |
| `recorded_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Marca temporal del registro. |
| `source` | `VARCHAR(20)` | `NULL`, valores p. ej. `manual`, `import`, `sync` | Origen del dato; **opcional** si todo es manual en MVP. |

**Claves y relaciones**

- **PK:** `id` (**UUID v4**).
- **FK:** `book_id` → `books.id`.
- **Relaciones:** `books` **1:N** `reading_sessions`.

**Índices recomendados**

- `(book_id, recorded_at DESC)` — último progreso y línea temporal por libro (**UC-03**, Home).
- Opcional `(recorded_at)` particionado por mes si el volumen de eventos crece mucho.

---

## 4. Especificación de la API

Este contrato cubre el **alta en biblioteca** tras la selección de una edición en el flujo **UC-01** (búsqueda vía Open Library con fallback a Google Books o **entrada manual**): la SPA (`React` + `TypeScript`) invoca la API REST del backend **`NestJS`**; la autenticación sigue el patrón **Bearer JWT** descrito en la capa API del monolito (aislamiento por `user_id`).

### OpenAPI 3.1 · `POST /books`

```yaml
openapi: 3.1.0
info:
  title: Reading Analytics Platform API
  version: 0.1.0
  description: >
    Alta de libro en la biblioteca de la usuaria autenticada (UC-01).
    El servidor crea la fila en `books` y el registro asociado en `reading_records`
    con estado por defecto `pendiente`.

servers:
  - url: https://api.example.com/v1
    description: API REST versionada (prefijo global NestJS)

paths:
  /books:
    post:
      operationId: createBook
      summary: Añadir un libro a la biblioteca
      description: >
        Persiste los metadatos elegidos tras la búsqueda en catálogo o el formulario manual.
        Requiere sesión iniciada (precondición UC-01).
      tags:
        - Books
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateBookRequest'
      responses:
        '201':
          description: Libro creado; registro de lectura inicial en estado pendiente.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/BookCreatedResponse'
        '400':
          description: Cuerpo inválido o validación fallida (DTO / pipes NestJS).
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                validation:
                  summary: Errores de validación
                  value:
                    statusCode: 400
                    message: Validation failed
                    errors:
                      - field: title
                        constraints: ['title should not be empty']
        '401':
          description: Token ausente, expirado o inválido.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                statusCode: 401
                message: Unauthorized
        '409':
          description: >
            Conflicto de negocio: la usuaria ya tiene un libro equivalente en biblioteca
            (p. ej. mismo `isbn_13` o par `data_source` + `external_provider_id`).
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ConflictResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT emitido tras login (NestJS Guards).

  schemas:
    DataSource:
      type: string
      enum:
        - open_library
        - google_books
        - goodreads
        - manual
      description: Debe coincidir con el CHECK de `books.data_source` en PostgreSQL.

    CreateBookRequest:
      type: object
      additionalProperties: false
      required:
        - title
        - authors
        - data_source
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 10000
          description: Título de la edición seleccionada o introducida (NOT NULL en `books.title`).
        authors:
          type: string
          minLength: 1
          maxLength: 4000
          description: >
            Autoras/os en texto plano (convención de mapeo desde OL/GB o manual).
            Obligatorio en persistencia; puede ser un placeholder breve si la fuente no aporta nombre.
        isbn_13:
          type: [string, 'null']
          pattern: '^97[89]\d{10}$'
          description: ISBN-13 normalizado sin guiones; opcional.
        isbn_10:
          type: [string, 'null']
          pattern: '^\d{9}[\dXx]$'
          description: ISBN-10; opcional.
        cover_image_url:
          type: [string, 'null']
          format: uri
          maxLength: 2048
          description: URL de portada si la API de catálogo la proporciona.
        page_count:
          type: [integer, 'null']
          minimum: 0
          description: Total de páginas; coherente con CHECK en `books.page_count`.
        genre:
          type: [string, 'null']
          maxLength: 100
        series_name:
          type: [string, 'null']
          maxLength: 255
        publication_year:
          type: [integer, 'null']
          minimum: 1000
          maximum: 2100
        data_source:
          $ref: '#/components/schemas/DataSource'
        external_provider_id:
          type: [string, 'null']
          maxLength: 128
          description: Identificador en la fuente externa (work/edition key); nulo en alta manual pura.
        notes:
          type: [string, 'null']
          maxLength: 10000
          description: Notas o correcciones tras selección aproximada (UC-01 flujo alternativo).

    Book:
      type: object
      required:
        - id
        - user_id
        - title
        - authors
        - data_source
        - created_at
        - updated_at
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        title:
          type: string
        authors:
          type: string
        isbn_13:
          type: [string, 'null']
        isbn_10:
          type: [string, 'null']
        cover_image_url:
          type: [string, 'null']
          format: uri
        page_count:
          type: [integer, 'null']
        genre:
          type: [string, 'null']
        series_name:
          type: [string, 'null']
        publication_year:
          type: [integer, 'null']
        data_source:
          $ref: '#/components/schemas/DataSource'
        external_provider_id:
          type: [string, 'null']
        notes:
          type: [string, 'null']
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    ReadingRecordSummary:
      type: object
      required:
        - book_id
        - status
      properties:
        book_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [pendiente, leyendo, leido, dnf]
          description: Tras UC-01 el valor es siempre `pendiente` (postcondición del caso de uso).

    BookCreatedResponse:
      type: object
      required:
        - book
        - reading
      properties:
        book:
          $ref: '#/components/schemas/Book'
        reading:
          $ref: '#/components/schemas/ReadingRecordSummary'

    ErrorResponse:
      type: object
      properties:
        statusCode:
          type: integer
        message:
          type: string
        errors:
          type: array
          items:
            type: object
            additionalProperties: true

    ConflictResponse:
      type: object
      required:
        - statusCode
        - message
        - code
      properties:
        statusCode:
          type: integer
          const: 409
        message:
          type: string
        code:
          type: string
          example: BOOK_DUPLICATE
        existingBookId:
          type: string
          format: uuid
          description: Opcional; id del libro ya existente para deduplicación en UI.
```

### Ejemplo de petición y respuesta (JSON)

**Request** — `POST /v1/books` · cuerpo tras seleccionar una edición enriquecida por Open Library (autenticación `Authorization: Bearer <jwt>`):

```json
{
  "title": "The Left Hand of Darkness",
  "authors": "Ursula K. Le Guin",
  "isbn_13": "9780441478125",
  "isbn_10": "0441478123",
  "cover_image_url": "https://covers.openlibrary.org/b/id/9255566-L.jpg",
  "page_count": 304,
  "genre": "Science fiction",
  "series_name": "Hainish Cycle",
  "publication_year": 1969,
  "data_source": "open_library",
  "external_provider_id": "OL82563W",
  "notes": null
}
```

**Response** — `201 Created`:

```json
{
  "book": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "user_id": "9f8e7d6c-5b4a-3210-fedc-ba0987654321",
    "title": "The Left Hand of Darkness",
    "authors": "Ursula K. Le Guin",
    "isbn_13": "9780441478125",
    "isbn_10": "0441478123",
    "cover_image_url": "https://covers.openlibrary.org/b/id/9255566-L.jpg",
    "page_count": 304,
    "genre": "Science fiction",
    "series_name": "Hainish Cycle",
    "publication_year": 1969,
    "data_source": "open_library",
    "external_provider_id": "OL82563W",
    "notes": null,
    "created_at": "2026-04-11T14:32:01.000Z",
    "updated_at": "2026-04-11T14:32:01.000Z"
  },
  "reading": {
    "book_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "pendiente"
  }
}
```

### OpenAPI 3.1 · `PATCH /books/{bookId}/reading-record`

Actualización parcial del registro **`reading_records`** asociado a un libro (**1:1** por `book_id`), alineada con **UC-02** (cambio de estado y efectos al pasar a `leido`) y **UC-03** (progreso por página frente a `books.page_count`). Misma autenticación **Bearer JWT** y prefijo `/v1` que `POST /books`.

```yaml
openapi: 3.1.0
info:
  title: Reading Analytics Platform API (fragmento)
  version: 0.1.0

paths:
  /books/{bookId}/reading-record:
    patch:
      operationId: patchReadingRecord
      summary: Actualizar estado y/o progreso de lectura
      description: >
        UC-02: mutación del `status` con efectos de producto al pasar a `leido`
        (modal de finalización UC-04 en cliente; completado en TBR mensual activo si aplica, UC-05).
        UC-03: si se envía `current_page`, el libro debe estar en `leyendo`, debe existir `page_count` en el libro
        y debe cumplirse `1 <= current_page <= page_count`.
        El servidor puede recalcular `progress_percent` a partir de `current_page` y `books.page_count`.
      tags:
        - Books
      security:
        - bearerAuth: []
      parameters:
        - name: bookId
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PatchReadingRecordRequest'
      responses:
        '200':
          description: Registro actualizado; cuerpo incluye lectura y metadatos útiles para la UI.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReadingRecordPatchedResponse'
        '400':
          description: JSON inválido, cuerpo vacío o validación sintáctica del DTO.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: No autenticada.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Libro inexistente o no pertenece a la usuaria autenticada.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '422':
          description: >
            Regla de negocio incumplida: p. ej. `current_page` con estado distinto de `leyendo`,
            `current_page` > `page_count`, o `page_count` nulo en el libro al actualizar progreso (UC-03 4a/4b).
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UnprocessableErrorResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    ReadingStatus:
      type: string
      enum:
        - pendiente
        - leyendo
        - leido
        - dnf
      description: Valores del CHECK en `reading_records.status` (readme §3.2).

    ReadFormat:
      type: string
      enum:
        - fisico
        - ebook
        - audio

    PatchReadingRecordRequest:
      type: object
      minProperties: 1
      additionalProperties: false
      properties:
        status:
          $ref: '#/components/schemas/ReadingStatus'
        current_page:
          type: integer
          minimum: 1
          description: >
            UC-03: solo tiene sentido con `status === leyendo` (o sin cambiar estado si ya es `leyendo`);
            el servidor valida contra `books.page_count`.
        started_on:
          type: string
          format: date
        finished_on:
          type: string
          format: date
          description: >
            UC-02/UC-04: al pasar a `leido`, puede enviarse; si se omite, el servidor puede fijar la fecha actual.
        rating:
          type: integer
          minimum: 1
          maximum: 5
          description: Opcional en el mismo PATCH; el modal UC-04 puede completarse después.
        read_format:
          $ref: '#/components/schemas/ReadFormat'

    ReadingRecordResource:
      type: object
      required:
        - book_id
        - status
        - updated_at
      properties:
        book_id:
          type: string
          format: uuid
        status:
          $ref: '#/components/schemas/ReadingStatus'
        current_page:
          type: [integer, 'null']
          minimum: 1
        progress_percent:
          anyOf:
            - type: string
              description: Valor con hasta dos decimales (columna NUMERIC(5,2) en PostgreSQL).
            - type: 'null'
          description: Null si no es calculable (p. ej. sin `page_count`).
        rating:
          type: [integer, 'null']
          minimum: 1
          maximum: 5
        read_format:
          anyOf:
            - $ref: '#/components/schemas/ReadFormat'
            - type: 'null'
        started_on:
          type: [string, 'null']
          format: date
        finished_on:
          type: [string, 'null']
          format: date
        updated_at:
          type: string
          format: date-time

    PatchSideEffectsMeta:
      type: object
      description: Pistas para el cliente sobre efectos UC-02 / UC-05 (el servidor las omite si no aplican).
      properties:
        openCompletionModal:
          type: boolean
          description: true si el estado pasó a `leido` y la UI debe abrir el flujo UC-04.
        tbrAutoCompleted:
          type: boolean
          description: true si el libro estaba en el TBR mensual activo y se marcó como completado.

    ReadingRecordPatchedResponse:
      type: object
      required:
        - reading
        - book
      properties:
        reading:
          $ref: '#/components/schemas/ReadingRecordResource'
        book:
          type: object
          required:
            - id
            - page_count
          properties:
            id:
              type: string
              format: uuid
            page_count:
              type: [integer, 'null']
              minimum: 0
              description: Total de páginas del volumen; requerido por UC-03 para validar progreso.
        meta:
          $ref: '#/components/schemas/PatchSideEffectsMeta'

    ErrorResponse:
      type: object
      properties:
        statusCode:
          type: integer
        message:
          type: string

    UnprocessableErrorResponse:
      allOf:
        - $ref: '#/components/schemas/ErrorResponse'
        - type: object
          properties:
            code:
              type: string
              examples:
                - PAGE_EXCEEDS_TOTAL
                - PAGE_COUNT_REQUIRED
                - INVALID_STATUS_FOR_PROGRESS
```

#### Reglas de negocio resumidas (servidor)

| Origen | Regla |
| --- | --- |
| UC-03 | Si el cuerpo incluye `current_page`, el registro debe poder asociarse a un libro con `page_count` **no nulo** y debe cumplirse `current_page <= page_count`. |
| UC-03 | Conviene exigir `status === leyendo` para aceptar solo progreso por página (si el libro está en otro estado, **422** `INVALID_STATUS_FOR_PROGRESS`). |
| UC-02 | Al fijar `status: leido`, el backend actualiza KPIs / agregados; puede devolver `meta.openCompletionModal: true` para forzar o sugerir UC-04 en cliente. |
| UC-02 / UC-05 | Si el libro está en el TBR del mes activo, al pasar a `leido` el backend marca el ítem completado y puede indicar `meta.tbrAutoCompleted: true`. |

### Ejemplos `PATCH /v1/books/{bookId}/reading-record` (JSON)

**1 · Actualizar página actual (UC-03)** — libro en `leyendo`, `page_count` del libro = 304:

Request:

```json
{
  "current_page": 142
}
```

Response — `200 OK` (`progress_percent` ≈ 46,71 %):

```json
{
  "reading": {
    "book_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "leyendo",
    "current_page": 142,
    "progress_percent": "46.71",
    "rating": null,
    "read_format": null,
    "started_on": "2026-03-20",
    "finished_on": null,
    "updated_at": "2026-04-11T16:05:00.000Z"
  },
  "book": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "page_count": 304
  }
}
```

**2 · Marcar como leído (UC-02)** — misma obra; opcionalmente se envía `finished_on` (si no, el servidor puede usar la fecha del día):

Request:

```json
{
  "status": "leido",
  "finished_on": "2026-04-11"
}
```

Response — `200 OK` (el servidor puede alinear `current_page` con `page_count` al cerrar; metadatos UC-04 aún null hasta el modal; pistas de efectos UC-02/UC-05):

```json
{
  "reading": {
    "book_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "status": "leido",
    "current_page": 304,
    "progress_percent": "100.00",
    "rating": null,
    "read_format": null,
    "started_on": "2026-03-20",
    "finished_on": "2026-04-11",
    "updated_at": "2026-04-11T16:08:22.000Z"
  },
  "book": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "page_count": 304
  },
  "meta": {
    "openCompletionModal": true,
    "tbrAutoCompleted": true
  }
}
```

### OpenAPI 3.1 · `GET /stats`

Agregados para **Reading Stats** y **Home** (**UC-07**), calculados en el módulo NestJS **`stats`** (**StatsService**): KPIs del periodo, distribuciones reutilizables para gráficos y **insights automáticos** (criterio UC-07: ≥3 por periodo con datos; **User Story 4**: libros, páginas, gráfico por géneros; **User Story 5**: tendencias, comparativa vs periodo anterior, género dominante). La ventana temporal se elige con `period` y los parámetros asociados (**mes**, **año natural** o **rango personalizado**). Solo cuenta lecturas con `reading_records.status = leido` y `finished_on` dentro del intervalo `[start, end]` (fechas inclusivas en TZ de la usuaria o UTC documentado en implementación).

```yaml
openapi: 3.1.0
info:
  title: Reading Analytics Platform API (fragmento)
  version: 0.1.0

paths:
  /stats:
    get:
      operationId: getReadingStats
      summary: KPIs, distribuciones e insights para un periodo
      description: >
        UC-07: libros leídos, páginas totales, rating medio (libros puntuados), distribución por género,
        formato predominante (derivado de la distribución por `read_format`).
        El cliente envía uno de los tres modos de periodo; el servidor devuelve `period.resolved`
        con límites normalizados para cache y trazabilidad.
      tags:
        - Stats
      security:
        - bearerAuth: []
      parameters:
        - name: period
          in: query
          required: true
          schema:
            $ref: '#/components/schemas/StatsPeriodType'
          description: >
            `month` requiere `year` + `month`; `year` requiere `year`;
            `custom` requiere `from` + `to` (fechas ISO 8601 `date`).
        - name: year
          in: query
          required: false
          schema:
            type: integer
            minimum: 1970
            maximum: 2100
        - name: month
          in: query
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 12
        - name: from
          in: query
          required: false
          schema:
            type: string
            format: date
        - name: to
          in: query
          required: false
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Estadísticas calculadas para la usuaria autenticada.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ReadingStatsResponse'
        '400':
          description: Parámetros de query incompletos o combinación inválida para el `period` elegido.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: No autenticada.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '422':
          description: Rango temporal inválido (`from` posterior a `to`) o ventana excesiva según política del producto.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    StatsPeriodType:
      type: string
      enum:
        - month
        - year
        - custom

    ResolvedStatsPeriod:
      type: object
      required:
        - type
        - startDate
        - endDate
      properties:
        type:
          $ref: '#/components/schemas/StatsPeriodType'
        startDate:
          type: string
          format: date
          description: Inicio inclusivo del periodo resuelto.
        endDate:
          type: string
          format: date
          description: Fin inclusivo del periodo resuelto.
        label:
          type: string
          description: Etiqueta legible para la UI (p. ej. «Abril 2026», «2026», «1 ene – 31 mar 2026»).

    DistributionBucket:
      type: object
      required:
        - label
        - count
        - share
      additionalProperties: false
      properties:
        label:
          type: string
          description: Etiqueta del segmento (género, formato localizado, etc.).
        count:
          type: integer
          minimum: 0
          description: Número de libros en el segmento.
        share:
          type: number
          minimum: 0
          maximum: 1
          description: Proporción respecto a `basisCount` de la distribución padre (0–1).

    CountDistribution:
      type: object
      required:
        - basisCount
        - buckets
      additionalProperties: false
      description: >
        Distribución reutilizable: mismos campos para reparto por género (metadatos `books.genre`)
        y por formato de lectura (`reading_records.read_format`).
      properties:
        basisCount:
          type: integer
          minimum: 0
          description: Libros que entran en el cálculo (p. ej. con género conocido o con formato informado).
        unknownCount:
          type: integer
          minimum: 0
          description: Libros del periodo excluidos del gráfico por dato ausente (opcional).
        buckets:
          type: array
          items:
            $ref: '#/components/schemas/DistributionBucket'

    ReadingStatsKpis:
      type: object
      required:
        - booksRead
        - totalPagesRead
        - ratedBooksCount
        - averageRating
        - genreDistribution
        - formatDistribution
        - predominantReadFormat
      properties:
        booksRead:
          type: integer
          minimum: 0
          description: Libros marcados como leídos con `finished_on` en el periodo (UC-07).
        totalPagesRead:
          type: integer
          minimum: 0
          description: Suma de `books.page_count` de esos libros (valores nulos tratados como 0 o excluidos según implementación; documentar en release notes).
        ratedBooksCount:
          type: integer
          minimum: 0
        averageRating:
          anyOf:
            - type: number
              minimum: 1
              maximum: 5
            - type: 'null'
          description: Media sobre libros con `rating` no nulo; `null` si no hay ninguno.
        genreDistribution:
          $ref: '#/components/schemas/CountDistribution'
        formatDistribution:
          $ref: '#/components/schemas/CountDistribution'
        predominantReadFormat:
          anyOf:
            - type: string
              enum:
                - fisico
                - ebook
                - audio
            - type: 'null'
          description: Moda de `read_format` en el periodo; `null` si todo es desconocido.

    StatsInsight:
      type: object
      required:
        - id
        - kind
        - title
        - body
      additionalProperties: false
      properties:
        id:
          type: string
          format: uuid
        kind:
          type: string
          enum:
            - volume_delta
            - genre_trend
            - format_mix
            - pages_milestone
            - rating_pattern
            - other
          description: Clasificación estable para analytics y plantillas de UI (US5).
        title:
          type: string
        body:
          type: string
          description: Texto listo para mostrar; puede incluir cifras ya formateadas.
        data:
          type: object
          additionalProperties: true
          description: >
            Métricas estructuradas opcionales (p. ej. `deltaPercent` vs mes anterior, `dominantGenre`, `share`).

    ReadingStatsResponse:
      type: object
      required:
        - period
        - kpis
        - insights
      properties:
        period:
          $ref: '#/components/schemas/ResolvedStatsPeriod'
        kpis:
          $ref: '#/components/schemas/ReadingStatsKpis'
        insights:
          type: array
          items:
            $ref: '#/components/schemas/StatsInsight'
          description: >
            UC-07 / US5: con datos suficientes el producto entrega al menos tres insights;
            en periodos vacíos puede ser lista vacía.

    ErrorResponse:
      type: object
      properties:
        statusCode:
          type: integer
        message:
          type: string
```

#### Parámetros de periodo (resumen)

| `period` | Query obligatoria | `ResolvedStatsPeriod` |
| --- | --- | --- |
| `month` | `year`, `month` (1–12) | Primer y último día de ese mes calendario. |
| `year` | `year` | Del 1 de enero al 31 de diciembre de ese año. |
| `custom` | `from`, `to` | Intervalo inclusivo; el servidor normaliza orden y valida `from <= to`. |

### Ejemplo · `GET /v1/stats` (request y response)

**Request** (periodo tipo mes — misma semántica que el filtro de US4):

```http
GET /v1/stats?period=month&year=2026&month=4 HTTP/1.1
Host: api.example.com
Authorization: Bearer <jwt>
Accept: application/json
```

**Response** — `200 OK` (KPIs UC-07, distribuciones vía `CountDistribution`, **cuatro** insights automáticos alineados con US5: ritmo vs mes anterior, género dominante, mix de formatos, hito de páginas):

```json
{
  "period": {
    "type": "month",
    "startDate": "2026-04-01",
    "endDate": "2026-04-30",
    "label": "Abril 2026"
  },
  "kpis": {
    "booksRead": 5,
    "totalPagesRead": 1428,
    "ratedBooksCount": 4,
    "averageRating": 4.25,
    "genreDistribution": {
      "basisCount": 5,
      "unknownCount": 0,
      "buckets": [
        { "label": "Fantasía", "count": 3, "share": 0.6 },
        { "label": "Ciencia ficción", "count": 1, "share": 0.2 },
        { "label": "Romance contemporáneo", "count": 1, "share": 0.2 }
      ]
    },
    "formatDistribution": {
      "basisCount": 5,
      "unknownCount": 0,
      "buckets": [
        { "label": "ebook", "count": 3, "share": 0.6 },
        { "label": "fisico", "count": 2, "share": 0.4 }
      ]
    },
    "predominantReadFormat": "ebook"
  },
  "insights": [
    {
      "id": "f4c8b2a1-7e9d-4c3b-9f01-2a8b7c6d5e4f",
      "kind": "volume_delta",
      "title": "Subiste el ritmo respecto a marzo",
      "body": "Este mes cerraste 5 libros frente a 3 en marzo: un +66,7 % de volumen.",
      "data": {
        "currentCount": 5,
        "previousCount": 3,
        "deltaPercent": 66.7,
        "comparisonPeriod": "month",
        "baselineLabel": "Marzo 2026"
      }
    },
    {
      "id": "a9e1d0c2-8b4f-4a2e-b7c1-0d1e2f3a4b5c",
      "kind": "genre_trend",
      "title": "La fantasía marca el mes",
      "body": "3 de cada 5 lecturas (60 %) fueron fantasía: es tu tendencia principal del periodo.",
      "data": {
        "dominantGenre": "Fantasía",
        "share": 0.6,
        "count": 3
      }
    },
    {
      "id": "c3d4e5f6-a7b8-9c0d-e1f2-a3b4c5d6e7f8",
      "kind": "format_mix",
      "title": "Predominio digital",
      "body": "El 60 % de tus lecturas fueron en ebook; el físico representa el 40 % restante.",
      "data": {
        "predominantReadFormat": "ebook",
        "ebookShare": 0.6,
        "fisicoShare": 0.4
      }
    },
    {
      "id": "b2c3d4e5-f6a7-8b9c-0d1e-f2a3b4c5d6e7",
      "kind": "pages_milestone",
      "title": "Más de 1.400 páginas en un mes",
      "body": "Sumaste 1.428 páginas leídas en abril: un buen indicador de constancia para tus KPIs del Home.",
      "data": {
        "totalPagesRead": 1428,
        "booksRead": 5
      }
    }
  ]
}
```

**Otros periodos (misma ruta, distintos query params)**

- Año natural: `GET /v1/stats?period=year&year=2026`
- Rango personalizado: `GET /v1/stats?period=custom&from=2026-01-15&to=2026-04-11`

---

## 5. Historias de Usuario

Las historias de usuario del **Reading Analytics Platform** están redactadas en formato **Como / Quiero / Para**, con **criterios de aceptación en estilo BDD** (Dado–Cuando–Entonces), **estimación** (S/M/L) y **revisión INVEST**, alineadas con el [PRD](PRD.md) y con los casos de uso técnicos de [`documents/use-cases.md`](documents/use-cases.md).

**Documento fuente:** el listado completo (cinco historias) vive en [`documents/user-stories.md`](documents/user-stories.md).

A continuación se documentan **tres historias principales** del MVP: alta de libros con metadatos automáticos, organización mensual mediante TBR y seguimiento del objetivo anual.

### Historia de usuario 1 · Añadir libro mediante búsqueda automática

| Campo | Contenido |
| --- | --- |
| **ID / nombre** | User Story 1 — Añadir libro con autocompletado y selección de edición |
| **Módulo** | Book Tracker |
| **Prioridad** | MVP (crítico para activación y sustitución de Excel) |

**Historia**

| Rol | Necesidad | Beneficio |
| --- | --- | --- |
| Como **lectora orientada a datos** | quiero **buscar un libro por título o autora y añadirlo automáticamente a mi tracker** | para **evitar introducir manualmente todos los datos**. |

**Criterios de aceptación (resumen BDD)**

- Desde *Book Tracker*, al pulsar **«Añadir libro»**, se abre un modal con buscador por título o autora.
- Si hay varias ediciones, la usuaria puede elegir la edición concreta.
- Tras confirmar, el libro aparece en el tracker con portada, autora, páginas y género.

**Estimación:** M · **INVEST:** independiente respecto a estadísticas y listas; negociable (fuente de datos); alto valor; estimable y acotado a sprint; testable con BDD.

---

### Historia de usuario 2 · Gestión de TBR mensual

| Campo | Contenido |
| --- | --- |
| **ID / nombre** | User Story 2 — Crear y gestionar TBR mensual automático |
| **Módulo** | Lists |
| **Prioridad** | MVP (organización lectora recurrente) |

**Historia**

| Rol | Necesidad | Beneficio |
| --- | --- | --- |
| Como **lectora frecuente** | quiero **tener una lista TBR mensual creada automáticamente** | para **organizar qué libros quiero leer cada mes**. |

**Criterios de aceptación (resumen BDD)**

- Al entrar en *Lists*, existe una lista TBR del mes creada automáticamente (convención de nombre según producto, p. ej. «TBR [mes]»).
- Si la lista está vacía, el sistema invita a añadir libros.
- Al marcar un libro del TBR del mes como **leído**, se marca como completado en la checklist del TBR.

**Estimación:** M · **INVEST:** acotada al modelo de listas; copy negociable; caso core; reglas claras y estados verificables.

---

### Historia de usuario 3 · Meta anual de lectura

| Campo | Contenido |
| --- | --- |
| **ID / nombre** | User Story 3 — Definir y visualizar objetivo anual |
| **Módulo** | Goals / Home |
| **Prioridad** | MVP (retención y sensación de progreso) |

**Historia**

| Rol | Necesidad | Beneficio |
| --- | --- | --- |
| Como **lectora que sigue su progreso** | quiero **establecer una meta anual de libros** | para **medir si voy cumpliendo mi objetivo lector**. |

**Criterios de aceptación (resumen BDD)**

- Desde Home (o flujo equivalente), la meta anual se guarda correctamente.
- La card de objetivo muestra progreso numérico (p. ej. «20 / 50») y el porcentaje.
- Con datos suficientes del año, se muestra una **predicción de cumplimiento** coherente con el ritmo actual.

**Estimación:** S · **INVEST:** apoyada en el conteo de lecturas; forecast evolucionable; alta relevancia para retención; cálculo determinista y testable.

---

### Más historias en el repositorio

En [`documents/user-stories.md`](documents/user-stories.md) están además, con el mismo nivel de detalle (escenarios BDD completos y tablas INVEST):

- **User Story 4** — Visualización de estadísticas mensuales (*Reading Stats*, estimación L).
- **User Story 5** — Insights automáticos (generación de mensajes analíticos sobre el periodo, estimación M).

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

