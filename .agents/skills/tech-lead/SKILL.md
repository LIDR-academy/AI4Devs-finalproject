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
