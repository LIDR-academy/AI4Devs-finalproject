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
