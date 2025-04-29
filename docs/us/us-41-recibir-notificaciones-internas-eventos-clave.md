# User Story: US-041

## Feature Asociada
Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad

## Título
Recibir Notificaciones Internas sobre Eventos Clave

## Narrativa
Como Reclutador/Hiring Manager
Quiero recibir notificaciones dentro del ATS MVP sobre eventos importantes (ej. nueva candidatura, cambio de etapa relevante)
Para estar informado puntualmente sin tener que revisar constantemente.

## Detalles
Implementa un sistema básico de notificaciones en la interfaz.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que ocurre un evento predefinido como notificable (ej. se crea una nueva `Candidatura` - US-011 para una de mis vacantes, o se mueve un candidato a la etapa "Entrevista HM" - US-031).
2.  El sistema genera un registro de notificación interno asociado a mi usuario.
3.  Dado que he iniciado sesión, veo un indicador de notificaciones no leídas (ej. un número en un icono de campana).
4.  Dado que hago clic en el indicador, se despliega una lista con mis notificaciones recientes, mostrando un resumen del evento y un enlace al contexto (candidato/vacante).
5.  Dado que veo la lista, puedo marcar las notificaciones como leídas (individualmente o todas).
6.  Las notificaciones se almacenan y son accesibles durante un período de tiempo definido (ej. 30 días).

## Requisito(s) Funcional(es) Asociado(s)
RF-32

## Prioridad: Could Have
* **Justificación:** Mejora la experiencia y proactividad, pero no es esencial para la funcionalidad básica.

## Estimación Preliminar (SP): 5
* **Justificación:** Requiere detectar eventos en el backend, generar y almacenar notificaciones, y desarrollar la UI para mostrar el indicador y la lista de notificaciones. Complejidad moderada.