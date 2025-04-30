# Definición de Arquitectura - TalentIA ATS MVP (Fase 1)

## 1. Introducción

Este documento detalla la definición de la arquitectura del componente **ATS MVP** del proyecto TalentIA en su Fase 1, basándose en la documentación proporcionada ([PRD](../prd/PRD%20TalentIA%20FInal.md), [Features](../features/features-overview.md), [User Stories](../us/us-overview.md), [Technical Tasks](../tasks/tasks-overview.md), [Modelos de Datos](../db/db-overview.md), y [Planes de Prueba/Implementación](../pp/pp-overview.md)). El ATS MVP es el sistema de seguimiento de candidatos mínimo viable que gestiona el flujo de trabajo principal de reclutamiento y se integra con la Plataforma TalentIA Core AI para capacidades de inteligencia artificial.

## 2. Alcance y Límites del ATS MVP (Fase 1)

El ATS MVP se enfoca en proporcionar las funcionalidades esenciales para la gestión interna del proceso de reclutamiento. Su alcance funcional en la Fase 1 abarca desde la publicación de vacantes hasta la gestión de candidatos en el pipeline, utilizando activamente la inteligencia proporcionada por TalentIA Core AI.

**Límites Clave:**

* **Interacción con TalentIA Core AI:** En la Fase 1, la única interacción externa del ATS MVP es con la Plataforma TalentIA Core AI a través de una [API interna bien definida](../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md).
* **Integración con ATS Externos:** La integración directa con sistemas ATS de terceros como TeamTailor está explícitamente [fuera del alcance de la Fase 1](../prd/PRD%20TalentIA%20FInal.md#4-wont-have-no-tendrá---en-fase-1). Aunque la arquitectura del Core AI se diseñará pensando en futuras integraciones, el ATS MVP no las implementará en esta fase.
* **Funcionalidades Avanzadas:** El ATS MVP se limita a un conjunto mínimo viable de funcionalidades de gestión de reclutamiento, excluyendo capacidades avanzadas no definidas en los requisitos "Must Have" y "Should Have".
* **Usuarios:** Se centra en dar soporte a los roles internos (Reclutador, Hiring Manager, Administrador) y a la interacción externa del Candidato a través del portal público.

## 3. Patrón Arquitectónico General

Para el ATS MVP, se ha adoptado un patrón arquitectónico de **Monolito** o **Monolito Modular**. Este enfoque se justifica por la necesidad de agilizar el desarrollo y despliegue de la funcionalidad mínima viable en esta fase inicial. La separación de responsabilidades se gestiona a nivel de módulos lógicos internos. La Plataforma TalentIA Core AI, por otro lado, se implementa como una arquitectura de microservicios, lo que resulta en un enfoque arquitectónico **híbrido** para la solución completa de TalentIA Fase 1.

## 4. Vista Lógica/Conceptual del ATS MVP

El ATS MVP se estructura lógicamente en varios módulos o componentes principales, cada uno con responsabilidades bien definidas y alineadas con las [Features](../features/features-overview.md) y [User Stories](../us/us-overview.md) del proyecto:

### 4.1. Módulo de Interfaz de Usuario (UI/Frontend)

* **Responsabilidad:** Capa de presentación de la aplicación. Maneja la interacción directa con los usuarios internos (Reclutadores, Hiring Managers, Administradores) a través de la aplicación web, y expone el Portal de Empleo público para los Candidatos. Es responsable de renderizar las vistas, capturar la entrada del usuario (formularios, clics, drag-and-drop) y mostrar la información recibida del backend, incluyendo los resultados de la evaluación IA.
* **Relación con la Documentación:** Cubre aspectos definidos en las secciones de [Diseño UX/UI](../ux_ui/ux_ui_overview.md), [Features](../features/features-overview.md) (particularmente la parte FE de todas), [User Stories](../us/us-overview.md) y [Technical Tasks](../tasks/tasks-overview.md).

### 4.2. Módulo de Gestión de Vacantes

* **Responsabilidad:** Administrar el ciclo de vida de las ofertas de empleo. Incluye la creación, edición, publicación y despublicación de vacantes. Gestiona los datos básicos de la vacante y la integración UI/Backend para estas operaciones. Coordina con el Módulo de Integración para la generación de JD y el guardado de parámetros IA asociados a la vacante.
* **Relación con la Documentación:** Se relaciona principalmente con [Feature 1: Gestión del Ciclo de Vida de la Vacante](../features/feature-01-gestion-ciclo-vida-vacante.md), RFs [[RF-01]](../rfs/rf-01-crear-vacante.md), [[RF-02]](../rfs/rf-02-editar-vacante.md), [[RF-03]](../rfs/rf-03-publicar-despublicar-vacante.md), [[RF-31]](../rfs/rf-31-plantillas-jd.md), User Stories [[US-05]](../us/us-05-crear-nueva-vacante.md) a [[US-08]](../us/us-08-utilizar-plantilla-vacante.md), y Technical Tasks asociadas ([TK-016](../tasks/tk-016-db-esquema-bbdd-vacante.md) a [TK-035](../tasks/tk-035-FE-Implementar-Logica-API-Gestion-Plantillas.md)). También con la configuración IA en JD [[RF-04B]](../rfs/rf-04b-configurar-parametros-ia-jd.md), [[US-13]](../us/us-13-configurar-parametros-ia-jd.md), [TK-048](../tasks/tk-048-FE-Anadir-Campos-Config-IA-Form-Vacante.md) a [TK-051](../tasks/tk-051-BE-Adaptar-Logica-Trigger-Guardado-Params-IA.md).

### 4.3. Módulo de Gestión de Candidaturas

* **Responsabilidad:** Manejar la recepción de postulaciones de candidatos (desde el portal público o creadas manualmente), el almacenamiento seguro de archivos de CV, la creación y persistencia de los registros de `Candidato` y `Candidatura`. Orquesta el inicio de la evaluación IA al recibir una nueva candidatura, interactuando con el Módulo de Integración. Gestiona la visualización de la información detallada de la candidatura, incluyendo los resultados de la evaluación IA recibidos. Maneja la captura de feedback sobre las evaluaciones IA y lo envía a través del Módulo de Integración.
* **Relación con la Documentación:** Se relaciona con [Feature 3: Portal de Empleo y Proceso de Aplicación](../features/feature-03-portal-empleo-aplicacion.md) (parte de recepción y almacenamiento) [[RF-09]](../rfs/rf-09-recepcionar-candidaturas.md), [[US-11]](../us/us-11-recepcionar-almacenar-candidatura.md), [TK-042](../tasks/tk-042-BE-Implementar-API-Recepcion-Candidatura.md) a [TK-045](../tasks/tk-045-BE-Desencadenar-Procesamiento-IA-Post-Aplicacion.md). También con la visualización de la evaluación IA [[RF-14]](../rfs/rf-14-mostrar-evaluacion-ia-ats-mvp.md), [[RF-14B]](../rfs/rf-14b-mostrar-etapa-sugerida-ats-mvp.md), [[RF-25]](../rfs/rf-25-mostrar-resumen-ia-ats-mvp.md), [[RF-26B]](../rfs/rf-26b-mostrar-historial-unificado-ats-mvp.md), [[US-27]](../us/us-27-mostrar-evaluacion-ia-perfil-candidatura.md), [[US-28]](../us/us-28-mostrar-etapa-pipeline-sugerida-ia.md), [[US-33]](../us/us-33-mostrar-resumen-generado-ia-perfil-candidatura.md), [[US-35]](../us/us-35-consultar-historial-aplicaciones-anteriores-candidato.md), [TK-081](../tasks/tk-081-FE-Anadir-Visualizacion-Score-IA-UI-Detalle.md) a [TK-084](../tasks/tk-084-FE-Asegurar-Disponibilidad-Etapa-Sugerida-IA-Datos-FE.md), [TK-107](../tasks/tk-107-BE-API-asegurar-incluir-resumen-ia-respuesta-detalle-candidatura.md) a [TK-110](../tasks/tk-110-FE-Logic-obtener-manejar-resumen-ia-detalle.md), [TK-119](../tasks/tk-119-CAI-BE-API-implementar-endpoint-obtener-detalles-candidato-ia.md) a [TK-124](../tasks/tk-124-FE-Logic-manejar-pasar-datos-historial-componente-ui-detalle.md). La gestión del feedback [[RF-18]](../rfs/rf-18-capturar-feedback-basico-ats-mvp.md), [[RF-19]](../rfs/rf-19-enviar-feedback-ats-mvp.md), [[RF-27]](../rfs/rf-27-feedback-ia-detallado-ats-mvp.md), [[US-37]](../us/us-37-capturar-feedback-basico-evaluacion-ia.md), [[US-38]](../us/us-38-enviar-feedback-capturado-core-ai.md), [[US-40]](../us/us-40-capturar-feedback-detallado-evaluacion-ia.md), [TK-125](../tasks/tk-125-FE-UI-anadir-controles-feedback-basico-detalle-candidatura.md), [TK-126](../tasks/tk-126-FE-Logic-manejar-estado-evento-click-feedback-basico.md), [TK-131](../tasks/tk-131-BE-API-implementar-endpoint-ats-recibir-solicitud-envio-feedback.md) a [TK-133](../tasks/tk-133-FE-Logic-implementar-logica-frontend-llamar-api-ats-envio-feedback.md) también cae aquí.

### 4.4. Módulo de Gestión del Pipeline

* **Responsabilidad:** Proporcionar la visualización y las herramientas para gestionar el avance de los candidatos a través de las etapas del proceso de selección. Incluye la visualización de listas de candidatos por vacante, la vista de tablero Kanban, y la funcionalidad para mover candidatos entre etapas. Registra el historial de cambios de etapa.
* **Relación con la Documentación:** Se relaciona con [Feature 5: Visualización y Gestión del Pipeline de Selección](../features/feature-05-visualizacion-gestion-pipeline.md), [[RF-15]](../rfs/rf-15-visualizar-candidatos-vacante.md) a [[RF-17]](../rfs/rf-17-mover-candidatos-etapas.md), [[US-29]](../us/us-29-visualizar-lista-candidatos-vacante.md) a [[US-31]](../us/us-31-mover-candidato-entre-etapas-pipeline.md), [TK-085](../tasks/tk-085-BE-implementar-endpoint-api-listar-candidaturas-vacante.md) a [TK-100](../tasks/tk-100-FE-implementar-control-ui-cambiar-etapa-detalle.md).

### 4.5. Módulo de Gestión de Usuarios y Autenticación/Autorización

* **Responsabilidad:** Gestionar las cuentas de usuario internas (creación, activación/desactivación) y sus roles básicos (Reclutador, Manager, Administrador). Controlar el acceso al sistema mediante autenticación (login/logout) y asegurar que los usuarios solo puedan acceder a las funcionalidades permitidas por su rol.
* **Relación con la Documentación:** Se relaciona con [Feature 7: Administración y Configuración del Sistema](../features/feature-07-administracion-configuracion-sistema.md) (parte de Usuarios y Autenticación) [[RF-29]](../rfs/rf-29-gestion-basica-usuarios-ats-mvp.md), [[RF-30]](../rfs/rf-30-autenticacion-usuarios-ats-mvp.md), [[US-03]](../us/us-03-gestionar-usuarios-basicos.md), [[US-04]](../us/us-04-autenticar-usuarios-ats.md), [TK-002](../tasks/tk-002-fe-crear-componente-logica-login.md) a [TK-010](../tasks/tk-010-fe-implementar-logica-gestion-ususarios.md).

### 4.6. Módulo de Administración y Configuración General

* **Responsabilidad:** Permitir la configuración de elementos clave del sistema que afectan el flujo de trabajo o el comportamiento, como la definición y orden de las etapas del pipeline y otras configuraciones globales (ej. habilitar movimiento automático por IA). Accesible para roles con permisos de administración.
* **Relación con la Documentación:** Se relaciona con [Feature 7: Administración y Configuración del Sistema](../features/feature-07-administracion-configuracion-sistema.md) (parte de Configuración) [[RF-28]](../rfs/rf-28-configurar-etapas-pipeline-ats-mvp.md), [[US-02]](../us/us-02-gestionar-etapas-pipeline.md), [TK-011](../tasks/tk-011-esquema-bbdd-etapa-pipeline.md) a [TK-015](../tasks/tk-015-fe-implementar-logica-gestion-etapa-pipeline.md). También con [Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad](../features/feature-08-mejoras-adicionales-usabilidad.md) para configuraciones como [la automatización del movimiento inicial] [[US-32]](../us/us-32-automatizar-opcionalmente-movimiento-inicial-etapa-sugerida.md) [[RF-14C]](../rfs/rf-14c-automatizar-movimiento-inicial.md), [TK-101](../tasks/tk-101-DB-definir-schema-tabla-configuracion-global.md) a [TK-106](../tasks/tk-106-BE-Logic-modificar-logica-post-evaluacion-mover-automaticamente.md).

### 4.7. Módulo de Integración/Comunicación con Core AI

* **Responsabilidad:** Servir como la capa de comunicación y adaptación entre el ATS MVP y los microservicios de TalentIA Core AI. Encapsula la lógica para realizar las llamadas a la [API interna de Core AI]((../rfs/rf-21-api-interna-ats-mvp-core-ai.md)), manejar la autenticación interna entre ambos sistemas y procesar las respuestas recibidas. Los otros módulos del ATS MVP interactúan con Core AI a través de este módulo.
* **Relación con la Documentación:** Se relaciona transversalmente con todas las [Features](../features/features-overview.md) y [User Stories](../us/us-overview.md) que implican interacción entre ATS MVP y Core AI [[RF-21]](../rfs/rf-21-api-interna-ats-mvp-core-ai.md), [[US-01]](../us/us-01-definir-contrato-api-interna.md), [TK-001](../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md). Es invocado por los Módulos de Gestión de Vacantes, Gestión de Candidaturas y Gestión del Pipeline para las operaciones que requieren inteligencia artificial o datos del perfil unificado de Core AI.

## 5. Vista Detallada de Módulos y Componentes Internos

Esta sección profundiza en la "Vista Lógica/Conceptual" (previamente Sección 4), detallando los componentes o sub-módulos clave dentro de cada módulo lógico del ATS MVP. Esta estructura sirve como referencia para la organización del código y la asignación de responsabilidades de desarrollo.

### 5.1. Módulo de Interfaz de Usuario (UI/Frontend)

* **Responsabilidad:** Proporcionar la experiencia de usuario a través de la aplicación web (para usuarios internos) y el Portal de Empleo público (para candidatos).

* **Componentes Clave:**
    * **Layouts Principales:** Estructuras base para las diferentes secciones de la aplicación (ej. Layout Interno con barra de navegación, Layout Público para el portal).
        * Relacionado con [[US-004]](../us/us-04-autenticar-usuarios-ats.md) (Login/Logout), [[US-041]](../us/us-41-recibir-notificaciones-internas-eventos-clave.md) (Indicador Notificaciones - [TK-145](../tasks/tk-145-FE-UI-anadir-indicador-notificaciones-layout-principal.md)), [[US-042]](../us/us-42-buscar-candidatos-nombre-palabra-clave.md) (Campo Búsqueda Global - [TK-150](../tasks/tk-150-FE-UI-anadir-campo-busqueda-global-layout-principal.md)).
    * **Páginas/Vistas:** Componentes principales que representan secciones específicas de la aplicación (ej. Dashboard, Lista de Vacantes, Detalle de Vacante, Lista de Candidatos, Pipeline Kanban, Detalle de Candidatura, Gestión de Usuarios, Configuración del Pipeline, Portal de Empleo, Formulario de Aplicación, Resultados de Búsqueda, Dashboard Básico).
        * Relacionado con [[US-005]](../us/us-05-crear-nueva-vacante.md), [[US-006]](../us/us-06-editar-vacante-existente.md), [[US-007]](../us/us-07-publicar-despublicar-vacante.md), [[US-009]](../us/us-09-visualizar-lista-vacantes.md), [[US-010]](../us/us-10-aplicar-vacante.md), [[US-014]](../us/us-14-recibir-editar-JD-generada-IA.md), [[US-016]](../us/us-16-almacenar-parametros-evaluacion-IA-vacante.md), [[US-027]](../us/us-27-mostrar-evaluacion-ia-perfil-candidatura.md), [[US-028]](../us/us-28-mostrar-etapa-pipeline-sugerida-ia.md), [[US-029]](../us/us-29-visualizar-lista-candidatos-vacante.md), [[US-030]](../us/us-30-visualizar-pipeline-seleccion-tablero-kanban.md), [[US-031]](../us/us-31-mover-candidato-entre-etapas-pipeline.md), [[US-033]](../us/us-33-mostrar-resumen-generado-ia-perfil-candidatura.md), [[US-034]](../us/us-34-ordenar-filtrar-lista-candidatos-score-ia.md), [[US-035]](../us/us-35-consultar-historial-aplicaciones-anteriores-candidato.md), [[US-036]](../us/us-36-comparar-perfiles-candidatos-lado-lado.md), [[US-037]](../us/us-37-capturar-feedback-basico-evaluacion-ia.md), [[US-040]](../us/us-40-capturar-feedback-detallado-evaluacion-ia.md), [[US-042]](../us/us-42-buscar-candidatos-nombre-palabra-clave.md), [[US-043]](../us/us-43-visualizar-dashboard-metricas-basicas.md), [[US-044]](../us/us-44-exportar-informacion-basica-candidato.md).
    * **Componentes Reutilizables:** Elementos de UI más pequeños utilizados en múltiples páginas (ej. Botones, Inputs de formulario, Tablas, Modales, Selectores, Componente Editor RTE - [TK-053](../tasks/tk-053-FE-Implementar-Componente-Editor-RTE-JD.md), Componente Tablero Kanban - [TK-092](../tasks/tk-092-FE-crear-componente-ui-tablero-kanban.md), Componentes de Widgets/Gráficos - [TK-156](../tasks/tk-156-FE-UI-implementar-widgets-metricas-numeros-grafico-basico.md), Componente Panel Notificaciones - [TK-146](../tasks/tk-146-FE-UI-crear-componente-panel-lista-notificaciones.md)).
        * Relacionado con la aplicación de [Tailwind CSS] y [Headless UI].
    * **Servicios/Stores de Estado (Frontend Logic):** Lógica que gestiona el estado de la aplicación en el frontend, maneja las llamadas a la API del backend del ATS MVP, y coordina la interacción entre componentes. Utiliza [Pinia] para la gestión centralizada del estado y [Axios] para las llamadas HTTP.
        * Cubre la parte FE de casi todos los TKs que implican interacción con el backend (ej. [TK-010](../tasks/tk-010-fe-implementar-logica-gestion-ususarios.md), [TK-015](../tasks/tk-015-fe-implementar-logica-gestion-etapa-pipeline.md), [TK-020](../tasks/tk-020-FE-Implementar-Logica-API-Creacion-Vacante.md), [TK-025](../tasks/tk-025-FE-Implementar-Logica-API-Obtener-Actualizar-Vacante.md), etc.).

### 5.2. Módulo de Gestión de Vacantes

* **Responsabilidad:** Implementar la lógica de negocio y acceso a datos para las operaciones CRUD y de ciclo de vida de las vacantes.

* **Componentes Clave:**
    * **Controladores/API Endpoints (Backend):** Reciben peticiones HTTP relacionadas con vacantes y llaman a los servicios de negocio.
        * Relacionado con [TK-017](../tasks/tk-017-BE-Implementar-API-Creacion-Vacante.md), [TK-021](../tasks/tk-021-BE-Implementar-API-Obtener-Vacante.md), [TK-022](../tasks/tk-022-BE-Implementar-API-Actualizar-Vacante.md), [TK-026](../tasks/tk-026-BE-Implementar-API-Actualizar-Estado-Vacante.md), [TK-031](../tasks/tk-031-BE-Implementar-API-CRUD-PlantillasVacante.md).
    * **Servicios de Lógica de Negocio:** Contienen la lógica para crear ([TK-018](../tasks/tk-018-BE-Implementar-Logica-Creacion-Vacante.md)), obtener ([TK-023](../tasks/tk-023-BE-Implementar-Logica-Obtener-Actualizar-Vacante.md)), actualizar ([TK-023](../tasks/tk-023-BE-Implementar-Logica-Obtener-Actualizar-Vacante.md)), cambiar estado ([TK-027](../tasks/tk-027-BE-Implementar-Logica-Actualizar-Estado-Vacante.md)) y gestionar plantillas ([TK-032](../tasks/tk-032-BE-Implementar-Logica-Gestion-PlantillasVacante.md)). Coordinan con el Módulo de Integración con Core AI para las operaciones de JD/Parámetros IA ([TK-051](../tasks/tk-051-BE-Adaptar-Logica-Trigger-Guardado-Params-IA.md)).
    * **Repositorios de Datos:** Manejan la interacción directa con la tabla `Vacante` y `VacantePlantilla` en la base de datos [PostgreSQL] ([TK-016](../tasks/tk-016-db-esquema-bbdd-vacante.md), [TK-030](../tasks/tk-030-DB-Definir-Schema-VacantePlantilla.md)).

### 5.3. Módulo de Gestión de Candidaturas

* **Responsabilidad:** Implementar la lógica de negocio y acceso a datos para la recepción, almacenamiento, visualización detallada y gestión de candidaturas.

* **Componentes Clave:**
    * **Controladores/API Endpoints (Backend):** Reciben peticiones HTTP relacionadas con candidaturas y llamadas a los servicios de negocio. Incluye el endpoint público para recepción de aplicaciones.
        * Relacionado con [TK-042](../tasks/tk-042-BE-Implementar-API-Recepcion-Candidatura.md), [TK-085](../tasks/tk-085-BE-implementar-endpoint-api-listar-candidaturas-vacante.md), [TK-096](../tasks/tk-096-BE-implementar-endpoint-api-actualizar-etapa-candidatura.md), [TK-131](../tasks/tk-131-BE-API-implementar-endpoint-ats-recibir-solicitud-envio-feedback.md), [TK-139](../tasks/tk-139-BE-API-asegurar-refinar-api-detalle-candidatura-incluye-skills.md), [TK-148](../tasks/tk-148-BE-API-implementar-endpoint-busqueda-basica-candidaturas.md), [TK-158](../tasks/tk-158-BE-API-implementar-endpoint-exportar-datos-candidatura.md).
    * **Servicios de Lógica de Negocio:** Contienen la lógica para procesar nuevas aplicaciones ([TK-044](../tasks/tk-044-BE-Implementar-Logica-Procesar-Aplicacion.md)), listar candidaturas ([TK-086](../tasks/tk-086-BE-implementar-logica-negocio-listar-candidaturas-vacante.md)), actualizar etapa ([TK-097](../tasks/tk-097-BE-implementar-logica-negocio-actualizar-etapa-candidatura.md)), manejar feedback ([TK-132](../tasks/tk-132-BE-Logic-implementar-logica-ats-enviar-feedback-core-ai.md)), gestionar almacenamiento de CVs ([TK-043](../tasks/tk-043-BE-Implementar-Almacenamiento-CV.md)), manejar búsqueda ([TK-149](../tasks/tk-149-BE-Logic-implementar-logica-negocio-busqueda-basica-multi-campo.md)), exportar datos ([TK-159](../tasks/tk-159-BE-Logic-implementar-logica-negocio-generar-exportacion-datos-cv.md)), obtener historial ([TK-121](../tasks/tk-121-BE-Logic-implementar-logica-ats-obtener-procesar-historial-aplicaciones.md)). Orquesta el inicio de procesos en Core AI post-aplicación ([TK-045](../tasks/tk-045-BE-Desencadenar-Procesamiento-IA-Post-Aplicacion.md)). Almacena resultados de IA ([TK-108](../tasks/tk-108-BE-Logic-asegurar-almacenamiento-recuperacion-resumen-ia-ats.md)), skills ([TK-140](../tasks/tk-140-BE-Logic-asegurar-refinar-logica-ats-almacena-recupera-skills.md)).
    * **Repositorios de Datos:** Manejan la interacción directa con las tablas `Candidato`, `ArchivoCandidato`, `Candidatura`, `HistorialEtapa` y `Nota` en la base de datos [PostgreSQL].

### 5.4. Módulo de Gestión del Pipeline

* **Responsabilidad:** Proporcionar la lógica y los datos para la visualización del pipeline (lista, Kanban) y facilitar el movimiento manual de candidatos.

* **Componentes Clave:**
    * **Controladores/API Endpoints (Backend):** Endpoints para listar candidatos por vacante (para vista de lista y Kanban).
        * Relacionado con [TK-085](../tasks/tk-085-BE-implementar-endpoint-api-listar-candidaturas-vacante.md), [TK-090](../tasks/tk-090-BE-adaptar-crear-endpoint-api-datos-kanban.md).
    * **Servicios de Lógica de Negocio:** Contienen la lógica para obtener listas de candidaturas paginadas ([TK-086](../tasks/tk-086-BE-implementar-logica-negocio-listar-candidaturas-vacante.md)) y obtener datos agrupados para la vista Kanban ([TK-091](../tasks/tk-091-BE-implementar-logica-negocio-datos-kanban.md)). Coordinan con el Módulo de Gestión de Candidaturas para la actualización de etapa.
    * **Repositorios de Datos:** Interactúan con las tablas `Candidatura`, `Candidato` y `EtapaPipeline`.

### 5.5. Módulo de Gestión de Usuarios y Autenticación/Autorización

* **Responsabilidad:** Implementar la lógica de negocio y acceso a datos para la gestión de usuarios y los mecanismos de autenticación/autorización.

* **Componentes Clave:**
    * **Controladores/API Endpoints (Backend):** Endpoints para login, y operaciones CRUD de usuarios.
        * Relacionado con [TK-003](../tasks/tk-003-be-implementar-endpoint-login.md), [TK-007](../tasks/tk-007-be-implementar-endpoints-crud-usuarios.md).
    * **Servicios de Lógica de Negocio:** Contienen la lógica para autenticar usuarios ([TK-008](../tasks/tk-008-be-implementar-logica-gestion-usuarios.md)), gestionar usuarios (crear, actualizar - [TK-008](../tasks/tk-008-be-implementar-logica-gestion-usuarios.md)), generar/validar JWT ([TK-004](../tasks/tk-004-be-implementar-gestion-sesiones-JWT.md)).
    * **Middleware de Autenticación/Autorización:** Intercepta peticiones a rutas protegidas para verificar la validez del token/sesión y los permisos del usuario.
        * Relacionado con [TK-005](../tasks/tk-005-be-implementar-mw-routing-protegido.md).
    * **Repositorios de Datos:** Interactúan con la tabla `Usuario` en la base de datos [PostgreSQL] ([TK-006](../tasks/tk-006-db-esquema-bbdd-usuario.md)).

### 5.6. Módulo de Administración y Configuración General

* **Responsabilidad:** Implementar la lógica de negocio y acceso a datos para la configuración del pipeline y otras configuraciones globales.

* **Componentes Clave:**
    * **Controladores/API Endpoints (Backend):** Endpoints para CRUD de etapas de pipeline y gestión de configuración global.
        * Relacionado con [TK-012](../tasks/tk-012-be-implementar-endpoints-crud-etapa-pipeline.md), [TK-102](../tasks/tk-102-BE-API-implementar-endpoints-gestion-configuracion-global.md).
    * **Servicios de Lógica de Negocio:** Contienen la lógica para gestionar etapas (crear, actualizar, reordenar, eliminar - [TK-013](../tasks/tk-013-be-implementar-logica-gestion-etapa-pipeline.md)) y gestionar configuraciones globales (leer, escribir - [TK-103](../tasks/tk-103-BE-Logic-implementar-logica-negocio-leer-escribir-configuracion-global.md)). Incluye la lógica para el movimiento automático post-evaluación basado en configuración ([TK-106](../tasks/tk-106-BE-Logic-modificar-logica-post-evaluacion-mover-automaticamente.md)).
    * **Repositorios de Datos:** Interactúan con las tablas `EtapaPipeline` ([TK-011](../tasks/tk-011-esquema-bbdd-etapa-pipeline.md)) y `SystemConfigurations` ([TK-101](../tasks/tk-101-DB-definir-schema-tabla-configuracion-global.md)) en la base de datos [PostgreSQL].

### 5.7. Módulo de Integración/Comunicación con Core AI

* **Responsabilidad:** Gestionar la comunicación entre el ATS MVP y los servicios de TalentIA Core AI.

* **Componentes Clave:**
    * **Cliente API Core AI (Backend):** Encapsula la lógica para realizar llamadas HTTP salientes a los endpoints de la [API interna de Core AI]((../rfs/rf-21-api-interna-ats-mvp-core-ai.md)) (utilizando [Axios]). Maneja la autenticación interna.
        * Relacionado con [TK-045](../tasks/tk-045-BE-Desencadenar-Procesamiento-IA-Post-Aplicacion.md), [TK-051](../tasks/tk-051-BE-Adaptar-Logica-Trigger-Guardado-Params-IA.md), [TK-121](../tasks/tk-121-BE-Logic-implementar-logica-ats-obtener-procesar-historial-aplicaciones.md), [TK-132](../tasks/tk-132-BE-Logic-implementar-logica-ats-enviar-feedback-core-ai.md).
    * **Adaptadores de Datos:** Si es necesario, transforman los datos entre el formato interno del ATS MVP y el formato esperado por la API de Core AI, y viceversa.

## 6. Vista de Procesos (Flujos Clave)

Los flujos de procesos detallados para los casos de uso principales que involucran la interacción entre el ATS MVP y TalentIA Core AI ya se encuentran documentados en la sección 7 de [PRD TalentIA FInal.md](../prd/PRD%20TalentIA%20FInal.md#7-casos-de-uso-principales-fase-1). Estos diagramas de secuencia ilustran cómo los diferentes módulos y sistemas interactúan para ejecutar las funcionalidades clave de la Fase 1.

Los patrones de interacción principales entre el ATS MVP y Core AI son:

* **ATS MVP como cliente de servicios de Core AI:** El ATS MVP inicia la comunicación para solicitar la generación de contenido (JDs) o invocar procesos de evaluación, enviando los datos necesarios a los endpoints de la [API interna de Core AI]((../rfs/rf-21-api-interna-ats-mvp-core-ai.md)).
* **Core AI procesando y devolviendo resultados:** Core AI recibe las solicitudes, ejecuta su lógica (interactuando con proveedores LLM si es necesario, como se describe en [RF-22](../rfs/rf-22-invocacion-proveedor-llm-core-ai.md)), persiste sus propios datos (como `CandidatoIA` y `EvaluacionCandidatoIA`, detallado en [db-overview.md](../db/db-overview.md#2-base-de-datos-talentia-core-ai)), y devuelve los resultados (JD generada, score, sugerencia de etapa, resumen, etc., según [RF-13](../rfs/rf-13-devolver-evaluacion-core-ai.md)) al ATS MVP a través de la API interna.
* **ATS MVP actualizando UI y datos locales:** El ATS MVP recibe los resultados de Core AI y los utiliza para actualizar su interfaz de usuario y/o almacenar información clave (como el score y la etapa sugerida) en su propia base de datos para visualización y gestión del flujo. Los detalles de la base de datos del ATS MVP se encuentran en [db-overview.md](../db/db-overview.md#1-base-de-datos-ats-mvp).
* **ATS MVP enviando feedback a Core AI:** El ATS MVP captura el feedback del usuario sobre las evaluaciones IA ([RF-18](../rfs/rf-18-capturar-feedback-basico-ats-mvp.md), [RF-27](../rfs/rf-27-feedback-ia-detallado-ats-mvp.md)) y lo envía a Core AI para el aprendizaje continuo ([RF-19](../rfs/rf-19-enviar-feedback-ats-mvp.md), [RF-20](../rfs/rf-20-recibir-almacenar-feedback-core-ai.md)).

Para una comprensión detallada de estos flujos, por favor, consulte los siguientes diagramas de secuencia en la documentación del PRD:

* [**UC1: Gestionar Vacante y Generar Descripción (JD) con IA**](../prd/PRD%20TalentIA%20FInal.md#uc1-gestionar-vacante-y-generar-descripción-jd-con-ia)
* [**UC3: Recepcionar y Evaluar Candidatura con IA**](../prd/PRD%20TalentIA%20FInal.md#uc3-recepcionar-y-evaluar-candidatura-con-ia)
* [**UC4: Revisar Candidatos y Gestionar Pipeline (Foco Historial/Sugerencia)**](../prd/PRD%20TalentIA%20FInal.md#uc4-revisar-candidatos-y-gestionar-pipeline)
* [**UC5: Proporcionar Feedback a IA**](../prd/PRD%20TalentIA%20FInal.md#uc5-proporcionar-feedback-a-ia)

Estos diagramas proporcionan una vista detallada de las interacciones entre los módulos lógicos definidos para el ATS MVP y los servicios de TalentIA Core AI durante la ejecución de los casos de uso principales.

## 7. Vista de Datos (ATS MVP)

El ATS MVP mantiene su propia base de datos, cuyo esquema está detallado en la [documentación de la Base de Datos ATS MVP](../db/db-overview.md#1-base-de-datos-ats-mvp). Los principales agregados y entidades gestionados por el ATS MVP son `Usuario`, `Vacante`, `Candidato`, `ArchivoCandidato`, `Candidatura`, `EtapaPipeline`, `MotivoRechazo`, `HistorialEtapa`, `Nota`, `VacantePlantilla`, y `SystemConfigurations`. Estos datos se centran en el flujo de trabajo de reclutamiento y los datos transaccionales propios del ATS. El ATS MVP almacena copias o referencias a los resultados clave de la evaluación IA (`puntuacion_ia_general`, `etapa_sugerida`, `referencia_evaluacion_ia_id`) y a la lista de IDs de candidaturas del perfil unificado (`candidaturas_ids`) para optimizar la visualización y el rendimiento en la UI.

## 8. Vista de Desarrollo (Development View)

La vista de desarrollo describe la arquitectura del ATS MVP desde la perspectiva de la organización del código, las tecnologías utilizadas y los aspectos relevantes para el ciclo de vida del desarrollo.

### 8.1. Estructura del Código y Organización

Dado que el ATS MVP se concibe como un monolito o monolito modular, la estructura del código debería organizarse de manera que refleje los módulos lógicos definidos previamente (Sección 4). Esto se puede lograr mediante:

* **Organización por Módulos/Dominios:** Estructurar el código en directorios o paquetes que correspondan a los módulos lógicos (ej. `vacantes`, `candidaturas`, `usuarios`, `pipeline`, `admin`, `integracion-core-ai`, `ui`).
* **Arquitectura por Capas:** Dentro de cada módulo (especialmente en el backend), seguir un patrón por capas para separar responsabilidades:
    * **Capa de Presentación/UI (Frontend):** Maneja la interfaz de usuario y la interacción directa con el usuario.
    * **Capa de API/Controladores (Backend):** Expone los endpoints RESTful para el frontend y la comunicación interna (si aplica). Recibe y valida las peticiones.
    * **Capa de Lógica de Negocio/Servicios:** Contiene la lógica principal de la aplicación, coordinando operaciones y aplicando las reglas de negocio. Interactúa con la capa de datos y el Módulo de Integración con Core AI.
    * **Capa de Acceso a Datos/Repositorios:** Encapsula la lógica de interacción directa con la base de datos del ATS MVP, proporcionando una interfaz clara a la capa de servicios.
* **Separación Frontend/Backend:** El proyecto mantiene una separación clara entre el código del frontend (UI) y el código del backend (API, lógica de negocio, acceso a datos), comunicándose a través de APIs HTTP.


### 8.2. Tecnologías Utilizadas

Se han tomado las siguientes decisiones tecnológicas para el ATS MVP:

* **Backend:** Se utilizará **Node.js con el framework Express**. Esta elección aprovecha la familiaridad con JavaScript y un ecosistema amplio para el desarrollo rápido.
* **Frontend:** Se utilizará **Vue.js**. Conocido por su facilidad de integración y desarrollo reactivo.
    * **Gestión de Estado (Frontend):** Se utilizará **Pinia** para la gestión del estado de la aplicación en el frontend.
    * **Framework CSS:** Se utilizará **Tailwind CSS** como framework utility-first CSS.
    * **Librería de Componentes UI:** Se complementará con una **librería de componentes Headless UI** (ej. Headless UI) para componentes interactivos complejos.
* **Base de Datos (ATS MVP):** Se utilizará **PostgreSQL**. Esta decisión se basa en el [soporte nativo de PostgreSQL para tipos de datos como UUID, JSONB y Arrays]((../db/db-overview.md#notas-generales)), que son relevantes para el esquema de base de datos definido en la documentación. Se seleccionará un ORM compatible con Node.js y PostgreSQL.
* **Almacenamiento de Archivos (CVs):** Inicialmente se implementará el almacenamiento en **disco local seguro** en el servidor del ATS MVP. Se contempla la posibilidad de migrar a **AWS S3** en una fase posterior del desarrollo ([TK-043](../tasks/tk-043-BE-Implementar-Almacenamiento-CV.md)). Esta decisión inicial prioriza la simplicidad en las primeras etapas, aunque la migración futura deberá planificarse cuidadosamente.
* **Seguridad (Autenticación):** Se implementará la autenticación utilizando **JWT** (JSON Web Tokens). Esto proporcionará un mecanismo stateless para asegurar la [API interna del ATS MVP]((../rfs/rf-21-api-interna-ats-mvp-core-ai.md)). Se utilizará una librería JWT estándar para Node.js. Se considera la gestión segura de la clave secreta y la potencial implementación de tokens de refresco. La integración futura con SSO se alinea bien con JWT.
* **Comunicación API (Frontend y Backend a Core AI):** Se utilizará **Axios** como cliente HTTP para realizar las llamadas a la API del backend del ATS MVP desde el frontend y para las llamadas a la API de Core AI desde el backend del ATS MVP.
* **Hashing de Contraseñas:** Se utilizará una librería estándar y segura como **bcrypt** para el hashing de contraseñas de usuario.
* **Herramientas de Build y Desarrollo:** Se utilizará **Vite** como herramienta principal para el empaquetado (bundling), el entorno de desarrollo local y la preparación para producción.
* **Herramientas de Calidad de Código:** Se utilizarán **ESLint** para el análisis estático (linting) y **Prettier** para el formateo automático del código. Ambas herramientas se configurarán en el proyecto y pueden integrarse en el flujo de trabajo de desarrollo y en el IDE (como Cursor) para garantizar la consistencia y ayudar a prevenir errores.
* **Herramientas de Testing:** Se utilizará **Jest** o **Vitest** (con **Vue Test Utils** para componentes Vue) y **Supertest** para pruebas unitarias y de integración. Se utilizará **Cypress** para pruebas End-to-End (E2E) y **Postman** para pruebas manuales y exploración de APIs.


### 8.3. Gestión de Dependencias

Se utilizarán gestores de paquetes estándar para manejar las librerías y dependencias del proyecto tanto en el backend (npm/yarn/pnpm) como en el frontend (npm/yarn/pnpm).

### 8.4. Pruebas y Calidad del Código

Se seguirá una estrategia de pruebas definida para asegurar la calidad del software ([pp-overview.md](../pp/pp-overview.md)). Esto incluye:

* **Pruebas Unitarias:** Para verificar componentes individuales en aislamiento (backend y frontend), con un objetivo de cobertura (ej. 70-80%).
* **Pruebas de Integración:** Para verificar la comunicación entre capas internas del ATS MVP y, crucialmente, la interacción a través de la [API interna] con TalentIA Core AI.
* **Pruebas de API:** Para validar directamente los endpoints del backend del ATS MVP.
* **Pruebas E2E (End-to-End):** Para simular flujos de usuario completos en el sistema integrado.
* **Pruebas de Regresión:** Un conjunto de pruebas automatizadas para verificar que los cambios no introducen nuevos defectos.
* **Pruebas de Aceptación de Usuario (UAT) / Piloto:** Involucrando a usuarios finales internos.
* **Pruebas Específicas de IA:** Para validar la calidad de los resultados de la IA ([pp-feature-4.md](../pp/pp-feature-4.md)).
* **Pruebas No Funcionales:** Verificación de requisitos de Rendimiento, Seguridad, Usabilidad, Fiabilidad y Mantenibilidad ([pp-overview.md#2-alcance-de-las-pruebas], [pp-overview.md#4-tipos-de-prueba], [pp-overview.md#6-enfoque-específico-para-pruebas-de-ia-core-ai], [pp-overview.md#9-requisitos-no-funcionales-rnfs]).
* **Calidad del Código:** Adherencia a guías de estilo, código modular y legible, comentarios y documentación interna adecuada.

### 8.5. Proceso de Construcción e Implementación (CI/CD)

Se implementará un proceso de Integración Continua y Entrega Continua (CI/CD) para automatizar la construcción, prueba y preparación para el despliegue de nuevas versiones del ATS MVP en los diferentes entornos, como se menciona en [RNF-26] del PRD.


## 9. Estructura Propuesta de Carpetas y Archivos

```text
/ats_mvp/
├── backend/                    # Código del ATS MVP Backend (Node.js/Express)
│   ├── src/
│   │   ├── api/                # Capa de API/Controladores (Recibe peticiones HTTP)
│   │   │   ├── middlewares/    # Middleware (ej. autenticación, autorización)
│   │   │   │   └── auth.middleware.js # Autenticación [TK-005]
│   │   │   ├── controllers/    # Lógica del controlador (llama a servicios)
│   │   │   │   ├── auth.controller.js # Login [TK-003]
│   │   │   │   ├── users.controller.js # Gestión Usuarios [TK-007]
│   │   │   │   ├── vacancies.controller.js # Gestión Vacantes [TK-017, TK-021, TK-022, TK-026]
│   │   │   │   ├── pipeline.controller.js # Gestión Etapas, Datos Kanban [TK-012, TK-090]
│   │   │   │   └── applications.controller.js # Recepción, Detalle, Etapa, Export, Search [TK-042, TK-085, TK-096, TK-131, TK-139, TK-148, TK-158]
│   │   │   ├── routes/         # Definición de rutas [TK-001]
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── users.routes.js
│   │   │   │   ├── vacancies.routes.js
│   │   │   │   ├── pipeline.routes.js
│   │   │   │   └── applications.routes.js
│   │   │   └── validators/     # Validación de schemas de entrada (ej. con Joi)
│   │   ├── config/             # Configuración de la aplicación (DB, JWT Secret, etc.)
│   │   │   └── index.js        # Gestión de variables de entorno, secretos
│   │   ├── services/           # Capa de Lógica de Negocio (Implementa la lógica principal)
│   │   │   ├── user.service.js # Lógica Usuarios [TK-008]
│   │   │   ├── auth.service.js # Lógica JWT [TK-004]
│   │   │   ├── vacancy.service.js # Lógica Vacantes, Plantillas [TK-018, TK-023, TK-027, TK-032]
│   │   │   ├── pipeline.service.js # Lógica Etapas [TK-013], Lógica Datos Kanban [TK-091]
│   │   │   ├── application.service.js # Lógica Recepción, CV Storage, Etapa, Export, Search [TK-044, TK-097, TK-159, TK-149]
│   │   │   ├── fileStorage.service.js # Lógica Almacenamiento CV local/S3 [TK-043]
│   │   │   ├── integration/    # Módulo de Integración/Comunicación con Core AI
│   │   │   │   └── coreAI.client.js # Cliente HTTP para llamar a API Core AI [Axios] [TK-045, TK-051, TK-121, TK-132]
│   │   │   └── admin.service.js # Lógica Configuración General [TK-103]
│   │   ├── repositories/       # Capa de Acceso a Datos (Interacción con ORM/DB)
│   │   │   ├── user.repository.js
│   │   │   ├── vacancy.repository.js
│   │   │   ├── pipeline.repository.js
│   │   │   └── application.repository.js
│   │   ├── database/           # Configuración e inicialización de la base de datos
│   │   │   ├── index.js        # Conexión DB, configuración ORM
│   │   │   └── migrations/     # Scripts de migración DB
│   │   │       ├── ...         # Archivos de migración [TK-006, TK-011, TK-016, TK-030, TK-101]
│   │   │       └── seeds/      # Datos de prueba iniciales
│   │   ├── utils/              # Funciones de utilidad generales (ej. formateo, helpers)
│   │   └── app.js              # Punto de entrada de la aplicación Express
│   ├── tests/                  # Pruebas Backend
│   │   ├── unit/               # Pruebas Unitarias (Servicios, Repositorios) [Jest/Vitest]
│   │   └── integration/        # Pruebas de Integración (Controllers, API endpoints) [Supertest]
│   ├── .env.example            # Variables de entorno de ejemplo
│   ├── .eslintrc.js            # Configuración ESLint
│   ├── .gitignore
│   ├── .prettierrc.js          # Configuración Prettier
│   ├── package.json            # Dependencias y scripts (npm/yarn/pnpm)
│   └── README.md               # README del Backend
│
└── frontend/                   # Código del ATS MVP Frontend (Vue.js)
    ├── public/                 # Archivos estáticos (index.html, favicon, etc.)
    │   └── portal.html         # Punto de entrada para el portal público
    ├── src/
    │   ├── assets/             # Archivos estáticos (imágenes, fuentes)
    │   ├── components/         # Componentes Vue reutilizables
    │   │   ├── common/         # Componentes genéricos (Botones, Inputs, Modales) [Headless UI]
    │   │   ├── layout/         # Componentes de layout (Header, Sidebar)
    │   │   ├── dashboard/      # Widgets Dashboard [TK-156]
    │   │   ├── kanban/         # Componentes Kanban (Board, Card) [TK-092, TK-095]
    │   │   ├── forms/          # Formularios (Crear/Editar Vacante, Aplicación) [TK-019, TK-024, TK-040]
    │   │   ├── lists/          # Tablas/Listas (Usuarios, Etapas, Candidatos) [TK-009, TK-014, TK-087]
    │   │   └── EditorRTE.vue   # Componente Editor JD [TK-053]
    │   ├── router/             # Configuración de Vue Router
    │   │   └── index.js
    │   ├── stores/             # Gestión de Estado (Pinia)
    │   │   ├── auth.store.js
    │   │   ├── user.store.js
    │   │   ├── vacancy.store.js
    │   │   ├── pipeline.store.js
    │   │   └── application.store.js
    │   ├── views/              # Componentes de vista principal (asociados a rutas)
    │   │   ├── auth/           # Vistas de autenticación (Login) [TK-002]
    │   │   ├── admin/          # Vistas de administración (Usuarios, Pipeline Config) [TK-009, TK-014]
    │   │   ├── vacancies/      # Vistas de vacantes (Lista, Crear, Editar, Detalle)
    │   │   ├── applications/   # Vistas de candidaturas (Lista por Vacante, Detalle)
    │   │   ├── portal/         # Vistas del portal público (Lista Vacantes, Aplicar) [TK-038, TK-040]
    │   │   └── dashboard/      # Vista Dashboard [TK-155]
    │   ├── services/           # Lógica para interactuar con la API Backend (cliente API)
    │   │   └── api.js          # Configuración Axios [Axios] [TK-010, TK-015, TK-020, TK-025, TK-029, TK-035, TK-039, TK-041, TK-047, TK-049, TK-088, TK-093, TK-099, TK-105, TK-110, TK-114, TK-118, TK-124, TK-133, TK-152, TK-157, TK-161]
    │   ├── styles/             # Archivos de estilo CSS (Tailwind config, base styles)
    │   │   ├── tailwind.css
    │   │   └── main.css
    │   └── App.vue             # Componente raíz de la aplicación
    ├── tests/                  # Pruebas Frontend
    │   ├── unit/               # Pruebas Unitarias (Stores, Services, Lógica simple) [Jest/Vitest]
    │   └── components/         # Pruebas de Componentes (con Vue Test Utils)
    ├── cypress/                # Pruebas End-to-End [Cypress]
    │   └── integration/        # o e2e/
    │       └── ...             # Archivos de pruebas E2E
    ├── .env.example            # Variables de entorno de ejemplo (Vite)
    ├── .eslintrc.js            # Configuración ESLint
    ├── .gitignore
    ├── .prettierrc.js          # Configuración Prettier
    ├── index.html              # Punto de entrada de la SPA
    ├── package.json            # Dependencias y scripts (npm/yarn/pnpm)
    ├── postcss.config.js       # Configuración PostCSS (para Tailwind)
    ├── README.md               # README del Frontend
    ├── tailwind.config.js      # Configuración Tailwind CSS
    └── vite.config.js          # Configuración Vite
```

## 10. Vista Física / Despliegue (Physical / Deployment View)

Esta sección describe cómo se espera que el ATS MVP sea desplegado en los diferentes entornos (desarrollo, staging, producción) y la infraestructura necesaria.

**Nota:** A la espera de la definición final de la infraestructura de despliegue (ej. en AWS), esta sección se deja para completar con los detalles específicos de servidores, contenedores, orquestación, configuración de red y bases de datos en cada entorno.

*A completar...*

## 11. Requisitos No Funcionales Clave (Resumen para ATS MVP)

Los requisitos no funcionales (NFRs) definen las cualidades del sistema y las restricciones que impactan su arquitectura. Los NFRs completos para la Fase 1 se detallan en la [Sección 9 del PRD TalentIA FInal.md](../prd/PRD%20TalentIA%20FInal.md#9-requisitos-no-funcionales-rnf). A continuación, se resumen los NFRs clave con mayor relevancia directa para la arquitectura e implementación del ATS MVP:

* **Rendimiento y Escalabilidad:**
    * **RNF-01: Tiempos de Respuesta Interactivos (ATS MVP):** Las operaciones comunes de la interfaz de usuario deben completarse rápidamente (< 3 segundos) bajo carga moderada.
    * **RNF-04: Concurrencia de Usuarios (ATS MVP):** El ATS MVP debe soportar hasta 20 usuarios concurrentes realizando operaciones típicas sin degradación significativa del rendimiento.
    * Consulte la [Sección 9.1 del PRD](../prd/PRD%20TalentIA%20FInal.md#91-rendimiento-y-escalabilidad) para más detalles sobre Rendimiento y Escalabilidad.

* **Seguridad:**
    * **RNF-07: Autenticación Robusta:** Acceso al ATS MVP protegido por usuario y contraseña ([US-004](../us/us-04-autenticar-usuarios-ats.md)).
    * **RNF-08: Autorización Basada en Roles:** Control de acceso restringido por roles definidos ([US-003](../us/us-03-gestionar-usuarios-basicos.md)).
    * **RNF-09: Cifrado de Datos en Tránsito:** Toda la comunicación de red debe estar protegida (TLS).
    * **RNF-10: Cifrado de Datos Sensibles en Reposo:** Datos personales y sensibles almacenados deben estar cifrados.
    * **RNF-12: Mitigación de Vulnerabilidades Web Comunes:** Aplicar mejores prácticas de desarrollo seguro (OWASP Top 10).
    * Consulte la [Sección 9.2 del PRD](../prd/PRD%20TalentIA%20FInal.md#92-seguridad) para más detalles sobre Seguridad.

* **Usabilidad y Accesibilidad:**
    * **RNF-15: Intuitividad y Facilidad de Aprendizaje:** Interfaz de usuario del ATS MVP debe ser intuitiva y coherente ([Diseño UX/UI](../ux_ui/ux_ui_overview.md)).
    * **RNF-16: Retroalimentación Clara al Usuario:** Proporcionar indicaciones visuales claras sobre el estado de las operaciones.
    * **RNF-17: Transparencia de la IA:** Indicar claramente qué información proviene de la IA.
    * **RNF-18: Diseño Adaptable Básico (Responsive):** Funcionalidad en resoluciones de escritorio comunes.
    * **RNF-19: Cumplimiento Básico de Accesibilidad:** Seguir pautas WCAG 2.1 Nivel AA básicas.
    * Consulte la [Sección 9.3 del PRD](../prd/PRD%20TalentIA%20FInal.md#93-usabilidad-y-accesibilidad) para más detalles sobre Usabilidad y Accesibilidad.

* **Fiabilidad y Disponibilidad:**
    * **RNF-20: Disponibilidad del Servicio (ATS MVP):** Alta disponibilidad durante horario laboral (99.5%).
    * **RNF-21: Manejo Robusto de Errores:** Gestionar errores de forma controlada y predecible.
    * **RNF-22: Política de Copias de Seguridad y Recuperación:** Implementar backups automáticos y un plan de recuperación para la BBDD del ATS MVP.
    * **RNF-23B: Consistencia de Datos entre Componentes:** Mecanismos para garantizar la integridad y consistencia de datos con Core AI.
    * Consulte la [Sección 9.4 del PRD](../prd/PRD%20TalentIA%20FInal.md#94-fiabilidad-y-disponibilidad) para más detalles sobre Fiabilidad y Disponibilidad.

* **Mantenibilidad y Extensibilidad:**
    * **RNF-24: Calidad y Documentación del Código:** Código modular, legible y documentado.
    * **RNF-25: Arquitectura Modular y Desacoplada:** Facilidad de modificación y despliegue de partes del sistema.
    * **RNF-26: Automatización de Despliegues (CI/CD):** Proceso automatizado de build, test y deploy.
    * **RNF-27: Versionado y Contrato de API Interna:** API interna versionada y documentada ([TK-001](../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md)).
    * **RNF-28: Preparación para Integraciones Futuras:** Diseño que considere futuras integraciones con ATS externos.
    * Consulte la [Sección 9.5 del PRD](../prd/PRD%20TalentIA%20FInal.md#95-mantenibilidad-y-extensibilidad) para más detalles sobre Mantenibilidad y Extensibilidad.

* **Cumplimiento Normativo (Protección de Datos):**
    * **RNF-29: Cumplimiento GDPR/LOPDGDD:** Cumplimiento estricto con la normativa de protección de datos en diseño y operación.
    * **RNF-30: Transparencia en el Uso de IA:** Explicar el uso de IA a los candidatos en políticas de privacidad.
    * Consulte la [Sección 9.6 del PRD](../prd/PRD%20TalentIA%20FInal.md#96-cumplimiento-normativo-protección-de-datos) para más detalles sobre Cumplimiento Normativo.

---