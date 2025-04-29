# Ticket: TK-124

## Título
FE-Logic: Manejar y Pasar Datos de Historial a Componente UI Detalle

## Descripción
Modificar la lógica del frontend que obtiene los datos para la vista de detalle de una candidatura para asegurar que también recupera el array `historial_aplicaciones` (devuelto por TK-122) y lo pasa como prop al componente UI de detalle (TK-123).

## User Story Relacionada
US-035: Consultar Historial de Aplicaciones Anteriores del Candidato

## Criterios de Aceptación Técnicos (Verificables)
1.  La llamada API para obtener los detalles de la candidatura espera recibir el campo `historial_aplicaciones` (array).
2.  La lógica que maneja la respuesta API extrae este array.
3.  El array (posiblemente vacío) se almacena en el estado local o store asociado a la vista de detalle.
4.  El componente UI (TK-123) recibe este array como prop.
5.  Se maneja correctamente el caso en que el array esté vacío.

## Solución Técnica Propuesta (Opcional)
Adaptar el modelo de datos frontend y el store/estado para incluir el historial.

## Dependencias Técnicas (Directas)
* Lógica existente de obtención de detalle de candidatura.
* TK-122 (API Backend que devuelve el dato).
* TK-123 (Componente UI que consume el dato).

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-035)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Ajuste en manejo de respuesta API y modelo de estado]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, application, detail, history

## Comentarios
Asegura que los datos del historial lleguen a la UI.

## Enlaces o Referencias
[TK-001 - Especificación API]