# Definición de Arquitectura - TalentIA Core AI (Fase 1)

## 1. Introducción

Este documento detalla la definición de la arquitectura del componente **TalentIA Core AI** del proyecto TalentIA en su Fase 1. Se basa en la estructura y el enfoque de la documentación proporcionada para el ATS MVP ([PRD TalentIA FInal.md](../prd/PRD%20TalentIA%20FInal.md), [Features](../features/features-overview.md), [User Stories](../us/us-overview.md), [Technical Tasks](../tasks/tasks-overview.md), [Modelos de Datos](../db/db-overview.md), y [Planes de Prueba/Implementación](../pp/pp-overview.md)). TalentIA Core AI es la plataforma central de inteligencia artificial diseñada como un conjunto de servicios independientes para proporcionar capacidades analíticas y generativas avanzadas al [ATS MVP](../arq/ats_mvp_arq.md).

## 2. Alcance y Límites de TalentIA Core AI (Fase 1)

TalentIA Core AI se enfoca en proporcionar las funcionalidades de inteligencia artificial esenciales para potenciar el proceso de reclutamiento gestionado por el ATS MVP, tal como se define en el [PRD](../prd/PRD%20TalentIA%20FInal.md). Su alcance funcional en la Fase 1 incluye:

* **Generación Asistida de Descripciones de Puesto (JD):** Proporcionar borradores de JD basados en parámetros iniciales, utilizando LLMs externos ([RF-06](../rfs/rf-06-generar-contenido-jd-core-ai.md)). Incluye el almacenamiento de parámetros de evaluación IA específicos por vacante ([RF-06B](../rfs/rf-06b-almacenar-parametros-ia-jd-core-ai.md)). Ver [Feature 2](../features/feature-02-asistencia-ia-descripcion-puesto.md).
* **Creación/Actualización de Perfil Unificado de Candidato (`CandidatoIA`):** Mantener un registro único por candidato (basado en email) agregando referencias a todas sus candidaturas recibidas por el ATS MVP ([RF-09B](../rfs/rf-09b-crear-actualizar-candidato-ia-core-ai.md)). Ver [Feature 4](../features/feature-04-evaluacion-inteligente-candidaturas.md).
* **Evaluación Inteligente de Candidaturas:**
    * Procesamiento y análisis (parsing) de archivos CV (PDF, DOCX) para extraer datos estructurados (skills, experiencia, educación) ([RF-11](../rfs/rf-11-parsear-cv-core-ai.md)).
    * Cálculo de un score de idoneidad del candidato respecto a la vacante ([RF-12](../rfs/rf-12-calcular-score-idoneidad-core-ai.md)).
    * Comparación del score con el umbral de corte definido para la vacante ([RF-12B](../rfs/rf-12b-comparar-score-corte-core-ai.md)).
    * Determinación de una etapa inicial sugerida basada en la comparación ([RF-12C](../rfs/rf-12c-determinar-etapa-sugerida-core-ai.md)).
    * (Should Have) Generación de un resumen ejecutivo del candidato vs vacante ([RF-24](../rfs/rf-24-generar-resumen-candidato-core-ai.md)).
    * (Could Have) Consideración básica de soft skills ([RF-36](../rfs/rf-36-considerar-soft-skills-core-ai.md)).
    * Devolución de la evaluación completa (score, etapa sugerida, resumen opcional) al ATS MVP ([RF-13](../rfs/rf-13-devolver-evaluacion-core-ai.md)). Ver [Feature 4](../features/feature-04-evaluacion-inteligente-candidaturas.md).
* **Recepción y Almacenamiento de Feedback:** Recibir y guardar el feedback proporcionado por los usuarios del ATS MVP sobre las evaluaciones IA ([RF-20](../rfs/rf-20-recibir-almacenar-feedback-core-ai.md)). Ver [Feature 6](../features/feature-06-sistema-feedback-ia.md).

**Límites Clave:**

