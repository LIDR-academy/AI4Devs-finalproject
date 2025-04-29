# Ticket: TK-136

## Título
CAI-BE-Logic: Implementar Lógica de Negocio para Validar y Almacenar Feedback Recibido

## Descripción
Desarrollar la lógica en el servicio de Feedback de Core AI que recibe los datos del feedback desde la API (TK-134), valida la información (ej. ¿existe la evaluación referenciada?, ¿el tipo de feedback es válido?), crea una instancia de la entidad `RegistroFeedbackIA` y la guarda en la base de datos (usando TK-135).

## User Story Relacionada
US-039: Recibir y Almacenar Feedback de Usuario (Capacidad Core AI)

## Criterios de Aceptación Técnicos (Verificables)
1.  La función/método de servicio recibe los datos del feedback (`evaluationId`, `userId`, `feedbackType`, `feedbackData`).
2.  Valida que `evaluationId` corresponda a una `EvaluacionCandidatoIA` existente (puede ser opcional para MVP si simplifica).
3.  Valida que `feedbackType` sea uno de los valores permitidos.
4.  Crea una instancia de `RegistroFeedbackIA` con los datos recibidos y la fecha actual.
5.  Guarda la nueva entidad en la base de datos.
6.  Maneja errores de validación (devolviendo error 400 a la API) y errores de base de datos (devolviendo error 500).
7.  Si tiene éxito, devuelve una confirmación a la capa API (que responderá a ATS).

## Solución Técnica Propuesta (Opcional)
Implementar en capa de Servicios de Core AI. Usar ORM/ODM para la operación INSERT.

## Dependencias Técnicas (Directas)
* TK-134 (API que invoca esta lógica)
* TK-135 (Esquema BBDD `RegistroFeedbackIA`)
* (Opcional) Acceso a `EvaluacionCandidatoIA` para validación.

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-039)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Implementación lógica de servicio, validaciones básicas, operación INSERT BBDD]

## Asignación Inicial
Equipo Backend (Core AI)

## Etiquetas
backend, core-ai, logic, service, feedback, save, validation, database

## Comentarios
Implementa el almacenamiento efectivo del feedback.

## Enlaces o Referencias
[Documentación ORM/ODM]