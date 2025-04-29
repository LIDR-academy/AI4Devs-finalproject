# Requisito Funcional: RF-14B

## 1. Título Descriptivo
* **Propósito:** Mostrar Etapa Sugerida (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Junto con el score de IA (RF-14), el ATS MVP debe mostrar también de forma clara la `etapa_sugerida` que fue determinada por TalentIA Core AI (RF-12C) y recibida en la respuesta (RF-13). Esta sugerencia debe ser visible tanto en la lista de candidatos de una vacante como en la vista detallada de la candidatura, para que el usuario la considere al gestionar el pipeline.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Proporciona una guía de acción inmediata basada en la evaluación IA y los criterios del reclutador (corte, etapas predefinidas). Ayuda a acelerar la clasificación inicial y a enfocar la revisión manual en los candidatos que superan el umbral o requieren una acción específica según la sugerencia.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Al recibir la respuesta de RF-13, ATS MVP guarda el valor de `etapa_sugerida` en el campo `Candidatura.etapa_sugerida`.
    2.  En la vista de lista de candidatos de una vacante (RF-15), se muestra la `etapa_sugerida` (ej. como texto o un icono) junto al score IA.
    3.  En la vista de detalle de una `Candidatura`, se muestra claramente la `etapa_sugerida` (ej. "Sugerencia IA: Mover a Entrevista").
    4.  La etapa sugerida es solo una indicación; la etapa actual (`Candidatura.etapa_pipeline_actual_id`) sigue siendo la que determina la posición real en el pipeline hasta que el usuario actúe (RF-17). *(Excepto si se implementa RF-14C Could Have)*.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-14B), Sección 7 (UC3, UC4), Sección 11 (Modelo Datos - Candidatura).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-13 (Recepción de `etapa_sugerida`), RF-15 (Vista Lista), RF-16 (Vista Detalle/Pipeline), RF-17 (Acción del Usuario).

## 9. Notas y Suposiciones del PO
* **Propósito:** La UI debe diferenciar claramente la etapa *actual* de la *sugerida*.