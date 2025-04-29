# Estrategia General de Pruebas - TalentIA Fase 1 (ATS MVP + Core AI)

## 1. Introducción y Objetivos

Este documento describe la estrategia general de pruebas para la Fase 1 del proyecto TalentIA. El objetivo principal de las pruebas en esta fase es **validar la funcionalidad MVP** del sistema integrado (ATS MVP + TalentIA Core AI), **asegurar un nivel adecuado de calidad y fiabilidad**, mitigar riesgos clave y **validar la efectividad y usabilidad** de la solución conjunta, en línea con los objetivos definidos en el PRD.

## 2. Alcance de las Pruebas

### 2.1. En Alcance (Fase 1)

* **ATS MVP:**
    * Funcionalidades CRUD de Vacantes (Crear, Editar, Cambiar Estado).
    * Configuración del sistema (Gestión de Usuarios, Etapas de Pipeline).
    * Autenticación y Autorización básica por roles.
    * Portal Público de Empleo (Listado de Vacantes).
    * Proceso de Aplicación de Candidatos (Formulario, Subida CV).
    * Recepción y almacenamiento de Candidaturas.
    * Visualización de Candidatos (Lista, Detalle, Kanban).
    * Visualización de resultados de IA (Score, Etapa Sugerida, Resumen).
    * Gestión del Pipeline (Movimiento manual de candidatos).
    * Captura de Feedback IA (Básico y Detallado).
    * Funcionalidades "Could Have" (Notificaciones, Búsqueda, Dashboard, Exportación) si se implementan.
* **TalentIA Core AI (Funcionalidad y Calidad):**
    * Generación de JD (Calidad y relevancia del contenido).
    * Almacenamiento de parámetros IA por vacante.
    * Gestión del Perfil Unificado `CandidatoIA`.
    * Parsing de CV (Precisión en extracción de skills, experiencia, educación).
    * Cálculo de Score (Consistencia, correlación inicial con evaluación manual).
    * Determinación de Etapa Sugerida (Corrección basada en score y configuración).
    * Generación de Resumen (Calidad y relevancia - Should Have).
    * Recepción y Almacenamiento de Feedback.
* **Integración:**
    * Comunicación API ATS MVP <-> Core AI (Según contrato TK-001).
    * Comunicación Core AI <-> Proveedor LLM Externo.
* **Requisitos No Funcionales (NFRs):**
    * Pruebas básicas de Rendimiento (según RNF-01 a RNF-06).
    * Pruebas básicas de Seguridad (según RNF-07 a RNF-14).
    * Evaluación de Usabilidad básica (según RNF-15 a RNF-19).
    * Fiabilidad (manejo de errores, backups básicos - RNF-20 a RNF-23B).

### 2.2. Fuera de Alcance (Fase 1)

* Integración con ATS externos (TeamTailor, etc.).
* Funcionalidades avanzadas de ATS no incluidas en el MVP (ej. onboarding, gestión avanzada de ofertas).
* Analíticas avanzadas y reporting complejo.
* Soporte multi-idioma avanzado (más allá del idioma principal definido).
* Pruebas de carga extensivas o pruebas de estrés más allá de validar RNF básicos.
* Pruebas exhaustivas de penetración de seguridad (se realizarán verificaciones básicas).
* Funcionalidades de extensión futura (Anexo II del PRD).

## 3. Niveles de Prueba

Se aplicarán los siguientes niveles de prueba:

* **Pruebas Unitarias:** Realizadas por los desarrolladores para verificar componentes individuales (funciones, métodos, clases) en aislamiento, tanto en el Backend (ATS y Core AI) como en el Frontend. Cobertura mínima objetivo: 70-80%.
* **Pruebas de Integración:**
    * Verificar la correcta comunicación y flujo de datos entre ATS MVP y los servicios de Core AI a través de la API interna (TK-001).
    * Verificar la interacción de Core AI con el Proveedor LLM externo.
    * Verificar la interacción de los servicios backend con las bases de datos.
