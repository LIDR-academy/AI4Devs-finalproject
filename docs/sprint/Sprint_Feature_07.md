# SPRINT Feature 7: Administración y Configuración

* **Objetivo del SPRINT:** Establecer la base técnica del sistema TalentIA, incluyendo la definición de la API interna, el sistema de autenticación/autorización y la gestión básica de usuarios y etapas del pipeline.
* **Feature Asociada:** Feature 7: Administración y Configuración del Sistema ([docs/features/feature-07-administracion-configuracion-sistema.md](../features/feature-07-administracion-configuracion-sistema.md))
* **User Stories Incluidas:**
    * [US-01: Definir Contrato API Interna](../us/us-01-definir-contrato-api-interna.md)
    * [US-02: Gestionar Etapas del Pipeline de Selección](../us/us-02-gestionar-etapas-pipeline.md)
    * [US-03: Gestionar Cuentas de Usuario y Roles](../us/us-03-gestionar-usuarios-basicos.md)
    * [US-04: Autenticar Usuario para Acceder al Sistema](../us/us-04-autenticar-usuarios-ats.md)
* **Total Story Points (Feature):** 16 SP
* **Total Horas Estimadas (Feature):** 82 horas
* **Estimación Promedio por Persona:** ~5.3 SP / ~27.3 horas
* **Duración Estimada del SPRINT:** ~1.5 semanas

## Tareas del SPRINT por Persona

Aquí se listan las Tareas Técnicas (TKs) para esta Feature, con una propuesta de asignación buscando equilibrar la carga y aprovechar las fortalezas del equipo. Podéis usar los checkboxes para marcar el progreso.

### Jose Luis (Estimación: ~28 horas / ~5.5 SP)

* [ ] [TK-003: BE: Implementar Endpoint de Login](<../tasks/tk-003-be-implementar-endpoint-login.md>) (4h / 1 SP)
* [ ] [TK-004: BE: Implementar Gestión de Sesiones / Generación de Tokens JWT](<../tasks/tk-004-be-implementar-gestion-sesiones-JWT.md>) (3h / 1 SP)
* [ ] [TK-005: BE: Implementar Middleware de Autenticación para Rutas Protegidas](<../tasks/tk-005-be-implementar-mw-routing-protegido.md>) (4h / 1 SP)
* [ ] [TK-007: BE: Implementar Endpoints API RESTful para CRUD de Usuarios](<../tasks/tk-007-be-implementar-endpoints-crud-usuarios.md>) (6h / 1 SP)
* [ ] [TK-008: BE: Implementar Lógica de Negocio para Gestión de Usuarios](<../tasks/tk-008-be-implementar-logica-gestion-usuarios.md>) (5h / 1 SP)
* [ ] [TK-013: BE: Implementar Lógica de Negocio para Gestión de Etapas de Pipeline](<../tasks/tk-013-be-implementar-logica-gestion-etapa-pipeline.md>) (6h / 1 SP)

### Jesus (Estimación: ~26 horas / ~5 SP)

* [ ] [TK-001: ARQ: Definir y Documentar Contrato API v1 (OpenAPI)](<../tasks/tk-001-arq-definir-documentar-contrato-api-v1.md>) (8h / 3 SP)
* [ ] [TK-006: BE: Definir/Actualizar Esquema BBDD para Entidad `Usuario`](<../tasks/tk-006-db-esquema-bbdd-usuario.md>) (2h / 0 SP)
* [ ] [TK-011: BE: Definir/Actualizar Esquema BBDD para Entidad `EtapaPipeline`](<../tasks/tk-011-esquema-bbdd-etapa-pipeline.md>) (2h / 0 SP)
* [ ] [TK-012: BE: Implementar Endpoints API RESTful para CRUD de Etapas de Pipeline](<../tasks/tk-012-be-implementar-endpoints-crud-etapa-pipeline.md>) (8h / 1 SP)
* [ ] [TK-015: FE: Implementar Lógica Frontend para API de Gestión de Etapas Pipeline](<../tasks/tk-015-fe-implementar-logica-gestion-etapa-pipeline.md>) (6h / 1 SP)

### David (Estimación: ~28 horas / ~5.5 SP)

* [ ] [TK-002: FE: Crear Componente y Lógica de Formulario de Login](<../tasks/tk-002-fe-crear-componente-logica-login.md>) (6h / 1 SP)
* [ ] [TK-009: FE: Crear Interfaz de Usuario para Gestión de Usuarios](<../tasks/tk-009-fe-crear-interfaz-gestion-ususarios.md>) (8h / 2 SP)
* [ ] [TK-010: FE: Implementar Lógica Frontend para API de Gestión de Usuarios](<../tasks/tk-010-fe-implementar-logica-gestion-ususarios.md>) (6h / 1 SP)
* [ ] [TK-014: FE: Crear Interfaz de Usuario para Gestión de Etapas de Pipeline](<../tasks/tk-014-fe-crear-interfaz-gestion-etapa-pipeline.md>) (8h / 2 SP)

## Coordinación y Dependencias Clave

* **TK-001 (Contrato API):** Debe ser una de las primeras tareas en abordarse. La definición de los endpoints impacta en los TKs de API de Backend (TK-003, TK-007, TK-012). Asegurad que está consensuada.
* **Esquemas DB (TK-006, TK-011):** Necesarios antes de implementar la lógica de Backend que interactúa con esas tablas.
* **Middleware de Autenticación (TK-005):** Debe estar listo antes de implementar otros endpoints protegidos por autenticación (TK-007, TK-012).
* **API Backend (TK-007, TK-012):** Necesaria antes que la lógica Frontend que las consume (TK-010, TK-015).

## Entregable del SPRINT (Definition of Done para la Feature 7)

* La API interna v1 para Autenticación, Gestión de Usuarios y Gestión de Etapas está definida y documentada.
* Los esquemas de base de datos para `Usuario` y `EtapaPipeline` están creados.
* Los endpoints de backend para Login, CRUD de Usuarios y CRUD/Ordenamiento de Etapas están implementados y protegidos por autenticación/autorización (rol Admin para gestión).
* La interfaz de usuario para Login, Gestión de Usuarios y Gestión de Etapas está implementada.
* La lógica frontend para interactuar con estas APIs está implementada.
* Los usuarios internos pueden autenticarse en el sistema.
* Un usuario con rol Admin puede crear/listar usuarios y gestionar (crear/editar/ordenar/eliminar) las etapas del pipeline, incluyendo marcar etapas seleccionables para IA.
* Todas las pruebas unitarias y de integración relevantes para esta Feature han pasado.

---