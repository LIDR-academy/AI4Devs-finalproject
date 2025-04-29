# Ticket: TK-037

## Título
BE: Implementar Lógica de Negocio para Listar Vacantes Públicas

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend para obtener una lista de vacantes filtrando específicamente por el estado 'PUBLICADA'. La consulta debe optimizarse para devolver solo los campos necesarios para la vista pública.

## User Story Relacionada
US-009: Visualizar Lista de Vacantes Públicas

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe una función/método de servicio `listPublicVacancies(paginationParams)` que consulta la tabla `Vacante`.
2.  La consulta filtra explícitamente por `estado = 'PUBLICADA'`.
3.  La consulta selecciona solo los campos necesarios para la lista pública (ej. id, titulo, ubicacion_texto).
4.  La consulta ordena los resultados de forma predeterminada (ej. por `fecha_publicacion` descendente).
5.  Soporta paginación básica (limit, offset).
6.  Devuelve la lista de vacantes encontradas (o lista vacía).

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios. Usar ORM con cláusula WHERE y SELECT específico.

## Dependencias Técnicas (Directas)
* TK-016 (Esquema BBDD `Vacante` con `estado` y campos a mostrar)
* TK-036 (Endpoint API que invoca esta lógica)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-009)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Implementación lógica de servicio, consulta BBDD filtrada y seleccionada]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, vacancy, job, list, public, filter

## Comentarios
Consulta relativamente simple.

## Enlaces o Referencias
[Documentación ORM]