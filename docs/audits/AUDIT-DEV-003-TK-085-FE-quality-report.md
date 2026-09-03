# 📊 Informe de Auditoría de Código VSDD - Ticket TK-085-FE

* **ID Auditoría:** AUDIT-DEV-003
* **Fecha de Auditoría:** 2026-09-02
* **Reviewer:** Subagente Independiente (Reviewer Adversarial)
* **Ticket Evaluado:** TK-085-FE — Adopción de `react-router-dom` + Shell de Rutas FEFO (`AppShell` + `ProtectedRoute`)
* **User Story:** US-023 · **Matriz:** REQ-025
* **Alcance revisado:** `git diff --cached` (27 archivos, +1130 / −844)

---

## 📋 Resumen por Fases

| Fase | Resultado |
| :--- | :--- |
| Fase 0 (Descubrimiento de Reglas / Cascada Spec-antes-que-Código) | **PASÓ** |
| Fase 1 (Mutation Testing ≥ 70%) | **N/A** — ticket frontend puro; no toca dominio ni casos de uso |
| Fase 2 (Arquitectura / SOLID / Complejidad / Duplicación / Código Muerto) | **PASÓ (acotado al ticket)** — con salvedad repo-level en duplicación |
| Fase 3 (Anti-Drift Arquitectónico / Build / Estructura) | **DEFECTUOSA** — divergencia RBAC spec↔impl↔backend y contradicción regla↔test |
| Fase 4 (Seguridad / Entornos / Sanitización / Dependencias) | **PASÓ (acotado al ticket)** — con salvedad repo-level en `pnpm audit` |
| Fase 5 (UI / WCAG 2.1 / Ergonomía Táctil) | **PASÓ con observaciones menores** |

---

## 🔬 Detalle por Fase

### FASE 0 — Descubrimiento Dinámico de Reglas · PASÓ

* Reglas activas leídas en `docs/04_governance_and_quality/rules/`: `frontend_rules.md`, `react-router_rules.md` (nuevo), `testing_rules.md`, `security_rules.md`, `git_rules.md`, `domain/backend/database_rules.md`.
* Runner: **Vitest** (`pnpm --filter @restostock/frontend test -- --run`). Linter/compilador: **`tsc --noEmit` + ESLint 9** (`pnpm --filter @restostock/frontend run lint`). Build: **`tsc && vite build`**. Duplicación: **jscpd 5.x** (`pnpm run duplication`, umbral 3%). Gates deterministas: `check_ticket_code_quality.sh`, `check_dead_code.sh`.
* **Cascada Spec-Antes-que-Código (Guard 26):**
  * `docs/05_agile_planning/12_tickets/shared/frontend/TK-085-FE.md` existe, `status: approved`, `related_story: US-023`, `points: 8`.
  * `docs/05_agile_planning/11_user_stories/shared/US-023.md` existe con 4 escenarios Gherkin y las 6 decisiones de negocio consultadas con el humano.
  * Fila `REQ-025` presente en `docs/05_agile_planning/13_matriz_trazabilidad.md` (línea 47), estado `📋 Approved Spec`, enlaza US-023 → TK-085..088.
  * Los artefactos de Etapa 1 se commitearon en `24552f6` (`docs(design-system): spec US-023 FEFO app shell...`, 2026-09-02 19:44) **antes** de la implementación (aún staged, sin commitear). Es spec previa real, no reconstrucción retroactiva. ✔️
  * Enmienda al stack manifest (`docs/00_stack_manifest.md` §4 v1.13.0, Guard 24) aprobada por el humano el 2026-09-02 — precondición cumplida.

### FASE 1 — Anti-Tautología / Mutation Testing · N/A

* El diff no toca capa de dominio ni casos de uso (backend intacto). No aplica Stryker.
* La suite frontend nueva (`src/tests/AppShellRouting.test.tsx`) contiene 5 tests con aserciones reales sobre DOM (`getByText`, `getByRole`, `queryByRole ... not.toBeInTheDocument`) — no hay tests vacíos ni triviales. Ver observación O-4 sobre cobertura.

### FASE 2 — Arquitectura / SOLID / Métricas · PASÓ (acotado al ticket)

