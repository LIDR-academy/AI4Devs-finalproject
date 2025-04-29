# User Story: US-039

## Feature Asociada
Feature 6: Sistema de Feedback para IA

## Título
Recibir y Almacenar Feedback de Usuario (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder recibir datos de feedback sobre evaluaciones IA a través de una API interna y almacenarlos de forma persistente
Para construir un dataset que permita el re-entrenamiento y la mejora de los modelos de IA.

## Detalles
Capacidad interna del microservicio Core AI para persistir el feedback recibido.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que el Servicio de Feedback de Core AI expone un endpoint en la API interna (US-001) para recibir feedback.
2.  Dado que se recibe una petición válida (desde US-038) con datos de feedback (ID Evaluación, ID Usuario, tipo, datos).
3.  El servicio valida la petición (ej. IDs existen, tipo válido).
4.  Se crea un nuevo registro en la entidad `RegistroFeedbackIA` (o similar) con la información recibida.
5.  El registro se guarda correctamente en la base de datos de Core AI.
6.  Se devuelve una respuesta de confirmación (o error) al ATS MVP a través de la API.

## Requisito(s) Funcional(es) Asociado(s)
RF-20

## Prioridad: Must Have
* **Justificación:** Esencial para cumplir el objetivo de aprendizaje continuo; sin almacenar el feedback, no se puede usar para mejorar.

## Estimación Preliminar (SP): 2
* **Justificación:** Requiere un endpoint API en Core AI y lógica de backend para validar y escribir en la base de datos. Baja complejidad.