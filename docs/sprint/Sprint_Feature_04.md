# SPRINT Feature 4: Evaluación Inteligente de Candidaturas

* **Objetivo del SPRINT:** Implementar el núcleo del motor de evaluación IA: parsing de CVs, scoring, comparación con umbral y determinación de etapa sugerida, y devolver los resultados al ATS.
* **Feature Asociada:** Feature 4: Evaluación Inteligente de Candidaturas ([docs/features/feature-04-evaluacion-inteligente-candidaturas.md](../features/feature-04-evaluacion-inteligente-candidaturas.md))
* **User Stories Incluidas:**
    * [US-18: Gestionar Perfil Unificado de Candidato en IA (Capacidad Core AI)](../us/us-18-gestionar-perfil-unidicado-candidato-IA.md)
    * [US-19: Invocar Evaluación IA para Nueva Candidatura](../us/us-19-invocar-evaluacion-ia-nueva-candidatura.md)
    * [US-20: Extraer Datos Estructurados del CV (Capacidad Core AI)](../us/us-20-extraer-datos-estructurados-cv-core-ai.md)
    * [US-21: Calcular Score de Idoneidad Candidato vs Vacante (Capacidad Core AI)](../us/us-21-calcular-score-idoneidad-candidato-vs-vacante-core-ai.md)
    * [US-22: Comparar Score Calculado con Umbral de Corte (Capacidad Core AI)](../us/us-22-comparar-score-calculado-umbral-corte-core-ai.md)
    * [US-23: Determinar Etapa de Pipeline Sugerida (Capacidad Core AI)](../us/us-23-determinar-etapa-pipeline-sugerida-core-ai.md)
    * [US-24: Devolver Resultados Completos de Evaluación IA al ATS (Capacidad Core AI)](../us/us-24-devolver-resultados-completos-evaluacion-ia-ats-core-ai.md)
    * [US-25: Generar Resumen Ejecutivo del Candidato vs Vacante (Capacidad Core AI)](../us/us-25-generar-resumen-ejecutivo-candidato-vs-vacante-core-ai.md) (Should Have)
    * [US-26: Identificar/Evaluar Soft Skills del CV (Capacidad Core AI)](../us/us-26-identificar-evaluar-soft-skills-cv-core-ai.md) (Could Have)
* **Total Story Points (Feature):** 33 SP
* **Total Horas Estimadas (Feature):** 69 horas
* **Estimación Promedio por Persona:** 11 SP / 23 horas
* **Duración Estimada del SPRINT:** ~1.5 semanas

## Tareas del SPRINT por Persona

Aquí se listan las Tareas Técnicas (TKs) para esta Feature, con una propuesta de asignación buscando equilibrar la carga y aprovechar las fortalezas en IA.

### Jose Luis (Estimación: ~25 horas / ~6 SP)

* [ ] [TK-062: CAI-BE: Definir Schema BBDD Core AI para Entidad `CandidatoIA`](<../tasks/tk-062-CAI-DB-Definir-Schema-CandidatoIA.md>) (2h / 0 SP)
* [ ] [TK-063: CAI-BE: Implementar Endpoint API Core AI para Crear/Actualizar `CandidatoIA`](<../tasks/tk-063-CAI-BE-Implementar-API-Upsert-CandidatoIA.md>) (3h / 1 SP)
* [ ] [TK-064: CAI-BE: Implementar Lógica Core AI para Find-Or-Create/Update `CandidatoIA`](<../tasks/tk-064-CAI-BE-Implementar-Logica-Upsert-CandidatoIA.md>) (4h / 1 SP)
* [ ] [TK-065: CAI-BE: Implementar Endpoint API Core AI para Recibir Solicitud de Evaluación](<../tasks/tk-065-CAI-BE-Implementar-API-Recibir-Solicitud-Evaluacion.md>) (3h / 1 SP)
* [ ] [TK-066: CAI-BE: Implementar Lógica Core AI para Iniciar Proceso de Evaluación](<../tasks/tk-066-CAI-BE-Implementar-Logica-Iniciar-Evaluacion.md>) (2h / 0 SP)
* [ ] [TK-067: CAI-BE: Implementar Obtención de Contenido de Archivo CV](<../tasks/tk-067-CAI-BE-Obtener-Contenido-Archivo-CV.md>) (3h / 1 SP)
* [ ] [TK-070: CAI-BE: Implementar Almacenamiento de Datos Parseados del CV](<../tasks/tk-070-CAI-BE-Implementar-Almacenamiento-Datos-Parseados-CV.md>) (2h / 0 SP)
* [ ] [TK-073: CAI-BE: Implementar Almacenamiento de Scores Calculados](<../tasks/tk-073-CAI-BE-Implementar-Almacenamiento-Scores.md>) (2h / 0 SP)
* [ ] [TK-076: CAI-BE: Implementar Formateo y Retorno de Respuesta de Evaluación Completa](<../tasks/tk-076-CAI-BE-Implementar-Formateo-Retorno-Respuesta-Evaluacion.md>) (1h / 0 SP)

### Jesus (Estimación: ~22 horas / ~9 SP)

