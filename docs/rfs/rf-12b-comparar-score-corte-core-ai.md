# Requisito Funcional: RF-12B

## 1. Título Descriptivo
* **Propósito:** Comparar Score con Corte (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Inmediatamente después de calcular el score de idoneidad (RF-12), TalentIA Core AI (Servicio de Evaluación) debe recuperar el valor del umbral `evaluacion_corte` que fue definido por el Reclutador para esa vacante específica (y almacenado vía RF-06B en la `DescripcionPuestoGenerada`). El sistema debe comparar el `score.valor_general` calculado para el candidato con este umbral.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Aplica el criterio de filtro definido por el usuario (Reclutador) para esa vacante. Permite determinar si el candidato supera el nivel mínimo de ajuste considerado necesario, lo cual es el paso previo para poder sugerir una etapa inicial adecuada.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El servicio tiene acceso al `score.valor_general` recién calculado (RF-12).
    2.  Recupera el valor de `evaluacion_corte` de la `DescripcionPuestoGenerada` asociada a la `vacante_ats_id` de la evaluación.
    3.  Realiza la comparación numérica: `score.valor_general` >= `evaluacion_corte`.
    4.  El resultado de esta comparación (verdadero/falso) está disponible para el siguiente paso (RF-12C).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-12B), Sección 7 (UC3), Sección 11 (Modelo Datos - DescripcionPuestoGenerada).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-12 (Score calculado), RF-06B (Almacenamiento de `evaluacion_corte`), RF-12C (Uso del resultado de la comparación).

## 9. Notas y Suposiciones del PO
* **Propósito:** Asume que `evaluacion_corte` siempre está definido para las vacantes que usan evaluación IA. Se debe manejar el caso de que falte este parámetro (ej. error o comportamiento por defecto).