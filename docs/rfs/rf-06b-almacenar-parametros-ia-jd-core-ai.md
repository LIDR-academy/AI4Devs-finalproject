# Requisito Funcional: RF-06B

## 1. Título Descriptivo
* **Propósito:** Almacenar Parámetros IA en JD (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El componente TalentIA Core AI (específicamente el Servicio de Generación JD o uno relacionado) debe ser capaz de recibir los parámetros de evaluación IA (`evaluacion_corte`, `etapa_pre_aceptacion`, `etapa_pre_rechazo`) enviados desde el ATS MVP (vía RF-04B) y almacenarlos de forma persistente en la entidad `DescripcionPuestoGenerada` (o similar) asociada a la vacante correspondiente (identificada por `vacante_ats_id`).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Persiste la configuración específica de la IA para cada vacante, permitiendo que el Servicio de Evaluación (RF-12B, RF-12C) pueda recuperarla y utilizarla posteriormente para comparar scores y sugerir etapas de forma correcta y contextualizada a esa vacante.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno invocado por ATS MVP). Indirectamente habilita funcionalidad para Reclutador/Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El servicio Core AI expone una API interna que acepta el ID de la vacante ATS y los parámetros IA (`evaluacion_corte`, `etapa_pre_aceptacion`, `etapa_pre_rechazo`).
    2.  Al ser invocado, el servicio busca o crea la entidad `DescripcionPuestoGenerada` asociada a `vacante_ats_id`.
    3.  Actualiza/guarda los campos `evaluacion_corte`, `etapa_pre_aceptacion`, `etapa_pre_rechazo` en dicha entidad.
    4.  Devuelve una confirmación (o error) al ATS MVP.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-06B), Sección 7 (UC1), Sección 11 (Modelo de Datos - DescripcionPuestoGenerada).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-04B (Invocación desde ATS), RF-21 (API Interna).

## 9. Notas y Suposiciones del PO
* **Propósito:** Requiere que la entidad `DescripcionPuestoGenerada` exista en el modelo de datos de Core AI con los campos necesarios.