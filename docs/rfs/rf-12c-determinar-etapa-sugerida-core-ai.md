# Requisito Funcional: RF-12C

## 1. Título Descriptivo
* **Propósito:** Determinar Etapa Sugerida (Core AI)

## 2. Descripción Funcional (QUÉ debe hacer el sistema)
* **Propósito:** Basándose en el resultado de la comparación entre el score del candidato y el umbral de corte (RF-12B), TalentIA Core AI (Servicio de Evaluación) debe determinar cuál es la etapa inicial del pipeline sugerida para esa candidatura. Si el score es mayor o igual al corte, la etapa sugerida será la definida en `etapa_pre_aceptacion` para esa vacante. Si el score es menor que el corte, la etapa sugerida será la definida en `etapa_pre_rechazo`.

## 3. Justificación de Valor / Objetivo de Negocio (POR QUÉ es necesario)
* **Propósito:** Traduce el resultado numérico de la evaluación IA en una acción concreta y sugerida dentro del flujo de trabajo del reclutador (mover a una etapa específica). Acelera la toma de decisiones inicial y ayuda a organizar el pipeline automáticamente según los criterios predefinidos.

## 4. User Persona(s) / Rol(es) Afectado(s) (PARA QUIÉN)
* **Propósito:** N/A (Servicio interno).

## 5. Criterios de Aceptación Principales (Condiciones Clave de Éxito)
* **Propósito:**
    1.  El servicio conoce el resultado de la comparación de RF-12B (supera_corte = true/false).
    2.  Recupera los identificadores de `etapa_pre_aceptacion` y `etapa_pre_rechazo` de la `DescripcionPuestoGenerada` asociada a la vacante.
    3.  Si supera_corte es true, asigna el valor de `etapa_pre_aceptacion` a la variable `etapa_sugerida`.
    4.  Si supera_corte es false, asigna el valor de `etapa_pre_rechazo` a la variable `etapa_sugerida`.
    5.  El valor final de `etapa_sugerida` está listo para ser devuelto al ATS MVP (RF-13).

## 6. Origen / Fuente del Requisito
* **Propósito:** PRD TalentIA FInal.md - Sección 8 (RF-12C), Sección 7 (UC3), Sección 11 (Modelo Datos - DescripcionPuestoGenerada).

## 7. Prioridad Inicial (Sugerida por PO)
* **Propósito:** `Crítica` (Basado en Must Have del PRD).

## 8. Dependencias Funcionales (Opcional pero Recomendado)
* **Propósito:** RF-12B (Resultado de comparación), RF-06B (Almacenamiento de `etapa_pre_aceptacion` y `etapa_pre_rechazo`), RF-13 (Devolución de `etapa_sugerida`).

## 9. Notas y Suposiciones del PO
* **Propósito:** Asume que los valores `etapa_pre_aceptacion` y `etapa_pre_rechazo` siempre están definidos si se usa la evaluación IA. Requiere que estos identificadores de etapa sean consistentes con los usados en el ATS MVP (RF-28).