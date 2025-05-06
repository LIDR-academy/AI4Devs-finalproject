# SPRINT Feature 2: Asistencia IA para Descripción de Puesto (JD)

* **Objetivo del SPRINT:** Implementar la funcionalidad para generar borradores de JD asistidos por IA y permitir la configuración de los parámetros de evaluación IA por vacante.
* **Feature Asociada:** Feature 2: Asistencia IA para Descripción de Puesto (JD) ([docs/features/feature-02-asistencia-ia-descripcion-puesto.md](../features/feature-02-asistencia-ia-descripcion-puesto.md))
* **User Stories Incluidas:**
    * [US-12: Solicitar Generación de Descripción de Puesto (JD) con IA](../us/us-12-solicitar-generacion-jd-con-IA.md)
    * [US-13: Configurar Parámetros de Evaluación IA para la Vacante](../us/us-13-configurar-parametros-ia-jd.md)
    * [US-14: Recibir y Editar Descripción de Puesto (JD) Generada por IA](../us/us-14-recibir-editar-JD-generada-IA.md)
    * [US-15: Generar Borrador de JD Usando IA (Capacidad Core AI)](../us/us-15-generar-borrador-JD-IA.md)
    * [US-16: Almacenar Parámetros de Evaluación IA Asociados a Vacante (Capacidad Core AI)](../us/us-16-almacenar-parametros-evaluacion-IA-vacante.md)
    * [US-17: Enriquecer Generación de JD con Datos Internos (Capacidad Core AI)](../us/us-17-enriquecer-generacion-JD.md) (Should Have)
* **Total Story Points (Feature):** 22 SP
* **Total Horas Estimadas (Feature):** 51 horas
* **Estimación Promedio por Persona:** ~7.3 SP / ~17 horas
* **Duración Estimada del SPRINT:** ~1 semana

## Tareas del SPRINT por Persona

Aquí se listan las Tareas Técnicas (TKs) para esta Feature, con una propuesta de asignación buscando equilibrar la carga y aprovechar las fortalezas (especialmente en IA para Jesus y David).

### Jose Luis (Estimación: ~18 horas / ~3.5 SP)

* [ ] [TK-050: BE: Adaptar API Actualizar Vacante para Recibir Params IA](<../tasks/tk-050-BE-Adaptar-API-Recibir-Params-IA-Vacante.md>) (3h / 1 SP)
* [ ] [TK-051: BE: Adaptar Lógica ATS para Desencadenar Guardado de Params IA en Core AI](<../tasks/tk-051-BE-Adaptar-Logica-Trigger-Guardado-Params-IA.md>) (3h / 1 SP)
* [ ] [TK-059: CAI-BE: Implementar Endpoint API Core AI para Guardar Parámetros IA de Vacante](<../tasks/tk-059-CAI-BE-Implementar-API-Guardar-Params-IA.md>) (3h / 1 SP)
* [ ] [TK-060: CAI-BE: Implementar Lógica Core AI para Almacenar Parámetros IA por Vacante](<../tasks/tk-060-CAI-BE-Implementar-Logica-Guardar-Params-IA.md>) (3h / 0 SP)
* [ ] [TK-055: CAI-BE: Implementar Endpoint API Core AI para Solicitud Generación JD](<../tasks/tk-055-CAI-BE-Implementar-API-Solicitud-Generacion-JD.md>) (3h / 1 SP)
* [ ] [TK-057: CAI-BE: Implementar Integración Segura con API de LLM Externo](<../tasks/tk-057-CAI-BE-Implementar-Integracion-LLM-Externo.md>) (4h / 1 SP)

### Jesus (Estimación: ~15 horas / ~4.5 SP)

