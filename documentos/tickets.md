# Tickets de trabajo — Frapen Angels

Este documento detalla los tickets de trabajo organizados por historia de usuario. Cada ticket sigue buenas prácticas de gestión de producto y desarrollo: alcance claro, criterios de aceptación verificables, dependencias, riesgos y definición de hecho.

La secuencia global recomendada es:
1. **HU-01**: Autenticación y perfil (foundation)
2. **HU-03**: Gestión administrativa (contenido)
3. **HU-02**: Experiencia de socios (interacción con contenido)

Dentro de cada historia, el orden es: Base de datos → Backend → Frontend.

---

# HISTORIA DE USUARIO 1: Gestión de perfil y autenticación del socio

---

## Ticket 1.1 — Base de datos

### ID
TD-01

### Título
Crear las tablas y migraciones para socios, roles y autenticación

### Tipo
Base de datos

### Prioridad
Alta

### Responsable sugerido
Desarrollador de base de datos / backend

### Contexto
El sistema necesita persistir la información de los socios y la autenticación de acceso. El modelo propuesto en [documentos/modeloDatos.md](modeloDatos.md) define la estructura base de estas entidades y debe materializarse de forma segura y consistente.

### Objetivo
Crear la estructura de base de datos necesaria para almacenar los datos de registro, acceso y perfil de los socios, así como roles y permisos.

### Alcance
Incluye:
- creación de la tabla `roles`;
- creación de la tabla `members`;
- creación de la tabla `admin_users` para separar acceso administrativo;
- restricciones de unicidad para correo, DNI y número de socio;
- migraciones iniciales para el esquema;
- índices básicos de búsqueda y rendimiento.

### Fuera de alcance
- migraciones de datos históricas;
- particionado de tablas;
- gestión avanzada de auditoría masiva.

### Requisitos funcionales
- El sistema debe almacenar correctamente los datos del socio (nombre, apellidos, contacto, etc.).
- Las credenciales deben almacenarse de forma segura mediante hash.
- No debe existir más de un registro de miembro con el mismo correo.
- La base de datos debe permitir identificar el rol del usuario (socio, admin).
- Debe registrarse el timestamp de creación, actualización y último login.

### Requisitos técnicos
- Definir tipos apropiados para UUID, texto, fechas, estados y hash de contraseñas.
- Crear restricciones `NOT NULL`, `UNIQUE` y `CHECK` donde corresponda.
- Añadir comentarios descriptivos a tablas y columnas.
- Preparar migraciones idempotentes y versionadas.

### Tareas de implementación
1. Crear la migración de la tabla `roles` con permisos JSONB.
2. Crear la migración de la tabla `members` con todos los campos de perfil.
3. Crear la migración de la tabla `admin_users` para administradores.
4. Definir restricciones de unicidad (correo, DNI, membership_number).
5. Añadir índices para búsquedas por correo y estado.
6. Validar la migración en un entorno limpio.

### Criterios de aceptación
- Las tablas se crean correctamente con la estructura definida.
- Las relaciones entre tablas son correctas.
- Las restricciones de unicidad se aplican (no duplicar correo, DNI, membership_number).
- La migración puede ejecutarse sin errores en un entorno limpio.
- El backend puede insertar y leer registros de forma consistente.

### Dependencias
- Modelo de datos consensuado en [documentos/modeloDatos.md](modeloDatos.md).
- Motor de base de datos PostgreSQL propuesto.
- Requisitos de negocio para estados de usuario y roles.

### Riesgos
- Diseño incompleto del esquema.
- Falta de restricciones que provoque datos duplicados.
- Problemas de migración en entornos diferentes.

### Entregables
- Migraciones SQL versionadas.
- Esquema de base de datos listo para el backend.
- Validación de integridad y unicidad.

### Definición de hecho
El ticket se considera completo cuando:
- las migraciones ejecutan correctamente;
- las tablas y relaciones quedan creadas;
- el backend puede interactuar con ellas sin errores;
- las reglas de integridad y unicidad están aplicadas.

### Dependencia directa
Debe completarse antes que TB-01 (backend).

---

## Ticket 1.2 — Backend

### ID
TB-01

### Título
Implementar endpoints de registro, login y actualización de perfil para socios

### Tipo
Backend / API

### Prioridad
Alta

### Responsable sugerido
Desarrollador backend

### Contexto
La historia HU-01 exige que un nuevo socio pueda registrarse, acceder y mantener su perfil actualizado. Este flujo debe ser soportado por la API propuesta en [documentos/apis.md](apis.md) y por el modelo de datos descrito en [documentos/modeloDatos.md](modeloDatos.md).

