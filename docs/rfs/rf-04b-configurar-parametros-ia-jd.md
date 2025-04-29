# Requisito Funcional: RF-04B

## 1. Título Descriptivo
* **Propósito:** Configurar Parámetros IA en JD

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Al crear o editar una vacante en el ATS MVP, el sistema debe permitir al Reclutador definir y guardar los parámetros clave que TalentIA Core AI utilizará para la evaluación de candidatos: el score mínimo (`evaluacion_corte`), la etapa sugerida si se supera el corte (`etapa_pre_aceptacion`), y la etapa sugerida si no se supera (`etapa_pre_rechazo`). Estos parámetros se almacenarán asociados a la descripción del puesto en Core AI.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Permite al Reclutador configurar cómo la IA debe filtrar y categorizar inicialmente a los candidatos para cada vacante específica, adaptando el nivel de exigencia (corte) y el flujo de trabajo sugerido (etapas) según las necesidades del puesto. Es crucial para la funcionalidad de sugerencia de etapa (RF-12C, RF-14B).

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El formulario de creación/edición de vacante en ATS MVP incluye campos para introducir `evaluacion_corte` (numérico, ej. 0-100), `etapa_pre_aceptacion` (selector de etapas del pipeline) y `etapa_pre_rechazo` (selector de etapas del pipeline).
    2.  Al guardar la vacante, el ATS MVP envía estos parámetros junto con el ID de la vacante al servicio correspondiente de TalentIA Core AI (RF-06B).
    3.  El sistema confirma visualmente al Reclutador que los parámetros IA han sido guardados.
    4.  Las etapas seleccionables para `etapa_pre_aceptacion` y `etapa_pre_rechazo` provienen de las etapas configuradas en el pipeline (RF-28).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-04B), Sección 7 (UC1), Sección 11 (Modelo de Datos - DescripcionPuestoGenerada).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-01/RF-02 (Contexto de Vacante), RF-06B (Almacenamiento en Core AI), RF-28 (Definición de Etapas).

## 9. Notas y Suposiciones del PO
* **Propósito:** Requiere que las etapas del pipeline sean configurables (RF-28) para poder seleccionarlas aquí. La validación de los valores (ej. corte entre 0 y 100) debe realizarse.