# Design — T-01-01 · Inicializar repositorio Git con estructura monorepo

**Ticket:** T-01-01 · **User Story:** US-01 · **Change:** `t-01-01-init-monorepo`

## Context

El repositorio ConRutina **ya está inicializado** en Git (rama `develop`) y contiene una aplicación funcional:

| Elemento | Estado actual |
|----------|---------------|
| `frontend/` (React + Vite) | ✅ Existe con código |
| `backend/` (Express + Prisma) | ✅ Existe con código |
| `LICENSE` (MIT) | ✅ Presente |
| `README.md` | ✅ Con descripción, requisitos, instalación y arranque |
| `pnpm-workspace.yaml` | ✅ `packages: ['.']` |
| `.gitignore` | ✅ Cubre `node_modules/`, `dist/`, `.env`, `coverage/`, `*.local` |
| `package.json` scripts | ⚠️ `dev` solo ejecuta Vite; `dev:api` es script separado |
| `build`, `test`, `lint` | ✅ Definidos en raíz |

El ticket T-01-01 asume greenfield (`git init` + primer commit vacío), pero la implementación debe **extender el estado actual** sin destruir código existente. La brecha principal es el script `dev` unificado del DoD.

Referencias: `docs/development_guide.md`, `docs/base-standards.md`.

## Goals / Non-Goals

**Goals:**

- Cumplir el DoD de T-01-01 sobre la base existente.
- `npm run dev` arranca frontend (Vite, puerto 5173) y backend (`tsx watch backend/src/main.ts`, puerto `API_PORT` o 3001) en un solo comando.
- Mantener scripts `build`, `test` y `lint` en la raíz sin regresiones.
- Preservar `dev:api` como atajo para solo backend (útil en `development_guide.md`).

**Non-Goals:**

- TypeScript, ESLint, Prettier (T-01-02, T-01-03).
- `.env.example` (T-01-04).
- Reorganizar dependencias en paquetes `frontend/package.json` y `backend/package.json` separados (fuera del alcance del ticket).

## Decisions

### 1. Script `dev` con `concurrently`

**Decisión:** Añadir `concurrently` como `devDependency` y definir:

```json
"dev": "concurrently -n web,api -c blue,green \"npm run dev:web\" \"npm run dev:api\"",
"dev:web": "vite"
```

Renombrar el actual `"dev": "vite"` a `dev:web` para no romper la intención del ticket (un `dev` que levanta ambos).

**Alternativas descartadas:**

- **npm-run-all:** Menos legible para procesos long-running en paralelo.
- **Solo documentar dos terminales:** No cumple el DoD ni el Gherkin de US-01 Scenario 1.

### 2. Gestor de paquetes

**Decisión:** Mantener compatibilidad con **npm** (hay `package-lock.json` implícito en docs) y conservar `pnpm-workspace.yaml` para quien use pnpm. No migrar a workspaces multi-paquete en este ticket.

### 3. Estructura de directorios

**Decisión:** No mover archivos. `frontend/` y `backend/` ya cumplen el DoD; solo verificar que existen y están referenciados en README.

### 4. `.gitignore`

**Decisión:** Auditar contra el checklist del ticket; añadir entradas faltantes solo si algún patrón no está cubierto. El fichero actual ya supera el mínimo requerido.

### 5. README

**Decisión:** Actualizar la sección de arranque para indicar que `npm run dev` levanta frontend + API, y que `npm run dev:web` / `npm run dev:api` siguen disponibles para desarrollo parcial.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Puerto 5173 o 3001 ocupado → `npm run dev` falla sin mensaje claro | Configurar `concurrently` con `--kill-others-on-fail`; Vite y Express ya muestran errores de puerto en consola; verificar en pruebas manuales (edge case del ticket) |
| Backend falla si falta `.env` al arrancar con `dev` | Documentado como fuera de scope T-01-01; el desarrollador puede usar solo `dev:web` hasta configurar `.env` |
| Salida mezclada de dos procesos | Prefijos `-n web,api` y colores en `concurrently` para distinguir logs |

## Migration Plan

1. Crear rama `feature/T-01-01-init-monorepo` desde `develop`.
2. Ajustar `package.json` (scripts + `concurrently`).
3. Actualizar `README.md` / `docs/development_guide.md` si la documentación de arranque difiere.
4. Verificar: `npm install` → `npm run dev` → comprobar Vite y API activos.
5. Sin despliegue ni migración de datos; cambio solo de tooling local.

## Open Questions

- Ninguna bloqueante. El puerto del backend sigue leyendo `API_PORT` desde `.env` vía `backend/src/loadEnv.ts` (comportamiento existente).
