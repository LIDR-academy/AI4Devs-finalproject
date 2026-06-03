# Guía de desarrollo — ConRutina

Guía paso a paso para configurar el entorno de desarrollo y ejecutar la aplicación de seguimiento de hábitos ConRutina.

## Instalación y puesta en marcha

### Requisitos previos

- **Node.js** (v16 o superior recomendado)
- **npm** (v8 o superior) o **pnpm**
- **Docker** y **Docker Compose**
- **Git**

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd ConRutina
```

### 2. Configuración del entorno

La fuente canónica de variables es **`.env.example`** en la raíz del monorepo. Copia la plantilla a `.env` antes de levantar Docker o el API:

```bash
cp .env.example .env
```

En Windows:

```bash
copy .env.example .env
```

Revisa y, si hace falta, ajusta los valores en `.env`. La plantilla incluye las ocho variables del proyecto con comentarios de una línea; por ejemplo:

```env
DATABASE_URL=postgresql://conrutina:conrutina_dev_pass@localhost:5432/conrutina
API_PORT=3001
CORS_ORIGIN=http://localhost:5173
POSTGRES_USER=conrutina
POSTGRES_PASSWORD=conrutina_dev_pass
POSTGRES_DB=conrutina
POSTGRES_PORT=5432
NODE_ENV=development
```

**Notas importantes:**
- `DATABASE_URL` debe coincidir con las credenciales `POSTGRES_*` y el puerto `POSTGRES_PORT`
- `API_PORT` por defecto es **3001** si no se define
- Vite sirve el frontend en **5173** por defecto
- No subas `.env` al repositorio (ya está en `.gitignore`); `.env.example` sí está versionado

### 3. Instalar dependencias

```bash
npm install
```

El proyecto usa un monorepo mínimo: el `package.json` raíz gestiona frontend y backend.

### 4. Base de datos (PostgreSQL con Docker)

```bash
# Levantar PostgreSQL (comando canónico)
npm run db:up

# Detener PostgreSQL (conserva el volumen)
npm run db:down

# Comprobar que está en marcha
docker compose ps

# Ver logs
npm run docker:logs
```

Los scripts `docker:up` / `docker:down` son alias retrocompatibles de `db:up` / `db:down`.

PostgreSQL quedará disponible en:
- **Servicio Compose:** `db` (contenedor `conrutina-db`)
- **Host:** `localhost`
- **Puerto:** `5432` (o el valor de `POSTGRES_PORT` en `.env`)
- **Base de datos:** según `POSTGRES_DB` en `.env` (ver `.env.example`)
- **Usuario y contraseña:** según `POSTGRES_USER` y `POSTGRES_PASSWORD` en `.env`
- **Volumen:** `ConRutina_postgres_data`

**Migración desde volumen anterior:** si ya tenías datos en el volumen `conrutina_postgres_data`, el nuevo nombre es `ConRutina_postgres_data`. Puedes listar volúmenes con `docker volume ls` y, en desarrollo, recrear la BD o copiar datos manualmente si lo necesitas.

Si quedó el contenedor antiguo `conrutina-postgres` ocupando el puerto, ejecuta una vez `docker compose down --remove-orphans` antes de `npm run db:up`.

### 5. Migraciones de base de datos

```bash
# Validar esquema (sin aplicar migraciones)
npx prisma validate

# Crear y aplicar migración en desarrollo (p. ej. primera migración init)
npx prisma migrate dev --name init

# Generar cliente Prisma (tras cambios en el esquema o migración)
npm run prisma:generate

# Aplicar migraciones existentes (clones frescos, CI, tras pull)
npm run db:migrate

# Reset completo (borra datos, reaplica migraciones y ejecuta seed automáticamente)
npx prisma migrate reset

