# 🎫 WORK TICKETS (JIRA) - BLOQUE 3 (Tickets 101-150)

**Proyecto:** RRFinances - Sistema Web Financiero Core  
**Fecha:** 17 de Diciembre de 2025  
**Bloque:** 3 de 9  
**Tickets:** 101 - 150

---

## 📋 Continuación US-002: Gestión de Usuarios, Roles y Permisos de la Cooperativa

### 🖥️ Módulo: Frontend - Gestión de Usuarios

---

#### **TICKET-101: Crear módulo de usuarios en Angular**

**Título:** Crear módulo de usuarios en Angular

**Descripción:**
Crear módulo lazy-loaded para gestión completa de usuarios con estructura de componentes.

**Criterios de Aceptación:**
- ✅ Módulo UsersModule con lazy loading
- ✅ Routing configurado (/users)
- ✅ Estructura de componentes (list, form, view, profile)
- ✅ Servicio UsersService
- ✅ Modelos TypeScript para usuarios y personas

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, angular, module, users

---

#### **TICKET-102: Crear servicio UsersService en Angular**

**Título:** Crear servicio UsersService en Angular

**Descripción:**
Implementar servicio para consumir API de usuarios con gestión de estado.

**Criterios de Aceptación:**
- ✅ Métodos CRUD completos
- ✅ Método search(filters) para búsqueda avanzada
- ✅ Método resetPassword(userId)
- ✅ Método activate/deactivate
- ✅ Método exportToExcel(filters)
- ✅ Gestión de estado con BehaviorSubject
- ✅ Manejo de errores centralizado

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, service, users

---

#### **TICKET-103: Crear componente UsersListComponent**

**Título:** Crear componente UsersListComponent

**Descripción:**
Crear componente para listar usuarios con tabla avanzada y filtros.

**Criterios de Aceptación:**
- ✅ Tabla con Material Table o AG Grid
- ✅ Columnas: username, nombres, email, rol, oficina, estado
- ✅ Filtros: búsqueda, rol, estado, oficina
- ✅ Paginación del lado del servidor
- ✅ Ordenamiento por columnas
- ✅ Acciones: ver, editar, resetear password, activar/desactivar
- ✅ Botón crear nuevo usuario
- ✅ Botón exportar a Excel

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, table, users

---

#### **TICKET-104: Crear componente UserFormComponent**

**Título:** Crear componente UserFormComponent

**Descripción:**
Crear componente con formulario completo para crear/editar usuarios.

**Criterios de Aceptación:**
- ✅ Formulario reactivo con múltiples secciones
- ✅ Sección datos de persona (nombres, identificación, etc.)
- ✅ Sección datos de usuario (username, roles, oficina)
- ✅ Validación de cédula ecuatoriana en tiempo real
- ✅ Selector de roles múltiple
- ✅ Generación automática de contraseña temporal
- ✅ Modo crear y modo editar
- ✅ Validaciones completas

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, form, users

---

#### **TICKET-105: Crear validador personalizado de cédula en Angular**

**Título:** Crear validador personalizado de cédula en Angular

**Descripción:**
Implementar validador custom para formularios reactivos que valide cédula ecuatoriana.

**Criterios de Aceptación:**
- ✅ ValidatorFn para Reactive Forms
- ✅ Implementa algoritmo de validación de cédula
- ✅ Mensajes de error descriptivos
- ✅ Validación síncrona
- ✅ Reutilizable en múltiples formularios
- ✅ Tests unitarios

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, validation, ecuador

---

#### **TICKET-106: Crear componente UserViewComponent**

**Título:** Crear componente UserViewComponent

**Descripción:**
Crear componente para visualizar información completa de un usuario en modo lectura.

**Criterios de Aceptación:**
- ✅ Vista detallada de datos de persona
- ✅ Vista de datos de usuario
- ✅ Roles asignados con badges
- ✅ Permisos efectivos (expandible)
- ✅ Histórico de cambios (timeline)
- ✅ Botones de acciones: editar, resetear password
- ✅ Diseño tipo perfil con avatar

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, users

---

#### **TICKET-107: Crear componente de filtros avanzados (UserFiltersComponent)**