### Objetivo
Desarrollar los servicios backend necesarios para:
- crear un nuevo perfil de socio;
- validar credenciales de acceso;
- emitir un token de sesión seguro;
- permitir actualización de datos de perfil;
- devolver respuestas claras para casos exitosos y de error.

### Alcance
Incluye:
- creación del endpoint `POST /auth/register`;
- creación del endpoint `POST /auth/login`;
- creación del endpoint `PUT /members/{memberId}` para actualización de perfil;
- validación de datos obligatorios y formato de correo;
- hash seguro de contraseñas usando bcrypt;
- cambio de contraseña con validación de contraseña actual;
- gestión de errores de autenticación y duplicidad;
- integración con el modelo de datos de miembros;
- generación y retorno de un token JWT;
- logging de operaciones para auditoría.

### Fuera de alcance
- recuperación de contraseña;
- integración con proveedores externos de identidad;
- gestión avanzada de roles y permisos;
- flujo de activación por email.

### Requisitos funcionales
- Un nuevo socio debe poder registrarse con nombre, apellidos, correo, contraseña y datos opcionales.
- El sistema debe rechazar registros con correo duplicado.
- El sistema debe almacenar la contraseña de forma segura mediante hash.
- El sistema debe permitir iniciar sesión con correo y contraseña válidos.
- Si las credenciales son incorrectas, la API debe devolver error 401 sin exponer información sensible.
- La respuesta de login debe incluir token JWT y datos básicos del socio.
- El socio puede actualizar sus datos personales (nombre, apellidos, teléfono, dirección, ciudad, código postal).
- El socio NO puede cambiar su email de acceso original ni su número de socio.
- El socio puede cambiar su contraseña mediante validación de contraseña actual.
- Todos los cambios quedan registrados con timestamp para trazabilidad.

### Requisitos técnicos
- Implementar en la capa de aplicación/services la lógica de autenticación y perfil.
- Utilizar librería bcrypt para hashing seguro de contraseñas.
- Utilizar JWT para generación de tokens con expiración configurable.
- Aplicar validación de entrada en DTOs.
- Registrar eventos relevantes para auditoría.
- Usar patrones de error consistentes en toda la API.

### Tareas de implementación
1. Definir DTOs para registro, login y actualización de perfil.
2. Crear el servicio de autenticación con lógica de registro.
3. Crear servicio de perfil para actualización de datos.
4. Implementar lógica de login y generación de JWT.
5. Añadir validaciones de negocio y manejo de errores.
6. Conectar con la capa de persistencia (TypeORM).
7. Escribir pruebas unitarias e integración.
8. Actualizar documentación de API con ejemplos.

### Criterios de aceptación
- Un usuario puede registrarse correctamente con datos válidos.
- El sistema no permite registrarse dos veces con el mismo correo.
- El sistema devuelve errores consistentes para datos incompletos o inválidos.
- El login con credenciales correctas devuelve un token válido.
- El login con credenciales incorrectas devuelve error 401.
- Las contraseñas nunca se almacenan en texto plano.
- El socio puede actualizar su perfil con cambios reflejados inmediatamente.
- El cambio de contraseña requiere validación de contraseña actual.

### Dependencias
- Base de datos completada (TD-01).
- Modelo de datos de miembros y roles.
- Configuración de JWT en el proyecto.
- Endpoint de autenticación documentado.

### Riesgos
- Implementación insegura de manejo de contraseñas.
- Token mal configurado o expuesto incorrectamente.
- Duplicidad de usuarios por ausencia de restricciones.
- Validación insuficiente de datos de entrada.

### Entregables
- Endpoints funcionales de registro, login y actualización.
- Pruebas automatizadas para flujos positivos y negativos.
- Documentación técnica actualizada.

### Definición de hecho
El ticket se considera completo cuando:
- los endpoints están operativos y responden correctamente;
- las pruebas pasan exitosamente;
- la API responde según los criterios de aceptación;
- la seguridad básica está implementada (hash, JWT);
- la documentación está actualizada.

### Dependencia directa
Debe ejecutarse después de TD-01 y antes de TF-01.

---

## Ticket 1.3 — Frontend

### ID
TF-01

### Título
Crear la experiencia de registro, login y gestión de perfil para el socio

### Tipo
Frontend / UX

### Prioridad
Alta

### Responsable sugerido
Desarrollador frontend

### Contexto
El backend ofrecerá los endpoints necesarios, pero la historia HU-01 requiere que el socio pueda completar registro, login y mantener su perfil desde la interfaz web sin fricción. La solución debe ser intuitiva, clara y alineada con el producto del club.

### Objetivo
Desarrollar las pantallas y flujos de usuario para:
- registro inicial del socio;
- acceso a la plataforma;
- gestión y actualización del perfil;
- cambio de contraseña;
- manejo de errores de formulario;
- redirección tras login exitoso.

