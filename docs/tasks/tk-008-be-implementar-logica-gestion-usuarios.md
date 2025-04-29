# Ticket: TK-008

## Título
BE: Implementar Lógica de Negocio para Gestión de Usuarios

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend del ATS MVP para manejar las operaciones CRUD de usuarios invocadas por los endpoints API (TK-007). Esto incluye la validación de datos, la interacción con la base de datos (usando el esquema de TK-006), el hashing seguro de contraseñas al crear usuarios y la gestión de la restricción de email único.

## User Story Relacionada
US-003: Gestionar Cuentas de Usuario y Roles

## Criterios de Aceptación Técnicos (Verificables)
1.  Al crear un usuario:
    * Se valida que el email tenga formato correcto y no exista previamente en la BBDD (devuelve error 409 Conflict si existe).
    * Se valida que el rol proporcionado sea válido ('RECLUTADOR', 'MANAGER', 'ADMIN').
    * Se hashea la contraseña proporcionada usando bcrypt antes de guardarla en `password_hash`.
    * Se guarda el nuevo registro `Usuario` en la BBDD con estado `activo` = true por defecto.
2.  Al actualizar un usuario (PATCH/PUT):
    * Se valida que el `userId` exista (devuelve 404 si no).
    * Se permite actualizar los campos `rol` y `activo`.
    * Se valida que el nuevo `rol` sea válido.
    * Se actualiza el registro en la BBDD.
3.  Al listar/obtener usuarios: Se recuperan los datos correctamente de la BBDD (sin incluir `password_hash`).
4.  Se manejan adecuadamente los errores de base de datos (ej. violación de constraint unique email).

## Solución Técnica Propuesta (Opcional)
Implementar en la capa de Servicios/Casos de Uso del backend. Usar el ORM para interactuar con la BBDD. Utilizar librería bcrypt para hashing.

## Dependencias Técnicas (Directas)
* TK-006 (Esquema BBDD `Usuario`)
* TK-007 (Endpoints API que invocan esta lógica)
* Librería bcrypt

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-003)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Implementación lógica CRUD, validaciones, hashing, manejo errores BBDD]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, user, crud, validation, hashing, security

## Comentarios
La correcta implementación del hashing y la validación de email único son cruciales.

## Enlaces o Referencias
[Documentación ORM, Documentación bcrypt]