# Ticket: TK-082

## Título
FE: Asegurar Disponibilidad de Score IA en Datos de Candidatura Frontend

## Descripción
Verificar y, si es necesario, modificar la lógica del frontend que obtiene los datos de una candidatura para la vista de detalle, asegurando que el campo `puntuacion_ia_general` (almacenado en el backend del ATS según RF-14) esté incluido en los datos recuperados y disponible para ser utilizado por el componente UI (TK-081).

## User Story Relacionada
US-027: Mostrar Evaluación IA en Perfil de Candidatura

## Criterios de Aceptación Técnicos (Verificables)
1.  La llamada API que realiza el frontend para obtener los detalles de una candidatura (probablemente `GET /api/v1/applications/{applicationId}` o similar, necesita definición/ticket si no existe) incluye el campo `puntuacion_ia_general` en la respuesta del backend cuando la evaluación existe.
2.  La lógica frontend (ej. servicio/store) que maneja esta respuesta API almacena correctamente el valor de `puntuacion_ia_general`.
3.  El valor almacenado está accesible para el componente UI de detalle de candidatura (TK-081).
4.  Maneja correctamente el caso en que `puntuacion_ia_general` sea `null` o no esté presente en la respuesta (evaluación pendiente).

## Solución Técnica Propuesta (Opcional)
Revisar/modificar el DTO de respuesta del endpoint API que devuelve los detalles de la candidatura en el backend del ATS. Revisar/modificar el modelo de datos o estado en el frontend para incluir este campo.

## Dependencias Técnicas (Directas)
* Endpoint API Backend ATS que devuelve detalles de `Candidatura` (necesita ticket si no definido, puede solapar con TK-021 si la vacante contiene candidaturas).
* Lógica frontend existente de obtención de datos de candidatura.
* TK-081 (Componente UI que consume este dato).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-027)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Revisión/adaptación de llamada API y manejo de estado existente]

## Asignación Inicial
Equipo Frontend / Equipo Backend (para API si necesita ajuste)

## Etiquetas
frontend, logic, api-client, state-management, candidate, evaluation, score, data

## Comentarios
Asegura que el dato necesario para la UI esté disponible. Puede requerir ajuste mínimo en backend API.

## Enlaces o Referencias
[TK-001 - Especificación API]