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

### 2026-08-07 - Estabilización de Entorno, Pruebas E2E y Gobernanza IA
- **Hito:** Verificación completa del MVP táctil y aseguramiento de la infraestructura del proyecto.
- **Acciones Realizadas:**
  - ✅ Inyección de seeding de insumos y recetas en `app.ts` para desarrollo efímero.
  - ✅ Verificación E2E de los módulos de extracción de stock, consumo de recetas FEFO y conciliación de turno.
  - ✅ Configuración agnóstica y portátil de la carpeta `.agents/` para reutilización en cualquier repositorio.
  - ✅ Creación de entrypoints multi-copiloto `CLAUDE.md` y `GEMINI.md`.
  - ✅ Protocolo Fast-Track para cambios menores (<10 líneas) documentado en `.agents/rules/`.
- **Estado de Tests:** 36/36 tests automatizados en verde (`pnpm test`).
- **Estado de Build:** 0 errores de compilación TypeScript (`pnpm run build`).

### 2026-08-21 - Cierre de Persistencia Parcial en Producción (TK-048)
- **Hito:** `reportRepository`, `recipeRepository` y `reconciliationRepository` dejan de estar en memoria en producción — las 6 repositories de `composition.ts` son ahora Prisma-backed.
- **Hallazgo relevante:** `docs/03_persistence_and_api/06_database_schema.md` (spec aprobado v1.2.0) documenta un modelo de datos considerablemente más completo (enums `DiscardReason`/`LocationType`/`MovementType`, tracking de `userId`/`remanenteId`) que el `schema.prisma` real, que nunca se actualizó para seguirlo. **Decisión explícita (consultada con el humano):** alcance mínimo, alineado con el `schema.prisma` real existente — no se tocaron `User`/`Insumo`/`Remanente`/`StockMovement`. La alineación completa con el spec queda como deuda técnica separada, no resuelta en este ticket.
- **Acciones Realizadas:**
  - ✅ Nuevos modelos `Recipe`, `RecipeIngredient`, `ShiftReconciliation`, `ShiftReconciliationItem` en `schema.prisma`, con la primera migración real del proyecto (`prisma/migrations/` estaba vacío desde el inicio).
  - ✅ `PrismaRecipeRepository`, `PrismaShiftReconciliationRepository`, `PrismaReportRepository` nuevos — el reporte de mermas se deriva agregando `StockMovement` por `type` (`DISCARD_<reason>`), sin tabla nueva.
  - ✅ Validado en vivo contra Postgres real (no solo tests): creación/lectura de recetas, conciliaciones de turno con variancia, y agregación correcta del reporte de mermas combinando ambos formatos de descarte (`DISCARD_EXPIRATION` y `DISCARD` sin sufijo del auto-descarte).
- **Estado de Tests:** 46/46 backend + 52/52 frontend en verde (`pnpm test`).
- **Estado de Build/Lint/Duplicación:** 0 errores; duplicación 1.50% (umbral 3%).

### 2026-08-21 - Gestión Mínima de Personal (TK-049)
- **Hito:** un restaurante real ya puede dar de alta y desactivar operarios sin redeployar código — hasta ahora los únicos 2 usuarios estaban hardcodeados en `seed.ts`.
- **Acciones Realizadas:**
  - ✅ `POST /api/v1/auth/users` (ADMIN): crea un operario nuevo (nombre, rol, PIN), reutilizando `Pin.createFromRaw` (hash con salt por usuario, ya existente).
  - ✅ `PATCH /api/v1/auth/users/{id}/status` (ADMIN): bloquea/reactiva un operario — nuevos métodos `User.block()`/`User.activate()`, distintos del auto-bloqueo por 5 intentos fallidos pero mismo status.
  - ✅ Ambas rutas protegidas con `authMiddleware` + `requireRole('ADMIN')` propios dentro de `auth.routes.ts` (el router de auth no tenía guard global porque `login-pin` debe ser público).
  - ✅ `openapi.yaml` sincronizado con los 2 endpoints nuevos (mismo criterio de `TK-047`: validado en vivo, no solo declarado).
