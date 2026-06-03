# Spec — eslint-prettier-config

**Ticket:** T-01-03 · **User Story:** US-01

## Requirements

### Requirement: Configuración ESLint flat config para TypeScript y React

El monorepo SHALL disponer de un fichero `eslint.config.mjs` en la raíz con reglas base para TypeScript y React, cubriendo código en `frontend/src` y `backend/src`. ESLint y sus plugins SHALL estar declarados en `devDependencies` del `package.json` raíz.

#### Scenario: Fichero eslint.config.mjs con reglas TS + React

- **WHEN** se inspecciona la raíz del repositorio tras la implementación
- **THEN** existe `eslint.config.mjs`
- **AND** la configuración incluye soporte para ficheros `.ts` y `.tsx`
- **AND** la configuración incluye reglas o plugins de React (p. ej. `eslint-plugin-react`, `eslint-plugin-react-hooks`)
- **AND** `eslint`, `typescript-eslint` (o `@typescript-eslint/*`) están en `devDependencies`

#### Scenario: US-01 Scenario 3 — Linting detecta error TypeScript

- **WHEN** el código contiene un error de sintaxis TypeScript
- **AND** se ejecuta `npm run lint`
- **THEN** el proceso termina con código de salida distinto de 0
- **AND** la salida muestra el error con ruta de archivo y número de línea

#### Scenario: Happy path — lint pasa sobre scaffold actual

- **WHEN** un desarrollador ejecuta `npm run lint` con dependencias instaladas y el código actual sin errores intencionados
- **THEN** el proceso termina con código de salida 0

### Requirement: Configuración Prettier

El monorepo SHALL disponer de `.prettierrc` en la raíz con opciones de formato acordadas: `singleQuote: true`, `semi: false`, `tabWidth: 2`. Prettier SHALL estar declarado en `devDependencies`.

#### Scenario: Opciones Prettier acordadas

- **WHEN** se lee `.prettierrc` en la raíz
- **THEN** `singleQuote` es `true`
- **AND** `semi` es `false`
- **AND** `tabWidth` es `2`

#### Scenario: Formateo vía script npm

- **WHEN** un desarrollador ejecuta `npm run format`
- **THEN** Prettier formatea los ficheros fuente configurados sin error fatal
- **AND** el script está definido en `package.json` raíz

### Requirement: EditorConfig para consistencia entre IDEs

El repositorio SHALL incluir `.editorconfig` en la raíz con reglas base de indentación, charset y fin de línea aplicables a ficheros de código fuente.

#### Scenario: EditorConfig presente

- **WHEN** se inspecciona la raíz del repositorio
- **THEN** existe `.editorconfig`
- **AND** define `indent_style` (p. ej. `space`) e `indent_size` (p. ej. `2`) para ficheros de código
- **AND** define `charset = utf-8`
- **AND** define `end_of_line = lf` (o equivalente acordado)

### Requirement: Scripts npm de calidad de código

El `package.json` raíz SHALL exponer scripts `lint` y `format` funcionales que invoquen ESLint y Prettier respectivamente sobre el ámbito del monorepo.

#### Scenario: US-01 Scenario 2 — script lint en package.json

- **WHEN** se inspecciona `package.json` raíz
- **THEN** existe el script `"lint"` que ejecuta ESLint
- **AND** existe el script `"format"` que ejecuta Prettier

#### Scenario: Lint no regresa tras npm install

- **WHEN** un desarrollador clona el repositorio y ejecuta `npm install`
- **AND** ejecuta `npm run lint`
- **THEN** ESLint se ejecuta correctamente (no falla por dependencia ausente)
