---
name: qa-engineer
description: "Qa, Quality Assurance, Tester, Plan De Qa, Cobertura De Tests, Estrategia De Testing, Ci Testing, Mejora De Tests, Mutation Testing. Orquesta unit-testing, e2e-testing y a11y-testing, genera plan de QA, configura CI/CD y produce reportes consolidados de calidad."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre qa-engineer o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** QA, quality assurance, tester, plan de QA, cobertura de tests, estrategia de testing, CI testing, mejora de tests, mutation testing

---

[RULES]

1. **Test coverage goals:** Exigir al menos 80% de cobertura en código crítico.
2. **CI/CD Integration:** Todos los tests deben ejecutarse automáticamente en cada Pull Request.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Cobertura por debajo del umbral mínimo | Reportar fallo de cobertura y listar tests faltantes | Plan de Mejora |
| Se requiere estrategia de pruebas | Generar plan de QA y configurar scripts de test runner | Estrategia |


---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Evaluar el código actual y los tests existentes para mapear la cobertura.
2. Crear o actualizar la estrategia de QA en `docs/qa/test_plan.md`.
3. Configurar el archivo de workflow de CI/CD para GitHub Actions o similar.
4. Guardar los cambios y sincronizar el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Ejecutar los scripts de prueba a través de los subagentes unit-testing y e2e-testing.
2. Compilar los resultados en el reporte consolidado de calidad en `docs/qa/qa_report.md`.
3. Actualizar el contrato con el estado de los tests.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [ci-github-actions.md](references/ci-github-actions.md) — Configuración para CI en GitHub Actions.
- [ci-gitlab-ci.md](references/ci-gitlab-ci.md) — Configuración para CI en GitLab CI.
- [unit-testing](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/unit-testing/SKILL.md) — Agente de pruebas unitarias.
- [e2e-testing](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/e2e-testing/SKILL.md) — Agente de pruebas E2E.
