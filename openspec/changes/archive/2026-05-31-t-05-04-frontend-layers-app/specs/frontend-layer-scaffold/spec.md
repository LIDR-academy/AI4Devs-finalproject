# Spec — frontend-layer-scaffold

**Ticket:** T-05-04 · **User Story:** US-05

## ADDED Requirements

### Requirement: Directorios de capas frontend

El proyecto SHALL organizar el código bajo `frontend/src/` en las capas de Clean Architecture definidas en US-05 Scenario 5 y `docs/frontend-standards.md`.

#### Scenario: Estructura de directorios obligatoria

- **WHEN** se inspecciona el árbol `frontend/src/`
- **THEN** existen los directorios `domain/`, `application/`, `infrastructure/`, `presentation/` y `styles/`
- **AND** existe el subdirectorio `presentation/components/` para componentes React reutilizables
- **AND** cada capa contiene al menos un fichero TypeScript o un `README.md` que documenta su responsabilidad

#### Scenario: Separación de responsabilidades por capa

- **WHEN** un desarrollador añade lógica de negocio pura (tipos, cálculos sin React)
- **THEN** debe ubicarla en `frontend/src/domain/`
- **WHEN** añade hooks o orquestación de casos de uso
- **THEN** debe ubicarlos en `frontend/src/application/`
- **WHEN** añade clientes HTTP o adaptadores externos
- **THEN** debe ubicarlos en `frontend/src/infrastructure/`
- **WHEN** añade componentes visuales o el shell de la SPA
- **THEN** debe ubicarlos en `frontend/src/presentation/`

### Requirement: Cliente HTTP en infrastructure

La capa `infrastructure/` SHALL exponer un módulo base para peticiones HTTP (p. ej. `httpClient.ts`) y al menos un adaptador concreto existente (`profileApi.ts`) que lo utilice o comparta el mismo patrón de `fetch`.

#### Scenario: httpClient disponible para adaptadores

- **WHEN** se inspecciona `frontend/src/infrastructure/`
- **THEN** existe un fichero exportando funciones de petición HTTP reutilizables (wrapper sobre `fetch` con prefijo `/api`)
- **AND** `profileApi.ts` permanece importable sin errores TypeScript

### Requirement: App.tsx base con layout ConRutina

El componente `frontend/src/presentation/App.tsx` SHALL componer el layout base de la SPA con las secciones del DoD T-05-04: cabecera (header), estadísticas (stats), calendario semanal y recompensas.

#### Scenario: Secciones visibles del layout

- **WHEN** la SPA se renderiza en el navegador en `http://localhost:5173`
- **THEN** la página muestra una cabecera con título de la aplicación
- **AND** muestra una zona de tarjetas de estadísticas (grid stats)
- **AND** muestra una sección de calendario semanal con encabezado identificable
- **AND** muestra una sección de recompensas con encabezado identificable
- **AND** no hay errores de JavaScript en la consola del navegador en la carga inicial

#### Scenario: App.tsx delega el shell de layout

- **WHEN** se inspecciona `frontend/src/presentation/`
- **THEN** el marcado estructural del layout (contenedor principal, slots de secciones) está extraído a uno o más componentes bajo `presentation/components/layout/` o equivalente
- **AND** `App.tsx` actúa como orquestador (hooks + composición de secciones) sin duplicar el HTML del shell en múltiples ficheros

### Requirement: Fuentes globales en fonts.css

El fichero `frontend/src/styles/fonts.css` SHALL definir o importar las fuentes tipográficas de ConRutina y SHALL ser importado desde la cadena de estilos globales (`index.css`).

#### Scenario: fonts.css no está vacío

- **WHEN** se lee `frontend/src/styles/fonts.css`
- **THEN** contiene `@import` de fuentes web (p. ej. Google Fonts) o reglas `@font-face`
- **AND** define variables CSS o clases utilitarias para la fuente sans de UI y la fuente serif del título (p. ej. `--font-sans`, `--font-display`)

#### Scenario: Estilos globales encadenados

- **WHEN** se lee `frontend/src/styles/index.css`
- **THEN** importa `./fonts.css` antes de `tailwind.css` y `theme.css`
- **AND** `frontend/src/main.tsx` importa `./styles/index.css`

### Requirement: Bootstrap y compilación sin errores

El entry point SHALL montar `App` y el proyecto SHALL compilar en desarrollo y producción tras los cambios de capas y layout.

#### Scenario: main.tsx monta App

- **WHEN** se inspecciona `frontend/src/main.tsx`
- **THEN** importa `App` desde `./presentation/App` (o alias `@/presentation/App`)
- **AND** renderiza `<App />` en `#root` con `createRoot`

#### Scenario: Build de producción exitoso

- **WHEN** un desarrollador ejecuta `npm run typecheck` y `npm run build`
- **THEN** ambos comandos terminan sin errores de compilación TypeScript
- **AND** el bundle se genera en `frontend/dist/`
