# Glosario

## Dominio BPMN

| Termino | Definicion |
|---|---|
| **BPMN** | Business Process Model and Notation — estandar grafico para modelar procesos de negocio |
| **Diagrama BPMN** | Representacion visual de un proceso (archivo .bpmn con XML) |
| **bpmn-js** | Libreria JavaScript para renderizar y editar diagramas BPMN 2.0 en el navegador |
| **Elemento BPMN** | Nodo individual en un diagrama (task, gateway, event, pool, lane, etc.) |
| **XML BPMN** | Representacion serializada del diagrama en formato BPMN 2.0 XML |
| **Sanitizador BPMN** | Funcion que corrige XML malformado generado por LLMs (cierra tags huerfanos, corrige errores comunes) |

## Entidades principales

| Entidad | Descripcion |
|---|---|
| **User** | Usuario del sistema. Roles: `free`, `subscription`, `admin`. Se autentica via Google OAuth o SAML. |
| **BpmnDiagram** | Un diagrama BPMN individual. Tiene `current_xml`, version actual, tags. |
| **BpmnVersion** | Snapshot inmutable de un diagrama en un momento dado. Pertenece a un `diagram_id`. Tiene `xml_content`, `commit_message`, `parent_version`. |
| **Branch** (diagrama) | Rama de desarrollo de un diagrama. Similar a git branch: tiene `base_version`, `current_xml`, `is_merged`. |
| **Project** | Agrupacion de diagramas, archivos, specs y codigo. Tiene `active_branch_id` que define el branch activo. |
| **ProjectBranch** | Rama de proyecto (git-like). Contiene snapshots de archivos (`file_ids`), diagramas (`diagram_ids`), specs (`spec_ids`) y codigo (`code_snapshot_ids`). Soporta merge con resolucion de conflictos. |
| **ProjectFileNode** | Nodo del arbol de archivos de un proyecto. Tipo `file` o `directory`. El contenido puede ser Markdown, BPMN XML, o codigo. Pertenece a un `branch_id`. |
| **Specification** | Documento de especificacion/requisitos de un proyecto. Contiene `requirements` con codigo, titulo, descripcion, prioridad MoSCoW. |
| **OOPClass** | Definicion de clase orientada a objetos vinculable a elementos BPMN. Tiene `properties` (atributos con tipo, validaciones, referencias). |
| **BpmnComponent** | Fragmento BPMN reutilizable (sub-proceso, patron comun). Tiene `xml_fragment`, categoria, tags. |
| **GitRepository** | Vinculacion de un proyecto/diagrama con un repositorio GitHub. Sincroniza archivos bidireccionalmente. |
| **Comment** | Comentario en un elemento especifico de un diagrama. Soporta respuestas anidadas (`parent_comment_id`) y menciones. |
| **Notification** | Notificacion a un usuario (mencion en comentario, cambio en diagrama compartido). |
| **Favorite** | Marcador de diagrama favorito para acceso rapido. |
| **Announcement** | Banner de anuncio global (admin). Los usuarios pueden descartarlo. |
| **NewsPost** | Noticia/post del admin con broadcast por email a usuarios suscritos. |
| **ScheduledTask** | Tarea programada cron-like con ejecucion LLM opcional (DeepSeek). Tiene historial de ejecuciones (`task_executions`). |
| **CustomSchema** | Esquema JSON personalizado para validar datos en proyectos enterprise. |
| **ResourceShare** | Permiso de comparticion de un recurso (diagrama, proyecto) entre usuarios. Roles: `viewer`, `editor`. |
| **Issue** | Incidencia/bug reportado por usuarios. |
| **AuditLog** | Registro de auditoria de acciones criticas (login, cambios de permiso, etc.). |
| **LandingEvent** | Evento de analitica de la landing page (anonimo, TTL 90 dias). |
| **PhaseSnapshot** | Snapshot de una fase del arbol de proyecto (fases A-E: analisis, diseno, implementacion). |
| **CodeGeneration** | Resultado de generacion de codigo via IA desde specs + diagramas. |
| **Session** | Token de sesion opaco (UUID v4) almacenado en `user_sessions`. 7 dias de expiracion. |

## Siglas internas

| Sigla | Significado |
|---|---|
| **RLS** | Row-Level Security — filtrado de queries MongoDB por `created_by` para aislamiento multi-tenant |
| **AI / IA** | Inteligencia Artificial — se refiere a llamadas a proveedores LLM (DeepSeek, MiniMax, MiMo) |
| **CORS** | Cross-Origin Resource Sharing — configurado para permitir frontend en origenes especificos |
| **CSP** | Content-Security-Policy — header HTTP de seguridad configurado en server.py |
| **HSTS** | HTTP Strict-Transport-Security — header para forzar HTTPS |
| **XFO** | X-Frame-Options — header para prevenir clickjacking |
| **MoSCoW** | Must-have, Should-have, Could-have, Won't-have — priorizacion de requisitos |
| **OOP** | Object-Oriented Programming — clases y propiedades vinculables a elementos BPMN |
| **SSO** | Single Sign-On — autenticacion enterprise via SAML 2.0 |
| **SP** | Service Provider — el rol del backend en SAML (el proveedor de servicio) |
| **IdP** | Identity Provider — el proveedor de identidad en SAML (Google, Azure AD, Okta) |
| **CRA** | Create React App — el bootstrap original de React |
| **CRACO** | Create React App Configuration Override — permite modificar configuracion webpack sin eject |
| **L1 / L2** | Niveles de cache: L1 = memoria (dict), L2 = Redis |
| **TTL** | Time To Live — tiempo de expiracion de cache o datos temporales |
| **VPS** | Virtual Private Server — Ubuntu en OVH/Hetzner (IP 37.187.159.167) |
| **LLM** | Large Language Model — modelo de lenguaje (DeepSeek V4, MiniMax M3, MiMo V2 Pro) |

## Planes y limites

| Plan | Limites |
|---|---|
| **free** | 1 proyecto, 3 diagramas/proyecto, 2 diagramas total, 6 llamadas IA/mes, 10 clases OOP, 10 componentes, sin exportacion |
| **subscription** | Sin limites [PENDIENTE: confirmar limites exactos] |
| **admin** | Sin limites + acceso a paneles de administracion |
