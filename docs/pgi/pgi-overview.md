# Plan General de Implementación Detallado por Tareas - TalentIA Fase 1

## Introducción

Este documento describe el plan general de implementación para las features de la **Fase 1 de TalentIA (ATS MVP + Core AI)**, desglosado hasta el nivel de Tareas Técnicas (TKs). El plan sigue la priorización propuesta en el documento `docs/features/features-overview.md`, diseñada para construir las bases técnicas primero y luego desarrollar las funcionalidades de manera lógica, respetando las dependencias entre features.

---

## Secuencia de Implementación por Features y Tareas

### 1. Feature 7: Administración y Configuración del Sistema (Prioridad: Muy Alta)

* **Enfoque:** Establecer la base técnica esencial del sistema.
* **Descripción:** Agrupa las funcionalidades necesarias para la configuración inicial y el mantenimiento básico del ATS MVP, incluyendo la gestión de usuarios y sus roles, la autenticación para el acceso seguro, la configuración de elementos clave del flujo de trabajo como las etapas del pipeline y la definición de la API interna que conecta ATS y Core AI.
* **Tareas Técnicas Asociadas (TKs):**
    * **US-01: Definir Contrato API Interna:**
        * [TK-001: ARQ: Definir y Documentar Contrato API v1 (OpenAPI)](./tasks/tk-001-arq-definir-documentar-contrato-api-v1.md)
    * **US-02: Gestionar Etapas del Pipeline:**
        * [TK-011: BE: Definir/Actualizar Esquema BBDD para Entidad `EtapaPipeline`](./tasks/tk-011-esquema-bbdd-etapa-pipeline.md)
        * [TK-012: BE: Implementar Endpoints API RESTful para CRUD de Etapas de Pipeline](./tasks/tk-012-be-implementar-endpoints-crud-etapa-pipeline.md)
        * [TK-013: BE: Implementar Lógica de Negocio para Gestión de Etapas de Pipeline](./tasks/tk-013-be-implementar-logica-gestion-etapa-pipeline.md)
        * [TK-014: FE: Crear Interfaz de Usuario para Gestión de Etapas de Pipeline](./tasks/tk-014-fe-crear-interfaz-gestion-etapa-pipeline.md)
        * [TK-015: FE: Implementar Lógica Frontend para API de Gestión de Etapas Pipeline](./tasks/tk-015-fe-implementar-logica-gestion-etapa-pipeline.md)
    * **US-03: Gestionar Usuarios Básicos:**
        * [TK-006: BE: Definir/Actualizar Esquema BBDD para Entidad `Usuario`](./tasks/tk-006-db-esquema-bbdd-usuario.md)
        * [TK-007: BE: Implementar Endpoints API RESTful para CRUD de Usuarios](./tasks/tk-007-be-implementar-endpoints-crud-usuarios.md)
        * [TK-008: BE: Implementar Lógica de Negocio para Gestión de Usuarios](./tasks/tk-008-be-implementar-logica-gestion-usuarios.md)
        * [TK-009: FE: Crear Interfaz de Usuario para Gestión de Usuarios](./tasks/tk-009-fe-crear-interfaz-gestion-ususarios.md)
        * [TK-010: FE: Implementar Lógica Frontend para API de Gestión de Usuarios](./tasks/tk-010-fe-implementar-logica-gestion-ususarios.md)
    * **US-04: Autenticar Usuarios ATS:**
        * [TK-002: FE: Crear Componente y Lógica de Formulario de Login](./tasks/tk-002-fe-crear-componente-logica-login.md)
        * [TK-003: BE: Implementar Endpoint de Login (`POST /api/v1/auth/login`)](./tasks/tk-003-be-implementar-endpoint-login.md)
        * [TK-004: BE: Implementar Gestión de Sesiones / Generación de Tokens JWT](./tasks/tk-004-be-implementar-gestion-sesiones-JWT.md)
        * [TK-005: BE: Implementar Middleware de Autenticación para Rutas Protegidas](./tasks/tk-005-be-implementar-mw-routing-protegido.md)
* **Diagrama:**
    ```plantuml
    @startuml
    !theme plain
    left to right direction

    actor "Administrador" as Admin
    actor "<<System>>\nTalentIA Core AI" as CoreAI

    rectangle "ATS MVP - Administración y Configuración" {
      usecase "Definir Contrato API Interna" as UC_API <<US-001>>
      usecase "Gestionar Etapas del Pipeline" as UC_Pipeline <<US-002>>
      usecase "Gestionar Cuentas de Usuario" as UC_Users <<US-003>>
      usecase "Autenticar Usuario" as UC_Auth <<US-004>>

      'Relaciones Actor -> Casos de Uso
      Admin -- UC_Pipeline
      Admin -- UC_Users

      'Nota: Autenticación aplica a todos los roles internos
      (UC_Auth) ..> Admin : <<includes>>
      note right of UC_Auth: Aplica a Admin, \nReclutador, Manager

      'Relación con sistema externo/interno
      UC_API ..> CoreAI : Define comunicación
      note right of UC_API : Asegura integración

      'Relación de dependencia lógica
      UC_Pipeline --> UC_API : (Configuración pipeline\nnecesita API definida\npara parámetros IA)
    }

    @enduml
    ```
    *Fuente: `docs/features/feature-07-administracion-configuracion-sistema.md`*
* **Justificación Prioridad:** Establece las bases técnicas y de configuración esenciales, elementos necesarios antes o al inicio del desarrollo de otras funcionalidades.

---

### 2. Feature 1: Gestión del Ciclo de Vida de la Vacante (Prioridad: Muy Alta)

