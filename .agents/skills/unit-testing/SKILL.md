---
name: unit-testing
description: "Unit Testing, Tests Unitarios, Tdd, Test Generation, Cobertura, Gap Analysis, Mocks, Stubs, Fixtures, Mutation Testing, Tests De Mutación. Genera tests unitarios en modo TDD por defecto, analiza gaps de cobertura, ejecuta el ciclo Red-Green-Refactor y evalúa la robustez mediante pruebas de mutación."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.2"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre unit-testing o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** unit testing, tests unitarios, TDD, test generation, cobertura, gap analysis, mocks, stubs, fixtures, mutation testing, tests de mutación

---

[RULES]

1. **TDD Red-Green-Refactor:** Escribir el test antes de implementar la funcionalidad siempre que sea posible.
2. **High Isolation:** Usar mocks y stubs para aislar dependencias externas de base de datos o APIs.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Falta cobertura de tests unitarios | Identificar funciones descubiertas y generar tests correspondientes | Test Generation |
| Ciclo TDD activo | Ejecutar tests, validar fallo (rojo) y después éxito (verde) | TDD Runner |


---

[HARNESS]

1. **Restricción de Aislamiento:** Todo test unitario debe aislarse completamente de dependencias externas (bases de datos, APIs de red). Las llamadas externas deben mockearse/stubearse obligatoriamente.
2. **Aserción de Cobertura:** Cada nueva suite de pruebas generada debe asegurar una cobertura mínima del 80% en líneas y ramas lógicas relevantes de la función/componente bajo prueba.
3. **Procedimiento de Autoverificación:**
   - [ ] Confirmar que no hay llamadas a red reales ni a la base de datos dentro del código del test.
   - [ ] Validar que se cubren caminos felices, caminos de error/excepciones, y límites (edge cases).
   - [ ] Comprobar que los mocks están tipados e imitan el contrato real según [mocking-rules.md](references/mocking-rules.md).
4. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si el validador o las reglas no se cumplen tras la tercera iteración, detener ejecución, reportar la anomalía y delegar revisión al usuario.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Analizar la lógica del archivo de código bajo prueba.
2. Escribir los casos de prueba unitarios cubriendo caminos felices y de error.
3. Ejecutar el test runner local para validar la corrección y actualizar el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Cargar el archivo de referencia de código y los tests existentes.
2. Generar la suite de pruebas unitarias correspondiente en la carpeta de pruebas del proyecto.
3. Reportar cobertura y actualizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [coverage-rules.md](references/coverage-rules.md) — Reglas estándar de cobertura y exclusión.
- [mocking-rules.md](references/mocking-rules.md) — Guías para mocking de dependencias.
- [tdd-cycle.md](references/tdd-cycle.md) — Ciclo Red-Green-Refactor.
- [mutation-testing.md](references/mutation-testing.md) — Validación de robustez de pruebas.
