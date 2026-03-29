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
  - Switch "Acceso Público Activado" (De acción inmediata, sin botón de guardar. Llama al backend al interactuar).
  - Campo de texto con la URL generada (Read-only, solo visible si el switch está encendido).
  - Botón "Copiar Enlace" con feedback visual al usuario (Toast de éxito).
  - Texto de ayuda: "Cualquier persona con este enlace podrá ver el plano y dejar comentarios."

### 2. Vista de Invitado (Guest Mode)
- **Acceso Inicial / Identidad:** Al entrar al visor, se solicitará al invitado un "Nombre o Alias" mediante un prompt o modal sencillo para firmar sus comentarios.
- **Header Simplificado:** Solo logo y nombre del proyecto. Sin acceso a "Mis Proyectos" ni settings. Indicador visual de "Modo Invitado".
- **Permisos Visuales:** 
  - **No permitidos:** Botones de administración (Subir versión, Borrar, Configuración).
  - **Permitidos:** Funcionalidad completa de zoom, visualización de listado de capas/vistas (cambiar entre ellas), y lectura/escritura de comentarios (con su nombre asociado).
- **Estado de Error:** Landing page limpia indicando "Enlace caducado o inválido" si el token ya no sirve.

## Criterios de Aceptación (Gherkin)

### Escenario 1: Activar y Generar enlace (Acción inmediata)
**Dado** un proyecto creado por el Arquitecto
**Cuando** hace clic en el switch "Acceso Público Activado" en el modal de compartir
**Entonces** el sistema realiza la llamada al backend instantáneamente (sin botón guardar)
**Y** muestra una URL única (ej. `trace.app/p/uuid-seguro`)
**Y** al hacer clic en Copiar, se muestra una notificación verde que confirma la copia.

### Escenario 2: Acceso de invitado e Identificación
**Dado** un usuario no registrado (Cliente) con el enlace
**Cuando** navega a la URL compartida válida
**Entonces** accede directamente al Visor del proyecto e ingresa su nombre (Alias) en un pre-prompt de bienvenida
**Y** tiene permisos para cambiar entre capas y vistas, usar el zoom, y ver/escribir comentarios usando el nombre provisto.
**Y** no puede borrar el proyecto, ni subir nuevas versiones, careciendo de dichos menús en la UI.

### Escenario 3: Enlace inválido o revocado
**Dado** un enlace compartido generado previamente
**Cuando** el visitante accede y el enlace está caducado (o el arquitecto revocó el link desde el modal)
**Entonces** el visitante es redirigido a una vista de error amigable ("Este enlace ha caducado o es inválido"), y no accede a la aplicación.

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

### [BACK-006] Lógica de Tokens de Invitación y Guest Auth
- **Tipo:** Backend Feature
- **Propósito:** Generar, gestionar y validar enlaces de acceso público para invitados.
- **Especificaciones Técnicas:**
  - **Endpoints de Gestión (Project Owner):**
    - `POST /projects/:id/share-token`: Generar o regenerar token único. Guarda en `project.share_token`.
    - `GET /projects/:id/share-token`: Ver token activo.
    - `DELETE /projects/:id/share-token`: Revocar acceso (nullify token).
  - **Endpoints de Acceso (Guest):**
    - `POST /auth/guest/login`: Intercambio de `shareToken` por `accessToken` (JWT).
      - Input: `{ token: string }`
      - Output: `{ accessToken: string, user: { role: 'GUEST', projectId: ... } }`
  - **Seguridad:**
    - El JWT de Guest tiene permisos limitados (READ_PROJECT, COMMENT).
    - Middleware valida que el Guest JWT solo acceda al `projectId` vinculado.
- **Criterios de Aceptación:**
  - Solo Owner/Editor puede generar/revocar.
  - El login con token inválido retorna 401.
  - El token revocado impide nuevos logins.
  - Guest autenticado puede hacer GET /projects/:id y sus recursos.
- **Equipo Asignado:** Backend
- **Esfuerzo:** 5 pts

### [FRONT-006] Layout Público (Guest) y Flujo de Invitación
- **Tipo:** Frontend Feature
- **Propósito:** Adaptar la interfaz para usuarios sin cuenta, manejar invitaciones y sus identidades.
- **Especificaciones Técnicas:**
  - Nueva ruta `/p/:token`.
  - Creación de pantalla 404/Error("Enlace caducado") para acceso revocado.
  - Al ingresar a un enlace válido (o primer comentario, a decidir), modal `PromptName` para recolectar el Alias/Nombre del invitado. Esto se pasará en el body en la API de comentarios.
  - `GuestLayout.vue` sin sidebar superior de gestión, con indicador "Guest".
  - Ocultar herramientas de edición global (eliminar/subir versiones), pero **mantener controles de vistas, navegación de capas y comentarios**.
  - **Componente Compartir:** Modal para arquitectos donde el switch `Habilitar Compartición` dispara mutaciones al backend de forma inmediata (sin `save`), acompañado de Toast helpers.
- **Criterios de Aceptación:**
  - Archivar nombre del invitado exitosamente para sus comentarios.
  - Invitado puede cambiar capas/vistas libremente.
  - Acciones de copiado de URL y revocación generan Toasts instantáneos para el Arquitecto.
  - URLs revocadas aterrizan en la vista 404 amigable de link expirado.
- **Equipo Asignado:** Frontend
- **Esfuerzo:** 4 pts

