# Ticket: TK-006

## Título
BE: Definir/Actualizar Esquema BBDD para Entidad `Usuario`

## Descripción
Asegurar que la tabla `Usuario` en la base de datos del ATS MVP contenga todos los campos necesarios para la gestión de usuarios y autenticación, incluyendo `id` (PK), `nombre`, `email` (Unique), `password_hash`, `rol` (Enum: 'RECLUTADOR', 'MANAGER', 'ADMIN'), `activo` (Boolean), `fecha_creacion`, `fecha_actualizacion`. Crear o modificar la tabla según sea necesario.

## User Story Relacionada
US-003: Gestionar Cuentas de Usuario y Roles (y US-004 para `password_hash`)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un script de migración de base de datos (o definición en ORM) que crea/altera la tabla `Usuario`.
2.  La tabla `Usuario` incluye los campos: `id` (UUID, PK), `nombre` (String, Not Null), `email` (String, Unique, Not Null), `password_hash` (String, Not Null), `rol` (String/Enum, Not Null), `activo` (Boolean, Not Null, Default: true), `fecha_creacion` (Timestamp), `fecha_actualizacion` (Timestamp).
3.  Se ha aplicado la migración correctamente en el entorno de desarrollo.
4.  El índice UNIQUE en el campo `email` está creado.

## Solución Técnica Propuesta (Opcional)
Usar el sistema de migraciones del ORM/framework backend (ej. TypeORM, Alembic, Django Migrations).

## Dependencias Técnicas (Directas)
* Elección de Base de Datos.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-003)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Definición modelo, creación script migración, aplicación inicial]

## Asignación Inicial
Equipo Backend / DBA

## Etiquetas
backend, database, schema, migration, user

## Comentarios
Este esquema es fundamental para US-003 y US-004.

## Enlaces o Referencias
[Documentación del ORM/Sistema de Migraciones]