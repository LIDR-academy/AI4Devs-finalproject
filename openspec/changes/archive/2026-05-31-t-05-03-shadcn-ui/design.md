# Design — T-05-03 · Instalar y configurar shadcn/ui (Radix primitives)

**Ticket:** T-05-03 · **User Story:** US-05 · **Change:** `t-05-03-shadcn-ui`

## Context

El monorepo ConRutina incluye un scaffold frontend (T-05-01) y tema Tailwind v4 ConRutina (T-05-02 archivado). El directorio `frontend/src/presentation/components/ui/` **ya contiene decenas de ficheros** generados por shadcn/Figma Make, junto con dependencias Radix en `package.json` raíz.

Estado actual relevante para T-05-03:

| Elemento | Estado actual |
|----------|---------------|
| `utils.ts` con `cn()` | ✅ Presente (`clsx` + `tailwind-merge`) |
| Primitivos DoD (`button`, `dialog`, `input`, `label`, `card`, `progress`, `badge`, `sonner`) | ✅ Ficheros existen |
| `components.json` | ❌ Ausente |
| `<Toaster />` en `App.tsx` | ❌ No montado |
| `sonner.tsx` | ⚠️ Usa `useTheme` de `next-themes` sin `ThemeProvider` en la SPA |
| Alias `@` → `frontend/src` | ✅ En `vite.config.ts` |
| Variables shadcn en `theme.css` | ✅ Sincronizadas con ConRutina (T-05-02) |
| Modales de negocio (`AddHabitModal`, etc.) | ⚠️ Implementación custom, no usan `Dialog` shadcn aún |

Referencias: `docs/frontend-standards.md` (patrón shadcn, lista de primitivos), `docs/product-backlog.md` (DoD T-05-03), dependencia T-05-02.

## Goals / Non-Goals

**Goals:**

- Cumplir el DoD de T-05-03 sobre la base existente (auditoría + correcciones mínimas).
- Garantizar que los ocho primitivos requeridos compilan, importan y renderizan con el tema ConRutina.
- Montar `<Toaster />` global en `App.tsx`.
- Añadir `components.json` para convención CLI y futuros `npx shadcn@latest add`.
- Validar con componente smoke y `npm run typecheck` / `npm run build`.

**Non-Goals:**

- Eliminar componentes shadcn extra no listados en el DoD.
- Migrar modales/formularios de negocio a primitivos shadcn (T-16-04, T-17-03).
- Estructura de capas o layout base (T-05-04).
- Configurar `ThemeProvider` / modo oscuro con `next-themes`.
- Tests unitarios de primitivos UI.

## Decisions

### 1. Enfoque “auditar y cerrar brechas”, no reinstalar desde cero

**Decisión:** Tratar T-05-03 como **validación y ajuste** de primitivos ya presentes. Re-ejecutar `npx shadcn@latest init` solo si la auditoría detecta incompatibilidades graves (p. ej. imports rotos masivos).

**Alternativas descartadas:**

- **Borrar `ui/` y reinstalar solo 8 componentes:** Riesgo de romper referencias cruzadas entre primitivos extra; beneficio marginal.
- **Instalar shadcn en `frontend/package.json` separado:** Fuera de convención del monorepo (deps en raíz).

### 2. Ubicación y convención de ficheros

**Decisión:** Mantener la ruta estándar del proyecto:

```
frontend/src/presentation/components/ui/
  utils.ts          # cn()
  button.tsx
  dialog.tsx
  input.tsx
  label.tsx
  card.tsx
  progress.tsx
  badge.tsx
  sonner.tsx
```

Imports relativos desde componentes de negocio: `./ui/button`, `./ui/dialog`, etc.  
Imports con alias opcional: `@/presentation/components/ui/button`.

### 3. components.json en raíz del monorepo

