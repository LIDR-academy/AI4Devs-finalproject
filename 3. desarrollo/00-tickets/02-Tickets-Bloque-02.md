# 🎫 WORK TICKETS (JIRA) - BLOQUE 2 (Tickets 51-100)

**Proyecto:** RRFinances - Sistema Web Financiero Core  
**Fecha:** 17 de Diciembre de 2025  
**Bloque:** 2 de 9  
**Tickets:** 51 - 100

---

## 📋 Continuación US-001: Configuración y Administración Global del Sistema Multi-Tenant

### 📚 Módulo: Catálogos Maestros (Backend)

---

#### **TICKET-051: Diseñar esquema de base de datos para catálogos**

**Título:** Diseñar esquema de base de datos para catálogos

**Descripción:**
Diseñar estructura flexible para almacenar diferentes tipos de catálogos con soporte para jerarquías (padre-hijo-nieto).

**Criterios de Aceptación:**
- ✅ Tabla `tipos_catalogos` diseñada (metadatos de catálogos)
- ✅ Tabla `catalogos` diseñada (registros de catálogos)
- ✅ Soporte para jerarquías (campo padre_id)
- ✅ Campos comunes: id, tipo_catalogo_id, codigo, descripcion, descripcion_corta, orden, estado, padre_id, metadata (JSONB)
- ✅ Índices en codigo, tipo_catalogo_id, padre_id
- ✅ Soft delete incluido

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, design, catalogs

---

#### **TICKET-052: Crear migración para tabla tipos_catalogos**

**Título:** Crear migración para tabla tipos_catalogos

**Descripción:**
Implementar migración para tabla que define los tipos de catálogos del sistema.

**Criterios de Aceptación:**
- ✅ Tabla `tipos_catalogos` creada
- ✅ Campos: id, codigo, nombre, descripcion, es_jerarquico, nivel_max, configuracion (JSONB), estado
- ✅ Datos semilla: geográficos, demográficos, sistema, clientes
- ✅ Índice único en codigo
- ✅ Timestamps de auditoría

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, migration, catalogs

---

#### **TICKET-053: Crear migración para tabla catalogos**

**Título:** Crear migración para tabla catalogos

**Descripción:**
Implementar migración para tabla principal de catálogos con datos semilla de Ecuador.

**Criterios de Aceptación:**
- ✅ Tabla `catalogos` creada con todos los campos
- ✅ Foreign keys a tipos_catalogos y cooperativas
- ✅ Índices en campos de búsqueda frecuente
- ✅ Self-reference para jerarquías (padre_id)
- ✅ Check constraint para evitar ciclos
- ✅ Soft delete implementado

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, migration, catalogs

---

#### **TICKET-054: Cargar datos semilla de provincias de Ecuador**

**Título:** Cargar datos semilla de provincias de Ecuador

**Descripción:**
Crear migración con las 24 provincias de Ecuador como datos semilla del catálogo geográfico.

**Criterios de Aceptación:**
- ✅ 24 provincias de Ecuador insertadas
- ✅ Códigos según INEC
- ✅ Tipo de catálogo: PROVINCIA
- ✅ padre_id = null (nivel superior)
- ✅ Ordenadas alfabéticamente
- ✅ Estado = activo

**Prioridad:** Media  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, database, seed-data, catalogs, ecuador

---

#### **TICKET-055: Cargar datos semilla de cantones de Ecuador**

**Título:** Cargar datos semilla de cantones de Ecuador

**Descripción:**
Crear migración con los cantones de Ecuador vinculados a sus provincias.

**Criterios de Aceptación:**
- ✅ ~221 cantones insertados
- ✅ padre_id apunta a provincia correspondiente
- ✅ Códigos según INEC
- ✅ Tipo de catálogo: CANTON
- ✅ Validación de jerarquía correcta

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, seed-data, catalogs, ecuador

---

#### **TICKET-056: Cargar datos semilla de parroquias de Ecuador**

**Título:** Cargar datos semilla de parroquias de Ecuador

**Descripción:**
Crear migración con parroquias de Ecuador vinculadas a cantones.

**Criterios de Aceptación:**
- ✅ ~1200 parroquias insertadas
- ✅ padre_id apunta a cantón correspondiente
- ✅ Tipo de catálogo: PARROQUIA
- ✅ Diferenciación urbana/rural en metadata
- ✅ Validación de jerarquía correcta

