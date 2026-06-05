---
name: diagram-generator
description: "Diagrama, Diagram, Mermaid, Casos De Uso, Secuencia, Clases, Flujo, Er, Arquitectura, C4, Mindmap, Gitgraph. Genera diagramas Mermaid detallados a partir de documentación del proyecto o contexto proporcionado."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.1"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre diagram-generator o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** diagrama, diagram, mermaid, casos de uso, secuencia, clases, flujo, ER, arquitectura, C4, mindmap, gitGraph

---

[RULES]

1. **Syntax Validation:** Prohibido incluir etiquetas HTML o caracteres especiales sin escapar dentro de los diagramas Mermaid.
2. **Single-responsibility diagrams:** Cada diagrama debe representar una vista única y clara de la arquitectura.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Error de sintaxis Mermaid detectado | Corregir inmediatamente usando la guía de sintaxis | Corrección Automática |
| Se solicita diagrama de arquitectura | Generar diagrama C4 o flujo de secuencia | Salida |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Leer los requisitos del usuario o el PRD en `docs/prd/PRD.md`.
2. Identificar el tipo de diagrama más adecuado para la solicitud (Secuencia, ER, Flujo, C4).
3. Generar el bloque de código Mermaid siguiendo estrictamente las reglas de sintaxis de referencias.
4. Guardar los diagramas generados en `docs/design/diagrams/` y reportar éxito.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Leer las especificaciones técnicas del diseño.
2. Generar los diagramas embebidos necesarios para el documento `docs/design/DESIGN.md`.
3. Actualizar el contrato de estado.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [mermaid-rules.md](references/mermaid-rules.md) — Estándares y formatos válidos de sintaxis Mermaid.