**Título:** Crear componente de filtros avanzados (UserFiltersComponent)

**Descripción:**
Crear componente reutilizable con panel de filtros avanzados para búsqueda de usuarios.

**Criterios de Aceptación:**
- ✅ Panel expandible/colapsable
- ✅ Filtros: username, nombres, identificación, email, rol, estado, oficina
- ✅ Operadores de búsqueda (contiene, igual, comienza con)
- ✅ Guardado de filtros favoritos
- ✅ Limpieza rápida de filtros
- ✅ Emit de objeto de filtros al componente padre

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, filters, users

---

#### **TICKET-108: Crear diálogo de confirmación de acciones**

**Título:** Crear diálogo de confirmación de acciones

**Descripción:**
Crear componente modal reutilizable para confirmar acciones destructivas o importantes.

**Criterios de Aceptación:**
- ✅ Dialog con Material Dialog
- ✅ Título, mensaje y tipo (warning, danger, info) configurables
- ✅ Botones personalizables (texto y colores)
- ✅ Checkbox "No volver a preguntar" (opcional)
- ✅ Reutilizable desde cualquier componente
- ✅ Animaciones suaves

**Prioridad:** Media  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** frontend, component, dialog, reusable

---

#### **TICKET-109: Implementar funcionalidad de reseteo de contraseña en UI**

**Título:** Implementar funcionalidad de reseteo de contraseña en UI

**Descripción:**
Implementar diálogo y lógica para que administrador resetee contraseña de usuario.

**Criterios de Aceptación:**
- ✅ Botón "Resetear contraseña" en lista y vista de usuario
- ✅ Diálogo de confirmación con warning
- ✅ Llamada a endpoint de reset
- ✅ Generación de contraseña temporal automática
- ✅ Opción de copiar contraseña generada
- ✅ Mensaje de éxito con instrucciones
- ✅ Notificación al usuario (preparado)

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, users, password

---

#### **TICKET-110: Crear componente MyProfileComponent**

**Título:** Crear componente MyProfileComponent

**Descripción:**
Crear componente para que usuario vea y edite su propio perfil.

**Criterios de Aceptación:**
- ✅ Vista de información personal completa
- ✅ Edición de campos permitidos (email, teléfonos, dirección)
- ✅ Campos no editables claramente marcados
- ✅ Sección de cambio de contraseña
- ✅ Carga/actualización de foto de perfil
- ✅ Vista previa de foto
- ✅ Validaciones y feedback

**Prioridad:** Media  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, profile, users

---

#### **TICKET-111: Implementar carga de foto de perfil**

**Título:** Implementar carga de foto de perfil

**Descripción:**
Implementar funcionalidad completa para subir y actualizar foto de perfil de usuario.

**Criterios de Aceptación:**
- ✅ Botón de carga de archivo
- ✅ Drag & drop de imagen
- ✅ Vista previa antes de guardar
- ✅ Recorte de imagen (crop) opcional
- ✅ Validación de formato (JPEG, PNG)
- ✅ Validación de tamaño (máx. 500KB)
- ✅ Compresión automática si excede tamaño
- ✅ Upload a servidor con progress bar

**Prioridad:** Baja  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, upload, image, users

---

#### **TICKET-112: Crear componente de cambio de contraseña (ChangePasswordComponent)**

**Título:** Crear componente de cambio de contraseña (ChangePasswordComponent)

**Descripción:**
Crear componente para que usuario cambie su propia contraseña.

**Criterios de Aceptación:**
- ✅ Formulario con: contraseña actual, nueva, confirmar nueva
- ✅ Validación de contraseña actual
- ✅ Validación de política en nueva contraseña
- ✅ Indicador de fortaleza de contraseña
- ✅ Validación de contraseñas coincidentes
- ✅ Llamada a endpoint /users/me/change-password
- ✅ Mensaje de éxito y logout opcional

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, password, users

---

### 👔 Módulo: Frontend - Roles y Permisos

---

#### **TICKET-113: Crear módulo de roles en Angular**

**Título:** Crear módulo de roles en Angular

**Descripción:**
Crear módulo para gestión de roles y permisos (puede ser parte de UsersModule).

