# User Story: US-023

## Feature Asociada
Feature 4: Evaluación Inteligente de Candidaturas

## Título
Determinar Etapa de Pipeline Sugerida (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder determinar la etapa de pipeline sugerida para un candidato basándome en si su score supera o no el umbral de corte
Para traducir la evaluación numérica en una recomendación de acción concreta.

## Detalles
Capacidad interna de Core AI para seleccionar la etapa adecuada según el resultado de la comparación y la configuración de la vacante.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que se conoce el resultado de la comparación score vs corte (US-022, true/false).
2.  El Servicio de Evaluación recupera los identificadores `etapa_pre_aceptacion` y `etapa_pre_rechazo` de la `DescripcionPuestoGenerada` asociada (almacenados vía US-016).
3.  Si el resultado de la comparación es true, se asigna el valor de `etapa_pre_aceptacion` a la variable `etapa_sugerida`.
4.  Si el resultado de la comparación es false, se asigna el valor de `etapa_pre_rechazo` a la variable `etapa_sugerida`.
5.  El valor final de `etapa_sugerida` (el identificador de la etapa) está listo para ser devuelto (US-024).
6.  Si los valores de `etapa_pre_aceptacion` o `etapa_pre_rechazo` no están disponibles o son inválidos, se maneja el error (ej. no se sugiere etapa, se loguea warning).

## Requisito(s) Funcional(es) Asociado(s)
RF-12C

## Prioridad: Must Have
* **Justificación:** Completa la lógica de la evaluación IA, proporcionando la recomendación de acción clave.

## Estimación Preliminar (SP): 1
* **Justificación:** Lógica de backend muy simple: recuperar dos valores y seleccionar uno basado en una condición booleana. Baja complejidad.