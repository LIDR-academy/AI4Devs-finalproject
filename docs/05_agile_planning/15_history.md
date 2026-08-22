---
document: pr_history
version: 1.2.0
status: approved
inputs:
  - git_log_and_pr_data
  - docs/05_agile_planning/14_backlog_map.md
---

# 📜 Bitácora de Progreso e Historial de Entregas del Proyecto

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Mapa Jerárquico del Backlog (14_backlog_map.md)](./14_backlog_map.md) | [📖 Glosario & Reglas](../01_product_definition/01_glosario_y_reglas_negocio.md) | [Inicio del Framework (01_glosario_y_reglas_negocio.md) ➡️](../01_product_definition/01_glosario_y_reglas_negocio.md)

---

## 📅 Historial Cronológico de Entregas

> **Plantilla estándar de cada entrada:** `Hito` (qué cambió, en una frase) → `Hallazgo` (opcional, solo si hubo un descubrimiento no trivial) → `Decisión` (opcional, solo si se consultó una decisión de alcance con el humano) → `Acciones Realizadas` (lista verificable) → `Estado` (tests, build/lint/duplicación y deuda residual, si aplica).

### 2026-08-07 - Estabilización de Entorno, Pruebas E2E y Gobernanza IA
- **Hito:** Verificación completa del MVP táctil y aseguramiento de la infraestructura del proyecto.
- **Acciones Realizadas:**
  - ✅ Inyección de seeding de insumos y recetas en `app.ts` para desarrollo efímero.
  - ✅ Verificación E2E de los módulos de extracción de stock, consumo de recetas FEFO y conciliación de turno.
  - ✅ Configuración agnóstica y portátil de la carpeta `.agents/` para reutilización en cualquier repositorio.
  - ✅ Creación de entrypoints multi-copiloto `CLAUDE.md` y `GEMINI.md`.
  - ✅ Protocolo Fast-Track para cambios menores (<10 líneas) documentado en `.agents/rules/`.
- **Estado:**
  - Tests: 36/36 automatizados en verde (`pnpm test`).
  - Build: 0 errores de compilación TypeScript (`pnpm run build`).

### 2026-08-21 - Cierre de Persistencia Parcial en Producción (TK-048)
- **Hito:** `reportRepository`, `recipeRepository` y `reconciliationRepository` dejan de estar en memoria en producción — las 6 repositories de `composition.ts` son ahora Prisma-backed.
- **Hallazgo:** `docs/03_persistence_and_api/06_database_schema.md` (spec aprobado v1.2.0) documenta un modelo de datos considerablemente más completo (enums `DiscardReason`/`LocationType`/`MovementType`, tracking de `userId`/`remanenteId`) que el `schema.prisma` real, que nunca se actualizó para seguirlo.
- **Decisión:** (consultada con el humano) alcance mínimo, alineado con el `schema.prisma` real existente — no se tocaron `User`/`Insumo`/`Remanente`/`StockMovement`. La alineación completa con el spec queda como deuda técnica separada, no resuelta en este ticket.
- **Acciones Realizadas:**
  - ✅ Nuevos modelos `Recipe`, `RecipeIngredient`, `ShiftReconciliation`, `ShiftReconciliationItem` en `schema.prisma`, con la primera migración real del proyecto (`prisma/migrations/` estaba vacío desde el inicio).
  - ✅ `PrismaRecipeRepository`, `PrismaShiftReconciliationRepository`, `PrismaReportRepository` nuevos — el reporte de mermas se deriva agregando `StockMovement` por `type` (`DISCARD_<reason>`), sin tabla nueva.
  - ✅ Validado en vivo contra Postgres real (no solo tests): creación/lectura de recetas, conciliaciones de turno con variancia, y agregación correcta del reporte de mermas combinando ambos formatos de descarte (`DISCARD_EXPIRATION` y `DISCARD` sin sufijo del auto-descarte).
- **Estado:**
  - Tests: 46/46 backend + 52/52 frontend en verde (`pnpm test`).
  - Build/Lint/Duplicación: 0 errores; duplicación 1.50% (umbral 3%).

