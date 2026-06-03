# Design — T-05-01 · Inicializar proyecto Vite con React y TypeScript

**Ticket:** T-05-01 · **User Story:** US-05 · **Change:** `t-05-01-init-vite-react`

## Context

El repositorio ConRutina **ya contiene un frontend React funcional** bajo `frontend/`, con Vite configurado en la raíz del monorepo. El ticket T-05-01 asume un scaffold greenfield, pero la implementación debe **auditar y cerrar brechas** respecto al DoD sin destruir código existente.

| Elemento | Estado actual |
|----------|---------------|
| `frontend/index.html` | ✅ `lang="es"`, `#root`, script a `/src/main.tsx` |
| `frontend/src/main.tsx` | ✅ `createRoot` + `<App />` + import de estilos |
| `vite.config.ts` (raíz) | ✅ `root: frontend`, alias `@`, plugin React, proxy `/api` → `:3001` |
| `@tailwindcss/vite` en Vite | ✅ Presente (instalado con el proyecto; tema en T-05-02) |
| `package.json` scripts | ✅ `dev:web`: vite, `dev`: concurrently web+api, `build`: vite build |
| `frontend/tsconfig.json` | ✅ Extiende tsconfig raíz, `jsx: react-jsx` |
| `tsconfig.json` raíz | ✅ `paths`: `@/*` → `./frontend/src/*` |
| `react` / `react-dom` | ✅ Instalados (peerDependencies + resolución npm) |
| Estructura de capas (`presentation/`, etc.) | ✅ Existe (formalizada en T-05-04, fuera de scope) |
| shadcn/ui, Tailwind theme | ✅ Parcialmente presente (T-05-02, T-05-03) |

Referencias: `docs/frontend-standards.md`, `docs/development_guide.md`, `docs/base-standards.md`.

## Goals / Non-Goals

**Goals:**

- Cumplir el DoD de T-05-01 sobre la base existente.
- `npm run dev:web` sirve la SPA en `:5173` sin errores de compilación.
- `npm run build` genera `frontend/dist/` sin errores TypeScript.
- Proxy `/api` reenvía correctamente a `http://localhost:3001` (US-05 escenario 2).
- Alias `@` resoluble en Vite y TypeScript.

**Non-Goals:**

- Tailwind v4 y variables de tema ConRutina (T-05-02).
- Primitivos shadcn/ui (T-05-03).
- Reorganizar capas frontend o simplificar `App.tsx` (T-05-04).
- Eliminar `@tailwindcss/vite` del config aunque T-05-01 no lo exija (ya integrado; quitar rompería estilos actuales).

## Decisions

### 1. Vite en la raíz con `root: frontend`

**Decisión:** Mantener `vite.config.ts` en la raíz del monorepo con `root` apuntando a `frontend/`, alineado con `docs/frontend-standards.md` y el patrón ya establecido en T-01-01.

**Alternativas descartadas:**

- **`frontend/vite.config.ts` separado:** Duplicaría scripts y rompería convención actual del monorepo.
- **`frontend/package.json` independiente:** Fuera del alcance del ticket y del workspace mínimo.

### 2. Proxy `/api` con `changeOrigin: true`

**Decisión:** Conservar la configuración existente:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

El backend expone `GET /health` (sin prefijo `/api`); las rutas de negocio futuras usarán `/api/*`. Para verificar el proxy en T-05-01, probar `fetch('/api/health')` asumiendo reescritura o ruta equivalente — si el backend solo tiene `/health`, la verificación puede usar curl directo al proxy o confirmar configuración + smoke con backend activo según `createApp.ts`.

**Nota:** Revisar en apply si el proxy debe incluir `rewrite: (path) => path.replace(/^\/api/, '')` para mapear `/api/health` → `/health`. Si falta y la prueba falla, añadir `rewrite` como brecha a cerrar.

### 3. Entry point mínimo vs App completa

**Decisión:** No simplificar `App.tsx` a un placeholder. El DoD solo exige que `main.tsx` renderice `<App />`; la app actual con dashboard es válida y demuestra que el scaffold funciona.

### 4. React como peerDependency

**Decisión:** No mover `react`/`react-dom` a `dependencies` directas salvo que `npm install` en entorno limpio falle. El lockfile ya resuelve las versiones 18.3.1.

### 5. Build output en `frontend/dist/`

**Decisión:** Vite con `root: frontend` emite por defecto en `frontend/dist/`. Verificar en apply; no sobreescribir `outDir` salvo divergencia.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Proxy `/api` sin `rewrite` → `fetch('/api/health')` devuelve 404 | Verificar en pruebas; añadir `rewrite` si el backend usa rutas sin prefijo `/api` |
| `npm run build` falla por errores TS preexistentes en componentes | Ejecutar `npm run typecheck`; corregir solo errores que bloqueen el build del ticket |
| Puerto 5173 ocupado | Vite muestra error explícito; documentar en informe de verificación |
| Ticket marcado pendiente pero código ya implementado | Change orientado a auditoría + cierre formal; marcar ✅ al archivar |

## Migration Plan

1. Crear rama `feature/T-05-01-init-vite-react` desde `develop`.
2. Auditar ficheros del DoD; corregir solo brechas detectadas.
3. Verificar: `npm run dev:web` → `:5173`, `npm run build` → `frontend/dist/`.
4. Con backend activo, verificar proxy (curl o fetch desde consola del navegador).
5. Sin despliegue; cambio local de tooling/scaffold.

## Open Questions

- ¿El proxy necesita `rewrite` para `/api/health` → `/health`? Resolver en apply probando contra `GET /health` del backend (T-04-01). Si la convención del proyecto es prefijo `/api` en Express futuro, la config actual puede ser suficiente sin rewrite.
