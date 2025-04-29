# Resumen de Tickets Técnicos (TK) - TalentIA Fase 1

Este documento sirve como índice para los Tickets Técnicos (TK) detallados creados para la implementación de la **Fase 1 de TalentIA (ATS MVP + Core AI)**. Los tickets desglosan las Historias de Usuario (US) en tareas técnicas concretas para el desarrollo. Están agrupados por la User Story principal a la que contribuyen.

Consulta los enlaces a continuación para acceder al detalle de cada User Story y los Tickets Técnicos asociados:

### [US-01: Definir Contrato API Interna](../us/us-01-definir-contrato-api-interna.md)

*   [TK-001: ARQ: Definir y Documentar Contrato API v1 (OpenAPI) entre ATS MVP y Core AI](./tk-001-arq-definir-documentar-contrato-api-v1.md)

### [US-02: Gestionar Etapas del Pipeline](../us/us-02-gestionar-etapas-pipeline.md)

*   [TK-011: BE: Definir/Actualizar Esquema BBDD para Entidad `EtapaPipeline`](./tk-011-esquema-bbdd-etapa-pipeline.md)
*   [TK-012: BE: Implementar Endpoints API RESTful para CRUD de Etapas de Pipeline](./tk-012-be-implementar-endpoints-crud-etapa-pipeline.md)
*   [TK-013: BE: Implementar Lógica de Negocio para Gestión de Etapas de Pipeline](./tk-013-be-implementar-logica-gestion-etapa-pipeline.md)
*   [TK-014: FE: Crear Interfaz de Usuario para Gestión de Etapas de Pipeline](./tk-014-fe-crear-interfaz-gestion-etapa-pipeline.md)
*   [TK-015: FE: Implementar Lógica Frontend para API de Gestión de Etapas Pipeline](./tk-015-fe-implementar-logica-gestion-etapa-pipeline.md)

### [US-03: Gestionar Usuarios Básicos](../us/us-03-gestionar-usuarios-basicos.md)

*   [TK-006: BE: Definir/Actualizar Esquema BBDD para Entidad `Usuario`](./tk-006-db-esquema-bbdd-usuario.md)
*   [TK-007: BE: Implementar Endpoints API RESTful para CRUD de Usuarios](./tk-007-be-implementar-endpoints-crud-usuarios.md)
*   [TK-008: BE: Implementar Lógica de Negocio para Gestión de Usuarios](./tk-008-be-implementar-logica-gestion-usuarios.md)
*   [TK-009: FE: Crear Interfaz de Usuario para Gestión de Usuarios](./tk-009-fe-crear-interfaz-gestion-ususarios.md)
*   [TK-010: FE: Implementar Lógica Frontend para API de Gestión de Usuarios](./tk-010-fe-implementar-logica-gestion-ususarios.md) *(Verificar nombre archivo manual)*

### [US-04: Autenticar Usuarios ATS](../us/us-04-autenticar-usuarios-ats.md)

*   [TK-002: FE: Crear Componente y Lógica de Formulario de Login](./tk-002-fe-crear-componente-logica-login.md)
*   [TK-003: BE: Implementar Endpoint de Login (`POST /api/v1/auth/login`)](./tk-003-be-implementar-endpoint-login.md)
*   [TK-004: BE: Implementar Gestión de Sesiones / Generación de Tokens JWT](./tk-004-be-implementar-gestion-sesiones-JWT.md)
*   [TK-005: BE: Implementar Middleware de Autenticación para Rutas Protegidas](./tk-005-be-implementar-mw-routing-protegido.md)

### [US-05: Crear Nueva Vacante](../us/us-05-crear-nueva-vacante.md)

*   [TK-016: BE: Definir/Actualizar Esquema BBDD para Entidad `Vacante` (Campos Básicos)](./tk-016-db-esquema-bbdd-vacante.md)
*   [TK-017: BE: Implementar Endpoint Creación Vacante (`POST /api/v1/jobs`)](./tk-017-BE-Implementar-API-Creacion-Vacante.md)
*   [TK-018: BE: Implementar Lógica de Negocio para Crear Vacante](./tk-018-BE-Implementar-Logica-Creacion-Vacante.md)
*   [TK-019: FE: Crear Interfaz de Usuario para Formulario "Crear Nueva Vacante"](./tk-019-FE-Crear-UI-Formulario-Crear-Vacante.md)
*   [TK-020: FE: Implementar Lógica Frontend para API de Creación de Vacante](./tk-020-FE-Implementar-Logica-API-Creacion-Vacante.md)

### [US-06: Editar Vacante Existente](../us/us-06-editar-vacante-existente.md)