* **Pruebas de Sistema / E2E (End-to-End):** Simular flujos de usuario completos basados en las User Stories para verificar la funcionalidad del sistema integrado como un todo (ej. desde creación de vacante hasta movimiento de candidato evaluado en pipeline).
* **Pruebas de API:** Probar directamente los endpoints API (ATS y Core AI) definidos en TK-001 usando herramientas como Postman/Insomnia o frameworks de automatización, verificando contratos, respuestas y códigos de estado.

## 4. Tipos de Prueba

* **Pruebas Funcionales:**
    * **Basadas en Requisitos:** Verificar cada RF y los criterios de aceptación de cada US.
    * **Basadas en Tareas Técnicas:** Usar los criterios de aceptación técnicos de los TKs para pruebas más granulares.
    * **Priorización:** Enfocarse primero en las features "Must Have", luego "Should Have", y finalmente "Could Have".
* **Pruebas No Funcionales:**
    * **Rendimiento:** Pruebas básicas de tiempos de respuesta para operaciones clave (RNF-01 a RNF-03) bajo carga simulada moderada (RNF-04).
    * **Seguridad:** Verificaciones de autenticación, autorización por roles, protección básica contra OWASP Top 10 (ej. SQL Injection, XSS), seguridad de API Keys (RNF-07 a RNF-14).
    * **Usabilidad:** Evaluación heurística de la interfaz del ATS y Portal, y feedback durante UAT (RNF-15 a RNF-19).
    * **Fiabilidad:** Pruebas de manejo de errores y validación del plan básico de backup/restore (RNF-20 a RNF-23B).
* **Pruebas de Regresión:** Ejecutar un conjunto definido de casos de prueba (manuales y/o automatizados) antes de cada release o cambio significativo para asegurar que no se han introducido nuevos defectos.
* **Pruebas de Aceptación de Usuario (UAT) / Piloto:** Realizadas por los usuarios finales definidos (Reclutadores, Hiring Managers internos) en un entorno controlado (Staging o Piloto) para validar la funcionalidad y usabilidad desde su perspectiva. El feedback recogido aquí será crucial (ver PRD Sec 13).

## 5. Estrategia de Automatización

* **Pruebas Unitarias:** Deben ser automatizadas por los desarrolladores como parte del proceso de desarrollo.
* **Pruebas de API:** Alta prioridad para automatización. Permiten validar la lógica de backend e integración Core AI de forma rápida y fiable.
* **Pruebas de Integración (API Layer):** Automatizar pruebas que verifiquen la comunicación ATS <-> Core AI.
* **Pruebas E2E:** Automatizar los flujos críticos principales (ej. login, crear vacante, aplicar, ver candidato evaluado, mover en pipeline) usando herramientas como Cypress, Selenium, Playwright.
* **Pruebas de Regresión:** El conjunto de pruebas automatizadas (Unit, API, E2E) formará la base de la suite de regresión.
* **Pruebas Manuales:** Necesarias para pruebas exploratorias, de usabilidad, validación inicial de nuevas features, y escenarios complejos difíciles de automatizar.

## 6. Enfoque Específico para Pruebas de IA (Core AI)

Dado que la validación de la IA es un objetivo clave, se requiere un enfoque específico:

* **Calidad de Datos de Entrada:** Usar un conjunto diverso y representativo de CVs (diferentes formatos, estructuras, calidades, idiomas si aplica aunque limitado en Fase 1) para probar el parsing (US-020).
* **Precisión de Parsing (RF-11):** Medir la precisión (Precision/Recall/F1) en la extracción de campos clave (skills, experiencia, educación) contra un conjunto de datos etiquetado manualmente (ground truth).
* **Calidad de Generación JD (RF-06):** Evaluación cualitativa por parte de Reclutadores/Expertos sobre la relevancia, coherencia y completitud de las JDs generadas para diferentes inputs.
* **Validación de Scoring (RF-12):**
    * **Consistencia:** Verificar que la misma entrada produce el mismo score.
    * **Correlación:** Comparar el ranking/score generado por la IA con una evaluación realizada por reclutadores expertos sobre un conjunto de candidatos de prueba. Medir correlación (ej. Spearman, Kendall Tau) o precisión en clasificación (ej. % acuerdo en Top-K).
    * **Análisis de Errores:** Investigar casos donde el score IA difiere significativamente de la evaluación humana para entender y mejorar el algoritmo.
