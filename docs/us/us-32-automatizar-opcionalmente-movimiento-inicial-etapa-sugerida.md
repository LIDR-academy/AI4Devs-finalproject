# User Story: US-032

## Feature Asociada
Feature 5: Visualización y Gestión del Pipeline de Selección

## Título
Automatizar (Opcionalmente) Movimiento Inicial a Etapa Sugerida

## Narrativa
Como Administrador del Sistema (configurando) / Como Sistema ATS (ejecutando)
Quiero tener la opción de configurar que las nuevas candidaturas se muevan automáticamente a la etapa sugerida por la IA
Para aumentar la automatización inicial si el nivel de confianza en la IA es alto.

## Detalles
Implementa la funcionalidad opcional de mover automáticamente al candidato según la sugerencia IA.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que existe una configuración (ej. un checkbox en la configuración del sistema o por vacante) para "Habilitar movimiento automático a etapa sugerida".
2.  Dado que esta configuración está HABILITADA.
3.  Dado que el ATS MVP recibe una `etapa_sugerida` válida de Core AI para una nueva candidatura (US-024).
4.  El ATS MVP, además de guardar la sugerencia, actualiza automáticamente el campo `Candidatura.etapa_pipeline_actual_id` al valor de la `etapa_sugerida`.
5.  El movimiento automático se registra en `HistorialEtapa` (indicando que fue automático/por IA).
6.  Si la configuración está DESHABILITADA, solo se guarda la `etapa_sugerida` (US-028) y la `etapa_pipeline_actual_id` permanece en la etapa inicial por defecto, sin realizarse el movimiento automático.

## Requisito(s) Funcional(es) Asociado(s)
RF-14C

## Prioridad: Could Have
* **Justificación:** Funcionalidad avanzada de automatización que puede no ser deseable inicialmente.

## Estimación Preliminar (SP): 2
* **Justificación:** Requiere añadir la lógica condicional en el backend del ATS para realizar la actualización automática basada en la configuración. La configuración en sí es simple. Baja complejidad.