### Alcance
Incluye:
- pantalla de registro con formulario de datos básicos;
- pantalla de login con correo y contraseña;
- pantalla de perfil con edición de datos;
- pantalla de cambio de contraseña;
- validación visual de campos obligatorios;
- mensajes de error y éxito;
- almacenamiento seguro del token tras login;
- rutas protegidas para usuarios autenticados;
- redirección al área principal del socio.

### Fuera de alcance
- recuperación de contraseña;
- integración con redes sociales;
- vistas administrativas;
- multi-factor authentication.

### Requisitos funcionales
- El socio puede completar un formulario de registro con datos mínimos requeridos.
- El formulario muestra errores inline si faltan campos o el formato es incorrecto.
- Al registrarse correctamente, el usuario ve una confirmación y puede iniciar sesión.
- El login redirige al usuario a su panel principal.
- Si el backend devuelve un error, la interfaz lo muestra de forma comprensible.
- El socio accede a una pantalla de perfil donde puede ver y editar sus datos.
- El socio puede cambiar su contraseña mediante un formulario separado.
- Logout limpia la sesión y redirige a login.

### Requisitos técnicos
- Consumo de los endpoints de autenticación del backend.
- Manejo de estados de carga, error y éxito.
- Uso de rutas protegidas para usuarios autenticados.
- Almacenamiento seguro del token en el cliente (localStorage o sessionStorage).
- Interceptores HTTP para inyectar token en requests.
- Validación de formularios en el cliente.

### Tareas de implementación
1. Crear rutas de `/auth/register`, `/auth/login`, `/profile`.
2. Diseñar y desarrollar el formulario de registro.
3. Diseñar y desarrollar el formulario de login.
4. Implementar integración con API de registro y login.
5. Crear pantalla de perfil con edición de datos.
6. Crear pantalla de cambio de contraseña.
7. Implementar manejo de errores y validaciones.
8. Implementar redirecciones tras login exitoso.
9. Añadir tests de interfaz básicos.

### Criterios de aceptación
- El usuario puede registrarse y ver confirmación de éxito.
- El usuario puede iniciar sesión y acceder a su panel principal.
- El usuario puede editar su perfil y ver cambios reflejados.
- El usuario puede cambiar su contraseña exitosamente.
- Los formularios muestran errores claros si los datos son inválidos.
- Los mensajes de error del backend se traducen en UX comprensible.
- El token se almacena y se utiliza en requests subsecuentes.

### Dependencias
- Endpoints de autenticación disponibles y funcionales (TB-01).
- Diseño visual del flujo aprobado por producto.
- Definición de rutas de navegación del usuario autenticado.

### Riesgos
- Mala experiencia de usuario por formularios poco claros.
- Problemas de integración con la API.
- Gestión insegura del token en el cliente.
- Falta de validación client-side causando UX pobre.

### Entregables
- Pantallas de registro, login, perfil y cambio de contraseña.
- Flujo completo funcional end-to-end.
- Tests de interfaz básicos.
- Documentación de flujos de usuario.

### Definición de hecho
El ticket se considera completo cuando:
- las pantallas funcionan correctamente;
- el flujo de registro, login y perfil se valida en el navegador;
- los errores se gestionan correctamente;
- la experiencia es coherente con la propuesta de producto;
- el usuario puede completar el flujo completo sin fricción.

### Dependencia directa
Debe ejecutarse después de TB-01.

---

---

# HISTORIA DE USUARIO 3: Gestión administrativa de rutas, contenido y comunicaciones

---

## Ticket 3.1 — Base de datos

### ID
TD-03

### Título
Crear las tablas y migraciones para rutas, calendario, media, pagos, notificaciones y auditoría

### Tipo
Base de datos

### Prioridad
Alta

### Responsable sugerido
Desarrollador de base de datos / backend

### Contexto
El sistema necesita persistir información de rutas, eventos de calendario, contenido multimedia, pagos y notificaciones. El modelo propuesto en [documentos/modeloDatos.md](modeloDatos.md) define estas entidades y debe materializarse de forma segura y consistente.

### Objetivo
Crear la estructura de base de datos necesaria para almacenar rutas, calendario, media, pagos, notificaciones y registros de auditoría con relaciones e integridad referencial correctas.

### Alcance
Incluye:
- creación de la tabla `routes` para rutas con estados y precios;
- creación de la tabla `route_media` para imágenes y vídeos;
- creación de la tabla `calendar_events` para eventos programados;
- creación de la tabla `payments` para registros de pago;
- creación de la tabla `notifications` y `notification_recipients` para avisos;
- creación de la tabla `audit_logs` para auditoría de cambios;
- restricciones de integridad referencial y estados;
- índices para búsquedas frecuentes;
- migraciones versionadas e idempotentes.

