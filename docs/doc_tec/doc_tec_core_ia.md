# Documentación Técnica - TalentIA Core AI (Fase 1)

Este documento proporciona una guía técnica de referencia para el desarrollo de los microservicios que componen **TalentIA Core AI** en la Fase 1 del proyecto TalentIA. Detalla la arquitectura de microservicios, las tecnologías propuestas, los patrones de diseño y las mejores prácticas a seguir.

## 1. Arquitectura Core AI

TalentIA Core AI se implementa siguiendo un patrón arquitectónico de **Microservicios**, tal como se describe en la [Definición de Arquitectura de Core AI](../arq/arq_core_ia.md#3-patrón-arquitectónico-general). Este enfoque permite la escalabilidad, el desarrollo y el despliegue independiente de las diferentes capacidades de IA.

* **Servicios Propuestos (Fase 1):**
    * `Servicio de Generación JD`: Gestión de JDs asistidas por IA y parámetros de evaluación asociados. ([Ver detalle](../arq/arq_core_ia.md#51-servicio-de-generación-jd))
    * `Servicio Perfil Candidato`: Gestión del perfil unificado `CandidatoIA`. ([Ver detalle](../arq/arq_core_ia.md#52-servicio-perfil-candidato))
    * `Servicio de Evaluación de Candidatos`: Orquestación del parsing de CV, scoring y sugerencia de etapa. ([Ver detalle](../arq/arq_core_ia.md#53-servicio-de-evaluación-de-candidatos))
    * `Servicio de Feedback y Aprendizaje`: Recepción y almacenamiento de feedback de usuario. ([Ver detalle](../arq/arq_core_ia.md#54-servicio-de-feedback-y-aprendizaje))
    * `Gateway API Core AI` (Opcional pero recomendado): Punto de entrada único para el ATS MVP. ([Ver detalle](../arq/arq_core_ia.md#45-gateway-api-core-ai-opcional-pero-recomendado))
* **Comunicación:**
    * **ATS MVP <-> Core AI:** APIs RESTful síncronas a través del Gateway (o directamente), definidas por la [API Interna v1](../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md) ([RF-21](../rfs/rf-21-api-interna-ats-mvp-core-ai.md)).
    * **Inter-Servicios (Core AI):** APIs RESTful internas síncronas (ej. Evaluación consulta parámetros a Generación JD). Considerar mensajería asíncrona (RabbitMQ/Kafka) para tareas futuras o desacoplamiento.
    * **Core AI -> LLM Externo:** APIs RESTful HTTPS ([RF-22](../rfs/rf-22-invocacion-proveedor-llm-core-ai.md)).

## 2. Tecnologías Clave de Core AI

Se propone el siguiente stack tecnológico, sujeto a la experiencia y decisión final del equipo:

* **Lenguaje y Framework:** **Java + Spring Boot** (para aprovechar el ecosistema maduro de Java, las herramientas de Spring y la experiencia potencial del equipo).
* **Base de Datos:** Persistencia **Políglota** recomendada:
    * **PostgreSQL:** Para datos estructurados (entidades principales, relaciones, configuración, feedback estructurado - ver [db_core_ai.md](../db/db_core_ai.md)).
    * **(Opcional) MongoDB:** Para datos semi-estructurados o variables (ej. `datos_extraidos_cv` en `EvaluacionCandidatoIA`, `perfil_enriquecido` en `CandidatoIA` - ver [db_core_ai.md](../db/db_core_ai.md)).
* **ORM/ODM:** Spring Data JPA (para PostgreSQL), Spring Data MongoDB (para MongoDB).
* **Comunicación API Interna:** Spring MVC / WebFlux.
* **Comunicación Inter-Servicios:** Spring Cloud OpenFeign (para clientes REST declarativos).
* **Comunicación Externa (LLM):** Clientes HTTP estándar (RestTemplate, WebClient de Spring) o SDK del proveedor LLM si existe.
* **Gateway API (Opcional):** Spring Cloud Gateway.
* **Autenticación Interna:** Mecanismo basado en tokens (JWT) o API Keys compartidas, gestionado por el Gateway o directamente por los servicios.
* **Contenerización:** Docker.
* **Orquestación:** Kubernetes.
* **Calidad de Código:** Checkstyle, PMD, SonarQube (integrado en CI).
* **Testing:** JUnit 5, Mockito, Spring Boot Test, Testcontainers (para pruebas de integración con BBDD), Pact/Spring Cloud Contract (para pruebas de contrato API).
* **Build:** Maven o Gradle.
* **Monitorización:** Micrometer con Prometheus, Grafana.
* **Logging:** SLF4J con Logback/Log4j2, idealmente con logs estructurados (JSON).

## 3. Módulos Lógicos (Microservicios) y Responsabilidades

* **`Servicio de Generación JD`:** Implementa [RF-06](../rfs/rf-06-generar-contenido-jd-core-ai.md), [RF-06B](../rfs/rf-06b-almacenar-parametros-ia-jd-core-ai.md), [RF-23](../rfs/rf-23-usar-datos-internos-jd-core-ai.md) (Should Have). Gestiona `DescripcionPuestoGenerada`. Tareas: [TK-055](../tasks/tk-055-CAI-BE-Implementar-API-Solicitud-Generacion-JD.md) - [TK-061](../tasks/tk-061-CAI-BE-Investigar-Implementar-Enriquecimiento-JD-Datos-Internos.md).
* **`Servicio Perfil Candidato`:** Implementa [RF-09B](../rfs/rf-09b-crear-actualizar-candidato-ia-core-ai.md), [RF-26B](../rfs/rf-26b-mostrar-historial-unificado-ats-mvp.md) (Should Have). Gestiona `CandidatoIA`. Tareas: [TK-062](../tasks/tk-062-CAI-DB-Definir-Schema-CandidatoIA.md) - [TK-064](../tasks/tk-064-CAI-BE-Implementar-Logica-Upsert-CandidatoIA.md), [TK-119](../tasks/tk-119-CAI-BE-API-implementar-endpoint-obtener-detalles-candidato-ia.md), [TK-120](../tasks/tk-120-CAI-BE-Logic-implementar-logica-negocio-obtener-detalles-candidato-ia.md).
* **`Servicio de Evaluación de Candidatos`:** Implementa [RF-11](../rfs/rf-11-parsear-cv-core-ai.md) a [RF-13](../rfs/rf-13-devolver-evaluacion-core-ai.md), [RF-24](../rfs/rf-24-generar-resumen-candidato-core-ai.md) (Should Have), [RF-36](../rfs/rf-36-considerar-soft-skills-core-ai.md) (Could Have). Gestiona `EvaluacionCandidatoIA`. Tareas: [TK-065](../tasks/tk-065-CAI-BE-Implementar-API-Recibir-Solicitud-Evaluacion.md) - [TK-080](../tasks/tk-080-CAI-BE-Investigar-Implementar-Identificacion-Soft-Skills.md).
* **`Servicio de Feedback y Aprendizaje`:** Implementa [RF-20](../rfs/rf-20-recibir-almacenar-feedback-core-ai.md). Gestiona `RegistroFeedbackIA`. Tareas: [TK-134](../tasks/tk-134-CAI-BE-API-asegurar-definir-endpoint-coreai-recibir-feedback.md) - [TK-136](../tasks/tk-136-CAI-BE-Logic-implementar-logica-negocio-validar-almacenar-feedback.md).
* **`Gateway API Core AI`:** Implementa parte de [RF-21](../rfs/rf-21-api-interna-ats-mvp-core-ai.md). Enruta peticiones y gestiona aspectos transversales.

## 4. Patrones y Mejores Prácticas de Desarrollo Core AI

* **Diseño de API Interna:**
    * Seguir la especificación [OpenAPI v3.x definida en TK-001](../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md).
    * Utilizar RESTful, JSON, versionado (`/api/v1`).
    * Documentar con Swagger UI (integrado en Spring Boot).
* **Implementación de Lógica de IA:**
    * **Prompt Engineering:** Diseño iterativo de prompts ([TK-056](../tasks/tk-056-CAI-BE-Implementar-Logica-Prompt-Engineering-JD.md), [TK-077](../tasks/tk-077-CAI-BE-Implementar-Logica-Prompt-Engineering-Resumen.md)). Considerar almacenar prompts en configuración o base de datos para flexibilidad.
    * **Parsing CV:** Elegir librerías robustas (Apache Tika, PDFBox/POI) o utilizar LLMs para extracción ([TK-068](../tasks/tk-068-CAI-BE-Extraer-Texto-PDF-DOCX.md), [TK-069](../tasks/tk-069-CAI-BE-Implementar-Parsing-Texto-CV.md)). Enfocarse en la precisión (KPIs - [PRD Sec 13](../prd/PRD%20TalentIA%20FInal.md#1313-métricas-de-calidad-de-ia-piloto)).
    * **Scoring:** Implementar algoritmo basado en reglas V1 ([TK-072](../tasks/tk-072-CAI-BE-Implementar-Algoritmo-Scoring-v1.md)). Hacerlo configurable (pesos, criterios) para facilitar ajustes basados en feedback.
    * **Evaluación:** Orquestar el flujo completo de forma clara ([TK-066](../tasks/tk-066-CAI-BE-Implementar-Logica-Iniciar-Evaluacion.md)).
* **Acceso a Datos (Persistencia Políglota):**
    * Utilizar Spring Data JPA/MongoDB según corresponda.
    * Encapsular la lógica de acceso en Repositorios.
    * Manejar transacciones donde aplique (dentro de BBDD relacional).
    * Referirse a [bp_core_ai_db.md](../best_practices/bp_core_ai_db.md).
* **Autenticación/Autorización Interna:** Implementar el mecanismo acordado (JWT/API Key) para proteger los endpoints de Core AI.
* **Integración con LLM Externo:**
    * Cliente HTTP centralizado y robusto ([TK-057](../tasks/tk-057-CAI-BE-Implementar-Integracion-LLM-Externo.md)).
    * Gestión segura de API Key ([RNF-11](../prd/PRD%20TalentIA%20FInal.md#rnf-11-gestión-segura-de-api-keys-externas)).
    * Manejo de errores y reintentos ([RNF-21](../prd/PRD%20TalentIA%20FInal.md#rnf-21-manejo-robusto-de-errores)).
    * Parseo y manejo de la respuesta del LLM ([TK-058](../tasks/tk-058-CAI-BE-Implementar-Manejo-Respuesta-LLM.md)).
* **Seguridad General:**
    * Validación de entrada en todos los endpoints.
    * Protección de datos (GDPR - [RNF-29](../prd/PRD%20TalentIA%20FInal.md#rnf-29-cumplimiento-gdpr/lopdgdd)).
    * Gestión segura de secretos ([RNF-13](../prd/PRD%20TalentIA%20FInal.md#rnf-13-gestión-segura-de-secretos-internos)).
    * OWASP Top 10.
* **Manejo de Errores y Logging:**
    * Estrategia consistente para errores inter-servicio y externos.
    * Logging estructurado (JSON) y centralizado. Incluir IDs de correlación para tracing.
* **Resiliencia y Escalabilidad:**
    * Diseño stateless donde sea posible.
    * Uso de patrones (Circuit Breaker, Retry).
    * Configuración para escalado horizontal en Kubernetes.

## 5. Base de Datos (PostgreSQL y/o MongoDB)

Referirse a la documentación específica:
* [Esquema Core AI](../db/db_core_ai.md)
* [Mejores Prácticas Base de Datos Core AI](../best_practices/bp_core_ai_db.md)

## 6. Estrategia de Testing Core AI

* **Pruebas Unitarias (JUnit/Mockito):** Probar lógica de negocio, algoritmos IA (con datos mock), construcción de prompts, etc., de forma aislada.
* **Pruebas de Integración (Spring Boot Test/Testcontainers):**
    * Verificar interacción Servicio <-> Repositorio <-> Base de Datos (PostgreSQL/MongoDB en contenedores).
    * Verificar llamadas entre servicios Core AI (usando mocks o contenedores).
    * Verificar llamadas a LLM Externo (usando mocks/stubs).
* **Pruebas de Contrato (Pact/Spring Cloud Contract):** Validar que las APIs internas entre servicios Core AI y entre Gateway/ATS y Core AI cumplan el contrato definido ([TK-001](../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md)).
* **Pruebas de API:** Probar directamente los endpoints expuestos por el Gateway o los servicios Core AI.
* **Pruebas Específicas de IA:** Validar precisión de parsing, calidad de generación, correlación de scoring (ver [Plan de Pruebas - Feature 4](../pp/pp-feature-4.md)).

## 7. Calidad del Código

* **Guías de Estilo Java/Spring:** Adherirse a convenciones estándar.
* **Código Limpio:** Principios SOLID, DRY, KISS.
* **Revisión de Código:** Pull Requests con revisión por pares obligatoria.
* **Análisis Estático:** Integrar herramientas (SonarQube, Checkstyle) en CI.

## 8. Proceso de Construcción e Implementación (CI/CD)

* **Pipelines Independientes:** Cada microservicio debe tener su propio pipeline de CI/CD.
* **Pasos:** Checkout -> Build (Maven/Gradle) -> Pruebas (Unit, Integration, Contract) -> Análisis Calidad -> Build Imagen Docker -> Push a Registro -> Despliegue (Kubernetes).
* **Gestión de Migraciones DB:** Integrar ejecución de migraciones (Flyway/Liquibase) en el pipeline de despliegue.

---
Referencias:
* [Arquitectura Core AI](../arq/arq_core_ia.md)
* [Base de Datos Core AI](../db/db_core_ai.md)
* [Mejores Prácticas Core AI](../best_practices/bp_core_ai.md)
* [Mejores Prácticas Base de Datos Core AI](../best_practices/bp_core_ai_db.md)
* [TalentIA PRD](../prd/PRD%20TalentIA%20FInal.md)
* [Documentación de Spring Boot](https://spring.io/projects/spring-boot)
* [Documentación de Java](https://dev.java/)
* [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
* [Documentación de MongoDB](https://www.mongodb.com/docs/)
* [Documentación de Kubernetes](https://kubernetes.io/docs/)
* [Documentación de Docker](https://docs.docker.com/)