**Criterios de Aceptación:**
- ✅ Routing configurado (/roles)
- ✅ Estructura de componentes (list, form, permissions-matrix)
- ✅ Servicio RolesService
- ✅ Servicio PermissionsService
- ✅ Modelos TypeScript

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, angular, module, roles

---

#### **TICKET-114: Crear servicio RolesService en Angular**

**Título:** Crear servicio RolesService en Angular

**Descripción:**
Implementar servicio para consumir API de roles.

**Criterios de Aceptación:**
- ✅ Métodos CRUD para roles
- ✅ Método assignPermissions(roleId, permissionIds)
- ✅ Método removePermissions(roleId, permissionIds)
- ✅ Caché de roles
- ✅ Observables para reactividad

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, service, roles

---

#### **TICKET-115: Crear servicio PermissionsService en Angular**

**Título:** Crear servicio PermissionsService en Angular

**Descripción:**
Implementar servicio para gestión de permisos con caché y helpers.

**Criterios de Aceptación:**
- ✅ Método getAllPermissions() - agrupados por módulo
- ✅ Método getMyPermissions() - permisos del usuario actual
- ✅ Método hasPermission(permission) - validador
- ✅ Método hasAnyPermission(permissions[]) - validador OR
- ✅ Método hasAllPermissions(permissions[]) - validador AND
- ✅ Caché de permisos del usuario
- ✅ Actualización automática al cambiar roles

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, service, permissions

---

#### **TICKET-116: Crear directiva *hasPermission para ocultación condicional**

**Título:** Crear directiva *hasPermission para ocultación condicional

**Descripción:**
Crear directiva estructural que oculte elementos según permisos del usuario.

**Criterios de Aceptación:**
- ✅ Directiva *hasPermission="'Modulo.Accion'"
- ✅ Soporte para múltiples permisos (OR y AND)
- ✅ Oculta/muestra elemento según permisos
- ✅ Performance optimizado (no recalcula constantemente)
- ✅ Reutilizable en cualquier template
- ✅ Documentación clara

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, directive, permissions

---

#### **TICKET-117: Crear guard PermissionsGuard para protección de rutas**

**Título:** Crear guard PermissionsGuard para protección de rutas

**Descripción:**
Crear guard que valide permisos antes de acceder a rutas específicas.

**Criterios de Aceptación:**
- ✅ PermissionsGuard implementa CanActivate
- ✅ Lee permisos requeridos desde route data
- ✅ Valida permisos del usuario actual
- ✅ Redirecciona a página de error si no tiene permisos
- ✅ Combinable con AuthGuard
- ✅ Mensaje de error descriptivo

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, guard, permissions

---

#### **TICKET-118: Crear componente RolesListComponent**

**Título:** Crear componente RolesListComponent

**Descripción:**
Crear componente para listar roles del sistema con acciones.

**Criterios de Aceptación:**
- ✅ Tabla con roles disponibles
- ✅ Columnas: nombre, descripción, tipo (sistema/custom), cantidad de permisos
- ✅ Indicador visual de roles de sistema (no editables)
- ✅ Acciones: ver permisos, editar, eliminar
- ✅ Botón crear nuevo rol
- ✅ Confirmación antes de eliminar

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, roles

---

#### **TICKET-119: Crear componente RoleFormComponent**

**Título:** Crear componente RoleFormComponent

**Descripción:**
Crear componente con formulario para crear/editar roles.

**Criterios de Aceptación:**
- ✅ Formulario reactivo
- ✅ Campos: nombre, descripción
- ✅ Indicador de rol de sistema (no editable)
- ✅ Modo crear y modo editar
- ✅ Validación de nombre único
- ✅ Botones guardar y cancelar

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, form, roles

---

#### **TICKET-120: Crear componente PermissionsMatrixComponent**

**Título:** Crear componente PermissionsMatrixComponent

**Descripción:**
Crear componente con matriz visual de permisos para asignar a roles.

**Criterios de Aceptación:**
- ✅ Tabla/matriz con módulos en filas
- ✅ Acciones (Create, Read, Update, Delete) en columnas
- ✅ Checkboxes para asignar/remover permisos
- ✅ Agrupación por módulo con expansión/colapso
- ✅ Selección masiva por módulo o acción
- ✅ Búsqueda/filtrado de permisos
- ✅ Indicador de cambios no guardados
- ✅ Botón guardar cambios