* **Aislamiento de capas:** correcto. `apps/frontend/src/app/` sólo consume React, `react-router-dom` y servicios de `features/*/services/` (que ya encapsulan `apiClient`). Ningún componente llama `fetch()` directo.
* **SRP / Custom Hooks:** buena descomposición. `App.tsx` 663→14 líneas. Lógica transversal extraída a hooks dedicados: `useSession` (sesión + idle + listener `restostock:unauthorized`), `useFefoTheme` (tema día/noche con `useLayoutEffect`, conforme a `frontend_rules.md` §3), `useResetPinToken` (magic link vía `useSearchParams`), `useRestaurantName` (wordmark con fallback y guard de cancelación). Contexto de sesión tipado con fail-fast (`useAppShell()` lanza fuera del provider) — conforme a `react-router_rules.md` §5.
* **`check_ticket_code_quality.sh`:** ✅ 19 archivos del ticket limpios (complexity / max-lines-per-function ≤60 / max-depth ≤4).
* **`check_dead_code.sh` (knip):** ✅ "Ningún archivo tocado por el ticket introduce código muerto nuevo." `AdminDropdownMenu.tsx` + `.module.css` y `App.module.css` eliminados correctamente (Guard 5). 9 hallazgos preexistentes fuera del diff — informativos.
* **`pnpm run duplication` (jscpd):** ⚠️ **exit code 1 — 3.20 % > umbral 3.0 % a nivel repositorio.** Análisis adversarial:
  * **Ninguno de los 38 clones está en archivos del ticket** (verificado con `grep` sobre la salida: `app/router.tsx`, `AppShell`, `AppNav`, `AppSidebar`, `AppTopBar`, `ProtectedRoute`, `ThemeToggle`, `session.ts`, `use*.ts`, `app/routes/*` → 0 coincidencias).
  * Todos los clones viven en archivos preexistentes no tocados (`PrismaStockRepository.ts`, `RecipeCatalogPanel.tsx`, `InsumoCatalogPanel.tsx`, `ReportsDashboard.tsx`, `WarehouseExtractionModal.tsx`, `index.css`).
  * El ticket **reduce** el total (baseline informado pre-ticket 3.83 % → 3.20 %) al borrar `App.tsx` (663 líneas), `App.module.css` y `AdminDropdownMenu`.
  * Conforme a la nota del propio workflow ("Deuda preexistente en archivos que el ticket no tocó no cuenta contra esta fase") y al principio de gates acotados al diff (MEMORY: *"bloqueante en el diff sin commitear, informativo a nivel repo"*), **no se imputa como defecto de TK-085-FE**.
  * **Sí es un problema de repo:** `pnpm run duplication` está declarado bloqueante en CI (`ci.yml`) y hoy sale rojo — ver Candidato a Regla Permanente C-1.

### FASE 3 — Anti-Drift Arquitectónico / Build · DEFECTUOSA