# Re-sembrar sin reset (idempotente)
npm run db:seed
```

**Esquema Prisma:** `backend/prisma/schema.prisma`  
**Seed de desarrollo:** `backend/prisma/seed.ts` (usuario demo, hábitos, semana activa, recompensas)  
**Migraciones versionadas:** `backend/prisma/migrations/` (p. ej. `20260530120258_init/migration.sql`)

El bloque `prisma` en `package.json` define `schema` y `seed` para la CLI sin rutas extra. Tras clonar el repo:

```bash
npm run db:up
npm run db:migrate
npm run prisma:generate
npm run db:seed
```

### 6. Datos iniciales

El seed de desarrollo (`npm run db:seed`) inserta datos deterministas e idempotentes:

- **Usuario:** `id = 1`, `email = "demo@ConRutina.app"`, `name = "Demo User"`
- **Hábitos:** Correr, Meditar, Leer (3 registros)
- **Semana activa:** lunes–domingo de la semana en curso, con 3 `WeekHabit` y 21 `HabitEntry` (`pending`)
- **Recompensas:** Tarde libre (50 pts), Cena especial (80 pts)

```bash
npm run db:seed
```

Para inspeccionar o depurar datos:

```bash
npx prisma studio
```

Tras `npx prisma migrate reset`, el seed se ejecuta automáticamente al final del reset.

### 7. Arrancar servidores de desarrollo

Desde la **raíz**, un solo comando levanta frontend y API en paralelo:

```bash
npm run dev
```

Salida esperada en consola (prefijos `web` y `api` de `concurrently`):

```
[web]   VITE v6.x  ready in ... ms
[web]   ➜  Local:   http://localhost:5173/
[api]   [API] PostgreSQL → base de datos: conrutina
[api]   Server running on port 3001
```

**Atajos** (si solo necesitas un proceso):

```bash
npm run dev:web   # Solo Vite → http://localhost:5173
npm run dev:api   # Solo API → http://localhost:3001
npm run api       # Alias de dev:api (mismo entrypoint)
```

**Smoke test del API** (con el servidor en marcha):

```bash
curl -s http://localhost:3001/health
# Esperado: {"status":"ok","timestamp":"<ISO-8601>"}
```

### 8. Acceder a la aplicación

Abre en el navegador:

```
http://localhost:5173
```

Deberías ver:
- Tarjeta de perfil en la cabecera (datos del API)
- Calendario semanal de hábitos
- Sección de recompensas
- Panel de estadísticas

**Si el perfil no carga:**
1. Comprueba que el API está en el puerto 3001
2. PostgreSQL accesible (`npm run db:up`)
3. Migraciones aplicadas (`npm run db:migrate`)
4. Seed ejecutado (`npm run db:seed`) — debe existir `User` con `id = 1`

## Estructura del proyecto

```
ConRutina/
├── backend/                 # API Express + Prisma
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   ├── main.ts
│   │   └── loadEnv.ts
│   └── prisma/
│       └── schema.prisma
├── frontend/                # SPA React + Vite
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── presentation/
│   │   ├── styles/
│   │   └── main.tsx
│   ├── index.html
│   └── tsconfig.json        # Extiende tsconfig raíz (JSX, DOM)
├── backend/
│   └── tsconfig.json        # Extiende tsconfig raíz (ES2022, Node/tsx)
├── docs/
├── docker-compose.yml
├── package.json
├── tsconfig.json            # Base compartida: strict, paths @/*, references
├── vite.config.ts           # Alias @ → frontend/src (alineado con paths TS)
└── .env
```

### Configuración TypeScript

El monorepo usa tres ficheros `tsconfig.json`:

| Fichero | Rol |
| ------- | --- |
| `tsconfig.json` (raíz) | Opciones compartidas: `strict`, `esModuleInterop`, `moduleResolution: bundler`, alias `@/*` → `frontend/src/*`, `references` a frontend y backend. Sin `include` de código. |
| `frontend/tsconfig.json` | Extiende la raíz; `jsx: react-jsx`, `include: src/**/*`. |
| `backend/tsconfig.json` | Extiende la raíz; `target: ES2022`, `module: ESNext`, `include: src/**/*`. |

Comprobación de tipos sin emitir JavaScript:

```bash
npm run typecheck
```

Equivalente manual: `tsc --noEmit -p frontend/tsconfig.json && tsc --noEmit -p backend/tsconfig.json`.

### Estilos globales (Tailwind v4)

La SPA carga estilos desde `frontend/src/main.tsx`, que importa `./styles/index.css`. Ese fichero orquesta la cadena:

```
index.css → tailwind.css → theme.css
         ↘ fonts.css
