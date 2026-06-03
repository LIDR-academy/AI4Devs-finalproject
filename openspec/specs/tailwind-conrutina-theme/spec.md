# Spec — tailwind-conrutina-theme

**Ticket:** T-05-02 · **User Story:** US-05

## Requirements

### Requirement: Tailwind CSS v4 integrado vía plugin de Vite

El frontend SHALL usar Tailwind CSS v4 como plugin de Vite (`@tailwindcss/vite`) sin archivo `tailwind.config.js`, conforme a `docs/frontend-standards.md`.

#### Scenario: Plugin de Vite activo

- **WHEN** se inspecciona `vite.config.ts` en la raíz del monorepo
- **THEN** el array `plugins` incluye `tailwindcss()` de `@tailwindcss/vite`
- **AND** no existe `tailwind.config.js` en la raíz ni en `frontend/`

#### Scenario: Dependencias instaladas

- **WHEN** se inspecciona `package.json` raíz
- **THEN** `tailwindcss` y `@tailwindcss/vite` están declarados como dependencias de desarrollo
- **AND** `npm install` resuelve las versiones sin errores

### Requirement: Variables CSS del tema ConRutina

El archivo `frontend/src/styles/theme.css` SHALL definir las variables CSS del tema ConRutina y exponerlas a Tailwind v4 mediante `@theme inline` para generar utilidades como `bg-primary`, `bg-completed`, etc.

Variables obligatorias en `:root`:

- `--color-primary`
- `--color-completed` (verde — estado completado)
- `--color-failed` (rojo — estado fallado)
- `--color-pending` (gris — estado pendiente)
- `--color-background`
- `--color-surface`

#### Scenario: Variables definidas en theme.css

- **WHEN** se lee `frontend/src/styles/theme.css`
- **THEN** `:root` declara `--color-primary`, `--color-completed`, `--color-failed`, `--color-pending`, `--color-background` y `--color-surface`
- **AND** `@theme inline` mapea esas variables para utilidades Tailwind (p. ej. `--color-primary` → clase `bg-primary`)

#### Scenario: Paleta alineada con ConRutina

- **WHEN** se comparan los valores de las variables con `docs/frontend-standards.md`
- **THEN** `--color-background` refleja el fondo cálido de la app (`#FAF8F5` o equivalente documentado)
- **AND** `--color-primary` refleja el verde principal de ConRutina (`#22c55e` o equivalente documentado)
- **AND** `--color-completed`, `--color-failed` y `--color-pending` corresponden a verde, rojo y gris respectivamente

### Requirement: Cadena de importación de estilos globales

`frontend/src/styles/index.css` SHALL importar Tailwind y el tema para que `main.tsx` cargue estilos globales al arrancar la SPA.

#### Scenario: index.css importa Tailwind y tema

- **WHEN** se lee `frontend/src/styles/index.css`
- **THEN** importa `./tailwind.css` (directivas `@import 'tailwindcss'` de v4)
- **AND** importa `./theme.css` (variables y `@theme inline`)

#### Scenario: Entry point carga estilos

- **WHEN** se lee `frontend/src/main.tsx`
- **THEN** importa `./styles/index.css` antes de montar `<App />`

### Requirement: Componente de prueba con clases Tailwind del tema

La SPA SHALL incluir al menos un elemento React visible que use clases utilitarias del tema ConRutina para validar que Tailwind procesa las variables correctamente.

#### Scenario: Clases del tema aplicadas en navegador

- **WHEN** un componente React renderiza elementos con clases como `bg-primary`, `bg-completed`, `bg-failed`, `bg-pending`, `bg-background` o `bg-surface`
- **AND** se abre la SPA en `http://localhost:5173`
- **THEN** los estilos se aplican visualmente según la paleta definida en `theme.css`
- **AND** no hay errores de compilación CSS en la consola de Vite

#### Scenario: Build de producción sin regresión CSS

- **WHEN** se ejecuta `npm run build`
- **THEN** Vite genera `frontend/dist/` sin errores relacionados con Tailwind o `theme.css`
