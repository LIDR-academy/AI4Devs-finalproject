# Ticket: TK-121

## Título
BE-Logic: Implementar Lógica ATS para Obtener y Procesar Historial Aplicaciones

## Descripción
Modificar la lógica de negocio en el backend del ATS MVP que obtiene los detalles de una candidatura. Debe: 1) Llamar a la API de Core AI (TK-119) para obtener la lista de `candidaturas_ids` del candidato. 2) Filtrar para obtener solo los IDs de *otras* candidaturas. 3) Consultar la BBDD local del ATS para obtener detalles resumidos (Vacante.titulo, Candidatura.fecha_aplicacion, EtapaPipeline.nombre final) de esas otras candidaturas. 4) Estructurar esta información como historial.

## User Story Relacionada
US-035: Consultar Historial de Aplicaciones Anteriores del Candidato

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio obtiene el `email` del candidato de la candidatura actual.
2.  Realiza una llamada al endpoint Core AI (TK-119) pasando el `email`.
3.  Si la llamada es exitosa y devuelve una lista `candidaturas_ids`:
    * Filtra la lista para excluir el ID de la `applicationId` actual.
    * Si la lista filtrada no está vacía, realiza una consulta (o N consultas) a la BBDD del ATS para obtener `Vacante.titulo`, `Candidatura.fecha_aplicacion`, y el nombre de la `EtapaPipeline` final para cada ID de la lista filtrada.
    * Construye un array de objetos `historialAplicacion` con estos datos.
4.  Si la llamada a Core AI falla o no devuelve historial, el array `historialAplicacion` está vacío.
5.  El array `historialAplicacion` está disponible para ser incluido en la respuesta API (TK-122).
6.  Maneja errores de la llamada a Core AI y de las consultas BBDD locales.

## Solución Técnica Propuesta (Opcional)
Implementar como parte del servicio que obtiene los detalles de la candidatura. Optimizar la consulta BBDD local para obtener datos de múltiples candidaturas/vacantes a la vez si es posible (ej. `WHERE candidatura.id IN (id1, id2...)`).

## Dependencias Técnicas (Directas)
* Lógica existente de obtención de detalle candidatura (parte de TK-023).
* TK-119 (API Core AI a la que llamar).
* Esquemas BBDD ATS: `Candidatura`, `Vacante`, `EtapaPipeline`.
* TK-122 (API ATS que devuelve estos datos).

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-035)

## Estimación Técnica Preliminar
[ 5 ] [horas] - [Implementación llamada API a Core AI, lógica de filtrado IDs, consulta BBDD ATS optimizada, estructuración datos historial]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, logic, service, application, history, integration, core-ai, query

## Comentarios
Coordinación entre servicios y consultas locales. La optimización de la consulta local es relevante.

## Enlaces o Referencias
[Documentación ORM sobre consultas IN]