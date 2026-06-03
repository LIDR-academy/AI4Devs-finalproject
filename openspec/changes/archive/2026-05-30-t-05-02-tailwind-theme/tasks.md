# Tasks — T-05-02 · Instalar y configurar Tailwind CSS v4 con tema ConRutina

**Ticket:** T-05-02 · **User Story:** US-05 · **Change:** `t-05-02-tailwind-theme` · **Rama:** `feature/T-05-02-tailwind-theme`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-05-02-tailwind-theme"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-05-02-tailwind-theme"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-05-02-tailwind-theme`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-05-02-tailwind-theme`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Auditoría Tailwind v4 existente (DoD T-05-02 — plugin Vite)

- [x] 1.1 Verificar `vite.config.ts`: plugin `tailwindcss()` de `@tailwindcss/vite` en `plugins`
- [x] 1.2 Confirmar ausencia de `tailwind.config.js` en raíz y `frontend/`
- [x] 1.3 Verificar `package.json`: `tailwindcss` y `@tailwindcss/vite` en devDependencies
- [x] 1.4 Verificar `frontend/src/styles/tailwind.css`: `@import 'tailwindcss'` y `@source` apuntando a componentes
- [x] 1.5 Verificar `frontend/src/styles/index.css`: importa `./tailwind.css` y `./theme.css`
- [x] 1.6 Verificar `frontend/src/main.tsx`: importa `./styles/index.css`

## 2. Implementar tema ConRutina en theme.css

- [x] 2.1 En `frontend/src/styles/theme.css`, definir en `:root` las variables del DoD: `--color-primary`, `--color-completed`, `--color-failed`, `--color-pending`, `--color-background`, `--color-surface` (valores según `design.md` y `docs/frontend-standards.md`)
- [x] 2.2 Añadir mapeo en `@theme inline` para exponer utilidades Tailwind (`bg-primary`, `bg-completed`, `bg-failed`, `bg-pending`, `bg-background`, `bg-surface`)
- [x] 2.3 Sincronizar variables shadcn existentes (`--primary`, `--background`, etc.) con la paleta ConRutina sin romper componentes UI
- [x] 2.4 Mantener `@layer base` y variantes dark existentes; no eliminar estilos shadcn no relacionados con el DoD

## 3. Componente de prueba con clases Tailwind del tema

- [x] 3.1 Crear `frontend/src/presentation/components/ThemeSmoke.tsx` (o equivalente) con elementos que usen `bg-primary`, `bg-completed`, `bg-failed`, `bg-pending`, `bg-background`, `bg-surface`
- [x] 3.2 Importar el componente de prueba en `App.tsx` de forma visible para validación visual
- [x] 3.3 Confirmar que Vite compila sin errores CSS al guardar

## 4. Verificación rápida de build y tipos (pre-pruebas formales)

- [x] 4.1 Ejecutar `npm run typecheck` y confirmar sin errores TypeScript nuevos
- [x] 4.2 Ejecutar `npm run build` y confirmar salida en `frontend/dist/` sin errores
- [x] 4.3 Ejecutar `npm run lint` sobre `frontend/src/styles` y componentes tocados

## 5. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 5.1 Buscar tests existentes relacionados con estilos o configuración Tailwind — documentar N/A si no hay
- [x] 5.2 Documentar "N/A — T-05-02 sin tests unitarios de CSS" en el informe del paso 6 (el ticket indica verificación visual)

## 6. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque para T-05-02 (frontend estilos): verificar dev server, renderizado visual del tema y build.**

- [x] 6.1 Ejecutar `npm run dev:web` y verificar que Vite arranca en `http://localhost:5173` sin errores de compilación CSS
- [x] 6.2 Abrir `http://localhost:5173` y confirmar que la SPA carga sin errores en consola del navegador
- [x] 6.3 Inspeccionar visualmente el componente de prueba: colores primary, completed (verde), failed (rojo), pending (gris), background y surface aplicados correctamente
- [x] 6.4 Verificar en DevTools que las variables CSS del tema están presentes en `:root`
- [x] 6.5 Ejecutar `npm run build` y confirmar artefactos en `frontend/dist/` sin errores Tailwind
- [x] 6.6 Detener procesos de desarrollo limpiamente
- [x] 6.7 Crear informe `openspec/changes/t-05-02-tailwind-theme/reports/YYYY-MM-DD-step-06-verification.md`
- [x] 6.8 Marcar paso completado solo tras PASS y existir el informe

## 7. Pruebas manuales de endpoints con curl (N/A — sin cambios de API)

Este ticket es **Frontend — Estilos**; no modifica endpoints Express.

- [x] 7.1 Documentar en el informe del paso 6: "Paso curl backend N/A — T-05-02 no altera la API"

## 8. Pruebas E2E con Playwright MCP (OBLIGATORIO — cambio frontend — EL AGENTE DEBE EJECUTAR)

Validar que la SPA carga y el componente de prueba del tema es visible.

- [x] 8.1 Asegurar `npm run dev:web` en ejecución
- [x] 8.2 Navegar a `http://localhost:5173` con Playwright MCP `browser_navigate`
- [x] 8.3 Tomar snapshot y verificar presencia del componente de prueba del tema (colores visibles)
- [x] 8.4 Confirmar ausencia de errores críticos en consola del navegador
- [x] 8.5 Crear informe `openspec/changes/t-05-02-tailwind-theme/reports/YYYY-MM-DD-step-08-e2e-testing.md`
- [x] 8.6 Marcar paso completado solo tras PASS y existir el informe

## 9. Actualizar documentación técnica (OBLIGATORIO)

- [x] 9.1 Actualizar `docs/frontend-standards.md` sección "Variables de tema" con los tokens `--color-*` del DoD y valores ConRutina
- [x] 9.2 Verificar que `docs/development_guide.md` menciona la cadena `index.css` → `tailwind.css` → `theme.css`
- [x] 9.3 Confirmar consistencia entre frontend-standards y `frontend/src/styles/theme.css` implementado
- [x] 9.4 Actualizar README.md solo si el flujo de estilos difiere de la documentación actual

## 10. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas de los pasos 6 y 8 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [ ] 10.1 Confirmar que no quedan tareas de implementación pendientes en este archivo
- [ ] 10.2 Confirmar informes de los pasos 6 y 8 en estado PASS
- [ ] 10.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 10.4 Hacer **commit único** en `feature/T-05-02-tailwind-theme` con mensaje en viñetas (p. ej. `- Definir variables tema ConRutina en theme.css`, `- Añadir componente smoke ThemeSmoke`)
- [ ] 10.5 Subir la rama al remoto: `git push -u origin feature/T-05-02-tailwind-theme` (OBLIGATORIO si existe remoto)
- [ ] 10.6 Cambiar a `develop`: `git checkout develop` y `git pull origin develop`
- [ ] 10.7 Integrar: `git merge feature/T-05-02-tailwind-theme`
- [ ] 10.8 Verificar compilación mínima: `npm run build` y `npm run typecheck`
- [ ] 10.9 (Opcional) Push de `develop`: `git push origin develop`
- [ ] 10.10 Archivar change OpenSpec: `/opsx:archive t-05-02-tailwind-theme`
- [ ] 10.11 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-05-02-tailwind-theme`
