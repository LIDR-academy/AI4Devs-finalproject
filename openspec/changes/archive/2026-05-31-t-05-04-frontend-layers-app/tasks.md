# Tasks — T-05-04 · Crear estructura de capas del frontend y App.tsx base



**Ticket:** T-05-04 · **User Story:** US-05 · **Change:** `t-05-04-frontend-layers-app` · **Rama:** `feature/T-05-04-frontend-layers-app`



## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)



- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`

- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-05-04-frontend-layers-app"`

- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-05-04-frontend-layers-app"`

- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-05-04-frontend-layers-app`

- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-05-04-frontend-layers-app`

- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)



## 1. Auditoría de capas existentes (DoD T-05-04 — estado actual)



- [x] 1.1 Verificar existencia de `frontend/src/domain/`, `application/`, `infrastructure/`, `presentation/components/`, `styles/`

- [x] 1.2 Documentar en notas del informe del paso 8 qué ficheros ya existen por capa y qué brechas quedan (p. ej. `fonts.css` vacío, sin `httpClient.ts`, `App.tsx` monolítico)

- [x] 1.3 Confirmar que `frontend/src/main.tsx` importa `./presentation/App` y `./styles/index.css`



## 2. Documentación por capa (DoD — estructura formalizada)



- [x] 2.1 Crear `frontend/src/domain/README.md` describiendo tipos y lógica pura (sin React)

- [x] 2.2 Crear `frontend/src/application/README.md` describiendo hooks y casos de uso

- [x] 2.3 Crear `frontend/src/infrastructure/README.md` describiendo clientes HTTP y adaptadores

- [x] 2.4 Verificar que `presentation/components/` contiene subcarpeta `ui/` (shadcn, T-05-03) y crear `presentation/components/layout/` para el shell



## 3. Cliente HTTP base en infrastructure (spec — httpClient)



- [x] 3.1 Crear `frontend/src/infrastructure/httpClient.ts` con wrapper `apiGet<T>(path)` sobre `fetch('/api' + path)`

- [x] 3.2 Refactorizar `frontend/src/infrastructure/profileApi.ts` para usar `httpClient` sin cambiar el contrato exportado

- [x] 3.3 Ejecutar `npm run typecheck` y confirmar que `useUserProfile` sigue compilando



## 4. Fuentes globales en fonts.css (DoD T-05-04)



- [x] 4.1 Completar `frontend/src/styles/fonts.css` con `@import` de Inter (Google Fonts) y variables `--font-sans` / `--font-display`

- [x] 4.2 Exponer utilidades tipográficas en `theme.css` o `@theme` de Tailwind (`font-sans`, `font-display`) según `design.md`

- [x] 4.3 Confirmar que `frontend/src/styles/index.css` importa `./fonts.css` antes de `tailwind.css` y `theme.css`

- [x] 4.4 Actualizar `frontend/src/presentation/components/Header.tsx`: eliminar `style={{ fontFamily: 'Georgia' }}` y usar clase tokenizada



## 5. Componentes de layout (DoD — App.tsx base)



- [x] 5.1 Crear `frontend/src/presentation/components/layout/AppLayout.tsx` con contenedor `min-h-screen bg-background max-w-5xl mx-auto px-4 py-8` y slot para header/profile

- [x] 5.2 Crear `StatsSection.tsx` — wrapper del grid de tarjetas de estadísticas

- [x] 5.3 Crear `CalendarSection.tsx` — card con encabezado "Calendario semanal" e icono `Calendar`

- [x] 5.4 Crear `RewardsSection.tsx` — card con encabezado "Recompensas" e icono `Gift`

- [x] 5.5 Refactorizar `frontend/src/presentation/App.tsx` para componer layout + secciones; eliminar estilos inline `#FAF8F5` en favor de tokens Tailwind

- [x] 5.6 Mantener `<Toaster />` de shadcn (T-05-03) en el árbol raíz de `App.tsx`



## 6. Verificación rápida de tipos y build (pre-pruebas formales)



- [x] 6.1 Ejecutar `npm run typecheck` sin errores TypeScript en capas tocadas

- [x] 6.2 Ejecutar `npm run build` y confirmar salida en `frontend/dist/` sin errores

- [x] 6.3 Ejecutar `npm run lint` sobre `frontend/src/presentation/`, `infrastructure/` y `styles/` modificados



## 7. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)



- [x] 7.1 Buscar tests existentes relacionados con layout o capas frontend — documentar N/A si no hay

