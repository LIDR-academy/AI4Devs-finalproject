# Ticket: TK-091

## Título
BE: Implementar Lógica de Negocio para Datos Kanban (Agrupar Candidaturas por Etapa)

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend para obtener todas las candidaturas activas de una vacante y agruparlas por su `etapa_pipeline_actual_id`. Devolver los datos en un formato adecuado para la API Kanban (TK-090).

## User Story Relacionada
US-030: Visualizar Pipeline de Selección en Tablero Kanban

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe `jobId`.
2.  Realiza una consulta a la BBDD para obtener **todas** las `Candidatura` activas donde `vacante_id` = `jobId` (sin paginación para Kanban).
3.  La consulta incluye joins/consultas para obtener `Candidato.nombre_completo` y los campos `etapa_pipeline_actual_id`, `puntuacion_ia_general`, `etapa_sugerida`.
4.  Procesa la lista resultante para agrupar las candidaturas en un mapa/diccionario donde la clave es `etapa_pipeline_actual_id` y el valor es un array de los datos simplificados de las candidaturas en esa etapa.
5.  Devuelve la estructura de datos agrupada.
6.  Maneja errores de BBDD.

## Solución Técnica Propuesta (Opcional)
Obtener todas las candidaturas relevantes y luego procesar/agrupar en memoria de la aplicación (backend) antes de devolver la respuesta.

## Dependencias Técnicas (Directas)
* Esquemas BBDD: `Vacante`, `Candidatura`, `Candidato`, `EtapaPipeline`.
* TK-090 (Endpoint API que invoca esta lógica)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-030)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Consulta BBDD sin paginación, lógica de agrupación en memoria]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, kanban, application, list, group, query

## Comentarios
A diferencia de la lista paginada, Kanban suele necesitar todos los elementos para agruparlos visualmente. Considerar rendimiento si hay miles de candidatos por vacante (poco probable en MVP).

## Enlaces o Referencias
[Documentación ORM]