# Design — T-01-03 · Configurar ESLint y Prettier

**Ticket:** T-01-03 · **User Story:** US-01 · **Change:** `t-01-03-eslint-prettier`

## Context

Tras T-01-01 (monorepo) y T-01-02 (TypeScript estricto con `npm run typecheck`), el repositorio **no cumple** el DoD de T-01-03:

| Elemento | Estado actual |
|----------|---------------|
| Script `"lint": "eslint ."` en `package.json` | ✅ Declarado |
| Paquetes ESLint en `devDependencies` | ❌ Ausentes — `npm run lint` falla |
| `eslint.config.mjs` | ❌ No existe |
| `.prettierrc` | ❌ No existe |
| Script `format` | ❌ No definido |
| `.editorconfig` | ❌ No existe |
| `.prettierignore` | ❌ No existe |

El monorepo usa `"type": "module"` en `package.json`, por lo que la configuración ESLint debe usar **flat config** (`eslint.config.mjs`, ESLint 9+). El código existente incluye ~76 ficheros en `frontend/src` (React/TSX) y ~8 en `backend/src` (Express/TS). T-01-02 ya configuró tsconfigs separados; ESLint debe respetar esos paths sin duplicar la resolución de `@/*`.

Referencias: `docs/development_guide.md` (menciona lint pendiente), `docs/base-standards.md`, `package.json`.

## Goals / Non-Goals

**Goals:**

- Cumplir el DoD de T-01-03 sobre la base existente.
- ESLint flat config con reglas base TS + React para frontend y TS para backend.
- Prettier con opciones acordadas en el backlog.
- Scripts `lint` y `format` funcionales en raíz.
- `.editorconfig` para alinear indentación entre IDEs.
- `npm run lint` exit code 0 sobre código actual; exit code ≠ 0 ante error TS sintáctico (US-01 Scenario 3).

**Non-Goals:**

- Husky / lint-staged / pre-commit hooks.
- `.env.example` (T-01-04).
- Reglas ESLint exhaustivas o custom rules del equipo.
- Configs ESLint separados por subproyecto.
- Cambios de lógica de negocio o API.

## Decisions

### 1. ESLint 9 con flat config en raíz (`eslint.config.mjs`)

**Decisión:** Un único `eslint.config.mjs` en la raíz usando el formato flat de ESLint 9, compatible con `"type": "module"`.

Paquetes propuestos:

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks globals
```

Estructura orientativa:

```javascript
// eslint.config.mjs
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'backend/prisma/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['frontend/src/**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ['backend/src/**/*.ts'],
    languageOptions: { globals: globals.node },
  },
)
```

**Alternativas descartadas:**

- **`.eslintrc.cjs` (legacy):** Incompatible con la dirección de ESLint 9 y con `"type": "module"` sin workarounds.
- **Configs por subproyecto:** Complejidad innecesaria para el tamaño actual del monorepo.

### 2. Prettier con opciones del backlog

**Decisión:** `.prettierrc` (JSON) en raíz:

```json
{
  "singleQuote": true,
  "semi": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

Añadir `.prettierignore`:

```
node_modules
dist
coverage
backend/prisma/migrations
```

Script en `package.json`:

```json
"format": "prettier --write \"frontend/src/**/*.{ts,tsx,css}\" \"backend/src/**/*.ts\" \"*.{json,md,mjs}\""
"format:check": "prettier --check \"frontend/src/**/*.{ts,tsx,css}\" \"backend/src/**/*.ts\" \"*.{json,md,mjs}\""
```

(`format:check` es opcional pero útil para CI futuro; el DoD exige `format`.)

**Alternativas descartadas:**

- **`eslint-config-prettier`:** Solo añadir si hay conflictos reales entre reglas ESLint y Prettier; no es requisito del DoD.

### 3. EditorConfig estándar

**Decisión:** `.editorconfig` en raíz:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,ts,tsx,json,yml,yaml,mjs,css,md}]
indent_style = space
indent_size = 2
```

Alineado con `tabWidth: 2` de Prettier.

### 4. Ámbito de lint y exclusión de artefactos generados

**Decisión:** ESLint analiza `frontend/src/**` y `backend/src/**`. Ignorar: `dist/`, `node_modules/`, `backend/prisma/migrations/`, ficheros de config de build.

El script existente `"lint": "eslint ."` puede refinarse a:

```json
"lint": "eslint frontend/src backend/src"
```

Evita lintear `node_modules` y reduce ruido. Mantener coherencia con ignores en flat config.

### 5. Verificación US-01 Scenario 3 (error → exit ≠ 0)

**Decisión:** Tras configurar, verificar manualmente:

1. `npm run lint` → exit 0.
2. Introducir temporalmente un error TS (p. ej. `const x: string = 123` en un fichero de prueba), ejecutar `npm run lint`, confirmar exit ≠ 0 y mensaje con ruta/línea.
3. Revertir el error antes de cerrar el change.

`typescript-eslint` reporta errores de tipos solo si se habilitan reglas type-aware (requiere `parserOptions.project`). **Para el DoD del ticket**, basta con detectar errores de **sintaxis/parsing** TS (exit ≠ 0). Si el equipo desea type-aware lint en el futuro, será un ticket aparte.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| ESLint reporta muchos warnings en código legacy | Empezar con `recommended` sin reglas estrictas extra; corregir solo errores bloqueantes para exit 0 |
| Prettier reformatea masivamente el repo | Ejecutar `format` una vez; diff grande pero aceptable en ticket de setup |
| Conflicto ESLint vs Prettier (comillas, semicolons) | Prettier es source of truth para formato; ESLint no fuerza estilo si hay conflicto |
| `eslint .` lintea demasiado | Acotar paths en script y `ignores` en flat config |

## Migration Plan

1. Instalar devDependencies ESLint + Prettier.
2. Crear configs (eslint, prettier, editorconfig, prettierignore).
3. Actualizar scripts en `package.json`.
4. Ejecutar `npm run lint` — corregir errores bloqueantes mínimos si aparecen.
5. (Opcional) Ejecutar `npm run format` para normalizar estilo.
6. Verificar `npm run typecheck` y `npm run dev` sin regresión.
7. Documentar en `docs/development_guide.md` y `README.md`.

Rollback: eliminar configs y devDependencies añadidas; restaurar script `lint` anterior.

## Open Questions

- _(Ninguna crítica)_ — Las opciones Prettier están definidas en el backlog. Type-aware ESLint queda fuera de scope.
