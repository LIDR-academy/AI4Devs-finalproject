# User Story: US-037

## Feature Asociada
Feature 6: Sistema de Feedback para IA

## Título
Capturar Feedback Básico sobre Evaluación IA

## Narrativa
Como Reclutador/Hiring Manager
Quiero poder indicar de forma sencilla (ej. pulgar arriba/abajo) si la evaluación general de IA para un candidato me parece acertada
Para proporcionar una retroalimentación rápida que ayude a mejorar la IA.

## Detalles
Implementa la interfaz mínima en el ATS MVP para recoger una validación simple del usuario sobre el resultado de la IA.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que estoy viendo el detalle de una candidatura con una evaluación IA (US-027, US-028).
2.  Existen controles interactivos simples y claros (ej. botones 👍 / 👎) junto a la evaluación IA para indicar acuerdo o desacuerdo.
3.  Puedo hacer clic en uno de estos controles.
4.  Al hacer clic, la interfaz registra mi acción (ej. el botón queda marcado) y prepara el envío del feedback (ver US-038).
5.  Puedo cambiar mi feedback (ej. de 👍 a 👎) antes de que se envíe o la próxima vez que visite la página.

## Requisito(s) Funcional(es) Asociado(s)
RF-18

## Prioridad: Must Have
* **Justificación:** Es el mecanismo mínimo viable para cerrar el ciclo de aprendizaje con feedback humano, un objetivo clave de Fase 1.

## Estimación Preliminar (SP): 1
* **Justificación:** Requiere añadir controles de UI simples (botones) y capturar el evento de clic. Baja complejidad.