# Plan de SPRINTs - Resumen General

Este documento presenta el plan de trabajo para el proyecto TalentIA (Fase 1), organizado en SPRINTs que tienen como objetivo la entrega completa de una Feature priorizada en cada ciclo. La duración de cada SPRINT variará en función del volumen de trabajo asociado a la Feature. La planificación busca distribuir la carga de trabajo de la manera más equitativa posible entre Jose Luis, Jesus y David.

## Enfoque Adoptado

* **SPRINTs Feature-Boxed:** Cada SPRINT se enfoca en la finalización de una Feature completa, tal como se define en la documentación del proyecto ([docs/features/features-overview.md](../features/features-overview.md)). La duración del SPRINT se ajustará a la complejidad de la Feature.
* **Priorización de Features:** El orden de los SPRINTs sigue la priorización de Features definida en la documentación.
* **Balanceo de Carga:** Se busca una distribución equitativa de la carga de trabajo (estimada en horas y Story Points) entre los 3 miembros del equipo dentro de cada SPRINT, considerando sus fortalezas y promoviendo el trabajo cruzado (FE, BE, Core AI).
* **Equipo como Product Owners:** El equipo gestionará su propio Backlog, priorización dentro de la Feature, y validación de los entregables.

## Recomendaciones Clave

* **Herramienta de Gestión de Tareas:** Es **crítico** seleccionar y configurar una herramienta de gestión de tareas (ej. Jira, Trello, Asana) al inicio del proyecto. Facilitará enormemente la planificación, asignación, seguimiento y balanceo de la carga de trabajo real. Los documentos de SPRINT adjuntos están diseñados para ser copiados y pegados en vuestra herramienta.
* **Setup Inicial:** Antes de comenzar el primer SPRINT, dedicad tiempo a configurar vuestro entorno de desarrollo, bases de datos, acceso a servicios externos (LLM), y un pipeline básico de CI/CD. Este trabajo no está incluido en los SPRINTs de Features y es un prerrequisito.
* **Comunicación y Colaboración:** Dada la flexibilidad con las ceremonias SCRUM y el rol compartido de Product Owner, la comunicación constante (sincronizaciones rápidas, chat, pair programming) es vital para gestionar dependencias entre tareas (especialmente entre ATS MVP y Core AI) y asegurar que los criterios de "Done" se cumplen.
* **Refinamiento Continuo:** Aunque el plan inicial está definido, refinad las tareas y estimaciones si es necesario a medida que avanzáis y obtenéis más claridad.
* **Testing:** Integrar la estrategia de pruebas ([docs/pp/pp-overview.md](../pp/pp-overview.md)) en vuestro ciclo de desarrollo dentro de cada SPRINT para asegurar la calidad del entregable de la Feature.

## Estimación General del Proyecto

Basado en las estimaciones actuales de las Tareas Técnicas, la duración total estimada para completar todas las Features (Must Have, Should Have, Could Have) es de aproximadamente **469 horas** de desarrollo. Con un equipo de 3 personas, esto representa alrededor de **156 horas por persona**.

Considerando una jornada laboral estándar, el proyecto completo (solo desarrollo de Features) podría tomar aproximadamente **4 a 5 semanas intensivas** de trabajo dedicado por persona. Recordad que esto no incluye el setup inicial, gestión de proyecto, refinamientos mayores o solución de bloqueos inesperados.

## SPRINTs Planificados

A continuación se listan los SPRINTs, ordenados por la prioridad de la Feature:

* [SPRINT Feature 7: Administración y Configuración](./Sprint_Feature_07.md)
* [SPRINT Feature 1: Gestión del Ciclo de Vida de la Vacante](./Sprint_Feature_01.md)
* [SPRINT Feature 3: Portal de Empleo y Proceso de Aplicación](./Sprint_Feature_03.md)
* [SPRINT Feature 2: Asistencia IA para Descripción de Puesto (JD)](./Sprint_Feature_02.md)
* [SPRINT Feature 4: Evaluación Inteligente de Candidaturas](./Sprint_Feature_04.md)
* [SPRINT Feature 5: Visualización y Gestión del Pipeline](./Sprint_Feature_05.md)
* [SPRINT Feature 6: Sistema de Feedback para IA](./Sprint_Feature_06.md)
* [SPRINT Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad](./Sprint_Feature_08.md)

Cada documento de SPRINT detalla el contenido de la Feature y la asignación propuesta de tareas.

---