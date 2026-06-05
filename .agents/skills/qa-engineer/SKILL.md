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

[HARNESS]

1. **Umbral de Cobertura:** Exigir al menos un 80% de cobertura en código crítico y no permitir fusiones si este valor disminuye.
2. **Definición de Tipos de Pruebas:** El plan de QA debe clasificar explícitamente las pruebas en Unitarias, Integración, E2E y Accesibilidad.
3. **Automatización en PR:** Validar que los workflows de CI/CD ejecutan toda la suite de pruebas en cada Pull Request creado.
4. **No Pruebas Modificadas para Pasar:** Queda prohibido alterar aserciones válidas de pruebas existentes solo para forzar el éxito de un test (regresión).
5. **Reporte Consolidado:** El reporte en `docs/qa/qa_report.md` debe unificar los resultados de unit, E2E y a11y, sin omitir ninguna sección.
6. **Manejo de Flakiness:** Identificar e inhabilitar temporalmente con un tag `[FLAKY]` aquellos tests inestables, requiriendo un issue de reparación inmediato.
7. **Pruebas de Mutación Obligatorias:** Ejecutar análisis de mutación (ej. Stryker) en módulos críticos, exigiendo un score de mutación mínimo del 65%.
8. **Estrategia de Datos de Prueba:** Definir una política clara sobre el origen y ciclo de vida de los datos mockeados en las suites de prueba.
9. **Políticas de Aserción:** Prohibir el uso de aserciones vacías o aserciones del tipo `expect(true).toBe(true)` en cualquier archivo de test.
10. **Trazabilidad de Requisitos:** Cada caso de prueba en el plan debe estar mapeado a un ID único de historia de usuario o requerimiento del PRD.
11. **Configuración del Entorno de CI:** Asegurar que los entornos de CI están aislados y limpian completamente sus recursos al terminar.
12. **Bloqueo por Fallo Crítico:** Un único fallo en cualquier suite de pruebas integradas (Unit, E2E, A11Y) debe abortar y marcar la pipeline como fallida.
13. **Procedimiento de Autoverificación - Check de Cobertura:** Comprobar el log de cobertura emitido por el test runner contra el umbral mínimo (80%).
14. **Procedimiento de Autoverificación - Sintaxis Workflow:** Validar que los archivos YAML de GitHub Actions / GitLab CI compilan sin errores.
15. **Procedimiento de Autoverificación - Gaps de Cobertura:** Identificar clases y métodos que carecen por completo de archivos de prueba asociados.
16. **Procedimiento de Autoverificación - Mutantes Sobrevivientes:** Revisar el informe de mutation testing para listar mutantes supervivientes en código crítico.
17. **Procedimiento de Autoverificación - Integridad de Reportes:** Confirmar la creación física del reporte consolidado de calidad en el path correcto.
18. **Procedimiento de Autoverificación - Historial de Fallos:** Analizar la tendencia de fallos en el historial reciente para priorizar refactorizaciones de test.
19. **Procedimiento de Autoverificación - Ganchos pre-commit:** Comprobar la correcta configuración de linters y hooks de pre-commit.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

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