**Prioridad:** Baja  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, database, seed-data, catalogs, ecuador

---

#### **TICKET-057: Cargar catálogos demográficos (género, estado civil, etc.)**

**Título:** Cargar catálogos demográficos (género, estado civil, etc.)

**Descripción:**
Crear migración con catálogos demográficos: género, estado civil, nivel de instrucción, tipos de identificación.

**Criterios de Aceptación:**
- ✅ Catálogo GENERO: Masculino, Femenino, Otro
- ✅ Catálogo ESTADO_CIVIL: Soltero, Casado, Divorciado, Viudo, Unión libre
- ✅ Catálogo NIVEL_INSTRUCCION: Ninguno, Primaria, Secundaria, Superior, Postgrado
- ✅ Catálogo TIPO_IDENTIFICACION: Cédula, RUC, Pasaporte
- ✅ Catálogos NACIONALIDAD: principales países

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, database, seed-data, catalogs

---

#### **TICKET-058: Crear entidades TipoCatalogo y Catalogo con TypeORM**

**Título:** Crear entidades TipoCatalogo y Catalogo con TypeORM

**Descripción:**
Crear entidades para gestión de catálogos con soporte para jerarquías y relaciones.

**Criterios de Aceptación:**
- ✅ Entidad TipoCatalogo con campos y validaciones
- ✅ Entidad Catalogo con self-reference para jerarquías
- ✅ Relación padre-hijos implementada (TreeRepository opcional)
- ✅ Metadata como tipo JSON
- ✅ Métodos auxiliares (isActive, getFullPath, etc.)
- ✅ Soft delete incluido

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, entity, typeorm, catalogs

---

#### **TICKET-059: Crear servicio CatalogosService**

**Título:** Crear servicio CatalogosService

**Descripción:**
Implementar servicio con lógica de negocio para gestión de catálogos.

**Criterios de Aceptación:**
- ✅ Métodos CRUD: create, findAll, findOne, update, delete
- ✅ Método findByTipo(tipoCatalogo) con filtrado
- ✅ Método findHierarchy(id) - obtener jerarquía completa
- ✅ Método findChildren(parentId) - obtener hijos
- ✅ Validación de ciclos en jerarquías
- ✅ Validación de uso antes de eliminar
- ✅ Filtrado por cooperativa automático

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, service, catalogs

---

#### **TICKET-060: Crear endpoints REST para catálogos**

**Título:** Crear endpoints REST para catálogos

**Descripción:**
Implementar controlador con endpoints para gestión de catálogos.

**Criterios de Aceptación:**
- ✅ GET /catalogos - Listar todos (filtros: tipo, padre, búsqueda)
- ✅ GET /catalogos/tipos - Listar tipos de catálogos
- ✅ GET /catalogos/tipo/:codigo - Catálogos por tipo
- ✅ GET /catalogos/:id - Obtener uno con jerarquía
- ✅ GET /catalogos/:id/hijos - Obtener hijos
- ✅ POST /catalogos - Crear nuevo
- ✅ PUT /catalogos/:id - Actualizar
- ✅ DELETE /catalogos/:id - Desactivar
- ✅ Paginación y filtros

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, endpoint, catalogs

---

#### **TICKET-061: Crear DTOs para catálogos**

**Título:** Crear DTOs para catálogos

**Descripción:**
Crear DTOs para operaciones de catálogos con validaciones.

**Criterios de Aceptación:**
- ✅ CreateCatalogoDto con validaciones
- ✅ UpdateCatalogoDto (campos opcionales)
- ✅ CatalogoResponseDto con jerarquía
- ✅ CatalogoFilterDto para búsquedas
- ✅ Validación de codigo único por tipo
- ✅ Validación de padre_id válido

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, dto, validation, catalogs

---

#### **TICKET-062: Implementar importación masiva de catálogos**

**Título:** Implementar importación masiva de catálogos

**Descripción:**
Crear endpoint y servicio para importar catálogos desde Excel/CSV con validación.

**Criterios de Aceptación:**
- ✅ POST /catalogos/import - endpoint de importación
- ✅ Acepta archivos Excel (.xlsx) y CSV
- ✅ Validación de formato y datos
- ✅ Validación de jerarquías
- ✅ Rollback en caso de error
- ✅ Reporte de errores detallado
- ✅ Procesamiento asíncrono para grandes volúmenes

