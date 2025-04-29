# Ticket: TK-047

## Título
FE: Implementar Lógica Frontend para Invocar API de Generación de JD

## Descripción
Desarrollar la lógica en el frontend que se ejecuta al hacer clic en el botón "Generar Descripción con IA" (TK-046). Debe recopilar los datos básicos de la vacante necesarios como input para la IA, realizar la llamada al endpoint API de Core AI (definido para US-015) y manejar el estado de carga. (El manejo de la respuesta para mostrar la JD generada pertenece a TK-049, asociado a US-014).

## User Story Relacionada
US-012: Solicitar Generación de Descripción de Puesto (JD) con IA

## Criterios de Aceptación Técnicos (Verificables)
1.  Al hacer clic en el botón (TK-046), se recopilan datos del formulario actual (ej. título, requisitos clave).
2.  Se realiza una llamada POST (o según defina TK-001) al endpoint de Core AI para generación de JD (ej. `/api/v1/ai/generate-jd`).
3.  La llamada incluye los datos recopilados como cuerpo de la petición y el token de autenticación.
4.  Mientras la llamada está en curso, se muestra un indicador de carga visual al usuario (ej. spinner sobre el botón o el campo de descripción).
5.  La lógica de *esta* tarea se centra en *iniciar* la llamada y manejar el estado de carga; el manejo de la respuesta para actualizar el campo de descripción es parte de TK-049 (US-014).
6.  Si la llamada API para iniciar la generación falla inmediatamente (ej. error de red, 401), se quita el indicador de carga y se muestra un mensaje de error.

## Solución Técnica Propuesta (Opcional)
Implementar en el manejador de eventos del botón. Usar servicio/store para realizar la llamada API.

## Dependencias Técnicas (Directas)
* TK-046 (Botón UI que invoca esta lógica)
* Definición del endpoint API de Core AI para generar JD (parte de TK-001 y US-015).
* Mecanismo de autenticación frontend.
* TK-049 (Manejo de la respuesta exitosa).

## Prioridad (Heredada/Ajustada)
Must Have (Heredada de US-012)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Lógica de recopilación de datos, implementación llamada API, manejo estado de carga y error inicial]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, vacancy, job, generate-jd, ai

## Comentarios
Ticket enfocado en iniciar la solicitud y feedback visual inmediato.

## Enlaces o Referencias
[TK-001 - Especificación API]