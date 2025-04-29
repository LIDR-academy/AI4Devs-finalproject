# Ticket: TK-085

## Título
BE: Implementar Endpoint API Listar Candidaturas por Vacante (`GET /api/v1/jobs/{jobId}/applications`)

## Descripción
Crear y exponer un endpoint `GET /api/v1/jobs/{jobId}/applications` en el backend del ATS MVP. Debe devolver una lista paginada de las candidaturas asociadas a la vacante especificada (`jobId`), incluyendo los datos necesarios para la UI de lista (Nombre Candidato, Fecha Aplicación, Etapa Actual, Score IA, Etapa Sugerida IA). Protegido por autenticación.

## User Story Relacionada
US-029: Visualizar Lista de Candidatos por Vacante

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe un endpoint `GET /api/v1/jobs/{jobId}/applications`.
2.  Acepta parámetros de query para paginación (ej. `page`, `pageSize`).
3.  El endpoint está protegido por el middleware de autenticación (TK-005).
4.  Valida que el `jobId` exista y sea accesible para el usuario (si aplica). Devuelve 404 si no existe.
5.  Invoca la lógica de negocio (TK-086) para obtener los datos paginados.
6.  Devuelve 200 OK con una estructura JSON que contiene la lista de candidaturas para la página solicitada y metadatos de paginación (ej. `totalItems`, `totalPages`, `currentPage`).
7.  Cada candidatura en la lista incluye al menos: `candidaturaId`, `nombreCompletoCandidato`, `fechaAplicacion`, `etapaActualNombre`, `puntuacion_ia_general` (nullable), `etapa_sugerida` (nullable).
8.  Maneja errores de la lógica de negocio (400, 500).

## Solución Técnica Propuesta (Opcional)
Seguir el patrón RESTful y JSON:API simulado (Anexo I). La ruta sigue un enfoque anidado bajo `/jobs/`.

## Dependencias Técnicas (Directas)
* TK-001 (Definición API)
* TK-005 (Middleware Autenticación)
* TK-086 (Lógica de Negocio)

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-029)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Creación ruta/controlador, integración middleware, validación jobId, manejo paginación básica en query]

## Asignación Inicial
Equipo Backend

## Etiquetas
backend, api, rest, list, application, candidate, vacancy, job, pagination

## Comentarios
Endpoint clave para poblar la vista de lista de candidatos.

## Enlaces o Referencias
[TK-001 - Especificación API], [Anexo I]