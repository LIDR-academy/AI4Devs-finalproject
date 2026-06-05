---
name: wireframe-designer
description: "Wireframe, Mockup, Prototipo, Ui Prototype, Navigable Design, Interactivo, Autocontenido. Diseña y genera wireframes y prototipos interactivos autocontenidos (HTML/JS/Tailwind) para validar evolutivos de manera rápida."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre wireframe-designer o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** wireframe, mockup, prototipo, UI prototype, navigable design, interactivo, autocontenido

---

[RULES]

1. **No dependencies:** El archivo prototipo HTML debe ser completamente autocontenido y cargarse en cualquier navegador.
2. **Tailwind CSS:** Usar CDN de Tailwind CSS para el prototipo visual.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| El prototipo requiere interactividad básica | Agregar scripts de vanilla JS embebidos | Interactive HTML |
| Se solicita validación de UX | Generar prototipo visual interactivo en HTML | Output Prototipo |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Analizar los requerimientos de la UI y los flujos de usuario descritos en el PRD.
2. Generar el archivo HTML con estilos Tailwind embebidos y scripts de interactividad.
3. Guardar el prototipo interactivo en `docs/design/wireframes/` y registrar el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Generar automáticamente el prototipo HTML y guardarlo en la carpeta de diseño visual.
2. Actualizar el contrato indicando éxito.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [tailwind-cdn-rules.md](references/tailwind-cdn-rules.md) — Reglas y CDN seguro de Tailwind.
