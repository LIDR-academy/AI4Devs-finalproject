# Ticket: TK-021

## Título
BE: Implementar Endpoint Obtener Detalles Vacante (`GET /api/v1/jobs/{jobId}`)

## Descripción
Crear y exponer el endpoint `GET /api/v1/jobs/{jobId}` en el backend del ATS MVP (alineado con Anexo I) que devuelva los detalles completos de una vacante específica, identificada por su ID. Protegido por autenticación.

## User Story Relacionada
US-006: Editar Información de Vacante Existente (y otras US que necesiten ver detalles)

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `GET /api/v1/jobs/{jobId}` que acepta el ID de la vacante en la ruta.
2.  El endpoint está protegido por el middleware de autenticación (TK-005).
3.  Busca la vacante por ID en la tabla `Vacante`.
4.  Si la vacante existe, devuelve 200 OK con la representación JSON completa de la vacante (todos los campos relevantes definidos en TK-016 y posteriores).
5.  Si la vacante no existe, devuelve 404 Not Found.
6.  Si ocurre un error de BBDD, devuelve 500 Internal Server Error.

## Solución Técnica Propuesta (Opcional)
Usar el framework backend y su sistema de routing. Utilizar ORM para buscar por PK.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-016 (Esquema BBDD `Vacante`)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-006)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Creación ruta/controlador, consulta BBDD por ID, manejo 404]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, vacancy, job, read, detail

## Comentarios
Endpoint fundamental para cargar datos antes de editar o visualizar.

## Enlaces o Referencias
[TK-001 - Especificación API], [Anexo I]