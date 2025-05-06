# SPRINT Feature 3: Portal de Empleo y Proceso de Aplicación

* **Objetivo del SPRINT:** Implementar la funcionalidad pública para que los candidatos vean vacantes y apliquen, registrando sus candidaturas en el sistema y desencadenando el proceso de IA.
* **Feature Asociada:** Feature 3: Portal de Empleo y Proceso de Aplicación ([docs/features/feature-03-portal-empleo-aplicacion.md](../features/feature-03-portal-empleo-aplicacion.md))
* **User Stories Incluidas:**
    * [US-09: Visualizar Lista de Vacantes Públicas](../us/us-09-visualizar-lista-vacantes.md)
    * [US-10: Aplicar a una Vacante](../us/us-10-aplicar-vacante.md)
    * [US-11: Recepcionar y Almacenar Nueva Candidatura](../us/us-11-recepcionar-almacenar-candidatura.md)
* **Total Story Points (Feature):** 13 SP
* **Total Horas Estimadas (Feature):** 41 horas
* **Estimación Promedio por Persona:** ~4.3 SP / ~13.7 horas
* **Duración Estimada del SPRINT:** ~1 semana

## Tareas del SPRINT por Persona

Aquí se listan las Tareas Técnicas (TKs) para esta Feature, con una propuesta de asignación buscando equilibrar la carga y aprovechar las fortalezas.

### Jose Luis (Estimación: ~23 horas / ~4.5 SP)

* [ ] [TK-036: BE: Adaptar/Implementar Endpoint API Listar Vacantes Públicas](<../tasks/tk-036-BE-Implementar-API-Listar-Vacantes-Publicas.md>) (3h / 1 SP)
* [ ] [TK-037: BE: Implementar Lógica de Negocio para Listar Vacantes Públicas](<../tasks/tk-037-BE-Implementar-Logica-Listar-Vacantes-Publicas.md>) (2h / 0 SP)
* [ ] [TK-042: BE: Implementar Endpoint Recepción Candidatura](<../tasks/tk-042-BE-Implementar-API-Recepcion-Candidatura.md>) (4h / 1 SP)
* [ ] [TK-043: BE: Implementar Almacenamiento Seguro de Archivos CV](<../tasks/tk-043-BE-Implementar-Almacenamiento-CV.md>) (4h / 1 SP)
* [ ] [TK-044: BE: Implementar Lógica de Negocio para Procesar Nueva Aplicación](<../tasks/tk-044-BE-Implementar-Logica-Procesar-Aplicacion.md>) (8h / 2 SP)
* [ ] [TK-045: BE: Desencadenar Procesamiento IA Post-Aplicación](<../tasks/tk-045-BE-Desencadenar-Procesamiento-IA-Post-Aplicacion.md>) (2h / 0 SP)

### Jesus (Estimación: ~18 horas / ~3.5 SP)

* [ ] [TK-044: BE: Implementar Lógica de Negocio para Procesar Nueva Aplicación](<../tasks/tk-044-BE-Implementar-Logica-Procesar-Aplicacion.md>) (Colaboración) (8h / 2 SP)
* [ ] [TK-045: BE: Desencadenar Procesamiento IA Post-Aplicación](<../tasks/tk-045-BE-Desencadenar-Procesamiento-IA-Post-Aplicacion.md>) (Colaboración) (2h / 0 SP)
* [ ] **(Tarea de preparación para siguiente SPRINT)** [TK-062: CAI-BE: Definir Schema BBDD para Entidad `CandidatoIA`](<../tasks/tk-062-CAI-DB-Definir-Schema-CandidatoIA.md>) (2h / 0 SP)
* [ ] **(Tarea de preparación para siguiente SPRINT)** [TK-063: CAI-BE: Implementar Endpoint API Core AI para Crear/Actualizar `CandidatoIA`](<../tasks/tk-063-CAI-BE-Implementar-API-Upsert-CandidatoIA.md>) (3h / 1 SP)
* [ ] **(Tarea de preparación para siguiente SPRINT)** [TK-064: CAI-BE: Implementar Lógica Core AI para Find-Or-Create/Update `CandidatoIA`](<../tasks/tk-064-CAI-BE-Implementar-Logica-Upsert-CandidatoIA.md>) (4h / 1 SP)

### David (Estimación: ~18 horas / ~5 SP)

* [ ] [TK-038: FE: Crear Interfaz de Usuario para Portal Público de Empleo (Lista Vacantes)](<../tasks/tk-038-FE-Crear-UI-Portal-Publico-Lista-Vacantes.md>) (4h / 1 SP)
* [ ] [TK-039: FE: Implementar Lógica Frontend para API de Listado de Vacantes Públicas](<../tasks/tk-039-FE-Implementar-Logica-API-Listar-Vacantes-Publicas.md>) (3h / 1 SP)
* [ ] [TK-040: FE: Crear Interfaz de Usuario para Formulario de Aplicación a Vacante](<../tasks/tk-040-FE-Crear-UI-Formulario-Aplicacion.md>) (5h / 1 SP)
* [ ] [TK-041: FE: Implementar Lógica Formulario Aplicación](<../tasks/tk-041-FE-Implementar-Logica-Formulario-Aplicacion.md>) (6h / 2 SP)

## Coordinación y Dependencias Clave

* **Publicar Vacantes (F1):** Las vacantes deben estar en estado "Publicada" (completado en SPRINT Feature 1) para aparecer en el portal público (US-09).
* **Recepción Candidaturas (US-11):** TK-042 (BE Endpoint) y TK-044 (BE Lógica Procesar) son críticos y dependen de la definición de esquemas DB (`Candidato`, `ArchivoCandidato`, `Candidatura`).
* **Almacenamiento CV (TK-043):** Debe estar listo para que la lógica de procesamiento (TK-044) funcione.
* **Desencadenar IA (TK-045):** Este es el punto de integración clave con Core AI. Depende de que Core AI tenga los endpoints para US-018 y US-019 definidos e implementados (TK-063, TK-065 - **preparación para el siguiente SPRINT**).

## Entregable del SPRINT (Definition of Done para la Feature 3)

* El endpoint de backend para listar vacantes públicas y recibir candidaturas está implementado.
* La lógica backend para listar vacantes públicas, almacenar CVs de forma segura y procesar nuevas candidaturas está implementada.
* Al recibir una nueva candidatura, se desencadena el proceso de gestión del perfil `CandidatoIA` y la invocación de la evaluación IA.
* La interfaz de usuario pública para el portal de empleo (listado de vacantes publicadas) está implementada.
* La interfaz de usuario y la lógica frontend para el formulario de aplicación (con subida de CV) están implementadas.
* Los candidatos externos pueden ver vacantes publicadas y aplicar a ellas a través del portal, y sus aplicaciones se registran en el sistema.
* Todas las pruebas unitarias y de integración relevantes para esta Feature han pasado.

---