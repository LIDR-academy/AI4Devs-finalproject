---
name: backlog-generator
description: "Backlog, User Stories, Epics, Tasks, Subtasks, Story Mapping, Story Breakdown. Generates a structured backlog (epics, stories, subtasks, DoD) from existing documentation with 3-level approval."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.1"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre backlog-generator o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** backlog, user stories, epics, tasks, subtasks, story mapping, story breakdown

---

[RULES]

1. **SMART User Stories:** Historias de usuario con formato Como/Quiero/Para y DoD claro.
2. **3-Level Approval:** Aprobación obligatoria a nivel de épica, historia y subtarea.
3. **Traceability:** Mapear cada historia directamente a una sección aprobada del PRD.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Nueva épica o historia propuesta | Validar trazabilidad con el PRD y pausar para aprobación | Interactivo |
| Backlog aprobado | Guardar archivo final y sincronizar contrato | Salida |


---

[HARNESS]

1. **Restricción de Trazabilidad:** Ninguna historia de usuario puede crearse si no está directamente mapeada a una sección aprobada del PRD.
2. **Formato SMART:** Cada historia de usuario debe ser independiente, negociable, valorable, estimable, pequeña y testeable (INVEST).
3. **Estructura Estándar:** Cada historia de usuario debe usar estrictamente el formato: "Como [rol], quiero [acción], para [beneficio]".
4. **Criterios de Aceptación Gherkin:** Toda historia debe tener al menos tres escenarios de aceptación formateados en Gherkin (Dado que... / Cuando... / Entonces...).
5. **Definition of Done (DoD) Global:** Toda historia de usuario debe incluir unit tests, tests de integración y revisión de accesibilidad en su DoD.
6. **Definition of Ready (DoR):** Una historia no puede pasar a "lista para desarrollo" si no tiene estimación de complejidad y dependencias mapeadas.
7. **Sin Duplicidad:** No se permite que dos historias de usuario representen la misma funcionalidad de negocio o solapen de forma significativa.
8. **Tamaño de Historias:** Cualquier historia que requiera más de 5 subtareas técnicas debe desglosarse obligatoriamente en historias más pequeñas.
9. **Roles del Negocio:** Los roles de las historias de usuario deben corresponderse exactamente con las personas de usuario definidas en el PRD.
10. **Idioma Consistente:** Los títulos de las historias, descripciones y subtareas deben estar redactados de manera coherente en el idioma definido en el proyecto.
11. **Prioridad MoSCoW:** Cada historia debe tener asignada una prioridad explícita utilizando la metodología MoSCoW (Must, Should, Could, Won't).
12. **Id Único Histórico:** Cada historia debe tener un identificador alfanumérico único e inmutable (por ejemplo, US-001).
13. **Procedimiento de Autoverificación - Mapeo PRD:** Validar que el ID del PRD de origen está documentado al inicio de cada historia de usuario.
14. **Procedimiento de Autoverificación - Completitud Gherkin:** Verificar que todos los bloques Gherkin tienen las tres cláusulas (Dado, Cuando, Entonces).
15. **Procedimiento de Autoverificación - DoD:** Confirmar que no hay historias sin una sección explícita de DoD (Definition of Done).
16. **Procedimiento de Autoverificación - Dependencias:** Comprobar que no hay ciclos de dependencia en el grafo de historias de usuario.
17. **Procedimiento de Autoverificación - Estimaciones:** Asegurar que cada historia tiene un placeholder o valor asignado de complejidad/puntos.
18. **Procedimiento de Autoverificación - Sincronización:** Validar que el archivo `docs/tech-lead/backlog.md` compila a markdown válido.
19. **Procedimiento de Autoverificación - Roles:** Verificar que no se inventan roles de usuario no definidos previamente en la fase de descubrimiento.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Cargar el PRD desde `docs/prd/PRD.md`.
2. Desglosar los requisitos del PRD en Épicas organizadas.
3. Crear Historias de Usuario detalladas con criterios de aceptación e inglés técnico para títulos/DoD.
4. Presentar y refinar secuencialmente con el usuario en tres niveles (Épica -> Historias -> Subtareas).
5. Guardar el backlog jerárquico final en `docs/tech-lead/backlog.md`.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Procesar el PRD de forma automatizada leyendo la referencia del archivo.
2. Generar el backlog completo estructurado según las especificaciones del PRD.
3. Escribir directamente en `docs/tech-lead/backlog.md` y reportar éxito.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [prd-generator](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/prd-generator/SKILL.md) — Proveedor del PRD de origen.
- [backlog-rules.md](references/backlog-rules.md) — Guía de estilo y calidad de historias de usuario.
- [validation-rules.md](references/validation-rules.md) — Reglas adicionales de validación.