**Prioridad:** Media  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, import, catalogs

---

#### **TICKET-063: Implementar exportación de catálogos**

**Título:** Implementar exportación de catálogos

**Descripción:**
Crear endpoint para exportar catálogos a Excel/CSV con filtros aplicados.

**Criterios de Aceptación:**
- ✅ GET /catalogos/export - endpoint de exportación
- ✅ Formato Excel (.xlsx) con formato
- ✅ Formato CSV opcional
- ✅ Respeta filtros aplicados
- ✅ Incluye jerarquía en columnas separadas
- ✅ Límite de 10,000 registros
- ✅ Headers descriptivos

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, export, catalogs

---

#### **TICKET-064: Implementar caché de catálogos con Redis**

**Título:** Implementar caché de catálogos con Redis

**Descripción:**
Implementar caching de catálogos frecuentemente consultados para mejorar performance.

**Criterios de Aceptación:**
- ✅ Catálogos cacheados por tipo
- ✅ TTL: 1 hora para catálogos estáticos
- ✅ Invalidación al crear/modificar/eliminar
- ✅ Cache warming al iniciar aplicación
- ✅ Fallback a BD si cache falla
- ✅ Métricas de hit/miss rate

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, cache, redis, performance, catalogs

---

#### **TICKET-065: Crear endpoint para sincronización con INEC**

**Título:** Crear endpoint para sincronización con INEC

**Descripción:**
Crear endpoint administrativo para actualizar catálogos geográficos desde fuentes oficiales del INEC.

**Criterios de Aceptación:**
- ✅ POST /catalogos/sync/inec - endpoint de sincronización
- ✅ Solo SuperAdmin puede ejecutar
- ✅ Detecta cambios (nuevos, modificados, eliminados)
- ✅ Previsualización de cambios antes de aplicar
- ✅ Log detallado de sincronización
- ✅ Backup automático antes de aplicar

**Prioridad:** Baja  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, sync, catalogs, inec, optional

---

### 🖥️ Módulo: Frontend - Autenticación

---

#### **TICKET-066: Crear módulo de autenticación en Angular**

**Título:** Crear módulo de autenticación en Angular

**Descripción:**
Crear módulo lazy-loaded de autenticación con estructura de componentes y routing.

**Criterios de Aceptación:**
- ✅ Módulo AuthModule creado con lazy loading
- ✅ Routing configurado (/login, /forgot-password, /reset-password)
- ✅ Estructura de carpetas (components, services, guards, models)
- ✅ Módulo compartido para formularios
- ✅ Integración con Fuse Template

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, angular, auth, module

---

#### **TICKET-067: Crear servicio AuthService en Angular**

**Título:** Crear servicio AuthService en Angular

**Descripción:**
Implementar servicio centralizado para gestión de autenticación en frontend.

**Criterios de Aceptación:**
- ✅ Método login(username, password) - retorna Observable
- ✅ Método logout() - limpia tokens y estado
- ✅ Método refreshToken() - refresca access token
- ✅ Almacenamiento de tokens en localStorage/sessionStorage
- ✅ Estado de usuario autenticado (BehaviorSubject)
- ✅ Decodificación de JWT para obtener datos de usuario
- ✅ Método isAuthenticated() - verifica si hay token válido

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, service, auth

---

#### **TICKET-068: Crear interceptor para agregar JWT a requests**

**Título:** Crear interceptor para agregar JWT a requests

**Descripción:**
Implementar HTTP interceptor que agregue automáticamente token JWT al header Authorization.

**Criterios de Aceptación:**
- ✅ Interceptor AuthInterceptor creado
- ✅ Agrega header Authorization: Bearer <token>
- ✅ No agrega header a endpoints públicos
- ✅ Configuración de endpoints públicos
- ✅ Registrado en AppModule providers

**Prioridad:** Crítica  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** frontend, interceptor, auth

---

#### **TICKET-069: Crear interceptor para refresh automático de tokens**

**Título:** Crear interceptor para refresh automático de tokens

**Descripción:**
Implementar lógica para refrescar access token automáticamente cuando expira o está próximo a expirar.