```

- `tailwind.css`: `@import 'tailwindcss'` y `@source` para escanear componentes.
- `theme.css`: variables `:root` ConRutina (`--color-*`) y `@theme inline` para utilidades Tailwind.

Ver [frontend-standards.md](./frontend-standards.md) para la paleta completa.

### Componentes shadcn/ui (T-05-03)

El monorepo incluye `components.json` en la raíz con la convención shadcn CLI:

- **CSS Tailwind:** `frontend/src/styles/tailwind.css`
- **Primitivos UI:** `frontend/src/presentation/components/ui/`
- **Alias `@`:** resuelve a `frontend/src` (ver `vite.config.ts`)

Para añadir un primitivo nuevo desde la raíz del proyecto:

```bash
npx shadcn@latest add button --overwrite
```

Los ocho primitivos del DoD T-05-03 (`button`, `dialog`, `input`, `label`, `card`, `progress`, `badge`, `sonner`) ya están presentes. `<Toaster />` se monta en `App.tsx` para toasts globales vía `toast()` de la librería `sonner`.

## Pruebas

### Backend (previsto)

```bash
npm test
npm run test:watch
npm run test:coverage
```

*(Vitest aún no configurado; ver [backend-standards.md](./backend-standards.md).)*

### Frontend (previsto)

```bash
npm test
```

E2E con Playwright MCP cuando aplique (ver [openspec-tasks-mandatory-steps.md](./openspec-tasks-mandatory-steps.md)).

## Comandos habituales

### Base de datos

```bash
npm run prisma:generate
npx prisma migrate dev --name add_habit_model
npm run db:migrate
npx prisma studio
npx prisma migrate reset   # ¡Borra datos!
```

### Docker

```bash
npm run db:up              # Levantar PostgreSQL (canónico)
npm run db:down            # Detener PostgreSQL
npm run docker:up          # Alias de db:up
npm run docker:down        # Alias de db:down
npm run docker:logs        # Logs del servicio db
docker compose down -v     # Elimina contenedor y volumen ConRutina_postgres_data
```

### Desarrollo

```bash
npm install
npm run dev                # Frontend + API en paralelo
npm run dev:web            # Solo frontend (Vite)
npm run dev:api            # Solo backend (Express)
npm run api                # Alias de dev:api (tsx watch backend/src/main.ts)
npm run build              # Build producción → dist/
npm run preview
npm run typecheck          # tsc --noEmit (frontend + backend)
npm run lint               # ESLint sobre frontend/src y backend/src
npm run format             # Prettier (formateo in-place)
npm run format:check       # Prettier sin escribir (útil en CI)
```

## Solución de problemas

### Puerto en uso

**Error:** `EADDRINUSE` en 3001 o 5173

**Solución (Windows):**
```bash
netstat -ano | findstr :3001
taskkill /PID <PID> /F

netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

O ajusta `API_PORT` en `.env` y el `target` del proxy en `vite.config.ts`.

### Error de conexión a la base de datos

**Error:** `P1001: Can't reach database server`

1. `docker compose ps` — Docker en marcha
2. `npm run db:up`
3. Revisa `DATABASE_URL` en `.env`
4. `docker logs conrutina-db`

### Perfil de usuario 404

1. `npm run dev:api` en ejecución
2. Usuario `id = 1` en la BD
3. Crear usuario (paso 6)
4. Consola del navegador y CORS

### Cliente Prisma no encontrado

```bash
npm run prisma:generate
# Si persiste:
rm -rf node_modules package-lock.json
npm install
npm run prisma:generate
```

### Hot reload no funciona

- Frontend: guarda el fichero y revisa la consola de Vite
- Backend: `tsx watch` debería recargar; busca errores de sintaxis
- Reinicia ambos servidores
- Recarga forzada del navegador (Ctrl+Shift+R)

## Flujo de trabajo

### Realizar cambios

