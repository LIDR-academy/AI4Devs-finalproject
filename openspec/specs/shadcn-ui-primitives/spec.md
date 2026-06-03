# Spec — shadcn-ui-primitives

**Ticket:** T-05-03 · **User Story:** US-05

## Requirements

### Requirement: Utilidad cn() para composición de clases Tailwind

El módulo `frontend/src/presentation/components/ui/utils.ts` SHALL exportar la función `cn()` que combina `clsx` y `tailwind-merge` para fusionar clases de Tailwind sin conflictos, conforme al patrón shadcn/ui.

#### Scenario: Exportación de cn()

- **WHEN** se importa `cn` desde `./presentation/components/ui/utils` (o ruta relativa equivalente)
- **THEN** la función acepta argumentos de tipo `ClassValue[]`
- **AND** devuelve una cadena de clases fusionadas con `twMerge(clsx(...))`

#### Scenario: Uso en primitivos UI

- **WHEN** un componente en `presentation/components/ui/` importa `cn` desde `./utils`
- **THEN** TypeScript resuelve el import sin errores
- **AND** `npm run typecheck` no reporta errores en ese módulo

### Requirement: Primitivos shadcn/ui del DoD T-05-03

El directorio `frontend/src/presentation/components/ui/` SHALL contener los primitivos requeridos por el ticket, basados en Radix UI + Tailwind + CVA, importables sin configuración adicional:

- `button.tsx`
- `dialog.tsx`
- `input.tsx`
- `label.tsx`
- `card.tsx`
- `progress.tsx`
- `badge.tsx`
- `sonner.tsx`

#### Scenario: Ficheros presentes (US-05 Scenario 4)

- **WHEN** se lista `frontend/src/presentation/components/ui/`
- **THEN** existen `button.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `card.tsx`, `progress.tsx`, `badge.tsx` y `sonner.tsx`
- **AND** cada fichero exporta al menos el componente principal documentado por shadcn/ui para ese primitivo

#### Scenario: Importación y renderizado sin errores (US-05 Scenario 4)

- **WHEN** un componente React importa `Button` desde `./ui/button`, `Dialog` desde `./ui/dialog`, `Input` desde `./ui/input` y `Card` desde `./ui/card`
- **AND** se renderizan en la SPA
- **THEN** Vite compila sin errores TypeScript ni errores de resolución de módulos
- **AND** la consola del navegador no muestra errores críticos de runtime por los primitivos

#### Scenario: Primitivos usan tokens del tema ConRutina

- **WHEN** se inspecciona el código de `button.tsx` (y al menos `card.tsx`)
- **THEN** las clases Tailwind referencian tokens semánticos del tema (`bg-primary`, `text-primary-foreground`, `bg-card`, etc.) definidos en `frontend/src/styles/theme.css`
- **AND** no dependen exclusivamente de colores hardcodeados fuera del sistema de diseño

### Requirement: Toaster global con Sonner

La SPA SHALL montar el componente `Toaster` exportado desde `frontend/src/presentation/components/ui/sonner.tsx` en el árbol React raíz para habilitar notificaciones toast globales.

#### Scenario: Toaster en App.tsx

- **WHEN** se lee `frontend/src/presentation/App.tsx`
- **THEN** importa `Toaster` desde `./components/ui/sonner` (o ruta equivalente)
- **AND** renderiza `<Toaster />` dentro del árbol de la aplicación (típicamente como hermano del layout principal)

#### Scenario: Toast invocable desde la SPA

- **WHEN** un componente llama a `toast()` de la librería `sonner` (p. ej. desde un botón de smoke)
- **AND** `<Toaster />` está montado en `App.tsx`
- **THEN** la notificación toast aparece en pantalla sin errores en consola

#### Scenario: Sonner compatible con Vite SPA

- **WHEN** se ejecuta `npm run dev:web` y se abre la SPA
- **THEN** `sonner.tsx` no provoca errores por dependencias de framework no configuradas (p. ej. `next-themes` sin `ThemeProvider`)
- **AND** el toast se renderiza con estilos coherentes con variables CSS de `theme.css`

### Requirement: Configuración mínima shadcn CLI

El proyecto SHALL incluir un fichero `components.json` en la raíz del monorepo que documente la convención shadcn para futuras adiciones de componentes.

#### Scenario: components.json alineado con el monorepo

- **WHEN** se lee `components.json` en la raíz
- **THEN** define `$schema` de shadcn
- **AND** `tailwind.css` apunta a `frontend/src/styles/tailwind.css` (o cadena equivalente documentada)
- **AND** `aliases.components` y `aliases.utils` resuelven a `frontend/src/presentation/components/ui`
- **AND** el alias `@` en `vite.config.ts` coincide con `frontend/src`

### Requirement: Build y arranque sin regresión

Los cambios de shadcn/ui SHALL NOT romper el arranque de desarrollo ni el build de producción del frontend.

#### Scenario: Dev server arranca (US-05 Scenario 1 — verificación secundaria)

- **WHEN** se ejecuta `npm run dev:web`
- **THEN** Vite sirve la aplicación en `http://localhost:5173`
- **AND** no hay errores de compilación TypeScript introducidos por los primitivos

#### Scenario: Build de producción (US-05 Scenario 6 — verificación secundaria)

- **WHEN** se ejecuta `npm run build`
- **THEN** Vite genera `frontend/dist/` sin errores de compilación TypeScript
- **AND** los primitivos shadcn del DoD están incluidos en el bundle sin fallos de resolución