**Prioridad:** Media  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, permissions

---

#### **TICKET-121: Crear componente PermissionsViewComponent**

**Título:** Crear componente PermissionsViewComponent

**Descripción:**
Crear componente para visualizar permisos de un rol en formato amigable.

**Criterios de Aceptación:**
- ✅ Lista de permisos agrupados por módulo
- ✅ Visualización jerárquica (módulo → submódulo → acción)
- ✅ Badges de colores por tipo de acción
- ✅ Búsqueda/filtrado
- ✅ Export a PDF (opcional)
- ✅ Modo solo lectura

**Prioridad:** Baja  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, permissions

---

---

## 📋 US-003: Registro y Gestión Completa de Clientes con Apoderados y Poderes

### 🧑‍💼 Módulo: Clientes (Backend)

---

#### **TICKET-122: Diseñar esquema de base de datos para clientes**

**Título:** Diseñar esquema de base de datos para clientes

**Descripción:**
Diseñar tabla de clientes que extiende tabla personas con campos específicos.

**Criterios de Aceptación:**
- ✅ Tabla `clientes` diseñada
- ✅ persona_id como PK y FK a personas
- ✅ Campos específicos: codigo_cliente, tipo_cliente_id, fecha_ingreso, oficina_id, oficial_credito_id, segmento_id
- ✅ Estados: ACTIVO, INACTIVO, SUSPENDIDO
- ✅ Soft delete incluido
- ✅ Relaciones con catálogos definidas

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, design, clientes

---

#### **TICKET-123: Crear migración para tabla clientes**

**Título:** Crear migración para tabla clientes

**Descripción:**
Implementar migración para crear tabla clientes con constraints y relaciones.

**Criterios de Aceptación:**
- ✅ Tabla `clientes` creada
- ✅ FK a personas (PK)
- ✅ FK a catálogos (tipo_cliente, oficina, segmento)
- ✅ FK a users (oficial_credito)
- ✅ FK a cooperativa
- ✅ Índice único en codigo_cliente por cooperativa
- ✅ Check constraints para estados
- ✅ Timestamps de auditoría

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, migration, clientes

---

#### **TICKET-124: Crear entidad Cliente con TypeORM**

**Título:** Crear entidad Cliente con TypeORM

**Descripción:**
Crear entidad Cliente con relación OneToOne a Persona y otras relaciones.

**Criterios de Aceptación:**
- ✅ Entidad Cliente con persona_id como PK
- ✅ Relación OneToOne con Persona
- ✅ Relaciones con catálogos
- ✅ Relación con User (oficial_credito)
- ✅ Relación con Cooperativa
- ✅ Métodos auxiliares (isActive, getDaysAsMember, etc.)
- ✅ Soft delete incluido

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, entity, typeorm, clientes

---

#### **TICKET-125: Diseñar tablas para mensajes de clientes**

**Título:** Diseñar tablas para mensajes de clientes

**Descripción:**
Diseñar tablas para sistema de mensajes/alertas asociados a clientes.

**Criterios de Aceptación:**
- ✅ Tabla `clientes_mensajes` diseñada
- ✅ Campos: id, cliente_id, tipo_mensaje, titulo, descripcion, fecha_desde, fecha_hasta, estado
- ✅ Tabla `clientes_mensajes_visualizaciones` diseñada
- ✅ Registro de quién y cuándo visualizó mensaje
- ✅ Índices en cliente_id, fecha_desde, fecha_hasta

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, design, mensajes

---

#### **TICKET-126: Crear migraciones para tablas de mensajes**

**Título:** Crear migraciones para tablas de mensajes

**Descripción:**
Implementar migraciones para tablas de mensajes a clientes y visualizaciones.

**Criterios de Aceptación:**
- ✅ Tabla `clientes_mensajes` creada
- ✅ Tabla `clientes_mensajes_visualizaciones` creada
- ✅ Foreign keys correctos
- ✅ Índices optimizados
- ✅ Catálogo de tipos de mensaje: INFORMATIVO, ADVERTENCIA, CRITICO
- ✅ Timestamps de auditoría

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, migration, mensajes