* [ ] [TK-068: CAI-BE: Implementar Extracción de Texto desde Archivos PDF y DOCX](<../tasks/tk-068-CAI-BE-Extraer-Texto-PDF-DOCX.md>) (4h / 1 SP)
* [ ] [TK-069: CAI-BE: Implementar Parsing de Texto de CV para Datos Estructurados](<../tasks/tk-069-CAI-BE-Implementar-Parsing-Texto-CV.md>) (13h / 8 SP) - **(Tarea de alta complejidad)**
* [ ] [TK-071: CAI-BE: Recuperar Inputs Necesarios para Scoring (Datos CV y Requisitos Vacante)](<../tasks/tk-071-CAI-BE-Recuperar-Inputs-Scoring.md>) (3h / 1 SP)
* [ ] [TK-074: CAI-BE: Implementar Lógica Comparación Score vs Umbral de Corte](<../tasks/tk-074-CAI-BE-Implementar-Logica-Comparacion-Score-Corte.md>) (1h / 0 SP)
* [ ] [TK-075: CAI-BE: Implementar Lógica Determinar Etapa Sugerida](<../tasks/tk-075-CAI-BE-Implementar-Logica-Determinar-Etapa-Sugerida.md>) (1h / 0 SP)

### David (Estimación: ~22 horas / ~18 SP)

* [ ] [TK-072: CAI-BE: Implementar Algoritmo de Matching y Scoring v1 (Reglas)](<../tasks/tk-072-CAI-BE-Implementar-Algoritmo-Scoring-v1.md>) (8h / 5 SP) - **(Tarea de alta complejidad)**
* [ ] [TK-077: CAI-BE: Implementar Lógica de Prompt Engineering para Generación de Resumen de Candidato](<../tasks/tk-077-CAI-BE-Implementar-Logica-Prompt-Engineering-Resumen.md>) (4h / 1 SP) - **(Should Have)**
* [ ] [TK-078: CAI-BE: Implementar Orquestación de Llamada a LLM para Generación de Resumen](<../tasks/tk-078-CAI-BE-Implementar-Orquestacion-LLM-Generacion-Resumen.md>) (3h / 1 SP) - **(Should Have)**
* [ ] [TK-079: CAI-BE: Implementar Almacenamiento Resumen Generado](<../tasks/tk-079-CAI-BE-Implementar-Almacenamiento-Resumen-Generado.md>) (2h / 0 SP) - **(Should Have)**
* [ ] [TK-080: CAI-BE: Investigar e Implementar Identificación de Soft Skills en Texto de CV](<../tasks/tk-080-CAI-BE-Investigar-Implementar-Identificacion-Soft-Skills.md>) (8h / 8 SP) - **(Could Have)**

## Coordinación y Dependencias Clave

* **Gestión CandidatoIA (US-18):** TKs 062, 063, 064 son la base del perfil unificado. Necesarios al inicio.
* **Invocación Evaluación (US-19):** TKs 065, 066 son los puntos de entrada del flujo de evaluación en Core AI.
* **Parsing CV (US-20):** TKs 067, 068, 069, 070 son un grupo crítico. TK-069 es de alta complejidad. Necesita TK-067/068 (extracción texto) antes. TK-070 depende del resultado del parsing.
* **Scoring (US-21, US-22, US-23, US-24):** TKs 071 a 076 forman el flujo de cálculo y decisión. Dependen de TK-070 (datos parseados) y TK-071 (requisitos vacante, que a su vez dependen de la configuración IA de Feature 2). TK-072 (Algoritmo Scoring) es de alta complejidad. TK-076 (Formateo Respuesta) es el último paso.
* **Integración LLM (TK-057):** Reutilizado de Feature 2. Necesario para TK-068 (si se usa para parsing avanzado), TK-077 (resumen) y TK-080 (soft skills).
* **Tareas Should Have/Could Have:** US-25 (Resumen) y US-26 (Soft Skills) dependen de los resultados del parsing (US-20) y scoring (US-21). Pueden abordarse una vez que el núcleo Must Have esté estable.
* **Comunicación:** Constante coordinación entre los que implementan los distintos pasos del flujo de evaluación (parsing -> scoring -> decisión -> formato) y los que construyen la infraestructura (DB, APIs, Perfil CandidatoIA).

## Entregable del SPRINT (Definition of Done para la Feature 4)

* El esquema de base de datos para `CandidatoIA` está creado.
* Los endpoints y lógica backend de Core AI para gestionar el perfil unificado (`CandidatoIA`) están implementados.
* Los endpoints y lógica backend de Core AI para iniciar el proceso de evaluación están implementados.
* La lógica backend de Core AI para extraer texto de CVs (PDF/DOCX), parsear datos estructurados, almacenar datos parseados, calcular score de idoneidad, comparar score con umbral de corte y determinar etapa sugerida está implementada.
* La lógica backend de Core AI para formatear y devolver los resultados completos de la evaluación al ATS MVP está implementada.
* Si se completa US-25 (Should Have), la generación de resumen de candidato está implementada.
* Si se completa US-26 (Could Have), la identificación/evaluación básica de soft skills está implementada.
* La IA de TalentIA puede recibir solicitudes de evaluación, procesar CVs, calcular un score, sugerir una etapa y devolver resultados al ATS MVP.
* Todas las pruebas unitarias y de integración relevantes para esta Feature han pasado.

---