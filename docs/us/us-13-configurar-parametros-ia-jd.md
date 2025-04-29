# User Story: US-013

## Feature Asociada
Feature 2: Asistencia IA para Descripción de Puesto (JD)

## Título
Configurar Parámetros de Evaluación IA para la Vacante

## Narrativa
Como Reclutador
Quiero poder definir el score mínimo de corte y las etapas de pipeline sugeridas (aceptación/rechazo) al crear/editar una vacante
Para personalizar cómo la IA evaluará y clasificará inicialmente a los candidatos para ese puesto específico.

## Detalles
Permite al usuario configurar los umbrales y acciones sugeridas que la IA usará posteriormente en la evaluación de candidatos (Feature 4).

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy editando una vacante (US-006), existen campos específicos en el formulario para: "Score de Corte IA" (numérico, 0-100), "Etapa Sugerida (Aceptación)" (selector), "Etapa Sugerida (Rechazo)" (selector).
2.  Dado que configuro las etapas del pipeline (US-002), los selectores de "Etapa Sugerida" muestran únicamente las etapas marcadas como "seleccionables para sugerencia IA".
3.  Dado que introduzco valores válidos en estos campos y guardo la vacante, el ATS MVP envía estos parámetros (score_corte, etapa_aceptacion_id, etapa_rechazo_id) junto con el ID de la vacante al servicio Core AI correspondiente (ver US-016) a través de la API interna (US-001).
4.  Dado que los parámetros se guardan correctamente en Core AI, recibo una confirmación visual en la interfaz del ATS MVP.
5.  Dado que intento guardar con un valor inválido (ej. score fuera de rango, etapa no seleccionada), se muestra un mensaje de error específico y no se guardan los parámetros IA.

## Requisito(s) Funcional(es) Asociado(s)
RF-04B

## Prioridad: Must Have
* **Justificación:** Esencial para habilitar la funcionalidad de sugerencia de etapa IA (Must Have en Feature 4).

## Estimación Preliminar (SP): 3
* **Justificación:** Requiere añadir campos específicos al formulario de vacante (UI), validaciones, y lógica para enviar estos datos específicos a través de la API. Complejidad baja-moderada.