---

#### **TICKET-127: Crear entidades ClienteMensaje y MensajeVisualizacion**

**Título:** Crear entidades ClienteMensaje y MensajeVisualizacion

**Descripción:**
Crear entidades para gestión de mensajes con relaciones.

**Criterios de Aceptación:**
- ✅ Entidad ClienteMensaje con todos los campos
- ✅ Entidad MensajeVisualizacion para tracking
- ✅ Relaciones con Cliente y User
- ✅ Métodos auxiliares (isActive, isViewed, etc.)
- ✅ Validaciones de fechas

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, entity, typeorm, mensajes

---

#### **TICKET-128: Diseñar tablas para apoderados**

**Título:** Diseñar tablas para apoderados

**Descripción:**
Diseñar tabla de apoderados que extiende tabla personas.

**Criterios de Aceptación:**
- ✅ Tabla `apoderados` diseñada
- ✅ persona_id como PK y FK a personas
- ✅ Campos: tipo_apoderado_id, fecha_registro, estado
- ✅ Soft delete incluido
- ✅ Relación con cooperativa

**Prioridad:** Alta  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, database, design, apoderados

---

#### **TICKET-129: Crear migración para tabla apoderados**

**Título:** Crear migración para tabla apoderados

**Descripción:**
Implementar migración para tabla apoderados.

**Criterios de Aceptación:**
- ✅ Tabla `apoderados` creada
- ✅ FK a personas (PK)
- ✅ FK a catálogo tipo_apoderado
- ✅ FK a cooperativa
- ✅ Timestamps de auditoría
- ✅ Soft delete

**Prioridad:** Alta  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, database, migration, apoderados

---

#### **TICKET-130: Crear entidad Apoderado con TypeORM**

**Título:** Crear entidad Apoderado con TypeORM

**Descripción:**
Crear entidad Apoderado con relación a Persona.

**Criterios de Aceptación:**
- ✅ Entidad Apoderado con persona_id como PK
- ✅ Relación OneToOne con Persona
- ✅ Relación con catálogo tipo_apoderado
- ✅ Métodos auxiliares
- ✅ Soft delete incluido

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, entity, typeorm, apoderados

---

#### **TICKET-131: Diseñar tabla de poderes**

**Título:** Diseñar tabla de poderes

**Descripción:**
Diseñar tabla para registrar poderes legales entre clientes y apoderados.

**Criterios de Aceptación:**
- ✅ Tabla `poderes` diseñada
- ✅ Campos: id, cliente_id, apoderado_id, tipo_poder_id, numero_escritura, fecha_otorgamiento, fecha_inicio, fecha_fin, notaria, alcance
- ✅ Campos para documento: documento_url, documento_nombre, documento_tamanio
- ✅ Estados: VIGENTE, VENCIDO, REVOCADO
- ✅ Índices en cliente_id, apoderado_id, fechas

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, design, poderes

---

#### **TICKET-132: Crear migración para tabla poderes**

**Título:** Crear migración para tabla poderes

**Descripción:**
Implementar migración para tabla de poderes con constraints.

**Criterios de Aceptación:**
- ✅ Tabla `poderes` creada
- ✅ FK a clientes y apoderados
- ✅ FK a catálogo tipo_poder
- ✅ Check constraint: fecha_inicio <= fecha_fin
- ✅ Índices optimizados
- ✅ Soft delete incluido
- ✅ Timestamps de auditoría

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, migration, poderes

---

#### **TICKET-133: Crear entidad Poder con TypeORM**

**Título:** Crear entidad Poder con TypeORM

**Descripción:**
Crear entidad Poder con relaciones a Cliente y Apoderado.

**Criterios de Aceptación:**
- ✅ Entidad Poder con todos los campos
- ✅ Relaciones con Cliente y Apoderado
- ✅ Relación con catálogo tipo_poder
- ✅ Métodos auxiliares (isVigente, isExpiringSoon, etc.)
- ✅ Validaciones de fechas
- ✅ Soft delete incluido

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, entity, typeorm, poderes

---

#### **TICKET-134: Crear servicio ClientesService**

**Título:** Crear servicio ClientesService

