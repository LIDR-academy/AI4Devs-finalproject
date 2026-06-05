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

1. **Restricción de Aislamiento:** Todo test unitario debe aislarse de dependencias externas (bases de datos, red). Mocks y stubs son obligatorios.
2. **Aserción de Cobertura:** Cada nueva suite de pruebas generada debe asegurar una cobertura mínima del 80% en líneas y ramas lógicas de la función.
3. **Mocks Fuertemente Tipados:** Los mocks y stubs deben ajustarse a la interfaz o contrato tipado real del elemento sustituido.
4. **Independencia en Orden:** Ningún caso de prueba unitaria debe depender del resultado o del orden de ejecución de otro test.
5. **No Asserts de Mocks:** No asertar sobre el comportamiento interno del mock a menos que sea un spy que verifique llamadas críticas.
6. **Aserciones Deterministas:** Queda estrictamente prohibido usar valores dinámicos indeterministas (como fechas del sistema u objetos aleatorios) sin seed.
7. **Sin Lógica de Negocio en Tests:** Los archivos de pruebas no deben contener condicionales complejos (`if`/`switch`) ni bucles de procesamiento pesados.
8. **Estructura AAA:** Organizar cada caso de prueba de manera legible siguiendo el patrón AAA: Arrange (Preparar), Act (Actuar), Assert (Verificar).
9. **Casos de Borde Obligatorios:** Probar de manera explícita valores límite, arrays vacíos, valores nulos y excepciones de la función.
10. **Límites de Tiempo (Execution Time):** Cada test unitario individual no debe tardar más de 100ms en completarse.
11. **Manejo de Promesas:** Las pruebas asíncronas deben resolverse explícitamente usando `async`/`await` o retornando promesas para evitar falsos positivos.
12. **Nomenclatura Descriptiva:** Los títulos de las pruebas deben describir de forma precisa el escenario bajo prueba y el resultado esperado.
13. **Procedimiento de Autoverificación - Red Check:** Confirmar que el test falla antes de escribir la implementación de código correspondiente (TDD).
14. **Procedimiento de Autoverificación - Aislamiento:** Validar mediante análisis de imports que el test no carga drivers de infraestructura reales.
15. **Procedimiento de Autoverificación - Cobertura de Ramas:** Comprobar que todas las condiciones lógicas de las sentencias `if` están cubiertas.
16. **Procedimiento de Autoverificación - Mutación:** Analizar que los mutantes generados mueren (fallan los tests) ante cambios en el código de producción.
17. **Procedimiento de Autoverificación - Mocks no usados:** Confirmar que no quedan mocks configurados en el test que no sean invocados.
18. **Procedimiento de Autoverificación - Limpieza:** Asegurar el uso de limpiadores en `afterEach` para resetear el estado de los espías y mocks.
19. **Procedimiento de Autoverificación - Formato de Salida:** Verificar que los reportes de pruebas unitarias son válidos en formato JSON o XML.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

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