### Fuera de alcance
- integración de pasarelas de pago;
- almacenamiento de archivos en la BD (solo URLs);
- particionado de tablas.

### Requisitos funcionales
- El sistema almacena rutas con título, descripción, dificultad, fechas, precios y estado.
- Se registran imágenes y vídeos asociados a rutas.
- El sistema registra eventos de calendario con fecha, hora, ubicación y capacidad.
- Se registran pagos con estado, monto, proveedor y ID externo de transacción.
- Se almacenan notificaciones y su entrega a socios.
- Se auditan todas las operaciones administrativas relevantes.

### Requisitos técnicos
- Tipos de datos apropiados para UUID, texto, fechas, dinero (DECIMAL), estados (ENUM o CHECK).
- Restricciones `NOT NULL` donde corresponda.
- Claves foráneas con integridad referencial.
- Índices en columnas de búsqueda frecuente (status, created_at, created_by).
- Comentarios descriptivos en tablas y columnas.

### Tareas de implementación
1. Crear migración de tabla `routes`.
2. Crear migración de tabla `route_media`.
3. Crear migración de tabla `calendar_events`.
4. Crear migración de tabla `payments`.
5. Crear migración de tabla `notifications` y `notification_recipients`.
6. Crear migración de tabla `audit_logs`.
7. Definir restricciones de integridad referencial.
8. Añadir índices para rendimiento.
9. Validar migraciones en entorno limpio.

### Criterios de aceptación
- Las tablas se crean correctamente con estructura definida.
- Las relaciones foráneas funcionan correctamente.
- Las restricciones de estado (status) se aplican.
- Migraciones ejecutan sin errores en entorno limpio.
- Backend puede insertar y leer registros consistentemente.

### Dependencias
- Modelo de datos consensuado.
- Base de datos PostgreSQL.
- Tablas de HU-01 (members, admin_users, roles).

### Riesgos
- Diseño incompleto del esquema.
- Falta de restricciones causando datos inválidos.
- Problemas de integridad referencial.

### Entregables
- Migraciones SQL versionadas.
- Esquema de base de datos listo para backend.
- Validación de integridad y relaciones.

### Definición de hecho
El ticket se considera completo cuando:
- las migraciones ejecutan correctamente;
- todas las tablas y relaciones quedan creadas;
- el backend puede interactuar sin errores;
- las restricciones de estado funcionan.

### Dependencia directa
Debe completarse antes que TB-03 (backend administrativo).

---

## Ticket 3.2 — Backend

### ID
TB-03

### Título
Implementar endpoints administrativos para crear, gestionar, moderar rutas y enviar comunicaciones

### Tipo
Backend / API

### Prioridad
Alta

### Responsable sugerido
Desarrollador backend

### Contexto
La historia HU-03 exige que los administradores puedan crear rutas, gestionar galerías, programar calendario, moderar propuestas de socios y enviar notificaciones. Estos endpoints deben estar seguros, auditados y soportados por el modelo de datos.

### Objetivo
Desarrollar los servicios backend necesarios para:
- crear y editar rutas con detalles completos;
- cargar y gestionar contenido multimedia;
- crear y programar eventos de calendario;
- revisar, aprobar o rechazar propuestas de socios;
- crear y enviar notificaciones/avisos a socios;
- auditar todas las operaciones administrativas.

### Alcance
Incluye:
- endpoint `POST /admin/routes` para crear rutas;
- endpoint `PUT /admin/routes/{routeId}` para editar rutas;
- endpoint `POST /admin/routes/{routeId}/media` para subir contenido multimedia;
- endpoint `POST /admin/calendar-events` para crear eventos;
- endpoint `GET /admin/route-proposals` para listar propuestas pendientes;
- endpoint `POST /admin/route-proposals/{proposalId}/review` para moderar propuestas;
- endpoint `POST /admin/notifications` para crear y enviar avisos;
- validación de permisos de administrador en cada endpoint;
- logging y auditoría de cambios;
- manejo de errores y validaciones.

### Fuera de alcance
- integración directa con proveedores de almacenamiento (S3, Cloudinary);
- gestión de permisos granulares más allá de admin/socio;
- recuperación de archivos multimedia.