*   [TK-021: BE: Implementar Endpoint Obtener Detalles Vacante (`GET /api/v1/jobs/{jobId}`)](./tk-021-BE-Implementar-API-Obtener-Vacante.md)
*   [TK-022: BE: Implementar Endpoint Actualizar Vacante (`PATCH /api/v1/jobs/{jobId}`)](./tk-022-BE-Implementar-API-Actualizar-Vacante.md)
*   [TK-023: BE: Implementar Lógica de Negocio para Obtener y Actualizar Vacante](./tk-023-BE-Implementar-Logica-Obtener-Actualizar-Vacante.md)
*   [TK-024: FE: Crear Interfaz de Usuario para Formulario "Editar Vacante"](./tk-024-FE-Crear-UI-Formulario-Editar-Vacante.md)
*   [TK-025: FE: Implementar Lógica Frontend para API de Obtención y Actualización de Vacante](./tk-025-FE-Implementar-Logica-API-Obtener-Actualizar-Vacante.md)

### [US-07: Publicar/Despublicar Vacante](../us/us-07-publicar-despublicar-vacante.md)

*   [TK-026: BE: Implementar Endpoint Actualizar Estado Vacante (`PATCH /api/v1/jobs/{jobId}/status`)](./tk-026-BE-Implementar-API-Actualizar-Estado-Vacante.md)
*   [TK-027: BE: Implementar Lógica de Negocio para Actualizar Estado de Vacante](./tk-027-BE-Implementar-Logica-Actualizar-Estado-Vacante.md)
*   [TK-028: FE: Implementar Controles de UI para Cambiar Estado de Vacante](./tk-028-FE-Implementar-Controles-UI-Cambiar-Estado-Vacante.md)
*   [TK-029: FE: Implementar Lógica Frontend para API de Actualización de Estado Vacante](./tk-029-FE-Implementar-Logica-API-Actualizar-Estado-Vacante.md)

### [US-08: Utilizar Plantillas para Crear Vacantes](../us/us-08-utilizar-plantilla-vacante.md)

*   [TK-030: BE: Definir Esquema BBDD para Entidad `VacantePlantilla`](./tk-030-DB-Definir-Schema-VacantePlantilla.md)
*   [TK-031: BE: Implementar Endpoints API RESTful para CRUD de Plantillas de Vacante](./tk-031-BE-Implementar-API-CRUD-PlantillasVacante.md)
*   [TK-032: BE: Implementar Lógica de Negocio para Gestión de Plantillas de Vacante](./tk-032-BE-Implementar-Logica-Gestion-PlantillasVacante.md)
*   [TK-033: FE: Implementar UI y Acción "Guardar como Plantilla"](./tk-033-FE-Implementar-UI-GuardarComoPlantilla.md)
*   [TK-034: FE: Implementar UI y Acción "Cargar desde Plantilla"](./tk-034-FE-Implementar-UI-CargarDesdePlantilla.md)
*   [TK-035: FE: Implementar Lógica Frontend para API de Gestión de Plantillas](./tk-035-FE-Implementar-Logica-API-Gestion-Plantillas.md)

### [US-09: Visualizar Lista de Vacantes Públicas](../us/us-09-visualizar-lista-vacantes.md)

*   [TK-036: BE: Adaptar/Implementar Endpoint API Listar Vacantes Públicas (`GET /api/v1/jobs`)](./tk-036-BE-Implementar-API-Listar-Vacantes-Publicas.md)
*   [TK-037: BE: Implementar Lógica de Negocio para Listar Vacantes Públicas](./tk-037-BE-Implementar-Logica-Listar-Vacantes-Publicas.md)
*   [TK-038: FE: Crear Interfaz de Usuario para Portal Público de Empleo (Lista Vacantes)](./tk-038-FE-Crear-UI-Portal-Publico-Lista-Vacantes.md)
*   [TK-039: FE: Implementar Lógica Frontend para API de Listado de Vacantes Públicas](./tk-039-FE-Implementar-Logica-API-Listar-Vacantes-Publicas.md)

### [US-10: Aplicar a una Vacante](../us/us-10-aplicar-vacante.md)

*   [TK-040: FE: Crear Interfaz de Usuario para Formulario de Aplicación a Vacante](./tk-040-FE-Crear-UI-Formulario-Aplicacion.md)
*   [TK-041: FE: Implementar Lógica Formulario Aplicación](./tk-041-FE-Implementar-Logica-Formulario-Aplicacion.md)

### [US-11: Recepcionar y Almacenar Nueva Candidatura](../us/us-11-recepcionar-almacenar-candidatura.md)

