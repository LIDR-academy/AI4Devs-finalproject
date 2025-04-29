# Ticket: TK-109

## Título
FE-UI: Añadir Sección/Campo para Mostrar Resumen IA en Detalle Candidatura

## Descripción
Modificar el componente de UI del frontend que muestra el detalle de una candidatura para incluir una sección específica donde se renderice el texto del `resumen_ia`, si está disponible.

## User Story Relacionada
US-033: Mostrar Resumen Generado por IA en Perfil de Candidatura

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de detalle de la candidatura, existe una sección claramente etiquetada (ej. "Resumen IA", "Análisis IA").
2.  Si el dato `resumen_ia` obtenido de la API (TK-110) no es nulo o vacío, su contenido textual se muestra dentro de esta sección.
3.  Si el dato `resumen_ia` es nulo o vacío, la sección no se muestra o muestra un texto indicativo (ej. "Resumen no disponible").
4.  La presentación del texto es legible y se integra bien con el diseño general.

## Solución Técnica Propuesta (Opcional)
Añadir un nuevo bloque/componente a la vista de detalle con renderizado condicional basado en la presencia del dato `resumen_ia`.

## Dependencias Técnicas (Directas)
* Vista de Detalle de Candidatura existente.
* TK-110 (Lógica Frontend que proporciona el dato `resumen_ia`).
* Diseño de UI/Mockups.

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-033)

## Estimación Técnica Preliminar
[ 2 ] [horas] - [Modificación UI detalle, añadir sección/campo, renderizado condicional]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, detail, application, ai-summary, display

## Comentarios
Cambio visual relativamente simple.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]