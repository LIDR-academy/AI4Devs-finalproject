# Spec — typescript-config

**Ticket:** T-01-02 · **User Story:** US-01

## Requirements

### Requirement: Configuración TypeScript base en la raíz

El fichero `tsconfig.json` en la raíz del monorepo SHALL definir opciones compartidas con `strict: true`, `esModuleInterop: true`, `moduleResolution: "bundler"` y el alias de paths `@/*` mapeado a `frontend/src/*`. SHALL referenciar los tsconfig de subproyectos (`frontend/tsconfig.json` y `backend/tsconfig.json`).

#### Scenario: Opciones estrictas y paths en tsconfig raíz

- **WHEN** se lee `tsconfig.json` en la raíz del repositorio
- **THEN** `compilerOptions.strict` es `true`
- **AND** `compilerOptions.esModuleInterop` es `true`
- **AND** `compilerOptions.moduleResolution` es `"bundler"`
- **AND** `compilerOptions.paths` incluye `"@/*": ["./frontend/src/*"]`
- **AND** existen referencias a `frontend/tsconfig.json` y `backend/tsconfig.json`

#### Scenario: US-01 Scenario 2 — tsconfig raíz con paths

- **WHEN** el repositorio está inicializado según US-01
- **THEN** existe `tsconfig.json` en la raíz con paths configurados para el alias `@/*`

### Requirement: Configuración TypeScript del frontend

El fichero `frontend/tsconfig.json` SHALL extender la configuración raíz y SHALL incluir soporte JSX con `jsx: "react-jsx"`. El ámbito (`include`) SHALL cubrir el código fuente bajo `frontend/src`.

#### Scenario: Frontend extiende raíz con JSX

- **WHEN** se lee `frontend/tsconfig.json`
- **THEN** extiende `../tsconfig.json` (o equivalente `extends`)
- **AND** `compilerOptions.jsx` es `"react-jsx"`
- **AND** el patrón `include` abarca los ficheros TypeScript/TSX de `frontend/src`

### Requirement: Configuración TypeScript del backend

El fichero `backend/tsconfig.json` SHALL extender la configuración raíz con `target: "ES2022"` y un módulo compatible con el runtime Node ejecutado vía `tsx` (`module: "ESNext"` o `"NodeNext"`). El ámbito SHALL cubrir `backend/src`.

#### Scenario: Backend extiende raíz con target ES2022

- **WHEN** se lee `backend/tsconfig.json`
- **THEN** extiende `../tsconfig.json` (o equivalente `extends`)
- **AND** `compilerOptions.target` es `"ES2022"`
- **AND** `compilerOptions.module` es `"ESNext"` o `"NodeNext"`
- **AND** el patrón `include` abarca los ficheros TypeScript bajo `backend/src`

### Requirement: Verificación de tipos sin emisión

El proyecto SHALL poder ejecutar comprobación de tipos sobre frontend y backend sin generar salida JavaScript. El comando `tsc --noEmit` (directamente o vía script npm) SHALL terminar con código de salida 0 sobre el código scaffold actual.

#### Scenario: Happy path — typecheck sin errores

- **WHEN** un desarrollador ejecuta `npm run typecheck` o `tsc --noEmit` desde la raíz con dependencias instaladas
- **THEN** el proceso termina con código de salida 0
- **AND** no se reportan errores de TypeScript en `frontend/src` ni `backend/src`

#### Scenario: Dependencia TypeScript explícita

- **WHEN** se inspecciona `package.json` raíz tras la implementación
- **THEN** `typescript` está declarado en `devDependencies` con versión fija o rango semver