*   [TK-042: BE: Implementar Endpoint Recepción Candidatura (`POST /api/v1/applications`)](./tk-042-BE-Implementar-API-Recepcion-Candidatura.md)
*   [TK-043: BE: Implementar Almacenamiento Seguro de Archivos CV](./tk-043-BE-Implementar-Almacenamiento-CV.md)
*   [TK-044: BE: Implementar Lógica de Negocio para Procesar Nueva Aplicación](./tk-044-BE-Implementar-Logica-Procesar-Aplicacion.md)
*   [TK-045: BE: Desencadenar Procesamiento IA Post-Aplicación](./tk-045-BE-Desencadenar-Procesamiento-IA-Post-Aplicacion.md)

### [US-12: Solicitar Generación de Descripción de Puesto (JD) con IA](../us/us-12-solicitar-generacion-jd-con-IA.md)

*   [TK-046: FE: Anadir Botón Generar JD IA a Interfaz Edición Vacante](./tk-046-FE-Anadir-Boton-Generar-JD-IA.md)
*   [TK-047: FE: Implementar Lógica API Generar JD](./tk-047-FE-Implementar-Logica-API-Generar-JD.md)

### [US-13: Configurar Parámetros de Evaluación IA para la Vacante](../us/us-13-configurar-parametros-ia-jd.md)

*   [TK-048: FE: Anadir Campos Configuración IA a Formulario Edición Vacante](./tk-048-FE-Anadir-Campos-Config-IA-Form-Vacante.md)
*   [TK-049: FE: Implementar Lógica Envio Parámetros IA](./tk-049-FE-Actualizar-Logica-Envio-Params-IA.md)
*   [TK-050: BE: Adaptar API para Recibir Parámetros IA](./tk-050-BE-Adaptar-API-Recibir-Params-IA-Vacante.md)
*   [TK-051: BE: Adaptar Logica Trigger Guardado Parámetros IA](./tk-051-BE-Adaptar-Logica-Trigger-Guardado-Params-IA.md)

### [US-14: Recibir y Editar Descripción de Puesto (JD) Generada por IA](../us/us-14-recibir-editar-JD-generada-IA.md)

*   [TK-052: FE: Manejar Respuesta API Generación JD](./tk-052-FE-Manejar-Respuesta-API-Generacion-JD.md)
*   [TK-053: FE: Implementar Componente Editor RTE JD](./tk-053-FE-Implementar-Componente-Editor-RTE-JD.md)
*   [TK-054: FE: Asegurar Guardado de Contenido Editado del Editor de JD](./tk-054-FE-Asegurar-Guardado-Contenido-Editor-JD.md)

### [US-15: Generar Borrador de JD Usando IA (Capacidad Core AI)](../us/us-15-generar-borrador-JD-IA.md)

*   [TK-055: CAI-BE: Implementar API Solicitud Generación JD](./tk-055-CAI-BE-Implementar-API-Solicitud-Generacion-JD.md)
*   [TK-056: CAI-BE: Implementar Logica Prompt Engineering JD](./tk-056-CAI-BE-Implementar-Logica-Prompt-Engineering-JD.md)
*   [TK-057: CAI-BE: Implementar Integración LLM Externo](./tk-057-CAI-BE-Implementar-Integracion-LLM-Externo.md)
*   [TK-058: CAI-BE: Implementar Manejo Respuesta LLM](./tk-058-CAI-BE-Implementar-Manejo-Respuesta-LLM.md)

### [US-16: Almacenar Parámetros de Evaluación IA Asociados a Vacante (Capacidad Core AI)](../us/us-16-almacenar-parametros-evaluacion-IA-vacante.md)

*   [TK-059: CAI-BE: Implementar Endpoint API Core AI para Guardar Parámetros IA](./tk-059-CAI-BE-Implementar-API-Guardar-Params-IA.md)
*   [TK-060: CAI-BE: Implementar Lógica de Negocio para Guardar Parámetros IA](./tk-060-CAI-BE-Implementar-Logica-Guardar-Params-IA.md)

###  [US-17: Enriquecer Generación de JD con Datos Internos (Capacidad Core AI)](../us/us-17-enriquecer-generacion-JD.md)

*   [TK-061: CAI-BE: Investigar Implementar Enriquecimiento de JD con Datos Internos](./tk-061-CAI-BE-Investigar-Implementar-Enriquecimiento-JD-Datos-Internos.md)

### [US-18: Gestionar Perfil Unificado de Candidato en IA (Capacidad Core AI)](../us/us-18-gestionar-perfil-unidicado-candidato-IA.md)

*   [TK-062: CAI-BE: Definir Schema BBDD para Entidad `CandidatoIA`](./tk-062-CAI-BE-Definir-Schema-CandidatoIA.md)
*   [TK-063: CAI-BE: Implementar Endpoint API Core AI para Crear/Actualizar `CandidatoIA`](./tk-063-CAI-BE-Implementar-API-Upsert-CandidatoIA.md)
*   [TK-064: CAI-BE: Implementar Lógica de Negocio para Find-Or-Create/Update `CandidatoIA`](./tk-064-CAI-BE-Implementar-Logica-Upsert-CandidatoIA.md)

