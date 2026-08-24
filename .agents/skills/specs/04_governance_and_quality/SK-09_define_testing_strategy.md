---
name: testing-strategy
description: "Establece la directiva de pruebas TDD Test-First (Red-Green-Refactor), la pirámide de testing (Unitario, Integración, E2E), la política anti-Test Theater, el uso de fakes InMemory y la meta de Mutation Score >= 70%."
version: "3.3.0"
category: "04_governance_and_quality"
inputs:
  - "docs/01_product_definition/02_prd.md"
  - "docs/04_governance_and_quality/08_security_strategy.md"
outputs:
  - "docs/04_governance_and_quality/09_testing_strategy.md"
---

# 🧪 SK-09: Directiva de Pruebas TDD y Estrategia de Calidad (v3.3.0)

Actúa como un **Principal QA Engineer** y **Test Architect** experto en Test-Driven Development (TDD), test runners y librerías de testing de componentes del ecosistema declarado en el stack, In-Memory Fakes y pruebas de mutación.

Tu objetivo es analizar el PRD (`docs/01_product_definition/02_prd.md`) y las Reglas de Seguridad (`docs/04_governance_and_quality/08_security_strategy.md`) para redactar la directiva oficial de calidad en `docs/04_governance_and_quality/09_testing_strategy.md`.

---

## 🚫 Non-Goals de Ejecución del Agente (Guards)

Durante la ejecución de este skill, el agente TIENE PROHIBIDO:
1. **No escribir código de producción sin prueba que falle primero (Ciclo TDD Red-Green-Refactor):** Prohibido guardar código de aplicación sin la prueba unitaria previa en estado fallido (`RED`).
2. **Prohibición de "Test Theater" y Skip de Pruebas:** Queda strictly prohibido usar `it.skip()`, `test.todo()` o modificar/eliminar pruebas existentes para forzar un build verde.
3. **No usar mocks pesados de bases de datos:** Usar preferentemente repositorios en memoria (*InMemory Fakes*) que implementen la misma interfaz del dominio en lugar de mocks frágiles de ORMs.
4. **Prohibición de Pruebas Inestables (`No Flaky Tests / Fixed Delays`):** Prohibido usar `setTimeout()` o retrasos arbitrarios en suites de pruebas; exigir aserciones deterministas guiadas por promesas u observadores (`waitFor`).
5. **Prohibición de Código Muerto (`No Dead Code / Zombie Flags`):** Queda terminantemente prohibido mantener código comentado, funciones no referenciadas o dependencias sin uso tras refactorizar.

---

## 🔄 Pipeline de Ejecución Secuencial en 4 Fases

### 📍 Fase 1: Pirámide de Testing & Umbrales de Cobertura (5 min)
1. Definir la distribución de la pirámide:
   - **Pruebas Unitarias de Dominio (70%):** Pruebas de entidades y Value Objects puros sin dependencias I/O.
   - **Pruebas de Integración de Casos de Uso (20%):** Validación con repositorios `InMemory`.
   - **Pruebas E2E de Flujos Críticos (10%):** Verificación de contratos API y flujos completos.
2. Fijar umbrales mínimos: Cobertura de Líneas $\ge 80\%$, Cobertura de Ramas $\ge 75\%$, Mutation Score $\ge 70\%$.

### 📍 Fase 2: Protocolo TDD Test-First Red-Green-Refactor (5 min)
1. Documentar los 3 pasos innegociables:
   - `RED`: Escribir la prueba unitaria que falla con aserciones semánticas descriptivas.
   - `GREEN`: Escribir el código mínimo indispensable para hacer pasar la prueba.
   - `REFACTOR`: Limpiar el código manteniendo la suite en verde.

### 📍 Fase 3: Especificación de Fakes In-Memory & Fixtures (5 min)
1. Diseñar el patrón `InMemoryRepository` para aislar los tests de la base de datos real (la declarada en `docs/00_stack_manifest.md`) durante la ejecución de la suite de desarrollo.

### 📍 Fase 4: Pruebas de Seguridad y Casos de Borde (Edge Cases) (5 min)
1. Derivar casos de prueba negativos desde `08_security_strategy.md` (intento de inyección, payloads malformados, desbordamientos de saldos).

---

## 📌 Formato de Salida y Cabecera GFM

El archivo generado en `docs/04_governance_and_quality/09_testing_strategy.md` debe incluir la cabecera:

```markdown
---
document: testing_strategy
version: 1.2.0
status: approved
inputs:
  - docs/01_product_definition/02_prd.md
  - docs/04_governance_and_quality/08_security_strategy.md
---

# 🧪 Especificación de Estrategia de Pruebas TDD y Calidad

> **Navegación del Framework SDD:**  
> [⬅️ Volver a Estrategia de Seguridad (08_security_strategy.md)](./08_security_strategy.md) | [📖 Glosario & Reglas](../../../../docs/01_product_definition/01_glosario_y_reglas_negocio.md) | [Siguiente: Pipeline CI/CD (10_cicd_pipeline.md) ➡️](./10_cicd_pipeline.md)

---
```
