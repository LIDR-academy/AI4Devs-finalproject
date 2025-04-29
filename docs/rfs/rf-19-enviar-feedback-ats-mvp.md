# Requisito Funcional: RF-19

## 1. Título Descriptivo
* **Propósito:** Enviar Feedback (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Una vez que el usuario ha interactuado con los controles de feedback en la interfaz (RF-18), el ATS MVP debe recopilar esta información (qué feedback se dio, sobre qué evaluación específica, por qué usuario) y enviarla al servicio correspondiente de TalentIA Core AI (Servicio de Feedback y Aprendizaje) a través de la API interna.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Asegura que el feedback capturado en la interfaz llegue al módulo de IA que lo necesita para aprender y mejorar. Cierra el bucle de retroalimentación humano-IA.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Sistema (ATS MVP invoca a Core AI).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Tras la acción del usuario en RF-18, el ATS MVP formula una petición a la API del Servicio de Feedback de Core AI.
    2.  La petición incluye: ID de la `EvaluacionCandidatoIA` sobre la que se da feedback, ID del `Usuario` ATS que da el feedback, el tipo de feedback (ej. 'SCORE_VALIDADO_UP') y opcionalmente datos adicionales (ej. score ajustado).
    3.  Se realiza la llamada a la API interna.
    4.  El sistema maneja la respuesta (confirmación o error).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-19), Sección 7 (UC5).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-18 (Captura del Feedback), RF-20 (Recepción en Core AI), RF-21 (API Interna).

## 9. Notas y Suposiciones del PO
* **Propósito:** La estructura exacta de los datos de feedback a enviar debe definirse en el contrato de la API.