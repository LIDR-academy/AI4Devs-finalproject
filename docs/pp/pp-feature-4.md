## 5. Feature 4: Evaluación Inteligente de Candidaturas (Prioridad: Alta)

### 5.1. Objetivos de Prueba

* Validar la creación y actualización del perfil unificado `CandidatoIA` en Core AI.
* Verificar que la invocación de la evaluación desde ATS a Core AI funciona correctamente.
* **Evaluar la precisión y robustez del parsing de CVs (PDF, DOCX) para extraer datos estructurados (skills, experiencia, educación).**
* **Validar la lógica y la precisión del algoritmo de scoring de idoneidad.**
* Asegurar que la comparación del score con el umbral de corte y la determinación de la etapa sugerida funcionen según la configuración de la vacante.
* Confirmar que los resultados completos de la evaluación (score, etapa, resumen opcional) se devuelven correctamente al ATS MVP.
* (Should Have) Evaluar la calidad de los resúmenes de candidato generados.
* (Could Have) Evaluar la identificación (si se implementa) de soft skills.
* Verificar el cumplimiento del NFR de latencia para la evaluación de candidaturas (RNF-03).

### 5.2. User Stories Cubiertas

* [US-18: Gestionar Perfil Unificado de Candidato en IA (Core AI)](./us/us-18-gestionar-perfil-unidicado-candidato-IA.md)
* [US-19: Invocar Evaluación IA para Nueva Candidatura](./us/us-19-invocar-evaluacion-ia-nueva-candidatura.md)
* [US-20: Extraer Datos Estructurados del CV (Core AI)](./us/us-20-extraer-datos-estructurados-cv-core-ai.md)
* [US-21: Calcular Score de Idoneidad Candidato vs Vacante (Core AI)](./us/us-21-calcular-score-idoneidad-candidato-vs-vacante-core-ai.md)
* [US-22: Comparar Score Calculado con Umbral de Corte (Core AI)](./us/us-22-comparar-score-calculado-umbral-corte-core-ai.md)
* [US-23: Determinar Etapa de Pipeline Sugerida (Core AI)](./us/us-23-determinar-etapa-pipeline-sugerida-core-ai.md)
* [US-24: Devolver Resultados Completos de Evaluación IA al ATS (Core AI)](./us/us-24-devolver-resultados-completos-evaluacion-ia-ats-core-ai.md)
* [US-25: Generar Resumen Ejecutivo del Candidato vs Vacante (Core AI)](./us/us-25-generar-resumen-ejecutivo-candidato-vs-vacante-core-ai.md) (Should Have)
* [US-26: Identificar/Evaluar Soft Skills del CV (Core AI)](./us/us-26-identificar-evaluar-soft-skills-cv-core-ai.md) (Could Have)

### 5.3. Enfoque de Pruebas Específico

* **Pruebas Funcionales (Core AI - API y Lógica):**
    * **Gestión Perfil `CandidatoIA` (US-18):** Probar endpoint API Core AI (TK-063) para crear perfil con primer email y para actualizar con segunda candidatura del mismo email. Verificar la lógica de `find-or-create/update` y la correcta gestión de `candidaturas_ids` (TK-064).
    * **Invocación Evaluación (US-19):** Probar endpoint API Core AI (TK-065) con IDs válidos e inválidos. Verificar inicio del flujo (TK-066).
    * **Devolución Resultados (US-24):** Verificar que la respuesta final del endpoint de evaluación (TK-065) contenga la estructura y datos correctos (score, etapa_sugerida, resumen opcional) según TK-076.
* **Pruebas de Integración:**
    * **ATS -> Core AI (Flujo Completo):** Probar el flujo disparado por una nueva aplicación en ATS (TK-045): llamada a US-18, llamada a US-19, procesamiento completo en Core AI, y recepción de la respuesta (US-24) por parte del ATS. Verificar que los datos de evaluación se asocian correctamente a la candidatura en ATS (RF-14, RF-14B, RF-25).
    * **Core AI -> LLM:** Verificar llamadas para parsing (si aplica), resumen (US-25), soft skills (US-26).
