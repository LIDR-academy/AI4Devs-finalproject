# User Story: US-020

## Feature Asociada
Feature 4: Evaluación Inteligente de Candidaturas

## Título
Extraer Datos Estructurados del CV (Capacidad Core AI)

## Narrativa
Como Sistema TalentIA Core AI
Quiero poder procesar un archivo de CV (PDF, DOCX) y extraer datos estructurados clave (experiencia, educación, skills)
Para convertir la información del candidato en un formato utilizable para el scoring objetivo.

## Detalles
Capacidad interna de Core AI para realizar el parsing del CV. Puede implicar uso de librerías o LLMs.

## Criterios de Aceptación (SMART y Testables - Revisados por QAL)
1.  Dado que el Servicio de Evaluación recibe una solicitud con referencia a un CV (desde US-019).
2.  El servicio puede leer el contenido textual del archivo (PDF, DOCX).
3.  El servicio aplica técnicas de parsing (librerías o llamada a LLM - RF-22) para identificar y extraer:
    * Secciones de Experiencia Laboral (empresa, puesto, fechas).
    * Secciones de Educación (institución, título, fechas).
    * Lista de Habilidades/Skills mencionadas.
4.  Los datos extraídos se almacenan en un formato estructurado (JSON) dentro de la entidad `EvaluacionCandidatoIA` asociada.
5.  Si el parsing falla o no se puede leer el archivo, se registra un error específico.
6.  La precisión de la extracción cumple con un umbral mínimo definido (ej. >85% de campos clave correctos en una muestra de prueba - KPI Fase 1).

## Requisito(s) Funcional(es) Asociado(s)
RF-11

## Prioridad: Must Have
* **Justificación:** La extracción de datos es un prerrequisito indispensable para poder realizar el scoring (US-021).

## Estimación Preliminar (SP): 8
* **Justificación:** El parsing de CVs es inherentemente complejo y variable. Requiere investigación de librerías, posible integración y prompt engineering con LLMs (RF-22), manejo de diferentes formatos y estructuras de CV, y validación robusta. Alta complejidad e incertidumbre.