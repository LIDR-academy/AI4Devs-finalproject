# Tasks — T-01-03 · Configurar ESLint y Prettier



**Ticket:** T-01-03 · **User Story:** US-01 · **Change:** `t-01-03-eslint-prettier` · **Rama:** `feature/T-01-03-eslint-prettier`



## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)



- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`

- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-01-03-eslint-prettier"`

- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-01-03-eslint-prettier"`

- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-01-03-eslint-prettier`

- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-01-03-eslint-prettier`

- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)



## 1. Instalar dependencias ESLint y Prettier (DoD implícito)



- [x] 1.1 Instalar ESLint 9+ y plugins: `npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks globals`

- [x] 1.2 Instalar Prettier: `npm install -D prettier`

- [x] 1.3 Verificar que los paquetes aparecen en `devDependencies` de `package.json`



## 2. Crear `eslint.config.mjs` (DoD: reglas TS + React)



- [x] 2.1 Crear `eslint.config.mjs` en la raíz con flat config (ESLint 9)

- [x] 2.2 Configurar bloque base con `typescript-eslint` (`recommended`) para `.ts`/`.tsx`

- [x] 2.3 Configurar bloque para `frontend/src/**/*.{ts,tsx}` con `eslint-plugin-react` y `eslint-plugin-react-hooks`

- [x] 2.4 Configurar bloque para `backend/src/**/*.ts` con globals de Node

- [x] 2.5 Añadir `ignores` para `dist/**`, `node_modules/**`, `backend/prisma/**`



## 3. Crear configuración Prettier (DoD: .prettierrc)



- [x] 3.1 Crear `.prettierrc` con `singleQuote: true`, `semi: false`, `tabWidth: 2`

- [x] 3.2 Crear `.prettierignore` excluyendo `node_modules`, `dist`, `coverage`, migraciones Prisma

- [x] 3.3 (Opcional) Añadir `trailingComma: "es5"` y `printWidth: 100` según design.md



## 4. Crear `.editorconfig` (DoD: consistencia entre IDEs)



- [x] 4.1 Crear `.editorconfig` en la raíz con `charset = utf-8`, `end_of_line = lf`, `indent_style = space`, `indent_size = 2`

- [x] 4.2 Aplicar reglas a extensiones de código fuente (`*.{js,ts,tsx,json,yml,yaml,mjs,css,md}`)



## 5. Actualizar scripts npm (DoD: lint y format)



- [x] 5.1 Refinar script `"lint"` en `package.json`: `"eslint frontend/src backend/src"`

- [x] 5.2 Añadir script `"format"`: `"prettier --write \"frontend/src/**/*.{ts,tsx,css}\" \"backend/src/**/*.ts\" \"*.{json,md,mjs}\""`

- [x] 5.3 (Opcional) Añadir script `"format:check"` para verificación sin escritura



## 6. Verificación lint y formato (DoD: npm run lint pasa)



- [x] 6.1 Ejecutar `npm run lint` y confirmar exit code 0 sobre el código actual

- [x] 6.2 Si hay errores bloqueantes, corregir solo los mínimos necesarios para exit 0

- [x] 6.3 Ejecutar `npm run format` (si se desea normalizar estilo en este ticket)

- [x] 6.4 Verificar US-01 Scenario 3: introducir temporalmente un error TS sintáctico, ejecutar `npm run lint`, confirmar exit ≠ 0 con ruta y línea en la salida, revertir el cambio



## 7. Verificación de no regresión en tooling



- [x] 7.1 Ejecutar `npm run typecheck` y confirmar exit code 0 (T-01-02 no debe regresionar)

- [x] 7.2 Ejecutar `npm run build` y confirmar build Vite exitoso

- [x] 7.3 Ejecutar `npm run dev` brevemente y confirmar que frontend (5173) y API (3001) arrancan sin errores



## 8. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)



- [x] 8.1 Buscar tests existentes relacionados con ESLint/Prettier

