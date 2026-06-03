## Índice

1. [Ficha del proyecto](#0-ficha-del-proyecto)
2. [Descripción general del producto](#1-descripción-general-del-producto)
3. [Arquitectura del sistema](#2-arquitectura-del-sistema)
4. [Modelo de datos](#3-modelo-de-datos)
5. [Especificación de la API](#4-especificación-de-la-api)
6. [Historias de usuario](#5-historias-de-usuario)
7. [Tickets de trabajo](#6-tickets-de-trabajo)
8. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Isaac Mani Valor

### **0.2. Nombre del proyecto:**

ConRutina

### **0.3. Descripción breve del proyecto:**

ConRutina es una aplicación web orientada a la gestión de rutinas y buenos hábitos semanales mediante un sistema de puntuación gamificado. Permite al usuario registrar sus hábitos diarios, monitorizar su progreso a lo largo de la semana y canjear recompensas personalizadas a medida que acumula puntos, todo desde una interfaz amigable, visual e intuitiva.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

_(pendiente de despliegue)_

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido

_(pendiente de rellenar)_

---

## 1. Descripción general del producto

> Describe en detalle los siguientes aspectos del producto:

Consultar información detallada en el documento: `[docs/prd.md](docs/prd.md)`

### **1.1. Objetivo:**

**ConRutina** es una aplicación web SPA (Single Page Application) que combina tres palancas psicológicas fundamentales para el cambio de comportamiento:

- **Refuerzo positivo:** cada hábito completado suma puntos que el usuario puede convertir en recompensas tangibles que él mismo elige.
- **Consecuencia suave:** los hábitos no realizados aplican una penalización, creando una fricción controlada que no desmotiva pero sí mantiene la atención.
- **Visibilidad del progreso:** la pantalla principal muestra en todo momento el estado del día, la semana y el histórico, dando al usuario una narrativa clara de su evolución.

La propuesta de valor se dirige a tres perfiles principales:

| Para quién                                           | Problema que resuelve                                         | Cómo lo resuelve                                                   | Diferencial                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Personas con voluntad de cambio pero baja constancia | Falta de motivación sostenida para mantener rutinas           | Sistema de puntos + recompensas propias como incentivo             | El usuario define sus propias recompensas, haciendo el incentivo genuinamente personal |
| Usuarios que quieren ver su progreso de forma visual | Frustración ante métodos de seguimiento complejos o aburridos | Interfaz gamificada y ligera (SPA, sin instalación)                | Zero-friction: funciona en cualquier navegador, no requiere app nativa                 |
| Personas que rompen rachas y abandonan               | El "todo o nada" anula el esfuerzo parcial                    | Las semanas se bloquean al terminar, preservando el historial real | El pasado no desaparece: el usuario ve su evolución honesta semana a semana            |

**Ventajas competitivas** frente a soluciones existentes:

| Competidor                | Debilidad del competidor                                                 | Ventaja de ConRutina                                            |
| ------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Habitica                  | Curva de aprendizaje alta, interfaz RPG puede alienar a algunos usuarios | UI minimalista, sin registro obligatorio, entrada inmediata     |
| Streaks / Loop            | Sin sistema de recompensas ni penalizaciones                             | Mecánica bidireccional (puntos + penalizaciones) más motivadora |
| Notion / hojas de cálculo | No gamifican ni sintetizan el progreso automáticamente                   | Dashboard visual automatizado, sin configuración manual         |
| Aplicaciones de coach     | Coste mensual elevado, dependencia de terceros                           | Autónomo, autodirigido, sin suscripción en MVP                  |

### **1.2. Características y funcionalidades principales:**

#### Gestión de hábitos

- **Crear hábito:** el usuario define nombre, emoji representativo, puntos por día completado y penalización por fallo. El hábito queda activo en la semana en curso.
- **Marcar estado diario:** cada celda del calendario semanal tiene tres estados: `pendiente` → `completado` → `fallado` → `pendiente` (ciclo de tres estados por clic).
- **Eliminar hábito:** el usuario puede borrar un hábito de la semana en curso. El histórico de semanas anteriores no se altera.
- **Continuidad semanal:** al inicio de cada nueva semana, los hábitos de la semana anterior se trasladan automáticamente a la nueva con puntuaciones a cero.

#### Sistema de puntuación

- Cada día completado suma los `pointsPerDay` del hábito al marcador semanal.
- Cada día fallado resta los `penalty` configurados del hábito.
- Los días en estado `pendiente` no suman ni restan.
- El marcador semanal se reinicia a cero al inicio de cada semana.
- Los puntos acumulados en la semana en curso son los únicos disponibles para canjear recompensas.

#### Recompensas

- **Crear recompensa:** el usuario define nombre, emoji, descripción y coste en puntos.
- **Canjear recompensa:** si el usuario dispone de suficientes puntos en la semana en curso, puede canjear la recompensa. Los puntos se deducen del marcador.
- **Eliminar recompensa:** el usuario puede borrar una recompensa en cualquier momento.

#### Calendario semanal y navegación histórica

- La pantalla principal muestra la semana en curso, con los días de la semana como columnas y los hábitos como filas.
- El usuario puede navegar a semanas anteriores para consultar su historial (modo lectura, bloqueado).
- Al finalizar la semana, ésta queda congelada y no puede modificarse.

#### Estadísticas y progreso

- **Barra de progreso del día:** porcentaje de hábitos completados sobre el total en el día actual.
- **Contadores resumen:** puntos de la semana anterior, puntos de la semana actual, penalizaciones totales de la semana, mejor racha.
- **Racha de hábito:** contador de días consecutivos completados para cada hábito individual.

#### Perfil de usuario

- El sistema reconoce al usuario y muestra su nombre y correo en la cabecera.
- En la versión MVP el perfil es un registro único del sistema (simulación de sesión), listo para expandirse a autenticación real.

### **1.3. Diseño y experiencia de usuario:**

La aplicación se compone de una única pantalla que concentra toda la funcionalidad relevante sin necesidad de navegar entre vistas:

**Vista principal — semana actual**

La pantalla principal muestra el perfil de usuario en la cabecera, los contadores de estadísticas semanales (puntos semana anterior, puntos semana actual, penalizaciones, mejor racha), la barra de progreso del día actual, el calendario semanal con las filas de hábitos y sus celdas de estado, y el bloque de recompensas disponibles.

**Vista histórica — semana anterior bloqueada**

Al navegar a una semana pasada con los controles `‹` y `›`, el calendario se muestra en modo solo lectura. Las celdas están deshabilitadas y aparece un indicador visual de "semana bloqueada" que comunica al usuario que ese historial es inmutable.

**Modal: Nuevo hábito**

El modal de creación de hábito permite seleccionar un emoji, escribir el nombre del hábito, definir los puntos ganados por día completado y la penalización por día fallado. Las validaciones se muestran de forma inline antes de enviar el formulario.

**Modal: Nueva recompensa**

El modal de creación de recompensa permite seleccionar emoji, escribir nombre y descripción, y definir el coste en puntos necesario para canjearla. Cada recompensa es completamente personalizada por el usuario.

### **1.4. Instrucciones de instalación:**

#### Prerrequisitos

- Node.js (npm o pnpm disponible)
- Docker (para levantar PostgreSQL local)

#### 1. Clonar el repositorio e instalar dependencias

```bash
npm install
```

#### 2. Configurar variables de entorno

Crear el fichero `.env` en la raíz del proyecto con el siguiente contenido mínimo:

```env
# Base de datos (Prisma + Docker Compose)
DATABASE_URL=postgresql://USUARIO:CONTRASEÑA@localhost:5432/conrutina
POSTGRES_USER=USUARIO
POSTGRES_PASSWORD=CONTRASEÑA
POSTGRES_DB=conrutina
POSTGRES_PORT=5432

# API Express (opcional; por defecto 3001)
API_PORT=3001

# CORS (opcional; por defecto http://localhost:5173)
CORS_ORIGIN=http://localhost:5173
```

#### 3. Levantar PostgreSQL con Docker

```bash
npm run docker:up
```

o

```bash
docker-compose up -d
```

Esperar hasta que el contenedor esté saludable (unos 15 segundos). Se puede verificar con:

```bash
docker compose logs postgres
```

#### 4. Aplicar migraciones y generar el cliente Prisma

```bash
npm run db:migrate
npm run prisma:generate
```

#### 5. (Opcional) Cargar datos de ejemplo

```bash
npx prisma db seed
```

Esto inserta: 1 usuario (`demo@ConRutina.app`, `id=1`), 3 hábitos (Correr, Meditar, Leer), 1 semana activa con 21 entradas diarias y 2 recompensas (Tarde libre — 50 pts, Cena especial — 80 pts).

#### 6. Arrancar el proyecto (dos terminales)

**Terminal 1 — Frontend (Vite):**

```bash
npm run dev
```

Sirve la SPA en `http://localhost:5173`.

**Terminal 2 — Backend (Express API):**

```bash
npm run dev:api
```

Arranca la API Express en `http://localhost:3001`. Requiere `DATABASE_URL` y el contenedor PostgreSQL activo.

> **Nota:** Si solo se ejecuta `npm run dev` sin el API, la tarjeta de perfil de usuario no mostrará datos (las peticiones a `/api/profile` fallarán). Para la experiencia completa es necesario arrancar ambos procesos.

#### 7. Parada de PostgreSQL con Docker (**raíz**):

```bash
docker-compose down
```

#### Comandos adicionales

| Comando                   | Descripción                                          |
| ------------------------- | ---------------------------------------------------- |
| `npm run build`           | Genera el bundle de producción en `frontend/dist/`   |
| `npm run preview`         | Sirve localmente el build de producción              |
| `npm run docker:down`     | Para el contenedor PostgreSQL                        |
| `npm run docker:logs`     | Muestra los logs del contenedor `postgres`           |
| `npm run prisma:generate` | Regenera el cliente Prisma tras cambios en el schema |

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**

ConRutina sigue una **Clean Architecture** en dos árboles independientes (frontend y backend), con separación estricta de capas en cada uno. Esta arquitectura garantiza:

- **Independencia de framework:** la lógica de dominio (hábitos, semanas, puntos) no depende de React ni de Express.
- **Testabilidad:** los casos de uso del dominio son funciones puras fácilmente testeables sin necesidad de montar servidor ni navegador.
- **Escalabilidad:** el frontend puede desplegarse en cualquier CDN; el backend puede escalar horizontalmente sin afectar a la UI.

```mermaid
flowchart TB
  subgraph client["Navegador (Cliente)"]
    React["React SPA\n(Vite bundle)"]
  end

  subgraph devenv["Entorno Desarrollo"]
    Vite["Vite Dev Server\n:5173"]
    API["Express API\n(tsx watch :3001)"]
    Vite -->|"proxy /api"| API
  end

  subgraph prodenv["Entorno Producción"]
    CDN["CDN / Hosting estático\n(dist/)"]
    APIprod["API Node\n(contenedor / PaaS)"]
  end

  subgraph data["Persistencia"]
    PG[("PostgreSQL 16\n(Docker local / cloud)")]
    Prisma["Prisma ORM\n(PrismaClient)"]
    Prisma -->|"DATABASE_URL"| PG
  end

  React -->|"fetch /api/profile"| Vite
  API --> Prisma
  CDN -->|"sirve HTML+JS+CSS"| client
  APIprod --> Prisma

  style client fill:#E8F5E9,stroke:#4CAF50
  style devenv fill:#E3F2FD,stroke:#2196F3
  style prodenv fill:#FFF3E0,stroke:#FF9800
  style data fill:#FCE4EC,stroke:#E91E63
```

**Patrón arquitectónico:** Clean Architecture con dos árboles independientes (frontend SPA y backend API REST). Ambos implementan las mismas cuatro capas: Presentación, Aplicación, Dominio e Infraestructura.

### **2.2. Descripción de componentes principales:**

```
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND (React SPA)                                           │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  Presentación   │  │   Aplicación     │  │    Dominio     │  │
│  │  (componentes   │→ │  (hooks:         │→ │  (tipos puros, │  │
│  │   React, UI)    │  │  useHabitDash-   │  │  funciones de  │  │
│  │                 │  │  board,          │  │  cálculo,      │  │
│  │  App.tsx        │  │  useUserProfile) │  │  interfaces)   │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
│                               │                                 │
│                    ┌──────────────────┐                         │
│                    │ Infraestructura  │                         │
│                    │ (profileApi,     │                         │
│                    │ fetch HTTP)      │                         │
│                    └──────────────────┘                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP /api (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Express API)                                          │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │  Presentación   │  │   Aplicación     │  │    Dominio     │  │
│  │  (rutas HTTP,   │→ │  (casos de uso:  │→ │  (entidades,   │  │
│  │  createApp,     │  │  getUserProfile, │  │  puertos,      │  │
│  │  CORS)          │  │  etc.)           │  │  interfaces)   │  │
│  └─────────────────┘  └──────────────────┘  └────────────────┘  │
│                               │                                 │
│                    ┌──────────────────┐                         │
│                    │ Infraestructura  │                         │
│                    │ (Prisma ORM,     │                         │
│                    │ repositorios)    │                         │
│                    └──────────────────┘                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ DATABASE_URL (TCP)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  BASE DE DATOS                                                  │
│  PostgreSQL 16 (Docker en desarrollo / cloud en producción)     │
└─────────────────────────────────────────────────────────────────┘
```

| Componente          | Tecnología                                                              | Propósito                                                                   |
| ------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **React SPA**       | TypeScript · React 18 · Vite 6 · Tailwind CSS v4 · Radix UI / shadcn/ui | Interfaz de usuario, estado local de hábitos y recompensas, consumo del API |
| **Express API**     | TypeScript · Express 4 · tsx watch · Prisma ORM 5                       | Rutas REST bajo `/api`, casos de uso, acceso a BD                           |
| **PostgreSQL 16**   | Docker (dev) / cloud (prod)                                             | Persistencia de usuarios, semanas, hábitos, entradas diarias y canjes       |
| **Prisma ORM**      | `@prisma/client` 5.x                                                    | Acceso tipado a PostgreSQL; schema versionado con migraciones               |
| **Vite Dev Server** | Vite 6.4.2                                                              | Servidor de desarrollo con HMR y proxy `/api` → Express en `:3001`          |

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

El proyecto es un **monorepo** con dos árboles independientes (`frontend/` y `backend/`), ambos escritos en TypeScript y organizados en Clean Architecture:

```
ConRutina/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma    # Esquema Prisma (PostgreSQL, modelos)
│   └── src/                 # API Node (Clean Architecture)
│       ├── main.ts          # Entrada: Express + listen
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
│           └── http/        # createApp, CORS, rutas /api
├── frontend/
│   ├── index.html           # HTML shell; raíz #root (raíz de Vite)
│   └── src/
│       ├── main.tsx         # Entrada React
│       ├── domain/          # Tipos y lógica pura (hábitos, semana…)
│       ├── application/     # Hooks (useHabitDashboard, useUserProfile)
│       ├── infrastructure/  # Cliente HTTP (perfil)
│       ├── presentation/    # App.tsx, components/, media_handler
│       └── styles/
│           ├── index.css
│           ├── tailwind.css
│           └── theme.css
├── docs/                    # Documentación del proyecto
├── screenshots/             # Capturas de pantalla del prototipo
├── dist/                    # Salida de `vite build` (generada; no editar a mano)
├── docker-compose.yml       # PostgreSQL 16 para desarrollo local
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Patrón de capas en ambos árboles:**

- **Dominio:** tipos puros, funciones de cálculo e interfaces. Sin dependencias de React, Express ni Prisma.
- **Aplicación:** orquesta casos de uso. En frontend son hooks (`useHabitDashboard`, `useUserProfile`); en backend son funciones de caso de uso (`getUserProfile`).
- **Infraestructura:** adapta el mundo exterior. En frontend es el cliente HTTP (`profileApi`); en backend son los repositorios Prisma (`PrismaUserRepository`).
- **Presentación:** en frontend son los componentes React; en backend son las rutas HTTP y middleware Express.

### **2.4. Infraestructura y despliegue**

**Entorno de desarrollo:**

1. El desarrollador ejecuta `npm run dev` (Vite en `:5173`) y `npm run dev:api` (Express en `:3001`) en paralelo.
2. Las peticiones del cliente a `/api/`\* las recibe Vite y las reenvía al proceso Express (proxy configurado en `vite.config.ts`).
3. Express consulta la BD con Prisma y devuelve JSON.

**Entorno de producción:**

1. `npm run build` genera `frontend/dist/` (HTML + JS + CSS estáticos).
2. Los estáticos se despliegan en cualquier CDN (Netlify, Vercel, S3, etc.).
3. La API se despliega como proceso Node en un contenedor o PaaS.
4. El frontend llama a la URL base real del API (o un reverse proxy unifica `/api`).

**Diagrama de infraestructura:**

```mermaid
flowchart LR
  subgraph dev["Desarrollo"]
    Vite[Vite dev server]
    Api[Express API]
    BrowserDev[Navegador]
    Vite --> BrowserDev
    BrowserDev -->|fetch /api| Vite
    Vite -->|proxy| Api
  end

  subgraph prod["Producción"]
    Static[Hosting estático]
    BrowserProd[Navegador]
    Static --> BrowserProd
  end

  subgraph app["Aplicación React"]
    Main[main.tsx]
    App[App.tsx]
    Domain[Componentes dominio]
    UI[components/ui]
    Main --> App
    App --> Domain
    Domain --> UI
  end

  subgraph data["Datos local"]
    PG[(PostgreSQL Docker)]
    Prisma[PrismaClient en API]
    Prisma -->|DATABASE_URL| PG
  end

  Api --> Prisma
  BrowserDev --> Main
  BrowserProd --> Main
```

**Docker Compose (desarrollo):**

El fichero `docker-compose.yml` define el servicio `postgres` con imagen `postgres:16-alpine`, volumen persistente `conrutina_postgres_data`, health check con `pg_isready` y credenciales configurables vía `.env`.

| Variable            | Uso                                      |
| ------------------- | ---------------------------------------- |
| `POSTGRES_USER`     | Usuario de la instancia (obligatorio)    |
| `POSTGRES_PASSWORD` | Contraseña (obligatorio)                 |
| `POSTGRES_DB`       | Nombre de la BD; por defecto `conrutina` |
| `POSTGRES_PORT`     | Puerto en el host; por defecto `5432`    |

### **2.5. Seguridad**

Las siguientes prácticas de seguridad están planificadas para el MVP (User Story US-21):

- **Headers HTTP de seguridad (`helmet`):** se aplica `helmet()` como primer middleware en `createApp.ts` antes de todas las rutas. Esto activa cabeceras como `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, entre otras.
- **CORS estricto:** el origen permitido se lee de la variable de entorno `CORS_ORIGIN` (no hardcodeado). En desarrollo apunta a `http://localhost:5173`; en producción se configura con el dominio real.
- **Rate limiting:** `express-rate-limit` con límite de 100 peticiones por minuto por IP. Responde `429 Too Many Requests` con cabecera `Retry-After` al superar el límite.
- **Middleware de autenticación placeholder:** en MVP se lee `X-User-Id` del header (o se usa `id=1` por defecto). Toda la arquitectura está preparada para reemplazarlo por validación JWT real sin modificar los handlers de negocio. El `req.userId` estará disponible en todos los handlers de rutas protegidas.
- **Variables de entorno separadas del código:** `DATABASE_URL` y credenciales nunca se incluyen en el repositorio. El fichero `.env` está en `.gitignore`. El arranque del servidor valida con Zod que todas las variables obligatorias estén presentes; si falta alguna, el proceso termina con mensaje descriptivo antes de escuchar conexiones.
- **Semanas bloqueadas (integridad de datos):** el backend rechaza con `409 Conflict` cualquier mutación sobre entradas de una semana con `isLocked=true`, preservando la inmutabilidad del historial.
- **Baja lógica en lugar de borrado físico:** los hábitos y recompensas eliminados se marcan con `isActive=false`; nunca se eliminan de la BD, preservando la integridad referencial de semanas históricas bloqueadas.

### **2.6. Tests**

Los tests están planificados en la User Story US-20 (MoSCoW: `Should Have`, 8 SP). La estrategia de testing cubre dos niveles:

**Tests unitarios (Vitest — frontend):**

Se testean las funciones puras de la capa de dominio (`frontend/src/domain/`), que al ser funciones sin efectos secundarios son directamente testeables:

- `toggleHabitDayCompletion(habit, dayIndex)` — rotación de estados: pending → completed → failed → pending
- `calculateHabitStats(habits)` — cálculo de puntos semanales, penalizaciones y racha máxima
- `calculateTodayProgressPercent(habits, dayIndex)` — porcentaje de hábitos completados hoy
- `computeStreakFromStatus(statuses, currentDayIndex)` — contador de días consecutivos completados
- `totalPointsFromStats(stats)` — suma neta de puntos disponibles
- `buildWeekData(offset)` — generación de etiquetas de semana Lu-Do con fechas correctas

Objetivo de cobertura: ≥ 80% sobre `frontend/src/domain/`.

**Tests de integración (backend):**

Ejecutados contra una BD PostgreSQL efímera en Docker:

- `GET /api/profile` → 200 con datos correctos del seed
- `POST /api/habits` → 201 con hábito creado; 400 si body inválido (nombre vacío, puntos ≤ 0)
- `PATCH /api/habit-entries/:id` → 409 si la semana está bloqueada (`isLocked=true`)
- `POST /api/weeks/:id/redemptions` → 422 con `{ code: "INSUFFICIENT_POINTS", available, required }` si saldo insuficiente

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

```mermaid
erDiagram
  USER {
    Int id PK
    String email
    String name
    String avatarUrl
    DateTime createdAt
  }

  WEEK {
    Int id PK
    Int userId FK
    DateTime startDate
    DateTime endDate
    Boolean isLocked
    Int totalPointsEarned
    Int totalPenalties
    DateTime createdAt
  }

  HABIT {
    Int id PK
    Int userId FK
    String emoji
    String name
    Int pointsPerDay
    Int penalty
    Boolean isActive
    DateTime createdAt
  }

  WEEK_HABIT {
    Int id PK
    Int weekId FK
    Int habitId FK
    Int order
    String snapshotName
    Int snapshotPoints
    Int snapshotPenalty
  }

  HABIT_ENTRY {
    Int id PK
    Int weekHabitId FK
    Int dayIndex
    Enum status
    DateTime updatedAt
  }

  REWARD {
    Int id PK
    Int userId FK
    String emoji
    String name
    String description
    Int cost
    Boolean isActive
    DateTime createdAt
  }

  REWARD_REDEMPTION {
    Int id PK
    Int weekId FK
    Int rewardId FK
    Int pointsSpent
    DateTime redeemedAt
  }

  USER ||--o{ WEEK : "tiene"
  USER ||--o{ HABIT : "crea"
  USER ||--o{ REWARD : "crea"
  WEEK ||--o{ WEEK_HABIT : "contiene"
  HABIT ||--o{ WEEK_HABIT : "aparece en"
  WEEK_HABIT ||--|{ HABIT_ENTRY : "genera"
  WEEK ||--o{ REWARD_REDEMPTION : "registra"
  REWARD ||--o{ REWARD_REDEMPTION : "es canjeada en"
```

### **3.2. Descripción de entidades principales:**

#### User (Usuario)

| Atributo    | Tipo       | Restricciones            | Descripción                     |
| ----------- | ---------- | ------------------------ | ------------------------------- |
| `id`        | `Int`      | PK, autoincrement        | Identificador único del usuario |
| `email`     | `String`   | unique, not null         | Correo electrónico              |
| `name`      | `String?`  | nullable                 | Nombre visible en la cabecera   |
| `avatarUrl` | `String?`  | nullable                 | URL opcional del avatar         |
| `createdAt` | `DateTime` | not null, default: now() | Fecha de creación de la cuenta  |

#### Week (Semana)

| Atributo            | Tipo       | Restricciones            | Descripción                                                 |
| ------------------- | ---------- | ------------------------ | ----------------------------------------------------------- |
| `id`                | `Int`      | PK, autoincrement        | Identificador único de la semana                            |
| `userId`            | `Int`      | FK → User, not null      | Usuario propietario                                         |
| `startDate`         | `DateTime` | not null                 | Lunes de la semana (00:00:00)                               |
| `endDate`           | `DateTime` | not null                 | Domingo de la semana (23:59:59)                             |
| `isLocked`          | `Boolean`  | not null, default: false | `true` cuando la semana ha terminado y no puede modificarse |
| `totalPointsEarned` | `Int`      | not null, default: 0     | Puntos positivos acumulados al bloquear                     |
| `totalPenalties`    | `Int`      | not null, default: 0     | Penalizaciones acumuladas al bloquear                       |
| `createdAt`         | `DateTime` | not null, default: now() | Fecha de creación del registro                              |

_Índice:_ `@@index([userId, startDate])` para optimizar `getCurrentWeek`.

#### Habit (Hábito)

| Atributo       | Tipo       | Restricciones            | Descripción                                                      |
| -------------- | ---------- | ------------------------ | ---------------------------------------------------------------- |
| `id`           | `Int`      | PK, autoincrement        | Identificador único del hábito                                   |
| `userId`       | `Int`      | FK → User, not null      | Usuario propietario                                              |
| `emoji`        | `String`   | not null                 | Emoji representativo                                             |
| `name`         | `String`   | not null                 | Nombre descriptivo del hábito                                    |
| `pointsPerDay` | `Int`      | not null, > 0            | Puntos ganados por día completado                                |
| `penalty`      | `Int`      | not null, >= 0           | Puntos perdidos por día fallado                                  |
| `isActive`     | `Boolean`  | not null, default: true  | Indica si el hábito está disponible para añadir a nuevas semanas |
| `createdAt`    | `DateTime` | not null, default: now() | Fecha de creación                                                |

#### WeekHabit (Hábito en una Semana)

Tabla intermedia que representa la asociación de un hábito concreto a una semana específica. Permite que cada semana tenga un conjunto de hábitos diferente y guarda un **snapshot inmutable** de los valores en el momento del bloqueo.

| Atributo          | Tipo     | Restricciones        | Descripción                                                       |
| ----------------- | -------- | -------------------- | ----------------------------------------------------------------- |
| `id`              | `Int`    | PK, autoincrement    | Identificador único                                               |
| `weekId`          | `Int`    | FK → Week, not null  | Semana a la que pertenece                                         |
| `habitId`         | `Int`    | FK → Habit, not null | Hábito asociado                                                   |
| `order`           | `Int`    | not null             | Orden de visualización en el calendario                           |
| `snapshotName`    | `String` | not null             | Nombre del hábito en el momento del bloqueo (histórico inmutable) |
| `snapshotPoints`  | `Int`    | not null             | Puntos del hábito en el momento del bloqueo                       |
| `snapshotPenalty` | `Int`    | not null             | Penalización en el momento del bloqueo                            |

_Restricción:_ `@@unique([weekId, habitId])` — evita duplicados de hábito en la misma semana.
_Índice:_ `@@index([weekId])`.

#### HabitEntry (Entrada diaria de un Hábito)

Registra el estado de cada hábito por cada día de la semana. Cada `WeekHabit` genera exactamente 7 entradas (Lun–Dom).

| Atributo      | Tipo       | Restricciones              | Descripción                                                      |
| ------------- | ---------- | -------------------------- | ---------------------------------------------------------------- |
| `id`          | `Int`      | PK, autoincrement          | Identificador único                                              |
| `weekHabitId` | `Int`      | FK → WeekHabit, not null   | Relación con el hábito de la semana                              |
| `dayIndex`    | `Int`      | not null, 0–6              | Índice del día (0=Lunes … 6=Domingo)                             |
| `status`      | `Enum`     | not null, default: pending | Estado del hábito para ese día: `pending`, `completed`, `failed` |
| `updatedAt`   | `DateTime` | not null                   | Última actualización                                             |

_Índice:_ `@@index([weekHabitId])`.

#### Reward (Recompensa)

| Atributo      | Tipo       | Restricciones            | Descripción                             |
| ------------- | ---------- | ------------------------ | --------------------------------------- |
| `id`          | `Int`      | PK, autoincrement        | Identificador único                     |
| `userId`      | `Int`      | FK → User, not null      | Usuario propietario                     |
| `emoji`       | `String`   | not null                 | Emoji representativo                    |
| `name`        | `String`   | not null                 | Nombre de la recompensa                 |
| `description` | `String`   | not null                 | Descripción breve                       |
| `cost`        | `Int`      | not null, > 0            | Coste en puntos para canjear            |
| `isActive`    | `Boolean`  | not null, default: true  | Indica si la recompensa está disponible |
| `createdAt`   | `DateTime` | not null, default: now() | Fecha de creación                       |

#### RewardRedemption (Canje de Recompensa)

Registra cada vez que el usuario canjea una recompensa en una semana determinada.

| Atributo      | Tipo       | Restricciones         | Descripción                                |
| ------------- | ---------- | --------------------- | ------------------------------------------ |
| `id`          | `Int`      | PK, autoincrement     | Identificador único                        |
| `weekId`      | `Int`      | FK → Week, not null   | Semana en que se canjeó                    |
| `rewardId`    | `Int`      | FK → Reward, not null | Recompensa canjeada                        |
| `pointsSpent` | `Int`      | not null              | Puntos descontados en el momento del canje |
| `redeemedAt`  | `DateTime` | not null              | Timestamp del canje                        |

_Índice:_ `@@index([weekId])` para cálculo de saldo disponible.

**Relaciones resumen:**

| From        | To                 | Cardinalidad | Descripción                                                          |
| ----------- | ------------------ | ------------ | -------------------------------------------------------------------- |
| `User`      | `Week`             | 1:N          | Un usuario tiene muchas semanas                                      |
| `User`      | `Habit`            | 1:N          | Un usuario crea y gestiona sus propios hábitos                       |
| `User`      | `Reward`           | 1:N          | Un usuario define sus propias recompensas                            |
| `Week`      | `WeekHabit`        | 1:N          | Una semana tiene varios hábitos activos                              |
| `Habit`     | `WeekHabit`        | 1:N          | Un hábito puede aparecer en múltiples semanas con snapshot inmutable |
| `WeekHabit` | `HabitEntry`       | 1:7          | Cada asociación hábito-semana genera exactamente 7 entradas diarias  |
| `Week`      | `RewardRedemption` | 1:N          | Una semana puede registrar múltiples canjes de recompensas           |
| `Reward`    | `RewardRedemption` | 1:N          | Una recompensa puede ser canjeada en múltiples semanas               |

---

## 4. Especificación de la API

> Los endpoints están bajo el prefijo `/api`. Todas las peticiones y respuestas usan `Content-Type: application/json` (UTF-8). Los valores `DateTime` se expresan en ISO 8601 (UTC).

---

### Endpoint 1: `GET /api/profile`

Devuelve los datos del usuario para la cabecera de la aplicación.

```yaml
openapi: '3.0.3'
paths:
  /api/profile:
    get:
      summary: Obtener perfil del usuario autenticado
      description: >
        Devuelve los datos de identificación del usuario (id, nombre, email, avatar).
        En el MVP el userId se resuelve en servidor (hardcodeado a 1 o vía header X-User-Id).
      responses:
        '200':
          description: Perfil del usuario encontrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 1
                  name:
                    type: string
                    nullable: true
                    example: 'Demo User'
                  email:
                    type: string
                    example: 'demo@ConRutina.app'
                  avatarUrl:
                    type: string
                    nullable: true
                    example: null
        '404':
          description: Usuario no encontrado
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: 'USER_NOT_FOUND'
                  message:
                    type: string
                    example: 'Usuario no encontrado'
        '500':
          description: Error interno del servidor
```

**Ejemplo de petición:**

```bash
curl http://localhost:3001/api/profile
```

**Ejemplo de respuesta (200):**

```json
{
  "id": 1,
  "name": "Demo User",
  "email": "demo@ConRutina.app",
  "avatarUrl": null
}
```

---

### Endpoint 2: `GET /api/weeks/current`

Devuelve la semana activa del usuario con todos sus hábitos, entradas diarias y estadísticas. Si ha cambiado de semana, bloquea la anterior y crea la nueva automáticamente (UC-08).

```yaml
openapi: '3.0.3'
paths:
  /api/weeks/current:
    get:
      summary: Obtener la semana activa del usuario
      description: >
        Devuelve la semana activa con sus WeekHabits, las 7 HabitEntries por hábito y las
        estadísticas calculadas. Si ha cambiado de semana desde el último acceso, bloquea
        la semana anterior (isLocked=true, snapshot inmutable) y crea la nueva con los
        hábitos heredados en status=pending.
      responses:
        '200':
          description: Semana activa encontrada o creada
          content:
            application/json:
              schema:
                type: object
                properties:
                  week:
                    type: object
                    properties:
                      id:
                        type: integer
                        example: 3
                      startDate:
                        type: string
                        format: date-time
                        example: '2026-04-13T00:00:00.000Z'
                      endDate:
                        type: string
                        format: date-time
                        example: '2026-04-19T23:59:59.999Z'
                      isLocked:
                        type: boolean
                        example: false
                  habits:
                    type: array
                    items:
                      type: object
                      properties:
                        weekHabit:
                          type: object
                          properties:
                            id:
                              type: integer
                            habitId:
                              type: integer
                            order:
                              type: integer
                            snapshotName:
                              type: string
                              example: 'Correr'
                            snapshotPoints:
                              type: integer
                              example: 10
                            snapshotPenalty:
                              type: integer
                              example: 5
                        entries:
                          type: array
                          minItems: 7
                          maxItems: 7
                          items:
                            type: object
                            properties:
                              id:
                                type: integer
                              dayIndex:
                                type: integer
                                minimum: 0
                                maximum: 6
                              status:
                                type: string
                                enum: [pending, completed, failed]
                                example: 'pending'
                  stats:
                    type: object
                    properties:
                      thisWeekPoints:
                        type: integer
                        example: 30
                      lastWeekPoints:
                        type: integer
                        example: 75
                      penalties:
                        type: integer
                        example: 5
                      maxStreak:
                        type: integer
                        example: 3
                  redemptions:
                    type: array
                    items:
                      type: object
        '500':
          description: Error interno del servidor
```

**Ejemplo de petición:**

```bash
curl http://localhost:3001/api/weeks/current
```

---

### Endpoint 3: `PATCH /api/habit-entries/{habitEntryId}`

Actualiza el estado (`status`) de una celda concreta del calendario. Rechaza la mutación si la semana está bloqueada.

```yaml
openapi: '3.0.3'
paths:
  /api/habit-entries/{habitEntryId}:
    patch:
      summary: Actualizar el estado de una entrada diaria de hábito
      description: >
        Actualiza el campo status de una HabitEntry concreta. El ciclo de estados
        válidos es: pending → completed → failed → pending. Rechaza la petición con 409
        si la semana asociada está bloqueada (isLocked=true).
      parameters:
        - name: habitEntryId
          in: path
          required: true
          schema:
            type: integer
          example: 42
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [status]
              properties:
                status:
                  type: string
                  enum: [pending, completed, failed]
                  example: 'completed'
      responses:
        '200':
          description: Estado actualizado correctamente
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    example: 42
                  status:
                    type: string
                    enum: [pending, completed, failed]
                    example: 'completed'
                  updatedAt:
                    type: string
                    format: date-time
                    example: '2026-04-18T09:15:00.000Z'
        '400':
          description: Valor de status inválido
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: 'VALIDATION_ERROR'
                  details:
                    type: array
                    items:
                      type: object
                      properties:
                        field:
                          type: string
                          example: 'status'
                        message:
                          type: string
                          example: 'Debe ser pending, completed o failed'
        '404':
          description: HabitEntry no encontrada o no pertenece al usuario
        '409':
          description: La semana está bloqueada y no admite modificaciones
          content:
            application/json:
              schema:
                type: object
                properties:
                  code:
                    type: string
                    example: 'WEEK_LOCKED'
                  message:
                    type: string
                    example: 'No se puede modificar una semana bloqueada'
```

**Ejemplo de petición:**

```bash
curl -X PATCH http://localhost:3001/api/habit-entries/42 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Ejemplo de respuesta (200):**

```json
{
  "id": 42,
  "status": "completed",
  "updatedAt": "2026-04-18T09:15:00.000Z"
}
```

---

## 5. Historias de Usuario

> Tres historias de usuario principales, con criterios INVEST y Acceptance Criteria en formato Gherkin.

Consultar información detallada en el documento: `[docs/product-backlog.md](docs/product-backlog.md)`

---

**Historia de Usuario 1**

### US-09 · API: gestión de semanas y bloqueo automático

**Como** sistema, **quiero** un endpoint que devuelva la semana activa del usuario y que, si ha cambiado de semana, bloquee la anterior y cree automáticamente la nueva con los hábitos heredados, **para** garantizar la integridad del historial y que cada semana comience con todas las celdas en blanco.

**MoSCoW:** `Must Have` · **Complejidad:** `L` · **Story Points:** 13

**INVEST:**

| Criterio    | Evaluación                                                                           |
| ----------- | ------------------------------------------------------------------------------------ |
| Independent | Depende de los modelos Week, WeekHabit, HabitEntry y de los hábitos creados.         |
| Negotiable  | El momento del bloqueo (al cargar la app vs. cron job nocturno) es negociable.       |
| Valuable    | Es la mecánica que distingue ConRutina: historial inmutable semana a semana.         |
| Estimable   | Lógica de fechas + transacción BD bien especificada en el PRD.                       |
| Small       | Un endpoint que encapsula la lógica de transición semanal.                           |
| Testable    | Simular cambio de semana y verificar bloqueo de semana anterior y creación de nueva. |

**Acceptance Criteria (BDD):**

```gherkin
# Scenario 1 — Happy path: primera semana del usuario
Given el usuario no tiene ninguna semana en BD
When hace GET /api/weeks/current
Then el servidor crea la semana actual (lunes 00:00 UTC → domingo 23:59 UTC)
And crea WeekHabit para cada hábito activo del usuario (isActive=true)
And crea 7 HabitEntry con status=pending para cada WeekHabit
And devuelve la nueva semana con todos sus datos

# Scenario 2 — Happy path: misma semana
Given el usuario ya tiene la semana en curso en BD (isLocked=false)
When hace GET /api/weeks/current
Then el servidor devuelve la semana existente con sus WeekHabit y HabitEntry sin crear duplicados

# Scenario 3 — Happy path: cambio de semana (transición)
Given existe la semana anterior sin bloquear (isLocked=false)
And hoy es lunes de la semana siguiente
When hace GET /api/weeks/current
Then el servidor bloquea la semana anterior: isLocked=true, totalPointsEarned y totalPenalties calculados
And escribe los snapshots definitivos en WeekHabit (snapshotName, snapshotPoints, snapshotPenalty)
And crea la nueva semana con los hábitos activos del usuario (isActive=true)
And la nueva semana tiene todas sus HabitEntry con status=pending
And devuelve la nueva semana, no la bloqueada

# Scenario 4 — Idempotencia
Given la semana anterior ya está bloqueada (isLocked=true)
When GET /api/weeks/current se llama dos veces seguidas
Then no se crean semanas duplicadas ni se modifica la semana bloqueada
And se devuelve la semana en curso en ambas llamadas

# Scenario 5 — Snapshot inmutable
Given la semana W se bloqueó con el hábito "Yoga" a 10 pts/día
When más tarde el usuario edita "Yoga" a 15 pts/día
Then GET /api/weeks/current con offset=-1 sigue mostrando snapshotPoints=10 para "Yoga"
```

---

**Historia de Usuario 2**

### US-10 · API: gestión de estados diarios de hábitos (HabitEntry)

**Como** usuario, **quiero** que cada clic sobre una celda del calendario actualice el estado de ese día en la base de datos, **para** que mi progreso diario quede registrado de forma permanente.

**MoSCoW:** `Must Have` · **Complejidad:** `M` · **Story Points:** 5

**INVEST:**

| Criterio    | Evaluación                                                                   |
| ----------- | ---------------------------------------------------------------------------- |
| Independent | Depende de US-09 (HabitEntry creadas al iniciar semana).                     |
| Negotiable  | Si se permite cambiar estado de días futuros en semana actual es negociable. |
| Valuable    | Es la interacción principal del producto; sin persistencia no hay valor.     |
| Estimable   | Endpoint PATCH simple con validación de semana bloqueada.                    |
| Small       | Un endpoint, una tabla, una validación clave.                                |
| Testable    | PATCH persiste el estado; semana bloqueada rechaza la petición con 409.      |

**Acceptance Criteria (BDD):**

```gherkin
# Scenario 1 — Happy path
Given existe HabitEntry con id=42, status=pending, en semana no bloqueada
When hace PATCH /api/habit-entries/42 con body { status: "completed" }
Then el servidor responde 200 { id: 42, status: "completed", updatedAt: "<now>" }
And el registro en BD tiene status=completed

# Scenario 2 — Semana bloqueada
Given la HabitEntry id=99 pertenece a una semana con isLocked=true
When hace PATCH /api/habit-entries/99 con body { status: "completed" }
Then el servidor responde 409 { code: "WEEK_LOCKED", message: "No se puede modificar una semana bloqueada" }
And el estado en BD no cambia

# Scenario 3 — Ciclo de estados válidos
Given una HabitEntry en status=completed
When hace PATCH con { status: "failed" }
Then el servidor acepta el cambio (todos los estados son mutuamente accesibles)
And responde 200

# Scenario 4 — Validación de status inválido
Given el body incluye { status: "done" } (valor no válido)
When el servidor recibe la petición
Then responde 400 { code: "VALIDATION_ERROR", details: [{ field: "status", message: "Debe ser pending, completed o failed" }] }

# Scenario 5 — Edge case: HabitEntry de otro usuario
Given HabitEntry id=200 pertenece al usuario id=2
When el usuario id=1 hace PATCH /api/habit-entries/200
Then el servidor responde 404 (no expone existencia del recurso)
```

---

**Historia de Usuario 3**

### US-11 · API: gestión de recompensas (CRUD)

**Como** usuario, **quiero** crear, listar y eliminar recompensas personalizadas con nombre, emoji, descripción y coste en puntos, **para** definir los incentivos que hacen que mi esfuerzo semanal tenga un valor tangible y personal.

**MoSCoW:** `Must Have` · **Complejidad:** `M` · **Story Points:** 5

**INVEST:**

| Criterio    | Evaluación                                                                  |
| ----------- | --------------------------------------------------------------------------- |
| Independent | Depende del modelo Reward y del servidor Express scaffoldeado.              |
| Negotiable  | Editar una recompensa (PATCH) puede posponerse a una versión posterior.     |
| Valuable    | Las recompensas personalizadas son el diferencial competitivo del producto. |
| Estimable   | CRUD estándar; mismos patrones que hábitos.                                 |
| Small       | Tres endpoints sobre la entidad Reward.                                     |
| Testable    | POST crea en BD; DELETE hace baja lógica; canjes históricos no se eliminan. |

**Acceptance Criteria (BDD):**

```gherkin
# Scenario 1 — Crear recompensa (happy path)
Given el usuario está identificado
When hace POST /api/rewards con body { emoji:"🎬", name:"Ir al cine", description:"Tarde de peli", cost:50 }
Then el servidor responde 201 con la recompensa creada (id, isActive:true, createdAt)
And queda persistida en la tabla Reward

# Scenario 2 — Listar recompensas
Given el usuario tiene 3 recompensas activas y 1 eliminada (isActive:false)
When hace GET /api/rewards
Then la respuesta incluye las 3 activas únicamente

# Scenario 3 — Eliminar recompensa (baja lógica)
Given existe la recompensa id=3 con 2 canjes históricos
When hace DELETE /api/rewards/3
Then responde 204
And Reward queda con isActive=false
And los 2 RewardRedemption históricos permanecen en BD

# Scenario 4 — Validación: coste cero
Given el body de POST incluye cost: 0
Then el servidor responde 400 con error en el campo cost ("Debe ser mayor que 0")

# Scenario 5 — Edge case: recompensa de otro usuario
Given la recompensa id=10 pertenece al usuario id=2
When el usuario id=1 hace DELETE /api/rewards/10
Then el servidor responde 404
```

---

## 6. Tickets de Trabajo

> Un ticket de base de datos, uno de backend y uno de frontend, con todo el detalle necesario para desarrollarlos de inicio a fin.

Consultar información detallada en el documento: `[docs/product-backlog.md](docs/product-backlog.md)`

---

**Ticket 1 — Base de datos**

### T-03-01 · Instalar Prisma y definir esquema completo (todos los modelos del PRD)

- **User Story:** US-03 — Configurar Prisma ORM con esquema inicial y migraciones
- **Tipo:** Backend — Base de datos
- **Complejidad:** `M` · **Story Points:** 3
- **Sprint:** Sprint 0 · Scaffolding

**Descripción:**

Instalar `prisma` y `@prisma/client`. Crear `backend/prisma/schema.prisma` con el datasource PostgreSQL y todos los modelos del PRD: `User`, `Week`, `Habit`, `WeekHabit`, `HabitEntry`, `Reward`, `RewardRedemption` con sus campos, relaciones, índices y enums exactamente como se definen en el modelo de datos (sección 5.1 del PRD).

**Alcance / Definición de hecho:**

- `prisma init` en `backend/` con `datasource db { provider = "postgresql", url = env("DATABASE_URL") }`.
- Todos los modelos con tipos exactos del PRD sección 5.1.
- Enum `CompletionStatus { pending completed failed }` para `HabitEntry.status`.
- Campos con valores por defecto: `isLocked @default(false)`, `isActive @default(true)`, `totalPointsEarned @default(0)`, `totalPenalties @default(0)`.
- Índices de rendimiento:
  - `@@index([userId, startDate])` en `Week`
  - `@@index([weekId])` en `WeekHabit`
  - `@@index([weekHabitId])` en `HabitEntry`
  - `@@index([weekId])` en `RewardRedemption`
- `@@unique([weekId, habitId])` en `WeekHabit` para evitar duplicados de hábito en la misma semana.
- `prisma validate` pasa sin errores.
- El bloque `prisma.schema` en `package.json` apunta a `backend/prisma/schema.prisma`.

**Verificación de modelos (lista de comprobación):**

| Modelo             | Campos clave                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `User`             | `id`, `email(unique)`, `name?`, `avatarUrl?`, `createdAt`                                                                                       |
| `Week`             | `id`, `userId(FK)`, `startDate`, `endDate`, `isLocked(default:false)`, `totalPointsEarned(default:0)`, `totalPenalties(default:0)`, `createdAt` |
| `Habit`            | `id`, `userId(FK)`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive(default:true)`, `createdAt`                                           |
| `WeekHabit`        | `id`, `weekId(FK)`, `habitId(FK)`, `order`, `snapshotName`, `snapshotPoints`, `snapshotPenalty`                                                 |
| `HabitEntry`       | `id`, `weekHabitId(FK)`, `dayIndex(0-6)`, `status(enum:pending/completed/failed)`, `updatedAt`                                                  |
| `Reward`           | `id`, `userId(FK)`, `emoji`, `name`, `description`, `cost`, `isActive(default:true)`, `createdAt`                                               |
| `RewardRedemption` | `id`, `weekId(FK)`, `rewardId(FK)`, `pointsSpent`, `redeemedAt`                                                                                 |

**Edge cases a tener en cuenta:**

- Si la migración se aplica sobre una BD que ya tiene la tabla `User` (PostgreSQL reserva este nombre), usar `@@map("users")` si es necesario.
- El campo `WeekHabit.habitId` junto a `weekId` debe tener índice compuesto `@@unique([weekId, habitId])` para evitar duplicados de hábito en la misma semana.

---

**Ticket 2 — Backend**

### T-09-02 · Caso de uso: bloquear semana anterior y transición semanal

- **User Story:** US-09 — API: gestión de semanas y bloqueo automático
- **Tipo:** Backend — Aplicación
- **Complejidad:** `L` · **Story Points:** 5
- **Sprint:** Sprint 2 · Ciclo Semanal y Recompensas API

**Descripción:**

Implementar el caso de uso `lockWeekAndTransition(userId)`. Si existe una semana anterior no bloqueada (`isLocked=false`), la bloquea calculando `totalPointsEarned`, `totalPenalties` y guardando snapshots inmutables en `WeekHabit`. Luego crea la nueva semana con los hábitos activos del usuario en estado `pending`. Toda la operación debe ejecutarse dentro de una transacción Prisma para garantizar atomicidad.

**Ficheros a crear / modificar:**

- `backend/src/application/lockWeekAndTransition.ts` — nuevo caso de uso
- `backend/src/infrastructure/prismaWeekRepository.ts` — ampliar con métodos `lockWeek`, `createWeekWithHabits`

**Alcance / Definición de hecho:**

- `lockWeek(weekId)`: transacción Prisma que:
  1. Consulta todas las `HabitEntry` de la semana a través de `WeekHabit`.
  2. Calcula `totalPointsEarned` = suma de (`completados × snapshotPoints`).
  3. Calcula `totalPenalties` = suma de (`fallados × snapshotPenalty`).
  4. Escribe los snapshots definitivos en `WeekHabit` (`snapshotName`, `snapshotPoints`, `snapshotPenalty` con los valores actuales del hábito maestro).
  5. Actualiza `Week` con `isLocked=true`, `totalPointsEarned`, `totalPenalties`.
- La operación es **idempotente**: si la semana ya está bloqueada, no modifica nada y no lanza error.
- Tras bloquear, crea la nueva semana para la semana en curso con:
  - `WeekHabit` para cada hábito con `isActive=true` del usuario.
  - 7 `HabitEntry` por cada `WeekHabit` con `status: pending`.
- Test unitario: semana bloqueada → los snapshots en `WeekHabit` son inmutables ante cambios posteriores del hábito maestro (cambiar `pointsPerDay` no altera `snapshotPoints` de semanas pasadas).
- Test: llamada doble con semana ya bloqueada → sin duplicados, sin error.

**Criterios de aceptación clave:**

```gherkin
# Scenario — Bloqueo y herencia de hábitos
Given existe la semana anterior (id=2) con isLocked=false
And el usuario tiene el hábito "Correr" (pointsPerDay=10, penalty=5)
And el hábito tiene 3 días completed y 1 día failed en esa semana
When se ejecuta lockWeekAndTransition(userId)
Then Week(id=2).isLocked = true
And Week(id=2).totalPointsEarned = 30  (3 × 10)
And Week(id=2).totalPenalties = 5      (1 × 5)
And se crea Week(id=3) con startDate = lunes de la semana en curso
And Week(id=3) tiene WeekHabit para "Correr" con snapshotPoints=10
And WeekHabit tiene 7 HabitEntry con status=pending

# Scenario — Idempotencia
Given Week(id=2).isLocked = true (ya bloqueada)
When se ejecuta lockWeekAndTransition(userId) de nuevo
Then no se modifica Week(id=2)
And no se crean semanas duplicadas
```

---

**Ticket 3 — Frontend**

### T-16-02 · Hook useHabitDashboard con carga desde API

- **User Story:** US-16 — UI: crear y gestionar hábitos
- **Tipo:** Frontend — Aplicación
- **Complejidad:** `L` · **Story Points:** 5
- **Sprint:** Sprint 3 · UI Core — Perfil, Hábitos y Recompensas

**Descripción:**

Crear `frontend/src/application/useHabitDashboard.ts`. Es el hook central de la SPA: carga la semana actual desde `GET /api/weeks/current` al montar el componente, gestiona el estado de hábitos, entradas diarias, estadísticas y semana, y expone todos los handlers que los componentes de presentación necesitan para interactuar con la lógica de negocio y la API.

**Ficheros a crear:**

- `frontend/src/application/useHabitDashboard.ts` — hook principal
- `frontend/src/infrastructure/weekApi.ts` — cliente HTTP para semanas
- `frontend/src/infrastructure/habitApi.ts` — cliente HTTP para hábitos y entradas

**Alcance / Definición de hecho:**

- Al montar, llama a `weekApi.fetchCurrentWeek()` → `GET /api/weeks/current` y carga hábitos, entradas y stats en el estado local.
- `handleToggleDay(habitId, dayIndex)`:
  1. **Optimistic update** del estado local (rota el estado de la celda inmediatamente).
  2. Llama a `habitEntryApi.updateHabitEntry(entryId, newStatus)` → `PATCH /api/habit-entries/:id`.
  3. En caso de error HTTP: revierte el estado local al valor anterior y muestra toast de error.
- `handleAddHabit(input)`: llama a `habitApi.createHabit(input)` → `POST /api/habits` → añade al estado local → recarga la semana para sincronizar.
- `handleDeleteHabit(habitId)`: optimistic delete → llama a `habitApi.deleteHabit(id)` → en error restaura el hábito eliminado.
- `handleAddReward(input)`: llama a `rewardApi.createReward(input)` → añade al estado local.
- `handleRedeemReward(rewardId)`: llama a `rewardApi.redeemReward(weekId, rewardId)` → en éxito actualiza el saldo; en error `INSUFFICIENT_POINTS` muestra toast con puntos disponibles y requeridos.
- `handleDeleteReward(rewardId)`: llama a `rewardApi.deleteReward(id)` → elimina del estado local.
- `handleWeekNav(offset)`: cambia el `weekOffset` y carga la semana correspondiente de la API.
- Expone `isCurrentWeek: boolean` y `isWeekLocked: boolean` para que los componentes activen el modo lectura (celdas no interactivas, sin botón de eliminar).
- Expone `totalPoints: number` calculado como `thisWeekPoints - penalties - pointsSpent en canjes`.

**Interfaz pública del hook:**

```typescript
const {
  habits, // Habit[] — hábitos de la semana en curso
  rewards, // Reward[] — recompensas activas del usuario
  weekOffset, // number — 0 = semana actual, -1 = semana anterior, etc.
  stats, // HabitStats — { thisWeekPoints, lastWeekPoints, penalties, maxStreak }
  totalPoints, // number — saldo disponible para canjear
  currentDayIndex, // number — día de hoy (0=Lunes, 6=Domingo)
  todayProgress, // number — % hábitos completados hoy (0-100)
  weekData, // WeekData — etiquetas y fechas de la semana visible
  isCurrentWeek, // boolean
  isWeekLocked, // boolean
  handleToggleDay,
  handleAddHabit,
  handleDeleteHabit,
  handleAddReward,
  handleRedeemReward,
  handleDeleteReward,
  handleWeekNav,
} = useHabitDashboard()
```

**Criterios de aceptación clave:**

```gherkin
# Scenario — Carga inicial
Given el componente App monta useHabitDashboard
When la petición GET /api/weeks/current responde 200
Then habits contiene los hábitos de la semana actual
And stats refleja los puntos y la racha calculados

# Scenario — Optimistic toggle con revert
Given el usuario hace clic en una celda (pending → completed)
Then la celda cambia a verde inmediatamente (optimistic update)
When la API responde 409 (semana bloqueada)
Then la celda revierte a su estado anterior
And se muestra un toast de error

# Scenario — Modo lectura en semana anterior
Given el usuario navega a la semana anterior (weekOffset=-1)
Then isWeekLocked = true
And isCurrentWeek = false
And los componentes renderizan las celdas como no interactivas
```

---

## 7. Pull Requests

> El proyecto se encuentra actualmente en fase de especificación y scaffolding inicial (proyecto greenfield). Las Pull Requests documentadas a continuación corresponden a los hitos de integración planificados en el backlog, pendientes de ejecución.

**Pull Request 1**

_(pendiente — se documentará al completar Sprint 0: Scaffolding y configuración del monorepo, base de datos y estructura de capas)_

**Pull Request 2**

_(pendiente — se documentará al completar Sprint 1: APIs Core, dominio del frontend y perfil de usuario)_

**Pull Request 3**

_(pendiente — se documentará al completar Sprint 2: Ciclo semanal, bloqueo automático y recompensas API)_
