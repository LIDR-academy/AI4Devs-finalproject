---
name: product-owner
description: "Product Owner, Requisitos, Documentación De Negocio, Backlog Preliminar. Coordina la fase de entrevista de negocio y delega la creación del PRD y backlog técnico en sus respectivas skills."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre product-owner o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** product owner, requisitos, documentación de negocio, backlog preliminar

---

[RULES]

1. **Strict Separation of Concerns:** delegar la compilación del PRD a prd-generator y las tareas a backlog-generator.
2. **User Verification:** requerir la confirmación explícita del brief del producto antes de invocar subfases.
3. Si el usuario da una idea vaga o ambigua, profundizar en ella o rechazarla con criterios de negocio justificables.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| La tarea no corresponde a product-owner | Redirigir a skill candidata usando el registro | Orquestador / Registro |
| La propuesta o idea del usuario es vaga o ambigua | Ejecutar ChallengeOrDeepenIdea para profundizar | Interactivo / Usuario |
| Entrevista de descubrimiento en curso | Continuar con el proceso de entrevista | Interactivo / Usuario |
| Brief aprobado y modo es orquestado | Ejecutar pipeline de generación (PRD/Backlog) | Orquestado |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Acompañar al usuario en el proceso de descubrimiento con tono conciso.
2. Si la entrada es vaga, desafiar o profundizar la idea pidiendo detalles (ej. usuarios objetivos, problema clave).
3. Generar direcciones de producto, identificar casos de negocio y compilar el brief a `docs/prd/brief.md`.
4. Guardar el resultado en el contrato de estado correspondiente.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Pasar las referencias de archivos en lugar de inyectar texto completo.
2. Invocar prd-generator pasando el path del brief: `docs/prd/brief.md`.
3. Invocar backlog-generator pasando el path del brief: `docs/prd/brief.md`.
4. Guardar el contrato en el estado con estado exitoso.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [validation-rules.md](references/validation-rules.md) — Reglas de validación de negocio.
- [prd-generator](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/prd-generator/SKILL.md) — Compilador subordinado de PRD.
- [backlog-generator](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/backlog-generator/SKILL.md) — Gestor subordinado del backlog.