1. Actualizar `develop`: `git checkout develop` y `git pull origin develop`
2. Crear rama de feature desde `develop`: `git checkout -b feature/[ticket-id]-[ticket-name]` (p. ej. `feature/T-13-01-habit-domain-types`) si esta no existe.
3. Implementar el cambio **solo** en esa rama (sin commits durante la implementación).
4. Respeta Clean Architecture (dominio → aplicación → infraestructura → presentación)
5. Verifica la app, TypeScript y endpoints con curl si tocas el API
6. Tras pasar pruebas obligatorias y **aceptación del usuario** (OpenSpec `/opsx:archive`): commit único con mensaje en **viñetas breves** en español, **push de la rama feature al remoto** (`git push -u origin feature/...`), merge en `develop` (`git checkout develop` → `git pull origin develop` → `git merge feature/...`)
7. Push de `develop` al remoto si el flujo del equipo lo requiere: `git push origin develop`

Detalle completo del flujo Git con OpenSpec: [openspec-tasks-mandatory-steps.md](./openspec-tasks-mandatory-steps.md).

### Flujo OpenSpec (desde el product backlog)

Procesar **un ticket a la vez**, en orden de sprint según [product-backlog.md](./product-backlog.md):

1. **Especificar:** `/opsx-propose-ticket T-XX-YY` — genera `proposal.md`, `specs/`, `design.md` y `tasks.md` en `openspec/changes/t-xx-yy-nombre/`. Configuración en `openspec/config.yaml`.
2. **Revisar** artefactos (alcance = DoD del ticket, Paso 0 con rama `feature/T-XX-YY-nombre`).
3. **Implementar:** `/opsx:apply t-xx-yy-nombre` — código en la rama de feature **sin commits**, pruebas obligatorias ejecutadas por el agente.
4. **Revisar** cambios en el working tree; el usuario acepta o pide ajustes.
5. **Archivar:** `/opsx:archive t-xx-yy-nombre` — commit único, push de la rama feature, merge a `develop`, mover change a `openspec/changes/archive/` e intentar marcar el ticket ✅ en `docs/product-backlog.md` (`npm run openspec:mark-ticket`; si falla, el change queda terminado igualmente).

Ejemplo para el primer ticket del Sprint 0:

```
/opsx-propose-ticket T-01-01
/opsx:apply t-01-01-init-monorepo
/opsx:archive t-01-01-init-monorepo
```

### Calidad de código (ESLint y Prettier)

Configuración centralizada en la raíz del monorepo:

| Fichero | Ámbito |
| ------- | ------ |
| `eslint.config.mjs` | Flat config ESLint 9: bloque TS recomendado, React en `frontend/src`, globals Node en `backend/src` |
| `.prettierrc` | `singleQuote: true`, `semi: false`, `tabWidth: 2`, `trailingComma: es5`, `printWidth: 100` |
| `.prettierignore` | `node_modules`, `dist`, `coverage`, `backend/prisma/migrations` |
| `.editorconfig` | UTF-8, LF, indentación 2 espacios en ficheros de código |

Comandos habituales:

```bash
npm run lint          # Analiza frontend/src y backend/src
npm run format        # Formatea con Prettier
npm run format:check  # Solo comprueba formato (CI)
```

ESLint no usa reglas type-aware (`parserOptions.project`); errores de tipos se detectan con `npm run typecheck`. ESLint sí detecta errores de sintaxis/parsing (US-01 Scenario 3).

### Convenciones de código

- **UI y textos visibles al usuario:** español
- **Código (identificadores, tipos):** inglés (convención del stack TypeScript)
- **TypeScript:** modo estricto, evitar `any`; ejecutar `npm run typecheck` antes de abrir PR
- **ESLint y Prettier:** configuración en la raíz del monorepo (`eslint.config.mjs`, `.prettierrc`, `.editorconfig`). Ejecutar `npm run lint` y, si aplica, `npm run format` antes de abrir PR.
- **Arquitectura:** Clean Architecture en frontend y backend
- **Documentación técnica:** español (esta carpeta `docs/`)

## Despliegue (futuro)

1. **Frontend:** `npm run build` → `dist/` en hosting estático
2. **Backend:** proceso Node aparte (PM2, contenedor, PaaS)
3. **BD:** PostgreSQL gestionado + `npm run db:migrate`
4. **Proxy:** unificar `/api` en producción o configurar URL base del API

---

*Documentación relacionada:*
- [Estándares backend](./backend-standards.md)
- [Estándares frontend](./frontend-standards.md)
- [Especificación API](./api-spec.yml)
- [Modelo de datos](./data-model.md)
- [Infraestructura](./infrastructure.md)