* **3.1 Esquemas / contratos API:** N/A — el ticket no toca esquema físico, DDL, ni contratos OpenAPI. `check_schema_drift.sh` no aplica.
* **3.2 Build:** ✅ `pnpm --filter @restostock/frontend run build` limpio. `tsc` sin errores, `vite build` → 1572 módulos, `dist/` con `index.html` + 1 CSS + 1 JS (sin subdirectorios anidados). **Sin warnings de peer-deps de React** (AC #5). `dist` coincide con la SPA esperada.
* **3.3 / 3.4 Persistencia CLI / Ejecución real (Docker/seed/migraciones):** **N/A — NO APLICA.** El ticket no toca `Dockerfile`, `docker-compose.yml`, IaC, seeds ni migraciones. `check_seed_idempotency.sh` / `check_container_security.sh` / `check_iac_syntax.sh` no se ejecutan por diseño (fuera de alcance del diff).
* **3.5 Cambios en caliente vs documentación viva — DEFECTOS:**
  * **D-1 (Medio — requiere decisión humana, Antipatrón C):** El ticket mueve `InsumoCatalogPanel` a la ruta `/estaciones` y `RecipeCatalogPanel` a `/recetas`, **ambas rutas sólo de sesión** (visibles a cualquier operario autenticado, p. ej. `KITCHEN_STAFF`). Hasta este diff, esos dos paneles **sólo eran alcanzables a través de `CatalogManagementPanel`, que tiene gate duro `if (userRole !== 'ADMIN')`** (`apps/frontend/src/features/catalog/components/CatalogManagementPanel.tsx:27`) montado desde el `AdminDropdownMenu` (también ADMIN).
    * `InsumoCatalogPanel.tsx:28` renderiza **"+ Nuevo Insumo"** y `:64` **"Reabastecer"** sin ninguna condición de rol.
    * `RecipeCatalogPanel.tsx:28` renderiza **"+ Nueva Receta"** sin condición de rol.
    * El backend **sí** protege estas mutaciones: `stock.routes.ts:37` `POST /insumos` → `requireRole('ADMIN')`, `:40` `PATCH /insumos/:id/restock` → `requireRole('ADMIN')`, `recipes.routes.ts:16` `POST /` → `requireRole('ADMIN')`. **No es un agujero de seguridad** (el backend devuelve 403), pero es una **regresión funcional / de UX**: un operario no-ADMIN ahora ve botones de alta/reabastecimiento que antes no existían para él y que fallarán con 403. Esto contradice **US-023 Escenario 3 ("cero regresión funcional")**.
    * US-023 Pregunta 3 lista "reabastecimiento" como capacidad de Estaciones para "cualquier operario autenticado", pero el diseño RBAC del backend lo restringe a ADMIN → **spec ↔ implementación ↔ backend divergen**. Un módulo con diseño aprobado (`05_ui_ux_design_system.md`, RBAC de `US-015`/`TK-073`) diverge sin que ningún script lo documente como riesgo residual. **No lo resuelvo en ninguna dirección — se eleva al humano** como decisión explícita de alcance (¿ocultar las acciones admin por rol dentro de los paneles, o waiver explícito de que 403 es aceptable en esas rutas?).
  * **D-2 (Menor — contradicción de artefactos en el mismo commit):** `docs/04_governance_and_quality/rules/react-router_rules.md` §1 declara **"PROHIBIDO `<BrowserRouter>` + `<Routes>`/`<Route>` (modo declarativo)"** y §7 dice **"Un test que necesite arrancar en otra ruta o navegar debe usar `createMemoryRouter` con `initialEntries`"**. El test entregado en el mismo diff, `src/tests/AppShellRouting.test.tsx:3,19`, usa exactamente `<MemoryRouter> + <Routes> + <Route>` declarativo. La regla que el ticket introduce prohíbe lo que el ticket entrega. Debe reconciliarse: o §7 documenta explícitamente la excepción por la limitación de jsdom (choque de realms de `AbortSignal` en undici con `createMemoryRouter`), o el test se ajusta. Tal como está, una auditoría futura de este mismo test lo marcará como violación.
* **Nota sobre la limitación jsdom (evaluación del enfoque de test):** El comentario del test afirma que `createMemoryRouter` no navega bajo jsdom. Verificado indirectamente: los tests preexistentes `App.test.tsx`, `ThemeToggle.test.tsx`, `FrontendMVP.test.tsx`, `PinLogin.test.tsx` renderizan `<App />` (= `<RouterProvider>` con `createBrowserRouter`) **sin modificarse y siguen en verde** — o sea, `createBrowserRouter` sí renderiza la ruta inicial bajo jsdom; el problema declarado es la navegación imperativa. El enfoque declarativo con `<MemoryRouter>` es **aceptable como pragmatismo** (ejercita los componentes reales `AppShell`/`ProtectedRoute`/rutas), pero deja un hueco real: (a) el árbol de rutas de `app/router.tsx` se **re-declara a mano** en el test, así que un drift en `router.tsx` (p. ej. quitar el `<ProtectedRoute>`) no lo detecta ningún test; (b) US-023 Escenario 1 (deep-link + botón "atrás" = transición cliente sin full reload) **no tiene test**. Recomendado (no bloqueante): un smoke test que importe `router` real de `app/router.tsx` y verifique al menos la forma del árbol, o un test de navegación con `createMemoryRouter` marcado `it.skip` con enlace al issue de undici.

### FASE 4 — Seguridad / Entornos / Sanitización / Dependencias · PASÓ (acotado al ticket)

* **Control de acceso de ruta:** `ProtectedRoute.tsx:22` usa `<Navigate to="/" replace />` — **código de producción correcto**. `replace` evita dejar la ruta prohibida en el historial (conforme a `react-router_rules.md` §3). La separación de responsabilidades es limpia: sesión ausente → `AppShell` renderiza `PinLoginModal`; rol insuficiente → `ProtectedRoute` redirige. El orden de guardas en `AppShell.tsx` (resetToken → `!currentUser` → `mustChangePin` → shell) **preserva exactamente** el orden del `App.tsx` original.
* **`useResetPinToken` vs manejo antiguo:** el antiguo `App.tsx` leía `new URLSearchParams(window.location.search).get('resetToken')` una vez (initializer de `useState`) y limpiaba con `window.history.replaceState({}, '', window.location.pathname)` (borraba **todos** los query params + path). El nuevo `useResetPinToken` usa `useSearchParams()` (reactivo) y `clear()` borra **sólo** `resetToken` con `{ replace: true }`, preservando otros params y el path. **No se pierde comportamiento relevante** (el magic link es `/?resetToken=…`); el nuevo es más correcto y conforme a `react-router_rules.md` §4. `onSuccess` → `notify(...)` reproduce el `setSessionNotice('¡PIN restablecido…')` original; `onCancel` → `clear()` reproduce el descarte. El aviso cae en `PinLoginModal initialNotice` como antes. ✔️
* **`window.location` / `window.history`:** eliminados del código de aplicación (sólo quedan en `useFefoTheme` sobre `document.documentElement.dataset` y `window.matchMedia`, que no son navegación). Conforme a Guard de `react-router_rules.md` §4.
* **Pin exacto (Guard 30, AC #5):** ✅ `apps/frontend/package.json:18` → `"react-router-dom": "7.18.3"` (sin `^`). `pnpm --filter @restostock/frontend why react-router` → `react-router-dom 7.18.3 └── react-router 7.18.3`. Transitivo en **7.x, no 8.x**. `engines: node >=20` compatible con Node 24 LTS del stack. El lockfile sólo añade `cookie@1.1.1` y `set-cookie-parser@2.7.2` como transitivos de `react-router` — ninguno con advisory.
* **`check_dependency_audit.sh`:** ⚠️ exit 1 — 5 vulnerabilidades High no documentadas: `GHSA-3f6p-5ww8-9rcr` (mysql2, vía `@prisma/client`), `GHSA-5jgf-p345-68v8` / `GHSA-f65p-4m7j-42xc` / `GHSA-fph4-wmhf-6fwf` / `GHSA-jqff-g426-hqxp` (fast-uri, vía `@prisma/client`), + vitest/vite (vía `@stryker-mutator/vitest-runner`). **Las 5 están 100 % en `apps/backend` (dependencias transitivas de Prisma/Stryker) — CERO provienen de `react-router-dom`.** Deuda preexistente fuera del diff de este ticket frontend. No se imputa a TK-085-FE; se registra como problema de repo (Candidato C-1).
* **Secretos / Fail-Fast / `parseFloat` / `catch {}`:** el código nuevo no introduce credenciales hardcodeadas, aritmética flotante de inventario, ni bloques catch vacíos (todos los `.catch` loguean con `console.error` y contexto). N/A el resto (sin rutas backend, sin env nuevas, sin `loader`/`action`).

### FASE 5 — UI / Accesibilidad / Ergonomía Táctil · PASÓ con observaciones menores

* **Objetivo táctil ≥48px (AC #9):** ✅
  * `AppShell.module.css` `.nav-link` → `min-height: 48px`.
  * `.theme-toggle-btn` → `min-height: 48px; min-width: 48px; touch-action: manipulation`.
  * `.btn-touch` global (`index.css:141`) → `min-height/min-width: 48px` — usado por logout, y por todos los botones de `AjustesRoute`, `EstacionesRoute`, `InventarioRoute`.
* **ARIA / semántica:** ✅ `<nav aria-label="Navegación principal">` (`AppNav.tsx`). `ThemeToggle` con `role="group" aria-label="Modo de color del tablero"` + `aria-pressed` por botón. Perforaciones y status-dot con `aria-hidden="true"`. `<NavLink className={({ isActive }) => …}>` con render-prop + `end` en la ruta index (conforme a `react-router_rules.md` §4).
* **Contraste del wordmark (bg `var(--rule)` / texto `var(--bg-root)`):** ✅ **legible en ambos turnos.** Día: `--rule` `#18140f` (casi negro) sobre `--bg-root` `#efe8d8` (crema) — inversión de máximo contraste, ≫ 7:1 AAA. Noche: `--rule` `#e9e4d0` (crema claro) / `--bg-root` `#171c18` (casi negro) — invierte limpiamente, ≫ 7:1. El par usa los dos tokens de luminancia extrema de cada tema, así que la legibilidad es estructural, no accidental. Conforme a `frontend_rules.md` §2 (objetivo AAA 7:1 para cocina industrial).
* **Guard 29 (sin `style={{}}` inline):** ✅ ningún archivo nuevo usa `style={{}}`. Todo el layout/color pasa por `AppShell.module.css` o clases globales de `index.css`.
* **Sin `<div onClick>`:** ✅ todos los controles interactivos son `<button>` o `<NavLink>`/`<Link>`.
* **O-1 (Menor):** `AppTopBar.tsx` botón "Cerrar Sesión" y los botones de `AjustesRoute`, `EstacionesRoute`, `InventarioRoute` (`PageHeading`, `ActionCard`) **omiten `type="button"`**. Sin efecto funcional (no hay `<form>` contenedor), pero es convención del proyecto (`ThemeToggle` y el desaparecido `AdminDropdownMenu` sí lo ponían). Se arrastra del `App.tsx` original; conviene añadirlo en los archivos nuevos.
* **O-2 (Menor):** `AppTopBar.tsx` `SessionBadge` renderiza sólo `<span className={styles['status-dot']} aria-hidden="true" />` (punto verde) sin el texto **"Conectado"** que pide el ticket ("indicador `● Conectado`"). El indicador queda como color puro (verde) sin alternativa textual visible; `aria-hidden` evita información falsa a lectores de pantalla pero también lo hace invisible semánticamente. Roza `frontend_rules.md` §2 (independencia del color). Añadir el label "Conectado".
* **O-3 (Menor):** `AppShell.module.css` usa literales de píxel en vez de la escala de tokens que exige AC #7 (`--space-*`/`--fs-*`): `.theme-toggle-btn { padding: 10px 16px }`, `.wordmark { font-size: 1.5rem }`, `.punch { right: -9px; width: 18px; height: 18px }`, `.punch-top { top: 56px }`, `@media { font-size: 1.15rem }`, varios `border: 2px`. `.theme-toggle-btn` se copió textual del `App.module.css` borrado (mismo `10px 16px`). No bloquea (Guard 29 permite CSS en `.module.css`; la infracción es contra el AC #7 del propio ticket), pero es incumplimiento literal del criterio de aceptación.
* **O-4:** ver FASE 3 "Nota sobre la limitación jsdom" — hueco de cobertura de `app/router.tsx` real y de US-023 Escenario 1.

---

## 🚨 Defectos Detectados

| ID | Sev | Archivo:línea | Descripción | Acción esperada |
| :-- | :-- | :-- | :-- | :-- |
| **D-1** | Medio | `apps/frontend/src/app/routes/EstacionesRoute.tsx:35`, `RecetasRoute.tsx:5`; paneles `InsumoCatalogPanel.tsx:28,64`, `RecipeCatalogPanel.tsx:28` | Acciones ADMIN (crear insumo, reabastecer, crear receta) quedan visibles a operarios no-ADMIN al mover los paneles a rutas sólo-de-sesión; antes estaban tras el gate `userRole !== 'ADMIN'` de `CatalogManagementPanel`. Backend responde 403 → regresión de UX y contradicción US-023 Escenario 3 + divergencia spec↔RBAC backend. | **Decisión humana explícita** (Antipatrón C): ocultar las acciones por rol dentro de los paneles, o waiver documentado de que el 403 es aceptable en `/estaciones` y `/recetas`. |
| **D-2** | Menor | `docs/04_governance_and_quality/rules/react-router_rules.md` §1/§7 ↔ `apps/frontend/src/tests/AppShellRouting.test.tsx:3,19,35` | La regla entregada en el mismo commit prohíbe el `<MemoryRouter>+<Routes>` declarativo que el test entregado usa. | Reconciliar: §7 documenta la excepción por limitación de jsdom, o el test migra a `createMemoryRouter`. |
| **O-1** | Menor | `apps/frontend/src/app/AppTopBar.tsx:29`, `routes/AjustesRoute.tsx:26`, `routes/EstacionesRoute.tsx:22,26`, `routes/InventarioRoute.tsx` (`PageHeading`, `ActionCard`) | Botones interactivos sin `type="button"`. | Añadir `type="button"` en los archivos nuevos. |
| **O-2** | Menor | `apps/frontend/src/app/AppTopBar.tsx` (`SessionBadge`) | Indicador de conexión sin texto "Conectado" (color puro, `aria-hidden`). | Añadir label textual. |
| **O-3** | Menor | `apps/frontend/src/app/AppShell.module.css` (`.theme-toggle-btn`, `.wordmark`, `.punch*`, media query) | Literales de píxel/rem en vez de la escala `--space-*`/`--fs-*` que exige AC #7. | Migrar a tokens o justificar como valores geométricos no tokenizables (perforaciones). |
| **O-4** | Menor | `apps/frontend/src/tests/AppShellRouting.test.tsx` | El árbol de rutas real de `app/router.tsx` no lo cubre ningún test (se re-declara a mano); US-023 Escenario 1 (deep-link + back) sin test. | Smoke test que importe `router` real, o test de navegación `it.skip` con enlace al issue de undici. |

---

## 🔁 Candidatos a Regla Permanente (Filtro de Sistemicidad, FASE 6.1)

* **C-1 — Gate de duplicación y `pnpm audit` acotados al diff del ticket (además del repo-level).**
  * **Patrón sistémico:** `pnpm run duplication` (3.20 % > 3 %) y `check_dependency_audit.sh` (5 GHSAs backend) salen **rojos a nivel repo por deuda preexistente ajena al ticket**. Hoy sólo `check_ticket_code_quality.sh` (ESLint metrics) y `check_dead_code.sh` (knip) tienen variante acotada al diff sin commitear; jscpd y `pnpm audit` sólo corren repo-wide. Cualquier ticket futuro — no sólo éste — chocará con el mismo falso bloqueo, y el workflow de auditoría (FASE 2.4 y FASE 4.2.2) los declara "bloqueantes reales", contradiciendo el principio ya establecido en MEMORY (*gates nuevos acotados al diff; informativo a nivel repo*).
  * **Destino propuesto:** nuevo script `docs/04_governance_and_quality/scripts/check_ticket_duplication.sh` (jscpd sólo sobre archivos sin commitear del ticket, mismo criterio que `check_ticket_code_quality.sh`) + ajuste redaccional en `.agents/workflows/04_dev_audit_workflow.md` FASE 2.4 y FASE 4.2.2 aclarando "bloqueante en el diff del ticket; informativo a nivel repo (no bloquea por deuda preexistente)". Requiere aprobación humana explícita (procedimiento FASE 5.C de `02_cascading_dev_workflow.md`). El estado repo-level rojo de jscpd/audit debe además abrir su propio ticket de saneamiento.

* **C-2 — Al mover un componente de un contexto con role-gate a un contexto sin él, verificar que el componente no exponga acciones que el gate anterior cubría.**
  * **Patrón sistémico:** D-1 no es exclusivo de estos dos paneles. TK-086/087/088-FE heredan este shell y pueden re-ubicar más paneles; la migración de "todo tras un menú ADMIN" a "rutas por sección" es un movimiento repetido. La regla de "un componente sin conciencia de rol sólo es seguro mientras su punto de montaje lo proteja" merece quedar codificada.
  * **Destino propuesto:** viñeta nueva en `docs/04_governance_and_quality/rules/frontend_rules.md` §3 (o §RBAC): *"Antes de montar un componente existente en una ruta/contenedor con menor restricción de acceso que su punto de montaje anterior, auditar cada `<button>`/acción de mutación del componente contra el RBAC del endpoint que dispara; si el endpoint exige un rol superior al de la ruta, la acción debe renderizarse condicionalmente por rol, no dejarse fallar en 403."* Requiere aprobación humana explícita.

---

## ⚖️ VEREDICTO FINAL

## RECHAZADO CON DEFECTOS

**Motivo principal (D-1, FASE 3.5):** el ticket expone acciones administrativas (crear insumo, reabastecer, crear receta) a operarios no-ADMIN al reubicar `InsumoCatalogPanel` y `RecipeCatalogPanel` en rutas sólo-de-sesión, saltándose el gate `userRole !== 'ADMIN'` que antes las cubría. El backend lo contiene con 403, así que **no es una brecha de seguridad**, pero es una regresión de UX que contradice US-023 Escenario 3 ("cero regresión funcional") y una divergencia spec↔implementación↔RBAC backend que — por Antipatrón C — **debe resolver el humano**, no el reviewer. **Motivo secundario (D-2):** la regla `react-router_rules.md` §7 entregada en el mismo diff prohíbe el patrón de test que el diff entrega.

**Lo que sí está sólido y no debe rehacerse:** la arquitectura del shell (descomposición SOLID, hooks dedicados, contexto tipado fail-fast), el pin exacto `react-router-dom@7.18.3` con transitivo 7.x, el build limpio sin warnings de peer-deps, `ProtectedRoute` con `<Navigate replace>` como código de producción correcto, la preservación exacta del orden de guardas y del flujo de `resetToken`, los objetivos táctiles ≥48px, el contraste AAA del wordmark en ambos turnos, Guard 29 respetado, 119/119 tests en verde, lint 0 errores, y los gates deterministas acotados al ticket (`check_ticket_code_quality.sh`, `check_dead_code.sh`) en verde. Los fallos repo-level de jscpd y `pnpm audit` son deuda preexistente ajena a este diff y **no cuentan contra el ticket**.

**Camino a APROBADO:** (1) resolver D-1 con el humano (ocultar acciones por rol en los dos paneles, o waiver documentado); (2) reconciliar D-2; (3) opcionalmente O-1..O-4. Ninguno exige rearquitectura.

---

## ✅ Resolución (post-auditoría, 2026-09-02)

| ID | Resolución |
| :-- | :-- |
| **D-1** | Decisión humana: *"ocultar acciones por rol en los paneles"*. `InsumoCatalogPanel` y `RecipeCatalogPanel` reciben `canManage?: boolean` (default `false`); ocultan `+ Nuevo Insumo` / `Reabastecer` / `+ Nueva Receta`. `EstacionesRoute` oculta además "Ubicaciones" a no-ADMIN. `US-023` P3/P4 y `05_ui_ux_design_system.md` §v4.1.0 reconciliados (reabastecimiento = ADMIN). Tests nuevos en `AppShellRouting.test.tsx` (operario no ve las acciones; ADMIN sí). |
| **D-2** | `react-router_rules.md` §7 ampliado: documenta la excepción jsdom/undici (choque de realms de `AbortSignal`) que permite `<MemoryRouter>` declarativo en tests de shell, y exige un smoke test del `router` real. |
| **O-1** | `type="button"` añadido en los ~7 botones de archivos nuevos. |
| **O-2** | Label textual "Conectado" junto al punto verde en `AppTopBar` (`.status` en `AppShell.module.css`). |
| **O-3** | `--fs-xl`/`--fs-lg`/`--space-*` en `.wordmark`/`.theme-toggle-btn`/media query; geometría de perforaciones documentada como no tokenizable. |
| **O-4** | Smoke test del árbol real de `app/router.tsx` (layout route, rutas de sesión, `<ProtectedRoute ADMIN>` en /reportes y /ajustes). |
| **C-1** | Aprobada. Nuevo `docs/04_governance_and_quality/scripts/check_ticket_duplication.sh` (jscpd acotado al diff: compara clones working-tree vs. HEAD por par de archivos, bloquea solo clones nuevos del ticket). Ajuste redaccional en `.agents/workflows/04_dev_audit_workflow.md` FASE 2.4 y 4.2.2 (jscpd/`pnpm audit` informativos a nivel repo, bloqueantes en el diff). Bullet añadido a `SK-27` (lista de generación de scripts) y a `docs/00_stack_manifest.md` §7. **Pendiente separado:** ticket de saneamiento para bajar el repo bajo el 3 % de jscpd y documentar/remediar los 5 GHSAs High transitivos de Prisma/Stryker. |
| **C-2** | Aprobada. Viñeta nueva en `docs/04_governance_and_quality/rules/frontend_rules.md` §3 ("RBAC al Reubicar un Componente a un Contexto Menos Restringido", `Discovered in TK-085-FE`). |

**Verificación tras correcciones:** 125/125 tests, lint 0 errores, build limpio, `check_ticket_code_quality.sh` / `check_dead_code.sh` / `check_ticket_duplication.sh` verdes, `validate_agents.sh` 0 problemas.