* **Enfoque:** Implementar el núcleo de la gestión de ofertas de empleo.
* **Descripción:** Permite a los usuarios (principalmente Reclutadores) crear, configurar, editar, publicar y despublicar las ofertas de empleo dentro del ATS MVP.
* **Tareas Técnicas Asociadas (TKs):**
    * **US-05: Crear Nueva Vacante:**
        * [TK-016: BE: Definir/Actualizar Esquema BBDD para Entidad `Vacante`](./tasks/tk-016-db-esquema-bbdd-vacante.md)
        * [TK-017: BE: Implementar Endpoint Creación Vacante](./tasks/tk-017-BE-Implementar-API-Creacion-Vacante.md)
        * [TK-018: BE: Implementar Lógica de Negocio para Crear Vacante](./tasks/tk-018-BE-Implementar-Logica-Creacion-Vacante.md)
        * [TK-019: FE: Crear Interfaz de Usuario para Formulario "Crear Nueva Vacante"](./tasks/tk-019-FE-Crear-UI-Formulario-Crear-Vacante.md)
        * [TK-020: FE: Implementar Lógica Frontend para API de Creación de Vacante](./tasks/tk-020-FE-Implementar-Logica-API-Creacion-Vacante.md)
    * **US-06: Editar Vacante Existente:**
        * [TK-021: BE: Implementar Endpoint Obtener Detalles Vacante](./tasks/tk-021-BE-Implementar-API-Obtener-Vacante.md)
        * [TK-022: BE: Implementar Endpoint Actualizar Vacante](./tasks/tk-022-BE-Implementar-API-Actualizar-Vacante.md)
        * [TK-023: BE: Implementar Lógica de Negocio para Obtener y Actualizar Vacante](./tasks/tk-023-BE-Implementar-Logica-Obtener-Actualizar-Vacante.md)
        * [TK-024: FE: Crear Interfaz de Usuario para Formulario "Editar Vacante"](./tasks/tk-024-FE-Crear-UI-Formulario-Editar-Vacante.md)
        * [TK-025: FE: Implementar Lógica Frontend para API de Obtención y Actualización de Vacante](./tasks/tk-025-FE-Implementar-Logica-API-Obtener-Actualizar-Vacante.md)
    * **US-07: Publicar/Despublicar Vacante:**
        * [TK-026: BE: Implementar Endpoint Actualizar Estado Vacante](./tasks/tk-026-BE-Implementar-API-Actualizar-Estado-Vacante.md)
        * [TK-027: BE: Implementar Lógica de Negocio para Actualizar Estado de Vacante](./tasks/tk-027-BE-Implementar-Logica-Actualizar-Estado-Vacante.md)
        * [TK-028: FE: Implementar Controles de UI para Cambiar Estado de Vacante](./tasks/tk-028-FE-Implementar-Controles-UI-Cambiar-Estado-Vacante.md)
        * [TK-029: FE: Implementar Lógica Frontend para API de Actualización de Estado Vacante](./tasks/tk-029-FE-Implementar-Logica-API-Actualizar-Estado-Vacante.md)
    * **US-08: Utilizar Plantillas para Crear Vacantes (Could Have):**
        * [TK-030: BE: Definir Esquema BBDD para Entidad `VacantePlantilla`](./tasks/tk-030-DB-Definir-Schema-VacantePlantilla.md)
        * [TK-031: BE: Implementar Endpoints API RESTful para CRUD de Plantillas de Vacante](./tasks/tk-031-BE-Implementar-API-CRUD-PlantillasVacante.md)
        * [TK-032: BE: Implementar Lógica de Negocio para Gestión de Plantillas de Vacante](./tasks/tk-032-BE-Implementar-Logica-Gestion-PlantillasVacante.md)
        * [TK-033: FE: Implementar UI y Acción "Guardar como Plantilla"](./tasks/tk-033-FE-Implementar-UI-GuardarComoPlantilla.md)
        * [TK-034: FE: Implementar UI y Acción "Cargar desde Plantilla"](./tasks/tk-034-FE-Implementar-UI-CargarDesdePlantilla.md)
        * [TK-035: FE: Implementar Lógica Frontend para API de Gestión de Plantillas](./tasks/tk-035-FE-Implementar-Logica-API-Gestion-Plantillas.md)
* **Diagrama:**
    ```plantuml
    @startuml
    !theme plain
    left to right direction

    actor "Reclutador" as R

    rectangle "ATS MVP - Gestión de Vacantes" {
      usecase "Crear Nueva Vacante" as UC_Create <<US-005>>
      usecase "Editar Vacante Existente" as UC_Edit <<US-006>>
      usecase "Publicar / Despublicar Vacante" as UC_Publish <<US-007>>
      usecase "Utilizar Plantillas de JD" as UC_Template <<US-008>>

      R -- UC_Create
      R -- UC_Edit
      R -- UC_Publish
      R -- UC_Template

      UC_Template ..> UC_Create : <<extends>>
      UC_Edit ..> UC_Template : <<extends>> (Guardar como plantilla)

    }
    @enduml
    ```
    *Fuente: `docs/features/feature-01-gestion-ciclo-vida-vacante.md`*
* **Justificación Prioridad:** Implementa la creación y gestión básica de vacantes, el punto de partida fundamental para cualquier proceso de reclutamiento dentro del ATS.

---

### 3. Feature 3: Portal de Empleo y Proceso de Aplicación (Prioridad: Muy Alta)

* **Enfoque:** Habilitar la entrada de candidatos al sistema.
* **Descripción:** Proporciona la interfaz pública donde los candidatos externos pueden ver las vacantes publicadas y enviar sus solicitudes, incluyendo la carga de su CV. También cubre la recepción y almacenamiento inicial de estas candidaturas en el ATS MVP.
* **Tareas Técnicas Asociadas (TKs):**
    * **US-09: Visualizar Lista de Vacantes Públicas:**
        * [TK-036: BE: Adaptar/Implementar Endpoint API Listar Vacantes Públicas](./tasks/tk-036-BE-Implementar-API-Listar-Vacantes-Publicas.md)
        * [TK-037: BE: Implementar Lógica de Negocio para Listar Vacantes Públicas](./tasks/tk-037-BE-Implementar-Logica-Listar-Vacantes-Publicas.md)
        * [TK-038: FE: Crear Interfaz de Usuario para Portal Público de Empleo](./tasks/tk-038-FE-Crear-UI-Portal-Publico-Lista-Vacantes.md)
        * [TK-039: FE: Implementar Lógica Frontend para API de Listado de Vacantes Públicas](./tasks/tk-039-FE-Implementar-Logica-API-Listar-Vacantes-Publicas.md)
    * **US-10: Aplicar a una Vacante:**
        * [TK-040: FE: Crear Interfaz de Usuario para Formulario de Aplicación a Vacante](./tasks/tk-040-FE-Crear-UI-Formulario-Aplicacion.md)
        * [TK-041: FE: Implementar Lógica Formulario Aplicación](./tasks/tk-041-FE-Implementar-Logica-Formulario-Aplicacion.md)
    * **US-11: Recepcionar y Almacenar Nueva Candidatura:**
        * [TK-042: BE: Implementar Endpoint Recepción Candidatura](./tasks/tk-042-BE-Implementar-API-Recepcion-Candidatura.md)
        * [TK-043: BE: Implementar Almacenamiento Seguro de Archivos CV](./tasks/tk-043-BE-Implementar-Almacenamiento-CV.md)
        * [TK-044: BE: Implementar Lógica de Negocio para Procesar Nueva Aplicación](./tasks/tk-044-BE-Implementar-Logica-Procesar-Aplicacion.md)
        * [TK-045: BE: Desencadenar Procesamiento IA Post-Aplicación](./tasks/tk-045-BE-Desencadenar-Procesamiento-IA-Post-Aplicacion.md)
