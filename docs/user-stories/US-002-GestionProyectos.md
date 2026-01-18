# US-002: Gestión de Proyectos y Slots

**Como** Arquitecto  
**Quiero** crear nuevos proyectos y ver mis proyectos activos  
**Para** organizar las revisiones con mis clientes dentro del límite de mi plan gratuito.

## Detalles
- **Titulo breve:** CRUD Proyectos y Slots
- **Prioridad:** Alta (P1)
- **Estimación:** 5 Puntos
- **Dependencias:** US-001
- **Orden de ejecución:** 2
- **Estado:** Pending

## Diseño de Pantallas y UI

### 1. Dashboard Principal (Lista de Proyectos)
- **Header:** Logo, Avatar de usuario (Menu desplegable), Indicador de Slots usados (ej. "1/3 Proyectos").
- **Área de Contenido:** 
  - Grid de tarjetas de proyectos.
  - Cada tarjeta: Imagen miniatura (preview del último plano), Nombre del proyecto, Fecha de actualización, Badge de notificaciones (comentarios pendientes).
- **Botón Flotante (FAB) o Principal:** "Nuevo Proyecto" (+).

### 2. Modal de Creación de Proyecto
- **Titulo:** "Nuevo Proyecto".
- **Campos:** Nombre del Proyecto, Cliente (Opcional).
- **Acciones:** "Cancelar", "Crear Proyecto".

### 3. Modal/Alerta de Límite Alcanzado
- **Mensaje:** "Has alcanzado el límite de tu plan gratuito".
- **Call to Action:** "Gestionar Proyectos Existentes" o "Actualizar a Pro" (Link dummy para MVP).

## Criterios de Aceptación (Gherkin)

### Escenario 1: Crear primer proyecto
**Dado** un usuario autenticado en el Dashboard sin proyectos
**Cuando** hace clic en "Nuevo Proyecto" e ingresa el nombre "Casa de Campo"
**Entonces** el proyecto se crea exitosamente
**Y** aparece en la lista de proyectos activos
**Y** el contador de slots muestra "1/3 utilizados"

### Escenario 2: Límite de slots alcanzado (Edge Case)
**Dado** un usuario con 3 proyectos activos (Plan Free)
**Cuando** intenta crear un nuevo proyecto
**Entonces** el sistema muestra un modal de bloqueo
**Y** informa que debe eliminar o archivar un proyecto existente para continuar
**O** sugiere actualizar al Plan Pro

### Escenario 3: Eliminar proyecto
**Dado** un proyecto existente "Proyecto X"
**Cuando** el usuario selecciona la opción "Eliminar" y confirma
**Entonces** el proyecto y sus datos se borran
**Y** se libera 1 slot en el contador

## Tickets de Trabajo

### [DB-002] Esquema Base de Datos: Proyectos y Miembros
- **Tipo:** Database
- **Propósito:** Estructura para almacenar proyectos y relaciones de usuarios.
- **Especificaciones Técnicas:**
  - Definir modelo `Project`: `id` (UUID), `title`, `architect_id` (FK -> User), `status` (ACTIVE/ARCHIVED), `deleted_at`.
  - Definir modelo `ProjectMember` (Tabla pivote): `project_id`, `user_id`, `role` (OWNER/EDITOR/VIEWER).
  - Configurar relaciones en Prisma.
- **Criterios de Aceptación:**
  - Migración ejecutada exitosamente.
  - Integridad referencial (FK) configurada correctamente.
- **Equipo Asignado:** Backend/DBA
- **Esfuerzo:** 3 pts

### [BACK-002] API Endpoints: Gestión de Proyectos
- **Tipo:** Backend Feature
- **Propósito:** CRUD de proyectos y control de límites de plan.
- **Especificaciones Técnicas:**
  - `POST /projects`: Crea proyecto. Check `COUNT(projects) < 3`.
  - `GET /projects`: Lista proyectos del usuario.
  - `DELETE /projects/:id`: Borra lógico o físico.
  - Schema DB: `Project` (id, user_id, name, created_at, active).
- **Criterios de Aceptación:**
  - No permite crear el 4º proyecto.
  - Eliminar proyecto actualiza el conteo.
- **Equipo Asignado:** Backend
- **Esfuerzo:** 5 pts

### [FRONT-002] Dashboard y Gestión de Proyectos
- **Tipo:** Frontend Feature
- **Propósito:** Interfaz principal para ver y crear proyectos.
- **Especificaciones Técnicas:**
  - Componente `ProjectCard`.
  - Modal `CreateProjectModal`.
  - Store `useProjectStore` para manejar la lista.
  - Lógica visual para bloquear botón "Nuevo" si slots llenos.
- **Criterios de Aceptación:**
  - Dashboard muestra lista correcta.
  - Creación actualiza la lista sin recargar (optimistic UI o fetch).
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 5 pts

