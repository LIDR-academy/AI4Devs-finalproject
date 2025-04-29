# Ticket: TK-110

## Título
FE-Logic: Obtener y Manejar campo `resumen_ia` en Detalle Candidatura

## Descripción
Modificar la lógica del frontend que obtiene los datos para la vista de detalle de una candidatura (probablemente parte de TK-025) para asegurar que también solicita y maneja el campo `resumen_ia` devuelto por la API (TK-107).

## User Story Relacionada
US-033: Mostrar Resumen Generado por IA en Perfil de Candidatura

## Criterios de Aceptación Técnicos (Verificables)
1.  La llamada API para obtener los detalles de la candidatura (`GET /api/v1/applications/{applicationId}`) incluye la expectativa de recibir el campo `resumen_ia`.
2.  La lógica que maneja la respuesta API extrae el valor de `resumen_ia` (que puede ser string o null).
3.  Este valor se almacena en el estado local o store asociado a la vista de detalle.
4.  El componente UI (TK-109) puede acceder a este valor desde el estado/store.
5.  Se maneja correctamente el caso en que `resumen_ia` sea null.

## Solución Técnica Propuesta (Opcional)
Asegurar que el modelo/interface de datos en el frontend incluya el campo opcional `resumen_ia`. Modificar el servicio/store para manejarlo.

## Dependencias Técnicas (Directas)
* Lógica existente de obtención de detalle de candidatura (TK-025 o similar).
* TK-107 (API Backend que devuelve el dato).
* TK-109 (Componente UI que consume el dato).

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-033)

## Estimación Técnica Preliminar
[ 1 ] [hora] - [Ajuste en manejo de respuesta API y modelo de estado]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, logic, api-client, state-management, application, detail, ai-summary

## Comentarios
Asegura que el dato esté disponible para la UI.

## Enlaces o Referencias
[TK-001 - Especificación API]