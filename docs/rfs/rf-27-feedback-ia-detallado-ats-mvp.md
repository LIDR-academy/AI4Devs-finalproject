# Requisito Funcional: RF-27

## 1. Título Descriptivo
* **Propósito:** Feedback IA más Detallado (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Además del feedback básico (RF-18), el ATS MVP debería ofrecer mecanismos más granulares para que los usuarios proporcionen retroalimentación sobre la evaluación IA. Ejemplos incluyen: permitir ajustar manualmente el score numérico asignado por la IA, validar o invalidar skills específicas detectadas por la IA (RF-11), o añadir un comentario cualitativo sobre por qué se está de acuerdo o en desacuerdo con la evaluación.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Proporciona un feedback mucho más rico y específico al Módulo de Aprendizaje (RF-20), permitiendo ajustes más precisos en los modelos de IA (ej. corregir errores de parsing de skills, ajustar ponderaciones del scoring). Acelera y mejora la calidad del aprendizaje continuo.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  La interfaz de detalle de la candidatura, junto a la evaluación IA, muestra opciones adicionales de feedback:
        * Un campo editable para el score IA.
        * Una lista de skills detectadas con botones/checkbox para validar/invalidar cada una.
        * Un campo de texto para comentarios sobre el feedback.
    2.  El usuario puede interactuar con estos controles.
    3.  Al guardar/enviar el feedback (RF-19), se incluye esta información detallada en la petición a Core AI.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-27), Sección 7 (UC5).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Alta` (Basado en Should Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-11 (Disponibilidad de skills detectadas), RF-18 (Base para feedback), RF-19 (Envío), RF-20 (Recepción y almacenamiento de datos más complejos).

## 9. Notas y Suposiciones del PO
* **Propósito:** Incrementa la complejidad de la interfaz de feedback y del modelo de datos para `RegistroFeedbackIA`. Validar skills requiere que la IA no solo detecte skills sino que las devuelva de forma estructurada.