### [US-19: Invocar Evaluación IA para Nueva Candidatura](../us/us-19-invocar-evaluacion-ia-nueva-candidatura.md)

*   [TK-065: CAI-BE: Implementar API Recibir Solicitud Evaluación](./tk-065-CAI-BE-Implementar-API-Recibir-Solicitud-Evaluacion.md)
*   [TK-066: CAI-BE: Implementar Logica Iniciar Evaluación](./tk-066-CAI-BE-Implementar-Logica-Iniciar-Evaluacion.md)

### [US-20: Extraer Datos Estructurados del CV (Capacidad Core AI)](../us/us-20-extraer-datos-estructurados-cv-core-ai.md)

*   [TK-067: CAI-BE: Obtener Contenido Archivo CV](./tk-067-CAI-BE-Obtener-Contenido-Archivo-CV.md)
*   [TK-068: CAI-BE: Extraer Texto PDF/DOCX](./tk-068-CAI-BE-Extraer-Texto-PDF-DOCX.md)
*   [TK-069: CAI-BE: Implementar Parsing Texto CV](./tk-069-CAI-BE-Implementar-Parsing-Texto-CV.md)
*   [TK-070: CAI-BE: Implementar Almacenamiento Datos Parseados CV](./tk-070-CAI-BE-Implementar-Almacenamiento-Datos-Parseados-CV.md)

### [US-21: Calcular Score de Idoneidad Candidato vs Vacante (Capacidad Core AI)](../us/us-21-calcular-score-idoneidad-candidato-vs-vacante-core-ai.md)

*   [TK-071: CAI-BE: Recuperar Inputs para Scoring](./tk-071-CAI-BE-Recuperar-Inputs-Scoring.md)
*   [TK-072: CAI-BE: Implementar Algoritmo Scoring v1](./tk-072-CAI-BE-Implementar-Algoritmo-Scoring-v1.md)
*   [TK-073: CAI-BE: Implementar Almacenamiento Scores](./tk-073-CAI-BE-Implementar-Almacenamiento-Scores.md)

### [US-22: Comparar Score Calculado con Umbral de Corte (Capacidad Core AI)](../us/us-22-comparar-score-calculado-umbral-corte-core-ai.md)

*   [TK-074: CAI-BE: Implementar Logica Comparacion Score](./tk-074-CAI-BE-Implementar-Logica-Comparacion-Score.md)

### [US-23: Determinar Etapa de Pipeline Sugerida (Capacidad Core AI)](../us/us-23-determinar-etapa-pipeline-sugerida-core-ai.md)

*   [TK-075: CAI-BE: Implementar Logica Determinar Etapa Sugerida](./tk-075-CAI-BE-Implementar-Logica-Determinar-Etapa-Sugerida.md)

### [US-24: Devolver Resultados Completos de Evaluación IA al ATS (Capacidad Core AI)](../us/us-24-devolver-resultados-completos-evaluacion-ia-ats-core-ai.md)

*   [TK-076: CAI-BE: Implementar Formateo Retorno Respuesta Evaluación](./tk-076-CAI-BE-Implementar-Formateo-Retorno-Respuesta-Evaluacion.md)

### [US-25: Generar Resumen Ejecutivo del Candidato vs Vacante (Capacidad Core AI)](../us/us-25-generar-resumen-ejecutivo-candidato-vs-vacante-core-ai.md)

*   [TK-077: CAI-BE: Implementar Logica Prompt Engineering Resumen](./tk-077-CAI-BE-Implementar-Logica-Prompt-Engineering-Resumen.md)
*   [TK-078: CAI-BE: Implementar Orquestacion LLM Generacion Resumen](./tk-078-CAI-BE-Implementar-Orquestacion-LLM-Generacion-Resumen.md)
*   [TK-079: CAI-BE: Implementar Almacenamiento Resumen Generado](./tk-079-CAI-BE-Implementar-Almacenamiento-Resumen-Generado.md)

### [US-26: Identificar/Evaluar Soft Skills del CV (Capacidad Core AI)](../us/us-26-identificar-evaluar-soft-skills-cv-core-ai.md)

*   [TK-080: CAI-BE: Investigar Implementar Identificacion Soft Skills](./tk-080-CAI-BE-Investigar-Implementar-Identificacion-Soft-Skills.md)

### [US-27: Mostrar Evaluación IA en Perfil de Candidatura](../us/us-27-mostrar-evaluacion-ia-perfil-candidatura.md)

*   [TK-081: FE: Anadir Visualizacion Score IA a Detalle Candidatura](./tk-081-FE-Anadir-Visualizacion-Score-IA-UI-Detalle.md)
*   [TK-082: FE: Asegurar Disponibilidad Score IA en Datos Perfil Candidatura](./tk-082-FE-Asegurar-Disponibilidad-Score-IA-Datos-FE.md)