- [x] 7.2 Documentar "N/A — T-05-04 sin tests unitarios; validación manual/build" en el informe del paso 8



## 8. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



**Enfoque para T-05-04 (frontend arquitectura): verificar dev server, secciones del layout y build.**



- [x] 8.1 Ejecutar `npm run dev:web` y verificar que Vite arranca en `http://localhost:5173` sin errores de compilación

- [x] 8.2 Abrir `http://localhost:5173` y confirmar que la SPA carga sin errores en consola del navegador

- [x] 8.3 Verificar visualmente cabecera (título "Mis Hábitos"), grid de stats (4 tarjetas), sección "Calendario semanal" y sección "Recompensas"

- [x] 8.4 Confirmar que las fuentes Inter/Georgia se aplican (inspeccionar computed styles o tipografía visible)

- [x] 8.5 Ejecutar `npm run build` y confirmar artefactos en `frontend/dist/` sin errores

- [x] 8.6 Detener procesos de desarrollo limpiamente

- [x] 8.7 Crear informe `openspec/changes/t-05-04-frontend-layers-app/reports/YYYY-MM-DD-step-08-verification.md`

- [x] 8.8 Marcar paso completado solo tras PASS y existir el informe



## 9. Pruebas manuales de endpoints con curl (N/A — sin cambios de API)



Este ticket es **Frontend — Arquitectura**; no modifica endpoints Express.



- [x] 9.1 Documentar en el informe del paso 8: "Paso curl backend N/A — T-05-04 no altera la API"

- [x] 9.2 (Opcional) Verificar que `UserProfileCard` sigue funcionando si el backend está activo: `curl http://localhost:3001/api/profile` — solo como smoke de integración existente, no requisito del ticket



## 10. Pruebas E2E con Playwright MCP (OBLIGATORIO — cambio frontend — EL AGENTE DEBE EJECUTAR)



Validar que la SPA carga y las secciones del layout base son visibles.



- [x] 10.1 Asegurar `npm run dev:web` en ejecución

- [x] 10.2 Navegar a `http://localhost:5173` con Playwright MCP `browser_navigate`

- [x] 10.3 Snapshot: confirmar texto "Mis Hábitos", "Calendario semanal", "Recompensas" y al menos una tarjeta de stats

- [x] 10.4 Verificar ausencia de errores críticos en consola (snapshot o inspección)

- [x] 10.5 Crear informe `openspec/changes/t-05-04-frontend-layers-app/reports/YYYY-MM-DD-step-10-e2e-testing.md`

- [x] 10.6 Marcar paso completado solo tras PASS y existir el informe



## 11. Actualizar documentación técnica (OBLIGATORIO)



- [x] 11.1 Actualizar `docs/frontend-standards.md` — diagrama de estructura con `presentation/components/layout/` y `infrastructure/httpClient.ts` si difiere del actual

- [x] 11.2 Verificar que `docs/development_guide.md` no requiere cambios (o actualizar si se documenta nueva convención de capas)

- [x] 11.3 Confirmar N/A en `docs/api-spec.yml`, `docs/data-model.md`, `docs/backend-standards.md` salvo referencias cruzadas

- [x] 11.4 Verificar consistencia entre documentación y código final



## 12. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)



**Cuándo:** Tras `/opsx:archive`, cuando el usuario acepte los cambios y las pruebas obligatorias hayan pasado.



**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.



- [x] 12.1 Confirmar que no quedan tareas de implementación pendientes en este `tasks.md`

- [x] 12.2 Confirmar informes de verificación (pasos 8 y 10) en estado PASS

- [x] 12.3 Confirmar con el usuario que acepta los cambios antes de commitear

- [ ] 12.4 Hacer **commit único** en `feature/T-05-04-frontend-layers-app` con mensaje en viñetas breves

- [ ] 12.5 Push de la rama al remoto: `git push -u origin feature/T-05-04-frontend-layers-app`

- [ ] 12.6 Integrar en `develop`: `git checkout develop`, `git pull origin develop`, `git merge feature/T-05-04-frontend-layers-app`

- [ ] 12.7 Verificar que `develop` compila: `npm run typecheck` y `npm run build`

- [ ] 12.8 Archivar change OpenSpec (`mv` a `openspec/changes/archive/YYYY-MM-DD-t-05-04-frontend-layers-app/`)

- [ ] 12.9 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-05-04-frontend-layers-app`

