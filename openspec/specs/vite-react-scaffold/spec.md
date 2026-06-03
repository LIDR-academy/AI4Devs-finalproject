# Spec — vite-react-scaffold

**Ticket:** T-05-01 · **User Story:** US-05

## Requirements

### Requirement: Entry point HTML de la SPA

El proyecto SHALL exponer `frontend/index.html` como punto de entrada de la aplicación de página única, con idioma español y contenedor `#root` para el montaje de React.

#### Scenario: index.html cumple el contrato SPA

- **WHEN** se inspecciona `frontend/index.html`
- **THEN** el atributo `lang` del elemento `<html>` es `"es"`
- **AND** existe un elemento `<div id="root">` en el `<body>`
- **AND** un script de tipo módulo carga el entry point TypeScript/React (`main.tsx`)

### Requirement: Bootstrap React en main.tsx

El fichero `frontend/src/main.tsx` SHALL montar el componente raíz `<App />` en el elemento `#root` usando la API de React 18 (`createRoot`).

#### Scenario: main.tsx renderiza App

- **WHEN** Vite sirve la aplicación en desarrollo
- **THEN** `frontend/src/main.tsx` importa y renderiza el componente `App`
- **AND** el montaje ocurre sobre `document.getElementById('root')`
- **AND** no hay errores de compilación TypeScript en el entry point

### Requirement: Configuración Vite en la raíz del monorepo

El fichero `vite.config.ts` en la raíz SHALL configurar Vite con `root` apuntando a `frontend/`, plugin React, alias de resolución y proxy de desarrollo hacia la API.

#### Scenario: root, alias y plugin React

- **WHEN** se lee `vite.config.ts` en la raíz del repositorio
- **THEN** `root` resuelve al directorio `frontend/`
- **AND** el alias `@` resuelve a `frontend/src`
- **AND** el plugin `@vitejs/plugin-react` está registrado en `plugins`

#### Scenario: Proxy de desarrollo hacia la API

- **WHEN** el servidor de desarrollo Vite está activo en el puerto 5173
- **AND** el backend Express está activo en el puerto 3001
- **AND** el frontend realiza una petición a `/api/health`
- **THEN** Vite reenvía la petición a `http://localhost:3001/health`
- **AND** la respuesta llega al cliente sin errores CORS originados por el proxy

### Requirement: Scripts de desarrollo y build

El `package.json` raíz SHALL definir scripts que arranquen Vite en desarrollo y generen el bundle de producción en `frontend/dist/`.

#### Scenario: Servidor de desarrollo en puerto 5173

- **WHEN** un desarrollador ejecuta `npm run dev:web` (o `npm run dev` con el backend en paralelo)
- **THEN** Vite arranca el servidor de desarrollo
- **AND** la SPA queda disponible en `http://localhost:5173`
- **AND** la consola del navegador no muestra errores de compilación en la carga inicial

#### Scenario: Build de producción sin errores

- **WHEN** un desarrollador ejecuta `npm run build`
- **THEN** Vite completa el build sin errores de compilación TypeScript
- **AND** los artefactos de salida se generan en `frontend/dist/`

### Requirement: TypeScript para el frontend

El proyecto SHALL incluir configuración TypeScript para el código bajo `frontend/src/` coherente con el alias `@` definido en Vite.

#### Scenario: tsconfig del frontend

- **WHEN** se inspecciona `frontend/tsconfig.json`
- **THEN** incluye los ficheros bajo `src/**/*`
- **AND** la opción `jsx` está configurada para React (`react-jsx`)
- **AND** el path `@/*` es resoluble desde el código TypeScript del frontend (vía tsconfig raíz o del frontend)