### [US-28: Mostrar Etapa de Pipeline Sugerida por IA](../us/us-28-mostrar-etapa-pipeline-sugerida-ia.md)

*   [TK-083: FE: Anadir Visualizacion Etapa Pipeline Sugerida a Detalle Candidatura](./tk-083-FE-Anadir-Visualizacion-Etapa-Sugerida-IA.md)
*   [TK-084: FE: Asegurar Disponibilidad Etapa Pipeline Sugerida en Datos Perfil Candidatura](./tk-084-FE-Asegurar-Disponibilidad-Etapa-Sugerida-IA-Datos-FE.md)

### [US-29: Visualizar Lista de Candidatos por Vacante](../us/us-29-visualizar-lista-candidatos-vacante.md)

*   [TK-085: BE: Implementar Endpoint API Listar Candidaturas por Vacante](./tk-085-BE-implementar-endpoint-api-listar-candidaturas-vacante.md)
*   [TK-086: BE: Implementar Lógica de Negocio para Listar Candidaturas por Vacante](./tk-086-BE-implementar-logica-negocio-listar-candidaturas-vacante.md)
*   [TK-087: FE: Crear Interfaz de Usuario para Lista de Candidatos por Vacante](./tk-087-FE-crear-interfaz-usuario-lista-tabla-candidatos-vacante.md)
*   [TK-088: FE: Implementar Lógica Frontend para API de Listado de Candidatos por Vacante](./tk-088-FE-implementar-logica-frontend-api-listar-candidaturas.md)
*   [TK-089: FE: Implementar Navegacion entre Lista y Detalle de Candidatura](./tk-089-FE-implementar-navegacion-lista-candidatos-detalle.md)

### [US-30: Visualizar Pipeline de Selección en Tablero Kanban](../us/us-30-visualizar-pipeline-seleccion-tablero-kanban.md)

*   [TK-090: BE: Adaptar/Crear Endpoint API para Datos Kanban](./tk-090-BE-adaptar-crear-endpoint-api-datos-kanban.md) 
*   [TK-091: BE: Implementar Logica de Negocio para Datos Kanban](./tk-091-BE-implementar-logica-negocio-datos-kanban.md) 
*   [TK-092: FE: Crear Componente UI Tablero Kanban](./tk-092-FE-crear-componente-ui-tablero-kanban.md) 
*   [TK-093: FE: Implementar Lógica Frontend para API de Datos Kanban](./tk-093-FE-implementar-logica-frontend-api-datos-kanban-etapas.md) 
*   [TK-094: FE: Renderizar Columnas y Tarjetas en Tablero Kanban](./tk-094-FE-renderizar-columnas-tarjetas-kanban.md) 
*   [TK-095: FE: Añadir Visualización Info Básica (Nombre, Score, Sugerencia) a Tarjeta Kanban](./tk-095-FE-anadir-visualizacion-info-basica-tarjeta-kanban.md)

### [US-31: Mover Candidato entre Etapas del Pipeline](../us/us-31-mover-candidato-entre-etapas-pipeline.md)

*   [TK-096: BE: Implementar Endpoint API Actualizar Etapa Candidatura](./tk-096-BE-implementar-endpoint-api-actualizar-etapa-candidatura.md)
*   [TK-097: BE: Implementar Logica de Negocio Actualizar Etapa Candidatura](./tk-097-BE-implementar-logica-negocio-actualizar-etapa-candidatura.md)
*   [TK-098: FE: Implementar Funcionalidad Drag-and-Drop en Kanban](./tk-098-FE-implementar-funcionalidad-drag-and-drop-kanban.md)
*   [TK-099: FE: Implementar Logica Frontend para API Actualizar Etapa](./tk-099-FE-implementar-logica-api-actualizar-etapa-frontend.md)
*   [TK-100: FE: Implementar Control UI Cambiar Etapa en Detalle](./tk-100-FE-implementar-control-ui-cambiar-etapa-detalle.md)

### [US-32: Automatizar (Opcionalmente) Movimiento Inicial a Etapa Sugerida](../us/us-32-automatizar-opcionalmente-movimiento-inicial-etapa-sugerida.md)