**Criterios de Aceptación:**
- ✅ Detecta error 401 Unauthorized
- ✅ Intenta refrescar token automáticamente
- ✅ Reintenta request original con nuevo token
- ✅ Si refresh falla, redirecciona a login
- ✅ Evita múltiples refresh simultáneos (queuing)
- ✅ Proactive refresh (5 minutos antes de expirar)

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, interceptor, auth, jwt

---

#### **TICKET-070: Crear guard AuthGuard para rutas protegidas**

**Título:** Crear guard AuthGuard para rutas protegidas

**Descripción:**
Implementar guard que proteja rutas y redireccione a login si usuario no autenticado.

**Criterios de Aceptación:**
- ✅ AuthGuard implementa CanActivate
- ✅ Verifica si usuario está autenticado
- ✅ Si no autenticado, redirecciona a /login
- ✅ Guarda URL intentada para redirigir tras login
- ✅ Compatible con lazy loading
- ✅ Aplicable a rutas y rutas hijas

**Prioridad:** Crítica  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** frontend, guard, auth

---

#### **TICKET-071: Diseñar y maquetar componente LoginComponent**

**Título:** Diseñar y maquetar componente LoginComponent

**Descripción:**
Crear componente de login con diseño basado en Fuse Template, formulario reactivo y validaciones.

**Criterios de Aceptación:**
- ✅ Diseño responsive y moderno (Fuse style)
- ✅ Formulario reactivo con FormBuilder
- ✅ Campos: username/email y password
- ✅ Validaciones en tiempo real
- ✅ Mensajes de error user-friendly
- ✅ Botón de submit deshabilitado si inválido
- ✅ Link a "¿Olvidaste tu contraseña?"
- ✅ Logo de cooperativa (dinámico)

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, ui, login

---

#### **TICKET-072: Implementar lógica de login en LoginComponent**

**Título:** Implementar lógica de login en LoginComponent

**Descripción:**
Conectar formulario de login con AuthService y manejar respuestas/errores.

**Criterios de Aceptación:**
- ✅ Llamada a AuthService.login() al submit
- ✅ Loading indicator durante petición
- ✅ Manejo de errores (credenciales inválidas, cuenta bloqueada, etc.)
- ✅ Redirección a dashboard tras login exitoso
- ✅ Recuperación de URL intentada (return URL)
- ✅ Toast notifications para feedback
- ✅ Prevención de múltiples submits

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, logic, login

---

#### **TICKET-073: Crear componente ForgotPasswordComponent**

**Título:** Crear componente ForgotPasswordComponent

**Descripción:**
Crear componente para solicitud de recuperación de contraseña.

**Criterios de Aceptación:**
- ✅ Diseño consistente con LoginComponent
- ✅ Formulario con campo email
- ✅ Validación de email
- ✅ Llamada a endpoint /auth/forgot-password
- ✅ Mensaje de confirmación genérico (seguridad)
- ✅ Link de regreso a login
- ✅ Loading indicator

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, password-recovery

---

#### **TICKET-074: Crear componente ResetPasswordComponent**

**Título:** Crear componente ResetPasswordComponent

**Descripción:**
Crear componente para establecer nueva contraseña usando token de recuperación.

**Criterios de Aceptación:**
- ✅ Obtiene token de query params
- ✅ Valida token al cargar componente
- ✅ Formulario con: nueva contraseña, confirmar contraseña
- ✅ Validación de política de contraseña en tiempo real
- ✅ Indicador visual de fortaleza de contraseña
- ✅ Validación de contraseñas coincidentes
- ✅ Llamada a /auth/reset-password
- ✅ Redirección a login tras éxito

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, password-recovery

---

#### **TICKET-075: Crear componente PasswordStrengthIndicator**

**Título:** Crear componente PasswordStrengthIndicator

**Descripción:**
Crear componente reutilizable que muestre visualmente la fortaleza de la contraseña.

**Criterios de Aceptación:**
- ✅ Input: contraseña a evaluar
- ✅ Calcula fortaleza (débil, media, fuerte)
- ✅ Indicador visual con barra de colores
- ✅ Lista de requisitos con checkmarks
- ✅ Actualización en tiempo real
- ✅ Reutilizable en diferentes formularios
- ✅ Accesible (ARIA labels)

**Prioridad:** Baja  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, ui, reusable

---

### 🖥️ Módulo: Frontend - Layout Principal

---

#### **TICKET-076: Configurar layout principal con Fuse Template**

