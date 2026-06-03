# Design — T-05-04 · Crear estructura de capas del frontend y App.tsx base

**Ticket:** T-05-04 · **User Story:** US-05 · **Change:** `t-05-04-frontend-layers-app`

## Context

ConRutina usa Clean Architecture en el frontend (`docs/frontend-standards.md`, PRD §7). Los tickets T-05-01–T-05-03 cerraron Vite, tema Tailwind v4 y primitivos shadcn/ui. El repo **no está vacío**: ya existen `domain/*.ts`, `application/useHabitDashboard.ts`, `infrastructure/profileApi.ts`, componentes de negocio y un `App.tsx` de ~150 líneas con lógica de dashboard y datos de fixtures.

**Brechas detectadas respecto al DoD T-05-04:**

| Elemento DoD | Estado actual | Acción |
|--------------|---------------|--------|
| Directorios de capas | ✅ Existen | Documentar + barrel mínimo donde falte |
| `presentation/components/` | ✅ Existe | Añadir subcarpeta `layout/` |
| `App.tsx` layout base | ⚠️ Monolítico con lógica mezclada | Extraer shell layout |
| `fonts.css` | ❌ Vacío | Importar fuentes + variables |
| Estilos inline | ⚠️ `#FAF8F5`, `Georgia` hardcoded | Usar tokens `theme.css` |
| `httpClient.ts` | ❌ No existe | Crear wrapper fetch |
| Layout "vacío" (backlog) | ⚠️ UI poblada con fixtures | Mantener contenido dev; formalizar estructura |

**Dependencias:** T-05-01 (entry), T-05-02 (`theme.css`), T-05-03 (`Toaster`, primitivos ui/).

## Goals / Non-Goals

**Goals:**

- Cumplir US-05 Scenario 5 (estructura de capas) y verificar Scenario 6 (build).
- Extraer layout shell reutilizable sin romper el dashboard actual.
- Completar tipografía global vía `fonts.css`.
- Introducir `httpClient.ts` como punto único de peticiones `/api/*`.

**Non-Goals:**

- Vaciar la UI de contenido de desarrollo (fixtures/hooks existentes se mantienen).
- Implementar dominio puro US-13 o integración API completa.
- React Router, tests Vitest del layout, refactor shadcn de modales.

## Decisions

### 1. Auditoría + formalización en lugar de re-scaffold

**Decisión:** No borrar ni recrear el árbol frontend; auditar capas existentes y cerrar brechas.

**Alternativa descartada:** Mover todo a un scaffold mínimo "layout vacío" — rompería el flujo de verificación E2E actual y duplicaría trabajo de tickets posteriores.

### 2. Componentes de layout bajo `presentation/components/layout/`

**Decisión:** Crear:

```
presentation/components/layout/
├── AppLayout.tsx       # min-h-screen, max-w-5xl, bg token
├── StatsSection.tsx    # grid wrapper + título opcional
├── CalendarSection.tsx # card blanca, header con icono Calendar
└── RewardsSection.tsx  # card blanca, header con icono Gift
```

`App.tsx` conserva `useHabitDashboard()` y pasa `children`/props a las secciones. El HTML repetido (rounded-2xl, shadow-sm, flex headers) vive en los componentes layout.

**Alternativa descartada:** Un único `AppLayout` con 4 props `ReactNode` sin subcomponentes — menos legible para tickets UI futuros.

### 3. Tipografía: Google Fonts en `fonts.css`

**Decisión:**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

En `:root` de `theme.css` (o `fonts.css`):

```css
--font-sans: 'Inter', system-ui, sans-serif;
--font-display: Georgia, 'Times New Roman', serif;
```

Actualizar `Header.tsx` para usar `className="font-display"` (utilidad Tailwind `@theme` o clase custom) en lugar de `style={{ fontFamily: 'Georgia' }}`.

**Alternativa descartada:** `@font-face` locales — más peso en repo sin beneficio MVP.

### 4. Cliente HTTP mínimo

**Decisión:** `infrastructure/httpClient.ts`:

```typescript
export async function apiGet<T>(path: string): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }>
```

- Prefijo `/api` implícito.
- `profileApi.ts` refactorizado para usar `apiGet<ProfileUserDto>('/profile')`.

**Alternativa descartada:** Axios — dependencia extra no requerida por el ticket.

### 5. Documentación por capa

**Decisión:** Añadir `README.md` breve (≤15 líneas) en `domain/`, `application/`, `infrastructure/` si no existe, describiendo qué va en cada capa (en español, identificadores en inglés en código).

**Alternativa:** Solo barrel `index.ts` — menos visible para onboarding; se puede añadir barrel opcional en `domain/index.ts` exportando tipos públicos.

### 6. Tokens de superficie en lugar de inline styles

**Decisión:** Reemplazar en `App.tsx`:

- `style={{ backgroundColor: '#FAF8F5' }}` → `className="min-h-screen bg-background"` (token `--color-background` ya en T-05-02).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Refactor layout rompe E2E existentes | Mantener mismos textos de sección ("Calendario semanal", "Recompensas"); ejecutar Playwright en apply |
| `fonts.css` con `@import` Google bloquea offline | Fallback `system-ui`; aceptable en dev; CDN estándar del PRD |
| App sigue acoplada a `useHabitDashboard` | Aceptado: hooks en application/; desacople total en US-13 |
| Ticket pide "layout vacío" vs UI con datos | Interpretación: estructura de secciones formalizada; contenido fixture no es scope de vaciado |

## Migration Plan

1. Crear rama `feature/T-05-04-frontend-layers-app` desde `develop`.
2. Añadir `httpClient.ts`, componentes `layout/*`, completar `fonts.css`.
3. Refactorizar `App.tsx`, `Header.tsx`, `profileApi.ts`.
4. Añadir README por capa; actualizar `docs/frontend-standards.md` si cambia el diagrama de carpetas.
5. Verificar `npm run typecheck`, `npm run build`, `npm run dev:web` + E2E layout.
6. Archivar change; marcar ticket ✅.

**Rollback:** Revertir rama feature; no hay migración de BD.

## Open Questions

| Pregunta | Recomendación |
|----------|---------------|
| ¿Eliminar componentes shadcn no usados del repo? | **No** — fuera de scope T-05-04 |
| ¿Mover `fixtures.ts` a `domain/` o `infrastructure/`? | **Mantener en `domain/`** — datos de dominio de ejemplo |
| ¿Extraer `UserProfileCard` al header del layout? | **Sí** — permanece en zona header de `AppLayout` como hoy |