**Descripción:**
Implementar servicio con lógica de negocio para gestión de clientes.

**Criterios de Aceptación:**
- ✅ Métodos CRUD: create, findAll, findOne, update, delete
- ✅ Método createWithPersona(data) - crea persona y cliente
- ✅ Validación de persona existente antes de crear
- ✅ Validación de cédula ecuatoriana
- ✅ Validación de mayoría de edad
- ✅ Generación automática de código_cliente
- ✅ Transacciones para operaciones complejas
- ✅ Búsqueda con múltiples criterios

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, service, clientes

---

#### **TICKET-135: Implementar lógica de generación de código de cliente**

**Título:** Implementar lógica de generación de código de cliente

**Descripción:**
Crear servicio/helper para generar código único de cliente según reglas configurables.

**Criterios de Aceptación:**
- ✅ Generación automática de código secuencial
- ✅ Formato configurable (ej: CLI-000001, 2024-000001)
- ✅ Validación de unicidad
- ✅ Manejo de concurrencia (locks)
- ✅ Opción de código manual (validando unicidad)
- ✅ Prefijos por cooperativa (opcional)

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, business-logic, clientes

---

#### **TICKET-136: Crear endpoints REST para gestión de clientes**

**Título:** Crear endpoints REST para gestión de clientes

**Descripción:**
Implementar controlador con endpoints para CRUD de clientes.

**Criterios de Aceptación:**
- ✅ GET /clientes - Listar clientes (paginado, filtros)
- ✅ GET /clientes/:id - Obtener cliente con persona y relaciones
- ✅ POST /clientes - Crear cliente nuevo
- ✅ PUT /clientes/:id - Actualizar cliente
- ✅ DELETE /clientes/:id - Desactivar cliente (soft delete)
- ✅ PUT /clientes/:id/activate - Activar cliente
- ✅ PUT /clientes/:id/suspend - Suspender cliente
- ✅ Validación de permisos en cada endpoint

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, endpoint, clientes

---

#### **TICKET-137: Crear DTOs para clientes**

**Título:** Crear DTOs para clientes

**Descripción:**
Crear todos los DTOs necesarios para operaciones de clientes.

**Criterios de Aceptación:**
- ✅ CreateClienteDto (incluye datos de persona)
- ✅ UpdateClienteDto (campos opcionales)
- ✅ ClienteResponseDto (cliente + persona + relaciones)
- ✅ ClienteFilterDto (filtros de búsqueda)
- ✅ ChangeEstadoDto (cambio de estado con motivo)
- ✅ Validaciones completas con class-validator
- ✅ Validación de cédula incluida

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, dto, validation, clientes

---

#### **TICKET-138: Crear servicio MensajesService**

**Título:** Crear servicio MensajesService

**Descripción:**
Implementar servicio para gestión de mensajes a clientes.

**Criterios de Aceptación:**
- ✅ Métodos CRUD para mensajes
- ✅ Método getActiveMessages(clienteId) - mensajes vigentes
- ✅ Método markAsViewed(mensajeId, userId) - registrar visualización
- ✅ Método findPendingMessages(clienteId, userId) - no vistos
- ✅ Validaciones de fechas de vigencia
- ✅ Filtrado por tipo de mensaje

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, service, mensajes

---

#### **TICKET-139: Crear endpoints REST para mensajes de clientes**

**Título:** Crear endpoints REST para mensajes de clientes

**Descripción:**
Implementar controlador para gestión de mensajes.

**Criterios de Aceptación:**
- ✅ GET /clientes/:clienteId/mensajes - Listar mensajes del cliente
- ✅ GET /clientes/:clienteId/mensajes/activos - Mensajes vigentes
- ✅ GET /clientes/:clienteId/mensajes/pendientes - No vistos por usuario actual
- ✅ POST /clientes/:clienteId/mensajes - Crear mensaje
- ✅ PUT /mensajes/:id - Actualizar mensaje
- ✅ DELETE /mensajes/:id - Eliminar mensaje
- ✅ POST /mensajes/:id/mark-viewed - Marcar como visto

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, endpoint, mensajes

---

#### **TICKET-140: Crear DTOs para mensajes**

