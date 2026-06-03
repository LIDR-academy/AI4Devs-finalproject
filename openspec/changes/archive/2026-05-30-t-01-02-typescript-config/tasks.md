# Tasks — T-01-02 · Configurar TypeScript con paths y tsconfig estricto

**Ticket:** T-01-02 · **User Story:** US-01 · **Change:** `t-01-02-typescript-config` · **Rama:** `feature/T-01-02-typescript-config`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-01-02-typescript-config"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-01-02-typescript-config"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-01-02-typescript-config`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-01-02-typescript-config`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Dependencia TypeScript (DoD implícito)

- [x] 1.1 Instalar `typescript` como `devDependency`: `npm install -D typescript`
- [x] 1.2 Verificar que `npx tsc --version` responde correctamente

## 2. Refactorizar `tsconfig.json` raíz (DoD: strict, esModuleInterop, moduleResolution bundler, paths)

- [x] 2.1 Convertir `tsconfig.json` raíz en configuración **base** compartida (sin `include` de código de subproyectos)
- [x] 2.2 Asegurar `compilerOptions.strict: true`
- [x] 2.3 Añadir `compilerOptions.esModuleInterop: true`
- [x] 2.4 Mantener `compilerOptions.moduleResolution: "bundler"`
- [x] 2.5 Mantener paths `"@/*": ["./frontend/src/*"]` con `baseUrl: "."`
- [x] 2.6 Añadir `references` a `./frontend` y `./backend`
- [x] 2.7 Mantener `noEmit: true` para uso en typecheck

## 3. Crear `frontend/tsconfig.json` (DoD: extiende raíz, JSX react-jsx)

- [x] 3.1 Crear `frontend/tsconfig.json` con `"extends": "../tsconfig.json"`
- [x] 3.2 Configurar `compilerOptions.jsx: "react-jsx"`
- [x] 3.3 Configurar `compilerOptions.lib: ["ES2022", "DOM", "DOM.Iterable"]`
- [x] 3.4 Definir `"include": ["src/**/*"]` acotado al frontend

## 4. Crear `backend/tsconfig.json` (DoD: extiende raíz, target ES2022, module runtime)

- [x] 4.1 Crear `backend/tsconfig.json` con `"extends": "../tsconfig.json"`
- [x] 4.2 Configurar `compilerOptions.target: "ES2022"`
- [x] 4.3 Configurar `compilerOptions.module: "ESNext"` (compatible con `"type": "module"` y `tsx`)
- [x] 4.4 Configurar `compilerOptions.lib: ["ES2022"]`
- [x] 4.5 Definir `"include": ["src/**/*"]` acotado al backend

## 5. Script de verificación de tipos (DoD: tsc --noEmit sin errores)

- [x] 5.1 Añadir script `"typecheck"` en `package.json` raíz:
  ```json
  "typecheck": "tsc --noEmit -p frontend/tsconfig.json && tsc --noEmit -p backend/tsconfig.json"
  ```
- [x] 5.2 Ejecutar `npm run typecheck` y corregir errores TS mínimos si aparecen (solo los bloqueantes para exit code 0)
- [x] 5.3 Confirmar que `tsc --noEmit` pasa sin errores sobre frontend y backend actuales

## 6. Verificación de no regresión en tooling

- [x] 6.1 Ejecutar `npm run build` y confirmar build Vite exitoso
- [x] 6.2 Ejecutar `npm run lint` y confirmar que no hay regresiones por el cambio de tsconfig
- [x] 6.3 Verificar que `vite.config.ts` mantiene alias `@` alineado con paths TS (`./frontend/src`)

## 7. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 7.1 Buscar tests existentes relacionados con configuración TypeScript
- [x] 7.2 Si no hay tests aplicables a este ticket de infra, documentar "N/A — sin tests de tsconfig" en el informe del paso 8

## 8. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque para T-01-02 (infra TypeScript): verificar typecheck + arranque sin regresión.**

- [x] 8.1 Ejecutar `npm run typecheck` y confirmar exit code 0 (criterio principal del DoD)
- [x] 8.2 Asegurar `.env` configurado si el backend lo requiere para arranque
- [x] 8.3 Ejecutar `npm run dev` y verificar que Vite (5173) y API (3001) arrancan sin errores de compilación TS
- [x] 8.4 Abrir `http://localhost:5173` y confirmar que la SPA carga sin errores TypeScript en consola
- [x] 8.5 Detener el proceso `npm run dev` limpiamente
- [x] 8.6 Crear informe `openspec/changes/t-01-02-typescript-config/reports/YYYY-MM-DD-step-08-verification.md`
- [x] 8.7 Marcar paso completado solo tras PASS y existir el informe

## 9. Pruebas manuales de endpoints con curl (N/A — sin cambios de API)

Este ticket es **Infra**; no modifica endpoints.

- [x] 9.1 Documentar en el informe del paso 8: "Paso curl N/A — T-01-02 no altera la API"

## 10. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)

Este ticket no modifica componentes ni flujos de usuario.

- [x] 10.1 Documentar en el informe del paso 8: "Paso E2E N/A — T-01-02 solo afecta configuración TypeScript"

## 11. Actualizar documentación técnica (OBLIGATORIO)

- [x] 11.1 Actualizar `docs/development_guide.md`: mencionar `npm run typecheck` en la sección de scripts o calidad de código
- [x] 11.2 Actualizar `README.md` si incluye tabla de scripts (añadir `typecheck`)
- [x] 11.3 Documentar estructura tsconfig raíz + frontend + backend en development_guide si no está descrita
- [x] 11.4 Verificar consistencia entre README y development_guide

## 12. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas del paso 8 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [ ] 12.1 Confirmar que no quedan tareas de implementación pendientes en este archivo
- [ ] 12.2 Confirmar informe del paso 8 en estado PASS
- [ ] 12.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 12.4 Hacer **commit único** en `feature/T-01-02-typescript-config` con mensaje en viñetas (p. ej. `- Refactorizar tsconfig raíz con references`, `- Añadir frontend/backend tsconfig y script typecheck`)
- [ ] 12.5 Subir la rama al remoto: `git push -u origin feature/T-01-02-typescript-config` (OBLIGATORIO si existe remoto)
- [ ] 12.6 Cambiar a `develop`: `git checkout develop` y `git pull origin develop`
- [ ] 12.7 Integrar: `git merge feature/T-01-02-typescript-config`
- [ ] 12.8 Verificar compilación mínima: `npm run typecheck`, `npm run build` y `npm run lint`
- [ ] 12.9 (Opcional) Push de `develop`: `git push origin develop`
- [ ] 12.10 Archivar change OpenSpec: `/opsx:archive t-01-02-typescript-config`
- [ ] 12.11 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-01-02-typescript-config`
