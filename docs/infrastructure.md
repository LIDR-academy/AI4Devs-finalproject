# Infraestructura y arquitectura técnica — ConRutina

Documento orientado a desarrolladores que deben entender el proyecto y añadir funcionalidades. Describe el **stack**, los **componentes de software**, su **relación**, **versiones**, **estructura de carpetas**, **configuración** y **comandos** habituales.

---

## 1. Resumen ejecutivo

**ConRutina** es una aplicación web **SPA (Single Page Application)** escrita en **TypeScript** con **React**. El código se organiza en **Clean Architecture** con dos árboles claros: **[`frontend/`](../frontend/)** (React, Vite) y **[`backend/`](../backend/)** (Express, Prisma). El estado de hábitos y recompensas sigue viviendo en **memoria del cliente** (`useState` vía el hook de aplicación `useHabitDashboard`), y la UI consume un **API HTTP** en Node: **Express** en [`backend/src/main.ts`](../backend/src/main.ts) y capas bajo `backend/src/` usan **Prisma** contra **PostgreSQL** y exponen, entre otras, **`GET /api/profile`** (usuario con `id = 1`, pensado como perfil “simulado” de sesión). El componente **`UserProfileCard`** obtiene esos datos a través de la capa de infraestructura (`fetch('/api/profile')`).

