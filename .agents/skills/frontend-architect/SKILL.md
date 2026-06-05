---
name: frontend-architect
description: "Frontend Architect, Implementar Frontend, Arquitectura Frontend, Ui Implementation. Diseña e implementa historias técnicas de frontend, gestiona su ciclo de vida y coordina con testing y backend skills."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre frontend-architect o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** frontend architect, implementar frontend, arquitectura frontend, UI implementation

---

[RULES]

1. **Component isolation:** Todo componente UI debe ser reutilizable y libre de lógica de negocio pesada.
2. **Accessibility (a11y):** Cumplir con WCAG 2.1 AA en contraste, tags ARIA y navegación por teclado.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Falta accesibilidad en componentes de UI | Agregar etiquetas ARIA y estados de foco | Refactor UI |
| Implementación de UI requerida | Generar código de frontend basado en el diseño | Implementación |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Cargar y comprender los wireframes y especificaciones del PRD.
2. Generar la estructura de componentes de UI respetando los lineamientos de diseño de la aplicación.
3. Escribir el código en la carpeta correspondiente del framework (ej. React/Vite) y reportar en el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Leer referencias del diseño e implementar los componentes frontend requeridos.
2. Generar código en `src/components/` y validar su correcta carga y compilación.
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
- [a11y-testing](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/a11y-testing/SKILL.md) — Verificador de accesibilidad.
- [ui-guidelines.md](references/ui-guidelines.md) — Guía de estilo visual y componentes.