*   [TK-101: BE-DB: Definir Esquema/Tabla para Configuración Global del Sistema](./tk-101-DB-definir-schema-tabla-configuracion-global.md)
*   [TK-102: BE-API: Implementar Endpoints API para Gestión Configuración Global (GET/PUT)](./tk-102-BE-API-implementar-endpoints-gestion-configuracion-global.md)
*   [TK-103: BE-Logic: Implementar Lógica de Negocio Leer/Escribir Configuración Global](./tk-103-BE-Logic-implementar-logica-negocio-leer-escribir-configuracion-global.md)
*   [TK-104: FE-UI: Crear Interfaz Usuario para Gestionar Configuración Global (Checkbox Automatización)](./tk-104-FE-UI-crear-interfaz-usuario-gestionar-configuracion-global.md)
*   [TK-105: FE-Logic: Implementar Lógica Frontend para API Configuración Global](./tk-105-FE-Logic-implementar-logica-frontend-api-configuracion-global.md)
*   [TK-106: BE-Logic: Modificar Lógica Post-Evaluación para Mover Candidato Automáticamente según Config](./tk-106-BE-Logic-modificar-logica-post-evaluacion-mover-automaticamente.md)


### [US-33: Mostrar Resumen Generado por IA en Perfil de Candidatura](../us/us-33-mostrar-resumen-generado-ia-perfil-candidatura.md)

*   [TK-107: BE-API: Asegurar/Incluir campo `resumen_ia` en respuesta API de Detalle Candidatura](./tk-107-BE-API-asegurar-incluir-campo-resumen-ia-respuesta-api-detalle-candidatura.md)
*   [TK-108: BE-Logic: Asegurar Almacenamiento/Recuperación de `res umen_ia` en ATS](./tk-108-BE-Logic-asegurar-almacenamiento-recuperacion-resumen-ia-ats.md)
*   [TK-109: FE-UI: Añadir Sección/Campo Mostrar Resumen IA en Detalle Candidatura](./tk-109-FE-UI-anadir-seccion-campo-mostrar-resumen-ia-detalle.md)
*   [TK-110: FE-Logic: Obtener/Manejar campo `resumen_ia` en Detalle Candidatura](./tk-110-FE-Logic-obtener-manejar-resumen-ia-detalle.md)

### [US-34: Ordenar y Filtrar Lista de Candidatos por Score IA](../us/us-34-ordenar-filtrar-lista-candidatos-score-ia.md)

*   [TK-111: BE-API: Adaptar API Listar Candidaturas para Soportar Ordenación por Score](./tk-111-BE-API-adaptar-api-listar-candidaturas-ordenacion-score.md)
*   [TK-112: BE-Logic: Implementar Lógica de Negocio Ordenación por Score IA](./tk-112-BE-Logic-implementar-logica-negocio-ordenacion-score-ia.md)
*   [TK-113: FE-UI: Hacer Clickable Cabecera Columna Score IA para Ordenar](./tk-113-FE-UI-hacer-clickable-cabecera-columna-score-ia-ordenar.md)
*   [TK-114: FE-Logic: Implementar Lógica Frontend para Ordenar por Score IA](./tk-114-FE-Logic-implementar-logica-frontend-ordenar-score-ia.md)
*   [TK-115: BE-API: (Opcional) Adaptar API Listar Candidaturas para Soportar Filtrado por Rango de Score](./tk-115-BE-API-opcional-adaptar-api-listar-candidaturas-filtrado-score.md)
*   [TK-116: BE-Logic: (Opcional) Implementar Lógica de Negocio Filtrado por Rango de Score IA](./tk-116-BE-Logic-opcional-implementar-logica-negocio-filtrado-score-ia.md)
*   [TK-117: FE-UI: (Opcional) Añadir Controles UI para Filtrar por Rango de Score](./tk-117-FE-UI-opcional-anadir-controles-filtrar-rango-score.md)
*   [TK-118: FE-Logic: (Opcional) Implementar Lógica Frontend para Filtrar por Rango de Score IA](./tk-118-FE-Logic-opcional-implementar-logica-frontend-filtrar-score-ia.md)


### [US-35: Consultar Historial de Aplicaciones Anteriores del Candidato](../us/us-35-consultar-historial-aplicaciones-anteriores-candidato.md)

*   [TK-119: CAI-BE-API: Implementar Endpoint API Obtener Detalles CandidatoIA (incl. `candidaturas_ids`)](./tk-119-CAI-BE-API-implementar-endpoint-obtener-detalles-candidato-ia.md)
*   [TK-120: CAI-BE-Logic: Implementar Lógica de Negocio Obtener Detalles CandidatoIA](./tk-120-CAI-BE-Logic-implementar-logica-negocio-obtener-detalles-candidato-ia.md)
*   [TK-121: BE-Logic: Implementar Lógica ATS para Obtener y Procesar Historial Aplicaciones](./tk-121-BE-Logic-implementar-logica-ats-obtener-procesar-historial-aplicaciones.md)
*   [TK-122: BE-API: Adaptar API Detalle Candidatura ATS para Incluir Historial](./tk-122-BE-API-adaptar-api-detalle-candidatura-ats-incluir-historial.md)
*   [TK-123: FE-UI: Añadir Sección "Historial de Aplicaciones" a Vista Detalle Candidatura](./tk-123-FE-UI-anadir-seccion-historial-aplicaciones-detalle-candidatura.md)
*   [TK-124: FE-Logic: Manejar y Pasar Datos de Historial a Componente UI Detalle](./tk-124-FE-Logic-manejar-pasar-datos-historial-componente-ui-detalle.md)


