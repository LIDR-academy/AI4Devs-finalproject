# Requisito Funcional: RF-17

## 1. Título Descriptivo
* **Propósito:** Mover Candidatos entre Etapas

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP debe permitir a los usuarios autorizados (Reclutador/Manager) cambiar la etapa del pipeline en la que se encuentra una candidatura. Esto debe ser posible desde la vista de Pipeline (ej. arrastrando la tarjeta del candidato de una columna a otra en el Kanban - RF-16) o desde la vista de detalle del candidato. El usuario toma la decisión final, pudiendo seguir o ignorar la `etapa_sugerida` por la IA (RF-14B).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Es la acción principal para hacer avanzar (o descartar) a los candidatos en el proceso de selección. Permite reflejar en el sistema las decisiones tomadas tras la revisión manual o las entrevistas.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  En la vista Kanban (RF-16), se puede arrastrar una tarjeta de candidato de una columna (etapa) a otra.
    2.  En la vista de detalle de la candidatura, existe una opción (ej. un desplegable) para seleccionar una nueva etapa.
    3.  Al realizar la acción, se actualiza el campo `etapa_pipeline_actual_id` de la `Candidatura` en la BBDD.
    4.  Se registra el cambio en el historial de la candidatura (`HistorialEtapa`).
    5.  La interfaz visual (Kanban, detalle) se actualiza para reflejar la nueva etapa del candidato.
    6.  El usuario puede mover a cualquier etapa válida, independientemente de la `etapa_sugerida`.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-17, actualizado), Sección 4.A (Gestión Pipeline), Sección 7 (UC4).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-16 (Vista Pipeline), RF-28 (Configuración Etapas), (Implícitamente puede ser feedback para RF-20).

## 9. Notas y Suposiciones del PO
* **Propósito:** Se debe asegurar que solo se puedan mover a etapas válidas según la configuración del pipeline.