* **Validación de Sugerencias:** Verificar que la `etapa_sugerida` (RF-12C) sea consistente con el `score` y el `evaluacion_corte` configurado.
* **Validación del Feedback:** Asegurar que el feedback enviado por el ATS (US-038) se almacena correctamente (US-039) y que existe un plan (aunque sea futuro) para utilizarlo en la mejora de modelos.

## 7. Entornos, Datos y Herramientas

* **Entornos:** Se necesitarán entornos separados para Desarrollo, QA/Staging (integración y pruebas) y Producción (para el Piloto inicial).
* **Datos de Prueba:** Se creará un conjunto de datos de prueba que incluya:
    * Usuarios con diferentes roles.
    * Vacantes con diferentes estados y configuraciones IA.
    * Un conjunto diverso de CVs (PDF, DOCX) con perfiles variados (diferentes niveles de experiencia, skills, formatos) para probar la IA. Algunos CVs tendrán "ground truth" para validación de parsing/scoring.
    * Candidaturas en diferentes etapas del pipeline.
* **Herramientas (Sugeridas):**
    * **Gestión de Casos de Prueba y Defectos:** Jira, TestRail, Xray, etc.
    * **Pruebas de API:** Postman, Insomnia, o frameworks de automatización (RestAssured, Karate).
    * **Automatización UI:** Cypress, Selenium, Playwright.
    * **Pruebas de Carga:** k6, JMeter (para pruebas básicas de NFRs).
    * **CI/CD:** Jenkins, GitLab CI, GitHub Actions (para ejecutar pruebas automatizadas).

## 8. Roles y Responsabilidades

* **Desarrolladores:** Pruebas unitarias, corrección de defectos, soporte en pruebas de integración.
* **Equipo QA / QA Lead:** Definición del plan detallado y casos de prueba, ejecución de pruebas manuales (funcionales, exploratorias, usabilidad), desarrollo y mantenimiento de pruebas automatizadas (API, E2E, Regresión), gestión de defectos, reporte de estado de calidad.
* **Product Owner / Stakeholders:** Participación en UAT, definición de criterios de aceptación, priorización de defectos.
* **Usuarios Piloto (Reclutadores, Managers):** Ejecución de UAT, proporcionar feedback cualitativo.

## 9. Criterios de Entrada y Salida

* **Criterios de Entrada (para iniciar ciclo de pruebas):** Build desplegado en entorno de pruebas, pruebas unitarias superadas, funcionalidades clave listas según plan de desarrollo.
* **Criterios de Salida (para release/piloto):** Todos los casos de prueba de alta prioridad ejecutados y superados, sin defectos críticos o bloqueantes abiertos, cobertura de pruebas definida alcanzada, UAT completada con éxito (o issues aceptados).

## 10. Gestión de Defectos

* Se utilizará una herramienta de seguimiento (ej. Jira).
* Los defectos se reportarán con información clara (pasos para reproducir, resultado esperado vs. actual, severidad, prioridad).
* Se realizarán reuniones periódicas de triaje de defectos para su priorización y asignación.
* Se realizará seguimiento hasta la resolución y verificación del defecto.

## 11. Planes de Prueba Detallados por Feature

A continuación se enlaza el desglose de la estrategia y casos de prueba específicos para los principales grupos de funcionalidades (features) identificados:

*   [Feature 7: Administración y Configuración del Sistema](./pp-feature-7.md)
*   [Feature 1: Gestión del Ciclo de Vida de la Vacante](./pp-feature-1.md)
*   [Feature 3: Portal de Empleo y Proceso de Aplicación](./pp-feature-3.md)
*   [Feature 2: Asistencia IA para Descripción de Puesto (JD)](./pp-feature-2.md)
*   [Feature 4: Evaluación Inteligente de Candidaturas](./pp-feature-4.md)
*   [Feature 5: Visualización y Gestión del Pipeline de Selección](./pp-feature-5.md)
*   [Feature 6: Sistema de Feedback para IA](./pp-feature-6.md)
*   [Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad](./pp-feature-8.md)
