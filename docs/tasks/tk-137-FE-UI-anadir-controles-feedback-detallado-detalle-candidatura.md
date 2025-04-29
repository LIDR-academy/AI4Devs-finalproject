# Ticket: TK-137

## Título
FE-UI: Añadir Controles Feedback Detallado (Editar Score, Validar Skills, Comentarios)

## Descripción
Modificar el componente UI de detalle de candidatura para incluir controles que permitan al usuario proporcionar feedback detallado: un campo editable para ajustar el score IA, una lista de skills detectadas (si disponibles) con opciones de validación/invalidación, y un área de texto para comentarios.

## User Story Relacionada
US-040: Capturar Feedback Detallado sobre Evaluación IA

## Criterios de Aceptación Técnicos (Verificables)
1.  En la vista de detalle, se añade:
    * Un campo numérico (input o similar) editable, inicializado con el score IA (si existe), etiquetado como "Ajustar Score".
    * Una sección que muestra la lista de skills detectadas (datos de TK-140), si hay alguna. Cada skill tiene controles (ej. botones sí/no, checkboxes) para marcarla como "Validada" / "Invalidada" / "Relevante" / "Irrelevante".
    * Un área de texto multilínea para "Comentarios sobre la Evaluación".
2.  Estos controles están agrupados de forma lógica, posiblemente reemplazando o complementando los controles básicos de TK-125.
3.  La interacción con estos controles es manejada por TK-138.

## Solución Técnica Propuesta (Opcional)
Usar componentes de formulario estándar y potencialmente listas interactivas. La visualización/interacción con skills requiere que los datos estén disponibles.

## Dependencias Técnicas (Directas)
* Vista de Detalle de Candidatura existente.
* TK-138 (Lógica Frontend que maneja el estado y la construcción del payload).
* TK-140 (Lógica/API que proporciona las skills detectadas).
* Diseño de UI/Mockups.

## Prioridad (Heredada/Ajustada)
Should Have (Heredada de US-040)

## Estimación Técnica Preliminar
[ 4 ] [horas] - [Añadir múltiples controles UI, lógica de visualización condicional de skills]

## Asignación Inicial
Equipo Frontend

## Etiquetas
frontend, ui, component, detail, feedback, score, skills, comment, input, list

## Comentarios
Incrementa la complejidad de la UI de feedback.

## Enlaces o Referencias
[Link a Mockups/Diseño de UI]