Para **persistencia** el repositorio incluye **Prisma ORM** (cliente y CLI **5.x**, alineados con `@prisma/client`) y un esquema **PostgreSQL** en `backend/prisma/schema.prisma`. La ruta del esquema está declarada en **`package.json`** (`prisma.schema`), de modo que `npx prisma generate` y los scripts npm resuelven el esquema sin pasar `--schema` manualmente. Un servicio **PostgreSQL 16** (imagen Alpine) se levanta con **`docker-compose.yml`** en la raíz; la cadena de conexión se define con **`DATABASE_URL`** en `.env` (ver [§7](#7-principales-ficheros-de-configuración) y [§12](#12-base-de-datos-prisma-y-docker)).

El empaquetado y el servidor de desarrollo del frontend los proporciona **Vite**. En desarrollo, Vite hace **proxy** de las rutas que empiezan por `/api` hacia el API en **Node** (puerto por defecto **3001**), de forma que el navegador solo habla con el origen de Vite (p. ej. `http://localhost:5173`) y evita problemas de CORS en la práctica habitual. El API habilita además **CORS** explícito para `http://localhost:5173` por si se llama al backend directamente. Los estilos se basan en **Tailwind CSS v4** (plugin oficial de Vite) y en variables CSS de tema (patrón tipo **shadcn/ui** con **Radix UI** y utilidades como `cn()`).

En `package.json` siguen existiendo scripts para **Vitest/ESLint** que pueden requerir dependencias o configuración adicional no detalladas aquí (ver [§11 Notas y advertencias](#11-notas-y-advertencias)).

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión en proyecto | Propósito |
|------|------------|---------------------|-----------|
| Runtime (navegador) | JavaScript (ES modules) | — | Ejecución en el cliente |
| Lenguaje | TypeScript (sintaxis `.ts`/`.tsx`) | Sin paquete `typescript` en lockfile; `tsconfig` orienta al IDE y al compilador embebido de Vite | Tipado estático y mejor DX |
| UI | React + React DOM (peer) | **18.3.1** (`peerDependencies`; instalación típica vía npm) | Componentes, estado reactivo y render en el DOM |
| Bundler / dev server | Vite | **6.4.2** (`package.json`; lockfile alineado) | Desarrollo con HMR, build a estáticos |
| Plugin React | `@vitejs/plugin-react` | **4.7.0** | Fast Refresh y JSX |
| Estilos | Tailwind CSS | **4.1.12** | Utilidades CSS y diseño responsive |
| Integración Tailwind–Vite | `@tailwindcss/vite` | **4.1.12** | Procesa Tailwind en el pipeline de Vite |
| Animaciones CSS (Tailwind) | `tw-animate-css` | **1.3.8** | Utilidades de animación |
| Iconos (pantalla principal) | `lucide-react` | **0.487.0** | Iconos vectoriales (p. ej. calendario, regalo) |
| Utilidad clases | `clsx` + `tailwind-merge` | **2.1.1** / **3.2.0** | Componer clases y resolver conflictos (`cn()` en UI) |
| Variantes de componentes | `class-variance-authority` | **0.7.1** | Variantes tipadas de estilos (patrón shadcn) |
| Primitivos accesibles (UI kit) | Radix UI (`@radix-ui/react-*`) | Varias **1.x–2.x** (ver `package.json`) | Diálogos, menús, formularios accesibles |
| Componentes Material | MUI (`@mui/material`, `@mui/icons-material`) + Emotion (`@emotion/react`, `@emotion/styled`) | **7.3.5** (MUI) / **11.14.x** (Emotion) | Sistema de componentes Material; la pantalla principal no depende de ellos de forma obligatoria |
| Formularios | `react-hook-form` | **7.55.0** | Formularios controlados, validación y rendimiento en formularios complejos |
| Enrutamiento SPA | `react-router` | **7.13.0** | Navegación entre vistas; **instalado pero no usado aún** en `App.tsx` |
| Animación | `motion` | **12.23.24** | Animaciones y transiciones en la UI |
| Gráficos | `recharts` | **2.15.2** | Gráficos declarativos en React (usa D3 internamente) |
| Tema claro / oscuro | `next-themes` | **0.4.6** | Tema persistente y sincronizado con `prefers-color-scheme` |
| Notificaciones (toast) | `sonner` | **2.0.3** | Toasts accesibles y ligeros |
| Fechas y calendario | `date-fns` + `react-day-picker` | **3.6.0** / **8.10.1** | Utilidades de fecha y componente de selección por días |
| Paleta de comandos | `cmdk` | **1.1.1** | Command menu / búsqueda tipo paleta (patrón cmdk) |
| Entrada OTP | `input-otp` | **1.4.2** | Campos segmentados para códigos de un solo uso |
| Carruseles | `embla-carousel-react`, `react-slick` | **8.6.0** / **0.31.0** | Carruseles (Embla) y sliders (Slick) |
| Masonry y paneles | `react-responsive-masonry`, `react-resizable-panels` | **2.7.1** / **2.1.7** | Rejillas tipo masonry y divisores redimensionables |
| Drag and drop | `react-dnd`, `react-dnd-html5-backend` | **16.0.1** | Arrastrar y soltar con backend HTML5 |
| Posicionamiento (Popper) | `@popperjs/core`, `react-popper` | **2.11.8** / **2.3.0** | Posicionamiento de overlays cuando se necesita la API de Popper explícitamente |
| Drawer / sheet | `vaul` | **1.1.2** | Panel tipo drawer/sheet accesible (especialmente útil en móvil) |
| Efectos de celebración | `canvas-confetti` | **1.9.4** | Confeti en canvas para refuerzo visual (logros, rachas, etc.) |
| API HTTP (Node) | `express`, `cors` | **^4.19.2** / **^2.8.6** | Entrada en [`backend/src/main.ts`](../backend/src/main.ts); composición HTTP en `backend/src/presentation/http/`; CORS hacia el origen de Vite en desarrollo |
| Variables de entorno (Node) | `dotenv` | **^16.4.5** | Carga de `.env` en el arranque del API (`import 'dotenv/config'`); distinto del mecanismo de Vite para variables expuestas al cliente (`VITE_*`) |
| Ejecución TS en Node (dev) | `tsx` | **^4.x** (`devDependency`) | Arranca y recarga el API con `npm run dev:api` sin paso de compilación previa |
| Tipados React / DOM | `@types/react`, `@types/react-dom` | **^18.3.x** | Definiciones TypeScript alineadas con React 18 |
| Tipados servidor (Node) | `@types/cors`, `@types/express` | **^2.8.19** / **^4.17.9** | Tipados para Express y CORS en código Node/TS |
| ORM / acceso a datos | **Prisma** (`prisma`, `@prisma/client`) | **^5.13.0** (resolución típica **5.22.x** en lockfile) | Esquema y cliente generado para **PostgreSQL** |
| Base de datos (desarrollo / local) | **PostgreSQL** | **16** (`postgres:16-alpine` en Docker) | Motor al que apunta `DATABASE_URL` del esquema Prisma |

**Versión de la aplicación:** `0.0.1` (`package.json`, campo `version`).

**Node / gestor de paquetes:** el repo incluye `package-lock.json` (npm) y `pnpm-workspace.yaml` (workspace mínimo con el paquete raíz `.`). Puedes usar **npm** o **pnpm** según tu entorno; las versiones concretas de dependencias transitivas están resueltas en el lockfile que uses.

---

## 3. Componentes de software (lógicos)

### 3.1 Contenedor de entrega

| Componente | Descripción |
|------------|-------------|
| **Aplicación cliente (SPA)** | HTML único (`index.html`) + bundle JS/CSS generado por Vite. Toda la lógica de negocio visible está en React. |
| **Servidor de desarrollo Vite** | Sirve módulos ES en caliente durante `npm run dev`. Incluye **proxy** `/api` → API Node (ver [§7](#7-principales-ficheros-de-configuración)). No es un backend de producción. |
| **API Node (Express + Prisma)** | Proceso separado (`npm run dev:api`): escucha en **`API_PORT`** o **3001** por defecto, lee `DATABASE_URL` y sirve rutas bajo `/api`. En producción habría que desplegarlo aparte (contenedor, PaaS, etc.) o sustituirlo por otra capa BFF. |
| **Artefacto de producción** | Carpeta `dist/` con assets estáticos listos para desplegar en cualquier hosting estático (CDN, S3, Netlify, etc.). El API no se incluye en `dist/`; requiere despliegue Node propio si se usa en prod. |

### 3.2 Módulos dentro del código fuente

| Componente | Ubicación típica | Propósito |
|------------|------------------|-----------|
| **Punto de entrada (SPA)** | `frontend/src/main.tsx` | Monta React en `#root` e importa estilos globales. |
| **Presentación (vistas)** | `frontend/src/presentation/App.tsx`, `frontend/src/presentation/components/*` | Composición de pantalla; componentes de negocio (cabecera, hábitos, recompensas, modales, **`UserProfileCard`**). |
| **Dominio (frontend)** | `frontend/src/domain/*` | Tipos y lógica pura (hábitos, semana, fixtures) sin dependencias de React ni HTTP. |
| **Casos de uso (frontend)** | `frontend/src/application/*` | Hooks que orquestan estado (`useHabitDashboard`, `useUserProfile`). |
| **Infraestructura (frontend)** | `frontend/src/infrastructure/*` | Cliente HTTP (`profileApi`) y otros adaptadores al exterior. |
| **Servidor API** | `backend/src/main.ts` | Arranque; `PrismaClient`; rutas REST registradas vía `createApp()` en `backend/src/presentation/http/`. |
| **Dominio / aplicación / infra (API)** | `backend/src/domain`, `backend/src/application`, `backend/src/infrastructure` | Caso de uso de perfil, puerto `UserReadRepository`, implementación Prisma. |
| **Kit UI reutilizable** | `frontend/src/presentation/components/ui/*` | Primitivos (botones, diálogos, tablas, etc.) alineados con Radix + Tailwind + CVA. |
| **Utilidades UI** | `frontend/src/presentation/components/ui/utils.ts`, `use-mobile.ts` | Helpers (`cn`, detección móvil). |
| **Figma / diseño** | `frontend/src/presentation/components/media_handler/ImageWithFallback.tsx` | Imagen con fallback (útil si se exporta diseño desde Figma). |
| **Estilos globales** | `frontend/src/styles/*` | Encadenado: fuentes → Tailwind → tema (variables CSS). |
| **OpenSpec (metodología)** | `openspec/config.yaml` | Configuración para flujo spec-driven con IA (propuestas, tareas); no afecta al runtime de la app. |
| **Capa de datos (Prisma)** | `backend/prisma/schema.prisma` | Define el **datasource** PostgreSQL (`DATABASE_URL`), el **generator** `prisma-client-js` y los modelos de dominio actuales (p. ej. `User`, `Calendar`). El cliente se genera con `prisma generate`. |
| **PostgreSQL (Docker)** | `docker-compose.yml` | Servicio `postgres` con volumen persistente; credenciales y nombre de BD vía variables de entorno (ver [§12](#12-base-de-datos-prisma-y-docker)). |

---

## 4. Relación entre componentes

Flujo de **desarrollo**:

1. El desarrollador ejecuta **Vite** (`npm run dev`) y, para datos reales desde PostgreSQL, el **API** (`npm run dev:api`) en otra terminal.
2. El navegador carga `frontend/index.html` (raíz de Vite), que ejecuta `frontend/src/main.tsx` como módulo ES.
3. `main.tsx` renderiza `<App />`, que importa componentes hijos y estilos ya procesados por Tailwind (vía plugin Vite).
4. Las peticiones del cliente a **`/api/*`** las recibe Vite y las **reenvía** al proceso Express (por defecto `http://localhost:3001`), que consulta la BD con Prisma y devuelve JSON.

Flujo de **producción**:

1. `npm run build` genera `dist/`.
2. Un servidor web estático sirve `index.html` y los assets con hash; el cliente ejecuta el mismo grafo de React sin Vite.

**Dependencias de datos (UI):** el estado de hábitos y recompensas sigue siendo **local** al árbol de React bajo `App`. El perfil de usuario en cabecera usa **HTTP** (`fetch('/api/profile')`) cuando el API está en marcha.

**Persistencia y API:** Prisma + PostgreSQL se usan desde **`backend/src`** (repositorio en infraestructura, rutas en presentación HTTP). Para ver el perfil en la UI hace falta **PostgreSQL accesible** (`DATABASE_URL` correcto), un registro **`User`** con `id = 1`, y **`npm run dev:api`** además de **`npm run dev`**.

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

---

## 5. Propósito de cada pieza (para perfiles junior)

- **React**: Encapsula la interfaz en **componentes** y reacciona a cambios de **estado**. Si añades una funcionalidad, lo habitual es crear un componente o ampliar `App` y pasar **props** o **callbacks**.
- **Vite**: Une todos los archivos en algo que el navegador entiende. En desarrollo recarga rápido (**HMR**) y puede **reenviar** rutas `/api` al servidor Express (ver `vite.config.ts`). El API en producción no lo sirve Vite; hay que desplegar Node aparte o un BFF.
- **TypeScript**: Ayuda a detectar errores antes de ejecutar. Los interfaces `Habit` y `Reward` en `App.tsx` definen la forma de los datos.
- **Tailwind**: Estilos como clases en `className`. Evita escribir mucho CSS suelto; consulta la doc de Tailwind v4 para nuevas utilidades.
- **Alias `@/`**: En imports, `@/...` apunta a `frontend/src/...` (configurado en `vite.config.ts` y `tsconfig.json`).
- **Radix + carpeta `ui/`**: Si necesitas un modal, select o tooltip accesible, reutiliza primero lo que ya hay en `components/ui` en lugar de inventar desde cero.
- **Prisma**: El archivo `backend/prisma/schema.prisma` describe tablas y tipos; tras cambiar el esquema, regenera el cliente con `prisma generate`. Las migraciones versionan cambios en la BD; en desarrollo suele usarse `prisma migrate dev` (cuando exista carpeta `migrations`).

---

## 6. Estructura de directorios

```
ConRutina/
├── .cursor/                 # Comandos y skills de Cursor (flujo OpenSpec, etc.)
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
├── docs/                    # Documentación del proyecto (este archivo)
├── openspec/                # Config OpenSpec (spec-driven)
├── dist/                    # Salida de `vite build` (generada; no editar a mano)
├── node_modules/            # Dependencias instaladas
├── docker-compose.yml       # PostgreSQL 16 para desarrollo local
├── package.json
├── package-lock.json
├── pnpm-workspace.yaml
├── postcss.config.mjs       # PostCSS (vacío por defecto; Tailwind va por Vite)
├── tsconfig.json
├── vite.config.ts
├── default_shadcn_theme.css # Referencia de tema (raíz)
└── ATTRIBUTIONS.md
```

---

## 7. Principales ficheros de configuración

| Archivo | Rol |
|---------|-----|
| `package.json` | Scripts, dependencias, metadatos del paquete (`type: "module"` → ESM nativo en Node para scripts). Incluye **`prisma.schema`**: `backend/prisma/schema.prisma`. Scripts **`dev:api`** → `tsx watch backend/src/main.ts`. |
| `vite.config.ts` | `root: frontend/`, plugins (`react`, `tailwindcss`), alias `@` → `./frontend/src`, `assetsInclude` para `.svg` y `.csv`. **`server.proxy`**: prefijo `/api` → `http://localhost:3001` (mismo puerto por defecto que el API; ajusta ambos si cambias `API_PORT`). |
| `tsconfig.json` | `strict`, `jsx: react-jsx`, paths `@/*` → `frontend/src/*`, `include`: `frontend/src` y `backend/src`, `moduleResolution: bundler` (pensado para Vite en el cliente). |
| `postcss.config.mjs` | Placeholder; Tailwind v4 con `@tailwindcss/vite` no requiere aquí `tailwindcss` clásico. |
| `pnpm-workspace.yaml` | Declara el workspace monorepo mínimo (solo el directorio actual). |
| `openspec/config.yaml` | Esquema `spec-driven` y contexto opcional para generación de especificaciones con IA. |
| `frontend/index.html` | Punto de entrada HTML de la SPA; `lang="es"`, título ConRutina (referenciado por Vite vía `root`). |
| `backend/prisma/schema.prisma` | Esquema Prisma: `generator client`, `datasource db` (`provider = postgresql`, `url = env("DATABASE_URL")`), modelos (`User`, `Calendar`, …). |
| `docker-compose.yml` | Servicio `postgres` (imagen `postgres:16-alpine`), variables `POSTGRES_*`, puerto mapeado y volumen `ConRutina2_postgres_data`. |
| `.env` (raíz, no versionar secretos) | Debe incluir al menos **`DATABASE_URL`** para Prisma y el API Node, y para Docker Compose **`POSTGRES_USER`**, **`POSTGRES_PASSWORD`**; opcionalmente **`POSTGRES_DB`** (por defecto `ConRutina2`), **`POSTGRES_PORT`**. Opcional: **`API_PORT`** (puerto del Express; por defecto **3001**; debe coincidir con el `target` del proxy en `vite.config.ts`). |

**Ubicación del esquema Prisma:** el fichero físico está en **`backend/prisma/schema.prisma`**. En **`package.json`** existe el bloque `prisma.schema` apuntando a esa ruta, de modo que `npx prisma generate`, `npm run prisma:generate` y `npm run db:migrate` resuelven el esquema sin flags extra. Si ejecutas la CLI desde otro directorio o sin ese `package.json`, sigue siendo válido **`--schema=backend/prisma/schema.prisma`**.

---

## 8. Comandos para inicializar y trabajar con el proyecto

| Comando | Cuándo usarlo |
|---------|----------------|
| `npm install` | Primera vez o tras cambios en `package.json`; instala dependencias (equiv. `pnpm install` si usas pnpm). |
| `npm run dev` | Arranca Vite en modo desarrollo (URL en consola, suele ser `http://localhost:5173`). |
| `npm run dev:api` | Arranca el **API Express** con **`tsx watch`** sobre `backend/src/main.ts` (recarga al guardar). Requiere **`DATABASE_URL`** y, para el perfil en pantalla, PostgreSQL con un **`User`** `id = 1`. |
| `npm run build` | Genera producción en `dist/`. |
| `npm run build:dev` | Build en modo `development` de Vite (útil para depurar builds). |
| `npm run preview` | Sirve localmente el contenido de `dist/` tras un build. |
| `npm run lint` | Ejecuta `eslint .` — **requiere** tener ESLint instalado/configurado; hoy no figura en `devDependencies`. |
| `npm run test` / `npm run test:watch` | Ejecutan Vitest — **requieren** `vitest` en el proyecto; hoy no está declarado en `devDependencies`. |
| `npm run docker:up` / `docker:down` / `docker:logs` | Levantan / paran el stack definido en **`docker-compose.yml`** y siguen los logs del contenedor **`postgres`**. Requieren `.env` con credenciales (ver [§12](#12-base-de-datos-prisma-y-docker)). |
| `npm run prisma:init` | Plantilla `npx prisma init` (suele usarse una sola vez al crear un proyecto; aquí el esquema ya vive en `backend/prisma/`). |
| `npm run prisma:generate` | `npx prisma generate` — asegúrate de que Prisma resuelva el esquema (bloque `prisma.schema` en `package.json` o `--schema=backend/prisma/schema.prisma`). |
| `npm run db:migrate` | `npx prisma migrate deploy` — aplica migraciones con el esquema resuelto vía `package.json`. |

No existe `npm start` en este proyecto; en desarrollo con datos de perfil desde BD suele usarse **`npm run dev`** y **`npm run dev:api`** en paralelo (dos terminales).

---

## 9. Diagramas C4 (Mermaid)

### 9.1 Nivel C1 — Contexto del sistema

Muestra ConRutina en relación con el usuario y el entorno de ejecución.

```mermaid
C4Context
    title Diagrama de contexto (C1) — ConRutina

    Person(usuario, "Usuario", "Gestiona hábitos y recompensas en el navegador")
    System(ConRutina, "ConRutina", "Aplicación web SPA (React + Vite)")
    System_Ext(browser, "Navegador web", "Ejecuta JavaScript y renderiza la UI")

    Rel(usuario, browser, "Usa")
    Rel(browser, ConRutina, "Carga y ejecuta")
```

> **Nota:** La sintaxis `C4Context` requiere soporte Mermaid con diagramas C4 (p. ej. Mermaid ≥ 9.4 con `c4` habilitado). Si tu visor solo soporta diagramas clásicos, usa la versión alternativa siguiente.

**Alternativa (flowchart estilo contexto):**

```mermaid
flowchart TB
    User([Usuario])
    Browser[Navegador web]
    App[ConRutina SPA]

    User -->|interactúa| Browser
    Browser -->|descarga y ejecuta| App
```

### 9.2 Nivel C2 — Contenedores

```mermaid
C4Container
    title Diagrama de contenedores (C2) — ConRutina

    Person(usuario, "Usuario", "Usuario final")

    Container_Boundary(spa, "Aplicación ConRutina") {
        Container(ui, "Interfaz React", "TypeScript, React 18", "Pantallas, estado en cliente, fetch /api en dev")
        Container(static_assets, "Assets estáticos", "HTML, JS, CSS", "Servidos en producción")
        Container(api, "API Node (Express)", "TypeScript, Prisma", "Rutas REST /api; desarrollo: tsx")
    }

    System_Ext(vite_dev, "Vite (solo desarrollo)", "Servidor de desarrollo, HMR y proxy /api")
    System_Ext(hosting, "Hosting estático", "CDN / servidor web en producción")
    ContainerDb(db, "PostgreSQL (local Docker u otro)", "Motor relacional", "Persistencia vía Prisma desde el API")

    Rel(usuario, ui, "Usa vía navegador")
    Rel(vite_dev, ui, "Sirve módulos en desarrollo")
    Rel(vite_dev, api, "Proxy /api en desarrollo")
    Rel(api, db, "PrismaClient + DATABASE_URL")
    Rel(hosting, static_assets, "Sirve en producción")
    Rel(ui, static_assets, "Empaquetado en build")
    Rel(ui, api, "HTTP /api (directo o vía proxy Vite)")
```

**Alternativa (flowchart):**

```mermaid
flowchart TB
    User([Usuario])

    subgraph dev["Entorno desarrollo"]
      Vite[Vite dev server]
      ApiDev[Express API]
      Vite -->|proxy /api| ApiDev
    end

    subgraph runtime["Ejecución en navegador"]
      ReactApp[SPA React]
    end

    subgraph prod["Entorno producción"]
      Host[Hosting estático]
      Dist[dist/ HTML+JS+CSS]
      ApiProd[API Node desplegado]
    end

    PG[(PostgreSQL)]

    User --> ReactApp
    Vite -->|HMR y módulos ES| ReactApp
    ReactApp -->|fetch /api| Vite
    ApiDev --> PG
    Host --> Dist
    User -->|navega| Dist
    Dist --> ReactApp
    ReactApp -.->|opcional prod| ApiProd
    ApiProd --> PG
```

---

## 10. Guía rápida para añadir funcionalidades (junior)

1. **Localiza el estado y la lógica:** La lógica de hábitos/recompensas vive en **`frontend/src/domain`** (puro) y **`frontend/src/application`** (hooks como `useHabitDashboard`). Para datos de servidor, el flujo es **infraestructura** (`profileApi`) + **aplicación** (`useUserProfile`) + **presentación** (`UserProfileCard`). Nuevas rutas API: añádelas en **`backend/src/presentation/http`** y casos de uso en **`backend/src/application`**, con persistencia en **`backend/src/infrastructure`**.
2. **Nuevo componente de pantalla:** Colócalo en `frontend/src/presentation/components/`, impórtalo en `App.tsx` (o en la vista que corresponda) y pasa solo las props necesarias.
3. **Reutiliza `ui/`:** Para modales y controles complejos, mira primero `frontend/src/presentation/components/ui/` antes de instalar otra librería.
4. **Estilos:** Prefiere utilidades Tailwind y variables de `theme.css` para mantener coherencia con el kit existente.
5. **Rutas:** `react-router` ya está en dependencias; si añades varias pantallas, configura el router en `main.tsx` o `App.tsx` y divide vistas.
6. **Persistencia:** En la SPA los datos de hábitos/recompensas siguen en memoria y se pierden al recargar. Los datos de **usuario en BD** ya pueden leerse vía el **API** (`GET /api/profile`). Para más entidades, amplía el esquema Prisma, añade casos de uso y rutas en **`backend/src`** (presentación HTTP + infraestructura) y consume desde React con las mismas URLs `/api/...`.
7. **Pruebas:** Antes de usar `npm run test`, añade `vitest` (y opcionalmente `@testing-library/react`) como `devDependency` y un `vitest.config.ts` si lo necesitas.
8. **OpenSpec:** Si el equipo usa el flujo de especificaciones en `.cursor/skills`, alinea cambios grandes con propuestas/tareas en `openspec/` para mantener trazabilidad.

---

## 11. Notas y advertencias

- **Peer dependencies:** `react` y `react-dom` están como `peerDependencies` con `optional: true` en `package.json`; npm los instala en la práctica (aparecen en `package-lock.json`). Verifica siempre que existan en `node_modules` tras un install limpio.
- **Override pnpm:** El bloque `pnpm.overrides` fija `vite` a **6.3.5**; con **npm** ese bloque no aplica. La versión efectiva con npm es la de `dependencies`/`devDependencies` y el lockfile (**6.4.2**).
- **`frontend/src/styles/fonts.css`:** `index.css` lo importa primero; si tu entorno de build exige que el fichero exista y no está en el repo, añade `frontend/src/styles/fonts.css` (puede estar vacío o con reglas `@font-face`).
- **Scripts que aún pueden fallar:** `lint` y `test*` dependen de tener ESLint / Vitest configurados en el proyecto. Los comandos **`prisma:*`** y **`db:migrate`** requieren que Prisma resuelva el esquema: en este repo está configurado con **`prisma.schema`** en `package.json`; si copias solo partes del proyecto, conserva ese bloque o pasa **`--schema=backend/prisma/schema.prisma`**.
- **Perfil en pantalla:** Si solo ejecutas **`npm run dev`**, las peticiones a `/api/profile` fallarán (proxy sin destino o error de red). Arranca también **`npm run dev:api`** y comprueba **`DATABASE_URL`** y que exista **`User`** con `id = 1`.
- **Librerías instaladas no usadas en la vista principal:** Radix, MUI, carruseles, DnD, gráficos y otras filas del [§2](#2-stack-tecnológico) preparan pantallas o extensiones futuras; `express`/`cors`/`dotenv` están **en uso** en el API Node descrito en [§3.1](#31-contenedor-de-entrega).

---

## 12. Base de datos, Prisma y Docker

### 12.1 Esquema Prisma (`backend/prisma/schema.prisma`)

| Pieza | Valor |
|--------|--------|
| **Generator** | `prisma-client-js` |
| **Datasource** | `provider = "postgresql"`, URL desde `env("DATABASE_URL")` |
| **Modelo `User`** | `id` (Int, autoincrement, PK), `email` (único), `name` opcional |
| **Modelo `Calendar`** | Identificador autoincremental; campos de perfil/CV (`firstName`, `lastName`, `email` único, `phone`, `address`, resúmenes en texto, metadatos de fichero CV, `createdAt` / `updatedAt` con `@default(now())` y `@updatedAt`) |

Cualquier cambio en modelos requiere **migración** en la base real y **`npm run prisma:generate`** (o `npx prisma generate` con el esquema correcto) para actualizar el cliente TypeScript.

### 12.2 Docker Compose (PostgreSQL local)

| Variable / clave | Uso |
|------------------|-----|
| `POSTGRES_USER` | Usuario de la instancia (obligatorio en `.env` para `docker compose`) |
| `POSTGRES_PASSWORD` | Contraseña (obligatorio) |
| `POSTGRES_DB` | Nombre de la base; por defecto **`ConRutina2`** si no se define |
| `POSTGRES_PORT` | Puerto en el host; por defecto **5432** |
| Contenedor | Nombre sugerido: **`ConRutina2-postgres`** |
| Volumen | **`ConRutina2_postgres_data`** (persistencia de datos entre reinicios) |

**`DATABASE_URL`** en `.env` debe apuntar al mismo usuario, contraseña, host (p. ej. `localhost`), puerto y base que uses en Docker, con el formato estándar de PostgreSQL, por ejemplo:

`postgresql://USUARIO:CONTRASEÑA@localhost:PUERTO/NOMBRE_BD`

### 12.3 Comandos Prisma típicos (desde la raíz del repo)

Con **`prisma.schema`** en `package.json`, los comandos siguientes funcionan **sin** `--schema`. Si ejecutas Prisma fuera de la raíz del paquete o sin ese bloque, añade **`--schema=backend/prisma/schema.prisma`**.

| Objetivo | Comando de referencia |
|----------|------------------------|
| Validar esquema | `npx prisma validate` |
| Generar cliente | `npx prisma generate` o `npm run prisma:generate` |
| Crear/aplicar migraciones en desarrollo | `npx prisma migrate dev` |
| Aplicar migraciones en despliegue (CI/prod) | `npm run db:migrate` (equivale a `npx prisma migrate deploy`) |

Orden habitual en un entorno nuevo: definir `.env` → `docker compose up -d` → `prisma migrate dev` (primera migración) → `prisma generate`.

### 12.4 API HTTP (Express) y conexión a la base

| Elemento | Descripción |
|----------|-------------|
| **Código** | Entrada [`backend/src/main.ts`](../backend/src/main.ts); composición HTTP [`backend/src/presentation/http/createApp.ts`](../backend/src/presentation/http/createApp.ts) — Express en TypeScript, ESM (`"type": "module"` en `package.json`). |
| **Arranque en desarrollo** | `npm run dev:api` — usa **`tsx watch`** sobre `backend/src/main.ts` para ejecutar y recargar el servidor al guardar cambios. |
| **Puerto** | Variable de entorno **`API_PORT`**; si no está definida, **3001**. Debe coincidir con el **`target`** del `server.proxy` de Vite para que el proxy de desarrollo funcione. |
| **Variables de entorno** | **`DATABASE_URL`**: misma cadena que usa Prisma CLI; el `PrismaClient` del API se conecta a PostgreSQL con ella. **`dotenv`** carga `.env` al iniciar el proceso Node. |
| **CORS** | Origen permitido **`http://localhost:5173`** (ajusta si cambias host/puerto de Vite). |
| **Rutas actuales** | **`GET /api/profile`**: lee el modelo **`User`** con **`id = 1`**; responde JSON `{ id, name, email }` o **404** si no existe. Pensado como perfil de sesión simulado para la tarjeta **`UserProfileCard`** en la cabecera de la SPA. |
| **Convención de tabla** | El modelo Prisma `User` mapea por defecto a la tabla **`User`** en PostgreSQL (nombre reservado, suele ir entre comillas en SQL). Si tu tabla se llama distinto (p. ej. `Users`), usa **`@@map`** en el esquema o alinea el nombre en la BD. |
| **Producción** | El **`vite build`** no empaqueta el API. Despliega un proceso Node (o contenedor) que ejecute el mismo punto de entrada (tras compilar con `tsc` o ejecutar con `tsx`/`node` según tu pipeline) y configura el frontend para llamar a la URL base real del API (o mantén un reverse proxy que unifique `/api`). |

---

*Documento generado a partir del estado del repositorio. Actualízalo cuando cambien dependencias, rutas del API, despliegue o se añadan pipelines CI/CD.*