### 2026-08-21 - Gestión Mínima de Personal (TK-049)
- **Hito:** un restaurante real ya puede dar de alta y desactivar operarios sin redeployar código — hasta ahora los únicos 2 usuarios estaban hardcodeados en `seed.ts`.
- **Acciones Realizadas:**
  - ✅ `POST /api/v1/auth/users` (ADMIN): crea un operario nuevo (nombre, rol, PIN), reutilizando `Pin.createFromRaw` (hash con salt por usuario, ya existente).
  - ✅ `PATCH /api/v1/auth/users/{id}/status` (ADMIN): bloquea/reactiva un operario — nuevos métodos `User.block()`/`User.activate()`, distintos del auto-bloqueo por 5 intentos fallidos pero mismo status.
  - ✅ Ambas rutas protegidas con `authMiddleware` + `requireRole('ADMIN')` propios dentro de `auth.routes.ts` (el router de auth no tenía guard global porque `login-pin` debe ser público).
  - ✅ `openapi.yaml` sincronizado con los 2 endpoints nuevos (mismo criterio de `TK-047`: validado en vivo, no solo declarado).
- **Estado:**
  - Tests: 9 tests nuevos (creación exitosa, login inmediato con el PIN asignado, 403 sin rol ADMIN, 401 sin token, 400 en PIN inválido, bloqueo con verificación de que el login subsecuente falla, reactivación, 404 usuario inexistente) — 55/55 backend + 52/52 frontend en verde.
  - Build/Lint/Duplicación: 0 errores; duplicación 1.48% (umbral 3%).

### 2026-08-21 - Trazabilidad de Movimientos de Stock (TK-050)
- **Hito:** `GET /api/v1/stock/movements` (ADMIN, con filtros `insumoId`/`startDate`/`endDate`) — el modelo `StockMovement` ya se poblaba en cada extracción/consumo/descarte pero nunca se podía consultar; ahora un admin puede auditar "quién movió qué y cuándo". Con esto se completan las 3 implementaciones priorizadas del análisis MVP (persistencia real, gestión de personal, trazabilidad de movimientos) — TK-048, TK-049, TK-050.
- **Acciones Realizadas:**
  - ✅ Nueva interfaz `IStockMovementQueryRepository`, siguiendo el mismo patrón CQRS-ish ya establecido por `IRemanenteQueryRepository` (separación query/write dentro del mismo dominio).
  - ✅ `InMemoryStockMovementQueryRepository` envuelve la misma instancia de `InMemoryStockRepository` (no un store independiente) — los movimientos generados por extracción/descarte/conciliación aparecen automáticamente en la consulta.
  - ✅ `PrismaStockMovementQueryRepository` nuevo. `StockMovementRecord.createdAt` (opcional) añadido a la interfaz de escritura — Prisma ya lo generaba (`@default(now())`), pero el InMemory no lo tenía.
  - ✅ `openapi.yaml` sincronizado con el endpoint nuevo.
- **Estado:**
  - Tests: 5 tests nuevos (historial poblado por un movimiento real —no seed directo—, filtro por `insumoId`, 403 sin rol ADMIN, 401 sin token, lista vacía sin movimientos) — 60/60 backend + 52/52 frontend en verde.
  - Build/Lint/Duplicación: 0 errores; duplicación 2.02% (umbral 3%).

### 2026-08-21 - Bootstrap del Primer Administrador (TK-051)
- **Hito:** una base de datos de producción nueva ya puede crear su primer administrador de forma idempotente, sin intervención manual por Prisma.
- **Hallazgo:** con las 3 implementaciones anteriores desplegadas, una base de datos de producción nueva no tenía ninguna forma de crear su primer usuario — `POST /api/v1/auth/users` exige ya ser ADMIN (huevo-gallina). Tuve que insertar un admin manualmente por Prisma para poder terminar de verificar el resto. Al investigar, se encontró además un bug crítico: `apps/backend/prisma/seed.ts` ya existía y ya leía `SEED_ADMIN_PIN`/`SEED_KITCHEN_PIN` (el nombre de variable que el propio Guard 13 de `AGENTS.md` ya exigía) — pero **guardaba el PIN en texto plano** (`pinHash: adminPin`) en vez de hashearlo. Nunca se había ejecutado en ningún flujo real, así que no llegó a comprometer datos, pero de haberse conectado tal cual habría sido una vulnerabilidad severa y además el login jamás habría funcionado (el formato `salt:hash` que espera `Pin.compareWithRaw` no se cumplía).
- **Acciones Realizadas:**
  - ✅ `prisma/seed.ts` corregido: hash real (mismo algoritmo que `Pin.createFromRaw`, replicado sin importar `Pin.ts` — ver por qué abajo). En producción crea SOLO un admin genérico configurable (`SEED_ADMIN_PIN`/`SEED_ADMIN_NAME`, id fijo `bootstrap-admin`), nunca los nombres de demo hardcodeados; fuera de producción mantiene el comportamiento existente para dev/QA.
  - ✅ Compilación standalone de `prisma/seed.ts` en el `Dockerfile` (fuera del build principal — `tsconfig.json` tiene `rootDir=./src` a propósito, y ampliarlo rompe la estructura de `dist/`, prohibido por el Guard 12). El script no importa nada de `src/` precisamente para poder compilarse solo sin arrastrar `tsx`/esbuild a la imagen final (revertiría las CVEs que `TK-044` eliminó).
  - ✅ `docker-entrypoint.sh` ejecuta el seed (idempotente) después de las migraciones y antes de arrancar el servidor.
  - ✅ `SEED_ADMIN_PIN`/`SEED_ADMIN_NAME` conectados en `docker-compose.yml`, `infrastructure/opentofu/main.tf` y `.env.example`.
  - ✅ Validado extremo a extremo con un contenedor real (no solo tests): build de la imagen, contenedor contra Postgres real sin ningún usuario preexistente → login exitoso con el PIN configurado → reinicio del contenedor → mismo PIN sigue funcionando (idempotencia real, no solo "no hay excepción") → contenedor sin `SEED_ADMIN_PIN` arranca igual, solo con una advertencia (no bloquea el despliegue).