* **Interacción Exclusiva vía API Interna:** Core AI se comunica únicamente con el ATS MVP a través de la [API interna v1](../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md) ([RF-21](../rfs/rf-21-api-interna-ats-mvp-core-ai.md)). No expone interfaces directas a usuarios finales.
* **Dependencia de LLM Externo:** Core AI depende de la invocación a un proveedor externo de LLM ([RF-22](../rfs/rf-22-invocacion-proveedor-llm-core-ai.md)) para capacidades generativas y potencialmente de análisis avanzado.
* **Enfoque en Servicios de IA:** Se centra exclusivamente en proporcionar servicios de IA y gestión de datos asociados (perfiles unificados, evaluaciones, feedback), sin implementar lógica de workflow de reclutamiento (responsabilidad del ATS MVP).
* **Autonomía de Datos de IA:** Mantiene su propia base de datos ([db_core_ai.md](../db/db_core_ai.md)) para almacenar datos específicos (entidades `DescripcionPuestoGenerada`, `CandidatoIA`, `EvaluacionCandidatoIA`, `RegistroFeedbackIA`), vinculados al ATS MVP mediante IDs.

## 3. Patrón Arquitectónico General

Para TalentIA Core AI, se adopta un patrón arquitectónico de **Microservicios**. Este enfoque se justifica por (ver [PRD Sec 12.1](../prd/PRD%20TalentIA%20FInal.md#121-patrón-arquitectónico-general)):

* **Naturaleza Diversa:** Las tareas de IA (NLP, generación, scoring, gestión de perfiles, feedback) son distintas y pueden beneficiarse de tecnologías o modelos de datos específicos.
* **Escalabilidad Independiente:** Permite escalar servicios individuales (ej. evaluación) según la carga, sin afectar a otros ([RNF-05](../prd/PRD%20TalentIA%20FInal.md#rnf-05-escalabilidad-horizontal-de-core-ai)).
* **Flexibilidad Tecnológica:** Facilita el uso de stacks tecnológicos optimizados para cada tarea (ej. Java/Spring Boot como base, pero potencialmente otros lenguajes/frameworks para tareas específicas de ML si fuera necesario en el futuro).
* **Despliegue Independiente:** Permite actualizar o desplegar un servicio de IA sin requerir un redespliegue completo de toda la plataforma Core AI o del ATS MVP ([RNF-25](../prd/PRD%20TalentIA%20FInal.md#rnf-25-arquitectura-modular-y-desacoplada)).

Este enfoque contrasta con el Monolito Modular del [ATS MVP](../arq/ats_mvp_arq.md), resultando en la arquitectura **híbrida** definida para la solución TalentIA Fase 1.

## 4. Vista Lógica/Conceptual de TalentIA Core AI

TalentIA Core AI se estructura lógicamente en varios microservicios, cada uno encapsulando un Bounded Context específico dentro del dominio de IA para reclutamiento:

### 4.1. `Servicio de Generación JD` (`Generación de Contenido IA` BC)

* **Responsabilidad:** Gestionar la generación asistida de JDs y la configuración de parámetros IA asociados. Expone la API para [RF-06](../rfs/rf-06-generar-contenido-jd-core-ai.md) y [RF-06B](../rfs/rf-06b-almacenar-parametros-ia-jd-core-ai.md).
* **Relación con la Documentación:** Cubre [Feature 2](../features/feature-02-asistencia-ia-descripcion-puesto.md), [[US-15]](../us/us-15-generar-borrador-JD-IA.md), [[US-16]](../us/us-16-almacenar-parametros-evaluacion-IA-vacante.md), [[US-17]](../us/us-17-enriquecer-generacion-JD.md) (Should Have), [TK-055](../tasks/tk-055-CAI-BE-Implementar-API-Solicitud-Generacion-JD.md) a [TK-061](../tasks/tk-061-CAI-BE-Investigar-Implementar-Enriquecimiento-JD-Datos-Internos.md). Interactúa con el LLM Externo ([RF-22](../rfs/rf-22-invocacion-proveedor-llm-core-ai.md), [TK-057](../tasks/tk-057-CAI-BE-Implementar-Integracion-LLM-Externo.md)). Gestiona la entidad `DescripcionPuestoGenerada` ([db_core_ai.md](../db/db_core_ai.md)).

### 4.2. `Servicio Perfil Candidato` (`Perfil de Candidato` BC - parte Core AI)

* **Responsabilidad:** Crear y mantener el perfil unificado `CandidatoIA`, agregando las referencias a las candidaturas del ATS MVP ([RF-09B](../rfs/rf-09b-crear-actualizar-candidato-ia-core-ai.md)). Expone la API para consulta de historial ([RF-26B](../rfs/rf-26b-mostrar-historial-unificado-ats-mvp.md) - Should Have).
* **Relación con la Documentación:** Cubre [[US-18]](../us/us-18-gestionar-perfil-unidicado-candidato-IA.md), [TK-062](../tasks/tk-062-CAI-DB-Definir-Schema-CandidatoIA.md) a [TK-064](../tasks/tk-064-CAI-BE-Implementar-Logica-Upsert-CandidatoIA.md) y [[US-35]](../us/us-35-consultar-historial-aplicaciones-anteriores-candidato.md) (parte Core AI), [TK-119](../tasks/tk-119-CAI-BE-API-implementar-endpoint-obtener-detalles-candidato-ia.md), [TK-120](../tasks/tk-120-CAI-BE-Logic-implementar-logica-negocio-obtener-detalles-candidato-ia.md). Gestiona la entidad `CandidatoIA` ([db_core_ai.md](../db/db_core_ai.md)).

### 4.3. `Servicio de Evaluación de Candidatos` (`Evaluación IA` BC)

* **Responsabilidad:** Orquestar el proceso completo de evaluación de una candidatura: recibir la solicitud ([RF-10](../rfs/rf-10-invocar-evaluacion-ia.md)), obtener el CV, realizar el parsing ([RF-11](../rfs/rf-11-parsear-cv-core-ai.md)), calcular el score ([RF-12](../rfs/rf-12-calcular-score-idoneidad-core-ai.md)), comparar con el corte ([RF-12B](../rfs/rf-12b-comparar-score-corte-core-ai.md)), determinar etapa sugerida ([RF-12C](../rfs/rf-12c-determinar-etapa-sugerida-core-ai.md)), generar resumen opcional ([RF-24](../rfs/rf-24-generar-resumen-candidato-core-ai.md)), y devolver el resultado ([RF-13](../rfs/rf-13-devolver-evaluacion-core-ai.md)).
* **Relación con la Documentación:** Cubre [Feature 4](../features/feature-04-evaluacion-inteligente-candidaturas.md), [[US-19]](../us/us-19-invocar-evaluacion-ia-nueva-candidatura.md) a [[US-26]](../us/us-26-identificar-evaluar-soft-skills-cv-core-ai.md), [TK-065](../tasks/tk-065-CAI-BE-Implementar-API-Recibir-Solicitud-Evaluacion.md) a [TK-080](../tasks/tk-080-CAI-BE-Investigar-Implementar-Identificacion-Soft-Skills.md). Interactúa con el LLM Externo ([RF-22](../rfs/rf-22-invocacion-proveedor-llm-core-ai.md)). Gestiona la entidad `EvaluacionCandidatoIA` ([db_core_ai.md](../db/db_core_ai.md)). Depende de `Servicio Generación JD` (para obtener parámetros IA) y `Servicio Perfil Candidato` (para vincular con `CandidatoIA`).

### 4.4. `Servicio de Feedback y Aprendizaje` (`Feedback y Aprendizaje IA` BC)

* **Responsabilidad:** Recibir y almacenar el feedback de los usuarios sobre las evaluaciones IA ([RF-20](../rfs/rf-20-recibir-almacenar-feedback-core-ai.md)). Proporciona la base de datos para los procesos (potencialmente offline/batch) de re-entrenamiento o ajuste de los modelos de IA.
* **Relación con la Documentación:** Cubre [Feature 6](../features/feature-06-sistema-feedback-ia.md), [[US-39]](../us/us-39-recibir-almacenar-feedback-usuario-core-ai.md), [TK-134](../tasks/tk-134-CAI-BE-API-asegurar-definir-endpoint-coreai-recibir-feedback.md) a [TK-136](../tasks/tk-136-CAI-BE-Logic-implementar-logica-negocio-validar-almacenar-feedback.md). Gestiona la entidad `RegistroFeedbackIA` ([db_core_ai.md](../db/db_core_ai.md)).

### 4.5. `Gateway API Core AI` (Opcional pero Recomendado)

* **Responsabilidad:** Punto de entrada único para las llamadas desde el ATS MVP. Enruta las peticiones a los microservicios internos correspondientes. Podría gestionar la autenticación/autorización interna, limitación de tasa (rate limiting) y centralizar parte de la observabilidad (logging, tracing).
* **Relación con la Documentación:** Implementa el contrato de la [API interna v1](../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md) ([RF-21](../rfs/rf-21-api-interna-ats-mvp-core-ai.md)) y facilita futuras integraciones ([RNF-28](../prd/PRD%20TalentIA%20FInal.md#rnf-28-preparación-para-integraciones-futuras)).

## 5. Vista Detallada de Módulos (Microservicios)

Esta sección detalla la responsabilidad y componentes clave de cada microservicio propuesto.

### 5.1. `Servicio de Generación JD`

* **Entrada API:** Petición desde ATS con datos básicos de vacante y/o parámetros IA.
* **Salida API:** JD generada (texto) y/o confirmación de guardado de parámetros.
* **Componentes Internos:**
    * Controlador API (para [TK-055](../tasks/tk-055-CAI-BE-Implementar-API-Solicitud-Generacion-JD.md), [TK-059](../tasks/tk-059-CAI-BE-Implementar-API-Guardar-Params-IA.md)).
    * Servicio de Prompt Engineering ([TK-056](../tasks/tk-056-CAI-BE-Implementar-Logica-Prompt-Engineering-JD.md), [TK-061](../tasks/tk-061-CAI-BE-Investigar-Implementar-Enriquecimiento-JD-Datos-Internos.md)).
    * Cliente LLM (reutiliza o invoca [TK-057](../tasks/tk-057-CAI-BE-Implementar-Integracion-LLM-Externo.md)).
    * Manejador de Respuesta LLM ([TK-058](../tasks/tk-058-CAI-BE-Implementar-Manejo-Respuesta-LLM.md)).
    * Repositorio para `DescripcionPuestoGenerada` ([TK-060](../tasks/tk-060-CAI-BE-Implementar-Logica-Guardar-Params-IA.md)).
* **Dependencias:** LLM Externo, BBDD Core AI (Relacional).

### 5.2. `Servicio Perfil Candidato`

* **Entrada API:** Petición desde ATS para crear/actualizar perfil (con email, id_candidatura), Petición desde ATS para obtener perfil/historial (con email).
* **Salida API:** Confirmación OK, Detalles `CandidatoIA` (incl. `candidaturas_ids`).
* **Componentes Internos:**
    * Controlador API (para [TK-063](../tasks/tk-063-CAI-BE-Implementar-API-Upsert-CandidatoIA.md), [TK-119](../tasks/tk-119-CAI-BE-API-implementar-endpoint-obtener-detalles-candidato-ia.md)).
    * Servicio de Lógica de Negocio (Upsert [TK-064](../tasks/tk-064-CAI-BE-Implementar-Logica-Upsert-CandidatoIA.md), Get [TK-120](../tasks/tk-120-CAI-BE-Logic-implementar-logica-negocio-obtener-detalles-candidato-ia.md)).
    * Repositorio para `CandidatoIA`.
* **Dependencias:** BBDD Core AI (Relacional o Documental).

### 5.3. `Servicio de Evaluación de Candidatos`

* **Entrada API:** Petición desde ATS con IDs (Candidatura, Vacante, CV).
* **Salida API:** Evaluación completa (Score, Etapa Sugerida, Resumen opcional).
* **Componentes Internos:**
    * Controlador API ([TK-065](../tasks/tk-065-CAI-BE-Implementar-API-Recibir-Solicitud-Evaluacion.md)).
    * Servicio Orquestador de Evaluación ([TK-066](../tasks/tk-066-CAI-BE-Implementar-Logica-Iniciar-Evaluacion.md)).
    * Cliente/Servicio de Acceso a Archivos ([TK-067](../tasks/tk-067-CAI-BE-Obtener-Contenido-Archivo-CV.md)).
    * Servicio de Extracción de Texto ([TK-068](../tasks/tk-068-CAI-BE-Extraer-Texto-PDF-DOCX.md)).
    * Servicio de Parsing NLP/LLM ([TK-069](../tasks/tk-069-CAI-BE-Implementar-Parsing-Texto-CV.md), [TK-080](../tasks/tk-080-CAI-BE-Investigar-Implementar-Identificacion-Soft-Skills.md)).
    * Servicio de Recuperación de Inputs (Params JD, Datos CV) ([TK-071](../tasks/tk-071-CAI-BE-Recuperar-Inputs-Scoring.md)).
    * Servicio de Scoring ([TK-072](../tasks/tk-072-CAI-BE-Implementar-Algoritmo-Scoring-v1.md)).
    * Servicio de Decisión (Comparación, Sugerencia Etapa) ([TK-074](../tasks/tk-074-CAI-BE-Implementar-Logica-Comparacion-Score.md), [TK-075](../tasks/tk-075-CAI-BE-Implementar-Logica-Determinar-Etapa-Sugerida.md)).
    * Servicio de Generación de Resumen ([TK-077](../tasks/tk-077-CAI-BE-Implementar-Logica-Prompt-Engineering-Resumen.md), [TK-078](../tasks/tk-078-CAI-BE-Implementar-Orquestacion-LLM-Generacion-Resumen.md)).
    * Cliente LLM (reutiliza o invoca [TK-057](../tasks/tk-057-CAI-BE-Implementar-Integracion-LLM-Externo.md)).
    * Repositorio para `EvaluacionCandidatoIA` ([TK-070](../tasks/tk-070-CAI-BE-Implementar-Almacenamiento-Datos-Parseados-CV.md), [TK-073](../tasks/tk-073-CAI-BE-Implementar-Almacenamiento-Scores.md), [TK-079](../tasks/tk-079-CAI-BE-Implementar-Almacenamiento-Resumen-Generado.md)).
    * Servicio de Formateo Respuesta ([TK-076](../tasks/tk-076-CAI-BE-Implementar-Formateo-Retorno-Respuesta-Evaluacion.md)).
* **Dependencias:** LLM Externo, BBDD Core AI (Relacional y/o NoSQL), otros servicios Core AI (`Servicio Generación JD` para parámetros, `Servicio Perfil Candidato` para `candidato_ia_id`).

### 5.4. `Servicio de Feedback y Aprendizaje`

* **Entrada API:** Petición desde ATS con datos de feedback.
* **Salida API:** Confirmación OK.
* **Componentes Internos:**
    * Controlador API ([TK-134](../tasks/tk-134-CAI-BE-API-asegurar-definir-endpoint-coreai-recibir-feedback.md) - define endpoint).
    * Servicio de Validación y Almacenamiento ([TK-136](../tasks/tk-136-CAI-BE-Logic-implementar-logica-negocio-validar-almacenar-feedback.md)).
    * Repositorio para `RegistroFeedbackIA` ([TK-135](../tasks/tk-135-CAI-DB-definir-schema-bbdd-entidad-registrofeedbackia.md)).
    * (Fuera de alcance Fase 1) Componentes para re-entrenamiento/ajuste de modelos.
* **Dependencias:** BBDD Core AI (Relacional).

## 6. Vista de Procesos (Flujos Clave)

Los flujos de procesos detallados que ilustran la interacción entre los microservicios de Core AI, el ATS MVP y los sistemas externos se encuentran documentados mediante diagramas de secuencia en la Sección 7.2 del [PRD TalentIA FInal.md](../prd/PRD%20TalentIA%20FInal.md). Los flujos principales son:

* **Generación de JD y Configuración IA:** Iniciado por el Reclutador en ATS MVP, involucra al `Servicio de Generación JD` y al LLM Externo ([Ver UC1](../prd/PRD%20TalentIA%20FInal.md#uc1-gestionar-vacante-y-generar-descripción-jd-con-ia)).
* **Recepción y Evaluación de Candidatura:** Iniciado por el ATS MVP tras una aplicación, involucra al `Servicio Perfil Candidato` y al `Servicio de Evaluación de Candidatos` (que a su vez puede llamar al LLM Externo y consultar parámetros del `Servicio Generación JD`) ([Ver UC3](../prd/PRD%20TalentIA%20FInal.md#uc3-recepcionar-y-evaluar-candidatura-con-ia)).
* **Consulta de Historial Unificado:** Iniciado por el ATS MVP al ver el detalle, involucra la consulta al `Servicio Perfil Candidato` ([Ver UC4 - parte historial](../prd/PRD%20TalentIA%20FInal.md#uc4-revisar-candidatos-y-gestionar-pipeline)).
* **Procesamiento de Feedback:** Iniciado por el usuario en ATS MVP, el ATS MVP envía la información al `Servicio de Feedback y Aprendizaje` ([Ver UC5](../prd/PRD%20TalentIA%20FInal.md#uc5-proporcionar-feedback-a-ia)).

## 7. Vista de Datos (Core AI)

La estructura detallada de las entidades gestionadas por TalentIA Core AI (`DescripcionPuestoGenerada`, `CandidatoIA`, `EvaluacionCandidatoIA`, `RegistroFeedbackIA`) se encuentra en la [documentación de la Base de Datos Core AI](../db/db-overview.md#2-base-de-datos-talentia-core-ai). Se contempla un enfoque de persistencia políglota, utilizando PostgreSQL para datos estructurados y potencialmente MongoDB para datos semi-estructurados como los extraídos del CV (`datos_extraidos_cv`).

## 8. Vista de Desarrollo (Development View)

* **Tecnologías:** Java + Spring Boot como stack principal propuesto. Uso de librerías específicas de Java para NLP (si aplica), interacción con LLMs (APIs REST), ORM (Spring Data JPA), ODM (Spring Data MongoDB).
* **Organización del Código:** Cada microservicio tendrá su propio repositorio Git (o módulo Maven/Gradle si se prefiere un monorepo gestionado) siguiendo una estructura estándar de Spring Boot (controladores, servicios, repositorios).
* **Comunicación Inter-Servicios:** Implementada mediante clientes REST (ej. Spring Cloud OpenFeign) o potencialmente mensajes asíncronos.
* **Testing:**
    * Pruebas Unitarias (JUnit, Mockito) para lógica de negocio y componentes.
    * Pruebas de Integración (Spring Boot Test, Testcontainers) para verificar interacción con BBDD y otros servicios (mocks o reales en entorno de prueba).
    * Pruebas de Contrato (Pact, Spring Cloud Contract) para asegurar la compatibilidad de las APIs internas.
    * Pruebas específicas de IA (validación de parsing, scoring, generación - ver [Plan de Pruebas](../pp/pp-overview.md)).
* **CI/CD:** Pipelines de Integración Continua y Despliegue Continuo independientes para cada microservicio, automatizando build (Maven/Gradle), pruebas y despliegue en contenedores Docker.
* **Mejores Prácticas:** Adherencia a las [Mejores Prácticas para Core AI](../best_practices/bp_core_ai.md) y [Bases de Datos Core AI](../best_practices/bp_core_ai_db.md).

## 9. Estructura Propuesta de Carpetas y Archivos (Ejemplo para un Microservicio)

```text
/core-ai-evaluacion-service/ # Ejemplo para Servicio de Evaluación
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/talentia/coreai/evaluation/
│   │   │       ├── EvaluationApplication.java # Punto de entrada Spring Boot
│   │   │       ├── config/             # Configuración (Beans, Security, DB)
│   │   │       ├── controller/         # API Controllers (REST) [TK-065]
│   │   │       ├── service/            # Lógica de Negocio [TK-066, TK-067, TK-068, TK-069, TK-071, TK-072, TK-074, TK-075, TK-077, TK-078]
│   │   │       ├── repository/         # Acceso a Datos (Spring Data JPA/Mongo) [TK-070, TK-073, TK-079]
│   │   │       ├── client/             # Clientes para otros servicios (LLM, otros Core AI) [TK-057]
│   │   │       ├── domain/             # Entidades y Value Objects
│   │   │       └── dto/                # Data Transfer Objects para API
│   │   └── resources/
│   │       ├── application.properties  # Configuración Spring
│   │       └── db/migration/       # Migraciones SQL (si usa relacional con Flyway/Liquibase)
│   └── test/
│       └── java/
│           └── com/talentia/coreai/evaluation/ # Pruebas Unitarias e Integración
├── pom.xml                     # Dependencias Maven (o build.gradle)
├── Dockerfile                  # Para construir imagen Docker
└── README.md
```

### 10. Vista Física / Despliegue (Physical / Deployment View)

Esta sección describe cómo se espera que los microservicios de TalentIA Core AI sean desplegados en los diferentes entornos (desarrollo, staging, producción).

* **Contenerización:** Cada microservicio se empaquetará como un contenedor **Docker** individual. Esto asegura la consistencia del entorno y facilita el despliegue. Ver [bp_core_ai.md](../best_practices/bp_core_ai.md) y [bp_general.md](../best_practices/bp_general.md).
* **Orquestación:** Se recomienda utilizar un orquestador de contenedores como **Kubernetes** para gestionar el ciclo de vida de los microservicios (despliegue, escalado, auto-reparación, balanceo de carga). Esto es coherente con [RNF-05](../prd/PRD%20TalentIA%20FInal.md#rnf-05-escalabilidad-horizontal-de-core-ai) y [RNF-26](../prd/PRD%20TalentIA%20FInal.md#rnf-26-automatización-de-despliegues-cicd).
* **Entornos:** Se definirán entornos separados para Desarrollo, Pruebas/QA/Staging y Producción. La configuración específica de cada microservicio (ej. URLs de BBDD, API Keys de LLM) se gestionará por entorno (ej. mediante variables de entorno o un servidor de configuración si se usa Spring Cloud Config).
* **Infraestructura:** El despliegue se realizará preferiblemente en una plataforma cloud que ofrezca servicios gestionados de Kubernetes y bases de datos (ej. AWS EKS, GCP GKE, Azure AKS; AWS RDS, MongoDB Atlas). *Nota: La elección específica de proveedor cloud y servicios gestionados está pendiente de definición.*
* **Red:** Configuración de red segura dentro del clúster Kubernetes para permitir la comunicación entre microservicios, el Gateway API (si existe) y las bases de datos, así como la comunicación segura con el ATS MVP y el proveedor LLM externo.

*[Detalles adicionales sobre topología de red, estrategias de despliegue (Blue/Green, Canary), y configuración específica de infraestructura se añadirán cuando estén definidos.]*

## 11. Requisitos No Funcionales Clave (Resumen para Core AI)

Los requisitos no funcionales (NFRs) definen las cualidades del sistema Core AI. Los NFRs completos para la Fase 1 se detallan en la [Sección 9 del PRD TalentIA FInal.md](../prd/PRD%20TalentIA%20FInal.md#9-requisitos-no-funcionales-rnf). A continuación, se resumen los NFRs clave con mayor relevancia directa para la arquitectura e implementación de TalentIA Core AI:

* **Rendimiento y Escalabilidad:**
    * **[RNF-02](../prd/PRD%20TalentIA%20FInal.md#rnf-02-latencia-de-generación-de-jd-asistida-por-ia): Latencia de Generación de JD Asistida por IA:** < 15 segundos (p90).
    * **[RNF-03](../prd/PRD%20TalentIA%20FInal.md#rnf-03-latencia-de-evaluación-de-candidatura-por-ia): Latencia de Evaluación de Candidatura por IA:** < 2 minutos (p90).
    * **[RNF-05](../prd/PRD%20TalentIA%20FInal.md#rnf-05-escalabilidad-horizontal-de-core-ai): Escalabilidad Horizontal de Core AI:** Los servicios deben poder escalar horizontalmente de forma independiente.
    * **[RNF-06](../prd/PRD%20TalentIA%20FInal.md#rnf-06-capacidad-de-volumen-de-datos-fase-1): Capacidad de Volumen de Datos:** Soportar el volumen esperado en Fase 1 sin degradación.
* **Seguridad:**
    * **[RNF-09](../prd/PRD%20TalentIA%20FInal.md#rnf-09-cifrado-de-datos-en-tránsito): Cifrado de Datos en Tránsito:** TLS 1.2+ para toda comunicación.
    * **[RNF-10](../prd/PRD%20TalentIA%20FInal.md#rnf-10-cifrado-de-datos-sensibles-en-reposo): Cifrado de Datos Sensibles en Reposo:** PII de candidatos y datos sensibles en BBDD Core AI deben estar cifrados.
    * **[RNF-11](../prd/PRD%20TalentIA%20FInal.md#rnf-11-gestión-segura-de-api-keys-externas): Gestión Segura de API Keys Externas:** API Key del LLM gestionada de forma segura.
    * **[RNF-13](../prd/PRD%20TalentIA%20FInal.md#rnf-13-gestión-segura-de-secretos-internos): Gestión Segura de Secretos Internos:** Credenciales de BBDD, claves de autenticación interna.
    * **[RNF-14](../prd/PRD%20TalentIA%20FInal.md#rnf-14-registro-de-auditoría-de-seguridad): Registro de Auditoría de Seguridad:** Logging de eventos de seguridad relevantes en Core AI.
* **Usabilidad y Accesibilidad:**
    * **[RNF-17](../prd/PRD%20TalentIA%20FInal.md#rnf-17-transparencia-de-la-ia): Transparencia de la IA:** Core AI debe devolver información que permita al ATS MVP explicar las sugerencias/scores.
* **Fiabilidad y Disponibilidad:**
    * **[RNF-20](../prd/PRD%20TalentIA%20FInal.md#rnf-20-disponibilidad-del-servicio-ats-mvp): Disponibilidad del Servicio:** Core AI debe tener una disponibilidad igual o superior al ATS MVP (99.5% en horario laboral) para no ser el cuello de botella.
    * **[RNF-21](../prd/PRD%20TalentIA%20FInal.md#rnf-21-manejo-robusto-de-errores): Manejo Robusto de Errores:** Gestión controlada de errores internos y de comunicación.
    * **[RNF-22](../prd/PRD%20TalentIA%20FInal.md#rnf-22-política-de-copias-de-seguridad-y-recuperación): Política de Copias de Seguridad y Recuperación:** Backups y plan de recuperación para BBDD(s) de Core AI.
    * **[RNF-23](../prd/PRD%20TalentIA%20FInal.md#rnf-23-resiliencia-del-procesamiento-ia): Resiliencia del Procesamiento IA:** Manejo de fallos de dependencias (ej. LLM externo) con patrones como Circuit Breaker/Retry.
    * **[RNF-23B](../prd/PRD%20TalentIA%20FInal.md#rnf-23b-consistencia-de-datos-entre-componentes): Consistencia de Datos entre Componentes:** Mantener integridad referencial con ATS MVP.
* **Mantenibilidad y Extensibilidad:**
    * **[RNF-24](../prd/PRD%20TalentIA%20FInal.md#rnf-24-calidad-y-documentación-del-código): Calidad y Documentación del Código:** Código modular, legible, documentado.
    * **[RNF-25](../prd/PRD%20TalentIA%20FInal.md#rnf-25-arquitectura-modular-y-desacoplada): Arquitectura Modular y Desacoplada:** Diseño de microservicios que facilita evolución.
    * **[RNF-26](../prd/PRD%20TalentIA%20FInal.md#rnf-26-automatización-de-despliegues-cicd): Automatización de Despliegues (CI/CD):** Pipelines independientes por microservicio.
    * **[RNF-27](../prd/PRD%20TalentIA%20FInal.md#rnf-27-versionado-y-contrato-de-api-interna): Versionado y Contrato de API Interna:** API interna versionada ([TK-001](../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md)).
    * **[RNF-28](../prd/PRD%20TalentIA%20FInal.md#rnf-28-preparación-para-integraciones-futuras): Preparación para Integraciones Futuras:** Diseño que permita conectar con ATS externos.
* **Cumplimiento Normativo:**
    * **[RNF-29](../prd/PRD%20TalentIA%20FInal.md#rnf-29-cumplimiento-gdpr/lopdgdd): Cumplimiento GDPR/LOPDGDD:** Tratamiento seguro y legal de datos de candidatos en Core AI.
    * **[RNF-30](../prd/PRD%20TalentIA%20FInal.md#rnf-30-transparencia-en-el-uso-de-ia): Transparencia en el Uso de IA:** Proveer información para explicar las decisiones de IA.

---