* **Diagrama:**
    ```plantuml
    @startuml
    !theme plain
    left to right direction

    actor "Candidato" as C
    actor "<<System>>\nATS MVP" as ATS

    rectangle "ATS MVP - Portal y Aplicación" {
      usecase "Visualizar Lista Vacantes Públicas" as UC_View <<US-009>>
      usecase "Aplicar a Vacante (Formulario)" as UC_Apply <<US-010>>
      usecase "Recepcionar y Almacenar Candidatura" as UC_Receive <<US-011>>

      C -- UC_View
      C -- UC_Apply

      UC_Apply ..> UC_Receive : <<triggers>>

      ATS -- UC_Receive
      UC_View ..> ATS : (Lee vacantes publicadas)
    }
    @enduml
    ```
    *Fuente: `docs/features/feature-03-portal-empleo-aplicacion.md`*
* **Justificación Prioridad:** Habilita la entrada de candidatos al sistema, proporcionando los datos necesarios para las funcionalidades de evaluación y gestión posteriores. Esencial para el flujo end-to-end.

---

### 4. Feature 2: Asistencia IA para Descripción de Puesto (JD) (Prioridad: Alta)

* **Enfoque:** Introducir la primera capacidad central de IA y la configuración asociada.
* **Descripción:** Integra la capacidad de TalentIA Core AI para generar automáticamente borradores de Descripciones de Puesto (JD), permitiendo al Reclutador solicitar, recibir, editar y configurar parámetros específicos de IA (como el score de corte y etapas sugeridas) asociados a esa JD.
* **Tareas Técnicas Asociadas (TKs):**
    * **US-12: Solicitar Generación de JD con IA:**
        * [TK-046: FE: Anadir Botón Generar JD IA a Interfaz Edición Vacante](./tasks/tk-046-FE-Anadir-Boton-Generar-JD-IA.md)
        * [TK-047: FE: Implementar Lógica API Generar JD](./tasks/tk-047-FE-Implementar-Logica-API-Generar-JD.md)
    * **US-13: Configurar Parámetros de Evaluación IA:**
        * [TK-048: FE: Anadir Campos Configuración IA a Formulario Edición Vacante](./tasks/tk-048-FE-Anadir-Campos-Config-IA-Form-Vacante.md)
        * [TK-049: FE: Implementar Lógica Envio Parámetros IA](./tasks/tk-049-FE-Actualizar-Logica-Envio-Params-IA.md)
        * [TK-050: BE: Adaptar API para Recibir Parámetros IA](./tasks/tk-050-BE-Adaptar-API-Recibir-Params-IA-Vacante.md)
        * [TK-051: BE: Adaptar Logica Trigger Guardado Parámetros IA](./tasks/tk-051-BE-Adaptar-Logica-Trigger-Guardado-Params-IA.md)
    * **US-14: Recibir y Editar JD Generada por IA:**
        * [TK-052: FE: Manejar Respuesta API Generación JD](./tasks/tk-052-FE-Manejar-Respuesta-API-Generacion-JD.md)
        * [TK-053: FE: Implementar Componente Editor RTE JD](./tasks/tk-053-FE-Implementar-Componente-Editor-RTE-JD.md)
        * [TK-054: FE: Asegurar Guardado de Contenido Editado del Editor de JD](./tasks/tk-054-FE-Asegurar-Guardado-Contenido-Editor-JD.md)
    * **US-15: Generar Borrador de JD Usando IA (Core AI):**
        * [TK-055: CAI-BE: Implementar API Solicitud Generación JD](./tasks/tk-055-CAI-BE-Implementar-API-Solicitud-Generacion-JD.md)
        * [TK-056: CAI-BE: Implementar Logica Prompt Engineering JD](./tasks/tk-056-CAI-BE-Implementar-Logica-Prompt-Engineering-JD.md)
        * [TK-057: CAI-BE: Implementar Integración LLM Externo](./tasks/tk-057-CAI-BE-Implementar-Integracion-LLM-Externo.md)
        * [TK-058: CAI-BE: Implementar Manejo Respuesta LLM](./tasks/tk-058-CAI-BE-Implementar-Manejo-Respuesta-LLM.md)
    * **US-16: Almacenar Parámetros de Evaluación IA (Core AI):**
        * [TK-059: CAI-BE: Implementar Endpoint API Core AI para Guardar Parámetros IA](./tasks/tk-059-CAI-BE-Implementar-API-Guardar-Params-IA.md)
        * [TK-060: CAI-BE: Implementar Lógica de Negocio para Guardar Parámetros IA](./tasks/tk-060-CAI-BE-Implementar-Logica-Guardar-Params-IA.md)
    * **US-17: Enriquecer Generación de JD con Datos Internos (Core AI - Should Have):**
        * [TK-061: CAI-BE: Investigar Implementar Enriquecimiento de JD con Datos Internos](./tasks/tk-061-CAI-BE-Investigar-Implementar-Enriquecimiento-JD-Datos-Internos.md)
* **Diagrama:**
    ```plantuml
    @startuml
    !theme plain
    left to right direction

    actor "Reclutador" as R
    actor "<<System>>\nTalentIA Core AI" as CoreAI
    actor "<<System>>\nProveedor LLM" as LLM_Ext <<External>>

    rectangle "ATS MVP & Core AI - Asistencia JD" {
      usecase "Solicitar Generación IA de JD" as UC_Request <<US-012>>
      usecase "Configurar Parámetros IA (Corte, Etapas)" as UC_Config <<US-013>>
      usecase "Recibir y Editar JD Generada" as UC_Edit <<US-014>>

      R -- UC_Request
      R -- UC_Config
      R -- UC_Edit

      rectangle "TalentIA Core AI" {
        usecase "Generar Borrador JD" as UC_Generate <<US-015>>
        usecase "Almacenar Parámetros IA" as UC_StoreParams <<US-016>>
        usecase "Usar Datos Internos (Opcional)" as UC_InternalData <<US-017>>
      }

      UC_Request ..> UC_Generate : <<triggers>>
      UC_Config ..> UC_StoreParams : <<triggers>>
      UC_Generate ..> UC_Edit : (Devuelve JD)

      UC_Generate ..> LLM_Ext : <<invokes>>
      UC_Generate ..> UC_InternalData : <<includes>> (Opcional)

    }
    @enduml
    ```
    *Fuente: `docs/features/feature-02-asistencia-ia-descripcion-puesto.md`*
