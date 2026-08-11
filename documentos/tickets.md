# Tickets de trabajo principales — HU-01: Registro y acceso del socio

Este documento detalla tres tickets de trabajo principales para desarrollar la historia de usuario HU-01: "Registro y acceso del socio". Cada ticket está orientado a una capa del sistema y sigue buenas prácticas de gestión de producto y desarrollo: alcance claro, criterios de aceptación verificables, dependencias, riesgos y definición de hecho.

---

## 1. Ticket de backend — Implementación del flujo de registro y autenticación

### ID
TB-01

### Título
Implementar endpoints de registro y login para socios en la API

### Tipo
Backend / API

### Prioridad
Alta

### Responsable sugerido
Desarrollador backend

### Contexto
La historia HU-01 exige que un nuevo socio pueda registrarse en la plataforma y acceder con credenciales válidas. Este flujo debe ser soportado por la API propuesta en [documentos/apis.md](apis.md) y por el modelo de datos descrito en [documentos/modeloDatos.md](modeloDatos.md).

### Objetivo
Desarrollar los servicios backend necesarios para:
- crear un nuevo perfil de socio;
- validar credenciales de acceso;
- emitir un token de sesión seguro;
- devolver respuestas claras para casos exitosos y de error.

### Alcance
Incluye:
- creación del endpoint POST /auth/register;
- creación del endpoint POST /auth/login;
- validación de datos obligatorios y formato de correo;
- hash seguro de contraseñas;
- gestión de errores de autenticación y duplicidad de correo;
- integración con el modelo de datos de miembros;
- generación y retorno de un token JWT o mecanismo equivalente de sesión.

### Fuera de alcance
- recuperación de contraseña;
- integración con proveedores externos de identidad;
- gestión avanzada de roles y permisos;
- flujo de activación por email.

### Requisitos funcionales
- Un nuevo socio debe poder registrarse con nombre, apellidos, correo, contraseña y datos opcionales de contacto.
- El sistema debe rechazar registros con correo duplicado.
- El sistema debe almacenar la contraseña de forma segura mediante hash.
- El sistema debe permitir iniciar sesión con correo y contraseña válidos.
- Si las credenciales son incorrectas, la API debe devolver un error 401 con mensaje claro.
- La respuesta de login debe incluir el token de sesión y los datos básicos del socio.

### Requisitos técnicos
- Implementar en la capa de aplicación o casos de uso la lógica de registro y autenticación.
- Utilizar una librería de hashing segura para contraseñas.
- Utilizar un mecanismo de sesión basado en JWT o un mecanismo equivalente de autenticación.
- Aplicar validación de entrada en los DTOs o schemas de request.
- Registrar eventos relevantes para auditoría y trazabilidad.

### Tareas de implementación
1. Definir DTOs para registro y login.
2. Crear el servicio de autenticación.
3. Implementar la lógica de registro en el caso de uso correspondiente.
4. Implementar la lógica de login y generación de token.
5. Añadir validaciones de negocio y manejo de errores.
6. Conectar con la capa de persistencia para crear y recuperar miembros.
7. Escribir pruebas unitarias e integración para registro y login.
8. Actualizar la documentación de API con ejemplos reales.

### Criterios de aceptación
- Un usuario puede registrarse correctamente con datos válidos.
- El sistema no permite registrarse dos veces con el mismo correo.
- El sistema devuelve un error consistente para datos incompletos o inválidos.
- El login con credenciales correctas devuelve un token válido.
- El login con credenciales incorrectas devuelve un error de autenticación.
- Las contraseñas nunca se almacenan en texto plano.

### Dependencias
- Modelo de datos de miembros y roles.
- Configuración de JWT o mecanismo de sesión.
- Entorno de base de datos disponible.
- Endpoint de autenticación documentado en [documentos/apis.md](apis.md).

### Riesgos
- Implementación insegura de manejo de contraseñas.
- Token mal configurado o expuesto incorrectamente.
- Duplicidad de usuarios por ausencia de restricciones o validación.

### Entregables
- Endpoints funcionales de registro y login.
- Pruebas automatizadas para flujos positivos y negativos.
- Documentación técnica actualizada.

### Definición de hecho
El ticket se considera completo cuando:
- los endpoints están operativos;
- las pruebas pasan;
- la API responde según los criterios de aceptación;
- la seguridad básica está implementada.

---

## 2. Ticket de frontend — Diseñar y desarrollar el flujo de registro y acceso

### ID
TF-01

### Título
Crear la experiencia de registro y login para el socio en la web

### Tipo
Frontend / UX

### Prioridad
Alta

### Responsable sugerido
Desarrollador frontend

### Contexto
El backend ofrecerá los endpoints necesarios, pero la historia HU-01 requiere que el socio pueda completar el proceso desde la interfaz web sin fricción. La solución debe ser intuitiva, clara y alineada con el producto del club.

