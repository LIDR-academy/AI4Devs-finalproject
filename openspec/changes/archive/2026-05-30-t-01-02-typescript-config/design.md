# Design — T-01-02 · Configurar TypeScript con paths y tsconfig estricto

**Ticket:** T-01-02 · **User Story:** US-01 · **Change:** `t-01-02-typescript-config`

## Context

Tras T-01-01 el monorepo arranca con `npm run dev`, pero la configuración TypeScript no cumple el DoD de T-01-02:

| Elemento | Estado actual |
|----------|---------------|
| `tsconfig.json` raíz | ✅ Existe con `strict`, `moduleResolution: bundler`, paths `@/*` |
| `esModuleInterop` en raíz | ❌ Ausente (requerido por DoD) |
| `frontend/tsconfig.json` | ❌ No existe |
| `backend/tsconfig.json` | ❌ No existe |
| Referencias raíz → subproyectos | ❌ No configuradas |
| `typescript` en `devDependencies` | ❌ No declarado explícitamente en `package.json` |
| Script `typecheck` | ❌ No definido |
| Alias `@` en Vite | ✅ `vite.config.ts` ya apunta a `./frontend/src` |

El ticket asume scaffolds vacíos, pero el repo contiene ~76 ficheros frontend y 8 backend. La implementación debe **reestructurar tsconfig sin romper** Vite (`dev:web`) ni `tsx watch` (`dev:api`).

Referencias: `docs/development_guide.md`, `docs/frontend-standards.md`, `docs/backend-standards.md`.

## Goals / Non-Goals

**Goals:**

- Cumplir el DoD de T-01-02 sobre la base existente.
- Grafo tsconfig: raíz (base) → `frontend/tsconfig.json` (JSX) + `backend/tsconfig.json` (Node/ES2022).
- `tsc --noEmit` pasa sin errores sobre el código actual.
- Mantener alineados paths TS (`@/*`) y alias Vite (`@`).

**Non-Goals:**

- ESLint/Prettier (T-01-03).
- `.env.example` (T-01-04).
- Emitir JavaScript con `tsc` (solo typecheck).
- Separar `package.json` por subproyecto.

## Decisions

### 1. Tsconfig raíz como base sin JSX ni include de código

**Decisión:** El `tsconfig.json` raíz define `compilerOptions` compartidos y `references` a subproyectos. No incluye directamente `frontend/src` ni `backend/src` (evita mezclar JSX y opciones de Node).

Opciones compartidas propuestas:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./frontend/src/*"] }
  },
  "references": [
    { "path": "./frontend" },
    { "path": "./backend" }
  ],
  "files": []
}
```

**Alternativas descartadas:**

- **Un solo tsconfig monolítico (estado actual):** No cumple DoD de subproyectos que extienden raíz.
- **`composite: true` con emit:** Complejidad innecesaria; Vite y tsx no usan salida de `tsc`.

### 2. Frontend: `jsx: react-jsx` y include acotado

**Decisión:** `frontend/tsconfig.json`:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*"]
}
```

El `baseUrl` y `paths` se heredan de la raíz (alias `@/*` resuelve desde monorepo root).

### 3. Backend: ES2022 + ESNext para tsx

**Decisión:** `backend/tsconfig.json`:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*"]
}
```

**Alternativa considerada:** `module: "CommonJS"` — descartada porque `package.json` raíz tiene `"type": "module"` y `tsx` ejecuta ESM nativo.

### 4. Script npm `typecheck`

**Decisión:** Añadir en `package.json`:

```json
"typecheck": "tsc --noEmit -p frontend/tsconfig.json && tsc --noEmit -p backend/tsconfig.json"
```

Ejecuta typecheck por subproyecto (más claro que `-b` con references en esta fase).

**Alternativa:** `tsc -b` con project references — viable si se añade `"composite": true`; se evita para minimizar diff.

### 5. Dependencia `typescript`

**Decisión:** Instalar `typescript` (^5.x) como `devDependency` explícita: `npm install -D typescript`.

Hoy el compilador puede resolverse transitivamente vía Vite/tsx; el DoD exige `tsc --noEmit` reproducible en CI.

### 6. Alineación Vite ↔ TypeScript paths

**Decisión:** No modificar `vite.config.ts` salvo que un cambio de `baseUrl` rompa resolución. Mantener:

```ts
'@': path.resolve(__dirname, './frontend/src')
```

Coherente con `"@/*": ["./frontend/src/*"]` en tsconfig raíz.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| `strict: true` revela errores latentes en código existente | Corregir solo errores bloqueantes para `tsc --noEmit`; no ampliar scope a refactors |
| Paths `@/*` no resuelven en backend | Backend no usa alias `@`; paths solo aplican a frontend |
| IDEs no detectan sub-tsconfig | Abrir workspace en raíz; VS Code/Cursor leen `references` |
| `moduleResolution: bundler` en backend | Alineado con tsx + ESM; si falla, probar `NodeNext` como fallback documentado |

## Migration Plan

1. Crear rama `feature/T-01-02-typescript-config` desde `develop`.
2. Instalar `typescript` devDependency.
3. Refactorizar `tsconfig.json` raíz; crear `frontend/tsconfig.json` y `backend/tsconfig.json`.
4. Añadir script `typecheck`.
5. Ejecutar `npm run typecheck`; corregir errores TS mínimos si aparecen.
6. Verificar regresión: `npm run dev`, `npm run build`.
7. Actualizar `docs/development_guide.md` con comando `typecheck`.

## Open Questions

- Ninguna bloqueante. Si `tsc --noEmit -p backend` reporta errores por tipos de Express/Prisma, usar `skipLibCheck: true` (ya en base) y corregir solo código propio.