* **Justificación Prioridad:** Introduce una capacidad IA central, aportando valor al Reclutador y configurando parámetros para evaluación. Depende de F1.

---

### 5. Feature 4: Evaluación Inteligente de Candidaturas (Prioridad: Alta)

* **Enfoque:** Implementar la capacidad IA de cribado y scoring de candidatos.
* **Descripción:** Orquesta el proceso de análisis de las candidaturas recibidas utilizando TalentIA Core AI, incluyendo la creación/actualización del perfil unificado del candidato en IA, el envío del CV para análisis, el parsing, el cálculo del score, la comparación con umbral, la determinación de etapa sugerida y la generación de resumen.
* **Tareas Técnicas Asociadas (TKs):**
    * **US-18: Gestionar Perfil Unificado de Candidato en IA (Core AI):**
        * [TK-062: CAI-BE: Definir Schema BBDD para Entidad `CandidatoIA`](./tasks/tk-062-CAI-DB-Definir-Schema-CandidatoIA.md)
        * [TK-063: CAI-BE: Implementar Endpoint API Core AI para Crear/Actualizar `CandidatoIA`](./tasks/tk-063-CAI-BE-Implementar-API-Upsert-CandidatoIA.md)
        * [TK-064: CAI-BE: Implementar Lógica de Negocio para Find-Or-Create/Update `CandidatoIA`](./tasks/tk-064-CAI-BE-Implementar-Logica-Upsert-CandidatoIA.md)
    * **US-19: Invocar Evaluación IA para Nueva Candidatura:**
        * [TK-065: CAI-BE: Implementar API Recibir Solicitud Evaluación](./tasks/tk-065-CAI-BE-Implementar-API-Recibir-Solicitud-Evaluacion.md)
        * [TK-066: CAI-BE: Implementar Logica Iniciar Evaluación](./tasks/tk-066-CAI-BE-Implementar-Logica-Iniciar-Evaluacion.md)
    * **US-20: Extraer Datos Estructurados del CV (Core AI):**
        * [TK-067: CAI-BE: Obtener Contenido Archivo CV](./tasks/tk-067-CAI-BE-Obtener-Contenido-Archivo-CV.md)
        * [TK-068: CAI-BE: Extraer Texto PDF/DOCX](./tasks/tk-068-CAI-BE-Extraer-Texto-PDF-DOCX.md)
        * [TK-069: CAI-BE: Implementar Parsing Texto CV](./tasks/tk-069-CAI-BE-Implementar-Parsing-Texto-CV.md)
        * [TK-070: CAI-BE: Implementar Almacenamiento Datos Parseados CV](./tasks/tk-070-CAI-BE-Implementar-Almacenamiento-Datos-Parseados-CV.md)
    * **US-21: Calcular Score de Idoneidad (Core AI):**
        * [TK-071: CAI-BE: Recuperar Inputs para Scoring](./tasks/tk-071-CAI-BE-Recuperar-Inputs-Scoring.md)
        * [TK-072: CAI-BE: Implementar Algoritmo Scoring v1](./tasks/tk-072-CAI-BE-Implementar-Algoritmo-Scoring-v1.md)
        * [TK-073: CAI-BE: Implementar Almacenamiento Scores](./tasks/tk-073-CAI-BE-Implementar-Almacenamiento-Scores.md)
    * **US-22: Comparar Score con Umbral de Corte (Core AI):**
        * [TK-074: CAI-BE: Implementar Logica Comparacion Score](./tasks/tk-074-CAI-BE-Implementar-Logica-Comparacion-Score.md)
    * **US-23: Determinar Etapa de Pipeline Sugerida (Core AI):**
        * [TK-075: CAI-BE: Implementar Logica Determinar Etapa Sugerida](./tasks/tk-075-CAI-BE-Implementar-Logica-Determinar-Etapa-Sugerida.md)
    * **US-24: Devolver Resultados Completos de Evaluación IA (Core AI):**
        * [TK-076: CAI-BE: Implementar Formateo Retorno Respuesta Evaluación](./tasks/tk-076-CAI-BE-Implementar-Formateo-Retorno-Respuesta-Evaluacion.md)
    * **US-25: Generar Resumen Ejecutivo (Core AI - Should Have):**
        * [TK-077: CAI-BE: Implementar Logica Prompt Engineering Resumen](./tasks/tk-077-CAI-BE-Implementar-Logica-Prompt-Engineering-Resumen.md)
        * [TK-078: CAI-BE: Implementar Orquestacion LLM Generacion Resumen](./tasks/tk-078-CAI-BE-Implementar-Orquestacion-LLM-Generacion-Resumen.md)
        * [TK-079: CAI-BE: Implementar Almacenamiento Resumen Generado](./tasks/tk-079-CAI-BE-Implementar-Almacenamiento-Resumen-Generado.md)
    * **US-26: Identificar/Evaluar Soft Skills (Core AI - Could Have):**
        * [TK-080: CAI-BE: Investigar Implementar Identificacion Soft Skills](./tasks/tk-080-CAI-BE-Investigar-Implementar-Identificacion-Soft-Skills.md)
