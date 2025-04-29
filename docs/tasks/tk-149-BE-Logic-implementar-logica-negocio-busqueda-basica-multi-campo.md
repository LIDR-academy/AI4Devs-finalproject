# Ticket: TK-149

## Título
BE-Logic: Implementar Lógica de Negocio para Búsqueda Básica (Multi-campo)

## Descripción
Desarrollar la lógica en la capa de servicio/negocio del backend ATS para realizar la búsqueda. Debe consultar la BBDD buscando el término proporcionado (case-insensitive) en `Candidato.nombre_completo` y `Candidato.email`. Devolver resultados paginados con información relevante de la `Candidatura`.

## User Story Relacionada
US-042: Buscar Candidatos por Nombre o Palabra Clave

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe el término de búsqueda `query` y parámetros de paginación.
2.  Realiza una consulta BBDD que busca coincidencias parciales (ej. `ILIKE '%query%'` en PostgreSQL) en `Candidato.nombre_completo` OR `Candidato.email`.
3.  La consulta recupera los registros `Candidatura` asociados a los `Candidato` encontrados.
4.  Incluye joins/consultas para obtener `Vacante.titulo` y `EtapaPipeline.nombre` para cada candidatura resultante.
5.  Aplica paginación a los resultados.
6.  Cuenta el total de resultados para los metadatos de paginación.
7.  Devuelve la lista paginada de candidaturas formateada para la API (TK-148).
8.  Maneja errores de BBDD.

## Solución Técnica Propuesta (Opcional)
Usar ORM. Implementar la búsqueda con `ILIKE` o función `LOWER()` para case-insensitivity. Considerar Full-Text Search de la BBDD si el rendimiento con LIKE es pobre (optimización futura).

## Dependencias Técnicas (Directas)
* Esquemas BBDD: `Candidatura`, `Candidato`, `Vacante`, `EtapaPipeline`.
* TK-148 (API que invoca esta lógica)

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-042)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación lógica servicio, construcción consulta BBDD multi-campo con LIKE, paginación]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, search, query, database, like, full-text-search

## Comentarios
La búsqueda inicial se limita a Nombre y Email. Podría extenderse a Notas/Tags después. Optimización de rendimiento puede ser necesaria post-MVP.

## Enlaces o Referencias
[Documentación ORM sobre LIKE/LOWER/FTS]