# Tasks — T-05-01 · Inicializar proyecto Vite con React y TypeScript

**Ticket:** T-05-01 · **User Story:** US-05 · **Change:** `t-05-01-init-vite-react` · **Rama:** `feature/T-05-01-init-vite-react`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-05-01-init-vite-react"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-05-01-init-vite-react"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-05-01-init-vite-react`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-05-01-init-vite-react`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Auditoría del estado actual (DoD T-05-01)

- [x] 1.1 Verificar `frontend/index.html`: `lang="es"`, `#root`, script entry a `main.tsx`
- [x] 1.2 Verificar `frontend/src/main.tsx`: `createRoot` monta `<App />` en `#root`
- [x] 1.3 Verificar `vite.config.ts` en raíz: `root` → `frontend/`, plugin `@vitejs/plugin-react`
- [x] 1.4 Verificar alias `@` → `frontend/src` en `vite.config.ts` y coherencia con `tsconfig.json` (`paths`)
- [x] 1.5 Verificar proxy `/api` → `http://localhost:3001` con `changeOrigin: true`
- [x] 1.6 Verificar scripts en `package.json`: `dev:web` (vite), `dev` (concurrently), `build` (vite build)
- [x] 1.7 Verificar `frontend/tsconfig.json`: `jsx: react-jsx`, include `src/**/*`

## 2. Cerrar brechas detectadas (solo si la auditoría falla algún ítem)

- [x] 2.1 Corregir `frontend/index.html` si falta `lang="es"` o estructura SPA — N/A (ya cumplía)
- [x] 2.2 Corregir `frontend/src/main.tsx` si no monta `<App />` correctamente — N/A (ya cumplía)
- [x] 2.3 Ajustar `vite.config.ts`: root, alias, plugin React y/o proxy según design.md — N/A salvo 2.4
- [x] 2.4 Si `fetch('/api/health')` falla con backend activo, añadir `rewrite` al proxy para mapear `/api` → rutas Express (p. ej. `/health`) — regla `/api/health` con rewrite a `/health`
- [x] 2.5 Ajustar scripts en `package.json` solo si `dev:web` o `build` no cumplen el DoD — N/A (ya cumplían)
- [x] 2.6 Si no hay brechas, documentar "Auditoría PASS — sin cambios de código" en el informe del paso 5 — brecha proxy documentada en informe

## 3. Verificación rápida de build y tipos (pre-pruebas formales)

- [x] 3.1 Ejecutar `npm run typecheck` y confirmar que TypeScript del frontend compila
- [x] 3.2 Ejecutar `npm run build` y confirmar salida en `frontend/dist/` sin errores
- [x] 3.3 Ejecutar `npm run lint` sobre `frontend/src` y confirmar sin errores bloqueantes nuevos

## 4. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 4.1 Buscar tests existentes relacionados con configuración Vite o entry points frontend — ninguno encontrado
- [x] 4.2 Documentar "N/A — T-05-01 sin tests unitarios de tooling" en el informe del paso 5 (el ticket no exige tests unitarios)

## 5. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque para T-05-01 (frontend infra): verificar `npm run dev:web`, build y proxy API.**

- [x] 5.1 Asegurar `.env` configurado (copiar desde `.env.example` si no existe)
- [x] 5.2 Levantar PostgreSQL si el backend lo requiere: `npm run db:up`
- [x] 5.3 Ejecutar `npm run dev:web` y verificar que Vite arranca en `http://localhost:5173` sin errores de compilación — Vite OK (5173 ocupado → `:5177` en entorno local)
- [x] 5.4 Abrir `http://localhost:5173` y confirmar que la SPA carga sin errores en consola del navegador — HTML 200 con `#root` y `main.tsx` verificado
- [x] 5.5 En terminal separada, ejecutar `npm run dev:api` y verificar backend en `:3001` — API activa en `:3001`
- [x] 5.6 Probar proxy: `curl http://localhost:5173/api/health` (o ruta acordada tras `rewrite`) y verificar respuesta JSON `{ status: "ok", ... }` — PASS en `:5177` y `:5173`
- [x] 5.7 Ejecutar `npm run build` y confirmar artefactos en `frontend/dist/`
- [x] 5.8 Detener procesos de desarrollo limpiamente
- [x] 5.9 Crear informe `openspec/changes/t-05-01-init-vite-react/reports/YYYY-MM-DD-step-05-verification.md`
- [x] 5.10 Marcar paso completado solo tras PASS y existir el informe

## 6. Pruebas manuales de endpoints con curl (N/A — sin cambios directos de API)

Este ticket es **Frontend — Infra**; no modifica endpoints Express. La verificación del proxy se cubre en el paso 5.6.

- [x] 6.1 Documentar en el informe del paso 5: "Paso curl backend N/A — T-05-01 no altera la API; proxy verificado vía :5173"

## 7. Pruebas E2E con Playwright MCP (N/A — scaffold sin flujos de usuario nuevos)

La carga de la SPA se verifica en el paso 5.4; no hay flujos de usuario nuevos en este ticket.

- [x] 7.1 Documentar en el informe del paso 5: "Paso E2E N/A — T-05-01 verifica arranque SPA en paso 5"

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 Verificar que `docs/development_guide.md` documenta `npm run dev:web`, puerto 5173 y proxy `/api`
- [x] 8.2 Verificar que `docs/frontend-standards.md` refleja la ubicación de `vite.config.ts` en raíz y alias `@`
- [x] 8.3 Actualizar README.md solo si el flujo de arranque frontend difiere de la documentación actual — sin cambios necesarios
- [x] 8.4 Confirmar consistencia entre README, development_guide y frontend-standards sobre Vite y proxy

## 9. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas del paso 5 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [ ] 9.1 Confirmar que no quedan tareas de implementación pendientes en este archivo
- [ ] 9.2 Confirmar informe del paso 5 en estado PASS
- [ ] 9.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 9.4 Hacer **commit único** en `feature/T-05-01-init-vite-react` con mensaje en viñetas (p. ej. `- Verificar scaffold Vite React en frontend/`, `- Ajustar proxy /api si aplica`)
- [ ] 9.5 Subir la rama al remoto: `git push -u origin feature/T-05-01-init-vite-react` (OBLIGATORIO si existe remoto)
- [ ] 9.6 Cambiar a `develop`: `git checkout develop` y `git pull origin develop`
- [ ] 9.7 Integrar: `git merge feature/T-05-01-init-vite-react`
- [ ] 9.8 Verificar compilación mínima: `npm run build` y `npm run typecheck`
- [ ] 9.9 (Opcional) Push de `develop`: `git push origin develop`
- [ ] 9.10 Archivar change OpenSpec: `/opsx:archive t-05-01-init-vite-react`
- [ ] 9.11 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-05-01-init-vite-react`