### [US-36: Comparar Perfiles de Candidatos Lado a Lado](../us/us-36-comparar-perfiles-candidatos-lado-lado.md)

*   [TK-127: FE-UI: Añadir Selección Múltiple y Botón Comparar a Lista Candidatos](./tk-127-FE-UI-anadir-seleccion-multiple-boton-comparar-lista-candidatos.md)
*   [TK-128: FE-Logic: Gestionar Estado de Selección Múltiple en Lista Candidatos](./tk-128-FE-Logic-gestionar-estado-seleccion-multiple-lista-candidatos.md)
*   [TK-129: FE-UI: Crear Componente UI Vista Comparación Lado a Lado](./tk-129-FE-UI-crear-componente-vista-comparacion-lado-a-lado.md)
*   [TK-130: FE-Logic: Obtener Datos y Orquestar Vista Comparación](./tk-130-FE-Logic-obtener-datos-orquestar-vista-comparacion.md)

### [US-37: Capturar Feedback Básico sobre Evaluación IA](../us/us-37-capturar-feedback-basico-evaluacion-ia.md)

*   [TK-125: FE-UI: Añadir Controles de Feedback Básico (👍/👎) a Vista Detalle Candidatura](./tk-125-FE-UI-anadir-controles-feedback-basico-detalle-candidatura.md)
*   [TK-126: FE-Logic: Manejar Estado y Evento Click para Feedback Básico](./tk-126-FE-Logic-manejar-estado-evento-click-feedback-basico.md)

### [US-38: Enviar Feedback Capturado a Core AI](../us/us-38-enviar-feedback-capturado-core-ai.md)

*   [TK-131: BE-API: Implementar Endpoint ATS para Recibir Solicitud Envío Feedback (`POST /api/v1/feedback`)](./tk-131-BE-API-implementar-endpoint-ats-recibir-solicitud-envio-feedback.md)
*   [TK-132: BE-Logic: Implementar Lógica ATS para Enviar Feedback a Core AI](./tk-132-BE-Logic-implementar-logica-ats-enviar-feedback-core-ai.md)
*   [TK-133: FE-Logic: Implementar Lógica Frontend para Llamar a API ATS de Envío Feedback](./tk-133-FE-Logic-implementar-logica-frontend-llamar-api-ats-envio-feedback.md)
*   [TK-134: CAI-BE-API: (Asegurar/Definir) Endpoint API Core AI para Recibir Feedback](./tk-134-CAI-BE-API-asegurar-definir-endpoint-coreai-recibir-feedback.md)

### [US-39: Recibir y Almacenar Feedback de Usuario (Capacidad Core AI)](../us/us-39-recibir-almacenar-feedback-usuario-core-ai.md) 

*   [TK-135: CAI-DB: Definir Esquema BBDD para Entidad `RegistroFeedbackIA`](./tk-135-CAI-DB-definir-schema-bbdd-entidad-registrofeedbackia.md)
*   [TK-136: CAI-BE-Logic: Implementar Lógica de Negocio para Validar y Almacenar Feedback Recibido](./tk-136-CAI-BE-Logic-implementar-logica-negocio-validar-almacenar-feedback.md)

### [US-40: Capturar Feedback Detallado sobre Evaluación IA](../us/us-40-capturar-feedback-detallado-evaluacion-ia.md)

*   [TK-138: FE-Logic: Manejar Estado y Construir Payload para Feedback Detallado](./tk-138-FE-Logic-manejar-estado-construir-payload-feedback-detallado.md)
*   [TK-139: BE-API: (Asegurar/Refinar) API Detalle Candidatura Incluye Skills Detectadas](./tk-139-BE-API-asegurar-refinar-api-detalle-candidatura-incluye-skills.md)
*   [TK-137: FE-UI: Añadir Controles Feedback Detallado (Editar Score, Validar Skills, Comentarios)](./tk-137-FE-UI-anadir-controles-feedback-detallado-detalle-candidatura.md)
*   [TK-140: BE-Logic: (Asegurar/Refinar) Lógica ATS Almacena/Recupera Skills Detectadas](./tk-140-BE-Logic-asegurar-refinar-logica-ats-almacena-recupera-skills.md)


### [US-41: Recibir Notificaciones Internas sobre Eventos Clave](../us/us-41-recibir-notificaciones-internas-eventos-clave.md)

