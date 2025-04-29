# Ticket: TK-112

## Título
BE-Logic: Implementar Lógica de Negocio Ordenación por Score IA

## Descripción
Modificar la lógica de negocio que obtiene la lista de candidaturas (TK-086) para que aplique dinámicamente una cláusula `ORDER BY` a la consulta BBDD basada en los parámetros `sortBy` y `sortOrder` recibidos de la API (TK-111). Debe manejar específicamente la ordenación por `puntuacion_ia_general`, incluyendo el manejo de valores NULL.

## User Story Relacionada
US-034: Ordenar y Filtrar Lista de Candidatos por Score IA

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe los parámetros `sortBy` y `sortOrder`.
2.  Si `sortBy` es 'score', la consulta BBDD incluye `ORDER BY puntuacion_ia_general [ASC|DESC] NULLS LAST` (o `NULLS FIRST` según se decida).
3.  Si los parámetros no se proporcionan o `sortBy` no es 'score', aplica la ordenación por defecto.
4.  La lógica de paginación sigue funcionando correctamente junto con la ordenación.
5.  Devuelve la lista ordenada según lo solicitado.

## Solución Técnica Propuesta (Opcional)
Modificar la construcción de la consulta ORM para añadir condicionalmente la cláusula `ORDER BY`. Usar `NULLS LAST` para que los no evaluados aparezcan al final.

## Dependencias Técnicas (Directas)
* TK-086 (Lógica de Negocio existente)
* TK-111 (API que pasa los parámetros)
* Esquema BBDD `Candidatura` con `puntuacion_ia_general`.

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-034)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Modificar consulta ORM, lógica condicional order by, manejo de nulos]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, application, list, sort, query, database, order-by

## Comentarios
El manejo de NULLs en la ordenación es importante.

## Enlaces o Referencias
[Documentación ORM sobre ORDER BY y NULLS]