- **Estado:**
  - Build/Lint/Duplicación: 0 errores; duplicación 2.02% (umbral 3%). 60/60 tests backend + 52/52 frontend sin cambios (este fix no tocó la superficie de tests existente, se validó con un contenedor real en su lugar).

### 2026-08-21 - Regularización de Artefactos Ágiles para TK-048 a TK-051
- **Hito:** los artefactos ágiles formales (historias de usuario, fichas de ticket, índices, PRD, readme) de las 3 funcionalidades ya implementadas (TK-048 a TK-051) quedan regularizados y trazables en el backlog.
- **Hallazgo:** auditoría explícita solicitada por el humano ("¿actualizaste todo lo necesario en función de estas nuevas funcionalidades? docs, frontend y demás artefactos?") reveló que, aunque el backend, sus tests y `openapi.yaml` quedaron sincronizados en cada ticket, los artefactos ágiles formales nunca se crearon — las 3 funcionalidades de negocio solo existían documentadas como entradas cronológicas de este historial y mensajes de commit. El frontend tampoco se tocó: cero UI consume `/auth/users`, `/auth/users/{id}/status` o `/stock/movements`.
- **Decisión:** (consultada con el humano) regularizar únicamente los artefactos ágiles en esta pasada, dejando constancia explícita del gap de Frontend como deuda visible, no implementarlo todavía.
- **Acciones Realizadas:**
  - ✅ `US-010` (Gestión de Personal) y `US-011` (Trazabilidad de Movimientos) creadas en `11_user_stories/`, con nota de alcance explícita señalando que el Frontend está pendiente.
  - ✅ `TK-048`, `TK-049`, `TK-050`, `TK-051` creados como fichas técnicas formales en `12_tickets/`, enlazando a sus US correspondientes (o `N/A (Técnico)` para los 2 habilitadores de infraestructura).
  - ✅ `indice_user_stories.md`, `indice_tickets.md`, `13_matriz_trazabilidad.md` (nuevos `REQ-010` a `REQ-013`, con celda `⚠️ Pendiente` explícita para Frontend — nunca `N/A` ni omitida) y `14_backlog_map.md` (nuevos nodos Mermaid con estilo `pending` diferenciado) actualizados.
  - ✅ `docs/01_product_definition/02_prd.md` (sección 5, backlog INVEST) y `readme.md` (secciones 1.2, 4, 5, 6) sincronizados con las 3 funcionalidades nuevas y sus endpoints reales (`/api/v1/auth/users`, `/api/v1/auth/users/{id}/status`, `/api/v1/stock/movements`).
  - ✅ Todos los enlaces relativos nuevos verificados programáticamente (no solo `validate_agents.sh`, que solo cubre `.agents/` — la carpeta `docs/` no tiene un linter de enlaces dedicado, deuda a considerar por separado).
- **Estado:** N/A (cambio documental, no aplica build/test). Deuda registrada: la interfaz de administración de personal y el panel de auditoría de movimientos no están implementados; queda como decisión de alcance pendiente para una futura sesión.

