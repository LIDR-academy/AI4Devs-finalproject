---
name: tech-lead
description: "Tech Lead, Plan Técnico, Tareas Técnicas, Ejecución, Orquestación Técnica, Sprint Planning. Traduce requerimientos de negocio a tareas técnicas detalladas, orquesta su ejecución paralela/secuencial y gestiona el estado del plan."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre tech-lead o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** tech lead, plan técnico, tareas técnicas, ejecución, orquestación técnica, sprint planning

---

[RULES]

1. **Strict Dependency Mapping:** Todas las tareas deben enlazarse a requerimientos de negocio sin ciclos.
2. **CVE Checking:** Escanear y verificar que las dependencias recomendadas no tengan vulnerabilidades críticas/altas.
3. Si el plan o propuesta del usuario es técnicamente inviable o vaga, argumentar en contra o guiar en la especificación.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Propuesta técnica es vaga o inviable | Ejecutar ChallengeOrDeepenTechnicalPath | Interactivo |
| Modo orquestado de SDD | Procesar PRD y backlog para generar plan técnico final | Orquestador |


---

[HARNESS]

1. **Mapeo de Dependencias Técnico:** Todas las tareas deben enlazarse a requerimientos de negocio y a su correspondiente diseño técnico sin ciclos.
2. **Chequeo de CVE:** Validar que ninguna librería o framework sugerido en el plan técnico contenga vulnerabilidades críticas o altas conocidas.
3. **Control de Viabilidad:** Evaluar y justificar la viabilidad técnica del stack de tecnologías frente a los requisitos del PRD.
4. **Sin Acoplamientos Cíclicos:** Prohibir arquitecturas circulares entre los componentes o módulos descritos en el diseño.
5. **Estructura del Plan Técnico:** El plan en `docs/tech-lead/technical_plan.md` debe estructurarse con objetivos, arquitectura, tareas y estimaciones.
6. **Definición de Entregables:** Cada tarea técnica debe incluir un entregable concreto y verificable (código, tests, documentación).
7. **Control de Deuda Técnico:** Toda decisión de diseño que introduzca deuda técnica deliberada debe registrarse con su respectivo plan de pago o refactorización.
8. **Mitigación de Puntos de Fallo:** Identificar componentes críticos que representen puntos únicos de fallo (SPOF) y proponer redundancia.
9. **Criterios de Performance:** Definir de manera cuantitativa los presupuestos de rendimiento tolerados (por ejemplo, tiempo de respuesta < 200ms).
10. **Alineación con Estándares:** Asegurar que el plan respeta las convenciones del repositorio (naming, directorios, testing).
11. **Estrategia de Branching:** El plan técnico debe detallar la estrategia de ramas y la secuencia de mezcla (PRs encadenadas o feature branch).
12. **Monitoreo y Observabilidad:** Exigir que todos los flujos de backend críticos incluyan métricas, trazas o logs de auditoría configurados.
13. **Procedimiento de Autoverificación - Grafo de Tareas:** Verificar que el grafo de dependencias de tareas técnicas no presenta ciclos infinitos.
14. **Procedimiento de Autoverificación - Check de Stack:** Comprobar que las versiones de las herramientas coinciden con las del entorno de ejecución real.
15. **Procedimiento de Autoverificación - Verificación CVE:** Escanear las dependencias propuestas contra bases de datos de vulnerabilidades conocidas.
16. **Procedimiento de Autoverificación - Integridad del Plan:** Validar la creación física del archivo `docs/tech-lead/technical_plan.md`.
17. **Procedimiento de Autoverificación - Casos de Borde:** Confirmar que se han documentado al menos tres casos de borde técnicos y su manejo.
18. **Procedimiento de Autoverificación - Estimación:** Asegurar que todas las tareas del plan contienen una estimación de esfuerzo o tiempo coherente.
19. **Procedimiento de Autoverificación - Contratos:** Validar que los outputs respetan el formato definido en `contract.d.ts`.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Acompañar al usuario en el diseño técnico del backlog de forma concisa.
2. Identificar casos de borde del stack tecnológico seleccionado.
3. Generar el plan técnico estructurado con tareas detalladas y guardarlo en `docs/tech-lead/technical_plan.md`.
4. Guardar el contrato en el estado correspondiente.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Leer referencias de `docs/prd/PRD.md` y `docs/design/DESIGN.md`.
2. Generar el backlog técnico detallado en `docs/tech-lead/backlog.md`.
3. Actualizar el contrato indicando éxito.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [agent-contract.md](references/agent-contract.md) — Protocolo de coordinación y paso por referencia.
- [cve-databases.md](references/cve-databases.md) — Fuentes de verificación de seguridad de librerías.