- **Estado de Tests:** 9 tests nuevos (creación exitosa, login inmediato con el PIN asignado, 403 sin rol ADMIN, 401 sin token, 400 en PIN inválido, bloqueo con verificación de que el login subsecuente falla, reactivación, 404 usuario inexistente) — 55/55 backend + 52/52 frontend en verde.
- **Estado de Build/Lint/Duplicación:** 0 errores; duplicación 1.48% (umbral 3%).

### 2026-08-21 - Trazabilidad de Movimientos de Stock (TK-050)
- **Hito:** `GET /api/v1/stock/movements` (ADMIN, con filtros `insumoId`/`startDate`/`endDate`) — el modelo `StockMovement` ya se poblaba en cada extracción/consumo/descarte pero nunca se podía consultar; ahora un admin puede auditar "quién movió qué y cuándo".
- **Acciones Realizadas:**
  - ✅ Nueva interfaz `IStockMovementQueryRepository`, siguiendo el mismo patrón CQRS-ish ya establecido por `IRemanenteQueryRepository` (separación query/write dentro del mismo dominio).
  - ✅ `InMemoryStockMovementQueryRepository` envuelve la misma instancia de `InMemoryStockRepository` (no un store independiente) — los movimientos generados por extracción/descarte/conciliación aparecen automáticamente en la consulta.
  - ✅ `PrismaStockMovementQueryRepository` nuevo. `StockMovementRecord.createdAt` (opcional) añadido a la interfaz de escritura — Prisma ya lo generaba (`@default(now())`), pero el InMemory no lo tenía.
  - ✅ `openapi.yaml` sincronizado con el endpoint nuevo.
- **Estado de Tests:** 5 tests nuevos (historial poblado por un movimiento real —no seed directo—, filtro por `insumoId`, 403 sin rol ADMIN, 401 sin token, lista vacía sin movimientos) — 60/60 backend + 52/52 frontend en verde.
- **Estado de Build/Lint/Duplicación:** 0 errores; duplicación 2.02% (umbral 3%).
- **Cierre de sesión:** con esto se completan las 3 implementaciones priorizadas del análisis MVP (persistencia real, gestión de personal, trazabilidad de movimientos) — TK-048, TK-049, TK-050.

### 2026-08-21 - Bootstrap del Primer Administrador (TK-051)
- **Hallazgo durante verificación en vivo:** con las 3 implementaciones anteriores desplegadas, una base de datos de producción nueva no tenía ninguna forma de crear su primer usuario — `POST /api/v1/auth/users` exige ya ser ADMIN (huevo-gallina). Tuve que insertar un admin manualmente por Prisma para poder terminar de verificar el resto.
- **Bug crítico encontrado al investigar:** `apps/backend/prisma/seed.ts` ya existía y ya leía `SEED_ADMIN_PIN`/`SEED_KITCHEN_PIN` (el nombre de variable que el propio Guard 13 de `AGENTS.md` ya exigía) — pero **guardaba el PIN en texto plano** (`pinHash: adminPin`) en vez de hashearlo. Nunca se había ejecutado en ningún flujo real, así que no llegó a comprometer datos, pero de haberse conectado tal cual habría sido una vulnerabilidad severa y además el login jamás habría funcionado (el formato `salt:hash` que espera `Pin.compareWithRaw` no se cumplía).
- **Acciones Realizadas:**
  - ✅ `prisma/seed.ts` corregido: hash real (mismo algoritmo que `Pin.createFromRaw`, replicado sin importar `Pin.ts` — ver por qué abajo). En producción crea SOLO un admin genérico configurable (`SEED_ADMIN_PIN`/`SEED_ADMIN_NAME`, id fijo `bootstrap-admin`), nunca los nombres de demo hardcodeados; fuera de producción mantiene el comportamiento existente para dev/QA.
  - ✅ Compilación standalone de `prisma/seed.ts` en el `Dockerfile` (fuera del build principal — `tsconfig.json` tiene `rootDir=./src` a propósito, y ampliarlo rompe la estructura de `dist/`, prohibido por el Guard 12). El script no importa nada de `src/` precisamente para poder compilarse solo sin arrastrar `tsx`/esbuild a la imagen final (revertiría las CVEs que `TK-044` eliminó).
  - ✅ `docker-entrypoint.sh` ejecuta el seed (idempotente) después de las migraciones y antes de arrancar el servidor.
  - ✅ `SEED_ADMIN_PIN`/`SEED_ADMIN_NAME` conectados en `docker-compose.yml`, `infrastructure/opentofu/main.tf` y `.env.example`.