* [ ] [TK-056: CAI-BE: Implementar Lógica de Prompt Engineering para Generación de JD](<../tasks/tk-056-CAI-BE-Implementar-Logica-Prompt-Engineering-JD.md>) (5h / 1 SP)
* [ ] [TK-058: CAI-BE: Implementar Manejo de Respuesta LLM y Retorno a ATS](<../tasks/tk-058-CAI-BE-Implementar-Manejo-Respuesta-LLM.md>) (2h / 0 SP)
* [ ] [TK-061: CAI-BE: Investigar e Implementar Uso de Datos Internos para Enriquecer Generación JD](<../tasks/tk-061-CAI-BE-Investigar-Implementar-Enriquecimiento-JD-Datos-Internos.md>) (8h / 8 SP) - **(Should Have)**

### David (Estimación: ~18 horas / ~3.5 SP)

* [ ] [TK-046: FE: Anadir Botón "Generar Descripción con IA" a UI Edición Vacante](<../tasks/tk-046-FE-Anadir-Boton-Generar-JD-IA.md>) (1h / 0 SP)
* [ ] [TK-047: FE: Implementar Lógica Frontend para Invocar API de Generación de JD](<../tasks/tk-047-FE-Implementar-Logica-API-Generar-JD.md>) (2h / 0 SP)
* [ ] [TK-048: FE: Añadir Campos de Configuración IA a UI Edición Vacante](<../tasks/tk-048-FE-Anadir-Campos-Config-IA-Form-Vacante.md>) (3h / 1 SP)
* [ ] [TK-049: FE: Actualizar Lógica Frontend para Enviar Parámetros IA al Guardar Vacante](<../tasks/tk-049-FE-Actualizar-Logica-Envio-Params-IA.md>) (2h / 0 SP)
* [ ] [TK-052: FE: Manejar Respuesta API Generación JD y Actualizar Editor](<../tasks/tk-052-FE-Manejar-Respuesta-API-Generacion-JD.md>) (2h / 0 SP)
* [ ] [TK-053: FE: Implementar/Integrar Componente Editor de Texto Enriquecido (RTE) para JD](<../tasks/tk-053-FE-Implementar-Componente-Editor-RTE-JD.md>) (5h / 1 SP)
* [ ] [TK-054: FE: Asegurar Guardado de Contenido Editado del Editor de JD](<../tasks/tk-054-FE-Asegurar-Guardado-Contenido-Editor-JD.md>) (2h / 0 SP)

## Coordinación y Dependencias Clave

* **Contrato API (TK-001):** Los endpoints para generación y guardado de parámetros IA deben estar definidos.
* **Integración LLM (TK-057):** Es una dependencia fundamental para la generación de JD. Requiere configuración segura de credenciales.
* **Core AI BE (TKs 055-061):** Debe estar implementado antes de que el ATS BE pueda llamarlo y el ATS FE pueda manejar la respuesta.
* **ATS BE (TKs 050, 051):** Necesitan estar implementados antes que la lógica FE para enviar los parámetros.
* **ATS FE (TKs 046-054):** Deben estar implementados para que el usuario pueda interactuar y ver los resultados. TK-053 (Editor RTE) es un componente clave.

## Entregable del SPRINT (Definition of Done para la Feature 2)

* Los endpoints de backend de Core AI para generación de JD y guardado de parámetros IA están implementados.
* La lógica backend de Core AI para construir prompts, interactuar con el LLM y manejar respuestas para generación de JD está implementada.
* La lógica backend de Core AI para almacenar parámetros IA por vacante está implementada.
* La lógica backend del ATS para desencadenar el guardado de parámetros IA en Core AI está implementada.
* La interfaz de usuario frontend para solicitar generación de JD y configurar parámetros IA está implementada en el formulario de vacante.
* La interfaz de usuario frontend para recibir y editar la JD generada por IA (incluyendo el componente editor) está implementada.
* Los Reclutadores pueden usar el ATS MVP para solicitar la generación de JD, editarla y guardar parámetros de evaluación IA por vacante.
* Si se completa US-017 (Should Have), la generación de JD intenta usar datos internos.
* Todas las pruebas unitarias y de integración relevantes para esta Feature han pasado.

---