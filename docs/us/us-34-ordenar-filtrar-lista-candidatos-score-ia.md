# User Story: US-034

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Ordenar y Filtrar Lista de Candidatos por Score IA

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder ordenar la lista de candidatos de una vacante por su score IA y opcionalmente filtrarla por un rango de score
Para enfocar mi revisión en los candidatos más relevantes según la IA.

## Detalles
Añade capacidades de ordenación y filtrado a la vista de lista de candidatos (US-029).

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy en la vista de lista de candidatos (US-029), la cabecera de la columna "Score IA" es interactiva (ej. clickeable).
2.  Dado que hago clic en la cabecera "Score IA", la lista se reordena mostrando los candidatos con mayor score primero (o menor, según el ciclo de clics). La ordenación maneja correctamente candidatos sin score (ej. los pone al final).
3.  (Opcional Filtro) Dado que existen controles de filtro por score (ej. un slider o campos min/max), puedo definir un rango.
4.  (Opcional Filtro) Dado que aplico el filtro, la lista se actualiza mostrando solo los candidatos cuyo score IA está dentro del rango especificado.
5.  La funcionalidad de ordenación y filtrado funciona correctamente con la paginación (si existe).

## Requisito(s) Funcional(es) Asociado(s)
RF-26

## Prioridad: Should Have
* **Justificación:** Mejora significativamente la usabilidad y eficiencia al manejar volúmenes grandes de candidatos.

## Estimación Preliminar (SP): 3
* **Justificación:** Requiere añadir interactividad a la UI y modificar las consultas de backend para incluir parámetros de ordenación y filtrado por el campo de score. Complejidad baja-moderada.