**Título:** Configurar layout principal con Fuse Template

**Descripción:**
Configurar layout principal de la aplicación usando componentes de Fuse Template.

**Criterios de Aceptación:**
- ✅ Layout con sidebar, navbar y content area
- ✅ Sidebar con navegación jerárquica
- ✅ Navbar con información de usuario y acciones
- ✅ Contenido principal con routing outlet
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Tema claro/oscuro configurable

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, layout, fuse

---

#### **TICKET-077: Crear estructura de navegación dinámica**

**Título:** Crear estructura de navegación dinámica

**Descripción:**
Implementar servicio y estructura para navegación dinámica basada en permisos del usuario.

**Criterios de Aceptación:**
- ✅ Servicio NavigationService creado
- ✅ Estructura de menú definida (módulos, submenús)
- ✅ Filtrado de menú según permisos de usuario
- ✅ Iconos Material o Font Awesome
- ✅ Badges para notificaciones (preparado)
- ✅ Actualización dinámica al cambiar permisos

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, navigation, permissions

---

#### **TICKET-078: Crear componente UserMenuComponent**

**Título:** Crear componente UserMenuComponent

**Descripción:**
Crear componente con menú de usuario (perfil, configuración, cerrar sesión).

**Criterios de Aceptación:**
- ✅ Avatar de usuario (inicial o foto)
- ✅ Nombre de usuario y rol mostrados
- ✅ Menú desplegable con opciones
- ✅ Opción "Mi Perfil"
- ✅ Opción "Configuración"
- ✅ Opción "Cerrar Sesión"
- ✅ Confirmación antes de logout

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, component, ui

---

#### **TICKET-079: Implementar funcionalidad de logout en frontend**

**Título:** Implementar funcionalidad de logout en frontend

**Descripción:**
Implementar lógica completa de cierre de sesión con limpieza de estado.

**Criterios de Aceptación:**
- ✅ Llamada a /auth/logout endpoint
- ✅ Limpieza de tokens de localStorage
- ✅ Limpieza de estado de la aplicación
- ✅ Redirección a /login
- ✅ Confirmación opcional del usuario
- ✅ Loading indicator durante proceso

**Prioridad:** Alta  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** frontend, auth, logout

---

#### **TICKET-080: Crear componente DashboardComponent básico**

**Título:** Crear componente DashboardComponent básico

**Descripción:**
Crear dashboard básico como página de inicio tras login exitoso.

**Criterios de Aceptación:**
- ✅ Ruta /dashboard configurada
- ✅ Layout con cards de bienvenida
- ✅ Mensaje personalizado con nombre de usuario
- ✅ Placeholder para estadísticas futuras
- ✅ Accesos rápidos a módulos principales
- ✅ Diseño responsive
- ✅ Integrado con Fuse layout

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, component, dashboard

---

### 🖥️ Módulo: Frontend - Catálogos

---

#### **TICKET-081: Crear módulo de catálogos en Angular**

**Título:** Crear módulo de catálogos en Angular

**Descripción:**
Crear módulo lazy-loaded para gestión de catálogos maestros.

**Criterios de Aceptación:**
- ✅ Módulo CatalogosModule con lazy loading
- ✅ Routing configurado (/catalogos)
- ✅ Estructura de componentes (list, form, view)
- ✅ Servicio CatalogosService
- ✅ Modelos TypeScript para catálogos

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** frontend, angular, module, catalogs

---

#### **TICKET-082: Crear servicio CatalogosService en Angular**

**Título:** Crear servicio CatalogosService en Angular

**Descripción:**
Implementar servicio para consumir API de catálogos con caché local.

**Criterios de Aceptación:**
- ✅ Métodos para todas las operaciones CRUD
- ✅ Método getCatalogosByTipo(tipo)
- ✅ Método getHierarchy(id)
- ✅ Caché en memoria de catálogos frecuentes
- ✅ Observables para reactividad
- ✅ Manejo de errores centralizado

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** frontend, service, catalogs

---

#### **TICKET-083: Crear componente CatalogosListComponent**

**Título:** Crear componente CatalogosListComponent

**Descripción:**
Crear componente para listar y filtrar catálogos con tabla dinámica.