### 2026-08-21 - Codificación del Guard 26 (Spec-Before-Code Cascade) y Corrección de Tickets Frontend Faltantes
- **Hito:** nuevo Guard 26 (Spec-Before-Code Cascade) codificado en `AGENTS.md`, y los tickets de Frontend faltantes de `TK-049`/`TK-050` quedan creados formalmente.
- **Hallazgo:** al preguntar "¿por qué solo se creó el backend?", la revisión de `SK-12` confirmó que la propia regla del framework ya exige generar un ticket de Frontend (`TK-XXX-FE.md`) por cada User Story de cara al usuario — sin excepción. `TK-049`/`TK-050` (con `US-010`/`US-011` reales, de cara a un Administrador) debieron haber generado `TK-049-FE`/`TK-050-FE` automáticamente si la Etapa 1 se hubiera ejecutado. La regularización anterior (mismo día) dejó el gap como nota de texto "⚠️ Pendiente" en vez de como ticket formal — incompleto respecto a la propia regla de `SK-12`.
- **Decisión:** (consultada con el humano) crear el spec de Frontend ahora, sin implementar la UI todavía — la implementación queda como trabajo futuro explícitamente trazado en el backlog, no como código de esta sesión.
- **Acciones Realizadas:**
  - ✅ Guard 26 (Spec-Before-Code Cascade) codificado en `AGENTS.md`: prohíbe invocar `SK-16`/`SK-17`/`SK-18` para una capacidad sin `TK-XXX.md` ya existente en `docs/05_agile_planning/12_tickets/`. Wireado como fail-fast real en `02_cascading_dev_workflow.md` FASE 0, `SK-16`/`SK-17` FASE 1, y `04_dev_audit_workflow.md` FASE 0 (nuevo punto 4).
  - ✅ `TK-049-FE.md` (Panel de Gestión de Personal) y `TK-050-FE.md` (Panel de Auditoría de Movimientos) creados como fichas técnicas completas — spec aprobada, DoD, criterios BDD — con `Estado de Implementación: ⚠️ Spec aprobada, sin implementar` explícito.
  - ✅ `indice_tickets.md`, `13_matriz_trazabilidad.md`, `14_backlog_map.md` y las notas de alcance de `US-010`/`US-011` actualizados para enlazar los tickets reales en vez de texto suelto.
- **Estado:** N/A (cambio de gobernanza y specs, no aplica build/test).

### 2026-08-21 - Implementación del Frontend Pendiente (TK-049-FE, TK-050-FE) y Cierre de Deuda Documental
- **Hito:** el humano pidió explícitamente cerrar los pendientes conocidos (menos el push remoto): frontend real de `TK-049-FE`/`TK-050-FE`, gap del `CHANGELOG.md` raíz, y rutas obsoletas en `readme.md`.
- **Hallazgo:** durante la implementación se detectó que el backend no expone `GET /api/v1/auth/users` — no hay forma de listar operarios.
- **Decisión:** (alcance ya acotado a "completar lo pendiente", sin preguntar) en vez de fabricar una lista falsa, `UserStatusForm.tsx` pide el ID exacto del operario con una advertencia visible en la UI, documentado como limitación conocida, no oculta. Sin fallback a datos sintéticos ante error (a diferencia de `ReportsDashboard`/`StockService.recordExtraction`, que sí caen a un modo demo): son acciones administrativas de seguridad y un registro de auditoría — fingir éxito o datos falsos sería activamente engañoso.
- **Acciones Realizadas:**
  - ✅ `readme.md` corregido: §4.1-4.4 (rutas `/api/v1/...` reales, `accessToken` en vez de `token`, roles `KITCHEN_STAFF`/`ADMIN` en vez de `OPERATOR`, hash `scrypt` en vez de `bcrypt`) y menciones sueltas en §2.5/§6.1 — habían quedado congeladas desde el diseño inicial del MVP.
  - ✅ `CHANGELOG.md` raíz cerrado: nueva versión `[0.4.0]` sintetizando temáticamente TK-011 a TK-054 (testing/gobernanza, gates de calidad, DevSecOps/Docker, las 3 funcionalidades del MVP, y la regularización de artefactos ágiles).
  - ✅ `TK-049-FE`/`TK-050-FE` implementados de verdad: `UserManagementPanel.tsx` (+ `CreateUserForm.tsx`, `UserStatusForm.tsx`, `users.service.ts`) y `MovementHistoryPanel.tsx` (extendiendo `stock.service.ts`), cableados en `App.tsx` con nuevos botones "Personal" y "Movimientos".
  - ✅ Duplicación real detectada y corregida en el camino: el guard de rol `ADMIN` (`AccessDeniedState`) se copió igual en los 2 paneles nuevos, repitiendo el que ya existía en `ReportsDashboard.tsx` — extraído a `shared/components/AccessDeniedState.tsx` y los 3 dashboards migrados a usarlo (regla de reuso de `SK-17`, la misma que ya había motivado `TK-030`).
  - ✅ Gate ticket-scoped de complejidad (`check_ticket_code_quality.sh`) detectó 2 funciones sobre el límite de 60 líneas (`App`, `CreateUserForm`) — corregidas extrayendo un hook `useAppHandlers` y un sub-componente `CreateUserFields`/función `submitCreateUser`, no relajando el umbral.
