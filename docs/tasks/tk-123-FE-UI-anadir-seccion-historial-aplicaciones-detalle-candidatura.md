# Ticket: TK-123

## Título
FE-UI: Añadir Sección "Historial de Aplicaciones" a Vista Detalle Candidatura

## Descripción
Modificar el componente de UI del frontend que muestra el detalle de una candidatura para añadir una nueva sección (ej. "Historial de Aplicaciones"). Esta sección mostrará una lista/tabla con las otras aplicaciones encontradas para el mismo candidato (datos obtenidos por TK-124).

## User Story Relacionada
US-035: Consultar Historial de Aplicaciones Anteriores del Candidato

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de detalle de la candidatura, existe una nueva sección titulada "Historial de Aplicaciones" (o similar).
2.  Si los datos del historial (`historial_aplicaciones` de TK-124) no están vacíos, se renderiza una lista o tabla dentro de esta sección.
3.  Cada item/fila muestra: Título de la Vacante, Fecha de Aplicación, Estado Final.
4.  (Opcional) Cada item puede ser un enlace a la vista de detalle de esa otra candidatura (si se implementa).
5.  Si los datos del historial están vacíos, la sección no se muestra o indica "Sin historial previo".
6.  La presentación es clara y no sobrecarga la vista de detalle principal.

## Solución Técnica Propuesta (Opcional)
Añadir un nuevo componente/bloque a la vista de detalle con renderizado condicional. Usar una tabla simple o lista.

## Dependencias Técnicas (Directas)
* Vista de Detalle de Candidatura existente.
* TK-124 (Lógica Frontend que proporciona los datos del historial).
* Diseño de UI/Mockups.

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-035)

## Estimación Técnica Preliminar
[ 3 ] [horas] - [Modificación UI detalle, añadir sección, renderizado lista/tabla condicional]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, detail, application, history, display

## Comentarios
Presentación visual del historial.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]