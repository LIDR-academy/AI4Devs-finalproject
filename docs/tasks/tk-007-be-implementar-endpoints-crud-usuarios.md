# Ticket: TK-007

## Título
BE: Implementar Endpoints API RESTful para CRUD de Usuarios

## Descripción
Desarrollar y exponer los endpoints de la API interna v1 (según TK-001) necesarios para gestionar usuarios desde el frontend. Incluir endpoints para: Listar Usuarios, Crear Usuario, Obtener Detalles de Usuario, Actualizar Usuario (rol/estado). Asegurar que estos endpoints estén protegidos y solo accesibles para el rol 'ADMIN'.

## User Story Relacionada
US-003: Gestionar Cuentas de Usuario y Roles

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `GET /api/v1/users` que devuelve una lista paginada de usuarios (id, nombre, email, rol, activo). Protegido por Middleware (TK-005) y requiere rol ADMIN.
2.  Existe un endpoint `POST /api/v1/users` que acepta datos de nuevo usuario (nombre, email, password, rol). Protegido por Middleware (TK-005) y requiere rol ADMIN. Llama a la lógica de creación (TK-008). Devuelve 201 Created con los datos del usuario creado (sin hash) o 400/409 en caso de error.
3.  Existe un endpoint `GET /api/v1/users/{userId}` que devuelve los detalles de un usuario específico (id, nombre, email, rol, activo). Protegido por Middleware (TK-005) y requiere rol ADMIN. Devuelve 404 si no existe.
4.  Existe un endpoint `PATCH /api/v1/users/{userId}` (o PUT) que acepta datos para actualizar rol y/o estado `activo`. Protegido por Middleware (TK-005) y requiere rol ADMIN. Llama a la lógica de actualización (TK-008). Devuelve 200 OK con datos actualizados o 404/400 en caso de error.

## Solución Técnica Propuesta (Opcional)
Seguir patrones RESTful estándar. Usar el framework backend y su sistema de routing.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware de Autenticación/Autorización por rol)
* TK-008 (Lógica de Negocio de Usuarios)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-003)

## Estimación Técnica Preliminar
[ 6 ] [horas] - [Creación de rutas, controladores básicos, integración middleware, validación input básica]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, crud, user, authorization

## Comentarios
La autorización por rol es clave aquí.

## Enlaces o Referencias
[TK-001 - Especificación API]