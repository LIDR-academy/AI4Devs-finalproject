# Requisito Funcional: RF-25

## 1. Título Descriptivo
* **Propósito:** Mostrar Resumen IA (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP, si recibe un resumen textual del candidato generado por la IA (RF-24) como parte de la respuesta de evaluación (RF-13), debería mostrar este resumen de forma clara en la interfaz de usuario, típicamente en la vista de detalle de la candidatura (junto al score RF-14 y la etapa sugerida RF-14B).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Hace útil el resumen generado por la IA (RF-24) para el usuario final, proporcionando el contexto cualitativo que complementa al score numérico y ayuda a la toma de decisiones rápida.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Al recibir la respuesta de RF-13, si contiene `resumen_generado`, ATS MVP lo almacena asociado a la `Candidatura` o a la `EvaluacionCandidatoIA` referenciada.
    2.  En la vista de detalle de la `Candidatura`, si existe un `resumen_generado`, se muestra en un área designada (ej. bajo el score).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-25), Sección 7 (UC3, UC4).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Alta` (Basado en Should Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-13 (Recepción del resumen), RF-24 (Generación del resumen).

## 9. Notas y Suposiciones del PO
* **Propósito:** La presentación debe ser clara y concisa.