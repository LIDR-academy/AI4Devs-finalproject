# Requisito Funcional: RF-14

## 1. Título Descriptivo
* **Propósito:** Mostrar Evaluación IA (ATS MVP)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** El ATS MVP, una vez que recibe la respuesta de evaluación de TalentIA Core AI (RF-13), debe almacenar la información relevante (al menos el score y la referencia a la evaluación completa) asociada a la `Candidatura` correspondiente. Además, debe presentar de forma clara y visible el score de IA y otros datos clave recibidos (como el resumen RF-25 si aplica) en la interfaz de usuario, específicamente en el perfil o vista detallada del candidato/candidatura.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Hace que la información generada por la IA sea útil para el usuario final (Reclutador/Manager). Permite visualizar rápidamente el resultado del análisis inteligente para informar sus decisiones de revisión y gestión del pipeline.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** Reclutador, Hiring Manager.

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  Al recibir la respuesta de RF-13, ATS MVP guarda el `score.valor_general` en `Candidatura.puntuacion_ia_general` y el ID de la evaluación en `Candidatura.referencia_evaluacion_ia_id`.
    2.  En la vista de lista de candidatos de una vacante (RF-15), se muestra el `puntuacion_ia_general` junto a cada candidato evaluado.
    3.  En la vista de detalle de una `Candidatura`, se muestra de forma destacada el `puntuacion_ia_general`.
    4.  (Should Have) Si se recibe un `resumen_generado` (RF-25), también se muestra en la vista de detalle.

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-14), Sección 4.A (Gestión Candidaturas), Sección 7 (UC3, UC4).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-13 (Recepción de Evaluación), RF-15 (Vista de Lista), RF-16 (Vista de Pipeline/Detalle).

## 9. Notas y Suposiciones del PO
* **Propósito:** La forma exacta de visualización (gráfico, número, color) debe definirse en el diseño de UI/UX.