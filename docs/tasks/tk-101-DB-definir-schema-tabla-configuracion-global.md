# Ticket: TK-101

## Título
BE-DB: Definir Esquema/Tabla para Configuración Global del Sistema

## Descripción
Crear o definir una tabla/colección `SystemConfiguration` (o similar) en la base de datos del ATS MVP para almacenar configuraciones globales. Incluir una fila o documento para la configuración `enable_auto_stage_move` (Boolean, Default: false).

## User Story Relacionada
US-032: Automatizar (Opcionalmente) Movimiento Inicial a Etapa Sugerida

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un script de migración o definición ORM/ODM para la tabla/colección `SystemConfiguration`.
2.  Contiene campos como `key` (String, PK, ej. 'ENABLE_AUTO_STAGE_MOVE') y `value` (String/JSON/Boolean).
3.  Se ha insertado/definido un registro inicial con `key='ENABLE_AUTO_STAGE_MOVE'` y `value='false'`.
4.  La definición se ha aplicado en el entorno de desarrollo.

## Solución Técnica Propuesta (Opcional)
Una tabla simple key-value o una tabla con columnas específicas para cada configuración global.

## Dependencias Técnicas (Directas)
* Elección de Base de Datos ATS MVP.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-032)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Definición tabla simple, script migración, registro inicial]

## Asignación Inicial
Equipo Backend / DBA

## Etiquetas
backend, database, schema, migration, configuration, settings

## Comentarios
Base para almacenar la configuración de esta US y futuras.

## Enlaces o Referencias
[Documentación ORM/Migraciones]