- [x] 8.2 Si no hay tests aplicables a este ticket de infra, documentar "N/A — sin tests de lint config" en el informe del paso 9



## 9. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



**Enfoque para T-01-03 (infra lint/format): verificar lint + typecheck + arranque sin regresión.**



- [x] 9.1 Ejecutar `npm run lint` y confirmar exit code 0 (criterio principal del DoD)

- [x] 9.2 Ejecutar `npm run typecheck` y confirmar exit code 0

- [x] 9.3 Asegurar `.env` configurado si el backend lo requiere para arranque

- [x] 9.4 Ejecutar `npm run dev` y verificar que Vite (5173) y API (3001) arrancan sin errores

- [x] 9.5 Abrir `http://localhost:5173` y confirmar que la SPA carga sin errores en consola

- [x] 9.6 Detener el proceso `npm run dev` limpiamente

- [x] 9.7 Crear informe `openspec/changes/t-01-03-eslint-prettier/reports/YYYY-MM-DD-step-09-verification.md`

- [x] 9.8 Marcar paso completado solo tras PASS y existir el informe



## 10. Pruebas manuales de endpoints con curl (N/A — sin cambios de API)



Este ticket es **Infra**; no modifica endpoints.



- [x] 10.1 Documentar en el informe del paso 9: "Paso curl N/A — T-01-03 no altera la API"



## 11. Pruebas E2E con Playwright MCP (N/A — sin cambios de UI)



Este ticket no modifica componentes ni flujos de usuario.



- [x] 11.1 Documentar en el informe del paso 9: "Paso E2E N/A — T-01-03 solo afecta configuración ESLint/Prettier"



## 12. Actualizar documentación técnica (OBLIGATORIO)



- [x] 12.1 Actualizar `docs/development_guide.md`: sustituir comentario "cuando ESLint esté configurado" por instrucciones reales de `npm run lint` y `npm run format`

- [x] 12.2 Actualizar `README.md`: añadir scripts `lint` y `format` en la tabla/sección de scripts si aplica

- [x] 12.3 Documentar opciones Prettier y estructura de configs en development_guide si no está descrita

- [x] 12.4 Verificar consistencia entre README y development_guide



## 13. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)



**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas del paso 9 estén en PASS.



**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.



- [x] 13.1 Confirmar que no quedan tareas de implementación pendientes en `tasks.md`

- [x] 13.2 Confirmar que el informe de verificación del paso 9 está creado y en estado PASS

- [x] 13.3 Confirmar con el usuario que acepta los cambios antes de commitear

- [x] 13.4 Hacer **commit único** en la rama de feature con todos los cambios pendientes (mensaje en viñetas breves)

- [x] 13.5 Subir la rama de feature al remoto: `git push -u origin feature/T-01-03-eslint-prettier` (OBLIGATORIO si existe remoto)

- [x] 13.6 Cambiar a `develop` y actualizarla: `git checkout develop` y `git pull origin develop`

- [x] 13.7 Integrar la rama de feature: `git merge feature/T-01-03-eslint-prettier` (resolver conflictos si los hay)

- [x] 13.8 Verificar que `develop` pasa `npm run lint` y `npm run typecheck`

- [x] 13.9 (Opcional) Push de `develop` al remoto si el flujo del equipo lo requiere: `git push origin develop`

- [x] 13.10 Proceder con el archivado OpenSpec del change (`mv` a `openspec/changes/archive/YYYY-MM-DD-t-01-03-eslint-prettier/`)

- [x] 13.11 Intentar marcar el ticket en `docs/product-backlog.md` como **✅ Implementado** (último paso tras archivar; **no bloqueante**):

  ```bash

  npm run openspec:mark-ticket -- --change t-01-03-eslint-prettier

  ```

  Si tiene éxito, verificar que `**Estado en código:**` del ticket `T-01-03` (sección 4) quedó en `✅ Implementado`. Si falla, **no** impedir el cierre del change: documentar el error y corregir el backlog manualmente o re-ejecutar el script después.