**Criterios de Aceptación:**
- ✅ Tabla con Material Table o AG Grid
- ✅ Columnas: código, descripción, tipo, padre, estado
- ✅ Filtros: tipo de catálogo, búsqueda, estado
- ✅ Paginación del lado del servidor
- ✅ Ordenamiento por columnas
- ✅ Acciones: ver, editar, eliminar
- ✅ Botón crear nuevo catálogo

**Prioridad:** Media  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, table, catalogs

---

#### **TICKET-084: Crear componente CatalogoFormComponent**

**Título:** Crear componente CatalogoFormComponent

**Descripción:**
Crear componente con formulario para crear/editar catálogos.

**Criterios de Aceptación:**
- ✅ Formulario reactivo con validaciones
- ✅ Campos: tipo, código, descripción, descripción corta, padre, orden
- ✅ Selector jerárquico para padre (si aplica)
- ✅ Validación de código único
- ✅ Modo crear y modo editar
- ✅ Botones guardar y cancelar
- ✅ Feedback visual de errores

**Prioridad:** Media  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, form, catalogs

---

#### **TICKET-085: Crear componente de selector jerárquico (TreeSelect)**

**Título:** Crear componente de selector jerárquico (TreeSelect)

**Descripción:**
Crear componente reutilizable para seleccionar items de catálogos jerárquicos (ej: provincia→cantón→parroquia).

**Criterios de Aceptación:**
- ✅ Visualización de jerarquía en árbol
- ✅ Búsqueda con filtrado
- ✅ Expansión/colapso de nodos
- ✅ Selección de nodo hoja
- ✅ Integración con Reactive Forms
- ✅ Lazy loading de niveles (opcional)
- ✅ Reutilizable para diferentes catálogos

**Prioridad:** Baja  
**Esfuerzo:** 3 horas  
**Etiquetas:** frontend, component, ui, reusable, catalogs

---

---

## 📋 US-002: Gestión de Usuarios, Roles y Permisos de la Cooperativa

### 👥 Módulo: Gestión de Usuarios (Backend Continuación)

---

#### **TICKET-086: Diseñar tabla de personas (modelo base)**

**Título:** Diseñar tabla de personas (modelo base)

**Descripción:**
Diseñar tabla base de personas que será compartida por clientes, usuarios, apoderados, etc.

**Criterios de Aceptación:**
- ✅ Tabla `personas` diseñada con todos los campos del PRD
- ✅ Campos demográficos completos
- ✅ Campos de dirección (provincia, cantón, parroquia)
- ✅ Campos de contacto (email, teléfonos)
- ✅ Campo foto_url para fotografía
- ✅ Campo codigo_dactilar
- ✅ Índices en numero_identificacion (único)
- ✅ Soft delete incluido

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, design, personas

---

#### **TICKET-087: Crear migración para tabla personas**

**Título:** Crear migración para tabla personas

**Descripción:**
Implementar migración para crear tabla base de personas con constraints y relaciones.

**Criterios de Aceptación:**
- ✅ Tabla `personas` creada con todos los campos
- ✅ Foreign keys a catálogos (tipo_id, genero, estado_civil, etc.)
- ✅ Foreign keys a ubicación (provincia, cantón, parroquia)
- ✅ Índice único en numero_identificacion por cooperativa
- ✅ Check constraints para validaciones básicas
- ✅ Timestamps de auditoría

**Prioridad:** Crítica  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, database, migration, personas

---

#### **TICKET-088: Crear entidad Persona con TypeORM**

**Título:** Crear entidad Persona con TypeORM

**Descripción:**
Crear entidad base Persona con todas las relaciones y validaciones.

**Criterios de Aceptación:**
- ✅ Entidad Persona con todos los campos
- ✅ Relaciones con catálogos configuradas
- ✅ Relación con cooperativa
- ✅ Métodos auxiliares (getFullName, getAge, etc.)
- ✅ Validaciones básicas con class-validator
- ✅ Soft delete incluido

**Prioridad:** Crítica  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, entity, typeorm, personas

---

#### **TICKET-089: Modificar entidad User para usar persona_id**

**Título:** Modificar entidad User para usar persona_id

**Descripción:**
Actualizar entidad User para referenciar tabla personas en lugar de duplicar datos.

**Criterios de Aceptación:**
- ✅ Migración para agregar persona_id a users
- ✅ Migración de datos existentes (si aplica)
- ✅ Entidad User actualizada con relación OneToOne a Persona
- ✅ Eliminación de campos duplicados de User
- ✅ Métodos para acceder a datos de persona
- ✅ Validaciones actualizadas

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, refactor, migration, users

