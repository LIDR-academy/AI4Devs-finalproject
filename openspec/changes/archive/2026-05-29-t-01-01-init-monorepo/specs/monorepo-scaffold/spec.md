# Spec — monorepo-scaffold

**Ticket:** T-01-01 · **User Story:** US-01

## ADDED Requirements

### Requirement: Repositorio Git con estructura de monorepo

El repositorio SHALL estar bajo control de versiones Git y contener directorios `frontend/` y `backend/` en la raíz, junto con `LICENSE` (MIT) y documentación de onboarding.

#### Scenario: Estructura de directorios presente

- **WHEN** se inspecciona la raíz del repositorio clonado
- **THEN** existe el directorio `frontend/` con código de la aplicación React
- **AND** existe el directorio `backend/` con código del servidor Express
- **AND** existe el fichero `LICENSE` con licencia MIT

### Requirement: Exclusiones en control de versiones

El fichero `.gitignore` en la raíz SHALL excluir del seguimiento Git, como mínimo: `node_modules/`, `dist/`, `.env`, `coverage/` y ficheros `*.local`.

#### Scenario: Patrones de ignore configurados

- **WHEN** se lee `.gitignore` en la raíz
- **THEN** incluye reglas que excluyen `node_modules/`
- **AND** incluye reglas que excluyen `dist/`
- **AND** incluye reglas que excluyen `.env`
- **AND** incluye reglas que excluyen `coverage/`
- **AND** incluye reglas que excluyen `*.local`

### Requirement: Scripts raíz de desarrollo y calidad

El `package.json` raíz SHALL definir los scripts `dev`, `build`, `test` y `lint`. El script `dev` SHALL arrancar el frontend (Vite) y el backend (API Express) simultáneamente.

#### Scenario: Happy path — instalación y arranque conjunto

- **WHEN** un desarrollador clona el repositorio por primera vez
- **AND** ejecuta `npm install`
- **THEN** todas las dependencias se instalan sin errores ni conflictos
- **WHEN** ejecuta `npm run dev`
- **THEN** el servidor de desarrollo Vite queda disponible (puerto 5173 por defecto)
- **AND** el proceso del backend API queda en ejecución (puerto configurado por `API_PORT` o 3001 por defecto)

#### Scenario: Scripts de build, test y lint definidos

- **WHEN** se inspecciona `package.json` en la raíz
- **THEN** existe el script `build`
- **AND** existe el script `test`
- **AND** existe el script `lint`

### Requirement: Configuración de workspace

El monorepo SHALL declarar un workspace en la raíz mediante `pnpm-workspace.yaml` (o configuración equivalente) que incluya el paquete raíz.

#### Scenario: Workspace declarado

- **WHEN** se lee `pnpm-workspace.yaml` en la raíz
- **THEN** declara al menos el paquete raíz (`.`) como miembro del workspace

### Requirement: Documentación mínima de onboarding

El `README.md` raíz SHALL incluir secciones de descripción del proyecto, requisitos previos, instalación y arranque en desarrollo.

#### Scenario: Secciones obligatorias en README

- **WHEN** se abre `README.md` en la raíz
- **THEN** contiene una sección que describe el propósito del proyecto
- **AND** contiene una sección de requisitos previos
- **AND** contiene una sección de instalación
- **AND** contiene una sección de arranque en desarrollo que referencia `npm run dev`

### Requirement: Mensaje claro ante fallo de puerto ocupado

WHEN `npm run dev` no puede enlazar un puerto porque está ocupado, el proceso SHALL terminar con un error visible en consola (no fallo silencioso).

#### Scenario: Edge case — puerto ocupado

- **WHEN** el puerto del frontend (5173) o del backend (3001) ya está en uso por otro proceso
- **AND** el desarrollador ejecuta `npm run dev`
- **THEN** la consola muestra un mensaje de error identificable (p. ej. `EADDRINUSE` o equivalente de Vite/Node)
- **AND** el proceso no termina sin ninguna salida diagnóstica
