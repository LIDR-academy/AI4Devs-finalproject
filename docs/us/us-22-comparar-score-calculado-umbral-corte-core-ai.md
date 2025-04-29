# User Story: US-022

## Feature Asociada
Feature 4: Evaluación Inteligente de Candidaturas

## Título
Comparar Score Calculado con Umbral de Corte (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder comparar automáticamente el score de idoneidad calculado para un candidato con el umbral de corte definido para esa vacante
Para determinar si el candidato cumple el requisito mínimo establecido por el Reclutador.

## Detalles
Capacidad interna de Core AI para aplicar el filtro numérico configurado.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que se ha calculado el `score.valor_general` (US-021).
2.  El Servicio de Evaluación recupera el valor `evaluacion_corte` de la `DescripcionPuestoGenerada` asociada a la vacante (almacenado vía US-016).
3.  Se realiza la comparación numérica (`score.valor_general` >= `evaluacion_corte`).
4.  El resultado booleano (true/false) de la comparación está disponible para el siguiente paso (US-023).
5.  Si el valor `evaluacion_corte` no está disponible o es inválido, se maneja el caso de error de forma controlada (ej. se asume false, se loguea un warning).

## Requisito(s) Funcional(es) Asociado(s)
RF-12B

## Prioridad: Must Have
* **Justificación:** Necesario para poder determinar la etapa sugerida según la configuración del usuario.

## Estimación Preliminar (SP): 1
* **Justificación:** Lógica de backend muy simple: recuperar un valor y realizar una comparación numérica. Baja complejidad.