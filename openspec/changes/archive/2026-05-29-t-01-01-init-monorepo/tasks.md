# Tasks — T-01-01 · Inicializar repositorio Git con estructura monorepo

**Ticket:** T-01-01 · **User Story:** US-01 · **Change:** `t-01-01-init-monorepo` · **Rama:** `feature/T-01-01-init-monorepo`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-01-01-init-monorepo"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-01-01-init-monorepo"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-01-01-init-monorepo`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-01-01-init-monorepo`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Auditoría del estado actual (DoD parcial ya cumplido)

- [x] 1.1 Verificar que existen `frontend/` y `backend/` con código fuente
- [x] 1.2 Verificar que existe `LICENSE` (MIT) en la raíz
- [x] 1.3 Verificar que `pnpm-workspace.yaml` declara el paquete raíz (`packages: ['.']`)
- [x] 1.4 Auditar `.gitignore` contra el DoD: `node_modules/`, `dist/`, `.env`, `coverage/`, `*.local` — añadir entradas solo si falta algún patrón
- [x] 1.5 Verificar que `README.md` contiene secciones: descripción, requisitos, instalación y arranque

## 2. Scripts raíz en `package.json` (brecha principal)

- [x] 2.1 Instalar `concurrently` como `devDependency`: `npm install -D concurrently`
- [x] 2.2 Renombrar script actual `"dev": "vite"` a `"dev:web": "vite"`
- [x] 2.3 Definir `"dev": "concurrently -n web,api -c blue,green \"npm run dev:web\" \"npm run dev:api\""` para arrancar frontend y backend en paralelo
- [x] 2.4 Confirmar que siguen definidos `build`, `test` y `lint` sin regresiones
- [x] 2.5 Mantener `dev:api` como atajo para solo backend (`tsx watch backend/src/main.ts`)

## 3. Verificación rápida de scripts (pre-pruebas formales)

- [x] 3.1 Ejecutar `npm run lint` y confirmar que termina sin errores bloqueantes
- [x] 3.2 Ejecutar `npm test` (Vitest) y confirmar resultado (pass o suite vacía sin fallo)
- [x] 3.3 Ejecutar `npm run build` y confirmar build de Vite exitoso

## 4. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 4.1 Buscar tests existentes relacionados con configuración de scripts o arranque
- [x] 4.2 Si no hay tests aplicables a este ticket de infra, documentar "N/A — sin tests de tooling" en el informe del paso 5

## 5. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque para T-01-01 (infra): verificar happy path `npm run dev` y arranque conjunto.**

- [x] 5.1 Asegurar `.env` configurado (copiar desde documentación en `docs/development_guide.md` si no existe)
- [x] 5.2 Levantar PostgreSQL si el backend lo requiere: `npm run docker:up`
- [x] 5.3 Ejecutar `npm install` en la raíz y confirmar instalación sin errores
- [x] 5.4 Ejecutar `npm run dev` y verificar en consola que arrancan **web** (Vite, puerto 5173) y **api** (Express, puerto 3001 o `API_PORT`)
- [x] 5.5 Abrir `http://localhost:5173` y confirmar que la SPA carga sin errores de compilación
- [x] 5.6 Verificar que la tarjeta de perfil de usuario carga (API accesible desde el frontend)
- [x] 5.7 Detener el proceso `npm run dev` limpiamente
- [x] 5.8 (Edge case opcional) Documentar comportamiento si un puerto está ocupado: el error debe ser visible en consola (no silencioso)
- [x] 5.9 Crear informe `openspec/changes/t-01-01-init-monorepo/reports/YYYY-MM-DD-step-05-verification.md`
- [x] 5.10 Marcar paso completado solo tras PASS y existir el informe

## 6. Pruebas manuales de endpoints con curl (N/A — sin cambios de API)

Este ticket es **Infra**; no modifica endpoints. No aplican pruebas curl obligatorias.

- [x] 6.1 Documentar en el informe del paso 5: "Paso curl N/A — T-01-01 no altera la API"

## 7. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)

Este ticket no modifica componentes ni flujos de usuario.

- [x] 7.1 Documentar en el informe del paso 5: "Paso E2E N/A — T-01-01 solo afecta scripts raíz"

## 8. Actualizar documentación técnica (OBLIGATORIO)

- [x] 8.1 Actualizar `README.md`: sección de arranque indicando que `npm run dev` levanta frontend + API; mencionar `dev:web` y `dev:api` como atajos
- [x] 8.2 Actualizar `docs/development_guide.md` si el flujo de arranque difiere del actual (sección "Desarrollo")
- [x] 8.3 Actualizar tabla de scripts en README si cambian nombres o comportamiento
- [x] 8.4 Verificar consistencia entre README y development_guide (sin contradicciones sobre `npm run dev`)
- [x] 8.5 Marcar ítems de DoD del ticket T-01-01 como cumplidos en comentario interno o nota en informe de verificación

## 9. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas del paso 5 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [x] 9.1 Confirmar que no quedan tareas de implementación pendientes en este archivo
- [x] 9.2 Confirmar informe del paso 5 en estado PASS
- [x] 9.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [x] 9.4 Hacer **commit único** en `feature/T-01-01-init-monorepo` con mensaje en viñetas (p. ej. `- Ajustar npm run dev con concurrently`, `- Actualizar README arranque conjunto`)
- [x] 9.5 Cambiar a `develop`: `git checkout develop` y `git pull origin develop`
- [x] 9.6 Integrar: `git merge feature/T-01-01-init-monorepo`
- [x] 9.7 Verificar compilación mínima: `npm run build` y `npm run lint`
- [ ] 9.8 (Opcional) Push: `git push origin develop`
- [x] 9.9 Archivar change OpenSpec: `/opsx:archive t-01-01-init-monorepo`
