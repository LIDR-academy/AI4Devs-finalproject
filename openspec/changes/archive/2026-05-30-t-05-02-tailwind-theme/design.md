# Design — T-05-02 · Instalar y configurar Tailwind CSS v4 con tema ConRutina

**Ticket:** T-05-02 · **User Story:** US-05 · **Change:** `t-05-02-tailwind-theme`

## Context

El repositorio ConRutina **ya tiene Tailwind CSS v4 integrado** en el pipeline Vite (T-05-01). La cadena de estilos actual es:

| Elemento | Estado actual |
|----------|---------------|
| `@tailwindcss/vite` en `vite.config.ts` | ✅ Presente |
| `tailwindcss` 4.1.12 en `package.json` | ✅ Instalado |
| `frontend/src/styles/tailwind.css` | ✅ `@import 'tailwindcss'` + `@source` |
| `frontend/src/styles/index.css` | ✅ Importa `fonts.css`, `tailwind.css`, `theme.css` |
| `frontend/src/main.tsx` | ✅ Importa `./styles/index.css` |
| `frontend/src/styles/theme.css` | ⚠️ Existe pero con paleta shadcn genérica; **faltan** variables ConRutina del DoD |
| `tailwind.config.js` | ✅ Ausente (correcto para v4) |

Referencias: `docs/frontend-standards.md` (paleta `#FAF8F5`, `#22c55e`, `#fbbf24`), `docs/product-backlog.md` (DoD T-05-02), T-05-01 archivado.

Componentes existentes (p. ej. `HabitRow.tsx`) usan colores Tailwind hardcodeados (`bg-green-500`, `bg-red-400`, `bg-gray-100`) en lugar de tokens del tema — **fuera de scope** de este ticket.

## Goals / Non-Goals

**Goals:**

- Cumplir el DoD de T-05-02 sobre la base existente (auditoría + ajustes mínimos).
- Definir variables `--color-primary`, `--color-completed`, `--color-failed`, `--color-pending`, `--color-background`, `--color-surface` en `theme.css`.
- Exponer esas variables en `@theme inline` para clases utilitarias Tailwind v4.
- Mantener compatibilidad con variables shadcn existentes (`--primary`, `--background`, etc.) mapeándolas a la paleta ConRutina donde sea posible sin romper componentes UI.
- Validar visualmente con un componente de prueba que use clases del tema.

**Non-Goals:**

- Instalar shadcn/ui (T-05-03).
- Refactor masivo de componentes de negocio a tokens del tema.
- Crear `tailwind.config.js`.
- Tests unitarios de CSS.
- Implementar modo oscuro como requisito del ticket.

## Decisions

### 1. No reinstalar Tailwind — auditar y completar tema

**Decisión:** Tratar T-05-02 como **cierre de brechas** sobre infraestructura ya presente. Verificar plugin Vite y dependencias; el trabajo principal es alinear `theme.css` con ConRutina.

**Alternativas descartadas:**

- **Reinstalar desde cero:** Rompería la integración shadcn existente sin beneficio.
- **Mover a `frontend/package.json`:** Fuera de convención del monorepo.

### 2. Estructura CSS: tres ficheros bajo `frontend/src/styles/`

**Decisión:** Mantener la separación actual:

```
index.css   → orquestador (fonts + tailwind + theme)
tailwind.css → directivas Tailwind v4 y @source
theme.css   → variables :root + @theme inline + @layer base
```

El DoD exige que `index.css` importe Tailwind y el tema — ya lo hace vía imports encadenados; no consolidar en un solo archivo para no romper convención documentada en `frontend-standards.md`.

### 3. Paleta ConRutina (valores propuestos)

**Decisión:** Alinear con `docs/frontend-standards.md` y semántica del dominio (estados de hábito):

| Token CSS | Valor propuesto | Uso |
|-----------|-----------------|-----|
| `--color-background` | `#FAF8F5` | Fondo general de la SPA |
| `--color-surface` | `#FFFFFF` | Tarjetas, paneles |
| `--color-primary` | `#22c55e` | Acciones principales, marca |
| `--color-completed` | `#22c55e` | Estado completado (verde) |
| `--color-failed` | `#ef4444` | Estado fallado (rojo) |
| `--color-pending` | `#e5e7eb` | Estado pendiente (gris) |

En `@theme inline`:

```css
@theme inline {
  --color-background: var(--color-background);
  --color-surface: var(--color-surface);
  --color-primary: var(--color-primary);
  --color-completed: var(--color-completed);
  --color-failed: var(--color-failed);
  --color-pending: var(--color-pending);
  /* Mantener mapeos shadcn existentes sincronizados */
  --color-primary: var(--primary); /* o unificar --primary con ConRutina */
}
```

**Nota de implementación:** Unificar `--primary` (shadcn) con `--color-primary` (ConRutina) asignando el mismo valor en `:root` evita divergencia entre `bg-primary` de shadcn y el token del DoD.

**Alternativas descartadas:**

- **Solo variables shadcn sin `--color-*` del DoD:** No cumple el checklist del ticket.
- **Duplicar archivos theme:** Innecesario.

### 4. Componente de prueba mínimo

**Decisión:** Añadir un bloque de smoke visual discreto — opciones (elegir una en apply):

1. **`ThemeSmoke.tsx`** importado temporalmente en `App.tsx` con tres cajas `bg-completed`, `bg-failed`, `bg-pending` y una `bg-primary text-white`.
2. **Sección oculta** con `data-testid="theme-smoke"` y `className="sr-only"` no sirve para verificación visual — preferir bloque visible pequeño o usar DevTools.

Tras validación, el bloque puede permanecer como referencia de tokens o reducirse a comentario en informe; no es obligatorio eliminarlo si documenta el tema para desarrolladores.

### 5. Sin `tailwind.config.js`

**Decisión:** Configuración CSS-first de Tailwind v4; `@source '../**/*.{js,ts,jsx,tsx}'` en `tailwind.css` ya escanea componentes.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Cambiar `--primary` rompe contraste en componentes shadcn | Verificar Button, Badge tras actualizar tema; ajustar `--primary-foreground` si hace falta |
| Variables duplicadas (`--primary` vs `--color-primary`) | Unificar valores en `:root`; documentar en `frontend-standards.md` |
| `@theme inline` mal formado → clases no generadas | Probar `bg-completed` en componente de prueba y `npm run build` |
| Ticket marcado pendiente pero Tailwind ya instalado | Change orientado a auditoría + tema; marcar ✅ al archivar |

## Migration Plan

1. Crear rama `feature/T-05-02-tailwind-theme` desde `develop`.
2. Auditar plugin Vite y dependencias (esperado: PASS sin cambios).
3. Actualizar `frontend/src/styles/theme.css` con variables ConRutina y `@theme inline`.
4. Verificar `index.css` / `tailwind.css` (esperado: PASS sin cambios).
5. Añadir componente de prueba con clases del tema.
6. Verificar: `npm run dev:web` → inspección visual; `npm run build` → sin errores.
7. Actualizar `docs/frontend-standards.md` si los valores difieren del ejemplo actual.

## Open Questions

- ¿Mantener bloque de smoke visual permanente en `App.tsx` o moverlo a Storybook/docs en el futuro? Por ahora, bloque mínimo visible es suficiente para el DoD.
- ¿Sincronizar `--secondary` con `#fbbf24` del PRD aunque no esté en el DoD checklist? Opcional; no bloqueante si se documenta como mejora alineada con frontend-standards.
