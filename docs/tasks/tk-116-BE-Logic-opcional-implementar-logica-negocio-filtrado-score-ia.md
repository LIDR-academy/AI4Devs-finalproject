# Ticket: TK-116

## Título
BE-Logic: (Opcional) Implementar Lógica de Negocio Filtrado por Rango de Score IA

## Descripción
**(Funcionalidad Opcional)** Modificar la lógica de negocio (TK-086) para añadir cláusulas `WHERE` a la consulta BBDD basadas en los parámetros `score_min` y `score_max` recibidos de la API (TK-115), filtrando por `puntuacion_ia_general`.

## User Story Relacionada
US-034: Ordenar y Filtrar Lista de Candidatos por Score IA

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe `score_min` y/o `score_max`.
2.  Si `score_min` está presente, la consulta BBDD añade `WHERE puntuacion_ia_general >= score_min`.
3.  Si `score_max` está presente, la consulta BBDD añade `WHERE puntuacion_ia_general <= score_max`.
4.  Los filtros se combinan correctamente con otros filtros y con la paginación/ordenación.

## Solución Técnica Propuesta (Opcional)
Modificar construcción de consulta ORM para añadir `WHERE` condicionalmente.

## Dependencias Técnicas (Directas)
* TK-086 (Lógica de Negocio existente)
* TK-115 (API que pasa los parámetros)
* Esquema BBDD `Candidatura` con `puntuacion_ia_general`.

## Prioridad (Heredada/Ajustada)
Should Have (pero parte opcional de US-034)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Modificar consulta ORM, añadir where condicional]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, application, list, filter, score, query, database, where

## Comentarios
Extensión opcional de la lógica de consulta.

## Enlaces o Referencias
[Documentación ORM sobre WHERE]