*   [TK-141: BE-DB: Definir Esquema BBDD para Entidad `Notificacion`](./tk-141-BE-DB-definir-schema-bbdd-entidad-notificacion.md)
*   [TK-142: BE-Logic: Implementar Lógica Generación Notificaciones en Eventos Clave](./tk-142-BE-Logic-implementar-logica-generacion-notificaciones-eventos-clave.md)
*   [TK-143: BE-API: Implementar Endpoints API para Gestión Notificaciones (Contar, Listar, Marcar Leídas)](./tk-143-BE-API-implementar-endpoints-gestion-notificaciones.md)
*   [TK-144: BE-Logic: Implementar Lógica de Negocio para API Gestión Notificaciones](./tk-144-BE-Logic-implementar-logica-negocio-api-gestion-notificaciones.md)
*   [TK-145: FE-UI: Añadir Indicador Notificaciones (Campana+Badge) a Layout Principal](./tk-145-FE-UI-anadir-indicador-notificaciones-layout-principal.md)
*   [TK-146: FE-UI: Crear Componente Panel/Lista de Notificaciones](./tk-146-FE-UI-crear-componente-panel-lista-notificaciones.md)
*   [TK-147: FE-Logic: Implementar Lógica Frontend para API Notificaciones](./tk-147-FE-Logic-implementar-logica-frontend-api-notificaciones.md)

### [US-42: Buscar Candidatos por Nombre o Palabra Clave](../us/us-42-buscar-candidatos-nombre-palabra-clave.md)

*   [TK-148: BE-API: Implementar Endpoint API para Búsqueda Básica de Candidaturas](./tk-148-BE-API-implementar-endpoint-busqueda-basica-candidaturas.md)
*   [TK-149: BE-Logic: Implementar Lógica de Negocio para Búsqueda Básica (Multi-campo)](./tk-149-BE-Logic-implementar-logica-negocio-busqueda-basica-multi-campo.md)
*   [TK-150: FE-UI: Añadir Campo de Búsqueda Global en Layout Principal](./tk-150-FE-UI-anadir-campo-busqueda-global-layout-principal.md)
*   [TK-151: FE-UI: Crear Página/Componente para Mostrar Resultados de Búsqueda](./tk-151-FE-UI-crear-pagina-componente-mostrar-resultados-busqueda.md)
*   [TK-152: FE-Logic: Implementar Lógica Frontend para Búsqueda (Llamada API y Navegación)](./tk-152-FE-Logic-implementar-logica-frontend-busqueda-llamada-api-navegacion.md)

### [US-43: Visualizar Dashboard con Métricas Básicas](../us/us-43-visualizar-dashboard-metricas-basicas.md)

*   [TK-153: BE-API: Implementar Endpoint API para Datos del Dashboard Básico](./tk-153-BE-API-implementar-endpoint-datos-dashboard-basico.md)
*   [TK-154: BE-Logic: Implementar Lógica de Negocio para Calcular Métricas del Dashboard](./tk-154-BE-Logic-implementar-logica-negocio-calcular-metricas-dashboard.md)
*   [TK-155: FE-UI: Crear Página/Componente Dashboard Básico](./tk-155-FE-UI-crear-pagina-componente-dashboard-basico.md)
*   [TK-156: FE-UI: Implementar Widgets de Métricas (Números y Gráfico Básico)](./tk-156-FE-UI-implementar-widgets-metricas-numeros-grafico-basico.md)
*   [TK-157: FE-Logic: Implementar Lógica Frontend para API del Dashboard](./tk-157-FE-Logic-implementar-logica-frontend-api-dashboard.md)


### [US-44: Exportar Información Básica de un Candidato](../us/us-44-exportar-informacion-basica-candidato.md)

*   [TK-158: BE-API: Implementar Endpoint API para Exportar Datos Candidatura (`GET /api/v1/applications/{applicationId}/export`)](./tk-158-BE-API-implementar-endpoint-exportar-datos-candidatura.md)
*   [TK-159: BE-Logic: Implementar Lógica de Negocio para Generar Exportación (Datos+CV)](./tk-159-BE-Logic-implementar-logica-negocio-generar-exportacion-datos-cv.md)
*   [TK-160: FE-UI: Añadir Botón "Exportar Datos" a Vista Detalle Candidatura](./tk-160-FE-UI-anadir-boton-exportar-datos-detalle-candidatura.md)
*   [TK-161: FE-Logic: Implementar Lógica Frontend para Iniciar Descarga Exportación](./tk-161-FE-Logic-implementar-logica-frontend-iniciar-descarga-exportacion.md)

*(Nota: Los tickets para otras User Stories se añadirán aquí a medida que se creen)*

---

*Cada Ticket Técnico contiene detalles sobre su descripción, criterios de aceptación técnicos, dependencias, estimación y asignación.*