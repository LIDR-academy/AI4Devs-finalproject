# Ticket: TK-084

## Título
FE: Asegurar Disponibilidad de Etapa Sugerida IA en Datos de Candidatura Frontend

## Descripción
Verificar y, si es necesario, modificar la lógica del frontend que obtiene los datos de una candidatura para las vistas de detalle, lista y Kanban, asegurando que el campo `etapa_sugerida` (almacenado en el backend del ATS según RF-14B) esté incluido en los datos recuperados y disponible para ser utilizado por los componentes UI (TK-083).

## User Story Relacionada
US-028: Mostrar Etapa de Pipeline Sugerida por IA

## Criterios de Aceptación Técnicos (Verificables)
1.  La(s) llamada(s) API que realiza el frontend para obtener los datos de candidaturas (para detalle, lista, Kanban) incluye(n) el campo `etapa_sugerida` en la respuesta del backend cuando la evaluación existe y generó una sugerencia.
2.  La lógica frontend (ej. servicio/store) que maneja esta(s) respuesta(s) API almacena correctamente el valor de `etapa_sugerida`.
3.  El valor almacenado está accesible para los componentes UI relevantes (TK-083).
4.  Maneja correctamente el caso en que `etapa_sugerida` sea `null` o no esté presente en la respuesta.

## Solución Técnica Propuesta (Opcional)
Revisar/modificar los DTOs de respuesta de los endpoints API que devuelven datos de `Candidatura` en el backend del ATS para incluir `etapa_sugerida`. Revisar/modificar los modelos de datos/estado en el frontend.

## Dependencias Técnicas (Directas)
* Endpoints API Backend ATS que devuelven datos de `Candidatura`. (Necesita asegurar que `etapa_sugerida` se guarda en BBDD ATS primero - RF-14B).
* Lógica frontend existente de obtención de datos de candidatura.
* TK-083 (Componente UI que consume este dato).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-028)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Revisión/adaptación de llamadas API y manejo de estado existente]

## Asignación Inicial
Equipo Frontend / Equipo Backend (para API si necesita ajuste)

## Etiquetas
frontend, logic, api-client, state-management, candidate, evaluation, stage-suggestion, data

## Comentarios
Asegura que el dato necesario para la UI esté disponible. Requiere que el backend ATS guarde este campo primero (probablemente al recibir la respuesta de Core AI).

## Enlaces o Referencias
[TK-001 - Especificación API]