# Requisito Funcional: RF-14C

## 1. Título Descriptivo
* **Propósito:** Automatizar Movimiento Inicial Candidatura

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP podría, opcionalmente y si se configura, mover automáticamente una nueva candidatura a la `etapa_sugerida` determinada por TalentIA Core AI (RF-12C), en lugar de simplemente mostrar la sugerencia (RF-14B).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Podría aumentar aún más la automatización y eficiencia del proceso inicial, moviendo candidatos directamente a la etapa correspondiente (pre-aceptación o pre-rechazo) sin intervención manual inicial. Ahorraría clics al reclutador en casos claros.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Sistema (automatización). Indirectamente afecta al Reclutador (menos acción manual).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Existe una configuración global o por vacante que activa/desactiva esta automatización.
    2.  Si está activada, tras recibir la `etapa_sugerida` (RF-13), el ATS MVP actualiza automáticamente `Candidatura.etapa_pipeline_actual_id` al valor de `etapa_sugerida`.
    3.  El movimiento se registra en el historial (`HistorialEtapa`).
    4.  La interfaz (Kanban RF-16) refleja inmediatamente al candidato en la etapa a la que fue movido automáticamente.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8.3 (RF-14C).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Baja` (Basado en Could Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-12C (Determinación etapa sugerida), RF-13 (Recepción etapa sugerida), RF-17 (Mecanismo de movimiento).

## 9. Notas y Suposiciones del PO
* **Propósito:** Introduce un nivel mayor de automatización que puede no ser deseado por todos los usuarios ("Human in the loop"). Por eso es Could Have y debería ser configurable.