**Título:** Crear DTOs para mensajes

**Descripción:**
Crear DTOs para operaciones de mensajes a clientes.

**Criterios de Aceptación:**
- ✅ CreateMensajeDto con validaciones
- ✅ UpdateMensajeDto (campos opcionales)
- ✅ MensajeResponseDto con visualizaciones
- ✅ Validación de fechas (desde < hasta)
- ✅ Validación de tipo de mensaje
- ✅ Validación de longitud de título y descripción

**Prioridad:** Media  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, dto, validation, mensajes

---

#### **TICKET-141: Crear servicio ApoderadosService**

**Título:** Crear servicio ApoderadosService

**Descripción:**
Implementar servicio para gestión de apoderados.

**Criterios de Aceptación:**
- ✅ Métodos CRUD para apoderados
- ✅ Método createWithPersona(data) - crea persona y apoderado
- ✅ Validación de persona existente
- ✅ Validación de mayoría de edad
- ✅ Búsqueda por nombre o identificación
- ✅ Método getPoderes(apoderadoId) - poderes del apoderado

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, service, apoderados

---

#### **TICKET-142: Crear endpoints REST para apoderados**

**Título:** Crear endpoints REST para apoderados

**Descripción:**
Implementar controlador para gestión de apoderados.

**Criterios de Aceptación:**
- ✅ GET /apoderados - Listar apoderados (paginado, filtros)
- ✅ GET /apoderados/:id - Obtener apoderado con persona
- ✅ POST /apoderados - Crear apoderado nuevo
- ✅ PUT /apoderados/:id - Actualizar apoderado
- ✅ DELETE /apoderados/:id - Desactivar apoderado
- ✅ GET /apoderados/:id/poderes - Poderes del apoderado
- ✅ GET /apoderados/search?q=... - Búsqueda

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, endpoint, apoderados

---

#### **TICKET-143: Crear DTOs para apoderados**

**Título:** Crear DTOs para apoderados

**Descripción:**
Crear DTOs para operaciones de apoderados.

**Criterios de Aceptación:**
- ✅ CreateApoderadoDto (incluye datos de persona)
- ✅ UpdateApoderadoDto (campos opcionales)
- ✅ ApoderadoResponseDto (apoderado + persona + poderes)
- ✅ ApoderadoFilterDto (filtros de búsqueda)
- ✅ Validaciones completas
- ✅ Validación de cédula

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, dto, validation, apoderados

---

#### **TICKET-144: Crear servicio PoderesService**

**Título:** Crear servicio PoderesService

**Descripción:**
Implementar servicio para gestión de poderes legales.

**Criterios de Aceptación:**
- ✅ Métodos CRUD para poderes
- ✅ Método validateVigencia(poderId) - validar vigencia
- ✅ Método findExpiringSoon(days) - poderes próximos a vencer
- ✅ Método revocar(poderId, motivo) - revocar poder
- ✅ Validación: no duplicados vigentes del mismo tipo
- ✅ Validación de fechas
- ✅ Gestión de documentos PDF

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, service, poderes

---

#### **TICKET-145: Implementar servicio de almacenamiento de archivos**

**Título:** Implementar servicio de almacenamiento de archivos

**Descripción:**
Crear servicio para subir, almacenar y gestionar archivos (PDFs de poderes, fotos).

**Criterios de Aceptación:**
- ✅ Upload de archivos al filesystem o S3
- ✅ Generación de nombre único para archivos
- ✅ Validación de tipo de archivo
- ✅ Validación de tamaño máximo
- ✅ Generación de URL de acceso
- ✅ Método delete para eliminar archivos
- ✅ Método download para descargar archivos
- ✅ Hash MD5 para integridad

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, files, storage

---

#### **TICKET-146: Crear endpoints REST para poderes**

**Título:** Crear endpoints REST para poderes

**Descripción:**
Implementar controlador para gestión de poderes.

