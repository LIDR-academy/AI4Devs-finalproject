---
name: e2e-testing
description: "E2E, End-To-End, Tests E2E, Flujos De Usuario, Acceptance Testing, Playwright, Cypress, Escenarios. Genera tests E2E completos desde flujos de negocio, analiza gaps de cobertura y gestiona configuración del framework."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.1"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre e2e-testing o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** e2e, end-to-end, tests E2E, flujos de usuario, acceptance testing, Playwright, Cypress, escenarios

---

[RULES]

1. **User scenarios first:** Diseñar pruebas basadas únicamente en historias de usuario reales del backlog.
2. **Flakiness reduction:** Usar selectores estables (ej. data-testid) en lugar de clases CSS o estructura DOM.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Selector inestable detectado en el test | Reemplazar selector por data-testid | Refactor E2E |
| Flujo de negocio requiere prueba de integración | Escribir escenario E2E completo | Generar E2E |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Identificar el flujo de navegación del usuario en la interfaz gráfica.
2. Generar scripts de test usando Playwright o Cypress respetando las buenas prácticas.
3. Guardar los archivos en `tests/e2e/` y registrar el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Procesar los flujos del backlog de usuario y compilar la suite de pruebas E2E.
2. Escribir directamente en `tests/e2e/` y actualizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [selector-guidelines.md](references/selector-guidelines.md) — Reglas de selección de elementos estables.
- [cypress-scenarios.md](references/cypress-scenarios.md) — Escenarios y estructura de Cypress.
- [playwright-scenarios.md](references/playwright-scenarios.md) — Escenarios y estructura de Playwright.