### Requisitos funcionales
- Solo usuarios con rol administrador pueden acceder a estos endpoints.
- El administrador puede crear una ruta completa con todos los datos.
- El administrador puede editar rutas ya creadas.
- El administrador puede cambiar estado de ruta (DRAFT, PUBLISHED, COMPLETED, CANCELLED).
- El administrador puede subir múltiples imágenes/vídeos a una ruta.
- El administrador puede marcar una imagen como portada.
- El administrador puede crear eventos de calendario.
- El administrador ve una lista de propuestas pendientes de socios.
- El administrador puede aprobar propuestas (pasan a PUBLISHED).
- El administrador puede rechazar propuestas con motivo (envía notificación al socio).
- El administrador puede crear y enviar notificaciones a todos los socios.
- Todas las operaciones se registran en auditoría con identificador del administrador.

### Requisitos técnicos
- Implementar guards de autorización para validar rol admin.
- Usar DTOs para validación de entrada.
- Implementar servicios separados por dominio (routes, media, calendar, notifications).
- Usar TypeORM para persistencia.
- Registrar eventos en tabla `audit_logs`.
- Validar datos de entrada exhaustivamente.
- Manejar transacciones para operaciones multi-tabla.
- Retornar errores consistentes (403 Forbidden para no admin, 400 Bad Request para datos inválidos).

### Tareas de implementación
1. Crear DTOs para creación y edición de rutas.
2. Crear servicio de rutas con lógica de CRUD.
3. Crear servicio de media para upload y gestión.
4. Crear servicio de calendario para eventos.
5. Crear servicio de propuestas para review y moderación.
6. Crear servicio de notificaciones para envío.
7. Crear servicio de auditoría para logging.
8. Implementar guards de autorización.
9. Escribir pruebas unitarias e integración.
10. Documentar endpoints en API docs.

### Criterios de aceptación
- Solo administradores pueden crear/editar rutas.
- Las rutas se crean con todos los datos correctamente almacenados.
- El administrador puede subir múltiples imágenes a una ruta.
- Las propuestas de socios se muestran en lista de pendientes.
- La aprobación de propuesta cambia estado a PUBLISHED.
- El rechazo de propuesta notifica al socio con motivo.
- Las notificaciones se envían correctamente a los socios.
- Toda operación administrativa queda registrada en auditoría.
- Los errores de autorización retornan 403.
- Los datos inválidos retornan errores claros.

### Dependencias
- Base de datos completada (TD-03).
- Autenticación de admin (TB-01).
- Documentación de API.

### Riesgos
- Autorización inadecuada permitiendo socios realizar acciones admin.
- Falta de validación causando datos inconsistentes.
- Auditoría incompleta.
- Manejo de uploads sin validar tamaño/tipo de archivo.

### Entregables
- Endpoints funcionales de gestión administrativa.
- Pruebas automatizadas.
- Documentación técnica actualizada.
- Registros de auditoría completos.

### Definición de hecho
El ticket se considera completo cuando:
- los endpoints están operativos;
- solo administradores pueden acceder;
- las operaciones se auditan correctamente;
- las pruebas pasan;
- la documentación está actualizada.

### Dependencia directa
Debe ejecutarse después de TD-03 y antes de TF-03.

---

## Ticket 3.3 — Frontend

### ID
TF-03

### Título
Crear el panel administrativo para gestionar rutas, contenido, calendario y comunicaciones

### Tipo
Frontend / UX

### Prioridad
Alta

### Responsable sugerido
Desarrollador frontend

### Contexto
El backend administrativo está disponible, pero los administradores necesitan una interfaz intuitiva para crear rutas, gestionar contenido multimedia, programar calendario, moderar propuestas y enviar notificaciones sin acceder directamente a la base de datos.

### Objetivo
Desarrollar un panel administrativo con pantallas para:
- crear y editar rutas con formularios complejos;
- subir y gestionar contenido multimedia;
- crear eventos de calendario;
- revisar y moderar propuestas de socios;
- crear y enviar notificaciones.

### Alcance
Incluye:
- pantalla de listado de rutas con filtros y acciones;
- formulario de creación/edición de rutas;
- uploader de imágenes/vídeos con preview;
- pantalla de gestión de calendario;
- panel de propuestas pendientes con opciones de aprobar/rechazar;
- formulario para crear y enviar notificaciones;
- lista de notificaciones enviadas con estadísticas;
- confirmaciones antes de acciones destructivas;
- mensajes de éxito/error claros.

### Fuera de alcance
- análisis de datos avanzado o reporting;
- gestión de usuarios administradores;
- dashboards con métricas complejas.

### Requisitos funcionales
- El administrador accede a un panel segregado (solo con rol admin).
- Puede crear una ruta completando un formulario con todos los campos.
- Puede editar rutas existentes.
- Puede cambiar estado de ruta (draft, published, etc.).
- Puede subir múltiples imágenes a una ruta.
- Puede marcar una imagen como portada.
- Puede crear eventos de calendario.
- Puede ver lista de propuestas de socios pendientes de revisión.
- Puede aprobar propuestas (con confirmación).
- Puede rechazar propuestas indicando motivo.
- Puede crear notificaciones y enviarlas inmediatamente o programarlas.
- Puede ver historial de notificaciones enviadas.