* **Diagrama:**
    ```plantuml
    @startuml
    !theme plain
    left to right direction

    actor "<<System>>\nATS MVP" as ATS
    actor "<<System>>\nTalentIA Core AI" as CoreAI
    actor "<<System>>\nProveedor LLM" as LLM_Ext <<External>>

    rectangle "ATS MVP & Core AI - Evaluación IA" {

      usecase "Invocar Evaluación IA" as UC_Invoke <<US-019>>
      ATS -- UC_Invoke

      rectangle "TalentIA Core AI" {
        usecase "Gestionar Perfil CandidatoIA" as UC_Profile <<US-018>>
        usecase "Extraer Datos CV (Parsear)" as UC_Parse <<US-020>>
        usecase "Calcular Score Idoneidad" as UC_Score <<US-021>>
        usecase "Comparar Score con Corte" as UC_Compare <<US-022>>
        usecase "Determinar Etapa Sugerida" as UC_Suggest <<US-023>>
        usecase "Devolver Evaluación Completa" as UC_Return <<US-024>>
        usecase "Generar Resumen Candidato (Opcional)" as UC_Summary <<US-025>>
        usecase "Considerar Soft Skills (Opcional)" as UC_SoftSkills <<US-026>>
      }

      UC_Invoke ..> UC_Profile : <<triggers>>
      UC_Invoke ..> UC_Parse : <<triggers>>

      UC_Parse ..> UC_Score : <<includes>>
      UC_Parse ..> UC_SoftSkills : <<includes>> (Opcional)
      UC_Score ..> UC_Compare : <<includes>>
      UC_Compare ..> UC_Suggest : <<includes>>

      UC_Parse ..> LLM_Ext : <<invokes>> (Potencialmente)
      UC_Summary ..> LLM_Ext : <<invokes>> (Potencialmente)
      UC_SoftSkills ..> LLM_Ext : <<invokes>> (Potencialmente)

      UC_Score ..> UC_Return : (Resultado)
      UC_Suggest ..> UC_Return : (Resultado)
      UC_Summary ..> UC_Return : (Resultado Opcional)

      UC_Return ..> ATS : (Respuesta a US-019)

      note right of UC_Profile
        También es invocado
        al recepcionar candidatura
        (ver F3)
      end note

    }
    @enduml
    ```
    *Fuente: `docs/features/feature-04-evaluacion-inteligente-candidaturas.md`*
* **Justificación Prioridad:** Implementa la otra capacidad central de IA. Depende lógicamente de tener vacantes (F1), candidatos (F3) y parámetros IA configurados (F2).

---

### 6. Feature 5: Visualización y Gestión del Pipeline de Selección (Prioridad: Alta)

