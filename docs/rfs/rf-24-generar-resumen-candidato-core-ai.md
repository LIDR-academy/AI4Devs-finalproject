# Requisito Funcional: RF-24

## 1. Título Descriptivo
* **Propósito:** Generar Resumen Candidato (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** TalentIA Core AI (Servicio de Evaluación), además de calcular el score (RF-12), debería ser capaz de generar automáticamente un resumen textual breve (ej. 2-3 frases o bullet points) que destaque los puntos fuertes y débiles del candidato en relación con los requisitos clave de la vacante específica. Este resumen se basaría en los datos extraídos del CV (RF-11) y podría utilizar el proveedor LLM (RF-22).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Proporciona al Reclutador/Manager una visión cualitativa rápida del perfil del candidato, complementando el score numérico. Ayuda a entender *por qué* un candidato tiene un score determinado y acelera la comprensión de su adecuación sin necesidad de leer el CV completo inicialmente.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno). Indirectamente beneficia a Reclutador/Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Durante el proceso de evaluación (tras RF-11 y RF-12), el servicio identifica la información clave del candidato y los requisitos de la vacante.
    2.  Formula un prompt adecuado para solicitar un resumen comparativo al LLM (RF-22) o utiliza una lógica interna para generarlo.
    3.  Obtiene el texto del resumen.
    4.  Almacena el resumen generado en `EvaluacionCandidatoIA.resumen_generado`.
    5.  El resumen se devuelve al ATS MVP como parte de la respuesta de evaluación (RF-13).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-24), Sección 4.B (Módulo Cribado), Sección 7 (UC3).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Alta` (Basado en Should Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-11 (Datos CV), RF-12 (Contexto Evaluación), RF-22 (LLM), RF-13 (Devolución), RF-25 (Visualización).

## 9. Notas y Suposiciones del PO
* **Propósito:** La calidad del resumen dependerá del LLM y el prompt. Puede añadir latencia y coste al proceso de evaluación.