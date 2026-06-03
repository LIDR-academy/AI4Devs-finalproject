# Tasks — T-05-03 · Instalar y configurar shadcn/ui (Radix primitives)

**Ticket:** T-05-03 · **User Story:** US-05 · **Change:** `t-05-03-shadcn-ui` · **Rama:** `feature/T-05-03-shadcn-ui`

## 0. Setup: Crear rama de feature desde develop (OBLIGATORIO — PRIMER PASO)

- [x] 0.1 Actualizar rama `develop`: `git checkout develop` y `git pull origin develop`
- [x] 0.2 Comprobar que no existe la rama local: `git branch --list "feature/T-05-03-shadcn-ui"`
- [x] 0.3 Comprobar que no existe la rama remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-05-03-shadcn-ui"`
- [x] 0.4 Crear y cambiar a la rama: `git checkout -b feature/T-05-03-shadcn-ui`
- [x] 0.5 Verificar rama activa: `git branch --show-current` → debe mostrar `feature/T-05-03-shadcn-ui`
- [x] 0.6 Confirmar que todo el código del change se implementará en esta rama (no en `develop`)

## 1. Auditoría shadcn/ui existente (DoD T-05-03 — estado actual)

- [x] 1.1 Verificar `frontend/src/presentation/components/ui/utils.ts` exporta `cn()` con `clsx` + `tailwind-merge`
- [x] 1.2 Confirmar presencia de los ocho ficheros DoD: `button.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `card.tsx`, `progress.tsx`, `badge.tsx`, `sonner.tsx`
- [x] 1.3 Verificar dependencias Radix/CVA en `package.json` raíz (`@radix-ui/react-*`, `class-variance-authority`, `sonner`, `clsx`, `tailwind-merge`)
- [x] 1.4 Documentar brechas detectadas (p. ej. `sonner.tsx` + `next-themes`, ausencia de `<Toaster />`, falta de `components.json`) en notas del informe del paso 6

## 2. Configuración shadcn CLI (components.json)

- [x] 2.1 Crear `components.json` en la raíz del monorepo según `design.md` (rutas `frontend/src/styles/tailwind.css`, alias `@/presentation/components/ui`)
- [x] 2.2 Validar que el alias `@` en `vite.config.ts` apunta a `frontend/src` y coincide con `components.json`
- [x] 2.3 (Opcional) Ejecutar `npx shadcn@latest init` en modo no interactivo si el JSON manual no es suficiente para el CLI

## 3. Ajustar primitivos del DoD

- [x] 3.1 Revisar cada primitivo DoD: imports Radix, uso de `cn()`, clases semánticas del tema (`bg-primary`, `border-input`, etc.)
- [x] 3.2 Eliminar directivas `'use client'` irrelevantes en Vite de los ficheros tocados
- [x] 3.3 Regenerar con `npx shadcn@latest add <component> --overwrite` solo los ficheros que fallen en `npm run typecheck`
- [x] 3.4 Adaptar `sonner.tsx`: eliminar dependencia de `next-themes`; exportar `Toaster` compatible con SPA Vite (tema `light`)

## 4. Integración Toaster global en App.tsx (DoD T-05-03)

- [x] 4.1 Importar `Toaster` desde `./components/ui/sonner` en `frontend/src/presentation/App.tsx`
- [x] 4.2 Renderizar `<Toaster />` en el árbol raíz de la SPA (fragmento o contenedor sin `overflow: hidden`)
- [x] 4.3 Confirmar que `toast()` de `sonner` funciona (vía smoke del paso 5)

## 5. Componente smoke ShadcnSmoke (validación import/render)

- [x] 5.1 Crear `frontend/src/presentation/components/ShadcnSmoke.tsx` que renderice `Button`, `Card`, `Input`, `Label`, `Badge`, `Progress` y un botón que dispare `toast.success(...)`
- [x] 5.2 Importar `ShadcnSmoke` en `App.tsx` de forma visible para validación E2E
- [x] 5.3 Confirmar que Vite compila sin errores al guardar

## 6. Verificación rápida de tipos y build (pre-pruebas formales)

- [x] 6.1 Ejecutar `npm run typecheck` y confirmar sin errores TypeScript nuevos en `presentation/components/ui/`
- [x] 6.2 Ejecutar `npm run build` y confirmar salida en `frontend/dist/` sin errores
- [x] 6.3 Ejecutar `npm run lint` sobre `frontend/src/presentation/components/ui/` y ficheros tocados

## 7. Revisar y actualizar tests unitarios existentes (OBLIGATORIO si existen tests)

- [x] 7.1 Buscar tests existentes relacionados con componentes UI shadcn — documentar N/A si no hay
- [x] 7.2 Documentar "N/A — T-05-03 sin tests unitarios de primitivos UI" en el informe del paso 8 (el ticket indica validación en componentes de negocio posteriores)

## 8. Ejecutar tests unitarios y verificar el estado de la aplicación (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

**Enfoque para T-05-03 (frontend componentes): verificar dev server, renderizado de primitivos, toast Sonner y build.**

- [x] 8.1 Ejecutar `npm run dev:web` y verificar que Vite arranca en `http://localhost:5173` sin errores de compilación
- [x] 8.2 Abrir `http://localhost:5173` y confirmar que la SPA carga sin errores en consola del navegador
- [x] 8.3 Inspeccionar visualmente `ShadcnSmoke`: Button, Card, Input, Label, Badge, Progress renderizados con estilos del tema
- [x] 8.4 Pulsar botón de toast en smoke y confirmar que la notificación Sonner aparece sin errores
- [x] 8.5 Ejecutar `npm run build` y confirmar artefactos en `frontend/dist/` sin errores
- [x] 8.6 Detener procesos de desarrollo limpiamente
- [x] 8.7 Crear informe `openspec/changes/t-05-03-shadcn-ui/reports/YYYY-MM-DD-step-08-verification.md`
- [x] 8.8 Marcar paso completado solo tras PASS y existir el informe

