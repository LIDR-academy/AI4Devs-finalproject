# Plan de Testing Unitario: FRONT-002 (Gestión de Proyectos)

**Referencia:** FRONT-002 (Dashboard y Gestión de Proyectos)
**Frameworks:** Vitest, Vue Test Utils, Pinia Testing

## 1. Objetivo
Asegurar la calidad y robustez de la nueva funcionalidad de gestión de proyectos, verificando tanto la lógica de negocio (Stores) como la interacción de usuario (Componentes).

## 2. Estrategia de Pruebas

### Herramientas
- **Runner:** Vitest cofigurado con entorno Nuxt.
- **Componentes:** `@vue/test-utils` para montaje y eventos.
- **Estado:** Pruebas directas a stores de Pinia.
- **Mocks:** `vi.fn()` y `vi.mock()` para llamadas a API (`useApi`).

### Estructura de Archivos de Test
Los tests se ubicarán junto al código fuente o en la carpeta `tests/unit` según convención del proyecto (viendo `apps/frontend/stores/auth.spec.ts`, parece que colocamos specs junto al archivo o en tests).
Seguiremos la estructura actual: `tests/unit/components/` y `stores/*.spec.ts`.

## 3. Casos de Prueba (Test Cases)

### 3.1. Store de Autenticación (Auth Store)
**Archivo:** `apps/frontend/stores/auth.spec.ts` (Actualización)

- [ ] **Acción `fetchCurrentUser`:**
    - Debe llamar al endpoint `/auth/me`.
    - Exito: Debe actualizar `user` y `isAuthenticated` a true.
    - Error: Debe limpiar el estado (`user = null`, `token = null`).

### 3.2. Store de Proyectos (Project Store)
**Archivo:** `apps/frontend/stores/project.spec.ts`

- [ ] **Estado Inicial:** Validar que `projects` es array vacío y `isLoading` false.
- [ ] **Getter `activeProjectsCount`:**
    - Debe contar solo proyectos que NO estén archivados o eliminados.
- [ ] **Getter `canCreateProject`:**
    - *Setup:* Mockear `authStore.user.subscription` (Free vs Premium).
    - Caso Free: Debe retornar `false` si proyectos activos >= 3.
    - Caso Free: Debe retornar `true` si proyectos activos < 3.
    - Caso Premium: Debe retornar `true` (o límite mayor).
- [ ] **Acción `fetchProjects`:**
    - Debe setear `isLoading = true` al inicio.
    - Exito: Debe poblar `projects` con la respuesta.
    - Error: Debe setear `error` con mensaje y `projects` vacío.
    - Finalmente: `isLoading = false`.
- [ ] **Acción `createProject`:**
    - Debe llamar a API POST.
    - Exito: Debe agregar el nuevo proyecto al array `projects`.

### 3.3. Componentes

#### A. Componente `ProjectCard`
**Archivo:** `apps/frontend/tests/unit/components/projects/ProjectCard.spec.ts`

- [ ] **Renderizado:**
    - Debe mostrar título y descripción pasados por prop.
    - Debe formatear la fecha correctamente (usando helper o Intl).
- [ ] **Estilos de Estado:**
    - Debe aplicar clase de color correcta según `status` (ej. verde para active, gris para archived).

#### B. Componente `CreateProjectModal`
**Archivo:** `apps/frontend/tests/unit/components/projects/CreateProjectModal.spec.ts`

- [ ] **Validación:**
    - Botón "Crear" deshabilitado si campos vacíos (si aplica validación UI).
    - Mostrar error si Title es vacío al hacer submit.
- [ ] **Interacción:**
    - Al hacer submit válido, debe emitir evento `create` con el payload de datos.
    - Debe mostrar estado de carga si recibe prop `loading`.

### 3.4. Pagina Dashboard
**Archivo:** `apps/frontend/tests/unit/pages/dashboard/index.spec.ts` (Opcional si se testean componentes por separado)

- [ ] **Montaje:**
    - Debe llamar a `projectStore.fetchProjects()` al montarse.
- [ ] **Renderizado Condicional:**
    - Si `projects` está vacío: Mostrar componente/mensaje de "Empty State".
    - Si hay proyectos: Mostrar lista de `ProjectCard`.
- [ ] **Lógica de UI:**
    - Botón "Nuevo Proyecto" debe estar deshabilitado o mostrar alerta si `!canCreateProject`.

## 4. Pasos de Ejecución Propuestos

1.  Crear `apps/frontend/stores/project.spec.ts` (TDD: crear test antes de lógica compleja de límites).
2.  Actualizar `apps/frontend/stores/auth.spec.ts`.
3.  Crear `apps/frontend/tests/unit/components/projects/`.
4.  Implementar tests de componentes.
5.  Ejecutar `npm run test:unit` y verificar cobertura.