- **Estado:**
  - Tests: 67/67 frontend (15 nuevos: 5 de `users.service.test.ts`, 5 de `UserManagementPanel.test.tsx`, 5 de `MovementHistoryPanel.test.tsx`) + 60/60 backend sin cambios, en verde.
  - Build/Lint/Duplicación: 0 errores; gate ticket-scoped en verde; duplicación total 1.84% (bajó respecto al 2.02% previo, al eliminar el clon de `AccessDeniedState`).
  - Deuda residual: listado de operarios (nuevo endpoint backend) y selector visual de rango de fechas en el panel de movimientos — ambas mejoras incrementales, no bloqueantes, documentadas en sus tickets respectivos.

### 2026-08-21 - Verificación en Vivo de la App y Corrección de Login Bloqueado en Producción Nueva (TK-051)
- **Hito:** un humano real ya puede loguearse tras un despliegue nuevo usando el `bootstrap-admin` sembrado por `TK-051`, sin herramientas de desarrollador.
- **Hallazgo:** encontrado solo al probar la app de punta a punta (Docker real + Playwright real, no lectura de código): `PinLoginModal.tsx` tenía un `<select>` con 2 operarios de fixtures de desarrollo hardcodeados (`usr-carlos-1`/`usr-maria-2`). En una base de datos de producción nueva, el único usuario real es `bootstrap-admin` — nunca aparecía en esa lista. Un humano real, sin herramientas de desarrollador, no tenía ninguna forma de loguearse tras un despliegue nuevo, pese a que el backend de bootstrap funciona perfectamente.
- **Acciones Realizadas:**
  - ✅ Corregido: el `<select>` se reemplazó por un input de texto para el ID real del operario (mismo criterio ya aceptado en `UserStatusForm.tsx` de `TK-049-FE`: el backend no expone ningún endpoint para listar operarios).
  - ✅ Validado en vivo, dos veces: primero con Docker real + Playwright inyectando una sesión válida para probar los paneles nuevos (`TK-049-FE`/`TK-050-FE`); luego, tras el fix, con Docker real + Playwright tipeando `bootstrap-admin` a mano en el campo de texto y el PIN por el teclado táctil — sin atajos, sin `localStorage` — confirmando login exitoso, dashboard con el nombre real sembrado, cero errores de consola.
  - ✅ Limpieza: el entorno de prueba (contenedores Docker, `.env` temporal, `knip`/`oasdiff`/`tofu`/Playwright instalados solo para verificar en vivo) se descartó por completo al terminar — el repositorio queda exactamente como antes de la prueba, salvo el fix real commiteado.
- **Estado:**
  - Tests: 67/67 frontend (`PinLogin.test.tsx` actualizado para llenar el nuevo campo de ID antes de enviar) + 60/60 backend sin cambios. Build, lint y gate ticket-scoped en verde.

### 2026-08-21 - Cierre de las 2 Deudas Incrementales Documentadas (TK-056)
- **Hito:** cierre de las últimas 2 deudas incrementales conocidas de `TK-049`/`TK-050`: listado real de operarios (backend nunca lo expuso) y filtro de rango de fechas en el panel de movimientos (el servicio ya lo soportaba, la UI no lo exponía).
- **Acciones Realizadas:**
  - ✅ `TK-056` (nuevo ticket, creado siguiendo Guard 26 antes de tocar código): `GET /api/v1/auth/users` (rol `ADMIN`) — `IUserRepository.findAll()`, `ListUsersUseCase`, implementado en ambos repositorios (`InMemory`/`Prisma`). Nunca expone `pinHash`.
  - ✅ Frontend: `UserStatusForm.tsx` reescrito para consumir el listado real — ya no pide el ID del operario por texto, muestra una lista con botón Bloquear/Reactivar por fila. `MovementHistoryPanel.tsx` gana 2 inputs `type="date"` (Desde/Hasta), convertidos a ISO 8601 inicio/fin de día antes de llamar al servicio.
  - ✅ Contrato: `openapi.yaml` sincronizado con `GET /api/v1/auth/users`; validado con `oasdiff breaking --fail-on ERR` contra `HEAD` — sin breaking changes (endpoint puramente aditivo).
- **Estado:**
  - Tests: 4 nuevos backend (listado poblado, lista vacía, 403, 401) — 64/64 backend en verde. 70/70 tests frontend en verde (3 nuevos: listado en `users.service.test.ts`, listado+bloqueo+vacío en `UserManagementPanel.test.tsx`, filtro de fechas en `MovementHistoryPanel.test.tsx`).
  - Build/Lint/Duplicación: 0 errores; gate ticket-scoped en verde; duplicación 1.81% (bajo el umbral 3%, sin clones nuevos).