---

#### **TICKET-090: Crear servicio PersonasService**

**Título:** Crear servicio PersonasService

**Descripción:**
Implementar servicio para gestión de personas (CRUD y búsquedas).

**Criterios de Aceptación:**
- ✅ Métodos CRUD: create, findAll, findOne, update, delete
- ✅ Método findByIdentificacion(numero)
- ✅ Método searchByName(query)
- ✅ Validación de cédula ecuatoriana integrada
- ✅ Validación de unicidad de identificación
- ✅ Búsqueda con paginación y filtros

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, service, personas

---

#### **TICKET-091: Implementar validador de cédula ecuatoriana**

**Título:** Implementar validador de cédula ecuatoriana

**Descripción:**
Crear función/servicio que implemente algoritmo de validación de cédula ecuatoriana.

**Criterios de Aceptación:**
- ✅ Validación de longitud (10 dígitos)
- ✅ Validación de código de provincia (01-24)
- ✅ Validación de tercer dígito (< 6)
- ✅ Algoritmo de dígito verificador implementado
- ✅ Función pura reutilizable
- ✅ Tests unitarios completos
- ✅ Mensajes de error descriptivos

**Prioridad:** Alta  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, validation, ecuador

---

#### **TICKET-092: Crear decorador @ValidateCedulaEcuatoriana**

**Título:** Crear decorador @ValidateCedulaEcuatoriana

**Descripción:**
Crear decorador custom de class-validator para validación de cédula.

**Criterios de Aceptación:**
- ✅ Decorador @ValidateCedulaEcuatoriana() creado
- ✅ Usa función de validación de cédula
- ✅ Mensaje de error personalizable
- ✅ Compatible con ValidationPipe de NestJS
- ✅ Aplicable a DTOs
- ✅ Documentación de uso

**Prioridad:** Media  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, decorator, validation

---

#### **TICKET-093: Actualizar UserService con lógica de personas**

**Título:** Actualizar UserService con lógica de personas

**Descripción:**
Refactorizar UserService para trabajar con modelo de personas separado.

**Criterios de Aceptación:**
- ✅ Método create ahora crea persona y usuario
- ✅ Transacciones para operaciones atómicas
- ✅ Validación de persona existente antes de crear
- ✅ Método update actualiza persona si necesario
- ✅ Queries optimizadas con joins
- ✅ Métodos existentes funcionan correctamente

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, refactor, service, users

---

#### **TICKET-094: Crear endpoints REST para gestión de usuarios**

**Título:** Crear endpoints REST para gestión de usuarios

**Descripción:**
Implementar controlador completo para gestión de usuarios (ya preparado en TICKET-040, aquí se expande).

**Criterios de Aceptación:**
- ✅ GET /users - Listar usuarios (paginado, filtros)
- ✅ GET /users/:id - Obtener usuario con persona
- ✅ POST /users - Crear usuario nuevo
- ✅ PUT /users/:id - Actualizar usuario
- ✅ DELETE /users/:id - Desactivar usuario
- ✅ POST /users/:id/reset-password - Resetear contraseña
- ✅ PUT /users/:id/activate - Activar usuario
- ✅ PUT /users/:id/deactivate - Desactivar usuario
- ✅ Validación de permisos en cada endpoint

**Prioridad:** Alta  
**Esfuerzo:** 3 horas  
**Etiquetas:** backend, endpoint, users

---

#### **TICKET-095: Crear DTOs completos para usuarios**

**Título:** Crear DTOs completos para usuarios

**Descripción:**
Crear todos los DTOs necesarios para operaciones de usuarios.

**Criterios de Aceptación:**
- ✅ CreateUserDto (incluye datos de persona)
- ✅ UpdateUserDto (campos opcionales)
- ✅ UserResponseDto (usuario + persona + roles)
- ✅ UserFilterDto (filtros de búsqueda)
- ✅ ChangePasswordDto
- ✅ ResetPasswordDto
- ✅ Validaciones completas con class-validator
- ✅ Transformaciones necesarias

**Prioridad:** Alta  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, dto, validation, users

---

#### **TICKET-096: Implementar endpoint de búsqueda avanzada de usuarios**