### Requisitos técnicos
- Rutas protegidas solo para rol admin.
- Consumo de endpoints administrativos del backend.
- Manejo de formularios complejos con validación.
- Upload de archivos con preview.
- Confirmaciones modales antes de acciones críticas.
- Gestión de estados de carga, error y éxito.
- Tablas/listas con paginación y filtros.

### Tareas de implementación
1. Crear layout del panel administrativo.
2. Crear pantalla de listado de rutas.
3. Crear formulario de creación/edición de rutas.
4. Crear uploader de multimedia.
5. Crear pantalla de calendario.
6. Crear pantalla de propuestas pendientes.
7. Crear formulario de notificaciones.
8. Implementar integraciones con endpoints admin.
9. Añadir manejo de errores y confirmaciones.
10. Escribir tests básicos.

### Criterios de aceptación
- Solo administradores ven el panel (verificado por rol).
- El formulario de rutas valida todos los campos requeridos.
- Las imágenes se cargan y se muestran en preview.
- Las propuestas pendientes se listan correctamente.
- La aprobación/rechazo de propuestas funciona correctamente.
- Las notificaciones se crean y envían.
- Los errores del backend se muestran claramente.
- Las acciones destructivas piden confirmación.

### Dependencias
- Endpoints administrativos disponibles y funcionales (TB-03).
- Autenticación de admin (TF-01).
- Diseño visual del panel aprobado.

### Riesgos
- Interfaz compleja causando errores de uso.
- Problemas de carga de archivos.
- Integración incorrecta con API.
- Seguridad de acceso (que solo admin acceda).

### Entregables
- Panel administrativo funcional.
- Pantallas para todas las operaciones administrativas.
- Tests de interfaz básicos.
- Documentación de uso del panel.

### Definición de hecho
El ticket se considera completo cuando:
- el panel es funcional y accesible solo para admin;
- todas las operaciones (crear, editar, moderar, notificar) funcionan;
- los errores se gestionan correctamente;
- la UX es clara e intuitiva.

### Dependencia directa
Debe ejecutarse después de TB-03.

---

---

# HISTORIA DE USUARIO 2: Experiencia de rutas para el socio

---

## Ticket 2.1 — Base de datos

### ID
TD-02

### Título
Crear las tablas y migraciones para inscripciones de rutas e historial

### Tipo
Base de datos

### Prioridad
Alta

### Responsable sugerido
Desarrollador de base de datos / backend

### Contexto
El sistema necesita registrar inscripciones de socios a rutas, pagos asociados y permitir al socio consultar su historial de participación. Esto requiere extensiones a las tablas de rutas y la creación de tablas de relación e historial.

### Objetivo
Crear la estructura de base de datos necesaria para registrar inscripciones de socios a rutas, pagos y permitir consultas de historial.

### Alcance
Incluye:
- creación de la tabla `route_registrations` para inscripciones;
- extensiones a tabla `payments` si es necesario (relación con registros);
- índices para búsquedas de inscripciones por socio, ruta y estado;
- restricciones de integridad referencial;
- migraciones versionadas.

### Fuera de alcance
- cálculo automático de precios;
- integración con pasarelas de pago externas.

### Requisitos funcionales
- Se registra cada inscripción de socio a ruta con estado.
- Se registra número de acompañantes en la inscripción.
- Se calcula el monto debido basado en servicios.
- Se registra el estado del pago asociado.
- Se puede consultar todas las inscripciones de un socio.

### Requisitos técnicos
- Tipos de datos apropiados para relaciones y estados.
- Restricciones de unicidad (un socio no puede inscribirse dos veces en la misma ruta).
- Claves foráneas con integridad referencial.
- Índices en columnas de búsqueda frecuente.

### Tareas de implementación
1. Crear migración de tabla `route_registrations`.
2. Crear migración de tabla `payments` si es necesario.
3. Definir restricciones de integridad.
4. Añadir índices para performance.

### Criterios de aceptación
- Las tablas se crean correctamente.
- Las restricciones de unicidad funcionan.
- El backend puede insertar y consultar registros.

### Dependencias
- Tablas de routes, members (de HU-01 y HU-03).
- Modelo de datos consensuado.

### Riesgos
- Falta de restricciones permitiendo inscripciones duplicadas.
- Inconsistencia de datos en pagos.

### Entregables
- Migraciones SQL versionadas.
- Esquema listo para backend.

### Definición de hecho
El ticket se considera completo cuando:
- migraciones ejecutan sin errores;
- tablas y relaciones quedan creadas;
- restricciones de unicidad funcionan;
- backend puede interactuar sin errores.

