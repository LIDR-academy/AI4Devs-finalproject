# Descripción General de Features - TalentIA Fase 1

Este documento describe las principales funcionalidades (Features) que se implementarán en la **Fase 1 de TalentIA (ATS MVP + Core AI)**. Las features agrupan requisitos funcionales relacionados para entregar valor incremental. A continuación, se presenta la priorización propuesta para el desarrollo de estas features, junto con enlaces a sus descripciones detalladas.

## Priorización de Features Propuesta (Fase 1)

1.  **[Feature 7: Administración y Configuración del Sistema](./feature-07-administracion-configuracion-sistema.md)**
    * **Justificación:** Establece las bases técnicas y de configuración esenciales. Incluye la API interna (RF-21), la autenticación (RF-30), la gestión de usuarios (RF-29) y la configuración de etapas del pipeline (RF-28), elementos necesarios antes o al inicio del desarrollo de otras funcionalidades. *Prioridad: Muy Alta*.
2.  **[Feature 1: Gestión del Ciclo de Vida de la Vacante](./feature-01-gestion-ciclo-vida-vacante.md)**
    * **Justificación:** Implementa la creación y gestión básica de vacantes (RF-01, RF-02, RF-03), el punto de partida fundamental para cualquier proceso de reclutamiento dentro del ATS. Contiene RFs Must Have críticos. *Prioridad: Muy Alta*.
3.  **[Feature 3: Portal de Empleo y Proceso de Aplicación](./feature-03-portal-empleo-aplicacion.md)**
    * **Justificación:** Habilita la entrada de candidatos al sistema (RF-07, RF-08, RF-09), proporcionando los datos necesarios para las funcionalidades de evaluación y gestión posteriores. Esencial para el flujo end-to-end. Contiene RFs Must Have críticos. *Prioridad: Muy Alta*.
4.  **[Feature 2: Asistencia IA para Descripción de Puesto (JD)](./feature-02-asistencia-ia-descripcion-puesto.md)**
    * **Justificación:** Introduce una de las capacidades centrales de IA (RF-04, RF-04B, RF-05, RF-06, RF-06B), aportando valor directo al Reclutador y configurando parámetros para la evaluación posterior. Depende de F1. Alta concentración de RFs Must Have de IA. *Prioridad: Alta*.
5.  **[Feature 4: Evaluación Inteligente de Candidaturas](./feature-04-evaluacion-inteligente-candidaturas.md)**
    * **Justificación:** Implementa la otra capacidad central de IA: el cribado y scoring (RF-09B a RF-13, RF-24). Depende lógicamente de tener vacantes (F1), candidatos (F3) y parámetros IA configurados (F2). Alta concentración de RFs Must Have de IA. *Prioridad: Alta*.
6.  **[Feature 5: Visualización y Gestión del Pipeline de Selección](./feature-05-visualizacion-gestion-pipeline.md)**
    * **Justificación:** Permite a los usuarios interactuar con los resultados de la evaluación IA y gestionar el flujo de candidatos (RF-14 a RF-17, RF-25, RF-26, RF-26B). Depende de que existan evaluaciones (F4) y candidaturas (F3) en vacantes (F1). Contiene RFs Must Have cruciales para la usabilidad del ATS. *Prioridad: Alta*.
7.  **[Feature 6: Sistema de Feedback para IA](./feature-06-sistema-feedback-ia.md)**
    * **Justificación:** Cierra el ciclo de aprendizaje de la IA (RF-18, RF-19, RF-20, RF-27). Es importante para el objetivo de mejora continua, pero lógicamente sigue a la visualización y uso de las evaluaciones (F5). *Prioridad: Media*.
8.  **[Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad](./feature-08-mejoras-adicionales-usabilidad.md)**
    * **Justificación:** Agrupa funcionalidades deseables pero no esenciales (RF-32 a RF-35), todas clasificadas como Could Have. Naturalmente, se abordarían después del núcleo funcional y de IA. *Prioridad: Baja*.

---

*Consulta los enlaces para ver el detalle de cada Feature y los Requisitos Funcionales que agrupa.*