**Decisión:** Crear `components.json` en la raíz (junto a `vite.config.ts`) apuntando a rutas bajo `frontend/`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "frontend/src/styles/tailwind.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/presentation/components/ui",
    "utils": "@/presentation/components/ui/utils",
    "ui": "@/presentation/components/ui"
  }
}
```

Ajustar campos según la versión actual del CLI shadcn al ejecutar `npx shadcn@latest init` en modo no interactivo si hace falta.

**Alternativas descartadas:**

- **Sin components.json:** Dificulta mantenimiento futuro; el DoD del backlog implica “instalar y configurar” shadcn, no solo copiar ficheros.

### 4. Adaptación de sonner.tsx para Vite SPA

**Decisión:** Simplificar `sonner.tsx` eliminando la dependencia de `useTheme()` de `next-themes` (no hay `ThemeProvider` en `main.tsx`). Usar tema fijo `"light"` o derivar de `prefers-color-scheme` solo si se desea; para T-05-03, **tema light** alineado con ConRutina es suficiente.

Ejemplo orientativo:

```tsx
import { Toaster as Sonner, type ToasterProps } from 'sonner'

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{ classNames: { /* opcional */ } }}
      {...props}
    />
  )
}
```

Eliminar directiva `'use client'` (irrelevante en Vite).

**Alternativas descartadas:**

- **Añadir `ThemeProvider` de next-themes:** Fuera de scope; aumenta superficie sin requisito del ticket.

### 5. Integración en App.tsx

**Decisión:** Añadir `<Toaster />` como último hijo del fragmento raíz de `App` (fuera de contenedores con `overflow: hidden`):

```tsx
import { Toaster } from './components/ui/sonner'

export default function App() {
  return (
    <>
      {/* layout existente */}
      <Toaster />
    </>
  )
}
```

### 6. Componente smoke ShadcnSmoke

**Decisión:** Crear `frontend/src/presentation/components/ShadcnSmoke.tsx` (análogo a `ThemeSmoke` de T-05-02) que renderice:

- `Button` con variante default
- `Card` + `CardHeader` + `CardContent`
- `Input` + `Label`
- `Badge`, `Progress`
- Botón que dispare `toast.success('ConRutina toast OK')` vía `sonner`

Montarlo temporalmente en `App.tsx` para verificación E2E; puede retirarse en T-05-04 o dejarse hasta archivado.

**Alternativas descartadas:**

- **Probar solo imports estáticos sin render:** No valida Radix portals ni Sonner en runtime.

### 7. Revisión de primitivos existentes

**Decisión:** Para cada fichero del DoD:

1. Verificar imports (`@radix-ui/*`, `cva`, `cn`).
2. Confirmar clases semánticas (`bg-primary`, `border-input`, etc.) compatibles con `theme.css`.
3. Eliminar `'use client'` si aparece.
4. Si un primitivo difiere mucho de la versión shadcn compatible con Tailwind v4, regenerarlo con `npx shadcn@latest add <component> --overwrite` **solo para ese fichero**.

No tocar primitivos fuera del DoD salvo dependencias rotas que impidan compilar los ocho requeridos.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Primitivos heredados incompatibles con Tailwind v4 | Regenerar fichero concreto vía CLI; ejecutar `npm run typecheck` |
| `sonner.tsx` rompe runtime por `next-themes` | Simplificar wrapper sin `useTheme` |
| Catálogo UI inflado (~90 ficheros) confunde auditoría | Scope estricto al DoD; documentar en proposal Non-goals |
| Smoke component ensucia UI de producción | Componente claramente marcado como dev/smoke; retirable en T-05-04 |
| Duplicación MUI + shadcn en deps | Fuera de scope T-05-03; MUI ya presente por scaffold |

## Migration Plan

1. Crear rama `feature/T-05-03-shadcn-ui` desde `develop`.
2. Añadir `components.json`; ajustar `sonner.tsx`; montar `<Toaster />`.
3. Auditar/regenerar los 8 primitivos si hace falta.
4. Añadir `ShadcnSmoke` y verificar en navegador.
5. `npm run typecheck`, `npm run build`, pruebas E2E Playwright.
6. Actualizar `docs/frontend-standards.md` (lista concreta de primitivos instalados).
7. Archivar change; marcar ticket en backlog.

**Rollback:** Revertir rama feature; los primitivos preexistentes permanecen en el historial git.

## Open Questions

- ¿Retirar `ShadcnSmoke` en el mismo ticket al archivar o dejarlo hasta T-05-04? → **Recomendación:** mantener hasta archivado para trazabilidad E2E; retirar en T-05-04 si el layout base lo reemplaza.
- ¿Ejecutar `shadcn init` interactivo vs escribir `components.json` manualmente? → Preferir init no interactivo si el CLI lo soporta; si no, JSON manual validado con un `add button --dry-run`.
