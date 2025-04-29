# Ticket: TK-011

## Título
BE: Definir/Actualizar Esquema BBDD para Entidad `EtapaPipeline`

## Descripción
Asegurar que la tabla `EtapaPipeline` en la base de datos del ATS MVP contenga los campos necesarios: `id` (PK), `nombre` (String, Not Null), `orden` (Integer, Not Null), `seleccionable_ia` (Boolean, Not Null, Default: false), `tipo_etapa` (Enum opcional: 'INICIO', 'INTERMEDIO', 'FINAL', 'RECHAZO' - puede ser útil), `fecha_creacion`, `fecha_actualizacion`.

## User Story Relacionada
US-002: Gestionar Etapas del Pipeline de Selección

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un script de migración de base de datos (o definición ORM) que crea/altera la tabla `EtapaPipeline`.
2.  La tabla incluye los campos: `id` (UUID, PK), `nombre` (String, Not Null), `orden` (Integer, Not Null), `seleccionable_ia` (Boolean, Not Null, Default: false), `tipo_etapa` (String/Enum, Nullable), `fecha_creacion` (Timestamp), `fecha_actualizacion` (Timestamp).
3.  Se ha aplicado la migración correctamente en el entorno de desarrollo.
4.  Existe un índice en el campo `orden` para optimizar la recuperación ordenada.

## Solución Técnica Propuesta (Opcional)
Usar el sistema de migraciones del ORM/framework backend. Considerar si el campo `tipo_etapa` añade valor suficiente en MVP.

## Dependencias Técnicas (Directas)
* Elección de Base de Datos.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-002)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Definición modelo, creación script migración, aplicación inicial]

## Asignación Inicial
Equipo Backend / DBA

## Etiquetas
backend, database, schema, migration, pipeline, stage

## Comentarios
El campo `orden` es clave para la visualización y lógica de reordenamiento.

## Enlaces o Referencias
[Documentación del ORM/Sistema de Migraciones]