### Dependencia directa
Debe completarse antes que TB-02.

---

## Ticket 2.2 — Backend

### ID
TB-02

### Título
Implementar endpoints para consulta, reserva, propuesta e historial de rutas

### Tipo
Backend / API

### Prioridad
Alta

### Responsable sugerido
Desarrollador backend

### Contexto
La historia HU-02 exige que los socios puedan consultar rutas, ver galerías y calendario, inscribirse en rutas, proponer nuevas rutas y consultar su historial de participación. Estos endpoints deben ser seguros y retornar datos estructurados para la UI.

### Objetivo
Desarrollar los servicios backend necesarios para:
- consultar rutas publicadas con filtros;
- obtener detalles de ruta incluyendo galería y calendario;
- inscribir socio en ruta;
- proponer nuevas rutas para revisión;
- consultar historial de inscripciones del socio;
- auditoria de operaciones.

### Alcance
Incluye:
- endpoint `GET /routes` para listar rutas publicadas con filtros;
- endpoint `GET /routes/{routeId}` para detalles de ruta;
- endpoint `GET /routes/{routeId}/media` para galería;
- endpoint `GET /calendar-events` para calendario;
- endpoint `POST /members/{memberId}/route-registrations` para inscribirse;
- endpoint `GET /members/{memberId}/route-registrations` para historial próximas;
- endpoint `GET /members/{memberId}/route-registrations/completed` para historial realizadas;
- endpoint `POST /members/{memberId}/route-proposals` para proponer ruta;
- endpoint `GET /members/{memberId}/route-proposals` para ver propias propuestas;
- validación de permisos (socio solo ve sus datos);
- manejo de errores.

### Fuera de alcance
- análisis de rutas o estadísticas complejas;
- exportación de datos.

### Requisitos funcionales
- Los socios ven rutas en estado PUBLISHED.
- Los socios pueden filtrar rutas por dificultad, fecha, precio, servicios.
- Al consultar ruta, ven descripción, galería, detalles de servicios y precios.
- Los socios ven calendario con eventos programados.
- Los socios pueden inscribirse en una ruta indicando acompañantes.
- El sistema evita duplicidades de inscripción.
- Los socios pueden proponer nuevas rutas con todos los datos.
- Las propuestas quedan en estado PENDING_REVIEW.
- Los socios ven su historial de rutas (próximas y realizadas).
- El historial muestra detalles, fotos y estado de pago.

### Requisitos técnicos
- Usar DTOs para responses estructuradas.
- Validar permisos (socio solo accede a sus datos).
- Usar TypeORM para queries complejas (filtros, joins).
- Paginación en listas.
- Caché para datos frecuentes (rutas publicadas, calendario).
- Logging de operaciones.

### Tareas de implementación
1. Crear DTOs para rutas, inscripciones, propuestas.
2. Crear servicio de consulta de rutas con filtros.
3. Crear servicio de inscripción.
4. Crear servicio de propuestas.
5. Crear servicio de historial de socios.
6. Implementar queries con filtros y paginación.
7. Escribir pruebas unitarias e integración.
8. Documentar endpoints.

### Criterios de aceptación
- Los socios ven solo rutas PUBLISHED.
- Filtros de rutas funcionan correctamente.
- Galería y calendario se retornan con ruta.
- Inscripción en ruta funciona.
- No permite inscripción duplicada.
- Propuesta de ruta guarda correctamente.
- Historial muestra próximas y realizadas.
- Solo el socio ve sus datos.

### Dependencias
- Base de datos completada (TD-02, TD-03, TD-01).
- Autenticación de socio (TB-01).
- Rutas creadas por admin (TB-03).

### Riesgos
- Queries ineficientes causando lentitud.
- Autorización permitiendo ver datos de otros socios.
- Inscripciones duplicadas por race conditions.

### Entregables
- Endpoints funcionales.
- Pruebas automatizadas.
- Documentación actualizada.

### Definición de hecho
El ticket se considera completo cuando:
- todos los endpoints están operativos;
- los filtros funcionan;
- la autorización es correcta;
- las pruebas pasan;
- documentación está actualizada.

### Dependencia directa
Debe ejecutarse después de TD-02, TB-03 y antes de TF-02.

---

## Ticket 2.3 — Frontend

### ID
TF-02

### Título
Crear la experiencia de consulta, reserva, propuesta e historial de rutas para el socio

### Tipo
Frontend / UX

### Prioridad
Alta

### Responsable sugerido
Desarrollador frontend

### Contexto
El backend está disponible, pero los socios necesitan una interfaz visual clara para descubrir rutas, ver fotos, consultar calendario, inscribirse, proponer rutas nuevas y revisar su historial de participación.