* **Enfoque:** Permitir a los usuarios interactuar con los resultados de la IA y gestionar el flujo de candidatos.
* **Descripción:** Proporciona las herramientas visuales para que Reclutadores y Managers revisen a los candidatos, vean los resultados de la evaluación IA (score, resumen, etapa sugerida), consulten el historial, gestionen el avance en el pipeline (ej. Kanban), y ordenen/filtren la información.
* **Tareas Técnicas Asociadas (TKs):**
    * **US-27: Mostrar Evaluación IA (Score):**
        * [TK-081: FE: Anadir Visualizacion Score IA a Detalle Candidatura](./tasks/tk-081-FE-Anadir-Visualizacion-Score-IA-UI-Detalle.md)
        * [TK-082: FE: Asegurar Disponibilidad Score IA en Datos Perfil Candidatura](./tasks/tk-082-FE-Asegurar-Disponibilidad-Score-IA-Datos-FE.md)
    * **US-28: Mostrar Etapa Sugerida:**
        * [TK-083: FE: Anadir Visualizacion Etapa Pipeline Sugerida a Detalle Candidatura](./tasks/tk-083-FE-Anadir-Visualizacion-Etapa-Sugerida-IA.md)
        * [TK-084: FE: Asegurar Disponibilidad Etapa Pipeline Sugerida en Datos Perfil Candidatura](./tasks/tk-084-FE-Asegurar-Disponibilidad-Etapa-Sugerida-IA-Datos-FE.md)
    * **US-29: Visualizar Lista Candidatos:**
        * [TK-085: BE: Implementar Endpoint API Listar Candidaturas por Vacante](./tasks/tk-085-BE-implementar-endpoint-api-listar-candidaturas-vacante.md)
        * [TK-086: BE: Implementar Lógica de Negocio para Listar Candidaturas por Vacante](./tasks/tk-086-BE-implementar-logica-negocio-listar-candidaturas-vacante.md)
        * [TK-087: FE: Crear Interfaz de Usuario para Lista de Candidatos por Vacante](./tasks/tk-087-FE-crear-interfaz-usuario-lista-tabla-candidatos-vacante.md)
        * [TK-088: FE: Implementar Lógica Frontend para API de Listado de Candidatos por Vacante](./tasks/tk-088-FE-implementar-logica-frontend-api-listar-candidaturas.md)
        * [TK-089: FE: Implementar Navegacion entre Lista y Detalle de Candidatura](./tasks/tk-089-FE-implementar-navegacion-lista-candidatos-detalle.md)
    * **US-30: Visualizar Pipeline Kanban:**
        * [TK-090: BE: Adaptar/Crear Endpoint API para Datos Kanban](./tasks/tk-090-BE-adaptar-crear-endpoint-api-datos-kanban.md)
        * [TK-091: BE: Implementar Logica de Negocio para Datos Kanban](./tasks/tk-091-BE-implementar-logica-negocio-datos-kanban.md)
        * [TK-092: FE: Crear Componente UI Tablero Kanban](./tasks/tk-092-FE-crear-componente-ui-tablero-kanban.md)
        * [TK-093: FE: Implementar Lógica Frontend para API de Datos Kanban](./tasks/tk-093-FE-implementar-logica-frontend-api-datos-kanban-etapas.md)
        * [TK-094: FE: Renderizar Columnas y Tarjetas en Tablero Kanban](./tasks/tk-094-FE-renderizar-columnas-tarjetas-kanban.md)
        * [TK-095: FE: Añadir Visualización Info Básica a Tarjeta Kanban](./tasks/tk-095-FE-anadir-visualizacion-info-basica-tarjeta-kanban.md)
    * **US-31: Mover Candidato entre Etapas:**
        * [TK-096: BE: Implementar Endpoint API Actualizar Etapa Candidatura](./tasks/tk-096-BE-implementar-endpoint-api-actualizar-etapa-candidatura.md)
        * [TK-097: BE: Implementar Logica de Negocio Actualizar Etapa Candidatura](./tasks/tk-097-BE-implementar-logica-negocio-actualizar-etapa-candidatura.md)
        * [TK-098: FE: Implementar Funcionalidad Drag-and-Drop en Kanban](./tasks/tk-098-FE-implementar-funcionalidad-drag-and-drop-kanban.md)
        * [TK-099: FE: Implementar Logica Frontend para API Actualizar Etapa](./tasks/tk-099-FE-implementar-logica-api-actualizar-etapa-frontend.md)
        * [TK-100: FE: Implementar Control UI Cambiar Etapa en Detalle](./tasks/tk-100-FE-implementar-control-ui-cambiar-etapa-detalle.md)
    * **US-32: Automatizar Movimiento Inicial (Could Have):**
        * [TK-101: BE-DB: Definir Esquema/Tabla para Configuración Global del Sistema](./tasks/tk-101-DB-definir-schema-tabla-configuracion-global.md)
        * [TK-102: BE-API: Implementar Endpoints API para Gestión Configuración Global](./tasks/tk-102-BE-API-implementar-endpoints-gestion-configuracion-global.md)
        * [TK-103: BE-Logic: Implementar Lógica de Negocio Leer/Escribir Configuración Global](./tasks/tk-103-BE-Logic-implementar-logica-negocio-leer-escribir-configuracion-global.md)
        * [TK-104: FE-UI: Crear Interfaz Usuario para Gestionar Configuración Global](./tasks/tk-104-FE-UI-crear-interfaz-usuario-gestionar-configuracion-global.md)
        * [TK-105: FE-Logic: Implementar Lógica Frontend para API Configuración Global](./tasks/tk-105-FE-Logic-implementar-logica-frontend-api-configuracion-global.md)
        * [TK-106: BE-Logic: Modificar Lógica Post-Evaluación para Mover Candidato Automáticamente](./tasks/tk-106-BE-Logic-modificar-logica-post-evaluacion-mover-automaticamente.md)
    * **US-33: Mostrar Resumen IA (Should Have):**
        * [TK-107: BE-API: Asegurar/Incluir campo `resumen_ia` en Respuesta API Detalle Candidatura](./tasks/tk-107-BE-API-asegurar-incluir-resumen-ia-respuesta-detalle-candidatura.md)
        * [TK-108: BE-Logic: Asegurar Almacenamiento/Recuperación de `resumen_ia` en ATS](./tasks/tk-108-BE-Logic-asegurar-almacenamiento-recuperacion-resumen-ia-ats.md)
        * [TK-109: FE-UI: Añadir Sección/Campo Mostrar Resumen IA en Detalle Candidatura](./tasks/tk-109-FE-UI-anadir-seccion-campo-mostrar-resumen-ia-detalle.md)
        * [TK-110: FE-Logic: Obtener/Manejar campo `resumen_ia` en Detalle Candidatura](./tasks/tk-110-FE-Logic-obtener-manejar-resumen-ia-detalle.md)
    * **US-34: Ordenar/Filtrar por Score (Should Have):**
        * [TK-111: BE-API: Adaptar API Listar Candidaturas para Soportar Ordenación por Score](./tasks/tk-111-BE-API-adaptar-api-listar-candidaturas-ordenacion-score.md)
        * [TK-112: BE-Logic: Implementar Lógica de Negocio Ordenación por Score IA](./tasks/tk-112-BE-Logic-implementar-logica-negocio-ordenacion-score-ia.md)
        * [TK-113: FE-UI: Hacer Clickable Cabecera Columna Score IA para Ordenar](./tasks/tk-113-FE-UI-hacer-clickable-cabecera-columna-score-ia-ordenar.md)
        * [TK-114: FE-Logic: Implementar Lógica Frontend para Ordenar por Score IA](./tasks/tk-114-FE-Logic-implementar-logica-frontend-ordenar-score-ia.md)
        * [TK-115: BE-API: (Opcional) Adaptar API Listar Candidaturas para Soportar Filtrado por Rango de Score](./tasks/tk-115-BE-API-opcional-adaptar-api-listar-candidaturas-filtrado-score.md)
        * [TK-116: BE-Logic: (Opcional) Implementar Lógica de Negocio Filtrado por Rango de Score IA](./tasks/tk-116-BE-Logic-opcional-implementar-logica-negocio-filtrado-score-ia.md)
        * [TK-117: FE-UI: (Opcional) Añadir Controles UI para Filtrar por Rango de Score](./tasks/tk-117-FE-UI-opcional-anadir-controles-filtrar-rango-score.md)
        * [TK-118: FE-Logic: (Opcional) Implementar Lógica Frontend para Filtrar por Rango de Score IA](./tasks/tk-118-FE-Logic-opcional-implementar-logica-frontend-filtrar-score-ia.md)
    * **US-35: Consultar Historial Unificado (Should Have):**
        * [TK-119: CAI-BE-API: Implementar Endpoint API Obtener Detalles CandidatoIA (incl. `candidaturas_ids`)](./tasks/tk-119-CAI-BE-API-implementar-endpoint-obtener-detalles-candidato-ia.md)
        * [TK-120: CAI-BE-Logic: Implementar Lógica de Negocio Obtener Detalles CandidatoIA](./tasks/tk-120-CAI-BE-Logic-implementar-logica-negocio-obtener-detalles-candidato-ia.md)
        * [TK-121: BE-Logic: Implementar Lógica ATS para Obtener y Procesar Historial Aplicaciones](./tasks/tk-121-BE-Logic-implementar-logica-ats-obtener-procesar-historial-aplicaciones.md)
        * [TK-122: BE-API: Adaptar API Detalle Candidatura ATS para Incluir Historial](./tasks/tk-122-BE-API-adaptar-api-detalle-candidatura-ats-incluir-historial.md)
        * [TK-123: FE-UI: Añadir Sección "Historial de Aplicaciones" a Vista Detalle Candidatura](./tasks/tk-123-FE-UI-anadir-seccion-historial-aplicaciones-detalle-candidatura.md)
        * [TK-124: FE-Logic: Manejar y Pasar Datos de Historial a Componente UI Detalle](./tasks/tk-124-FE-Logic-manejar-pasar-datos-historial-componente-ui-detalle.md)
    * **US-36: Comparar Candidatos (Could Have):**
        * [TK-127: FE-UI: Añadir Selección Múltiple y Botón Comparar a Lista Candidatos](./tasks/tk-127-FE-UI-anadir-seleccion-multiple-boton-comparar-lista-candidatos.md)
        * [TK-128: FE-Logic: Gestionar Estado de Selección Múltiple en Lista Candidatos](./tasks/tk-128-FE-Logic-gestionar-estado-seleccion-multiple-lista-candidatos.md)
        * [TK-129: FE-UI: Crear Componente UI Vista Comparación Lado a Lado](./tasks/tk-129-FE-UI-crear-componente-vista-comparacion-lado-a-lado.md)
        * [TK-130: FE-Logic: Obtener Datos y Orquestar Vista Comparación](./tasks/tk-130-FE-Logic-obtener-datos-orquestar-vista-comparacion.md)