* **Pruebas de Calidad de IA (Enfoque Principal):**
    * **Parsing de CV (US-20 / TK-069):**
        * Usar un conjunto de CVs de prueba diverso (formatos PDF/DOCX, diferentes estructuras, con/sin secciones claras, errores tipográficos).
        * Comparar los `datos_extraidos_cv` (TK-070) por la IA con una "verdad del terreno" (ground truth) definida manualmente para ese conjunto.
        * Calcular métricas de precisión (Precision, Recall, F1-Score) para campos clave (ej. % skills correctamente identificadas, % puestos de trabajo extraídos con fechas correctas). Objetivo >85% (KPI Fase 1).
        * Probar robustez ante fallos de extracción de texto (TK-068).
    * **Scoring (US-021 / TK-072):**
        * Definir perfiles de candidatos test (basados en `datos_extraidos_cv` simulados o reales) y perfiles de vacantes test (con requisitos claros y parámetros IA configurados - TK-071).
        * Ejecutar el scoring para estos pares candidato-vacante.
        * Verificar consistencia (misma entrada -> mismo score).
        * Comparar los scores obtenidos con una evaluación/ranking realizado por reclutadores expertos para los mismos pares. Medir correlación o acuerdo (KPI Fase 1).
        * Probar casos límite (match perfecto, sin match, datos parciales).
        * Verificar almacenamiento correcto (TK-073).
    * **Lógica de Decisión (US-22, US-23 / TK-074, TK-075):**
        * Para diferentes scores calculados y diferentes valores de `evaluacion_corte`, verificar que la comparación (TK-074) y la `etapa_sugerida` resultante (TK-075) sean las correctas según la lógica definida.
    * **Generación de Resumen (US-025 / TK-077-TK-079 - Should Have):**
        * Evaluar cualitativamente (relevancia, concisión, utilidad) los resúmenes generados para diferentes perfiles y vacantes.
    * **Identificación Soft Skills (US-026 / TK-080 - Could Have):**
        * Si se implementa, evaluar cualitativamente la precisión de las soft skills identificadas.
* **Pruebas de Rendimiento (RNF-03):** Medir el tiempo total desde que ATS envía la solicitud de evaluación (US-19) hasta que recibe la respuesta completa (US-24). Validar contra el objetivo (< 2 min para 90%). Identificar cuellos de botella (parsing, LLM, scoring).
* **Pruebas de Seguridad:** Asegurar que los datos sensibles (PII en CVs) se manejen de forma segura durante el procesamiento interno y en las llamadas a LLMs externos (idealmente anonimizados si es posible).
* **Pruebas Unitarias (TK-064, TK-066-TK-080):** Responsabilidad del desarrollador para la lógica interna de los servicios Core AI.

### 5.4. Datos de Prueba Necesarios

* **Conjunto de CVs de Prueba:** Amplio y diverso (PDF/DOCX, diferentes estructuras, idiomas [limitado], niveles de experiencia, con/sin errores). Incluir un subconjunto con "ground truth" para skills, experiencia, educación.
* **Vacantes de Prueba:** Con requisitos variados y parámetros IA (corte, etapas pre-aceptación/rechazo) diferentes.
* **Perfiles de Candidatos IA de Prueba:** Para probar la lógica de `CandidatoIA`.
* **Resultados Esperados:** Evaluaciones manuales de referencia para comparar con los scores/rankings de la IA.

### 5.5. Priorización Interna

1.  **Parsing CV (US-20):** La calidad de la entrada es crucial.
2.  **Scoring (US-21):** El cálculo del score es el núcleo.
3.  **Lógica Decisión (US-22, US-23):** Necesario para la sugerencia de etapa.
4.  **Flujo Integración (US-18, US-19, US-24):** Asegurar que el ciclo completo funciona.
5.  **Gestión Perfil `CandidatoIA` (US-18):** Importante para historial.
6.  **Generación Resumen (US-25):** Menor prioridad (Should Have).
7.  **Soft Skills (US-26):** Menor prioridad (Could Have).

---