# Requisito Funcional: RF-13

## 1. Título Descriptivo
* **Propósito:** Devolver Evaluación (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Una vez completado el proceso de evaluación (parsing, scoring, comparación, determinación de etapa), TalentIA Core AI (Servicio de Evaluación) debe devolver el resultado completo al ATS MVP que inició la solicitud (RF-10). Esta respuesta debe incluir, como mínimo, el score calculado (RF-12), los datos clave extraídos o el resumen (RF-24 si aplica), y crucialmente, la `etapa_sugerida` (RF-12C).

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Cierra el ciclo de la solicitud de evaluación, entregando la inteligencia generada (score, sugerencia de acción) de vuelta al sistema principal (ATS MVP) para que pueda ser presentada al usuario y utilizada en el flujo de trabajo.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El servicio Core AI formula una respuesta estructurada (ej. JSON) tras completar la evaluación.
    2.  La respuesta contiene el `score.valor_general` (y opcionalmente parciales).
    3.  La respuesta contiene la `etapa_sugerida` determinada.
    4.  La respuesta puede contener opcionalmente el `resumen_generado` (RF-24) o `datos_extraidos_cv` (RF-11).
    5.  La respuesta incluye un identificador para vincularla a la `Candidatura` original en el ATS MVP.
    6.  La respuesta se envía de vuelta al ATS MVP (en respuesta a la llamada síncrona de RF-10, o vía callback/webhook si fue asíncrona).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-13, actualizado para incluir etapa), Sección 7 (UC3).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-10 (Solicitud original), RF-12 (Score), RF-12C (Etapa Sugerida), RF-21 (API Interna).

## 9. Notas y Suposiciones del PO
* **Propósito:** La estructura exacta de la respuesta debe definirse en el contrato de la API interna.