### 2026-08-21 - Auditoría de Plantillas de Artefactos .agents/ y Corrección de Inconsistencias Detectadas
- **Hito:** el humano pidió una auditoría experta de todos los artefactos generados por `.agents/` para evaluar la profesionalidad y consistencia de sus plantillas — se ejecutó vía un subagente de investigación de solo lectura sobre los 7 grupos de `docs/`.
- **Hallazgo:** el patrón "nota de estado desactualizada" (ya corregido una vez en `02_prd.md`) reapareció sin detectar en 2 lugares más: `TK-049.md`/`TK-050.md` seguían afirmando "no existe ticket de Frontend" pese a que `TK-049-FE`/`TK-050-FE` ya estaban implementados. Además, 16 tickets de la ola vieja (`TK-001`–`TK-010` y derivados) tenían el breadcrumb de navegación roto por una profundidad de ruta relativa incorrecta (`../` en vez de `../../`), nunca retro-aplicado cuando la ola nueva lo corrigió. `docs/README.md` §05 tenía sus 5 enlaces rotos (apuntaban a nombres de archivo/carpeta de una reestructuración anterior). `docs/01_product_definition/` no tenía frontmatter YAML (único grupo sin él) y sus 2 archivos con breadcrumb tenían el 100% de sus enlaces rotos por renombres no propagados.
- **Decisión:** (consultada con el humano, priorizando los 5 hallazgos de mayor impacto) al verificar el hallazgo de `07_api_specification.md` (marcaba `POST /api/catalog/recipes` como pendiente, contradiciendo el "Done" de `TK-008.md`) contra el código real, se determinó que la spec de API decía la verdad — el endpoint nunca se implementó. Se corrigió `TK-008.md` (no la spec) a "Completado parcialmente ⚠️", dejando el cierre real de ese endpoint para una sesión posterior (`TK-057`).
- **Acciones Realizadas:**
  - ✅ `docs/README.md` §05: los 5 enlaces reemplazados por las rutas reales.
  - ✅ `TK-049.md`/`TK-050.md`: sección "Deuda Registrada" actualizada a cerrada, enlazando a `TK-049-FE`/`TK-050-FE`.
  - ✅ 16 tickets de la ola vieja: las 3 rutas relativas del breadcrumb corregidas y verificadas programáticamente (resuelven a un fichero real); `shared/backend/TK-001.md` y `shared/frontend/TK-001-FE.md` además corrigen el nombre de archivo inexistente `11_indice_user_stories.md` → `indice_user_stories.md`.
  - ✅ `TK-008.md`: Estado corregido a "Completado parcialmente ⚠️" con el detalle exacto de qué falta.
  - ✅ `docs/01_product_definition/` (3 archivos): frontmatter YAML agregado; enlaces de navegación corregidos.
  - ✅ Hallazgos menores adicionales corregidos en el camino (no parte del top-5, pero en los mismos archivos ya abiertos): enlace roto en el breadcrumb de `13_matriz_trazabilidad.md`, nombre de archivo obsoleto en el nodo Mermaid raíz de `14_backlog_map.md`, fila de `TK-056` faltante en la matriz de priorización de `indice_tickets.md`, y `TK-056` mal ubicado en la tabla de tickets de Frontend (es un ticket de Backend).
- **Estado:** N/A (cambio documental, no aplica build/test). 23 archivos modificados.

