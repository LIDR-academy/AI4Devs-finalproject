# User Story: US-017

## Feature Asociada
Feature 2: Asistencia IA para Descripción de Puesto (JD)

## Título
Enriquecer Generación de JD con Datos Internos (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero (opcionalmente) poder acceder a datos internos estructurados (ej. perfiles de puesto estándar) y usarlos al generar una JD
Para que las descripciones generadas sean más específicas, precisas y alineadas con la organización.

## Detalles
Cubre la capacidad de usar fuentes de datos internas para mejorar la generación de JD (RF-23).

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que el servicio de generación de JD (US-015) es invocado Y existe una fuente de datos interna configurada y accesible (ej. API, BBDD).
2.  El servicio puede consultar la fuente de datos interna buscando información relevante para la vacante (ej. por título de puesto, departamento).
3.  Dado que se encuentra información interna relevante, esta se utiliza para refinar el prompt enviado al LLM externo O para post-procesar/validar la JD generada por el LLM.
4.  El impacto del uso de datos internos es verificable en la JD final (ej. incluye terminología específica de la empresa, competencias clave internas).
5.  Si no se encuentran datos internos relevantes o la fuente no está disponible, el proceso de generación continúa sin ellos (usando solo la información básica y el LLM).

## Requisito(s) Funcional(es) Asociado(s)
RF-23

## Prioridad: Should Have
* **Justificación:** Añade valor significativo a la calidad de la JD generada, pero la funcionalidad básica puede operar sin ella.

## Estimación Preliminar (SP): 8
* **Justificación:** La complejidad puede ser alta dependiendo de la naturaleza, formato y accesibilidad de los datos internos. Requiere análisis, posible integración con otros sistemas y lógica de adaptación de datos para enriquecer el proceso de IA.