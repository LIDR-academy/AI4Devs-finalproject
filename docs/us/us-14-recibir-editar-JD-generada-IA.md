# User Story: US-014

## Feature Asociada
Feature 2: Asistencia IA para Descripción de Puesto (JD)

## Título
Recibir y Editar Descripción de Puesto (JD) Generada por IA

## Narrativa
Como Reclutador
Quiero poder ver la JD generada por la IA en un editor y poder modificarla
Para asegurar que el contenido final es preciso, completo y se ajusta a mis necesidades antes de guardarlo.

## Detalles
Cubre la recepción de la respuesta de IA y la capacidad de edición humana ("human in the loop").

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que solicité la generación de JD (US-012) y la IA la generó con éxito (US-015), el texto de la JD recibida desde Core AI se muestra dentro de un campo de edición de texto (ej. un editor de texto enriquecido) en el formulario de la vacante.
2.  Dado que la JD generada se muestra, puedo editar libremente el contenido usando las herramientas del editor.
3.  Dado que modifico el texto y hago clic en "Guardar Cambios" (de la vacante, US-006), el contenido final presente en el editor se guarda como la descripción oficial de la `Vacante` en la BBDD del ATS MVP.

## Requisito(s) Funcional(es) Asociado(s)
RF-05

## Prioridad: Must Have
* **Justificación:** Asegura el control humano sobre el contenido generado por IA antes de su uso final.

## Estimación Preliminar (SP): 3
* **Justificación:** Implica manejar la respuesta de la API (Core AI), poblar un componente de editor de texto (que puede tener su propia complejidad), y asegurar que el contenido editado se guarde correctamente con la vacante. Complejidad baja-moderada.