### Objetivo
Desarrollar las pantallas y flujos de usuario para:
- registro inicial;
- acceso a la plataforma;
- manejo básico de errores de formulario;
- redirección tras login exitoso.

### Alcance
Incluye:
- pantalla de registro con formulario de datos básicos;
- pantalla de login con correo y contraseña;
- validación visual de campos obligatorios;
- mensajes de error y éxito;
- almacenamiento local de sesión o token tras login;
- redirección al área principal del socio.

### Fuera de alcance
- recuperación de contraseña;
- integración con redes sociales;
- vistas administrativas para gestión de usuarios.

### Requisitos funcionales
- El socio puede completar un formulario de registro con los datos mínimos requeridos.
- El formulario muestra errores inline si faltan campos o el formato es incorrecto.
- Al registrarse correctamente, el usuario ve una confirmación y puede iniciar sesión.
- El login redirige al usuario a una vista principal o panel del socio.
- Si el backend devuelve un error, la interfaz lo muestra de forma comprensible.

### Requisitos técnicos
- Consumo de los endpoints de autenticación del backend.
- Manejo de estados de carga, error y éxito.
- Uso de rutas protegidas para usuarios autenticados.
- Almacenamiento seguro del token en el cliente, idealmente con medidas de seguridad apropiadas.

### Tareas de implementación
1. Crear las rutas de registro y login en la SPA o aplicación web.
2. Diseñar y desarrollar los formularios de entrada.
3. Implementar la integración con la API de registro y login.
4. Mostrar mensajes de error y validaciones para el usuario.
5. Implementar la redirección tras el login exitoso.
6. Añadir tests de interfaz básicos para el flujo principal.

### Criterios de aceptación
- El usuario puede registrarse y ver que el proceso ha terminado con éxito.
- El usuario puede iniciar sesión y acceder a una vista protegida.
- Los formularios muestran errores claros si los datos son inválidos.
- Los mensajes de error del backend se traducen en una experiencia comprensible para el usuario.

### Dependencias
- Endpoints de autenticación disponibles en backend.
- Diseño visual del flujo aprobado por producto.
- Definición de rutas de navegación del usuario autenticado.

### Riesgos
- Mala experiencia de usuario por formularios poco claros.
- Problemas de integración con la API.
- Gestión insegura del token en el cliente.

### Entregables
- Pantallas de registro y login.
- Flujo completo funcional.
- Pruebas de interfaz básicas.

### Definición de hecho
El ticket se considera completo cuando:
- las pantallas funcionan correctamente;
- el flujo de login y registro se valida en el navegador;
- los errores se gestionan correctamente;
- la experiencia es coherente con la propuesta de producto.

---

## 3. Ticket de base de datos — Crear la estructura de persistencia para socios y autenticación

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
Crear la estructura de base de datos necesaria para almacenar los datos de registro y acceso de los socios, así como la información asociada a roles y perfiles.

### Alcance
Incluye:
- creación de la tabla de roles;
- creación de la tabla de miembros;
- creación de la tabla de administradores si se desea separar el acceso administrativo del perfil socio;
- restricciones de unicidad para correo, DNI y número de socio;
- migraciones iniciales para el esquema;
- índices básicos de búsqueda y rendimiento.

### Fuera de alcance
- migraciones de datos históricas;
- particionado de tablas;
- gestión avanzada de auditoría masiva.

### Requisitos funcionales
- El sistema debe poder almacenar correctamente los datos del socio.
- Las credenciales deben almacenarse de forma segura.
- No debe existir más de un registro de miembro con el mismo correo.
- La base de datos debe permitir identificar el rol del usuario.

### Requisitos técnicos
- Definir tipos apropiados para UUID, texto, fechas, estados y hash de contraseñas.
- Crear restricciones `NOT NULL`, `UNIQUE` y `CHECK` donde corresponda.
- Añadir comentarios descriptivos a tablas y columnas cuando sea necesario.
- Preparar migraciones idempotentes y versionadas.

### Tareas de implementación
1. Crear la migración de la tabla `roles`.
2. Crear la migración de la tabla `members`.
3. Crear la migración de la tabla `admin_users` si se integra en el diseño.
4. Definir restricciones de unicidad y de integridad referencial.
5. Añadir índices para búsquedas por correo y estado.
6. Validar la migración en un entorno limpio.

### Criterios de aceptación
- Las tablas se crean correctamente con la estructura definida.
- Las relaciones entre tablas son correctas.
- Las restricciones de unicidad se aplican.
- La migración puede ejecutarse sin errores en un entorno limpio.
- El backend puede insertar y leer registros de forma consistente.

### Dependencias
- Modelo de datos consensuado.
- Motor de base de datos PostgreSQL propuesto en [documentos/arquitectura.md](arquitectura.md).
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
