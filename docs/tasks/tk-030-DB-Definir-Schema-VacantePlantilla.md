# Ticket: TK-030

## Título
BE: Definir Esquema BBDD para Entidad `VacantePlantilla`

## Descripción
Crear la tabla `VacantePlantilla` en la base de datos del ATS MVP para almacenar las plantillas de vacantes reutilizables. Debe incluir campos para `id` (PK), `nombre` (identificador de la plantilla), `datos_vacante` (JSON o Text para almacenar los datos relevantes de la vacante), `fecha_creacion`.

## User Story Relacionada
US-008: Utilizar Plantillas para Crear Vacantes

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un script de migración de base de datos (o definición ORM) que crea la tabla `VacantePlantilla`.
2.  La tabla incluye los campos: `id` (UUID, PK), `nombre` (String, Not Null, Unique?), `datos_vacante` (JSON/Text, Not Null), `fecha_creacion` (Timestamp).
3.  Se considera si el campo `nombre` debe ser único.
4.  Se define qué campos de la `Vacante` se almacenarán en `datos_vacante` (ej. titulo, depto, ubicacion, reqs_clave, descripcion_html).
5.  Se ha aplicado la migración correctamente en el entorno de desarrollo.

## Solución Técnica Propuesta (Opcional)
Usar un campo JSONB (PostgreSQL) o TEXT (serializando/deserializando JSON) para `datos_vacante` ofrece flexibilidad.

## Dependencias Técnicas (Directas)
* Elección de Base de Datos.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-008)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Definición modelo, decisión sobre unicidad nombre, script migración]

## Asignación Inicial
Equipo Backend / DBA

## Etiquetas
backend, database, schema, migration, vacancy, job, template

## Comentarios
Define la estructura para guardar las plantillas.

## Enlaces o Referencias
[Documentación del ORM/Sistema de Migraciones]