**Criterios de Aceptación:**
- ✅ GET /clientes/:clienteId/poderes - Listar poderes del cliente
- ✅ GET /poderes/:id - Obtener poder específico
- ✅ POST /clientes/:clienteId/poderes - Crear poder (con upload PDF)
- ✅ PUT /poderes/:id - Actualizar poder
- ✅ DELETE /poderes/:id - Eliminar poder
- ✅ POST /poderes/:id/revocar - Revocar poder
- ✅ GET /poderes/:id/documento - Descargar documento PDF
- ✅ GET /poderes/expiring-soon - Poderes próximos a vencer

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, endpoint, poderes

---

#### **TICKET-147: Crear DTOs para poderes**

**Título:** Crear DTOs para poderes

**Descripción:**
Crear DTOs para operaciones de poderes.

**Criterios de Aceptación:**
- ✅ CreatePoderDto con validaciones
- ✅ UpdatePoderDto (campos opcionales)
- ✅ PoderResponseDto con relaciones
- ✅ RevocarPoderDto (motivo obligatorio)
- ✅ Validación de fechas (inicio <= fin)
- ✅ Validación de archivo PDF
- ✅ Validación de tamaño de archivo (máx. 2MB)

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, dto, validation, poderes

---

#### **TICKET-148: Implementar proceso batch de vencimiento de poderes**

**Título:** Implementar proceso batch de vencimiento de poderes

**Descripción:**
Crear job programado que marque automáticamente poderes vencidos según fecha_fin.

**Criterios de Aceptación:**
- ✅ Job ejecutado diariamente (ej: 1:00 AM)
- ✅ Query optimizada para encontrar poderes vencidos
- ✅ Actualización masiva a estado VENCIDO
- ✅ Logging de cantidad de poderes procesados
- ✅ Notificación a administradores (opcional)
- ✅ Configuración de horario de ejecución

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, batch, cron, poderes

---

#### **TICKET-149: Implementar sistema de alertas de poderes próximos a vencer**

**Título:** Implementar sistema de alertas de poderes próximos a vencer

**Descripción:**
Crear job que genere alertas para poderes que vencen en N días (configurable, default: 30).

**Criterios de Aceptación:**
- ✅ Job ejecutado diariamente
- ✅ Query para encontrar poderes que vencen en 30 días
- ✅ Generación de mensaje de alerta para el cliente
- ✅ Notificación a oficial de crédito (preparado)
- ✅ Logging de alertas generadas
- ✅ Configuración de días de anticipación

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, batch, alerts, poderes

---

#### **TICKET-150: Crear endpoint de búsqueda avanzada de clientes**

**Título:** Crear endpoint de búsqueda avanzada de clientes

**Descripción:**
Implementar endpoint con búsqueda avanzada y múltiples filtros combinables.

**Criterios de Aceptación:**
- ✅ POST /clientes/search - búsqueda con filtros complejos
- ✅ Filtros: codigo, identificación, nombres, email, teléfono, codigo_dactilar, tipo, estado, oficina, oficial, segmento
- ✅ Búsqueda por nombre de apoderado vigente
- ✅ Operadores: AND, OR, LIKE
- ✅ Paginación y ordenamiento
- ✅ Query optimizada con índices
- ✅ Tiempo de respuesta < 1 segundo

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, search, clientes

---

## 📊 RESUMEN DEL BLOQUE 3

**Tickets Generados:** 101 - 150 (50 tickets)  
**Esfuerzo Total:** ~118.5 horas (~3 semanas)

### Distribución por Categoría:
- 🖥️ Frontend - Usuarios: 12 tickets (30 horas)
- 👔 Frontend - Roles y Permisos: 9 tickets (21 horas)
- 🧑‍💼 Backend - Clientes: 18 tickets (45 horas)
- 💼 Backend - Apoderados: 3 tickets (6 horas)
- 📄 Backend - Poderes: 6 tickets (16.5 horas)
- 📝 Backend - Mensajes: 2 tickets (4 horas)

### Estado:
✅ **Bloque 3 completado** - Finaliza US-002 (Frontend) e inicia fuerte en US-003 (Clientes Backend)

---

## 🎯 Próximo Bloque

El **Bloque 4** continuará con:
- Finalización de US-003 (Frontend de Clientes)
- Inicio de US-004 (Consulta de Clientes)
- Inicio de US-005 (Auditoría y Reportes)

---

**Fecha de Generación:** 17 de Diciembre de 2025  
**Bloque:** 3 de 9
