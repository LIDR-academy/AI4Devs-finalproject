---
name: prd-generator
description: "Prd, Product Requirements, Product Definition, Requisitos De Producto, Definición De Producto. Generates a PRD from a user brief with section-by-section approval."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.1"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre prd-generator o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** PRD, product requirements, product definition, requisitos de producto, definición de producto

---

[RULES]

1. **SMART Metrics:** Enforce that all business requirements are defined in SMART formats.
2. **Traceability:** Establish explicit maps between target user personas and core features.
3. **Section-by-Section Approval:** Pause and await user verification before assembling the final PRD.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Se genera o actualiza una sección | Pausar y esperar feedback del usuario | Interactivo |
| Se solicita actualización de documento | Editar, re-validar e incrementar versión | Modo Edición |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Leer el brief del usuario y validar longitud/contenido.
2. Iterar sobre cada sección del PRD (Vision, TargetUsers, ProductScope, BusinessRequirements, CompetitiveContext, Constraints).
3. Cargar el template `assets/prd-template.md` para cada sección.
4. Validar cada sección usando las reglas en `references/validation-rules.md`.
5. Presentar la sección al usuario en su idioma y esperar aprobación/modificación/rechazo.
6. Una vez aprobadas todas las secciones, ensamblar el PRD final en `docs/prd/PRD.md`.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Leer el path de referencia del brief desde el contrato.
2. Generar el documento completo de PRD aplicando las reglas de validación sin pausas si está pre-aprobado.
3. Guardar el archivo PRD final en `docs/prd/PRD.md` y actualizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [validation-rules.md](references/validation-rules.md) — Reglas de validación y criterios de aceptación.
- [prd-template.md](assets/prd-template.md) — Plantilla base para las secciones del PRD.