### 2026-08-21 - Gestión de Catálogo Maestro: Alta de Insumos y Recetas (US-012 / TK-057 / TK-057-FE)
- **Hito:** un Administrador ya puede dar de alta insumos y recetas en el catálogo maestro vía API/UI, sin depender de `seed.ts` — antes el catálogo completo (3 insumos, 1 receta) era fijo. Cierra además la deuda de `TK-008` (`POST /api/catalog/recipes` nunca se había implementado).
- **Hallazgo:** al preguntar "¿qué otra función elemental debería estar en la app?", se verificó contra el código (no solo los docs) que no existía `findAllInsumos()` en `IStockRepository` ni ninguna ruta HTTP para crear un `Insumo`, y que `RecipeSelectorModal.tsx` (consumo de recetas en cocina) usa una lista hardcodeada `DEFAULT_RECIPES` como fallback — confirmando que nunca hubo un flujo real de alta de recetas.
- **Decisión:** ejecutado siguiendo el ciclo completo del framework (`EnterPlanMode` → aprobación humana del plan → Workflow 01 spec-first → Workflow 02 dev) como prueba deliberada del propio `.agents/` a pedido del humano. Alcance acotado a alta + listado (sin edición/baja); se respetó el límite de módulo ya existente en vez de mover entidades (Insumo sigue en `stock`, Recipe en `catalog`, ahora con su primer HTTP layer real). El fallback `DEFAULT_RECIPES` de `RecipeSelectorModal.tsx` queda documentado como deuda descubierta, no resuelto aquí.
- **Acciones Realizadas:**
  - ✅ Backend: `IStockRepository.findAllInsumos()` + implementación `InMemory`/`Prisma`; `CreateInsumoUseCase`/`ListInsumosUseCase` (`application/stock/`); `CreateRecipeUseCase` (valida cada `insumoId` contra el catálogo antes de persistir, `EntityNotFoundException` si no existe) / `ListRecipesUseCase` (`application/catalog/`, carpeta nueva); endpoints `POST`/`GET /api/v1/stock/insumos` y `POST`/`GET /api/v1/catalog/recipes` (`catalog.controller.ts`/`catalog.routes.ts` nuevos, montados en `app.ts`). Corrige la ruta legacy sin `/v1/` nunca implementada.
  - ✅ Frontend: `CatalogManagementPanel.tsx` (pestañas Alta de Insumo / Alta de Receta), `CreateInsumoForm.tsx`, `CreateRecipeForm.tsx` (filas dinámicas de ingrediente con selector poblado desde el catálogo real), `catalog.service.ts`; botón "Catálogo" cableado en `App.tsx`.
  - ✅ Duplicación real detectada y corregida en el camino: el patrón de pestañas (36 líneas) y el banner de confirmación (29 líneas) se repetían casi idénticos entre `UserManagementPanel` y el nuevo `CatalogManagementPanel` — extraídos a `shared/components/SectionTabs.tsx` y `SuccessFeedbackBanner.tsx`, y `UserManagementPanel.tsx` migrado a usarlos también (mismo criterio que la extracción de `AccessDeniedState` en `TK-049-FE`).
  - ✅ Artefactos ágiles completos creados antes de tocar código (Guard 26): `US-012.md`, `TK-057.md`, `TK-057-FE.md` (módulo `catalog/` nuevo en `docs/05_agile_planning/`); índices, matriz de trazabilidad (`REQ-014`), mapa del backlog, PRD y `readme.md` (§1.2, §4.8-4.9, §5.12, §6.1-6.2) sincronizados.
  - ✅ `openapi.yaml` y `07_api_specification.md` sincronizados con los 4 endpoints nuevos; corregido además un hallazgo adyacente ya documentado en `07_api_specification.md`: `GET /api/v1/kitchen/recipes` nunca se implementó (spec fantasma), marcado explícitamente como reemplazado por `GET /api/v1/catalog/recipes`.
- **Estado:**
  - Tests: 13 nuevos backend (`ManageCatalogInsumos.test.ts`, `ManageCatalogRecipes.test.ts`) — 77/77 backend en verde. 12 nuevos frontend (`catalog.service.test.ts`, `CatalogManagementPanel.test.tsx`) — 82/82 frontend en verde.
  - Build/Lint/Duplicación: 0 errores; gate ticket-scoped en verde; duplicación total bajó de 2.96% a 2.43% (por la extracción de `SectionTabs`/`SuccessFeedbackBanner`).
  - Sin cambios de esquema Prisma — `Insumo`/`Recipe`/`RecipeIngredient` ya existían con todos los campos necesarios.
  - Deuda residual: `RecipeSelectorModal.tsx` sigue usando `DEFAULT_RECIPES` hardcodeado en vez de `GET /api/v1/catalog/recipes`; edición/baja de insumos y recetas no implementada — ambas documentadas como mejoras incrementales futuras en `TK-057.md`.