- **Validado extremo a extremo con un contenedor real** (no solo tests): build de la imagen, contenedor contra Postgres real sin ningún usuario preexistente → login exitoso con el PIN configurado → reinicio del contenedor → mismo PIN sigue funcionando (idempotencia real, no solo "no hay excepción") → contenedor sin `SEED_ADMIN_PIN` arranca igual, solo con una advertencia (no bloquea el despliegue).
- **Estado de Build/Lint/Duplicación:** 0 errores; duplicación 2.02% (umbral 3%). 60/60 tests backend + 52/52 frontend sin cambios (este fix no tocó la superficie de tests existente, se validó con un contenedor real en su lugar).

### 2026-08-21 - Regularización de Artefactos Ágiles para TK-048 a TK-051
- **Hallazgo:** auditoría explícita solicitada por el humano ("¿actualizaste todo lo necesario en función de estas nuevas funcionalidades? docs, frontend y demás artefactos?") reveló que, aunque el backend, sus tests y `openapi.yaml` quedaron sincronizados en cada ticket, los artefactos ágiles formales (historias de usuario, fichas de ticket, índices, PRD, readme) nunca se crearon — las 3 funcionalidades de negocio solo existían documentadas como entradas cronológicas de este historial y mensajes de commit. El frontend tampoco se tocó: cero UI consume `/auth/users`, `/auth/users/{id}/status` o `/stock/movements`.
- **Decisión explícita (consultada con el humano):** regularizar únicamente los artefactos ágiles en esta pasada (dejando constancia explícita del gap de Frontend como deuda visible, no implementarlo todavía).
- **Acciones Realizadas:**
  - ✅ `US-010` (Gestión de Personal) y `US-011` (Trazabilidad de Movimientos) creadas en `11_user_stories/`, con nota de alcance explícita señalando que el Frontend está pendiente.
  - ✅ `TK-048`, `TK-049`, `TK-050`, `TK-051` creados como fichas técnicas formales en `12_tickets/`, enlazando a sus US correspondientes (o `N/A (Técnico)` para los 2 habilitadores de infraestructura).
  - ✅ `indice_user_stories.md`, `indice_tickets.md`, `13_matriz_trazabilidad.md` (nuevos `REQ-010` a `REQ-013`, con celda `⚠️ Pendiente` explícita para Frontend — nunca `N/A` ni omitida) y `14_backlog_map.md` (nuevos nodos Mermaid con estilo `pending` diferenciado) actualizados.
  - ✅ `docs/01_product_definition/02_prd.md` (sección 5, backlog INVEST) y `readme.md` (secciones 1.2, 4, 5, 6) sincronizados con las 3 funcionalidades nuevas y sus endpoints reales (`/api/v1/auth/users`, `/api/v1/auth/users/{id}/status`, `/api/v1/stock/movements`).
  - ✅ Todos los enlaces relativos nuevos verificados programáticamente (no solo `validate_agents.sh`, que solo cubre `.agents/` — la carpeta `docs/` no tiene un linter de enlaces dedicado, deuda a considerar por separado).
- **Deuda explícita registrada:** la interfaz de administración de personal y el panel de auditoría de movimientos no están implementados. Queda como decisión de alcance pendiente para una futura sesión.