* **Diagrama:**
    ```plantuml
    @startuml
    !theme plain
    left to right direction

    actor "Reclutador / HM" as User
    actor "<<System>>\nATS MVP" as ATS
    actor "<<System>>\nTalentIA Core AI" as CoreAI

    rectangle "ATS MVP - Pipeline y Revisión" {
      usecase "Visualizar Lista Candidatos" as UC_List <<US-029>>
      usecase "Visualizar Pipeline Kanban" as UC_Kanban <<US-030>>
      usecase "Mover Candidato entre Etapas" as UC_Move <<US-031>>
      usecase "Ordenar/Filtrar por Score IA" as UC_SortFilter <<US-034>>
      usecase "Consultar Historial Candidato" as UC_History <<US-035>>
      usecase "Comparar Candidatos" as UC_Compare <<US-036>>

      User -- UC_List
      User -- UC_Kanban
      User -- UC_Move
      User -- UC_SortFilter
      User -- UC_History
      User -- UC_Compare

      usecase "Mostrar Evaluación IA (Score)" as UC_ShowScore <<US-027>>
      usecase "Mostrar Etapa Sugerida IA" as UC_ShowStage <<US-028>>
      usecase "Mostrar Resumen IA" as UC_ShowSummary <<US-033>>
      usecase "Automatizar Movimiento Inicial (Opc)" as UC_AutoMove <<US-032>>

      ATS -- UC_ShowScore
      ATS -- UC_ShowStage
      ATS -- UC_ShowSummary
      ATS -- UC_AutoMove

      UC_List ..> UC_ShowScore : <<includes>>
      UC_Kanban ..> UC_ShowScore : <<includes>>
      UC_List ..> UC_ShowStage : <<includes>>
      UC_Kanban ..> UC_ShowStage : <<includes>>
      (UC_List, UC_Kanban) ..> UC_ShowSummary : <<includes>> (Opcional)

      UC_History ..> CoreAI : (Consulta Perfil CandidatoIA)

      UC_AutoMove ..> UC_Move : <<includes>> (Caso automático)
    }
    @enduml
    ```
    *Fuente: `docs/features/feature-05-visualizacion-gestion-pipeline.md`*
* **Justificación Prioridad:** Hace usable la información de la IA y permite la gestión del proceso. Depende de que existan evaluaciones (F4) y candidaturas (F3) en vacantes (F1).

---

### 7. Feature 6: Sistema de Feedback para IA (Prioridad: Media)

* **Enfoque:** Cerrar el ciclo de aprendizaje de la IA.
* **Descripción:** Implementa el mecanismo para que los usuarios puedan proporcionar retroalimentación sobre la calidad y corrección de las evaluaciones generadas por IA. Cubre la captura en ATS, envío a Core AI, y recepción/almacenamiento.
* **Tareas Técnicas Asociadas (TKs):**
    * **US-37: Capturar Feedback Básico:**
        * [TK-125: FE-UI: Añadir Controles de Feedback Básico (👍/👎)](./tasks/tk-125-FE-UI-anadir-controles-feedback-basico-detalle-candidatura.md)
        * [TK-126: FE-Logic: Manejar Estado y Evento Click para Feedback Básico](./tasks/tk-126-FE-Logic-manejar-estado-evento-click-feedback-basico.md)
    * **US-38: Enviar Feedback a Core AI:**
        * [TK-131: BE-API: Implementar Endpoint ATS para Recibir Solicitud Envío Feedback](./tasks/tk-131-BE-API-implementar-endpoint-ats-recibir-solicitud-envio-feedback.md)
        * [TK-132: BE-Logic: Implementar Lógica ATS para Enviar Feedback a Core AI](./tasks/tk-132-BE-Logic-implementar-logica-ats-enviar-feedback-core-ai.md)
        * [TK-133: FE-Logic: Implementar Lógica Frontend para Llamar a API ATS de Envío Feedback](./tasks/tk-133-FE-Logic-implementar-logica-frontend-llamar-api-ats-envio-feedback.md)
        * [TK-134: CAI-BE-API: (Asegurar/Definir) Endpoint API Core AI para Recibir Feedback](./tasks/tk-134-CAI-BE-API-asegurar-definir-endpoint-coreai-recibir-feedback.md)
    * **US-39: Recibir y Almacenar Feedback (Core AI):**
        * [TK-135: CAI-DB: Definir Esquema BBDD para Entidad `RegistroFeedbackIA`](./tasks/tk-135-CAI-DB-definir-schema-bbdd-entidad-registrofeedbackia.md)
        * [TK-136: CAI-BE-Logic: Implementar Lógica de Negocio para Validar y Almacenar Feedback Recibido](./tasks/tk-136-CAI-BE-Logic-implementar-logica-negocio-validar-almacenar-feedback.md)
    * **US-40: Capturar Feedback Detallado (Should Have):**
        * [TK-137: FE-UI: Añadir Controles Feedback Detallado (Editar Score, Validar Skills, Comentarios)](./tasks/tk-137-FE-UI-anadir-controles-feedback-detallado-detalle-candidatura.md)
        * [TK-138: FE-Logic: Manejar Estado y Construir Payload para Feedback Detallado](./tasks/tk-138-FE-Logic-manejar-estado-construir-payload-feedback-detallado.md)
        * [TK-139: BE-API: (Asegurar/Refinar) API Detalle Candidatura Incluye Skills Detectadas](./tasks/tk-139-BE-API-asegurar-refinar-api-detalle-candidatura-incluye-skills.md)
        * [TK-140: BE-Logic: (Asegurar/Refinar) Lógica ATS Almacena/Recupera Skills Detectadas](./tasks/tk-140-BE-Logic-asegurar-refinar-logica-ats-almacena-recupera-skills.md)
* **Diagrama:**
    ```plantuml
    @startuml
    !theme plain
    left to right direction

    actor "Reclutador / HM" as User
    actor "<<System>>\nATS MVP" as ATS
    actor "<<System>>\nTalentIA Core AI" as CoreAI

    rectangle "ATS MVP & Core AI - Feedback IA" {
      usecase "Capturar Feedback Básico" as UC_CaptureBasic <<US-037>>
      usecase "Capturar Feedback Detallado" as UC_CaptureDetail <<US-040>>

      User -- UC_CaptureBasic
      User -- UC_CaptureDetail

      usecase "Enviar Feedback a Core AI" as UC_Send <<US-038>>
      ATS -- UC_Send

      UC_CaptureBasic ..> UC_Send : <<triggers>>
      UC_CaptureDetail ..> UC_Send : <<triggers>>

      rectangle "TalentIA Core AI" {
        usecase "Recibir y Almacenar Feedback" as UC_ReceiveStore <<US-039>>
      }

      UC_Send ..> UC_ReceiveStore : <<invokes>>
    }
    @enduml
    ```
    *Fuente: `docs/features/feature-06-sistema-feedback-ia.md`*
