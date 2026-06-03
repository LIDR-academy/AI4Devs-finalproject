# Informe de verificación — T-05-01 (paso 5)

**Change:** `t-05-01-init-vite-react`  
**Fecha:** 2026-05-30  
**Rama:** `feature/T-05-01-init-vite-react`  
**Estado:** **PASS**

## Resumen

Auditoría del scaffold Vite + React + TypeScript completada. El código base cumplía casi todo el DoD; la única brecha cerrada fue el proxy `/api/health` → `/health` (el backend expone `GET /health` sin prefijo `/api`, mientras `/api/profile` sí usa prefijo).

## 0. Setup Git

| Ítem | Resultado |
|------|-----------|
| Rama base `develop` actualizada | OK |
| Rama `feature/T-05-01-init-vite-react` creada | OK |
| Rama activa verificada | OK |

## 1. Auditoría DoD

| Ítem | Resultado |
|------|-----------|
| `frontend/index.html` — `lang="es"`, `#root`, script `main.tsx` | PASS |
| `frontend/src/main.tsx` — `createRoot` + `<App />` | PASS |
| `vite.config.ts` — `root: frontend`, plugin React, alias `@` | PASS |
| Alias `@` coherente con `tsconfig.json` paths | PASS |
| Proxy `/api` → `:3001` con `changeOrigin: true` | PASS (base) |
| Scripts `dev:web`, `dev`, `build` | PASS |
| `frontend/tsconfig.json` — `jsx: react-jsx`, include `src/**/*` | PASS |

## 2. Brechas cerradas

- **2.4 Proxy `/api/health`:** Añadida regla específica en `vite.config.ts` con `rewrite: () => '/health'` antes del catch-all `/api`, preservando `/api/profile` sin reescritura.
- **2.6:** Auditoría base PASS; brecha menor de proxy corregida (no "sin cambios de código").

## 3. Build y tipos

| Comando | Resultado |
|---------|-----------|
| `npm run typecheck` | PASS (exit 0) |
| `npm run build` | PASS — artefactos en `frontend/dist/` |
| `npm run lint` | PASS (exit 0) |

## 4. Tests unitarios

- **4.1:** No existen tests de configuración Vite ni entry points frontend.
- **4.2:** N/A — T-05-01 sin tests unitarios de tooling.

## 5. Verificación en ejecución

| Ítem | Resultado | Notas |
|------|-----------|-------|
| `.env` configurado | PASS | Ya existía |
| `npm run db:up` | PASS | Contenedor `conrutina-db` running |
| `npm run dev:web` | PASS | Vite arrancó (puertos 5173–5176 ocupados → `:5177`) |
| SPA carga | PASS | HTTP 200; HTML con `#root` y `/src/main.tsx` |
| `npm run dev:api` | PASS* | API ya activa en `:3001` (nueva instancia rechazada por puerto en uso) |
| Proxy `curl :5177/api/health` | PASS | `{"status":"ok","timestamp":"..."}` |
| Proxy `curl :5173/api/health` | PASS | Respuesta OK (instancia previa en entorno) |
| `npm run build` | PASS | `frontend/dist/index.html` + assets |
| Procesos detenidos | OK | Instancias iniciadas en esta sesión detenidas |

\* El API en `:3001` ya estaba en ejecución en el entorno de desarrollo; la verificación del proxy se realizó contra ese servidor.

## 6. Pruebas curl backend directas

Paso curl backend N/A — T-05-01 no altera la API; proxy verificado vía `:5173`/`:5177`.

Referencia smoke directo: `curl http://localhost:3001/health` → `{"status":"ok",...}`.

## 7. Pruebas E2E

Paso E2E N/A — T-05-01 verifica arranque SPA en paso 5 (HTML + proxy).

## 8. Documentación

| Ítem | Resultado |
|------|-----------|
| `docs/development_guide.md` — `dev:web`, puerto 5173, proxy | PASS (sin cambios) |
| `docs/frontend-standards.md` — `vite.config.ts` en raíz, alias `@` | PASS (actualizado árbol + ejemplo proxy `/api/health`) |
| `README.md` | PASS (consistente; sin cambios) |

## Cambios de código

- `vite.config.ts` — regla proxy `/api/health` con rewrite a `/health`
- `docs/frontend-standards.md` — ubicación de `vite.config.ts` en raíz y ejemplo de proxy actualizado
