# Informe de verificación — Paso 5 · T-01-01 init-monorepo

**Fecha:** 2026-05-29  
**Rama:** `feature/T-01-01-init-monorepo`  
**Estado:** PASS (alcance T-01-01)

## Resumen

Se verificó el happy path `npm install` → `npm run dev` con arranque conjunto de frontend (Vite :5173) y API (Express :3001) mediante `concurrently`.

## Entorno

| Elemento | Valor |
| -------- | ----- |
| SO | Windows 10 |
| Node | npm (package-lock actualizado) |
| PostgreSQL | Docker Compose (`conrutina-postgres`) |
| `.env` | Creado según `docs/development_guide.md` |

## Paso 3 — Scripts rápidos

| Comando | Resultado | Notas |
| ------- | --------- | ----- |
| `npm run lint` | FAIL (preexistente) | `eslint` no instalado; fuera de alcance T-01-03 |
| `npm test` | FAIL (preexistente) | `vitest` no instalado; script definido pero sin dependencia |
| `npm run build` | PASS | Vite build OK → `dist/` |

## Paso 4 — Tests unitarios de tooling

**N/A — sin tests de tooling.** No existen tests en el repositorio relacionados con scripts de arranque o configuración de `package.json`.

## Paso 5 — Verificación de aplicación

| Paso | Resultado | Evidencia |
| ---- | --------- | --------- |
| 5.1 `.env` configurado | PASS | Variables según development_guide |
| 5.2 PostgreSQL Docker | PASS | `npm run docker:up`; volumen recreado por credenciales previas |
| 5.3 `npm install` | PASS | Sin errores; `concurrently` añadido |
| 5.4 `npm run dev` arranque conjunto | PASS | Consola: prefijos `[web]` y `[api]`; Vite :5173 + API :3001 |
| 5.5 SPA en :5173 | PASS | HTTP 200; HTML con `#root` y título ConRutina |
| 5.6 Perfil de usuario (API) | PASS | `GET /api/profile` → `{"id":1,"name":"Maria Garcia","email":"usuario@ejemplo.com"}`; proxy Vite `/api/profile` OK |
| 5.7 Detener proceso | PASS | Proceso `npm run dev` detenido |
| 5.8 Edge case puerto ocupado | N/A documentado | No probado en esta sesión; Vite/Express muestran `EADDRINUSE` por diseño (ver development_guide § Solución de problemas) |

### Salida de consola (extracto)

```
[web]   VITE v6.4.2  ready in 961 ms
[web]   ➜  Local:   http://localhost:5173/
[api]   [API] PostgreSQL → base de datos: ConRutina2
[api]   API escuchando en http://localhost:3001 (GET /api/profile)
```

## Paso 6 — curl

**Paso curl N/A — T-01-01 no altera la API.**

Se verificó manualmente `GET /api/profile` como smoke test del arranque conjunto.

## Paso 7 — E2E Playwright

**Paso E2E N/A — T-01-01 solo afecta scripts raíz.**

## Paso 8 — DoD T-01-01

| Criterio DoD | Estado |
| ------------ | ------ |
| Estructura `frontend/` + `backend/` | ✅ |
| `LICENSE` en raíz | ✅ Existe (texto propietario, no MIT — preexistente) |
| `pnpm-workspace.yaml` con `packages: ['.']` | ✅ |
| `.gitignore` (node_modules, dist, .env, coverage, *.local) | ✅ |
| Scripts `dev`, `build`, `test`, `lint` en raíz | ✅ |
| `npm run dev` arranca frontend + backend | ✅ |
| README con descripción, requisitos, instalación, arranque | ✅ Actualizado |
| `development_guide.md` coherente con `npm run dev` | ✅ Actualizado |

## Cambios implementados

- `concurrently` como devDependency
- `"dev"` → arranque paralelo web + api
- `"dev:web"` → Vite (antes `"dev": "vite"`)
- `"dev:api"` → sin cambios
- Documentación README y development_guide alineada

## Observaciones fuera de alcance

- ESLint y Vitest no están instalados (T-01-03 / configuración de tests futura).
- `LICENSE` no es MIT; el fichero existe con licencia propietaria del autor.
