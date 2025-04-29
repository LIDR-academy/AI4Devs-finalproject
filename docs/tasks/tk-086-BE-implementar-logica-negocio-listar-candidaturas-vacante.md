# Ticket: TK-086

## Título
BE: Implementar Lógica de Negocio Listar Candidaturas por Vacante

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend del ATS MVP para obtener la lista paginada de candidaturas para una vacante dada. Debe recuperar los datos necesarios de las tablas `Candidatura`, `Candidato`, `EtapaPipeline` y devolverlos estructurados para la API (TK-085).

## User Story Relacionada
US-029: Visualizar Lista de Candidatos por Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe `jobId` y parámetros de paginación (`page`, `pageSize`).
2.  Realiza una consulta a la BBDD para obtener las `Candidatura` donde `vacante_id` = `jobId`.
3.  La consulta incluye joins o consultas relacionadas para obtener:
    * `Candidato.nombre_completo`.
    * `EtapaPipeline.nombre` (a partir de `Candidatura.etapa_pipeline_actual_id`).
4.  La consulta recupera los campos `fecha_aplicacion`, `puntuacion_ia_general` y `etapa_sugerida` de la `Candidatura`.
5.  La consulta aplica la paginación (LIMIT, OFFSET o equivalente).
6.  La consulta cuenta el número total de candidaturas para esa vacante (para metadatos de paginación).
7.  Devuelve la lista de datos de candidaturas para la página solicitada y la información de paginación total.
8.  Maneja errores de BBDD.

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios. Usar ORM para construir la consulta con joins y paginación.

## Dependencias Técnicas (Directas)
* Esquemas BBDD: `Vacante`, `Candidatura`, `Candidato`, `EtapaPipeline` (TK-016, TK-011, TK-006 y definición Candidatura/ArchivoCandidato de TK-044).
* TK-085 (Endpoint API que invoca esta lógica)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-029)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación lógica de servicio, consulta BBDD con joins, lógica paginación]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, application, candidate, vacancy, job, list, pagination, query

## Comentarios
La eficiencia de la consulta puede ser importante si hay muchas candidaturas por vacante. Asegurar que los campos `puntuacion_ia_general` y `etapa_sugerida` se incluyen (deben estar en el schema de `Candidatura`).

## Enlaces o Referencias
[Documentación ORM sobre Joins y Paginación]