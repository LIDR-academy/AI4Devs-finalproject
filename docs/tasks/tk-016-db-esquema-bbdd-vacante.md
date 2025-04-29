# Ticket: TK-016

## Título
BE: Definir/Actualizar Esquema BBDD para Entidad `Vacante` (Campos Básicos)

## Descripción
Asegurar que la tabla `Vacante` en la base de datos del ATS MVP contenga los campos iniciales necesarios para crear una vacante: `id` (PK), `titulo`, `departamento`, `ubicacion_texto`, `requisitos_clave`, `estado` (con default 'BORRADOR'), `fecha_creacion`, `fecha_actualizacion`, `recruiter_id` (FK a Usuario), etc. Crear o modificar la tabla según sea necesario.

## User Story Relacionada
US-005: Crear Nueva Vacante (y otras US de F1, F2)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un script de migración de base de datos (o definición ORM) que crea/altera la tabla `Vacante`.
2.  La tabla incluye, como mínimo: `id` (UUID, PK), `titulo` (String, Not Null), `departamento` (String, Nullable), `ubicacion_texto` (String, Not Null), `requisitos_clave` (Text, Nullable), `estado` (String/Enum, Not Null, Default: 'BORRADOR'), `fecha_creacion` (Timestamp), `fecha_actualizacion` (Timestamp), `recruiter_id` (UUID, FK, Nullable - o Not Null si se asigna al crear).
3.  Se ha aplicado la migración correctamente en el entorno de desarrollo.
4.  Los tipos de datos y constraints (Not Null, Default) son correctos.

## Solución Técnica Propuesta (Opcional)
Usar el sistema de migraciones del ORM/framework backend. El campo `requisitos_clave` puede ser un TEXT simple inicialmente.

## Dependencias Técnicas (Directas)
* TK-006 (Esquema `Usuario` para `recruiter_id`)
* Elección de Base de Datos.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-005)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Definición modelo, creación script migración, aplicación inicial]

## Asignación Inicial
Equipo Backend / DBA

## Etiquetas
backend, database, schema, migration, vacancy, job

## Comentarios
Base para todas las operaciones de vacantes. Otros campos (descripción completa, fechas publicación/cierre, etc.) se añadirán/usarán en tickets posteriores.

## Enlaces o Referencias
[Documentación del ORM/Sistema de Migraciones]