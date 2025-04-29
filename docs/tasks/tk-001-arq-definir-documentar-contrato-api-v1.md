# Ticket: TK-001

## Título
ARQ: Definir y Documentar Contrato API v1 (OpenAPI) entre ATS MVP y Core AI

## Descripción
Crear la especificación formal y completa de la API RESTful interna (v1) que comunicará el ATS MVP y los microservicios de TalentIA Core AI. La especificación debe seguir el estándar OpenAPI 3.x (Swagger) y cubrir todos los endpoints necesarios para las funcionalidades Must Have de la Fase 1. Debe incluir definiciones claras de rutas, métodos HTTP, parámetros, esquemas de request/response (JSON), códigos de estado y mecanismo de autenticación.

## User Story Relacionada
US-001: Definir Contrato API Interna

## Criterios de Aceptación Técnicos (Verificables)
1.  Se ha generado un archivo `openapi.yaml` (o `openapi.json`) que cumple la especificación OpenAPI 3.x.
2.  El archivo define los endpoints para:
    * Solicitar Generación JD (Input: datos vacante -> Output: texto JD/error)
    * Guardar Parámetros IA (Input: ID vacante, params IA -> Output: confirmación/error)
    * Crear/Actualizar CandidatoIA (Input: email, ID candidatura ATS -> Output: confirmación/error)
    * Solicitar Evaluación Candidato (Input: IDs/CV -> Output: ID tarea o evaluación/error)
    * Enviar Feedback (Input: datos feedback -> Output: confirmación/error)
    * (Opcional F5) Obtener CandidatoIA/Historial (Input: email/ID -> Output: datos CandidatoIA)
3.  Para cada endpoint, se especifican: ruta (con `/api/v1/`), método HTTP, parámetros, y esquemas JSON detallados para request/response bodies.
4.  Se define el mecanismo de autenticación (ej. `securitySchemes` para API Key en header `X-API-KEY` o `Authorization: Bearer <internal_token>`).
5.  Se especifican los códigos de respuesta HTTP esperados (200, 201, 400, 401, 403, 404, 500).
6.  El archivo de especificación está validado contra herramientas de linting/validación OpenAPI.
7.  El archivo `openapi.yaml` está commiteado en el repositorio principal o en una ubicación acordada accesible para ambos equipos (Frontend/Backend ATS y Core AI).

## Solución Técnica Propuesta (Opcional)
Utilizar un editor visual/IDE con soporte OpenAPI (Swagger Editor, VS Code extension) para facilitar la creación y validación.

## Dependencias Técnicas (Directas)
* Decisiones de diseño arquitectónico sobre los microservicios de Core AI y sus responsabilidades.
* Modelo de datos preliminar (Fase 5 puede refinarlo).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-001)

## Estimación Técnica Preliminar
[ 8 ] [horas] - [Incluye diseño detallado de endpoints/schemas, escritura de especificación OpenAPI, validación y revisiones iniciales]

## Asignación Inicial
Equipo Arquitectura / Tech Lead

## Etiquetas
api, contract, openapi, swagger, architecture, integration, backend, core-ai

## Comentarios
Este artefacto es crucial y debe ser acordado y versionado tempranamente. Servirá como base para el desarrollo de los servicios y sus clientes.

## Enlaces o Referencias
[Link a Especificación OpenAPI v3](https://spec.openapis.org/oas/v3.0.3)
[Link a Guías de Estilo API internas si existen]