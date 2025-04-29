# Requisito Funcional: RF-36

## 1. Título Descriptivo
* **Propósito:** Considerar Soft Skills (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** TalentIA Core AI (Servicio de Evaluación) podría intentar identificar y, potencialmente, evaluar de forma preliminar las "soft skills" (habilidades blandas como comunicación, liderazgo, trabajo en equipo) mencionadas o inferidas a partir del texto del CV (RF-11) o de respuestas a preguntas (si las hubiera).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Añadiría una dimensión adicional a la evaluación del candidato más allá de las habilidades técnicas, lo cual es cada vez más valorado por las empresas. Podría ofrecer una visión más holística inicial.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno). Indirectamente beneficia a Reclutador/Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Durante el parsing del CV (RF-11), el sistema intenta identificar palabras clave o frases relacionadas con soft skills comunes.
    2.  La información sobre soft skills detectadas se incluye en `datos_extraidos_cv`.
    3.  (Opcional avanzado) El score (RF-12) podría incluir un componente basado en estas soft skills, si son relevantes para la vacante.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8.3 (RF-36).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Baja` (Basado en Could Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-11 (Parsing CV), RF-12 (Scoring).

## 9. Notas y Suposiciones del PO
* **Propósito:** La identificación y evaluación objetiva de soft skills a partir de texto es muy compleja y propensa a errores/sesgos. Requiere NLP avanzado y validación cuidadosa. Por eso es Could Have.