**Título:** Implementar endpoint de búsqueda avanzada de usuarios

**Descripción:**
Crear endpoint con búsqueda avanzada y múltiples filtros combinables.

**Criterios de Aceptación:**
- ✅ POST /users/search - búsqueda con filtros complejos
- ✅ Filtros: username, nombres, identificación, email, rol, estado, oficina
- ✅ Operadores: AND, OR, LIKE
- ✅ Paginación y ordenamiento
- ✅ Query optimizada con índices
- ✅ Tiempo de respuesta < 1 segundo

**Prioridad:** Media  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, search, users

---

#### **TICKET-097: Implementar funcionalidad de cambio de contraseña**

**Título:** Implementar funcionalidad de cambio de contraseña

**Descripción:**
Crear endpoint y lógica para que usuario cambie su propia contraseña.

**Criterios de Aceptación:**
- ✅ PUT /users/me/change-password
- ✅ Requiere contraseña actual para validación
- ✅ Nueva contraseña debe cumplir política
- ✅ Hash con bcrypt
- ✅ Invalida refresh tokens existentes (opcional)
- ✅ Registro en auditoría
- ✅ Notificación por email (preparado)

**Prioridad:** Media  
**Esfuerzo:** 2 horas  
**Etiquetas:** backend, users, password

---

#### **TICKET-098: Implementar historial de contraseñas**

**Título:** Implementar historial de contraseñas

**Descripción:**
Crear tabla y lógica para evitar reutilización de contraseñas anteriores.

**Criterios de Aceptación:**
- ✅ Tabla `password_history` creada
- ✅ Almacena últimas N contraseñas (configurable, default: 5)
- ✅ Validación al cambiar contraseña
- ✅ Error si contraseña ya fue usada
- ✅ Limpieza automática de historial antiguo
- ✅ Hash seguro de contraseñas históricas

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, security, password, optional

---

#### **TICKET-099: Implementar exportación de usuarios a Excel**

**Título:** Implementar exportación de usuarios a Excel

**Descripción:**
Crear endpoint para exportar listado de usuarios con filtros a formato Excel.

**Criterios de Aceptación:**
- ✅ GET /users/export?format=xlsx
- ✅ Respeta filtros aplicados en búsqueda
- ✅ Columnas: username, nombres, identificación, email, roles, estado, oficina
- ✅ Formato Excel con estilos
- ✅ Headers descriptivos
- ✅ Límite de 10,000 registros
- ✅ Nombre de archivo con fecha

**Prioridad:** Baja  
**Esfuerzo:** 2.5 horas  
**Etiquetas:** backend, export, users

---

#### **TICKET-100: Crear endpoint para obtener perfil de usuario actual**

**Título:** Crear endpoint para obtener perfil de usuario actual

**Descripción:**
Crear endpoint para que usuario obtenga su propia información completa.

**Criterios de Aceptación:**
- ✅ GET /users/me - obtener perfil actual
- ✅ Incluye datos de persona completos
- ✅ Incluye roles y permisos
- ✅ Incluye configuraciones personales
- ✅ No requiere permiso especial (solo autenticación)
- ✅ Cache de perfil (opcional)

**Prioridad:** Media  
**Esfuerzo:** 1.5 horas  
**Etiquetas:** backend, endpoint, users, profile

---

## 📊 RESUMEN DEL BLOQUE 2

**Tickets Generados:** 51 - 100 (50 tickets)  
**Esfuerzo Total:** ~121.5 horas (~3 semanas)

### Distribución por Categoría:
- 📚 Catálogos Maestros (Backend): 15 tickets (38 horas)
- 🖥️ Frontend - Autenticación: 10 tickets (23.5 horas)
- 🖥️ Frontend - Layout y Navegación: 5 tickets (12 horas)
- 🖥️ Frontend - Catálogos: 5 tickets (13.5 horas)
- 👥 Gestión de Usuarios (Backend): 15 tickets (35.5 horas)

### Estado:
✅ **Bloque 2 completado** - Completa US-001 y avanza significativamente en US-002

---

## 🎯 Próximo Bloque

El **Bloque 3** continuará con:
- Finalización de US-002 (Frontend de usuarios y gestión de roles)
- Inicio de US-003 (Módulo de Clientes)

---

**Fecha de Generación:** 17 de Diciembre de 2025  
**Bloque:** 2 de 9