* **Justificación Prioridad:** Importante para el objetivo de mejora continua, pero lógicamente sigue a la visualización y uso de las evaluaciones (F5).

---

### 8. Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad (Prioridad: Baja)

* **Enfoque:** Añadir funcionalidades "Could Have" de conveniencia.
* **Descripción:** Conjunto de funcionalidades que mejoran la experiencia de usuario o añaden capacidades convenientes, pero no esenciales para el flujo principal del MVP. Incluye notificaciones, búsqueda, dashboard básico y exportación.
* **Tareas Técnicas Asociadas (TKs):**
    * **US-41: Recibir Notificaciones Internas:**
        * [TK-141: BE-DB: Definir Esquema BBDD para Entidad `Notificacion`](./tasks/tk-141-BE-DB-definir-schema-bbdd-entidad-notificacion.md)
        * [TK-142: BE-Logic: Implementar Lógica Generación Notificaciones en Eventos Clave](./tasks/tk-142-BE-Logic-implementar-logica-generacion-notificaciones-eventos-clave.md)
        * [TK-143: BE-API: Implementar Endpoints API para Gestión Notificaciones](./tasks/tk-143-BE-API-implementar-endpoints-gestion-notificaciones.md)
        * [TK-144: BE-Logic: Implementar Lógica de Negocio para API Gestión Notificaciones](./tasks/tk-144-BE-Logic-implementar-logica-negocio-api-gestion-notificaciones.md)
        * [TK-145: FE-UI: Añadir Indicador Notificaciones (Campana+Badge) a Layout Principal](./tasks/tk-145-FE-UI-anadir-indicador-notificaciones-layout-principal.md)
        * [TK-146: FE-UI: Crear Componente Panel/Lista de Notificaciones](./tasks/tk-146-FE-UI-crear-componente-panel-lista-notificaciones.md)
        * [TK-147: FE-Logic: Implementar Lógica Frontend para API Notificaciones](./tasks/tk-147-FE-Logic-implementar-logica-frontend-api-notificaciones.md)
    * **US-42: Buscar Candidatos:**
        * [TK-148: BE-API: Implementar Endpoint API para Búsqueda Básica de Candidaturas](./tasks/tk-148-BE-API-implementar-endpoint-busqueda-basica-candidaturas.md)
        * [TK-149: BE-Logic: Implementar Lógica de Negocio para Búsqueda Básica (Multi-campo)](./tasks/tk-149-BE-Logic-implementar-logica-negocio-busqueda-basica-multi-campo.md)
        * [TK-150: FE-UI: Añadir Campo de Búsqueda Global en Layout Principal](./tasks/tk-150-FE-UI-anadir-campo-busqueda-global-layout-principal.md)
        * [TK-151: FE-UI: Crear Página/Componente para Mostrar Resultados de Búsqueda](./tasks/tk-151-FE-UI-crear-pagina-componente-mostrar-resultados-busqueda.md)
        * [TK-152: FE-Logic: Implementar Lógica Frontend para Búsqueda (Llamada API y Navegación)](./tasks/tk-152-FE-Logic-implementar-logica-frontend-busqueda-llamada-api-navegacion.md)
    * **US-43: Visualizar Dashboard Básico:**
        * [TK-153: BE-API: Implementar Endpoint API para Datos del Dashboard Básico](./tasks/tk-153-BE-API-implementar-endpoint-datos-dashboard-basico.md)
        * [TK-154: BE-Logic: Implementar Lógica de Negocio para Calcular Métricas del Dashboard](./tasks/tk-154-BE-Logic-implementar-logica-negocio-calcular-metricas-dashboard.md)
        * [TK-155: FE-UI: Crear Página/Componente Dashboard Básico](./tasks/tk-155-FE-UI-crear-pagina-componente-dashboard-basico.md)
        * [TK-156: FE-UI: Implementar Widgets de Métricas (Números y Gráfico Básico)](./tasks/tk-156-FE-UI-implementar-widgets-metricas-numeros-grafico-basico.md)
        * [TK-157: FE-Logic: Implementar Lógica Frontend para API del Dashboard](./tasks/tk-157-FE-Logic-implementar-logica-frontend-api-dashboard.md)
    * **US-44: Exportar Información Básica de Candidato:**
        * [TK-158: BE-API: Implementar Endpoint API para Exportar Datos Candidatura](./tasks/tk-158-BE-API-implementar-endpoint-exportar-datos-candidatura.md)
        * [TK-159: BE-Logic: Implementar Lógica de Negocio para Generar Exportación (Datos+CV)](./tasks/tk-159-BE-Logic-implementar-logica-negocio-generar-exportacion-datos-cv.md)
        * [TK-160: FE-UI: Añadir Botón "Exportar Datos" a Vista Detalle Candidatura](./tasks/tk-160-FE-UI-anadir-boton-exportar-datos-detalle-candidatura.md)
        * [TK-161: FE-Logic: Implementar Lógica Frontend para Iniciar Descarga Exportación](./tasks/tk-161-FE-Logic-implementar-logica-frontend-iniciar-descarga-exportacion.md)
* **Diagrama:**
    ```plantuml
    @startuml
    !theme plain
    left to right direction

    actor "Reclutador / HM" as User
    actor "Admin"

    rectangle "ATS MVP - Mejoras Adicionales" {
      usecase "Recibir Notificaciones Internas" as UC_Notify <<US-041>>
      usecase "Buscar Candidatos" as UC_Search <<US-042>>
      usecase "Visualizar Dashboard Básico" as UC_Dashboard <<US-043>>
      usecase "Exportar Datos Candidato" as UC_Export <<US-044>>

      User -- UC_Notify
      User -- UC_Search
      (User, Admin) -- UC_Dashboard 'Admin también podría verlo
      User -- UC_Export 'O quizá Admin también? Asumimos Rec/HM por ahora
    }
    @enduml
    ```
    *Fuente: `docs/features/feature-08-mejoras-adicionales-usabilidad.md`*
* **Justificación Prioridad:** Agrupa funcionalidades deseables pero no esenciales. Naturalmente, se abordarían después del núcleo funcional y de IA.

---

*Este resumen proporciona una visión general de el plan general de implementación del proyecto TalentIA.*
