# Plan de Implementación: BACK-002 (Gestión de Proyectos)

**Estado:** Completado

## Objetivo
Implementar la lógica de negocio, persistencia y exposición HTTP para la gestión de proyectos (CRUD) y el control de límites de la capa gratuita ("Slots"), siguiendo Clean Architecture y TDD.

## Arquitectura

Se mantiene la estructura establecida en `apps/backend/src`.

```text
apps/backend/src/
├── domain/
│   ├── entities/            # (Project)
│   ├── repositories/        # (IProjectRepository)
│   ├── dtos/                # (CreateProjectDto, ProjectResponseDto)
│   └── errors/              # (MaxProjectsLimitReachedError)
├── application/
│   └── use-cases/           # (CreateProjectUseCase, GetUserProjectsUseCase, DeleteProjectUseCase, GetCurrentUserUseCase)
├── infrastructure/
│   └── database/
│       └── repositories/    # (PrismaProjectRepository)
└── interfaces/
    └── http/
        ├── controllers/     # (ProjectController)
        └── routes/          # (project.routes.ts)
```

## Plan de Trabajo TDD

### Fase 1: Setup y Test de Integración
Crear tests de integración para definir el contrato de la API y las reglas de negocio.
1.  **Archivo:** `apps/backend/tests/integration/projects.spec.ts`
2.  **Casos de prueba:**
    *   `POST /api/projects` -> 201 Created (Usuario con slots disponibles).
    *   `GET /auth/me` -> 200 OK (Usuario autenticado recupera su perfil).
    *   `POST /api/projects` -> 403 Forbidden (Usuario FREE con 3 proyectos activos).
    *   `GET /api/projects` -> 200 OK (Lista de proyectos del usuario autenticado).
    *   `DELETE /api/projects/:id` -> 204 No Content (Soft delete).

### Fase 2: Capa de Dominio
Definir las entidades y contratos.
1.  **Entidad:** `Project` (src/domain/entities/project.entity.ts)
    *   Propiedades: id, title, description, architectId, status, timestamps.
2.  **DTOs:** `CreateProjectDto` (src/domain/dtos/create-project.dto.ts).
3.  **Error:** `MaxProjectsLimitReachedError`.
4.  **Interface Repositorio:** `IProjectRepository` (src/domain/repositories/project.repository.ts).
    *   `save(project: Project): Promise<void>`
    *   `findByUserId(userId: string): Promise<Project[]>`
    *   `countActiveByUserId(userId: string): Promise<number>`
    *   `findById(id: string): Promise<Project | null>`

### Fase 3: Capa de Infraestructura (Persistencia)
Implementar el repositorio con Prisma.
1.  **Repositorio:** `PrismaProjectRepository`.
    *   Mapear modelo de Prisma a Entidad de Dominio.
    *   Implementar métodos definidos en la interfaz.

### Fase 4: Capa de Aplicación (Casos de Uso)
Implementar la lógica pura.
1.  **Caso de Uso:** `CreateProjectUseCase`.
    *   Recibir `userId` y `dto`.
    *   Obtener usuario (para comprobar tier) - *Opcional si el Tier viene en el Token, si no, buscar User.*
    *   Contar proyectos activos del usuario.
    *   Validar regla: Si Tier == FREE y Count >= 3, lanzar `MaxProjectsLimitReachedError`.
    *   Crear entidad y guardar.
2.  **Caso de Uso:** `GetUserProjectsUseCase`.
    *   Retornar lista de proyectos.
3.  **Caso de Uso:** `DeleteProjectUseCase` (Soft Delete).
    *   Marcar `status = ARCHIVED` o setear `deletedAt`.

### Fase 5: Capa de Interfaz (HTTP)
Exponer los endpoints.
1.  **Controller:** `ProjectController`.
    *   Manejar req/res.
    *   Capturar errores de dominio y convertir a códigos HTTP (403 para limite alcanzado).
2.  **Rutas:** `project.routes.ts`.
    *   Definir rutas y aplicar `AuthMiddleware`.
3.  **App:** Registrar rutas en `app.ts`.

## Dudas / Validaciones
- ¿El límite de 3 proyectos incluye los archivados/eliminados? (Supuesto: Solo activos, según US-002 "proyectos activos").
- ¿La información del plan (Free/Pro) vendrá en el JWT o se debe consultar en base de datos cada vez? (Recomendación: Consultar DB o actualizar Token en login, para MVP consultar DB es más seguro para evitar estados inconsistentes si el usuario actualiza plan).
