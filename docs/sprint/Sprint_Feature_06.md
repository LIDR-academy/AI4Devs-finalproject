# SPRINT Feature 6: Sistema de Feedback para IA

* **Objetivo del SPRINT:** Implementar la funcionalidad para que los usuarios proporcionen feedback (básico y detallado) sobre las evaluaciones IA, y para que Core AI reciba y almacene este feedback.
* **Feature Asociada:** Feature 6: Sistema de Feedback para IA ([docs/features/feature-06-sistema-feedback-ia.md](../features/feature-06-sistema-feedback-ia.md))
* **User Stories Incluidas:**
    * [US-37: Capturar Feedback Básico sobre Evaluación IA](../us/us-37-capturar-feedback-basico-evaluacion-ia.md)
    * [US-38: Enviar Feedback Capturado a Core AI](../us/us-38-enviar-feedback-capturado-core-ai.md)
    * [US-39: Recibir y Almacenar Feedback de Usuario (Capacidad Core AI)](../us/us-39-recibir-almacenar-feedback-usuario-core-ai.md)
    * [US-40: Capturar Feedback Detallado sobre Evaluación IA](../us/us-40-capturar-feedback-detallado-evaluacion-ia.md) (Should Have)
* **Total Story Points (Feature):** 9 SP
* **Total Horas Estimadas (Feature):** 28 horas
* **Estimación Promedio por Persona:** 3 SP / ~9.3 horas
* **Duración Estimada del SPRINT:** ~2-3 días

## Tareas del SPRINT por Persona

Aquí se listan las Tareas Técnicas (TKs) para esta Feature, con una propuesta de asignación buscando equilibrar la carga.

### Jose Luis (Estimación: ~9 horas / ~2 SP)

* [ ] [TK-131: BE-API: Implementar Endpoint ATS para Recibir Solicitud Envío Feedback](<../tasks/tk-131-BE-API-implementar-endpoint-ats-recibir-solicitud-envio-feedback.md>) (3h / 1 SP)
* [ ] [TK-132: BE-Logic: Implementar Lógica ATS para Enviar Feedback a Core AI](<../tasks/tk-132-BE-Logic-implementar-logica-ats-enviar-feedback-core-ai.md>) (3h / 1 SP)
* [ ] [TK-139: BE-API: (Asegurar/Refinar) API Detalle Candidatura Incluye Skills Detectadas](<../tasks/tk-139-BE-API-asegurar-refinar-api-detalle-candidatura-incluye-skills.md>) (1h / 0 SP) - **(Should Have)**
* [ ] [TK-140: BE-Logic: (Asegurar/Refinar) Lógica ATS Almacena/Recupera Skills Detectadas](<../tasks/tk-140-BE-Logic-asegurar-refinar-logica-ats-almacena-recupera-skills.md>) (2h / 0 SP) - **(Should Have)**

### Jesus (Estimación: ~6 horas / ~2 SP)

* [ ] [TK-134: CAI-BE-API: (Asegurar/Definir) Endpoint API Core AI para Recibir Feedback](<../tasks/tk-134-CAI-BE-API-asegurar-definir-endpoint-coreai-recibir-feedback.md>) (1h / 0 SP)
* [ ] [TK-135: CAI-DB: Definir Esquema BBDD para Entidad `RegistroFeedbackIA`](<../tasks/tk-135-CAI-DB-definir-schema-bbdd-entidad-registrofeedbackia.md>) (2h / 0 SP)
* [ ] [TK-136: CAI-BE-Logic: Implementar Lógica de Negocio para Validar y Almacenar Feedback Recibido](<../tasks/tk-136-CAI-BE-Logic-implementar-logica-negocio-validar-almacenar-feedback.md>) (3h / 1 SP)

### David (Estimación: ~13 horas / ~5 SP)

* [ ] [TK-125: FE-UI: Añadir Controles de Feedback Básico (👍/👎) a Vista Detalle Candidatura](<../tasks/tk-125-FE-UI-anadir-controles-feedback-basico-detalle-candidatura.md>) (2h / 0 SP)
* [ ] [TK-126: FE-Logic: Manejar Estado y Evento Click para Feedback Básico](<../tasks/tk-126-FE-Logic-manejar-estado-evento-click-feedback-basico.md>) (2h / 0 SP)
* [ ] [TK-133: FE-Logic: Implementar Lógica Frontend para Llamar a API ATS de Envío Feedback](<../tasks/tk-133-FE-Logic-implementar-logica-frontend-llamar-api-ats-envio-feedback.md>) (2h / 0 SP)
* [ ] [TK-137: FE-UI: Añadir Controles Feedback Detallado (Editar Score, Validar Skills, Comentarios)](<../tasks/tk-137-FE-UI-anadir-controles-feedback-detallado-detalle-candidatura.md>) (4h / 1 SP) - **(Should Have)**
* [ ] [TK-138: FE-Logic: Manejar Estado y Construir Payload para Feedback Detallado](<../tasks/tk-138-FE-Logic-manejar-estado-construir-payload-feedback-detallado.md>) (3h / 1 SP) - **(Should Have)**

## Coordinación y Dependencias Clave

* **Feedback Básico (US-37, US-38, US-39):** Estos US forman un flujo completo (UI -> ATS BE -> Core AI BE -> Core AI DB) y deben coordinarse estrechamente. TK-125 -> TK-126 -> TK-133 -> TK-131 -> TK-132 -> TK-134 -> TK-136 -> TK-135.
* **Feedback Detallado (US-40):** Se basa en el flujo básico y añade complejidad. Depende de que el ATS tenga acceso a las skills detectadas (TK-139, TK-140), que a su vez dependen de la Feature 4 (Parsing CV).

## Entregable del SPRINT (Definition of Done para la Feature 6)

* El esquema de base de datos para `RegistroFeedbackIA` en Core AI está creado.
* Los endpoints y lógica backend de Core AI para recibir y almacenar feedback (básico y detallado) están implementados.
* El endpoint y lógica backend del ATS para recibir feedback del frontend y enviarlo a Core AI están implementados.
* La interfaz de usuario y la lógica frontend para capturar feedback básico (pulgar arriba/abajo) están implementadas.
* Si se completa US-40 (Should Have), la interfaz y lógica frontend para capturar feedback detallado (score, skills, comentarios) están implementadas.
* Si se completa US-40 (Should Have), el backend del ATS puede almacenar/recuperar las skills detectadas y el endpoint de detalle las incluye.
* Los usuarios pueden proporcionar feedback (básico, y detallado si se implementa) sobre las evaluaciones IA a través del ATS MVP, y este feedback se registra en Core AI para el aprendizaje.
* Todas las pruebas unitarias y de integración relevantes para esta Feature han pasado.

---