## 9. Pruebas manuales de endpoints con curl (N/A — sin cambios de API)

Este ticket es **Frontend — Componentes UI**; no modifica endpoints Express.

- [x] 9.1 Documentar en el informe del paso 8: "Paso curl backend N/A — T-05-03 no altera la API"

## 10. Pruebas E2E con Playwright MCP (OBLIGATORIO — cambio frontend — EL AGENTE DEBE EJECUTAR)

Validar que la SPA carga, los primitivos smoke son visibles y el toast funciona.

- [x] 10.1 Asegurar `npm run dev:web` en ejecución
- [x] 10.2 Navegar a `http://localhost:5173` con Playwright MCP `browser_navigate`
- [x] 10.3 Tomar snapshot y verificar presencia de elementos del smoke shadcn (Button, Input, etc.)
- [x] 10.4 Interactuar con el botón de toast y verificar que aparece la notificación Sonner
- [x] 10.5 Confirmar ausencia de errores críticos en consola del navegador
- [x] 10.6 Crear informe `openspec/changes/t-05-03-shadcn-ui/reports/YYYY-MM-DD-step-10-e2e-testing.md`
- [x] 10.7 Marcar paso completado solo tras PASS y existir el informe

## 11. Actualizar documentación técnica (OBLIGATORIO)

- [x] 11.1 Actualizar `docs/frontend-standards.md` sección "Componentes UI disponibles" con la lista concreta del DoD T-05-03 y ruta `presentation/components/ui/`
- [x] 11.2 Documentar `components.json` y convención para añadir primitivos futuros en `docs/development_guide.md` si aplica
- [x] 11.3 Confirmar consistencia entre frontend-standards y primitivos implementados
- [x] 11.4 Actualizar README.md solo si el flujo de shadcn difiere de la documentación actual

## 12. Cierre Git y archivado OpenSpec (OBLIGATORIO al archivar el change)

**Cuándo:** Solo al ejecutar `/opsx:archive` **después** de que el usuario acepte los cambios y las pruebas de los pasos 8 y 10 estén en PASS.

**IMPORTANTE:** No ejecutar `git commit` durante `/opsx:apply`.

- [ ] 12.1 Confirmar que no quedan tareas de implementación pendientes en este archivo
- [ ] 12.2 Confirmar informes de los pasos 8 y 10 en estado PASS
- [ ] 12.3 Confirmar con el usuario que acepta los cambios antes de commitear
- [ ] 12.4 Hacer **commit único** en `feature/T-05-03-shadcn-ui` con mensaje en viñetas (p. ej. `- Configurar shadcn/ui con components.json`, `- Montar Toaster Sonner en App.tsx`, `- Añadir ShadcnSmoke de validación`)
- [ ] 12.5 Subir la rama al remoto: `git push -u origin feature/T-05-03-shadcn-ui` (OBLIGATORIO si existe remoto)
- [ ] 12.6 Cambiar a `develop`: `git checkout develop` y `git pull origin develop`
- [ ] 12.7 Integrar: `git merge feature/T-05-03-shadcn-ui`
- [ ] 12.8 Verificar compilación mínima: `npm run build` y `npm run typecheck`
- [ ] 12.9 (Opcional) Push de `develop`: `git push origin develop`
- [ ] 12.10 Archivar change OpenSpec: `/opsx:archive t-05-03-shadcn-ui`
- [ ] 12.11 Intentar marcar ticket implementado: `npm run openspec:mark-ticket -- --change t-05-03-shadcn-ui`
