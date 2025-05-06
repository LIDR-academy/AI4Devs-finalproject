# SPRINT Feature 1: Gestión del Ciclo de Vida de la Vacante

* **Objetivo del SPRINT:** Implementar la funcionalidad completa para crear, editar, publicar y despublicar vacantes internas, incluyendo la capacidad opcional de usar plantillas.
* **Feature Asociada:** Feature 1: Gestión del Ciclo de Vida de la Vacante ([docs/features/feature-01-gestion-ciclo-vida-vacante.md](../features/feature-01-gestion-ciclo-vida-vacante.md))
* **User Stories Incluidas:**
    * [US-05: Crear Nueva Vacante](../us/us-05-crear-nueva-vacante.md)
    * [US-06: Editar Vacante Existente](../us/us-06-editar-vacante-existente.md)
    * [US-07: Publicar y Despublicar una Vacante](../us/us-07-publicar-despublicar-vacante.md)
    * [US-08: Utilizar Plantillas para Crear Vacantes](../us/us-08-utilizar-plantilla-vacante.md) (Could Have)
* **Total Story Points (Feature):** 13 SP
* **Total Horas Estimadas (Feature):** 74 horas
* **Estimación Promedio por Persona:** ~4.3 SP / ~24.7 horas
* **Duración Estimada del SPRINT:** ~1.5 semanas

## Tareas del SPRINT por Persona

Aquí se listan las Tareas Técnicas (TKs) para esta Feature, con una propuesta de asignación buscando equilibrar la carga y aprovechar las fortalezas.

### Jose Luis (Estimación: ~26 horas / ~5 SP)

* [ ] [TK-016: BE: Definir/Actualizar Esquema BBDD para Entidad `Vacante` (Campos Básicos)](<../tasks/tk-016-db-esquema-bbdd-vacante.md>) (2h / 0 SP)
* [ ] [TK-017: BE: Implementar Endpoint Creación Vacante](<../tasks/tk-017-BE-Implementar-API-Creacion-Vacante.md>) (4h / 1 SP)
* [ ] [TK-018: BE: Implementar Lógica de Negocio para Crear Vacante](<../tasks/tk-018-BE-Implementar-Logica-Creacion-Vacante.md>) (3h / 1 SP)
* [ ] [TK-021: BE: Implementar Endpoint Obtener Detalles Vacante](<../tasks/tk-021-BE-Implementar-API-Obtener-Vacante.md>) (2h / 0 SP)
* [ ] [TK-022: BE: Implementar Endpoint Actualizar Vacante](<../tasks/tk-022-BE-Implementar-API-Actualizar-Vacante.md>) (4h / 1 SP)
* [ ] [TK-023: BE: Implementar Lógica de Negocio para Obtener y Actualizar Vacante](<../tasks/tk-023-BE-Implementar-Logica-Obtener-Actualizar-Vacante.md>) (4h / 1 SP)
* [ ] [TK-026: BE: Implementar Endpoint Actualizar Estado Vacante](<../tasks/tk-026-BE-Implementar-API-Actualizar-Estado-Vacante.md>) (3h / 1 SP)
* [ ] [TK-027: BE: Implementar Lógica de Negocio para Actualizar Estado de Vacante](<../tasks/tk-027-BE-Implementar-Logica-Actualizar-Estado-Vacante.md>) (4h / 1 SP)

### Jesus (Estimación: ~28 horas / ~5 SP)

* [ ] [TK-030: BE: Definir Esquema BBDD para Entidad `VacantePlantilla`](<../tasks/tk-030-DB-Definir-Schema-VacantePlantilla.md>) (2h / 0 SP)
* [ ] [TK-031: BE: Implementar Endpoints API RESTful para CRUD de Plantillas de Vacante](<../tasks/tk-031-BE-Implementar-API-CRUD-PlantillasVacante.md>) (6h / 1 SP)
* [ ] [TK-032: BE: Implementar Lógica de Negocio para Gestión de Plantillas de Vacante](<../tasks/tk-032-BE-Implementar-Logica-Gestion-PlantillasVacante.md>) (5h / 1 SP)
* [ ] [TK-019: FE: Crear Interfaz de Usuario para Formulario "Crear Nueva Vacante"](<../tasks/tk-019-FE-Crear-UI-Formulario-Crear-Vacante.md>) (4h / 1 SP)
* [ ] [TK-020: FE: Implementar Lógica Frontend para API de Creación de Vacante](<../tasks/tk-020-FE-Implementar-Logica-API-Creacion-Vacante.md>) (4h / 1 SP)
* [ ] [TK-028: FE: Implementar Controles de UI para Cambiar Estado de Vacante](<../tasks/tk-028-FE-Implementar-Controles-UI-Cambiar-Estado-Vacante.md>) (3h / 1 SP)
* [ ] [TK-029: FE: Implementar Lógica Frontend para API de Actualización de Estado Vacante](<../tasks/tk-029-FE-Implementar-Logica-API-Actualizar-Estado-Vacante.md>) (3h / 1 SP)

### David (Estimación: ~20 horas / ~3 SP)

* [ ] [TK-024: FE: Crear Interfaz de Usuario para Formulario "Editar Vacante"](<../tasks/tk-024-FE-Crear-UI-Formulario-Editar-Vacante.md>) (5h / 1 SP)
* [ ] [TK-025: FE: Implementar Lógica Frontend para API de Obtención y Actualización de Vacante](<../tasks/tk-025-FE-Implementar-Logica-API-Obtener-Actualizar-Vacante.md>) (5h / 1 SP)
* [ ] [TK-033: FE: Implementar UI y Acción "Guardar como Plantilla"](<../tasks/tk-033-FE-Implementar-UI-GuardarComoPlantilla.md>) (3h / 1 SP)
* [ ] [TK-034: FE: Implementar UI y Acción "Cargar desde Plantilla"](<../tasks/tk-034-FE-Implementar-UI-CargarDesdePlantilla.md>) (4h / 1 SP)
* [ ] [TK-035: FE: Implementar Lógica Frontend para API de Gestión de Plantillas](<../tasks/tk-035-FE-Implementar-Logica-API-Gestion-Plantillas.md>) (4h / 1 SP)

## Coordinación y Dependencias Clave

* **Esquemas DB (TK-016, TK-030):** Necesarios antes de la implementación del backend.
* **Endpoints BE (TKs 017, 021, 022, 026, 031):** Necesarios antes de la lógica FE que los consume (TKs 020, 025, 029, 035) y la UI que los invoca.
* **UI (TKs 019, 024, 028, 033, 034):** La lógica FE depende de estos componentes UI.
* **Plantillas (US-08):** Son Could Have, pueden dejarse para el final del SPRINT o un SPRINT futuro si el tiempo es limitado, pero están incluidas aquí para completar la Feature.

## Entregable del SPRINT (Definition of Done para la Feature 1)

* Los esquemas de base de datos para `Vacante` y `VacantePlantilla` están creados.
* Los endpoints de backend para CRUD y Actualización de Estado de Vacantes, y CRUD de Plantillas están implementados y protegidos.
* La lógica de negocio backend para gestionar Vacantes y Plantillas está implementada.
* La interfaz de usuario y la lógica frontend para crear, editar, publicar/despublicar vacantes están implementadas.
* La interfaz de usuario y la lógica frontend para usar plantillas (guardar/cargar) están implementadas (si se completa US-08).
* Los Reclutadores pueden gestionar el ciclo de vida de las vacantes internas a través del ATS MVP.
* Todas las pruebas unitarias y de integración relevantes para esta Feature han pasado.

---