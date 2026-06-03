# ConRutina

Aplicación web para seguimiento de hábitos y recompensas: interfaz en **React** (SPA con **Vite**) y un **API HTTP** en **Node** (**Express** + **Prisma**) que puede leer el perfil de usuario desde **PostgreSQL**. El tablero de hábitos y recompensas se gestiona principalmente en el cliente; el backend expone hoy `**GET /api/profile`\*\* para datos de perfil persistidos.

## Tabla de contenidos

- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Configuración](#configuración)
- [Scripts disponibles](#scripts-disponibles)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Contribución](#contribución)
- [Licencia](#licencia)

## Instalación

### Requisitos previos

- **Node.js** (versión recomendada no está fijada en el repositorio; usa una LTS reciente compatible con Vite 6 y Prisma 5).
- **npm** (hay `package-lock.json` en la raíz) o **pnpm** (existe `pnpm-workspace.yaml`).
- **Docker** y **Docker Compose** (opcional pero recomendable para PostgreSQL local).

### Pasos

1. Clona el repositorio y sitúate en la raíz del proyecto.
2. Instala dependencias (**raíz**):

```bash
npm install
```

3. Copia la plantilla de entorno en la raíz (no versiones el `.env` real):

```bash
cp .env.example .env
```

En Windows (PowerShell o CMD):

```bash
copy .env.example .env
```

Consulta [Configuración](#configuración) para el detalle de cada variable.
4. (Opcional) Levanta PostgreSQL con Docker (**raíz**):

```bash
npm run db:up
```

o

```bash
docker compose up -d db
```

El volumen persistente se llama **`ConRutina_postgres_data`**; los datos se conservan entre reinicios del contenedor.

5. Genera el cliente de Prisma (sólo la primera vez) (**raíz**; el esquema está en `backend/prisma/schema.prisma` y se resuelve desde la raíz gracias a `package.json`):

```bash
npm run prisma:generate
```

o

```bash
npx prisma db push
```

Aplica el esquema a la base de datos según tu flujo habitual con Prisma (por ejemplo `npx prisma migrate dev` si trabajas con migraciones locales). En el repositorio **no hay carpeta de migraciones versionada** en el momento de redactar este README; si falta, créala con Prisma según tu entorno.

6. Parada de PostgreSQL con Docker (**raíz**):

```bash
npm run db:down
```

o

```bash
docker compose stop db
```

## Uso

### Desarrollo (frontend + API)

Un solo comando desde la **raíz** levanta la SPA (Vite, puerto **5173**) y el API Express (puerto **3001** o `API_PORT`) en paralelo:

```bash
npm run dev
```

Abre en el navegador `http://localhost:5173` (o la URL que indique la consola).

**Requisitos para el perfil de usuario y el API:**

1. PostgreSQL accesible y `DATABASE_URL` válida en `.env`.
2. Un registro `User` con `id = 1` en la base (es lo que usa el caso de uso actual del API).

Consulta [Instalación](#instalación) para Docker, Prisma y variables de entorno.

### Atajos de desarrollo parcial

Si solo necesitas uno de los procesos:

```bash
npm run dev:web   # Solo frontend (Vite)
npm run dev:api   # Solo backend (Express + recarga con tsx watch)
```

El API escucha por defecto en `http://localhost:3001`. Vite reenvía las peticiones que empiezan por `/api` a ese origen (ver `vite.config.ts`).

### Ejemplos básicos

- Probar el API directamente (con el servidor en marcha):

```bash
curl http://localhost:3001/api/profile
```

- Vista previa del build estático de la SPA (**raíz**):

```bash
npm run build
npm run preview
```

> ⚠️ Información no disponible: no hay en el repositorio un procedimiento documentado de despliegue a producción para el API Node; el `build` de Vite genera estáticos en `dist/`, que pueden servirse desde un hosting estático, pero el API requiere un despliegue Node aparte si lo usas en producción.

## Estructura del proyecto

| Ruta                 | Descripción                                                                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/`          | Raíz de la SPA para Vite (`index.html`, `src/`). Presentación (`presentation/`), dominio (`domain/`), casos de uso vía hooks (`application/`), adaptadores HTTP (`infrastructure/`).    |
| `backend/src/`       | API Express: arranque en `main.ts`, composición HTTP en `presentation/http/createApp.ts`, casos de uso en `application/`, puertos en `application/ports/`, Prisma en `infrastructure/`. |
| `backend/prisma/`    | Esquema Prisma (`schema.prisma`): modelos como `User` y `Calendar`, datasource PostgreSQL.                                                                                              |
| `docker-compose.yml` | Servicio **`db`** (PostgreSQL 16 Alpine) con volumen persistente `ConRutina_postgres_data`.                                                                                                                            |
| `vite.config.ts`     | Configuración de Vite: `root` en `frontend/`, alias `@` → `frontend/src`, proxy `/api` → `http://localhost:3001`.                                                                       |
| `docs/`              | Documentación adicional; `docs/infrastructure.md` amplía arquitectura y stack.                                                                                                          |
| `openspec/`          | Configuración OpenSpec (`config.yaml`); no forma parte del runtime de la aplicación.                                                                                                    |

## Configuración

La fuente canónica de variables es **`.env.example`** en la raíz. Copia ese fichero a **`.env`** (no versionado) antes de arrancar servicios; el API lo carga vía `backend/src/loadEnv.ts`.

Variables habituales:

| Variable            | Uso                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`      | Cadena de conexión **PostgreSQL** para Prisma y el `PrismaClient` del API. Obligatoria para el API con base de datos.                            |
| `POSTGRES_USER`     | Usuario de la instancia en Docker Compose.                                                                                                       |
| `POSTGRES_PASSWORD` | Contraseña de la instancia en Docker Compose.                                                                                                    |
| `POSTGRES_DB`       | Nombre de la base en el contenedor (ver `.env.example`).                                                                                      |
| `POSTGRES_PORT`     | Puerto en el host; por defecto **5432**.                                                                                                         |
| `API_PORT`          | Puerto del API Express; por defecto **3001**. Si lo cambias, ajusta también el `server.proxy` de `vite.config.ts` para que el `target` coincida. |
| `CORS_ORIGIN`       | Origen permitido para CORS en desarrollo; por defecto **`http://localhost:5173`**. |
| `NODE_ENV`          | Entorno Node (`development`, `production`, `test`); por defecto **`development`**. |

Los valores de ejemplo y comentarios de cada clave están en **`.env.example`**.

## Scripts disponibles

| Comando                   | Descripción                                                             |
| ------------------------- | ----------------------------------------------------------------------- |
| `npm run dev`             | Frontend (Vite) y API (Express) en paralelo con `concurrently`.         |
| `npm run dev:web`         | Solo servidor de desarrollo Vite (SPA).                                 |
| `npm run dev:api`         | Solo API Express con recarga (`tsx watch` sobre `backend/src/main.ts`). |
| `npm run build`           | Build de producción de la SPA → `dist/`.                                |
| `npm run typecheck`       | Comprobación de tipos (`tsc --noEmit`) en frontend y backend.           |
| `npm run build:dev`       | Build en modo development.                                              |
| `npm run preview`         | Sirve el contenido de `dist/` localmente.                               |
| `npm run lint`            | ESLint sobre `frontend/src` y `backend/src`.                            |
| `npm run format`          | Formatea código con Prettier (TS/TSX/CSS, JSON, MD, MJS).             |
| `npm run format:check`    | Comprueba formato Prettier sin modificar ficheros.                      |
| `npm run test`            | Ejecuta Vitest una vez (`vitest run`).                                  |
| `npm run test:watch`      | Vitest en modo observación.                                             |
| `npm run db:up`           | `docker compose up -d db` — levanta PostgreSQL (comando canónico).      |
| `npm run db:down`         | `docker compose stop db` — detiene PostgreSQL sin eliminar el volumen.  |
| `npm run docker:up`       | Alias de `db:up`.                                                       |
| `npm run docker:down`     | Alias de `db:down`.                                                     |
| `npm run docker:logs`     | Logs del servicio `db`.                                                 |
| `npm run prisma:init`     | `npx prisma init`.                                                      |
| `npm run prisma:generate` | `npx prisma generate`.                                                  |
| `npm run db:migrate`      | `npx prisma migrate deploy`.                                            |

### Calidad de código (ESLint y Prettier)

| Fichero              | Propósito                                              |
| -------------------- | ------------------------------------------------------ |
| `eslint.config.mjs`  | ESLint 9 flat config: TypeScript + React (frontend) y Node (backend) |
| `.prettierrc`        | `singleQuote`, `semi: false`, `tabWidth: 2`, `printWidth: 100` |
| `.prettierignore`    | Excluye `node_modules`, `dist`, migraciones Prisma     |
| `.editorconfig`      | Indentación, charset UTF-8 y fin de línea LF           |

> ⚠️ El script `test` requiere Vitest configurado; puede fallar hasta que se añada en un ticket futuro.

## Tecnologías utilizadas

- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS 4, Radix UI, componentes tipo shadcn, Motion, Recharts, Sonner, date-fns, entre otras dependencias listadas en `package.json`.
- **Backend:** Node.js, Express, CORS, Prisma 5, `@prisma/client`, `tsx` (desarrollo).
- **Base de datos:** PostgreSQL 16 (imagen Docker oficial Alpine).

## Contribución

1. Crea una rama a partir de la rama principal del repositorio.
2. Realiza cambios acotados y con mensajes de commit claros.
3. Abre un pull request describiendo el propósito del cambio y cómo probarlo (por ejemplo: `npm run dev` con PostgreSQL y `.env` configurados).

Si el proyecto adopta más adelante guías formales (estilo de código, convenciones de commits, plantillas de PR), enlázalas aquí cuando existan en el repositorio.

## Licencia

Derechos de autor reservados. El texto legal completo está en el archivo `[LICENSE](LICENSE)` en la raíz del repositorio: el software y su código fuente son propiedad exclusiva del autor; no se concede permiso para usarlo, copiarlo, modificarlo, fusionarlo, publicarlo, distribuirlo, sublicenciarlo o venderlo sin permiso explícito por escrito del autor.
