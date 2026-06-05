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

[HARNESS]

1. **Selectores Estables:** Queda estrictamente prohibido usar selectores basados en clases CSS dinámicas o la jerarquía exacta del DOM. Usar atributos `data-testid` o selectores semánticos (`getByRole`).
2. **Aislamiento de Estado:** Cada prueba E2E debe ser independiente y autolimpiable. No debe depender del estado dejado por una prueba anterior.
3. **Limpieza de Datos:** Toda prueba que cree registros en la base de datos debe incluir un paso de limpieza o un entorno de datos transaccional aislado.
4. **Timeouts Explícitos:** No utilizar esperas basadas en tiempo fijo (ej. `sleep(5000)`). Utilizar esperas asíncronas basadas en estados del DOM (`waitForSelector`, `toBeVisible`).
5. **Autenticación Eficiente:** Utilizar mecanismos de reutilización de sesión de login (ej. inyección de cookies o localStorage) para evitar loguearse manualmente en cada test.
6. **Manejo de Variabilidad:** Los datos dinámicos generados (como fechas, nombres o IDs) deben gestionarse de manera determinista o usando generadores controlados.
7. **Assertions Robustas:** Cada test debe terminar con aserciones explícitas de negocio y no simplemente con la ausencia de errores durante la navegación.
8. **Manejo de Errores de API:** Las llamadas a APIs externas deben simularse (mock) o gestionarse con fallos controlados para evitar flakiness del entorno de pruebas.
9. **Soporte Responsive:** Las suites de test E2E críticas deben ejecutarse y validarse en al menos dos viewports distintos (móvil y escritorio).
10. **Sin Hardcoding de URLs:** Todas las URLs utilizadas en los tests deben ser relativas o resolverse dinámicamente mediante variables de configuración del entorno de pruebas.
11. **Configuración de Reintentos:** Establecer un número máximo de 2 reintentos para tests fallidos en entornos de CI para mitigar problemas transitorios de red.
12. **Manejo de Diálogos:** Todo modal, alert o cuadro de diálogo del navegador debe gestionarse de forma explícita mediante los listeners del framework.
13. **Procedimiento de Autoverificación - Selector check:** Escanear el código del test buscando selectores inestables (ej. `.button-class > div`).
14. **Procedimiento de Autoverificación - Waits:** Comprobar que no hay ninguna directiva de tiempo de espera estática en los archivos del test.
15. **Procedimiento de Autoverificación - Independencia:** Asegurar que los archivos de test pueden ejecutarse en orden aleatorio o en paralelo sin fallar.
16. **Procedimiento de Autoverificación - Cleanup:** Confirmar la presencia de ganchos `afterAll`/`afterEach` encargados de la restauración del estado si la prueba escribe en la BD.
17. **Procedimiento de Autoverificación - Capturas:** Verificar que la suite está configurada para tomar capturas de pantalla o videos automáticamente al fallar un test.
18. **Procedimiento de Autoverificación - Cobertura:** Validar que los casos cubiertos mapean directamente al menos al 80% de los criterios de aceptación de la historia de usuario.
19. **Procedimiento de Autoverificación - Reporte:** Asegurar que los resultados se exportan en formatos estándar (JUnit, HTML) legibles por el sistema de CI.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

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
