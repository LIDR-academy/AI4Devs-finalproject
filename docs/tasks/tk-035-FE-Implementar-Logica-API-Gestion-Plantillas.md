# Ticket: TK-035

## Título
FE: Implementar Lógica Frontend para API de Gestión de Plantillas

## Descripción
Desarrollar la lógica en el frontend (servicios, stores) para interactuar con los endpoints de la API de gestión de plantillas del backend (TK-031). Incluye llamadas para listar, obtener detalles, crear y eliminar plantillas, manejando respuestas y actualizando la UI según sea necesario (para TK-033 y TK-034).

## User Story Relacionada
US-008: Utilizar Plantillas para Crear Vacantes

## Criterios de Aceptación Técnicos (Verificables)
1.  Existe función para llamar a `POST /api/v1/job-templates` (para TK-033). Maneja respuesta 201 y errores.
2.  Existe función para llamar a `GET /api/v1/job-templates` (para TK-034). Maneja respuesta 200 con lista y errores.
3.  Existe función para llamar a `GET /api/v1/job-templates/{templateId}` (para TK-034). Maneja respuesta 200 con detalles (datos_vacante) y errores 404. Parsea `datos_vacante` JSON.
4.  Existe función para llamar a `DELETE /api/v1/job-templates/{templateId}` (si se implementa UI de gestión de plantillas). Maneja respuesta 204 y errores.
5.  Las llamadas incluyen token de autenticación. Se manejan estados de carga y errores.

## Solución Técnica Propuesta (Opcional)
Crear un servicio/store dedicado para la lógica de plantillas.

## Dependencias Técnicas (Directas)
* TK-031 (Endpoints Backend API)
* TK-033 (UI que invoca la creación)
* TK-034 (UI que invoca la carga/listado)
* Mecanismo de autenticación frontend.

## Prioridad (Heredada/Ajustada)
Could Have (Heredada de US-008)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Implementación llamadas API CRUD, manejo estado, parseo JSON]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, vacancy, job, template

## Comentarios
Lógica API estándar para CRUD.

## Enlaces o Referencias
[TK-001 - Especificación API]