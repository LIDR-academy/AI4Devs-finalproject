# US-005: Invitación y Acceso de Cliente (Guest)

**Como** Arquitecto  
**Quiero** generar un enlace único para mi proyecto  
**Para** enviárselo al cliente y que pueda acceder sin necesidad de registrarse.

## Detalles
- **Titulo breve:** Acceso Invitado
- **Prioridad:** Media (P2)
- **Estimación:** 3 Puntos
- **Dependencias:** US-002
- **Orden de ejecución:** 5
- **Estado:** Pending

## Diseño de Pantallas y UI

### 1. Modal de Compartir Proyecto (Vista Arquitecto)
- **Activador:** Botón "Compartir" en el header del proyecto.
- **Contenido:** 
  - Switch "Acceso Público Activado".
  - Campo de texto con la URL generada (Read-only).
  - Botón "Copiar Enlace".

### 2. Vista de Invitado (Guest Mode)
- **Header Simplificado:** Solo logo y nombre del proyecto. Sin acceso a "Mis Proyectos" ni settings.
- **Permisos Visuales:** Ausencia de botones de administración (Subir versión, Borrar, Configuración).
- **Visor:** Funcionalidad completa de zoom y comentarios.

## Criterios de Aceptación (Gherkin)

### Escenario 1: Generar enlace
**Dado** un proyecto creado por el Arquitecto
**Cuando** hace clic en el botón "Compartir"
**Entonces** el sistema genera una URL única (ej. `trace.app/p/uuid-seguro`)
**Y** se copia automáticamente al portapapeles

### Escenario 2: Acceso de invitado
**Dado** un usuario no registrado (Cliente) con el enlace
**Cuando** navega a la URL compartida
**Entonces** accede directamente al Visor del proyecto
**Y** tiene permisos limitados (Ver, Comentar) pero NO puede borrar el proyecto ni subir nuevas versiones

## Tickets de Trabajo

### [DB-004] Esquema Base de Datos: Invitaciones
- **Tipo:** Database
- **Propósito:** Gestión de tokens temporales de acceso.
- **Especificaciones Técnicas:**
  - Definir modelo `Invitation`: `id`, `project_id` (FK), `email`, `token` (Unique), `expires_at`, `status`.
  - Índice en columna `token` para búsqueda rápida.
- **Criterios de Aceptación:**
  - Tabla creada con restricciones de unicidad.
  - Relación con Project establecida.
- **Equipo Asignado:** Backend/DBA
- **Esfuerzo:** 2 pts

### [BACK-004] Lógica de Tokens de Invitación
- **Tipo:** Backend Feature
- **Propósito:** Generar y validar enlaces de acceso público.
- **Especificaciones Técnicas:**
  - Endpoint `POST /projects/:id/share`: Generar UUID único y guardar en DB `project.share_token`.
  - Endpoint `GET /public/projects/:token`: Validar y devolver info básica del proyecto (read-only).
- **Criterios de Aceptación:**
  - Token permite acceso a endpoints GET específicos sin cookie de sesión.
- **Equipo Asignado:** Backend
- **Esfuerzo:** 3 pts

### [FRONT-005] Layout Público (Guest)
- **Tipo:** Frontend Feature
- **Propósito:** Adaptar la interfaz para usuarios sin cuenta.
- **Especificaciones Técnicas:**
  - Nueva ruta `/p/:token`.
  - `GuestLayout.vue` sin sidebar de gestión.
  - Ocultar acciones de escritura (borrar, subir) basado en flag `isGuest`.
- **Criterios de Aceptación:**
  - Invitado ve el plano y comentarios.
  - No ve controles admin.
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 3 pts

