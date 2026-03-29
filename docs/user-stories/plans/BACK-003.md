# Plan de Implementación: BACK-003 (Gestión de Planos)

**Estado:** Completado

## Objetivo
Crear la estructura jerárquica de planos (Sheets) y versiones, asegurando la integridad de datos y permitiendo el versionado automático.

## Arquitectura y Estructura

Se utilizará la capa Kernel (`packages/core`) para centralizar la lógica de dominio.

### Fase 1: Setup y Test de Integración (RED)
*   **Archivo:** `apps/backend/tests/integration/plans.spec.ts`
*   **Pruebas:**
    *   `POST /projects/:id/plans`: 201 Created (Crea versión 1 de un sheet nuevo).
    *   `POST /projects/:id/plans`: 201 Created (Crea versión 2 de un sheet existente).
    *   `POST /projects/:id/plans`: 403 Forbidden (Usuario sin permisos).

### Fase 2: Capa Kernel (Core Domain)
*   **Ubicación:** `packages/core/src/domain/plans`
*   **Entidad:** `Plan` (con lógica de incremento de versión).
*   **Value Objects:** `PlanStatus` (DRAFT, ACTIVE, ARCHIVED).
*   **Contratos:** `IPlanRepository` (métodos: `findLatestVersion`, `save`).

### Fase 3: Capa de Infraestructura (Backend)
*   **Repositorio:** `PrismaPlanRepository`.
    *   Implementa la búsqueda de `MAX(version)` para un `sheetName` dado usando Prisma.
*   **Middleware:** Implementar `ensureProjectPermission` verificando roles en la tabla `ProjectMember`.

### Fase 4: Capa de Aplicación (Use Cases)
*   **Servicio:** `CreatePlanUseCase`.
    *   Recibe: `projectId`, `sheetName`.
    *   Lógica: Busca última versión → Incrementa → Guarda nueva entidad → Retorna DTO.
*   **Servicio:** `ListProjectPlansUseCase`.
    *   Lógica: Retorna planos agrupados por `sheetName`.

### Fase 5: API Rest
*   **Rutas:** `plan.routes.ts` montado en `/projects/:projectId/plans`.
*   **Controller:** `PlanController`.
