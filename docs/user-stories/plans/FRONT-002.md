# Plan de Implementación: FRONT-002 (Dashboard y Gestión de Proyectos)

**Estado:** Completado

## Objetivo
Implementar la interfaz de usuario para el dashboard principal, permitiendo visualizar la lista de proyectos y crear nuevos proyectos, respetando las limitaciones del plan de suscripción.

## Estructura de Archivos

```text
apps/frontend/
├── types/
│   └── project.ts             # Interfaces (Project, CreateProjectDto)
├── stores/
│   └── project.ts             # Store Pinia (state, actions, getters)
├── components/
│   └── projects/
│       ├── ProjectCard.vue    # Tarjeta de proyecto
│       └── CreateProjectModal.vue # Modal de creación
├── pages/
│   └── dashboard/
│       └── index.vue          # Modificación para integrar listado
```

## Pasos de Implementación

### Paso 1: Definición de Tipos y Constantes
- **Archivo:** `apps/frontend/types/project.ts`
- Definir `ProjectStatus`, `Project`, `CreateProjectDto`.
- Definir constante `PROJECT_LIMITS = { FREE: 3 }`.

### Paso 1.5: Persistencia de Sesión
- **Archivo:** `apps/frontend/stores/auth.ts`
- Añadir action `fetchCurrentUser()` que llame a `GET /api/auth/me` (o endpoint correspondiente).
- **Archivo:** `apps/frontend/app.vue` o Plugin
- Invocar `authStore.fetchCurrentUser()` si existe token al iniciar la app.
- Manejar redirección a login si el token es inválido (401).

### Paso 2: Store de Proyectos (Pinia)
- **Archivo:** `apps/frontend/stores/project.ts`
- **State:** `projects`, `isLoading`, `error`.
- **Getters:**
  - `activeProjectsCount`: Filtra proyectos no archivados/eliminados.
  - `canCreateProject`: Verifica si `activeProjectsCount` < Límite según `authStore.user.subscription`.
- **Actions:**
  - `fetchProjects()`: GET `/api/projects`.
  - `createProject(data)`: POST `/api/projects`.

### Paso 3: Componente ProjectCard
- **Archivo:** `apps/frontend/components/projects/ProjectCard.vue`
- Mostrar título, descripción, estado y fecha.
- Badge para el estado.

### Paso 4: Componente CreateProjectModal
- **Archivo:** `apps/frontend/components/projects/CreateProjectModal.vue`
- Formulario con validación simple.
- inputs para Title y Description.
- Manejo de carga y errores.

### Paso 5: Integración en Dashboard
- **Archivo:** `apps/frontend/pages/dashboard/index.vue`
- Fetch de proyectos al montar.
- Grid de cards.
- Botón "Nuevo Proyecto" conectado a la validación de `canCreateProject`.
- Empty state si no hay proyectos.