### 2026-08-21 - Guard 28 (Interrogatorio de Reglas de Negocio) y Cierre Retroactivo de `unitOfMeasure` en `TK-057`
- **Hito:** el humano señaló, tras `TK-057`, que no hubo intercambio de preguntas de negocio (ej. quién puede hacer el CRUD de insumos) antes de cerrar el diseño — se verificó contra `.agents/` y se confirmó el gap.
- **Hallazgo:** `01_cascading_spec_workflow.md` (usado para agregar funcionalidades a un producto ya existente) nunca exige preguntas de negocio abiertas al humano — solo un autoanálisis de impacto (Fase 1). El interrogatorio adversarial real (`SK-01` §6) existe pero solo se dispara en el bootstrap inicial (Workflow 00), nunca al agregar una funcionalidad a un producto maduro. Además, `.agents/rules/00_output_reporting_standard.md` (Plantilla B) ya exigía un "❓ Confirmación Requerida para el Humano", pero ninguna skill de specs (`SK-01`/`SK-02`/`SK-11`/`SK-12`) lo referencia — regla declarada pero huérfana.
- **Decisión:** codificar el gap como **Guard 28** (Business-Rule Open-Question Guard) en `AGENTS.md`, wireado como nueva **FASE 1.5** en `01_cascading_spec_workflow.md`. Aplicado retroactivamente sobre `TK-057` ya implementado: 3 preguntas formuladas al humano (permisos de CRUD, duplicados, unidad de medida) — permisos y duplicados confirmaron el diseño existente sin cambios; unidad de medida cambió de texto libre a lista cerrada `KG`/`L`/`UNITS`.
- **Acciones Realizadas:**
  - ✅ `AGENTS.md`: nuevo Guard 28. `01_cascading_spec_workflow.md`: nueva Fase 1.5 + regla innegociable reforzada. `.agents/README.md` (2.5.0→2.6.0). `.agents/CHANGELOG.md` actualizado.
  - ✅ Backend: `createInsumoSchema.unitOfMeasure` cambia de `z.string().min(1)` a `z.enum(['KG', 'L', 'UNITS'])` (`stock.controller.ts`); nuevo test de rechazo 400 para unidad inválida.
  - ✅ Frontend: `CreateInsumoForm.tsx` cambia el input de texto libre por un `<select>` con las 3 opciones; `catalog.service.ts` exporta el tipo `UnitOfMeasure`.
  - ✅ `US-012.md`/`TK-057.md` documentan explícitamente las 3 decisiones consultadas con el humano (no silenciosas); `openapi.yaml`/`07_api_specification.md`/`readme.md` sincronizados con el enum.
- **Estado:**
  - Tests: 78/78 backend (1 nuevo) + 82/82 frontend en verde. Build/Lint/Duplicación (2.42%) en verde. `validate_agents.sh`: 135 enlaces verificados, 0 problemas.

### 2026-08-21 - TK-058: Modularización del Repositorio de Stock (ISP)
- **Hito:** el humano señaló que era momento de "modularización y refactorización" del inventario de insumos; se identificó y corrigió un God Interface real en `IStockRepository`.
- **Hallazgo:** verificado por grep de todos los call-sites reales (no solo lectura): 8 casos de uso inyectaban `IStockRepository` completo (catálogo de Insumos + ciclo de vida de Remanente + auditoría de Movimientos), pero la mayoría solo usaba una fracción — 4 casos de uso de cocina nunca tocan Insumo, 3 casos de uso de catálogo/stock nunca tocan Remanente. El CRUD de catálogo agregado en `TK-057` fue la gota que confirmó el smell.
- **Decisión:** split ISP puro, sin mover la entidad `Insumo` fuera de `stock` (sigue siendo un concepto de bodega, distinto de `Recipe`/`catalog`) y sin cambio de comportamiento — mismas clases concretas (`InMemoryStockRepository`/`PrismaStockRepository`), ahora implementando 2 interfaces en vez de 1. Documentado como `TK-058` (ticket técnico `N/A` — refactor puro, no aplica Guard 26 ni la Fase 1.5 de `TK-057`, al no introducir ninguna regla de negocio nueva).
- **Acciones Realizadas:**
  - ✅ `IStockRepository.ts` eliminado (sin alias de compatibilidad); nuevas `IInsumoRepository.ts` (`findById`/`findAll`/`save`) e `IRemanenteRepository.ts` (`findRemanenteById`/`findActiveRemanentesByInsumoId`/`saveRemanente`/`recordMovement` + `StockMovementRecord`).
  - ✅ 8 casos de uso reinyectados con solo la interfaz que usan; `RecordExtractionUseCase` (único caso legítimamente cross-cutting) recibe ambas.
  - ✅ `app.ts`, `stock.routes.ts`, `catalog.routes.ts`, `kitchen.routes.ts`, `seeds/seed.ts` actualizados a los tipos acotados — wiring real sin cambios (mismo objeto concreto satisface ambas interfaces).
- **Estado:**
  - Tests: 78/78 backend en verde, sin modificar ninguna aserción existente (cero tests nuevos — refactor de tipos, no de comportamiento).
  - Build/Lint/Duplicación: 0 errores; gate ticket-scoped en verde; duplicación 2.42% (sin cambios, cero clones nuevos). `grep -rl "IStockRepository"` sobre `src`/`tests`: vacío.
