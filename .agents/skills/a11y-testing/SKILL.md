---
name: a11y-testing
description: "Accesibilidad, A11Y, Wcag, Accessibility Testing, Contraste, Aria, Teclado, Lector De Pantalla, Auditoría Accesibilidad. Genera tests de accesibilidad WCAG 2.1/2.2, audita violaciones, propone fixes y produce reportes priorizados."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.2"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre a11y-testing o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** accesibilidad, a11y, WCAG, accessibility testing, contraste, ARIA, teclado, lector de pantalla, auditoría accesibilidad

---

[RULES]

1. **Strict WCAG Compliance:** Evaluar y cumplir niveles A y AA de las guías de accesibilidad web.
2. **Audit Priority:** Los problemas que bloqueen el teclado o la lectura de pantalla deben ser resueltos con severidad alta.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Violación crítica de contraste o ARIA encontrada | Reportar y detener compilación de UI si se requiere | Reporte de Accesibilidad |
| Solicitud de auditoría de accesibilidad | Ejecutar análisis estático de a11y | Auditoría |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Analizar el código HTML o componentes de la interfaz de usuario.
2. Identificar violaciones de contraste, falta de roles semánticos o navegación por teclado.
3. Guardar el reporte de auditoría en `docs/qa/a11y_report.md` y registrar en el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Evaluar el HTML renderizado de los componentes.
2. Generar reporte de a11y y actualizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [wcag-criteria.md](references/wcag-criteria.md) — Listado y verificación de criterios WCAG 2.1 AA.
- [axe-assertions.md](references/axe-assertions.md) — Reglas y aserciones automatizadas de a11y.