### Objetivo
Desarrollar las pantallas para:
- listar rutas publicadas con filtros;
- ver detalles de ruta con galería;
- consultar calendario de actividades;
- inscribirse en rutas;
- proponer nuevas rutas;
- consultar historial de participación.

### Alcance
Incluye:
- pantalla de listado de rutas con filtros (dificultad, fecha, precio);
- detalle de ruta con galería de imágenes;
- vista de calendario integrando rutas y eventos;
- formulario de inscripción a ruta;
- formulario de propuesta de nueva ruta;
- sección "Mis Rutas" con próximas y realizadas;
- vista de historial con detalles y fotos;
- confirmaciones antes de inscribirse;
- manejo de errores y mensajes claros.

### Fuera de alcance
- análisis de datos o estadísticas avanzadas;
- descarga de certificados;
- comentarios o reviews en rutas.

### Requisitos funcionales
- El socio ve listado de rutas con información clave: título, fecha, dificultad, precio.
- Puede filtrar por dificultad, fecha, precio, servicios.
- Al hacer clic en ruta, ve detalles completos y galería de fotos.
- Puede ver un calendario con rutas y eventos programados.
- Puede inscribirse en una ruta indicando acompañantes.
- Recibe confirmación de inscripción.
- Puede proponer una nueva ruta con formulario.
- Recibe confirmación de propuesta enviada.
- Puede ver sección "Mis Rutas" con próximas inscritas.
- Puede ver historial de rutas realizadas.
- En historial, ve detalles, fotos y estado de pago.

### Requisitos técnicos
- Consumo de endpoints de rutas del backend.
- Componentes de galería de imágenes.
- Componente de calendario visual.
- Formularios con validación.
- Manejo de estados de carga, error y éxito.
- Paginación en listas.

### Tareas de implementación
1. Crear pantalla de listado de rutas.
2. Crear componente de filtros.
3. Crear detalle de ruta con galería.
4. Crear componente de calendario.
5. Crear formulario de inscripción.
6. Crear formulario de propuesta.
7. Crear pantalla "Mis Rutas".
8. Crear vista de historial.
9. Implementar integraciones con endpoints.
10. Escribir tests básicos.

### Criterios de aceptación
- El listado de rutas muestra datos correctamente.
- Los filtros funcionan.
- La galería muestra imágenes de ruta.
- El calendario integra rutas y eventos.
- La inscripción funciona y muestra confirmación.
- La propuesta se envía correctamente.
- El historial muestra próximas y realizadas.
- Los errores se muestran claramente.

### Dependencias
- Endpoints de rutas disponibles y funcionales (TB-02).
- Autenticación de socio (TF-01).
- Diseño visual aprobado.

### Riesgos
- Galería lenta por demasiadas imágenes.
- Problemas de integración con calendario.
- Formularios complejos causando fricción.

### Entregables
- Pantallas funcionales del flujo de rutas.
- Componentes de galería y calendario.
- Tests básicos.
- Documentación de flujos.

### Definición de hecho
El ticket se considera completo cuando:
- todas las pantallas funcionan;
- los filtros y búsquedas funcionan;
- la inscripción y propuesta funcionan;
- el historial muestra datos correctamente;
- la UX es fluida sin fricción.

### Dependencia directa
Debe ejecutarse después de TB-02.

---

---

## Resumen de prioridad global

### Orden de ejecución recomendado:

**Fase 1 — Foundation (HU-01):**
1. TD-01 — Base de datos de socios
2. TB-01 — Backend de autenticación
3. TF-01 — Frontend de registro y perfil

**Fase 2 — Contenido administrativo (HU-03):**
4. TD-03 — Base de datos de rutas y contenido
5. TB-03 — Backend administrativo
6. TF-03 — Panel administrativo

**Fase 3 — Experiencia de socios (HU-02):**
7. TD-02 — Base de datos de inscripciones
8. TB-02 — Backend de consulta y reserva
9. TF-02 — Frontend de rutas e historial

Este orden permite:
- Fase 1: Sistema funcional de autenticación
- Fase 2: Administrador puede crear contenido
- Fase 3: Socios acceden a contenido creado

---

## Patrones y buenas prácticas aplicadas

Todos los tickets siguen:
- ✅ Estructura consistente (ID, Título, Tipo, Prioridad, Responsable)
- ✅ Contexto y objetivo claro
- ✅ Alcance explícito (incluye/excluye)
- ✅ Requisitos funcionales y técnicos
- ✅ Tareas de implementación desglosadas
- ✅ Criterios de aceptación verificables
- ✅ Dependencias y riesgos identificados
- ✅ Definición de hecho clara
- ✅ Dependencias directas con otros tickets
