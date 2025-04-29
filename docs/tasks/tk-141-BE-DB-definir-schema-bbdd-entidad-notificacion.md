# Ticket: TK-141

## Título
BE-DB: Definir Esquema BBDD para Entidad `Notificacion`

## Descripción
Crear la tabla `Notificacion` en la base de datos del ATS MVP para almacenar las notificaciones internas. Debe incluir campos para destinatario (`user_id`), mensaje, enlace opcional (`link_url`), estado (`leida`), y timestamp (`fecha_creacion`).

## User Story Relacionada
US-041: Recibir Notificaciones Internas sobre Eventos Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un script de migración o definición ORM/ODM para la tabla `Notificacion`.
2.  La tabla incluye campos como: `id` (PK, UUID), `user_id` (FK a Usuario, Not Null, IDX), `mensaje` (String, Not Null), `link_url` (String, Nullable), `leida` (Boolean, Not Null, Default: false, IDX), `fecha_creacion` (Timestamp, Not Null, IDX).
3.  Se consideran índices adecuados para las consultas comunes (por `user_id` y `leida`).
4.  La definición se ha aplicado en el entorno de desarrollo.

## Solución Técnica Propuesta (Opcional)
Tabla relacional estándar.

## Dependencias Técnicas (Directas)
* TK-006 (Esquema Usuario para `user_id`)
* Elección de Base de Datos ATS MVP.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-041)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Definición tabla, script migración, índices básicos]

## Asignación Inicial
Equipo Backend / DBA

## Etiquetas
backend, database, schema, migration, notification

## Comentarios
Estructura base para almacenar las notificaciones.

## Enlaces o Referencias
[Documentación ORM/Migraciones]